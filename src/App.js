import React, { Component } from 'react';
import {
    Accordion,
    Button,
    FormControl,
    FormGroup,
    Grid,
    Row,
    Col,
    Panel,
    Table,
} from 'react-bootstrap';

import {
    sortBy,
    extend,
    groupBy,
    reduce,
    keys,
} from 'underscore';

import './App.css';

import moment from 'moment';
import 'moment/locale/it';
moment.locale('it');

const GOOGLE_OAUTH_CLIENT_ID = '926248487871-4l26d98gnc9p5623vj1hovgpulclvlr8.apps.googleusercontent.com';

class App extends Component {

  state = {
      from: moment().startOf('week').toISOString(),
      to: moment().endOf('week').toISOString(),
  };

  parseToken = () => {
      const { hash } = window.location;
      const pars = hash ? hash.substring(1).split('&') : [];

      const token = {};

      for (const par of pars) {
          const [key, value] = par.split('=');

          token[key] = value;
      }

      return token;
  }

  authenticate = () => {
     var clientId = GOOGLE_OAUTH_CLIENT_ID,
         callbackUrl = window.location.origin,
         scope = "https://www.googleapis.com/auth/calendar.readonly",
         reqUrl = "https://accounts.google.com/o/oauth2/auth?client_id="+clientId+"&redirect_uri="+callbackUrl+"&scope="+scope+"&response_type=token";

     window.location = reqUrl;
  }

  googleAPI = (url) => {
      return url + (
          url.indexOf('?') > -1 ?
          '&' :
          '?'
      ) + 'access_token=' + this.token.access_token;
  }

  fetchCalendars = async () => {
      const response = await fetch(this.googleAPI('https://www.googleapis.com/calendar/v3/users/me/calendarList'), { mode: `cors` });
      let calendars = sortBy((await response.json()).items, 'summary');
      this.setState({ calendars });
  }

  fetchCalendarEvents = async (changes) => {
      this.setState({ events: [] });
      const { calendar_id, from, to } = extend({}, this.state, changes);

      if (!calendar_id) return;

      const response = await fetch(this.googleAPI(`https://www.googleapis.com/calendar/v3/calendars/${calendar_id}/events?singleEvents=true&timeMin=${from}&timeMax=${to}`), { mode: `cors` });
      let events = sortBy((await response.json()).items, 'summary');
      this.setState({ events });
      console.log('events', events);
  }

  handleSelectCalendar = ({ target: { value: calendar_id } }) => {
      this.setState({ calendar_id });
      this.fetchCalendarEvents({ calendar_id });
  }

  handleSelectDate = ({ target: { id, value } }) => {
      console.log('handleSelectDate', id, value);
      this.setState({ [id]: moment(value).toISOString() });
      this.fetchCalendarEvents({ [id]: value });
  }

  componentWillMount() {
      const token = this.token = this.parseToken();

      console.log('token', token);

      if (token) {
          this.fetchCalendars();
      }
  }

  renderConnect = () => {
      return (
          <p className="App-intro">
            <Button
                bsStyle="primary"
                bsSize="large"
                onClick={this.authenticate}
            >Connect to Google Calendar</Button>
          </p>
      );
  }

  renderCalendars = () => {
      const { calendars, calendar_id } = this.state;

      console.log('calenadars', calendars);

      return (
          <FormGroup
              controlId="calendars"
          >
            <FormControl
                componentClass="select"
                value={calendar_id}
                onChange={this.handleSelectCalendar}
            >
              <option value="">- select calendar -</option>
              {calendars.map(({ id, summary }, i) => (
                  <option key={i} value={id}>{summary}</option>
              ))}
            </FormControl>
          </FormGroup>
      );
  }

  renderDate = (id) => {
      const value = this.state[id];

      console.log('renderDate', id, value);

      return (
          <FormGroup
              controlId={id}
          >
              <FormControl
                  type="date"
                  value={moment(value).format('YYYY-MM-DD')}
                  placeholder={id}
                  onChange={this.handleSelectDate}
              />
          </FormGroup>
      );
  }

  durationAsHours = ({ start, end }) => (
      Math.round(((moment(end.dateTime).unix() - moment(start.dateTime).unix()) / 3600) * 100) / 100
  )

  renderEvent = (event) => {
      return (
          <tr>
              <td>{moment(event.start.dateTime).format('LLL')}</td>
              <td>{moment(event.end.dateTime).format('LLL')}</td>
              <td>{this.durationAsHours(event)}</td>
              <td>{event.description}</td>
          </tr>
      );
  }

  renderGroup = ({ summary, hours, events }, i) => {
      const header = (
          <div>
              <span style={{ cursor: 'pointer' }}>{summary}</span>
              <span className="pull-right">{hours}h</span>
          </div>
      );
      return (
          <Panel header={header} eventKey={i} key={i}>
              <Table striped>
                  <thead>
                      <tr>
                          <th>Start</th>
                          <th>End</th>
                          <th>Hours</th>
                          <th>Description</th>
                      </tr>
                  </thead>
                  <tbody>
                      {events.map(this.renderEvent)}
                  </tbody>
              </Table>
          </Panel>
      );
  }

  renderEvents = () => {
      const { events } = this.state;

      const bySummary = groupBy(events, 'summary');

      let groups = [];

      console.log('bySummary', bySummary);

      for (const summary of keys(bySummary)) {
          const events = bySummary[summary];
          groups.push({
              summary,
              hours: reduce(events, (hours, event) => (
                  hours + this.durationAsHours(event)
              ), 0),
              events,
          });
      }

      groups = sortBy(groups, ({ hours }) => -hours);

      return (
          <div id="event-list">
              <Accordion>
                  {groups.map(this.renderGroup)}
              </Accordion>
          </div>
      );
  }

  renderHours = () => {
      let content;

      const { calendars, events } = this.state;

      if (calendars) {
          content = (
              <div>
                  <Row>
                      <Col md={12}>
                          {this.renderCalendars()}
                      </Col>
                  </Row>
                  <Row>
                      <Col md={6}>
                          {this.renderDate('from')}
                      </Col>
                      <Col md={6}>
                          {this.renderDate('to')}
                      </Col>
                  </Row>
                  <Row>
                      <Col md={12}>
                          {events && events.length &&
                          this.renderEvents()}
                      </Col>
                  </Row>
              </div>
          );
      } else {
          content = 'Loading calendars...';
      }

      return (
          <div className="App-intro">
              {content}
          </div>
      );
  }

  render() {
      let content = (
          this.token.access_token ?
          this.renderHours() :
          this.renderConnect()
      );

      return (
          <Grid>
              {content}
          </Grid>
      );
  }
}

export default App;
