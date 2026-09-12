-- Customer Churn Analysis: SQL starter queries
-- Replace `telco_customer_churn` with the warehouse table name.

-- Overall churn and monthly charge exposure
SELECT
  COUNT(*) AS customers,
  SUM(CASE WHEN Churn = 'Yes' THEN 1 ELSE 0 END) AS churned_customers,
  AVG(CASE WHEN Churn = 'Yes' THEN 1.0 ELSE 0.0 END) AS churn_rate,
  SUM(CASE WHEN Churn = 'Yes' THEN MonthlyCharges ELSE 0 END) AS churned_monthly_charges
FROM telco_customer_churn;

-- Contract cohorts
SELECT
  Contract,
  COUNT(*) AS customers,
  SUM(CASE WHEN Churn = 'Yes' THEN 1 ELSE 0 END) AS churned_customers,
  AVG(CASE WHEN Churn = 'Yes' THEN 1.0 ELSE 0.0 END) AS churn_rate,
  SUM(CASE WHEN Churn = 'Yes' THEN MonthlyCharges ELSE 0 END) AS churned_monthly_charges
FROM telco_customer_churn
GROUP BY Contract
ORDER BY churn_rate DESC;

-- Early-tenure pressure
SELECT
  CASE
    WHEN tenure <= 6 THEN '0-6 months'
    WHEN tenure <= 12 THEN '7-12 months'
    WHEN tenure <= 24 THEN '13-24 months'
    WHEN tenure <= 48 THEN '25-48 months'
    ELSE '49+ months'
  END AS tenure_band,
  COUNT(*) AS customers,
  AVG(CASE WHEN Churn = 'Yes' THEN 1.0 ELSE 0.0 END) AS churn_rate
FROM telco_customer_churn
GROUP BY 1
ORDER BY MIN(tenure);

-- The source has no location or true usage-volume fields.
-- Do not add a location analysis until a real geography join is supplied.
