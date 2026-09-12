# Churn risk model

> Model: regularized logistic-regression baseline implemented with the Python standard library.
> Service depth is a proxy for product breadth; no post-churn fields are used.

## Evaluation

- Train: 4,930 records
- Validation: 704 records
- Test: 1,409 records
- Features: 46
- Split: reproducible random holdout with seed 42

## Test results

- ROC-AUC: 0.820
- Precision: 50.7%
- Recall: 71.7%
- F1: 0.594
- Top-decile churn rate: 67.9% (2.8× baseline)

## Limitations

- This is a prioritization baseline, not a causal retention model.
- The data lacks location, actual usage volume, intervention history, retention value, and time-varying snapshots.
- A production model needs time-based validation, calibration, cost-sensitive thresholding, and an intervention experiment.
