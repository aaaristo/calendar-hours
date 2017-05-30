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

const durationAsHours = ({ start, end }) => (
    Math.round(((
        moment(end.dateTime).unix() -
        moment(start.dateTime).unix()
    ) / 3600) * 100) / 100
);

const EventGroup = ({ summary, hours, events }) => {
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
                    {events.map((event, i) => (
                        <tr key={i}>
                            <td>{moment(event.start.dateTime).format('LLL')}</td>
                            <td>{moment(event.end.dateTime).format('LLL')}</td>
                            <td>{this.durationAsHours(event)}</td>
                            <td>{event.description}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Panel>
    );
};

const Events = ({ events }) => {
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
                {groups.map((group, i) => (
                    <EventGroup
                        key={i}
                        {...group}
                    />
                ))}
            </Accordion>
        </div>
    );
};

const SelectDate = ({ id, value, onChange }) => (
    <FormGroup
        controlId={id}
    >
        <FormControl
            type="date"
            value={moment(value).format('YYYY-MM-DD')}
            placeholder={id}
            onChange={({ target }) => onChange(target)}
        />
    </FormGroup>
);

const SelectCalendar = ({ calendars, calendar_id, onChange }) => (
    <FormGroup
        controlId="calendars"
    >
      <FormControl
          componentClass="select"
          value={calendar_id}
          onChange={({ target }) => onChange(target)}
      >
        <option value="">- select calendar -</option>
        {calendars.map(({ id, summary }, i) => (
            <option key={i} value={id}>{summary}</option>
        ))}
      </FormControl>
    </FormGroup>
);

const Home = ({ onChange }) => {
    let content;

    const { calendars, events, calendar_id } = this.state;

    if (calendars) {
        content = (
            <div>
                <Row>
                    <Col md={12}>
                        <SelectCalendar
                            calendars={calendars}
                            calendar_id={calendar_id}
                            onChange={onChange}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col md={6}>
                        <SelectDate
                            id="from"
                            value={from}
                            onChange={onChange}
                        />
                    </Col>
                    <Col md={6}>
                        <SelectDate
                            id="to"
                            value={to}
                            onChange={onChange}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col md={12}>
                        {events && events.length && <Events events={events}/>}
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
};

const Login = ({ api }) => (
    <p className="App-intro">
      <Button
          bsStyle="primary"
          bsSize="large"
          onClick={() => api.authenticate()}
      >Connect to Google Calendar</Button>
    </p>
);

const App = ({ api, onChange }) => (
    <Grid>
        {(
            api.isAuthenticated() ?
            <Home onChange={onChange}/> :
            <Login api={api}/>
        )}
    </Grid>
);

export default App;
