import React, { Component } from 'react';
import _ from 'lodash';
import { Form, Button, Label, Dropdown } from 'semantic-ui-react';
import { formatDate, parseDate } from 'react-day-picker/moment';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import gql from 'graphql-tag';

import { parseKiwiDateToStandardDate, parseToKiwiDate, pushToUrl } from '../lib/helpers';
import apolloClient from '../lib/apollo';

const removeDuplicateLocations = (allLocationOptions) => (
  allLocationOptions.reduce((locations, currentLocation) => {
    if (!locations.map(location => location.value).includes(currentLocation.value)) {
      return [ ...locations, currentLocation ];
    }

    return locations;
  }, [])
);

class SearchForm extends Component {
  defaultNoResultsMessage = 'Start typing...';

  state = {
    locations: [],
    fromSearchQuery: '',
    fromOptions: removeDuplicateLocations(this.props.fromSelectedOptions) || [],
    fromError: '',
    fromNoResultsMessage: this.defaultNoResultsMessage,
    toSearchQuery: '',
    toOptions: removeDuplicateLocations(this.props.toSelectedOptions) || [],
    toError: '',
    toNoResultsMessage: this.defaultNoResultsMessage,
    dateError: '',
  };


  async getLocationOptions(input) {
    // we don't want to throw an error when the graphql doesn't find a match
    try {
      const result = await apolloClient.query({
        query: allLocations,
        variables: { search: input },
      });

      return removeDuplicateLocations(result.data.allLocations.edges.map((edge) => ({
        key: edge.node.locationId,
        value: edge.node.name,
        text: edge.node.name,
      })));

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
    const { fromSelectedOptions } = this.props;
    const options = await this.getLocationOptions(input);

    if (options) {
      // selected options not matching the current search query
      const missingSelectedOptions = this.getMissingSelectedOptions(options, fromSelectedOptions);

      this.setState({ fromOptions: [ ...options, ...missingSelectedOptions ] })
    } else {
      this.setState({ fromOptions: fromSelectedOptions, fromNoResultsMessage: 'No locations found...' });
    }
  }, 200);

  onFromDropdownSearchChange = (e) => {
    const fromInput = e.target.value;

    if (this.state.fromError) {
      this.setState({ fromError: '' });
    }

    this.setState({ fromSearchQuery: fromInput });

    this.showFromOptions(fromInput);
  };

  onFromDropdownChange = (event, { value }) => {
    const newSelectedOptions = value;

    this.props.onSelectedFromOptionsChange(newSelectedOptions.map(option => ({
      value: option,
      key: option,
      text: option,
    })));
    
    this.setState({ fromSearchQuery: '' });
  };

  onFromDropdownBlur = () => {
    const { fromSearchQuery } = this.state;
    const { fromSelectedOptions } = this.props;

    !fromSearchQuery && this.setState({
      fromOptions: fromSelectedOptions, fromNoResultsMessage: this.defaultNoResultsMessage,
    });
  };

  showToOptions = _.debounce(async input => {
    const { toSelectedOptions } = this.props;
    const options = await this.getLocationOptions(input);

    if (options) {
      // selected options not matching the current search query
      const missingSelectedOptions = this.getMissingSelectedOptions(options, toSelectedOptions);

      this.setState({ toOptions: [...options, ...missingSelectedOptions ] });
    } else {
      this.setState({ toOptions: toSelectedOptions, toNoResultsMessage: 'No locations found...' });
    }
  }, 200);

  onToDropdownSearchChange = (e) => {
    const toInput = e.target.value;

    if (this.state.toError) {
      this.setState({ toError: '' });
    }

    this.setState({ toSearchQuery: toInput });

    this.showToOptions(toInput);
  };

  onToDropdownChange = (event, { value }) => {
    const newSelectedOptions = value;

    this.props.onSelectedToOptionsChange(newSelectedOptions.map(option => ({
      text: option,
      key: option,
      value: option,
    })));

    this.setState({ toSearchQuery: '' });
  };

  onToDropdownBlur = () => {
    const { toSearchQuery } = this.state;
    const { toSelectedOptions } = this.props;

    !toSearchQuery && this.setState({
      toOptions: toSelectedOptions, toNoResultsMessage: this.defaultNoResultsMessage,
    });
  };

  onDropdownSearch(options) {
    return options;
  }

  onDaySelect = (day) => {
    this.setState({
      dateError: '',
    });

    this.props.onSelectedDateChange(parseToKiwiDate(new Date(day)));
  };

  onSearchButtonClick = async (e) => {
    e.preventDefault();

    const { fromSelectedOptions, toSelectedOptions, selectedDate } = this.props;

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

    if (isFormValid) {
      pushToUrl({
        from: fromSelectedOptions.map(option => option.value),
        to: toSelectedOptions.map(option => option.value),
        date: selectedDate,
      });

      await this.props.searchFlights();
    }
  };

  render() {
    const {
      fromSearchQuery, fromOptions, fromError, fromNoResultsMessage,
      toSearchQuery, toOptions, toError, toNoResultsMessage,
      dateError
    } = this.state;

    const { fromSelectedOptions, toSelectedOptions, selectedDate } = this.props;

    return (
      <Form>
        <Form.Field error={!!fromError}>
          <label>From:</label>
          <Dropdown
            placeholder="Where you wanna fly from?"
            onSearchChange={this.onFromDropdownSearchChange}
            onChange={this.onFromDropdownChange}
            searchQuery={fromSearchQuery}
            options={fromOptions || []}
            onBlur={this.onFromDropdownBlur}
            fluid
            multiple
            search={this.onDropdownSearch} // we want to delegate searching for locations on the API
            selection
            deburr
            noResultsMessage={fromNoResultsMessage}
            value={Array.isArray(fromSelectedOptions) && removeDuplicateLocations(fromSelectedOptions).map(option => option.text)}
            icon={false}
          />
          {fromError && <Label basic color='red' pointing>{fromError}</Label>}
        </Form.Field>
        <Form.Field error={!!toError}>
          <label>To:</label>
          <Dropdown
            placeholder="Where you wanna fly?"
            onSearchChange={this.onToDropdownSearchChange}
            onChange={this.onToDropdownChange}
            searchQuery={toSearchQuery}
            options={toOptions || []}
            onBlur={this.onToDropdownBlur}
            fluid
            multiple
            search={this.onDropdownSearch} // we want to delegate searching for locations on the API
            selection
            deburr
            noResultsMessage={toNoResultsMessage}
            value={removeDuplicateLocations(toSelectedOptions).map(option => option.text)}
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
            value={selectedDate && parseKiwiDateToStandardDate(selectedDate)}
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
          name,
          locationId
        }
      }
    }
  }
`;

export default SearchForm;
