import { useEffect, useState } from 'react';
import { displayTeamName, formatAmsterdamDate, formatAmsterdamTime, matchKickoff } from '../../lib/domain';
import { isPredictable } from '../../lib/domain';
import { lockPrediction, savePrediction } from '../../services/tournamentApi';
import PredictionWindowInfo from './PredictionWindowInfo';
import StatusBadge from '../ui/StatusBadge';

function resolveErrorMessage(error, fallback) {
  return error?.response?.data?.message
    || Object.values(error?.response?.data?.errors || {}).flat()?.[0]
    || fallback;
}

function MatchTeam({ code, flagUrl, name, slot }) {
  return (
    <div className="match-team">
      <div className="match-team__flag">
        {flagUrl ? <img alt="" src={flagUrl} /> : <span>{(code || slot || '?').slice(0, 2)}</span>}
      </div>
      <div className="match-team__copy">
        <strong>{displayTeamName(name)}</strong>
        <small>{slot || code || 'Nog niet bekend'}</small>
      </div>
    </div>
  );
}

export default function MatchPredictionCard({ match, now, onSaved }) {
  const existing = match.my_prediction;
  const hasPrediction = Boolean(existing);
  const [form, setForm] = useState({
    predicted_home_score: existing?.predicted_home_score ?? 0,
    predicted_away_score: existing?.predicted_away_score ?? 0,
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setForm({
      predicted_home_score: existing?.predicted_home_score ?? 0,
      predicted_away_score: existing?.predicted_away_score ?? 0,
    });
  }, [existing?.predicted_away_score, existing?.predicted_home_score]);

  const locked = existing?.is_locked || match.prediction_window?.is_locked || !isPredictable(match);

  async function handleSave() {
    setBusy(true);
    setMessage('');
    setError('');

    try {
      await savePrediction(match.id, {
        predicted_home_score: Number(form.predicted_home_score),
        predicted_away_score: Number(form.predicted_away_score),
      }, Boolean(existing));
      setMessage('Voorspelling opgeslagen');
      await onSaved();
    } catch (requestError) {
      setError(resolveErrorMessage(requestError, 'We konden deze wedstrijdvoorspelling niet opslaan.'));
    } finally {
      setBusy(false);
    }
  }

  async function handleLock() {
    setBusy(true);
    setMessage('');
    setError('');

    try {
      await lockPrediction(match.id);
      setMessage('Voorspelling vastgezet');
      await onSaved();
    } catch (requestError) {
      setError(resolveErrorMessage(requestError, 'We konden deze wedstrijdvoorspelling niet vastzetten.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className={`match-prediction-card${hasPrediction ? ' is-predicted' : ''}${locked ? ' is-locked' : ''}`}>
      <div className="match-prediction-card__top">
        <div>
          <span className="eyebrow">Wedstrijd {match.fifa_match_number}</span>
          <strong>{formatAmsterdamDate(matchKickoff(match))} · {formatAmsterdamTime(matchKickoff(match))} · {match.venue?.host_market}</strong>
        </div>
        <StatusBadge status={match.prediction_status} />
      </div>

      <PredictionWindowInfo now={now} predictionWindow={match.prediction_window} />

      <div className="match-prediction-card__teams">
        <MatchTeam code={match.home_team_code} flagUrl={match.home_team_flag_url} name={match.home_team_name} slot={match.home_team_slot} />
        <span className="match-prediction-card__versus">vs</span>
        <MatchTeam code={match.away_team_code} flagUrl={match.away_team_flag_url} name={match.away_team_name} slot={match.away_team_slot} />
      </div>

      <div className="prediction-score-form prediction-score-form--modern">
        <label>
          <span>{match.home_team_slot || 'Thuis'}</span>
          <input
            disabled={locked || busy}
            min="0"
            onChange={(event) => setForm((current) => ({ ...current, predicted_home_score: event.target.value }))}
            type="number"
            value={form.predicted_home_score}
          />
        </label>
        <strong>-</strong>
        <label>
          <span>{match.away_team_slot || 'Uit'}</span>
          <input
            disabled={locked || busy}
            min="0"
            onChange={(event) => setForm((current) => ({ ...current, predicted_away_score: event.target.value }))}
            type="number"
            value={form.predicted_away_score}
          />
        </label>
      </div>

      <div className="prediction-inline-actions">
        <button disabled={locked || busy} onClick={handleSave} type="button">
          Opslaan
        </button>
        <button disabled={locked || busy || !existing} onClick={handleLock} type="button">
          Vastzetten
        </button>
        {message ? <span className="prediction-inline-actions__message is-success">{message}</span> : null}
        {error ? <span className="prediction-inline-actions__message is-error">{error}</span> : null}
      </div>
    </article>
  );
}
