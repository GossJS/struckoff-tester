var CreateTest = require('./modules.js');
var Cases = CreateTest.Cases;
var ReactDOM = require('react-dom');

$ = jQuery = require('jquery');
require("../../bootstrap/js/bootstrap.min.js");

var get_cases = function (self) {
    $.getJSON(window.location.href + '/get')
        .success(function (data) {
            var cases = [];
            (data["cases"] || []).map(function (item) {
                self.data_handler(item.id, item);
                cases[item.id] = <CreateTest.Case
                    key={item.id}
                    top_data_handler={self.data_handler}
                    delete_case={self.delete_case}
                    isnew={false}
                    tests={item.tests}
                    expects={item.expects}
                    id={item.id}
                />;
            });
            self.setState({
                cases: cases,
                description: data["description"] || ''
            });
            self.setState({
                prev_state: {
                    data: JSON.stringify(self.data || ''),
                    description: self.state.description
                }
            });

        })
        .error(function (data) {
            console.log("err", data);
        });
};

ReactDOM.render(<Cases init_funcs={[get_cases]}/>, document.getElementById('main_container'));
