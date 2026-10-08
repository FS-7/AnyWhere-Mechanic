import {connection, log, error, validateName, validateEmail, validatePhone, validatePassword, validatePasswords, hashPassword, comparePassword, getAuthorizedList, Authorize } from './shared.js'
import crypto from 'crypto'

//  ADMIN
export const admin = async (req, res) => {
    const user = req.user

    try {
        log(req.ip, req.path, req.method, user, 'Started')

        if(!Authorize(user, 'get_admin')){
            error(req.ip, req.path, req.method, user, 'You are not admin')
            return res.status(403).send('You are not admin')
        }

        var sql 

        sql = 'SELECT EMAIL, PHONE FROM USERS WHERE ID=?;'
        const [me] = await connection.query(sql, [user])

        sql = 'SELECT ID, FIRST_NAME, LAST_NAME, PHONE, EMAIL, IS_MECHANIC, IS_ADMIN FROM USERS;'
        const [users] = await connection.query(sql, [])

        sql = 'SELECT G.ID, U.FIRST_NAME, U.LAST_NAME, G.GARAGE_NAME, G.ADDRESS, G.PINCODE, G.LOC_LAT, G.LOC_LON FROM GARAGES G INNER JOIN USERS U ON U.ID=G.USER;'
        const [garages] = await connection.query(sql, [])

        sql = 'SELECT UB.B_ID, UB.FIRST_NAME, UB.LAST_NAME, G.GARAGE_NAME, G.ADDRESS, UB.DATE_TIME FROM (SELECT B.ID AS B_ID, B.GARAGE, B.USER, U.FIRST_NAME, U.LAST_NAME, B.DATE_TIME FROM BOOKINGS B INNER JOIN USERS U ON U.ID = B.USER) UB INNER JOIN GARAGES G ON UB.GARAGE = G.ID;'
        const [bookings] = await connection.query(sql, [])

        log(req.ip, req.path, req.method, user, 'Done')
        return res.status(200).send({user: me[0], accounts: users, garages: garages, bookings: bookings})
    }
    catch(e){
        error(req.ip, req.path, req.method, user, e.message)
        return res.status(500).send('Internal Server Error')
    }
}

//  USER MODULE
export const userAccount = async (req, res) => {
    const user = req.user
    
    try {
        log(req.ip, req.path, req.method, user, 'Started')

        if(!Authorize(user, 'get_user')){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }
    
        const sql = 'SELECT FIRST_NAME, LAST_NAME, PHONE, EMAIL, IS_MECHANIC FROM USERS WHERE ID=?;'
        const parameters = [user]
        const [row] = await connection.query(sql, parameters)

        if(!row || row[0].length < 1) {
            error(req.ip, req.path, req.method, user, 'No rows')
            return res.status(400).send('No rows')
        }

        const { FIRST_NAME, LAST_NAME, PHONE, EMAIL, IS_MECHANIC } = row[0]

        log(req.ip, req.path, req.method, user, 'Done')
        return res.status(200).send({first_name: FIRST_NAME, last_name: LAST_NAME, phone: PHONE, email: EMAIL, is_mechanic: IS_MECHANIC})
    }
    catch(e){
        error(req.ip, req.path, req.method, user, e.message)
        return res.status(500).send('Internal Server Error')
    }
}

export const userAuth = async (req, res) => {
    const user = req.user
    
    try {
        log(req.ip, req.path, req.method, user, 'Started')

        if(!Authorize(user, 'get_user_auth')){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }
    
        const sql = 'SELECT IS_MECHANIC, IS_ADMIN FROM USERS WHERE ID=?;'
        const parameters = [user]
        const [row] = await connection.query(sql, parameters)

        if(!row || !row[0] || row[0].length < 1) {
            error(req.ip, req.path, req.method, user, 'No rows')
            return res.status(400).send('No rows')
        }

        const { IS_MECHANIC, IS_ADMIN } = row[0]

        const AUTHORIZED_LIST = getAuthorizedList(IS_MECHANIC, IS_ADMIN)
        log(req.ip, req.path, req.method, user, 'Done')
        return res.status(200).send(AUTHORIZED_LIST)
    }
    catch(e){
        error(req.ip, req.path, req.method, user, e.message)
        return res.status(500).send('Internal Server Error')
    }
}

export const getUser = async (token) => { 
    try {
        log('127.0.0.1', 'UserID', '', -1, 'Started')

        const sql = `SELECT USER FROM SESSIONS WHERE TOKEN=SHA2(?, 'SHA256') AND IS_VALID=TRUE AND EXPIRES_AT > CURRENT_TIMESTAMP;`
        const parameters = [token]
        const [row] = await connection.query(sql, parameters)
        
        if(!row || row.length < 1)
            return -1

        log('127.0.0.1', 'UserID', '', -1, 'Done')
        return row[0].USER
    }
    catch(e) {
        error('127.0.0.1', 'UserID', '', -1, e.message)
        return -1
    }
}

export const generateToken = async (user) => { 
    try {
        log('127.0.0.1', 'TokenGenerator', '', user, 'Started')

        const token = crypto.randomBytes(16).toString('hex')

        var sql = ''

        await connection.beginTransaction()

        sql = 'UPDATE SESSIONS SET IS_VALID=FALSE WHERE USER=? AND IS_VALID=TRUE;'
        await connection.query(sql, [user])

        sql = 'INSERT INTO SESSIONS (USER, TOKEN, EXPIRES_AT) VALUES (?, SHA2(?, 256), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 7 DAY));'
        const [rows] = await connection.query(sql, [user, token])
        
        if (rows.affectedRows < 1) {
            await connection.rollback()
            log('127.0.0.1', 'TokenGenerator', '', user, 'Error2')
            return null
        }
        await connection.commit()

        log('127.0.0.1', 'TokenGenerator', '', user, 'Done')
        return token
    }
    catch(e) {
        error('127.0.0.1', 'TokenGenerator', '', user, e.message)
        await connection.rollback()
        return null
    }
}

export const userRegistration = async (req, res) => {
    try {
        log(req.ip, req.path, req.method, -1, 'Started')
    
        if(!req.body) {
            error(req.ip, req.path, req.method, -1, 'No data received')
            return res.status(400).send('No data received')
        }

        const { first_name, last_name, email, phone, password, confirm_password }  = req.body
        
        if (!validateName(first_name)) {
            error(req.ip, req.path, req.method, -1, 'Invalid First Name')
            return res.status(400).send('Invalid First Name')
        }
        
        if (!validateName(last_name)) {
            error(req.ip, req.path, req.method, -1, 'Invalid Last Name')
            return res.status(400).send('Invalid Last Name')
        }
            
        if (!validateEmail(email)) {
            error(req.ip, req.path, req.method, -1, 'Invalid Email')
            return res.status(400).send('Invalid Email')
        }
        
        if (!validatePhone(phone)) {
            error(req.ip, req.path, req.method, -1, 'Invalid Phone')
            return res.status(400).send('Invalid Phone')
        }
        
        if (!validatePasswords(password, confirm_password)) {
            error(req.ip, req.path, req.method, -1, 'Invalid Passwords')
            return res.status(400).send('Invalid Passwords')
        }

        const hashed_password = await hashPassword(password)
        
        const sql = 'INSERT INTO USERS (FIRST_NAME, LAST_NAME, EMAIL, PHONE, PASSWORD) VALUES (?, ?, ?, ?, ?);'
        const parameters = [first_name, last_name, email, phone, hashed_password]
        const [rows] = await connection.query(sql, parameters)

        if (rows.affectedRows < 1){
            error(req.ip, req.path, req.method, -1, 'No Rows')
            return res.status(400).send('No Rows')
        }

        log(req.ip, req.path, req.method, -1, 'Done')
        return res.status(200).send(`Success`)
    }
    catch(e){
        error(req.ip, req.path, req.method, -1, e.message)
        return res.status(500).send('Internal Server Error')
    }
};

export const userLogin = async (req, res) => {    
    try {    
        log(req.ip, req.path, req.method, -1, 'Started')

        if(!req.body) {
            error(req.ip, req.path, req.method, -1, 'No data received')
            return res.status(400).send('No data received')
        }

        const { email, password }  = req.body
        
        if (!validateEmail(email)) {
            error(req.ip, req.path, req.method, -1, 'Invalid Email')
            return res.status(400).send('Invalid Email')
        }
        
        if (!validatePassword(password)) {
            error(req.ip, req.path, req.method, -1, 'Invalid Password')
            return res.status(400).send('Invalid Password')
        }

        const sql = 'SELECT ID AS USER, password AS HASHED_PASSWORD, FIRST_NAME, LAST_NAME, EMAIL, PHONE FROM USERS WHERE email=?;'
        const parameters = [email]
        const [rows] = await connection.query(sql, parameters)

        if (!(rows && rows.length)) {
            error(req.ip, req.path, req.method, -1, 'User does not exist')
            return res.status(401).send('User does not exist')
        }

        const { USER, HASHED_PASSWORD, FIRST_NAME, LAST_NAME, EMAIL, PHONE } = rows[0]

        const out = await comparePassword(password, HASHED_PASSWORD)
        if(out == false)
            return res.status(401).send('Wrong Password')

        const token = await generateToken(USER)

        if (!token) {
            error(req.ip, req.path, req.method, -1, 'Bad Request')
            return res.status(400).send('Bad Request')
        }

        const output = {FIRST_NAME: FIRST_NAME, LAST_NAME: LAST_NAME, EMAIL: EMAIL, PHONE: PHONE, TOKEN: token}
        log(req.ip, req.path, req.method, USER, 'Done')

        return res.status(200).cookie('session', token, {httpOnly: true, secure: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 }).send(output)
    }
    catch(e){
        error(req.ip, req.path, req.method, -1, e.message)
        return res.status(500).send('Internal Server Error')
    }
};

export const userLogout = async (req, res) => {
    const user = req.user

    try {
        log(req.ip, req.path, req.method, user, 'Started')

        const sql = 'UPDATE SESSIONS SET IS_VALID=FALSE WHERE USER=? AND IS_VALID=TRUE;'
        const parameters = [user]

        const [rows] = await connection.query(sql, parameters)
        if (rows.affectedRows < 1){
            error(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(400).send('No Rows')
        }

        log(req.ip, req.path, req.method, user, 'Done')
        return res.status(200).send('Logged out')
    }
    catch(e){
        error(req.ip, req.path, req.method, user, e.message)
        return res.status(500).send('Internal Server Error')
    }
}

export const putFirstName = async (req, res) => {
    const user = req.user

    try {
        log(req.ip, req.path, req.method, user, 'Started')

        if(!Authorize(user, 'update_first_name')){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }
    
        if(!req.body) {
            error(req.ip, req.path, req.method, user, 'No data received')
            return res.status(400).send('No data received')
        }

        const { firstname }  = req.body

        if(!validateName(firstname)) {
            error(req.ip, req.path, req.method, user, 'Invalid First Name')
            return res.status(400).send('Invalid First Name')
        }

        const sql = 'UPDATE USERS SET FIRST_NAME=? WHERE ID=?;'
        const parameters = [firstname, user]
        const [rows] = await connection.query(sql, parameters)

        if (rows.affectedRows < 1){
            error(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(400).send('Bad Request')
        }

        log(req.ip, req.path, req.method, user, 'Done')
        return res.status(200).send(`Success`)
    }
    catch(e){
        error(req.ip, req.path, req.method, user, e.message)
        return res.status(500).send('Internal Server Error')
    }
}

export const putLastName = async (req, res) => {
    const user = req.user

    try {
        log(req.ip, req.path, req.method, user, 'Started')

        if(!Authorize(user, 'update_last_name')){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }
        
        if(!req.body) {
            error(req.ip, req.path, req.method, user, 'No data received')
            return res.status(400).send('No data received')
        }

        const { lastname }  = req.body

        if(!validateName(lastname)) {
            error(req.ip, req.path, req.method, user, 'Invalid Last Name')
            return res.status(400).send('Invalid Last Name')
        }

        const sql = 'UPDATE USERS SET LAST_NAME=? WHERE ID=?;'
        const parameters = [lastname, user]
        const [rows] = await connection.query(sql, parameters)

        if (rows.affectedRows < 1) {
            error(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(400).send('No Rows')
        }

        log(req.ip, req.path, req.method, user, 'Done')
        return res.status(200).send(`Success`)
    }
    catch(e){
        error(req.ip, req.path, req.method, user, e.message)
        return res.status(500).send('Internal Server Error')
    }
}

export const putPhone = async (req, res) => {
    const user = req.user

    try {    
        log(req.ip, req.path, req.method, user, 'Started')

        if(!Authorize(user, 'update_phone')){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }

        if(!req.body) {
            error(req.ip, req.path, req.method, user, 'No data received')
            return res.status(400).send('No data received')
        }

        const { phone }  = req.body

        if(!validatePhone(phone)) {
            error(req.ip, req.path, req.method, user, 'Invalid Phone')
            return res.status(400).send('Invalid Phone')
        }

        const sql = 'UPDATE USERS SET PHONE=? WHERE ID=?;'
        const parameters = [phone, user]
        const [rows] = await connection.query(sql, parameters)
        
        if (rows.affectedRows < 1) {
            error(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(400).send('No Rows')
        }
            
        log(req.ip, req.path, req.method, user, 'Done')
        return res.status(200).send(`Success`)
    }
    catch(e){
        error(req.ip, req.path, req.method, user, e.message)
        return res.status(500).send('Internal Server Error')
    }
}

export const putEmail = async (req, res) => {
    const user = req.user
    try {
        log(req.ip, req.path, req.method, user, 'Started')

        if(!Authorize(user, 'update_email')){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }

        if(!req.body) {
            error(req.ip, req.path, req.method, user, 'No data received')
            return res.status(400).send('No data received')
        }

        const { email }  = req.body

        if(!validateEmail(email)) {
            error(req.ip, req.path, req.method, user, 'Invalid Email')
            return res.status(400).send('Invalid Email')
        }
        const sql = 'UPDATE USERS SET EMAIL=? WHERE ID=?;'
        const parameters = [email, user]
        const [rows] = await connection.query(sql, parameters)

        if (rows.affectedRows < 1) {
            error(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(400).send('No Rows')
        }
        
        log(req.ip, req.path, req.method, user, 'Done')
        return res.status(200).send(`Success`)
    }
    catch(e){
        error(req.ip, req.path, req.method, user, e.message)
        return res.status(500).send('Internal Server Error')
    }
}

export const deleteUser = async (req, res) => {
    const user = req.user
    
    try{        
        log(req.ip, req.path, req.method, user, 'Started')

        if(!Authorize(user, 'delete_user')){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }

        if(!req.body) {
            error(req.ip, req.path, req.method, user, 'No data received')
            return res.status(400).send('No data received')
        }

        const { id }  = req.body
        var sql = 'SELECT IS_ADMIN FROM USERS WHERE ID=?;'
        const [row] = await connection.query(sql, [user])

        if(row[0]['IS_ADMIN'] != 1) {
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }

        const targetId = Number(id);

        if (!Number.isInteger(targetId) || targetId <= 0) {
            error(req.ip, req.path, req.method, user, 'Invalid user ID')
            return res.status(400).send('Invalid user ID');
        }
        
        sql = 'DELETE FROM USERS WHERE ID=?'
        const parameters = [targetId]
        const [rows] = await connection.query(sql, parameters)

        if (rows.affectedRows < 1) {
            error(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(400).send('No Rows')
        }

        log(req.ip, req.path, req.method, user, 'Done')
        return res.status(200).send(`Success`)
    }
    catch(e){
        error(req.ip, req.path, req.method, user, e.message)
        return res.status(500).send('Internal Server Error')
    }
}