import { RouteObject } from 'react-router-dom';
import SearchList from './components/SearchList/SearchList';
import Gallery from './components/Gallery/Gallery';
import Detail from './components/Detail/Detail';


const routes: RouteObject[] = [
{ path: '/', element: <SearchList /> },
{ path: '/gallery', element: <Gallery /> },
{ path: '/pokemon/:id', element: <Detail /> },
{ path: '*', element: <div>Not Found</div> },
];


export default routes;