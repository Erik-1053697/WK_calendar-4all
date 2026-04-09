import { Fragment, useMemo } from 'react';
import MatchCard from './MatchCard.jsx';
import { formatBoardDate } from '../../utils/formatters';

export default function MatchBoard({ dates, venues, matches, onSelect }) {
  const matchesByCell = useMemo(() => {
    const map = new Map();

    matches.forEach((match) => {
      const key = `${match.venue.id}:${match.match_date}`;
      const cellMatches = map.get(key) || [];
      cellMatches.push(match);
      cellMatches.sort(
        (left, right) => new Date(left.kickoff_at_local).getTime() - new Date(right.kickoff_at_local).getTime(),
      );
      map.set(key, cellMatches);
    });

    return map;
  }, [matches]);

  return (
    <section className="schedule-board panel">
      <div className="schedule-board__header">
        <div>
          <p className="eyebrow">Official Schedule Board</p>
          <h2>Venue by date calendar</h2>
        </div>
        <p className="muted">
          Every fixture is positioned by its host market and local kickoff date. Tap any tile to save or lock a pick.
        </p>
      </div>

      <div className="schedule-scroll">
        <div
          className="schedule-grid"
          style={{ gridTemplateColumns: `260px repeat(${dates.length}, minmax(230px, 1fr))` }}
        >
          <div className="schedule-corner">
            <p className="eyebrow">Host market</p>
            <strong>Local match date</strong>
          </div>

          {dates.map((date) => (
            <div className="date-column-header" key={date}>
              <span>{formatBoardDate(date)}</span>
              <strong>{date}</strong>
            </div>
          ))}

          {venues.map((venue) => (
            <Fragment key={venue.id}>
              <div className="venue-row-header">
                <p>{venue.host_market}</p>
                <strong>{venue.stadium_name}</strong>
                <span>
                  {venue.city}, {venue.country}
                </span>
              </div>

              {dates.map((date) => {
                const cellMatches = matchesByCell.get(`${venue.id}:${date}`) || [];

                return (
                  <div className="schedule-cell" key={`${venue.id}-${date}`}>
                    {cellMatches.map((match) => (
                      <MatchCard key={match.id} match={match} onSelect={onSelect} />
                    ))}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
