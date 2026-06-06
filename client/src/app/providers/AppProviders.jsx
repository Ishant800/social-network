import { StrictMode } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '@/app/store';
import { PrivateChatProvider } from '@/context/PrivateChatContext';

export default function AppProviders({ children }) {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <PrivateChatProvider>
          <StrictMode>{children}</StrictMode>
        </PrivateChatProvider>
      </Provider>
    </BrowserRouter>
  );
}
