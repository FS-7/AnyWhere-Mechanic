import { mysql_db, log, error, validateName, validateEmail, validatePhone, validatePassword, validatePasswords, hashPassword, comparePassword, getAuthorizedList, Authorize, addToNotifications } from './shared.js'
import crypto from 'crypto'

//  USER MODULE
export const userAccount = async (req, res) => {
    const user = req.user
    const connection = await mysql_db.getConnection()
        
    try {
        log(req.ip, req.path, req.method, user, 'Started')

        if(!await Authorize(user, 'get_user', connection)){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }
        
        const sql = 'SELECT FIRST_NAME, LAST_NAME, PHONE, EMAIL, IS_MECHANIC FROM USERS WHERE ID=?;'
        const parameters = [user]
        const [rows] = await connection.query(sql, parameters)

        if (!rows ||  rows.length < 1){
            log(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(204).json([])
        }

        const { FIRST_NAME, LAST_NAME, PHONE, EMAIL, IS_MECHANIC } = rows[0]

        log(req.ip, req.path, req.method, user, 'Done')
        return res.status(200).json({first_name: FIRST_NAME, last_name: LAST_NAME, phone: PHONE, email: EMAIL, is_mechanic: IS_MECHANIC})
    }
    catch(e){
        error(req.ip, req.path, req.method, user, e.message)
        return res.status(500).send('Internal Server Error')
    }
    finally {
        connection.release();
    }
}

export const userAuth = async (req, res) => {
    const user = req.user
    const connection = await mysql_db.getConnection()
        
    try {
        log(req.ip, req.path, req.method, user, 'Started')

        if(!await Authorize(user, 'get_user_auth', connection)){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }
    
        const sql = 'SELECT IS_MECHANIC, IS_ADMIN FROM USERS WHERE ID=?;'
        const parameters = [user]
        const [rows] = await connection.query(sql, parameters)

        if (!rows ||  rows.length < 1){
            log(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(204).json([])
        }

        const { IS_MECHANIC, IS_ADMIN } = rows[0]

        const AUTHORIZED_LIST = getAuthorizedList(IS_MECHANIC, IS_ADMIN)
        log(req.ip, req.path, req.method, user, 'Done')
        return res.status(200).json(AUTHORIZED_LIST)
    }
    catch(e){
        error(req.ip, req.path, req.method, user, e.message)
        return res.status(500).send('Internal Server Error')
    }
    finally {
        connection.release();
    }
}

export const getUser = async (token) => { 
    const connection = await mysql_db.getConnection()
    try {
        log('127.0.0.1', 'UserID', '', -1, 'Started')

        const sql = `SELECT USER FROM SESSIONS WHERE TOKEN=SHA2(?, 'SHA256') AND IS_VALID=TRUE AND EXPIRES_AT > CURRENT_TIMESTAMP;`
        const parameters = [token]
        const [rows] = await connection.query(sql, parameters)
        
        if(!rows || rows.length < 1)
            return -1

        log('127.0.0.1', 'UserID', '', -1, 'Done')
        return rows[0].USER
    }
    catch(e) {
        error('127.0.0.1', 'UserID', '', -1, e.message)
        return -1
    }
    finally {
        connection.release();
    }
}

export const generateToken = async (user, connection) => { 
    try {
        log('127.0.0.1', 'TokenGenerator', '', user, 'Started')

        const token = crypto.randomBytes(16).toString('hex')

        await connection.beginTransaction()

        var sql = 'UPDATE SESSIONS SET IS_VALID=FALSE WHERE USER=? AND IS_VALID=TRUE;'
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
    const connection = await mysql_db.getConnection()

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

        await connection.beginTransaction()

        const hashed_password = await hashPassword(password)
        
        const sql = 'INSERT INTO USERS (FIRST_NAME, LAST_NAME, EMAIL, PHONE, PASSWORD) VALUES (?, ?, ?, ?, ?);'
        const parameters = [first_name, last_name, email, phone, hashed_password]
        const [rows] = await connection.query(sql, parameters)

        if (rows.affectedRows < 1){
            await connection.rollback()
            error(req.ip, req.path, req.method, -1, 'No Rows')
            return res.status(400).send('No Rows')
        }

        await connection.commit()
        log(req.ip, req.path, req.method, -1, 'Done')
        return res.status(200).send(`Success`)
    }
    catch(e){
        error(req.ip, req.path, req.method, -1, e.message)
        await connection.rollback()
        return res.status(500).send('Internal Server Error')
    }
    finally {
        connection.release();
    }
};

export const userLogin = async (req, res) => {    
    const connection = await mysql_db.getConnection()
    
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

        await connection.beginTransaction()

        const sql = 'SELECT ID AS USER, password AS HASHED_PASSWORD FROM USERS WHERE email=?;'
        const parameters = [email]
        const [rows] = await connection.query(sql, parameters)

        if (!rows || rows.length < 1 || !rows[0]) {
            await connection.rollback()
            error(req.ip, req.path, req.method, -1, 'Invalid Password')
            return res.status(401).send('Invalid Password')
        }

        const { USER, HASHED_PASSWORD } = rows[0]

        const out = await comparePassword(password, HASHED_PASSWORD)
        if(!out) {
            await connection.rollback()
            error(req.ip, req.path, req.method, USER, 'Invalid Password')
            return res.status(401).send('Invalid Password')
        }

        const token = await generateToken(USER, connection)
        if (!token) {
            await connection.rollback()
            error(req.ip, req.path, req.method, -1, 'Bad Request')
            return res.status(400).send('Bad Request')
        }
        await addToNotifications(USER, `You have logged in.`, connection)

        await connection.commit()
        log(req.ip, req.path, req.method, USER, 'Done')
        return res.status(200).clearCookie('token').cookie('token', token, {httpOnly: true, secure: false, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 }).send(`Success`)
    }
    catch(e){
        await connection.rollback()
        error(req.ip, req.path, req.method, -1, e.message)
        return res.status(500).send('Internal Server Error')
    }
    finally {
        connection.release();
    }
};

export const userLogout = async (req, res) => {
    const user = req.user
    const connection = await mysql_db.getConnection()
    
    try {
        log(req.ip, req.path, req.method, user, 'Started')

        await connection.beginTransaction()

        const sql = 'UPDATE SESSIONS SET IS_VALID=FALSE WHERE USER=? AND IS_VALID=TRUE;'
        const parameters = [user]

        const [rows] = await connection.query(sql, parameters)
        if (rows.affectedRows < 1){
            await connection.rollback()
            error(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(400).send('No Rows')
        }

        await connection.commit()
        log(req.ip, req.path, req.method, user, 'Done')
        return res.status(200).send('Logged out')
    }
    catch(e){
        await connection.rollback()
        error(req.ip, req.path, req.method, user, e.message)
        return res.clearCookie('token').status(500).send('Internal Server Error')
    }
    finally {
        connection.release();
    }
}

export const putFirstName = async (req, res) => {
    const user = req.user
    const connection = await mysql_db.getConnection()

    try {
        log(req.ip, req.path, req.method, user, 'Started')

        if(!await Authorize(user, 'update_first_name', connection)){
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

        await connection.beginTransaction()

        const sql = 'UPDATE USERS SET FIRST_NAME=? WHERE ID=?;'
        const parameters = [firstname, user]
        const [rows] = await connection.query(sql, parameters)

        if (rows.affectedRows < 1){
            await connection.rollback()
            error(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(400).send('No Rows')
        }

        await addToNotifications(user, `You have updated your first name.`, connection)
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

export const putLastName = async (req, res) => {
    const user = req.user
    const connection = await mysql_db.getConnection()

    try {
        log(req.ip, req.path, req.method, user, 'Started')

        if(!await Authorize(user, 'update_last_name', connection)){
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

        await connection.beginTransaction()

        const sql = 'UPDATE USERS SET LAST_NAME=? WHERE ID=?;'
        const parameters = [lastname, user]
        const [rows] = await connection.query(sql, parameters)

        if (rows.affectedRows < 1) {
            error(req.ip, req.path, req.method, user, 'No Rows')
            await connection.rollback()
            return res.status(400).send('No Rows')
        }

        await addToNotifications(user, `You have updated your last name.`, connection)
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

export const putPhone = async (req, res) => {
    const user = req.user
    const connection = await mysql_db.getConnection()

    try {    
        log(req.ip, req.path, req.method, user, 'Started')

        if(!await Authorize(user, 'update_phone', connection)){
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

        await connection.beginTransaction()

        const sql = 'UPDATE USERS SET PHONE=? WHERE ID=?;'
        const parameters = [phone, user]
        const [rows] = await connection.query(sql, parameters)
        
        if (rows.affectedRows < 1) {
            error(req.ip, req.path, req.method, user, 'No Rows')
            await connection.rollback()
            return res.status(400).send('No Rows')
        }
            
        await addToNotifications(user, `You have updated your phone.`, connection)
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

export const putEmail = async (req, res) => {
    const user = req.user
    const connection = await mysql_db.getConnection()

    try {
        log(req.ip, req.path, req.method, user, 'Started')

        if(!await Authorize(user, 'update_email', connection)){
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

        await connection.beginTransaction()
        
        const sql = 'UPDATE USERS SET EMAIL=? WHERE ID=?;'
        const parameters = [email, user]
        const [rows] = await connection.query(sql, parameters)

        if (rows.affectedRows < 1) {
            await connection.rollback()
            error(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(400).send('No Rows')
        }
        
        await addToNotifications(user, `You have updated your email.`, connection)

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

export const putPassword = async (req, res) => {
    const user = req.user
    const connection = await mysql_db.getConnection()

    try {
        log(req.ip, req.path, req.method, user, 'Started')

        if(!await Authorize(user, 'update_password', connection)){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }

        if(!req.body) {
            error(req.ip, req.path, req.method, user, 'No data received')
            return res.status(400).send('No data received')
        }

        const { old_password, password, password2 }  = req.body

        if(!validatePassword(old_password)) {
            error(req.ip, req.path, req.method, user, 'Invalid Password')
            return res.status(400).send('Invalid Password')
        }
        
        var sql = 'SELECT password AS HASHED_PASSWORD FROM USERS WHERE ID=?;'
        var parameters = [user]
        const [rows] = await connection.query(sql, parameters)

        if (!rows || rows.length < 1 || !rows[0]) {
            await connection.rollback()
            error(req.ip, req.path, req.method, -1, 'Invalid Password')
            return res.status(401).send('Invalid Password')
        }

        const { HASHED_PASSWORD } = rows[0]

        const out = await comparePassword(old_password, HASHED_PASSWORD)
        if(!out) {
            await connection.rollback()
            error(req.ip, req.path, req.method, user, 'Invalid Password')
            return res.status(401).send('Invalid Password')
        }

        if (!validatePasswords(password, password2)) {
            error(req.ip, req.path, req.method, user, 'Invalid Passwords')
            return res.status(400).send('Invalid Passwords')
        }

        await connection.beginTransaction()

        const hashed_password = await hashPassword(password)
        
        sql = 'UPDATE USERS SET PASSWORD=? WHERE ID=?;'
        parameters = [hashed_password, user]
        const [rows_2] = await connection.query(sql, parameters)

        if (rows_2.affectedRows < 1) {
            await connection.rollback()
            error(req.ip, req.path, req.method, user, 'No Rows')
            return res.status(400).send('No Rows')
        }
        
        await addToNotifications(user, `You have updated your password.`, connection)
        
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