export default function MatchFilters({
  filters,
  cities,
  stages,
  onChange,
  onReset,
}) {
  function stageLabel(stage) {
    return {
      'Group Stage': 'Groepsfase',
      'Round of 32': 'Laatste 32',
      'Round of 16': 'Achtste finales',
      'Quarter-final': 'Kwartfinale',
      'Semi-final': 'Halve finale',
      'Third-place': 'Troostfinale',
      Final: 'Finale',
    }[stage] ?? stage;
  }

  return (
    <section className="filter-bar panel">
      <div className="filter-grid">
        <label>
          <span>Zoeken</span>
          <input
            name="search"
            placeholder="Team, stad, ronde..."
            value={filters.search}
            onChange={onChange}
          />
        </label>

        <label>
          <span>Ronde</span>
          <select name="stage" value={filters.stage} onChange={onChange}>
            <option value="">Alle rondes</option>
            {stages.map((stage) => (
              <option key={stage} value={stage}>
                {stageLabel(stage)}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Speelstad</span>
          <select name="city" value={filters.city} onChange={onChange}>
            <option value="">Alle speelsteden</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button className="button button-ghost" onClick={onReset} type="button">
        Filters resetten
      </button>
    </section>
  );
}
