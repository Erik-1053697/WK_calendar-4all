import { useEffect, useMemo, useState } from 'react';
import FixtureCard from '../components/matches/FixtureCard';
import MatchRow from '../components/matches/MatchRow';
import MetricCard from '../components/ui/MetricCard';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import { displayTeamName, formatAmsterdamDate, formatAmsterdamTime, groupByDate, matchKickoff, roundLabel, statusLabel } from '../lib/domain';
import { getOverview } from '../services/tournamentApi';

export default function OverviewPage() {
  const [overview, setOverview] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOverview() {
      setLoading(true);
      setError('');

      try {
        setOverview(await getOverview());
      } catch (requestError) {
        setError('We konden het toernooi-overzicht niet laden.');
        console.error(requestError);
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, []);

  const groupedFixtures = useMemo(() => groupByDate(overview?.fixtures || []), [overview]);
  const groupedEntries = Object.entries(groupedFixtures).slice(0, 5);

  if (loading) {
    return <div className="loading-shell">Overzicht laden...</div>;
  }

  if (error) {
    return <div className="empty-card">{error}</div>;
  }

  return (
    <section className="screen-stack">
      <PageHeader
        eyebrow="Wereldkampioenschap 2026"
        title="Toernooi-overzicht"
        subtitle="Alle wedstrijden, stadions, statussen en voorspellingen in een compact overzicht."
      >
        <div className="tournament-pill">
          <span>{statusLabel(overview.tournament?.status || 'upcoming')}</span>
          <strong>Wereldkampioenschap {overview.tournament?.year}</strong>
        </div>
      </PageHeader>

      <section className="metric-grid">
        <MetricCard label="Wedstrijden" value={overview.summary.total_matches} detail="Volledig programma" tone="blue" />
        <MetricCard label="Teams" value={overview.summary.total_teams} detail="Verdeeld over groepen" />
        <MetricCard label="Stadions" value={overview.summary.total_venues} detail="Speellocaties klaar" />
        <MetricCard label="Gespeeld / komend" value={`${overview.summary.played_matches}/${overview.summary.upcoming_matches}`} detail={`${overview.summary.live_matches} nu live`} tone="gold" />
      </section>

      <section className="overview-layout">
        <div className="panel-shell fixture-overview">
          <header className="section-title">
            <div>
              <span className="eyebrow">Hoofdoverzicht</span>
              <h2>Wedstrijden per speeldag</h2>
            </div>
            <small>Tijdzone Amsterdam</small>
          </header>

          <div className="fixture-days">
            {groupedEntries.map(([date, matches]) => (
              <article className="fixture-day" key={date}>
                <div className="fixture-day__date">
                  <strong>{formatAmsterdamDate(matchKickoff(matches[0]))}</strong>
                  <span>{matches.length} wedstrijden</span>
                </div>
                <div className="fixture-day__list">
                  {matches.slice(0, 7).map((match) => (
                    <MatchRow key={match.id} match={match} onSelect={setSelectedMatch} />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="overview-rail">
          <article className="panel-shell rail-card">
            <header className="section-title">
              <h3>Vandaag</h3>
              <StatusBadge status={overview.today_matches.length ? 'live' : 'upcoming'}>
                {overview.today_matches.length} wedstrijden
              </StatusBadge>
            </header>
            <div className="rail-list">
              {(overview.today_matches.length ? overview.today_matches : overview.fixtures.slice(0, 3)).map((match) => (
                <FixtureCard key={match.id} match={match} onSelect={setSelectedMatch} />
              ))}
            </div>
          </article>

          <article className="panel-shell rail-card rail-card--glow">
            <span className="eyebrow">Volgende knock-out</span>
            {overview.next_knockout_match ? (
              <>
                <h3>{roundLabel(overview.next_knockout_match.round_label || overview.next_knockout_match.stage)}</h3>
                <p>{formatAmsterdamDate(matchKickoff(overview.next_knockout_match))} · {formatAmsterdamTime(matchKickoff(overview.next_knockout_match))}</p>
              </>
            ) : (
              <>
                <h3>Knock-outpad nog niet bekend</h3>
                <p>Het schema wordt duidelijk zodra de groepsfase is beslist.</p>
              </>
            )}
          </article>

          <article className="panel-shell qualification-card">
            <span className="eyebrow">Kwalificatiebeeld</span>
            <div>
              <strong>{overview.qualification_snapshot.groups}</strong>
              <span>groepen met actuele stand</span>
            </div>
          </article>
        </aside>
      </section>

      <section className="panel-shell bracket-preview">
        <header className="section-title">
          <div>
            <span className="eyebrow">Bracketpreview</span>
            <h2>Knock-outroute</h2>
          </div>
          <small>Compact overzicht</small>
        </header>
        <div className="bracket-strip">
          {overview.bracket_preview.slice(0, 10).map((match) => (
            <button className="bracket-node" key={match.id} onClick={() => setSelectedMatch(match)} type="button">
              <span>{roundLabel(match.stage)}</span>
              <strong>{match.home_team_slot || displayTeamName(match.home_team_name)}</strong>
              <em>vs</em>
              <strong>{match.away_team_slot || displayTeamName(match.away_team_name)}</strong>
            </button>
          ))}
        </div>
      </section>

      {selectedMatch ? (
        <aside className="match-detail-drawer">
          <button onClick={() => setSelectedMatch(null)} type="button">Sluiten</button>
          <span className="eyebrow">Wedstrijd {selectedMatch.fifa_match_number}</span>
          <h2>{displayTeamName(selectedMatch.home_team_name)} vs {displayTeamName(selectedMatch.away_team_name)}</h2>
          <p>{formatAmsterdamDate(matchKickoff(selectedMatch))} · {formatAmsterdamTime(matchKickoff(selectedMatch))} Amsterdam</p>
          <p>{selectedMatch.venue?.stadium_name} · {selectedMatch.venue?.host_market}</p>
        </aside>
      ) : null}
    </section>
  );
}
