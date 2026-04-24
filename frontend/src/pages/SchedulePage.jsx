import { useEffect, useMemo, useState } from 'react';
import MatchRow from '../components/matches/MatchRow';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import { displayTeamName, formatAmsterdamDate, formatAmsterdamTime, matchKickoff, roundLabel, sortByKickoff, statusLabel, uniqueStages } from '../lib/domain';
import { getMatches } from '../services/tournamentApi';

export default function SchedulePage() {
  const [matches, setMatches] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const statusFilters = ['all', 'live', 'upcoming', 'completed'];

  useEffect(() => {
    async function loadMatches() {
      setLoading(true);
      setError('');

      try {
        setMatches(await getMatches());
      } catch (requestError) {
        setError('We konden het speelschema niet laden.');
        console.error(requestError);
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, []);

  const stages = useMemo(() => uniqueStages(matches), [matches]);
  const filteredMatches = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sortByKickoff(matches).filter((match) => {
      const stage = match.group_name || match.stage;
      const searchText = [
        match.home_team_name,
        match.away_team_name,
        match.home_team_slot,
        match.away_team_slot,
        match.venue?.host_market,
        match.venue?.stadium_name,
        match.stage,
        match.group_name,
      ].filter(Boolean).join(' ').toLowerCase();

      return (statusFilter === 'all' || match.status === statusFilter)
        && (stageFilter === 'all' || stage === stageFilter)
        && (!query || searchText.includes(query));
    });
  }, [matches, search, stageFilter, statusFilter]);

  return (
    <section className="screen-stack">
      <PageHeader
        eyebrow="Speelschema"
        title="Wedstrijdkalender"
        subtitle="Filter wedstrijden op status, groep, team of stadion. Alle tijden worden getoond in Amsterdamse tijd."
      />

      <section className="schedule-filter-bar">
        <div className="segmented-control">
          {statusFilters.map((status) => (
            <button className={statusFilter === status ? 'is-active' : ''} key={status} onClick={() => setStatusFilter(status)} type="button">
              {status === 'all' ? 'Alles' : statusLabel(status)}
            </button>
          ))}
        </div>
        <select value={stageFilter} onChange={(event) => setStageFilter(event.target.value)}>
          <option value="all">Alle groepen en rondes</option>
          {stages.map((stage) => <option key={stage} value={stage}>{roundLabel(stage)}</option>)}
        </select>
        <input placeholder="Zoek team, stadion of stad..." value={search} onChange={(event) => setSearch(event.target.value)} />
      </section>

      {loading ? <div className="loading-shell">Speelschema laden...</div> : null}
      {error ? <EmptyState title="Speelschema niet beschikbaar" message={error} /> : null}

      {!loading && !error ? (
        <section className="schedule-workspace">
          <div className="schedule-table panel-shell">
            <div className="schedule-table__head">
              <span>Datum</span>
              <span>Wedstrijd</span>
              <span>Ronde</span>
              <span>Stadion</span>
              <span>Status</span>
            </div>
            {filteredMatches.length ? filteredMatches.map((match) => (
              <MatchRow key={match.id} match={match} onSelect={setSelectedMatch} />
            )) : (
              <EmptyState title="Geen wedstrijden gevonden" message="Pas de status, ronde of zoekterm aan." />
            )}
          </div>

          <aside className="match-inspector panel-shell">
            {selectedMatch ? (
              <>
                <StatusBadge status={selectedMatch.status} />
                <h2>{displayTeamName(selectedMatch.home_team_name)} vs {displayTeamName(selectedMatch.away_team_name)}</h2>
                <dl>
                  <div><dt>Datum</dt><dd>{formatAmsterdamDate(matchKickoff(selectedMatch))}</dd></div>
                  <div><dt>Tijd</dt><dd>{formatAmsterdamTime(matchKickoff(selectedMatch))} Amsterdam</dd></div>
                  <div><dt>Ronde</dt><dd>{roundLabel(selectedMatch.group_name || selectedMatch.stage)}</dd></div>
                  <div><dt>Stadion</dt><dd>{selectedMatch.venue?.stadium_name}</dd></div>
                  <div><dt>Stad</dt><dd>{selectedMatch.venue?.host_market}</dd></div>
                </dl>
              </>
            ) : (
              <>
                <span className="eyebrow">Wedstrijddetail</span>
                <h2>Selecteer een wedstrijd</h2>
                <p>Klik op een rij om datum, tijd, ronde en stadioninformatie te bekijken.</p>
              </>
            )}
          </aside>
        </section>
      ) : null}
    </section>
  );
}
