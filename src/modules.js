import { mysql_db, log, error, validateName, validateCoordinates, frontend_URL } from './shared.js'
import { getUser } from './user_management.js';

//  FEATURES
export const nearbyMechanics = async (req, res) => {
    //  Verify User
    const { authorization } = req.headers
    if(!authorization)
        return res.status(401).send("No Auth Header")

    const token = authorization.split(" ")[1]
    const user = await getUser(token)
    
    log(user, "Started: Get_Booking Module")

    if(!user)
        return res.status(401).send("Relogin")

    //  Get password from database using email and Verify 
    const sql = "SELECT * FROM GARAGES;"
    const parameters = []
    var result;

    try {
        result = await mysql_db.query(sql, parameters)
    }
    catch(e){
        error(user, `${e}`)
        return res.status(400).send("Error")
    }

    log(user, "Finished: Nearby_Mechanics Module")
    return res.status(200).send({result: result[0]})
};

//  MECHANIC MODULE
export const getMechanic = async (req, res) => {
    //  Verify User
    const { authorization } = req.headers
    if(!authorization)
        return res.status(401).send("No Auth Header")
    
    const token = authorization.split(" ")[1]
    const user = await getUser(token)
    
    log(user, "Started: get Mechanic")

    if(!user)
        return res.status(401).send("Relogin")

    const sql = "SELECT * FROM GARAGES WHERE USER=?"
    const parameters = [user]
    var result

    try {
        result = await mysql_db.query(sql, parameters)
    }
    catch(e){
        error(user, `${e}`)
        return res.status(400).send("Error")
    }
    log(user, "Finished: get Mechanic")
    return res.status(200).send({result: result[0]})
}

export const postMechanic = async (req, res) => {
    if (!req.body)
        return res.status(400).send("No data")

    //  Verify User
    const { authorization } = req.headers
    if(!authorization)
        return res.status(401).send("No Auth Header")
    
    const token = authorization.split(" ")[1]
    const user = await getUser(token)
    
    log(user, "Started: post Mechanic")

    if(!user)
        return res.status(401).send(`Success`)
    
    const { garage_name, address, pincode } = req.body
    var latitude
    var longitude

    try {
        latitude = parseFloat(req.body.latitude)
        longitude = parseFloat(req.body.longitude)
    }
    catch(e){
        error(user, `Error ${e}`)
        return res.status(400).send("Error")
    }

    if (!validateName(garage_name))
        return res.status(400).send("No name")

    if (validateCoordinates(latitude, longitude))
        return res.status(400).send("No coordinates")

    if (!(address && address.length > 0 && address.length < 256))
        return res.status(400).send("No address")

    if (!(pincode && pincode.length > 4 && pincode.length < 6))
        return res.status(400).send("No pincode")

    //  Add to database
    const sql = "INSERT INTO GARAGES (USER, GARAGE_NAME, LOC_LAT, LOC_LON, ADDRESS, PINCODE) VALUES (?, ?, ?, ?, ?, ?);"
    const parameters = [user, garage_name, latitude, longitude, address, pincode]
    var result;

    try {
        result = await mysql_db.query(sql, parameters)
    }
    catch(e){
        error(user, `${e}`)
        return res.status(400).send("Error")
    }

    log(user, "Finished: post Mechanic")
    return res.status(200).send(`Success`)
};

export const deleteMechanic = async (req, res) => {
    if (!req.body)
        return res.status(400).send("No data")

    //  Verify User
    const { authorization } = req.headers
    if(!authorization)
        return res.status(401).send("No Auth Header")
    
    const token = authorization.split(" ")[1]
    const user = await getUser(token)
    
    log(user, "Started: delete Mechanic")   
    
    if(!user)
        return res.status(401).send("Relogin")
    
    const { id } = req.body

    const sql = "DELETE FROM GARAGES WHERE ID=?;"
    const parameters = [id]
    var result;

    try {
        result = await mysql_db.query(sql, parameters)
    }
    catch(e){
        error(user, `${e}`)
        return res.status(400).send("Error")
    }

    log(user, "Finished: delete Mechanic")
    return res.status(200).send("Success")
   
}

export const notifications = async (req, res) => {
    if (!req.body)
        return res.status(400).send("Bad Request")

    //  Verify User
    const { authorization } = req.headers
    if(!authorization)
        return res.status(401).send("No Auth Header")
    
    const token = authorization.split(" ")[1]
    const user = await getUser(token)
    
    log(user, "Started: Notification Module")

    if(!user)
        return res.status(401).send("Relogin")

    const sql = "SELECT * FROM NOTIFICATIONS WHERE user=?;"
    const parameters = [user.id]
    var result;

    try {
        result = await mysql_db.query(sql, parameters)
    }
    catch(e){
        error(user, `${e}`)
        return res.status(400).send("Error")
    }

    log(user, `Result: ${result}`)
    log(user, "Finished: Notification Module")
    return res.status().send("Success")
    
};
