# Online Retail analysis findings

> Source: [UCI Online Retail](https://archive.ics.uci.edu/dataset/352/online%2Bretail), licensed CC BY 4.0.
> Revenue is `Quantity × UnitPrice`. The source has no cost field, so this analysis does not claim profit or margin.

## Data-quality snapshot

- **Raw transaction lines:** 541,909
- **Valid sales lines:** 530,104
- **Cancellation lines:** 9,288 (1.7% of raw lines)
- **Period:** Dec 2010 to Dec 2011
- **Valid revenue:** £10,666,685
- **Valid orders:** 19,960
- **Known customers:** 4,338

## What the data says

1. **UK is the largest market** at £9,025,222 in valid revenue.
2. **Other products is the largest product group** at £4,467,353; the group labels are transparent keyword-based feature engineering, not source columns.
3. **2011-11 is the strongest month** at £1,509,496; use this as a demand signal, not a causal conclusion.
4. **United Kingdom is the largest country** at £9,025,222; the UK is expected to dominate because this is a UK-based retailer.

## Recommended actions

- Monitor cancellations by market and product group before interpreting gross demand as retained revenue.
- Use the UK as the baseline market and compare Europe/APAC/Americas for expansion hypotheses.
- Validate product-group rules with a domain owner before using them in production reporting.
- Add cost, shipping, and customer-segment fields before making profitability or lifetime-value decisions.

## Reproducibility

Run `python scripts/process_uci_retail.py` from this project folder to regenerate the compact CSV, this report, and the dashboard data file.
