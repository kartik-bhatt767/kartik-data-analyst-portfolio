import InteractiveDashboard from './interactive-dashboard';
import ModelEvidence from './model-evidence';

export default function CustomerChurnAnalysisPage() {
  return (
    <main className="project-page">
      <header className="project-header">
        <a className="brand" href="/">KARTIK<span>/</span>BHATT</a>
        <a className="project-back" href="/">Back to portfolio <span aria-hidden="true">↗</span></a>
      </header>

      <section className="project-hero">
        <div className="project-kicker">Case study · 02 / Customer analytics</div>
        <h1>Churn, before <em>cancellation.</em></h1>
        <p className="project-lede">An intermediate retention analysis across 7,043 telecom customers. It combines cohort segmentation, recurring-charge exposure, and a held-out churn-risk model to answer which customers need attention first.</p>
        <div className="project-meta-grid">
          <div><span>Role</span><strong>Data analyst</strong></div>
          <div><span>Tools</span><strong>Python · SQL · BI</strong></div>
          <div><span>Dataset</span><strong>IBM Telco Churn</strong></div>
          <div><span>Focus</span><strong>Retention prioritization</strong></div>
        </div>
      </section>

      <p className="project-source-note">Public source: <a href="https://github.com/IBM/telco-customer-churn-on-icp4d/blob/master/data/Telco-Customer-Churn.csv" target="_blank" rel="noreferrer">IBM Telco Customer Churn ↗</a> · fictional sample · 7,043 customers · location and true usage volume are not included in the source.</p>

      <section className="project-kpis" aria-label="Customer churn KPIs">
        <div><span>Customers reviewed</span><strong>7,043</strong></div>
        <div><span>Churned customers</span><strong>1,869</strong></div>
        <div><span>Overall churn rate</span><strong>26.5%</strong></div>
        <div><span>Churned monthly charges</span><strong>$139k</strong></div>
      </section>

      <InteractiveDashboard />

      <ModelEvidence />

      <section className="project-method" aria-labelledby="churn-method-title">
        <div>
          <div className="project-section-label">Method</div>
          <h2 id="churn-method-title">Make retention work explainable.</h2>
        </div>
        <div className="method-grid">
          <article><span>01 · Build cohorts</span><h3>Compare like with like.</h3><p>Tenure, contract, internet service, payment method, price band, and service depth create practical cohorts instead of one blended churn rate.</p></article>
          <article><span>02 · Quantify exposure</span><h3>Rate is not the whole story.</h3><p>Each cohort shows customers, churned customers, churn rate, and monthly charges attached to churn so prioritization includes business scale.</p></article>
          <article><span>03 · Keep gaps visible</span><h3>Do not invent location or usage.</h3><p>The source has no region or true usage-volume fields. Service depth is labeled as a proxy, and the next production step is to add those fields.</p></article>
        </div>
      </section>

      <section className="project-content-grid">
        <div>
          <div className="project-section-label">The question</div>
          <h2>Which customers deserve a retention test first?</h2>
        </div>
        <div className="project-copy">
          <p>A retention team needs more than a list of customers who already left. It needs a repeatable way to find pressure points, estimate recurring-charge exposure, and decide how much outreach a threshold will create.</p>
          <p>This project answers the descriptive question with cohort analysis, then adds a transparent baseline model for ranking follow-up. The model is evaluated on held-out records and reported with lift, precision, recall, and a confusion matrix.</p>
        </div>
      </section>

      <section className="project-recommendation">
        <div className="project-section-label">What I would do next</div>
        <div className="recommendation-grid">
          <article><span>01</span><h3>Start with early tenure</h3><p>Design an onboarding intervention for month-to-month customers in their first six months, then measure incremental retention.</p></article>
          <article><span>02</span><h3>Test billing friction</h3><p>Investigate electronic-check customers with a billing education or autopay test rather than treating payment method as a cause.</p></article>
          <article><span>03</span><h3>Add production evidence</h3><p>Join location, actual usage, intervention history, and customer value so the next model can use time-based validation and cost-sensitive thresholds.</p></article>
        </div>
      </section>

      <footer className="project-footer"><a href="/">← Back to Kartik’s portfolio</a><span>Built with Python · SQL · BI thinking</span></footer>
    </main>
  );
}
