import React, { Component } from 'react';
import './App.css';

const serverAddr = 'http://localhost:6060/';

class App extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    
    this.state = {
      originalUrl: '',
      userResponse: '',
    };
  }

  handleChange(event) {
    this.setState({ originalUrl: event.target.value })
  }

  handleSubmit() {
    return fetch(serverAddr, {
      body: JSON.stringify({ url: this.state.originalUrl }), // must match 'Content-Type' header
      headers: {'content-type': 'application/json'},
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
    }).then(response => response.json(), // parses response to JSON
            error => console.log('An error occurred.', error))
      .then((response) => {
            console.log(response);
            this.setState({ userResponse: response.data });
          })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1> URL Shortener </h1>
          <p> Enter URL to shorten: </p>
          <input 
            type="text" 
            className="inputURL" 
            onChange={
              event => this.handleChange(event) 
            }
            placeholder="https://example.com" 
          />
          <button className="submitURL" onClick={() => this.handleSubmit()}>
            Submit URL
          </button>
          <a href={this.state.userResponse} style={{color:'white'}}>
            {this.state.userResponse}
          </a>
        </header>
      </div>
    );
  }
}

export default App;
