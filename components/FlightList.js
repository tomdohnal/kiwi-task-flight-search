import FlightListItem from './FlightListItem';

const FlightList = ({ flights }) => (
  <div className="mt-4">
    {flights.map((flight, index) => (
      <FlightListItem flight={flight} key={index} />
    ))}
  </div>
);

export default FlightList;
