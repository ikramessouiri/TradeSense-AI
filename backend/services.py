"""Business logic services for TradeSense AI.

Implements challenge status checks based on business rules:
- Daily max loss: equity drops >= daily_loss_limit from start-of-day baseline -> FAILED
- Total max loss: equity drops >= total_loss_limit from initial balance -> FAILED
- Profit target: equity rises >= 10% from initial balance -> PASSED
"""

from __future__ import annotations

import datetime as dt
from typing import Optional

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.sql import func

# Flexible imports whether run as a package or a script
try:  # package-style
    from .models import (
        Base,
        UserChallenge,
        Trade,
        ChallengeStatusEnum,
    )
    from .config import SQLALCHEMY_DATABASE_URL
except ImportError:  # script-style
    from models import (
        Base,
        UserChallenge,
        Trade,
        ChallengeStatusEnum,
    )
    from config import SQLALCHEMY_DATABASE_URL


def _create_session_factory(db_url: str):
    """Create a session factory bound to the given database URL."""
    connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}
    engine = create_engine(db_url, future=True, connect_args=connect_args)
    # Ensure tables exist (dev convenience). In production, use migrations.
    Base.metadata.create_all(bind=engine)
    return scoped_session(sessionmaker(bind=engine, autocommit=False, autoflush=False, future=True))


SessionLocal = _create_session_factory(SQLALCHEMY_DATABASE_URL)


def _utc_start_of_today(now: Optional[dt.datetime] = None) -> dt.datetime:
    """Return UTC midnight for today based on provided timestamp or current UTC time."""
    ts = now or dt.datetime.utcnow()
    return ts.replace(hour=0, minute=0, second=0, microsecond=0)


def check_challenge_status(challenge_id: int) -> ChallengeStatusEnum:
    """Evaluate and update a challenge's status according to business rules.

    Rules:
    - Daily Max Loss: if current equity <= start-of-day balance * (1 - daily_loss_limit) -> FAILED
    - Total Max Loss: if current equity <= start_balance * (1 - total_loss_limit) -> FAILED
    - Profit Target: if current equity >= start_balance * 1.10 -> PASSED

    Persists status updates to the database when a rule triggers.

    Returns the (possibly updated) status.
    """
    session = SessionLocal()
    try:
        challenge = session.get(UserChallenge, challenge_id)
        if challenge is None:
            raise ValueError(f"UserChallenge id={challenge_id} introuvable")

        # If already terminal, return early
        if challenge.status in {ChallengeStatusEnum.failed, ChallengeStatusEnum.passed}:
            return challenge.status

        start_balance = float(challenge.start_balance)
        current_equity = float(challenge.current_equity)

        # 1) Total Max Loss
        total_threshold = start_balance * (1.0 - float(challenge.total_loss_limit))
        if current_equity <= total_threshold:
            challenge.status = ChallengeStatusEnum.failed
            session.add(challenge)
            session.commit()
            session.refresh(challenge)
            return challenge.status

        # 2) Daily Max Loss (baseline = equity at start of UTC day)
        day_start = _utc_start_of_today()
        pnl_before_today = (
            session.query(func.coalesce(func.sum(Trade.profit_loss), 0.0))
            .filter(
                Trade.challenge_id == challenge.id,
                Trade.timestamp < day_start,
                Trade.profit_loss != None,  # noqa: E711
            )
            .scalar()
        )
        day_start_balance = start_balance + float(pnl_before_today or 0.0)

        daily_threshold = day_start_balance * (1.0 - float(challenge.daily_loss_limit))
        if current_equity <= daily_threshold:
            challenge.status = ChallengeStatusEnum.failed
            session.add(challenge)
            session.commit()
            session.refresh(challenge)
            return challenge.status

        # 3) Profit Target (fixed 10%)
        profit_target_equity = start_balance * 1.10
        if current_equity >= profit_target_equity:
            challenge.status = ChallengeStatusEnum.passed
            session.add(challenge)
            session.commit()
            session.refresh(challenge)
            return challenge.status

        # No rule triggered; keep current status (likely 'active')
        return challenge.status
    finally:
        session.close()