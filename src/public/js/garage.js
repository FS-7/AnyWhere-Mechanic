import {
    HOST,
    PORT,
    checkResponse,
    Authenticate,
    Authorize,
    user,
    logout,
} from './shared.js';

Authenticate();
Authorize('garage');

document.getElementById('logout').addEventListener('click', logout)

var latitude = 17.4;
var longitude = 78.1;

var map = L.map('map').setView([latitude, longitude], 5);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
}).addTo(map);

var marker = null;
map.addEventListener('click', (e) => {
    if (marker) marker.removeFrom(map);
    marker = L.marker([e.latlng.lat, e.latlng.lng])
        .addTo(map)
        .bindPopup(
            `Your Location: Latitude ${e.latlng.lat.toPrecision(4)}. Longitude: ${e.latlng.lng.toPrecision(4)}`,
        )
        .openPopup();

    document.getElementById('loc_lat').value = e.latlng.lat.toPrecision(6);
    document.getElementById('loc_lon').value = e.latlng.lng.toPrecision(6);
});

const formOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target)) data.append(pair[0], [pair[1]]);

    data.append('latitude', document.getElementById('loc_lat').value);
    data.append('longitude', document.getElementById('loc_lon').value);

    const response = await fetch(`${HOST}:${PORT}/garage`, {
        method: 'POST',
        headers: { authorization: `Bearer ${user.auth.token}` },
        body: data,
    });
    const [success, result] = checkResponse(response);

    if (success) {
        alert(result);
    }
};
document.getElementById('form').addEventListener('submit', formOnSubmit);
