# Interview guide

## 30-second project explanation

I built an interactive retail revenue and cancellation dashboard using the public UCI Online Retail dataset. I ingested 541,909 transaction lines with Python, removed invalid sales lines, identified cancellations from invoice flags, calculated revenue as quantity multiplied by unit price, and created transparent market and product-group dimensions. The dashboard lets a user compare markets and product groups over time. The main finding is that the UK drives most revenue, while cancellations must be separated from gross demand before making growth decisions.

## The business question

Where is demand coming from, and where is revenue leaking through cancellations?

## Metric definitions

- **Valid revenue:** `Quantity × UnitPrice` for lines that are not cancellations and have positive quantity and price.
- **Order:** a distinct valid `InvoiceNo`.
- **Average order value:** valid revenue divided by valid orders.
- **Cancellation line:** a source line whose `InvoiceNo` begins with `C`.
- **Cancellation rate:** cancellation orders divided by valid orders plus cancellation orders for the selected dashboard slice.
- **Product group:** a documented keyword-based feature derived from `Description`; it is not an original source column.

## Questions an interviewer may ask

### Why did you choose these KPIs?

Revenue shows scale, orders show demand frequency, average order value gives context to revenue, and cancellation rate prevents gross demand from being treated as retained demand.

### What did you do first?

I inspected the available fields and checked data quality before choosing KPIs. The source has quantity, unit price, invoice status, customer ID, and country, but no cost field. That led me to focus on revenue and cancellations instead of inventing profit or margin.

### How did you handle cancellations?

The UCI documentation identifies cancellations through invoice numbers beginning with `C`. I kept them in the ingestion step so they could be measured, but excluded them from valid revenue and valid-order KPIs. Non-positive quantities and prices are also excluded from valid sales.

### What is the most important finding?

The UK is the dominant market in this dataset. The useful business action is not simply “sell more in the UK”; it is to use the UK as a baseline and investigate whether other markets have enough demand and manageable cancellation rates to justify expansion.

### Why did you create product groups?

The source has product descriptions but no product category field. I created a small, explicit keyword mapping so the dashboard could compare broad groups. I documented the rule and would validate it with a business owner before using it in production.

### What are the limitations?

The dataset does not include product cost, shipping cost, marketing spend, or a reliable customer segment. Product groups are heuristic, and the period is historical. The result is a directional case study, not a production forecast or profitability model.

### What would you do next?

Add cost and shipping data, validate the product taxonomy, build a return/cancellation reason field, and test whether customer cohorts and market-level retention explain the observed revenue pattern.

## What this project demonstrates

- Translating a business question into measurable KPIs
- Reproducible ingestion and data-quality rules with Python
- Feature engineering with documented assumptions
- SQL design for reusable revenue and cancellation metrics
- Building a dashboard that responds to user filters
- Communicating limitations instead of overstating the result
