import { useRoutes } from 'react-router-dom';
import routes from './routes';
import styles from './styles/globals.module.css';
import Navbar from './components/Navbar/Navbar';


export default function App() {
const element = useRoutes(routes);
return (
<div>
<Navbar />
<main style={{ maxWidth: 1200, margin: '0 auto', padding: '1rem' }}>
{element}
</main>
<footer style={{ textAlign: 'center', padding: '2rem 0', opacity: 0.7 }}>
Data from <a href="https://pokeapi.co/" target="_blank" rel="noreferrer">PokéAPI</a>
</footer>
</div>
);
}