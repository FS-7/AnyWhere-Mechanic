const express = require('express');
const app = express();
const port = 8080;

//  DEFAULT 
app.get('/', (req, res) => {
    
});

//  REGISTER MODULE
app.post('register', (req, res) => {
    
});

app.post('mechanic_register', (req, res) => {
    
});

//  LOGIN MODULE
app.post('login', () => {

});

app.post('mechanic_login', () => {

});

//  FEATURES
app.get('map', () => {

});

app.get('nearby_mechanics', () => {

});

app.post('book', () => {

});

app.get('my_requests', () => {

});

app.delete('my_requests', () => {

});

app.get('notifications', () => {

});

// Start the server
app.listen(port);