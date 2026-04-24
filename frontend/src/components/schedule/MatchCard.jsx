import clsx from 'clsx';
import { displayTeamName } from '../../lib/domain';
import {
  compactTeamLabel,
  formatAmsterdamMatchTime,
  formatStageRibbonLabel,
} from '../../utils/formatters';

export default function MatchCard({ match, onSelect }) {
  const kickoffReference = match.kickoff_at_utc || match.kickoff_at_local;
  const homeSlot = match.home_team_slot || compactTeamLabel(match.home_team_name);
  const awaySlot = match.away_team_slot || compactTeamLabel(match.away_team_name);

  const tileTitle = [
    `${displayTeamName(match.home_team_name)} vs ${displayTeamName(match.away_team_name)}`,
    `${formatAmsterdamMatchTime(kickoffReference)} Amsterdamse tijd`,
    `${match.venue?.stadium_name}`,
    `${match.venue?.host_market}`,
    `${match.group_name?.replace(/^Group /i, 'Groep ') || formatStageRibbonLabel(match.stage)}`,
  ]
    .filter(Boolean)
    .join(' | ');

  return (
    <button
      className={clsx('match-card', `is-${match.prediction_status}`)}
      onClick={() => onSelect(match)}
      title={tileTitle}
      type="button"
    >
      <div className="match-card__slots">
        <strong>{homeSlot}</strong>
        <span>/</span>
        <strong>{awaySlot}</strong>
      </div>

      <div className="match-card__meta">
        <span>{formatAmsterdamMatchTime(kickoffReference)}</span>
      </div>
    </button>
  );
}
