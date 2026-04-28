export default function PredictionLeaderboard({
  entries = [],
  compact = false,
  eyebrow = 'Voorspellersranglijst',
  title = 'Algemene ranglijst',
  emptyMessage = 'Er staan nog geen spelers in de ranglijst.',
}) {
  return (
    <article className={`leaderboard-panel${compact ? ' leaderboard-panel--compact' : ''}`}>
      <header>
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h3>{title}</h3>
        </div>
      </header>

      <div className="prediction-leaderboard">
        {entries.length ? entries.map((entry) => (
          <div className="prediction-leaderboard__row" key={entry.user_id}>
            <span className="leader-rank">{entry.rank}</span>
            <div>
              <strong>{entry.name}</strong>
              <small>{entry.predictions_count} voorspellingen · {entry.exact_scores} exact</small>
            </div>
            <strong>{entry.total_points}</strong>
          </div>
        )) : <p className="muted">{emptyMessage}</p>}
      </div>
    </article>
  );
}
