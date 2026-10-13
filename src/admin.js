import { mysql_db, log, error, Authorize, addToNotifications } from './shared.js'

export const fetchUsers = async (req, res) => {
    const user = req.user
    const connection = await mysql_db.getConnection()
        
    try {
        log(req.ip, req.path, req.method, user, 'Started')

        if(!await Authorize(user, 'get_admin', connection)){
            error(req.ip, req.path, req.method, user, 'You are not admin')
            return res.status(403).send('You are not admin')
        }
        const { limit, offset } = req

        const sql  = 'SELECT ID, FIRST_NAME, LAST_NAME, PHONE, EMAIL, IS_MECHANIC, IS_ADMIN FROM USERS ORDER BY ID LIMIT ? OFFSET ?;'
        const [rows] = await connection.query(sql, [limit, offset])

        if (!rows ||  rows.length < 1){
            log(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(204).json([])
        }

        log(req.ip, req.path, req.method, user, 'Done')
        return res.status(200).json(rows)
    }
    catch(e){
        error(req.ip, req.path, req.method, user, e.message)
        return res.status(500).send('Internal Server Error')
    } 
    finally {
        connection.release();
    }
}

export const fetchGarages = async (req, res) => {
    const user = req.user
    const connection = await mysql_db.getConnection()
        
    try {
        log(req.ip, req.path, req.method, user, 'Started')

        if(!await Authorize(user, 'get_admin', connection)){
            error(req.ip, req.path, req.method, user, 'You are not admin')
            return res.status(403).send('You are not admin')
        }
        const { limit, offset } = req

        const sql = 'SELECT G.ID, U.FIRST_NAME, U.LAST_NAME, G.GARAGE_NAME, G.ADDRESS, G.PINCODE, G.LOC_LAT, G.LOC_LON FROM GARAGES G INNER JOIN USERS U ON U.ID=G.USER ORDER BY G.ID LIMIT ? OFFSET ?;'
        const [rows] = await connection.query(sql, [limit, offset])

        if (!rows ||  rows.length < 1){
            log(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(204).json([])
        }

        log(req.ip, req.path, req.method, user, 'Done')
        return res.status(200).json(rows)
    }
    catch(e){
        error(req.ip, req.path, req.method, user, e.message)
        return res.status(500).send('Internal Server Error')
    } 
    finally {
        connection.release();
    }
}

export const fetchBookings = async (req, res) => {
    const user = req.user
    const connection = await mysql_db.getConnection()
        
    try {
        log(req.ip, req.path, req.method, user, 'Started')

        if(!await Authorize(user, 'get_admin', connection)){
            error(req.ip, req.path, req.method, user, 'You are not admin')
            return res.status(403).send('You are not admin')
        }
        const { limit, offset } = req

        const sql = 'SELECT UB.B_ID, UB.FIRST_NAME, UB.LAST_NAME, G.GARAGE_NAME, G.ADDRESS, UB.DATE_TIME, UB.STATUS FROM (SELECT B.ID AS B_ID, B.GARAGE, B.USER, U.FIRST_NAME, U.LAST_NAME, B.DATE_TIME, B.STATUS FROM BOOKINGS B INNER JOIN USERS U ON U.ID = B.USER) UB INNER JOIN GARAGES G ON UB.GARAGE = G.ID ORDER BY UB.B_ID LIMIT ? OFFSET ?;'
        const [rows] = await connection.query(sql, [limit, offset])

        if (!rows ||  rows.length < 1){
            log(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(204).json([])
        }

        log(req.ip, req.path, req.method, user, 'Done')
        return res.status(200).json(rows)
    }
    catch(e){
        error(req.ip, req.path, req.method, user, e.message)
        return res.status(500).send('Internal Server Error')
    } 
    finally {
        connection.release();
    }
}

export const deleteUser = async (req, res) => {
    const user = req.user
    const connection = await mysql_db.getConnection()
    
    try{        
        log(req.ip, req.path, req.method, user, 'Started')

        if(!await Authorize(user, 'delete_user', connection)){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }

        if(!req.body) {
            error(req.ip, req.path, req.method, user, 'No data received')
            return res.status(400).send('No data received')
        }

        const { id }  = req.body

        const targetId = Number(id);

        if (!Number.isInteger(targetId) || targetId <= 0) {
            error(req.ip, req.path, req.method, user, 'Invalid user ID')
            return res.status(400).send('Invalid user ID');
        }

        await connection.beginTransaction()
        
        var sql = 'DELETE FROM USERS WHERE ID=?'
        const parameters = [targetId]
        const [rows] = await connection.query(sql, parameters)

        if (rows.affectedRows < 1) {
            await connection.rollback()
            error(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(400).send('No Rows')
        }

        await addToNotifications(user, `User ${targetId} has been deleted`, connection)

        await connection.commit()
        log(req.ip, req.path, req.method, user, 'Done')
        return res.status(200).send(`Success`)
    }
    catch(e){
        await connection.rollback()
        error(req.ip, req.path, req.method, user, e.message)
        return res.status(500).send('Internal Server Error')
    }
    finally {
        connection.release();
    }
}

export const deleteBookingAsAdmin = async (req, res) => {
    const user = req.user
    const connection = await mysql_db.getConnection()
    
    try {
        log(req.ip, req.path, req.method, user, 'Started')

        if (!req.body) {
            error(req.ip, req.path, req.method, req.ip, req.path, req.method, user, 'No data received')
            return res.status(400).send('No data received')
        }
        
        if(!await Authorize(user, 'delete_any_booking', connection)){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }

        const { booking_id } = req.body

        if(!booking_id) {
            error(req.ip, req.path, req.method, user, 'Booking ID Required')
            return res.status(400).send('Booking ID Required')
        }
        
        await connection.beginTransaction()

        const sql = `DELETE FROM BOOKINGS WHERE ID=?;`
        const parameters = [booking_id]
        const [rows] = await connection.query(sql, parameters)

        if (rows.affectedRows < 1){
            await connection.rollback()
            error(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(500).send('No Rows')
        }

        await addToNotifications(user, `Booking ${booking_id} has been removed`, connection)
        // await addToNotifications(customer, `Admin has removed a booking done by you`, connection) // User
        // await addToNotifications(mechanic, `Admin has removed a booking assigned to you`, connection) // Mechanic

        await connection.commit()
        log(req.ip, req.path, req.method, user, 'Done')
        return res.status(200).send('Success')
    }
    catch(e){
        await connection.rollback()
        error(req.ip, req.path, req.method, user, e.message)
        return res.status(500).send('Internal Server Error')
    }
    finally {
        connection.release();
    }
};

export const updateBookingStatus = async (req, res) => {
    const user = req.user
    const connection = await mysql_db.getConnection()

    try {
        log(req.ip, req.path, req.method, user, 'Started')
        
        if (!req.body) {
            error(req.ip, req.path, req.method, req.ip, req.path, req.method, user, 'No data received')
            return res.status(400).send('No data received')
        }
        
        if(!await Authorize(user, 'update_booking_status', connection)){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }

        const { booking_id, status } = req.body

        if(!booking_id) {
            error(req.ip, req.path, req.method, user, 'Booking ID Required')
            return res.status(400).send('Booking ID Required')
        }
        
        if(!status) {
            error(req.ip, req.path, req.method, user, 'Status Required')
            return res.status(400).send('Status Required')
        }

        await connection.beginTransaction()

        const sql = `UPDATE BOOKINGS SET STATUS=? WHERE ID=?;`
        const parameters = [status, booking_id]
        const [rows] = await connection.query(sql, parameters)

        if (rows.affectedRows < 1){
            await connection.rollback()
            error(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(500).send('No Rows')
        }

        await addToNotifications(user, `Booking ${booking_id} status is updated to ${status}`, connection)
        // await addToNotifications(customer, `Admin has updated booking status to ${status}`, connection) // User
        // await addToNotifications(mechanic, `Admin has updated booking status to ${status}`, connection) // Mechanic

        await connection.commit()
        log(req.ip, req.path, req.method, user, 'Done')
        return res.status(200).send('Success')
    }
    catch(e){
        await connection.rollback()
        error(req.ip, req.path, req.method, user, e.message)
        return res.status(500).send('Internal Server Error')
    }
    finally {
        connection.release();
    }
}
