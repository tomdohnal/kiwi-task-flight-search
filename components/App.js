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
    pages: [{
      flights: [],
      info: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: '',
        endCursor: '',
      },
    }],
    searchFailed: false,
    loadingResults: false,
    currentPageIndex: 1,
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

  SEARCH_TYPES = {
    NEXT_PAGE: 'NEXT_PAGE',
    PREV_PAGE: 'PREV_PAGE',
  };

  FLIGHTS_PER_PAGE = 5;

  formatFlightDate(date) {
    date = new Date(date);

    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${('0' + date.getMinutes()).slice(-2)}`;
  }

  mapSearchResultToState = (result) => {
    const { pages, currentPageIndex } = this.state;

    const newFlights = result.data.allFlights.edges.map(({ node }) => ({
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
    }));

    const newInfo = {
      hasNextPage: result.data.allFlights.pageInfo.hasNextPage,
      hasPreviousPage: result.data.allFlights.pageInfo.hasPreviousPage,
      startCursor: result.data.allFlights.pageInfo.startCursor,
      endCursor: result.data.allFlights.pageInfo.endCursor,
    };

    const newPage = {
      flights: newFlights,
      info: newInfo,
    };

    const arePagesEmpty = !pages[currentPageIndex - 1].flights.length;

    this.setState((prevState) => ({
      pages: arePagesEmpty ? [ newPage ] : [ ...prevState.pages, newPage ],
    }), this.setState({ loadingResults: false }));
  };

  getSearchQueryVariablesBySearchType = (searchType) => {
    const { from, to, date, pages, currentPageIndex } = this.state;

    const { startCursor, endCursor } = pages[currentPageIndex - 1].info;

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
      case this.SEARCH_TYPES.NEXT_PAGE:
        return { ...commonVariables, after: endCursor, first: this.FLIGHTS_PER_PAGE };
      case this.SEARCH_TYPES.PREV_PAGE:
        return { ...commonVariables, before: startCursor, last: this.FLIGHTS_PER_PAGE };
      default:
        return { ...commonVariables, first: this.FLIGHTS_PER_PAGE };
    }
  };

  searchFlights = async (searchType) => {
    this.setState({
      loadingResults: true,
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
      this.setState({ searchFailed: true, loadingResults: false });
    }
  };

  searchNextFlights = async () => {
    await this.searchFlights(this.SEARCH_TYPES.NEXT_PAGE);

    this.setState((prevState) => {
      const updatedPages = prevState.pages.map((page, index) => {
        if (prevState.currentPageIndex === index) {
          return {
            ...page,
            info: {
              ...page.info,
              // if we go to the next page, we are sure that there is at least one previous page
              hasPreviousPage: true,
            }
          };
        }

        return page;
      });

      return {
        pages: updatedPages,
        currentPageIndex: prevState.currentPageIndex + 1,
      }
    });
  };

  goToNextPage = async () => {
    const { pages, currentPageIndex } = this.state;

    // if the next page is not already loaded
    if (!pages[currentPageIndex] || !pages[currentPageIndex].flights.length) {
      await this.searchNextFlights();
    } else {
      this.setState({ currentPageIndex: currentPageIndex + 1 });
    }
  };

  searchPreviousFlights = async () => {
    await this.searchFlights(this.SEARCH_TYPES.PREV_PAGE);

    this.setState((prevState) => {
      const updatedPages = prevState.pages.map((page, index) => {
        if (prevState.currentPageIndex === index) {
          return {
            ...page,
            info: {
              ...page.info,
              // if we go to the next page, we are sure that there is at least one previous page
              hasNextPage: true,
            }
          };
        }

        return page;
      });

      return {
        pages: updatedPages,
        currentPageIndex: prevState.currentPageIndex - 1,
      }
    });
  };

  goToPreviousPage = async () => {
    const { pages, currentPageIndex } = this.state;

    // if the previous page is not already loaded
    if (!pages[currentPageIndex - 2].flights.length) {
      await this.searchPreviousFlights();
    } else {
      this.setState({ currentPageIndex: currentPageIndex - 1 });
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
    const { pages, currentPageIndex, searchFailed, loadingResults, from, to, date } = this.state;

    const { flights } = pages[currentPageIndex - 1];
    const pageInfo = pages[currentPageIndex - 1].info;

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
        {loadingResults && <div>Loading...</div>}
        {flights && !loadingResults && <FlightList flights={flights} />}
        {searchFailed && <FlightSearchError />}
        {(pageInfo.hasPreviousPage || pageInfo.hasNextPage) && !loadingResults && (
          <Pagination
            pageInfo={pageInfo}
            goToNextPage={this.goToNextPage}
            goToPreviousPage={this.goToPreviousPage}
          />
        )}
      </Container>
    );
  }
}

export const allFlights = gql`
  query allFlights($search: FlightsSearchInput!, $after: String, $before: String, $first: Int, $last: Int) {
    allFlights(search: $search, after: $after, before: $before, options: { currency: EUR }, first: $first, last: $last) {
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
