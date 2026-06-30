var token = localStorage.getItem('token')
if(!token)
    window.location.href = "/login.html"

var latitude = 17.40
var longitude = 78.10
var marker = null

var map = L.map('map').setView([latitude, longitude], 5);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18}).addTo(map)

var garages = [];

const createForm = (garage_id) => {
    const onFormSubmit = async (e) => {
        e.preventDefault();

        const data = new URLSearchParams();
        for (let pair of new FormData(e.target))
            data.append(pair[0], [pair[1]])

        const response = await fetch('http://localhost:8000/booking', { method: 'POST', headers: {authorization: `Bearer ${token}`}, body: data}).catch(x => console.log(x))
        if(response.status == 401)
            window.location.href = '/login.html'
        
        if(response.status == 400){
            const res = await (response).text().catch(x => console.log(x))
            alert(res)
        }
        
        if(response.status == 200){
            const res = await (response).text().catch(x => console.log(x))
            alert(res)
        }
    }
    
    const form = document.createElement('form')
    const input = document.createElement('input')
    const lat = document.createElement('input')
    const lng = document.createElement('input')
    const submit = document.createElement('input')

    form.addEventListener('submit', onFormSubmit)

    input.setAttribute('type', 'text')
    input.setAttribute('name', 'garage_id')
    input.setAttribute('value', garage_id)
    input.setAttribute('hidden', 'true')
    
    lat.setAttribute('type', 'text')
    lat.setAttribute('id', 'latitude')
    lat.setAttribute('name', 'latitude')
    lat.setAttribute('value', marker._latlng.lat)
    lat.setAttribute('hidden', 'true')

    lng.setAttribute('type', 'text')
    lng.setAttribute('id', 'longitude')
    lng.setAttribute('name', 'longitude')
    lng.setAttribute('value', marker._latlng.lng)
    lng.setAttribute('hidden', 'true')
    
    submit.setAttribute('type', 'submit')
    submit.setAttribute('value', 'Book')

    form.appendChild(input)
    form.appendChild(lat)
    form.appendChild(lng)
    form.appendChild(submit)

    return form
}

const renderTable = () => {
    const renderRow = (garage_id, garage_name, address, distance) => {
        const outside_div = document.createElement('div')
        const inside_div = document.createElement('div')
        const nested_inside_div_1 = document.createElement('div')
        const nested_inside_div_2 = document.createElement('div')
        const nested_inside_div_3 = document.createElement('div')

        outside_div.setAttribute('class', 'contact-card')
        inside_div.setAttribute('class', 'contact-info')
        
        nested_inside_div_1.innerText = `Name: ${garage_name}`
        nested_inside_div_2.innerText = `${address}`
        nested_inside_div_3.innerText = `Distance: ${distance} kms`

        inside_div.appendChild(nested_inside_div_1)
        inside_div.appendChild(nested_inside_div_2)
        inside_div.appendChild(nested_inside_div_3)
        outside_div.appendChild(inside_div)
        
        if (marker) {
            const form = createForm(garage_id)
            form.setAttribute('style', 'float: right')
            outside_div.appendChild(form)
        }

        return outside_div
    }
    const div = document.getElementById('mechanics')

    div.innerHTML = ""

    for (let i in garages.slice(0, 4))
        div.appendChild(renderRow(garages[i].ID, garages[i].GARAGE_NAME, garages[i].ADDRESS, garages[i].distance))
}

const updateList = () => {
    const R = 6371
    const calculateDistance = (theta_1, phi_1, theta_2, phi_2) => { 
        //console.log(theta_1, phi_1, theta_2, phi_2)
        const distance = 2 * R * Math.asin( Math.sqrt( (Math.sin( (theta_2 - theta_1) / 2 )) ** 2 + Math.cos(theta_1) * Math.cos(theta_2) * (Math.sin( (phi_2 - phi_1) / 2)) ** 2 ))
        
        console.log(distance)
        return distance
    }

    if (marker) {
        garages.map((item) => { 
            //item.distance = calculateDistance(item.LOC_LAT, marker._latlng.lat, item.LOC_LON, marker._latlng.lng); 
            item.distance = (Math.sqrt((item.LOC_LAT - marker._latlng.lat) ** 2 + (item.LOC_LON - marker._latlng.lng) ** 2) * 100).toPrecision(6) ; 
            return item 
        })
        garages.sort((a, b) => {return a.distance - b.distance})
    }
    else {
        garages.map((item) => { item.distance = -1; return item })

    }
    renderTable()
}

map.addEventListener('click', (e) => {
    if(marker)
        marker.removeFrom(map)
    marker = L.marker([e.latlng.lat, e.latlng.lng])
        .addTo(map)
        .bindPopup(`Your Location: Latitude ${e.latlng.lat.toPrecision(4)}. Longitude: ${e.latlng.lng.toPrecision(4)}`)
        .openPopup()
    
    updateList()
})

document.getElementById('logout').addEventListener('click', async () => {
    const response = await fetch("http://localhost:8000/users/logout", {method: "POST", headers: {authorization: `Bearer ${token}`}}).catch(x => { console.log(x.status) })
    if(response.status == 401)
        window.location.href = '/login.html'
    
    if(response.status == 400){
        const res = await (response).text().catch(x => console.log(x))
        alert(res)
    }
    const result = await (response).json().catch((x) => {console.log(x)})
    if(response.status == 200)
        window.location.href = '/login.html'
})

const onLoad = async () => {
    const response = await fetch("http://localhost:8000/nearby_mechanics", {method: "GET", headers: {authorization: `Bearer ${token}`}}).catch(x => { console.log(x.status) })
    if(response.status == 401)
        window.location.href = '/login.html'
    
    const result = await (response).json().catch((x) => {console.log(x)})
    if(!result || result.length)
        return
    garages = result.result
    const markers = garages.map((garage) => {return L.marker([garage.LOC_LAT, garage.LOC_LON]).addTo(map).bindPopup(garage.GARAGE_NAME.toString()).openPopup()}) 
    updateList()
}
onLoad()

const search = document.getElementById('search');
const searchbox = document.getElementById('searchbox');
const gps = document.getElementById('gps');

const searchFunction = async () => {
    let query = searchbox.value;
};

search.addEventListener('click', searchFunction)

const gpsFunction = async () => {
    const setLocation = (position) => {
        map.setView([position.coords.latitude, position.coords.longitude], 10)
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoon: 4}).addTo(map)
        if(marker)
            marker.removeFrom(map)
        marker = L.marker([position.coords.latitude, position.coords.longitude]).addTo(map).bindPopup("Your Location").openPopup()
        updateList()
    }
    
    navigator.geolocation.getCurrentPosition((position) => { setLocation(position) }, (error) => { alert(error.message); console.log(error)})
}
gps.addEventListener('click', gpsFunction)

