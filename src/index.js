import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import State from './State';
import registerServiceWorker from './registerServiceWorker';
import moment from 'moment';
import * as api from './api';
import './index.css';

const handleUnexpectedError = (err) => {
    console.log('unexpected error', err);
    alert('something went wrong');
};

const handleStateChange = async ({ calendar_id, from, to }, { calendar_id: previous_calendar_id }) => {
    if (!calendar_id || previous_calendar_id === calendar_id) return;

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
            initialState={{
                calendars,
                from: moment().startOf('isoweek').toISOString(),
                to: moment().toISOString(),
            }}
            handleChange={handleStateChange}
            app={App}
            api={api}
        />,
        document.getElementById('root')
    );

    registerServiceWorker();
};

bootstrap().catch(handleUnexpectedError);
