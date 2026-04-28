import { useCallback, useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import {
  createPredictionGroup,
  getPredictionGroup,
  getPredictionGroups,
  joinPredictionGroup,
} from '../../services/tournamentApi';
import PredictionLeaderboard from './PredictionLeaderboard';

function resolveErrorMessage(error, fallback) {
  return error?.response?.data?.message
    || Object.values(error?.response?.data?.errors || {}).flat()?.[0]
    || fallback;
}

export default function PredictionGroupsWorkspace() {
  const { isAuthenticated } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedGroupData, setSelectedGroupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [createName, setCreateName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const loadGroups = useCallback(async (preferredGroupId = null) => {
    setLoading(true);
    setError('');

    try {
      const data = await getPredictionGroups();
      setGroups(data.groups || []);

      const nextGroupId = preferredGroupId
        || selectedGroupId
        || data.groups?.[0]?.id
        || null;

      setSelectedGroupId(nextGroupId);
    } catch (requestError) {
      setError(resolveErrorMessage(requestError, 'We konden je voorspellersgroepen niet laden.'));
    } finally {
      setLoading(false);
    }
  }, [selectedGroupId]);

  const loadGroup = useCallback(async (groupId) => {
    try {
      const data = await getPredictionGroup(groupId);
      setSelectedGroupData(data);
      setCopied(false);
    } catch (requestError) {
      setError(resolveErrorMessage(requestError, 'We konden deze voorspellersgroep niet laden.'));
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    loadGroups();
    return undefined;
  }, [isAuthenticated, loadGroups]);

  useEffect(() => {
    if (!isAuthenticated || !selectedGroupId) {
      setSelectedGroupData(null);
      return undefined;
    }

    loadGroup(selectedGroupId);
    return undefined;
  }, [isAuthenticated, loadGroup, selectedGroupId]);

  async function handleCreate(event) {
    event.preventDefault();

    if (!createName.trim()) {
      return;
    }

    setBusy(true);
    setMessage('');
    setError('');

    try {
      const group = await createPredictionGroup(createName.trim());
      setCreateName('');
      setMessage('Je voorspellersgroep is aangemaakt.');
      await loadGroups(group.id);
    } catch (requestError) {
      setError(resolveErrorMessage(requestError, 'Aanmaken van de voorspellersgroep is mislukt.'));
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin(event) {
    event.preventDefault();

    if (!inviteCode.trim()) {
      return;
    }

    setBusy(true);
    setMessage('');
    setError('');

    try {
      const group = await joinPredictionGroup(inviteCode.trim());
      setInviteCode('');
      setMessage('Je bent toegevoegd aan de voorspellersgroep.');
      await loadGroups(group.id);
    } catch (requestError) {
      setError(resolveErrorMessage(requestError, 'De uitnodigingscode kon niet worden verwerkt.'));
    } finally {
      setBusy(false);
    }
  }

  async function handleCopyInviteCode() {
    const code = selectedGroupData?.group?.invite_code;

    if (!code || !navigator?.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  if (!isAuthenticated) {
    return (
      <section className="prediction-groups-section panel-shell">
        <header className="section-title">
          <div>
            <span className="eyebrow">Voorsellersgroepen</span>
            <h2>Maak een privé ranglijst</h2>
          </div>
        </header>
        <p className="muted">Log in om een voorspellersgroep aan te maken, een uitnodigingscode te delen en alleen de scores van deelnemers in jouw groep te bekijken.</p>
      </section>
    );
  }

  return (
    <section className="prediction-groups-section">
      <div className="prediction-groups-layout">
        <article className="panel-shell prediction-groups-sidebar">
          <header className="section-title">
            <div>
              <span className="eyebrow">Voorsellersgroepen</span>
              <h2>Jouw groepen</h2>
            </div>
          </header>

          <form className="group-form" onSubmit={handleCreate}>
            <label>
              <span>Nieuwe groep</span>
              <input
                disabled={busy}
                onChange={(event) => setCreateName(event.target.value)}
                placeholder="Bijvoorbeeld: Familie WK Pool"
                value={createName}
              />
            </label>
            <button className="button" disabled={busy || !createName.trim()} type="submit">
              Groep maken
            </button>
          </form>

          <form className="group-form" onSubmit={handleJoin}>
            <label>
              <span>Uitnodigingscode</span>
              <input
                disabled={busy}
                onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                placeholder="Bijvoorbeeld: ABCD1234"
                value={inviteCode}
              />
            </label>
            <button className="button button-ghost" disabled={busy || !inviteCode.trim()} type="submit">
              Deelnemen
            </button>
          </form>

          {message ? <p className="group-form__message is-success">{message}</p> : null}
          {error ? <p className="group-form__message is-error">{error}</p> : null}

          {loading ? <p className="muted">Groepen laden...</p> : null}

          <div className="prediction-group-list">
            {groups.length ? groups.map((group) => (
              <button
                className={`prediction-group-card${selectedGroupId === group.id ? ' is-active' : ''}`}
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                type="button"
              >
                <div>
                  <strong>{group.name}</strong>
                  <small>{group.member_count} deelnemers</small>
                </div>
                <span>{group.invite_code}</span>
              </button>
            )) : !loading ? <p className="muted">Je hebt nog geen voorspellersgroepen.</p> : null}
          </div>
        </article>

        <article className="panel-shell prediction-group-detail">
          {selectedGroupData?.group ? (
            <>
              <header className="section-title">
                <div>
                  <span className="eyebrow">Groepsranglijst</span>
                  <h2>{selectedGroupData.group.name}</h2>
                </div>
                <div className="group-invite-box">
                  <small>Uitnodigingscode</small>
                  <strong>{selectedGroupData.group.invite_code}</strong>
                  <button className="button button-ghost" onClick={handleCopyInviteCode} type="button">
                    {copied ? 'Gekopieerd' : 'Kopieer code'}
                  </button>
                </div>
              </header>

              <div className="group-member-strip">
                {(selectedGroupData.group.members || []).map((member) => (
                  <span className="group-member-pill" key={member.id}>
                    {member.name}
                    {member.role === 'owner' ? ' · Beheerder' : ''}
                  </span>
                ))}
              </div>

              <PredictionLeaderboard
                compact
                emptyMessage="Er staan nog geen deelnemers in deze groep."
                entries={selectedGroupData.entries}
                eyebrow="Deelnemers"
                title="Scores binnen jouw groep"
              />
            </>
          ) : (
            <div className="empty-card">Maak een voorspellersgroep of kies er een uit de lijst om de privéscores te bekijken.</div>
          )}
        </article>
      </div>
    </section>
  );
}
