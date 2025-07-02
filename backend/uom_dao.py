def get_uoms(connection):
    cursor = connection.cursor()
    query = "SELECT * FROM uom"
    cursor.execute(query)
    result = []
    for (uom_id, uom_name) in cursor:
        result.append({
            'uom_id': uom_id,
            'uom_name': uom_name
        })
    cursor.close()
    return result
