import React, { Component } from 'react';
import { Container } from 'semantic-ui-react';

import SearchForm from './SearchForm';
import Header from './Header';

class App extends Component {
  render() {
    return (
      <Container>
        <Header />
        <SearchForm />
      </Container>
    );
  }
}

export default App;
