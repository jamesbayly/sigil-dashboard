export enum StrategyCodes {
  TRADING_VIEW = "TRADING_VIEW",
  CRYPTO_STRATEGY_1 = "CRYPTO_STRATEGY_1",
  CRYPTO_STRATEGY_2 = "CRYPTO_STRATEGY_2",
  CRYPTO_STRATEGY_3 = "CRYPTO_STRATEGY_3",
  CRYPTO_STRATEGY_4 = "CRYPTO_STRATEGY_4",
  CRYPTO_STRATEGY_5 = "CRYPTO_STRATEGY_5",
  CRYPTO_STRATEGY_6 = "CRYPTO_STRATEGY_6",
  CRYPTO_STRATEGY_7 = "CRYPTO_STRATEGY_7",
  CRYPTO_STRATEGY_8 = "CRYPTO_STRATEGY_8",
  CRYPTO_STRATEGY_9 = "CRYPTO_STRATEGY_9",
  CRYPTO_STRATEGY_10 = "CRYPTO_STRATEGY_10",
  CRYPTO_STRATEGY_11 = "CRYPTO_STRATEGY_11",
  CRYPTO_STRATEGY_12 = "CRYPTO_STRATEGY_12",
  STOCK_STRATEGY_1 = "STOCK_STRATEGY_1",
}
export enum StrategyStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  TEST = "test",
}

export enum StrategyType {
  CRYPTO = "CRYPTO",
  STOCK_OPTIONS = "STOCK_OPTIONS",
  AI = "AI",
}

export enum ParameterType {
  INTEGER = "integer",
  FLOAT = "float",
  BOOLEAN = "boolean",
}

export enum SymbolType {
  CRYPTO = "CRYPTO",
  STOCK = "STOCK",
}

export enum OptionType {
  CALL_BUY = "CALL_BUY",
  CALL_SELL = "CALL_SELL",
  PUT_BUY = "PUT_BUY",
  PUT_SELL = "PUT_SELL",
}

export enum NewsType {
  PREMARKET = "PREMARKET",
  INTRADAY_OPTIONS = "INTRADAY_OPTIONS",
}

export enum NewsTypeDB {
  PREMARKET = "PREMARKET",
  INTRADAY_OPTIONS = "INTRADAY_OPTIONS",
}

export enum NewsSentiment {
  VERY_POSITIVE = "VERY_POSITIVE",
  POSITIVE = "POSITIVE",
  NEGATIVE = "NEGATIVE",
  VERY_NEGATIVE = "VERY_NEGATIVE",
  NEUTRAL = "NEUTRAL",
}

export class GenericResponse {
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isGenericResponse = (object: any): object is GenericResponse => {
  return "message" in object;
};

export interface Trades {
  id: number;
  strategy_id: number;
  symbol_id: number;
  conviction: number;
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

export interface MarketStateResponse {
  id: number;
  created_at: Date;
  market_cap: number; // Express in Millions
  ema_9: number; // Express in Millions
  ema_21: number; // Express in Millions
  ema_50: number; // Express in Millions
  ema_100: number; // Express in Millions
}

export interface StrategyRequest {
  name: string;
  status: StrategyStatus;
  strategy_type: StrategyType; // The type of strategy
  symbol_ids: number[];
  strategy_code: StrategyCodes;
  parameters: StrategyParameterRequest[];
}

export interface StrategyParameterRequest {
  code: string;
  description: string; // A desciption of the parameter
  value: number; // The default value
  type: ParameterType;
  min_value: number | undefined; // The minimum value for the parameter that we might test above
  max_value: number | undefined; // The maximum value for the parameter that we might test below
}

export interface StrategyResponse extends StrategyRequest {
  id: number;
}

export interface StrategyTestRunsResponse {
  id: number;
  strategy: StrategyResponse | undefined;
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

export interface SymbolRequest {
  name: string;
  symbol_type: SymbolType;
  symbol: string;
  binance_ticker: string;
  cg_id: string;
  industry_tags: IndustryTag[];
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

export interface OptionsDataRequest {
  symbol_id: number;
  type: OptionType;
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

export interface NewsRequest {
  date: Date;
  type: NewsType;
  symbol_id?: number;
  source_link: string;
  content: string;
}

export interface NewsResponse extends NewsRequest {
  id: number;
  parsed_items: NewsParsedResponse[];
}

export interface NewsParsedResponse {
  id: number;
  news_id: number;
  symbol_id?: number;
  content: string;
  sentiment: NewsSentiment;
  date: Date;
  type: NewsType;
  source_link: string;
  industry_tags: IndustryTag[];
}

export interface IndustryTag {
  id: number;
  name: string;
}
