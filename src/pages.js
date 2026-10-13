import { env, Authorize, log, mysql_db, error } from "./shared.js"

export const registerPage = async (req, res) => {
    log(req.ip, req.path, req.method, 0, 'Register Page requested');
    return res.render('register.ejs', { HOST: env.HOST, PORT: env.PORT })
}

export const loginPage = async (req, res) => {
    log(req.ip, req.path, req.method, 0, 'Login Page requested');
    return res.render('login.ejs', { HOST: env.HOST, PORT: env.PORT })
}

export const indexPage = async (req, res) => {
    log(req.ip, req.path, req.method, 0, 'Index Page requested');
    const connection = await mysql_db.getConnection()
    
    try {
        const user = req.user
        if(!await Authorize(user, 'index_page', connection)){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }
            
        return res.render('index.ejs', { HOST: env.HOST, PORT: env.PORT })
    }
    catch(err){
        error(req.ip, req.path, req.method, 0, err)
        return res.status(500).send('Internal Server Error')
    }
}

export const adminPage = async (req, res) => {
    log(req.ip, req.path, req.method, 0, 'Admin Page requested');
    const connection = await mysql_db.getConnection()

    try {
        const user = req.user
        if(!await Authorize(user, 'admin_page', connection)){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }
            
        return res.render('admin.ejs', { HOST: env.HOST, PORT: env.PORT })
    }
    catch (err){
        error(req.ip, req.path, req.method, 0, err)
        return res.status(500).send('Internal Server Error')
    }
}

export const accountPage = async (req, res) => {
    log(req.ip, req.path, req.method, 0, 'Account Page requested');
    const connection = await mysql_db.getConnection()
    
    try {
        const user = req.user
        if(!await Authorize(user, 'account_page', connection)){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }
            
        return res.render('account.ejs', { HOST: env.HOST, PORT: env.PORT })
    }
    catch (err){
        error(req.ip, req.path, req.method, 0, err)
        return res.status(500).send('Internal Server Error')
    }
}

export const bookingPage = async (req, res) => {
    log(req.ip, req.path, req.method, 0, 'Booking Page requested');
    const connection = await mysql_db.getConnection()
    
    try {
        const user = req.user
        if(!await Authorize(user, 'bookings_page', connection)){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }
            
        return res.render('booking.ejs', { HOST: env.HOST, PORT: env.PORT })
    }
    catch (err){
        error(req.ip, req.path, req.method, 0, err)
        return res.status(500).send('Internal Server Error')
    }
}

export const myBookingPage = async (req, res) => {
    log(req.ip, req.path, req.method, 0, 'My Booking Page requested');
    const connection = await mysql_db.getConnection()
    
    try {
        const user = req.user
        if(!await Authorize(user, 'my_bookings_page', connection)){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }
            
        return res.render('my_booking.ejs', { HOST: env.HOST, PORT: env.PORT })
    }
    catch (err){
        error(req.ip, req.path, req.method, 0, err)
        return res.status(500).send('Internal Server Error')
    }
}

export const garagePage = async (req, res) => {
    log(req.ip, req.path, req.method, 0, 'Garage Page requested');
    const connection = await mysql_db.getConnection()
    
    try {
        const user = req.user
        if(!await Authorize(user, 'register_garage_page', connection)){
            error(req.ip, req.path, req.method, user, 'Unauthorized')
            return res.status(403).send('Unauthorized')
        }
            
        return res.render('garage.ejs', { HOST: env.HOST, PORT: env.PORT })
    }
    catch (err){
        error(req.ip, req.path, req.method, 0, err)
        return res.status(500).send('Internal Server Error')
    }
}

export const Error401Page = async (req, res) => {
    log(req.ip, req.path, req.method, 0, 'Error 401 Page requested');
    return res.render('401.ejs', { HOST: env.HOST, PORT: env.PORT })
}

export const Error403Page = async (req, res) => {
    log(req.ip, req.path, req.method, 0, 'Error 403 Page requested');
    return res.render('403.ejs', { HOST: env.HOST, PORT: env.PORT })
}

export const Error404Page = async (req, res) => {
    log(req.ip, req.path, req.method, 0, 'Error 404 Page requested');
    return res.render('404.ejs', { HOST: env.HOST, PORT: env.PORT })
}

export const Error500Page = async (req, res) => {
    log(req.ip, req.path, req.method, 0, 'Error 500 Page requested');
    return res.render('500.ejs', { HOST: env.HOST, PORT: env.PORT })
}
