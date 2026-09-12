-- Bike Sharing Capacity Planning & Forecasting
-- PostgreSQL-style SQL for a raw table named bike_hourly.

-- 1. Executive demand KPIs
SELECT
    COUNT(*) AS hourly_records,
    SUM(cnt) AS total_rides,
    ROUND(AVG(cnt), 0) AS average_rides_per_hour,
    ROUND(SUM(registered) * 100.0 / NULLIF(SUM(cnt), 0), 2) AS registered_share_pct
FROM bike_hourly;

-- 2. Hourly pressure profile using comparable observations
SELECT
    hr AS hour,
    ROUND(AVG(cnt), 1) AS average_rides_per_hour,
    PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY cnt) AS p90_rides_per_hour,
    COUNT(*) AS observations
FROM bike_hourly
GROUP BY hr
ORDER BY average_rides_per_hour DESC;

-- 3. Monthly baseline series for forecasting and holdout evaluation
WITH monthly AS (
    SELECT
        DATE_TRUNC('month', dteday)::date AS month,
        SUM(cnt) AS total_rides,
        COUNT(*) AS observations,
        AVG(cnt) AS average_rides_per_hour
    FROM bike_hourly
    GROUP BY DATE_TRUNC('month', dteday)::date
),
seasonal_naive AS (
    SELECT
        current_month.month,
        current_month.average_rides_per_hour AS actual,
        prior_year.average_rides_per_hour AS seasonal_prediction,
        ABS(current_month.average_rides_per_hour - prior_year.average_rides_per_hour)
            / NULLIF(current_month.average_rides_per_hour, 0) AS absolute_pct_error
    FROM monthly AS current_month
    LEFT JOIN monthly AS prior_year
        ON prior_year.month = (current_month.month - INTERVAL '1 year')::date
)
SELECT *
FROM seasonal_naive
ORDER BY month;

-- 4. Capacity stress test by operating context
-- Replace 425 with the planning capacity assumption.
WITH context_peak AS (
    SELECT
        workingday,
        weathersit,
        hr,
        AVG(cnt) AS average_rides_per_hour,
        COUNT(*) AS observations
    FROM bike_hourly
    GROUP BY workingday, weathersit, hr
),
ranked AS (
    SELECT *, ROW_NUMBER() OVER (
        PARTITION BY workingday, weathersit
        ORDER BY average_rides_per_hour DESC
    ) AS peak_rank
    FROM context_peak
)
SELECT
    workingday,
    weathersit,
    hr AS peak_hour,
    ROUND(average_rides_per_hour, 1) AS peak_average,
    ROUND(average_rides_per_hour * 100.0 / 425, 1) AS load_pct,
    CASE
        WHEN average_rides_per_hour > 425 * 1.15 THEN 'Critical'
        WHEN average_rides_per_hour > 425 * 0.95 THEN 'Watch'
        ELSE 'Covered'
    END AS risk_band
FROM ranked
WHERE peak_rank = 1
ORDER BY load_pct DESC;

-- 5. Monthly anomaly watch against a three-month rolling baseline
WITH monthly AS (
    SELECT DATE_TRUNC('month', dteday)::date AS month, AVG(cnt) AS average_rides_per_hour
    FROM bike_hourly
    GROUP BY DATE_TRUNC('month', dteday)::date
)
SELECT
    month,
    ROUND(average_rides_per_hour, 1) AS actual_average,
    ROUND(AVG(average_rides_per_hour) OVER (
        ORDER BY month ROWS BETWEEN 3 PRECEDING AND 1 PRECEDING
    ), 1) AS prior_three_month_baseline
FROM monthly
ORDER BY month;
