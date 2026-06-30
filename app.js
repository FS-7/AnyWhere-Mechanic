import { log, error } from './src/shared.js'
import { admin, userAccount, userRegistration, userLogin, userLogout, deleteUser, putFirstName, putLastName, putPhone, putEmail, putMechanic } from './src/user_management.js'
import { nearbyMechanics, getMechanic, postMechanic, deleteMechanic, notifications } from './src/modules.js'
import { getBooking, getBookingAsMechanic, postBooking, accepted, rejected, arrived, notArrived, completed, notCompleted, deleteBooking } from './src/booking.js'

import path from 'path'
import express from 'express'
import cors from 'cors'

//const express = require('express');
const app = express();
const port = 8000;

//const cors = require('cors')
app.use(express.json())
app.use(express.urlencoded({ extended:true }))
app.use(express.static(path.join(import.meta.dirname, '/src/public')))

app.use(cors())

app.use((err, req, res, next) => {
  error(0, err);
  res.status(500).json({ error: 'Internal server error' });
});

//  DEFAULT 
app.get('/ping', async (req, res) => {
    return res.status(401).send(Date.now().toLocaleString())
})

//  ADMIN
app.get('/admin', admin)

//  USER
app.get('/users', userAccount)
app.put('/users/user/firstname', putFirstName)
app.put('/users/user/lastname', putLastName)
app.put('/users/user/phone', putPhone)
app.put('/users/user/email', putEmail)
app.put('/users/user/mechanic', putMechanic)
app.delete('/users', deleteUser)
app.post('/users/register', userRegistration) 
app.post('/users/login', userLogin)
app.post('/users/logout', userLogout)

//  GARAGE
app.get('/garage', getMechanic)
app.post('/garage', postMechanic)
app.delete('/garage', deleteMechanic)

//  BOOKING
app.get('/booking', getBooking)
app.get('/booking_mechanic', getBookingAsMechanic)
app.post('/booking', postBooking)
app.put('/booking/accepted', accepted)
app.put('/booking/rejected', rejected)
app.put('/booking/arrived', arrived)
app.put('/booking/not_arrived', notArrived)
app.put('/booking/completed', completed)
app.put('/booking/not_completed', notCompleted)
app.delete('/booking', deleteBooking)

//  MODULES
app.get('/nearby_mechanics', nearbyMechanics) 
app.get('/notifications', notifications)
//app.get('/map', map)

// Start the server
app.listen(port, () =>
    log(0, `Application started on port: http://localhost:${port}`)
);
