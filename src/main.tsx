import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {App} from './App';
import './styles/styles.css';
import './styles/games.css';
import './styles/motion.css';
import './styles/transitions.css';
import './styles/models.css';

createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>);
