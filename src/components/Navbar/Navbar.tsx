import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';


export default function Navbar() {
return (
<nav className={styles.nav}>
<div className={styles.brand}>PokeDex by rohithj2</div>
<br/>
<NavLink to="/" end className={({isActive}) => isActive ? `${styles.link} ${styles.active}` : styles.link}>List</NavLink>
<NavLink to="/gallery" className={({isActive}) => isActive ? `${styles.link} ${styles.active}` : styles.link}>Gallery</NavLink>
<div className={styles.spacer} />
<a href="https://pokeapi.co/" target="_blank" rel="noreferrer" className={styles.link}>API</a>
</nav>
);
}