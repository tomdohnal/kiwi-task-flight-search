import { Grid, Card, Statistic, Button } from 'semantic-ui-react';

const FlightList = ({ flights }) => (
  <div>
    {flights.map((flight, index) => (
      <Card key={index} style={{ padding: '8px' }} fluid>
        <Grid>
          <Grid.Column mobile={16} tablet={16} computer={6}>
            <h3>Departure</h3>
            <strong>Location:</strong> {`${flight.departure.city} (${flight.departure.airport})`}
            <br />
            <strong>Time:</strong> {`${flight.departure.time} (local time: ${flight.departure.localTime})`}
          </Grid.Column>
          <Grid.Column mobile={16} tablet={16} computer={6}>
            <h3>Arrival</h3>
            <strong>Location:</strong> {`${flight.arrival.city} (${flight.arrival.airport})`}
            <br />
            <strong>Time:</strong> {`${flight.arrival.time} (local time: ${flight.arrival.localTime})`}
          </Grid.Column>
          <Grid.Column mobile={16} tablet={16} computer={4} style={{ textAlign: 'right' }}>
            <Statistic style={{ margin: '0 16px 0 0' }}>
              <Statistic.Value>{flight.price.amount}</Statistic.Value>
              <Statistic.Label>{flight.price.currency}</Statistic.Label>
            </Statistic>
            <Button as="a" target="_blank" href={flight.bookingUrl}>Book</Button>
          </Grid.Column>
        </Grid>
      </Card>
      ))}
  </div>
);

export default FlightList;
