const token = localStorage.getItem('token')
if(!token)
    window.location.href = "/login.html"

const acceptFormOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    const response = await fetch('http://localhost:8000/booking/accepted', { method: 'PUT', headers: {authorization: `Bearer ${token}`}, body: data}).catch(x => console.log(x))
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

const rejectFormOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    const response = await fetch('http://localhost:8000/booking/rejected', { method: 'PUT', headers: {authorization: `Bearer ${token}`}, body: data}).catch(x => console.log(x))
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
    const response = await fetch("http://localhost:8000/booking_mechanic", {method: "GET", headers: {authorization: `Bearer ${token}`}}).catch(x => console.log(x))
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

    const table_booking = document.getElementById("table_booking")
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

        td_1.innerText = `${booking.FIRST_NAME} ${booking.LAST_NAME}`
        td_2.innerText = `${booking.GARAGE_NAME}`
        td_3.innerText = `${booking.ADDRESS}`
        td_4.innerText = `${booking.DATE_TIME}`
        td_5.innerText = `${booking.STATUS}`

        var reject_form = document.createElement('form')
        var input = document.createElement('input')
        var submit = document.createElement('button')
        var p = document.createElement('p')

        reject_form.addEventListener('submit', rejectFormOnSubmit)

        p.setAttribute('class', 'bi bi-ban')

        input.setAttribute('type', 'text')
        input.setAttribute('name', 'id')
        input.setAttribute('value', booking.B_ID)
        input.setAttribute('hidden', 'true')
        
        submit.setAttribute('type', 'submit')
        submit.setAttribute('value', 'Delete')
        submit.setAttribute('class', 'button')
        
        submit.appendChild(p)
        reject_form.appendChild(input)
        reject_form.appendChild(submit)
        td_6.appendChild(reject_form)
        
        var accept_form = document.createElement('form')
        var input = document.createElement('input')
        var submit = document.createElement('button')
        var p = document.createElement('p')

        accept_form.addEventListener('submit', acceptFormOnSubmit)

        p.setAttribute('class', 'bi bi-check2')

        input.setAttribute('type', 'text')
        input.setAttribute('name', 'id')
        input.setAttribute('value', booking.B_ID)
        input.setAttribute('hidden', 'true')
        
        submit.setAttribute('type', 'submit')
        submit.setAttribute('value', 'Delete')
        submit.setAttribute('class', 'button')
        
        submit.appendChild(p)
        accept_form.appendChild(input)
        accept_form.appendChild(submit)
        td_7.appendChild(accept_form)

        tr.appendChild(td_1)
        tr.appendChild(td_2)
        tr.appendChild(td_3)
        tr.appendChild(td_4)
        tr.appendChild(td_5)
        tr.appendChild(td_6)
        tr.appendChild(td_7)
        
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
