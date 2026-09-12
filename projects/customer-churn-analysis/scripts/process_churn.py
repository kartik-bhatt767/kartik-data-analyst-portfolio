"""Build an advanced churn-analysis dataset and baseline risk model.

The IBM sample contains plan, tenure, service, billing, and churn fields. It
does not contain customer location or true product-usage volume; the project
keeps those gaps explicit and uses service depth as a documented proxy.
"""

from __future__ import annotations

import csv
import io
import json
import math
import random
import urllib.request
from collections import defaultdict
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
WORK_ROOT = PROJECT_ROOT.parents[1] / "work"
LOCAL_FILE = WORK_ROOT / "telco-customer-churn.csv"
SOURCE_URL = "https://raw.githubusercontent.com/IBM/telco-customer-churn-on-icp4d/master/data/Telco-Customer-Churn.csv"
SUMMARY_FILE = PROJECT_ROOT / "data" / "churn_summary.csv"
SCORES_FILE = PROJECT_ROOT / "data" / "churn_scores.csv"
INSIGHTS_FILE = PROJECT_ROOT / "outputs" / "insights.md"
MODEL_REPORT = PROJECT_ROOT / "outputs" / "model-report.md"
METRICS_FILE = PROJECT_ROOT / "outputs" / "model_metrics.json"
TS_FILE = PROJECT_ROOT.parents[1] / "app" / "projects" / "customer-churn-analysis" / "churn-data.ts"

SEGMENT_FIELDS = ["Contract", "InternetService", "PaymentMethod", "tenure_band", "service_depth_band", "monthly_charge_band"]
CATEGORICAL_FIELDS = ["gender", "Partner", "Dependents", "PhoneService", "MultipleLines", "InternetService", "OnlineSecurity", "OnlineBackup", "DeviceProtection", "TechSupport", "StreamingTV", "StreamingMovies", "Contract", "PaperlessBilling", "PaymentMethod"]
NUMERIC_FIELDS = ["SeniorCitizen", "tenure", "MonthlyCharges", "TotalCharges", "service_count"]
SERVICE_FIELDS = ["PhoneService", "MultipleLines", "InternetService", "OnlineSecurity", "OnlineBackup", "DeviceProtection", "TechSupport", "StreamingTV", "StreamingMovies"]


def ensure_source() -> Path:
    if LOCAL_FILE.exists():
        return LOCAL_FILE
    LOCAL_FILE.parent.mkdir(parents=True, exist_ok=True)
    print(f"Downloading {SOURCE_URL}")
    urllib.request.urlretrieve(SOURCE_URL, LOCAL_FILE)
    return LOCAL_FILE


def read_rows(path: Path) -> list[dict[str, str | float | int]]:
    with path.open(newline="", encoding="utf-8-sig") as file:
        source_rows = list(csv.DictReader(file))
    rows: list[dict[str, str | float | int]] = []
    for raw in source_rows:
        total = float(raw["TotalCharges"].strip() or 0)
        services = sum(1 for field in SERVICE_FIELDS if raw[field] == "Yes" or (field == "InternetService" and raw[field] != "No"))
        tenure = int(raw["tenure"])
        monthly = float(raw["MonthlyCharges"])
        row: dict[str, str | float | int] = dict(raw)
        row.update({"TotalCharges": total, "tenure": tenure, "MonthlyCharges": monthly, "service_count": services, "tenure_band": tenure_band(tenure), "service_depth_band": service_depth_band(services), "monthly_charge_band": monthly_charge_band(monthly), "churned": int(raw["Churn"] == "Yes")})
        rows.append(row)
    return rows


def tenure_band(value: int) -> str:
    if value <= 6:
        return "0–6 months"
    if value <= 12:
        return "7–12 months"
    if value <= 24:
        return "13–24 months"
    if value <= 48:
        return "25–48 months"
    return "49+ months"


def service_depth_band(value: int) -> str:
    if value <= 2:
        return "Low depth (0–2)"
    if value <= 5:
        return "Medium depth (3–5)"
    return "High depth (6+)"


def monthly_charge_band(value: float) -> str:
    if value < 40:
        return "Under $40"
    if value < 80:
        return "$40–79"
    return "$80+"


def bucket() -> dict[str, float | int]:
    return {"customers": 0, "churned": 0, "monthlyCharges": 0.0, "churnedMonthlyCharges": 0.0, "totalCharges": 0.0, "tenure": 0}


def add(target: dict, row: dict) -> None:
    target["customers"] += 1
    target["churned"] += int(row["churned"])
    target["monthlyCharges"] += float(row["MonthlyCharges"])
    target["churnedMonthlyCharges"] += float(row["MonthlyCharges"]) if row["churned"] else 0.0
    target["totalCharges"] += float(row["TotalCharges"])
    target["tenure"] += int(row["tenure"])


def serial_bucket(value: dict) -> dict[str, int | float]:
    customers = int(value["customers"])
    return {"customers": customers, "churned": int(value["churned"]), "churnRate": round(value["churned"] / customers if customers else 0, 5), "monthlyCharges": round(value["monthlyCharges"], 2), "churnedMonthlyCharges": round(value["churnedMonthlyCharges"], 2), "totalCharges": round(value["totalCharges"], 2), "averageTenure": round(value["tenure"] / customers if customers else 0, 1)}


class Encoder:
    def __init__(self) -> None:
        self.categories: dict[str, list[str]] = {}
        self.means: dict[str, float] = {}
        self.scales: dict[str, float] = {}
        self.names: list[str] = []

    def fit(self, rows: list[dict]) -> None:
        for field in CATEGORICAL_FIELDS:
            self.categories[field] = sorted({str(row[field]) for row in rows})
        for field in NUMERIC_FIELDS:
            values = [float(row[field]) for row in rows]
            mean = sum(values) / len(values)
            variance = sum((value - mean) ** 2 for value in values) / len(values)
            self.means[field] = mean
            self.scales[field] = math.sqrt(variance) or 1
        self.names = NUMERIC_FIELDS.copy()
        self.names.extend(f"{field}={value}" for field in CATEGORICAL_FIELDS for value in self.categories[field])

    def transform(self, row: dict) -> list[float]:
        values = [(float(row[field]) - self.means[field]) / self.scales[field] for field in NUMERIC_FIELDS]
        for field in CATEGORICAL_FIELDS:
            current = str(row[field])
            values.extend(1.0 if current == value else 0.0 for value in self.categories[field])
        return values


def sigmoid(value: float) -> float:
    if value < -35:
        return 0.0
    if value > 35:
        return 1.0
    return 1 / (1 + math.exp(-value))


def train(features: list[list[float]], labels: list[int], epochs: int = 28) -> tuple[float, list[float]]:
    weights = [0.0] * len(features[0])
    bias = 0.0
    count = len(features)
    for _ in range(epochs):
        gradients = [0.0] * len(weights)
        bias_gradient = 0.0
        for values, label in zip(features, labels):
            error = sigmoid(bias + sum(weight * value for weight, value in zip(weights, values))) - label
            bias_gradient += error
            for index, value in enumerate(values):
                gradients[index] += error * value
        bias -= 0.14 * bias_gradient / count
        for index, gradient in enumerate(gradients):
            weights[index] -= 0.14 * (gradient / count + 0.01 * weights[index])
    return bias, weights


def score(features: list[list[float]], bias: float, weights: list[float]) -> list[float]:
    return [sigmoid(bias + sum(weight * value for weight, value in zip(weights, values))) for values in features]


def auc(labels: list[int], scores: list[float]) -> float:
    positives = sum(labels)
    negatives = len(labels) - positives
    if not positives or not negatives:
        return 0
    order = sorted(range(len(scores)), key=lambda index: scores[index])
    rank_sum = sum(rank for rank, index in enumerate(order, 1) if labels[index])
    return (rank_sum - positives * (positives + 1) / 2) / (positives * negatives)


def metrics(labels: list[int], scores: list[float], threshold: float) -> dict[str, int | float]:
    predictions = [int(value >= threshold) for value in scores]
    tp = sum(prediction == 1 and label == 1 for prediction, label in zip(predictions, labels))
    tn = sum(prediction == 0 and label == 0 for prediction, label in zip(predictions, labels))
    fp = sum(prediction == 1 and label == 0 for prediction, label in zip(predictions, labels))
    fn = sum(prediction == 0 and label == 1 for prediction, label in zip(predictions, labels))
    precision = tp / (tp + fp) if tp + fp else 0
    recall = tp / (tp + fn) if tp + fn else 0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0
    return {"threshold": threshold, "accuracy": (tp + tn) / len(labels), "precision": precision, "recall": recall, "f1": f1, "rocAuc": auc(labels, scores), "truePositive": tp, "trueNegative": tn, "falsePositive": fp, "falseNegative": fn}


def lift_table(labels: list[int], scores: list[float]) -> list[dict[str, float | int]]:
    order = sorted(range(len(scores)), key=lambda index: scores[index], reverse=True)
    baseline = sum(labels) / len(labels)
    rows = []
    for decile in range(10):
        selected = [labels[index] for index in order[decile * len(order) // 10:(decile + 1) * len(order) // 10]]
        conversion = sum(selected) / len(selected) if selected else 0
        rows.append({"decile": decile + 1, "customers": len(selected), "churned": sum(selected), "churnRate": conversion, "lift": conversion / baseline if baseline else 0})
    return rows


def write_ts(segment_rows: list[dict], model: dict, lift: list[dict], features: list[dict], queue: list[dict]) -> None:
    def value(item):
        return json.dumps(item) if isinstance(item, str) else str(round(item, 5) if isinstance(item, float) else item)
    segment_text = "[\n" + "\n".join("  { " + ", ".join(f"{key}: {value(row[key])}" for key in row) + " }," for row in segment_rows) + "\n]"
    lift_text = "[\n" + "\n".join("  { " + ", ".join(f"{key}: {value(row[key])}" for key in row) + " }," for row in lift) + "\n]"
    feature_text = "[\n" + "\n".join("  { " + ", ".join(f"{key}: {value(row[key])}" for key in row) + " }," for row in features) + "\n]"
    queue_text = "[\n" + "\n".join("  { " + ", ".join(f"{key}: {value(row[key])}" for key in row) + " }," for row in queue) + "\n]"
    TS_FILE.parent.mkdir(parents=True, exist_ok=True)
    TS_FILE.write_text(f"""export type ChurnSegment = {{ segment: string; value: string; customers: number; churned: number; churnRate: number; monthlyCharges: number; churnedMonthlyCharges: number; totalCharges: number; averageTenure: number }};
export type ChurnLift = {{ decile: number; customers: number; churned: number; churnRate: number; lift: number }};
export type ChurnFeature = {{ feature: string; weight: number; direction: string }};
export type ChurnRiskRow = {{ customerId: string; contract: string; tenure: number; monthlyCharges: number; serviceDepth: number; riskScore: number; action: string }};
export type ChurnModelMetrics = {{ trainRecords: number; validationRecords: number; testRecords: number; featureCount: number; baselineRate: number; threshold: number; accuracy: number; precision: number; recall: number; f1: number; rocAuc: number; truePositive: number; trueNegative: number; falsePositive: number; falseNegative: number }};

// Generated by projects/customer-churn-analysis/scripts/process_churn.py
export const churnSegments: ChurnSegment[] = {segment_text};
export const churnModelMetrics: ChurnModelMetrics = {{ {', '.join(f'{key}: {value(item)}' for key, item in model.items())} }};
export const churnLiftByDecile: ChurnLift[] = {lift_text};
export const churnFeatureWeights: ChurnFeature[] = {feature_text};
export const churnRiskQueue: ChurnRiskRow[] = {queue_text};
""", encoding="utf-8")


def main() -> None:
    rows = read_rows(ensure_source())
    segments: dict[tuple[str, str], dict] = defaultdict(bucket)
    for row in rows:
        for field in SEGMENT_FIELDS:
            segments[(field, str(row[field]))] = segments.get((field, str(row[field])), bucket())
            add(segments[(field, str(row[field]))], row)
    segment_rows = [{"segment": field, "value": value, **serial_bucket(data)} for (field, value), data in sorted(segments.items())]

    shuffled = list(range(len(rows)))
    random.Random(42).shuffle(shuffled)
    shuffled_rows = [rows[index] for index in shuffled]
    labels = [int(row["churned"]) for row in shuffled_rows]
    train_end = int(len(rows) * 0.70)
    validation_end = int(len(rows) * 0.80)
    train_rows, validation_rows, test_rows = shuffled_rows[:train_end], shuffled_rows[train_end:validation_end], shuffled_rows[validation_end:]
    train_labels, validation_labels, test_labels = labels[:train_end], labels[train_end:validation_end], labels[validation_end:]
    encoder = Encoder()
    encoder.fit(train_rows)
    train_features = [encoder.transform(row) for row in train_rows]
    validation_features = [encoder.transform(row) for row in validation_rows]
    test_features = [encoder.transform(row) for row in test_rows]
    bias, weights = train(train_features, train_labels)
    validation_scores = score(validation_features, bias, weights)
    test_scores = score(test_features, bias, weights)
    candidate_thresholds = [index / 100 for index in range(10, 61, 5)]
    threshold = max(candidate_thresholds, key=lambda candidate: metrics(validation_labels, validation_scores, candidate)["f1"])
    test_metrics = metrics(test_labels, test_scores, threshold)
    model = {"trainRecords": len(train_rows), "validationRecords": len(validation_rows), "testRecords": len(test_rows), "featureCount": len(encoder.names), "baselineRate": sum(test_labels) / len(test_labels), **test_metrics}
    lift = lift_table(test_labels, test_scores)
    feature_weights = sorted(({"feature": name, "weight": round(weight, 5), "direction": "positive" if weight > 0 else "negative"} for name, weight in zip(encoder.names, weights)), key=lambda item: abs(item["weight"]), reverse=True)
    ranked_test = sorted(zip(test_rows, test_scores), key=lambda item: item[1], reverse=True)[:10]
    queue = []
    for row, risk in ranked_test:
        action = "Early-tenure onboarding" if int(row["tenure"]) <= 6 else ("Billing review" if row["PaymentMethod"] == "Electronic check" else "Retention check-in")
        queue.append({"customerId": str(row["customerID"]), "contract": str(row["Contract"]), "tenure": int(row["tenure"]), "monthlyCharges": round(float(row["MonthlyCharges"]), 2), "serviceDepth": int(row["service_count"]), "riskScore": round(risk, 4), "action": action})

    SUMMARY_FILE.parent.mkdir(parents=True, exist_ok=True)
    with SUMMARY_FILE.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=list(segment_rows[0]))
        writer.writeheader()
        writer.writerows(segment_rows)
    with SCORES_FILE.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=["record_index", "actual_churn", "risk_score", "predicted_churn"])
        writer.writeheader()
        for index, (label, risk) in enumerate(zip(test_labels, test_scores), start=validation_end):
            writer.writerow({"record_index": index, "actual_churn": label, "risk_score": round(risk, 6), "predicted_churn": int(risk >= threshold)})
    with (PROJECT_ROOT / "data" / "retention_queue.csv").open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=list(queue[0]))
        writer.writeheader()
        writer.writerows(queue)
    METRICS_FILE.parent.mkdir(parents=True, exist_ok=True)
    METRICS_FILE.write_text(json.dumps(model, indent=2), encoding="utf-8")
    (PROJECT_ROOT / "outputs" / "feature-importance.csv").write_text("feature,weight,direction\n" + "\n".join(f"{item['feature']},{item['weight']},{item['direction']}" for item in feature_weights), encoding="utf-8")
    top_decile = lift[0]
    INSIGHTS_FILE.write_text("\n".join([
        "# Customer churn findings", "", "> Source: [IBM Telco Customer Churn sample](https://github.com/IBM/telco-customer-churn-on-icp4d).", "> This is a fictional telco sample. The source contains no location or true usage-volume field; service depth is used as a transparent proxy.", "", "## KPI snapshot", "", f"- **Customers:** {len(rows):,}", f"- **Churned customers:** {sum(labels):,}", f"- **Overall churn rate:** {sum(labels) / len(labels):.1%}", f"- **Monthly recurring charges at risk:** ${sum(float(row['MonthlyCharges']) for row in rows if row['churned']):,.0f}", "", "## What the data says", "", "- Month-to-month contract, early tenure, and electronic-check billing are the main segments to investigate.", f"- The top scored risk decile churned at {top_decile['churnRate']:.1%}, versus a {model['baselineRate']:.1%} test baseline ({top_decile['lift']:.1f}× lift).", "- Location cannot be analyzed from this source; a production retention workflow needs city/state/region or service-area fields.", "", "## Recommended actions", "", "- Design an early-tenure onboarding intervention for month-to-month customers.", "- Test billing-method education or autopay incentives, measuring incremental retention rather than assuming causality.", "- Add location and actual usage data before prioritizing regional or engagement-based interventions.", ""]), encoding="utf-8")
    MODEL_REPORT.write_text("\n".join(["# Churn risk model", "", "> Model: regularized logistic-regression baseline implemented with the Python standard library.", "> Service depth is a proxy for product breadth; no post-churn fields are used.", "", "## Evaluation", "", f"- Train: {len(train_rows):,} records", f"- Validation: {len(validation_rows):,} records", f"- Test: {len(test_rows):,} records", f"- Features: {len(encoder.names)}", "- Split: reproducible random holdout with seed 42", "", "## Test results", "", f"- ROC-AUC: {model['rocAuc']:.3f}", f"- Precision: {model['precision']:.1%}", f"- Recall: {model['recall']:.1%}", f"- F1: {model['f1']:.3f}", f"- Top-decile churn rate: {top_decile['churnRate']:.1%} ({top_decile['lift']:.1f}× baseline)", "", "## Limitations", "", "- This is a prioritization baseline, not a causal retention model.", "- The data lacks location, actual usage volume, intervention history, retention value, and time-varying snapshots.", "- A production model needs time-based validation, calibration, cost-sensitive thresholding, and an intervention experiment.", ""]), encoding="utf-8")
    write_ts(segment_rows, model, lift, feature_weights[:8], queue)
    print(f"Parsed {len(rows):,} customers | Churn: {sum(labels) / len(labels):.1%}")
    print(f"ROC-AUC: {model['rocAuc']:.3f} | Top-decile lift: {top_decile['lift']:.1f}x")


if __name__ == "__main__":
    main()
