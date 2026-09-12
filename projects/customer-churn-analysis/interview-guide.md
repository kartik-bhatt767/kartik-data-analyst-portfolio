# Interview guide

## 30-second project pitch

I analyzed 7,043 telecom customers to understand cancellation pressure and make retention prioritization more concrete. I created cohorts by contract, tenure, service breadth, payment method, and monthly charges, then measured both churn rate and recurring charges attached to churn. I added a regularized logistic-regression baseline on a held-out test set and reported ROC-AUC, precision, recall, confusion-matrix counts, and lift by risk decile. The main limitation is that the public sample has no location, true usage volume, intervention history, or time-varying snapshots, so I treated service breadth as a proxy and framed the model as a prioritization baseline.

## Questions this project can answer

- Which contract or tenure cohorts have the highest observed churn rate?
- Which cohorts combine high churn with meaningful monthly-charge exposure?
- How many customers would a chosen risk threshold reach?
- Does the top risk decile contain more churners than a random selection?

## Questions an interviewer may ask

### Why is churn rate not enough?

Small cohorts can have a high rate but little business exposure. I show churn rate alongside churned monthly charges so a retention team can balance risk and scale.

### Why did you not analyze location and usage?

Those fields are not present in the IBM sample. I did not fabricate them. I made the data gap visible and listed the production join needed before making geographic or engagement claims.

### Is service depth the same as product usage?

No. It counts subscribed services and is labeled as a product-breadth proxy. Actual usage would require events, sessions, volume, or activity recency.

### Is the model causal?

No. The model ranks historical patterns for follow-up. It does not prove that contract type, billing method, or any other feature causes churn.

### What would you improve next?

Add time-based snapshots, customer value, intervention history, location, actual usage, calibration, cost-sensitive threshold selection, and an A/B-tested retention intervention.
