export interface GenericResponse {
  message: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isGenericResponse = (object: any): object is GenericResponse => {
  return "message" in object;
};

export interface Trades {
  id: number;
  strategy_id: number;
  symbol_id: number;
  conviction: number; // A conviction score from 1-10
  size: number;
  open_time: string;
  open_price: number;
  open_notes: string;
  open_fees: number;
  open_binance_order_id?: string;
  take_profit_price?: number;
  stop_loss_percent?: number;
  close_time?: string;
  close_price?: number;
  close_notes?: string;
  close_fees?: number;
  close_binance_order_id?: string;
  fees?: number;
  pnl_amount_fee_exclusive?: number;
  pnl_percent?: number;
  pnl_amount?: number;
}

export interface MarketState {
  id: number;
  created_at: string;
  market_cap: number; // Express in Millions
  ema_9: number | undefined; // Express in Millions
  ema_21: number | undefined; // Express in Millions
  ema_50: number | undefined; // Express in Millions
  ema_100: number | undefined; // Express in Millions
}

export interface Strategy {
  id: number;
  name: string;
  status: "active" | "inactive" | "test";
  strategy_type: "CRYPTO" | "STOCK_OPTIONS" | "AI"; // The type of strategy
  symbol_ids: number[];
  strategy_code: string;
  parameters: StrategyParameter[];
}

export interface StrategyParameter {
  id: number | undefined;
  code: string;
  description: string; // A desciption of the parameter
  value: number; // The default value
  type: "integer" | "float" | "boolean";
  min_value: number | undefined; // The minimum value for the parameter that we might test above
  max_value: number | undefined; // The maximum value for the parameter that we might test below
}

export interface SymbolRequest {
  name: string;
  symbol_type: "CRYPTO" | "STOCK";
  symbol: string;
  binance_ticker: string;
  cg_id: string;
}

export interface SymbolsResponse extends SymbolRequest {
  id: number;
  market_cap: number | undefined; // Express in Millions
  day_change_percent: number;
  hour_change_percent: number;
  cg_rank: number | undefined;
  option_score: number;
  option_score_prev: number;
}

export interface SymbolResponse extends SymbolsResponse {
  earliest_date: Date | undefined; // The earliest date of price data
  latest_date: Date | undefined; // The latest date of price data
  count_data: number; // The count of price data
}

export interface StrategyTestRunsResponse {
  id: number;
  strategy: Strategy | undefined;
  created_at: number;
  name: string;
  symbol_ids: number[];
  count_permutations: number;
  count_results: number;
}

export interface StrategyTestRunResponse extends StrategyTestRunsResponse {
  permutations: StrategyTestRunPermutationResponse[];
}

export interface StrategyTestRunPermutationResponse {
  id: number;
  name: string;
  results_with_many_trades: number;
  win_rate_max: number;
  win_rate_median: number;
  win_rate_average: number;
  pnl_percent_max: number;
  pnl_percent_median: number;
  pnl_percent_average: number;
  pnl_amount_max: number;
  pnl_amount_median: number;
  pnl_amount_average: number;
  zella_score_max: number;
  zella_score_median: number;
  zella_score_average: number;
  sqn_score_max: number;
  sqn_score_median: number;
  sqn_score_average: number;
  parameters: {
    code: string;
    value: number;
  }[];

  results: StrategyTestRunPermutationResultResponse[];
}

export interface StrategyTestRunPermutationResultResponse {
  id: number;
  symbol_id: number;
  trade_count: number;
  win_rate: number;
  pnl_percent: number | undefined;
  pnl_amount: number | undefined;
  zella_score: number;
  sqn: number;
}

export interface OptionsDataRequest {
  symbol_id: number;
  type: "CALL_BUY" | "CALL_SELL" | "PUT_BUY" | "PUT_SELL";
  trade_date: Date;
  asset_price: number;
  strike_price: number;
  strike_delta_percent: number;
  premium: number;
  expiration_date: Date;
}

export interface OptionsDataResponse extends OptionsDataRequest {
  id: number;
  score: number;
}
