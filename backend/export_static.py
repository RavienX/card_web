"""Export the API answers for ONE mark into src/data/static.json, so the website can run with NO backend
(GitHub Pages demo). It runs the same queries as the API, so the demo shows exactly what the API would.

    pip install mongomock
    $env:MONGO_URL = "<read-only Atlas connection string>"
    python export_static.py Ferrari

Re-run it any time to refresh the demo data, then commit src/data/static.json.
"""
import json
import os
import sys
from pathlib import Path

import mongomock
from pymongo import MongoClient

import card_web_queries as q

OUT = Path(__file__).resolve().parent.parent / "src" / "data" / "static.json"


def key(path, params=None):
    """Same canonical key as canon() in src/api.js: path + sorted [name, value] pairs as compact JSON."""
    pairs = sorted((params or {}).items())
    return path + ("?" + json.dumps([[k, v] for k, v in pairs], separators=(",", ":"), ensure_ascii=False) if pairs else "")


def export(src_db, mark, out_path=OUT):
    # Work on an in-memory copy that holds only this mark, so every count and list is for that mark alone.
    db = mongomock.MongoClient()["prod_db"]
    docs = list(src_db[q.PRODUCTS].find({q.F["mark"]: mark}))
    if not docs:
        raise SystemExit(f"No products with mark '{mark}'")
    db[q.PRODUCTS].insert_many(docs)
    mpns = list({d[q.F["mpn"]] for d in docs if d.get(q.F["mpn"])})
    sells = list(src_db[q.SELL].find({"B1": {"$in": mpns}}))
    if sells:
        db[q.SELL].insert_many(sells)

    data = {}
    put = lambda path, params, value: data.__setitem__(key(path, params), value)

    scales = q.scales_brands(db)
    put("/api/scales", {}, scales)
    for sc in scales:
        for br in sc["brands"]:
            s, b = sc["scale"], br["brand"]
            mk = q.marks(db, s, b)
            put("/api/marks", {"scale": s, "brand": b}, mk)
            for m in mk:
                se_rows = q.series(db, s, b, m["mark"])
                put("/api/series", {"scale": s, "brand": b, "mark": m["mark"]}, se_rows)
                for se in se_rows:
                    base = {"scale": s, "brand": b, "mark": m["mark"], "series": se["series"]}
                    subs = q.subseries(db, s, b, m["mark"], se["series"])
                    put("/api/subseries", base, subs)
                    put("/api/models", base, q.models(db, s, b, m["mark"], se["series"]))
                    for sub in subs:
                        put("/api/models", {**base, "subseries": sub["subseries"]},
                            q.models(db, s, b, m["mark"], se["series"], sub["subseries"]))

    links = {}  # the demo has no /api/go redirect, so each seller keeps its own link
    for d in db[q.PRODUCTS].find({}, {"_id": 0, q.F["pid"]: 1, q.F["mpn"]: 1}):
        pid, b1 = d[q.F["pid"]], d[q.F["mpn"]]
        if b1 not in links:
            links[b1] = {str(x["_id"]): x.get("SC1") for x in q._current(db, [b1]).get(b1, [])}
        put(f"/api/products/{pid}", {}, q.product(db, pid))
        sellers = q.sellers(db, pid)
        for x in sellers:
            x["url"] = links[b1].get(x["id"])
        put(f"/api/products/{pid}/sellers", {}, sellers)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    return data


if __name__ == "__main__":
    mark = sys.argv[1] if len(sys.argv) > 1 else "Ferrari"
    src = MongoClient(os.environ["MONGO_URL"], serverSelectionTimeoutMS=8000)[os.getenv("DB_NAME", "prod_db")]
    data = export(src, mark)
    print(f"{len(data)} answers saved to {OUT}")
