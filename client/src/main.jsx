import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from "react-redux"
import { store } from './app/store.js'
import { BrowserRouter } from 'react-router-dom'
import { PrivateChatProvider } from './context/PrivateChatContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store={store}>
      <PrivateChatProvider>
        <StrictMode>
          <App />
        </StrictMode>
      </PrivateChatProvider>
    </Provider>
  </BrowserRouter>
);
 
