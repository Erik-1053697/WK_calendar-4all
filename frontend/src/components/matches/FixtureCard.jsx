import { formatAmsterdamDate, formatAmsterdamTime, matchKickoff } from '../../lib/domain';
import StatusBadge from '../ui/StatusBadge';
import TeamMatchup from './TeamMatchup';

export default function FixtureCard({ match, onSelect }) {
  return (
    <button className="fixture-card" onClick={() => onSelect?.(match)} type="button">
      <div className="fixture-card__top">
        <span>Wedstrijd {match.fifa_match_number}</span>
        <StatusBadge status={match.status} />
      </div>
      <TeamMatchup match={match} />
      <div className="fixture-card__bottom">
        <span>{formatAmsterdamDate(matchKickoff(match))}</span>
        <strong>{formatAmsterdamTime(matchKickoff(match))}</strong>
        <span>{match.venue?.host_market || 'Nog niet bekend'}</span>
      </div>
    </button>
  );
}
