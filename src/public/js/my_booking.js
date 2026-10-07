import { HOST, PORT, Authenticate, Authorize, checkResponse, user, logout } from "./shared.js";

Authenticate()
Authorize('my_bookings')

document.getElementById('logout').addEventListener('click', logout)

const formOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    const response = await fetch(`${HOST}:${PORT}/booking`, 
        { 
            method: 'DELETE', 
            headers: {authorization: `Bearer ${user.auth.token}`}, 
            body: data
        }
    )
    const [success, result] = await checkResponse(response)

    if(success){
        alert(result)
        onLoad()
    }
}

const arrivedFormOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    const response = await fetch(`${HOST}:${PORT}/booking/arrived`, 
        { 
            method: 'PUT', 
            headers: {authorization: `Bearer ${user.auth.token}`}, 
            body: data
        }
    )

    const [success, result] = await checkResponse(response)
    if(success){
        alert(result)
        onLoad()
    }
}

const notArrivedFormOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    const response = await fetch(`${HOST}:${PORT}/booking/not_arrived`, 
        { 
            method: 'PUT', 
            headers: {authorization: `Bearer ${user.auth.token}`}, 
            body: data
        }
    )

    const [success, result] = await checkResponse(response)
    if(success){
        alert(result)
        onLoad()
    }
}

const completedFormOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    const response = await fetch(`${HOST}:${PORT}/booking/completed`, 
        { 
            method: 'PUT', 
            headers: {authorization: `Bearer ${user.auth.token}`}, 
            body: data
        }
    )

    const [success, result] = await checkResponse(response)
    if(success){
        alert(result)
        onLoad()
    }
}

const notCompletedFormOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    const response = await fetch(`${HOST}:${PORT}/booking/not_completed`, 
        { 
            method: 'PUT', 
            headers: {authorization: `Bearer ${user.auth.token}`}, 
            body: data
        }
    )

    const [success, result] = await checkResponse(response)
    if(success){
        alert(result)
        onLoad()
    }
}

const onLoad = async () => {
    const response = await fetch(`${HOST}:${PORT}/booking`, 
        {
            method: "GET", 
            headers: {authorization: `Bearer ${user.auth.token}`}
        }
    )

    const [success, result] = await checkResponse(response)
    
    if(!success || !result || result.length)
        return []

    const table_booking = document.getElementById("my_table_booking")
    table_booking.innerHTML = `<tr><th>Name</th><th>Garage Name</th><th>Address</th><th>Time</th><th>STATUS</th></tr>`

    var my_booking

    my_booking = result.map((booking) => {
        var tr = document.createElement('tr')

        var td_1 = document.createElement('td')
        var td_2 = document.createElement('td')
        var td_3 = document.createElement('td')
        var td_4 = document.createElement('td')
        var td_5 = document.createElement('td')
        var td_6 = document.createElement('td')
        var td_7 = document.createElement('td')
        var td_8 = document.createElement('td')

        td_1.innerText = `${booking.FIRST_NAME} ${booking.LAST_NAME}`
        td_2.innerText = `${booking.GARAGE_NAME}`
        td_3.innerText = `${booking.ADDRESS}`
        td_4.innerText = `${booking.DATE_TIME}`
        td_5.innerText = `${booking.STATUS}`

        var form = document.createElement('form')
        var input = document.createElement('input')
        var submit = document.createElement('button')
        var p = document.createElement('p')

        form.addEventListener('submit', formOnSubmit)

        p.setAttribute('class', 'bi bi-trash')

        input.setAttribute('type', 'text')
        input.setAttribute('name', 'id')
        input.setAttribute('value', booking.B_ID)
        input.setAttribute('hidden', 'true')
        
        submit.setAttribute('type', 'submit')
        submit.setAttribute('class', 'button')
        
        submit.appendChild(p)
        form.appendChild(input)
        form.appendChild(submit)
        td_6.appendChild(form)
        
        var not_form = document.createElement('form')
        var input = document.createElement('input')
        var submit = document.createElement('button')
        var p = document.createElement('p')

        not_form.addEventListener('submit', ((() => {}) || booking.STATUS=="ACCEPTED" && notArrivedFormOnSubmit || booking.STATUS=="ARRIVED" && notCompletedFormOnSubmit))

        p.setAttribute('class', 'bi bi-ban')

        input.setAttribute('type', 'text')
        input.setAttribute('name', 'id')
        input.setAttribute('value', booking.B_ID)
        input.setAttribute('hidden', 'true')
        
        submit.setAttribute('type', 'submit')
        submit.setAttribute('class', 'button')
        
        submit.appendChild(p)
        not_form.appendChild(input)
        not_form.appendChild(submit)
        td_7.appendChild(not_form)
        
        var yes_form = document.createElement('form')
        var input = document.createElement('input')
        var submit = document.createElement('button')
        var p = document.createElement('p')

        yes_form.addEventListener('submit', ((() => {}) || booking.STATUS=="ACCEPTED" && arrivedFormOnSubmit || booking.STATUS=="ARRIVED" && completedFormOnSubmit))

        p.setAttribute('class', 'bi bi-check2')

        input.setAttribute('type', 'text')
        input.setAttribute('name', 'id')
        input.setAttribute('value', booking.B_ID)
        input.setAttribute('hidden', 'true')
        
        submit.setAttribute('type', 'submit')
        submit.setAttribute('class', 'button')
        
        submit.appendChild(p)
        yes_form.appendChild(input)
        yes_form.appendChild(submit)
        td_8.appendChild(yes_form)
        
        tr.appendChild(td_1)
        tr.appendChild(td_2)
        tr.appendChild(td_3)
        tr.appendChild(td_4)
        tr.appendChild(td_5)
        tr.appendChild(td_6)
        tr.appendChild(td_7)
        tr.appendChild(td_8)
        
        return tr
    })

    for (let booking in my_booking)
        table_booking.appendChild(my_booking[booking])
}

onLoad()
