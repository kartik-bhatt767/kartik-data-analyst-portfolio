# Customer Churn Analysis

Intermediate customer-retention case study built from the [IBM Telco Customer Churn sample](https://github.com/IBM/telco-customer-churn-on-icp4d/blob/master/data/Telco-Customer-Churn.csv).

## Business question

Which customer cohorts show the most cancellation pressure, how much recurring monthly charge is attached to churn, and how could a retention team prioritize follow-up?

## What is included

- Reproducible Python preparation script using only the standard library.
- Cohorts by contract, tenure, internet service, payment method, service depth, and monthly charge band.
- Monthly recurring-charge exposure from customers marked as churned.
- A retention queue that translates the risk ranking into suggested follow-up actions.
- A regularized logistic-regression baseline with a reproducible 70/10/20 holdout split.
- Held-out ROC-AUC, precision, recall, F1, confusion matrix, and lift by risk decile.
- SQL starter queries and an interview guide for explaining the analysis.

## Run it

From this directory:

```bash
python analysis.py
```

The script downloads the public CSV into the repository `work/` folder when it is not present, then writes:

- `data/churn_summary.csv`
- `data/churn_scores.csv`
- `data/retention_queue.csv`
- `outputs/insights.md`
- `outputs/model-report.md`
- `outputs/model_metrics.json`
- `outputs/feature-importance.csv`
- `app/projects/customer-churn-analysis/churn-data.ts`

## Important limitations

The source is a fictional telco sample. It has no location, actual usage-volume, intervention-history, customer-value, or time-varying snapshot fields. `service_count` is therefore a transparent product-breadth proxy, not usage. The model is a prioritization baseline, not a causal model. A production version should add time-based validation, calibration, intervention cost, retention value, and an experiment design.
