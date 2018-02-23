import React, { Component } from 'react';
import { Container } from 'semantic-ui-react';

import SearchForm from './SearchForm';
import Header from './Header';
import FlightList from './FlightList';
import FlightSearchError from './FlightSearchError';
import Pagination from './Pagination';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';

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
    from: [],
    to: [],
    date: '',
  };

  formatFlightDate(date) {
    date = new Date(date);

    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${('0' + date.getMinutes()).slice(-2)}`;
  }

  searchFlights = async () => {
    const { from, to, date } = this.state;

    this.setState({
      flight: [],
      searchFailed: false,
    });

    try {
     /*const result = await this.props.client.query({
        query: allFlights,
        variables: { search: {
            from: [{ location: 'London' }],
            to: [{ location: 'Paris' }],
            date: {
              exact: '2018-02-28',
            },
          },
        },
      });*/

      const result = await this.props.client.query({
        query: allFlights,
        variables: { search: {
            from: from.map(location => ({ location: location.value })),
            to: to.map(location => ({ location: location.value })),
            date: {
              exact: date,
            },
          },
        },
      });

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
    } catch (error) {
      this.setState({ searchFailed: true });
    }
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
        {(pageInfo.hasPreviousPage || pageInfo.hasNextPage) && <Pagination pageInfo={pageInfo} />}
      </Container>
    );
  }
}

export const allFlights = gql`
  query allFlights($search: FlightsSearchInput!, $after: String) {
    allFlights(search: $search, options: { currency: EUR }, first: 5, after: $after) {
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
