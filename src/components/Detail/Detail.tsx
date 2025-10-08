// src/components/Detail/Detail.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
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


  // guard StrictMode double effect (dev)
  const did = useRef(false);

  useEffect(() => {
    if (did.current) return;
    did.current = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const p = await fetchPokemon(id!);
        setData(p);
      } catch (e) {
        setError('Failed to load Pokémon.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const { prevId, nextId } = useMemo(() => {
    const current = Number(id);
    if (!idList || idList.length === 0) {
      return { prevId: Math.max(1, current - 1), nextId: current + 1 };
    }
    const idx = idList.indexOf(current);
    const prevId = idList[Math.max(0, idx - 1)] ?? current;
    const nextId = idList[Math.min(idList.length - 1, idx + 1)] ?? current;
    return { prevId, nextId };
  }, [id, idList]);

  if (loading) return <Spinner />;
  if (error || !data) return <div role="alert">{error ?? 'Not found'}</div>;

  const art = data.sprites.other?.['official-artwork']?.front_default;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <img className={styles.img} src={art ?? ''} alt={data.name} />
        <div>
          <div className={styles.title}>#{data.id} {data.name}</div>
          <br/>
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
            <Link
              className={styles.btn}
              to={`/pokemon/${prevId}${idsParam ? `?ids=${idsParam}` : ''}`}
            >
              ⟵ Previous
            </Link>
            <br/>
            <Link
              className={styles.btn}
              to={`/pokemon/${nextId}${idsParam ? `?ids=${idsParam}` : ''}`}
            >
              Next ⟶
            </Link>
          </div>
        </div>
      </div>

      <section>
        <h2>Stats</h2>
        <div className={styles.stats}>
          {data.stats.map(s => (
            <div key={s.stat.name} className={styles.stat}>
              <strong style={{ textTransform: 'capitalize' }}>{s.stat.name}</strong>
              <br/>
              <div>Base: {s.base_stat}</div>
              <br/>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
