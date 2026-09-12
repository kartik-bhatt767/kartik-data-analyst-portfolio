# Bike Sharing Capacity Planning & Forecasting

An advanced operations analytics case study built around the public [UCI Bike Sharing dataset](https://archive.ics.uci.edu/dataset/275/bike%2Bsharing%2Bdataset). It answers:

> How much capacity should the operation protect before the next demand bottleneck?

## What makes this project advanced

- 17,379 hourly observations and 3,292,679 rides across 24 months
- A filterable planning lab by season, day type, and weather
- A seasonal-naive baseline forecast with a six-period time-based holdout
- A model challenge comparing seasonal-naive, rolling three-month, and recent six-month baselines
- MAPE, MAE, and bias reporting so forecast quality is visible instead of implied
- Capacity and safety-buffer stress testing with an explainable action queue
- A sensitivity matrix showing how many windows remain exposed under different capacity assumptions
- Rolling z-score anomaly watch for unusual monthly demand periods
- Simple error bands around planning forecasts, clearly labeled as uncertainty rather than confidence intervals
- Explicit separation between observed demand and unmeasured inventory risk

## Workflow

1. Read the official hourly CSV from the UCI archive.
2. Translate source codes into readable season, day-type, and weather dimensions.
3. Aggregate demand by month, hour, and operating context.
4. Challenge three transparent baselines against the final six comparable periods.
5. Select the lowest-MAPE planning baseline and show MAE/bias alongside it.
6. Compare peak demand with adjustable capacity and safety-buffer assumptions.
7. Rank operating contexts by load and document the data needed for live dispatch decisions.

## Key definitions

- **Average rides / hour:** rides divided by source observations in the selected view.
- **Buffered peak load:** peak average demand divided by capacity plus the selected safety buffer.
- **Baseline MAPE:** mean absolute percentage error for same-month-prior-year predictions on the holdout.
- **MAE:** average absolute forecast error in rides per hour.
- **Bias:** average signed error; negative means the model tends to under-predict.
- **Anomaly score:** deviation from the previous three-month average, scaled by recent variation.
- **Capacity stress test:** a planning scenario, not a measured stockout or service-level estimate.

## Tools

- Python for ingestion, aggregation, reproducible findings, and forecast evaluation
- SQL for cohort, trend, and capacity-planning queries
- TypeScript and Next.js for the interactive planning lab

## Run the analysis

From this project folder:

```bash
python analysis.py
```

The command regenerates:

- `data/ride_summary.csv` — compact dashboard-ready data
- `outputs/insights.md` — findings, forecast framing, and limitations
- `app/projects/bike-sharing-operations/bike-data.ts` — typed dashboard data

The original archive is not committed. If `work/bike-sharing.zip` is missing, the script downloads the official UCI archive. The dataset is attributed to UCI and licensed under CC BY 4.0.

## Important limitations

This is a planning baseline, not a production forecast. The source has no station-level inventory, trip origins, trip destinations, maintenance downtime, events, or future weather forecasts. A production system would need daily or sub-hourly data, time-based retraining, forecast intervals, station-level stockout labels, and cost-sensitive capacity decisions.

## Interview preparation

The project story is: establish a reproducible demand baseline, test it on a later time window, stress the capacity assumption, and keep the operational data gap visible. The dashboard is designed to show not only the finding, but also how confident the analyst should be in the next decision.
