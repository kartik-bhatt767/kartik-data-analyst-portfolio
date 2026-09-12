import { churnFeatureWeights, churnLiftByDecile, churnModelMetrics } from './churn-data';

const percent = (value: number) => `${(value * 100).toFixed(1)}%`;
const number = (value: number) => value.toLocaleString('en-US');
const featureLabel = (value: string) => value.replace('=', ' = ').replace('.', '');

export default function ModelEvidence() {
  const topDecile = churnLiftByDecile[0];
  const maxLift = Math.max(...churnLiftByDecile.map((row) => row.lift), 1);

  return (
    <section className="model-evidence" aria-labelledby="churn-model-title">
      <div className="model-evidence-heading">
        <div>
          <div className="project-section-label">Predictive layer</div>
          <h2 id="churn-model-title">Turn segments into a retention queue.</h2>
          <p>I trained a regularized logistic-regression baseline to rank customers by cancellation risk. The model is a prioritization tool for follow-up, not proof that any single feature causes churn.</p>
        </div>
        <div className="model-badge"><strong>ROC-AUC {churnModelMetrics.rocAuc.toFixed(2)}</strong><span>held-out test set</span></div>
      </div>

      <div className="model-score-grid" aria-label="Churn model evaluation metrics">
        <div><span>Top-decile lift</span><strong>{topDecile.lift.toFixed(1)}×</strong><small>{percent(topDecile.churnRate)} churn rate</small></div>
        <div><span>Precision</span><strong>{percent(churnModelMetrics.precision)}</strong><small>at threshold {churnModelMetrics.threshold.toFixed(2)}</small></div>
        <div><span>Recall</span><strong>{percent(churnModelMetrics.recall)}</strong><small>{number(churnModelMetrics.truePositive)} churners found</small></div>
        <div><span>Features</span><strong>{churnModelMetrics.featureCount}</strong><small>{number(churnModelMetrics.testRecords)} test records</small></div>
      </div>

      <div className="model-evidence-grid">
        <div className="model-panel">
          <div className="model-panel-heading"><div><span>Prioritization evidence</span><h3>Lift by risk decile</h3></div><strong>Highest risk first</strong></div>
          <div className="lift-chart">{churnLiftByDecile.map((row) => <div className="lift-row" key={row.decile}><span>D{row.decile}</span><div className="lift-track"><div className="lift-fill" style={{ width: `${(row.lift / maxLift) * 100}%` }} /></div><strong>{row.lift.toFixed(1)}×</strong><small>{percent(row.churnRate)}</small></div>)}</div>
          <p className="model-note">The top 10% of scored customers churned at {percent(topDecile.churnRate)}, compared with a {percent(churnModelMetrics.baselineRate)} test-set baseline.</p>
        </div>

        <div className="model-panel">
          <div className="model-panel-heading"><div><span>Decision threshold</span><h3>Confusion matrix</h3></div><strong>{churnModelMetrics.threshold.toFixed(2)} cutoff</strong></div>
          <div className="confusion-matrix" role="table" aria-label="Churn confusion matrix"><div></div><span>Predicted churn</span><span>Predicted stay</span><strong>Actual churn</strong><b>{number(churnModelMetrics.truePositive)}</b><b>{number(churnModelMetrics.falseNegative)}</b><strong>Actual stay</strong><b>{number(churnModelMetrics.falsePositive)}</b><b>{number(churnModelMetrics.trueNegative)}</b></div>
          <p className="model-note">The cutoff trades outreach volume against missed churners. A production workflow should tune it with intervention cost, retention value, and calibration.</p>
        </div>
      </div>

      <div className="model-signals">
        <div><span>Model signals</span><h3>What the baseline learned</h3><p>These weights identify patterns worth investigating. They are not causal effects, and they should not be used to make unsupported claims about individual customers.</p></div>
        <div className="signal-list">{churnFeatureWeights.slice(0, 6).map((row) => <div key={row.feature}><span>{featureLabel(row.feature)}</span><i className={row.direction === 'positive' ? 'signal-positive' : 'signal-negative'}>{row.weight > 0 ? '+' : ''}{row.weight.toFixed(2)}</i></div>)}</div>
      </div>
    </section>
  );
}
