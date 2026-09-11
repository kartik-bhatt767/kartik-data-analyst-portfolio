"""Reproducible summary for the Retail Sales Performance Dashboard."""

from __future__ import annotations

import csv
from collections import defaultdict
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).parent
DATA_FILE = ROOT / "data" / "sales.csv"
OUTPUT_FILE = ROOT / "outputs" / "insights.md"


def money(value: float) -> str:
    return f"${value:,.0f}"


def pct(value: float) -> str:
    return f"{value * 100:.1f}%"


def read_orders() -> list[dict]:
    with DATA_FILE.open(newline="", encoding="utf-8") as file:
        orders = list(csv.DictReader(file))
    for order in orders:
        order["OrderDate"] = datetime.strptime(order["OrderDate"], "%Y-%m-%d")
        for field in ("Sales", "Quantity", "Discount", "Profit"):
            order[field] = float(order[field])
        order["Quantity"] = int(order["Quantity"])
    return orders


def summarize(orders: list[dict], field: str) -> list[tuple[str, float, float, float]]:
    grouped: dict[str, dict[str, float]] = defaultdict(lambda: {"sales": 0, "profit": 0, "orders": 0})
    for order in orders:
        bucket = grouped[order[field]]
        bucket["sales"] += order["Sales"]
        bucket["profit"] += order["Profit"]
        bucket["orders"] += 1
    return sorted(
        (
            name,
            values["sales"],
            values["profit"],
            values["profit"] / values["sales"] if values["sales"] else 0,
        )
        for name, values in grouped.items()
    )


def main() -> None:
    orders = read_orders()
    sales = sum(order["Sales"] for order in orders)
    profit = sum(order["Profit"] for order in orders)
    margin = profit / sales if sales else 0
    loss_orders = [order for order in orders if order["Profit"] < 0]

    categories = summarize(orders, "Category")
    regions = summarize(orders, "Region")
    segments = summarize(orders, "Segment")

    monthly: dict[str, dict[str, float]] = defaultdict(lambda: {"sales": 0, "profit": 0})
    for order in orders:
        month = order["OrderDate"].strftime("%b %Y")
        monthly[month]["sales"] += order["Sales"]
        monthly[month]["profit"] += order["Profit"]

    best_category = max(categories, key=lambda row: row[1])
    best_margin_category = max(categories, key=lambda row: row[3])
    best_region = max(regions, key=lambda row: row[1])
    highest_discount = max(orders, key=lambda order: order["Discount"])

    lines = [
        "# Dashboard findings",
        "",
        "## KPI snapshot",
        "",
        f"- **Sales:** {money(sales)}",
        f"- **Profit:** {money(profit)}",
        f"- **Profit margin:** {pct(margin)}",
        f"- **Orders:** {len(orders)}",
        f"- **Loss-making orders:** {len(loss_orders)} ({pct(len(loss_orders) / len(orders))})",
        "",
        "## What the data says",
        "",
        f"1. **{best_category[0]} leads revenue** with {money(best_category[1])} in sales and {pct(best_category[3])} margin.",
        f"2. **{best_margin_category[0]} protects margin best** at {pct(best_margin_category[3])}; it is a useful category to grow carefully.",
        f"3. **{best_region[0]} is the largest region** with {money(best_region[1])} in sales.",
        f"4. The highest observed discount is **{highest_discount['Discount'] * 100:.0f}%** on {highest_discount['Product']}; review discounting before scaling that offer.",
        "",
        "## Category summary",
        "",
        "| Category | Sales | Profit | Margin |",
        "| --- | ---: | ---: | ---: |",
    ]
    lines.extend(f"| {name} | {money(category_sales)} | {money(category_profit)} | {pct(category_margin)} |" for name, category_sales, category_profit, category_margin in categories)
    lines.extend(["", "## Regional summary", "", "| Region | Sales | Profit | Margin |", "| --- | ---: | ---: | ---: |"])
    lines.extend(f"| {name} | {money(region_sales)} | {money(region_profit)} | {pct(region_margin)} |" for name, region_sales, region_profit, region_margin in regions)
    lines.extend(["", "## Recommended actions", "", "- Protect margin by reviewing high-discount orders before increasing promotion volume.", "- Use the dashboard filters to compare the strongest category against the weakest region.", "- Add a larger, multi-year dataset next to test seasonality and make the trend more reliable.", ""])
    OUTPUT_FILE.parent.mkdir(exist_ok=True)
    OUTPUT_FILE.write_text("\n".join(lines), encoding="utf-8")
    print(f"Analysed {len(orders)} orders")
    print(f"Sales: {money(sales)} | Profit: {money(profit)} | Margin: {pct(margin)}")
    print(f"Top category: {best_category[0]} | Top region: {best_region[0]}")
    print(f"Wrote {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
