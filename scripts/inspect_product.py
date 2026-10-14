
import requests
import re

r = requests.get('https://priceoye.pk/mobiles/infinix/infinix-smart-20', headers={'User-Agent': 'Mozilla/5.0'})
text = r.text

for match in re.finditer(r'(Battery|Display|Camera|Processor|Storage|RAM)', text, re.I):
    start = max(0, match.start() - 50)
    end = min(len(text), match.end() + 150)
    print('Snippet:', text[start:end].replace('\n', ' '))
    print('---')
    if match.start() > 20000:
        break
