"""Mock data for the CARD_web prototype.

Real rows: Matrix 1:43 Ferrari 212 (from the "Specific" workbook) and Aston Martin
(from the "EXAMPLE" workbook, incl. the 7 sellers of the V8 Zagato red).
Placeholders: the single 1:18 / BBR row, USD conversions of € prices, trending prices.
Replace with an import from PROD_db / SELL_db.
"""

def _title(*parts):
    return " ".join(str(p) for p in parts if p)

# mpn, model, version, body_style, edition, coachbuilder, year, color, status
FERRARI_212 = [
    ("MX40604-012", "212", "Inter", "Coupe", None, "Vignale", 1951, "Red", "GO"),
    ("MX50604-152", "212", "Inter", "Coupe", "Juan Peron", "Ghia", 1952, "Red/Black", "GO"),
    ("MX50604-151", "212", "Inter", "Coupe", "Juan Peron", "Ghia", 1952, "Yellow/Black", "GO"),
    ("MXL0604-072", "212", "Inter", "Coupe", None, "Vignale", 1952, "Red", "GO"),
    ("MX40604-011", "212", "Inter", "Coupe", "Bumblebee", None, 1952, "Yellow/Black", "GO"),
    ("MX50604-031", "212/225", "Inter", "Barchetta", "Superleggera", "Touring", 1952, "Black", "STOCK OUT"),
    ("MX50604-172", "212", "Inter", "Coupe", None, "Pininfarina", 1953, "Red", "GO"),
    ("MX50604-173", "212", "Inter", "Coupe", None, "Pininfarina", 1953, "White/Light Blue", "ENDED"),
    ("MX50604-171", "212", "Inter", "Coupe", "HRH Prince Bernard", "Pininfarina", 1953, "Black", "GO"),
    ("MXL0604-012", "212", "Inter", "Coupe", None, "Vignale", 1953, "Black/Green Metallic", "PRE-ORDER"),
    ("MX40604-061", "212", "Inter", "Coupe", None, "Vignale", 1953, "Black/Green", "GO"),
    ("MXL0604-011", "212", "Inter", "Coupe", None, "Vignale", 1953, "Red", "N/A"),
    ("MX40604-062", "212", "Inter", "Coupe", None, "Vignale", 1953, "Red/Black", "GO"),
]

# title, model, body_style, color, year, year_label, mpn
ASTON = [
    ("Aston Martin DB2-4 FHC Notchback red/cream 1955", "DB2-4", "FHC Notchback", "Red/Cream", 1955, "1955", None),
    ("Aston Martin Lagonda S2 red metallic", "Lagonda S2", None, "Red Metallic", None, None, None),
    ("Aston Martin V8 Zagato red 1986 - 1990", "V8 Zagato", "Coupe", "Red", 1986, "1986 - 1990", "MX40108-101"),
    ("Aston Martin V8 Zagato metallic green 1986 - 1990", "V8 Zagato", "Coupe", "Metallic Green", 1986, "1986 - 1990", None),
    ('Aston Martin DBS "The Sotheby Special" by Ogle white 1972', "DBS", None, "White", 1972, "1972", None),
    ("Aston Martin 15-98 2-4 passenger grey 1938", "15-98", "2-4 passenger", "Grey", 1938, "1938", None),
    ("Aston Martin 15-98 2-4 passenger red 1938", "15-98", "2-4 passenger", "Red", 1938, "1938", None),
    ("Aston Martin 15-98 2-4 passenger black 1938", "15-98", "2-4 passenger", "Black", 1938, "1938", None),
]

HERO_TITLE = "Aston Martin V8 Zagato red 1986 - 1990"

# name, country, shipping, channel, condition, price label, usd, status, url
SELLERS = [
    ("Bimax-italia", "Italy", "Worldwide", "Ebay", "New", "US $91.77", 91.77, "available", "https://www.ebay.com/itm/316187721838"),
    ("CCRSHOP", "China", "Worldwide", "Ebay", "New", "US $90.00", 90.00, "available", "https://www.ebay.com/itm/187016121313"),
    ("Art-toys", "UK", "n/a", "Store", "New", "97.60", 97.60, "sold_out", "https://www.art-toys.co/aston-martin-v8-zagatored1986-1990.html"),
    ("Miniatures-minichamps", "Belgium", "n/a", "Store", "New", "n/a", None, "sold_out", "https://www.miniatures-minichamps.com"),
    ("Miniboutik", "Belgium", "n/a", "Store", "New", "€100.89", 108.96, "available", "https://www.miniboutik.com/en/available/5715-matrix-aston-martin-v8-zagato-1986-1990.html"),
    ("Modelcarworld", "Germany", "Worldwide, some excludes", "Store", "New", "€109.95", 118.75, "available", "https://www.modelcarworld.com/en/prod/266104/matrix-aston-martin-v8-zagato-red-1986-1-43"),
    ("1999", "Japan", "n/a", "Store", "New", "177.47 USD", 177.47, "available", "https://www.1999.co.jp/eng/11033529"),
]
SELLER_KEYS = ["name", "country", "shipping", "channel", "condition", "price_label", "price_usd", "status", "url"]

TRENDING = [["Today", 118.4], ["1-week ago", 118.0], ["1-month ago", 116.9],
            ["6-months ago", 112.5], ["1-year ago", 108.2], ["2-years ago", 101.7]]


def build_products():
    out = []

    def add(**f):
        f.setdefault("subseries", None)
        f.setdefault("edition", None)
        f.setdefault("coachbuilder", None)
        f.setdefault("version", None)
        f.setdefault("status", None)
        f.setdefault("mpn", None)
        f["_id"] = f"p{len(out) + 1:03d}"
        out.append(f)

    for mpn, model, ver, body, edition, coach, year, color, status in FERRARI_212:
        add(scale="1:43", brand="MATRIX", mark="FERRARI", series="SERIES 200", subseries="212",
            model=model, version=ver, body_style=body, edition=edition, coachbuilder=coach,
            year=year, year_label=str(year), color=color, mpn=mpn, status=status,
            title=_title("Ferrari", model, ver, body, edition, coach, year, color))

    for title, model, body, color, year, label, mpn in ASTON:
        add(scale="1:43", brand="MATRIX", mark="ASTON MARTIN", series="40000 SERIES EXCLUSIVE CARS",
            model=model, body_style=body, color=color, year=year, year_label=label, mpn=mpn, title=title,
            **({"trending": TRENDING} if title == HERO_TITLE else {}))

    # placeholder so the 1:18 scale exists in the selector
    add(scale="1:18", brand="BBR", mark="FERRARI", series="SERIES 200", subseries="212",
        model="212", version="Inter", body_style="Coupe", coachbuilder="Vignale", year=1951,
        year_label="1951", color="Red", title="Ferrari 212 Inter Coupe Vignale 1951 Red")
    return out


def seed(db):
    if db.products.count_documents({}):
        return
    products = build_products()
    db.products.insert_many(products)
    hero = next(p["_id"] for p in products if p["title"] == HERO_TITLE)
    db.sellers.insert_many([{"product_id": hero, **dict(zip(SELLER_KEYS, s))} for s in SELLERS])
    db.products.create_index([("scale", 1), ("brand", 1), ("mark", 1), ("series", 1)])
    db.sellers.create_index("product_id")
