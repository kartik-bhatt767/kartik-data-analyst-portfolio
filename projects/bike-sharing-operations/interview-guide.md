# Interview guide

## 30-second project explanation

I built an operations planning lab using 17,379 hourly observations from the public UCI Bike Sharing dataset. I translated coded fields into operating dimensions, challenged three transparent demand baselines on a later six-period holdout, and made the capacity assumption interactive. The result ranks which hour and context should receive protection first, while clearly separating demand evidence from station-level inventory claims.

## Business question

How much capacity should the operation protect before the next demand bottleneck?

## Why this is more than a dashboard

- The forecast has a time-based holdout and reports MAPE.
- Three simple baselines are challenged, so the selected model has to earn its place.
- The capacity scenario exposes the assumption instead of hiding it.
- The stress-test queue converts analysis into an operating action.
- The sensitivity matrix shows whether the decision is robust to capacity assumptions.
- The anomaly watch flags periods worth investigating without calling them failures.
- The limitations explain exactly what data is missing for live rebalancing.

## Questions an interviewer may ask

### Why use a seasonal-naive baseline?

It is a strong, explainable benchmark for a two-year seasonal dataset. Before using a more complex model, I want to know whether the complexity beats a same-month-prior-year baseline on a time-ordered holdout.

### What did the model comparison show?

The rolling three-month baseline performed better than the seasonal-naive baseline on this compact monthly series: about 19.3% MAPE versus 35.1% on the six-period holdout. I would not call that a universal win; I would retest by segment and with daily data before production use.

### Why is the holdout time-based?

Random splitting would let future patterns leak into training. A later-period holdout better represents how the model would behave when planning for a future operating period.

### What does MAPE tell you here?

It summarizes relative forecast error across the holdout. It is useful for a baseline comparison, but I would also add weighted error, prediction intervals, and business cost because a miss during the evening peak matters more than a miss at a quiet hour.

### Why report MAE and bias too?

MAPE is relative and can over-emphasize small denominators. MAE puts the error back in rides per hour, while bias tells me whether the plan systematically under- or over-estimates demand.

### How did you choose capacity?

The dashboard starts with a transparent scenario value and lets the user change it. It is not presented as a measured fleet limit because the dataset has no inventory, station capacity, or stockout labels.

### What does the action queue mean?

It ranks day-type and weather contexts by peak average demand relative to the selected capacity plus buffer. “Critical” means the scenario is exposed; it does not prove that a stockout occurred.

### Can you recommend where to move bikes?

Not from this source alone. I would join station inventory, trip origins and destinations, maintenance downtime, events, and weather forecasts before recommending a route or dispatch decision.

### What would you do next?

Build a station-level forecast with rolling retraining, prediction intervals, cost-sensitive thresholds, and an intervention evaluation that measures whether additional capacity actually reduces lost demand.

## What this project demonstrates

- Time-series aggregation and time-based validation
- Forecast baseline selection and error measurement
- Capacity scenario design and sensitivity analysis
- Anomaly detection used as an investigation queue
- SQL-ready operations KPI definitions
- Honest communication of data limitations
