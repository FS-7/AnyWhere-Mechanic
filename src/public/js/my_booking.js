import { Authenticate_and_Authorize, checkResponse, logout } from "./shared.js";

await Authenticate_and_Authorize('my_bookings_page')

document.getElementById('logout').addEventListener('click', logout)

var booking_limit = 5
var booking_offset = 1

const formOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    const response = await fetch(`${HOST}:${PORT}/booking`, 
        { 
            method: 'DELETE', 
            body: data,
            credentials: 'include'
        }
    )
    const [success, result] = await checkResponse(response)

    if(success){
        alert(result)
        await Load()
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
            body: data,
            credentials: 'include'
        }
    )

    const [success, result] = await checkResponse(response)
    if(success){
        alert(result)
        Load()
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
            body: data,
            credentials: 'include'
        }
    )

    const [success, result] = await checkResponse(response)
    if(success){
        alert(result)
        Load()
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
            body: data,
            credentials: 'include'
        }
    )

    const [success, result] = await checkResponse(response)
    if(success){
        alert(result)
        Load()
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
            body: data,
            credentials: 'include'
        }
    )

    const [success, result] = await checkResponse(response)
    if(success){
        alert(result)
        Load()
    }
}

const Load = async () => {
    await loadNotifications()
    
    const response = await fetch(`${HOST}:${PORT}/booking?limit=${booking_limit}&offset=${booking_offset}`, 
        {
            method: "GET", 
            credentials: 'include'
        }
    )

    const [success, result] = await checkResponse(response)
    
    if(!(success && result && result.length))
        return []

    const table_booking = document.getElementById("table_booking")
    table_booking.innerHTML = `<tr><th>Name</th><th>Garage Name</th><th>Address</th><th>Time</th><th>STATUS</th></tr>`

    const my_booking = result.map((booking) => {
        var tr = document.createElement('tr')

        var td_1 = document.createElement('td')
        var td_2 = document.createElement('td')
        var td_3 = document.createElement('td')
        var td_4 = document.createElement('td')
        var td_5 = document.createElement('td')

        td_1.innerText = `${booking.FIRST_NAME} ${booking.LAST_NAME}`
        td_2.innerText = `${booking.GARAGE_NAME}`
        td_3.innerText = `${booking.ADDRESS}`
        td_4.innerText = `${booking.DATE_TIME}`
        td_5.innerText = `${booking.STATUS}`
        
        tr.appendChild(td_1)
        tr.appendChild(td_2)
        tr.appendChild(td_3)
        tr.appendChild(td_4)
        tr.appendChild(td_5)
        
        if (booking.STATUS === 'INITIATED') {
            var td_6 = document.createElement('td')

            var form = document.createElement('form')
            var input = document.createElement('input')
            var submit = document.createElement('button')
            var p = document.createElement('p')

            form.addEventListener('submit', formOnSubmit)
            form.setAttribute('method', 'post')

            p.setAttribute('class', 'bi bi-trash')

            input.setAttribute('type', 'text')
            input.setAttribute('name', 'booking_id')
            input.setAttribute('value', booking.B_ID)
            input.setAttribute('hidden', 'true')
            
            submit.setAttribute('type', 'submit')
            submit.setAttribute('class', 'button')
            
            submit.appendChild(p)
            form.appendChild(input)
            form.appendChild(submit)
            td_6.appendChild(form)

            tr.appendChild(td_6)
        }
        else if (['REJECTED', 'NOT ARRIVED', 'COMPLETED', 'NOT COMPLETED'].includes(booking.STATUS)) {}
        else {
            var td_7 = document.createElement('td')
            var td_8 = document.createElement('td')

            var not_form = document.createElement('form')
            var input = document.createElement('input')
            var submit = document.createElement('button')
            var p = document.createElement('p')

            not_form.addEventListener('submit', (e) => {booking.STATUS==="ACCEPTED" && notArrivedFormOnSubmit(e) || booking.STATUS==="ARRIVED" && notCompletedFormOnSubmit(e)})
            not_form.setAttribute('method', 'post')

            p.setAttribute('class', 'bi bi-ban')

            input.setAttribute('type', 'text')
            input.setAttribute('name', 'booking_id')
            input.setAttribute('value', booking.B_ID)
            input.setAttribute('hidden', 'true')
            
            submit.setAttribute('type', 'submit')
            submit.setAttribute('class', 'delete-btn')
            
            submit.appendChild(p)
            not_form.appendChild(input)
            not_form.appendChild(submit)
            td_7.appendChild(not_form)
            
            var yes_form = document.createElement('form')
            var input = document.createElement('input')
            var submit = document.createElement('button')
            var p = document.createElement('p')

            yes_form.addEventListener('submit', (e) => {booking.STATUS==="ACCEPTED" && arrivedFormOnSubmit(e) || booking.STATUS==="ARRIVED" && completedFormOnSubmit(e)})
            yes_form.setAttribute('method', 'post')

            p.setAttribute('class', 'bi bi-check2')

            input.setAttribute('type', 'text')
            input.setAttribute('name', 'booking_id')
            input.setAttribute('value', booking.B_ID)
            input.setAttribute('hidden', 'true')
            
            submit.setAttribute('type', 'submit')
            submit.setAttribute('class', 'success-btn')
            
            submit.appendChild(p)
            yes_form.appendChild(input)
            yes_form.appendChild(submit)
            td_8.appendChild(yes_form)

            tr.appendChild(td_7)
            tr.appendChild(td_8)
        }
        
        return tr
    })

    for (let booking in my_booking)
        table_booking.appendChild(my_booking[booking])
}

await Load()

const booking_limit_input = document.getElementById('booking_limit')
booking_limit_input.addEventListener('change', async (e) => { e.target.value && (booking_limit = Number(e.target.value)); await Load() })

const booking_offset_input = document.getElementById('booking_offset')
booking_offset_input.addEventListener('change', async (e) => { e.target.value && (booking_offset = Number(e.target.value)); await Load() })

document.getElementById('increment_booking_offset').addEventListener('click', async (e) => { booking_offset += 1; booking_offset_input.value = booking_offset; await Load() })
document.getElementById('decrement_booking_offset').addEventListener('click', async (e) => { booking_offset -= 1; booking_offset_input.value = booking_offset; await Load() })

booking_offset_input.value