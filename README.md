# Kartik Bhatt — Data Analyst Portfolio

Portfolio website and analytics projects by Kartik Bhatt, a third-year B.Tech CSE (AI/ML) student based in Lucknow, India.

## Featured project

### Online Retail Revenue & Returns Analysis

An end-to-end retail analytics case study that answers:

> Where is demand coming from, and where is revenue leaking through cancellations?

The project includes:

- Python ingestion and data-quality workflow for the public UCI Online Retail dataset
- SQL queries for revenue, order, and cancellation KPIs
- An interactive dashboard with market and product-group filters
- Business recommendations and limitations
- An interview guide explaining the decisions behind the work

Open the project files in [`projects/superstore-sales-dashboard`](./projects/superstore-sales-dashboard).

### Customer Churn Analysis

An intermediate retention case study using the public IBM Telco Customer Churn sample. It combines cohort segmentation, churned monthly-charge exposure, and a held-out logistic-regression baseline for customer prioritization.

The source contains 7,043 customers but no location or true usage-volume field. The project keeps that limitation visible and uses service depth only as a documented proxy.

Open the project files in [`projects/customer-churn-analysis`](./projects/customer-churn-analysis).

The earlier bank-marketing model remains available as an additional modeling exercise in [`projects/bank-marketing-campaign`](./projects/bank-marketing-campaign).

### Bike Sharing Operations Analysis

An operations case study using hourly demand, season, weather, and day-type signals to explore capacity-planning decisions.

Open the project files in [`projects/bike-sharing-operations`](./projects/bike-sharing-operations).

## Run the portfolio locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Run the analysis

```bash
cd projects/superstore-sales-dashboard
python analysis.py

cd ../customer-churn-analysis
python analysis.py
```

Each analysis writes a findings report and regenerates its dashboard data.

## About

I am building my foundation in SQL, Python, Excel, Power BI, statistics, and business intelligence through a B.Tech in Computer Science Engineering with AI/ML.

- [LinkedIn](https://www.linkedin.com/in/kartik-bhatt-33bbb02b7/)
- [GitHub](https://github.com/kartik-bhatt767)
- [Kaggle](https://www.kaggle.com/kartikbhatt5533)
