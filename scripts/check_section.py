import requests

r = requests.get('https://priceoye.pk/mobiles/infinix/infinix-smart-20', headers={'User-Agent': 'Mozilla/5.0'})
idx = r.text.find('product-variant')
print(r.text[idx:idx+2500])
