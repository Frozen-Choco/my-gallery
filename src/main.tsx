import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {App} from './App';
import './styles/styles.css';
import './styles/brand.css';
import './styles/games.css';
import './styles/motion.css';
import './styles/transitions.css';
import './styles/models.css';

import './styles/personal.css';
import './styles/theme.css';
import './styles/navigation.css';

createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>);
