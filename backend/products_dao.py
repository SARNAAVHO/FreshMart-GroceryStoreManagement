def get_all_products(connection):
    cursor = connection.cursor()
    query = (
    "SELECT p.product_id, p.name, p.uom_id, p.price_per_unit, u.uom_name "
    "FROM products p LEFT JOIN uom u ON p.uom_id = u.uom_id"
)

    cursor.execute(query)
    result = []
    for (product_id, name, uom_id, price_per_unit, uom_name) in cursor:
        result.append({
            'product_id': product_id,
            'name': name,
            'uom_id': uom_id,
            'price_per_unit': price_per_unit,
            'uom_name': uom_name
        })
    cursor.close()
    return result

def insert_new_product(connection, product):
    cursor = connection.cursor()
    query = "INSERT INTO products (name, uom_id, price_per_unit) VALUES (%s, %s, %s)"
    data = (product['name'], product['uom_id'], product['price_per_unit'])
    cursor.execute(query, data)
    connection.commit()
    product_id = cursor.lastrowid
    cursor.close()
    return product_id

def delete_product(connection, product_id):
    cursor = connection.cursor()
    query = "DELETE FROM products WHERE product_id = %s"
    cursor.execute(query, (product_id,))
    connection.commit()
    cursor.close()
    return product_id
