'use client';

import { useMemo, useState } from 'react';
import { retailGroupSummary, retailMarketSummary, RetailSummary } from './dashboard-data';

const months = Array.from(new Set(retailMarketSummary.map((row) => row.month))).sort();
const markets = ['All markets', ...Array.from(new Set(retailMarketSummary.map((row) => row.market))).sort()];
const productGroups = ['All product groups', ...Array.from(new Set(retailGroupSummary.map((row) => row.productGroup))).sort()];

const formatMoney = (value: number) => `£${Math.round(value).toLocaleString('en-GB')}`;
const formatNumber = (value: number) => Math.round(value).toLocaleString('en-GB');
const formatMonth = (value: string) => {
  const [year, month] = value.split('-');
  return `${new Date(Number(year), Number(month) - 1, 1).toLocaleString('en-US', { month: 'short' })} '${year.slice(2)}`;
};
const sum = (rows: RetailSummary[], field: keyof Pick<RetailSummary, 'revenue' | 'orders' | 'customers' | 'units' | 'lines' | 'cancelledOrders' | 'cancelledValue'>) => rows.reduce((total, row) => total + Number(row[field]), 0);

export default function InteractiveDashboard() {
  const [market, setMarket] = useState('All markets');
  const [productGroup, setProductGroup] = useState('All product groups');

  const filteredRows = useMemo(() => {
    const source = productGroup === 'All product groups' ? retailMarketSummary : retailGroupSummary;
    return source.filter((row) => market === 'All markets' || row.market === market).filter((row) => productGroup === 'All product groups' || row.productGroup === productGroup);
  }, [market, productGroup]);

  const summary = useMemo(() => {
    const revenue = sum(filteredRows, 'revenue');
    const orders = sum(filteredRows, 'orders');
    const cancelledOrders = sum(filteredRows, 'cancelledOrders');
    return {
      revenue,
      orders,
      cancelledOrders,
      cancelledValue: sum(filteredRows, 'cancelledValue'),
      units: sum(filteredRows, 'units'),
      averageOrder: orders ? revenue / orders : 0,
      cancellationRate: orders + cancelledOrders ? cancelledOrders / (orders + cancelledOrders) : 0,
    };
  }, [filteredRows]);

  const monthly = useMemo(() => months.map((month) => {
    const rows = filteredRows.filter((row) => row.month === month);
    return { month, revenue: sum(rows, 'revenue'), orders: sum(rows, 'orders') };
  }), [filteredRows]);

  const productTotals = useMemo(() => productGroups.slice(1).map((name) => {
    const rows = retailGroupSummary.filter((row) => row.productGroup === name && (market === 'All markets' || row.market === market));
    return { name, value: sum(rows, 'revenue') };
  }).filter((row) => row.value > 0), [market]);

  const marketTotals = useMemo(() => markets.slice(1).map((name) => {
    const source = productGroup === 'All product groups' ? retailMarketSummary : retailGroupSummary;
    const rows = source.filter((row) => row.market === name && (productGroup === 'All product groups' || row.productGroup === productGroup));
    return { name, value: sum(rows, 'revenue') };
  }).filter((row) => row.value > 0), [productGroup]);

  const maxMonthlyRevenue = Math.max(...monthly.map((row) => row.revenue), 1);
  const maxProductRevenue = Math.max(...productTotals.map((row) => row.value), 1);
  const maxMarketRevenue = Math.max(...marketTotals.map((row) => row.value), 1);
  const chartWidth = 692;
  const pointX = (index: number) => 38 + (index * chartWidth) / Math.max(monthly.length - 1, 1);
  const pointY = (value: number) => 186 - (value / maxMonthlyRevenue) * 145;
  const linePoints = monthly.map((row, index) => `${pointX(index)},${pointY(row.revenue)}`).join(' ');
  const topProduct = [...productTotals].sort((a, b) => b.value - a.value)[0];
  const topMarket = [...marketTotals].sort((a, b) => b.value - a.value)[0];
  const currentProductName = productGroup === 'All product groups' ? topProduct?.name : productGroup;

  return (
    <section className="dashboard-live" aria-labelledby="dashboard-title">
      <div className="dashboard-heading">
        <div>
          <div className="project-section-label">Live dashboard</div>
          <h2 id="dashboard-title">Explore the retail signal.</h2>
          <p>Filter the public UCI Online Retail dataset to see where revenue comes from and where cancellations need attention.</p>
        </div>
        <div className="dashboard-controls" aria-label="Dashboard filters">
          <label><span>Market</span><select value={market} onChange={(event) => setMarket(event.target.value)}>{markets.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Product group</span><select value={productGroup} onChange={(event) => setProductGroup(event.target.value)}>{productGroups.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
      </div>

      <div className="dashboard-kpis" aria-live="polite">
        <div><span>Valid revenue</span><strong>{formatMoney(summary.revenue)}</strong></div>
        <div><span>Orders</span><strong>{formatNumber(summary.orders)}</strong></div>
        <div><span>Average order</span><strong>{formatMoney(summary.averageOrder)}</strong></div>
        <div><span>Cancellation rate</span><strong>{(summary.cancellationRate * 100).toFixed(1)}%</strong></div>
      </div>

      <div className="dashboard-chart-grid">
        <div className="dashboard-panel dashboard-trend-panel">
          <div className="dashboard-panel-heading"><div><span>Monthly trend</span><h3>Revenue over time</h3></div><strong>{formatNumber(summary.units)} units</strong></div>
          <svg className="dashboard-line-chart" viewBox="0 0 760 235" role="img" aria-label="Monthly revenue trend line chart">
            <title>Monthly revenue trend</title>
            {[40, 88, 136, 184].map((y) => <line key={y} x1="38" y1={y} x2="728" y2={y} className="dashboard-grid-line" />)}
            <polyline points={linePoints} className="dashboard-sales-line" />
            {monthly.map((row, index) => <circle key={row.month} cx={pointX(index)} cy={pointY(row.revenue)} r="4" className="dashboard-sales-point"><title>{`${formatMonth(row.month)}: ${formatMoney(row.revenue)}`}</title></circle>)}
            {monthly.map((row, index) => <text key={row.month} x={pointX(index)} y="216" textAnchor="middle" className="dashboard-axis-label">{formatMonth(row.month)}</text>)}
          </svg>
          <div className="dashboard-legend"><span><i className="legend-dot" />Revenue</span><span>Peak: {formatMoney(Math.max(...monthly.map((row) => row.revenue)))}</span></div>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-heading"><div><span>Product mix</span><h3>Where revenue comes from</h3></div></div>
          <div className="dashboard-bars">{productTotals.map((row) => <div className="dashboard-bar-row" key={row.name}><div className="dashboard-bar-label"><span>{row.name}</span><strong>{formatMoney(row.value)}</strong></div><div className="dashboard-bar-track"><div className="dashboard-bar-fill" style={{ width: `${(row.value / maxProductRevenue) * 100}%` }} /></div></div>)}</div>
        </div>
      </div>

      <div className="dashboard-bottom-grid">
        <div className="dashboard-panel">
          <div className="dashboard-panel-heading"><div><span>Market view</span><h3>Revenue by market</h3></div></div>
          <div className="dashboard-bars">{marketTotals.map((row) => <div className="dashboard-bar-row" key={row.name}><div className="dashboard-bar-label"><span>{row.name}</span><strong>{formatMoney(row.value)}</strong></div><div className="dashboard-bar-track"><div className="dashboard-bar-fill dashboard-bar-fill-alt" style={{ width: `${(row.value / maxMarketRevenue) * 100}%` }} /></div></div>)}</div>
        </div>
        <div className="dashboard-insight" aria-live="polite"><span>Current read</span><h3>{currentProductName || 'No product group'} leads this view.</h3><p>{topMarket?.name || 'No market'} is the largest market in this selection. The cancellation rate is {(summary.cancellationRate * 100).toFixed(1)}%, representing {formatMoney(summary.cancelledValue)} in cancelled line value to investigate.</p></div>
      </div>
    </section>
  );
}
