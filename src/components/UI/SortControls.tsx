import './SortControls.css';
import React from 'react';

type SortKey = 'name' | 'id' | 'base_experience';

type Props = {
  sortKey: SortKey;
  setSortKey: (k: SortKey) => void;
  sortDir: 'asc' | 'desc';
  setSortDir: (d: 'asc' | 'desc') => void;
  showBaseExp?: boolean;
};

export default function SortControls({
  sortKey,
  setSortKey,
  sortDir,
  setSortDir,
  showBaseExp,
}: Props) {
  return (
    <div className="sort-controls">
      <label>
        Sort by:{' '}
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
        >
          <option value="name">Name</option>
          <option value="id">ID</option>
          {showBaseExp && <option value="base_experience">Base Exp</option>}
        </select>
      </label>

      <label>
        Order:{' '}
        <select
          value={sortDir}
          onChange={(e) =>
            setSortDir(e.target.value as 'asc' | 'desc')
          }
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </label>
    </div>
  );
}
