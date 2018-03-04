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
};

const FLIGHTS_PER_PAGE = 5;

const getSearchQueryVariablesBySearchType = (searchType, variables) => {
  const { from, to, date, pages, currentPageIndex } = variables;

  const commonVariables = {
    search: {
      from: from.map(location => ({ location: location.value })),
      to: to.map(location => ({ location: location.value })),
      date: { exact: date },
    },
  };

  switch (searchType) {
    case SEARCH_TYPES.NEXT_PAGE:
    	const { endCursor } = pages[currentPageIndex - 1].info;

      return { ...commonVariables, after: endCursor, first: FLIGHTS_PER_PAGE };
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
		    loading: false,
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
  	const searchPageIndex = searchType === SEARCH_TYPES.INITIAL ? 1 : this.state.currentPageIndex + 1;

		this.setState(({ pages, currentPageIndex }) => ({ 
			searchFailed: false, 
			pages: searchType === SEARCH_TYPES.INITIAL ? 
				[{ loading: true }] : [...pages, { loading: true }],
		}));

    const queryVariables = getSearchQueryVariablesBySearchType(searchType, this.state);

    try {
      const result = await apolloClient.query({
        query: allFlights,
        variables: queryVariables,
      });

      const newPage = { ...mapSearchResult(result), loading: false };

	    this.setState(({ pages }) => ({
	      pages: searchType === SEARCH_TYPES.INITIAL ? [ newPage ] : pages.map(page => (
	      	page.loading ? newPage : page
	      )),
	    }));
    } catch (error) {
      this.setState({ searchFailed: true });
    }
  };

  prefetchNextFlights = async () => {
		await this.searchFlights(SEARCH_TYPES.NEXT_PAGE);

    this.setState(({ pages }) => {
      const updatedPages = pages.map((page, index) => {
        if (index >= 1 && page.info && !page.info.hasPreviousPage) {
          return {
            ...page,
            info: {
              ...page.info,
              // if we go to the next page, we are sure that there is a previous page
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
    const { currentPageIndex } = this.state;

    this.setState({ currentPageIndex: currentPageIndex + 1 });
  };

  goToPreviousPage = async () => {
    const { currentPageIndex } = this.state;

    this.setState({ currentPageIndex: currentPageIndex - 1 });
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

  componentDidUpdate(prevProps, prevState) {
  	const { currentPageIndex } = this.state;

  	const prevPageIndex = prevState.currentPageIndex;

  	if (
  		// the user has just gone to the next page which had been already prefetched
  		// and the page after the next page hasn't been already prefetched
  		currentPageIndex > prevPageIndex && this.state.pages[currentPageIndex - 1].info && !this.state.pages[currentPageIndex] || 
  		// if the user had gone to a not-yet-fully-prefetched next page and it has just loaded
  		!prevState.pages[currentPageIndex - 1].info && this.state.pages[currentPageIndex - 1].info || 
  		// if the initial search has just finished
			(this.state.pages[0].info && !prevState.pages[0].info)
		) {
  		this.prefetchNextFlights();
		}
  }

  componentDidMount() {
  	// if the server renders some pages, prefetch the next page
  	this.state.pages[this.state.currentPageIndex - 1].info && this.prefetchNextFlights();
  }

  render() {
    const { pages, currentPageIndex, searchFailed, from, to, date } = this.state;

    const { flights, loading } = pages[currentPageIndex - 1];

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
        {loading && <Loader active inline="centered" size="massive" style={{ marginTop: '6rem'}} />}
        {!loading && flights  && <FlightList flights={flights} />}
        {searchFailed && <FlightSearchError />}
        {pageInfo && (pageInfo.hasPreviousPage || pageInfo.hasNextPage) && (
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
