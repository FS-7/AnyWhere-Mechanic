import { mysql_db, log, error, validateName, validateCoordinates, validatePincode, Authorize, addToNotifications } from './shared.js'

//  FEATURES
export const nearbyMechanics = async (req, res) => {
    const user = req.user
    const connection = await mysql_db.getConnection()
    
    try {
        log(req.ip, req.path, req.method, user, 'Started')

        if(!await Authorize(user, 'get_nearby_mechanics', connection)){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }

        const { limit, offset } = req
        const latitude = Number(req.query.latitude)
        const longitude = Number(req.query.longitude)

        if (!latitude || !longitude){
            log(req.ip, req.path, req.method, user, 'No Latitude and Longitude')
            return res.status(400).send('Latitude and Longitude parameters are required')
        }

        if(!validateCoordinates(latitude, longitude)) {
            error(req.ip, req.path, req.method, user, 'Invalid Coordinates')
            return res.status(400).send('Invalid Coordinates')
        }
        
        const sql = 'SELECT ID, GARAGE_NAME, ADDRESS, PINCODE, LOC_LAT, LOC_LON, 6371 * ACOS(LEAST(1, GREATEST(-1, COS(RADIANS(?)) * COS(RADIANS(LOC_LAT)) * COS(RADIANS(LOC_LON) - RADIANS(?)) + SIN(RADIANS(?)) * SIN(RADIANS(LOC_LAT))))) AS DISTANCE FROM GARAGES WHERE USER != ? ORDER BY DISTANCE LIMIT ? OFFSET ?;'
        const parameters = [latitude, longitude, latitude, user, limit, offset]
        const [rows] = await connection.query(sql, parameters)

        if (!rows ||  rows.length < 1){
            log(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(204).send([])
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

//  MECHANIC MODULE
export const getMechanic = async (req, res) => {
    const user = req.user
    const connection = await mysql_db.getConnection()
    
    try {
        log(req.ip, req.path, req.method, user, 'Started')
        
        if(!await Authorize(user, 'get_garage', connection)){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(204).send([])
        }

        const { limit, offset } = req

        const sql = 'SELECT * FROM GARAGES WHERE USER = ? LIMIT ? OFFSET ?'
        const parameters = [user, limit, offset]
        const [rows] = await connection.query(sql, parameters)

        if (!rows ||  rows.length < 1){
            log(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(204).send([])
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
}

export const postMechanic = async (req, res) => {
    const user = req.user
    const connection = await mysql_db.getConnection()

    try {
        log(req.ip, req.path, req.method, user, 'Started')
        
        if(!req.body) {
            error(req.ip, req.path, req.method, user, 'No data received')
            return res.status(400).send('No data received')
        }

        if(!await Authorize(user, 'post_garage', connection)){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }
        
        const { garage_name, address, pincode } = req.body
        const latitude = Number(req.body.latitude)
        const longitude = Number(req.body.longitude)

        if (!validateName(garage_name)) {
            error(req.ip, req.path, req.method, user, 'Invalid Garage Name')
            return res.status(400).send('Invalid Garage Name')
        }
        
        if (!validateCoordinates(latitude, longitude)) {
            error(req.ip, req.path, req.method, user, 'Invalid Coordinates')
            return res.status(400).send('Invalid Coordinates')
        }

        if (!(address && address.length > 0 && address.length < 256)) {
            error(req.ip, req.path, req.method, user, 'Invalid Address')
            return res.status(400).send('Invalid Address')
        }

        if (!validatePincode(pincode)) {
            error(req.ip, req.path, req.method, user, 'Invalid Pincode')
            return res.status(400).send('Invalid Pincode')
        }

        var sql;
        var parameters;

        await connection.beginTransaction()

        sql = 'INSERT INTO GARAGES (USER, GARAGE_NAME, LOC_LAT, LOC_LON, ADDRESS, PINCODE) VALUES (?, ?, ?, ?, ?, ?);'
        parameters = [user, garage_name, latitude, longitude, address, pincode]
        const [rows_1] = await connection.query(sql, parameters)

        if (rows_1.affectedRows < 1){
            await connection.rollback()
            error(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(500).send('No Rows')
        }

        sql = 'UPDATE USERS SET IS_MECHANIC=TRUE WHERE ID=?;'
        parameters = [user]
        const [rows_2] = await connection.query(sql, parameters)

        if (rows_2.affectedRows < 1){
            await connection.rollback()
            error(req.ip, req.path, req.method, user, 'Internal Server Error')
            return res.status(500).send('Internal Server Error')
        }
        await addToNotifications(user, `Garage ${garage_name} is added. You are given priviledge of Mechanic.`, connection)

        await connection.commit()

        log(req.ip, req.path, req.method, user, 'Done')
        return res.status(200).send(`Success`)
    }
    catch(e){
        connection.rollback()
        error(req.ip, req.path, req.method, user, e.message)
        return res.status(500).send('Internal Server Error')
    }
    finally {
        connection.release();
    }
};

export const deleteMechanic = async (req, res) => {
    const user = req.user
    const connection = await mysql_db.getConnection()
    
    try {        
        log(req.ip, req.path, req.method, user, 'Started')   

        if (!req.body) {
            error(req.ip, req.path, req.method, user, 'No data received')
            return res.status(400).send('No data received')
        }

        if(!await Authorize(user, 'delete_garage', connection)){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }

        const { id } = req.body

        var sql
        var parameters

        await connection.beginTransaction()
        
        sql = 'DELETE FROM GARAGES WHERE ID=? AND USER=?;'
        parameters = [id, user]
        const [rows_1] = await connection.query(sql, parameters)
        
        if (rows_1.affectedRows < 1){
            await connection.rollback()
            error(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(500).send('No Rows')
        }

        sql = 'UPDATE USERS SET IS_MECHANIC=FALSE WHERE ID=?;'
        parameters = [user]
        const [rows_2] = await connection.query(sql, parameters)

        if (rows_2.affectedRows < 1){
            await connection.rollback()
            error(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(500).send('No Rows')
        }
        await addToNotifications(user, `Garage is removed. You are no longer Mechanic`, connection)

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

export const notifications = async (req, res) => {
    const user = req.user
    const connection = await mysql_db.getConnection()

    try {
        log(req.ip, req.path, req.method, user, 'Started') 

        const sql = 'SELECT TIME, MESSAGE FROM NOTIFICATIONS WHERE USER=? ORDER BY TIME DESC LIMIT 5;'
        const parameters = [user]
        const [rows] = await connection.query(sql, parameters)
        
        if (!rows ||  rows.length < 1){
            log(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(204).send([])
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
