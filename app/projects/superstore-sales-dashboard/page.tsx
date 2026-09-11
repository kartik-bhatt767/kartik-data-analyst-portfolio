import InteractiveDashboard from './interactive-dashboard';

export default function SuperstoreSalesDashboardPage() {
  return (
    <main className="project-page">
      <header className="project-header">
        <a className="brand" href="/">KARTIK<span>/</span>BHATT</a>
        <a className="project-back" href="/">Back to portfolio <span aria-hidden="true">↗</span></a>
      </header>

      <section className="project-hero">
        <div className="project-kicker">Case study · 01 / Business intelligence</div>
        <h1>Retail sales, <em>without the fog.</em></h1>
        <p className="project-lede">A beginner-friendly analysis that turns a retail order table into a clear view of revenue, profit, regional performance, and discount risk.</p>
        <div className="project-meta-grid">
          <div><span>Role</span><strong>Data analyst</strong></div>
          <div><span>Tools</span><strong>Python · SQL · Power BI</strong></div>
          <div><span>Dataset</span><strong>36 practice orders</strong></div>
          <div><span>Focus</span><strong>Sales and margin</strong></div>
        </div>
      </section>

      <section className="project-kpis" aria-label="Project KPIs">
        <div><span>Total sales</span><strong>$53,980</strong></div>
        <div><span>Total profit</span><strong>$6,619</strong></div>
        <div><span>Profit margin</span><strong>12.3%</strong></div>
        <div><span>Loss-making orders</span><strong>4 / 36</strong></div>
      </section>

      <InteractiveDashboard />

      <section className="project-content-grid">
        <div>
          <div className="project-section-label">The question</div>
          <h2>Where should the business grow, and where should it protect margin?</h2>
        </div>
        <div className="project-copy">
          <p>The dashboard is designed for a manager who needs the story quickly: which category drives sales, which region needs attention, and whether discounts are creating growth or simply reducing profit.</p>
          <p>The workflow starts with a clean order table, creates reusable KPI queries, and finishes with a dashboard layout that supports a decision instead of showing charts for their own sake.</p>
        </div>
      </section>

      <section className="project-recommendation">
        <div className="project-section-label">What I would do next</div>
        <div className="recommendation-grid">
          <article><span>01</span><h3>Review high discounts</h3><p>Four orders lose money. Check promotion rules before pushing more volume through the same offers.</p></article>
          <article><span>02</span><h3>Protect the South region</h3><p>South leads sales but has the weakest margin, so growth alone is not the right success metric.</p></article>
          <article><span>03</span><h3>Use more history</h3><p>Add a larger, multi-year dataset to test seasonality and make future recommendations more reliable.</p></article>
        </div>
      </section>

      <footer className="project-footer"><a href="/">← Back to Kartik’s portfolio</a><span>Built with Python · SQL · BI thinking</span></footer>
    </main>
  );
}
