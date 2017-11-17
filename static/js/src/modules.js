var sha256 = require('sha256');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');
var $ = jQuery = require('jquery');


module.exports = (function () {
    var m = function () {
        React = require('react');
        var Modal = require('react-modal');
        const ModalStyle = {
            // content: {
            //     top: '50%',
            //     left: '50%',
            //     right: 'auto',
            //     bottom: 'auto',
            //     marginRight: '-50%',
            //     transform: 'translate(-50%, -50%)'
            // }
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

        var Case = React.createClass({
            getInitialState: function () {
                return {
                    tests_field: this.field_build({
                        id: 'tests',
                        handler: this.tests_handl,
                        placeholder: 'Arguments of tested function'
                    }),
                    expects_field: this.field_build({
                        id: 'expects',
                        handler: this.expects_handl,
                        placeholder: 'Expected results'
                    }),
                    temp: {
                        tests: '',
                        expects: ''
                    },
                    tests: this.props.tests || '',
                    expects: this.props.expects || '',
                    id: this.props.id || -1,
                    modalIsOpen: typeof(this.props.isnew) == "boolean" ? this.props.isnew : true,
                    isnew: typeof(this.props.isnew) == "boolean" ? this.props.isnew : true,
                    savepassword_button_class: 'btn-info',
                    save_button: <button onClick={this.save_case} className="btn btn-success">Save</button>
                }
            },
            openModal: function () {
                this.setState({
                    tests_field: this.field_build({
                        id: 'tests',
                        placeholder: 'Arguments of tested function',
                        handler: this.tests_handl,
                        value: this.state.tests
                    }),
                    expects_field: this.field_build({
                        id: 'expects',
                        placeholder: 'Expected results',
                        handler: this.expects_handl,
                        value: this.state.expects
                    }),
                    temp: {
                        tests: this.state.tests,
                        expects: this.state.expects
                    },
                    password_temp: null

                });
                this.setState({modalIsOpen: true});
            },
            closeModal: function () {
                this.setState({modalIsOpen: false});
            },
            field_build: function (data) {
                var self = this;
                var handler = function (e) {
                    self.state.temp[data.id] = e.target.value;
                    self.setState(self.state);
                };

                return <textarea
                    className="form-control"
                    type="text"
                    id={data.id}
                    placeholder={data.placeholder}
                    defaultValue={data.value}
                    onChange={handler}>
                </textarea>
            },
            save_case: function () {
                this.setState({
                    tests: this.state.temp.tests,
                    expects: this.state.temp.expects,
                    isnew: false
                });
                data = {
                    "tests": this.state.temp.tests,
                    "expects": this.state.temp.expects,
                    "id": this.props.id
                };
                if (this.props.top_data_handler) {
                    this.props.top_data_handler(this.props.id, data);
                }
                this.closeModal();
            },
            cancel: function () {
                this.setState({
                    temp: {
                        id: -1,
                        tests: '',
                        expects: ''
                    }
                });
                this.closeModal();
                if (this.state.isnew) {
                    console.log('yo');
                    this.delete_case();
                }
            },
            delete_case: function () {
                this.props.delete_case(this.state.id);
            },
            render: function () {
                return (
                    <div className="col-sm-12">
                        <div className="col-xs-3 col-sm-4">
                            <div id="tests" className='well well-sm form-control'>
                                {this.state.tests}
                            </div>
                        </div>
                        <div className="col-xs-3  col-sm-4">
                            <div id="expects" className='well well-sm form-control'>
                                {this.state.expects}
                            </div>
                        </div>
                        <div className="btn-group col-xs-5 col-sm-4">
                            <button onClick={this.openModal} className="btn btn-default">Edit</button>
                            <button onClick={this.delete_case} className="btn btn-danger">X</button>
                        </div>
                        <Modal
                            className="Modal__Bootstrap"
                            isOpen={this.state.modalIsOpen}
                            onRequestClose={this.closeModal}
                            style={ModalStyle}
                        >
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-body row">
                                        <div className="col-sm-6">
                                            Tests
                                            {this.state.tests_field}
                                        </div>
                                        <div className="col-sm-6">
                                            Expects
                                            {this.state.expects_field}
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button onClick={this.save_case} className="btn btn-success">Save</button>
                                        <button className="btn" onClick={this.cancel}>Cancel</button>
                                    </div>
                                </div>
                            </div>
                        </Modal>
                    </div>
                );
            }
        });

        var Cases = React.createClass({
            getInitialState: function () {
                return {
                    cases: [],
                    description: '',
                    state_handler: true,
                    room_id: -1,
                    prev_state: {
                        data: JSON.stringify(this.data || ''),
                        description: null
                    }
                }
            },
            state_handler: function () {
                var result = this.state.prev_state.data == JSON.stringify(this.data || '');
                var result = result && this.state.prev_state.description == this.state.description;
                return result;
            },
            data: {},
            componentDidMount: function () {
                var self = this;
                (this.props.init_funcs || []).map(function (f) {
                    f(self);
                });

            },
            state_check: function () {
                return this.state;
            },
            data_handler: function (id, data) {
                this.data = this.data || {};
                this.data[data.id.toString()] = this.data[data.id.toString()] || {};
                for (key in data) {
                    this.data[data.id.toString()][key] = data[key];
                }
                ;
                this.forceUpdate();

            },
            description_handler: function (e) {
                this.setState({
                    description: e.target.value
                })
            },
            password_handler: function (e) {
                this.setState({
                    password_temp: e.target.value,
                    savepassword_button_class: 'btn-warning'

                })
            },
            save_password: function () {
                var self = this;
                $.getJSON(window.location.href + '/get', {
                    password: this.state.password_temp ? sha256(this.state.password_temp) : null,
                    room_id: self.state.room_id
                })
                    .success(function (data) {
                        console.log('saved');
                        self.setState({
                            savepassword_button_class: 'btn-info',
                            room_id: data.room_id
                        })
                    })
                    .error(function (data) {
                        console.log('err', data);
                    })
            },
            new_case: function () {
                var id = Math.max.apply(null, Object.keys(this.data).map(function (n) {
                    return parseInt(n);
                }));

                var id = (isFinite(id) ? id : 0) + 1;
                this.state.cases[id] = <Case
                    key={id}
                    id={id}
                    top_data_handler={this.data_handler}
                    delete_case={this.delete_case}
                />;
                this.setState({cases: this.state.cases});
                this.forceUpdate();

            },
            send_cases: function () {
                var self = this;
                $.getJSON(window.location.href + '/get', {
                    cases: JSON.stringify(this.data),
                    description: this.state.description,
                    room_id: self.state.room_id
                })
                    .success(function (data) {
                        self.setState({
                            prev_state: {
                                data: JSON.stringify(self.data || ''),
                                description: self.state.description,
                            },
                            room_id: data.room_id
                        });
                        self.forceUpdate();

                        if (window.location.pathname != data.url) {
                            window.open(data.url, '_self')
                        }


                    })
                    .error(function (data) {
                        console.log('err', data);
                    })
            },
            delete_case: function (id) {
                delete this.state.cases[id];
                delete this.data[id];
                this.setState(this.state);
            },
            render: function () {
                return (
                    <div>

                        <div>
                            <div id="description" className="left_col col-md-5 left">
                                <div className="password input-group btn">
                                    <input
                                        type="password"
                                        className="password form-control"
                                        id="password"
                                        onChange={this.password_handler}
                                        value={this.state.password_temp}
                                        placeholder="Room password"
                                    />
                                <span className="input-group-btn">
                                    <button
                                        onClick={this.save_password}
                                        className={"btn " + (this.state.savepassword_button_class || "btn-info") }
                                    >
                                    Save password
                                    </button>
                                </span>
                                </div>
                            <textarea
                                className="form-control"
                                onChange={this.description_handler}
                                rows="10"
                                placeholder="Description (HTML syntax)"
                                value={this.state.description}>
                            </textarea>
                                <div className="panel panel-primary">
                                    <div className="panel-heading">
                                        <h3 className="panel-title">Preview</h3>
                                    </div>
                                    <div
                                        className="panel-body"
                                        dangerouslySetInnerHTML={{__html: this.state.description}}
                                    >
                                    </div>
                                </div>
                            </div>

                            <div className="right_col col-md-7 right">
                                <div id="buttons">
                                    <button id="new_case" className="btn btn-primary col-md-3" onClick={this.new_case}>
                                        New
                                        case
                                    </button>
                                    <button id="send_cases"
                                            className={"btn col-md-3 " + (this.state_handler() ? "btn-info" : "btn-warning") }
                                            onClick={this.send_cases}>
                                        Save
                                    </button>
                                </div>
                                <div className="cases_legend row alert bg-primary">
                                    <label className="col-xs-3 col-sm-4">Test params</label>
                                    <label className="col-xs-3 col-sm-4">Expects</label>
                                </div>
                                <div id="cases">
                                    <ReactCSSTransitionGroup transitionName="slider_right_to_left"
                                                             transitionEnterTimeout={500}
                                                             transitionLeaveTimeout={300}>
                                        {this.state.cases}
                                    </ReactCSSTransitionGroup>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        });
        this.Case = Case;
        this.Cases = Cases;
    };
    return new m;
})();
