import { connection, log, error, validateName, validateCoordinates, validatePincode, Authorize } from './shared.js'

//  FEATURES
export const nearbyMechanics = async (req, res) => {
    const user = req.user
    
    try {
        log(req.ip, req.path, req.method, user, 'Started')
        
        if(!Authorize(user, 'get_nearby_mechanics')){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }

        const sql = 'SELECT * FROM GARAGES WHERE USER != ?;'
        const parameters = [user]
        const [rows] = await connection.query(sql, parameters)

        if (!rows && rows.length < 1) {
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
};

//  MECHANIC MODULE
export const getMechanic = async (req, res) => {
    const user = req.user
    
    try {
        log(req.ip, req.path, req.method, user, 'Started')
        
        if(!Authorize(user, 'get_garage')){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }

        const sql = 'SELECT * FROM GARAGES WHERE USER=?'
        const parameters = [user]
        const [rows] = await connection.query(sql, parameters)

        if (!rows && rows.length < 1) {
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
}

export const postMechanic = async (req, res) => {
    const user = req.user

    try {
        log(req.ip, req.path, req.method, user, 'Started')
        
        if(!req.body) {
            error(req.ip, req.path, req.method, user, 'No data received')
            return res.status(400).send('No data received')
        }

        if(!Authorize(user, 'post_mechanic')){
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

        await connection.commit()

        log(req.ip, req.path, req.method, user, 'Done')
        return res.status(200).send(`Success`)
    }
    catch(e){
        connection.rollback()
        error(req.ip, req.path, req.method, user, e.message)
        return res.status(500).send('Internal Server Error')
    }
};

export const deleteMechanic = async (req, res) => {
    const user = req.user
    
    try {        
        log(req.ip, req.path, req.method, user, 'Started')   

        if (!req.body) {
            error(req.ip, req.path, req.method, user, 'No data received')
            return res.status(400).send('No data received')
        }

        if(!Authorize(user, 'delete_garage')){
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

        await connection.commit()

        log(req.ip, req.path, req.method, user, 'Done')
        return res.status(200).send('Success')  
    }
    catch(e){
        error(req.ip, req.path, req.method, user, e.message)
        await connection.rollback()
        return res.status(500).send('Internal Server Error')
    }
}

export const notifications = async (req, res) => {
    const user = req.user

    try {
        log(req.ip, req.path, req.method, user, 'Started') 

        if (!req.body) {
            error(req.ip, req.path, req.method, user, 'No data received')
            return res.status(400).send('No data received')
        }

        const sql = 'SELECT * FROM NOTIFICATIONS WHERE USER=?;'
        const parameters = [user]
        const [rows] = await connection.query(sql, parameters)
        
        if (rows[0].affectedRows < 1) {
            await connection.rollback()
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
};
