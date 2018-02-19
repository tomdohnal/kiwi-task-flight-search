import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { Input } from 'semantic-ui-react'

const isInputNaturalNumber = (input) => {
  const numericInput = Number(input);

  return !Number.isNaN(numericInput) && (numericInput % 1) === 0 && numericInput > 0;
};

class App extends Component {
  state = {
    locations: [],
    from: '',
    fromSuggestions: [],
    toSuggestions: [],
  };

  search = async (e) => {
    e.preventDefault();

    const { searchTerm } = this.state;

    if (searchTerm && isInputNaturalNumber(searchTerm)) {
      const result = await this.props.client.query({
        query: firstLocations,
        variables: { first: searchTerm },
      });

      console.log(result);
    }
  };

  onFromInputChange = async (e) => {
    const from = e.target.value;

    this.setState({ from });

    const result = await this.props.client.query({
      query: allLocations,
      variables: { search: from },
    });

    const fromSuggestions = result.data.allLocations.edges.map(edge => edge.node.name);

    this.setState({ fromSuggestions });
  };

  setFrom = (from) => () => {
    this.setState({ from, fromSuggestions: [] });
  };

  renderForm() {
    const { from, fromSuggestions } = this.state;

    return (
      <form>
        <div>
          <span>From</span>
          <Input onChange={this.onFromInputChange} value={from} />
          {!!fromSuggestions.length && fromSuggestions.map((suggestion, index) => (
            <li key={index} onClick={this.setFrom(suggestion)}>{suggestion}</li>
          ))}
        </div>
        <div>
          <span>To</span>
          <Input onChange={e => this.setState({ searchTerm: e.target.value })}/>
        </div>
        <div>
          <span>Date</span>
          <Input onChange={e => this.setState({ searchTerm: e.target.value })}/>
        </div>
        <div>
          <button onClick={this.search}>Search</button>
        </div>
      </form>
    )
  }

  render() {
    const { locations } = this.state;

    if (!locations.length) {
      return this.renderForm()
    }

    return (
      <div>
        {this.renderForm()}
        {this.locations.map(location => <li>{location.name}</li>)}
      </div>
    );
  }
}

export const allLocations = gql`
  query allLocations($search: String!) {
    allLocations(search: $search, first: 10) {
      edges {
        node {
          name
        }
      }
    }
  }
`;

export default withApollo(App);
