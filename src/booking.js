import { mysql_db, log, error, validateCoordinates, Authorize } from './shared.js';

export const getBooking = async (req, res) => {    
    const user = req.user
    const connection = await mysql_db.getConnection()

    try {
        log(req.ip, req.path, req.method, user, 'Started')
        
        if(!await Authorize(user, 'get_booking', connection)){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }
        
        const sql = 'SELECT UB.B_ID, UB.FIRST_NAME, UB.LAST_NAME, UG.GARAGE_NAME, UG.ADDRESS, UB.DATE_TIME, UB.STATUS FROM (SELECT B.ID AS B_ID, B.GARAGE, B.USER, U.FIRST_NAME, U.LAST_NAME, B.DATE_TIME, B.STATUS FROM BOOKINGS B INNER JOIN USERS U ON U.ID = B.USER) UB INNER JOIN (SELECT U.ID AS USER, G.ID AS GARAGE, G.GARAGE_NAME, G.ADDRESS FROM USERS U INNER JOIN GARAGES G ON U.ID=G.USER) UG ON UB.GARAGE = UG.GARAGE WHERE UB.USER=?;'
        const parameters = [user]
        const [rows] = await connection.query(sql, parameters)

        if (rows.affectedRows < 1){
            error(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(500).send('No Rows')
        }
        
        log(req.ip, req.path, req.method, user, 'Done')    
        return res.status(200).send(rows)
    }
    catch(e){
        error(req.ip, req.path, req.method, user, e.message)
        return res.status(500).send('Internal Server Error')
    }
    finally {
        connection.release();
    }
};

export const getBookingMechanicView = async (req, res) => {    
    const user = req.user
    const connection = await mysql_db.getConnection()

    try {
        log(req.ip, req.path, req.method, user, 'Started')
        
        if(!await Authorize(user, 'get_booking_mechanic', connection)){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }

        const sql = `SELECT UB.B_ID, UB.FIRST_NAME, UB.LAST_NAME, UG.GARAGE_NAME, UG.ADDRESS, UB.DATE_TIME, UB.STATUS FROM (SELECT B.ID AS B_ID, B.GARAGE, B.USER, U.FIRST_NAME, U.LAST_NAME, B.DATE_TIME, B.STATUS FROM BOOKINGS B INNER JOIN USERS U ON U.ID = B.USER) UB INNER JOIN (SELECT U.ID AS USER, G.ID AS GARAGE, G.GARAGE_NAME, G.ADDRESS FROM USERS U INNER JOIN GARAGES G ON U.ID=G.USER) UG ON UB.GARAGE = UG.GARAGE WHERE UB.STATUS='INITIATED' AND UG.USER=?;`
        const parameters = [user]
        const [rows] = await connection.query(sql, parameters)

        if (rows.affectedRows < 1){
            error(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(500).send('No Rows')
        }

        log(req.ip, req.path, req.method, user, 'Done')    
        return res.status(200).send(rows)
    }
    catch(e){
        error(req.ip, req.path, req.method, user, e.message)
        return res.status(500).send('Internal Server Error')
    }
    finally {
        connection.release();
    }
};

export const postBooking = async (req, res) => {
    const user = req.user
    const connection = await mysql_db.getConnection()

    try {
        log(req.ip, req.path, req.method, user, 'Started')
        
        if(!await Authorize(user, 'post_booking', connection)){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }

        if(!req.body) {
            error(req.ip, req.path, req.method, -1, 'No data received')
            return res.status(400).send('No data received')
        }
        
        const garage_id = req.body.garage_id
        const latitude = Number(req.body.latitude)
        const longitude = Number(req.body.longitude)

        if(!garage_id) {
            error(req.ip, req.path, req.method, user, 'Garage ID Required')
            return res.status(400).send('Garage ID Required')
        }

        if(!validateCoordinates(latitude, longitude)) {
            error(req.ip, req.path, req.method, user, 'Invalid Coordinates')
            return res.status(400).send('Invalid Coordinates')
        }
        
        await connection.beginTransaction()

        const sql = 'INSERT INTO BOOKINGS (USER, GARAGE, LOC_LAT, LOC_LON) VALUES (?, ?, ?, ?);'
        const parameters = [user, garage_id, latitude, longitude]
        const [rows] = await connection.query(sql, parameters)

        if (rows.affectedRows < 1){
            await connection.rollback()
            error(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(500).send('No Rows')
        }

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
};

export const accepted = async (req, res) => {
    const user = req.user
    const connection = await mysql_db.getConnection()
    
    try {
        log(req.ip, req.path, req.method, user, 'Started')
        
        if(!req.body) {
            error(req.ip, req.path, req.method, user, 'No data received')
            return res.status(400).send('No data received')
        }
        
        if(!await Authorize(user, 'update_accept_or_reject', connection)){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }
        
        const { garage_id } = req.body

        if(!garage_id) {
            error(req.ip, req.path, req.method, user, 'Garage ID Required')
            return res.status(400).send('Garage ID Required')
        }
        
        await connection.beginTransaction()

        const sql = `UPDATE BOOKINGS B INNER JOIN GARAGES G ON B.GARAGE = G.ID SET STATUS='ACCEPTED' WHERE ID=? AND G.USER=? AND STATUS='INITIATED';`
        const parameters = [garage_id, user]
        const [rows] = await connection.query(sql, parameters)

        if (rows.affectedRows < 1){
            await connection.rollback()
            error(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(500).send('No Rows')
        }

        await connection.commit()
        log(req.ip, req.path, req.method, user, 'Done: Updating')
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

export const rejected = async (req, res) => {
    const user = req.user
    const connection = await mysql_db.getConnection()
    
    try {
        log(req.ip, req.path, req.method, user, 'Started')
        
        if(!req.body) {
            error(req.ip, req.path, req.method, user, 'No data received')
            return res.status(400).send('No data received')
        }
        
        if(!await Authorize(user, 'update_accept_or_reject', connection)){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }

        const { garage_id } = req.body

        if(!garage_id) {
            error(req.ip, req.path, req.method, user, 'Garage ID Required')
            return res.status(400).send('Garage ID Required')
        }
        
        await connection.beginTransaction()

        const sql = `UPDATE BOOKINGS B INNER JOIN GARAGES G ON B.GARAGE = G.ID SET STATUS='REJECTED' WHERE ID=? AND G.USER=? AND STATUS='INITIATED';`
        const parameters = [garage_id, user]
        const [rows] = await connection.query(sql, parameters)

        if (rows.affectedRows < 1){
            await connection.rollback()
            error(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(500).send('No Rows')
        }

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

export const arrived = async (req, res) => {
    const user = req.user
    const connection = await mysql_db.getConnection()
    
    try {
        log(req.ip, req.path, req.method, user, 'Started')

        if (!req.body) {
            error(req.ip, req.path, req.method, req.ip, req.path, req.method, user, 'No data received')
            return res.status(400).send('No data received')
        }
        
        if(!await Authorize(user, 'update_arrived_or_not', connection)){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }

        const { garage_id } = req.body

        if(!garage_id) {
            error(req.ip, req.path, req.method, user, 'Garage ID Required')
            return res.status(400).send('Garage ID Required')
        }
        
        await connection.beginTransaction()

        const sql = `UPDATE BOOKINGS SET STATUS='ARRIVED' WHERE ID=? AND USER=? AND STATUS='ACCEPTED';`
        const parameters = [garage_id, user]
        const [rows] = await connection.query(sql, parameters)

        if (rows.affectedRows < 1){
            await connection.rollback()
            error(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(500).send('No Rows')
        }

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

export const notArrived = async (req, res) => {
    const user = req.user
    const connection = await mysql_db.getConnection()
    
    try {
        log(req.ip, req.path, req.method, user, 'Started')

        if (!req.body) {
            error(req.ip, req.path, req.method, req.ip, req.path, req.method, user, 'No data received')
            return res.status(400).send('No data received')
        }
        
        if(!await Authorize(user, 'update_arrived_or_not', connection)){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }

        const { garage_id } = req.body

        if(!garage_id) {
            error(req.ip, req.path, req.method, user, 'Garage ID Required')
            return res.status(400).send('Garage ID Required')
        }
        
        await connection.beginTransaction()

        const sql = `UPDATE BOOKINGS SET STATUS='NOT ARRIVED' WHERE ID=? AND USER=? AND STATUS='ACCEPTED';`
        const parameters = [garage_id, user]
        const [rows] = await connection.query(sql, parameters)

        if (rows.affectedRows < 1){
            await connection.rollback()
            error(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(500).send('No Rows')
        }

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

export const completed = async (req, res) => {
    const user = req.user
    const connection = await mysql_db.getConnection()
    
    try {
        log(req.ip, req.path, req.method, user, 'Started')
        
        if (!req.body) {
            error(req.ip, req.path, req.method, req.ip, req.path, req.method, user, 'No data received')
            return res.status(400).send('No data received')
        }
        
        if(!await Authorize(user, 'update_completed_or_not', connection)){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }

        const { garage_id } = req.body

        if(!garage_id) {
            error(req.ip, req.path, req.method, user, 'Garage ID Required')
            return res.status(400).send('Garage ID Required')
        }
        
        await connection.beginTransaction()

        const sql = `UPDATE BOOKINGS SET STATUS='COMPLETED' WHERE ID=? AND USER=? AND STATUS='ARRIVED';`
        const parameters = [garage_id, user]
        const [rows] = await connection.query(sql, parameters)

        if (rows.affectedRows < 1){
            await connection.rollback()
            error(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(500).send('No Rows')
        }

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

export const notCompleted = async (req, res) => {
    const user = req.user
    const connection = await mysql_db.getConnection()

    try {
        log(req.ip, req.path, req.method, user, 'Started')
        
        if (!req.body) {
            error(req.ip, req.path, req.method, req.ip, req.path, req.method, user, 'No data received')
            return res.status(400).send('No data received')
        }
        
        if(!await Authorize(user, 'update_completed_or_not', connection)){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }

        const { garage_id } = req.body

        if(!garage_id) {
            error(req.ip, req.path, req.method, user, 'Garage ID Required')
            return res.status(400).send('Garage ID Required')
        }
        
        await connection.beginTransaction()

        const sql = `UPDATE BOOKINGS SET STATUS='NOT COMPLETED' WHERE ID=? AND USER=? AND STATUS='ARRIVED';`
        const parameters = [garage_id, user]
        const [rows] = await connection.query(sql, parameters)

        if (rows.affectedRows < 1){
            await connection.rollback()
            error(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(500).send('No Rows')
        }

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

export const deleteBooking = async (req, res) => {
    const user = req.user
    const connection = await mysql_db.getConnection()
    
    try {
        log(req.ip, req.path, req.method, user, 'Started')

        if (!req.body) {
            error(req.ip, req.path, req.method, req.ip, req.path, req.method, user, 'No data received')
            return res.status(400).send('No data received')
        }
        
        if(!await Authorize(user, 'delete_booking', connection)){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }

        const { garage_id } = req.body

        if(!garage_id) {
            error(req.ip, req.path, req.method, user, 'Garage ID Required')
            return res.status(400).send('Garage ID Required')
        }
        
        await connection.beginTransaction()

        const sql = `DELETE FROM BOOKINGS WHERE ID=? AND USER=? AND STATUS='INITIATED';`
        const parameters = [garage_id, user]
        const [rows] = await connection.query(sql, parameters)

        if (rows.affectedRows < 1){
            await connection.rollback()
            error(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(500).send('No Rows')
        }

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
