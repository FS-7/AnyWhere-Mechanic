import {
    Authenticate_and_Authorize,
    checkResponse,
    loadNotifications,
    logout,
    error
} from './shared.js';

await Authenticate_and_Authorize('index_page');

document.getElementById('logout').addEventListener('click', logout)

var latitude = 17.4;
var longitude = 78.1;
var marker = null;

var map = L.map('map').setView([latitude, longitude], 5);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
}).addTo(map);

const createForm = (garage_id) => {
    const onFormSubmit = async (e) => {
        e.preventDefault();

        const data = new URLSearchParams();
        for (let pair of new FormData(e.target))
            data.append(pair[0], [pair[1]]);

        const response = await fetch(
            `${HOST}:${PORT}/booking`, 
            {
                method: 'POST',
                body: data,
                credentials: 'include'
            }
        )

        const [success, result] = await checkResponse(response)
        if (success) {
            alert(result)
            await loadNotifications()
        }
    };

    const form = document.createElement('form');
    const input = document.createElement('input');
    const lat = document.createElement('input');
    const lng = document.createElement('input');
    const submit = document.createElement('input');

    form.addEventListener('submit', onFormSubmit);
    form.setAttribute('method', 'post')

    input.setAttribute('type', 'text');
    input.setAttribute('name', 'garage_id');
    input.setAttribute('value', garage_id);
    input.setAttribute('hidden', 'true');

    lat.setAttribute('type', 'text');
    lat.setAttribute('id', 'latitude');
    lat.setAttribute('name', 'latitude');
    lat.setAttribute('value', latitude);
    lat.setAttribute('hidden', 'true');

    lng.setAttribute('type', 'text');
    lng.setAttribute('id', 'longitude');
    lng.setAttribute('name', 'longitude');
    lng.setAttribute('value', longitude);
    lng.setAttribute('hidden', 'true');

    submit.setAttribute('type', 'submit');
    submit.setAttribute('value', 'Book');

    form.appendChild(input);
    form.appendChild(lat);
    form.appendChild(lng);
    form.appendChild(submit);

    return form;
};

const renderTable = (result) => {
    const renderRow = (garage_id, garage_name, address, distance) => {
        const outside_div = document.createElement('div');
        const inside_div = document.createElement('div');
        const nested_inside_div_1 = document.createElement('div');
        const nested_inside_div_2 = document.createElement('div');
        const nested_inside_div_3 = document.createElement('div');
        const form = createForm(garage_id);

        outside_div.setAttribute('class', 'contact-card');
        inside_div.setAttribute('class', 'contact-info');
        form.setAttribute('style', 'float: right');

        nested_inside_div_1.innerText = `Name: ${garage_name}`;
        nested_inside_div_2.innerText = `${address}`;
        nested_inside_div_3.innerText = `Distance: ${distance.toPrecision(4)} kms`;

        inside_div.appendChild(nested_inside_div_1);
        inside_div.appendChild(nested_inside_div_2);
        inside_div.appendChild(nested_inside_div_3);
        outside_div.appendChild(inside_div);
        outside_div.appendChild(form);

        return outside_div;
    };
    
    const div = document.getElementById('mechanics');
    div.innerHTML = '';

    for (let garage of result)
        div.appendChild(renderRow(garage.ID, garage.GARAGE_NAME, garage.ADDRESS, garage.DISTANCE),);
};

const Load = async () => {
    if (!marker)
        return []

    const response = await fetch(
        `${HOST}:${PORT}/nearby_mechanics?latitude=${latitude}&longitude=${longitude}&offset=${mechanics_offset}`,
        { 
            method: 'GET',
            credentials: 'include'
        },
    )

    const [success, result] = await checkResponse(response)
    if (!success)
        return [];
    
    result.map((garage) => {
        return L.marker([garage.LOC_LAT, garage.LOC_LON])
            .addTo(map)
            .bindPopup(garage.GARAGE_NAME.toString())
    });
    renderTable(result);
};
await Load();

map.addEventListener('click', async (e) => {
    if (marker) 
        marker.removeFrom(map);

    latitude = e.latlng.lat
    longitude = e.latlng.lng
    marker = L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup(
            `Your Location: Latitude ${latitude.toPrecision(4)}. Longitude: ${longitude.toPrecision(4)}`,
        )
        .openPopup();

    await Load();
});

var mechanics_offset = 1

const mechanics_offset_input = document.getElementById('mechanics_offset')
mechanics_offset_input.addEventListener('change', async (e) => { e.target.value && (mechanics_offset = Number(e.target.value)); await Load() })

document.getElementById('increment_mechanics_offset').addEventListener('click', async (e) => { mechanics_offset += 1; mechanics_offset_input.value = mechanics_offset; await Load() })
document.getElementById('decrement_mechanics_offset').addEventListener('click', async (e) => { mechanics_offset -= 1; mechanics_offset_input.value = mechanics_offset; await Load() })


const search = document.getElementById('search');
const searchbox = document.getElementById('searchbox');
const gps = document.getElementById('gps');

const searchFunction = async () => {
    let query = searchbox.value;
};

search.addEventListener('click', searchFunction);

const gpsFunction = async () => {
    const setLocation = (position) => {
        map.setView([position.coords.latitude, position.coords.longitude], 10);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoon: 4,
        }).addTo(map);

        if (marker) 
            marker.removeFrom(map);

        marker = L.marker([position.coords.latitude, position.coords.longitude])
            .addTo(map)
            .bindPopup('Your Location')
            .openPopup();
        Load();
    };

    navigator.geolocation.getCurrentPosition(
        (position) => {
            setLocation(position);
        },
        (err) => {
            alert(err.message);
            error(err);
        },
    );
};

gps.addEventListener('click', gpsFunction);
