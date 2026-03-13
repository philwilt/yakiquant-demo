export interface GlossaryEntry {
  label: string;
  explanation: string;
  learnMoreUrl: string;
}

export const GLOSSARY = {
  total_pnl: {
    label: "Total P&L",
    explanation:
      "Profit & Loss — the total dollar gain or loss across all trades since the account started. Positive means you're up money; negative means you're down.",
    learnMoreUrl: "https://www.investopedia.com/terms/p/plstatement.asp",
  },
  sharpe_ratio: {
    label: "Sharpe Ratio",
    explanation:
      "Measures how much return you earn per unit of risk. Above 1.0 is good; above 2.0 is excellent. It rewards steady gains and penalizes wild swings.",
    learnMoreUrl: "https://www.investopedia.com/terms/s/sharperatio.asp",
  },
  max_drawdown: {
    label: "Max Drawdown",
    explanation:
      "The largest peak-to-trough decline in portfolio value. A 20% max drawdown means the account once fell 20% from its highest point before recovering.",
    learnMoreUrl: "https://www.investopedia.com/terms/m/maximum-drawdown-mdd.asp",
  },
  win_rate: {
    label: "Win Rate",
    explanation:
      "The percentage of closed trades that ended in profit. 60% means 6 out of every 10 trades were winners. Win rate alone doesn't tell the full story — the size of wins vs. losses matters too.",
    learnMoreUrl: "https://www.investopedia.com/terms/w/win-loss-ratio.asp",
  },
  profit_factor: {
    label: "Profit Factor",
    explanation:
      "Total gross profit divided by total gross loss. A value above 1.0 means the strategy makes more than it loses. 1.5 or higher is typically considered healthy.",
    learnMoreUrl: "https://www.investopedia.com/terms/p/profit-factor.asp",
  },
  open_positions: {
    label: "Open Positions",
    explanation:
      "The number of stocks currently held in the portfolio. Each open position is a trade that has been entered but not yet exited.",
    learnMoreUrl: "https://www.investopedia.com/terms/o/open-position.asp",
  },
  avg_win: {
    label: "Avg Win",
    explanation:
      "The average dollar profit on winning trades. Comparing this to the average loss shows whether winners are large enough to offset losers.",
    learnMoreUrl: "https://www.investopedia.com/terms/a/averagereturn.asp",
  },
  daily_pnl: {
    label: "Daily P&L",
    explanation:
      "Today's total gain or loss in dollars. It reflects intraday price movement on open positions plus any trades closed today.",
    learnMoreUrl: "https://www.investopedia.com/terms/d/dailychart.asp",
  },
  equity_curve: {
    label: "Equity Curve",
    explanation:
      "A chart of total portfolio value over time. A steadily rising line with shallow dips is the goal — it means consistent, low-risk growth.",
    learnMoreUrl: "https://www.investopedia.com/terms/e/equity-curve.asp",
  },
  alpha: {
    label: "Alpha (α)",
    explanation:
      "The portfolio's return minus the S&P 500 benchmark (SPY) return. Positive alpha means the portfolio outperformed the broader market over the selected period.",
    learnMoreUrl: "https://www.investopedia.com/terms/a/alpha.asp",
  },
  exposure: {
    label: "Exposure",
    explanation:
      "The total value currently invested in stocks (not sitting in cash). High exposure means more of the account is at risk; lower means more is in cash.",
    learnMoreUrl: "https://www.investopedia.com/terms/m/marketexposure.asp",
  },
  drawdown: {
    label: "Drawdown",
    explanation:
      "The percentage decline from the most recent portfolio peak to the current value. It resets to 0% whenever the portfolio reaches a new high.",
    learnMoreUrl: "https://www.investopedia.com/terms/d/drawdown.asp",
  },
  buying_power: {
    label: "Buying Power",
    explanation:
      "Cash available to purchase new positions. In this paper-trading account it reflects uninvested cash.",
    learnMoreUrl: "https://www.investopedia.com/terms/b/buyingpower.asp",
  },
} satisfies Record<string, GlossaryEntry>;

export type GlossaryKey = keyof typeof GLOSSARY;
