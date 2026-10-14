import requests
import json

def test_phone(url):
    print('\n============================')
    print('Testing URL:', url)
    r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
    pos = r.text.find('window.product_data = ')
    if pos != -1:
        end = r.text.find(';\n', pos)
        if end == -1: end = r.text.find(';</script>', pos)
        raw = r.text[pos + len('window.product_data = '):end]
        data, _ = json.JSONDecoder().raw_decode(raw)
        print("Phone Title:", data.get('title'))
        if 'product_config' in data and 'dataPrices' in data['product_config']:
            dp = data['product_config']['dataPrices']
            for color, variants in dp.items():
                for vname, vlist in variants.items():
                    v0 = vlist[0]
                    print(f"Color: {color} | Variant: {vname} | Price: {v0.get('product_price')} | Retail: {v0.get('retail_price')}")
        
        if 'dataSet' in data and 'specification' in data['dataSet']:
            spec_obj = json.loads(data['dataSet']['specification'])
            print("--- SPECIFICATIONS ---")
            for cat, items in spec_obj.items():
                print(f"[{cat}]")
                if isinstance(items, list):
                    for item in items:
                        for k, v in item.items():
                            print(f"   {k}: {v}")

test_phone('https://priceoye.pk/mobiles/apple/apple-iphone-15-pro-max')
test_phone('https://priceoye.pk/mobiles/xiaomi/redmi-note-13-pro-plus-5g')



