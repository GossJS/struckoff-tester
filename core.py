import logging

import execjs

logger = logging.getLogger('main debug log')
logger.setLevel(logging.DEBUG)
log = logging.StreamHandler()
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(lineno)d: %(module)s -> %(funcName)s: %(message)s')
log.setFormatter(formatter)
logger.addHandler(log)

JS = execjs.get()


def args_parse(arg_string):
    '''
        Parse string of arguments written in JS syntax to Python list

        arg_string - string representation of JS function arguments
    '''

    func_raw = "(function (){return arguments})(" + str(arg_string) + ")"
    args = JS.eval(func_raw)
    return [args[key] for key in sorted(args.keys())]


def code_compile(code):
    '''
        Implement JS code as context object
        which can be used to execute another instance of code

        code - JS source code
    '''
    code_raw = "(typeof({code}) == 'function')?({code}).apply(this, arguments):({code})".format(code=code)
    func_raw = "function run(){return " + code_raw + "}"
    if JS.is_available():
        return JS.compile(func_raw)


def js_to_py(code):
    '''
        Produce a wrapper of the context object (compiled JS source code) call method

        code - JS source code
    '''

    func = code_compile(str(code))

    def product(*args):
        '''
            Call the context object

            args - arguments for JS function
        '''
        try:
            return func.call('run', *args)
        except execjs.RuntimeError:
            raise execjs.RuntimeError("SYNTAX ERROR")
    return product


def test_runner(code, tests, expects):
    '''
        Run code using the list of pre-set arguments and compare the output results with the expected ones

        code - JS source code
        tests - list of string representation of JS function arguments (takes 1 per iteration)
        expects - list of expected results for each item of tests
    '''

    case = js_to_py(code)
    try:
        return [{
                    "state": case(*args_parse(params)) == JS.eval(expect)
                } for params, expect in zip(tests, expects)]
    except execjs.RuntimeError as err:
        return [{
            "state": False,
            "message": str(err.with_traceback(None))
        }]
