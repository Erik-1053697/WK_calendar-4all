import clsx from 'clsx';
import { formatMatchTime, formatStatusLabel } from '../../utils/formatters';

export default function MatchCard({ match, onSelect }) {
  return (
    <button
      className={clsx('match-card', `is-${match.prediction_status}`)}
      onClick={() => onSelect(match)}
      type="button"
    >
      <div className="match-card__meta">
        <span>Match {match.fifa_match_number}</span>
        <span>{formatMatchTime(match.kickoff_at_local, match.timezone_name)}</span>
      </div>

      <div className="match-card__teams">
        <div className="match-card__team">
          <span className="slot-badge">{match.home_team_slot}</span>
          <strong>{match.home_team_name}</strong>
        </div>
        <div className="match-card__versus">vs</div>
        <div className="match-card__team">
          <span className="slot-badge">{match.away_team_slot}</span>
          <strong>{match.away_team_name}</strong>
        </div>
      </div>

      <div className="match-card__stage">{match.group_name || match.stage}</div>

      <div className="match-card__footer">
        <span>
          {match.venue?.stadium_name}
        </span>
        <span className={clsx('status-pill', `status-${match.prediction_status}`)}>
          {formatStatusLabel(match.prediction_status)}
        </span>
      </div>
    </button>
  );
}
