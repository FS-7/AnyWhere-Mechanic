import mysql from 'mysql2/promise'
import bcrypt from 'bcrypt'
import 'dotenv/config'

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

export const frontend_URL = "http://localhost:5500/frontend";
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const validateName = (name) => { return (name && (typeof(name) == "string") && name.length < 32 ) }
export const validateEmail = (email) => { return (email && (typeof(email) == "string") && email.length < 256 && emailRegex.test(email) ) }
export const validatePhone = (phone) => { return (phone && (typeof(phone) == "string") && phone.length == 10 ) }
export const validatePassword = (password) => { return (password && (typeof(password) == "string") && password.length > 7 && password.length < 33 && passwordRegex.test(password)) }
export const validatePasswords = (password, password2) => { return (validatePassword(password) && validatePassword(password2) && (password == password2) ) }
export const validateCoordinates = (latitude, longitude) => { return ( Number.isNaN(latitude) || Number.isNaN(longitude) ) }

export const hashPassword = async (password) => { return await bcrypt.hash(password, 10)}
export const comparePassword = async (password, hashed_password) => { return await bcrypt.compare(password, hashed_password)}

export const log = (user, x) => { console.log(user, x) } //addToDB(user, "INFO", x) }
export const error = (user, x) => { console.log(user, x) } //addToDB(user, "ERROR", x) }

const addToDB = async (user, type, log) => {
    const sql = "INSERT INTO LOGS (USER, TYPE, LOG) VALUES (?, ?, ?);"
    const parameters = [user, type, log.toString().substring(0, 500)]

    try {
        await mysql_db.query(sql, parameters)
    }
    catch(e) {
        console.log(e)
    }
}

const initDatabase = () => {
    log(0, "Initializing Database")

    const parameters = [];
    var sql 
    
    sql = `
    CREATE TABLE IF NOT EXISTS AWM.USERS(
        ID INT PRIMARY KEY AUTO_INCREMENT,
        FIRST_NAME VARCHAR(32) NOT NULL, 
        LAST_NAME VARCHAR(32) NOT NULL, 
        PHONE VARCHAR(10) NOT NULL UNIQUE, 
        EMAIL VARCHAR(256) NOT NULL UNIQUE, 
        PASSWORD VARCHAR(64) NOT NULL,
        IS_MECHANIC BOOLEAN NOT NULL DEFAULT FALSE
    );
    `
    mysql_db.query(sql, parameters)
    log(0,"Users Table Created")

    sql = `
        CREATE TABLE IF NOT EXISTS AWM.GARAGES(
        ID INT PRIMARY KEY AUTO_INCREMENT, 
        USER INT NOT NULL REFERENCES USERS(ID) ON DELETE CASCADE, 
        GARAGE_NAME VARCHAR(32) NOT NULL, 
        LOC_LAT FLOAT NOT NULL, 
        LOC_LON FLOAT NOT NULL,
        ADDRESS VARCHAR(256) NOT NULL,
        PINCODE VARCHAR(8) NOT NULL
    );`
    mysql_db.query(sql, parameters)
    log(0,"Garages Table Created")

    sql = `
        CREATE TABLE IF NOT EXISTS AWM.SESSIONS(
        ID INT PRIMARY KEY AUTO_INCREMENT, 
        USER INT NOT NULL REFERENCES USERS(ID) ON DELETE CASCADE, 
        DATE_AND_TIME TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
        TOKEN VARCHAR(32) NOT NULL UNIQUE,
        IS_VALID BOOLEAN NOT NULL DEFAULT TRUE
    );`
    mysql_db.query(sql, parameters)
    log(0,"Sessions Table Created")

    sql = `
        CREATE TABLE IF NOT EXISTS AWM.BOOKINGS(
        ID INT PRIMARY KEY AUTO_INCREMENT, 
        USER INT NOT NULL REFERENCES USERS(ID) ON DELETE CASCADE, 
        GARAGE INT NOT NULL REFERENCES GARAGES(ID) ON DELETE CASCADE, 
        LOC_LAT FLOAT NOT NULL, 
        LOC_LON FLOAT NOT NULL, 
        STATUS VARCHAR(15) NOT NULL DEFAULT 'INITIATED' CHECK (STATUS IN ('INITIATED', 'ACCEPTED', 'REJECTED', 'ARRIVED', 'NOT ARRIVED', 'COMPLETED', 'NOT COMPLETED')),
        DATE_TIME TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP 
    );`
    mysql_db.query(sql, parameters)
    log(0,"Bookings Table Created")

    sql = `
        CREATE TABLE IF NOT EXISTS AWM.NOTIFICATIONS(
        ID INT PRIMARY KEY AUTO_INCREMENT,
        USER INT NOT NULL REFERENCES USERS(ID) ON DELETE RESTRICT,
        SESSION INT NOT NULL REFERENCES SESSIONS(ID) ON DELETE RESTRICT,
        MESSAGE VARCHAR(500) NOT NULL,
        TIME TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`
    mysql_db.query(sql, parameters)
    log(0,"Notifications Table Created")

    sql = `
        CREATE TABLE IF NOT EXISTS AWM.LOGS(
        ID INT PRIMARY KEY AUTO_INCREMENT,
        USER INT NOT NULL REFERENCES USERS(ID) ON DELETE RESTRICT,
        TYPE CHAR(10) NOT NULL,
        LOG VARCHAR(500) NOT NULL,
        TIME TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`
    mysql_db.query(sql, parameters)
    log(0,"Logs Table Created")

    log(0, "Initialization Done")
}

const init = () => {
    initDatabase()
}
//init()

