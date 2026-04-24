import { displayTeamName, goalDifference, groupLabel, qualificationLabel } from '../../lib/domain';

function rankClass(position, enabled) {
  if (!enabled) {
    return '';
  }

  return {
    1: 'is-gold',
    2: 'is-silver',
    3: 'is-bronze',
  }[position] ?? '';
}

export default function GroupStandingsGrid({ groups }) {
  return (
    <div className="groups-grid">
      {groups.map((group) => (
        <article className="group-panel" key={group.id}>
          <header>
            <div>
              <span>Groep {group.code}</span>
              <h3>{groupLabel(group.name)}</h3>
            </div>
            <small>{group.played_matches} gespeeld</small>
          </header>

          <div className="standings-table">
            <div className="standings-table__head">
              <span>Pos</span>
              <span>Team</span>
              <span>G</span>
              <span>W</span>
              <span>G</span>
              <span>V</span>
              <span>DV</span>
              <span>DT</span>
              <span>DS</span>
              <span>Ptn</span>
              <span>Status</span>
            </div>

            {group.standings.map((team) => (
              <div className="standings-table__row" key={team.team_id}>
                <span className={`rank-chip ${rankClass(team.position, group.is_ranked_by_points)}`}>
                  {group.is_ranked_by_points ? team.position : 1}
                </span>
                <div className="standing-team">
                  <img alt="" src={team.flag_url || team.image_url} />
                  <div>
                    <strong>{displayTeamName(team.team_name)}</strong>
                    <small>{team.group_slot || team.code || team.fifa_code}</small>
                  </div>
                </div>
                <span>{team.played}</span>
                <span>{team.won}</span>
                <span>{team.drawn}</span>
                <span>{team.lost}</span>
                <span>{team.goals_for}</span>
                <span>{team.goals_against}</span>
                <span>{goalDifference(team.goal_difference)}</span>
                <strong>{team.points}</strong>
                <span className={`qualification qualification--${team.qualification_status}`}>
                  {qualificationLabel(team.qualification_status)}
                </span>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
