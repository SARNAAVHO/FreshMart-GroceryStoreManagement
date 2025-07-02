from flask import Flask, jsonify, request
from flask_cors import CORS
from sql_connection import get_sql_connection
import products_dao
import uom_dao
import orders_dao

app = Flask(__name__)
CORS(app)
# CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, 
#      supports_credentials=True,
#      methods=["GET", "POST", "OPTIONS"],
#      allow_headers=["Content-Type"])

@app.route('/getProducts')
def get_products():
    conn = get_sql_connection()
    products = products_dao.get_all_products(conn)
    return jsonify(products)

@app.route('/getUOM')
def get_uoms():
    conn = get_sql_connection()
    uoms = uom_dao.get_uoms(conn)
    return jsonify(uoms)

# @app.route('/insertProduct', methods=['POST'])
# def insert_product():
#     conn = get_sql_connection()
#     product = {
#         'name': request.form['name'],
#         'uom_id': request.form['uom_id'],
#         'price_per_unit': request.form['price_per_unit']
#     }
#     product_id = products_dao.insert_new_product(conn, product)
#     return jsonify({'product_id': product_id})

@app.route('/insertProduct', methods=['POST', 'OPTIONS'])
def insert_product():
    if request.method=='OPTIONS':
        return '', 200
    conn = get_sql_connection()
    data = request.get_json(force=True)  # <--- ensures JSON is parsed even if headers are off

    product = {
        'name': data['product_name'],  # from frontend
        'uom_id': data['uom_id'],
        'price_per_unit': data['price_per_unit']
    }

    product_id = products_dao.insert_new_product(conn, product)
    return jsonify({'product_id': product_id})


@app.route('/deleteProduct', methods=['POST'])
def delete_product():
    conn = get_sql_connection()
    product_id = request.form['product_id']
    deleted_id = products_dao.delete_product(conn, product_id)
    return jsonify({'product_id': deleted_id})

# @app.route('/insertOrder', methods=['POST'])
# def insert_order():
#     conn = get_sql_connection()
#     order = request.get_json()
#     order_id = orders_dao.insert_order(conn, order)
#     return jsonify({'order_id': order_id})

@app.route('/insertOrder', methods=['POST'])
def insert_order():
    try:
        conn = get_sql_connection()
        order = request.get_json(force=True)  # Add force=True just to be safe
        print("Received Order JSON:", order)

        order_id = orders_dao.insert_order(conn, order)
        return jsonify({'order_id': order_id})
    except Exception as e:
        print("Error in /insertOrder:", e)
        return jsonify({'error': str(e)}), 500

@app.route('/getAllOrders')
def get_all_orders():
    conn = get_sql_connection()
    orders = orders_dao.get_all_orders(conn)
    return jsonify(orders)

@app.route('/getOrderCount')
def get_order_count():
    conn = get_sql_connection()
    count = orders_dao.get_order_count(conn)
    return jsonify({'order_count': count})

@app.route('/getRecentOrders')
def get_recent_orders():
    conn = get_sql_connection()
    orders = orders_dao.get_recent_orders(conn)
    return jsonify(orders)

@app.route('/getOrderDetails/<int:order_id>')
def get_order_details(order_id):
    conn = get_sql_connection()
    details = orders_dao.get_order_details_by_order_id(conn, order_id)
    return jsonify(details)

@app.route('/getOrders')
def get_orders():
    conn = get_sql_connection()
    orders = orders_dao.get_orders(conn)
    return jsonify(orders)



if __name__ == "__main__":
    app.run(port=5000, debug=True)
