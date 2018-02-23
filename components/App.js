import React, { Component } from 'react';
import { Container } from 'semantic-ui-react';

import SearchForm from './SearchForm';
import Header from './Header';
import FlightList from './FlightList';
import FlightSearchError from './FlightSearchError';
import Pagination from './Pagination';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';

const SEARCH_TYPES = {
  NEXT_PAGE: 'NEXT_PAGE',
  PREV_PAGE: 'PREV_PAGE',
};

class App extends Component {
  state = {
    flights: [],
    searchFailed: false,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: '',
      endCursor: '',
    },
    from: [
      {
        "key": "paris_fr",
        "value": "Paris",
        "text": "Paris"
      }
    ],
    to: [
      {
        "key": "london_gb",
        "value": "London",
        "text": "London"
      },
      {
        "key": "london_gb",
        "value": "London",
        "text": "London"
      }
    ],
    date: '2018-02-28',
  };

  formatFlightDate(date) {
    date = new Date(date);

    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${('0' + date.getMinutes()).slice(-2)}`;
  }

  mapSearchResultToState = (result) => {
    this.setState({
      flights: result.data.allFlights.edges.map(({ node }) => ({
        arrival: {
          airport: node.arrival.airport.name,
          city: node.arrival.airport.city.name,
          time: this.formatFlightDate(node.arrival.time),
          localTime: this.formatFlightDate(node.arrival.localTime),
        },
        departure: {
          airport: node.departure.airport.name,
          city: node.departure.airport.city.name,
          time: this.formatFlightDate(node.departure.time),
          localTime: this.formatFlightDate(node.departure.localTime),
        },
        duration: node.duration,
        price: {
          amount: node.price.amount,
          currency: node.price.currency,
        },
        id: node.id,
      })),
      pageInfo: {
        hasNextPage: result.data.allFlights.pageInfo.hasNextPage,
        hasPreviousPage: result.data.allFlights.pageInfo.hasPreviousPage,
        startCursor: result.data.allFlights.pageInfo.startCursor,
        endCursor: result.data.allFlights.pageInfo.endCursor,
      }
    });
  };

  getSearchQueryVariablesBySearchType = (searchType) => {
    const { from, to, date, pageInfo: { startCursor, endCursor }  } = this.state;

    const commonVariabless = {
        search: {
          from: from.map(location => ({location: location.value})),
          to: to.map(location => ({location: location.value})),
          date: { exact: date },
        },
    };

    const commonVariables =  { search: {
      from: [{ location: 'London' }],
          to: [{ location: 'Paris' }],
          date: {
          exact: '2018-02-28',
        },
      },
    };

    switch (searchType) {
      case SEARCH_TYPES.NEXT_PAGE:
        return { ...commonVariables, after: endCursor };
      case SEARCH_TYPES.PREV_PAGE:
        return { ...commonVariables, before: startCursor };
      default:
        return commonVariables;
    }
  };

  searchFlights = async (searchType) => {
    this.setState({
      flights: [],
      searchFailed: false,
    });

    const queryVariables = this.getSearchQueryVariablesBySearchType(searchType);

    try {
     const result = await this.props.client.query({
        query: allFlights,
        variables: queryVariables,
     });

      this.mapSearchResultToState(result);
    } catch (error) {
      this.setState({ searchFailed: true });
    }
  };

  searchNextFlights = async () => {
    await this.searchFlights(SEARCH_TYPES.NEXT_PAGE);
  };

  setFrom = (from) => {
    this.setState({ from });
  };

  setTo = (to) => {
    this.setState({ to });
  };

  setDate = (date) => {
    this.setState({ date });
  };

  render() {
    const { flights, searchFailed, pageInfo, from, to, date }  = this.state;

    return (
      <Container className="my-4">
        <Header />
        <SearchForm
          searchFlights={this.searchFlights}
          fromSelectedOptions={from}
          onSelectedFromOptionsChange={this.setFrom}
          toSelectedOptions={to}
          onSelectedToOptionsChange={this.setTo}
          selectedDate={date}
          onSelectedDateChange={this.setDate}
        />
        {!!flights.length && <FlightList flights={flights} />}
        {searchFailed && <FlightSearchError />}
        {(pageInfo.hasPreviousPage || pageInfo.hasNextPage) && <Pagination pageInfo={pageInfo} goToNextPage={this.searchNextFlights}/>}
      </Container>
    );
  }
}

export const allFlights = gql`
  query allFlights($search: FlightsSearchInput!, $after: String, $before: String) {
    allFlights(search: $search, after: $after, before: $before, options: { currency: EUR }, first: 5) {
      pageInfo {
        hasNextPage,
        hasPreviousPage,
        startCursor,
        endCursor,
      },
      edges {
        node {
          id,
          arrival {
            airport {
              name,
              city {
                name,
              },
            },
            localTime,
            time,
          },
          departure {
            airport {
              name,
              city {
                name,
              },
            },
            localTime,
            time,
          },
          duration,
          price {
            amount,
            currency,
          },
        }
      }
    }
  }
`;

export default withApollo(App);
