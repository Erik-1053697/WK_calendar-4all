export const AMSTERDAM_TIME_ZONE = 'Europe/Amsterdam';

export function formatBoardDate(dateString) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${dateString}T12:00:00`));
}

export function formatBoardWeekday(dateString) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
  }).format(new Date(`${dateString}T12:00:00`));
}

export function formatBoardDay(dateString) {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
  }).format(new Date(`${dateString}T12:00:00`));
}

export function formatBoardMonth(dateString) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
  }).format(new Date(`${dateString}T12:00:00`));
}

export function formatMatchTime(dateTimeString, timeZone) {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone,
  }).format(new Date(dateTimeString));
}

export function formatAmsterdamMatchTime(dateTimeString) {
  return formatMatchTime(dateTimeString, AMSTERDAM_TIME_ZONE);
}

export function formatMatchDateTime(dateTimeString, timeZone) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  }).format(new Date(dateTimeString));
}

export function formatStatusLabel(status) {
  return {
    none: 'No pick',
    draft: 'Saved',
    locked: 'Locked',
    closed: 'Closed',
  }[status] ?? status;
}

export function abbreviateTeamName(name, maxLength = 18) {
  if (!name) {
    return 'TBD';
  }

  const replacements = [
    [/^Winner Group /i, 'W '],
    [/^Runner-up Group /i, 'RU '],
    [/^Best third-place team/i, 'Best 3rd team'],
    [/^Winner Match /i, 'W M'],
  ];

  let value = name;

  replacements.forEach(([pattern, replacement]) => {
    value = value.replace(pattern, replacement);
  });

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function compactTeamLabel(name) {
  if (!name) {
    return 'TBD';
  }

  if (/^Winner Match /i.test(name)) {
    return name.replace(/^Winner Match /i, 'W');
  }

  if (/^Loser Match /i.test(name)) {
    return name.replace(/^Loser Match /i, 'L');
  }

  if (/^Winner Group /i.test(name)) {
    return name.replace(/^Winner Group /i, '1');
  }

  if (/^Runner-up Group /i.test(name)) {
    return name.replace(/^Runner-up Group /i, '2');
  }

  if (/^Best third-place team/i.test(name)) {
    return '3RD';
  }

  const words = name
    .replace(/&/g, ' ')
    .replace(/[^A-Za-z0-9' -]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }

  return words
    .slice(0, 3)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export function formatStageRibbonLabel(stage) {
  return {
    'Group Stage': 'Group Stage',
    'Rest Day': 'Rest Days',
    'Round of 32': 'Round of 32',
    'Round of 16': 'Round of 16',
    'Quarter-final': 'Quarter-finals',
    'Semi-final': 'Semi-finals',
    'Third-place': 'Third Place',
    Final: 'Final',
  }[stage] ?? stage;
}

export function shortenStageLabel(stage) {
  return {
    'Group Stage': 'Groups',
    'Round of 32': 'R32',
    'Round of 16': 'R16',
    'Quarter-final': 'QF',
    'Semi-final': 'SF',
    'Third-place': '3P',
    Final: 'Final',
  }[stage] ?? stage;
}

function getTimeZoneParts(dateTimeString, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone,
  });

  return formatter
    .formatToParts(new Date(dateTimeString))
    .reduce((parts, part) => {
      if (part.type !== 'literal') {
        parts[part.type] = part.value;
      }

      return parts;
    }, {});
}

export function getAmsterdamDateKey(dateTimeString) {
  const parts = getTimeZoneParts(dateTimeString, AMSTERDAM_TIME_ZONE);

  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getAmsterdamHour(dateTimeString) {
  return Number(getTimeZoneParts(dateTimeString, AMSTERDAM_TIME_ZONE).hour);
}

export function getAmsterdamMinute(dateTimeString) {
  return Number(getTimeZoneParts(dateTimeString, AMSTERDAM_TIME_ZONE).minute);
}
