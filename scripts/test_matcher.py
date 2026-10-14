import requests
import json
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
}

def test_search(query):
    try:
        url = f"https://priceoye.pk/search?q={requests.utils.quote(query)}"
        r = requests.get(url, headers=headers, timeout=10)
        found = set(re.findall(r'href=["\'](https://priceoye\.pk/mobiles/[^"\']+)["\']', r.text))
        # Filter out category pages like /mobiles/samsung
        product_urls = [u for u in found if u.count('/') >= 5]
        print(f"Query '{query}' -> found {len(product_urls)} URLs: {product_urls[:3]}")
        return product_urls
    except Exception as e:
        print(f"Error searching {query}: {e}")
        return []

test_search("Samsung Galaxy Z Flip 6")
test_search("Huawei Mate X2")
test_search("Nokia 105")
test_search("Itel it2160")
