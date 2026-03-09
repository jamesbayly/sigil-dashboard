#!/usr/bin/env python3
"""
Polymarket Insider Trading Test Harness

Loads trade data from CSV, runs pluggable detection strategies, and prints
formatted results. Add new strategies in strategies.py.

Usage:
    python scripts/test_harness.py
    python scripts/test_harness.py --file path/to/trades.csv
"""

from __future__ import annotations

import csv
import os
import sys
from dataclasses import dataclass, field
from datetime import datetime
from typing import Callable


@dataclass
class Trade:
    market_id: int
    market_title: str
    market_slug: str
    market_resolution_date: datetime | None
    insider_trading_score: float
    trade_id: int
    transaction_hash: str
    trade_date: datetime
    user_id: str
    user_name: str
    user_trade_count: int
    side: str       # BUY or SELL
    outcome: str    # Yes or No
    amount: float
    price: float
    current_price: float
    current_profit: float
    current_profit_percent: float


# Default position size for normalized profit calculation
NORMALIZED_POSITION = 1000.0


@dataclass
class TradeFact:
    """A trade snapshot without outcome data (no current_price/profit/profit_percent)."""
    market_id: int
    market_title: str
    market_slug: str
    market_resolution_date: datetime | None
    insider_trading_score: float
    trade_id: int
    transaction_hash: str
    trade_date: datetime
    user_id: str
    user_name: str
    user_trade_count: int
    side: str
    outcome: str
    amount: float
    price: float


def _to_fact(trade: Trade) -> TradeFact:
    """Strip outcome data from a Trade."""
    return TradeFact(
        market_id=trade.market_id,
        market_title=trade.market_title,
        market_slug=trade.market_slug,
        market_resolution_date=trade.market_resolution_date,
        insider_trading_score=trade.insider_trading_score,
        trade_id=trade.trade_id,
        transaction_hash=trade.transaction_hash,
        trade_date=trade.trade_date,
        user_id=trade.user_id,
        user_name=trade.user_name,
        user_trade_count=trade.user_trade_count,
        side=trade.side,
        outcome=trade.outcome,
        amount=trade.amount,
        price=trade.price,
    )


@dataclass
class StrategyResult:
    strategy_name: str
    description: str
    filtered_trades: list[Trade]
    total_profit: float
    avg_profit_pct: float
    num_trades: int
    extra_info: dict = field(default_factory=dict)
    # profit if entering each trade at $NORMALIZED_POSITION
    normalized_profit: float = 0.0


# Per-trade filter signature: (current_trade, unresolved_prior_trades, resolved_trades) -> include?
StrategyFilter = Callable[[TradeFact, list[TradeFact], list[Trade]], bool]


@dataclass
class Strategy:
    name: str
    description: str
    filter_fn: StrategyFilter
    extra_fn: Callable[[list[Trade]], dict] | None = None


def load_trades(path: str) -> list[Trade]:
    """Load and parse trades from a CSV file into Trade objects."""
    trades: list[Trade] = []
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                res_date_str = row.get("market_resolution_date", "").strip()
                res_date = (
                    datetime.fromisoformat(res_date_str.replace("Z", "+00:00"))
                    if res_date_str else None
                )
                trade = Trade(
                    market_id=int(row["market_id"]),
                    market_title=row["market_title"],
                    market_slug=row["market_slug"],
                    market_resolution_date=res_date,
                    insider_trading_score=float(row["insider_trading_score"]),
                    trade_id=int(row["trade_id"]),
                    transaction_hash=row["transaction_hash"],
                    trade_date=datetime.fromisoformat(
                        row["trade_date"].replace("Z", "+00:00")),
                    user_id=row["user_id"],
                    user_name=row["user_name"],
                    user_trade_count=int(row["user_trade_count"]),
                    side=row["side"],
                    outcome=row["outcome"],
                    amount=float(row["amount"]),
                    price=float(row["price"]),
                    current_price=float(row["current_price"]),
                    current_profit=float(row["current_profit"]),
                    current_profit_percent=float(
                        row["current_profit_percent"]),
                )
                trades.append(trade)
            except (ValueError, KeyError) as e:
                print(
                    f"  Skipping row (trade_id={row.get('trade_id', '?')}): {e}", file=sys.stderr)
    return trades


def print_results(result: StrategyResult) -> None:
    """Pretty-print the results of a strategy run."""
    width = 72
    print("=" * width)
    print(f"  STRATEGY: {result.strategy_name}")
    print("=" * width)
    print()
    print(f"  {result.description}")
    print()
    print(f"  {'Trades selected:':<30} {result.num_trades:>10,}")
    print(f"  {'Normalized profit ($):':<30} {result.normalized_profit:>10,.2f}")
    print(f"  {'Avg profit (%):':<30} {result.avg_profit_pct:>10.2f}%")
    print(f"  {'Raw profit ($):':<30} {result.total_profit:>10,.2f}")

    if result.extra_info:
        print()
        print(f"  {'── Additional Stats ──':─^{width - 4}}")
        for key, value in result.extra_info.items():
            if key == "top_users":
                print()
                print("  Top Profitable Users:")
                print(
                    f"    {'User':<30} {'Trades':>7} {'Markets':>8} {'Profit ($)':>12} {'Avg %':>8}")
                print(
                    f"    {'─' * 30} {'─' * 7} {'─' * 8} {'─' * 12} {'─' * 8}")
                for u in value:
                    print(
                        f"    {u['user_name']:<30} {u['num_trades']:>7} "
                        f"{u['distinct_markets']:>8} {u['total_profit']:>12,.2f} "
                        f"{u['avg_profit_pct']:>7.2f}%"
                    )
            elif key == "repeat_contrarians":
                if value:
                    print()
                    print("  Repeat Contrarian Traders:")
                    print(f"    {'User':<35} {'Trades':>7} {'Profit ($)':>12}")
                    print(f"    {'─' * 35} {'─' * 7} {'─' * 12}")
                    for u in value:
                        print(
                            f"    {u['user_name']:<35} {u['trades']:>7} {u['total_profit']:>12,.2f}")
            else:
                label = key.replace("_", " ").title()
                print(f"  {label + ':':<30} {str(value):>10}")

    print()


def print_summary(results: list[StrategyResult]) -> None:
    """Print a comparison table of all strategy results."""
    width = 182
    print("━" * width)
    print("  SUMMARY: Strategy Comparison (ranked by normalized profit @ $1,000/trade)")
    print("━" * width)
    print()
    print(
        f"    {'#':<4} {'Strategy':<135} {'Trades':>8} {'Norm Profit':>14} {'Avg %':>10}")
    print(f"    {'─' * 4} {'─' * 135} {'─' * 8} {'─' * 14} {'─' * 10}")

    ranked = sorted(results, key=lambda r: r.normalized_profit, reverse=True)
    for i, r in enumerate(ranked, 1):
        print(
            f"    {i:<4} {r.strategy_name:<135} {r.num_trades:>8,} "
            f"{r.normalized_profit:>14,.2f} {r.avg_profit_pct:>9.2f}%"
        )

    print()
    print("━" * width)


def _run_strategy(sorted_trades: list[Trade], strategy: Strategy) -> StrategyResult:
    """Simulate strategy execution trade-by-trade in chronological order."""
    from collections import defaultdict

    # Pre-group trades by market and build a sorted list of (resolution_date, trades)
    # so resolved can be accumulated with a single forward pointer.
    market_trades: dict[int, list[Trade]] = defaultdict(list)
    for t in sorted_trades:
        market_trades[t.market_id].append(t)

    resolved_markets_sorted: list[tuple[datetime, int, list[Trade]]] = sorted(
        (
            (ts[0].market_resolution_date, mid, ts)
            for mid, ts in market_trades.items()
            if ts[0].market_resolution_date is not None
        ),
        key=lambda x: x[0],
    )

    # Incremental state
    existing_facts: list[TradeFact] = []   # all prior trade facts (unfiltered)
    resolved_market_ids: set[int] = set()  # markets that have resolved so far
    resolved_trades: list[Trade] = []      # all trades on resolved markets
    resolved_ptr = 0

    selected_trades: list[Trade] = []

    for trade in sorted_trades:
        # Advance resolution pointer: absorb any markets that resolved by this trade's date
        while resolved_ptr < len(resolved_markets_sorted):
            res_date, mid, mts = resolved_markets_sorted[resolved_ptr]
            if res_date <= trade.trade_date:
                resolved_trades.extend(mts)
                resolved_market_ids.add(mid)
                resolved_ptr += 1
            else:
                break

        current = _to_fact(trade)

        # existing = prior facts whose market has not yet resolved
        existing = [
            f for f in existing_facts if f.market_id not in resolved_market_ids]

        if strategy.filter_fn(current, existing, resolved_trades):
            selected_trades.append(trade)

        # Add this trade to existing for subsequent iterations
        existing_facts.append(current)

    total_profit = sum(t.current_profit for t in selected_trades)
    avg_pct = (
        sum(t.current_profit_percent for t in selected_trades) /
        len(selected_trades)
        if selected_trades else 0.0
    )
    normalized_profit = sum(
        NORMALIZED_POSITION * (t.current_profit_percent / 100.0)
        for t in selected_trades
    )
    extra = strategy.extra_fn(selected_trades) if strategy.extra_fn else {}

    return StrategyResult(
        strategy_name=strategy.name,
        description=strategy.description,
        filtered_trades=selected_trades,
        total_profit=total_profit,
        avg_profit_pct=avg_pct,
        num_trades=len(selected_trades),
        extra_info=extra,
        normalized_profit=normalized_profit,
    )


def main() -> None:
    # Resolve CSV path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    default_path = os.path.join(script_dir, "all_trades.csv")

    csv_path = default_path
    if len(sys.argv) > 1 and sys.argv[1] == "--file" and len(sys.argv) > 2:
        csv_path = sys.argv[2]

    print(f"\n  Loading trades from: {csv_path}")
    trades = load_trades(csv_path)
    print(
        f"  Loaded {len(trades):,} trades across {len({t.market_id for t in trades})} markets\n")

    if not trades:
        print("  No trades loaded. Check the CSV path and format.")
        sys.exit(1)

    sorted_trades = sorted(trades, key=lambda t: t.trade_date)

    from strategies import (
        high_confidence_buys,
        repeat_profitable_traders,
        early_large_movers,
        contrarian_winners,
        new_account_focused_traders,
        serial_accuracy_correlated,
        single_bet_new_wallets,
        stealth_sizing,
        price_impact_movers,
        pre_resolution_sniper,
        win_rate_outliers,
    )

    all_strategies: list[Strategy] = [
        high_confidence_buys,
        repeat_profitable_traders,
        early_large_movers,
        contrarian_winners,
        new_account_focused_traders,
        serial_accuracy_correlated,
        single_bet_new_wallets,
        stealth_sizing,
        price_impact_movers,
        pre_resolution_sniper,
        win_rate_outliers,
    ]

    results: list[StrategyResult] = []
    for strategy in all_strategies:
        result = _run_strategy(sorted_trades, strategy)
        print_results(result)
        results.append(result)

    print_summary(results)


if __name__ == "__main__":
    main()
