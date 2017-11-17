import hashlib
import json
import sqlite3
from functools import wraps

from flask import render_template, request, g, session, abort, Markup

from core import test_runner
from database import Room, TestData, Report, DB
from main import app, DATABASE


def get_cases(cases):
    return [{
                "id": c.case_id,
                "tests": c.test,
                "expects": c.expect
            } for c in cases]


def check_auth(password, room_id):
    room = Room.query.filter_by(id=int(room_id)).first()
    return password == room.password


def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        room_id = kwargs['room_id']
        if Room.query.filter_by(id=int(room_id)).first() is None:
            return abort(404)
        if session.get(room_id) is not None:
            if request.form.get('logout') is not None or not check_auth(session[room_id], room_id):
                session.pop(room_id, None)
            else:
                return f(*args, **kwargs)
        else:
            password = request.form.get('password', False)
            password = hashlib.sha256(password.encode()).hexdigest() if password else ''
            if request.method == 'POST' and check_auth(password, room_id):
                session[room_id] = password
                return f(*args, **kwargs)
        return render_template('main_ui/password.html')

    return decorated


@app.before_request
def before_request():
    g.db = sqlite3.connect(DATABASE)
    DB.create_all()


@app.after_request
def after_request(response):
    g.db.close()
    return response


@app.route('/')
def index():
    # session.clear()
    return render_template('main_ui/index.html')


@app.route('/room/<room_id>/')
def test_room(room_id):
    room = Room.query.filter_by(id=room_id).first()
    if room is None:
        return abort(404)
    return render_template('main_ui/test_room.html',
                           room_id=room_id,
                           description=Markup(room.description))


@app.route('/room/<room_id>//get', strict_slashes=False)
def test_room_api(room_id):
    room = Room.query.filter_by(id=room_id).first()
    code = request.args.get('text', '')
    tests = tuple(case.test for case in room.test_cases)
    expects = tuple(case.expect for case in room.test_cases)
    results = test_runner(code, tests, expects)
    ratio = len([r for r in results if r["state"]]) / len(results) * 100

    report = json.loads(request.args.get('report', '{}'))
    if report.get('contact') is not None:
        report = Report(room_id, report.get('contact', ''), code, report.get('about', ''))
        DB.session.add(report)
        DB.session.commit()

        for result, case in zip(results, room.test_cases):
            if result['state']:
                report.passed.append(case)
            else:
                report.failed.append(case)

        DB.session.commit()

    return json.dumps({"results": results, "ratio": round(ratio)})


@app.route('/create/')
def create_test():
    return render_template('main_ui/create_test.html')


@app.route('/create//get')
def create_test_api():
    room = Room.query.filter_by(id=request.args.get('room_id', -1)).first()
    if room is None:
        room = Room('', request.args.get('password', ''))
        DB.session.add(room)
        DB.session.commit()
    room.description = request.args.get('description', '')
    if request.args.get('password') is not None:
        session[str(room.id)] = request.args.get('password')
    for key, case in json.loads(request.args.get('cases', '{}')).items():
        tests = case.get("tests", "")
        expects = case.get("expects", "")
        id = case.get("id", 0)
        testdata = TestData(id, room.id, tests, expects)
        DB.session.add(testdata)
    DB.session.commit()
    return json.dumps({
        "url": '/edit/{}'.format(room.id),
        "room_id": room.id
    })


@app.route('/edit/<room_id>/', methods=['GET', 'POST'])
@requires_auth
def edit_test(room_id):
    room = Room.query.filter_by(id=room_id).first()
    if room is None:
        return abort(404)
    return render_template('main_ui/edit_test.html', room_id=room_id)


@app.route('/edit/<room_id>//get')
@requires_auth
def edit_test_api(room_id):
    room = Room.query.filter_by(id=room_id).first()

    if room is None:
        return abort(404)

    if request.args.get('password') is not None:
        if check_auth(session[room_id], room_id):
            room.password = request.args.get('password')

    if request.args.get("description") is not None \
            and request.args.get("description", False) != room.description:
        room.description = request.args.get("description")

    if request.args.get("cases") is not None:
        room.test_cases[:] = []
        for key, case in json.loads(request.args["cases"]).items():
            testdata = TestData(case["id"], room_id, case["tests"], case["expects"])
            DB.session.add(testdata)

    DB.session.commit()

    return json.dumps({
        "description": room.description,
        "cases": get_cases(room.test_cases)
    })


@app.route('/edit/<room_id>/reports', methods=['GET', 'POST'])
@requires_auth
def edit_test_reports(room_id):
    return render_template('main_ui/reports.html')


@app.route('/edit/<room_id>/reports/get')
@requires_auth
def edit_test_reports_api(room_id):
    if request.args.get('report_id') is not None:
        report = Report.query \
            .filter_by(id=int(request.args.get('report_id'))) \
            .filter_by(room_id=room_id).first()
        if report is None:
            return abort(404)
        return json.dumps({
            'id': report.id,
            'name': report.name,
            'about': report.comment,
            'code': report.code,
            'passed': get_cases(report.passed),
            'failed': get_cases(report.failed)
        })

    else:
        reports = Report.query.filter_by(room_id=room_id).all()
        if reports is None:
            return abort(404)
        return json.dumps([{
                               'name': r.name,
                               'id': r.id
                           } for r in reports])
