import { Message } from 'semantic-ui-react';

const FlightSearchError = () => (
  <Message negative>
    <Message.Header>
      There has been an error while searching for flights. Please try again!
    </Message.Header>
  </Message>
);

export default FlightSearchError;
