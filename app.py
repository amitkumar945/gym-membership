from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime

app = Flask(__name__)

client = MongoClient('mongodb://localhost:27017/')
db = client['gym_membership_db']
members = db.members

@app.route('/')
def index():
    return render_template('index.html')

# GET all + POST new member
@app.route('/api/members', methods=['GET', 'POST'])
def handle_members():
    if request.method == 'GET':
        data = list(members.find())
        for m in data:
            m['_id'] = str(m['_id'])
        return jsonify(data)
    
    data = request.get_json()
    data['joining_date'] = data.get('joining_date', datetime.utcnow().strftime('%Y-%m-%d'))
    result = members.insert_one(data)
    return jsonify({'_id': str(result.inserted_id)}), 201

# Single member (GET, PUT, DELETE)
@app.route('/api/members/<string:mid>', methods=['GET', 'PUT', 'DELETE'])
def single_member(mid):
    if request.method == 'GET':
        m = members.find_one({'_id': ObjectId(mid)})
        if m:
            m['_id'] = str(m['_id'])
            return jsonify(m)
        return jsonify({'error': 'Not found'}), 404
    
    elif request.method == 'PUT':
        data = request.get_json()
        result = members.update_one({'_id': ObjectId(mid)}, {'$set': data})
        return jsonify({'message': 'Updated'}) if result.modified_count else jsonify({'error': 'Not found'}), 404
    
    else:
        result = members.delete_one({'_id': ObjectId(mid)})
        return jsonify({'message': 'Deleted'}) if result.deleted_count else jsonify({'error': 'Not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)