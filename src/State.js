import React, { Component } from 'react';

class State extends Component {

    constructor(...args) {
        super(...args);
        this.state = args[0].initialState;
    }

    handleChange = ({ id, value }) => {
        this.setState({ [id]: value });
    }

    shouldComponentUpdate = (nextProps, nextState) => {
        const { handleChange } = nextProps;

        handleChange(nextState, this.state).then((changes) => {
            if (changes && Object.keys(changes).length) {
                this.setState(changes);
            }
        }, (err) => {
            console.log('got error State.handleChange', err);
        });

        return true;
    }

    render() {
        const { app: App, handleChange, ...others } = this.props;
        console.log('state', this.state);
        return (
            <App
                state={this.state}
                onChange={this.handleChange}
                {...others}
            />
        );
    }
}

export default State;
