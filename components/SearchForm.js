import React, { Component } from 'react';
import _ from 'lodash';
import { Form, Button, Label, Dropdown } from 'semantic-ui-react';
import { formatDate, parseDate } from 'react-day-picker/moment';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import gql from 'graphql-tag';
import { withApollo } from 'react-apollo';
import { parseKiwiDateToStandardDate, parseToKiwiDate } from '../lib/dates';

const removeDuplicateLocations = (allLocationOptions) => {
  return allLocationOptions.reduce((locations, currentLocation) => {
    if (!locations.map(location => location.value).includes(currentLocation.value)) {
      return [ ...locations, currentLocation ];
    }

    return locations;
  }, []);
};

class SearchForm extends Component {
  defaultNoResultsMessage = 'Start typing...';

  state = {
    locations: [],
    fromSearchQuery: '',
    fromOptions: removeDuplicateLocations(this.props.fromSelectedOptions),
    fromError: '',
    fromNoResultsMessage: this.defaultNoResultsMessage,
    toSearchQuery: '',
    toOptions: removeDuplicateLocations(this.props.toSelectedOptions),
    toError: '',
    toNoResultsMessage: this.defaultNoResultsMessage,
    dateError: '',
    loadingResults: false,
  };


  async getLocationOptions(input) {
    // we don't want to throw an error when the graphql doesn't find a match
    try {
      const result = await this.props.client.query({
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

  onFromDropdownChange = (e) => {
    const fromInput = e.target.value;

    if (this.state.fromError) {
      this.setState({ fromError: '' });
    }

    this.setState({ fromSearchQuery: fromInput });

    this.showFromOptions(fromInput);
  };

  onFromDropdownSelect = (event, { value }) => {
    const oldSelectedOptions = this.props.fromSelectedOptions;
    const allFromOptions = this.state.fromOptions;
    const newSelectedOptions = value;

    const newlySelectedOption = allFromOptions.find(option => (
      newSelectedOptions.includes(option.value) && !oldSelectedOptions.map(option => option.value).includes(option.value)
    ));

    this.setState({ fromSearchQuery: '' });

    this.props.onSelectedFromOptionsChange([ ...oldSelectedOptions, newlySelectedOption ]);
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

  onToDropdownChange = (e) => {
    const toInput = e.target.value;

    if (this.state.toError) {
      this.setState({ toError: '' });
    }

    this.setState({ toSearchQuery: toInput });

    this.showToOptions(toInput);
  };

  onToDropdownSelect = (event, { value }) => {
    const oldSelectedOptions = this.props.toSelectedOptions;
    const allToOptions = this.state.toOptions;
    const newSelectedOptions = value;

    const newlySelectedOption = allToOptions.find(option => (
      newSelectedOptions.includes(option.value) && !oldSelectedOptions.map(option => option.value).includes(option.value)
    ));

    this.setState({ toSearchQuery: '' });

    this.props.onSelectedToOptionsChange([ ...oldSelectedOptions, newlySelectedOption ]);
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

    if (true || isFormValid) {
      this.setState({ loadingResults: true });

      await this.props.searchFlights();

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

    const { fromSelectedOptions, toSelectedOptions, selectedDate } = this.props;

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
            value={removeDuplicateLocations(fromSelectedOptions).map(option => option.text)}
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
            value={parseKiwiDateToStandardDate(selectedDate)}
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
