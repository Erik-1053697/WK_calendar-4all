export default function MatchFilters({
  filters,
  cities,
  stages,
  onChange,
  onReset,
}) {
  return (
    <section className="filter-bar panel">
      <div className="filter-grid">
        <label>
          <span>Search</span>
          <input
            name="search"
            placeholder="Team, city, stage..."
            value={filters.search}
            onChange={onChange}
          />
        </label>

        <label>
          <span>Stage</span>
          <select name="stage" value={filters.stage} onChange={onChange}>
            <option value="">All stages</option>
            {stages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Host market</span>
          <select name="city" value={filters.city} onChange={onChange}>
            <option value="">All host markets</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button className="button button-ghost" onClick={onReset} type="button">
        Reset filters
      </button>
    </section>
  );
}
