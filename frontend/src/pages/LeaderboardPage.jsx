import { useEffect, useMemo, useState } from 'react';
import PredictionGroupsWorkspace from '../components/leaderboard/PredictionGroupsWorkspace';
import PredictionLeaderboard from '../components/leaderboard/PredictionLeaderboard';
import MetricCard from '../components/ui/MetricCard';
import PageHeader from '../components/ui/PageHeader';
import { getLeaderboard } from '../services/tournamentApi';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true);
      setError('');

      try {
        setLeaderboard(await getLeaderboard());
      } catch (requestError) {
        setError('We konden de ranglijst niet laden.');
        console.error(requestError);
      } finally {
        setLoading(false);
      }
    }

    loadLeaderboard();
  }, []);

  const stats = useMemo(() => {
    const entries = leaderboard?.entries || [];
    const leader = entries[0];

    return {
      players: entries.length,
      topScore: leader?.total_points || 0,
      exactScores: entries.reduce((total, entry) => total + Number(entry.exact_scores || 0), 0),
      predictions: entries.reduce((total, entry) => total + Number(entry.predictions_count || 0), 0),
    };
  }, [leaderboard]);

  return (
    <section className="screen-stack">
      <PageHeader
        eyebrow="Ranglijst"
        title="Voorspellersranglijst"
        subtitle="Een competitief overzicht van punten, exacte scores, ingevulde voorspellingen en gedeelde posities."
      />

      {loading ? <div className="loading-shell">Ranglijst laden...</div> : null}
      {error ? <div className="empty-card">{error}</div> : null}

      {!loading && !error && leaderboard ? (
        <>
          <section className="metric-grid">
            <MetricCard label="Spelers" value={stats.players} detail="In de poule" tone="blue" />
            <MetricCard label="Hoogste score" value={stats.topScore} detail="Huidige koploper" tone="gold" />
            <MetricCard label="Exacte scores" value={stats.exactScores} detail="Perfect voorspeld" />
            <MetricCard label="Voorspellingen" value={stats.predictions} detail="Ingevulde voorspellingen" />
          </section>

          <section className="leaderboard-showcase">
            <PredictionLeaderboard entries={leaderboard.entries} />
            <article className="panel-shell leaderboard-story">
              <span className="eyebrow">Puntentelling</span>
              <h2>De ranglijst werkt bij vanuit uitslagen</h2>
              <p>
                Voorspellingspunten worden opnieuw berekend zodra uitslagen zijn ingevoerd. Spelers met hetzelfde
                puntenaantal kunnen dezelfde positie delen, zodat gelijke standen eerlijk blijven.
              </p>
            </article>
          </section>

          <PredictionGroupsWorkspace />
        </>
      ) : null}
    </section>
  );
}
