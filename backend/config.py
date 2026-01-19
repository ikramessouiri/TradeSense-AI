import os

# Cette ligne vérifie si DATABASE_URL existe (sur Railway). 
# Si elle n'existe pas (sur ton PC), elle utilise ton fichier SQLite.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///tradesense_dev.db")