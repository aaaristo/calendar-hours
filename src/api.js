import { sortBy } from 'underscore';

const GOOGLE_OAUTH_CLIENT_ID = '926248487871-4l26d98gnc9p5623vj1hovgpulclvlr8.apps.googleusercontent.com';

const parseAuthInfo = (location) => {
    const { hash } = location;
    const pars = hash ? hash.substring(1).split('&') : [];

    const token = {};

    for (const par of pars) {
        const [key, value] = par.split('=');
        token[key] = value;
    }

    return token;
};

const endpoint = (url) => {
    return 'https://www.googleapis.com/calendar/v3' + url + (
        url.indexOf('?') > -1 ?
        '&' :
        '?'
    ) + 'access_token=' + access_token;
};

const {
    access_token,
} = parseAuthInfo(window.location);

export const isAuthenticated = () => !!access_token;

export const authenticate = () => {
     var clientId = GOOGLE_OAUTH_CLIENT_ID,
         callbackUrl = (
             window.location.origin.indexOf('github.io') > -1 ?
             window.location.origin + '/calendar-hours/' :
             window.location.origin
         ),
         scope = "https://www.googleapis.com/auth/calendar.readonly",
         reqUrl = "https://accounts.google.com/o/oauth2/auth?client_id="+clientId+"&redirect_uri="+callbackUrl+"&scope="+scope+"&response_type=token";

     window.location = reqUrl;
};

export const fetchCalendars = async () => {
    const response = await fetch(endpoint('/users/me/calendarList'), { mode: 'cors' });
    return sortBy((await response.json()).items, 'summary');
};

export const fetchCalendarEvents = async (calendar_id, from, to) => {
    const response = await fetch(endpoint(`/calendars/${calendar_id}/events?singleEvents=true&timeMin=${from}&timeMax=${to}`), { mode: `cors` });
    return sortBy((await response.json()).items, 'summary');
};
