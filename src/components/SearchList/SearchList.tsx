import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPokemon, fetchPokemonPage } from '../../api/pokeapi';
import { Pokemon } from '../../types';
import useDebounce from '../../hooks/useDebounce';
import SortControls from '../UI/SortControls';
import Spinner from '../UI/Spinner';
import styles from './SearchList.module.css';

// helpers
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
async function inBatches<T, R>(
  items: T[],
  batchSize: number,
  worker: (item: T, index: number) => Promise<R>,
  pauseMs = 150
) {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const settled = await Promise.allSettled(
      batch.map((item, j) => worker(item, i + j))
    );
    for (const r of settled) if (r.status === 'fulfilled') out.push(r.value);
    if (i + batchSize < items.length) await sleep(pauseMs);
  }
  return out;
}

export default function SearchList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [all, setAll] = useState<Pokemon[]>([]);

  // UI state
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 150);
  const [sortKey, setSortKey] = useState<'name' | 'id' | 'base_experience'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // guard for StrictMode double-effect (dev only)
  const did = useRef(false);

  useEffect(() => {
    if (did.current) return;
    did.current = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // First 151 for speed
        const page = await fetchPokemonPage(0, 151);

        const detailed = await inBatches(page.results, 25, async (p) => {
          // slight stagger inside batch
          await sleep(15);
          return fetchPokemon(p.name);
        });

        if (!detailed.length) {
          throw new Error('No Pokémon loaded');
        }
        setAll(detailed);
      } catch (e: any) {
        setError('Failed to load Pokémon list. Try again or use mock data.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    let out = all.filter(p => p.name.includes(q) || String(p.id).includes(q));
    out.sort((a, b) => {
      if (sortKey === 'name') {
        const cmp = a.name.localeCompare(b.name);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      const av = sortKey === 'id' ? a.id : a.base_experience;
      const bv = sortKey === 'id' ? b.id : b.base_experience;
      const cmp = av - bv;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return out;
  }, [all, debounced, sortKey, sortDir]);

  if (loading) return <Spinner />;
  if (error) return <div role="alert">{error}</div>;

  const idParam = filtered.map(p => p.id).join(',');

  return (
    <div className={styles.wrap}>
      <h1>List View</h1>
      <div className={styles.controls}>
        <input
          className={styles.search}
          placeholder="Search by name or ID..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <SortControls
          sortKey={sortKey}
          setSortKey={setSortKey}
          sortDir={sortDir}
          setSortDir={setSortDir}
          showBaseExp
        />
      </div>

      <div className={styles.grid}>
        {filtered.map(p => {
          const art = p.sprites.other?.['official-artwork']?.front_default;
          return (
            <Link key={p.id} to={`/pokemon/${p.id}?ids=${idParam}`} className={styles.card}>
              <img className={styles.thumb} src={art ?? ''} alt={`${p.name} artwork`} />
              <div className={styles.title}>#{p.id} {p.name}</div>
              <div className={styles.row}>
                <span className={styles.badge}>EXP {p.base_experience}</span>
                <div>
                  {p.types.map(t => (
                    <span key={t.type.name} className={styles.badge}>{t.type.name}</span>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
