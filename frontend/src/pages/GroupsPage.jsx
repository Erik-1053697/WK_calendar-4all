import { useEffect, useState } from 'react';
import GroupStandingsBoard from '../components/schedule/GroupStandingsBoard.jsx';
import { api } from '../services/api';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchGroups() {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/groups/standings');
        setGroups(response.data.data);
      } catch (requestError) {
        setError('We could not load the group rankings.');
        console.error(requestError);
      } finally {
        setLoading(false);
      }
    }

    fetchGroups();
  }, []);

  return (
    <div className="page-stack groups-page">
      {loading ? <div className="panel loading-panel">Loading groups...</div> : null}
      {error ? <div className="panel form-message error">{error}</div> : null}
      {!loading && !error ? <GroupStandingsBoard groups={groups} /> : null}
    </div>
  );
}
