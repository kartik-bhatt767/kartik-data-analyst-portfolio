'use client';

import { useMemo, useState } from 'react';
import { campaignSummary, CampaignSummary } from './campaign-data';

const monthOrder = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const months = monthOrder.filter((month) => campaignSummary.some((row) => row.month === month));
const jobs = ['All jobs', ...Array.from(new Set(campaignSummary.map((row) => row.job))).sort()];
const channels = ['All channels', ...Array.from(new Set(campaignSummary.map((row) => row.contact))).sort()];
const pretty = (value: string) => value.replace(/\b\w/g, (letter) => letter.toUpperCase());
const formatNumber = (value: number) => Math.round(value).toLocaleString('en-US');
const formatPct = (value: number) => `${(value * 100).toFixed(1)}%`;
const sum = (rows: CampaignSummary[], field: keyof Pick<CampaignSummary, 'contacted' | 'subscribed' | 'campaignContacts' | 'durationTotal' | 'balanceTotal'>) => rows.reduce((total, row) => total + Number(row[field]), 0);

export default function InteractiveDashboard() {
  const [job, setJob] = useState('All jobs');
  const [channel, setChannel] = useState('All channels');

  const filteredRows = useMemo(() => campaignSummary.filter((row) => (job === 'All jobs' || row.job === job) && (channel === 'All channels' || row.contact === channel)), [job, channel]);
  const summary = useMemo(() => {
    const contacted = sum(filteredRows, 'contacted');
    const subscribed = sum(filteredRows, 'subscribed');
    return { contacted, subscribed, conversionRate: contacted ? subscribed / contacted : 0, averageContacts: contacted ? sum(filteredRows, 'campaignContacts') / contacted : 0 };
  }, [filteredRows]);

  const monthly = useMemo(() => months.map((month) => {
    const rows = filteredRows.filter((row) => row.month === month);
    const contacted = sum(rows, 'contacted');
    const subscribed = sum(rows, 'subscribed');
    return { month, contacted, subscribed, rate: contacted ? subscribed / contacted : 0 };
  }), [filteredRows]);

  const jobTotals = useMemo(() => jobs.slice(1).map((name) => {
    const rows = campaignSummary.filter((row) => row.job === name && (channel === 'All channels' || row.contact === channel));
    return { name, contacted: sum(rows, 'contacted'), subscribed: sum(rows, 'subscribed') };
  }).filter((row) => row.contacted > 0), [channel]);

  const channelTotals = useMemo(() => channels.slice(1).map((name) => {
    const rows = campaignSummary.filter((row) => row.contact === name && (job === 'All jobs' || row.job === job));
    const contacted = sum(rows, 'contacted');
    const subscribed = sum(rows, 'subscribed');
    return { name, contacted, subscribed, rate: contacted ? subscribed / contacted : 0 };
  }).filter((row) => row.contacted > 0), [job]);

  const maxMonthlyRate = Math.max(...monthly.map((row) => row.rate), 0.01);
  const maxJobSubscriptions = Math.max(...jobTotals.map((row) => row.subscribed), 1);
  const maxChannelRate = Math.max(...channelTotals.map((row) => row.rate), 0.01);
  const pointX = (index: number) => 38 + (index * 692) / Math.max(monthly.length - 1, 1);
  const pointY = (rate: number) => 186 - (rate / maxMonthlyRate) * 145;
  const linePoints = monthly.map((row, index) => `${pointX(index)},${pointY(row.rate)}`).join(' ');
  const topJob = [...jobTotals].sort((a, b) => b.subscribed - a.subscribed)[0];
  const topChannel = [...channelTotals].sort((a, b) => b.rate - a.rate)[0];

  return (
    <section className="dashboard-live" aria-labelledby="campaign-dashboard-title">
      <div className="dashboard-heading">
        <div>
          <div className="project-section-label">Live dashboard</div>
          <h2 id="campaign-dashboard-title">Find the audience signal.</h2>
          <p>Filter campaign records by job and contact channel to compare conversion, volume, and contact efficiency.</p>
        </div>
        <div className="dashboard-controls" aria-label="Campaign dashboard filters">
          <label><span>Job</span><select value={job} onChange={(event) => setJob(event.target.value)}>{jobs.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Contact channel</span><select value={channel} onChange={(event) => setChannel(event.target.value)}>{channels.map((item) => <option key={item} value={item}>{pretty(item)}</option>)}</select></label>
        </div>
      </div>

      <div className="dashboard-kpis" aria-live="polite">
        <div><span>Contacts</span><strong>{formatNumber(summary.contacted)}</strong></div>
        <div><span>Subscriptions</span><strong>{formatNumber(summary.subscribed)}</strong></div>
        <div><span>Conversion rate</span><strong>{formatPct(summary.conversionRate)}</strong></div>
        <div><span>Avg. contacts</span><strong>{summary.averageContacts.toFixed(1)}</strong></div>
      </div>

      <div className="dashboard-chart-grid">
        <div className="dashboard-panel dashboard-trend-panel">
          <div className="dashboard-panel-heading"><div><span>Monthly trend</span><h3>Conversion over time</h3></div><strong>{formatNumber(summary.contacted)} records</strong></div>
          <svg className="dashboard-line-chart" viewBox="0 0 760 235" role="img" aria-label="Monthly campaign conversion rate line chart">
            <title>Monthly campaign conversion rate</title>
            {[40, 88, 136, 184].map((y) => <line key={y} x1="38" y1={y} x2="728" y2={y} className="dashboard-grid-line" />)}
            <polyline points={linePoints} className="dashboard-sales-line" />
            {monthly.map((row, index) => <circle key={row.month} cx={pointX(index)} cy={pointY(row.rate)} r="4" className="dashboard-sales-point"><title>{`${pretty(row.month)}: ${formatPct(row.rate)}`}</title></circle>)}
            {monthly.map((row, index) => <text key={row.month} x={pointX(index)} y="216" textAnchor="middle" className="dashboard-axis-label">{pretty(row.month).slice(0, 3)}</text>)}
          </svg>
          <div className="dashboard-legend"><span><i className="legend-dot" />Conversion rate</span><span>Peak: {formatPct(Math.max(...monthly.map((row) => row.rate)))}</span></div>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-heading"><div><span>Job mix</span><h3>Where subscriptions come from</h3></div></div>
          <div className="dashboard-bars">{jobTotals.map((row) => <div className="dashboard-bar-row" key={row.name}><div className="dashboard-bar-label"><span>{row.name}</span><strong>{formatNumber(row.subscribed)}</strong></div><div className="dashboard-bar-track"><div className="dashboard-bar-fill" style={{ width: `${(row.subscribed / maxJobSubscriptions) * 100}%` }} /></div></div>)}</div>
        </div>
      </div>

      <div className="dashboard-bottom-grid">
        <div className="dashboard-panel">
          <div className="dashboard-panel-heading"><div><span>Channel view</span><h3>Conversion by channel</h3></div></div>
          <div className="dashboard-bars">{channelTotals.map((row) => <div className="dashboard-bar-row" key={row.name}><div className="dashboard-bar-label"><span>{pretty(row.name)}</span><strong>{formatPct(row.rate)}</strong></div><div className="dashboard-bar-track"><div className="dashboard-bar-fill dashboard-bar-fill-alt" style={{ width: `${(row.rate / maxChannelRate) * 100}%` }} /></div></div>)}</div>
        </div>
        <div className="dashboard-insight" aria-live="polite"><span>Current read</span><h3>{topJob?.name || 'No job'} brings the most subscriptions.</h3><p>{topChannel ? `${pretty(topChannel.name)} has the strongest conversion rate in this selection at ${formatPct(topChannel.rate)}.` : 'Choose a filter to compare campaign performance.'} Keep conversion rate and subscription volume separate when deciding who to contact next.</p></div>
      </div>
    </section>
  );
}
