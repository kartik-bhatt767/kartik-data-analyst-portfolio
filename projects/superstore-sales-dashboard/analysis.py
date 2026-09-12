"""Convenient entry point for the reproducible UCI retail analysis."""

from pathlib import Path
import sys


PROJECT_ROOT = Path(__file__).parent
sys.path.insert(0, str(PROJECT_ROOT))

from scripts.process_uci_retail import ensure_source, write_outputs  # noqa: E402


if __name__ == "__main__":
    write_outputs(ensure_source())
