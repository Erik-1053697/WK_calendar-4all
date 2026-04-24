import { useEffect, useMemo, useState } from 'react';
import { displayTeamName, roundLabel } from '../../lib/domain';
import { api } from '../../services/api';
import { formatMatchDateTime, formatStatusLabel } from '../../utils/formatters';

function deriveScoreState(match) {
  return {
    predicted_home_score: match?.my_prediction?.predicted_home_score ?? 0,
    predicted_away_score: match?.my_prediction?.predicted_away_score ?? 0,
  };
}

export default function PredictionModal({
  match,
  isAuthenticated,
  onClose,
  onPredictionSaved,
}) {
  const [prediction, setPrediction] = useState(match?.my_prediction ?? null);
  const [form, setForm] = useState(deriveScoreState(match));
  const [stats, setStats] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setPrediction(match?.my_prediction ?? null);
    setForm(deriveScoreState(match));
    setMessage('');
    setError('');
    setStats(null);

    async function loadStats() {
      try {
        const response = await api.get(`/matches/${match.id}/predictions`);
        setStats(response.data.data);
      } catch (statsError) {
        console.error(statsError);
      }
    }

    if (match) {
      loadStats();
    }
  }, [match]);

  const readOnly = useMemo(
    () => match?.is_closed || prediction?.is_locked,
    [match, prediction],
  );

  if (!match) {
    return null;
  }

  async function savePrediction() {
    setBusy(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        predicted_home_score: Number(form.predicted_home_score),
        predicted_away_score: Number(form.predicted_away_score),
      };

      const endpoint = `/matches/${match.id}/prediction`;
      const response = prediction
        ? await api.put(endpoint, payload)
        : await api.post(endpoint, payload);

      setPrediction(response.data.data);
      setMessage('Voorspelling opgeslagen. Zet hem vast wanneer je zeker bent.');
      await onPredictionSaved(match.id);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          Object.values(requestError.response?.data?.errors || {}).flat().join(' ') ||
          'Voorspelling opslaan is niet gelukt.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function lockPrediction() {
    setBusy(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post(`/matches/${match.id}/prediction/lock`);
      setPrediction(response.data.data);
      setMessage('Voorspelling is vastgezet.');
      await onPredictionSaved(match.id);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          Object.values(requestError.response?.data?.errors || {}).flat().join(' ') ||
          'Voorspelling vastzetten is niet gelukt.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <aside
        className="prediction-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Voorspellingspaneel"
      >
        <button className="modal-close" onClick={onClose} type="button">
          Sluiten
        </button>

        <p className="eyebrow">{roundLabel(match.group_name || match.stage)}</p>
        <h3>Wedstrijd {match.fifa_match_number}</h3>
        <p className="modal-meta">
          {formatMatchDateTime(match.kickoff_at_local, match.timezone_name)} · {match.venue?.host_market}
        </p>
        <div className="modal-matchup panel">
          <div>
            <span className="slot-badge">{match.home_team_slot}</span>
            <strong>{displayTeamName(match.home_team_name)}</strong>
          </div>
          <div className="modal-matchup__divider">vs</div>
          <div>
            <span className="slot-badge">{match.away_team_slot}</span>
            <strong>{displayTeamName(match.away_team_name)}</strong>
          </div>
        </div>
        <p className="muted">
          {match.venue?.stadium_name} · {match.venue?.city}, {match.venue?.country}
        </p>

        {!isAuthenticated ? (
          <div className="empty-state">
            <h4>Log in om je voorspelling te maken</h4>
            <p>Je kunt het hele toernooi bekijken, maar alleen ingelogde gebruikers kunnen voorspellingen opslaan.</p>
          </div>
        ) : (
          <>
            <div className="score-grid">
              <label>
                <span>{match.home_team_name}</span>
                <input
                  min="0"
                  type="number"
                  value={form.predicted_home_score}
                  disabled={readOnly || busy}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      predicted_home_score: event.target.value,
                    }))
                  }
                />
              </label>

              <label>
                <span>{match.away_team_name}</span>
                <input
                  min="0"
                  type="number"
                  value={form.predicted_away_score}
                  disabled={readOnly || busy}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      predicted_away_score: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <div className="modal-actions">
              <button
                className="button button-ghost"
                disabled={readOnly || busy}
                onClick={savePrediction}
                type="button"
              >
                {prediction ? 'Voorspelling bijwerken' : 'Voorspelling opslaan'}
              </button>
              <button
                className="button"
                disabled={
                  busy ||
                  readOnly ||
                  !prediction ||
                  prediction.is_locked
                }
                onClick={lockPrediction}
                type="button"
              >
                Voorspelling vastzetten
              </button>
            </div>
          </>
        )}

        {message ? <p className="form-message success">{message}</p> : null}
        {error ? <p className="form-message error">{error}</p> : null}
        {readOnly ? (
          <p className="form-message info">
            Deze wedstrijd is gesloten. Vastgezette voorspellingen zijn alleen-lezen.
          </p>
        ) : null}
        <p className="modal-status">
          Status: <span className={`status-pill status-${match.prediction_status}`}>{formatStatusLabel(match.prediction_status)}</span>
        </p>

        <section className="prediction-stats">
          <div className="prediction-stats__header">
            <h4>Populaire voorspellingen</h4>
            <span>{stats?.total_predictions ?? 0} voorspellingen totaal</span>
          </div>

          {stats?.score_breakdown?.length ? (
            <ul className="stats-list">
              {stats.score_breakdown.slice(0, 5).map((item) => (
                <li key={`${item.home_score}-${item.away_score}`}>
                  <span>
                    {item.home_score} - {item.away_score}
                  </span>
                  <strong>{item.total}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Er zijn nog geen openbare voorspellingen voor deze wedstrijd.</p>
          )}
        </section>
      </aside>
    </div>
  );
}
