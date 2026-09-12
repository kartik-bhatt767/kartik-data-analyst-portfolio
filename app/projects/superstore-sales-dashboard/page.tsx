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
        <p className="project-lede">An end-to-end retail analysis that turns 541,909 public transaction lines into a clear view of revenue, demand, product mix, and cancellation risk.</p>
        <div className="project-meta-grid">
          <div><span>Role</span><strong>Data analyst</strong></div>
          <div><span>Tools</span><strong>Python · SQL · Next.js</strong></div>
          <div><span>Dataset</span><strong>UCI Online Retail</strong></div>
          <div><span>Focus</span><strong>Revenue and retention</strong></div>
        </div>
      </section>

      <p className="project-source-note">Public source: <a href="https://archive.ics.uci.edu/dataset/352/online%2Bretail" target="_blank" rel="noreferrer">UCI Online Retail ↗</a> · Revenue is reported in GBP · Product groups are documented feature engineering.</p>

      <section className="project-kpis" aria-label="Project KPIs">
        <div><span>Valid revenue</span><strong>£10.67M</strong></div>
        <div><span>Valid orders</span><strong>19,960</strong></div>
        <div><span>Known customers</span><strong>4,338</strong></div>
        <div><span>Cancellation lines</span><strong>9,288</strong></div>
      </section>

      <InteractiveDashboard />

      <section className="project-method" aria-labelledby="method-title">
        <div>
          <div className="project-section-label">Method</div>
          <h2 id="method-title">Trust the number before the story.</h2>
        </div>
        <div className="method-grid">
          <article><span>01 · Data quality</span><h3>Separate valid sales from cancellations.</h3><p>Invoices beginning with C, non-positive quantities, and non-positive prices are not counted as valid revenue.</p></article>
          <article><span>02 · Feature engineering</span><h3>Make assumptions visible.</h3><p>Markets come from country rules, while product groups come from documented description keywords—not hidden categories.</p></article>
          <article><span>03 · Limitation</span><h3>Do not invent profit.</h3><p>The source has no cost field, so this case study reports revenue, orders, units, and cancellation rate instead.</p></article>
        </div>
      </section>

      <section className="project-content-grid">
        <div>
          <div className="project-section-label">The question</div>
          <h2>Where is demand coming from, and where is revenue leaking?</h2>
        </div>
        <div className="project-copy">
          <p>The dashboard is designed for a manager who needs the story quickly: which market and product group drive revenue, which month is strongest, and whether cancellations are eroding the demand signal.</p>
          <p>The workflow starts with a public transaction workbook, removes invalid sales lines, identifies cancellations, engineers transparent market and product-group dimensions, and finishes with an interactive decision view.</p>
        </div>
      </section>

      <section className="project-recommendation">
        <div className="project-section-label">What I would do next</div>
        <div className="recommendation-grid">
          <article><span>01</span><h3>Investigate cancellations</h3><p>Separate gross demand from retained revenue, then review the highest-cancellation market and product groups.</p></article>
          <article><span>02</span><h3>Use the UK as a baseline</h3><p>The UK contributes most revenue, so Europe, APAC, and the Americas should be evaluated as expansion hypotheses.</p></article>
          <article><span>03</span><h3>Add cost data next</h3><p>The source has no cost field. Add cost, shipping, and customer segments before making profit or lifetime-value claims.</p></article>
        </div>
      </section>

      <footer className="project-footer"><a href="/">← Back to Kartik’s portfolio</a><span>Built with Python · SQL · BI thinking</span></footer>
    </main>
  );
}
