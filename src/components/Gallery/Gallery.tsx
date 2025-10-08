import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPokemon, fetchPokemonPage, fetchTypes } from '../../api/pokeapi';
import { Pokemon } from '../../types';
import Chip from '../UI/Chip';
import Spinner from '../UI/Spinner';
import styles from './Gallery.module.css';

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

export default function Gallery() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [all, setAll] = useState<Pokemon[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [active, setActive] = useState<string[]>([]);

  // guard for StrictMode double-effect (dev only)
  const did = useRef(false);

  useEffect(() => {
    if (did.current) return;
    did.current = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [page, typeRes] = await Promise.all([
          fetchPokemonPage(0, 151),
          fetchTypes(),
        ]);

        const detailed = await inBatches(page.results, 25, async (p) => {
          await sleep(15);
          return fetchPokemon(p.name);
        });

        setAll(detailed);
        setTypes(typeRes.results.map(t => t.name).filter(n => !['shadow', 'unknown'].includes(n)));
      } catch (e: any) {
        setError('Failed to load gallery.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!active.length) return all;
    return all.filter(p => {
      const set = new Set(p.types.map(t => t.type.name));
      return active.every(a => set.has(a));
    });
  }, [all, active]);

  if (loading) return <Spinner />;
  if (error) return <div role="alert">{error}</div>;

  const idParam = filtered.map(p => p.id).join(',');

  return (
    <div className={styles.wrap}>
      <h1>Gallery View</h1>

      <div className={styles.filters}>
        {types.map(t => (
          <Chip
            key={t}
            label={t}
            active={active.includes(t)}
            onClick={() =>
              setActive(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
            }
          />
        ))}
        {!!active.length && <Chip label="Clear" onClick={() => setActive([])} />}
      </div>

      <div className={styles.grid}>
        {filtered.map(p => {
          const art = p.sprites.other?.['official-artwork']?.front_default;
          return (
            <Link key={p.id} to={`/pokemon/${p.id}?ids=${idParam}`} className={styles.card}>
              <img className={styles.img} src={art ?? ''} alt={p.name} />
              <br />
              <div className={styles.title}>#{p.id} {p.name}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
