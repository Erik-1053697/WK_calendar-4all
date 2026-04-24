import { formatAmsterdamDate, formatAmsterdamTime, matchKickoff, roundLabel } from '../../lib/domain';
import StatusBadge from '../ui/StatusBadge';
import TeamMatchup from './TeamMatchup';

export default function MatchRow({ match, onSelect }) {
  return (
    <button className="match-row" onClick={() => onSelect?.(match)} type="button">
      <div className="match-row__time">
        <strong>{formatAmsterdamDate(matchKickoff(match))}</strong>
        <span>{formatAmsterdamTime(matchKickoff(match))} Amsterdam</span>
      </div>
      <TeamMatchup match={match} compact />
      <div className="match-row__meta">
        <strong>{roundLabel(match.group_name || match.stage)}</strong>
        <span>{match.round_label ? roundLabel(match.round_label) : `Wedstrijd ${match.fifa_match_number}`}</span>
      </div>
      <div className="match-row__venue">
        <strong>{match.venue?.host_market || 'Nog niet bekend'}</strong>
        <span>{match.venue?.stadium_name || 'Stadion nog niet bekend'}</span>
      </div>
      <StatusBadge status={match.status} />
    </button>
  );
}
