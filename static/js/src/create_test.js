// var React = require('react');
var ReactDOM = require('react-dom');
var CreateTest = require('./modules.js');
var Cases = CreateTest.Cases;

var $ = jQuery = require('jquery');
require("../../bootstrap/js/bootstrap.min.js");

ReactDOM.render(<Cases />, document.getElementById('main_container'));
