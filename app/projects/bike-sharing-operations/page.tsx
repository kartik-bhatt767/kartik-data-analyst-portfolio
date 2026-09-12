import InteractiveDashboard from './interactive-dashboard';

export default function BikeSharingOperationsPage() {
  return (
    <main className="project-page">
      <header className="project-header">
        <a className="brand" href="/">KARTIK<span>/</span>BHATT</a>
        <a className="project-back" href="/">Back to portfolio <span aria-hidden="true">↗</span></a>
      </header>

      <section className="project-hero">
        <div className="project-kicker">Case study · 03 / Operations analytics</div>
        <h1>Plan for the <em>next rush.</em></h1>
        <p className="project-lede">An operations analysis that turns 17,379 hourly bike-rental records into a practical view of demand peaks, seasonality, and capacity-planning signals.</p>
        <div className="project-meta-grid">
          <div><span>Role</span><strong>Data analyst</strong></div>
          <div><span>Tools</span><strong>Python · SQL · Next.js</strong></div>
          <div><span>Dataset</span><strong>UCI Bike Sharing</strong></div>
          <div><span>Focus</span><strong>Demand planning</strong></div>
        </div>
      </section>

      <p className="project-source-note">Public source: <a href="https://archive.ics.uci.edu/dataset/275/bike%2Bsharing%2Bdataset" target="_blank" rel="noreferrer">UCI Bike Sharing ↗</a> · 3.29M recorded rides · Data covers 2011–2012.</p>

      <section className="project-kpis" aria-label="Operations KPIs">
        <div><span>Hourly records</span><strong>17,379</strong></div>
        <div><span>Total rides</span><strong>3.29M</strong></div>
        <div><span>Avg. rides / hour</span><strong>189</strong></div>
        <div><span>Registered share</span><strong>81.2%</strong></div>
      </section>

      <InteractiveDashboard />

      <section className="project-method" aria-labelledby="operations-method-title">
        <div>
          <div className="project-section-label">Method</div>
          <h2 id="operations-method-title">Turn patterns into operating decisions.</h2>
        </div>
        <div className="method-grid">
          <article><span>01 · Find the peak</span><h3>Plan around the hourly shape.</h3><p>Peak hours identify when staffing, fleet availability, and monitoring need the most attention.</p></article>
          <article><span>02 · Add context</span><h3>Compare season, weather, and day type.</h3><p>A demand number becomes more useful when the operating context behind it is visible.</p></article>
          <article><span>03 · Know the gap</span><h3>Do not promise rebalancing yet.</h3><p>The dataset has demand and weather but no station-level inventory or trip locations, so the next step is a better operations data model.</p></article>
        </div>
      </section>

      <section className="project-content-grid">
        <div>
          <div className="project-section-label">The question</div>
          <h2>When should the operation add capacity?</h2>
        </div>
        <div className="project-copy">
          <p>The dashboard is designed for an operations lead who needs to plan staffing and fleet attention around demand, rather than look at a single annual total.</p>
          <p>The workflow cleans hourly records, builds comparable time and context dimensions, and turns the strongest patterns into cautious operational recommendations.</p>
        </div>
      </section>

      <section className="project-recommendation">
        <div className="project-section-label">What I would do next</div>
        <div className="recommendation-grid">
          <article><span>01</span><h3>Staff for the peak</h3><p>Use the busiest hourly windows as a starting point for staffing and fleet-readiness plans.</p></article>
          <article><span>02</span><h3>Split commuter demand</h3><p>Compare working-day and weekend shapes before applying one capacity plan to every day.</p></article>
          <article><span>03</span><h3>Add station data</h3><p>Join availability, station, and trip-flow data before recommending rebalancing routes.</p></article>
        </div>
      </section>

      <footer className="project-footer"><a href="/">← Back to Kartik’s portfolio</a><span>Built with Python · SQL · BI thinking</span></footer>
    </main>
  );
}
