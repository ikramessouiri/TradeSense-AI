"""Market data providers for TradeSense AI.

Functions:
- get_international_price(ticker): fetch price via yfinance (e.g., AAPL, BTC-USD)
- get_morocco_price_iam(): scrape current price for Maroc Telecom (IAM)
"""

from __future__ import annotations

import re
from typing import Optional


def _parse_float(text: str) -> Optional[float]:
    """Extract the first float-looking number from text, normalizing separators."""
    if not text:
        return None
    # Find number patterns like 12,345.67 or 12.345,67 or 123.45
    m = re.search(r"(\d{1,3}(?:[\.,]\d{3})*(?:[\.,]\d+)|\d+(?:[\.,]\d+)?)", text)
    if not m:
        return None
    num = m.group(1)
    # Normalize: remove thousands separators and use dot as decimal
    # Heuristic: if both comma and dot present, assume comma thousands, dot decimal
    if "," in num and "." in num:
        num = num.replace(",", "")
    else:
        # If only comma present, treat as decimal comma
        num = num.replace(",", ".")
    try:
        return float(num)
    except ValueError:
        return None


def get_international_price(ticker: str) -> float:
    """Return latest price for an international ticker via yfinance.

    Attempts fast_info then falls back to recent intraday close.
    """
    import yfinance as yf

    tk = yf.Ticker(ticker)
    price: Optional[float] = None

    # Prefer fast_info when available
    fast_info = getattr(tk, "fast_info", None)
    if fast_info:
        price = fast_info.get("last_price") or fast_info.get("last_trade_price")
        if price is not None:
            price = float(price)

    # Fallback: download recent data
    if price is None:
        df = yf.download(tickers=ticker, period="1d", interval="1m")
        if hasattr(df, "empty") and not df.empty:
            closes = df["Close"].dropna()
            if not closes.empty:
                price = float(closes.iloc[-1])

    if price is None:
        raise RuntimeError(f"Impossible de récupérer le prix pour {ticker}")
    return price


def get_morocco_price_iam(timeout: int = 10) -> float:
    """Scrape the current price for Maroc Telecom (IAM) from public sites.

    Tries multiple sources and selectors; returns a float on success.
    """
    import requests
    from bs4 import BeautifulSoup

    # Candidate sources (order of preference)
    sources = [
        # Richbourse value page for Itissalat Al-Maghrib (IAM)
        {
            "url": "https://www.richbourse.com/valeurs/itissalat-al-maghrib-iam",
            "selectors": [
                ".price", ".instrument-price", ".last", ".current", "[data-field='price']",
            ],
        },
        # Boursenews value page (structure may vary)
        {
            "url": "https://boursenews.ma/marches/valeurs/IAM",
            "selectors": [
                ".price", ".valeur__price", ".cours", "#price",
            ],
        },
        # LeMatin market area (search might be indirect; fallback by regex scanning)
        {
            "url": "https://lematin.ma/bourse",
            "selectors": [
                ".price", ".cours", "#price",
            ],
        },
    ]

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        " AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }

    last_error = None
    for src in sources:
        try:
            resp = requests.get(src["url"], headers=headers, timeout=timeout)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")

            # Try explicit selectors first
            for sel in src["selectors"]:
                el = soup.select_one(sel)
                if el:
                    price = _parse_float(el.get_text(strip=True))
                    if price is not None:
                        return price

            # Fallback: look for text blocks mentioning IAM and containing a number
            texts = soup.find_all(string=re.compile(r"IAM|Itissalat", re.IGNORECASE))
            for t in texts:
                price = _parse_float(t)
                if price is not None:
                    return price

            # General numeric scan with nearby keywords
            all_text = soup.get_text(" ", strip=True)
            for m in re.finditer(r"(?i)(cours|dernier|prix).*?(\d+[\.,]\d+)", all_text):
                price = _parse_float(m.group(0))
                if price is not None:
                    return price
        except Exception as e:  # capture and continue with next source
            last_error = e
            continue

    raise RuntimeError(
        f"Impossible de scraper le prix IAM depuis les sources publiques. Dernière erreur: {last_error}"
    )