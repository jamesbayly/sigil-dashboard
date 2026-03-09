"""
Polymarket insider trading detection strategies.

Each strategy is a Strategy instance with a per-trade filter function:
    filter_fn(current: TradeFact, existing: list[TradeFact], resolved: list[Trade]) -> bool

- current:  the trade being evaluated, without outcome data
- existing: unresolved trades placed before this trade, without outcome data
- resolved: all trades on markets that have already resolved, with outcome data

Add new strategies by creating a Strategy instance and registering it in test_harness.py.
"""

from __future__ import annotations
import re as _re
from collections import defaultdict
from statistics import median
from test_harness import Trade, StrategyResult, TradeFact, Strategy


# ---------------------------------------------------------------------------
# Strategy 1: High-Confidence BUYs
# ---------------------------------------------------------------------------

_HIGH_CONFIDENCE_MIN_SCORE = 0.8


def _high_confidence_buys_filter(
    current: TradeFact,
    existing: list[TradeFact],
    resolved: list[Trade],
) -> bool:
    """
    Include this trade if it is a BUY on a market with insider_trading_score >= 0.8.
    Hypothesis: if insider trading is likely on a market, BUY-side entrants
    are more likely to be insiders and should collectively profit.
    """
    return (
        current.side == "BUY"
        and current.insider_trading_score >= _HIGH_CONFIDENCE_MIN_SCORE
    )


def _high_confidence_buys_extra(selected: list[Trade]) -> dict:
    yes_trades = [t for t in selected if t.outcome == "Yes"]
    no_trades = [t for t in selected if t.outcome == "No"]
    return {
        "min_insider_score": _HIGH_CONFIDENCE_MIN_SCORE,
        "unique_markets": len({t.market_id for t in selected}),
        "unique_users": len({t.user_id for t in selected}),
        "yes_trades": len(yes_trades),
        "yes_profit": round(sum(t.current_profit for t in yes_trades), 2),
        "no_trades": len(no_trades),
        "no_profit": round(sum(t.current_profit for t in no_trades), 2),
    }


high_confidence_buys = Strategy(
    name="High-Confidence BUYs",
    description=(
        f"BUY-side trades on markets with insider_trading_score >= {_HIGH_CONFIDENCE_MIN_SCORE}. "
        "Insiders entering positions on markets where insider knowledge is most likely."
    ),
    filter_fn=_high_confidence_buys_filter,
    extra_fn=_high_confidence_buys_extra,
)


# ---------------------------------------------------------------------------
# Strategy 2: Repeat Profitable Traders
# ---------------------------------------------------------------------------

_REPEAT_PROFITABLE_MIN_SCORE = 0.7
_REPEAT_PROFITABLE_MIN_MARKETS = 3


def _repeat_profitable_traders_filter(
    current: TradeFact,
    existing: list[TradeFact],
    resolved: list[Trade],
) -> bool:
    """
    Include this trade if the user has already been net-profitable on 3+ distinct
    high-insider-score markets that have since resolved.
    Hypothesis: real insiders show up profitably across multiple resolved markets
    before continuing to trade — we follow them once they've proven their edge.
    """
    user_resolved = [
        t for t in resolved
        if t.user_id == current.user_id
        and t.insider_trading_score >= _REPEAT_PROFITABLE_MIN_SCORE
    ]
    # Net profit per resolved market for this user
    market_profit: dict[int, float] = defaultdict(float)
    for t in user_resolved:
        market_profit[t.market_id] += t.current_profit
    profitable_markets = sum(1 for p in market_profit.values() if p > 0)
    return profitable_markets >= _REPEAT_PROFITABLE_MIN_MARKETS


def _repeat_profitable_traders_extra(selected: list[Trade]) -> dict:
    user_trades: dict[str, list[Trade]] = defaultdict(list)
    for t in selected:
        user_trades[t.user_id].append(t)
    user_stats = [
        {
            "user_name": ut[0].user_name,
            "num_trades": len(ut),
            "distinct_markets": len({t.market_id for t in ut}),
            "total_profit": round(sum(t.current_profit for t in ut), 2),
            "avg_profit_pct": round(sum(t.current_profit_percent for t in ut) / len(ut), 2),
        }
        for ut in user_trades.values()
    ]
    top_users = sorted(
        user_stats, key=lambda x: x["total_profit"], reverse=True)[:10]
    return {
        "min_insider_score": _REPEAT_PROFITABLE_MIN_SCORE,
        "min_markets": _REPEAT_PROFITABLE_MIN_MARKETS,
        "qualifying_users": len(user_trades),
        "top_users": top_users,
    }


repeat_profitable_traders = Strategy(
    name="Repeat Profitable Traders",
    description=(
        f"Trades by users who have already been net-profitable on "
        f"{_REPEAT_PROFITABLE_MIN_MARKETS}+ distinct resolved high-insider markets "
        f"(score >= {_REPEAT_PROFITABLE_MIN_SCORE}). Following proven serial insiders."
    ),
    filter_fn=_repeat_profitable_traders_filter,
    extra_fn=_repeat_profitable_traders_extra,
)


# ---------------------------------------------------------------------------
# Strategy 3: Early Large Movers
# ---------------------------------------------------------------------------

# "early" = fewer than this many prior trades on the market
_EARLY_MOVERS_MAX_PRIOR = 10
_EARLY_MOVERS_MIN_SCORE = 0.7


def _early_large_movers_filter(
    current: TradeFact,
    existing: list[TradeFact],
    resolved: list[Trade],
) -> bool:
    """
    Include this trade if it is among the first trades on a high-insider market
    AND its amount is above the median of prior trades on this market.
    Hypothesis: insiders enter early with large positions before public info moves price.
    """
    if current.insider_trading_score < _EARLY_MOVERS_MIN_SCORE:
        return False

    prior_same_market = [
        t for t in existing if t.market_id == current.market_id]

    if len(prior_same_market) > _EARLY_MOVERS_MAX_PRIOR:
        return False

    if len(prior_same_market) >= 2:
        med = median(t.amount for t in prior_same_market)
        return current.amount >= med

    return True  # too few prior trades to compute median — count as early/large


def _early_large_movers_extra(selected: list[Trade]) -> dict:
    buys = [t for t in selected if t.side == "BUY"]
    sells = [t for t in selected if t.side == "SELL"]
    return {
        "early_max_prior_trades": _EARLY_MOVERS_MAX_PRIOR,
        "min_insider_score": _EARLY_MOVERS_MIN_SCORE,
        "unique_markets": len({t.market_id for t in selected}),
        "unique_users": len({t.user_id for t in selected}),
        "buy_trades": len(buys),
        "buy_profit": round(sum(t.current_profit for t in buys), 2),
        "sell_trades": len(sells),
        "sell_profit": round(sum(t.current_profit for t in sells), 2),
    }


early_large_movers = Strategy(
    name="Early Large Movers",
    description=(
        f"Trades among the first {_EARLY_MOVERS_MAX_PRIOR} on a market with above-median amount "
        f"vs prior trades (insider_trading_score >= {_EARLY_MOVERS_MIN_SCORE}). "
        "Insiders who enter early and big."
    ),
    filter_fn=_early_large_movers_filter,
    extra_fn=_early_large_movers_extra,
)


# ---------------------------------------------------------------------------
# Strategy 4: Contrarian Winners
# ---------------------------------------------------------------------------

_CONTRARIAN_MAX_ENTRY_PRICE = 0.5
_CONTRARIAN_MIN_SCORE = 0.7


def _contrarian_winners_filter(
    current: TradeFact,
    existing: list[TradeFact],
    resolved: list[Trade],
) -> bool:
    """
    Include BUY trades where entry price < 0.5 on a high-insider-score market.
    No profitability filter — we identify the pattern at entry time only.
    Hypothesis: insiders buy undervalued outcomes they know will happen.
    """
    return (
        current.side == "BUY"
        and current.price < _CONTRARIAN_MAX_ENTRY_PRICE
        and current.insider_trading_score >= _CONTRARIAN_MIN_SCORE
    )


def _contrarian_winners_extra(selected: list[Trade]) -> dict:
    user_counts: dict[str, int] = defaultdict(int)
    user_profit: dict[str, float] = defaultdict(float)
    user_names: dict[str, str] = {}
    for t in selected:
        user_counts[t.user_id] += 1
        user_profit[t.user_id] += t.current_profit
        user_names[t.user_id] = t.user_name
    repeat_contrarians = sorted(
        [
            {"user_name": user_names[uid], "trades": count,
                "total_profit": round(user_profit[uid], 2)}
            for uid, count in user_counts.items() if count >= 2
        ],
        key=lambda x: x["total_profit"],
        reverse=True,
    )
    return {
        "max_entry_price": _CONTRARIAN_MAX_ENTRY_PRICE,
        "min_insider_score": _CONTRARIAN_MIN_SCORE,
        "unique_markets": len({t.market_id for t in selected}),
        "unique_users": len({t.user_id for t in selected}),
        "avg_entry_price": round(sum(t.price for t in selected) / len(selected), 4) if selected else 0,
        "avg_current_price": round(sum(t.current_price for t in selected) / len(selected), 4) if selected else 0,
        "repeat_contrarians": repeat_contrarians[:10],
    }


contrarian_winners = Strategy(
    name="Contrarian Winners",
    description=(
        f"BUY trades at price < {_CONTRARIAN_MAX_ENTRY_PRICE} (market thought unlikely) on markets "
        f"with insider_trading_score >= {_CONTRARIAN_MIN_SCORE}. "
        "Insiders buying undervalued outcomes they know will happen."
    ),
    filter_fn=_contrarian_winners_filter,
    extra_fn=_contrarian_winners_extra,
)


# ---------------------------------------------------------------------------
# Strategy 5: New Account Focused Traders
# ---------------------------------------------------------------------------

_NEW_ACCOUNT_MAX_TRADE_COUNT = 20
_NEW_ACCOUNT_MIN_SCORE = 0.7
_NEW_ACCOUNT_MIN_FOCUS_RATIO = 0.80


def _new_account_focused_traders_filter(
    current: TradeFact,
    existing: list[TradeFact],
    resolved: list[Trade],
) -> bool:
    """
    Include trades from users with low lifetime trade counts whose activity
    (existing + current) is predominantly on high-insider-score markets.
    Hypothesis: accounts purpose-built to exploit insider knowledge.
    """
    if current.user_trade_count > _NEW_ACCOUNT_MAX_TRADE_COUNT:
        return False

    prior_user = [t for t in existing if t.user_id == current.user_id]
    all_user = prior_user + [current]
    high_score = sum(
        1 for t in all_user if t.insider_trading_score >= _NEW_ACCOUNT_MIN_SCORE)
    return high_score / len(all_user) >= _NEW_ACCOUNT_MIN_FOCUS_RATIO


def _new_account_focused_traders_extra(selected: list[Trade]) -> dict:
    user_trades: dict[str, list[Trade]] = defaultdict(list)
    for t in selected:
        user_trades[t.user_id].append(t)
    top_users = sorted(
        [
            {
                "user_name": ut[0].user_name,
                "num_trades": len(ut),
                "distinct_markets": len({t.market_id for t in ut}),
                "total_profit": round(sum(t.current_profit for t in ut), 2),
                "avg_profit_pct": round(sum(t.current_profit_percent for t in ut) / len(ut), 2),
            }
            for ut in user_trades.values()
        ],
        key=lambda x: x["total_profit"],
        reverse=True,
    )[:15]
    return {
        "max_lifetime_trade_count": _NEW_ACCOUNT_MAX_TRADE_COUNT,
        "min_insider_score": _NEW_ACCOUNT_MIN_SCORE,
        "min_focus_ratio": f"{_NEW_ACCOUNT_MIN_FOCUS_RATIO:.0%}",
        "qualifying_users": len(user_trades),
        "unique_markets": len({t.market_id for t in selected}),
        "top_users": top_users,
    }


new_account_focused_traders = Strategy(
    name="New Account Focused Traders",
    description=(
        f"Users with <= {_NEW_ACCOUNT_MAX_TRADE_COUNT} lifetime trades where >= "
        f"{_NEW_ACCOUNT_MIN_FOCUS_RATIO:.0%} of their activity is on markets with "
        f"insider_trading_score >= {_NEW_ACCOUNT_MIN_SCORE}. "
        "Accounts that appear purpose-built to exploit insider knowledge."
    ),
    filter_fn=_new_account_focused_traders_filter,
    extra_fn=_new_account_focused_traders_extra,
)


# ---------------------------------------------------------------------------
# Strategy 8: Serial Accuracy on Correlated Markets
# ---------------------------------------------------------------------------


_SERIAL_MIN_SCORE = 0.7
_SERIAL_MIN_WINS = 4
_SERIAL_MIN_KEYWORD_OVERLAP = 0.3
_SERIAL_STOP_WORDS = {
    "will", "does", "this", "that", "with", "from", "have", "been",
    "before", "after", "than", "what", "when", "where", "which",
    "their", "there", "about", "into", "more", "other", "over",
    "under", "between", "through", "during", "each", "some",
}


def _title_words(title: str) -> set[str]:
    return set(_re.findall(r'[a-z]{4,}', title.lower())) - _SERIAL_STOP_WORDS


def _serial_accuracy_correlated_filter(
    current: TradeFact,
    existing: list[TradeFact],
    resolved: list[Trade],
) -> bool:
    """
    Include this trade if the user has already won on N+ correlated resolved markets.
    Uses resolved trade outcomes — no future data leakage.
    Hypothesis: going N/N on correlated events is near-impossible without info access.
    """
    user_resolved = [
        t for t in resolved
        if t.user_id == current.user_id
        and t.insider_trading_score >= _SERIAL_MIN_SCORE
    ]
    market_profit: dict[int, float] = defaultdict(float)
    market_titles: dict[int, str] = {}
    for t in user_resolved:
        market_profit[t.market_id] += t.current_profit
        market_titles[t.market_id] = t.market_title

    winning = [mid for mid, p in market_profit.items() if p > 0]
    if len(winning) < _SERIAL_MIN_WINS:
        return False

    word_sets = {mid: _title_words(market_titles[mid]) for mid in winning}
    correlated: set[int] = set()
    for i, mid1 in enumerate(winning):
        for mid2 in winning[i + 1:]:
            w1, w2 = word_sets[mid1], word_sets[mid2]
            if w1 and w2 and len(w1 & w2) / min(len(w1), len(w2)) >= _SERIAL_MIN_KEYWORD_OVERLAP:
                correlated.add(mid1)
                correlated.add(mid2)

    return sum(1 for m in winning if m in correlated) >= _SERIAL_MIN_WINS


def _serial_accuracy_correlated_extra(selected: list[Trade]) -> dict:
    user_trades: dict[str, list[Trade]] = defaultdict(list)
    for t in selected:
        user_trades[t.user_id].append(t)
    top_users = sorted(
        [
            {
                "user_name": ut[0].user_name,
                "num_trades": len(ut),
                "distinct_markets": len({t.market_id for t in ut}),
                "total_profit": round(sum(t.current_profit for t in ut), 2),
                "avg_profit_pct": round(sum(t.current_profit_percent for t in ut) / len(ut), 2),
            }
            for ut in user_trades.values()
        ],
        key=lambda x: x["total_profit"],
        reverse=True,
    )[:15]
    return {
        "min_insider_score": _SERIAL_MIN_SCORE,
        "min_correlated_wins": _SERIAL_MIN_WINS,
        "min_keyword_overlap": f"{_SERIAL_MIN_KEYWORD_OVERLAP:.0%}",
        "qualifying_users": len(user_trades),
        "unique_markets": len({t.market_id for t in selected}),
        "top_users": top_users,
    }


serial_accuracy_correlated = Strategy(
    name="Serial Accuracy (Correlated)",
    description=(
        f"Trades by users who have won on {_SERIAL_MIN_WINS}+ correlated resolved high-insider "
        f"markets (title keyword overlap >= {_SERIAL_MIN_KEYWORD_OVERLAP:.0%}). "
        "Going N/N on related events is near-impossible without information access."
    ),
    filter_fn=_serial_accuracy_correlated_filter,
    extra_fn=_serial_accuracy_correlated_extra,
)


# ---------------------------------------------------------------------------
# Strategy 9: Single-Bet New Wallets
# ---------------------------------------------------------------------------

_SINGLE_BET_MAX_TRADE_COUNT = 3
_SINGLE_BET_MIN_SCORE = 0.7


def _single_bet_new_wallets_filter(
    current: TradeFact,
    existing: list[TradeFact],
    resolved: list[Trade],
) -> bool:
    """
    Include BUY trades from users with very few lifetime trades on high-insider markets.
    Hypothesis: purpose-built wallets placing a single insider bet.
    """
    return (
        current.side == "BUY"
        and current.user_trade_count <= _SINGLE_BET_MAX_TRADE_COUNT
        and current.insider_trading_score >= _SINGLE_BET_MIN_SCORE
    )


def _single_bet_new_wallets_extra(selected: list[Trade]) -> dict:
    user_trades: dict[str, list[Trade]] = defaultdict(list)
    for t in selected:
        user_trades[t.user_id].append(t)
    top_users = sorted(
        [
            {
                "user_name": ut[0].user_name,
                "num_trades": len(ut),
                "distinct_markets": len({t.market_id for t in ut}),
                "total_profit": round(sum(t.current_profit for t in ut), 2),
                "avg_profit_pct": round(sum(t.current_profit_percent for t in ut) / len(ut), 2),
            }
            for ut in user_trades.values()
        ],
        key=lambda x: x["total_profit"],
        reverse=True,
    )[:15]
    return {
        "max_lifetime_trades": _SINGLE_BET_MAX_TRADE_COUNT,
        "min_insider_score": _SINGLE_BET_MIN_SCORE,
        "qualifying_users": len(user_trades),
        "unique_markets": len({t.market_id for t in selected}),
        "top_users": top_users,
    }


single_bet_new_wallets = Strategy(
    name="Single-Bet New Wallets",
    description=(
        f"BUY trades from users with <= {_SINGLE_BET_MAX_TRADE_COUNT} lifetime trades "
        f"on markets with insider_trading_score >= {_SINGLE_BET_MIN_SCORE}. "
        "Purpose-built wallets for a single insider trade."
    ),
    filter_fn=_single_bet_new_wallets_filter,
    extra_fn=_single_bet_new_wallets_extra,
)


# ---------------------------------------------------------------------------
# Strategy 10: Stealth Sizing
# ---------------------------------------------------------------------------

_STEALTH_MIN_SCORE = 0.7
_STEALTH_MIN_MARKETS = 4
_STEALTH_BELOW_RATIO = 0.6


def _stealth_sizing_filter(
    current: TradeFact,
    existing: list[TradeFact],
    resolved: list[Trade],
) -> bool:
    """
    Include trades from users who consistently bet below-median on high-insider markets,
    already demonstrated across MIN_MARKETS-1 other markets in existing trades.
    Hypothesis: insiders distribute risk with small bets across many markets.
    """
    if current.insider_trading_score < _STEALTH_MIN_SCORE:
        return False

    # Is this trade at or below the median for its market?
    prior_same_market = [
        t for t in existing if t.market_id == current.market_id]
    if len(prior_same_market) >= 2:
        if current.amount > median(t.amount for t in prior_same_market):
            return False

    # How many other markets has this user made predominantly below-median bets on?
    user_prior = [
        t for t in existing
        if t.user_id == current.user_id
        and t.insider_trading_score >= _STEALTH_MIN_SCORE
        and t.market_id != current.market_id
    ]
    market_user_amounts: dict[int, list[float]] = defaultdict(list)
    for t in user_prior:
        market_user_amounts[t.market_id].append(t.amount)

    qualifying_markets = 0
    for mid, user_amounts in market_user_amounts.items():
        mkt_amounts = [t.amount for t in existing if t.market_id == mid]
        if len(mkt_amounts) < 2:
            continue
        med = median(mkt_amounts)
        if sum(1 for a in user_amounts if a <= med) / len(user_amounts) >= _STEALTH_BELOW_RATIO:
            qualifying_markets += 1

    return qualifying_markets >= _STEALTH_MIN_MARKETS - 1


def _stealth_sizing_extra(selected: list[Trade]) -> dict:
    user_trades: dict[str, list[Trade]] = defaultdict(list)
    for t in selected:
        user_trades[t.user_id].append(t)
    top_users = sorted(
        [
            {
                "user_name": ut[0].user_name,
                "num_trades": len(ut),
                "distinct_markets": len({t.market_id for t in ut}),
                "total_profit": round(sum(t.current_profit for t in ut), 2),
                "avg_profit_pct": round(sum(t.current_profit_percent for t in ut) / len(ut), 2),
            }
            for ut in user_trades.values()
        ],
        key=lambda x: x["total_profit"],
        reverse=True,
    )[:15]
    return {
        "min_insider_score": _STEALTH_MIN_SCORE,
        "min_markets": _STEALTH_MIN_MARKETS,
        "qualifying_users": len(user_trades),
        "unique_markets": len({t.market_id for t in selected}),
        "top_users": top_users,
    }


stealth_sizing = Strategy(
    name="Stealth Sizing",
    description=(
        f"Users placing below-median bets across {_STEALTH_MIN_MARKETS}+ high-insider markets "
        f"(insider_trading_score >= {_STEALTH_MIN_SCORE}). "
        "Insiders who distribute risk to avoid detection."
    ),
    filter_fn=_stealth_sizing_filter,
    extra_fn=_stealth_sizing_extra,
)


# ---------------------------------------------------------------------------
# Strategy 11: Price Impact Movers
# ---------------------------------------------------------------------------

_PRICE_IMPACT_MIN_SCORE = 0.7
_PRICE_IMPACT_TOP_PERCENTILE = 0.90
_PRICE_IMPACT_MIN_PRIOR = 5


def _price_impact_movers_filter(
    current: TradeFact,
    existing: list[TradeFact],
    resolved: list[Trade],
) -> bool:
    """
    Include trades with amounts in the top 10% for their market, based on at
    least MIN_PRIOR prior observed trades on that market.
    Hypothesis: insiders with conviction place large positions that move markets.
    """
    if current.insider_trading_score < _PRICE_IMPACT_MIN_SCORE:
        return False

    prior_same_market = [
        t for t in existing if t.market_id == current.market_id]
    if len(prior_same_market) < _PRICE_IMPACT_MIN_PRIOR:
        return False

    amounts = sorted(t.amount for t in prior_same_market)
    threshold = amounts[min(
        int(len(amounts) * _PRICE_IMPACT_TOP_PERCENTILE), len(amounts) - 1)]
    return current.amount >= threshold


def _price_impact_movers_extra(selected: list[Trade]) -> dict:
    user_profit: dict[str, float] = defaultdict(float)
    user_count: dict[str, int] = defaultdict(int)
    user_names: dict[str, str] = {}
    for t in selected:
        user_profit[t.user_id] += t.current_profit
        user_count[t.user_id] += 1
        user_names[t.user_id] = t.user_name
    top_users = sorted(
        [
            {
                "user_name": user_names[uid],
                "num_trades": user_count[uid],
                "distinct_markets": len({t.market_id for t in selected if t.user_id == uid}),
                "total_profit": round(user_profit[uid], 2),
                "avg_profit_pct": round(
                    sum(t.current_profit_percent for t in selected if t.user_id ==
                        uid) / user_count[uid], 2
                ),
            }
            for uid in user_profit
        ],
        key=lambda x: x["total_profit"],
        reverse=True,
    )[:15]
    return {
        "min_insider_score": _PRICE_IMPACT_MIN_SCORE,
        "top_percentile": f"top {1 - _PRICE_IMPACT_TOP_PERCENTILE:.0%}",
        "min_prior_trades": _PRICE_IMPACT_MIN_PRIOR,
        "qualifying_users": len(user_profit),
        "unique_markets": len({t.market_id for t in selected}),
        "top_users": top_users,
    }


price_impact_movers = Strategy(
    name="Price Impact Movers",
    description=(
        f"Trades in the top {1 - _PRICE_IMPACT_TOP_PERCENTILE:.0%} by amount "
        f"(vs {_PRICE_IMPACT_MIN_PRIOR}+ prior trades on market) "
        f"on high-insider-score markets (>= {_PRICE_IMPACT_MIN_SCORE}). "
        "Large positions on insider markets."
    ),
    filter_fn=_price_impact_movers_filter,
    extra_fn=_price_impact_movers_extra,
)


# ---------------------------------------------------------------------------
# Strategy 12: Pre-Resolution Snipers
# ---------------------------------------------------------------------------

_SNIPER_MIN_SCORE = 0.7
_SNIPER_LATE_FRACTION = 0.75  # trade is in last 25% of the market's time window


def _pre_resolution_sniper_filter(
    current: TradeFact,
    existing: list[TradeFact],
    resolved: list[Trade],
) -> bool:
    """
    Include BUY trades placed in the last 25% of a market's time window
    (from first observed trade to known resolution date).
    Hypothesis: insiders with time-sensitive information act just before resolution.
    """
    if current.side != "BUY":
        return False
    if current.insider_trading_score < _SNIPER_MIN_SCORE:
        return False
    if current.market_resolution_date is None:
        return False

    prior_same_market = [
        t for t in existing if t.market_id == current.market_id]
    if not prior_same_market:
        return False

    first_date = min(t.trade_date for t in prior_same_market)
    total_span = (current.market_resolution_date - first_date).total_seconds()
    if total_span <= 0:
        return False

    elapsed = (current.trade_date - first_date).total_seconds()
    return elapsed / total_span >= _SNIPER_LATE_FRACTION


def _pre_resolution_sniper_extra(selected: list[Trade]) -> dict:
    user_counts: dict[str, int] = defaultdict(int)
    user_profit: dict[str, float] = defaultdict(float)
    user_names: dict[str, str] = {}
    for t in selected:
        user_counts[t.user_id] += 1
        user_profit[t.user_id] += t.current_profit
        user_names[t.user_id] = t.user_name
    top_users = sorted(
        [
            {
                "user_name": user_names[uid],
                "num_trades": count,
                "distinct_markets": len({t.market_id for t in selected if t.user_id == uid}),
                "total_profit": round(user_profit[uid], 2),
                "avg_profit_pct": round(
                    sum(t.current_profit_percent for t in selected if t.user_id ==
                        uid) / count, 2
                ),
            }
            for uid, count in user_counts.items()
        ],
        key=lambda x: x["total_profit"],
        reverse=True,
    )[:15]
    return {
        "min_insider_score": _SNIPER_MIN_SCORE,
        "late_fraction": f"last {1 - _SNIPER_LATE_FRACTION:.0%}",
        "unique_users": len(user_counts),
        "unique_markets": len({t.market_id for t in selected}),
        "top_users": top_users,
    }


pre_resolution_sniper = Strategy(
    name="Pre-Resolution Snipers",
    description=(
        f"BUY trades in the last {1 - _SNIPER_LATE_FRACTION:.0%} of a market's time window "
        f"(first trade → resolution date) on high-insider markets (>= {_SNIPER_MIN_SCORE}). "
        "Insiders acting on time-sensitive information just before resolution."
    ),
    filter_fn=_pre_resolution_sniper_filter,
    extra_fn=_pre_resolution_sniper_extra,
)


# ---------------------------------------------------------------------------
# Strategy 13: Win Rate Outliers
# ---------------------------------------------------------------------------

_WIN_RATE_MIN_SCORE = 0.7
_WIN_RATE_MIN_RESOLVED_TRADES = 5
_WIN_RATE_SIGMA = 1.5
_WIN_RATE_MAX_THRESHOLD = 0.90


def _win_rate_outliers_filter(
    current: TradeFact,
    existing: list[TradeFact],
    resolved: list[Trade],
) -> bool:
    """
    Include this trade if the user's win rate on resolved high-insider markets
    is >= 1.5 sigma above the population mean (min 5 resolved trades).
    Uses resolved trade outcomes only — no future data leakage.
    """
    if current.insider_trading_score < _WIN_RATE_MIN_SCORE:
        return False

    high_resolved = [
        t for t in resolved if t.insider_trading_score >= _WIN_RATE_MIN_SCORE]
    if not high_resolved:
        return False

    user_resolved: dict[str, list[Trade]] = defaultdict(list)
    for t in high_resolved:
        user_resolved[t.user_id].append(t)

    user_win_rates = {
        uid: sum(1 for t in ut if t.current_profit > 0) / len(ut)
        for uid, ut in user_resolved.items()
        if len(ut) >= _WIN_RATE_MIN_RESOLVED_TRADES
    }
    if len(user_win_rates) < 3:
        return False

    rates = list(user_win_rates.values())
    mean_rate = sum(rates) / len(rates)
    std_rate = (sum((r - mean_rate) ** 2 for r in rates) / len(rates)) ** 0.5
    threshold = (
        min(mean_rate + _WIN_RATE_SIGMA * std_rate, _WIN_RATE_MAX_THRESHOLD)
        if std_rate > 0 else _WIN_RATE_MAX_THRESHOLD
    )

    user_rate = user_win_rates.get(current.user_id)
    return user_rate is not None and user_rate >= threshold


def _win_rate_outliers_extra(selected: list[Trade]) -> dict:
    user_trades: dict[str, list[Trade]] = defaultdict(list)
    for t in selected:
        user_trades[t.user_id].append(t)
    top_users = sorted(
        [
            {
                "user_name": ut[0].user_name,
                "num_trades": len(ut),
                "distinct_markets": len({t.market_id for t in ut}),
                "total_profit": round(sum(t.current_profit for t in ut), 2),
                "avg_profit_pct": round(sum(t.current_profit_percent for t in ut) / len(ut), 2),
            }
            for ut in user_trades.values()
        ],
        key=lambda x: x["total_profit"],
        reverse=True,
    )[:15]
    return {
        "min_insider_score": _WIN_RATE_MIN_SCORE,
        "min_resolved_trades": _WIN_RATE_MIN_RESOLVED_TRADES,
        "sigma_threshold": _WIN_RATE_SIGMA,
        "qualifying_users": len(user_trades),
        "top_users": top_users,
    }


win_rate_outliers = Strategy(
    name="Win Rate Outliers",
    description=(
        f"Trades by users whose win rate on resolved high-insider markets (>= {_WIN_RATE_MIN_SCORE}) "
        f"is >= {_WIN_RATE_SIGMA:.0f} sigma above the population mean "
        f"(min {_WIN_RATE_MIN_RESOLVED_TRADES} resolved trades). "
        "Statistically anomalous accuracy suggesting information access."
    ),
    filter_fn=_win_rate_outliers_filter,
    extra_fn=_win_rate_outliers_extra,
)
