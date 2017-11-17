import sys
from flask import Flask

DATABASE = 'database.db'
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + DATABASE
app.secret_key = 'super secret key'
app.config['SESSION_TYPE'] = 'filesystem'

from views import *

if __name__ == '__main__':
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    else:
        port = 8000
    app.run(host='0.0.0.0', port=port, debug=True)
