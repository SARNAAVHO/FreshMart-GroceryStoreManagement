from datetime import timezone, timedelta

IST = timezone(timedelta(hours=5, minutes=30))

def insert_order(connection, order):
    with connection.cursor() as cursor:
        # Insert order
        cursor.execute(
            "INSERT INTO orders (customer_name, total, user_id) VALUES (%s, %s, %s) RETURNING order_id",
            (order['customer_name'], order['grand_total'], order['user_id'])
        )
        order_id = cursor.fetchone()[0]

        # Prepare order details
        order_details_query = (
            "INSERT INTO order_details (order_id, product_id, product_name, price_per_unit, quantity, total_price) "
            "VALUES (%s, %s, %s, %s, %s, %s)"
        )

        order_details_data = []
        for item in order['order_details']:
            cursor.execute(
                "SELECT name, price_per_unit FROM products WHERE product_id = %s AND user_id = %s",
                (item['product_id'], order['user_id'])
            )
            result = cursor.fetchone()
            if not result:
                raise Exception(f"Product with ID {item['product_id']} not found for user.")
            product_name, price_per_unit = result

            total_price = item['quantity'] * price_per_unit
            order_details_data.append((
                order_id, item['product_id'], product_name, price_per_unit, item['quantity'], total_price
            ))

        # Bulk insert all order items
        cursor.executemany(order_details_query, order_details_data)

    connection.commit()
    return order_id


def get_all_orders(connection, user_id):
    with connection.cursor() as cursor:
        query = """
            SELECT od.order_id, od.quantity, od.total_price, od.product_name, od.price_per_unit
            FROM order_details od
            JOIN orders o ON od.order_id = o.order_id
            WHERE o.user_id = %s
        """
        cursor.execute(query, (user_id,))
        return [
            {
                'order_id': order_id,
                'quantity': quantity,
                'total_price': float(total_price),
                'name': name,
                'price_per_unit': float(price_per_unit)
            }
            for (order_id, quantity, total_price, name, price_per_unit) in cursor.fetchall()
        ]


def get_order_count(connection, user_id):
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM orders WHERE user_id = %s", (user_id,))
        (count,) = cursor.fetchone()
        return count


def get_recent_orders(connection, user_id, limit=5):
    with connection.cursor() as cursor:
        query = """
            SELECT order_id, customer_name, total, datetime
            FROM orders
            WHERE user_id = %s
            ORDER BY datetime DESC
            LIMIT %s
        """
        cursor.execute(query, (user_id, limit))
        return [
            {
                'order_id': order_id,
                'customer_name': customer_name,
                'total': float(total),
                'datetime': dt.replace(tzinfo=timezone.utc).astimezone(IST).strftime('%Y-%m-%d %H:%M:%S') if dt else None
            }
            for (order_id, customer_name, total, dt) in cursor.fetchall()
        ]


def get_order_details_by_order_id(connection, order_id, user_id):
    with connection.cursor() as cursor:
        # Ensure the order belongs to the user
        cursor.execute("SELECT user_id FROM orders WHERE order_id = %s", (order_id,))
        row = cursor.fetchone()
        if not row or row[0] != user_id:
            return []

        cursor.execute("""
            SELECT product_id, product_name, quantity, price_per_unit, total_price
            FROM order_details
            WHERE order_id = %s
        """, (order_id,))

        return [
            {
                'product_id': product_id,
                'name': name,
                'quantity': quantity,
                'price_per_unit': float(price_per_unit),
                'total_price': float(total_price)
            }
            for (product_id, name, quantity, price_per_unit, total_price) in cursor.fetchall()
        ]


def get_orders(connection, user_id):
    with connection.cursor() as cursor:
        query = """
            SELECT 
                o.order_id,
                o.customer_name,
                o.total,
                o.datetime,
                COUNT(od.product_id) AS item_count
            FROM orders o
            LEFT JOIN order_details od ON o.order_id = od.order_id
            WHERE o.user_id = %s
            GROUP BY o.order_id
            ORDER BY o.datetime DESC
        """
        cursor.execute(query, (user_id,))
        return [
            {
                'order_id': order_id,
                'customer_name': customer_name,
                'total': float(total),
                'datetime': dt.replace(tzinfo=timezone.utc).astimezone(IST).strftime('%d %b %Y, %I:%M %p'),
                'item_count': item_count
            }
            for (order_id, customer_name, total, dt, item_count) in cursor.fetchall()
        ]


def get_total_revenue(connection, user_id):
    with connection.cursor() as cursor:
        cursor.execute("SELECT SUM(total) AS totalRevenue FROM orders WHERE user_id = %s", (user_id,))
        (revenue,) = cursor.fetchone()
        return revenue if revenue is not None else 0
