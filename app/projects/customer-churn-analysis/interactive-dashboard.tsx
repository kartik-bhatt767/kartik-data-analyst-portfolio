'use client';

import { useMemo, useState } from 'react';
import { churnRiskQueue, churnSegments, ChurnSegment } from './churn-data';

const dimensions = [
  { key: 'Contract', label: 'Contract type' },
  { key: 'tenure_band', label: 'Tenure band' },
  { key: 'InternetService', label: 'Internet service' },
  { key: 'PaymentMethod', label: 'Payment method' },
  { key: 'service_depth_band', label: 'Service depth' },
  { key: 'monthly_charge_band', label: 'Monthly charge' },
];

const formatNumber = (value: number) => Math.round(value).toLocaleString('en-US');
const formatMoney = (value: number) => `$${Math.round(value).toLocaleString('en-US')}`;
const formatPct = (value: number) => `${(value * 100).toFixed(1)}%`;
const formatRisk = (value: number) => `${Math.round(value * 100)}%`;
const labelFor = (key: string) => dimensions.find((item) => item.key === key)?.label || key;
const rowsFor = (dimension: string) => churnSegments.filter((row) => row.segment === dimension);

function sumRows(rows: ChurnSegment[]) {
  return rows.reduce((summary, row) => ({
    customers: summary.customers + row.customers,
    churned: summary.churned + row.churned,
    monthlyCharges: summary.monthlyCharges + row.monthlyCharges,
    churnedMonthlyCharges: summary.churnedMonthlyCharges + row.churnedMonthlyCharges,
  }), { customers: 0, churned: 0, monthlyCharges: 0, churnedMonthlyCharges: 0 });
}

export default function InteractiveDashboard() {
  const [dimension, setDimension] = useState('Contract');
  const [value, setValue] = useState('All values');
  const dimensionRows = useMemo(() => rowsFor(dimension), [dimension]);
  const values = useMemo(() => ['All values', ...dimensionRows.map((row) => row.value)], [dimensionRows]);

  const selectedRows = useMemo(() => value === 'All values' ? dimensionRows : dimensionRows.filter((row) => row.value === value), [dimensionRows, value]);
  const summary = useMemo(() => sumRows(selectedRows), [selectedRows]);
  const comparisonRows = useMemo(() => dimensionRows.map((row) => ({ ...row, atRisk: row.churnedMonthlyCharges })), [dimensionRows]);
  const maxChurnRate = Math.max(...comparisonRows.map((row) => row.churnRate), 0.01);
  const maxAtRisk = Math.max(...comparisonRows.map((row) => row.atRisk), 1);
  const highestRisk = [...comparisonRows].sort((a, b) => b.churnRate - a.churnRate)[0];

  function changeDimension(next: string) {
    setDimension(next);
    setValue('All values');
  }

  return (
    <section className="dashboard-live" aria-labelledby="churn-dashboard-title">
      <div className="dashboard-heading">
        <div>
          <div className="project-section-label">Live dashboard</div>
          <h2 id="churn-dashboard-title">Find the retention pressure.</h2>
          <p>Switch the cohort lens, isolate a segment, and compare cancellation rate with the recurring charges attached to it.</p>
        </div>
        <div className="dashboard-controls" aria-label="Churn dashboard filters">
          <label><span>Compare by</span><select value={dimension} onChange={(event) => changeDimension(event.target.value)}>{dimensions.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label>
          <label><span>Segment</span><select value={value} onChange={(event) => setValue(event.target.value)}>{values.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
      </div>

      <div className="dashboard-kpis" aria-live="polite">
        <div><span>Customers reviewed</span><strong>{formatNumber(summary.customers)}</strong></div>
        <div><span>Churned customers</span><strong>{formatNumber(summary.churned)}</strong></div>
        <div><span>Churn rate</span><strong>{formatPct(summary.customers ? summary.churned / summary.customers : 0)}</strong></div>
        <div><span>Churned monthly charges</span><strong>{formatMoney(summary.churnedMonthlyCharges)}</strong></div>
      </div>

      <div className="dashboard-chart-grid">
        <div className="dashboard-panel">
          <div className="dashboard-panel-heading"><div><span>{labelFor(dimension)}</span><h3>Where churn is concentrated</h3></div><strong>{formatNumber(summary.customers)} customers</strong></div>
          <div className="dashboard-bars">{comparisonRows.map((row) => <div className="dashboard-bar-row" key={row.value}><div className="dashboard-bar-label"><span>{row.value}</span><strong>{formatPct(row.churnRate)}</strong></div><div className="dashboard-bar-track"><div className="dashboard-bar-fill" style={{ width: `${(row.churnRate / maxChurnRate) * 100}%` }} /></div></div>)}</div>
          <div className="dashboard-legend"><span><i className="legend-dot" />Churn rate</span><span>Highest: {highestRisk?.value || '—'}</span></div>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-heading"><div><span>Revenue exposure</span><h3>Charges attached to churn</h3></div></div>
          <div className="dashboard-bars">{comparisonRows.map((row) => <div className="dashboard-bar-row" key={row.value}><div className="dashboard-bar-label"><span>{row.value}</span><strong>{formatMoney(row.atRisk)}</strong></div><div className="dashboard-bar-track"><div className="dashboard-bar-fill dashboard-bar-fill-alt" style={{ width: `${(row.atRisk / maxAtRisk) * 100}%` }} /></div></div>)}</div>
          <p className="dashboard-note">This is monthly recurring charge exposure from customers marked as churned in the source snapshot. It is not a forecast of lifetime revenue.</p>
        </div>
      </div>

      <div className="dashboard-bottom-grid">
        <div className="dashboard-panel">
          <div className="dashboard-panel-heading"><div><span>Current selection</span><h3>{value === 'All values' ? `All ${labelFor(dimension).toLowerCase()} cohorts` : value}</h3></div></div>
          <div className="case-table-wrap"><table className="case-table"><thead><tr><th>Measure</th><th>Value</th></tr></thead><tbody><tr><td>Average tenure</td><td>{selectedRows.length === 1 ? `${selectedRows[0].averageTenure.toFixed(1)} months` : 'Compare above'}</td></tr><tr><td>Monthly charges</td><td>{formatMoney(summary.monthlyCharges)}</td></tr><tr><td>Churned monthly charges</td><td>{formatMoney(summary.churnedMonthlyCharges)}</td></tr></tbody></table></div>
        </div>
        <div className="dashboard-insight" aria-live="polite"><span>Working read</span><h3>{highestRisk?.value || 'The selected cohort'} deserves the first retention test.</h3><p>{highestRisk ? `${highestRisk.value} has the highest observed churn rate at ${formatPct(highestRisk.churnRate)}. Pair that rate with ${formatMoney(highestRisk.churnedMonthlyCharges)} in churned monthly charges before deciding whether the segment is high priority.` : 'Choose a cohort lens to compare retention pressure.'}</p></div>
      </div>

      <div className="retention-queue">
        <div className="retention-queue-heading"><div><span>Retention queue</span><h3>Who should receive attention first?</h3></div><strong>Top 6 held-out records</strong></div>
        <p className="dashboard-note">This queue turns the model into a practical next step. Customer IDs are source identifiers, the score is a prioritization signal, and the action is a starting hypothesis for a retention test.</p>
        <div className="case-table-wrap"><table className="case-table queue-table" aria-label="Retention priority queue"><thead><tr><th>Customer</th><th>Risk score</th><th>Contract</th><th>Tenure</th><th>Monthly charge</th><th>Suggested action</th></tr></thead><tbody>{churnRiskQueue.slice(0, 6).map((row) => <tr key={row.customerId}><td>{row.customerId}</td><td>{formatRisk(row.riskScore)}</td><td>{row.contract}</td><td>{row.tenure} mo.</td><td>{formatMoney(row.monthlyCharges)}</td><td>{row.action}</td></tr>)}</tbody></table></div>
      </div>
    </section>
  );
}
