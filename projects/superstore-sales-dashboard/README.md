# Online Retail Revenue & Returns Analysis

An end-to-end retail analytics case study built around the public [UCI Online Retail dataset](https://archive.ics.uci.edu/dataset/352/online%2Bretail). The project answers a practical question:

> Where is demand coming from, and where is revenue leaking through cancellations?

## What the analysis shows

- 541,909 raw transaction lines across December 2010 to December 2011
- 530,104 valid sales lines after data-quality rules
- £10.67M in valid revenue across 19,960 orders
- 9,288 cancellation lines that need to be separated from gross demand
- The source has no cost field, so this project does not invent profit or margin

## Workflow

1. Read the official Excel workbook without relying on a spreadsheet application.
2. Treat invoices beginning with `C`, non-positive quantities, and non-positive prices as cancellation/invalid lines.
3. Calculate revenue as `Quantity × UnitPrice`.
4. Create transparent market groups from country and product groups from documented description keywords.
5. Generate a compact summary CSV, a written findings report, and the data used by the interactive dashboard.
6. Present the result in a filterable Next.js dashboard with market and product-group controls.

## Tools

- Python standard library for reproducible ingestion and cleaning
- SQL for KPI and drill-down query design
- TypeScript and Next.js for the interactive dashboard layer
- CSS/SVG for the dashboard charts

## Run the analysis

From this project folder:

```bash
python analysis.py
```

The command runs `scripts/process_uci_retail.py` and regenerates:

- `data/online_retail_summary.csv` — compact dashboard-ready data
- `outputs/real-insights.md` — findings, limitations, and recommended actions
- `app/projects/superstore-sales-dashboard/dashboard-data.ts` — typed dashboard data

The original UCI workbook is not committed because it is large. If `work/online-retail.zip` is not present, the script downloads the official archive. The dataset is attributed to UCI and licensed under CC BY 4.0.

## Important analytical limitation

This dataset contains quantity and unit price, but not product cost, shipping cost, or a reliable customer segment. The analysis therefore reports revenue, orders, units, average order value, and cancellation rate. Profitability and lifetime-value claims require additional business data.

## Interview preparation

See [`interview-guide.md`](./interview-guide.md) for the 30-second explanation, metric definitions, limitations, and likely follow-up questions.

## Dashboard

Open the portfolio locally and select **Retail sales, without the fog**. The project page has the live dashboard and the case-study narrative.
