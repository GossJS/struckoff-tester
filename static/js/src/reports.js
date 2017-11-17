var React = require('react');
var ReactDOM = require('react-dom');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');
var $ = jQuery = require('jquery');

var Codemirror = require('react-codemirror');
require('codemirror/mode/javascript/javascript');

var Modal = require('react-modal');
const ModalStyle = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.75)'
    },
    content: {
        // position: 'absolute',
        // top: '30%',
        // left: '50%',
        // right: 'auto',
        // bottom: 'auto',
        // transform: 'translate(-50%, -50%)',
        //
        // marginRight: '-50%',
        // border: '1px solid #ccc',
        // background: '#fff',
        // overflow: 'auto',
        // WebkitOverflowScrolling: 'touch',
        // borderRadius: '4px',
        outline: 'none',
        padding: '20px'

    }
};

var App = React.createClass({
    getInitialState: function () {
        return {
            reports: [],
            report_body: null,
            items_raw: [],
            active_item: -1
        };
    },
    get_body: function (item) {
        var self = this;

        $.getJSON(window.location.href + '/get', {report_id: item.id})
            .success(function (data) {
                self.setState({report_body: <ReportBody data={data} key={data.id}/>});
            }).error(function (e, err) {
            console.log(e, err);
        });
        this.setState({active_item: item.id});
        this.componentDidMount();

    },
    get_list_item: function (item) {
        var state = (item.id == this.state.active_item) ? "list-group-item-success" : "";
        return (
            <div onClick={this.get_body.bind(null, item)}
                 className={"list_item list-group-item "  + state}>
                <h4 className="list-group-item-heading">{item.name}</h4>
            </div>
        )
    },
    componentDidMount: function () {
        var reports = [];
        var self = this;
        $.getJSON(window.location.href + '/get')
            .success(function (data) {
                (data || []).map(function (item) {
                    reports[item.id] = self.get_list_item(item)
                });
                self.setState({
                    reports: reports,
                    items_raw: data
                });
            })
            .error(function (e, err) {
                this.state.items_raw.map(function (item) {
                    reports[item.id] = self.get_list_item(item)
                });
                self.setState({reports: reports});
                console.log(e, err);
            });
    },
    render: function () {
        return (
            <div className="row">
                <div className="items_list col-md-2 list-group">
                    {this.state.reports}
                </div>
                <div className="col-md-1"></div>
                <div id="output" className="col-md-6">
                    <ReactCSSTransitionGroup transitionName="slider_up_to_down" transitionEnterTimeout={500}
                                             transitionLeaveTimeout={300}>
                        {this.state.report_body}
                    </ReactCSSTransitionGroup>
                </div>
                <div className="col-md-1"></div>
                <div className="col-md-2">
                    <form action=" " method="post" className="menu btn-group-vertical">
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={function() {parent.location = parent.location.pathname.replace('edit', 'room') + '/..';}}
                        >
                            Test room
                        </button>
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={function() { parent.location = parent.location.pathname + '/..';}}
                        >
                            Edit room
                        </button>
                        <button type="submit" name="logout" className="btn btn-primary">Logout</button>
                    </form>
                </div>
            </div>
        )
    }
});


var ReportBody = React.createClass({
    getInitialState: function () {
        return {
            modalIsOpen: false,
            tests_modal: null,
            expects_modal: null
        };
    },
    closeModal: function () {
        this.setState({modalIsOpen: false})
    },
    get_cases: function () {
        var cases = [];
        var self = this;
        var onClick = function (item, e) {
            self.setState({
                modalIsOpen: true,
                tests_modal: item.tests,
                expects_modal: item.expects
            })
        };
        (this.props.data.passed || []).map(function (item) {
            cases[item.id] = (<div
                className="row alert alert-success"
                style={{"padding-bottom":0}}
                onClick={onClick.bind(null, item)}
            >
                <div className="col-xs-6">
                    <div className="well well-sm form-control">{item.tests}</div>
                </div>
                <div className="col-xs-6">
                    <div className="well well-sm form-control">{item.expects}</div>
                </div>
            </div>)
        });
        (this.props.data.failed || []).map(function (item) {
            cases[item.id] = (<div
                className="row alert alert-danger"
                style={{"padding-bottom":0}}
                onClick={onClick.bind(null, item)}
            >
                <div className="col-xs-6">
                    <div className="well well-sm form-control">{item.tests}</div>
                </div>
                <div className="col-xs-6">
                    <div className="well well-sm form-control">{item.expects}</div>
                </div>
            </div>)
        });
        return cases;
    },
    render: function () {
        var data = this.props.data;
        var options = {
            lineNumbers: true,
            theme: this.state.theme || 'dracula',
            readOnly: true,
            mode: 'javascript'
        };
        return (

            <div className="list_item well">
                <Codemirror ref='output' value={data.code || ''} options={options}/>
                <div className="form-horizontal well well-sm">
                    <div className="form-group">
                        <label for="name" className="col-lg-2 control-label">Name</label>
                        <div className="col-lg-10">
                            <span id="name" className="form-control panel panel-default">{data.name || ""}</span>
                        </div>
                    </div>
                    <div className="form-group">
                        <label for="name" className="col-lg-2 control-label">Comment</label>
                        <div className="col-lg-10">
                            <span id="about" className="form-control panel panel-default">{data.about || ""}</span>
                        </div>
                    </div>
                </div>
                <div className="cases_legend row alert bg-primary">
                    <label className="col-xs-6">Test params</label>
                    <label className="col-xs-6">Expects</label>
                </div>
                <div id="cases">
                    {this.get_cases()}
                </div>
                <Modal
                    className="Modal__Bootstrap modal-dialog"
                    isOpen={this.state.modalIsOpen}
                    onRequestClose={this.closeModal}
                    style={ModalStyle}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-body row">
                                <div className="col-sm-6">
                                    Tests
                                    <div className="well">
                                        {this.state.tests_modal}
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    Expects
                                    <div className="well">
                                        {this.state.expects_modal}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn col-sm-12" onClick={this.closeModal}>Close</button>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        )
    }
});

ReactDOM.render(
    <App />
    , document.getElementById('reports'));