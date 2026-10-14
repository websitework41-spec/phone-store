import requests
from bs4 import BeautifulSoup
import json
import re

url = "https://priceoye.pk/mobiles"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

resp = requests.get(url, headers=headers)
print("Status:", resp.status_code)
soup = BeautifulSoup(resp.text, "html.parser")

product_cards = soup.select(".productBox")
print("productBox count:", len(product_cards))

if not product_cards:
    # Try finding other selectors
    links = [a["href"] for a in soup.find_all("a", href=True) if "/mobiles/" in a["href"]]
    print("Links with /mobiles/:", len(links))
    unique_links = list(set(links))
    print("Unique links sample:", unique_links[:10])
else:
    for card in product_cards[:3]:
        title = card.select_one(".p-title")
        price = card.select_one(".price-box")
        img = card.select_one("img")
        print("Card:", title.text.strip() if title else "No title", price.text.strip() if price else "No price")
