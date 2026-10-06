# CARD_web

React (Vite) + FastAPI + MongoDB Atlas. One shared card design (`src/components/Card.jsx`), the cards on top of it:

| Card | Route | Component | API |
|---|---|---|---|
| Scale + Brand | `/` | `ScaleBrandSelector` | `GET /api/scales` |
| Marks | `/browse/:scale/:brand` | `MarkList` | `GET /api/marks` |
| Series | `/browse/:scale/:brand/:mark` | `SeriesList` | `GET /api/series` |
| Subseries (only when the data has it and the series has more than 20 models) | `/browse/:scale/:brand/:mark/:series` | `SubseriesList` | `GET /api/subseries` |
| Models (cards or list) | `/models/:scale/:brand/:mark/:series[/:subseries]` | `ModelGrid` / `ModelCard` | `GET /api/models` |
| Model fact sheet | `/product/:id` | `ProductDetail` | `GET /api/products/:id` |
| **SC3 · Sellers** (main card, from SELL_db) | `/product/:id/sellers` | `SellersCard` / `SellersTable` | `GET /api/products/:id/sellers` |

"Get it" (SC3) opens `GET /api/go/:listingId`: the API records the selected seller (SC7) and redirects straight to the
seller's page. Every card has a path heading and a `BACK to ...` link.

## Three ways to run it

### 1. Demo, no backend (GitHub Pages)
The API answers for one mark (Ferrari) are saved in `src/data/static.json`; the site reads them instead of calling an API.
```powershell
npm install
npm run dev:demo          # try it locally -> http://localhost:5173
npm run build:pages       # what GitHub Actions builds (.github/workflows/pages.yml)
```
Links look like `#/browse/...` (HashRouter), so reloading any card works on GitHub Pages. "Get it" goes straight to the seller.
Refresh the data from Atlas: `pip install mongomock`, set `MONGO_URL` (read-only user), `python backend/export_static.py Ferrari`,
then commit `src/data/static.json`.

### 2. Live, with the API and MongoDB Atlas
```powershell
cd backend
pip install -r requirements.txt
$env:MONGO_URL = "<read-only Atlas connection string>"
python -m uvicorn main:app --reload     # check: http://localhost:8000/api/health

# second terminal, in the project folder
npm install
npm run dev                              # http://localhost:5173 (vite proxies /api to :8000)
```
Optional env: `DB_NAME` (default `prod_db`), `CLICKS_DB` (default `card_web`, where "Get it" clicks are saved; needs a user with write on it),
`SUBSERIES_MIN_MODELS` (default 20). Run `backend/create_indexes.py` once with an admin user to keep lookups fast.

### 3. One service for website + API (Docker, e.g. Render)
`Dockerfile` builds the website and FastAPI serves it together with `/api`. Set `MONGO_URL` in the host's dashboard, never in a file.

## Data (MongoDB Atlas, db `prod_db`)
| Collection | What | Used for |
|---|---|---|
| `products` | PROD_db, one doc per MPN Mark (`B5`) | every card; the URL id of a model is its `B5` |
| `sell_db` | SELL_db, insert-only history of every search run | SC3 sellers, model status (GO / N/A ...), trending prices |

The only place that knows the field codes is `F` in `backend/card_web_queries.py` (scale `N1`, brand `N2`, mark `M1`,
series `C6`, subseries `C7`, model `M8`, version `M9` / `M10` / `M11`, body style `M19`, coach builder `M15`,
year `M23`, color `B10`, MPN `B1`, title = casting name `B8_b`).

SELL_db rules: only `_status = "Approved"` listings from the LATEST search run of each MPN (older runs are history and only
feed the trending prices). `PR3 = ACTIVE` means available ("Get it"); anything else shows its own status.

Never put passwords or connection strings in this repository.
