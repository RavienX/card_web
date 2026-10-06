"""Run ONCE with a user that can create indexes (not the read-only website user):
    $env:MONGO_URL = "<admin connection string>"
    python create_indexes.py
Makes the card lookups fast on the full PROD_db / SELL_db history."""
import os

from pymongo import MongoClient

db = MongoClient(os.environ["MONGO_URL"])[os.getenv("DB_NAME", "prod_db")]
db.products.create_index([("N1", 1), ("N2", 1), ("M1", 1), ("C6", 1), ("C7", 1)])
db.products.create_index("B5", unique=True)
db.products.create_index("B1")
db.sell_db.create_index([("B1", 1), ("PR1", 1), ("_search_run_timestamp", -1)])
print("indexes ready")
