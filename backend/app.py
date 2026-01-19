"""Flask application entrypoint.

Exposes API routes including market price retrieval.
"""

from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from sqlalchemy import create_engine

# Support both package and script imports
try:
    from .market_data import get_international_price, get_morocco_price_iam
    from .routes import api as api_blueprint
    from .models import Base
    from .config import SQLALCHEMY_DATABASE_URL
except ImportError:
    from market_data import get_international_price, get_morocco_price_iam
    from routes import api as api_blueprint
    from models import Base
    from config import SQLALCHEMY_DATABASE_URL


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Ensure database tables exist on startup (dev convenience)
_connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}
_engine = create_engine(SQLALCHEMY_DATABASE_URL, future=True, connect_args=_connect_args)
Base.metadata.create_all(bind=_engine)

# Register API blueprint
app.register_blueprint(api_blueprint)

@app.before_request
def _handle_options():
    if request.method == "OPTIONS":
        resp = make_response("", 204)
        resp.headers["Access-Control-Allow-Origin"] = "*"
        resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        resp.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        return resp

@app.after_request
def _add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

@app.route("/api/price/<ticker>", methods=["GET"])
def api_get_price(ticker: str):
    """Return current price for given ticker in JSON.

    - If `ticker` equals 'IAM' (case-insensitive), uses Morocco scraper.
    - Otherwise, uses yfinance for international tickers.
    """
    try:
        if ticker.upper() == "IAM":
            price = get_morocco_price_iam()
        else:
            price = get_international_price(ticker)
        return jsonify({"ticker": ticker, "price": price})
    except Exception as e:
        return jsonify({"ticker": ticker, "error": str(e)}), 502


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
