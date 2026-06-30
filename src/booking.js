import { mysql_db, log, error, validateCoordinates } from "./shared.js";
import { getUser } from "./user_management.js";

export const getBooking = async (req, res) => {    
    //  Verify User
    const { authorization } = req.headers
    if(!authorization)
        return res.status(401).send("No Auth Header")

    const token = authorization.split(" ")[1]
    const user = await getUser(token)
    
    log(user, "Started: Get_Booking Module")

    if(!user)
        return res.status(401).send("Relogin")
    
    //  Get requests 
    const sql = "SELECT UB.B_ID, UB.FIRST_NAME, UB.LAST_NAME, UG.GARAGE_NAME, UG.ADDRESS, UB.DATE_TIME, UB.STATUS FROM (SELECT B.ID AS B_ID, B.GARAGE, B.USER, U.FIRST_NAME, U.LAST_NAME, B.DATE_TIME, B.STATUS FROM BOOKINGS B INNER JOIN USERS U ON U.ID = B.USER) UB INNER JOIN (SELECT U.ID AS USER, G.ID AS GARAGE, G.GARAGE_NAME, G.ADDRESS FROM USERS U INNER JOIN GARAGES G ON U.ID=G.USER) UG ON UB.GARAGE = UG.GARAGE WHERE UB.USER=?;"
    const parameters = [user]
    var result;

    try {
        result = await mysql_db.query(sql, parameters)
    }
    catch(e){
        error(user, `${e}`)
        return res.status(400).send("Error")
    }

    log(user, "Finished: Get_Booking Module")    
    return res.status(200).send({result: result[0]})
};

export const getBookingAsMechanic = async (req, res) => {    
    //  Verify User
    const { authorization } = req.headers
    if(!authorization)
        return res.status(401).send("No Auth Header")

    const token = authorization.split(" ")[1]
    const user = await getUser(token)
    
    log(user, "Started: Get_Booking_as_Mechanic Module")

    if(!user)
        return res.status(401).send("Relogin")
    
    //  Get requests 
    const sql = "SELECT UB.B_ID, UB.FIRST_NAME, UB.LAST_NAME, UG.GARAGE_NAME, UG.ADDRESS, UB.DATE_TIME, UB.STATUS FROM (SELECT B.ID AS B_ID, B.GARAGE, B.USER, U.FIRST_NAME, U.LAST_NAME, B.DATE_TIME, B.STATUS FROM BOOKINGS B INNER JOIN USERS U ON U.ID = B.USER) UB INNER JOIN (SELECT U.ID AS USER, G.ID AS GARAGE, G.GARAGE_NAME, G.ADDRESS FROM USERS U INNER JOIN GARAGES G ON U.ID=G.USER) UG ON UB.GARAGE = UG.GARAGE WHERE UB.STATUS='INITIATED' AND UG.USER=?;"
    const parameters = [user]
    var result;

    try {
        result = await mysql_db.query(sql, parameters)
    }
    catch(e){
        error(user, `${e}`)
        return res.status(400).send("Error")
    }

    log(user, "Finished: Get_Booking_as_Mechanic Module")    
    return res.status(200).send({result: result[0]})
};

export const postBooking = async (req, res) => {
    log(-1, req.headers)
    
    if (!req.body)
        return res.status(400).send("Bad Request")

    //  Verify User
    const { authorization } = req.headers
    if(!authorization)
        return res.status(401).send("No Auth Header")
    
    const token = authorization.split(" ")[1]
    const user = await getUser(token)

    log(user, "Started: POST_Booking Module")

    if(!user)
        return res.status(401).send("Relogin")

    const garage_id = req.body.garage_id
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

    if(!garage_id)
        return res.status(400).send("Garage not exist")

    if(validateCoordinates(latitude, longitude))
        return res.status(400).send("Enter proper positioning coordinates")
    
    //  Add booking for mechanic
    const sql = "INSERT INTO BOOKINGS (USER, GARAGE, LOC_LAT, LOC_LON) VALUES (?, ?, ?, ?);"
    const parameters = [user, garage_id, latitude, longitude]
    var result;

    try {
        result = await mysql_db.query(sql, parameters)
    }
    catch(e){
        error(user, `${e}`)
    }

    log(user, "Finished: POST_Booking Module")
    return res.status(200).send(`Success`)

};

export const accepted = async (req, res) => {
    if(!req.body)
        return res.status(400).send("No body")

    //  Verify User
    const { authorization } = req.headers
    if(!authorization)
        return res.status(401).send("No Auth Header")
    
    const token = authorization.split(" ")[1]
    const user = await getUser(token)
    
    log(user, "Started: Updating Booking Status to ACCEPTED")

    if(!user)
        return res.status(401).send("Relogin")

    //  DELETE BOOKING
    const sql = "UPDATE BOOKINGS SET STATUS='ACCEPTED' WHERE ID=?;"
    const parameters = [req.body.id]
    var result;

    try {
        result = await mysql_db.query(sql, parameters)
    }
    catch(e){
        error(user, `${e}`)
        return res.status(400).send("Error")
    }
    
    log(user, "Finished: Updating Booking Status to ACCEPTED")
    return res.status(200).send("Success")

}

export const rejected = async (req, res) => {
    if(!req.body)
        return res.status(400).send("No body")

    //  Verify User
    const { authorization } = req.headers
    if(!authorization)
        return res.status(401).send("No Auth Header")
    
    const token = authorization.split(" ")[1]
    const user = await getUser(token)
    
    log(user, "Started: Updating Booking Status to REJECTED")

    if(!user)
        return res.status(401).send("Relogin")

    //  DELETE BOOKING
    const sql = "UPDATE BOOKINGS SET STATUS='REJECTED' WHERE ID=?;"
    const parameters = [req.body.id]
    var result;

    try {
        result = await mysql_db.query(sql, parameters)
    }
    catch(e){
        error(user, `${e}`)
        return res.status(400).send("Error")
    }
    
    log(user, "Finished: Updating Booking Status to REJECTED")
    return res.status(200).send("Success")

}

export const arrived = async (req, res) => {
    if(!req.body)
        return res.status(400).send("No body")

    //  Verify User
    const { authorization } = req.headers
    if(!authorization)
        return res.status(401).send("No Auth Header")
    
    const token = authorization.split(" ")[1]
    const user = await getUser(token)
    
    log(user, "Started: Updating Booking Status to ARRIVED")

    if(!user)
        return res.status(401).send("Relogin")

    //  DELETE BOOKING
    const sql = "UPDATE BOOKINGS SET STATUS='ARRIVED' WHERE ID=?;"
    const parameters = [req.body.id]
    var result;

    try {
        result = await mysql_db.query(sql, parameters)
    }
    catch(e){
        error(user, `${e}`)
        return res.status(400).send("Error")
    }
    
    log(user, "Finished: Updating Booking Status to ARRIVED")
    return res.status(200).send("Success")

}

export const notArrived = async (req, res) => {
    if(!req.body)
        return res.status(400).send("No body")

    //  Verify User
    const { authorization } = req.headers
    if(!authorization)
        return res.status(401).send("No Auth Header")
    
    const token = authorization.split(" ")[1]
    const user = await getUser(token)
    
    log(user, "Started: Updating Booking Status to ARRIVED")

    if(!user)
        return res.status(401).send("Relogin")

    //  DELETE BOOKING
    const sql = "UPDATE BOOKINGS SET STATUS='NOT ARRIVED' WHERE ID=?;"
    const parameters = [req.body.id]
    var result;

    try {
        result = await mysql_db.query(sql, parameters)
    }
    catch(e){
        error(user, `${e}`)
        return res.status(400).send("Error")
    }
    
    log(user, "Finished: Updating Booking Status to NOT ARRIVED")
    return res.status(200).send("Success")

}

export const completed = async (req, res) => {
    if(!req.body)
        return res.status(400).send("No body")

    //  Verify User
    const { authorization } = req.headers
    if(!authorization)
        return res.status(401).send("No Auth Header")
    
    const token = authorization.split(" ")[1]
    const user = await getUser(token)
    
    log(user, "Started: Updating Booking Status to COMPLETED")

    if(!user)
        return res.status(401).send("Relogin")

    //  DELETE BOOKING
    const sql = "UPDATE BOOKINGS SET STATUS='COMPLETED' WHERE ID=?;"
    const parameters = [req.body.id]
    var result;

    try {
        result = await mysql_db.query(sql, parameters)
    }
    catch(e){
        error(user, `${e}`)
        return res.status(400).send("Error")
    }
    
    log(user, "Finished: Updating Booking Status to COMPLETED")
    return res.status(200).send("Success")

}

export const notCompleted = async (req, res) => {
    if(!req.body)
        return res.status(400).send("No body")
    
    //  Verify User
    const { authorization } = req.headers
    if(!authorization)
        return res.status(401).send("No Auth Header")
    
    const token = authorization.split(" ")[1]
    const user = await getUser(token)
    
    log(user, "Started: Updating Booking Status to NOT COMPLETED")

    if(!user)
        return res.status(401).send("Relogin")

    //  DELETE BOOKING
    const sql = "UPDATE BOOKINGS SET STATUS='NOT COMPLETED' WHERE ID=?;"
    const parameters = [req.body.id]
    var result;

    try {
        result = await mysql_db.query(sql, parameters)
    }
    catch(e){
        error(user, `${e}`)
        return res.status(400).send("Error")
    }
    
    log(user, "Finished: Updating Booking Status to NOT COMPLETED")
    return res.status(200).send("Success")

}

export const deleteBooking = async (req, res) => {
    if(!req.body)
        return res.status(400).send("No body")

    //  Verify User
    const { authorization } = req.headers
    if(!authorization)
        return res.status(401).send("No Auth Header")
    
    const token = authorization.split(" ")[1]
    const user = await getUser(token)
    
    log(user, "Started: Delete_Booking Module")

    if(!user)
        return res.status(401).send("Relogin")

    //  DELETE BOOKING
    const sql = "DELETE FROM BOOKINGS WHERE ID=?;"
    const parameters = [req.body.id]
    var result;

    try {
        result = await mysql_db.query(sql, parameters)
    }
    catch(e){
        error(user, `${e}`)
        return res.status(400).send("Error")
    }
    
    log(user, "Finished: Delete_Booking Module")
    return res.status(200).send("Success")

};
