import FlightListItem from './FlightListItem';
import FlightSearchError from './FlightSearchError';

const FlightList = ({ flights }) => (
  <div className="mt-4">
    {!!flights.length ?
    	flights.map((flight, index) => (
	      <FlightListItem flight={flight} key={index} />
	    )) :
    	<FlightSearchError>No results have been found</FlightSearchError>
    }
  </div>
);

export default FlightList;
