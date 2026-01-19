"""SQLAlchemy ORM models for TradeSense AI backend.

Defines User, UserChallenge, and Trade tables.
"""

from enum import Enum as PyEnum
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Enum,
    Float,
    CheckConstraint,
    Index,
)
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func


Base = declarative_base()


class RoleEnum(PyEnum):
    """User roles for access control."""
    user = "user"
    admin = "admin"


class ChallengeStatusEnum(PyEnum):
    """Lifecycle state of a user challenge."""
    active = "active"
    failed = "failed"
    passed = "passed"


class TradeTypeEnum(PyEnum):
    """Side of the trade."""
    buy = "buy"
    sell = "sell"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(64), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(
        Enum(RoleEnum, create_constraint=True, native_enum=False),
        nullable=False,
        default=RoleEnum.user,
    )
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    # Relationships
    challenges = relationship(
        "UserChallenge",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} username={self.username}>"


class UserChallenge(Base):
    __tablename__ = "user_challenges"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Monetary figures (use Float here; consider Decimal/Numeric in production)
    start_balance = Column(Float, nullable=False)
    current_equity = Column(Float, nullable=False)

    status = Column(
        Enum(ChallengeStatusEnum, create_constraint=True, native_enum=False),
        nullable=False,
        default=ChallengeStatusEnum.active,
    )

    # Loss limits (store as percentage fraction e.g., 0.05 for 5%, 0.10 for 10%)
    daily_loss_limit = Column(Float, nullable=False)
    total_loss_limit = Column(Float, nullable=False)

    start_date = Column(DateTime, nullable=False, server_default=func.now())

    # Constraints & indexes
    __table_args__ = (
        CheckConstraint("start_balance >= 0", name="ck_challenge_start_balance_nonnegative"),
        CheckConstraint("current_equity >= 0", name="ck_challenge_current_equity_nonnegative"),
        CheckConstraint(
            "daily_loss_limit >= 0 AND daily_loss_limit <= 1",
            name="ck_challenge_daily_loss_limit_percent",
        ),
        CheckConstraint(
            "total_loss_limit >= 0 AND total_loss_limit <= 1",
            name="ck_challenge_total_loss_limit_percent",
        ),
        Index("ix_user_challenges_user_id_status", "user_id", "status"),
    )

    # Relationships
    user = relationship("User", back_populates="challenges")
    trades = relationship(
        "Trade",
        back_populates="challenge",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<UserChallenge id={self.id} user_id={self.user_id} status={self.status.value}>"


class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True)
    challenge_id = Column(
        Integer,
        ForeignKey("user_challenges.id", ondelete="CASCADE"),
        nullable=False,
    )

    symbol = Column(String(32), nullable=False, index=True)
    type = Column(
        Enum(TradeTypeEnum, create_constraint=True, native_enum=False),
        nullable=False,
    )

    quantity = Column(Integer, nullable=False)
    open_price = Column(Float, nullable=False)
    close_price = Column(Float, nullable=True)
    profit_loss = Column(Float, nullable=True)

    timestamp = Column(DateTime, nullable=False, server_default=func.now())

    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_trade_quantity_positive"),
        CheckConstraint("open_price >= 0", name="ck_trade_open_price_nonnegative"),
        CheckConstraint("close_price IS NULL OR close_price >= 0", name="ck_trade_close_price_nonnegative_or_null"),
        Index("ix_trades_challenge_id_timestamp", "challenge_id", "timestamp"),
    )

    # Relationships
    challenge = relationship("UserChallenge", back_populates="trades")

    def __repr__(self) -> str:
        return f"<Trade id={self.id} symbol={self.symbol} type={self.type.value}>"


class PlatformSetting(Base):
    __tablename__ = "platform_settings"

    id = Column(Integer, primary_key=True)
    paypal_email = Column(String(255), unique=True, nullable=True, index=True)
