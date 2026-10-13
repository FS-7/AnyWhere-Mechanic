import { init, env, error, Authenticate, setLimitAndOffset, checkRateLimit } from './src/shared.js'
import { deleteBookingAsAdmin, deleteUser, fetchBookings, fetchGarages, fetchUsers, updateBookingStatus } from './src/admin.js'
import { userAccount, userAuth, userRegistration, userLogin, userLogout, putFirstName, putLastName, putPhone, putEmail, putPassword } from './src/user_management.js'
import { nearbyMechanics, getMechanic, postMechanic, deleteMechanic, notifications } from './src/modules.js'
import { getBooking, getBookingMechanicView, postBooking, accepted, rejected, arrived, notArrived, completed, notCompleted, deleteBooking } from './src/booking.js'
import { accountPage, adminPage, bookingPage, Error401Page, Error403Page, Error404Page, Error500Page, garagePage, indexPage, loginPage, myBookingPage, registerPage } from './src/pages.js'

import path from 'path'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended:true }))
app.use(express.static(path.join(import.meta.dirname, '/src/public')))
app.use(cookieParser())

app.set('view engine', 'ejs');
app.set('views', path.join(import.meta.dirname, '/src/templates'))

app.use(cors({
    origin: [
        `${env.HOST}:${env.PORT}`
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));


app.get('/register.html', registerPage)
app.get('/login.html', loginPage)
app.get('/', indexPage)
app.get('/admin.html', adminPage)
app.get('/account.html', accountPage)
app.get('/booking.html', bookingPage)
app.get('/my_booking.html', myBookingPage)
app.get('/garage.html', garagePage)
app.get('/401.html', Error401Page)
app.get('/403.html', Error403Page)
app.get('/404.html', Error404Page)
app.get('/500.html', Error500Page)

//  ADMIN
app.get('/admin/users', Authenticate, checkRateLimit, setLimitAndOffset, fetchUsers)
app.get('/admin/garages', Authenticate, checkRateLimit, setLimitAndOffset, fetchGarages)
app.get('/admin/bookings', Authenticate, checkRateLimit, setLimitAndOffset, fetchBookings)
app.put('/admin/bookings/status', Authenticate, checkRateLimit, updateBookingStatus)
app.delete('/admin/users', Authenticate, checkRateLimit, deleteUser)
app.delete('/admin/bookings', Authenticate, checkRateLimit, deleteBookingAsAdmin)

//  USER
app.get('/users/auth', Authenticate, userAuth)
app.get('/users', Authenticate, checkRateLimit, userAccount)
app.put('/users/user/firstname', Authenticate, checkRateLimit, putFirstName)
app.put('/users/user/lastname', Authenticate, checkRateLimit, putLastName)
app.put('/users/user/phone', Authenticate, checkRateLimit, putPhone)
app.put('/users/user/email', Authenticate, checkRateLimit, putEmail)
app.put('/users/user/password', Authenticate, checkRateLimit, putPassword)
app.post('/users/register', checkRateLimit, userRegistration) 
app.post('/users/login', checkRateLimit, userLogin)
app.post('/users/logout', checkRateLimit, Authenticate, userLogout)

//  GARAGE
app.get('/garage', Authenticate, checkRateLimit, setLimitAndOffset, getMechanic)
app.post('/garage', Authenticate, checkRateLimit, postMechanic)
app.delete('/garage', Authenticate, checkRateLimit, deleteMechanic)

//  BOOKING
app.get('/booking', Authenticate, checkRateLimit, setLimitAndOffset, getBooking)
app.get('/booking_mechanic', Authenticate, checkRateLimit, setLimitAndOffset, getBookingMechanicView)
app.post('/booking', Authenticate, checkRateLimit, postBooking)
app.put('/booking/accepted', Authenticate, checkRateLimit, accepted)
app.put('/booking/rejected', Authenticate, checkRateLimit, rejected)
app.put('/booking/arrived', Authenticate, checkRateLimit, arrived)
app.put('/booking/not_arrived', Authenticate, checkRateLimit, notArrived)
app.put('/booking/completed', Authenticate, checkRateLimit, completed)
app.put('/booking/not_completed', Authenticate, checkRateLimit, notCompleted)
app.delete('/booking', Authenticate, checkRateLimit, deleteBooking)

//  MODULES
app.get('/nearby_mechanics', Authenticate, checkRateLimit, setLimitAndOffset, nearbyMechanics) 
app.get('/notifications', Authenticate, checkRateLimit, setLimitAndOffset, notifications)

app.set('ip_limit', {})
app.set('user_limit', {})
app.set('globalRate', Number(env.RATE_GLOBAL) || 10)
app.set('ipRate', Number(env.RATE_IP) || 3)
app.set('userRate', Number(env.RATE_USER) || 3)

setInterval(() => {
    app.get('globalRate') < (Number(env.RATE_GLOBAL) || 10) && app.set('globalRate', app.get('globalRate') + 1)
}, (1000 / (env.RATE_GLOBAL || 10)));

setInterval(() => {
    app.set('ip_limit', {})
}, 1000);

setInterval(() => {
    app.set('user_limit', {})
}, 1000);

app.use((err, req, res, next) => {
  error(req.ip, req.path, req.method, 0, err);
  res.status(500).render('500.html', {err: err});
});

// Start the server
await init()

app.listen(env.PORT, () =>
    console.log(`Application started on port: ${env.HOST}:${env.PORT}`)
);
