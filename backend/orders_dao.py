def insert_order(connection, order):
    cursor = connection.cursor()

    query = "INSERT INTO orders (customer_name, total) VALUES (%s, %s)"
    cursor.execute(query, (order['customer_name'], order['grand_total']))
    order_id = cursor.lastrowid

    order_details_query = (
        "INSERT INTO order_details (order_id, product_id, quantity, total_price) "
        "VALUES (%s, %s, %s, %s)"
    )
    order_details_data = [
        (order_id, item['product_id'], item['quantity'], item['total_price'])
        for item in order['order_details']
    ]
    cursor.executemany(order_details_query, order_details_data)

    connection.commit()
    cursor.close()
    return order_id

def get_all_orders(connection):
    cursor = connection.cursor()
    query = (
    "SELECT od.order_id, od.quantity, (od.quantity * p.price_per_unit) AS total_price, "
    "p.name, p.price_per_unit "
    "FROM order_details od "
    "JOIN products p ON od.product_id = p.product_id"
)

    cursor.execute(query)
    result = []
    for (order_id, quantity, total_price, name, price_per_unit) in cursor:
        result.append({
            'order_id': order_id,
            'quantity': quantity,
            'total_price': total_price,
            'name': name,
            'price_per_unit': price_per_unit
        })
    cursor.close()
    return result

def get_order_count(connection):
    cursor = connection.cursor()
    query = "SELECT COUNT(DISTINCT order_id) FROM orders"
    cursor.execute(query)
    (count,) = cursor.fetchone()
    cursor.close()
    return count

def get_recent_orders(connection, limit=5):
    cursor = connection.cursor()
    query = (
        "SELECT order_id, customer_name, total, datetime "
        "FROM orders "
        "ORDER BY datetime DESC "
        f"LIMIT {limit}"
    )
    cursor.execute(query)
    result = []
    for (order_id, customer_name, total, dt) in cursor:
        result.append({
            'order_id': order_id,
            'customer_name': customer_name,
            'total': float(total),
            'datetime': dt.strftime('%Y-%m-%d %H:%M:%S')
        })
    cursor.close()
    return result

def get_order_details_by_order_id(connection, order_id):
    cursor = connection.cursor()
    query = (
        "SELECT od.product_id, p.name, od.quantity, p.price_per_unit, "
        "(od.quantity * p.price_per_unit) AS total_price "
        "FROM order_details od "
        "JOIN products p ON od.product_id = p.product_id "
        "WHERE od.order_id = %s"
    )
    cursor.execute(query, (order_id,))
    results = []
    for (product_id, name, quantity, price_per_unit, total_price) in cursor:
        results.append({
            'product_id': product_id,
            'name': name,
            'quantity': quantity,
            'price_per_unit': price_per_unit,
            'total_price': total_price
        })
    cursor.close()
    return results

def get_orders(connection):
    cursor = connection.cursor(dictionary=True)
    query = """
        SELECT 
            o.order_id,
            o.customer_name,
            o.total,
            o.datetime,
            COUNT(od.product_id) AS item_count
        FROM orders o
        LEFT JOIN order_details od ON o.order_id = od.order_id
        GROUP BY o.order_id
        ORDER BY o.datetime DESC
    """
    cursor.execute(query)
    result = cursor.fetchall()
    cursor.close()
    return result

