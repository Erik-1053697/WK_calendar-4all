export const AMSTERDAM_TIME_ZONE = 'Europe/Amsterdam';
export const DUTCH_LOCALE = 'nl-NL';

export function formatAmsterdamDateTime(value, options = {}) {
  if (!value) {
    return 'Nog niet bekend';
  }

  return new Intl.DateTimeFormat(DUTCH_LOCALE, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: AMSTERDAM_TIME_ZONE,
    ...options,
  }).format(new Date(value));
}

export function formatAmsterdamDate(value) {
  if (!value) {
    return 'Nog niet bekend';
  }

  return new Intl.DateTimeFormat(DUTCH_LOCALE, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    timeZone: AMSTERDAM_TIME_ZONE,
  }).format(new Date(value));
}

export function formatAmsterdamTime(value) {
  if (!value) {
    return '--:--';
  }

  return new Intl.DateTimeFormat(DUTCH_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: AMSTERDAM_TIME_ZONE,
  }).format(new Date(value));
}

export function matchKickoff(match) {
  return match.kickoff_at_utc || match.kickoff_at_local;
}

export function statusLabel(status) {
  return {
    scheduled: 'Gepland',
    live: 'Live',
    upcoming: 'Komt eraan',
    completed: 'Afgelopen',
    none: 'Open',
    draft: 'Opgeslagen',
    locked: 'Vastgezet',
    closed: 'Gesloten',
  }[status] ?? status;
}

export function qualificationLabel(status) {
  return {
    qualified: 'Geplaatst',
    possible: 'Kansrijk',
    playoff: 'Playoff',
    undecided: 'Onbeslist',
    eliminated: 'Uitgeschakeld',
  }[status] ?? status;
}

export function stageLabel(stage) {
  return {
    'Group Stage': 'Groepsfase',
    'Rest Day': 'Rustdag',
    'Round of 32': 'Laatste 32',
    'Round of 16': 'Achtste finales',
    'Quarter-final': 'Kwartfinale',
    'Semi-final': 'Halve finale',
    'Third-place': 'Troostfinale',
    Final: 'Finale',
  }[stage] ?? stage;
}

export function groupLabel(value) {
  if (!value) {
    return 'Nog niet bekend';
  }

  return value.replace(/^Group /i, 'Groep ');
}

export function roundLabel(value) {
  if (!value) {
    return 'Nog niet bekend';
  }

  if (/^Group /i.test(value)) {
    return groupLabel(value);
  }

  return stageLabel(value);
}

export function displayTeamName(name) {
  if (!name) {
    return 'Nog niet bekend';
  }

  const translatedTeams = {
    Austria: 'Oostenrijk',
    Belgium: 'België',
    Brazil: 'Brazilië',
    'Cape Verde': 'Kaapverdië',
    Colombia: 'Colombia',
    Croatia: 'Kroatië',
    Czechia: 'Tsjechië',
    Ecuador: 'Ecuador',
    Egypt: 'Egypte',
    England: 'Engeland',
    France: 'Frankrijk',
    Germany: 'Duitsland',
    Haiti: 'Haïti',
    Iran: 'Iran',
    Iraq: 'Irak',
    Japan: 'Japan',
    Jordan: 'Jordanië',
    Mexico: 'Mexico',
    Morocco: 'Marokko',
    Netherlands: 'Nederland',
    'New Zealand': 'Nieuw-Zeeland',
    Norway: 'Noorwegen',
    Paraguay: 'Paraguay',
    Portugal: 'Portugal',
    Qatar: 'Qatar',
    'Saudi Arabia': 'Saoedi-Arabië',
    Scotland: 'Schotland',
    Senegal: 'Senegal',
    'South Africa': 'Zuid-Afrika',
    'South Korea': 'Zuid-Korea',
    Spain: 'Spanje',
    Sweden: 'Zweden',
    Switzerland: 'Zwitserland',
    Tunisia: 'Tunesië',
    Turkey: 'Turkije',
    'United States': 'Verenigde Staten',
    Uruguay: 'Uruguay',
    Uzbekistan: 'Oezbekistan',
    'Bosnia and Herzegovina': 'Bosnië en Herzegovina',
    "Côte d'Ivoire": 'Ivoorkust',
    Curaçao: 'Curaçao',
  };

  if (translatedTeams[name]) {
    return translatedTeams[name];
  }

  return name
    .replace(/^Winner Group /i, 'Winnaar groep ')
    .replace(/^Runner-up Group /i, 'Nummer 2 groep ')
    .replace(/^Best third-place team/i, 'Beste nummer 3')
    .replace(/^Winner Match /i, 'Winnaar wedstrijd ')
    .replace(/^Loser Match /i, 'Verliezer wedstrijd ');
}

export function goalDifference(value) {
  return value > 0 ? `+${value}` : String(value);
}

export function teamSlot(match, side) {
  const slot = side === 'home' ? match.home_team_slot : match.away_team_slot;
  const name = side === 'home' ? match.home_team_name : match.away_team_name;

  return slot || name?.slice(0, 3).toUpperCase() || 'NNB';
}

export function groupByDate(matches) {
  return matches.reduce((groups, match) => {
    const key = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: AMSTERDAM_TIME_ZONE,
    }).format(new Date(matchKickoff(match)));

    groups[key] = groups[key] || [];
    groups[key].push(match);

    return groups;
  }, {});
}

export function sortByKickoff(matches) {
  return [...matches].sort((left, right) => new Date(matchKickoff(left)) - new Date(matchKickoff(right)));
}

export function uniqueStages(matches) {
  return [...new Set(matches.map((match) => match.group_name || match.stage).filter(Boolean))];
}

export function isPredictable(match) {
  return match.status === 'upcoming' && !match.is_closed;
}

export function formatDaysUntilLock(days) {
  if (days <= 0) {
    return 'Sluit vandaag';
  }

  return `Nog ${days} ${days === 1 ? 'dag' : 'dagen'}`;
}

export function formatLockCountdown(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds || 0);
  const days = Math.floor(safeSeconds / 86400);
  const hours = Math.floor((safeSeconds % 86400) / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const segments = [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ];

  if (days > 0) {
    segments.unshift(String(days).padStart(2, '0'));
  }

  return segments.join(':');
}

export function getPredictionWindowState(predictionWindow, now = Date.now()) {
  if (!predictionWindow?.lock_at) {
    return {
      isLocked: Boolean(predictionWindow?.is_locked),
      daysLabel: 'Nog niet bekend',
      countdownLabel: null,
      lockAtLabel: 'Nog niet bekend',
    };
  }

  const lockAt = new Date(predictionWindow.lock_at);
  const secondsUntilLock = Math.max(0, Math.floor((lockAt.getTime() - now) / 1000));
  const isLocked = predictionWindow.is_locked || secondsUntilLock <= 0;

  return {
    isLocked,
    daysLabel: isLocked ? 'Vergrendeld' : formatDaysUntilLock(Math.ceil(secondsUntilLock / 86400)),
    countdownLabel: !isLocked && secondsUntilLock <= 72 * 3600 ? formatLockCountdown(secondsUntilLock) : null,
    lockAtLabel: formatAmsterdamDateTime(predictionWindow.lock_at, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

export function teamFlagUrl(team) {
  return team?.flag_url || team?.image_url || null;
}
