import { setupIonicReact } from '@ionic/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { createShoppingListService } from './app/create-services';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';
import './theme/variables.css';

setupIonicReact();

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found in index.html.');
}

createRoot(container).render(
  <StrictMode>
    <App shoppingListService={createShoppingListService()} />
  </StrictMode>,
);
