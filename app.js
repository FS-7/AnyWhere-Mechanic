import { init, env, error, Authenticate } from './src/shared.js'
import { admin, userAccount, userAuth, userRegistration, userLogin, userLogout, deleteUser, putFirstName, putLastName, putPhone, putEmail } from './src/user_management.js'
import { nearbyMechanics, getMechanic, postMechanic, deleteMechanic, notifications } from './src/modules.js'
import { getBooking, getBookingMechanicView, postBooking, accepted, rejected, arrived, notArrived, completed, notCompleted, deleteBooking } from './src/booking.js'

import path from 'path'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended:true }))
app.use(express.static(path.join(import.meta.dirname, '/src/public')))
app.use(cookieParser())

app.use(cors({
    origin: [
        `${env.HOST}:${env.PORT}`
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.get('/ping', (req, res) => {
    return res.status(200).send(`Hello`)
})

//  ADMIN
app.get('/admin', Authenticate, admin)

//  USER
app.get('/users', Authenticate, userAccount)
app.get('/users/auth', Authenticate, userAuth)
app.delete('/users', Authenticate, deleteUser)
app.put('/users/user/firstname', Authenticate, putFirstName)
app.put('/users/user/lastname', Authenticate, putLastName)
app.put('/users/user/phone', Authenticate, putPhone)
app.put('/users/user/email', Authenticate, putEmail)
app.post('/users/register', userRegistration) 
app.post('/users/login', userLogin)
app.post('/users/logout', Authenticate, userLogout)

//  GARAGE
app.get('/garage', Authenticate, getMechanic)
app.post('/garage', Authenticate, postMechanic)
app.delete('/garage', Authenticate, deleteMechanic)

//  BOOKING
app.get('/booking', Authenticate, getBooking)
app.get('/booking_mechanic', Authenticate, getBookingMechanicView)
app.post('/booking', Authenticate, postBooking)
app.put('/booking/accepted', Authenticate, accepted)
app.put('/booking/rejected', Authenticate, rejected)
app.put('/booking/arrived', Authenticate, arrived)
app.put('/booking/not_arrived', Authenticate, notArrived)
app.put('/booking/completed', Authenticate, completed)
app.put('/booking/not_completed', Authenticate, notCompleted)
app.delete('/booking', Authenticate, deleteBooking)

//  MODULES
app.get('/nearby_mechanics', Authenticate, nearbyMechanics) 
app.get('/notifications', Authenticate, notifications)

app.use((err, req, res, next) => {
  error(req.ip, req.path, req.method, 0, err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
await init()

app.listen(env.PORT, () =>
    console.log(`Application started on port: ${env.HOST}:${env.PORT}`)
);
