import InteractiveDashboard from './interactive-dashboard';

export default function BikeSharingOperationsPage() {
  return (
    <main className="project-page">
      <header className="project-header">
        <a className="brand" href="/">KARTIK<span>/</span>BHATT</a>
        <a className="project-back" href="/">Back to portfolio <span aria-hidden="true">↗</span></a>
      </header>

      <section className="project-hero">
        <div className="project-kicker">Case study · 03 / Advanced operations analytics</div>
        <h1>Forecast the <em>next bottleneck.</em></h1>
        <p className="project-lede">A planning system built from 17,379 hourly bike-rental records. It combines a seasonal baseline forecast, capacity stress testing, anomaly detection, and an explainable action queue.</p>
        <div className="project-meta-grid">
          <div><span>Role</span><strong>Data analyst</strong></div>
          <div><span>Tools</span><strong>Python · SQL · Forecasting</strong></div>
          <div><span>Dataset</span><strong>UCI Bike Sharing</strong></div>
          <div><span>Focus</span><strong>Capacity planning</strong></div>
        </div>
      </section>

      <p className="project-source-note">Public source: <a href="https://archive.ics.uci.edu/dataset/275/bike%2Bsharing%2Bdataset" target="_blank" rel="noreferrer">UCI Bike Sharing ↗</a> · 3.29M recorded rides · 24 months · 2011–2012.</p>

      <section className="project-kpis" aria-label="Operations KPIs">
        <div><span>Hourly records</span><strong>17,379</strong></div>
        <div><span>Total rides</span><strong>3.29M</strong></div>
        <div><span>Avg. rides / hour</span><strong>189</strong></div>
        <div><span>Peak hour</span><strong>17:00</strong></div>
      </section>

      <InteractiveDashboard />

      <section className="project-method" aria-labelledby="operations-method-title">
        <div>
          <div className="project-section-label">Method</div>
          <h2 id="operations-method-title">Turn uncertainty into an operating plan.</h2>
        </div>
        <div className="method-grid">
          <article><span>01 · Forecast</span><h3>Challenge transparent baselines.</h3><p>A six-month time-based holdout compares seasonal, rolling, and smoothing baselines before anyone trusts a planning number.</p></article>
          <article><span>02 · Stress test</span><h3>Make the capacity assumption visible.</h3><p>A planner can change hourly capacity and safety buffer to see which operating windows become exposed first.</p></article>
          <article><span>03 · Keep the gap visible</span><h3>Separate demand from inventory.</h3><p>The source has no station-level stock or trip flow, so the action queue identifies pressure windows without pretending to know where bikes are.</p></article>
        </div>
      </section>

      <section className="project-content-grid">
        <div>
          <div className="project-section-label">The question</div>
          <h2>How much capacity should the operation protect before demand moves?</h2>
        </div>
        <div className="project-copy">
          <p>The dashboard is designed for an operations lead who needs a defensible planning baseline, not a decorative trend line. It makes the capacity assumption explicit, tests the model on a later time window, and ranks the contexts where the plan is most likely to break.</p>
          <p>The workflow cleans hourly records, compares seasonal cohorts, challenges transparent baselines, calculates anomaly scores, and turns the result into a queue that a manager could use in a weekly planning meeting.</p>
        </div>
      </section>

      <section className="project-recommendation">
        <div className="project-section-label">What I would do next</div>
        <div className="recommendation-grid">
          <article><span>01</span><h3>Protect the evening peak</h3><p>Use the 17:00–18:00 window as the first capacity test, then validate it by day type and weather rather than using one blended target.</p></article>
          <article><span>02</span><h3>Plan with a buffer</h3><p>Use the scenario control to compare base capacity with a 10–20% operating buffer and quantify how many windows remain exposed.</p></article>
          <article><span>03</span><h3>Join live operations data</h3><p>Add station stock, trip origins, maintenance downtime, and weather forecasts before turning pressure signals into dispatch routes.</p></article>
        </div>
      </section>

      <footer className="project-footer"><a href="/">← Back to Kartik’s portfolio</a><span>Built with Python · SQL · BI thinking</span></footer>
    </main>
  );
}
