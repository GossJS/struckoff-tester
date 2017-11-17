import unittest
import execjs
import core


class Test_code_compile(unittest.TestCase):
    def func(self, *args):
        return core.code_compile(*args)

    def test_type(self):
        tests = [
            '2 + 2',
            'function(){return 42}',
            42,
            '42',
            'function(a){return a * 42}'
        ]
        for test in tests:
            self.assertIs(type(self.func(test)), execjs.ExternalRuntime.Context)

    def tests_result_noargs(self):
        expects = [4, 42, 42, 42, 42, None]
        tests = [
            '2 + 2',
            'function(){return 42}',
            42,
            '42',
            'f => (42)',
            'function(a){return a * 42}'
        ]
        for test, expect in zip(tests, expects):
            self.assertEqual(self.func(test).call('run'), expect)

    def tests_result_args(self):
        tests_args = ['2', '', '2, 2.5', '', '', '2.5, 2',  "[1, 2, 3, 4, 5]"]
        tests = [
            'function(a){return a * 42}',
            '2 + 2',
            'function(a, b){return a * b}',
            'f => (42)',
            'function(){ return (42)}',
            'f = (a, b) => (a * b)',
            'f = (a) => (a.map(m = (item) => (item * 2)))'
        ]
        expects = [84, 4, 5, 42, 42, 5, [2, 4, 6, 8, 10]]
        for test, tests_arg, expect in zip(tests, tests_args, expects):
            tests_arg = core.args_parse(tests_arg)
            self.assertEqual(self.func(test).call('run', *tests_arg), expect)


class Test_arg_parse(unittest.TestCase):
    def test_main(self):
        expects = [
            [1, 2, 3],
            [3, 2, 1],
            [2, 1, 3],
            [3, 1, 2],
            ['a', 42, 'ccc'],
            ['ccc', 42, 'a'],
        ]
        tests = [
            "1, 2, 3",
            "3, 2, 1",
            "2, 1, 3",
            "3, 1, 2",
            "'a', 42, 'ccc'",
            "'ccc', 42, 'a'",
        ]
        for _ in range(10):
            for test, expect in zip(tests, expects):
                result = core.args_parse(test)
                self.assertSequenceEqual(result, expect)


class Test_js_to_py(unittest.TestCase):
    def func(self, *args):
        return core.js_to_py(*args)

    def tests_result_noargs(self):
        expects = [4, 42, 42, 42, 42, None]
        tests = [
            '2 + 2',
            'function(){return 42}',
            42,
            '42',
            'f => (42)',
            'function(a){return a * 42}'
        ]
        for test, expect in zip(tests, expects):
            self.assertEqual(self.func(test)(), expect)

    def tests_result_args(self):
        tests_args = ['2', '', '2, 2.5', '', '', '2.5, 2',  "[1, 2, 3, 4, 5]"]
        tests = [
            'function(a){return a * 42}',
            '2 + 2',
            'function(a, b){return a * b}',
            'f => (42)',
            'function(){ return (42)}',
            'f = (a, b) => (a * b)',
            'f = (a) => (a.map(m = (item) => (item * 2)))'
        ]
        expects = [84, 4, 5, 42, 42, 5, [2, 4, 6, 8, 10]]
        for test, tests_arg, expect in zip(tests, tests_args, expects):
            tests_arg = core.args_parse(tests_arg)
            self.assertEqual(self.func(test)(*tests_arg), expect)


class Test_test_runner(unittest.TestCase):
    def func(self, *args):
        return core.test_runner(*args)

    def tests_no_args(self):
        code = 'function(){return 42}'
        tests_params = ['', '42', '', '1', '24', '"asd"']
        tests_expects = [42, '142', '', '2', 24, '"asd"']
        expects = [True, False, False, False, False, False]
        expects = [*map(lambda s: {'state': s}, expects)]

        result = self.func(code, tests_params, tests_expects)
        self.assertSequenceEqual(result, expects)

    @unittest.skip
    def tests_all_True(self):
        code = 'function(a, b, c){return a * b + c}'

        tests_params = [
            '1, 2, 3',
            '2, 3, 1',
            '2, 3, -1',
            '2, 2, 2',
            '1, 0, 2',
            '1, 2, 0',
            '1'
        ]
        tests_expects = ['5', '7', '5', '6', '2', '2', None]
        expects = [{'state': True}] * len(tests_params)
        result = self.func(code, tests_params, tests_expects)

        self.assertSequenceEqual(result, expects)


if __name__ == '__main__':
    unittest.main()
