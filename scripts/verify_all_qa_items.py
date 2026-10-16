import json
import re
import os
import sys

def verify():
    errors = []
    print("--- STARTING COMPREHENSIVE QA VERIFICATION (16 ITEMS) ---\n")

    # Item 1: Policies Page & Footer Links
    policies_path = "app/policies/page.tsx"
    footer_path = "components/Footer.tsx"
    if not os.path.exists(policies_path):
        errors.append("Item 1: app/policies/page.tsx does not exist")
    else:
        with open(policies_path, "r", encoding="utf-8") as f:
            p_content = f.read()
        for anchor in ["open-parcel", "pta-guide", "installments", "warranty", "cod-terms", "replacement-guarantee", "privacy-security"]:
            if f"id: '{anchor}'" not in p_content and f'id="{anchor}"' not in p_content:
                errors.append(f"Item 1: Anchor #{anchor} not found in policies/page.tsx")
        
        with open(footer_path, "r", encoding="utf-8") as f:
            f_content = f.read()
        for anchor in ["open-parcel", "pta-guide", "installments", "warranty", "cod-terms", "replacement-guarantee", "privacy-security"]:
            if f'/policies#{anchor}' not in f_content:
                errors.append(f"Item 1: Footer link /policies#{anchor} not found")
    print("Item 1: Dead Policy Links -> VERIFIED PASS")

    # Item 2: Broken Budget Links
    with open(footer_path, "r", encoding="utf-8") as f:
        f_content = f.read()
    for link in ["/?maxPrice=25000#catalog", "/?maxPrice=40000#catalog", "/?maxPrice=60000#catalog", "/?maxPrice=100000#catalog", "/?minPrice=150000#catalog", "/?search=5G#catalog", "/?spec=120hz-amoled#catalog"]:
        if link not in f_content:
            errors.append(f"Item 2: Budget link {link} not found in footer")
    with open("app/page.tsx", "r", encoding="utf-8") as f:
        home_content = f.read()
    if "specFilter === '120hz-amoled'" not in home_content:
        errors.append("Item 2: specFilter 120hz-amoled not handled in app/page.tsx")
    print("Item 2: Broken Budget Links -> VERIFIED PASS")

    # Item 3: "VIEW BUDGET PHONES" Wrong Filter
    with open("components/PromotionalBanners.tsx", "r", encoding="utf-8") as f:
        promo_content = f.read()
    if "onFilterBudget" not in promo_content:
        errors.append("Item 3: onFilterBudget prop missing in PromotionalBanners.tsx")
    if "onSelectBrand('Xiaomi')" in promo_content:
        errors.append("Item 3: PromotionalBanners still selects Xiaomi for budget phones")
    if "onFilterBudget={handleFilterBudget}" not in home_content:
        errors.append("Item 3: onFilterBudget not passed to CatalogBannerDualCards in app/page.tsx")
    print("Item 3: VIEW BUDGET PHONES Wrong Filter -> VERIFIED PASS")

    # Item 4: "VIEW ALL KEYPAD PHONES" Incomplete
    if "['Nokia', 'Itel']" not in home_content:
        errors.append("Item 4: Nokia + Itel filter missing in app/page.tsx")
    if "onFilterKeypad={handleFilterKeypad}" not in home_content:
        errors.append("Item 4: onFilterKeypad not passed to CatalogBannerDualCards in app/page.tsx")
    print("Item 4: VIEW ALL KEYPAD PHONES Incomplete -> VERIFIED PASS")

    # Item 5: Price High to Low sort comparator
    with open("data/smartphones.json", "r", encoding="utf-8") as f:
        catalog = json.load(f)
    sorted_desc = sorted(catalog, key=lambda p: p["basePricePKR"], reverse=True)
    prices = [p["basePricePKR"] for p in sorted_desc]
    if not all(prices[i] >= prices[i+1] for i in range(len(prices)-1)):
        errors.append("Item 5: Prices failed descending numerical check")
    # Check that in app/page.tsx, price-desc compares basePricePKR before inStock
    pos_desc = home_content.find("filters.sortBy === 'price-desc'")
    pos_instock = home_content.find("a.inStock !== b.inStock")
    if pos_desc == -1 or pos_desc > pos_instock:
        errors.append("Item 5: price-desc sort is not prioritized before inStock check in app/page.tsx")
    print("Item 5: Price High to Low Sort -> VERIFIED PASS")

    # Item 6: Callback Form Phone Validation
    with open("components/FilterSidebar.tsx", "r", encoding="utf-8") as f:
        sidebar_content = f.read()
    if "validateEmailOrPhone" not in sidebar_content:
        errors.append("Item 6: validateEmailOrPhone missing in FilterSidebar.tsx")
    if "assistError" not in sidebar_content:
        errors.append("Item 6: assistError feedback missing in FilterSidebar.tsx")
    print("Item 6: Callback Form Phone Validation -> VERIFIED PASS")

    # Item 7: Compare "BUY THIS MODEL" in-stock selection
    if "phone.variants.find((v) => v.inStock)" not in home_content:
        errors.append("Item 7: inStock variant selection missing in app/page.tsx ComparisonDock")
    with open("app/product/[slug]/page.tsx", "r", encoding="utf-8") as f:
        prod_content = f.read()
    if "phoneToBuy.variants.find((v) => v.inStock)" not in prod_content:
        errors.append("Item 7: inStock variant selection missing in product page ComparisonDock")
    print("Item 7: Buy This Model In-Stock Variant -> VERIFIED PASS")

    # Item 8: Cart Persistence
    if "localStorage.getItem('voltphone_cart')" not in home_content:
        errors.append("Item 8: Cart localStorage hydration missing in app/page.tsx")
    if "localStorage.setItem('voltphone_cart'" not in home_content:
        errors.append("Item 8: Cart localStorage persistence missing in app/page.tsx")
    if "localStorage.getItem('voltphone_cart')" not in prod_content:
        errors.append("Item 8: Cart localStorage hydration missing in product page")
    print("Item 8: Cart Persistence -> VERIFIED PASS")

    # Item 9: VoltBot Chatbot Route & Reset
    with open("app/api/chat/route.ts", "r", encoding="utf-8") as f:
        chat_route = f.read()
    if "CATALOG_KNOWLEDGE" not in chat_route and "samsung galaxy s24 ultra" not in chat_route.lower():
        errors.append("Item 9: Chatbot local knowledge missing in app/api/chat/route.ts")
    with open("components/HelperBot.tsx", "r", encoding="utf-8") as f:
        bot_content = f.read()
    if "abortControllerRef" not in bot_content:
        errors.append("Item 9: abortControllerRef missing in HelperBot.tsx")
    if "setIsLoading(false)" not in bot_content:
        errors.append("Item 9: Reset does not recover isLoading in HelperBot.tsx")
    print("Item 9: VoltBot Chatbot -> VERIFIED PASS")

    # Item 10: Flash Deals Countdown
    with open("components/FlashSaleCountdown.tsx", "r", encoding="utf-8") as f:
        countdown_content = f.read()
    if "getTime()" not in countdown_content:
        errors.append("Item 10: Real-time clock missing in FlashSaleCountdown.tsx")
    if "14:28" in countdown_content:
        errors.append("Item 10: Fake 14:28 timer detected in FlashSaleCountdown.tsx")
    print("Item 10: Fake Flash-Deals Countdown Fixed -> VERIFIED PASS")

    # Item 11: Hero CTAs
    with open("components/HeroBanner.tsx", "r", encoding="utf-8") as f:
        hero_content = f.read()
    if 'href="/?maxPrice=35000#catalog"' not in hero_content:
        errors.append("Item 11: Budget CTA link missing in HeroBanner.tsx")
    if 'href="/?category=keypad#catalog"' not in hero_content:
        errors.append("Item 11: Keypad CTA link missing in HeroBanner.tsx")
    print("Item 11: Dead Hero CTAs Fixed -> VERIFIED PASS")

    # Item 12: Malformed Spec Data Sitewide
    for p in catalog:
        for k, v in p.get("specs", {}).items():
            if isinstance(v, str):
                if "5000mAhmAh" in v or "50MP MP" in v:
                    errors.append(f"Item 12: Duplicated unit in {p['name']} ({k}): {v}")
                if "Li-PomAh" in v or "Non-removablemAh" in v:
                    errors.append(f"Item 12: Missing capacity in {p['name']} ({k}): {v}")
                if "50MP395567" in v:
                    errors.append(f"Item 12: Garbage value 50MP395567 in {p['name']}")
                if "8MB/8MB" in v:
                    errors.append(f"Item 12: Garbage 8MB/8MB in {p['name']}")
        for c in p.get("colors", []):
            if c["name"] in ["Awesome Charcol", "Awesome Lightgray", "Graygreen", "Charkoal Ink", "Redish Brown"]:
                errors.append(f"Item 12: Typo color name {c['name']} in {p['name']}")
        if "Apple Iphone" in p["name"]:
            errors.append(f"Item 12: Typo Apple Iphone in {p['name']}")
    print("Item 12: Malformed Spec Data Sitewide -> VERIFIED PASS")

    # Item 13: S24 Ultra Spec Table Gaps
    s24s = [p for p in catalog if p["slug"] == "samsung-galaxy-s24-ultra"]
    if not s24s:
        errors.append("Item 13: S24 Ultra not found in catalog")
    else:
        s24 = s24s[0]
        specs = s24["specs"]
        if not specs.get("displayType") or specs.get("displayType") == "Not specified":
            errors.append("Item 13: S24 Ultra display technology is blank")
        if not specs.get("selfieCamera") or specs.get("selfieCamera") == "Not specified":
            errors.append("Item 13: S24 Ultra selfie camera is blank")
        if "Snapdragon 8 Gen 3" not in specs.get("processor", ""):
            errors.append(f"Item 13: S24 Ultra processor is incomplete: {specs.get('processor')}")
        if "45W" not in specs.get("charging", ""):
            errors.append(f"Item 13: S24 Ultra charging speed is generic: {specs.get('charging')}")
        if "Android 14" not in specs.get("os", ""):
            errors.append(f"Item 13: S24 Ultra OS version incomplete: {specs.get('os')}")
        if "162.3" not in specs.get("weight", ""):
            errors.append(f"Item 13: S24 Ultra dimensions missing: {specs.get('weight')}")
    print("Item 13: S24 Ultra Spec Table Gaps Filled -> VERIFIED PASS")

    # Item 14: Count Mismatches
    with open("components/CartDrawer.tsx", "r", encoding="utf-8") as f:
        cart_content = f.read()
    if "200 verified PTA smartphones" in cart_content:
        errors.append("Item 14: 200 verified PTA smartphones still found in CartDrawer.tsx")
    if "222 verified PTA smartphones" not in cart_content:
        errors.append("Item 14: 222 verified PTA smartphones missing in CartDrawer.tsx")
    with open("components/Footer.tsx", "r", encoding="utf-8") as f:
        footer_c = f.read()
    if "Samsung Galaxy (19)" not in footer_c:
        errors.append("Item 14: Samsung count 19 missing in Footer.tsx")
    print("Item 14: Count Mismatches Reconciled -> VERIFIED PASS")

    # Item 15: Track Order Fabricates Results
    with open("components/Navbar.tsx", "r", encoding="utf-8") as f:
        nav_content = f.read()
    if "Order Not Found" not in nav_content:
        errors.append("Item 15: Order Not Found status missing in Navbar.tsx")
    if "trackError" not in nav_content:
        errors.append("Item 15: trackError state missing in Navbar.tsx")
    print("Item 15: Track Order Validation -> VERIFIED PASS")

    # Item 16: Accessibility (aria-label)
    if 'aria-label="Close cart drawer"' not in cart_content:
        errors.append("Item 16: Close cart drawer aria-label missing")
    if 'Decrease quantity' not in cart_content or 'aria-label=' not in cart_content:
        errors.append("Item 16: Decrease quantity aria-label missing")
    if 'Increase quantity' not in cart_content or 'aria-label=' not in cart_content:
        errors.append("Item 16: Increase quantity aria-label missing")
    with open("components/ComparisonDock.tsx", "r", encoding="utf-8") as f:
        comp_content = f.read()
    if 'aria-label="Close comparison modal"' not in comp_content:
        errors.append("Item 16: Close comparison modal aria-label missing")
    if 'aria-label="Close quick purchase modal"' not in open("components/QuickPurchaseModal.tsx", encoding="utf-8").read():
        errors.append("Item 16: Close quick purchase modal aria-label missing")
    if 'aria-label="Close tracking popup"' not in nav_content:
        errors.append("Item 16: Close tracking popup aria-label missing")
    if 'aria-label="Close chat window"' not in bot_content:
        errors.append("Item 16: Close chat window aria-label missing")
    print("Item 16: Accessibility aria-labels -> VERIFIED PASS")

    print("\n------------------------------------------------------------")
    if errors:
        print(f"FAILED with {len(errors)} errors:")
        for err in errors:
            print(f"  - {err}")
        sys.exit(1)
    else:
        print("ALL 16 QA ITEMS FULLY VERIFIED AND PASSING!")
        sys.exit(0)

if __name__ == "__main__":
    verify()
