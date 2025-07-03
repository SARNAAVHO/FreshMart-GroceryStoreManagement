from flask import Flask, jsonify, request, g
from flask_cors import CORS
from sql_connection import get_sql_connection
import products_dao
import uom_dao
import orders_dao
from auth import require_auth

app = Flask(__name__)

CORS(app,
     resources={r"/*": {"origins": "*"}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "OPTIONS"])

@app.route('/getProducts')
@require_auth
def get_products():
    conn = get_sql_connection()
    try:
        products = products_dao.get_all_products(conn, g.user_id)
        return jsonify(products)
    finally:
        conn.close()

@app.route('/getUOM')
def get_uoms():
    conn = get_sql_connection()
    try:
        uoms = uom_dao.get_uoms(conn)
        return jsonify(uoms)
    finally:
        conn.close()

@app.route('/insertProduct', methods=['POST', 'OPTIONS'])
@require_auth
def insert_product():
    if request.method == 'OPTIONS':
        return '', 200

    conn = get_sql_connection()
    try:
        data = request.get_json(force=True)
        product = {
            'name': data['product_name'],
            'uom_id': data['uom_id'],
            'price_per_unit': data['price_per_unit'],
            'user_id': g.user_id
        }
        product_id = products_dao.insert_new_product(conn, product)
        return jsonify({'product_id': product_id})
    finally:
        conn.close()

@app.route('/deleteProduct', methods=['POST'])
@require_auth
def delete_product():
    try:
        conn = get_sql_connection()
        data = request.get_json(force=True)
        product_id = int(data['product_id'])
        deleted_id = products_dao.delete_product(conn, product_id, g.user_id)
        return jsonify({'product_id': deleted_id}), 200
    except Exception as e:
        print("Error in /deleteProduct:", e)
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/insertOrder', methods=['POST'])
@require_auth
def insert_order():
    try:
        conn = get_sql_connection()
        order = request.get_json(force=True)
        order['user_id'] = g.user_id  # Inject authenticated user
        order_id = orders_dao.insert_order(conn, order)
        return jsonify({'order_id': order_id})
    except Exception as e:
        print("Error in /insertOrder:", e)
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/getAllOrders')
@require_auth
def get_all_orders():
    conn = get_sql_connection()
    try:
        orders = orders_dao.get_all_orders(conn, g.user_id)
        return jsonify(orders)
    finally:
        conn.close()

@app.route('/getOrderCount')
@require_auth
def get_order_count():
    conn = get_sql_connection()
    try:
        count = orders_dao.get_order_count(conn, g.user_id)
        return jsonify({'order_count': count})
    finally:
        conn.close()

@app.route('/getRecentOrders')
@require_auth
def get_recent_orders():
    conn = get_sql_connection()
    try:
        orders = orders_dao.get_recent_orders(conn, g.user_id)
        return jsonify(orders)
    finally:
        conn.close()

@app.route('/getOrderDetails/<int:order_id>')
@require_auth
def get_order_details(order_id):
    conn = get_sql_connection()
    try:
        details = orders_dao.get_order_details_by_order_id(conn, order_id, g.user_id)
        return jsonify(details)
    finally:
        conn.close()

@app.route('/getOrders')
@require_auth
def get_orders():
    conn = get_sql_connection()
    try:
        orders = orders_dao.get_orders(conn, g.user_id)
        return jsonify(orders)
    finally:
        conn.close()

@app.route('/getTotalRevenue', methods=['GET'])
@require_auth
def total_revenue():
    try:
        conn = get_sql_connection()
        revenue = orders_dao.get_total_revenue(conn, g.user_id)
        return jsonify({"totalRevenue": revenue})
    except Exception as e:
        print(f"Error fetching revenue: {e}")
        return jsonify({"error": "Failed to fetch revenue"}), 500
    finally:
        conn.close()

if __name__ == "__main__":
    app.run(port=5000, debug=True)
