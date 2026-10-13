import mysql from 'mysql2/promise'
import bcrypt from 'bcrypt'
import fs from 'node:fs'
import 'dotenv/config'
import { getUser } from './user_management.js';

export const env = process.env;

export const mysql_db = new mysql.createPool(
    {
        host: env.MYSQL_HOST,
        port: env.MYSQL_PORT,
        user: env.MYSQL_USER,
        password: env.MYSQL_PASSWORD,
        database: env.MYSQL_DATABASE
    }
)

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^\d{10}$/
const pincodeRegex = /^\d{6}$/
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const validateName = (name) => { return (name && (typeof name === 'string') && name.length < 32 ) }
export const validateEmail = (email) => { return (email && (typeof email === 'string') && email.length < 256 && emailRegex.test(email) ) }
export const validatePhone = (phone) => { return (phone && (typeof phone === 'string') && phone.length === 10 && phoneRegex.test(phone) ) }
export const validatePassword = (password) => { return (password && (typeof password === 'string') && password.length > 7 && password.length < 33 && passwordRegex.test(password)) }
export const validatePasswords = (password, password2) => { return (validatePassword(password) && validatePassword(password2) && (password === password2) ) }
export const validatePincode = (pincode) => { return pincodeRegex.test(pincode) }
export const validateCoordinates = (latitude, longitude) => { 
    return ( 
        Number.isFinite(latitude) && 
        Number.isFinite(longitude) && 
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
    ) 
}

export const hashPassword = async (password) => { return await bcrypt.hash(password, 10)}
export const comparePassword = async (password, hashed_password) => { return await bcrypt.compare(password, hashed_password)}

export const log = (ip, route, method, user, message) => { 
    const date = new Date()

    if (String(env.LOG_TO_CONSOLE).toUpperCase() === 'Y')
        console.log(`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`, ip, route, method, user, 'INFO', message) 
    if (String(env.LOG_TO_DB).toUpperCase() === 'Y')
        addToDB(ip, route, method, user, 'INFO', message)
    if (String(env.LOG_TO_FILE).toUpperCase() === 'Y') {
        const content = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}\t${ip}\t${route}\t${method}\t${user}\tINFO\t${message}\n`
        fs.appendFile(env.FILE, content)
    }
} 

export const system_log = (module, message) => {
    log('127.0.0.1', module, '', 0, message)
}

export const error = (ip, route, method, user, message) => { 
    const date = new Date()

    if (String(env.LOG_TO_CONSOLE).toUpperCase() === 'Y')
        console.log(`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`, ip, route, method, user, 'ERROR', message) 
    if (String(env.LOG_TO_DB).toUpperCase() === 'Y')
        addToDB(ip, route, method, user, 'ERROR', message)
    if (String(env.LOG_TO_FILE).toUpperCase() === 'Y') {
        const content = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}\t${ip}\t${route}\t${method}\t${user}\tINFO\t${message}\n`
        fs.appendFile(env.FILE, content)
    }
} 

export const Authenticate = async (req, res, next) => {
    log(req.ip, req.path, req.method, -1, 'User Authenticating ...')
    
    if (!req.cookies || !req.cookies.token) {
        error(req.ip, req.path, req.method, -1, 'Unauthenticated: Cookies not received')
        return res.status(401).send('Unauthenticated')
    }

    const { token } = req.cookies
    const user = await getUser(token)
    
    if (user < 1) {
        error(req.ip, req.path, req.method, user, 'Unauthenticated')
        return res.status(401).send('Unauthenticated')
    }

    req.user = user
    log(req.ip, req.path, req.method, user, 'User Authenticated')
    next()
}

export const getAuthorizedList = (IS_MECHANIC, IS_ADMIN) => {
    const AUTHORIZED_LIST = ['index_page', 'my_bookings_page', 'account_page', 'get_user', 'get_user_auth', 'update_first_name', 'update_last_name', 'update_email', 'update_phone', 'update_password', 'get_nearby_mechanics', 'get_booking', 'post_booking', 'update_arrived_or_not', 'update_completed_or_not', 'delete_booking']

    if (IS_MECHANIC)
        AUTHORIZED_LIST.push('bookings_page', 'get_garage', 'delete_garage', 'get_booking_mechanic', 'update_accept_or_reject')
    else
        AUTHORIZED_LIST.push('register_garage_page', 'post_garage')

    if (IS_ADMIN)
        AUTHORIZED_LIST.push('admin_page', 'get_admin', 'delete_user', 'delete_any_booking', 'update_booking_status')

    return AUTHORIZED_LIST
}

export const Authorize = async (user, resource, connection) => {
    log('127.0.0.1', 'Authorize', '', user, 'User Authorization')

    const sql = 'SELECT IS_MECHANIC, IS_ADMIN FROM USERS WHERE ID=?;'
    const [rows] = await connection.query(sql, [user])

    if(!rows || rows.length < 1 || !rows[0]) {
        error('127.0.0.1', 'Authorize', '', user, 'No rows')
        return false
    }

    const { IS_MECHANIC, IS_ADMIN } = rows[0]
    const AUTHORIZED_LIST = getAuthorizedList(IS_MECHANIC, IS_ADMIN)
    const is_authorized = AUTHORIZED_LIST.includes(resource)

    if (is_authorized) {
        log('127.0.0.1', 'Authorize', '', user, 'User Authorized')
        return true
    }

    error('127.0.0.1', 'Authorize', '', user, 'Unauthorizated')
    return false
}

const globalRateLimiter = async (req, res) => {
    let globalRate = req.app.get('globalRate')

    if (globalRate > 0) {
        req.app.set('globalRate', globalRate - 1)
        return true
    }
    return false
}

const ipRateLimiter = async (req, res) => {
    let ipRate = req.app.get('ipRate')
    let ip_limit = req.app.get('ip_limit')

    const { ip } = req

    if (ip in ip_limit) {
        if (ip_limit[ip] > 0) {
            ip_limit[ip] = ip_limit[ip] - 1
            req.app.set('ip_limit', ip_limit)
            return true
        }
        return false
    }
    else {
        ip_limit[ip] = ipRate - 1
        req.app.set('ip_limit', ip_limit)
        return true
    }
}

const userRateLimiter = async (req, res) => {
    let userRate = req.app.get('userRate')
    let user_limit = req.app.get('user_limit')

    const user = req.user
    if (!user)
        return true

    if (user in user_limit) {
        if (user_limit[user] > 0) {
            user_limit[user] = user_limit[user] - 1
            req.app.set('user_limit', user_limit)
            return true
        }
        return false
    }
    else {
        user_limit[user] = userRate - 1
        req.app.set('user_limit', user_limit)
        return true
    }
}

export const checkRateLimit = async (req, res, next) => {
    if (!(await globalRateLimiter(req, res))) {
        error(req.ip, req.path, req.method, 0, 'Too many requests')
        return res.status(429).send('Too many request')
    }

    if (!(await ipRateLimiter(req, res)))  {
        error(req.ip, req.path, req.method, 0, 'Too many requests by the IP')
        return res.status(429).send('Too Many Request to the server')
    }

    if (!(await userRateLimiter(req, res))) {
        error(req.ip, req.path, req.method, 0, 'Too many requests by the user')
        return res.status(429).send('Too Many Request by the user')
    }

    next()
}

export const MAX_LIMIT = Number(env.MAX_LIMIT) || 20
export const DEFAULT_LIMIT = Number(env.DEFAULT_LIMIT) || 3
export const DEFAULT_OFFSET = Number(env.DEFAULT_OFFSET) || 1

export const setLimitAndOffset = (req, res, next) => {
    let limit = Number(req.query.limit)
    let offset = Number(req.query.offset)

    limit = Number.isFinite(limit)? limit: DEFAULT_LIMIT
    offset = Number.isFinite(offset) && offset || DEFAULT_OFFSET

    req.limit = Math.max(1, Math.min(MAX_LIMIT, parseInt(limit)))
    req.offset = (Math.max(1, parseInt(offset)) - 1) * limit
    next()
}

export const addToNotifications = async (user, message, connection) => {
    const sql = 'INSERT INTO NOTIFICATIONS (USER, MESSAGE) VALUES (?, ?);'
    const parameters = [user, message]

    const [rows] = await connection.query(sql, parameters)
    if (rows.affectedRows < 1) {
        await connection.rollback()
        system_log('addToNotifications', 'Cannot Add Notifications')
    }
}

const addToDB = async (ip, route, method, user, type, log='') => {
    const connection = await mysql_db.getConnection()
    try {
        const sql = 'INSERT INTO LOGS (IP, ROUTE, METHOD, USER, TYPE, LOG) VALUES (?, ?, ?, ?, ?, ?);'
        const parameters = [ip, route, method, user, type, log.toString().substring(0, 500)]

        const [rows] = await connection.query(sql, parameters)
        if (rows.affectedRows < 1) {
            await connection.rollback()
            console.log('Cannot write logs')
        }
    }
    catch(e) {
        await connection.rollback()
        console.log(e)
    }
    finally {
        connection.release();
    }
}

const initDatabase = async () => {
    const connection = await mysql_db.getConnection()
    try {
        var sql
        await connection.beginTransaction()
        
        sql = `
            CREATE TABLE IF NOT EXISTS LOGS(
            ID INT PRIMARY KEY AUTO_INCREMENT,
            IP VARCHAR(16) NOT NULL,
            ROUTE VARCHAR(256),
            METHOD VARCHAR(10),
            USER INT NOT NULL,
            TYPE CHAR(10) NOT NULL,
            LOG VARCHAR(500) NOT NULL,
            TIME TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_logs_user (USER)
        );`
        await connection.query(sql)
        console.log('Logs Table Created')

        sql = `
        CREATE TABLE IF NOT EXISTS USERS(
            ID INT PRIMARY KEY AUTO_INCREMENT,
            FIRST_NAME VARCHAR(32) NOT NULL, 
            LAST_NAME VARCHAR(32) NOT NULL, 
            PHONE VARCHAR(10) NOT NULL UNIQUE, 
            EMAIL VARCHAR(256) NOT NULL UNIQUE, 
            PASSWORD VARCHAR(64) NOT NULL,
            IS_MECHANIC BOOLEAN NOT NULL DEFAULT FALSE,
            IS_ADMIN BOOLEAN NOT NULL DEFAULT FALSE,
            INDEX idx_email (EMAIL), 
            INDEX idx_phone (PHONE)
        );
        `
        await connection.query(sql)
        console.log('Users Table Created')
    
        sql = `
            CREATE TABLE IF NOT EXISTS SESSIONS(
            ID INT PRIMARY KEY AUTO_INCREMENT, 
            USER INT NOT NULL, 
            DATE_AND_TIME TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
            TOKEN VARCHAR(64) NOT NULL UNIQUE,
            IS_VALID BOOLEAN NOT NULL DEFAULT TRUE,
            EXPIRES_AT TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_session_user FOREIGN KEY (USER) REFERENCES USERS(ID) ON DELETE CASCADE,
            INDEX idx_session_token (TOKEN),
            INDEX idx_session_user (USER)
        );`
        await connection.query(sql)
        console.log('Sessions Table Created')
        
        sql = `
            CREATE TABLE IF NOT EXISTS GARAGES(
            ID INT PRIMARY KEY AUTO_INCREMENT, 
            USER INT NOT NULL UNIQUE, 
            GARAGE_NAME VARCHAR(32) NOT NULL, 
            LOC_LAT FLOAT NOT NULL, 
            LOC_LON FLOAT NOT NULL,
            ADDRESS VARCHAR(256) NOT NULL,
            PINCODE VARCHAR(8) NOT NULL,
            CONSTRAINT fk_garage_user FOREIGN KEY (USER) REFERENCES USERS(ID) ON DELETE CASCADE,
            INDEX idx_garage_user (USER)
        );`
        await connection.query(sql)
        console.log('Garages Table Created')
    
        sql = `
            CREATE TABLE IF NOT EXISTS BOOKINGS(
            ID INT PRIMARY KEY AUTO_INCREMENT, 
            USER INT NOT NULL, 
            GARAGE INT NOT NULL, 
            LOC_LAT FLOAT NOT NULL, 
            LOC_LON FLOAT NOT NULL, 
            STATUS VARCHAR(15) NOT NULL DEFAULT 'INITIATED' CHECK (STATUS IN ('INITIATED', 'ACCEPTED', 'REJECTED', 'ARRIVED', 'NOT ARRIVED', 'COMPLETED', 'NOT COMPLETED')),
            DATE_TIME TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_bookings_user FOREIGN KEY (USER) REFERENCES USERS(ID) ON DELETE RESTRICT,
            CONSTRAINT fk_bookings_garage FOREIGN KEY (GARAGE) REFERENCES GARAGES(ID) ON DELETE RESTRICT,
            INDEX idx_bookings_user (USER),
            INDEX idx_bookings_garage (GARAGE)
        );`
        await connection.query(sql)
        console.log('Bookings Table Created')
    
        sql = `
            CREATE TABLE IF NOT EXISTS NOTIFICATIONS(
            ID INT PRIMARY KEY AUTO_INCREMENT,
            USER INT NOT NULL,
            MESSAGE VARCHAR(500) NOT NULL,
            TIME TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_notifications_user FOREIGN KEY (USER) REFERENCES USERS(ID) ON DELETE CASCADE,
            INDEX idx_notifications_user (USER)
        );`
        await connection.query(sql)
        console.log('Notifications Table Created')
    
        await connection.commit()
    }
    catch (e) {
        console.log(e.message)
        await connection.rollback()
        process.exit(1);
    }
    finally {
        connection.release();
    }
}

const initAdmin = async () => {    
    const connection = await mysql_db.getConnection()
    try {
        await connection.beginTransaction()
        const hashed_password = await hashPassword(env.ADMIN_PASSWORD)
        const sql = `INSERT INTO USERS (FIRST_NAME, LAST_NAME, PHONE, EMAIL, PASSWORD, IS_MECHANIC, IS_ADMIN) VALUES ('ADMIN', 'ADMIN', '0000000000', 'admin@awm.com', ?, FALSE, TRUE);`
        const [rows] = await connection.query(sql, [hashed_password])
        if (rows.affectedRows < 1) {
            await connection.rollback()
            return
        }
        await connection.commit()
        console.log('Admin Created')
    }
    catch(e) {
        await connection.rollback()
        console.log(e.message)
    }
    finally {
        connection.release();
    }
}

export const init = async () => {
    console.log('Initializing Database')
    await initDatabase()
    if (String(env.INIT_ADMIN).toUpperCase() === 'Y')
        await initAdmin()
    console.log('Initialization Done')
}