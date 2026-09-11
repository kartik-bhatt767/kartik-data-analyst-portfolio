-- Retail Sales Performance Dashboard
-- Works in PostgreSQL-style SQL. Rename columns as needed for your BI tool.

-- 1. Executive KPI cards
SELECT
    COUNT(*) AS orders,
    ROUND(SUM(sales), 2) AS total_sales,
    ROUND(SUM(profit), 2) AS total_profit,
    ROUND(SUM(profit) / NULLIF(SUM(sales), 0) * 100, 2) AS profit_margin_pct,
    ROUND(AVG(discount) * 100, 2) AS average_discount_pct
FROM sales;

-- 2. Category performance
SELECT
    category,
    ROUND(SUM(sales), 2) AS total_sales,
    ROUND(SUM(profit), 2) AS total_profit,
    ROUND(SUM(profit) / NULLIF(SUM(sales), 0) * 100, 2) AS profit_margin_pct
FROM sales
GROUP BY category
ORDER BY total_sales DESC;

-- 3. Region performance
SELECT
    region,
    ROUND(SUM(sales), 2) AS total_sales,
    ROUND(SUM(profit), 2) AS total_profit,
    ROUND(SUM(profit) / NULLIF(SUM(sales), 0) * 100, 2) AS profit_margin_pct
FROM sales
GROUP BY region
ORDER BY total_sales DESC;

-- 4. Discount watch: find orders where discounting is hurting profit
SELECT
    orderdate,
    region,
    category,
    product,
    discount,
    sales,
    profit
FROM sales
WHERE discount >= 0.20 OR profit < 0
ORDER BY profit ASC;

-- 5. Monthly trend for the line chart
SELECT
    DATE_TRUNC('month', orderdate) AS month,
    ROUND(SUM(sales), 2) AS total_sales,
    ROUND(SUM(profit), 2) AS total_profit
FROM sales
GROUP BY DATE_TRUNC('month', orderdate)
ORDER BY month;
