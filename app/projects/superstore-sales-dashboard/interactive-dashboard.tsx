'use client';

import { useMemo, useState } from 'react';
import { salesOrders } from './dashboard-data';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const regions = ['All regions', 'Central', 'East', 'South', 'West'];
const categories = ['All categories', 'Furniture', 'Office Supplies', 'Technology'];

const formatMoney = (value: number) => `$${Math.round(value).toLocaleString('en-US')}`;
const formatMargin = (profit: number, sales: number) => sales ? `${((profit / sales) * 100).toFixed(1)}%` : '0.0%';

export default function InteractiveDashboard() {
  const [region, setRegion] = useState('All regions');
  const [category, setCategory] = useState('All categories');

  const filteredOrders = useMemo(() => salesOrders.filter((order) => (
    (region === 'All regions' || order.region === region) &&
    (category === 'All categories' || order.category === category)
  )), [region, category]);

  const summary = useMemo(() => {
    const sales = filteredOrders.reduce((total, order) => total + order.sales, 0);
    const profit = filteredOrders.reduce((total, order) => total + order.profit, 0);
    return { sales, profit, margin: formatMargin(profit, sales), losses: filteredOrders.filter((order) => order.profit < 0).length };
  }, [filteredOrders]);

  const monthly = useMemo(() => months.map((month, index) => {
    const orders = filteredOrders.filter((order) => new Date(order.date).getMonth() === index);
    return { month, sales: orders.reduce((total, order) => total + order.sales, 0), profit: orders.reduce((total, order) => total + order.profit, 0) };
  }), [filteredOrders]);

  const categoryTotals = useMemo(() => ['Furniture', 'Office Supplies', 'Technology'].map((name) => {
    const orders = filteredOrders.filter((order) => order.category === name);
    return { name, value: orders.reduce((total, order) => total + order.sales, 0) };
  }).filter((row) => row.value > 0), [filteredOrders]);

  const regionTotals = useMemo(() => ['Central', 'East', 'South', 'West'].map((name) => {
    const orders = filteredOrders.filter((order) => order.region === name);
    return { name, value: orders.reduce((total, order) => total + order.sales, 0) };
  }).filter((row) => row.value > 0), [filteredOrders]);

  const maxMonthlySales = Math.max(...monthly.map((row) => row.sales), 1);
  const maxCategorySales = Math.max(...categoryTotals.map((row) => row.value), 1);
  const maxRegionSales = Math.max(...regionTotals.map((row) => row.value), 1);
  const linePoints = monthly.map((row, index) => `${38 + index * 61},${186 - (row.sales / maxMonthlySales) * 145}`).join(' ');
  const topCategory = [...categoryTotals].sort((a, b) => b.value - a.value)[0];
  const topRegion = [...regionTotals].sort((a, b) => b.value - a.value)[0];

  return (
    <section className="dashboard-live" aria-labelledby="dashboard-title">
      <div className="dashboard-heading">
        <div>
          <div className="project-section-label">Live dashboard</div>
          <h2 id="dashboard-title">Explore the sales story.</h2>
          <p>Change the filters to see how the business story shifts by region and category.</p>
        </div>
        <div className="dashboard-controls" aria-label="Dashboard filters">
          <label><span>Region</span><select value={region} onChange={(event) => setRegion(event.target.value)}>{regions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
      </div>

      <div className="dashboard-kpis" aria-live="polite">
        <div><span>Sales</span><strong>{formatMoney(summary.sales)}</strong></div>
        <div><span>Profit</span><strong>{formatMoney(summary.profit)}</strong></div>
        <div><span>Margin</span><strong>{summary.margin}</strong></div>
        <div><span>Loss orders</span><strong>{summary.losses}</strong></div>
      </div>

      <div className="dashboard-chart-grid">
        <div className="dashboard-panel dashboard-trend-panel">
          <div className="dashboard-panel-heading"><div><span>Monthly trend</span><h3>Sales over time</h3></div><strong>{filteredOrders.length} orders</strong></div>
          <svg className="dashboard-line-chart" viewBox="0 0 760 235" role="img" aria-label="Monthly sales trend line chart">
            <title>Monthly sales trend</title>
            {[40, 88, 136, 184].map((y) => <line key={y} x1="38" y1={y} x2="728" y2={y} className="dashboard-grid-line" />)}
            <polyline points={linePoints} className="dashboard-sales-line" />
            {monthly.map((row, index) => <circle key={row.month} cx={38 + index * 61} cy={186 - (row.sales / maxMonthlySales) * 145} r="4" className="dashboard-sales-point"><title>{`${row.month}: ${formatMoney(row.sales)}`}</title></circle>)}
            {monthly.map((row, index) => <text key={row.month} x={38 + index * 61} y="216" textAnchor="middle" className="dashboard-axis-label">{row.month}</text>)}
          </svg>
          <div className="dashboard-legend"><span><i className="legend-dot" />Sales</span><span>Peak: {formatMoney(Math.max(...monthly.map((row) => row.sales)))}</span></div>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-heading"><div><span>Category mix</span><h3>Where sales come from</h3></div></div>
          <div className="dashboard-bars">{categoryTotals.map((row) => <div className="dashboard-bar-row" key={row.name}><div className="dashboard-bar-label"><span>{row.name}</span><strong>{formatMoney(row.value)}</strong></div><div className="dashboard-bar-track"><div className="dashboard-bar-fill" style={{ width: `${(row.value / maxCategorySales) * 100}%` }} /></div></div>)}</div>
        </div>
      </div>

      <div className="dashboard-bottom-grid">
        <div className="dashboard-panel">
          <div className="dashboard-panel-heading"><div><span>Regional view</span><h3>Sales by region</h3></div></div>
          <div className="dashboard-bars">{regionTotals.map((row) => <div className="dashboard-bar-row" key={row.name}><div className="dashboard-bar-label"><span>{row.name}</span><strong>{formatMoney(row.value)}</strong></div><div className="dashboard-bar-track"><div className="dashboard-bar-fill dashboard-bar-fill-alt" style={{ width: `${(row.value / maxRegionSales) * 100}%` }} /></div></div>)}</div>
        </div>
        <div className="dashboard-insight" aria-live="polite"><span>Current read</span><h3>{topCategory?.name || 'No category'} leads the filtered view.</h3><p>{topRegion?.name || 'No region'} is the largest region in this selection, while the filtered margin is {summary.margin}. Use this view to ask what action should follow the number.</p></div>
      </div>
    </section>
  );
}
