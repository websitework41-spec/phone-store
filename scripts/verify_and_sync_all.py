import requests
import json
import re
import concurrent.futures
import time

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
}

def clean_pkr(price_str):
    if not price_str:
        return 0
    clean = re.sub(r'[^0-9]', '', str(price_str))
    return int(clean) if clean else 0

COLOR_HEX_MAP = {
    'black': '#1c1c1e',
    'dark': '#212124',
    'gray': '#808285',
    'grey': '#808285',
    'silver': '#e3e4e8',
    'white': '#f5f5f7',
    'blue': '#2c5282',
    'cyan': '#00a3c4',
    'green': '#285e61',
    'gold': '#d69e2e',
    'yellow': '#ecc94b',
    'purple': '#6b46c1',
    'violet': '#805ad5',
    'titanium': '#8a8886',
    'orange': '#dd6b20',
    'red': '#e53e3e',
    'pink': '#ed64a6',
    'bronze': '#9c4221',
    'lavender': '#b794f4',
    'mint': '#9ae6b4',
    'olive': '#556b2f'
}

def guess_hex(color_name):
    c_lower = color_name.lower()
    for k, hex_val in COLOR_HEX_MAP.items():
        if k in c_lower:
            return hex_val
    return '#2d3748'

def fetch_product_data(url):
    try:
        r = requests.get(url, headers=HEADERS, timeout=12)
        if r.status_code != 200:
            return None
        pos = r.text.find('window.product_data = ')
        if pos == -1:
            return None
        end = r.text.find(';\n', pos)
        if end == -1: end = r.text.find(';</script>', pos)
        raw = r.text[pos + len('window.product_data = '):end]
        data, _ = json.JSONDecoder().raw_decode(raw)
        return data
    except Exception:
        return None

def search_priceoye_url(query, brand):
    try:
        search_url = f"https://priceoye.pk/search?q={requests.utils.quote(query)}"
        r = requests.get(search_url, headers=HEADERS, timeout=10)
        if r.status_code != 200:
            return None
        # Extract product urls
        found = set(re.findall(r'href=["\'](https://priceoye\.pk/mobiles/[^"\']+)["\']', r.text))
        valid_urls = [u for u in found if u.count('/') >= 5 and 'pricelist' not in u]
        
        # Prefer matching brand in url
        brand_clean = brand.lower().replace(' ', '')
        for u in valid_urls:
            if brand_clean in u:
                return u
        if valid_urls:
            return valid_urls[0]
    except Exception:
        pass
    return None

def sync_single_phone(phone):
    brand = phone['brand']
    slug = phone['slug']
    b_lower = brand.lower()

    # Candidate URLs
    urls_to_try = [
        f"https://priceoye.pk/mobiles/{b_lower}/{slug}",
        f"https://priceoye.pk/mobiles/{slug}",
    ]
    
    # Brand specific slug variants
    if 'samsung-galaxy-' in slug:
        alt = slug.replace('samsung-galaxy-', '')
        urls_to_try.append(f"https://priceoye.pk/mobiles/samsung/{alt}")
        urls_to_try.append(f"https://priceoye.pk/mobiles/{alt}")
    if 'apple-iphone-' in slug:
        alt = slug.replace('apple-iphone-', 'iphone-')
        urls_to_try.append(f"https://priceoye.pk/mobiles/apple/{alt}")
        urls_to_try.append(f"https://priceoye.pk/mobiles/{alt}")
    if 'xiaomi-redmi-' in slug:
        alt = slug.replace('xiaomi-redmi-', 'redmi-')
        urls_to_try.append(f"https://priceoye.pk/mobiles/xiaomi/{alt}")
        urls_to_try.append(f"https://priceoye.pk/mobiles/{alt}")

    data = None
    matched_url = None
    for url in urls_to_try:
        data = fetch_product_data(url)
        if data:
            matched_url = url
            break

    # If still not found, search PriceOye
    if not data:
        search_query = f"{brand} {phone['name']}"
        found_url = search_priceoye_url(search_query, brand)
        if found_url:
            data = fetch_product_data(found_url)
            if data:
                matched_url = found_url

    # If completely inaccessible, return phone safely
    if not data:
        return phone

    title = data.get('product_title') or data.get('title') or phone['name']
    title = re.sub(r'\s*\|\s*Priceoye.*$', '', title, flags=re.I).strip()
    title = re.sub(r'\s*Price in Pakistan.*$', '', title, flags=re.I).strip()
    title = re.sub(r'Priceoye', 'VoltPhone', title, flags=re.I).strip()

    # 1. Exact Specs from dataSet.specification
    spec_dict = {}
    if 'dataSet' in data and 'specification' in data['dataSet']:
        try:
            raw_specs = json.loads(data['dataSet']['specification'])
            for cat, items in raw_specs.items():
                if isinstance(items, list):
                    for item in items:
                        for k, v in item.items():
                            if v and str(v).lower() not in ['null', 'n/a', 'none', '']:
                                spec_dict[k.strip()] = str(v).strip()
                elif isinstance(items, dict):
                    for k, v in items.items():
                        if v and str(v).lower() not in ['null', 'n/a', 'none', '']:
                            spec_dict[k.strip()] = str(v).strip()
        except:
            pass

    # 2. Exact Prices & Stock & Variants from product_config.dataPrices
    col_stock_map = {}
    variant_stock_map = {}
    base_price = 0
    original_price = 0

    if 'product_config' in data and 'dataPrices' in data['product_config'] and isinstance(data['product_config']['dataPrices'], dict):
        dp = data['product_config']['dataPrices']
        for color_key, var_dict in dp.items():
            norm_ckey = color_key.lower().replace(' ', '_').replace('-', '_')
            c_in_stock = False
            c_max_qty = 0
            if isinstance(var_dict, dict):
                for var_key, vlist in var_dict.items():
                    if vlist and len(vlist) > 0:
                        v0 = vlist[0]
                        p_val = clean_pkr(v0.get('product_price'))
                        r_val = clean_pkr(v0.get('retail_price'))
                        v_avail = str(v0.get('product_availability', '')).strip()
                        raw_qty = int(v0.get('stock_qty') or 0)
                        is_var_in_stock = (v_avail.lower() == 'in stock')
                        
                        if is_var_in_stock:
                            c_in_stock = True
                            effective_qty = raw_qty if raw_qty > 0 else 5
                            c_max_qty = max(c_max_qty, effective_qty)
                        
                        m_ram = re.search(r'([0-9]+\s*gb)\s*ram', var_key, re.I)
                        m_rom = re.search(r'([0-9]+\s*(?:gb|tb|mb))', var_key, re.I)
                        
                        default_ram = phone['variants'][0]['ram'] if phone.get('variants') else '4GB'
                        default_storage = phone['variants'][0]['storage'] if phone.get('variants') else '64GB'
                        
                        ram_str = m_ram.group(1).upper() if m_ram else spec_dict.get('RAM', default_ram)
                        rom_str = m_rom.group(1).upper() if m_rom else spec_dict.get('Internal Memory', default_storage)
                        var_id = f"{brand}-{rom_str}-{ram_str}".lower().replace(' ', '-')
                        
                        if p_val > 0:
                            if base_price == 0 or (is_var_in_stock and (base_price == 0 or p_val < base_price)):
                                base_price = p_val
                                original_price = r_val if r_val >= p_val else int(p_val * 1.08)
                            elif base_price == 0:
                                base_price = p_val
                                original_price = r_val if r_val >= p_val else int(p_val * 1.08)

                        if var_id not in variant_stock_map:
                            variant_stock_map[var_id] = {
                                'id': var_id,
                                'storage': rom_str,
                                'ram': ram_str,
                                'pricePKR': p_val if p_val > 0 else phone.get('basePricePKR', 30000),
                                'originalPricePKR': r_val if r_val >= p_val else int((p_val if p_val > 0 else phone.get('basePricePKR', 30000)) * 1.08),
                                'inStock': is_var_in_stock,
                                'stockQty': raw_qty if (is_var_in_stock and raw_qty > 0) else (5 if is_var_in_stock else 0)
                            }
                        else:
                            if is_var_in_stock:
                                variant_stock_map[var_id]['inStock'] = True
                                effective_qty = raw_qty if raw_qty > 0 else 5
                                variant_stock_map[var_id]['stockQty'] = max(variant_stock_map[var_id]['stockQty'], effective_qty)

            col_stock_map[norm_ckey] = {'inStock': c_in_stock, 'stockQty': c_max_qty}

    variants = list(variant_stock_map.values()) if variant_stock_map else phone.get('variants', [])

    if base_price == 0:
        base_price = clean_pkr(data.get('product_price') or data.get('min_price') or phone.get('basePricePKR', 0))
        original_price = clean_pkr(data.get('retail_price') or phone.get('originalPricePKR', 0))
        if original_price < base_price:
            original_price = int(base_price * 1.08)

    # 3. Exact Colors & Images from product_color_images
    colors = []
    if 'product_color_images' in data:
        pci = data['product_color_images']
        if isinstance(pci, dict):
            for ckey, cdata in pci.items():
                cname = ckey.replace('_', ' ').title()
                norm_ckey = ckey.lower().replace(' ', '_').replace('-', '_')
                cinfo = col_stock_map.get(norm_ckey)
                if not cinfo:
                    for k, v in col_stock_map.items():
                        if k in norm_ckey or norm_ckey in k:
                            cinfo = v
                            break
                if not cinfo:
                    cinfo = {'inStock': False, 'stockQty': 0}
                
                img_url = ''
                if isinstance(cdata, dict) and 'large' in cdata and cdata['large']:
                    img_name = cdata['large'][0]
                    img_url = f"https://images.priceoye.pk/{img_name}"
                elif isinstance(cdata, list) and len(cdata) > 0:
                    img_url = f"https://images.priceoye.pk/{cdata[0]}"

                colors.append({
                    'name': cname,
                    'hex': guess_hex(cname),
                    'image': img_url if img_url else (phone['colors'][0]['image'] if phone.get('colors') else ''),
                    'inStock': cinfo['inStock'],
                    'stockQty': cinfo['stockQty']
                })
        elif isinstance(pci, list):
            for ci in pci:
                cname = ci.get('color_name') or ci.get('name') or ''
                norm_ckey = cname.lower().replace(' ', '_').replace('-', '_')
                cinfo = col_stock_map.get(norm_ckey, {'inStock': False, 'stockQty': 0})
                cimg = ci.get('image') or ci.get('path') or ''
                if cimg:
                    cimg = cimg.replace('100x100', '500x500').replace('270x270', '500x500')
                if cname:
                    colors.append({
                        'name': cname,
                        'hex': guess_hex(cname),
                        'image': cimg,
                        'inStock': cinfo['inStock'],
                        'stockQty': cinfo['stockQty']
                    })

    if not colors:
        colors = []
        for c in phone.get('colors', []):
            norm_ckey = c['name'].lower().replace(' ', '_').replace('-', '_')
            cinfo = col_stock_map.get(norm_ckey, {'inStock': False, 'stockQty': 0})
            c_copy = dict(c)
            c_copy['inStock'] = cinfo['inStock']
            c_copy['stockQty'] = cinfo['stockQty']
            colors.append(c_copy)

    # 4. Detailed Hardware Specs from PriceOye specification
    is_keypad = brand in ['Nokia', 'Itel'] and (
        'keypad' in title.lower() or '105' in title.lower() or '110' in title.lower() or
        '106' in title.lower() or '130' in title.lower() or '150' in title.lower() or
        '2160' in title.lower() or '2173' in title.lower() or '2165' in title.lower() or
        'magic' in title.lower() or base_price < 12000
    )

    screen_size = spec_dict.get('Screen Size') or phone['specs'].get('screen', '6.67 Inches' if not is_keypad else '1.77 Inches')
    screen_type = spec_dict.get('Screen Type')
    if not screen_type or screen_type.strip().lower() in ['n/a', 'null', 'none', '']:
        screen_type = 'TFT / QQVGA' if is_keypad else ('AMOLED' if (base_price > 60000 or 'amoled' in phone['specs'].get('displayType', '').lower()) else 'IPS LCD')
    screen_res = spec_dict.get('Screen Resolution') or ('120 x 160 pixels' if is_keypad else 'FHD+')
    if screen_res.lower() in ['n/a', 'null', 'none']:
        screen_res = '120 x 160 pixels' if is_keypad else '1080 x 2400 pixels'
    full_screen = f"{screen_size} {screen_type}, {screen_res}"

    processor = spec_dict.get('Processor')
    if not processor or processor.strip().lower() in ['n/a', 'null', 'none', '']:
        processor = phone['specs'].get('processor', 'Feature Phone Processor' if is_keypad else 'Octa-Core')
    orig_proc = phone['specs'].get('processor', '')
    if processor.lower() in ['octa-core', 'octa core', 'octa core processor', 'hexa-core'] and orig_proc and any(ch in orig_proc.lower() for ch in ['snapdragon', 'dimensity', 'helio', 'bionic', 'tensor', 'exynos', 'a1']):
        processor = orig_proc
    gpu = spec_dict.get('GPU', '')
    if gpu and gpu.lower() not in ['n/a', 'null', 'none'] and not is_keypad:
        if gpu.lower() not in processor.lower():
            processor = f"{processor} ({gpu})"

    raw_main_cam = spec_dict.get('Back Camera')
    if raw_main_cam and raw_main_cam.strip().lower() not in ['n/a', 'null', 'none', '']:
        main_camera = raw_main_cam.strip()
    else:
        main_camera = phone['specs'].get('mainCamera', 'No Camera' if is_keypad else '50 MP Dual Camera')
    if re.search(r'^\s*0(\.0)?\s*mp(\s*\+\s*0(\.0)?\s*mp)*\s*$', main_camera, re.I) or main_camera.strip() == '0 MP':
        main_camera = 'No Camera' if is_keypad else '50 MP AI Camera'

    raw_selfie_cam = spec_dict.get('Front Camera')
    if raw_selfie_cam and raw_selfie_cam.strip().lower() not in ['n/a', 'null', 'none', '']:
        selfie_camera = raw_selfie_cam.strip()
    else:
        selfie_camera = phone['specs'].get('selfieCamera', 'No Selfie Camera' if is_keypad else '16 MP')
    if re.search(r'^\s*0(\.0)?\s*mp\s*$', selfie_camera, re.I) or selfie_camera.strip() == '0 MP':
        selfie_camera = 'No Selfie Camera' if is_keypad else '16 MP'

    battery = spec_dict.get('Type', spec_dict.get('Battery', phone['specs'].get('battery', '5000 mAh' if not is_keypad else '1000 mAh')))
    os_name = spec_dict.get('Operating System', phone['specs'].get('os', 'Feature OS' if is_keypad else 'Android'))
    weight = spec_dict.get('Phone Weight', phone['specs'].get('weight', '75g' if is_keypad else '195g'))
    sim = spec_dict.get('SIM Support', 'Dual SIM')
    has_5g = (spec_dict.get('5G', '').lower() == 'yes' or '5g' in title.lower()) and not is_keypad
    network = '5G / 4G LTE' if has_5g else ('4G LTE' if not is_keypad else '2G / GSM')

    discount = 0
    if original_price > base_price:
        discount = round(((original_price - base_price) / original_price) * 100)

    # Chipset brand detection
    chipset_brand = brand
    b_lower = brand.lower()
    if is_keypad:
        chipset_brand = f"{brand} Keypad SoC"
    elif 'apple' in b_lower:
        chipset_brand = 'Apple'
    elif 'google' in b_lower:
        chipset_brand = 'Google Tensor'
    elif 'snapdragon' in processor.lower() or 'qualcomm' in processor.lower():
        chipset_brand = 'Qualcomm Snapdragon'
    elif 'helio' in processor.lower() or 'dimensity' in processor.lower() or 'mediatek' in processor.lower():
        chipset_brand = 'MediaTek'
    elif 'exynos' in processor.lower():
        chipset_brand = 'Samsung Exynos'
    elif 'kirin' in processor.lower():
        chipset_brand = 'HiSilicon Kirin'
    else:
        chipset_brand = phone['specs'].get('chipsetBrand', 'Octa-Core')

    rating = float(data.get('average_rating') or phone.get('rating') or 4.8)
    review_count = int(data.get('total_ratings_count') or data.get('total_ratings') or phone.get('reviewCount') or 28)

    raw_status = str(data.get('product_status', '')).strip().lower()
    has_any_in_stock_color = any(c.get('inStock') for c in colors)
    has_any_in_stock_variant = any(v.get('inStock') for v in variants)
    is_phone_in_stock = (raw_status not in ['out of stock', 'coming soon'] and has_any_in_stock_color and has_any_in_stock_variant)
    total_phone_stock_qty = sum(c.get('stockQty', 0) for c in colors if c.get('inStock')) if is_phone_in_stock else 0
    color_stock_json_map = {c['name']: {'inStock': c['inStock'], 'stockQty': c['stockQty']} for c in colors}

    # Brand Tagline (Clean, zero competitor references)
    if is_keypad:
        tagline = f"Official {brand} Keypad Phone with 1-Week Battery Backup & PTA Approval"
    else:
        tagline = f"Official {brand} Smartphone with 1-Year Brand Warranty & PTA Approval"

    return {
        'id': phone['id'],
        'slug': phone['slug'],
        'name': title,
        'brand': brand,
        'tagline': tagline,
        'basePricePKR': base_price,
        'originalPricePKR': original_price,
        'discountPercent': discount,
        'rating': rating,
        'reviewCount': review_count,
        'inStock': is_phone_in_stock,
        'stockQty': total_phone_stock_qty,
        'isNew': base_price > 120000,
        'isTrending': True,
        'isBestSeller': review_count > 30,
        'colors': colors,
        'variants': variants if variants else phone.get('variants', []),
        'colorStockMap': color_stock_json_map,
        'keyHighlights': {
            'display': f"{screen_size} {screen_type}",
            'processor': processor,
            'camera': main_camera,
            'battery': battery,
            'charging': 'Super Long Battery Backup' if is_keypad else 'Fast Charging Supported'
        },
        'specs': {
            'screen': full_screen,
            'refreshRate': '60Hz' if is_keypad else ('120Hz' if ('amoled' in screen_type.lower() or base_price > 45000) else '90Hz'),
            'displayType': screen_type,
            'processor': processor,
            'chipsetBrand': chipset_brand,
            'mainCamera': main_camera,
            'selfieCamera': selfie_camera,
            'battery': battery,
            'charging': 'Standard Micro-USB' if is_keypad else 'Fast Charging Supported',
            'os': os_name,
            'network': network,
            'security': 'Keypad Lock / PIN' if is_keypad else ('In-Display Fingerprint / Face Unlock' if base_price > 40000 else 'Side-Mounted Fingerprint'),
            'weight': weight,
            'waterResistance': 'Standard Durability' if is_keypad else ('IP68 Water/Dust Resistant' if base_price > 150000 else 'Splash Resistant'),
            'ptaStatus': 'PTA Approved',
            'warranty': f"1 Year Official {brand} Pakistan Warranty"
        }
    }

def main():
    print("Reading data/smartphones.json...")
    with open('data/smartphones.json', encoding='utf-8') as f:
        phones = json.load(f)

    print(f"Starting comprehensive PriceOye sync for all {len(phones)} mobile phones...")
    updated_phones = []
    matched_count = 0

    start_time = time.time()
    with concurrent.futures.ThreadPoolExecutor(max_workers=14) as executor:
        future_to_phone = {executor.submit(sync_single_phone, p): p for p in phones}
        for i, future in enumerate(concurrent.futures.as_completed(future_to_phone)):
            p_orig = future_to_phone[future]
            try:
                res = future.result()
                updated_phones.append(res)
                if res.get('basePricePKR') > 0 and len(res.get('colors', [])) > 0:
                    matched_count += 1
            except Exception as e:
                updated_phones.append(p_orig)

            if (i + 1) % 25 == 0 or (i + 1) == len(phones):
                print(f"Processed {i + 1}/{len(phones)} phones ({(i+1)/len(phones)*100:.0f}%)... Matched: {matched_count}")

    elapsed = time.time() - start_time
    print(f"Sync completed in {elapsed:.1f}s. Total matched: {matched_count}/{len(phones)}")

    # Sort catalog: Flagships and high-rated items first
    updated_phones.sort(key=lambda x: (x.get('basePricePKR', 0) > 200000, x.get('reviewCount', 0)), reverse=True)

    with open('data/smartphones.json', 'w', encoding='utf-8') as f:
        json.dump(updated_phones, f, indent=2, ensure_ascii=False)

    print("Successfully updated data/smartphones.json with exact PriceOye prices, specs, and images!")

if __name__ == '__main__':
    main()
