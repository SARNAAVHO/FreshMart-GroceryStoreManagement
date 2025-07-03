def get_uoms(connection):
    cursor = connection.cursor()
    query = "SELECT uom_id, uom_name FROM uom"
    cursor.execute(query)
    result = []
    for (uom_id, uom_name) in cursor.fetchall():
        result.append({
            'uom_id': uom_id,
            'uom_name': uom_name
        })
    cursor.close()
    return result
