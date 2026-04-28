import { useEffect, useMemo, useRef, useState } from 'react';
import { displayTeamName, teamFlagUrl } from '../../lib/domain';

function TeamAvatar({ team }) {
  return (
    <span className="team-select__flag">
      {teamFlagUrl(team) ? <img alt="" src={teamFlagUrl(team)} /> : <span>{(team?.fifa_code || team?.code || '?').slice(0, 2)}</span>}
    </span>
  );
}

function TeamMeta({ team }) {
  if (!team) {
    return null;
  }

  return (
    <span className="team-select__copy">
      <strong>{displayTeamName(team.name)}</strong>
      <small>{team.group_slot || team.fifa_code || team.code || 'WK'}</small>
    </span>
  );
}

export default function TeamSelectDropdown({
  disabled = false,
  onChange,
  options = [],
  placeholder = 'Selecteer een team',
  value = '',
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedTeam = useMemo(
    () => options.find((team) => String(team.id) === String(value)) || null,
    [options, value],
  );

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [open]);

  function handleSelect(teamId) {
    onChange(String(teamId));
    setOpen(false);
  }

  return (
    <div className={`team-select${open ? ' is-open' : ''}${disabled ? ' is-disabled' : ''}`} ref={containerRef}>
      <button
        aria-expanded={open}
        className="team-select__trigger"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {selectedTeam ? (
          <>
            <TeamAvatar team={selectedTeam} />
            <TeamMeta team={selectedTeam} />
          </>
        ) : (
          <>
            <span className="team-select__flag team-select__flag--placeholder">
              <span>WK</span>
            </span>
            <span className="team-select__placeholder">{placeholder}</span>
          </>
        )}
        <span className="team-select__chevron">{open ? '▴' : '▾'}</span>
      </button>

      {open ? (
        <div className="team-select__menu" role="listbox">
          {options.map((team) => {
            const selected = String(team.id) === String(value);

            return (
              <button
                className={`team-select__option${selected ? ' is-selected' : ''}`}
                key={team.id}
                onClick={() => handleSelect(team.id)}
                role="option"
                type="button"
              >
                <TeamAvatar team={team} />
                <TeamMeta team={team} />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
