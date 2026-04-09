export function formatBoardDate(dateString) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${dateString}T12:00:00`));
}

export function formatMatchTime(dateTimeString, timeZone) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  }).format(new Date(dateTimeString));
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
