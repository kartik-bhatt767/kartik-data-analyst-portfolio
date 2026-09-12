import InteractiveDashboard from './interactive-dashboard';
import ModelEvidence from './model-evidence';

export default function BankMarketingCampaignPage() {
  return (
    <main className="project-page">
      <header className="project-header">
        <a className="brand" href="/">KARTIK<span>/</span>BHATT</a>
        <a className="project-back" href="/">Back to portfolio <span aria-hidden="true">↗</span></a>
      </header>

      <section className="project-hero">
        <div className="project-kicker">Case study · 02 / Customer analytics</div>
        <h1>Campaigns that <em>convert.</em></h1>
        <p className="project-lede">A campaign-performance analysis that turns 45,211 bank contacts into a clearer answer to one practical question: who should the next call reach?</p>
        <div className="project-meta-grid">
          <div><span>Role</span><strong>Data analyst</strong></div>
          <div><span>Tools</span><strong>Python · SQL · Next.js</strong></div>
          <div><span>Dataset</span><strong>UCI Bank Marketing</strong></div>
          <div><span>Focus</span><strong>Conversion efficiency</strong></div>
        </div>
      </section>

      <p className="project-source-note">Public source: <a href="https://archive.ics.uci.edu/dataset/222/bank%2Bmarketing" target="_blank" rel="noreferrer">UCI Bank Marketing ↗</a> · 45,211 campaign records · Conversion means a subscribed term deposit.</p>

      <section className="project-kpis" aria-label="Campaign KPIs">
        <div><span>Campaign contacts</span><strong>45,211</strong></div>
        <div><span>Subscriptions</span><strong>5,289</strong></div>
        <div><span>Conversion rate</span><strong>11.7%</strong></div>
        <div><span>Avg. contacts</span><strong>2.8</strong></div>
      </section>

      <InteractiveDashboard />

      <ModelEvidence />

      <section className="project-method" aria-labelledby="campaign-method-title">
        <div>
          <div className="project-section-label">Method</div>
          <h2 id="campaign-method-title">Make the next call more intentional.</h2>
        </div>
        <div className="method-grid">
          <article><span>01 · Separate volume</span><h3>Count subscriptions and rate separately.</h3><p>Management contributes the most subscriptions by volume, while smaller groups can have higher observed conversion rates.</p></article>
          <article><span>02 · Watch efficiency</span><h3>Repeated contact is not free.</h3><p>The 6+ contact group converts at a lower rate in this dataset, so more calls should not automatically mean better performance.</p></article>
          <article><span>03 · Avoid leakage</span><h3>Do not train on future information.</h3><p>Call duration is known after contact. It can explain historical outcomes, but it should be treated carefully in a pre-call prediction model.</p></article>
        </div>
      </section>

      <section className="project-content-grid">
        <div>
          <div className="project-section-label">The question</div>
          <h2>Who should the next campaign reach?</h2>
        </div>
        <div className="project-copy">
          <p>The dashboard is designed for a campaign manager who needs to balance conversion rate, subscription volume, and contact effort rather than chase a single percentage.</p>
          <p>The workflow cleans campaign records, defines conversion consistently, compares job and channel segments, and makes the limitations visible before a recommendation is made.</p>
        </div>
      </section>

      <section className="project-recommendation">
        <div className="project-section-label">What I would do next</div>
        <div className="recommendation-grid">
          <article><span>01</span><h3>Prioritize the right metric</h3><p>Use conversion rate for efficiency and subscription count for scale; use both before reallocating campaign effort.</p></article>
          <article><span>02</span><h3>Test contact fatigue</h3><p>Investigate whether repeated calls are reaching harder-to-convert customers or causing diminishing returns.</p></article>
          <article><span>03</span><h3>Add campaign economics</h3><p>Bring in call cost, deposit value, and retention outcomes before turning this into an ROI recommendation.</p></article>
        </div>
      </section>

      <footer className="project-footer"><a href="/">← Back to Kartik’s portfolio</a><span>Built with Python · SQL · BI thinking</span></footer>
    </main>
  );
}
