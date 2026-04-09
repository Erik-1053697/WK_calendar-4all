import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import PredictionModal from '../components/predictions/PredictionModal.jsx';
import MatchBoard from '../components/schedule/MatchBoard.jsx';
import MatchFilters from '../components/schedule/MatchFilters.jsx';
import useAuth from '../hooks/useAuth';
import { api } from '../services/api';

export default function SchedulePage() {
  const { isAuthenticated } = useAuth();
  const [matches, setMatches] = useState([]);
  const [dates, setDates] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    stage: '',
    city: '',
  });

  const deferredSearch = useDeferredValue(filters.search);

  const fetchMatches = useCallback(async (matchIdToKeepOpen = null) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/schedule', {
        params: {
          stage: filters.stage || undefined,
          city: filters.city || undefined,
          search: deferredSearch || undefined,
        },
      });

      setDates(response.data.data.dates);
      setVenues(response.data.data.venues);
      setMatches(response.data.data.matches);

      const activeMatchId = matchIdToKeepOpen ?? selectedMatch?.id;
      if (activeMatchId) {
        const refreshedMatch = response.data.data.matches.find((match) => match.id === activeMatchId) || null;
        setSelectedMatch(refreshedMatch);
      }
    } catch (requestError) {
      setError('We could not load the tournament schedule.');
      console.error(requestError);
    } finally {
      setLoading(false);
    }
  }, [deferredSearch, filters.city, filters.stage, selectedMatch?.id]);

  useEffect(() => {
    fetchMatches();
  }, [isAuthenticated, fetchMatches]);

  async function refreshSelectedPrediction(matchId) {
    await fetchMatches(matchId);
  }

  const cities = useMemo(
    () => venues.map((venue) => venue.host_market),
    [venues],
  );

  const stages = useMemo(
    () => [...new Set(matches.map((match) => match.stage))],
    [matches],
  );

  const summary = useMemo(() => {
    const locked = matches.filter((match) => match.prediction_status === 'locked').length;
    const draft = matches.filter((match) => match.prediction_status === 'draft').length;
    return { total: matches.length, locked, draft };
  }, [matches]);

  return (
    <div className="page-stack">
      <section className="hero-banner">
        <div>
          <p className="eyebrow">Official FIFA Data</p>
          <h1>The World Cup 2026 wall chart.</h1>
          <p className="lead">
            Explore the tournament as a host-market calendar board with local kickoff dates, venue rows, and one locked prediction per match.
          </p>
        </div>

        <div className="hero-summary panel">
          <div>
            <span>Total matches</span>
            <strong>{summary.total}</strong>
          </div>
          <div>
            <span>Draft picks</span>
            <strong>{summary.draft}</strong>
          </div>
          <div>
            <span>Locked picks</span>
            <strong>{summary.locked}</strong>
          </div>
          <div>
            <span>Host markets</span>
            <strong>{venues.length}</strong>
          </div>
        </div>
      </section>

      <MatchFilters
        cities={cities}
        stages={stages}
        filters={filters}
        onChange={(event) =>
          setFilters((current) => ({
            ...current,
            [event.target.name]: event.target.value,
          }))
        }
        onReset={() => setFilters({ search: '', stage: '', city: '' })}
      />

      {loading ? <div className="panel loading-panel">Loading schedule...</div> : null}
      {error ? <div className="panel form-message error">{error}</div> : null}
      {!loading && !error && matches.length === 0 ? (
        <div className="panel empty-state">
          <h3>No matches match your filters</h3>
          <p>Try widening the stage, city, or search filters.</p>
        </div>
      ) : null}

      {!loading && !error && matches.length > 0 ? (
        <MatchBoard dates={dates} venues={venues} matches={matches} onSelect={setSelectedMatch} />
      ) : null}

      <PredictionModal
        match={selectedMatch}
        isAuthenticated={isAuthenticated}
        onClose={() => setSelectedMatch(null)}
        onPredictionSaved={refreshSelectedPrediction}
      />
    </div>
  );
}
