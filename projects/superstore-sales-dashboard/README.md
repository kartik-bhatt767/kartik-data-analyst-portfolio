# Retail Sales Performance Dashboard

An entry-level data analysis project that turns a messy retail order table into a decision-ready sales and profit dashboard.

## Business question

Which regions, categories, and customer segments are driving revenue, and where is profit being lost to discounts?

## Tools

- Python (standard library for the reproducible summary)
- SQL (KPI and drill-down queries)
- Power BI or Excel (dashboard layer)

## What is included

- `data/sales.csv` — a small practice dataset with 36 retail orders
- `analysis.py` — calculates KPIs, category/region summaries, discount risk, and monthly trend
- `sql/kpi_queries.sql` — reusable SQL queries for a dashboard data model
- `outputs/insights.md` — generated findings and recommended actions

## Run the analysis

From this project folder:

```bash
python analysis.py
```

The script reads the CSV and regenerates `outputs/insights.md`. No external Python packages are required.

## Dashboard pages to build

1. **Executive overview:** sales, profit, margin, orders, and monthly trend
2. **Performance breakdown:** category, region, and segment comparisons
3. **Discount watch:** discount bands, profit margin, and orders with negative profit

## Portfolio takeaway

The finished dashboard should answer a business question in under one minute: where to grow, where to protect margin, and what action to take next.

> Note: this is a portfolio practice dataset created for the project. Replace it later with a larger public dataset or your own data and keep the same analysis workflow.
