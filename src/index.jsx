import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';

import { Provider } from 'react-redux';

import './index.css';
import App from './App';
import { store } from './redux/store';
import { ThemeProvider } from "@material-tailwind/react";


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <Router >
        <ThemeProvider>
            <App />
        </ThemeProvider>
      </Router>
    </Provider>
  </React.StrictMode>,
);
