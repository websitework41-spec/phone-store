import requests
from bs4 import BeautifulSoup
import re

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

all_links = []
seen = set()

# 1. Fetch from brand pages first to get real smartphones
brands = ['samsung', 'apple', 'xiaomi', 'infinix', 'tecno', 'vivo', 'realme', 'oppo', 'honor', 'motorola', 'nothing']

for brand in brands:
    url = f'https://priceoye.pk/mobiles/{brand}'
    try:
        r = requests.get(url, headers=headers, timeout=10)
        s = BeautifulSoup(r.text, 'html.parser')
        boxes = s.select('.productBox a.ga-dataset')
        print(f'Brand {brand}: found {len(boxes)} cards')
        for a in boxes:
            href = a.get('href')
            if href and href not in seen and f'/mobiles/{brand}/' in href:
                seen.add(href)
                all_links.append(href)
    except Exception as e:
        print(f'Error fetching {brand}: {e}')

print('Links from brand pages:', len(all_links))

# 2. Also fetch from main category pages if needed to reach 100+
if len(all_links) < 120:
    for page in range(1, 6):
        url = f'https://priceoye.pk/mobiles?page={page}'
        try:
            r = requests.get(url, headers=headers, timeout=10)
            s = BeautifulSoup(r.text, 'html.parser')
            boxes = s.select('.productBox a.ga-dataset')
            for a in boxes:
                href = a.get('href')
                if href and href not in seen:
                    # filter out simple keypad phones if possible (e.g. qmobile, dcode, itel keypads)
                    seen.add(href)
                    all_links.append(href)
        except Exception as e:
            print(f'Error on page {page}: {e}')

print('Total unique links collected:', len(all_links))
with open('data/collected_urls.txt', 'w') as f:
    f.write('\n'.join(all_links))
