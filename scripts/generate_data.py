import json
import os

phones = [
    {
        "id": "samsung-s24-ultra",
        "slug": "samsung-galaxy-s24-ultra",
        "name": "Samsung Galaxy S24 Ultra",
        "brand": "Samsung",
        "tagline": "The Titanium Era of Galaxy AI with 200MP Quad-Tele System",
        "basePricePKR": 399999,
        "originalPricePKR": 439999,
        "discountPercent": 9,
        "rating": 4.9,
        "reviewCount": 342,
        "inStock": True,
        "isNew": True,
        "isTrending": True,
        "isBestSeller": True,
        "colors": [
            {"name": "Titanium Gray", "hex": "#5e5d59", "image": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80"},
            {"name": "Titanium Black", "hex": "#272729", "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80"},
            {"name": "Titanium Violet", "hex": "#433951", "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80"},
            {"name": "Titanium Yellow", "hex": "#d6c596", "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"}
        ],
        "variants": [
            {"id": "s24u-12-256", "ram": "12GB", "storage": "256GB", "pricePKR": 399999, "originalPricePKR": 439999, "inStock": True},
            {"id": "s24u-12-512", "ram": "12GB", "storage": "512GB", "pricePKR": 444999, "originalPricePKR": 479999, "inStock": True},
            {"id": "s24u-12-1tb", "ram": "12GB", "storage": "1TB", "pricePKR": 509999, "originalPricePKR": 549999, "inStock": False}
        ],
        "keyHighlights": {
            "display": "6.8\" Dynamic LTPO AMOLED 2X 120Hz (2600 nits)",
            "processor": "Snapdragon 8 Gen 3 for Galaxy (4nm)",
            "camera": "200MP Wide + 50MP Periscope (5x) + 10MP Tele + 12MP Ultra",
            "battery": "5000 mAh All-Day Intelligent Battery",
            "charging": "45W Fast Charging (65% in 30 min) + 15W Wireless"
        },
        "specs": {
            "screen": "6.8 inches Dynamic LTPO AMOLED 2X, 120Hz, HDR10+, 2600 nits (peak), Gorilla Armor",
            "refreshRate": "1-120Hz Adaptive",
            "displayType": "Flat LTPO Dynamic AMOLED 2X",
            "processor": "Qualcomm Snapdragon 8 Gen 3 for Galaxy (4 nm) Octa-core 3.39 GHz",
            "chipsetBrand": "Qualcomm",
            "mainCamera": "200 MP (f/1.7, OIS, Laser AF) + 50 MP (5x optical zoom, OIS) + 10 MP (3x optical zoom) + 12 MP (ultrawide, 120˚)",
            "selfieCamera": "12 MP, f/2.2, 26mm (wide), Dual Pixel PDAF, 4K@60fps",
            "battery": "5000 mAh Li-Ion non-removable",
            "charging": "45W wired, PD3.0 (65% in 30 min) + 15W wireless + 4.5W reverse wireless",
            "os": "Android 14, One UI 6.1.1 (Up to 7 major Android upgrades)",
            "network": "5G SA/NSA, Dual SIM (2 Nano-SIMs + eSIM, dual stand-by)",
            "security": "Ultrasonic In-Display Fingerprint, Knox Matrix 3.0",
            "weight": "232 g",
            "waterResistance": "IP68 dust/water resistant (up to 1.5m for 30 mins)",
            "ptaStatus": "PTA Approved",
            "warranty": "1 Year Official Brand Warranty (Samsung Pakistan Authorized)"
        }
    },
    {
        "id": "apple-iphone-16-pro-max",
        "slug": "apple-iphone-16-pro-max",
        "name": "Apple iPhone 16 Pro Max",
        "brand": "Apple",
        "tagline": "Grade 5 Titanium, Camera Control & A18 Pro Chip with Apple Intelligence",
        "basePricePKR": 494999,
        "originalPricePKR": 529999,
        "discountPercent": 7,
        "rating": 5.0,
        "reviewCount": 218,
        "inStock": True,
        "isNew": True,
        "isTrending": True,
        "isBestSeller": True,
        "colors": [
            {"name": "Desert Titanium", "hex": "#c5b49e", "image": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80"},
            {"name": "Natural Titanium", "hex": "#9c9b97", "image": "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80"},
            {"name": "White Titanium", "hex": "#f2f1ed", "image": "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=800&q=80"},
            {"name": "Black Titanium", "hex": "#343538", "image": "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80"}
        ],
        "variants": [
            {"id": "ip16pm-256", "ram": "8GB", "storage": "256GB", "pricePKR": 494999, "originalPricePKR": 529999, "inStock": True},
            {"id": "ip16pm-512", "ram": "8GB", "storage": "512GB", "pricePKR": 549999, "originalPricePKR": 589999, "inStock": True},
            {"id": "ip16pm-1tb", "ram": "8GB", "storage": "1TB", "pricePKR": 629999, "originalPricePKR": 669999, "inStock": True}
        ],
        "keyHighlights": {
            "display": "6.9\" Super Retina XDR OLED ProMotion 120Hz (2000 nits)",
            "processor": "Apple A18 Pro (3nm) 6-core CPU + 6-core GPU",
            "camera": "48MP Fusion + 48MP Ultra Wide + 12MP 5x Telephoto with Camera Control",
            "battery": "4685 mAh Up to 33 hours video playback",
            "charging": "25W MagSafe Wireless (50% in 30 min) + USB-C 3.0"
        },
        "specs": {
            "screen": "6.9 inches Super Retina XDR OLED, 120Hz ProMotion, HDR10, Dolby Vision, 2000 nits (peak)",
            "refreshRate": "1-120Hz ProMotion",
            "displayType": "LTPO Super Retina XDR OLED Ceramic Shield 2024",
            "processor": "Apple A18 Pro (3 nm) with 16-core Neural Engine",
            "chipsetBrand": "Apple",
            "mainCamera": "48 MP (f/1.8, 24mm, sensor-shift OIS) + 12 MP (120mm periscope telephoto, 5x zoom) + 48 MP (ultrawide, 13mm)",
            "selfieCamera": "12 MP, f/1.9, 23mm (wide), PDAF, OIS, 4K@60fps Dolby Vision",
            "battery": "4685 mAh Li-Ion non-removable",
            "charging": "Wired PD (50% in 30 min) + 25W MagSafe wireless + 15W Qi2 wireless + 4.5W reverse wired",
            "os": "iOS 18 (with Apple Intelligence)",
            "network": "5G, Nano-SIM and eSIM / Dual eSIM",
            "security": "Face ID, LiDAR Scanner, Crash Detection, Emergency SOS via satellite",
            "weight": "227 g",
            "waterResistance": "IP68 dust/water resistant (up to 6m for 30 mins)",
            "ptaStatus": "PTA Approved",
            "warranty": "1 Year Official Apple International & Mercantile Warranty"
        }
    },
    {
        "id": "xiaomi-redmi-note-13-pro-plus",
        "slug": "xiaomi-redmi-note-13-pro-plus-5g",
        "name": "Xiaomi Redmi Note 13 Pro+ 5G",
        "brand": "Xiaomi",
        "tagline": "200MP OIS Flagship Camera, 1.5K Curved AMOLED & 120W HyperCharge",
        "basePricePKR": 119999,
        "originalPricePKR": 139999,
        "discountPercent": 14,
        "rating": 4.8,
        "reviewCount": 184,
        "inStock": True,
        "isNew": False,
        "isTrending": True,
        "isBestSeller": True,
        "colors": [
            {"name": "Midnight Black", "hex": "#1b1c1e", "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80"},
            {"name": "Moonlight White", "hex": "#e7e7eb", "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"},
            {"name": "Aurora Purple", "hex": "#8c7ba8", "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80"}
        ],
        "variants": [
            {"id": "rn13pp-8-256", "ram": "8GB", "storage": "256GB", "pricePKR": 119999, "originalPricePKR": 139999, "inStock": True},
            {"id": "rn13pp-12-512", "ram": "12GB", "storage": "512GB", "pricePKR": 134999, "originalPricePKR": 154999, "inStock": True}
        ],
        "keyHighlights": {
            "display": "6.67\" 1.5K 120Hz Curved AMOLED (1800 nits)",
            "processor": "MediaTek Dimensity 7200-Ultra (4nm)",
            "camera": "200 MP Samsung ISOCELL HP3 with OIS + 8MP Ultra + 2MP Macro",
            "battery": "5000 mAh Long-Life Battery",
            "charging": "120W HyperCharge (100% in 19 mins in-box charger)"
        },
        "specs": {
            "screen": "6.67 inches CrystalRes AMOLED, 68B colors, 120Hz, Dolby Vision, HDR10+, 1800 nits, Gorilla Glass Victus",
            "refreshRate": "120Hz",
            "displayType": "Curved CrystalRes AMOLED",
            "processor": "MediaTek Dimensity 7200 Ultra (4 nm) Octa-core 2.8 GHz",
            "chipsetBrand": "MediaTek",
            "mainCamera": "200 MP (f/1.7, 23mm, multi-directional PDAF, OIS) + 8 MP (120˚ ultrawide) + 2 MP (macro)",
            "selfieCamera": "16 MP, f/2.4, (wide), HDR, 1080p@60fps",
            "battery": "5000 mAh Li-Po",
            "charging": "120W wired, PD3.0, 100% in 19 min (advertised)",
            "os": "Android 14, Xiaomi HyperOS",
            "network": "5G Dual SIM (Nano-SIM, dual stand-by)",
            "security": "Under-display optical fingerprint, AI Face Unlock",
            "weight": "204.5 g",
            "waterResistance": "IP68 dust/water resistant (up to 1.5m for 30 mins)",
            "ptaStatus": "PTA Approved",
            "warranty": "1 Year Official Brand Warranty (Airlink / SmartLink Pakistan)"
        }
    },
    {
        "id": "samsung-galaxy-a55-5g",
        "slug": "samsung-galaxy-a55-5g",
        "name": "Samsung Galaxy A55 5G",
        "brand": "Samsung",
        "tagline": "Metal Frame, Gorilla Glass Victus+ & Nightography with Knox Vault",
        "basePricePKR": 129999,
        "originalPricePKR": 142999,
        "discountPercent": 9,
        "rating": 4.8,
        "reviewCount": 147,
        "inStock": True,
        "isNew": True,
        "isTrending": True,
        "isBestSeller": True,
        "colors": [
            {"name": "Awesome Iceblue", "hex": "#c8daf0", "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80"},
            {"name": "Awesome Navy", "hex": "#1d2330", "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80"},
            {"name": "Awesome Lilac", "hex": "#ded2eb", "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"}
        ],
        "variants": [
            {"id": "a55-8-128", "ram": "8GB", "storage": "128GB", "pricePKR": 129999, "originalPricePKR": 142999, "inStock": True},
            {"id": "a55-8-256", "ram": "8GB", "storage": "256GB", "pricePKR": 139999, "originalPricePKR": 154999, "inStock": True}
        ],
        "keyHighlights": {
            "display": "6.6\" Super AMOLED 120Hz (1000 nits HBM)",
            "processor": "Exynos 1480 (4nm) with AMD Xclipse 530 GPU",
            "camera": "50MP OIS Main + 12MP Ultra-wide + 5MP Macro",
            "battery": "5000 mAh 2-Day Endurance",
            "charging": "25W Super Fast Charging"
        },
        "specs": {
            "screen": "6.6 inches Super AMOLED, 120Hz, HDR10+, 1000 nits (HBM), Corning Gorilla Glass Victus+",
            "refreshRate": "120Hz",
            "displayType": "Super AMOLED FHD+ Vision Booster",
            "processor": "Exynos 1480 (4 nm) Octa-core 2.75 GHz, Xclipse 530 GPU",
            "chipsetBrand": "Samsung Exynos",
            "mainCamera": "50 MP (f/1.8, wide, 1/1.56\", PDAF, OIS) + 12 MP (ultrawide, 123˚) + 5 MP (macro)",
            "selfieCamera": "32 MP, f/2.2, 26mm (wide), 4K@30fps",
            "battery": "5000 mAh Li-Ion non-removable",
            "charging": "25W wired fast charging",
            "os": "Android 14, One UI 6.1 (4 major OS updates + 5 yrs security)",
            "network": "5G, Dual SIM (Nano-SIM, dual stand-by)",
            "security": "Under-display optical fingerprint, Samsung Knox Vault",
            "weight": "213 g",
            "waterResistance": "IP67 dust/water resistant (up to 1m for 30 mins)",
            "ptaStatus": "PTA Approved",
            "warranty": "1 Year Official Samsung Pakistan Brand Warranty"
        }
    },
    {
        "id": "infinix-note-40-pro",
        "slug": "infinix-note-40-pro-5g",
        "name": "Infinix Note 40 Pro 5G",
        "brand": "Infinix",
        "tagline": "3D-Curved 120Hz AMOLED, 70W All-Round FastCharge & 20W Wireless MagCharge",
        "basePricePKR": 69999,
        "originalPricePKR": 79999,
        "discountPercent": 13,
        "rating": 4.7,
        "reviewCount": 162,
        "inStock": True,
        "isNew": True,
        "isTrending": True,
        "isBestSeller": True,
        "colors": [
            {"name": "Vintage Green", "hex": "#4e6353", "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80"},
            {"name": "Titan Gold", "hex": "#d3bc91", "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"}
        ],
        "variants": [
            {"id": "n40p-8-256", "ram": "8GB", "storage": "256GB", "pricePKR": 69999, "originalPricePKR": 79999, "inStock": True},
            {"id": "n40p-12-256", "ram": "12GB", "storage": "256GB", "pricePKR": 76999, "originalPricePKR": 85999, "inStock": True}
        ],
        "keyHighlights": {
            "display": "6.78\" 3D-Curved 120Hz AMOLED (1300 nits)",
            "processor": "MediaTek Dimensity 7020 5G (6nm)",
            "camera": "108MP OIS Super-Zoom Camera + 2MP + 2MP",
            "battery": "5000 mAh with Cheetah X1 Power Management Chip",
            "charging": "70W Multi-Speed Wired + 20W Wireless MagCharge"
        },
        "specs": {
            "screen": "6.78 inches AMOLED, 1B colors, 120Hz, 1300 nits (peak), Corning Gorilla Glass",
            "refreshRate": "120Hz",
            "displayType": "3D Curved Flexible AMOLED",
            "processor": "MediaTek Dimensity 7020 (6 nm) Octa-core 2.2 GHz",
            "chipsetBrand": "MediaTek",
            "mainCamera": "108 MP (f/1.8, wide, 1/1.67\", PDAF, OIS, 3x lossless zoom) + 2 MP + 2 MP",
            "selfieCamera": "32 MP, f/2.2, (wide), Dual-LED flash, 1080p@30fps",
            "battery": "5000 mAh Li-Po",
            "charging": "70W wired (50% in 20 min) + 20W wireless MagCharge + Reverse charging",
            "os": "Android 14, XOS 14 (Guaranteed 2 Android OS upgrades)",
            "network": "5G, Dual SIM (Nano-SIM, dual stand-by)",
            "security": "In-display optical fingerprint, Halo AI Active Light",
            "weight": "190 g",
            "waterResistance": "IP53 splash and dust resistant",
            "ptaStatus": "PTA Approved",
            "warranty": "1 Year Official Brand Warranty (Carlcare Pakistan)"
        }
    },
    {
        "id": "tecno-camon-30-premier-5g",
        "slug": "tecno-camon-30-premier-5g",
        "name": "Tecno Camon 30 Premier 5G",
        "brand": "Tecno",
        "tagline": "Sony IMX890 Quad 50MP Cameras with PolarAce Dual-Chip AI Imaging",
        "basePricePKR": 139999,
        "originalPricePKR": 154999,
        "discountPercent": 10,
        "rating": 4.8,
        "reviewCount": 78,
        "inStock": True,
        "isNew": True,
        "isTrending": False,
        "isBestSeller": False,
        "colors": [
            {"name": "Alps Snowy Silver", "hex": "#c8c8cc", "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80"},
            {"name": "Hawaii Lava Black", "hex": "#1e1e20", "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80"}
        ],
        "variants": [
            {"id": "c30p-12-512", "ram": "12GB", "storage": "512GB", "pricePKR": 139999, "originalPricePKR": 154999, "inStock": True}
        ],
        "keyHighlights": {
            "display": "6.77\" 1.5K LTPO AMOLED 144Hz (1400 nits)",
            "processor": "MediaTek Dimensity 8200 Ultimate 5G (4nm)",
            "camera": "Quad 50MP (Main Sony IMX890 OIS + 3x Periscope + Ultra-wide + 50MP Eye-tracking Selfie)",
            "battery": "5000 mAh Dual-Cell Battery",
            "charging": "70W Ultra Charge (100% in 45 mins)"
        },
        "specs": {
            "screen": "6.77 inches LTPO AMOLED, 1B colors, 144Hz, HDR, 1400 nits, Corning Gorilla Glass 5",
            "refreshRate": "1-144Hz LTPO Adaptive",
            "displayType": "1.5K Flat LTPO AMOLED",
            "processor": "MediaTek Dimensity 8200 Ultimate (4 nm) Octa-core 3.1 GHz + Sony ISP",
            "chipsetBrand": "MediaTek",
            "mainCamera": "50 MP (Sony IMX890, 1/1.56\", OIS) + 50 MP (3x optical periscope zoom) + 50 MP (ultrawide, 114˚)",
            "selfieCamera": "50 MP, f/2.5, 24mm (wide), Eye-tracking autofocus, 4K@60fps",
            "battery": "5000 mAh Li-Po non-removable",
            "charging": "70W wired fast charging (100% in 45 min)",
            "os": "Android 14, HIOS 14 (3 years Android upgrades)",
            "network": "5G, Dual SIM (Nano-SIM, dual stand-by)",
            "security": "In-display optical fingerprint, Action Dot indicator",
            "weight": "210 g",
            "waterResistance": "IP54 dust and splash resistant",
            "ptaStatus": "PTA Approved",
            "warranty": "1 Year Official Brand Warranty (Carlcare Pakistan)"
        }
    },
    {
        "id": "vivo-v40-5g",
        "slug": "vivo-v40-5g",
        "name": "Vivo V40 5G",
        "brand": "Vivo",
        "tagline": "ZEISS Professional Portrait Camera with 5500 mAh BlueVolt Battery",
        "basePricePKR": 139999,
        "originalPricePKR": 149999,
        "discountPercent": 7,
        "rating": 4.9,
        "reviewCount": 112,
        "inStock": True,
        "isNew": True,
        "isTrending": True,
        "isBestSeller": False,
        "colors": [
            {"name": "Ganges Violet", "hex": "#766f8e", "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80"},
            {"name": "Titanium Grey", "hex": "#5c5c60", "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80"}
        ],
        "variants": [
            {"id": "v40-12-256", "ram": "12GB", "storage": "256GB", "pricePKR": 139999, "originalPricePKR": 149999, "inStock": True}
        ],
        "keyHighlights": {
            "display": "6.78\" 1.5K 120Hz 3D Curved AMOLED (4500 nits peak)",
            "processor": "Qualcomm Snapdragon 7 Gen 3 (4nm)",
            "camera": "Dual 50MP ZEISS OIS Main + 50MP ZEISS Ultra-wide + 50MP ZEISS Selfie",
            "battery": "5500 mAh Ultra-Slim BlueVolt Battery",
            "charging": "80W FlashCharge"
        },
        "specs": {
            "screen": "6.78 inches AMOLED, 1B colors, 120Hz, HDR10+, 4500 nits (peak), Schott Xensation Alpha",
            "refreshRate": "120Hz",
            "displayType": "1.5K 3D Curved AMOLED",
            "processor": "Qualcomm Snapdragon 7 Gen 3 (4 nm) Octa-core 2.63 GHz",
            "chipsetBrand": "Qualcomm",
            "mainCamera": "50 MP (ZEISS optics, f/1.9, 1/1.56\", OIS) + 50 MP (ZEISS ultrawide, 119˚, AF) + AI Aura Light",
            "selfieCamera": "50 MP, f/2.0, 21mm (wide), ZEISS autofocus, 4K@30fps",
            "battery": "5500 mAh BlueVolt Silicon-Carbon Battery",
            "charging": "80W wired FlashCharge + Reverse wired",
            "os": "Android 14, Funtouch 14",
            "network": "5G, Dual SIM (Nano-SIM, dual stand-by)",
            "security": "In-display optical fingerprint, Wet-Hand Touch Tech",
            "weight": "190 g",
            "waterResistance": "IP68 and IP69 dust/water resistant",
            "ptaStatus": "PTA Approved",
            "warranty": "1 Year Official Brand Warranty (Vivo Pakistan Authorized)"
        }
    },
    {
        "id": "realme-12-pro-plus",
        "slug": "realme-12-pro-plus-5g",
        "name": "Realme 12 Pro+ 5G",
        "brand": "Realme",
        "tagline": "Periscope Portrait Master with Luxury Watch Design & Sony IMX890 OIS",
        "basePricePKR": 114999,
        "originalPricePKR": 129999,
        "discountPercent": 12,
        "rating": 4.8,
        "reviewCount": 94,
        "inStock": True,
        "isNew": False,
        "isTrending": False,
        "isBestSeller": True,
        "colors": [
            {"name": "Submarine Blue", "hex": "#1b375b", "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80"},
            {"name": "Navigator Beige", "hex": "#dfd7ca", "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"}
        ],
        "variants": [
            {"id": "r12pp-8-256", "ram": "8GB", "storage": "256GB", "pricePKR": 114999, "originalPricePKR": 129999, "inStock": True},
            {"id": "r12pp-12-512", "ram": "12GB", "storage": "512GB", "pricePKR": 124999, "originalPricePKR": 139999, "inStock": True}
        ],
        "keyHighlights": {
            "display": "6.7\" 120Hz Curved Vision AMOLED (2160Hz PWM)",
            "processor": "Qualcomm Snapdragon 7s Gen 2 (4nm)",
            "camera": "64MP Periscope OIS (3x Optical, 120x SuperZoom) + 50MP Sony IMX890 OIS + 8MP Ultra",
            "battery": "5000 mAh Massive Battery",
            "charging": "67W SUPERVOOC Charge (50% in 19 mins)"
        },
        "specs": {
            "screen": "6.7 inches AMOLED, 1B colors, 120Hz, 950 nits (peak), 2160Hz PWM dimming",
            "refreshRate": "120Hz",
            "displayType": "Curved Vision AMOLED",
            "processor": "Qualcomm Snapdragon 7s Gen 2 (4 nm) Octa-core 2.40 GHz",
            "chipsetBrand": "Qualcomm",
            "mainCamera": "50 MP (Sony IMX890, f/1.8, OIS) + 64 MP (Omnivision OV64B periscope, 3x optical, OIS) + 8 MP (ultrawide)",
            "selfieCamera": "32 MP, f/2.4, 22mm (wide), 1080p@30fps",
            "battery": "5000 mAh Li-Ion non-removable",
            "charging": "67W SUPERVOOC wired (1-50% in 19 min)",
            "os": "Android 14, Realme UI 5.0",
            "network": "5G, Dual SIM (Nano-SIM, dual stand-by)",
            "security": "In-display optical fingerprint, Ollivier Savéo Luxury Watch Craftsmanship",
            "weight": "196 g",
            "waterResistance": "IP65 dust/water resistant",
            "ptaStatus": "PTA Approved",
            "warranty": "1 Year Official Brand Warranty (Realme Pakistan Authorized)"
        }
    },
    {
        "id": "xiaomi-redmi-13c",
        "slug": "xiaomi-redmi-13c",
        "name": "Xiaomi Redmi 13C",
        "brand": "Xiaomi",
        "tagline": "Smooth 90Hz 6.74\" Display, 50MP AI Triple Camera & 5000mAh Battery",
        "basePricePKR": 32999,
        "originalPricePKR": 36999,
        "discountPercent": 11,
        "rating": 4.6,
        "reviewCount": 421,
        "inStock": True,
        "isNew": False,
        "isTrending": True,
        "isBestSeller": True,
        "colors": [
            {"name": "Midnight Black", "hex": "#1f2022", "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80"},
            {"name": "Navy Blue", "hex": "#202a3a", "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80"},
            {"name": "Clover Green", "hex": "#47594d", "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"}
        ],
        "variants": [
            {"id": "r13c-4-128", "ram": "4GB", "storage": "128GB", "pricePKR": 32999, "originalPricePKR": 36999, "inStock": True},
            {"id": "r13c-6-128", "ram": "6GB", "storage": "128GB", "pricePKR": 35999, "originalPricePKR": 39999, "inStock": True},
            {"id": "r13c-8-256", "ram": "8GB", "storage": "256GB", "pricePKR": 41999, "originalPricePKR": 45999, "inStock": True}
        ],
        "keyHighlights": {
            "display": "6.74\" 90Hz Eye Care Display with Corning Gorilla Glass",
            "processor": "MediaTek Helio G85 Octa-Core",
            "camera": "50MP AI Main + 2MP Macro + Auxiliary Lens",
            "battery": "5000 mAh Ultra-long Battery",
            "charging": "18W Type-C Fast Charging"
        },
        "specs": {
            "screen": "6.74 inches IPS LCD, 90Hz, 600 nits (HBM), Corning Gorilla Glass, TÜV Low Blue Light certified",
            "refreshRate": "90Hz",
            "displayType": "Dot Drop Display",
            "processor": "MediaTek Helio G85 (12nm) Octa-core 2.0 GHz",
            "chipsetBrand": "MediaTek",
            "mainCamera": "50 MP (f/1.8, 28mm wide, PDAF) + 2 MP (macro) + 0.08 MP (auxiliary)",
            "selfieCamera": "8 MP, f/2.0, HDR, 1080p@30fps",
            "battery": "5000 mAh Li-Po non-removable",
            "charging": "18W wired, PD",
            "os": "Android 13, MIUI 14 for POCO/Redmi",
            "network": "4G LTE, Dual SIM + Dedicated microSD slot",
            "security": "Side-mounted fingerprint sensor, AI Face Unlock",
            "weight": "192 g",
            "waterResistance": "Standard splash proof",
            "ptaStatus": "PTA Approved",
            "warranty": "1 Year Official Brand Warranty (Airlink Pakistan)"
        }
    },
    {
        "id": "infinix-smart-8",
        "slug": "infinix-smart-8",
        "name": "Infinix Smart 8",
        "brand": "Infinix",
        "tagline": "Magic Ring Interactive Display, 5000mAh Battery & 8-Core Performance",
        "basePricePKR": 22499,
        "originalPricePKR": 24999,
        "discountPercent": 10,
        "rating": 4.5,
        "reviewCount": 310,
        "inStock": True,
        "isNew": False,
        "isTrending": False,
        "isBestSeller": True,
        "colors": [
            {"name": "Timber Black", "hex": "#1d1d1f", "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80"},
            {"name": "Shiny Gold", "hex": "#e5d3ab", "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"}
        ],
        "variants": [
            {"id": "is8-3-64", "ram": "3GB", "storage": "64GB", "pricePKR": 22499, "originalPricePKR": 24999, "inStock": True},
            {"id": "is8-4-64", "ram": "4GB", "storage": "64GB", "pricePKR": 24499, "originalPricePKR": 26999, "inStock": True}
        ],
        "keyHighlights": {
            "display": "6.6\" 90Hz Punch-Hole with Magic Ring (500 nits)",
            "processor": "Unisoc T606 Octa-core 1.6 GHz",
            "camera": "13MP Dual AI Camera with Ring Flashlight",
            "battery": "5000 mAh Type-C Powerhouse",
            "charging": "10W Type-C Standard Charging"
        },
        "specs": {
            "screen": "6.6 inches IPS LCD, 90Hz, 500 nits (peak), Interactive Magic Ring notch",
            "refreshRate": "90Hz",
            "displayType": "Punch Hole Sunlight Display",
            "processor": "Unisoc T606 (12 nm) Octa-core 1.6 GHz",
            "chipsetBrand": "Unisoc",
            "mainCamera": "13 MP (f/1.8, 27mm wide, AF) + 0.08 MP (auxiliary lens), Ring-LED flash",
            "selfieCamera": "8 MP, f/2.0, Front Flash",
            "battery": "5000 mAh Li-Po non-removable",
            "charging": "10W wired Type-C",
            "os": "Android 13 (Go edition), XOS 13",
            "network": "4G LTE, Dual Nano-SIM + dedicated microSD slot",
            "security": "Side-mounted fingerprint sensor, Face unlock",
            "weight": "184 g",
            "waterResistance": "Standard everyday durability",
            "ptaStatus": "PTA Approved",
            "warranty": "1 Year Official Carlcare Brand Warranty"
        }
    },
    {
        "id": "apple-iphone-15",
        "slug": "apple-iphone-15",
        "name": "Apple iPhone 15",
        "brand": "Apple",
        "tagline": "Dynamic Island, 48MP Main Camera, Color-Infused Glass & USB-C",
        "basePricePKR": 319999,
        "originalPricePKR": 349999,
        "discountPercent": 9,
        "rating": 4.9,
        "reviewCount": 189,
        "inStock": True,
        "isNew": False,
        "isTrending": True,
        "isBestSeller": True,
        "colors": [
            {"name": "Black", "hex": "#303233", "image": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80"},
            {"name": "Blue", "hex": "#d3dfe8", "image": "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80"}
        ],
        "variants": [
            {"id": "ip15-128", "ram": "6GB", "storage": "128GB", "pricePKR": 319999, "originalPricePKR": 349999, "inStock": True},
            {"id": "ip15-256", "ram": "6GB", "storage": "256GB", "pricePKR": 359999, "originalPricePKR": 389999, "inStock": True}
        ],
        "keyHighlights": {
            "display": "6.1\" Super Retina XDR OLED Dynamic Island (2000 nits)",
            "processor": "A16 Bionic (4nm) 5-core GPU",
            "camera": "48MP Dual Camera with 2x Telephoto Optical Quality + 12MP Ultra-wide",
            "battery": "3349 mAh All-day Battery",
            "charging": "USB-C 20W Fast Charge (50% in 30 mins) + 15W MagSafe"
        },
        "specs": {
            "screen": "6.1 inches Super Retina XDR OLED, HDR10, Dolby Vision, 2000 nits (peak), Ceramic Shield",
            "refreshRate": "60Hz",
            "displayType": "Super Retina XDR OLED Dynamic Island",
            "processor": "Apple A16 Bionic (4 nm) 6-core CPU, 5-core GPU",
            "chipsetBrand": "Apple",
            "mainCamera": "48 MP (f/1.6, 26mm, sensor-shift OIS) + 12 MP (f/2.4, 13mm, 120˚ ultrawide)",
            "selfieCamera": "12 MP, f/1.9, 23mm (wide), PDAF, 4K@60fps Dolby Vision",
            "battery": "3349 mAh Li-Ion non-removable",
            "charging": "Wired PD (50% in 30 min) + 15W MagSafe + 15W Qi2 wireless",
            "os": "iOS 17, upgradable to iOS 18",
            "network": "5G, Nano-SIM and eSIM",
            "security": "Face ID, Crash Detection, Roadside Assistance via satellite",
            "weight": "171 g",
            "waterResistance": "IP68 dust/water resistant (up to 6m for 30 mins)",
            "ptaStatus": "PTA Approved",
            "warranty": "1 Year Official Apple Mercantile Warranty Pakistan"
        }
    },
    {
        "id": "oneplus-12",
        "slug": "oneplus-12-5g",
        "name": "OnePlus 12 5G",
        "brand": "OnePlus",
        "tagline": "Snapdragon 8 Gen 3, 4th Gen Hasselblad Camera & 100W SUPERVOOC",
        "basePricePKR": 239999,
        "originalPricePKR": 259999,
        "discountPercent": 8,
        "rating": 4.9,
        "reviewCount": 87,
        "inStock": True,
        "isNew": False,
        "isTrending": True,
        "isBestSeller": False,
        "colors": [
            {"name": "Flowy Emerald", "hex": "#2e5b4e", "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80"},
            {"name": "Silky Black", "hex": "#222224", "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80"}
        ],
        "variants": [
            {"id": "op12-16-512", "ram": "16GB", "storage": "512GB", "pricePKR": 239999, "originalPricePKR": 259999, "inStock": True}
        ],
        "keyHighlights": {
            "display": "6.82\" 2K 120Hz ProXDR LTPO (4500 nits peak)",
            "processor": "Snapdragon 8 Gen 3 with Dual Cryo-velocity VC Cooling",
            "camera": "50MP Sony LYT-808 OIS + 64MP 3x Periscope OIS + 48MP Ultra-wide (Hasselblad)",
            "battery": "5400 mAh Dual-Cell Massive Battery",
            "charging": "100W SUPERVOOC (100% in 26 min) + 50W AIRVOOC Wireless"
        },
        "specs": {
            "screen": "6.82 inches LTPO AMOLED, 1B colors, 120Hz, Dolby Vision, HDR10+, 4500 nits, Gorilla Glass Victus 2",
            "refreshRate": "1-120Hz LTPO 4.0",
            "displayType": "2K Curved ProXDR Display",
            "processor": "Qualcomm Snapdragon 8 Gen 3 (4 nm) Octa-core 3.3 GHz",
            "chipsetBrand": "Qualcomm",
            "mainCamera": "50 MP (Sony LYT-808, f/1.6, OIS) + 64 MP (Omnivision OV64B periscope 3x, OIS) + 48 MP (Sony IMX581 114˚)",
            "selfieCamera": "32 MP, f/2.4, 21mm (wide), 4K@30fps",
            "battery": "5400 mAh Li-Po non-removable",
            "charging": "100W wired (1-100% in 26 min) + 50W wireless + 10W reverse wireless",
            "os": "Android 14, OxygenOS 14 (4 OS updates)",
            "network": "5G, Dual SIM (Nano-SIM, dual stand-by)",
            "security": "Optical In-display fingerprint, Alert Slider",
            "weight": "220 g",
            "waterResistance": "IP65 water and dust resistance, Aqua Touch",
            "ptaStatus": "PTA Approved",
            "warranty": "1 Year Official Warranty"
        }
    }
]

with open('data/smartphones.json', 'w', encoding='utf-8') as f:
    json.dump(phones, f, indent=2)

print(f"Catalog generated successfully with {len(phones)} smartphones!")
