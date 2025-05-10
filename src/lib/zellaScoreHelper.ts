import { Trades } from "@/types";

export const calculateZellaScore = (trades: Trades[]): number => {
  // Filter closed trades with defined PnL
  const closedTrades = trades.filter((t) => t.pnl_amount && t.close_price);

  if (closedTrades.length === 0) return 0;

  const wins = closedTrades.filter((t) => t.pnl_amount ?? 0 > 0);
  const losses = closedTrades.filter((t) => t.pnl_amount ?? 0 < 0);

  const grossProfit = wins.reduce(
    (sum, t) => sum + Math.abs(t.pnl_amount ?? 0),
    0
  );
  const grossLoss = losses.reduce(
    (sum, t) => sum + Math.abs(t.pnl_amount ?? 0),
    0
  );
  const netProfit = grossProfit - grossLoss;

  // 1. Average Win/Loss Ratio
  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
  const avgWinLossRatio = avgLoss > 0 ? avgWin / avgLoss : 0;
  const avgWinLossScore = getScoreFromRanges(avgWinLossRatio, [
    { min: 2.6, score: 100 },
    { min: 2.4, score: 90 },
    { min: 2.2, score: 80 },
    { min: 2.0, score: 70 },
    { min: 1.9, score: 60 },
    { min: 1.8, score: 50 },
    { min: 0, score: 20 },
  ]);

  // 2. Trade Win Percentage
  const winRate = (wins.length / closedTrades.length) * 100;
  const winRateScore = Math.min((winRate / 60) * 100, 100);

  // 3. Maximum Drawdown
  const cumulativePnLs: number[] = [];
  let cumulative = 0;
  for (const trade of closedTrades) {
    cumulative += trade.pnl_amount ?? 0;
    cumulativePnLs.push(cumulative);
  }
  let peak = cumulativePnLs[0];
  let maxDrawdown = 0;
  for (const value of cumulativePnLs) {
    if (value > peak) peak = value;
    const drawdown = peak - value;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }
  const maxDrawdownScore =
    peak > 0 ? Math.max(100 - (maxDrawdown / peak) * 100, 0) : 0;

  // 4. Profit Factor
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;
  const profitFactorScore = getScoreFromRanges(profitFactor, [
    { min: 2.6, score: 100 },
    { min: 2.4, score: 90 },
    { min: 2.2, score: 80 },
    { min: 2.0, score: 70 },
    { min: 1.9, score: 60 },
    { min: 1.8, score: 50 },
    { min: 0, score: 20 },
  ]);

  // 5. Recovery Factor
  const recoveryFactor = maxDrawdown > 0 ? netProfit / maxDrawdown : 0;
  const recoveryFactorScore = getScoreFromRanges(recoveryFactor, [
    { min: 3.5, score: 100 },
    { min: 3.0, score: 70 },
    { min: 2.5, score: 60 },
    { min: 2.0, score: 50 },
    { min: 1.5, score: 30 },
    { min: 1.0, score: 1 },
    { min: 0, score: 0 },
  ]);

  // 6. Consistency Score
  const dailyPnLMap = new Map<string, number>();
  for (const trade of closedTrades) {
    if (!trade.close_time) continue;
    const dateStr = trade.close_time.split("T")[0];
    dailyPnLMap.set(
      dateStr,
      (dailyPnLMap.get(dateStr) || 0) + (trade.pnl_amount ?? 0)
    );
  }
  const dailyPnLs = Array.from(dailyPnLMap.values());
  const totalProfit = dailyPnLs.reduce((sum, val) => sum + val, 0);
  const avgDailyProfit = totalProfit / dailyPnLs.length;
  const stdDev =
    dailyPnLs.length > 1
      ? Math.sqrt(
          dailyPnLs.reduce(
            (sum, val) => sum + Math.pow(val - avgDailyProfit, 2),
            0
          ) /
            (dailyPnLs.length - 1)
        )
      : 0;
  const consistencyRatio = totalProfit > 0 ? stdDev / totalProfit : 0;
  const consistencyScore = Math.max(100 - consistencyRatio * 100, 0);

  // Final Zella Score
  const zellaScore =
    recoveryFactorScore * 0.1 +
    winRateScore * 0.15 +
    avgWinLossScore * 0.2 +
    profitFactorScore * 0.25 +
    maxDrawdownScore * 0.2 +
    consistencyScore * 0.1;

  return Math.round(zellaScore);
};

const getScoreFromRanges = (
  value: number,
  ranges: { min: number; score: number }[]
): number => {
  for (const range of ranges) {
    if (value >= range.min) return range.score;
  }
  return 0;
};
