import { useEffect, useMemo, useState } from 'react';
import GroupWinnerPanel from '../components/predictions/GroupWinnerPanel';
import MatchPredictionCard from '../components/predictions/MatchPredictionCard';
import WinnerPredictionPanel from '../components/predictions/WinnerPredictionPanel';
import {
  displayTeamName,
  formatAmsterdamDate,
  formatAmsterdamTime,
  getPredictionWindowState,
  matchKickoff,
  teamFlagUrl,
} from '../lib/domain';
import { getPredictionDashboard } from '../services/tournamentApi';

function PredictionMiniStat({ label, value, detail, tone = 'default' }) {
  return (
    <article className={`prediction-mini-stat prediction-mini-stat--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function PredictionStageBadge({ label, value, tone = 'default' }) {
  return (
    <div className={`prediction-stage-badge prediction-stage-badge--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PredictionProgress({ value }) {
  return (
    <div className="prediction-progress">
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export default function PredictionsPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());
  const [activeTab, setActiveTab] = useState('matches');

  async function loadDashboard() {
    setLoading(true);
    setError('');

    try {
      setDashboard(await getPredictionDashboard());
    } catch (requestError) {
      setError('We konden je voorspellingen niet laden.');
      console.error(requestError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const stats = dashboard?.stats;
  const matchPredictions = useMemo(() => dashboard?.upcoming_matches || [], [dashboard]);
  const groupWinnerPredictions = dashboard?.group_winner_predictions;
  const winnerPrediction = dashboard?.winner_prediction;

  const groups = useMemo(() => groupWinnerPredictions?.groups || [], [groupWinnerPredictions]);
  const unpredictedGroups = useMemo(
    () => groups.filter((group) => !group.prediction),
    [groups],
  );
  const predictedGroups = useMemo(
    () => groups.filter((group) => Boolean(group.prediction)),
    [groups],
  );
  const orderedGroups = useMemo(
    () => [...unpredictedGroups, ...predictedGroups],
    [predictedGroups, unpredictedGroups],
  );

  const unpredictedMatches = useMemo(
    () => matchPredictions.filter((match) => !match.my_prediction),
    [matchPredictions],
  );
  const predictedMatches = useMemo(
    () => matchPredictions.filter((match) => Boolean(match.my_prediction)),
    [matchPredictions],
  );
  const orderedMatches = useMemo(
    () => [...unpredictedMatches, ...predictedMatches],
    [predictedMatches, unpredictedMatches],
  );
  const lockedMatchesCount = useMemo(
    () => matchPredictions.filter((match) => Boolean(match.my_prediction?.is_locked)).length,
    [matchPredictions],
  );

  const selectedWinnerTeam = useMemo(
    () => (winnerPrediction?.teams || []).find(
      (team) => String(team.id) === String(winnerPrediction?.prediction?.predicted_team_id || ''),
    ),
    [winnerPrediction],
  );

  const groupCompletion = groups.length ? Math.round((predictedGroups.length / groups.length) * 100) : 0;
  const matchCompletion = matchPredictions.length ? Math.round((predictedMatches.length / matchPredictions.length) * 100) : 0;

  const groupWindowState = getPredictionWindowState(groupWinnerPredictions?.prediction_window, now);
  const winnerWindowState = getPredictionWindowState(winnerPrediction?.prediction_window, now);
  const orderedGroupPredictionPayload = useMemo(
    () => ({ ...(groupWinnerPredictions || {}), groups: orderedGroups }),
    [groupWinnerPredictions, orderedGroups],
  );

  const nextOpenMatch = useMemo(
    () => orderedMatches.find((match) => {
      const lockAt = match.prediction_window?.lock_at;
      return lockAt && new Date(lockAt).getTime() > now;
    }),
    [now, orderedMatches],
  );

  const nextMatchWindowState = getPredictionWindowState(nextOpenMatch?.prediction_window, now);
  const activeWindowState = activeTab === 'groups'
    ? groupWindowState
    : activeTab === 'winner'
      ? winnerWindowState
      : nextMatchWindowState;

  const tabs = [
    {
      key: 'matches',
      label: 'Wedstrijden',
      meta: `${predictedMatches.length}/${matchPredictions.length} klaar`,
    },
    {
      key: 'groups',
      label: 'Groepen',
      meta: `${predictedGroups.length}/${groups.length} klaar`,
    },
    {
      key: 'winner',
      label: 'WK-winnaar',
      meta: selectedWinnerTeam ? 'Opgeslagen' : 'Nog open',
    },
  ];

  const stageConfig = {
    matches: {
      eyebrow: 'Wedstrijd voorspellingen',
      title: 'Voorspel wedstrijd voor wedstrijd',
      description: 'Open wedstrijden staan automatisch vooraan. Opgeslagen of vastgezette picks blijven in hetzelfde overzicht zichtbaar.',
      badges: [
        { label: 'Open', value: unpredictedMatches.length, tone: 'default' },
        { label: 'Opgeslagen', value: predictedMatches.length, tone: 'success' },
        { label: 'Vastgezet', value: lockedMatchesCount, tone: 'gold' },
      ],
    },
    groups: {
      eyebrow: 'Groepswinnaars',
      title: 'Kies per groep jouw nummer 1',
      description: 'Werk alle groepen af in één doorlopende grid. Zodra een groep is opgeslagen, blijft die herkenbaar met een groene status.',
      badges: [
        { label: 'Open', value: unpredictedGroups.length, tone: 'default' },
        { label: 'Opgeslagen', value: predictedGroups.length, tone: 'success' },
        { label: 'Gereed', value: `${groupCompletion}%`, tone: 'blue' },
      ],
    },
    winner: {
      eyebrow: 'Wereldkampioen',
      title: 'Leg jouw uiteindelijke kampioen vast',
      description: 'Je kiest hier één land als eindwinnaar van het toernooi. Deze voorspelling sluit zodra het kampioenschap begint.',
      badges: [
        { label: 'Status', value: selectedWinnerTeam ? 'Opgeslagen' : 'Open', tone: selectedWinnerTeam ? 'success' : 'default' },
        { label: 'Sluit', value: winnerWindowState.daysLabel, tone: 'blue' },
      ],
    },
  }[activeTab];

  const compactStats = [
    {
      label: 'Punten',
      value: stats?.total_points ?? 0,
      detail: `Positie #${stats?.rank ?? 1}`,
      tone: 'gold',
    },
    {
      label: 'Nauwkeurigheid',
      value: `${stats?.accuracy ?? 0}%`,
      detail: 'Juiste uitkomsten',
      tone: 'blue',
    },
    {
      label: 'Exacte scores',
      value: stats?.exact_scores ?? 0,
      detail: 'Perfect voorspeld',
      tone: 'default',
    },
    {
      label: 'Vastgezet',
      value: stats?.locked_predictions ?? 0,
      detail: `${stats?.predictions_count ?? 0} voorspellingen`,
      tone: 'default',
    },
  ];

  function renderMatchBoard() {
    return (
      <section className="panel-shell prediction-board prediction-board--matches">
        <header className="section-title">
          <div>
            <span className="eyebrow">Wedstrijdlijst</span>
            <h2>Alle beschikbare wedstrijden</h2>
          </div>
          <small>{orderedMatches.length} wedstrijden</small>
        </header>

        <div className="prediction-match-grid">
          {orderedMatches.length ? (
            orderedMatches.map((match) => (
              <MatchPredictionCard key={match.id} match={match} now={now} onSaved={loadDashboard} />
            ))
          ) : (
            <div className="empty-card">Er zijn momenteel geen wedstrijden beschikbaar voor voorspellingen.</div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="screen-stack">
      {loading ? <div className="loading-shell">Voorspellingen laden...</div> : null}
      {error ? <div className="empty-card">{error}</div> : null}

      {!loading && !error && dashboard ? (
        <section className="prediction-studio">
          <aside className="panel-shell prediction-rail">
            <div className="prediction-rail__intro">
              <span className="eyebrow">Voorspellingen</span>
              <h2>Jouw voorspelstudio</h2>
              <p>Werk je picks af per onderdeel en houd elk sluitmoment in Amsterdamse tijd in de gaten.</p>
            </div>

            <div className="prediction-rail__tabs">
              {tabs.map((tab) => (
                <button
                  className={`prediction-nav-card${activeTab === tab.key ? ' is-active' : ''}`}
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  type="button"
                >
                  <strong>{tab.label}</strong>
                  <small>{tab.meta}</small>
                </button>
              ))}
            </div>

            <div className="prediction-rail__stats">
              {compactStats.map((stat) => (
                <PredictionMiniStat
                  detail={stat.detail}
                  key={stat.label}
                  label={stat.label}
                  tone={stat.tone}
                  value={stat.value}
                />
              ))}
            </div>

            <article className="prediction-deadline-card">
              <span>Actief sluitmoment</span>
              <strong>{activeWindowState.countdownLabel || activeWindowState.daysLabel}</strong>
              <small>Sluit op {activeWindowState.lockAtLabel}</small>
            </article>
          </aside>

          <div className="prediction-stage">
            <section className="panel-shell prediction-stage__header">
              <div className="prediction-stage__copy">
                <span className="eyebrow">{stageConfig.eyebrow}</span>
                <h2>{stageConfig.title}</h2>
                <p>{stageConfig.description}</p>
              </div>

              <div className="prediction-stage__badges">
                {stageConfig.badges.map((badge) => (
                  <PredictionStageBadge
                    key={`${badge.label}-${badge.value}`}
                    label={badge.label}
                    tone={badge.tone}
                    value={badge.value}
                  />
                ))}
              </div>
            </section>

            {activeTab === 'groups' ? (
              <div className="prediction-workspace prediction-workspace--split">
                <GroupWinnerPanel
                  emptyMessage="Er zijn geen groepen beschikbaar om te voorspellen."
                  groupWinnerPredictions={orderedGroupPredictionPayload}
                  now={now}
                  onSaved={loadDashboard}
                  showHeader={false}
                  tournament={dashboard.tournament}
                />

                <aside className="prediction-support-stack">
                  <article className="panel-shell prediction-support-card">
                    <span className="eyebrow">Voortgang</span>
                    <strong>{groupCompletion}% ingevuld</strong>
                    <PredictionProgress value={groupCompletion} />
                    <small>{predictedGroups.length} van {groups.length} groepen opgeslagen</small>
                  </article>

                  <article className="panel-shell prediction-support-card">
                    <span className="eyebrow">Nog open</span>
                    <strong>{unpredictedGroups.length} groepen wachten nog</strong>
                    <small>Open groepen staan automatisch eerst in het overzicht.</small>
                  </article>
                </aside>
              </div>
            ) : null}

            {activeTab === 'winner' ? (
              <div className="prediction-workspace prediction-workspace--split prediction-workspace--winner">
                <WinnerPredictionPanel
                  now={now}
                  onSaved={loadDashboard}
                  showHeader={false}
                  tournament={dashboard.tournament}
                  winnerPrediction={winnerPrediction}
                />

                <aside className="prediction-support-stack">
                  <article className="panel-shell prediction-support-card prediction-support-card--team">
                    <span className="eyebrow">Huidige keuze</span>
                    {selectedWinnerTeam ? (
                      <div className="prediction-team-highlight">
                        <div className="prediction-team-highlight__flag">
                          {teamFlagUrl(selectedWinnerTeam) ? (
                            <img alt="" src={teamFlagUrl(selectedWinnerTeam)} />
                          ) : (
                            <span>{(selectedWinnerTeam.code || '?').slice(0, 2)}</span>
                          )}
                        </div>
                        <div>
                          <strong>{displayTeamName(selectedWinnerTeam.name)}</strong>
                          <small>{selectedWinnerTeam.code || 'Team'}</small>
                        </div>
                      </div>
                    ) : (
                      <p className="muted">Je hebt nog geen wereldkampioen gekozen.</p>
                    )}
                  </article>

                  <article className="panel-shell prediction-support-card">
                    <span className="eyebrow">Deadline</span>
                    <strong>{winnerWindowState.countdownLabel || winnerWindowState.daysLabel}</strong>
                    <small>Sluit op {winnerWindowState.lockAtLabel}</small>
                  </article>
                </aside>
              </div>
            ) : null}

            {activeTab === 'matches' ? (
              <div className="prediction-workspace prediction-workspace--split prediction-workspace--matches">
                {renderMatchBoard()}

                <aside className="prediction-support-stack">
                  <article className="panel-shell prediction-support-card">
                    <span className="eyebrow">Voortgang</span>
                    <strong>{matchCompletion}% ingevuld</strong>
                    <PredictionProgress value={matchCompletion} />
                    <small>{predictedMatches.length} van {matchPredictions.length} wedstrijden opgeslagen</small>
                  </article>

                  <article className="panel-shell prediction-support-card">
                    <span className="eyebrow">Volgende sluiting</span>
                    {nextOpenMatch ? (
                      <>
                        <strong>{displayTeamName(nextOpenMatch.home_team_name)} vs {displayTeamName(nextOpenMatch.away_team_name)}</strong>
                        <small>{formatAmsterdamDate(matchKickoff(nextOpenMatch))} · {formatAmsterdamTime(matchKickoff(nextOpenMatch))} · {nextOpenMatch.venue?.host_market}</small>
                        <small>{nextMatchWindowState.countdownLabel || nextMatchWindowState.daysLabel}</small>
                      </>
                    ) : (
                      <small>Er is momenteel geen open wedstrijd meer om te voorspellen.</small>
                    )}
                  </article>
                </aside>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </section>
  );
}
