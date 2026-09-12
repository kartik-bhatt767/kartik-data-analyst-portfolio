"""Build a compact, reproducible retail dashboard dataset from UCI Online Retail.

The source workbook is intentionally not committed to the repository. Run this
script with either ``work/online-retail.zip`` present (as used during local
development) or let it download the official UCI archive.

The workbook has revenue inputs but no cost column, so this project reports
revenue, orders, units, and cancellations. It does not invent profit.
"""

from __future__ import annotations

import csv
import re
import urllib.request
import zipfile
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from xml.etree import ElementTree as ET


PROJECT_ROOT = Path(__file__).resolve().parents[1]
WORK_ROOT = PROJECT_ROOT.parents[1] / "work"
LOCAL_ARCHIVE = WORK_ROOT / "online-retail.zip"
ARCHIVE_URL = "https://archive.ics.uci.edu/static/public/352/online+retail.zip"
EXTRACTED_FILE = WORK_ROOT / "online-retail-xlsx" / "Online Retail.xlsx"
SUMMARY_FILE = PROJECT_ROOT / "data" / "online_retail_summary.csv"
INSIGHTS_FILE = PROJECT_ROOT / "outputs" / "real-insights.md"
TS_FILE = PROJECT_ROOT.parents[1] / "app" / "projects" / "superstore-sales-dashboard" / "dashboard-data.ts"

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"

MARKETS = {
    "United Kingdom": "UK",
    "France": "Europe",
    "Germany": "Europe",
    "Spain": "Europe",
    "Netherlands": "Europe",
    "Belgium": "Europe",
    "Switzerland": "Europe",
    "Portugal": "Europe",
    "Italy": "Europe",
    "Austria": "Europe",
    "Norway": "Europe",
    "Sweden": "Europe",
    "Denmark": "Europe",
    "Finland": "Europe",
    "Poland": "Europe",
    "Ireland": "Europe",
    "Iceland": "Europe",
    "Greece": "Europe",
    "Czech Republic": "Europe",
    "Lithuania": "Europe",
    "Malta": "Europe",
    "Cyprus": "Europe",
    "Channel Islands": "Europe",
    "Australia": "APAC",
    "Japan": "APAC",
    "Singapore": "APAC",
    "Hong Kong": "APAC",
    "Israel": "APAC",
    "Bahrain": "APAC",
    "Saudi Arabia": "APAC",
    "United Arab Emirates": "APAC",
    "Lebanon": "APAC",
    "USA": "Americas",
    "Canada": "Americas",
    "Brazil": "Americas",
    "Mexico": "Americas",
}


def ensure_source() -> Path:
    """Return the workbook path, downloading the official source if needed."""
    if EXTRACTED_FILE.exists():
        return EXTRACTED_FILE
    if not LOCAL_ARCHIVE.exists():
        LOCAL_ARCHIVE.parent.mkdir(parents=True, exist_ok=True)
        print(f"Downloading {ARCHIVE_URL}")
        urllib.request.urlretrieve(ARCHIVE_URL, LOCAL_ARCHIVE)
    EXTRACTED_FILE.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(LOCAL_ARCHIVE) as archive:
        workbook = next(name for name in archive.namelist() if name.endswith(".xlsx"))
        archive.extract(workbook, EXTRACTED_FILE.parent)
        extracted = EXTRACTED_FILE.parent / workbook
        if extracted != EXTRACTED_FILE:
            extracted.replace(EXTRACTED_FILE)
    return EXTRACTED_FILE


def read_shared_strings(archive: zipfile.ZipFile) -> list[str]:
    root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    values: list[str] = []
    for item in root.findall(f"{NS}si"):
        values.append("".join(node.text or "" for node in item.iter(f"{NS}t")))
    return values


def excel_date(value: str) -> datetime:
    return datetime(1899, 12, 30) + timedelta(days=float(value))


def column_name(cell_ref: str) -> str:
    return re.match(r"[A-Z]+", cell_ref).group(0)  # type: ignore[union-attr]


def iter_rows(workbook: Path):
    with zipfile.ZipFile(workbook) as archive:
        shared_strings = read_shared_strings(archive)
        with archive.open("xl/worksheets/sheet1.xml") as sheet:
            for _, row in ET.iterparse(sheet, events=("end",)):
                if row.tag != f"{NS}row":
                    continue
                values: dict[str, str] = {}
                for cell in row.findall(f"{NS}c"):
                    ref = cell.attrib.get("r", "")
                    value = cell.find(f"{NS}v")
                    if value is None or value.text is None:
                        continue
                    text = value.text
                    if cell.attrib.get("t") == "s":
                        text = shared_strings[int(text)]
                    values[column_name(ref)] = text
                row.clear()
                if values.get("A") != "InvoiceNo":
                    yield values


def market_for(country: str) -> str:
    return MARKETS.get(country, "Other")


def product_group_for(description: str) -> str:
    text = description.upper()
    rules = {
        "Gifts & seasonal": ("GIFT", "CHRISTMAS", "XMAS", "EASTER", "VALENTINE", "CARD", "BAG"),
        "Home & living": ("KITCHEN", "MUG", "CUP", "PLATE", "BOWL", "CANDLE", "CLOCK", "LANTERN", "TOWEL", "CUSHION", "GARDEN", "JAR", "BOX", "BASKET", "HOOK", "HOLDER", "TRAY", "BOTTLE"),
        "Stationery": ("PEN", "PENCIL", "NOTEBOOK", "PAPER", "BOOK", "ERASER", "RULER", "STICKER", "LABEL", "CLIP", "FILE", "CALCULATOR", "SCISSOR"),
        "Accessories & decor": ("NECKLACE", "BRACELET", "EARRING", "RING", "HAIR", "PURSE", "WALLET", "UMBRELLA", "MIRROR", "FRAME", "PHOTO", "BUNTING", "SIGN"),
    }
    for group, keywords in rules.items():
        if any(keyword in text for keyword in keywords):
            return group
    return "Other products"


def empty_bucket() -> dict:
    return {"revenue": 0.0, "units": 0, "lines": 0, "orders": set(), "customers": set(), "cancelled_orders": set(), "cancelled_value": 0.0}


def add_to_bucket(bucket: dict, *, invoice: str, customer: str, quantity: int, value: float, cancelled: bool) -> None:
    if cancelled:
        bucket["cancelled_orders"].add(invoice)
        bucket["cancelled_value"] += abs(value)
        return
    bucket["revenue"] += value
    bucket["units"] += quantity
    bucket["lines"] += 1
    bucket["orders"].add(invoice)
    if customer:
        bucket["customers"].add(customer)


def serialize_bucket(bucket: dict) -> dict[str, int | float]:
    return {
        "revenue": round(bucket["revenue"], 2),
        "orders": len(bucket["orders"]),
        "customers": len(bucket["customers"]),
        "units": bucket["units"],
        "lines": bucket["lines"],
        "cancelled_orders": len(bucket["cancelled_orders"]),
        "cancelled_value": round(bucket["cancelled_value"], 2),
    }


def money(value: float) -> str:
    return f"£{value:,.0f}"


def pct(value: float) -> str:
    return f"{value * 100:.1f}%"


def write_outputs(workbook: Path) -> None:
    market_buckets: dict[tuple[str, str], dict] = defaultdict(empty_bucket)
    group_buckets: dict[tuple[str, str, str], dict] = defaultdict(empty_bucket)
    country_revenue: dict[str, float] = defaultdict(float)
    overall = empty_bucket()
    raw_rows = 0
    valid_rows = 0
    cancellation_rows = 0
    min_date: datetime | None = None
    max_date: datetime | None = None

    for row in iter_rows(workbook):
        raw_rows += 1
        invoice = row.get("A", "").strip()
        country = row.get("H", "").strip() or "Unknown"
        description = row.get("C", "").strip() or "Unlabelled product"
        try:
            quantity = int(float(row.get("D", "0")))
            unit_price = float(row.get("F", "0"))
            date = excel_date(row["E"])
        except (KeyError, TypeError, ValueError):
            continue
        value = quantity * unit_price
        cancelled = invoice.upper().startswith("C") or quantity <= 0 or unit_price <= 0
        if invoice.upper().startswith("C"):
            cancellation_rows += 1
        if min_date is None or date < min_date:
            min_date = date
        if max_date is None or date > max_date:
            max_date = date
        month = date.strftime("%Y-%m")
        market = market_for(country)
        group = product_group_for(description)
        customer = row.get("G", "").strip()
        add_to_bucket(market_buckets[(month, market)], invoice=invoice, customer=customer, quantity=quantity, value=value, cancelled=cancelled)
        add_to_bucket(group_buckets[(month, market, group)], invoice=invoice, customer=customer, quantity=quantity, value=value, cancelled=cancelled)
        if not cancelled:
            valid_rows += 1
            add_to_bucket(overall, invoice=invoice, customer=customer, quantity=quantity, value=value, cancelled=False)
            country_revenue[country] += value

    SUMMARY_FILE.parent.mkdir(parents=True, exist_ok=True)
    fields = ["level", "month", "market", "product_group", "revenue", "orders", "customers", "units", "lines", "cancelled_orders", "cancelled_value"]
    with SUMMARY_FILE.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        for (month, market), bucket in sorted(market_buckets.items()):
            writer.writerow({"level": "market", "month": month, "market": market, "product_group": "", **serialize_bucket(bucket)})
        for (month, market, group), bucket in sorted(group_buckets.items()):
            writer.writerow({"level": "group", "month": month, "market": market, "product_group": group, **serialize_bucket(bucket)})

    market_totals = [(market, sum(bucket["revenue"] for (month, name), bucket in market_buckets.items() if name == market)) for market in sorted({name for _, name in market_buckets})]
    group_totals = [(group, sum(bucket["revenue"] for (month, market, name), bucket in group_buckets.items() if name == group)) for group in sorted({name for _, _, name in group_buckets})]
    month_totals = [(month, sum(bucket["revenue"] for (name, market), bucket in market_buckets.items() if name == month)) for month in sorted({name for name, _ in market_buckets})]
    top_market = max(market_totals, key=lambda row: row[1])
    top_group = max(group_totals, key=lambda row: row[1])
    top_month = max(month_totals, key=lambda row: row[1])
    top_country = max(country_revenue.items(), key=lambda row: row[1])
    cancellation_rate = cancellation_rows / raw_rows if raw_rows else 0

    lines = [
        "# Online Retail analysis findings",
        "",
        "> Source: [UCI Online Retail](https://archive.ics.uci.edu/dataset/352/online%2Bretail), licensed CC BY 4.0.",
        "> Revenue is `Quantity × UnitPrice`. The source has no cost field, so this analysis does not claim profit or margin.",
        "",
        "## Data-quality snapshot",
        "",
        f"- **Raw transaction lines:** {raw_rows:,}",
        f"- **Valid sales lines:** {valid_rows:,}",
        f"- **Cancellation lines:** {cancellation_rows:,} ({pct(cancellation_rate)} of raw lines)",
        f"- **Period:** {min_date:%b %Y} to {max_date:%b %Y}" if min_date and max_date else "- **Period:** unavailable",
        f"- **Valid revenue:** {money(overall['revenue'])}",
        f"- **Valid orders:** {len(overall['orders']):,}",
        f"- **Known customers:** {len(overall['customers']):,}",
        "",
        "## What the data says",
        "",
        f"1. **{top_market[0]} is the largest market** at {money(top_market[1])} in valid revenue.",
        f"2. **{top_group[0]} is the largest product group** at {money(top_group[1])}; the group labels are transparent keyword-based feature engineering, not source columns.",
        f"3. **{top_month[0]} is the strongest month** at {money(top_month[1])}; use this as a demand signal, not a causal conclusion.",
        f"4. **{top_country[0]} is the largest country** at {money(top_country[1])}; the UK is expected to dominate because this is a UK-based retailer.",
        "",
        "## Recommended actions",
        "",
        "- Monitor cancellations by market and product group before interpreting gross demand as retained revenue.",
        "- Use the UK as the baseline market and compare Europe/APAC/Americas for expansion hypotheses.",
        "- Validate product-group rules with a domain owner before using them in production reporting.",
        "- Add cost, shipping, and customer-segment fields before making profitability or lifetime-value decisions.",
        "",
        "## Reproducibility",
        "",
        "Run `python scripts/process_uci_retail.py` from this project folder to regenerate the compact CSV, this report, and the dashboard data file.",
        "",
    ]
    INSIGHTS_FILE.parent.mkdir(parents=True, exist_ok=True)
    INSIGHTS_FILE.write_text("\n".join(lines), encoding="utf-8")
    write_dashboard_ts(market_buckets, group_buckets)
    print(f"Parsed {raw_rows:,} raw lines; kept {valid_rows:,} valid sales lines")
    print(f"Revenue: {money(overall['revenue'])} | Orders: {len(overall['orders']):,} | Cancellations: {cancellation_rows:,}")
    print(f"Wrote {SUMMARY_FILE}")
    print(f"Wrote {INSIGHTS_FILE}")
    print(f"Wrote {TS_FILE}")


def write_dashboard_ts(market_buckets: dict, group_buckets: dict) -> None:
    fields = ["month", "market", "productGroup", "revenue", "orders", "customers", "units", "lines", "cancelledOrders", "cancelledValue"]

    def rows_for(buckets: dict, level: str) -> list[dict]:
        rows = []
        for key, bucket in sorted(buckets.items()):
            if level == "market":
                month, market = key
                group = ""
            else:
                month, market, group = key
            values = serialize_bucket(bucket)
            rows.append({"month": month, "market": market, "productGroup": group, "revenue": values["revenue"], "orders": values["orders"], "customers": values["customers"], "units": values["units"], "lines": values["lines"], "cancelledOrders": values["cancelled_orders"], "cancelledValue": values["cancelled_value"]})
        return rows

    market_rows = rows_for(market_buckets, "market")
    group_rows = rows_for(group_buckets, "group")
    def ts_value(value):
        return f'"{value}"' if isinstance(value, str) else str(value)
    def render(rows: list[dict]) -> str:
        return "[\n" + "\n".join("  { " + ", ".join(f"{field}: {ts_value(row[field])}" for field in fields) + " }," for row in rows) + "\n]"

    content = """export type RetailSummary = {
  month: string;
  market: string;
  productGroup: string;
  revenue: number;
  orders: number;
  customers: number;
  units: number;
  lines: number;
  cancelledOrders: number;
  cancelledValue: number;
};

// Generated by projects/superstore-sales-dashboard/scripts/process_uci_retail.py
// Source: UCI Online Retail, CC BY 4.0. See the project README for the method.
export const retailMarketSummary: RetailSummary[] = """ + render(market_rows) + ";\n\nexport const retailGroupSummary: RetailSummary[] = """ + render(group_rows) + ";\n"
    TS_FILE.parent.mkdir(parents=True, exist_ok=True)
    TS_FILE.write_text(content, encoding="utf-8")


if __name__ == "__main__":
    write_outputs(ensure_source())
