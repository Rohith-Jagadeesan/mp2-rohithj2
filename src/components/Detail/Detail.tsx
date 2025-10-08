// src/components/Detail/Detail.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { fetchPokemon } from '../../api/pokeapi';
import type { Pokemon } from '../../types';
import Spinner from '../UI/Spinner';
import styles from './Detail.module.css';

export default function Detail() {
  const { id } = useParams();
  const [search] = useSearchParams();
  const idsParam = search.get('ids');

  const idList = useMemo(
    () => (idsParam ? idsParam.split(',').map(Number).filter(Boolean) : null),
    [idsParam]
  );

  const [data, setData] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const p = await fetchPokemon(id!);
        if (!cancelled) setData(p);
      } catch {
        if (!cancelled) setError('Failed to load Pokémon.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const { prevId, nextId } = useMemo(() => {
    const current = Number(id);
    if (!idList || idList.length === 0) {
      return { prevId: Math.max(1, current - 1), nextId: current + 1 };
    }
    const idx = idList.indexOf(current);
    if (idx === -1) {
      // if current isn't in the list, fall back to closest in list
      const closest = idList.reduce((a, b) =>
        Math.abs(b - current) < Math.abs(a - current) ? b : a
      , idList[0]);
      const cIdx = idList.indexOf(closest);
      return {
        prevId: idList[Math.max(0, cIdx - 1)] ?? closest,
        nextId: idList[Math.min(idList.length - 1, cIdx + 1)] ?? closest,
      };
    }
    return {
      prevId: idList[Math.max(0, idx - 1)] ?? current,
      nextId: idList[Math.min(idList.length - 1, idx + 1)] ?? current,
    };
  }, [id, idList]);

  if (loading) return <Spinner />;
  if (error || !data) return <div role="alert">{error ?? 'Not found'}</div>;

  const art = data.sprites.other?.['official-artwork']?.front_default;
  const idsSuffix = idsParam ? `?ids=${idsParam}` : '';

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <img className={styles.img} src={art ?? ''} alt={data.name} />
        <div>
          <div className={styles.title}>#{data.id} {data.name}</div>
          <div className={styles.row}>
            {data.types.map(t => (
              <span key={t.type.name} className={styles.badge}>{t.type.name}</span>
            ))}
          </div>
          <br/>
          <div className={styles.row}>
            <span className={styles.badge}>Height: {data.height}</span>
            <span className={styles.badge}>Weight: {data.weight}</span>
            <span className={styles.badge}>Base EXP: {data.base_experience}</span>
          </div>
<br/>
          <div className={styles.nav}>
            {/* IMPORTANT: no leading space before /pokemon */}
            <br/>
            <Link className={styles.btn} to={`/pokemon/${prevId}${idsSuffix}`}>⟵ Previous</Link><br/>
            <Link className={styles.btn} to={`/pokemon/${nextId}${idsSuffix}`}>Next ⟶</Link><br/>
          </div>
        </div>
      </div>

      <section>
        <h2>Stats</h2>
        <div className={styles.stats}>
          {data.stats.map(s => (
            <div key={s.stat.name} className={styles.stat}>
              <strong style={{ textTransform: 'capitalize' }}>{s.stat.name}</strong>
              <div>Base: {s.base_stat}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
