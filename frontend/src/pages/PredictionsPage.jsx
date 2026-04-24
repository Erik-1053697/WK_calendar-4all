import { useEffect, useMemo, useState } from 'react';
import PredictionLeaderboard from '../components/leaderboard/PredictionLeaderboard';
import TeamMatchup from '../components/matches/TeamMatchup';
import MetricCard from '../components/ui/MetricCard';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import { displayTeamName, formatAmsterdamDate, formatAmsterdamTime, isPredictable, matchKickoff } from '../lib/domain';
import { getPredictionDashboard, lockPrediction, savePrediction } from '../services/tournamentApi';

function PredictionCard({ match, onSaved }) {
  const existing = match.my_prediction;
  const [form, setForm] = useState({
    predicted_home_score: existing?.predicted_home_score ?? 0,
    predicted_away_score: existing?.predicted_away_score ?? 0,
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const locked = existing?.is_locked || !isPredictable(match);

  async function handleSave() {
    setBusy(true);
    setMessage('');

    try {
      await savePrediction(match.id, {
        predicted_home_score: Number(form.predicted_home_score),
        predicted_away_score: Number(form.predicted_away_score),
      }, Boolean(existing));
      setMessage('Opgeslagen');
      await onSaved();
    } finally {
      setBusy(false);
    }
  }

  async function handleLock() {
    setBusy(true);
    setMessage('');

    try {
      await lockPrediction(match.id);
      setMessage('Vastgezet');
      await onSaved();
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="prediction-card">
      <div className="prediction-card__meta">
        <span>Wedstrijd {match.fifa_match_number}</span>
        <StatusBadge status={match.prediction_status} />
      </div>
      <TeamMatchup match={match} />
      <p>{formatAmsterdamDate(matchKickoff(match))} · {formatAmsterdamTime(matchKickoff(match))} Amsterdam · {match.venue?.host_market}</p>

      <div className="prediction-score-form">
        <label>
          <span>{match.home_team_slot || 'Thuis'}</span>
          <input disabled={locked || busy} min="0" type="number" value={form.predicted_home_score} onChange={(event) => setForm((current) => ({ ...current, predicted_home_score: event.target.value }))} />
        </label>
        <strong>-</strong>
        <label>
          <span>{match.away_team_slot || 'Uit'}</span>
          <input disabled={locked || busy} min="0" type="number" value={form.predicted_away_score} onChange={(event) => setForm((current) => ({ ...current, predicted_away_score: event.target.value }))} />
        </label>
      </div>

      <div className="prediction-actions">
        <button disabled={locked || busy} onClick={handleSave} type="button">Opslaan</button>
        <button disabled={locked || busy || !existing} onClick={handleLock} type="button">Vastzetten</button>
        {message ? <span>{message}</span> : null}
      </div>
    </article>
  );
}

export default function PredictionsPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboard() {
    setLoading(true);
    setError('');

    try {
      setDashboard(await getPredictionDashboard());
    } catch (requestError) {
      setError('We konden je voorspellingen niet laden.');
      console.error(requestError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = dashboard?.stats;
  const upcomingMatches = useMemo(() => dashboard?.upcoming_matches || [], [dashboard]);

  return (
    <section className="screen-stack">
      <PageHeader
        eyebrow="Voorspellingen"
        title="Voorspellingsarena"
        subtitle="Vul scores in voor de aftrap, zet voorspellingen vast en volg je prestaties in de ranglijst."
      />

      {loading ? <div className="loading-shell">Voorspellingen laden...</div> : null}
      {error ? <div className="empty-card">{error}</div> : null}

      {!loading && !error && dashboard ? (
        <>
          <section className="metric-grid">
            <MetricCard label="Punten" value={stats.total_points} detail={`Positie #${stats.rank}`} tone="gold" />
            <MetricCard label="Nauwkeurigheid" value={`${stats.accuracy}%`} detail="Juiste uitkomsten" tone="blue" />
            <MetricCard label="Exacte scores" value={stats.exact_scores} detail="Perfect voorspeld" />
            <MetricCard label="Vastgezet" value={stats.locked_predictions} detail={`${stats.predictions_count} voorspellingen totaal`} />
          </section>

          <section className="predictions-layout">
            <div className="panel-shell">
              <header className="section-title">
                <div>
                  <span className="eyebrow">Komende wedstrijden</span>
                  <h2>Maak je voorspellingen</h2>
                </div>
                <small>{upcomingMatches.length} open wedstrijden</small>
              </header>
              <div className="prediction-grid">
                {upcomingMatches.map((match) => (
                  <PredictionCard key={match.id} match={match} onSaved={loadDashboard} />
                ))}
              </div>
            </div>

            <aside className="prediction-side">
              <PredictionLeaderboard entries={dashboard.community_leaderboard} compact />
              <article className="panel-shell history-panel">
                <header className="section-title">
                  <h3>Recente voorspellingen</h3>
                </header>
                {dashboard.recent_predictions.length ? dashboard.recent_predictions.map((match) => (
                  <div className="history-row" key={match.id}>
                    <span>Wedstrijd {match.fifa_match_number}</span>
                    <strong>{match.my_prediction?.predicted_home_score} - {match.my_prediction?.predicted_away_score}</strong>
                    <small>{displayTeamName(match.home_team_name)} vs {displayTeamName(match.away_team_name)}</small>
                  </div>
                )) : <p className="muted">Je hebt nog geen voorspellingen opgeslagen.</p>}
              </article>
            </aside>
          </section>
        </>
      ) : null}
    </section>
  );
}
