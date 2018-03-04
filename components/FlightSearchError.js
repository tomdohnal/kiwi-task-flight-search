import { Message } from 'semantic-ui-react';

const FlightSearchError = ({ children }) => (
  <Message negative>
    <Message.Header>{children}</Message.Header>
  </Message>
);

export default FlightSearchError;
