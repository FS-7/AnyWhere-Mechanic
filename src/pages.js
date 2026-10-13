import { env, log } from "./shared.js"

export const registerPage = (req, res) => {
    log(req.ip, req.path, req.method, 0, '');
    return res.render('register.ejs', { HOST: env.HOST, PORT: env.PORT })
}

export const loginPage = (req, res) => {
    log(req.ip, req.path, req.method, 0, '');
    return res.render('login.ejs', { HOST: env.HOST, PORT: env.PORT })
}

export const indexPage = (req, res) => {
    log(req.ip, req.path, req.method, 0, '');
    return res.render('index.ejs', { HOST: env.HOST, PORT: env.PORT })
}

export const adminPage = (req, res) => {
    log(req.ip, req.path, req.method, 0, '');
    return res.render('admin.ejs', { HOST: env.HOST, PORT: env.PORT })
}

export const accountPage = (req, res) => {
    log(req.ip, req.path, req.method, 0, '');
    return res.render('account.ejs', { HOST: env.HOST, PORT: env.PORT })
}

export const bookingPage = (req, res) => {
    log(req.ip, req.path, req.method, 0, '');
    return res.render('booking.ejs', { HOST: env.HOST, PORT: env.PORT })
}

export const myBookingPage = (req, res) => {
    log(req.ip, req.path, req.method, 0, '');
    return res.render('my_booking.ejs', { HOST: env.HOST, PORT: env.PORT })
}

export const garagePage = (req, res) => {
    log(req.ip, req.path, req.method, 0, '');
    return res.render('garage.ejs', { HOST: env.HOST, PORT: env.PORT })
}

export const Error401Page = (req, res) => {
    log(req.ip, req.path, req.method, 0, '');
    return res.render('401.ejs', { HOST: env.HOST, PORT: env.PORT })
}

export const Error403Page = (req, res) => {
    log(req.ip, req.path, req.method, 0, '');
    return res.render('403.ejs', { HOST: env.HOST, PORT: env.PORT })
}

export const Error404Page = (req, res) => {
    log(req.ip, req.path, req.method, 0, '');
    return res.render('404.ejs', { HOST: env.HOST, PORT: env.PORT })
}

export const Error500Page = (req, res) => {
    log(req.ip, req.path, req.method, 0, '');
    return res.render('500.ejs', { HOST: env.HOST, PORT: env.PORT })
}
