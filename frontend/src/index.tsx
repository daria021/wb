import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BootstrapProvider} from "./contexts/bootstrap";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <BootstrapProvider>
            <App/>
        </BootstrapProvider>
    </React.StrictMode>
);

reportWebVitals();
