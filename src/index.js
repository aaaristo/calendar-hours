import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import State from './State';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import api from './api';

const handleUnexpectedError = (err) => {
    console.log('unexpected error', err);
    alert('something went wrong');
};

const handleStateChange = async ({ calendar_id, from, to }) => {
    if (!calendar_id) return;

    const events = await api.fetchCalendarEvents(calendar_id, from, to);

    return { events };
};

const bootstrap = async () => {
    let calendars = [];

    if (api.isAuthenticated()) {
        calendars = await api.fetchCalendars();
    }

    ReactDOM.render(
        <State
            initialState={{ calendars }}
            handleChange={handleStateChange}
            app={App}
            api={api}
        />,
        document.getElementById('root')
    );

    registerServiceWorker();
};

bootstrap().catch(handleUnexpectedError);
