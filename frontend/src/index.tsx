import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BootstrapProvider} from "./contexts/bootstrap";
import {AuthProvider} from "./contexts/auth";
import {UserProvider} from "./contexts/user";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <UserProvider>

            <AuthProvider>
                <BootstrapProvider>
                    <App/>
                </BootstrapProvider>
            </AuthProvider>
        </UserProvider>

    </React.StrictMode>
);

reportWebVitals();
