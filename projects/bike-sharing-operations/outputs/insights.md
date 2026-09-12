# Bike sharing capacity planning findings

> Source: [UCI Bike Sharing](https://archive.ics.uci.edu/dataset/275/bike%2Bsharing%2Bdataset), licensed CC BY 4.0.
> This is a planning baseline. Without station-level inventory, it cannot prove where bikes should be rebalanced.

## KPI snapshot

- **Hourly records:** 17,379
- **Total rides:** 3,292,679
- **Average rides per hourly record:** 189
- **Peak hour:** 17:00, with 461.5 average rides per comparable hourly observation
- **Coverage:** 24 months across 2011–2012

## Baseline forecast evidence

The dashboard challenges three transparent baselines on the final 6-period holdout. The **Rolling 3-month** model performs best at **19.3% MAPE**, compared with **35.1%** for the seasonal-naive benchmark. Its average absolute error is **39.0 rides per hour** with a bias of **+22.7**.

That is useful evidence, not a production forecast. The next version needs daily data, prediction intervals, calendar features, weather forecasts, and rolling time-based validation.

## What the data says

1. **17:00 is the pressure point** at 461.5 average rides per comparable hourly observation.
2. **2012-09 is the strongest month** at 303.6 average rides per recorded hour.
3. **The capacity queue is scenario-based.** Its risk band changes when the planner changes capacity and safety buffer.
4. **Forecast error is operationally meaningful.** A 39-ride average error is easier to plan around than an unqualified accuracy label, but it still needs station-level validation.

## Operations notes

- Protect the peak window first, then split the plan by day type and weather.
- Use a buffer explicitly; do not hide uncertainty inside one capacity number.
- Add station availability, maintenance downtime, trip origins and destinations, events, and weather forecasts before recommending rebalancing routes.

## Reproducibility

Run `python analysis.py` from this project folder to regenerate the compact summary, findings report, and typed dashboard data.
