import { useCallback, useEffect, useState } from 'react';
import PredictionModal from '../components/predictions/PredictionModal.jsx';
import GroupStandingsBoard from '../components/schedule/GroupStandingsBoard.jsx';
import MatchBoard from '../components/schedule/MatchBoard.jsx';
import useAuth from '../hooks/useAuth';
import { api } from '../services/api';

export default function SchedulePage() {
  const { isAuthenticated } = useAuth();
  const [matches, setMatches] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null);

  const fetchMatches = useCallback(async (matchIdToKeepOpen = null) => {
    setLoading(true);
    setError('');

    try {
      const [scheduleResponse, standingsResponse] = await Promise.all([
        api.get('/schedule'),
        api.get('/groups/standings'),
      ]);

      setMatches(scheduleResponse.data.data.matches);
      setGroups(standingsResponse.data.data);
      setSelectedMatch((current) => {
        const activeMatchId = matchIdToKeepOpen ?? current?.id;

        if (!activeMatchId) {
          return current;
        }

        return scheduleResponse.data.data.matches.find((match) => match.id === activeMatchId) || null;
      });
    } catch (requestError) {
      setError('We could not load the tournament schedule.');
      console.error(requestError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [isAuthenticated, fetchMatches]);

  async function refreshSelectedPrediction(matchId) {
    await fetchMatches(matchId);
  }

  return (
    <div className="page-stack page-stack--schedule">
      {loading ? <div className="panel loading-panel">Loading schedule...</div> : null}
      {error ? <div className="panel form-message error">{error}</div> : null}
      {!loading && !error && matches.length === 0 ? (
        <div className="panel empty-state">
          <h3>No matches available yet</h3>
          <p>Add fixtures to the schedule to render the board.</p>
        </div>
      ) : null}

      {!loading && !error && matches.length > 0 ? (
        <>
          <MatchBoard matches={matches} onSelect={setSelectedMatch} />
          <div className="groups-page schedule-page__groups">
            <GroupStandingsBoard groups={groups} />
          </div>
        </>
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
