import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { Container, Loader } from 'semantic-ui-react';

import SearchForm from '../components/SearchForm';
import Header from '../components/Header';
import FlightList from '../components/FlightList';
import FlightSearchError from '../components/FlightSearchError';
import Pagination from '../components/Pagination';
import initApollo from '../lib/initApollo';
import withData from '../lib/withData';

const apolloClient = initApollo();

const SEARCH_TYPES = {
  INITIAL: 'INITIAL',	
  NEXT_PAGE: 'NEXT_PAGE',
  PREV_PAGE: 'PREV_PAGE',
};

const FLIGHTS_PER_PAGE = 5;

const getSearchQueryVariablesBySearchType = (searchType, variables) => {
  const { from, to, date, pages, currentPageIndex } = variables;

  const { startCursor, endCursor } = pages[currentPageIndex - 1].info;

  const commonVariables = {
    search: {
      from: from.map(location => ({ location: location.value })),
      to: to.map(location => ({ location: location.value })),
      date: { exact: date },
    },
  };

  switch (searchType) {
    case SEARCH_TYPES.NEXT_PAGE:
      return { ...commonVariables, after: endCursor, first: FLIGHTS_PER_PAGE };
    case SEARCH_TYPES.PREV_PAGE:
      return { ...commonVariables, before: startCursor, last: FLIGHTS_PER_PAGE };
    case SEARCH_TYPES.INITIAL:
      return { ...commonVariables, first: FLIGHTS_PER_PAGE }
    default:
      return commonVariables;
  }
};

const formatFlightDate = (date) => {
  date = new Date(date);

  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${('0' + date.getMinutes()).slice(-2)}`;
}

const mapSearchResult = (result) => {
	const flights = result.data.allFlights.edges.map(({ node }) => ({
    arrival: {
      airport: node.arrival.airport.name,
      city: node.arrival.airport.city.name,
      time: formatFlightDate(node.arrival.time),
      localTime: formatFlightDate(node.arrival.localTime),
    },
    departure: {
      airport: node.departure.airport.name,
      city: node.departure.airport.city.name,
      time: formatFlightDate(node.departure.time),
      localTime: formatFlightDate(node.departure.localTime),
    },
    duration: node.duration,
    price: {
      amount: node.price.amount,
      currency: node.price.currency,
    },
    id: node.id,
    bookingUrl: node.bookingUrl,
  }));

  const info = {
    hasNextPage: result.data.allFlights.pageInfo.hasNextPage,
    hasPreviousPage: result.data.allFlights.pageInfo.hasPreviousPage,
    startCursor: result.data.allFlights.pageInfo.startCursor,
    endCursor: result.data.allFlights.pageInfo.endCursor,
  };

  return { flights, info };
};

class App extends Component {
  state = {
    pages: this.props.pages,
    searchFailed: this.props.searchFailed,
    loadingResults: false,
    currentPageIndex: this.props.currentPageIndex,
    from: this.props.from,
    to: this.props.to,
    date: this.props.date,
  };

  static async getInitialProps({ query, ...restProps }) {
  	const initialPropsWithoutSearchResult = {
  	  to: query.to ? query.to.split(',').map(location => ({
	    	key: location, value: location, text: location,
		  })) : [],
	  	from: query.from ? query.from.split(',').map(location => ({
		    key: location, value: location, text: location,
		  })) : [],
		  date: query.date,
		  currentPageIndex: 1,
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
  	};

  	if (query.to && query.from && query.date) {
  	  const queryVariables = getSearchQueryVariablesBySearchType(SEARCH_TYPES.INITIAL, initialPropsWithoutSearchResult);

      try {
        const result = await apolloClient.query({
          query: allFlights,
          variables: queryVariables,
        });

        return { ...initialPropsWithoutSearchResult, pages: [{ ...mapSearchResult(result) }] };
      } catch (error) {
      	return { ...initialPropsWithoutSearchResult, searchFailed: true };
      };
  	}

  	return initialPropsWithoutSearchResult;
  }

  searchFlights = async (searchType) => {
  	const { pages, currentPageIndex } = this.state;

    this.setState({
      loadingResults: true,
      searchFailed: false,
    });

    const queryVariables = getSearchQueryVariablesBySearchType(searchType, this.state);

    try {
      const result = await apolloClient.query({
        query: allFlights,
        variables: queryVariables,
      });

      const newPage = mapSearchResult(result);

	    this.setState((prevState) => ({
	      pages: searchType === SEARCH_TYPES.INITIAL ? [ newPage ] : [ ...prevState.pages, newPage ],
	      loadingResults: false,
	    }));
    } catch (error) {
      this.setState({ searchFailed: true, loadingResults: false });
    }
  };

  searchNextFlights = async () => {
    await this.searchFlights(SEARCH_TYPES.NEXT_PAGE);

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
      }
    });
  };

  goToNextPage = async () => {
    const { pages, currentPageIndex } = this.state;

    // if the next page is not already loaded, load next flights
    if (!pages[currentPageIndex] || !pages[currentPageIndex].flights.length) {
      await this.searchNextFlights();
    }

    this.setState({ currentPageIndex: currentPageIndex + 1 });
  };

  searchPreviousFlights = async () => {
    await this.searchFlights(EARCH_TYPES.PREV_PAGE);

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
          searchFlights={this.searchFlights.bind(this, SEARCH_TYPES.INITIAL)}
          fromSelectedOptions={from}
          onSelectedFromOptionsChange={this.setFrom}
          toSelectedOptions={to}
          onSelectedToOptionsChange={this.setTo}
          selectedDate={date}
          onSelectedDateChange={this.setDate}
        />
        {loadingResults && <Loader active inline="centered" size="massive" style={{ marginTop: '6rem'}} />}
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
          bookingUrl,
        }
      }
    }
  }
`;

export default withData(withApollo(App));
