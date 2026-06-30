var token = localStorage.getItem('token')
if(!token)
    window.location.href = "/login.html"

var latitude = 17.40
var longitude = 78.10

var map = L.map('map').setView([latitude, longitude], 5);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18}).addTo(map)

var marker = null
map.addEventListener('click', (e) => {
    if (marker)
        marker.removeFrom(map)
    marker = L.marker([e.latlng.lat, e.latlng.lng])
        .addTo(map)
        .bindPopup(`Your Location: Latitude ${e.latlng.lat.toPrecision(4)}. Longitude: ${e.latlng.lng.toPrecision(4)}`)
        .openPopup()
    
    document.getElementById("loc_lat").value = e.latlng.lat.toPrecision(6)
    document.getElementById("loc_lon").value = e.latlng.lng.toPrecision(6)
})

const formOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    data.append('latitude', document.getElementById("loc_lat").value)
    data.append('longitude', document.getElementById("loc_lon").value)

    const response = await fetch('http://localhost:8000/garage', { method: 'POST', headers: {authorization: `Bearer ${token}`}, body: data}).catch(x => console.log(x))
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
document.getElementById('form').addEventListener('submit', formOnSubmit)

document.getElementById('logout').addEventListener('click', async () => {
    const response = await fetch("http://localhost:8000/users/logout", {method: "POST", headers: {authorization: `Bearer ${token}`}}).catch(x => { console.log(x.status) })
    if(response.status == 401)
        window.location.href = '/login.html'
    
    if(response.status == 400){
        const res = await (response).text().catch(x => console.log(x))        
        alert(res)
        onLoad()
    }
    
    const result = await (response).json().catch((x) => {console.log(x)})
    if(response.status == 200)
        window.location.href = '/login.html'
})
