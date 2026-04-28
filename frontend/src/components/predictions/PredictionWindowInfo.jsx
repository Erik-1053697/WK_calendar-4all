import { getPredictionWindowState } from '../../lib/domain';

export default function PredictionWindowInfo({ predictionWindow, now }) {
  const state = getPredictionWindowState(predictionWindow, now);

  return (
    <div className={`prediction-window-info${state.isLocked ? ' is-locked' : ''}`}>
      <div>
        <span>{state.daysLabel}</span>
        {state.countdownLabel ? <strong>{state.countdownLabel}</strong> : null}
      </div>
      <small>Sluit op {state.lockAtLabel}</small>
    </div>
  );
}
