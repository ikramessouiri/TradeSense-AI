"""API routes for TradeSense AI.

Endpoints:
- POST /api/buy-challenge
- GET /api/leaderboard
- POST /api/trade
"""

from __future__ import annotations

import datetime as dt
from typing import Dict

from flask import Blueprint, jsonify, request
import os
from sqlalchemy import func, desc
from sqlalchemy.exc import IntegrityError
import traceback
from werkzeug.security import generate_password_hash, check_password_hash

# Flexible imports package/script
try:
    from .models import (
        User,
        UserChallenge,
        Trade,
        ChallengeStatusEnum,
        TradeTypeEnum,
        PlatformSetting,
    )
    from .services import SessionLocal, check_challenge_status
except ImportError:
    from models import (
        User,
        UserChallenge,
        Trade,
        ChallengeStatusEnum,
        TradeTypeEnum,
        PlatformSetting,
    )
    from services import SessionLocal, check_challenge_status


api = Blueprint("api", __name__, url_prefix="/api")

@api.route("/login", methods=["POST"])
def login():
  print(request.json)
  data = request.get_json(force=True) or {}
  email = str(data.get("email") or "")
  password = str(data.get("password") or "")
  if not email or not password:
    return jsonify({"error": "email et mot de passe requis"}), 400
  session = SessionLocal()
  try:
    user = session.query(User).filter(User.email == email).first()
    if not user:
      return jsonify({"error": "Utilisateur introuvable"}), 401
    if not check_password_hash(user.password_hash, password):
      return jsonify({"error": "Email ou mot de passe incorrect"}), 401
    return jsonify({"status": "ok", "user_id": user.id, "role": getattr(user.role, "value", str(user.role))})
  finally:
    session.close()
@api.route("/chat", methods=["POST"])
def chat():
  data = request.get_json(force=True) or {}
  text = str(data.get("message") or "").strip()
  if not text:
    return jsonify({"error": "message requis"}), 400
  sys_prompt = "Tu es TradeSense AI, un expert en trading. Réponds de manière claire, professionnelle et utile."
  try:
    openai_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("OPENAI_APIKEY")
    groq_key = os.environ.get("GROQ_API_KEY") or os.environ.get("GROQ_APIKEY")
    if openai_key:
      try:
        from openai import OpenAI
        client = OpenAI(api_key=openai_key)
        resp = client.chat.completions.create(
          model="gpt-4o-mini",
          messages=[
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": text},
          ],
          temperature=0.3,
        )
        reply = (resp.choices[0].message.content or "").strip()
        if not reply:
          reply = "Je suis TradeSense AI, j'analyse actuellement les graphiques pour vous..."
        return jsonify({"reply": reply})
      except Exception as e:
        pass
    if groq_key:
      try:
        from groq import Groq
        client = Groq(api_key=groq_key)
        resp = client.chat.completions.create(
          model="llama-3.1-8b-instant",
          messages=[
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": text},
          ],
          temperature=0.3,
        )
        reply = (resp.choices[0].message.content or "").strip()
        if not reply:
          reply = "Je suis TradeSense AI, j'analyse actuellement les graphiques pour vous..."
        return jsonify({"reply": reply})
      except Exception as e:
        pass
    return jsonify({"reply": "Je suis TradeSense AI, j'analyse actuellement les graphiques pour vous..."})
  except Exception as e:
    return jsonify({"error": str(e)}), 502

@api.route("/platform-settings", methods=["GET", "POST"])
def platform_settings():
  session = SessionLocal()
  try:
    if request.method == "GET":
      row = session.query(PlatformSetting).order_by(PlatformSetting.id.asc()).first()
      return jsonify({"paypal_email": getattr(row, "paypal_email", None)})
    data = request.get_json(force=True) or {}
    email = str(data.get("paypal_email") or "").strip().lower()
    row = session.query(PlatformSetting).order_by(PlatformSetting.id.asc()).first()
    if not row:
      row = PlatformSetting(paypal_email=email or None)
      session.add(row)
    else:
      row.paypal_email = email or None
      session.add(row)
    session.commit()
    session.refresh(row)
    return jsonify({"status": "ok", "paypal_email": row.paypal_email})
  finally:
    session.close()
@api.route("/register", methods=["POST"])
def register():
  print(request.json)
  data = request.get_json(force=True) or {}
  name = str(data.get("name") or data.get("username") or "").strip()
  email = str(data.get("email") or "").strip().lower()
  password = str(data.get("password") or "")
  if not name or not email or not password:
    return jsonify({"error": "name, email et password requis"}), 400
  session = SessionLocal()
  try:
    exists_email = session.query(User).filter(func.lower(User.email) == email).first()
    if exists_email:
      return jsonify({"error": "Email déjà utilisé"}), 409
    exists_username = session.query(User).filter(func.lower(User.username) == func.lower(name)).first()
    if exists_username:
      return jsonify({"error": "Nom d'utilisateur déjà utilisé"}), 409
    user = User(
      username=name,
      email=email,
      password_hash=generate_password_hash(password),
    )
    session.add(user)
    try:
      session.commit()
    except IntegrityError:
      session.rollback()
      return jsonify({"error": "Identifiants déjà utilisés"}), 409
    session.refresh(user)
    return jsonify({"status": "ok", "user_id": user.id})
  except Exception as e:
    session.rollback()
    print("REGISTER_ERROR:\n", traceback.format_exc())
    return jsonify({"error": str(e)}), 500
  finally:
    session.close()
@api.route("/users", methods=["GET"])
def list_users():
    session = SessionLocal()
    try:
        rows = session.query(User).limit(50).all()
        results = []
        for u in rows:
            last_challenge = (
                session.query(UserChallenge)
                .filter(UserChallenge.user_id == u.id)
                .order_by(UserChallenge.start_date.desc())
                .first()
            )
            status = (last_challenge.status.value if last_challenge else "active")
            results.append(
                {
                    "id": u.id,
                    "name": u.username,
                    "email": u.email,
                    "role": u.role.value if hasattr(u.role, "value") else str(u.role),
                    "status": status,
                }
            )
        return jsonify(results)
    finally:
        session.close()


# Simple plan mapping for challenge purchase
PLAN_BALANCES: Dict[str, float] = {
    "starter": 5000.0,
    "standard": 10000.0,
    "pro": 25000.0,
    "enterprise": 50000.0,
}


@api.route("/buy-challenge", methods=["POST"])
def buy_challenge():
    """Simulate payment and create a new UserChallenge for a user.

    Payload: {"user_id": int, "plan_type": str}
    Returns: {"status": "Success", "challenge_id": int}
    """
    data = request.get_json(force=True) or {}
    user_id = data.get("user_id")
    plan_type = str(data.get("plan_type", "starter")).lower()

    if not isinstance(user_id, int):
        return jsonify({"error": "user_id doit être un entier"}), 400

    balance = PLAN_BALANCES.get(plan_type, PLAN_BALANCES["starter"])

    session = SessionLocal()
    try:
        user = session.get(User, user_id)
        if not user:
            return jsonify({"error": f"Utilisateur {user_id} introuvable"}), 404

        challenge = UserChallenge(
            user_id=user.id,
            start_balance=balance,
            current_equity=balance,
            status=ChallengeStatusEnum.active,
            daily_loss_limit=0.05,  # 5%
            total_loss_limit=0.10,  # 10%
            start_date=dt.datetime.utcnow(),
        )
        session.add(challenge)
        session.commit()
        session.refresh(challenge)

        return jsonify({"status": "Success", "challenge_id": challenge.id})
    finally:
        session.close()


@api.route("/leaderboard", methods=["GET"])
def leaderboard():
    """Return top 10 traders sorted by percentage profit computed from trades.

    Profit% = sum(trades.profit_loss) / start_balance * 100
    Returns a list with user, challenge, profit_pct, total_pnl.
    """
    session = SessionLocal()
    try:
        profit_pct_expr = (
            func.coalesce(func.sum(Trade.profit_loss), 0.0) / UserChallenge.start_balance * 100.0
        ).label("profit_pct")

        q = (
            session.query(
                User.id.label("user_id"),
                User.username.label("username"),
                UserChallenge.id.label("challenge_id"),
                UserChallenge.start_balance.label("start_balance"),
                func.coalesce(func.sum(Trade.profit_loss), 0.0).label("total_pnl"),
                profit_pct_expr,
            )
            .join(UserChallenge, UserChallenge.user_id == User.id)
            .outerjoin(Trade, Trade.challenge_id == UserChallenge.id)
            .group_by(User.id, User.username, UserChallenge.id, UserChallenge.start_balance)
            .order_by(desc(profit_pct_expr))
            .limit(10)
        )

        results = [
            {
                "user_id": row.user_id,
                "username": row.username,
                "challenge_id": row.challenge_id,
                "start_balance": float(row.start_balance),
                "total_pnl": float(row.total_pnl or 0.0),
                "profit_pct": float(row.profit_pct or 0.0),
            }
            for row in q.all()
        ]

        return jsonify({"leaderboard": results})
    finally:
        session.close()


@api.route("/trade", methods=["POST"])
def execute_trade():
    """Execute a trade and update the associated challenge equity, then check status.

    Payload:
    {
        "challenge_id": int,
        "symbol": str,
        "type": "buy" | "sell",
        "quantity": int,
        "open_price": float,
        "close_price": float
    }
    Returns: JSON with trade info and updated challenge status.
    """
    data = request.get_json(force=True) or {}

    required_fields = ["challenge_id", "symbol", "type", "quantity", "open_price", "close_price"]
    missing = [f for f in required_fields if f not in data]
    if missing:
        return jsonify({"error": f"Champs manquants: {', '.join(missing)}"}), 400

    challenge_id = int(data["challenge_id"])
    symbol = str(data["symbol"]).upper()
    side = str(data["type"]).lower()
    quantity = int(data["quantity"])
    open_price = float(data["open_price"])
    close_price = float(data["close_price"])

    if side not in {"buy", "sell"}:
        return jsonify({"error": "type doit être 'buy' ou 'sell'"}), 400
    if quantity <= 0:
        return jsonify({"error": "quantity doit être > 0"}), 400
    if open_price < 0 or close_price < 0:
        return jsonify({"error": "Les prix doivent être >= 0"}), 400

    session = SessionLocal()
    try:
        challenge = session.get(UserChallenge, challenge_id)
        if not challenge:
            return jsonify({"error": f"Challenge {challenge_id} introuvable"}), 404

        if side == "buy":
            pnl = (close_price - open_price) * quantity
            type_enum = TradeTypeEnum.buy
        else:  # sell
            pnl = (open_price - close_price) * quantity
            type_enum = TradeTypeEnum.sell

        trade = Trade(
            challenge_id=challenge.id,
            symbol=symbol,
            type=type_enum,
            quantity=quantity,
            open_price=open_price,
            close_price=close_price,
            profit_loss=pnl,
            timestamp=dt.datetime.utcnow(),
        )

        session.add(trade)

        # Update challenge equity
        challenge.current_equity = float(challenge.current_equity) + float(pnl)
        session.add(challenge)
        session.commit()
        session.refresh(trade)
        session.refresh(challenge)

        # Check status after trade
        updated_status = check_challenge_status(challenge.id)

        return jsonify(
            {
                "status": "Success",
                "trade": {
                    "id": trade.id,
                    "symbol": trade.symbol,
                    "type": trade.type.value,
                    "quantity": trade.quantity,
                    "open_price": trade.open_price,
                    "close_price": trade.close_price,
                    "profit_loss": trade.profit_loss,
                },
                "challenge": {
                    "id": challenge.id,
                    "current_equity": challenge.current_equity,
                    "status": updated_status.value,
                },
            }
        )
    finally:
        session.close()
