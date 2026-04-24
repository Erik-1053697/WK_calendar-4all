import clsx from 'clsx';
import { Fragment, useMemo } from 'react';
import MatchCard from './MatchCard.jsx';
import {
  formatBoardDay,
  formatBoardMonth,
  formatBoardWeekday,
  getAmsterdamDateKey,
  getAmsterdamHour,
  getAmsterdamMinute,
} from '../../utils/formatters';

const DATE_LABEL_WIDTH = 124;
const TIME_COLUMN_WIDTH = 76;
const HEADER_ROW_HEIGHT = 56;
const TIME_SLOTS = Array.from({ length: 24 }, (_, hour) => hour);

function toMidday(dateString) {
  return new Date(`${dateString}T12:00:00`);
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function buildDateRange(dates) {
  if (!dates.length) {
    return [];
  }

  const range = [];
  const current = toMidday(dates[0]);
  const end = toMidday(dates[dates.length - 1]);

  while (current <= end) {
    range.push(toIsoDate(current));
    current.setDate(current.getDate() + 1);
  }

  return range;
}

function formatHourLabel(hour) {
  return `${String(hour).padStart(2, '0')}:00`;
}

export default function MatchBoard({ matches, onSelect }) {
  const boardMatches = useMemo(
    () =>
      matches.map((match) => {
        const kickoffReference = match.kickoff_at_utc || match.kickoff_at_local;

        return {
          ...match,
          amsterdamDate: getAmsterdamDateKey(kickoffReference),
          amsterdamHour: getAmsterdamHour(kickoffReference),
          amsterdamMinute: getAmsterdamMinute(kickoffReference),
        };
      }),
    [matches],
  );

  const matchesByCell = useMemo(() => {
    const map = new Map();

    boardMatches.forEach((match) => {
      const key = `${match.amsterdamDate}:${match.amsterdamHour}`;
      const cellMatches = map.get(key) || [];
      cellMatches.push(match);
      cellMatches.sort(
        (left, right) => left.amsterdamMinute - right.amsterdamMinute || left.match_order - right.match_order,
      );
      map.set(key, cellMatches);
    });

    return map;
  }, [boardMatches]);

  const matchesByDate = useMemo(() => {
    const map = new Map();

    boardMatches.forEach((match) => {
      const dateMatches = map.get(match.amsterdamDate) || [];
      dateMatches.push(match);
      map.set(match.amsterdamDate, dateMatches);
    });

    return map;
  }, [boardMatches]);

  const boardDates = useMemo(() => {
    const dates = [...new Set(boardMatches.map((match) => match.amsterdamDate))].sort();

    return buildDateRange(dates);
  }, [boardMatches]);

  return (
    <section className="schedule-board schedule-board--timeline">
      <div className="schedule-board__viewport">
        <div
          className="schedule-timeline"
          style={{
            gridTemplateColumns: `${DATE_LABEL_WIDTH}px repeat(${TIME_SLOTS.length}, ${TIME_COLUMN_WIDTH}px)`,
            gridTemplateRows: `${HEADER_ROW_HEIGHT}px repeat(${boardDates.length}, minmax(82px, auto))`,
          }}
        >
          <div className="schedule-axis-corner">
            <p className="eyebrow">Amsterdam</p>
            <strong>Datum</strong>
          </div>

          {TIME_SLOTS.map((hour) => (
            <div className="time-column-header" key={hour}>
              <strong>{formatHourLabel(hour)}</strong>
            </div>
          ))}

          {boardDates.map((date) => {
            const dateMatches = matchesByDate.get(date) || [];
            const isRestDay = dateMatches.length === 0;

            return (
              <Fragment key={date}>
                <div className={clsx('schedule-date-label', { 'is-rest': isRestDay })}>
                  <span>{formatBoardWeekday(date)}</span>
                  <strong>{formatBoardDay(date)}</strong>
                  <small>{formatBoardMonth(date)}</small>
                </div>

                {TIME_SLOTS.map((hour) => {
                  const cellMatches = matchesByCell.get(`${date}:${hour}`) || [];

                  return (
                    <div className={clsx('schedule-time-cell', { 'is-rest': isRestDay })} key={`${date}-${hour}`}>
                      {cellMatches.map((match) => (
                        <MatchCard key={match.id} match={match} onSelect={onSelect} />
                      ))}
                    </div>
                  );
                })}
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
