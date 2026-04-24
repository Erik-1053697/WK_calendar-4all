import { displayTeamName } from '../../lib/domain';

export default function GroupStandingsBoard({ groups }) {
  if (!groups.length) {
    return null;
  }

  function rankClass(position, enabled = true) {
    if (!enabled) {
      return '';
    }

    return {
      1: 'is-gold',
      2: 'is-silver',
      3: 'is-bronze',
    }[position] ?? '';
  }

  function placeLabel(group, team) {
    return group.is_ranked_by_points ? team.position : 1;
  }

  function pointsClass(points) {
    return points > 0 ? 'is-active' : '';
  }

  function teamMeta(team) {
    return [team.group_slot, team.fifa_code].filter(Boolean).join(' / ');
  }

  function goalDifferenceLabel(goalDifference) {
    return goalDifference > 0 ? `+${goalDifference}` : goalDifference;
  }

  return (
    <section className="group-standings">
      <div className="group-standings__header">
        <div>
          <p className="eyebrow">Groepstabellen</p>
          <h2>Actuele groepsstanden</h2>
        </div>
        <p className="muted">Zonder uitslagen deelt elk team de eerste plek. Daarna sorteren we op punten en delen teams met gelijke punten dezelfde positie.</p>
      </div>

      <div className="group-standings__grid">
        {groups.map((group) => (
          <article className="group-card panel" key={group.id}>
            <div className="group-card__topbar">
              <span className="group-card__label">Groep {group.code}</span>
              <span className={`group-card__state ${group.is_ranked_by_points ? 'is-live' : ''}`}>
                {group.is_ranked_by_points ? 'Live' : 'Begin'}
              </span>
            </div>
            <p className="group-card__note">
              {group.is_ranked_by_points ? 'Rangschikking op punten. Teams met hetzelfde puntenaantal delen dezelfde plek.' : 'Nog geen uitslagen. Elk team deelt nu de eerste plek.'}
            </p>

            <div className="group-table">
              {group.standings.map((team) => (
                <article className={`group-item ${rankClass(placeLabel(group, team), group.is_ranked_by_points)}`} key={team.team_id}>
                  <div className="group-item__top">
                    <span className={`group-item__rank ${rankClass(placeLabel(group, team), group.is_ranked_by_points)}`}>
                      {placeLabel(group, team)}
                    </span>

                    <div className="group-item__identity">
                      <span className="group-item__flag">
                        {team.image_url ? (
                          <img src={team.image_url} alt={`Vlag van ${team.team_name}`} loading="lazy" />
                        ) : (
                          <span className="group-item__flag-fallback">{(team.fifa_code || '?').slice(0, 2)}</span>
                        )}
                      </span>

                      <div className="group-item__copy">
                        <strong>{displayTeamName(team.team_name)}</strong>
                        <span>{teamMeta(team) || 'NNB'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="group-item__bottom">
                    <span className="group-item__chip group-item__chip--slot">
                      {team.group_slot || team.fifa_code || 'NNB'}
                    </span>

                    <span className="group-item__chip">
                      <small>P</small>
                      <strong>{team.played}</strong>
                    </span>

                    <span className="group-item__chip">
                      <small>DG</small>
                      <strong>{goalDifferenceLabel(team.goal_difference)}</strong>
                    </span>

                    <span className={`group-item__chip group-item__chip--points ${pointsClass(team.points)}`}>
                      <small>Punten</small>
                      <strong>{team.points}</strong>
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
