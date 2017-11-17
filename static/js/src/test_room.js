var React = require('react');
var ReactDOM = require('react-dom');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

var $ = jQuery = require('jquery');

require("../../bootstrap/js/bootstrap.min.js");

var Codemirror = require('react-codemirror');
require('codemirror/mode/javascript/javascript');


var App = React.createClass({
    getInitialState: function () {
        return {
            code: 'function (a, b) {return a + b}',
            theme: 'dracula',
            report_panel_state: false,
            report: {}
        };
    },
    updateCode: function (newCode) {
        this.setState({
            code: newCode
        });
    },
    submit: function () {
        var data_send = {
            text: this.state.code,
            report: JSON.stringify(this.state.report)
        };
        $.getJSON(window.location.href + '/get', data_send)
            .success(function (data) {
                ReactDOM.render(<Output data={data}/>, document.getElementById('output'));
            }).error(function (e, err) {
            console.log(e, err);
        });
    },
    switchTheme: function (e) {
        this.setState({
            theme: e.target.value
        });
    },
    submit_checkbox_handler: function (e) {
        this.setState({report_panel_state: e.target.checked})
    },
    report_panel: function () {
        var contact_handler = function (e) {
            this.state.report['contact'] = e.target.value;
            this.setState({report: this.state.report});
        };
        var about_handler = function (e) {
            this.state.report['about'] = e.target.value;
            this.setState({report: this.state.report});
        };
        return (
            <div className="navbar navbar-inverse form-horizontal" id="report_panel" role="form"
                 data-toggle="validator">
                <fieldset>
                    <legend></legend>
                    <div className="form-group">
                        <label for="contact_field" className="col-sm-2 control-label">Name</label>
                        <div className="col-sm-8">
                            <input type="text"
                                   className="form-control "
                                   required="true"
                                   id="contact_field"
                                   placeholder="Name or Email (required)"
                                   onChange={contact_handler.bind(this)}
                                   value={this.state.report.contact}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label for="about_field" className="col-sm-2 control-label">Comment</label>
                        <div className="col-sm-8">
                            <textarea
                                className="form-control"
                                id="about_field"
                                placeholder=""
                                onChange={about_handler.bind(this)}
                                value={this.state.report.about}
                            />
                        </div>
                    </div>

                </fieldset>
            </div>
        )
    },
    render: function () {
        var options = {
            lineNumbers: true,
            theme: this.state.theme,
            mode: 'javascript'
        };
        return (
            <div id="editor_container">
                <Codemirror ref='editor' onChange={this.updateCode} options={options}/>
                <nav className="navbar navbar-inverse navbar-default">
                    <div className="navbar-form navbar-left">
                        <button className="btn btn-primary" type='button' onClick={this.submit}>
                            Run tests
                        </button>
                        <span className="alert-success">
                            <input type="checkbox" onChange={this.submit_checkbox_handler}/>
                            Send report
                        </span>
                    </div>
                    <div className="themeswitch navbar-form navbar-right">
                        <select onChange={this.switchTheme} value={this.state.theme} className="form-control cont">
                            <option value="default">default</option>
                            <option value="monokai">monokai</option>
                            <option value="dracula">dracula</option>
                            <option value="zenburn">zenburn</option>
                            <option value="solarized dark">solarized dark</option>
                            <option value="solarized light">solarized light</option>
                            <option value="twilight">twilight</option>
                        </select>
                    </div>
                </nav>
                <ReactCSSTransitionGroup transitionName="slider_right_to_left"
                                         transitionEnterTimeout={500}
                                         transitionLeaveTimeout={300}>
                    {this.state.report_panel_state ? this.report_panel() : ''}
                </ReactCSSTransitionGroup>
            </div>
        )
    }
});

var Output = React.createClass({
    body: function () {
        var style = parseFloat(this.props.data.ratio);
        var style = (style >= 100.0) ? "success" : ((style > 10.0) ? "warning" : "danger");

        return (

            <div>
                <div id="statistic" className="col-md-5 col-md-push-7">
                    <div className={"panel panel-" + style}>
                        <div className="panel-heading">
                            <h3 className="panel-title">Quick review</h3>
                        </div>
                        <div className="panel-body">
                            <div id="ratio">{this.props.data.ratio + '% '}</div>
                        </div>
                    </div>
                </div>

                <div id="test_results_cont" className="col-md-7 col-md-pull-5">
                    <table id="test_results" className="table table-responsive">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>State</th>
                            <th>Message</th>
                        </tr>
                        </thead>
                        <tbody>

                        {
                            this.props.data.results.map(function (result, result_index) {
                                return (

                                    <tr key={"result_" + result_index}
                                        className={"result" + (result.state ? "pass success" : "not_pass danger")}>
                                        <td>{result_index}</td>
                                        <td className="state">{result.state ? "Pass" : "Fail"}</td>
                                        <td className="message">{result.message}</td>
                                    </tr>
                                )
                            })
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        )
    },
    render: function () {
        return (
            <ReactCSSTransitionGroup transitionName="slider_right_to_left"
                                     transitionEnterTimeout={5000}
                                     transitionLeaveTimeout={3000}>
                {this.body()}
            </ReactCSSTransitionGroup>
        )
    }
});

ReactDOM.render(
    <App />
    , document.getElementById('editor'));


$('#form').on('submit', function (e) {
    e.preventDefault();
});
