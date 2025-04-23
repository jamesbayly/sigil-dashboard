export interface Trades {
  id: number;
  strategy_id: number;
  symbol_id: number;
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

export interface Strategy {
  id: number;
  name: string;
  status: "active" | "inactive" | "test";
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

export interface Symbols {
  id: number;
  name: string;
  symbol: string;
  binance_ticker: string;
  market_cap?: number;
  day_change_percent: number;
  hour_change_percent: number;
  cg_rank?: number;
  cg_id: string;
}
