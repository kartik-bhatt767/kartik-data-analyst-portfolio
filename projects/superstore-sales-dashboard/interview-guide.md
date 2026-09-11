# Interview guide

## 30-second project explanation

I built a retail sales performance dashboard to help a manager understand where revenue is coming from and where discounts are reducing profit. I used a small order-level dataset, calculated sales, profit, margin, and loss-making orders with Python, wrote reusable SQL queries, and built an interactive dashboard with region and category filters. The main finding was that Technology led revenue, while South had the highest sales but the weakest margin.

## The business question

Where should the business grow, and where should it protect margin?

## Metric definitions

- **Sales:** the sum of order revenue.
- **Profit:** the sum of order profit after the order-level costs represented in the data.
- **Profit margin:** `total profit / total sales`.
- **Loss-making order:** an order where `profit < 0`.
- **Discount risk:** a high-discount order that needs a profit check before being scaled.

## Questions an interviewer may ask

### Why did you choose these KPIs?

Sales shows scale, while profit and margin show whether that scale is healthy. Loss-making orders make the discount problem visible instead of hiding it inside an overall average.

### What did you do first?

I started with the business question, checked the available fields, then grouped the order data by category, region, and month. I kept the dashboard focused on decisions rather than adding charts that did not answer the question.

### What is the most important finding?

South is the largest region by sales but has the weakest margin in this sample. That means a manager should investigate pricing, product mix, and discounting before treating South as the best growth opportunity.

### What are the limitations?

The dataset is small and created for practice, so the findings are directional rather than a production forecast. It does not include customer-level history, shipping cost, inventory, or a longer period for reliable seasonality analysis.

### What would you do next?

Replace the practice data with a larger public dataset, add data-quality checks, connect a real BI dashboard, and test whether discount bands have a statistically meaningful relationship with margin.

## What this project demonstrates

- Translating a business question into measurable KPIs
- Grouping and summarising data with Python and SQL
- Building a dashboard that responds to user filters
- Separating a finding from a recommendation
- Communicating limitations instead of overstating the result
