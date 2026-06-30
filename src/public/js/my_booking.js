const token = localStorage.getItem('token')
if(!token)
    window.location.href = "/login.html"

const formOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    const response = await fetch('http://localhost:8000/booking', { method: 'DELETE', headers: {authorization: `Bearer ${token}`}, body: data}).catch(x => console.log(x))
    if(response.status == 401)
        window.location.href = '/login.html'
    
    if(response.status == 400){
        const res = await (response).text().catch(x => console.log(x))        
        alert(res)
        onLoad()
    }

    if(response.status == 200){
        const res = await (response).text().catch(x => console.log(x))        
        alert(res)
        onLoad()
    }
    
}
const arrivedFormOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    const response = await fetch('http://localhost:8000/booking/arrived', { method: 'PUT', headers: {authorization: `Bearer ${token}`}, body: data}).catch(x => console.log(x))
    if(response.status == 401)
        window.location.href = '/login.html'
    
    if(response.status == 400){
        const res = await (response).text().catch(x => console.log(x))        
        alert(res)
        onLoad()
    }

    if(response.status == 200){
        const res = await (response).text().catch(x => console.log(x))        
        alert(res)
        onLoad()
    }
    
}
const notArrivedFormOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    const response = await fetch('http://localhost:8000/booking/not_arrived', { method: 'PUT', headers: {authorization: `Bearer ${token}`}, body: data}).catch(x => console.log(x))
    if(response.status == 401)
        window.location.href = '/login.html'
    
    if(response.status == 400){
        const res = await (response).text().catch(x => console.log(x))        
        alert(res)
        onLoad()
    }

    if(response.status == 200){
        const res = await (response).text().catch(x => console.log(x))        
        alert(res)
        onLoad()
    }
    
}
const completedFormOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    const response = await fetch('http://localhost:8000/booking/completed', { method: 'PUT', headers: {authorization: `Bearer ${token}`}, body: data}).catch(x => console.log(x))
    if(response.status == 401)
        window.location.href = '/login.html'
    
    if(response.status == 400){
        const res = await (response).text().catch(x => console.log(x))        
        alert(res)
        onLoad()
    }

    if(response.status == 200){
        const res = await (response).text().catch(x => console.log(x))        
        alert(res)
        onLoad()
    }
    
}
const notCompletedFormOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    const response = await fetch('http://localhost:8000/booking/not_completed', { method: 'PUT', headers: {authorization: `Bearer ${token}`}, body: data}).catch(x => console.log(x))
    if(response.status == 401)
        window.location.href = '/login.html'
    
    if(response.status == 400){
        const res = await (response).text().catch(x => console.log(x))        
        alert(res)
        onLoad()
    }

    if(response.status == 200){
        const res = await (response).text().catch(x => console.log(x))        
        alert(res)
        onLoad()
    }
}

const onLoad = async () => {
    const response = await fetch("http://localhost:8000/booking", {method: "GET", headers: {authorization: `Bearer ${token}`}}).catch(x => console.log(x))
    if(response.status == 401)
        window.location.href = '/login.html'
    
    if(response.status == 400){
        const res = await (response).text().catch(x => console.log(x))        
        alert(res)
        onLoad()
    }
    
    const results = await (response).json().catch(x => console.log(x))
    if(!results || results.length)
        return

    const table_booking = document.getElementById("my_table_booking")
    table_booking.innerHTML = `<tr><th>Name</th><th>Garage Name</th><th>Address</th><th>Time</th><th>STATUS</th></tr>`

    var my_booking = results.result

    my_booking = my_booking.map((booking) => {
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
