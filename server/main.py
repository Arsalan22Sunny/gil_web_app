# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
from datetime import datetime, timedelta
import os

app = Flask(__name__)
CORS(app)

# Configuration
app.config['MONGO_URI'] = 'mongodb://localhost:27017/inventory_db'
app.config['JWT_SECRET_KEY'] = 'arsooo'  # Change this in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=12)

# Initialize extensions
mongo = PyMongo(app)
jwt = JWTManager(app)

# User Authentication Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if mongo.db.users.find_one({'email': data['email']}):
        return jsonify({'error': 'Email already exists'}), 400
    
    user = {
        'email': data['email'],
        'password': generate_password_hash(data['password']),
        'role': data.get('role', 'user'),
        'created_at': datetime.utcnow()
    }
    mongo.db.users.insert_one(user)
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = mongo.db.users.find_one({'email': data['email']})
    
    if user and check_password_hash(user['password'], data['password']):
        access_token = create_access_token(identity=str(user['_id']))
        return jsonify({'token': access_token}), 200
    return jsonify({'error': 'Invalid credentials'}), 401

# Inventory Routes
@app.route('/api/items', methods=['GET'])
@jwt_required()
def get_items():
    query = {}
    # Handle search and filters
    if 'search' in request.args:
        query['$or'] = [
            {'name': {'$regex': request.args['search'], '$options': 'i'}},
            {'category': {'$regex': request.args['search'], '$options': 'i'}}
        ]
    if 'category' in request.args:
        query['category'] = request.args['category']
    if 'date' in request.args:
        date = datetime.strptime(request.args['date'], '%Y-%m-%d')
        query['updated_at'] = {
            '$gte': date,
            '$lt': date + timedelta(days=1)
        }
    
    items = list(mongo.db.items.find(query))
    for item in items:
        item['_id'] = str(item['_id'])
    return jsonify(items)

@app.route('/api/items', methods=['POST'])
@jwt_required()
def add_item():
    data = request.json
    item = {
        'name': data['name'],
        'category': data['category'],
        'quantity': data['quantity'],
        'minimum_stock': data['minimum_stock'],
        'unit_price': data.get('unit_price', 0),
        'location': data.get('location', ''),
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow(),
        'created_by': get_jwt_identity()
    }
    result = mongo.db.items.insert_one(item)
    
    # Check if the new item is low in stock and create a notification if necessary
    if item['quantity'] <= item['minimum_stock']:
        create_notification(f"Low stock alert for {item['name']}")
    
    return jsonify({'_id': str(result.inserted_id)}), 201

@app.route('/api/items/<item_id>', methods=['PUT'])
@jwt_required()
def update_item(item_id):
    data = request.json
    print(data)

    {'_id': '671422c59afb57b6fb93e026', 'created_by': '67140f370b9880c72059d86f', 'location': 'Lounge', 'minimum_stock': 1, 'name': 'Printer', 'quantity': 2, 'unit_price': 100, 'updated_at': 'Sat, 19 Oct 2024 21:21:09 GMT'}

    data['updated_at'] = datetime.utcnow()
    
    old_item = mongo.db.items.find_one({'_id': ObjectId(item_id)})
    
    mongo.db.items.update_one(
        {'_id': ObjectId(item_id)},
        {'$set': {'category': data['category'], 'created_at': data['created_at'], 'created_by': data['created_by'], 'location': data['location'], 'minimum_stock': data['minimum_stock'], 'name': data['name'], 'quantity': data['quantity'], 'unit_price': data['unit_price'], 'updated_at': data['updated_at']}}
    )
    
    # Check if the update caused a low stock situation
    if 'quantity' in data and data['quantity'] <= old_item['minimum_stock']:
        create_notification(f"Low stock alert for {old_item['name']}")
    
    return jsonify({'message': 'Item updated successfully'})

@app.route('/api/items/<item_id>', methods=['DELETE'])
@jwt_required()
def delete_item(item_id):
    mongo.db.items.delete_one({'_id': ObjectId(item_id)})
    return jsonify({'message': 'Item deleted successfully'})

# Analytics Routes
@app.route('/api/analytics/low-stock', methods=['GET'])
@jwt_required()
def get_low_stock_items():
    low_stock_items = list(mongo.db.items.find({
        '$expr': {'$lte': ['$quantity', '$minimum_stock']}
    }))
    for item in low_stock_items:
        item['_id'] = str(item['_id'])
    return jsonify(low_stock_items)

@app.route('/api/analytics/inventory-value', methods=['GET'])
@jwt_required()
def get_inventory_value():
    pipeline = [
        {
            '$project': {
                'total_value': {'$multiply': ['$quantity', '$unit_price']}
            }
        },
        {
            '$group': {
                '_id': None,
                'total_inventory_value': {'$sum': '$total_value'}
            }
        }
    ]
    result = list(mongo.db.items.aggregate(pipeline))
    return jsonify(result[0] if result else {'total_inventory_value': 0})

@app.route('/api/analytics/stock-movement', methods=['GET'])
@jwt_required()
def get_stock_movement():
    start_date = request.args.get('start_date', 
                                (datetime.utcnow() - timedelta(days=30)).strftime('%Y-%m-%d'))
    end_date = request.args.get('end_date', datetime.utcnow().strftime('%Y-%m-%d'))
    
    pipeline = [
        {
            '$match': {
                'updated_at': {
                    '$gte': datetime.strptime(start_date, '%Y-%m-%d'),
                    '$lte': datetime.strptime(end_date, '%Y-%m-%d')
                }
            }
        },
        {
            '$group': {
                '_id': {'$dateToString': {'format': '%Y-%m-%d', 'date': '$updated_at'}},
                'total_items': {'$sum': 1},
                'average_quantity': {'$avg': '$quantity'}
            }
        },
        {'$sort': {'_id': 1}}
    ]
    result = list(mongo.db.items.aggregate(pipeline))
    return jsonify(result)

# New Routes for Notifications
@app.route('/api/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    notifications = list(mongo.db.notifications.find().sort('created_at', -1).limit(20))
    for notification in notifications:
        notification['_id'] = str(notification['_id'])
    return jsonify(notifications)

@app.route('/api/notifications', methods=['POST'])
@jwt_required()
def create_notification(message=None):
    if not message:
        message = request.json.get('message')
    
    if not message:
        return jsonify({'error': 'Message is required'}), 400
    
    notification = {
        'message': message,
        'created_at': datetime.utcnow(),
        'created_by': get_jwt_identity()
    }
    result = mongo.db.notifications.insert_one(notification)
    return jsonify({'_id': str(result.inserted_id)}), 201

@app.route('/api/notifications/<notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    mongo.db.notifications.delete_one({'_id': ObjectId(notification_id)})
    return jsonify({'message': 'Notification deleted successfully'})

# New Route for Categories
@app.route('/api/categories', methods=['GET'])
@jwt_required()
def get_categories():
    categories = mongo.db.items.distinct('category')
    return jsonify(categories)

# New Route for Dashboard Summary
@app.route('/api/dashboard/summary', methods=['GET'])
@jwt_required()
def get_dashboard_summary():
    total_items = mongo.db.items.count_documents({})
    low_stock_count = mongo.db.items.count_documents({'$expr': {'$lte': ['$quantity', '$minimum_stock']}})
    total_value = get_inventory_value().json['total_inventory_value']
    categories_count = len(mongo.db.items.distinct('category'))
    
    return jsonify({
        'total_items': total_items,
        'low_stock_count': low_stock_count,
        'total_inventory_value': total_value,
        'categories_count': categories_count
    })

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5060, debug=True)