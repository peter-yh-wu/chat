/*
* client-side entry point
*/

var React = require('react');
var ReactDOM = require('react-dom');
var App =
require('./components/App');

ReactDOM.render(
  <App />,
  document.getElementById('app')
);
