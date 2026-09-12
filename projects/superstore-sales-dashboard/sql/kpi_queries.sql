-- Online Retail Revenue & Returns Analysis
-- PostgreSQL-style SQL for a raw table named online_retail.
-- The source fields are InvoiceNo, StockCode, Description, Quantity,
-- InvoiceDate, UnitPrice, CustomerID, and Country.

-- 1. Executive KPI cards: valid sales only
WITH valid_sales AS (
    SELECT
        *,
        quantity * unitprice AS revenue
    FROM online_retail
    WHERE invoiceno NOT LIKE 'C%'
      AND quantity > 0
      AND unitprice > 0
)
SELECT
    COUNT(DISTINCT invoiceno) AS orders,
    ROUND(SUM(revenue), 2) AS valid_revenue,
    COUNT(DISTINCT customerid) AS known_customers,
    SUM(quantity) AS units,
    ROUND(SUM(revenue) / NULLIF(COUNT(DISTINCT invoiceno), 0), 2) AS average_order_value
FROM valid_sales;

-- 2. Cancellation watch: keep cancellations visible, but separate from sales
SELECT
    country,
    COUNT(DISTINCT invoiceno) AS cancelled_orders,
    COUNT(*) AS cancelled_lines,
    ROUND(SUM(ABS(quantity * unitprice)), 2) AS cancelled_line_value
FROM online_retail
WHERE invoiceno LIKE 'C%'
GROUP BY country
ORDER BY cancelled_line_value DESC;

-- 3. Market performance by country
WITH valid_sales AS (
    SELECT *, quantity * unitprice AS revenue
    FROM online_retail
    WHERE invoiceno NOT LIKE 'C%'
      AND quantity > 0
      AND unitprice > 0
)
SELECT
    country,
    ROUND(SUM(revenue), 2) AS valid_revenue,
    COUNT(DISTINCT invoiceno) AS orders,
    COUNT(DISTINCT customerid) AS known_customers
FROM valid_sales
GROUP BY country
ORDER BY valid_revenue DESC;

-- 4. Monthly revenue trend
WITH valid_sales AS (
    SELECT *, quantity * unitprice AS revenue
    FROM online_retail
    WHERE invoiceno NOT LIKE 'C%'
      AND quantity > 0
      AND unitprice > 0
)
SELECT
    DATE_TRUNC('month', invoicedate) AS month,
    ROUND(SUM(revenue), 2) AS valid_revenue,
    COUNT(DISTINCT invoiceno) AS orders,
    SUM(quantity) AS units
FROM valid_sales
GROUP BY DATE_TRUNC('month', invoicedate)
ORDER BY month;

-- 5. Products with the highest cancelled line value
SELECT
    stockcode,
    description,
    ROUND(SUM(ABS(quantity * unitprice)), 2) AS cancelled_line_value,
    COUNT(*) AS cancelled_lines
FROM online_retail
WHERE invoiceno LIKE 'C%'
GROUP BY stockcode, description
ORDER BY cancelled_line_value DESC
LIMIT 20;
