import { useEffect, useMemo, useState } from 'react';
import { saveGroupWinnerPredictions } from '../../services/tournamentApi';
import PredictionWindowInfo from './PredictionWindowInfo';
import TeamSelectDropdown from './TeamSelectDropdown';

function resolveErrorMessage(error, fallback) {
  return error?.response?.data?.message
    || Object.values(error?.response?.data?.errors || {}).flat()?.[0]
    || fallback;
}

export default function GroupWinnerPanel({
  tournament,
  groupWinnerPredictions,
  now,
  onSaved,
  eyebrow = 'Groepswinnaars',
  title = 'Kies per groep de nummer 1',
  emptyMessage = 'Er zijn geen groepen om te voorspellen in deze sectie.',
  showHeader = true,
}) {
  const [selections, setSelections] = useState({});
  const [savingGroupId, setSavingGroupId] = useState(null);
  const [feedbackByGroup, setFeedbackByGroup] = useState({});
  const groups = useMemo(() => groupWinnerPredictions?.groups || [], [groupWinnerPredictions?.groups]);

  useEffect(() => {
    const nextSelections = {};

    groups.forEach((group) => {
      nextSelections[group.id] = String(group.prediction?.predicted_team_id || '');
    });

    setSelections(nextSelections);
  }, [groups]);

  async function handleSaveGroup(groupId) {
    const teamId = selections[groupId];

    if (!tournament?.id || !teamId) {
      return;
    }

    setSavingGroupId(groupId);
    setFeedbackByGroup((current) => ({
      ...current,
      [groupId]: null,
    }));

    try {
      await saveGroupWinnerPredictions(tournament.id, [{
        group_id: Number(groupId),
        team_id: Number(teamId),
      }]);
      setFeedbackByGroup((current) => ({
        ...current,
        [groupId]: {
          type: 'success',
          text: 'Opgeslagen',
        },
      }));
      await onSaved();
    } catch (requestError) {
      setFeedbackByGroup((current) => ({
        ...current,
        [groupId]: {
          type: 'error',
          text: resolveErrorMessage(requestError, 'Opslaan mislukt.'),
        },
      }));
    } finally {
      setSavingGroupId(null);
    }
  }
  const isLocked = groupWinnerPredictions?.prediction_window?.is_locked;

  return (
    <article className="panel-shell group-winner-panel">
      {showHeader ? (
        <header className="section-title">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
          </div>
        </header>
      ) : null}

      <PredictionWindowInfo now={now} predictionWindow={groupWinnerPredictions?.prediction_window} />

      <div className="group-winner-grid">
        {groups.length ? groups.map((group) => {
          const hasPrediction = Boolean(group.prediction);

          return (
            <div className={`group-winner-entry${hasPrediction ? ' is-predicted' : ''}`} key={group.id}>
              <div className="group-winner-entry__header">
                <strong>Groep {group.code}</strong>
                <span className={`group-winner-entry__state${hasPrediction ? ' is-predicted' : ''}`}>
                  {hasPrediction ? 'Opgeslagen' : 'Open'}
                </span>
              </div>

              <TeamSelectDropdown
                disabled={isLocked || savingGroupId === group.id}
                onChange={(nextValue) => {
                  setSelections((current) => ({ ...current, [group.id]: nextValue }));
                  setFeedbackByGroup((current) => ({
                    ...current,
                    [group.id]: null,
                  }));
                }}
                options={group.teams}
                placeholder="Selecteer een team"
                value={selections[group.id] || ''}
              />

              <div className="group-winner-entry__actions">
                <button
                  className="group-winner-entry__save"
                  disabled={isLocked || savingGroupId === group.id || !selections[group.id]}
                  onClick={() => handleSaveGroup(group.id)}
                  type="button"
                >
                  Opslaan
                </button>
                {feedbackByGroup[group.id] ? (
                  <span className={`group-winner-entry__feedback is-${feedbackByGroup[group.id].type}`}>
                    {feedbackByGroup[group.id].text}
                  </span>
                ) : null}
              </div>
            </div>
          );
        }) : <div className="empty-card">{emptyMessage}</div>}
      </div>
    </article>
  );
}
