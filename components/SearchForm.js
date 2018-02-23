import React, { Component } from 'react';
import _ from 'lodash';
import { Form, Button, Label, Dropdown } from 'semantic-ui-react';
import { formatDate, parseDate } from 'react-day-picker/moment';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import gql from 'graphql-tag';
import { withApollo } from 'react-apollo';

import { isInputNaturalNumber } from '../lib/helpers';

class SearchForm extends Component {
  defaultNoResultsMessage = 'Start typing...';

  state = {
    locations: [],
    fromSearchQuery: '',
    fromOptions: [],
    fromSelectedOptions: [],
    fromError: '',
    fromNoResultsMessage: this.defaultNoResultsMessage,
    toSearchQuery: '',
    toOptions: [],
    toSelectedOptions: [],
    toError: '',
    toNoResultsMessage: this.defaultNoResultsMessage,
    selectedDate: '',
    dateError: '',
    loadingResults: false,
  };

  async getLocationOptions(input) {
    // we don't want to throw an error when the graphql doesn't find a matc
    try {
      const result = await this.props.client.query({
        query: allLocations,
        variables: { search: input },
      });

      return result.data.allLocations.edges.map((edge) => ({
        key: edge.node.locationId,
        value: edge.node.name,
        text: edge.node.name,
      }));
    } catch (error) {
      return false;
    }
  }

  getMissingSelectedOptions(options, selectedOptions) {
    return selectedOptions.filter(selectedOption => (
      !options.includes(selectedOption)
    ));
  }

  showFromOptions = _.debounce(async input => {
    const { fromSelectedOptions } = this.state;
    const options = await this.getLocationOptions(input);

    if (options) {
      // selected options not matching the current search query
      const missingSelectedOptions = this.getMissingSelectedOptions(options, fromSelectedOptions);

      this.setState({ fromOptions: [ ...options, ...missingSelectedOptions ] })
    } else {
      this.setState({ fromOptions: fromSelectedOptions, fromNoResultsMessage: 'No locations found...' });
    }
  }, 200);

  onFromDropdownChange = (e) => {
    const fromInput = e.target.value;

    if (this.state.fromError) {
      this.setState({ fromError: '' });
    }

    this.setState({ fromSearchQuery: fromInput });

    this.showFromOptions(fromInput);
  };

  onFromDropdownSelect = (event, data) => {
    const selectedOptions = this.state.fromOptions.filter(option => {
      return data.value.includes(option.value);
    });

    this.setState({
      fromSearchQuery: '',
      fromSelectedOptions: selectedOptions,
    });
  };

  onFromDropdownBlur = () => {
    const { fromSearchQuery, fromSelectedOptions } = this.state;

    !fromSearchQuery && this.setState({
      fromOptions: fromSelectedOptions, fromNoResultsMessage: this.defaultNoResultsMessage,
    });
  };

  showToOptions = _.debounce(async input => {
    const { toSelectedOptions } = this.state;
    const options = await this.getLocationOptions(input);

    if (options) {
      // selected options not matching the current search query
      const missingSelectedOptions = this.getMissingSelectedOptions(options, toSelectedOptions);

      this.setState({ toOptions: [...options, ...missingSelectedOptions ] });
    } else {
      this.setState({ toOptions: toSelectedOptions, toNoResultsMessage: 'No locations found...' });
    }
  }, 200);

  onToDropdownChange = (e) => {
    const toInput = e.target.value;

    if (this.state.toError) {
      this.setState({ toError: '' });
    }

    this.setState({ toSearchQuery: toInput });

    this.showToOptions(toInput);
  };

  onToDropdownSelect = (event, data) => {
    const selectedOptions = this.state.toOptions.filter(option => {
      return data.value.includes(option.value);
    });

    this.setState({
      toSearchQuery: '',
      toSelectedOptions: selectedOptions,
    });
  };

  onToDropdownBlur = () => {
    const { toSearchQuery, toSelectedOptions } = this.state;

    !toSearchQuery && this.setState({
      toOptions: toSelectedOptions, toNoResultsMessage: this.defaultNoResultsMessage,
    });
  };

  onDropdownSearch(options) {
    return options;
  }

  onDaySelect = (day, { selected }) => {
    day = new Date(day);

    this.setState({
      dateError: '',
      selectedDate: selected ?
        ''
        :
        `${day.getFullYear()}-${('0' + (day.getMonth() + 1)).slice(-2)}-${('0' + day.getDate()).slice(-2)}`,
    });
  };

  onSearchButtonClick = async (e) => {
    e.preventDefault();

    const { fromSelectedOptions, toSelectedOptions, selectedDate } = this.state;

    let isFormValid = true;

    if (!fromSelectedOptions.length) {
      isFormValid = false;
      this.setState({ fromError: 'Enter where you want to fly from' });
    }

    if (!toSelectedOptions.length) {
      isFormValid = false;
      this.setState({ toError: 'Enter where you want to fly '});
    }

    if (!selectedDate) {
      isFormValid = false;
      this.setState({ dateError: 'Enter when you want to fly' });
    }

    if (true || isFormValid) {
      this.setState({ loadingResults: true });

      await this.props.searchFlights(fromSelectedOptions, toSelectedOptions, selectedDate);

      this.setState({ loadingResults: false });
    }
  };

  render() {
    const {
      fromSearchQuery, fromOptions, fromError, fromNoResultsMessage,
      toSearchQuery, toOptions, toError, toNoResultsMessage,
      dateError,
      loadingResults,
    } = this.state;

    return (
      <Form>
        <Form.Field error={!!fromError}>
          <label>From:</label>
          <Dropdown
            placeholder="Where you wanna fly from?"
            onSearchChange={this.onFromDropdownChange}
            onChange={this.onFromDropdownSelect}
            searchQuery={fromSearchQuery}
            options={fromOptions || []}
            onBlur={this.onFromDropdownBlur}
            fluid
            multiple
            search={this.onDropdownSearch} // we want to delegate searching for locations on the API
            selection
            deburr
            noResultsMessage={fromNoResultsMessage}
            icon={false}
          />
          {fromError && <Label basic color='red' pointing>{fromError}</Label>}
        </Form.Field>
        <Form.Field error={!!toError}>
          <label>To:</label>
          <Dropdown
            placeholder="Where you wanna fly?"
            onSearchChange={this.onToDropdownChange}
            onChange={this.onToDropdownSelect}
            searchQuery={toSearchQuery}
            options={toOptions || []}
            onBlur={this.onToDropdownBlur}
            fluid
            multiple
            search={this.onDropdownSearch} // we want to delegate searching for locations on the API
            selection
            deburr
            noResultsMessage={toNoResultsMessage}
            icon={false}
          />
          {toError && <Label basic color='red' pointing>{toError}</Label>}
        </Form.Field>
        <Form.Field error={!!dateError}>
          <label>Date</label>
          <DayPickerInput
            onDayChange={this.onDaySelect}
            placeholder="When you wanna fly?"
            formatDate={formatDate}
            parseDate={parseDate}
            // inline styling is not supported, so we have to pass the classnames and use tailwindcss
            classNames={{
              container: 'DayPickerInput w-full',
              overlayWrapper: 'DayPickerInput-OverlayWrapper',
              overlay: 'DayPickerInput-Overlay',
            }}
          />
          {dateError && <Label basic color='red' pointing>{dateError}</Label>}
        </Form.Field>
        <div style={{ textAlign: 'center' }}>
          <Button
            onClick={this.onSearchButtonClick}
            loading={loadingResults}
            size="massive"
          >
            Search
          </Button>
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
          name,
          locationId
        }
      }
    }
  }
`;

export default withApollo(SearchForm);
