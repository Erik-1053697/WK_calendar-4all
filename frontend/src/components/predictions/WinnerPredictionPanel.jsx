import { useEffect, useState } from 'react';
import { saveTournamentWinnerPrediction } from '../../services/tournamentApi';
import PredictionWindowInfo from './PredictionWindowInfo';
import TeamSelectDropdown from './TeamSelectDropdown';

function resolveErrorMessage(error, fallback) {
  return error?.response?.data?.message
    || Object.values(error?.response?.data?.errors || {}).flat()?.[0]
    || fallback;
}

export default function WinnerPredictionPanel({
  tournament,
  winnerPrediction,
  now,
  onSaved,
  eyebrow = 'WK-winnaar',
  title = 'Kies de wereldkampioen',
  showHeader = true,
}) {
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setSelectedTeamId(String(winnerPrediction?.prediction?.predicted_team_id || ''));
  }, [winnerPrediction]);

  async function handleSave() {
    if (!tournament?.id || !selectedTeamId) {
      return;
    }

    setBusy(true);
    setMessage('');
    setError('');

    try {
      await saveTournamentWinnerPrediction(tournament.id, selectedTeamId);
      setMessage('Eindwinnaar opgeslagen');
      await onSaved();
    } catch (requestError) {
      setError(resolveErrorMessage(requestError, 'We konden je eindwinnaar niet opslaan.'));
    } finally {
      setBusy(false);
    }
  }

  const isLocked = winnerPrediction?.prediction_window?.is_locked;
  return (
    <article className="panel-shell winner-panel">
      {showHeader ? (
        <header className="section-title">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
          </div>
        </header>
      ) : null}

      <PredictionWindowInfo now={now} predictionWindow={winnerPrediction?.prediction_window} />

      <label className="prediction-field">
        <span>Wereldkampioen</span>
        <TeamSelectDropdown
          disabled={isLocked || busy}
          onChange={setSelectedTeamId}
          options={winnerPrediction?.teams || []}
          placeholder="Selecteer een team"
          value={selectedTeamId}
        />
      </label>

      <div className="prediction-inline-actions">
        <button disabled={isLocked || busy || !selectedTeamId} onClick={handleSave} type="button">
          Opslaan
        </button>
        {message ? <span className="prediction-inline-actions__message is-success">{message}</span> : null}
        {error ? <span className="prediction-inline-actions__message is-error">{error}</span> : null}
      </div>
    </article>
  );
}
