import {mysql_db, log, error, validateName, validateEmail, validatePhone, validatePassword, validatePasswords, hashPassword, comparePassword } from './shared.js'
import crypto from 'crypto'

//  ADMIN
export const admin = async (req, res) => {
    const { user } = req
    
    log(user, "Started: Admin")

    if(!user)
        return res.status(401).send('Relogin')

    var sql 
    const parameters = []
    
    sql = "SELECT IS_ADMIN FROM USERS WHERE ID=?;"
    const is_admin = await mysql_db.query(sql, [user])

    if(is_admin[0][0]['IS_ADMIN'] != 1)
        return res.status(403).send('You are not admin')

    var me
    var users
    var garages
    var bookings

    try {
        sql = "SELECT EMAIL, PHONE FROM USERS WHERE ID=?;"
        me = await mysql_db.query(sql, [user])

        sql = "SELECT ID, FIRST_NAME, LAST_NAME, PHONE, EMAIL, IS_MECHANIC FROM USERS WHERE IS_MECHANIC=1;"
        users = await mysql_db.query(sql, parameters)

        sql = "SELECT G.ID, U.FIRST_NAME, U.LAST_NAME, G.GARAGE_NAME, G.ADDRESS, G.PINCODE, G.LOC_LAT, G.LOC_LON FROM GARAGES G INNER JOIN USERS U ON U.ID=G.USER;"
        garages = await mysql_db.query(sql, parameters)

        sql = "SELECT UB.B_ID, UB.FIRST_NAME, UB.LAST_NAME, G.GARAGE_NAME, G.ADDRESS, UB.DATE_TIME FROM (SELECT B.ID AS B_ID, B.GARAGE, B.USER, U.FIRST_NAME, U.LAST_NAME, B.DATE_TIME FROM BOOKINGS B INNER JOIN USERS U ON U.ID = B.USER) UB INNER JOIN GARAGES G ON UB.GARAGE = G.ID;"
        bookings = await mysql_db.query(sql, parameters)
    }
    catch(e){
        error(0, `Error: ${e}`)
    }

    if(!me)
        return res.status(400).send({})

    if(!users)
        return res.status(400).send({})

    if(!garages)
        return res.status(400).send({})

    if(!bookings)
        return res.status(400).send({})

    log(0, "Finished: Admin")
    return res.status(200).send({user: me[0], accounts: users[0], garages: garages[0], bookings: bookings[0]})
}

//  USER MODULE
export const userAccount = async (req, res) => {
    const { user } = req
    
    log(user, "Started: User Account")

    if(!user)
        return res.status(401).send('Relogin')

    //  Get password from database using email and Verify 
    const sql = "SELECT first_name, last_name, phone, email, is_mechanic FROM USERS WHERE ID=?;"
    const parameters = [user]
    var result;

    try {
        result = await mysql_db.query(sql, parameters)
    }
    catch(e){
        error(0, `Error: ${e}`)
    }

    if(result[0].length < 1)
        return res.status(400).send({})

    const { first_name, last_name, phone, email, is_mechanic } = result[0][0]

    log(0, "Finished: User Account")
    return res.status(200).send({firstname: first_name, lastname: last_name, phone: phone, email: email, mechanic: is_mechanic})
}

export const getUser = async (token) => { 
    log(0, "Started: User Identification")

    var sql = "SELECT user FROM SESSIONS WHERE TOKEN=? AND IS_VALID=TRUE AND EXPIRES_AT > CURRENT_TIMESTAMP;"
    var parameters = [token]
    var result 

    try {
        result = await mysql_db.query(sql, parameters)
    }
    catch(e) {
        error(0, `Error: ${e}`)
    }

    if(!(result && result.length && result[0].length))
        return false

    const user = result[0][0].user
    log(0, "Finished: User Identification")
    return user
}

export const generateToken = async (user) => { 
    log(user, "Started: Token Generator")

    var token = crypto.randomBytes(16).toString('hex')

    var prequel = "UPDATE SESSIONS SET IS_VALID=FALSE WHERE USER=?;"
    var premeters = [user]

    var sql = "INSERT INTO SESSIONS (USER, TOKEN, EXPIRES_AT) VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY));"
    var parameters = [user, token]
    var result;

    try {
        result = await mysql_db.query(prequel, premeters)
        result = await mysql_db.query(sql, parameters)
    }
    catch(e) {
        error(user, `Error: ${e}`)
        token = null
    }

    log(user, "Finished: Token Generator")
    return token
}

export const userRegistration = async (req, res) => {
    log(-1, "Started: User Registration")
    
    if (!req.body)
        return res.status(400).send("No data received")

    const { firstname, lastname, email, phone, password, confirm_password }  = req.body
    
    if (!validateName(firstname))
        return res.status(400).send("Invalid First Name")
    
    if (!validateName(lastname))
        return res.status(400).send("Invalid Last Name")
        
    if (!validateEmail(email))
        return res.status(400).send("Invalid Email")
    
    if (!validatePhone(phone))
        return res.status(400).send("Invalid Phone")
    
    if (!validatePasswords(password, confirm_password))
        return res.status(400).send("Invalid Passwords")

    const hashed_password = await hashPassword(password)

    //  Add to database
    const sql = "INSERT INTO USERS (FIRST_NAME, LAST_NAME, EMAIL, PHONE, PASSWORD) VALUES (?, ?, ?, ?, ?);"
    const parameters = [firstname, lastname, email, phone, hashed_password]
    var result;

    try {
        result = await mysql_db.query(sql, parameters)
    }
    catch(e){
        error(0, `${e}`)
        return res.status(400).send("Error")
    }

    log(-1, "Finished: User Registration")
    return res.status(200).send(`Success`)
};

export const userLogin = async (req, res) => {
    log(-1, "Started: User Login")

    if (!req.body)
        return res.status(400).send("No data")

    const { email, password }  = req.body
    
    if (!validateEmail(email))
        return res.status(400).send("No email")
    
    if (!validatePassword(password))
        return res.status(400).send("No password")

    //  Get password from database using email and Verify 
    const sql = "SELECT ID AS user, password AS hashed_password, FIRST_NAME, LAST_NAME, EMAIL, PHONE FROM USERS WHERE email=?;"
    const parameters = [email]
    var result;

    try {
        result = await mysql_db.query(sql, parameters)
    }
    catch(e){
        error(0, `${e}`)
        return res.status(400).send("Error")
    }

    if (!result[0].length)
        return res.status(401).send("Wrong Password")

    const { user, hashed_password, FIRST_NAME, LAST_NAME, EMAIL, PHONE } = result[0][0]
    const AUTHORIZED_LIST = []
    const out = await comparePassword(password, hashed_password)

    if(out == false)
        return res.status(401).send("Wrong Password")

    const token = await generateToken(user)

    log(-1, "Finished: User Login")
    return res.status(200).send({FIRST_NAME: FIRST_NAME, LAST_NAME: LAST_NAME, EMAIL: EMAIL, PHONE: PHONE, TOKEN: token, AUTHORIZED_LIST: AUTHORIZED_LIST})
};

export const userLogout = async (req, res) => {
    const { user } = req
    
    log(user, "Started Logout")
    
    if (!user)
        return res.status(401).send("Unauthorized")

    const sql = "UPDATE SESSIONS SET IS_VALID=FALSE WHERE USER=?"
    const parameters = [user]

    try {
        await mysql_db.query(sql, parameters)
    }
    catch(e){
        error(user, `${e}`)
        return res.status(400).send("Error")
    }

    log(user, "Finished Logout")
    return res.status(200).send("Logged out")
}

export const putFirstName = async (req, res) => {
    if (!req.body)
        return res.status(400).send("No data received")

    //  Verify User
    const { user } = req
    
    if (!user)
        return res.status(401).send("Unauthorized")

    const { firstname }  = req.body

    if(!validateName(firstname))
        return res.status(400).send("Invalid First Name")

    //  Get password from database using email and Verify 
    const sql = "UPDATE USERS SET FIRST_NAME=? WHERE ID=?;"
    const parameters = [firstname, user]
    var result;

    try {
        result = await mysql_db.query(sql, parameters)
    }
    catch(e){
        error(0, `${e}`)
        return res.status(400).send("Error")
    }

    log(0, "Finished: put First Name")
    return res.status(200).send(`Success`)
}

export const putLastName = async (req, res) => {
    if (!req.body)
        return res.status(400).send("No data received")

    const { user } = req
    
    log(user, "Started: put Last Name")

    if (!user)
        return res.status(401).send("Unauthorized")

    const { lastname }  = req.body

    if(!validateName(lastname))
        return res.status(400).send("Invalid Last Name")

    //  Get password from database using email and Verify 
    const sql = "UPDATE USERS SET LAST_NAME=? WHERE ID=?;"
    const parameters = [lastname, user]
    var result;

    try {
        result = await mysql_db.query(sql, parameters)
    }
    catch(e){
        error(0, `${e}`)
        return res.status(400).send("Error")
    }

    log(user, "Finished: put Lastname")
    return res.status(200).send(`Success`)
}

export const putPhone = async (req, res) => {
    if (!req.body)
        return res.status(400).send("No data received")

    //  Verify User    
    const { user } = req
    
    log(user, "Started: put Phone")

    if (!user)
        return res.status(401).send("Unauthorized")

    const { phone }  = req.body

    if(!validatePhone(phone))
        return res.status(400).send("Invalid Phone")

    //  Get password from database using email and Verify 
    const sql = "UPDATE USERS SET PHONE=? WHERE ID=?;"
    const parameters = [phone, user]
    var result;

    try {
        result = await mysql_db.query(sql, parameters)
    }
    catch(e){
        error(0, `${e}`)
        return res.status(400).send("Error")
    }

    log(user, "Finished: put Phone")
    return res.status(200).send(`Success`)
}

export const putEmail = async (req, res) => {
    if (!req.body)
        return res.status(400).send("No data received")

    //  Verify User
    const { user } = req
    
    log(user, "Started: put Email")

    if (!user)
        return res.status(401).send("Unauthorized")

    const { email }  = req.body

    if(!validateEmail(email))
        return res.status(400).send("Invalid Email")

    //  Get password from database using email and Verify 
    const sql = "UPDATE USERS SET EMAIL=? WHERE ID=?;"
    const parameters = [email, user]
    var result;

    try {
        result = await mysql_db.query(sql, parameters)
    }
    catch(e){
        error(0, `${e}`)
        return res.status(400).send("Error")
    }

    log(user, "Finished: put Email")
    return res.status(200).send(`Success`)
}

export const putMechanic = async (req, res) => {
    if (!req.body)
        return res.status(400).send("No data received")

    //  Verify User
    const { user } = req
    
    log(user, "Started: put Mechanic")
    
    if (!user)
        return res.status(401).send("Unauthorized")

    const { mechanic }  = req.body

    if(typeof(mechanic) == "boolean")
        return res.status(400).send("Only boolean")

    //  Get password from database using email and Verify 
    const sql = "UPDATE USERS SET IS_MECHANIC=? WHERE ID=?;"
    const parameters = [mechanic, user]
    var result;

    try {
        result = await mysql_db.query(sql, parameters)
    }
    catch(e){
        error(0, `${e}`)
        return res.status(400).send("Error")
    }

    log(user, "Finished: put Mechanic")
    return res.status(200).send(`Success`)
}

export const deleteUser = async (req, res) => {
    if(!req.body)
        return res.status(400).send("No body")
    //  Verify User
    const { user } = req
    
    log(user, "Started: Delete User")
    
    var sql = "SELECT IS_ADMIN FROM USERS WHERE ID=?;"
    is_admin = await mysql_db.query(sql, [user])

    if(is_admin[0][0]['IS_ADMIN'] != 1)
        return res.status(401).send("Unauthorized")

    const { id }  = req.body

    try{
        const targetId = Number(id);

        if (!Number.isInteger(targetId) || targetId <= 0) {
            return res.status(400).send("Invalid user ID");
        }
    }
    catch(e){
        error(user, `${e}`)
    }

    //  Get password from database using email and Verify 
    sql = "DELETE FROM USERS WHERE ID=?"
    const parameters = [id]
    var result;

    try {
        result = await mysql_db.query(sql, parameters)
    }
    catch(e){
        error(0, `${e}`)
        return res.status(400).send("Error")
    }

    log(user, "Finished: Delete User")
    return res.status(200).send(`Success`)
}