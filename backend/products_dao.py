def get_all_products(connection, user_id):
    with connection.cursor() as cursor:
        query = """
            SELECT p.product_id, p.name, p.uom_id, p.price_per_unit, u.uom_name
            FROM products p
            LEFT JOIN uom u ON p.uom_id = u.uom_id
            WHERE p.user_id = %s
        """
        cursor.execute(query, (user_id,))
        return [
            {
                'product_id': product_id,
                'name': name,
                'uom_id': uom_id,
                'price_per_unit': float(price_per_unit),
                'uom_name': uom_name
            }
            for (product_id, name, uom_id, price_per_unit, uom_name) in cursor.fetchall()
        ]


def insert_new_product(connection, product):
    with connection.cursor() as cursor:
        query = """
            INSERT INTO products (name, uom_id, price_per_unit, user_id)
            VALUES (%s, %s, %s, %s)
            RETURNING product_id
        """
        data = (
            product['name'],
            product['uom_id'],
            product['price_per_unit'],
            product['user_id']
        )
        cursor.execute(query, data)
        product_id = cursor.fetchone()[0]

    connection.commit()
    return product_id


def delete_product(connection, product_id, user_id):
    with connection.cursor() as cursor:
        query = "DELETE FROM products WHERE product_id = %s AND user_id = %s"
        cursor.execute(query, (product_id, user_id))

    connection.commit()
    return product_id
