import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { formatMatchDateTime, formatStatusLabel } from '../utils/formatters';

export default function PredictionsPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPredictions();
  }, []);

  async function loadPredictions() {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/matches');
      setMatches(response.data.data.filter((match) => match.my_prediction));
    } catch (requestError) {
      setError('Unable to load your predictions right now.');
      console.error(requestError);
    } finally {
      setLoading(false);
    }
  }

  const totals = useMemo(
    () => ({
      total: matches.length,
      locked: matches.filter((match) => match.my_prediction?.is_locked).length,
    }),
    [matches],
  );

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Profile</p>
          <h1>My predictions</h1>
          <p className="lead">Track every saved pick and see which ones are already locked.</p>
        </div>
        <div className="hero-summary panel compact">
          <div>
            <span>Total picks</span>
            <strong>{totals.total}</strong>
          </div>
          <div>
            <span>Locked</span>
            <strong>{totals.locked}</strong>
          </div>
        </div>
      </div>

      {loading ? <div className="panel loading-panel">Loading your picks...</div> : null}
      {error ? <div className="panel form-message error">{error}</div> : null}

      {!loading && !error && matches.length === 0 ? (
        <div className="panel empty-state">
          <h3>No predictions yet</h3>
          <p>
            Visit the <Link to="/">schedule board</Link> and click a match tile to make your first pick.
          </p>
        </div>
      ) : null}

      {!loading && !error && matches.length > 0 ? (
        <div className="prediction-list">
          {matches.map((match) => (
            <article className="prediction-list__item panel" key={match.id}>
              <div>
                <p className="eyebrow">{match.group_name || match.stage}</p>
                <h3>Match {match.fifa_match_number}</h3>
                <p className="muted">
                  {match.home_team_slot} {match.home_team_name} vs {match.away_team_slot} {match.away_team_name}
                </p>
                <p className="muted">
                  {formatMatchDateTime(match.kickoff_at_local, match.timezone_name)} · {match.venue?.host_market}
                </p>
              </div>

              <div className="prediction-score">
                <span>{match.my_prediction.predicted_home_score}</span>
                <strong>-</strong>
                <span>{match.my_prediction.predicted_away_score}</span>
              </div>

              <span className={`status-pill status-${match.prediction_status}`}>
                {formatStatusLabel(match.prediction_status)}
              </span>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
