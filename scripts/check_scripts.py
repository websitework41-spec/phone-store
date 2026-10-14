import requests
from bs4 import BeautifulSoup
import json
import re

r = requests.get('https://priceoye.pk/mobiles/infinix/infinix-smart-20', headers={'User-Agent': 'Mozilla/5.0'})
soup = BeautifulSoup(r.text, 'html.parser')

scripts = soup.find_all('script')
print(f'Total script tags: {len(scripts)}')

for i, sc in enumerate(scripts):
    txt = sc.string or ''
    if any(k in txt.lower() for k in ['specs', 'battery', 'camera', 'screen', 'display']):
        print(f'Script {i} contains keywords! Length: {len(txt)}')
        for match in re.finditer(r'(battery|display|camera|processor|ram|storage)', txt, re.I):
            start = max(0, match.start() - 30)
            end = min(len(txt), match.end() + 100)
            print('  Match:', txt[start:end].replace('\n', ' '))
            break
