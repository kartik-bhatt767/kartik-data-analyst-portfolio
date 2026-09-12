"""Build a compact, reproducible demand dataset from UCI Bike Sharing."""

from __future__ import annotations

import csv
import io
import urllib.request
import zipfile
from collections import defaultdict
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
WORK_ROOT = PROJECT_ROOT.parents[1] / "work"
LOCAL_ARCHIVE = WORK_ROOT / "bike-sharing.zip"
ARCHIVE_URL = "https://archive.ics.uci.edu/static/public/275/bike+sharing+dataset.zip"
SUMMARY_FILE = PROJECT_ROOT / "data" / "ride_summary.csv"
INSIGHTS_FILE = PROJECT_ROOT / "outputs" / "insights.md"
TS_FILE = PROJECT_ROOT.parents[1] / "app" / "projects" / "bike-sharing-operations" / "bike-data.ts"

SEASONS = {"1": "Winter", "2": "Spring", "3": "Summer", "4": "Fall"}
WEATHER = {"1": "Clear", "2": "Mist / cloudy", "3": "Light rain / snow", "4": "Heavy rain / snow"}
DAY_TYPES = {"1": "Working day", "0": "Weekend / holiday"}


def ensure_source() -> Path:
    if LOCAL_ARCHIVE.exists():
        return LOCAL_ARCHIVE
    LOCAL_ARCHIVE.parent.mkdir(parents=True, exist_ok=True)
    print(f"Downloading {ARCHIVE_URL}")
    urllib.request.urlretrieve(ARCHIVE_URL, LOCAL_ARCHIVE)
    return LOCAL_ARCHIVE


def iter_rows(archive_path: Path):
    with zipfile.ZipFile(archive_path) as archive:
        raw = archive.read("hour.csv")
    yield from csv.DictReader(io.StringIO(raw.decode("utf-8")))


def empty_bucket() -> dict[str, float | int]:
    return {"rides": 0, "registered": 0, "casual": 0, "records": 0, "temp_total": 0.0, "humidity_total": 0.0}


def add(bucket: dict, row: dict[str, str]) -> None:
    bucket["rides"] += int(row["cnt"])
    bucket["registered"] += int(row["registered"])
    bucket["casual"] += int(row["casual"])
    bucket["records"] += 1
    bucket["temp_total"] += float(row["temp"])
    bucket["humidity_total"] += float(row["hum"])


def serialize(bucket: dict) -> dict[str, int | float]:
    records = bucket["records"] or 1
    return {
        "rides": int(bucket["rides"]),
        "registered": int(bucket["registered"]),
        "casual": int(bucket["casual"]),
        "records": int(bucket["records"]),
        "averageTemp": round(bucket["temp_total"] / records, 4),
        "averageHumidity": round(bucket["humidity_total"] / records, 4),
    }


def pct(value: float) -> str:
    return f"{value * 100:.1f}%"


def seasonal_mape(month_averages: dict[str, float], months: list[str]) -> tuple[float, int]:
    errors = []
    for month in months[-6:]:
        year, number = month.split("-")
        prior = month_averages.get(f"{int(year) - 1:04d}-{number}")
        if prior is not None:
            errors.append(abs(month_averages[month] - prior) / max(month_averages[month], 1))
    return (sum(errors) / len(errors) * 100 if errors else 0.0, len(errors))


def compare_models(month_averages: dict[str, float], months: list[str]) -> dict[str, dict[str, float | int]]:
    holdout = months[-6:]
    predictions = {"Seasonal naive": [], "Rolling 3-month": [], "Recent 6-month": []}
    for month in holdout:
        index = months.index(month)
        year, number = month.split("-")
        prior = month_averages.get(f"{int(year) - 1:04d}-{number}")
        if prior is not None:
            predictions["Seasonal naive"].append((month_averages[month], prior))
        if index >= 3:
            predictions["Rolling 3-month"].append((month_averages[month], sum(month_averages[item] for item in months[index - 3:index]) / 3))
        if index >= 6:
            predictions["Recent 6-month"].append((month_averages[month], sum(month_averages[item] for item in months[index - 6:index]) / 6))

    scores = {}
    for name, pairs in predictions.items():
        if not pairs:
            continue
        scores[name] = {
            "mape": sum(abs(predicted - actual) / max(actual, 1) for actual, predicted in pairs) / len(pairs) * 100,
            "mae": sum(abs(predicted - actual) for actual, predicted in pairs) / len(pairs),
            "bias": sum(predicted - actual for actual, predicted in pairs) / len(pairs),
            "observations": len(pairs),
        }
    return scores


def write_outputs(archive_path: Path) -> None:
    detailed: dict[tuple[str, int, str, str, str], dict] = defaultdict(empty_bucket)
    overall = empty_bucket()

    for row in iter_rows(archive_path):
        season = SEASONS[row["season"]]
        day_type = DAY_TYPES[row["workingday"]]
        weather = WEATHER[row["weathersit"]]
        month = row["dteday"][:7]
        key = (month, int(row["hr"]), season, day_type, weather)
        add(detailed[key], row)
        add(overall, row)

    SUMMARY_FILE.parent.mkdir(parents=True, exist_ok=True)
    fields = ["month", "hour", "season", "day_type", "weather", "rides", "registered", "casual", "records", "average_temp", "average_humidity"]
    with SUMMARY_FILE.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        for (month, hour, season, day_type, weather), bucket in sorted(detailed.items()):
            values = serialize(bucket)
            writer.writerow({"month": month, "hour": hour, "season": season, "day_type": day_type, "weather": weather, "rides": values["rides"], "registered": values["registered"], "casual": values["casual"], "records": values["records"], "average_temp": values["averageTemp"], "average_humidity": values["averageHumidity"]})

    month_totals: dict[str, int] = defaultdict(int)
    month_records: dict[str, int] = defaultdict(int)
    hour_totals: dict[int, int] = defaultdict(int)
    hour_records: dict[int, int] = defaultdict(int)
    for (month, hour, _season, _day_type, _weather), bucket in detailed.items():
        rides = int(bucket["rides"])
        records = int(bucket["records"])
        month_totals[month] += rides
        month_records[month] += records
        hour_totals[hour] += rides
        hour_records[hour] += records

    months = sorted(month_totals)
    month_averages = {month: month_totals[month] / month_records[month] for month in months}
    hour_averages = {hour: hour_totals[hour] / hour_records[hour] for hour in hour_totals}
    strongest_month = max(month_averages.items(), key=lambda item: item[1])
    peak_hour = max(hour_averages.items(), key=lambda item: item[1])
    model_scores = compare_models(month_averages, months)
    seasonal = model_scores["Seasonal naive"]
    winner_name = min(model_scores, key=lambda name: model_scores[name]["mape"])
    winner = model_scores[winner_name]
    holdout_count = int(winner["observations"])
    lines = [
        "# Bike sharing capacity planning findings",
        "",
        "> Source: [UCI Bike Sharing](https://archive.ics.uci.edu/dataset/275/bike%2Bsharing%2Bdataset), licensed CC BY 4.0.",
        "> This is a planning baseline. Without station-level inventory, it cannot prove where bikes should be rebalanced.",
        "",
        "## KPI snapshot",
        "",
        f"- **Hourly records:** {int(overall['records']):,}",
        f"- **Total rides:** {int(overall['rides']):,}",
        f"- **Average rides per hourly record:** {overall['rides'] / overall['records']:.0f}",
        f"- **Peak hour:** {peak_hour[0]:02d}:00, with {peak_hour[1]:.1f} average rides per comparable hourly observation",
        f"- **Coverage:** {len(months)} months across 2011–2012",
        "",
        "## Baseline forecast evidence",
        "",
        f"The dashboard challenges three transparent baselines on the final {holdout_count}-period holdout. The **{winner_name}** model performs best at **{winner['mape']:.1f}% MAPE**, compared with **{seasonal['mape']:.1f}%** for the seasonal-naive benchmark. Its average absolute error is **{winner['mae']:.1f} rides per hour** with a bias of **{winner['bias']:+.1f}**.",
        "",
        "That is useful evidence, not a production forecast. The next version needs daily data, prediction intervals, calendar features, weather forecasts, and rolling time-based validation.",
        "",
        "## What the data says",
        "",
        f"1. **{peak_hour[0]:02d}:00 is the pressure point** at {peak_hour[1]:.1f} average rides per comparable hourly observation.",
        f"2. **{strongest_month[0]} is the strongest month** at {strongest_month[1]:.1f} average rides per recorded hour.",
        "3. **The capacity queue is scenario-based.** Its risk band changes when the planner changes capacity and safety buffer.",
        f"4. **Forecast error is operationally meaningful.** A {winner['mae']:.0f}-ride average error is easier to plan around than an unqualified accuracy label, but it still needs station-level validation.",
        "",
        "## Operations notes",
        "",
        "- Protect the peak window first, then split the plan by day type and weather.",
        "- Use a buffer explicitly; do not hide uncertainty inside one capacity number.",
        "- Add station availability, maintenance downtime, trip origins and destinations, events, and weather forecasts before recommending rebalancing routes.",
        "",
        "## Reproducibility",
        "",
        "Run `python analysis.py` from this project folder to regenerate the compact summary, findings report, and typed dashboard data.",
        "",
    ]
    INSIGHTS_FILE.parent.mkdir(parents=True, exist_ok=True)
    INSIGHTS_FILE.write_text("\n".join(lines), encoding="utf-8")
    write_dashboard_ts(detailed)
    print(f"Parsed {int(overall['records']):,} hourly records")
    print(f"Rides: {int(overall['rides']):,} | Average per hour: {overall['rides'] / overall['records']:.0f}")
    print(f"Winning baseline: {winner_name} | MAPE: {winner['mape']:.1f}% across {holdout_count} holdout periods")
    print(f"Wrote {SUMMARY_FILE}")
    print(f"Wrote {INSIGHTS_FILE}")
    print(f"Wrote {TS_FILE}")


def write_dashboard_ts(detailed: dict) -> None:
    rows = []
    for (month, hour, season, day_type, weather), bucket in sorted(detailed.items()):
        values = serialize(bucket)
        rows.append({"month": month, "hour": hour, "season": season, "dayType": day_type, "weather": weather, **values})
    fields = ["month", "hour", "season", "dayType", "weather", "rides", "registered", "casual", "records", "averageTemp", "averageHumidity"]

    def value(item):
        return f'"{item}"' if isinstance(item, str) else str(item)

    rendered = "[\n" + "\n".join("  { " + ", ".join(f"{field}: {value(row[field])}" for field in fields) + " }," for row in rows) + "\n]"
    content = """export type RideSummary = {
  month: string;
  hour: number;
  season: string;
  dayType: string;
  weather: string;
  rides: number;
  registered: number;
  casual: number;
  records: number;
  averageTemp: number;
  averageHumidity: number;
};

// Generated by projects/bike-sharing-operations/scripts/process_bike_sharing.py
// Source: UCI Bike Sharing, CC BY 4.0. See the project README for the method.
export const rideSummary: RideSummary[] = """ + rendered + ";\n"
    TS_FILE.parent.mkdir(parents=True, exist_ok=True)
    TS_FILE.write_text(content, encoding="utf-8")


if __name__ == "__main__":
    write_outputs(ensure_source())
