import React, { Component } from 'react';
import _ from 'lodash';
import { Form, Button, Label, Input } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { withApollo } from 'react-apollo';
import DayPicker from 'react-day-picker';

import { isInputNaturalNumber } from '../lib/helpers';

class SearchForm extends Component {
  state = {
    locations: [],
    from: '',
    fromSuggestions: [],
    fromError: '',
    to: '',
    toSuggestions: [],
    toError: '',
    date: '',
    showDayPicker: false,
    dateError: '',
  };

  search = async (e) => {
    e.preventDefault();

    const { searchTerm } = this.state;

    if (searchTerm && isInputNaturalNumber(searchTerm)) {
      const result = await this.props.client.query({
        query: firstLocations,
        variables: { first: searchTerm },
      });

      console.log(result);
    }
  };

  async getLocationSuggestions(input) {
    try {
      const result = await this.props.client.query({
        query: allLocations,
        variables: { search: input },
      });

      return result.data.allLocations.edges.map(edge => edge.node.name);
    } catch (error) {
      return [ 'no results for your query' ];
    }
  }

  showFromSuggestions = _.debounce(async input => {
    const suggestions = await this.getLocationSuggestions(input);

    this.setState({ fromSuggestions: suggestions });
  }, 200);

  onFromInputChange = (e) => {
    const fromInput = e.target.value;

    if (this.state.fromError) {
      this.setState({ fromError: '' });
    }

    this.setState({ from: fromInput });

    this.showFromSuggestions(fromInput);
  };

  setFrom = (from) => () => {
    this.setState({ from, fromSuggestions: [] });
  };

  showToSuggestions = _.debounce(async input => {
    const suggestions = await this.getLocationSuggestions(input);

    this.setState({ toSuggestions: suggestions });
  }, 200);

  onToInputChange = (e) => {
    const toInput = e.target.value;

    if (this.state.toError) {
      this.setState({ toError: '' });
    }

    this.setState({ to: toInput });

    this.showToSuggestions(toInput);
  };

  setTo = (to) => () => {
    this.setState({ to, toSuggestions: [] });
  };

  showDayPicker = () => {
    if (this.state.dateError) {
      this.setState({ dateError: '' });
    }

    this.setState({ showDayPicker: true });
  };

  onDayClick = (day, { selected }) => {
    this.setState({
      date: selected ? '' : day,
      showDayPicker: false,
    });
  };

  onSearchButtonClick = (e) => {
    e.preventDefault();

    const { from, to, date } = this.state;

    if (!from) {
      this.setState({ fromError: 'Enter where you want to fly from' });
    }

    if (!to) {
      this.setState({ toError: 'Enter where you want to fly '});
    }

    if (!date) {
      this.setState({ dateError: 'Enter when you want to fly' });
    }
  };

  render() {
    const {
      from, fromSuggestions, fromError,
      to, toSuggestions, toError,
      date, showDayPicker, dateError,
    } = this.state;

    return (
      <Form>
        <Form.Field error={!!fromError}>
          <Input placeholder="From" onChange={this.onFromInputChange} value={from} />
          {!!fromSuggestions.length && fromSuggestions.map((suggestion, index) => (
            <li key={index} onClick={this.setFrom(suggestion)}>{suggestion}</li>
          ))}
          {fromError && <Label basic color='red' pointing>{fromError}</Label>}
        </Form.Field>
        <Form.Field error={!!toError}>
          <input placeholder="To" onChange={this.onToInputChange} value={to} />
          {!!toSuggestions.length && toSuggestions.map((suggestion, index) => (
            <li key={index} onClick={this.setTo(suggestion)}>{suggestion}</li>
          ))}
          {toError && <Label basic color='red' pointing>{toError}</Label>}
        </Form.Field>
        <Form.Field error={!!dateError}>
          <input placeholder="Date" value={date} onFocus={this.showDayPicker} />
          {showDayPicker &&
            <DayPicker
              selectedDays={void date}
              onDayClick={this.onDayClick}
            />
          }
          {dateError && <Label basic color='red' pointing>{dateError}</Label>}
        </Form.Field>
        <div style={{ textAlign: 'center' }}>
          <Button onClick={this.onSearchButtonClick} size="massive">Search</Button>
        </div>
      </Form>
    );
  }
}

export const allLocations = gql`
  query allLocations($search: String!) {
    allLocations(search: $search, first: 10) {
      edges {
        node {
          name
        }
      }
    }
  }
`;

export default withApollo(SearchForm);
