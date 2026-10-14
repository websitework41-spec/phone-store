import requests
from bs4 import BeautifulSoup

r = requests.get('https://priceoye.pk/mobiles/infinix/infinix-smart-20', headers={'User-Agent': 'Mozilla/5.0'})
soup = BeautifulSoup(r.text, 'html.parser')

body_text = soup.get_text()
for line in body_text.splitlines():
    line = line.strip()
    if any(k in line.lower() for k in ['mah', 'mp', 'inches', 'android', 'snapdragon', 'helio', 'dimensity', 'amoled', 'lcd']):
        if len(line) < 100:
            print('Spec line:', line)
