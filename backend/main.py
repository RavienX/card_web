import logging
import os
from pathlib import Path
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pymongo import MongoClient
from pymongo.errors import PyMongoError

import card_web_queries as q

log = logging.getLogger("card_web")

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")  # the Atlas connection string (read-only user)
DB_NAME = os.getenv("DB_NAME", "prod_db")                         # database that holds products + sell_db
CLICKS_DB = os.getenv("CLICKS_DB", "card_web")                    # where "Get it" clicks are written (never prod_db)

client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=8000)
db = client[DB_NAME]


@asynccontextmanager
async def lifespan(_):
    try:
        client.admin.command("ping")
        log.warning("MongoDB connected: database %s, %s products", DB_NAME, db[q.PRODUCTS].estimated_document_count())
    except PyMongoError as e:
        log.error("MongoDB NOT reachable: %s", type(e).__name__)
    yield


app = FastAPI(title="CARD_web API", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.exception_handler(PyMongoError)
async def mongo_down(_: Request, __: PyMongoError):
    return JSONResponse({"detail": "Database unavailable"}, status_code=503)


@app.get("/api/health")
def health():
    return {"ok": True, "database": DB_NAME, "products": db[q.PRODUCTS].estimated_document_count(),
            "sell_db": db[q.SELL].estimated_document_count()}


@app.get("/api/scales")
def scales():
    return q.scales_brands(db)


@app.get("/api/marks")
def marks(scale: str, brand: str):
    return q.marks(db, scale, brand)


@app.get("/api/series")
def series(scale: str, brand: str, mark: str):
    return q.series(db, scale, brand, mark)


@app.get("/api/subseries")
def subseries(scale: str, brand: str, mark: str, series: str):
    return q.subseries(db, scale, brand, mark, series)


@app.get("/api/models")
def models(scale: str, brand: str, mark: str, series: str, subseries: Optional[str] = None):
    return q.models(db, scale, brand, mark, series, subseries)


@app.get("/api/products/{product_id}")
def product(product_id: str):
    p = q.product(db, product_id)
    if not p:
        raise HTTPException(404, "Not found")
    return p


@app.get("/api/products/{product_id}/sellers")
def sellers(product_id: str):
    return q.sellers(db, product_id)


@app.get("/api/go/{listing_id}")
def go(listing_id: str):
    """"Get it": remember which seller was selected (SC7), then send the prospector straight to the seller."""
    l = q.listing(db, listing_id)
    url = (l or {}).get("SC1") or ""
    if not url.startswith(("http://", "https://")):
        raise HTTPException(404, "Not found")
    try:
        client[CLICKS_DB]["clicks"].insert_one(q.click_doc(l))
    except Exception as e:  # a failed click log must never stop the redirect
        log.warning("click not recorded: %s", type(e).__name__)
    return RedirectResponse(url, status_code=302)


# ── One service serves the website too (the built React app in ../dist), so the site and /api share one URL ──
DIST = Path(__file__).resolve().parent.parent / "dist"
if (DIST / "index.html").exists():
    app.mount("/assets", StaticFiles(directory=DIST / "assets"), name="assets")

    @app.get("/{path:path}", include_in_schema=False)
    def website(path: str):
        if path.startswith("api/"):
            raise HTTPException(404, "Not found")
        f = (DIST / path).resolve()
        if path and f.is_file() and DIST.resolve() in f.parents:  # favicon.svg, icons.svg ...
            return FileResponse(f)
        return FileResponse(DIST / "index.html")  # every card URL opens the React app
