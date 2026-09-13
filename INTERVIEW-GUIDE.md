# Kartik Bhatt — Interview Guide

## 30-second introduction

I am Kartik Bhatt, a third-year B.Tech Computer Science Engineering student specializing in AI/ML. I use Python, SQL, pandas, statistics, and dashboard thinking to turn messy data into business decisions. My portfolio covers retail revenue and cancellations, customer retention prioritization, and bike-sharing capacity planning. Across the projects, I focus on data quality, transparent assumptions, reproducible analysis, and recommendations that a manager could act on.

## Project 1 — Retail Revenue & Returns

**Business question:** Where is demand coming from, and where is revenue leaking through cancellations?

**What I did:** Cleaned transaction records, separated valid sales from cancellations, created transparent market and product-group features, and built an interactive dashboard.

**Evidence to discuss:** £10.67M valid revenue, 19,960 valid orders, and a 23.1% cancellation rate in the analyzed source snapshot.

**Recommendation:** Investigate cancellation-heavy markets and product groups before interpreting gross demand as retained revenue.

**Limitation:** The source has no cost field, so the analysis does not claim profit or margin.

## Project 2 — Customer Churn Analysis

**Business question:** Which customers should a retention team prioritize, and why?

**What I did:** Built comparable customer cohorts, quantified recurring-charge exposure, trained a regularized logistic-regression baseline, and evaluated it on held-out records.

**Evidence to discuss:** 7,043 customers, 26.5% overall churn, ROC-AUC of 0.82, and a top-risk-decile churn rate of 67.9% in the test view.

**Recommendation:** Start with early-tenure, month-to-month customers and test onboarding or billing interventions rather than treating model features as causal explanations.

**Limitation:** The source does not contain location or true usage-volume fields, so those should be added before production deployment.

## Project 3 — Bike Sharing Capacity Planning

**Business question:** How much capacity should the operation protect before demand moves?

**What I did:** Compared transparent forecasting baselines on a time-based holdout, examined anomalies, and stress-tested capacity and safety-buffer assumptions across operating contexts.

**Evidence to discuss:** 17,379 hourly records, a selected rolling three-month baseline with 19.3% holdout MAPE, and scenario-based capacity risk comparisons.

**Recommendation:** Protect the evening peak first, then validate the plan using live station inventory, trip flow, maintenance, events, and weather data.

**Limitation:** The public source does not include station-level stock or trip-flow data, so the dashboard identifies pressure windows rather than dispatch routes.

## Questions I can answer clearly

- How did you validate the data before calculating KPIs?
- Which assumptions were documented instead of hidden inside the code?
- Why did you choose a baseline model before a more complex model?
- How did you separate correlation from causation?
- What would you collect next if this became a production project?
- How would a manager use the dashboard in a weekly decision meeting?

## Simple answer structure

Use this order for any project: **business question → data quality → method → evidence → recommendation → limitation → next test**.

Avoid saying that a model proves why a customer churned, that revenue equals profit, or that a demand forecast knows station-level inventory. The strongest part of this portfolio is that the boundaries of the evidence are visible.
