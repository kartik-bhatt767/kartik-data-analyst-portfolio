'use client';

import { useMemo, useState } from 'react';
import { rideSummary, RideSummary } from './bike-data';

const months = Array.from(new Set(rideSummary.map((row) => row.month))).sort();
const seasons = ['All seasons', ...Array.from(new Set(rideSummary.map((row) => row.season))).sort()];
const dayTypes = ['All day types', ...Array.from(new Set(rideSummary.map((row) => row.dayType))).sort()];
const weatherTypes = ['All weather', ...Array.from(new Set(rideSummary.map((row) => row.weather))).sort()];
const formatNumber = (value: number) => Math.round(value).toLocaleString('en-US');
const formatMonth = (value: string) => {
  const [year, month] = value.split('-');
  return `${new Date(Number(year), Number(month) - 1, 1).toLocaleString('en-US', { month: 'short' })} '${year.slice(2)}`;
};
const formatHour = (value: number) => `${String(value).padStart(2, '0')}:00`;
const sum = (rows: RideSummary[], field: keyof Pick<RideSummary, 'rides' | 'registered' | 'casual' | 'records'>) => rows.reduce((total, row) => total + Number(row[field]), 0);

export default function InteractiveDashboard() {
  const [season, setSeason] = useState('All seasons');
  const [dayType, setDayType] = useState('All day types');
  const [weather, setWeather] = useState('All weather');

  const filteredRows = useMemo(() => rideSummary.filter((row) => (season === 'All seasons' || row.season === season) && (dayType === 'All day types' || row.dayType === dayType) && (weather === 'All weather' || row.weather === weather)), [season, dayType, weather]);
  const summary = useMemo(() => {
    const rides = sum(filteredRows, 'rides');
    const records = sum(filteredRows, 'records');
    const registered = sum(filteredRows, 'registered');
    return { rides, records, registered, casual: sum(filteredRows, 'casual'), averageRides: records ? rides / records : 0, registeredShare: rides ? registered / rides : 0 };
  }, [filteredRows]);

  const monthly = useMemo(() => months.map((month) => ({ month, rides: sum(filteredRows.filter((row) => row.month === month), 'rides') })), [filteredRows]);
  const hourly = useMemo(() => Array.from({ length: 24 }, (_, hour) => ({ hour, rides: sum(filteredRows.filter((row) => row.hour === hour), 'rides') })).filter((row) => row.rides > 0), [filteredRows]);
  const seasonTotals = useMemo(() => seasons.slice(1).map((name) => ({ name, rides: sum(rideSummary.filter((row) => row.season === name && (dayType === 'All day types' || row.dayType === dayType) && (weather === 'All weather' || row.weather === weather)), 'rides') })).filter((row) => row.rides > 0), [dayType, weather]);

  const maxMonthlyRides = Math.max(...monthly.map((row) => row.rides), 1);
  const maxHourRides = Math.max(...hourly.map((row) => row.rides), 1);
  const maxSeasonRides = Math.max(...seasonTotals.map((row) => row.rides), 1);
  const pointX = (index: number) => 38 + (index * 692) / Math.max(monthly.length - 1, 1);
  const pointY = (rides: number) => 186 - (rides / maxMonthlyRides) * 145;
  const linePoints = monthly.map((row, index) => `${pointX(index)},${pointY(row.rides)}`).join(' ');
  const peakHour = [...hourly].sort((a, b) => b.rides - a.rides)[0];
  const topHours = [...hourly].sort((a, b) => b.rides - a.rides).slice(0, 8).sort((a, b) => a.hour - b.hour);
  const topSeason = [...seasonTotals].sort((a, b) => b.rides - a.rides)[0];

  return (
    <section className="dashboard-live" aria-labelledby="operations-dashboard-title">
      <div className="dashboard-heading">
        <div>
          <div className="project-section-label">Live dashboard</div>
          <h2 id="operations-dashboard-title">Plan for the next rush.</h2>
          <p>Filter hourly bike rentals by season, day type, and weather to find the demand patterns operations teams can act on.</p>
        </div>
        <div className="dashboard-controls" aria-label="Operations dashboard filters">
          <label><span>Season</span><select value={season} onChange={(event) => setSeason(event.target.value)}>{seasons.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Day type</span><select value={dayType} onChange={(event) => setDayType(event.target.value)}>{dayTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Weather</span><select value={weather} onChange={(event) => setWeather(event.target.value)}>{weatherTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
      </div>

      <div className="dashboard-kpis" aria-live="polite">
        <div><span>Total rides</span><strong>{formatNumber(summary.rides)}</strong></div>
        <div><span>Avg. per hour</span><strong>{formatNumber(summary.averageRides)}</strong></div>
        <div><span>Peak hour</span><strong>{peakHour ? formatHour(peakHour.hour) : '—'}</strong></div>
        <div><span>Registered share</span><strong>{(summary.registeredShare * 100).toFixed(1)}%</strong></div>
      </div>

      <div className="dashboard-chart-grid">
        <div className="dashboard-panel dashboard-trend-panel">
          <div className="dashboard-panel-heading"><div><span>Monthly trend</span><h3>Rides over time</h3></div><strong>{formatNumber(summary.records)} hourly records</strong></div>
          <svg className="dashboard-line-chart" viewBox="0 0 760 235" role="img" aria-label="Monthly bike rental trend line chart">
            <title>Monthly bike rental trend</title>
            {[40, 88, 136, 184].map((y) => <line key={y} x1="38" y1={y} x2="728" y2={y} className="dashboard-grid-line" />)}
            <polyline points={linePoints} className="dashboard-sales-line" />
            {monthly.map((row, index) => <circle key={row.month} cx={pointX(index)} cy={pointY(row.rides)} r="4" className="dashboard-sales-point"><title>{`${formatMonth(row.month)}: ${formatNumber(row.rides)} rides`}</title></circle>)}
            {monthly.map((row, index) => index % 2 === 0 ? <text key={row.month} x={pointX(index)} y="216" textAnchor="middle" className="dashboard-axis-label">{formatMonth(row.month)}</text> : null)}
          </svg>
          <div className="dashboard-legend"><span><i className="legend-dot" />Rides</span><span>Peak month: {formatNumber(Math.max(...monthly.map((row) => row.rides)))}</span></div>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-heading"><div><span>Hourly shape</span><h3>When demand peaks</h3></div></div>
          <div className="dashboard-bars">{topHours.map((row) => <div className="dashboard-bar-row" key={row.hour}><div className="dashboard-bar-label"><span>{formatHour(row.hour)}</span><strong>{formatNumber(row.rides)}</strong></div><div className="dashboard-bar-track"><div className="dashboard-bar-fill" style={{ width: `${(row.rides / maxHourRides) * 100}%` }} /></div></div>)}</div>
        </div>
      </div>

      <div className="dashboard-bottom-grid">
        <div className="dashboard-panel">
          <div className="dashboard-panel-heading"><div><span>Season view</span><h3>Rides by season</h3></div></div>
          <div className="dashboard-bars">{seasonTotals.map((row) => <div className="dashboard-bar-row" key={row.name}><div className="dashboard-bar-label"><span>{row.name}</span><strong>{formatNumber(row.rides)}</strong></div><div className="dashboard-bar-track"><div className="dashboard-bar-fill dashboard-bar-fill-alt" style={{ width: `${(row.rides / maxSeasonRides) * 100}%` }} /></div></div>)}</div>
        </div>
        <div className="dashboard-insight" aria-live="polite"><span>Current read</span><h3>{peakHour ? `${formatHour(peakHour.hour)} is the pressure point.` : 'Choose a filter to explore.'}</h3><p>{topSeason?.name || 'The selected view'} has the highest demand in this selection. Use the hourly shape for staffing and fleet planning, then add station inventory before deciding where to rebalance.</p></div>
      </div>
    </section>
  );
}
