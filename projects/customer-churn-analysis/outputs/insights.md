# Customer churn findings

> Source: [IBM Telco Customer Churn sample](https://github.com/IBM/telco-customer-churn-on-icp4d).
> This is a fictional telco sample. The source contains no location or true usage-volume field; service depth is used as a transparent proxy.

## KPI snapshot

- **Customers:** 7,043
- **Churned customers:** 1,869
- **Overall churn rate:** 26.5%
- **Monthly recurring charges at risk:** $139,131

## What the data says

- Month-to-month contract, early tenure, and electronic-check billing are the main segments to investigate.
- The top scored risk decile churned at 67.9%, versus a 23.8% test baseline (2.8× lift).
- Location cannot be analyzed from this source; a production retention workflow needs city/state/region or service-area fields.

## Recommended actions

- Design an early-tenure onboarding intervention for month-to-month customers.
- Test billing-method education or autopay incentives, measuring incremental retention rather than assuming causality.
- Add location and actual usage data before prioritizing regional or engagement-based interventions.
