'use client';

import { useMemo, useState } from 'react';
import { rideSummary, RideSummary } from './bike-data';

const months = Array.from(new Set(rideSummary.map((row) => row.month))).sort();
const seasons = ['All seasons', ...Array.from(new Set(rideSummary.map((row) => row.season))).sort()];
const dayTypes = ['All day types', ...Array.from(new Set(rideSummary.map((row) => row.dayType))).sort()];
const weatherTypes = ['All weather', ...Array.from(new Set(rideSummary.map((row) => row.weather))).sort()];
const formatNumber = (value: number) => Math.round(value).toLocaleString('en-US');
const formatHour = (value: number) => `${String(value).padStart(2, '0')}:00`;
const formatMonth = (value: string) => {
  const [year, month] = value.split('-');
  return `${new Date(Number(year), Number(month) - 1, 1).toLocaleString('en-US', { month: 'short' })} '${year.slice(2)}`;
};
const sum = (rows: RideSummary[], field: keyof Pick<RideSummary, 'rides' | 'registered' | 'casual' | 'records'>) => rows.reduce((total, row) => total + Number(row[field]), 0);
const mean = (values: number[]) => values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
const standardDeviation = (values: number[]) => {
  if (values.length < 2) return 0;
  const average = mean(values);
  return Math.sqrt(mean(values.map((value) => (value - average) ** 2)));
};

type MonthlyPoint = { month: string; rides: number; records: number; average: number };
type HourPoint = { hour: number; rides: number; records: number; average: number };

export default function InteractiveDashboard() {
  const [season, setSeason] = useState('All seasons');
  const [dayType, setDayType] = useState('All day types');
  const [weather, setWeather] = useState('All weather');
  const [capacity, setCapacity] = useState(425);
  const [buffer, setBuffer] = useState(10);
  const [horizon, setHorizon] = useState(3);

  const filteredRows = useMemo(() => rideSummary.filter((row) => (
    (season === 'All seasons' || row.season === season)
    && (dayType === 'All day types' || row.dayType === dayType)
    && (weather === 'All weather' || row.weather === weather)
  )), [season, dayType, weather]);

  const summary = useMemo(() => {
    const rides = sum(filteredRows, 'rides');
    const records = sum(filteredRows, 'records');
    const registered = sum(filteredRows, 'registered');
    return {
      rides,
      records,
      registered,
      averageRides: records ? rides / records : 0,
      registeredShare: rides ? registered / rides : 0,
    };
  }, [filteredRows]);

  const monthly = useMemo<MonthlyPoint[]>(() => months.map((month) => {
    const rows = filteredRows.filter((row) => row.month === month);
    const rides = sum(rows, 'rides');
    const records = sum(rows, 'records');
    return { month, rides, records, average: records ? rides / records : 0 };
  }).filter((row) => row.records > 0), [filteredRows]);

  const hourly = useMemo<HourPoint[]>(() => Array.from({ length: 24 }, (_, hour) => {
    const rows = filteredRows.filter((row) => row.hour === hour);
    const rides = sum(rows, 'rides');
    const records = sum(rows, 'records');
    return { hour, rides, records, average: records ? rides / records : 0 };
  }).filter((row) => row.records > 0), [filteredRows]);

  const modelComparison = useMemo(() => {
    const definitions: Array<{ name: string; detail: string; predict: (index: number, actual: MonthlyPoint) => number | null }> = [
      {
        name: 'Seasonal naive',
        detail: 'Same month, prior year',
        predict: (_index, actual) => {
          const [year, month] = actual.month.split('-');
          return monthly.find((candidate) => candidate.month === `${Number(year) - 1}-${month}`)?.average ?? null;
        },
      },
      {
        name: 'Rolling 3-month',
        detail: 'Recent local average',
        predict: (index) => {
          const history = monthly.slice(Math.max(0, index - 3), index).map((row) => row.average);
          return history.length === 3 ? mean(history) : null;
        },
      },
      {
        name: 'Recent 6-month',
        detail: 'Longer smoothing window',
        predict: (index) => {
          const history = monthly.slice(Math.max(0, index - 6), index).map((row) => row.average);
          return history.length === 6 ? mean(history) : null;
        },
      },
    ];
    return definitions.map((model) => {
      const scored = monthly.slice(-6).map((actual) => {
        const index = monthly.indexOf(actual);
        const predicted = model.predict(index, actual);
        return predicted === null ? null : { actual: actual.average, predicted };
      }).filter((row): row is { actual: number; predicted: number } => Boolean(row));
      const mape = scored.length ? mean(scored.map((row) => Math.abs(row.predicted - row.actual) / Math.max(row.actual, 1))) * 100 : 0;
      const mae = scored.length ? mean(scored.map((row) => Math.abs(row.predicted - row.actual))) : 0;
      const bias = scored.length ? mean(scored.map((row) => row.predicted - row.actual)) : 0;
      return { ...model, mape, mae, bias, observations: scored.length };
    }).filter((model) => model.observations > 0);
  }, [monthly]);

  const winningModel = [...modelComparison].sort((a, b) => a.mape - b.mape)[0];

  const forecast = useMemo(() => {
    const recent = monthly.slice(-3).map((row) => row.average);
    const previous = monthly.slice(-6, -3).map((row) => row.average);
    const recentAverage = mean(recent);
    const previousAverage = mean(previous);
    const rawTrend = previousAverage ? (recentAverage - previousAverage) / previousAverage : 0;
    const trend = Math.max(-0.1, Math.min(0.1, rawTrend));
    const uncertainty = winningModel?.mae || 40;
    const points = Array.from({ length: horizon }, (_, index) => ({
      label: `Next ${index + 1}`,
      value: recentAverage * Math.pow(1 + trend, index + 1),
      low: Math.max(0, recentAverage * Math.pow(1 + trend, index + 1) - uncertainty),
      high: recentAverage * Math.pow(1 + trend, index + 1) + uncertainty,
    }));

    return { points, recentAverage, trend: rawTrend, mape: winningModel?.mape || 0, holdoutCount: winningModel?.observations || 0, uncertainty, selectedModel: winningModel?.name || 'Recent trend' };
  }, [horizon, monthly, winningModel]);

  const anomalyRows = useMemo(() => monthly.map((row, index) => {
    if (index < 3) return null;
    const history = monthly.slice(Math.max(0, index - 3), index).map((item) => item.average);
    const baseline = history.length ? mean(history) : mean(monthly.map((item) => item.average));
    const deviation = standardDeviation(history) || Math.max(baseline * 0.08, 1);
    return { ...row, baseline, score: (row.average - baseline) / deviation };
  }).filter((row): row is MonthlyPoint & { baseline: number; score: number } => Boolean(row)).sort((a, b) => Math.abs(b.score) - Math.abs(a.score)).slice(0, 3), [monthly]);

  const contextQueue = useMemo(() => {
    const contexts = Array.from(new Set(filteredRows.map((row) => `${row.dayType} · ${row.weather}`)));
    return contexts.map((context) => {
      const rows = filteredRows.filter((row) => `${row.dayType} · ${row.weather}` === context);
      const byHour = Array.from({ length: 24 }, (_, hour) => {
        const hourRows = rows.filter((row) => row.hour === hour);
        const rides = sum(hourRows, 'rides');
        const records = sum(hourRows, 'records');
        return { hour, average: records ? rides / records : 0, records };
      }).filter((row) => row.records > 0);
      const peak = [...byHour].sort((a, b) => b.average - a.average)[0];
      const load = peak ? peak.average / capacity : 0;
      return {
        context,
        peakHour: peak?.hour ?? 0,
        peakAverage: peak?.average ?? 0,
        records: rows.reduce((total, row) => total + row.records, 0),
        load,
        risk: load >= 1.15 ? 'Critical' : load >= 0.95 ? 'Watch' : 'Covered',
        action: load >= 1.15 ? 'Add surge capacity' : load >= 0.95 ? 'Protect buffer' : 'Monitor baseline',
      };
    }).filter((row) => row.records >= 20).sort((a, b) => b.load - a.load).slice(0, 6);
  }, [capacity, filteredRows]);

  const maxMonthly = Math.max(...monthly.map((row) => row.average), 1);
  const maxHour = Math.max(...hourly.map((row) => row.average), 1);
  const peakHour = [...hourly].sort((a, b) => b.average - a.average)[0];
  const bufferedCapacity = capacity * (1 + buffer / 100);
  const hoursAtRisk = hourly.filter((row) => row.average > bufferedCapacity).length;
  const peakLoad = peakHour ? (peakHour.average / bufferedCapacity) * 100 : 0;
  const pointX = (index: number) => 38 + (index * 692) / Math.max(monthly.length - 1, 1);
  const pointY = (value: number) => 186 - (value / maxMonthly) * 145;
  const linePoints = monthly.map((row, index) => `${pointX(index)},${pointY(row.average)}`).join(' ');
  const topHours = [...hourly].sort((a, b) => b.average - a.average).slice(0, 8).sort((a, b) => a.hour - b.hour);
  const latestAnomaly = anomalyRows[0];
  const trendLabel = forecast.trend > 0.03 ? 'Demand is rising' : forecast.trend < -0.03 ? 'Demand is cooling' : 'Demand is broadly stable';
  const scenarioMatrix = [350, 425, 500].map((scenarioCapacity) => ({
    capacity: scenarioCapacity,
    risks: [0, 10, 20].map((scenarioBuffer) => hourly.filter((row) => row.average > scenarioCapacity * (1 + scenarioBuffer / 100)).length),
  }));

  return (
    <section className="dashboard-live" aria-labelledby="operations-dashboard-title">
      <div className="dashboard-heading">
        <div>
          <div className="project-section-label">Live planning lab</div>
          <h2 id="operations-dashboard-title">Forecast the next bottleneck.</h2>
          <p>Change the operating assumptions, backtest the baseline, and see which demand windows need protection before the plan breaks.</p>
        </div>
        <div className="dashboard-controls" aria-label="Operations planning controls">
          <label><span>Season</span><select value={season} onChange={(event) => setSeason(event.target.value)}>{seasons.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Day type</span><select value={dayType} onChange={(event) => setDayType(event.target.value)}>{dayTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Weather</span><select value={weather} onChange={(event) => setWeather(event.target.value)}>{weatherTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="dashboard-range"><span>Capacity / hour <strong>{capacity}</strong></span><input type="range" min="250" max="650" step="25" value={capacity} onChange={(event) => setCapacity(Number(event.target.value))} /></label>
          <label className="dashboard-range"><span>Safety buffer <strong>{buffer}%</strong></span><input type="range" min="0" max="25" step="5" value={buffer} onChange={(event) => setBuffer(Number(event.target.value))} /></label>
        </div>
      </div>

      <div className="dashboard-kpis" aria-live="polite">
        <div><span>Average rides / hour</span><strong>{formatNumber(summary.averageRides)}</strong></div>
        <div><span>Peak demand window</span><strong>{peakHour ? formatHour(peakHour.hour) : '—'}</strong></div>
        <div><span>Buffered peak load</span><strong>{peakLoad.toFixed(0)}%</strong></div>
        <div><span>Windows above plan</span><strong>{hoursAtRisk} / 24</strong></div>
      </div>

      <div className="dashboard-chart-grid">
        <div className="dashboard-panel dashboard-trend-panel">
          <div className="dashboard-panel-heading"><div><span>Observed demand</span><h3>Average rides per hour</h3></div><strong>{formatNumber(summary.records)} source rows</strong></div>
          <svg className="dashboard-line-chart" viewBox="0 0 760 235" role="img" aria-label="Monthly average rides per hour trend line chart">
            <title>Monthly average rides per hour</title>
            {[40, 88, 136, 184].map((y) => <line key={y} x1="38" y1={y} x2="728" y2={y} className="dashboard-grid-line" />)}
            <polyline points={linePoints} className="dashboard-sales-line" />
            {monthly.map((row, index) => <circle key={row.month} cx={pointX(index)} cy={pointY(row.average)} r="4" className="dashboard-sales-point"><title>{`${formatMonth(row.month)}: ${formatNumber(row.average)} average rides / hour`}</title></circle>)}
            {monthly.map((row, index) => index % 2 === 0 ? <text key={row.month} x={pointX(index)} y="216" textAnchor="middle" className="dashboard-axis-label">{formatMonth(row.month)}</text> : null)}
          </svg>
          <div className="dashboard-legend"><span><i className="legend-dot" />Observed average</span><span>{trendLabel}</span></div>
        </div>

        <div className="dashboard-panel operations-forecast-panel">
          <div className="dashboard-panel-heading"><div><span>Planning baseline</span><h3>What comes next?</h3></div><strong>{forecast.holdoutCount}-period holdout</strong></div>
          <p className="dashboard-note">Selected model: {forecast.selectedModel}. Holdout scores compare predictions with later observed periods; the band uses the model&apos;s average absolute error.</p>
          <div className="forecast-controls"><label><span>Horizon</span><select value={horizon} onChange={(event) => setHorizon(Number(event.target.value))}><option value="1">1 period</option><option value="3">3 periods</option><option value="6">6 periods</option></select></label><div><span>Baseline MAPE</span><strong>{forecast.mape.toFixed(1)}%</strong></div></div>
          <div className="forecast-list">{forecast.points.map((point) => <div className="forecast-row" key={point.label}><span>{point.label}</span><div className="forecast-track"><div className="forecast-fill" style={{ width: `${Math.min((point.value / Math.max(maxMonthly, 1)) * 100, 100)}%` }} /></div><strong>{formatNumber(point.value)}<small>{formatNumber(point.low)}–{formatNumber(point.high)}</small></strong></div>)}</div>
          <p className="dashboard-note">The forecast is a planning baseline, not a production prediction. The next step is daily data with a time-based validation window.</p>
        </div>
      </div>

      <div className="dashboard-bottom-grid">
        <div className="dashboard-panel">
          <div className="dashboard-panel-heading"><div><span>Pressure profile</span><h3>Top operating hours</h3></div><strong>avg. rides / hour</strong></div>
          <div className="dashboard-bars">{topHours.map((row) => <div className="dashboard-bar-row" key={row.hour}><div className="dashboard-bar-label"><span>{formatHour(row.hour)}</span><strong>{formatNumber(row.average)}</strong></div><div className="dashboard-bar-track"><div className="dashboard-bar-fill" style={{ width: `${(row.average / maxHour) * 100}%` }} /></div></div>)}</div>
        </div>
        <div className="dashboard-insight operations-insight" aria-live="polite"><span>Current decision</span><h3>{peakHour ? `${formatHour(peakHour.hour)} needs ${formatNumber(Math.max(0, peakHour.average - bufferedCapacity))} more rides of headroom.` : 'Choose a filter to explore.'}</h3><p>{hoursAtRisk ? `${hoursAtRisk} hourly windows exceed the selected capacity plus buffer. Start with the highest-risk context below.` : 'The selected capacity covers the observed hourly profile. Reduce the assumption to stress-test the plan.'}</p></div>
      </div>

      <div className="operations-model-grid">
        <div className="dashboard-panel">
          <div className="dashboard-panel-heading"><div><span>Model challenge</span><h3>Does complexity beat a baseline?</h3></div><strong>{forecast.holdoutCount}-period test</strong></div>
          <div className="case-table-wrap"><table className="case-table model-comparison-table"><thead><tr><th>Model</th><th>MAPE</th><th>MAE</th><th>Bias</th></tr></thead><tbody>{modelComparison.map((model) => <tr key={model.name} className={model.name === forecast.selectedModel ? 'model-winner' : ''}><td><strong>{model.name}</strong><small>{model.detail}</small></td><td>{model.mape.toFixed(1)}%</td><td>{formatNumber(model.mae)}</td><td>{model.bias >= 0 ? '+' : ''}{formatNumber(model.bias)}</td></tr>)}</tbody></table></div>
          <p className="dashboard-note">MAPE is relative error; MAE is average rides per hour; bias shows systematic under- or over-prediction. The lowest MAPE wins this planning comparison.</p>
        </div>
        <div className="dashboard-insight model-selection-insight"><span>Selected planning model</span><h3>{forecast.selectedModel}</h3><p>It has the lowest holdout MAPE in the selected view. Forecast ranges are shown as a simple error band of ±{formatNumber(forecast.uncertainty)} rides / hour, not as a formal confidence interval.</p></div>
      </div>

      <div className="operations-evidence-grid">
        <div className="dashboard-panel">
          <div className="dashboard-panel-heading"><div><span>Data quality watch</span><h3>Unusual demand periods</h3></div><strong>rolling z-score</strong></div>
          <div className="anomaly-list">{anomalyRows.map((row) => <div className="anomaly-row" key={row.month}><div><strong>{formatMonth(row.month)}</strong><span>{row.score >= 0 ? 'Above baseline' : 'Below baseline'}</span></div><strong className={Math.abs(row.score) >= 2 ? 'anomaly-alert' : ''}>{row.score >= 0 ? '+' : ''}{row.score.toFixed(1)}σ</strong><span>{formatNumber(row.average)} avg / hr</span></div>)}</div>
          <p className="dashboard-note">An anomaly is a prompt to investigate calendar, weather, or service changes—not proof of an operational failure.</p>
        </div>
        <div className="dashboard-panel operations-assumptions">
          <div className="dashboard-panel-heading"><div><span>Assumptions</span><h3>What the model can and cannot say</h3></div></div>
          <ul><li><strong>Can:</strong> rank demand pressure by hour and operating context.</li><li><strong>Can:</strong> quantify a simple holdout forecast error and capacity gap.</li><li><strong>Cannot:</strong> recommend station-level moves without inventory and trip-flow data.</li><li><strong>Next:</strong> join live stock, maintenance, events, and weather forecasts.</li></ul>
          {latestAnomaly ? <div className="assumption-callout"><span>Largest watch item</span><strong>{formatMonth(latestAnomaly.month)} · {latestAnomaly.score >= 0 ? 'positive' : 'negative'} deviation</strong></div> : null}
        </div>
      </div>

      <div className="operations-queue">
        <div className="dashboard-panel-heading"><div><span>Capacity stress test</span><h3>Which context should the team protect first?</h3></div><strong>capacity {capacity} + {buffer}% buffer</strong></div>
        <div className="scenario-matrix"><div className="scenario-matrix-heading"><span>Sensitivity matrix</span><strong>Windows above buffered plan</strong></div><div className="case-table-wrap"><table className="case-table scenario-table"><thead><tr><th>Capacity / buffer</th><th>0%</th><th>10%</th><th>20%</th></tr></thead><tbody>{scenarioMatrix.map((row) => <tr key={row.capacity}><td>{row.capacity} rides / hr</td>{row.risks.map((risk, index) => <td key={index}><strong className={risk > 0 ? 'scenario-risk' : 'scenario-safe'}>{risk}</strong></td>)}</tr>)}</tbody></table></div></div>
        <div className="case-table-wrap"><table className="case-table operations-table"><thead><tr><th>Context</th><th>Peak hour</th><th>Avg. rides / hr</th><th>Load</th><th>Risk</th><th>Starting action</th></tr></thead><tbody>{contextQueue.map((row) => <tr key={row.context}><td>{row.context}</td><td>{formatHour(row.peakHour)}</td><td>{formatNumber(row.peakAverage)}</td><td>{(row.load * 100).toFixed(0)}%</td><td><span className={`risk-pill risk-${row.risk.toLowerCase()}`}>{row.risk}</span></td><td>{row.action}</td></tr>)}</tbody></table></div>
        <p className="dashboard-note">Load compares observed average demand at the context&apos;s peak hour with the selected base capacity. It is a planning signal, not a measured stockout rate.</p>
      </div>
    </section>
  );
}
