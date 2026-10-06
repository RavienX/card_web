"""All MongoDB reads for CARD_web, against the real PROD_db / SELL_db collections in Atlas.
main.py only exposes these as HTTP endpoints.

PROD_db  (prod_db.products): one document per MPN Mark (B5); fields are the BDB codes (N1, M1, C6 ...).
SELL_db  (prod_db.sell_db) : insert-only history of every search run; one document per listing found.
"""
import os
import re
from datetime import datetime, timezone

from bson import ObjectId

PRODUCTS = os.getenv("PRODUCTS_COLLECTION", "products")
SELL = os.getenv("SELL_COLLECTION", "sell_db")

# A series gets a Subseries level when it has MORE than this many models and its models carry a subseries.
SUBSERIES_MIN_MODELS = int(os.getenv("SUBSERIES_MIN_MODELS", "20"))

# ── The ONLY place that knows PROD_db field codes. Change a mapping here, nothing else moves. ──
F = {
    "scale": "N1", "brand": "N2", "mark": "M1",
    "series": "C6", "subseries": "C7",
    "model": "M8", "version": "M9", "version2": "M10", "version3": "M11",
    "body_style": "M19", "coachbuilder": "M15", "year": "M23", "color": "B10",
    "mpn": "B1", "pid": "B5", "casting": "B8_b",
}
_USED = list(F.values()) + ["_raw_casting_name", "R1", "R3", "R5", "R6"]
_PROJ = {"_id": 0, **{c: 1 for c in _USED}}


def _p(db):
    return db[PRODUCTS]


def _s(db):
    return db[SELL]


def _scale_key(scale):
    try:
        return int(scale.split(":")[1])
    except (IndexError, ValueError):
        return 10**9


def _natural(value):
    s = str(value)
    return (0, int(s), s) if s.isdigit() else (1, 0, s.lower())  # 206 < 250 < 1000 < "F"


def _num(v):
    try:
        return float(str(v).replace(",", ""))
    except (TypeError, ValueError):
        return None


# ───────────────────────── PROD_db ─────────────────────────

def _race(d):
    return " ".join(str(d[c]) for c in ("R3", "R5", "R6") if d.get(c)) or None  # race name, car number, race year


def _norm(d):
    """A PROD_db document -> the field names the UI uses."""
    g = lambda k: d.get(F[k]) or None
    title = d.get(F["casting"]) or d.get("_raw_casting_name") or " ".join(
        str(x) for x in (g("mark"), g("model"), g("version"), g("version2"), g("coachbuilder"), g("year"), g("color")) if x)
    return {"id": d.get(F["pid"]), "mpn": g("mpn"), "title": title,
            "scale": g("scale"), "brand": g("brand"), "mark": g("mark"), "series": g("series"), "subseries": g("subseries"),
            "model": g("model"), "version": g("version"), "version2": g("version2"), "version3": g("version3"),
            "body_style": g("body_style"), "coachbuilder": g("coachbuilder"), "race_details": _race(d),
            "year_label": str(g("year")) if g("year") else None, "color": g("color")}


def scales_brands(db):
    """Level 1: [{scale, brands:[{brand, count}]}], scales ordered 1:18 -> 1:43 ..."""
    rows = _p(db).aggregate([
        {"$match": {F["scale"]: {"$ne": None}, F["brand"]: {"$ne": None}}},
        {"$group": {"_id": {"scale": "$" + F["scale"], "brand": "$" + F["brand"]}, "count": {"$sum": 1}}},
    ])
    scales = {}
    for r in rows:
        scales.setdefault(r["_id"]["scale"], []).append({"brand": r["_id"]["brand"], "count": r["count"]})
    return [{"scale": s, "brands": sorted(b, key=lambda x: x["brand"])}
            for s, b in sorted(scales.items(), key=lambda kv: _scale_key(kv[0]))]


def marks(db, scale, brand):
    """Level 2: marks (Ferrari, Alfa Romeo ...) of a scale + brand."""
    rows = _p(db).aggregate([
        {"$match": {F["scale"]: scale, F["brand"]: brand, F["mark"]: {"$ne": None}}},
        {"$group": {"_id": "$" + F["mark"], "models": {"$sum": 1}, "series": {"$addToSet": "$" + F["series"]}}},
        {"$project": {"_id": 0, "mark": "$_id", "models": 1, "series": {"$size": "$series"}}},
    ])
    return sorted(rows, key=lambda r: r["mark"].lower())


def series(db, scale, brand, mark):
    """Level 3: series of a mark. has_subseries tells the UI to open the Subseries card before the models."""
    rows = _p(db).aggregate([
        {"$match": {F["scale"]: scale, F["brand"]: brand, F["mark"]: mark, F["series"]: {"$ne": None}}},
        {"$group": {"_id": "$" + F["series"], "models": {"$sum": 1}, "subs": {"$addToSet": "$" + F["subseries"]}}},
    ])
    out = [{"series": r["_id"], "models": r["models"],
            "has_subseries": r["models"] > SUBSERIES_MIN_MODELS and any(r["subs"])} for r in rows]
    return sorted(out, key=lambda r: _natural(r["series"]))


def _uses_subseries(db, scale, brand, mark, series_name):
    docs = _p(db).find({F["scale"]: scale, F["brand"]: brand, F["mark"]: mark, F["series"]: series_name},
                       {"_id": 0, F["subseries"]: 1})
    subs = [d.get(F["subseries"]) for d in docs]
    return len(subs) > SUBSERIES_MIN_MODELS and any(subs)


def subseries(db, scale, brand, mark, series_name):
    """Optional level (C7): subseries of a big series. [] when the series doesn't use the level."""
    if not _uses_subseries(db, scale, brand, mark, series_name):
        return []
    rows = _p(db).aggregate([
        {"$match": {F["scale"]: scale, F["brand"]: brand, F["mark"]: mark, F["series"]: series_name,
                    F["subseries"]: {"$ne": None}}},
        {"$group": {"_id": "$" + F["subseries"], "models": {"$sum": 1}}},
        {"$project": {"_id": 0, "subseries": "$_id", "models": 1}},
    ])
    return sorted(rows, key=lambda r: _natural(r["subseries"]))


def models(db, scale, brand, mark, series_name, subseries_name=None):
    """C20: model cards / list rows of a series (or of one subseries), each with its GO / STOCK OUT ... status."""
    flt = {F["scale"]: scale, F["brand"]: brand, F["mark"]: mark, F["series"]: series_name}
    if subseries_name:
        flt[F["subseries"]] = subseries_name
    docs = list(_p(db).find(flt, _PROJ).sort([(F["year"], 1), (F["model"], 1), (F["mpn"], 1)]))
    avail = _availability(db, {d.get(F["mpn"]) for d in docs})
    out = []
    for d in docs:
        m = _norm(d)
        m["status"] = avail.get(m["mpn"], "N/A")
        out.append(m)
    return out


def _sections(d, p):
    """Fact sheet as generic [{title, rows}] so the UI needs no product-specific layout."""
    secs = [
        {"title": "Model collection", "rows": [["Brand", p["brand"]], ["Scale", p["scale"]],
                                                ["Series", p["series"]], ["Subseries", p["subseries"]]]},
        {"title": "Brand details", "rows": [["MPN", p["mpn"]], ["MPN Mark", d.get(F["pid"])],
                                             ["Casting name", d.get(F["casting"])]]},
        {"title": "Mark details", "rows": [["Mark", p["mark"]], ["Model", p["model"]], ["Version", p["version"]],
                                           ["Version 2", p["version2"]], ["Version 3", p["version3"]],
                                           ["Body style", p["body_style"]], ["Coach builder", p["coachbuilder"]],
                                           ["Car year", p["year_label"]], ["Color", p["color"]]]},
    ]
    race = [["Race type", d.get("R1")], ["Race name", d.get("R3")], ["Car number", d.get("R5")], ["Race year", d.get("R6")]]
    if any(v for _, v in race):
        secs.append({"title": "Race details", "rows": race})
    return secs


# ───────────────────────── SELL_db ─────────────────────────
_TODAY = {"$regex": "^today$", "$options": "i"}  # PR1 = the run's own search ("TODAY"); older labels are history


def _current(db, mpns):
    """{B1: [listing docs]}: the Approved listings of each product's LATEST search run.
    SELL_db keeps every run, so older runs are history (used for trending), never shown as current."""
    mpns = [m for m in mpns if m]
    if not mpns:
        return {}
    latest = {}
    for d in _s(db).find({"B1": {"$in": mpns}, "PR1": _TODAY}, {"B1": 1, "_search_run_id": 1, "_search_run_timestamp": 1}):
        ts = d.get("_search_run_timestamp") or ""
        if d["B1"] not in latest or ts > latest[d["B1"]][0]:
            latest[d["B1"]] = (ts, d.get("_search_run_id"))
    if not latest:
        return {}
    rids = list({rid for _, rid in latest.values()})
    out = {}
    for d in _s(db).find({"B1": {"$in": list(latest)}, "_status": "Approved", "PR1": _TODAY, "_search_run_id": {"$in": rids}}):
        if d.get("_search_run_id") == latest[d["B1"]][1]:
            out.setdefault(d["B1"], []).append(d)
    return out


_RANK = ["GO", "PRE-ORDER", "STOCK OUT", "ENDED", "N/A"]
_CARD_STATUS = {"ACTIVE": "GO", "PRE-ORDER": "PRE-ORDER", "STOCK OUT": "STOCK OUT", "ENDED": "ENDED"}


def _availability(db, mpns):
    """{B1: GO | PRE-ORDER | STOCK OUT | ENDED | N/A} for the model list."""
    out = {}
    for b1, docs in _current(db, mpns).items():
        got = {_CARD_STATUS.get((d.get("PR3") or "").upper(), "N/A") for d in docs}
        out[b1] = min(got, key=_RANK.index)
    return out


def _returns(v):
    m = re.match(r"^\s*(\d+)\s*calendar_day", str(v or ""))
    return f"{m.group(1)} days" if m else (v or None)


def _seller_out(d):
    live = (d.get("PR3") or "").upper() == "ACTIVE"
    return {"id": str(d["_id"]), "name": d.get("SC3"), "shipping": d.get("SC4") or None, "channel": d.get("SC5"),
            "condition": d.get("SC6"), "returns": _returns(d.get("SC8")), "price_label": d.get("PR4"),
            "price_usd": _num(d.get("PR5")), "status": "available" if live else "unavailable",
            "status_label": d.get("PR3")}


def _product_mpn(db, product_id):
    d = _p(db).find_one({F["pid"]: product_id}, {"_id": 0, F["mpn"]: 1})
    return d.get(F["mpn"]) if d else None


def sellers(db, product_id):
    """SC3 · Sellers (SELL_db): the current Approved listings. Available first, cheapest first."""
    b1 = _product_mpn(db, product_id)
    rows = [_seller_out(d) for d in _current(db, [b1]).get(b1, [])]
    rows.sort(key=lambda x: (x["status"] != "available", x["price_usd"] is None, x["price_usd"] or 0))
    return rows


def _trending(db, b1):
    """Average US$ price per search date, from the full SELL_db history. [] unless there are 2+ dates."""
    by_date = {}
    for d in _s(db).find({"B1": b1, "_status": "Approved", "PR3": "ACTIVE"}, {"PR2": 1, "PR5": 1}):
        if _num(d.get("PR5")) is not None and d.get("PR2"):
            by_date.setdefault(str(d["PR2"]), []).append(_num(d["PR5"]))
    pts = [(f"20{k[:2]}-{k[2:4]}-{k[4:6]}" if re.fullmatch(r"\d{6}", k) else k, round(sum(v) / len(v), 2))
           for k, v in sorted(by_date.items(), reverse=True)]
    return [list(p) for p in pts[:6]] if len(pts) >= 2 else []


def listing(db, listing_id):
    """One Approved listing, for the "Get it" redirect. None if unknown."""
    try:
        return _s(db).find_one({"_id": ObjectId(listing_id), "_status": "Approved"})
    except Exception:
        return None


def product(db, product_id):
    """One model with fact sheet, price summary, trending and breadcrumb trail; None if unknown."""
    d = _p(db).find_one({F["pid"]: product_id}, _PROJ)
    if not d:
        return None
    p = _norm(d)
    live = [s for s in sellers(db, product_id) if s["status"] == "available"]
    usd = [s["price_usd"] for s in live if s["price_usd"] is not None]
    p["prices"] = {"sellers": len({s["name"] for s in live}), "min": min(usd, default=None),
                   "avg": round(sum(usd) / len(usd), 2) if usd else None, "max": max(usd, default=None)}
    p["trending"] = _trending(db, p["mpn"])
    p["sections"] = _sections(d, p)
    sub = p["subseries"] if _uses_subseries(db, p["scale"], p["brand"], p["mark"], p["series"]) else None
    p["trail"] = {"scale": p["scale"], "brand": p["brand"], "mark": p["mark"], "series": p["series"],
                  "subseries": sub, "model": p["title"]}
    return p


def click_doc(l):
    """What we remember about a "Get it" click (SC7 = Seller Selected)."""
    return {"listing_id": str(l["_id"]), "B1": l.get("B1"), "seller": l.get("SC3"), "channel": l.get("SC5"),
            "price_usd": _num(l.get("PR5")), "search_run_id": l.get("_search_run_id"),
            "clicked_at": datetime.now(timezone.utc)}
