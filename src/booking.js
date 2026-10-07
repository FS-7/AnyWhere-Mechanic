import { mysql_db, log, error, validateCoordinates } from "./shared.js";

export const getBooking = async (req, res) => {    
    //  Verify User
    const { user } = req

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
    return res.status(200).send(result[0])
};

export const getBookingMechanicView = async (req, res) => {    
    //  Verify User
    const { user } = req

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
    return res.status(200).send(result[0])
};

export const postBooking = async (req, res) => {
    //  Verify User
    const { user } = req

    if (!req.body)
        return res.status(400).send("Bad Request")

    log(user, "Started: POST_Booking Module")

    const garage_id = req.body.garage_id
    var latitude
    var longitude

    try {
        latitude = Number(req.body.latitude)
        longitude = Number(req.body.longitude)
    }
    catch(e){
        error(user, `Error ${e}`)
        return res.status(400).send("Error")
    }

    if(!garage_id)
        return res.status(400).send("Garage not exist")

    if(!validateCoordinates(latitude, longitude))
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
        return res.status(500).send("Internal Server Error")
    }

    log(user, "Finished: POST_Booking Module")
    return res.status(200).send(`Success`)
};

export const accepted = async (req, res) => {
    //  Verify User
    const { user } = req
    
    if(!req.body)
        return res.status(400).send("No body")
    
    log(user, "Started: Updating Booking Status to ACCEPTED")

    //  DELETE BOOKING
    const sql = "UPDATE BOOKINGS SET STATUS='ACCEPTED' WHERE ID=? AND MECHANIC=? AND STATUS='INITIATED';"
    const parameters = [req.body.id, user]
    var result;

    try {
        result = await mysql_db.query(sql, parameters)
        if (result[0].affectedRows !== 1) {
            return res.status(404).send("Booking not found or unauthorized");
        }
    }
    catch(e){
        error(user, `${e}`)
        return res.status(400).send("Error")
    }
    
    log(user, "Finished: Updating Booking Status to ACCEPTED")
    return res.status(200).send("Success")

}

export const rejected = async (req, res) => {
    //  Verify User
    const { user } = req
    
    if(!req.body)
        return res.status(400).send("No body")
    
    log(user, "Started: Updating Booking Status to REJECTED")

    const sql = "UPDATE BOOKINGS B INNER JOIN GARAGES G ON B.GARAGE == G.ID SET STATUS='REJECTED' WHERE ID=? AND G.USER=? AND STATUS='INITIATED';"
    const parameters = [req.body.id, user]
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
    //  Verify User
    const { user } = req
    
    if(!req.body)
        return res.status(400).send("No body")

    log(user, "Started: Updating Booking Status to ARRIVED")

    const sql = "UPDATE BOOKINGS SET STATUS='ARRIVED' WHERE ID=? AND USER=? AND STATUS='ACCEPTED';"
    const parameters = [req.body.id, user]
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
    //  Verify User
    const { user } = req
    
    if(!req.body)
        return res.status(400).send("No body")
    
    log(user, "Started: Updating Booking Status to ARRIVED")

    const sql = "UPDATE BOOKINGS SET STATUS='NOT ARRIVED' WHERE ID=? AND USER=? AND STATUS='ACCEPTED';"
    const parameters = [req.body.id, user]
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
    //  Verify User
    const { user } = req
    
    if(!req.body)
        return res.status(400).send("No body")
    
    log(user, "Started: Updating Booking Status to COMPLETED")

    const sql = "UPDATE BOOKINGS SET STATUS='COMPLETED' WHERE ID=? AND USER=? AND STATUS='ARRIVED';"
    const parameters = [req.body.id, user]
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
    //  Verify User
    const { user } = req
    
    if(!req.body)
        return res.status(400).send("No body")

    log(user, "Started: Updating Booking Status to NOT COMPLETED")

    const sql = "UPDATE BOOKINGS SET STATUS='NOT COMPLETED' WHERE ID=? AND USER=? AND STATUS='ARRIVED';"
    const parameters = [req.body.id, user]
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
    //  Verify User
    const { user } = req
    
    if(!req.body)
        return res.status(400).send("No body")
    
    log(user, "Started: Delete_Booking Module")

    const sql = "DELETE FROM BOOKINGS WHERE ID=? AND USER=?;"
    const parameters = [req.body.id, user]
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
