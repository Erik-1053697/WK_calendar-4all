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
