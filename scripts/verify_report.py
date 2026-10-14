import json

phones = json.load(open('data/smartphones.json', encoding='utf-8'))
print(f"Total verified phones: {len(phones)}")

zero_price = [p['name'] for p in phones if p.get('basePricePKR', 0) <= 0]
no_colors = [p['name'] for p in phones if len(p.get('colors', [])) == 0]
no_specs = [p['name'] for p in phones if not p.get('specs')]

print(f"Zero price count: {len(zero_price)}")
print(f"No colors count: {len(no_colors)}")
print(f"No specs count: {len(no_specs)}")

# Check competitor mentions in user facing strings
competitor_mentions = []
for p in phones:
    for field in ['name', 'tagline', 'brand']:
        val = str(p.get(field, ''))
        if 'priceoye' in val.lower():
            competitor_mentions.append((p['id'], field, val))
    for spec_k, spec_v in p.get('specs', {}).items():
        if 'priceoye' in str(spec_v).lower():
            competitor_mentions.append((p['id'], spec_k, spec_v))

print(f"Competitor mentions in user-facing data: {len(competitor_mentions)}")

sample_slugs = ['samsung-galaxy-s24-ultra', 'xiaomi-redmi-14c', 'nokia-105', 'itel-it2160']
for s in sample_slugs:
    match = [p for p in phones if s in p['slug']]
    if match:
        p = match[0]
        print(f"\n--- {p['name']} ({p['brand']}) ---")
        print(f"  Base Price: PKR {p['basePricePKR']:,} | Retail: PKR {p['originalPricePKR']:,} | Discount: {p['discountPercent']}%")
        print(f"  In Stock: {p['inStock']} | Stock Qty: {p.get('stockQty', 0)}")
        print(f"  Colors ({len(p['colors'])}): {[c['name'] for c in p['colors']]}")
        print(f"  First Color Image: {p['colors'][0]['image']}")
        print(f"  Display: {p['specs'].get('screen')}")
        print(f"  Processor: {p['specs'].get('processor')}")
        print(f"  Battery: {p['specs'].get('battery')}")
        print(f"  Main Camera: {p['specs'].get('mainCamera')}")
        print(f"  Variants ({len(p.get('variants', []))}): {[(v['ram'], v['storage'], v['pricePKR'], v['inStock']) for v in p.get('variants', [])]}")
