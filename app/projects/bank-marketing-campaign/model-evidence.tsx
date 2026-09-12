import { liftByDecile, modelMetrics, topFeatureWeights } from './model-data';

const percent = (value: number) => `${(value * 100).toFixed(1)}%`;
const number = (value: number) => value.toLocaleString('en-US');
const featureLabel = (value: string) => value.replace('=', ' = ').replace('.', '');

export default function ModelEvidence() {
  const topDecile = liftByDecile[0];
  const maxLift = Math.max(...liftByDecile.map((row) => row.lift), 1);

  return (
    <section className="model-evidence" aria-labelledby="model-evidence-title">
      <div className="model-evidence-heading">
        <div>
          <div className="project-section-label">Predictive layer</div>
          <h2 id="model-evidence-title">From dashboard insight to scored audience.</h2>
          <p>I trained a regularized logistic-regression baseline to rank likely subscribers before the next contact. The evaluation keeps post-call duration out of the feature set to prevent leakage.</p>
        </div>
        <div className="model-badge"><strong>ROC-AUC {modelMetrics.rocAuc.toFixed(2)}</strong><span>holdout benchmark</span></div>
      </div>

      <div className="model-score-grid" aria-label="Model evaluation metrics">
        <div><span>Top-decile lift</span><strong>{topDecile.lift.toFixed(1)}×</strong><small>{percent(topDecile.conversionRate)} conversion</small></div>
        <div><span>Precision</span><strong>{percent(modelMetrics.precision)}</strong><small>at threshold {modelMetrics.threshold.toFixed(2)}</small></div>
        <div><span>Recall</span><strong>{percent(modelMetrics.recall)}</strong><small>{number(modelMetrics.truePositive)} true positives</small></div>
        <div><span>Features</span><strong>{modelMetrics.featureCount}</strong><small>{number(modelMetrics.testRecords)} test records</small></div>
      </div>

      <div className="model-evidence-grid">
        <div className="model-panel">
          <div className="model-panel-heading"><div><span>Targeting evidence</span><h3>Lift by score decile</h3></div><strong>Best scored records first</strong></div>
          <div className="lift-chart">{liftByDecile.map((row) => <div className="lift-row" key={row.decile}><span>D{row.decile}</span><div className="lift-track"><div className="lift-fill" style={{ width: `${(row.lift / maxLift) * 100}%` }} /></div><strong>{row.lift.toFixed(1)}×</strong><small>{percent(row.conversionRate)}</small></div>)}</div>
          <p className="model-note">The top 10% of scored test records converted at {percent(topDecile.conversionRate)}, compared with a {percent(modelMetrics.baselineRate)} test-set baseline.</p>
        </div>

        <div className="model-panel">
          <div className="model-panel-heading"><div><span>Decision threshold</span><h3>Confusion matrix</h3></div><strong>{modelMetrics.threshold.toFixed(2)} cutoff</strong></div>
          <div className="confusion-matrix" role="table" aria-label="Confusion matrix"><div></div><span>Predicted yes</span><span>Predicted no</span><strong>Actual yes</strong><b>{number(modelMetrics.truePositive)}</b><b>{number(modelMetrics.falseNegative)}</b><strong>Actual no</strong><b>{number(modelMetrics.falsePositive)}</b><b>{number(modelMetrics.trueNegative)}</b></div>
          <p className="model-note">A threshold is a business choice: a lower cutoff reaches more potential subscribers, while a higher cutoff reduces outreach volume and increases precision.</p>
        </div>
      </div>

      <div className="model-signals">
        <div><span>Model signals</span><h3>What the baseline learned</h3><p>These are model weights, not causal effects. They are useful for investigation and feature review—not for making unsupported claims about customers.</p></div>
        <div className="signal-list">{topFeatureWeights.slice(0, 6).map((row) => <div key={row.feature}><span>{featureLabel(row.feature)}</span><i className={row.direction === 'positive' ? 'signal-positive' : 'signal-negative'}>{row.weight > 0 ? '+' : ''}{row.weight.toFixed(2)}</i></div>)}</div>
      </div>
    </section>
  );
}
