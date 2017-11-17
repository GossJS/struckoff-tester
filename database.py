from flask_sqlalchemy import SQLAlchemy

from main import app

DB = SQLAlchemy(app)

successful_tests = DB.Table('successful_tests',
                            DB.Column('report_id',
                                      DB.Integer,
                                      DB.ForeignKey('report.id'),
                                      nullable=False),
                            DB.Column('testdata_id',
                                      DB.Integer,
                                      DB.ForeignKey('testdata.id'),
                                      nullable=False),
                            DB.PrimaryKeyConstraint('report_id', 'testdata_id'))

failed_tests = DB.Table('failed_tests',
                        DB.Column('report_id',
                                  DB.Integer,
                                  DB.ForeignKey('report.id'),
                                  nullable=False),
                        DB.Column('testdata_id',
                                  DB.Integer,
                                  DB.ForeignKey('testdata.id'),
                                  nullable=False),
                        DB.PrimaryKeyConstraint('report_id', 'testdata_id'))

class Room(DB.Model):
    id = DB.Column(DB.Integer, primary_key=True)
    description = DB.Column(DB.String)
    password = DB.Column(DB.String, default="")
    test_cases = DB.relationship('TestData')
    reports = DB.relationship('Report')

    def __init__(self, description, password):
        self.description = description
        self.password = password


class TestData(DB.Model):
    __tablename__ = 'testdata'
    id = DB.Column(DB.Integer, primary_key=True)
    room_id = DB.Column(DB.Integer, DB.ForeignKey('room.id'))
    test = DB.Column(DB.String)
    expect = DB.Column(DB.String)
    case_id = DB.Column(DB.Integer)

    def __init__(self, id, room_id, test, expect):
        self.case_id = id
        self.room_id = room_id
        self.test = test
        self.expect = expect


class Report(DB.Model):
    id = DB.Column(DB.Integer, primary_key=True)
    room_id = DB.Column(DB.Integer, DB.ForeignKey('room.id'))
    name = DB.Column(DB.String)
    comment = DB.Column(DB.String)
    code = DB.Column(DB.String)
    passed = DB.relationship('TestData', secondary=successful_tests, backref='passed')
    failed = DB.relationship('TestData', secondary=failed_tests, backref='failed')

    def __init__(self, room_id, name, code, comment=''):
        self.room_id = room_id
        self.name = name
        self.comment = comment
        self.code = code
