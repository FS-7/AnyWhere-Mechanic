var token = localStorage.getItem('token')
if(!token)
    window.location.href = "/login.html"

const onLoad = async () => {
    const response = await fetch("http://localhost:8000/admin", {method: "GET", headers: { authorization: `Bearer ${token}`}}).catch(x => console.log(x))
    //  On Failure
    if(response.status == 401)
        window.location.href = '/login.html'

    if(response.status == 400){
        const res = await (response).text().catch(x => console.log(x))        
        alert(res)
    }

    //  On Success
    var result
    if (response.status == 200)
        result = await (response).json().catch(x => console.log(x))

    if (!result)
        console.log("Error")

    const user = result.user[0]
    document.getElementById("userphone").innerText = user.PHONE;
    document.getElementById("useremail").innerText = user.EMAIL;

    const accounts = result.accounts
    const user_accounts = document.getElementById("users")
    user_accounts.innerHTML = `<tr><th>Name</th><th>Phone</th><th>Email</th><th>Mechanic?</th><th>Delete</th></tr>`

    const all_user_accounts = accounts.map((account) => {
        const formOnSubmit = async (e) => {
            e.preventDefault();

            const data = new URLSearchParams();
            for (let pair of new FormData(e.target))
                data.append(pair[0], [pair[1]])

            const response = await fetch('http://localhost:8000/users', { method: 'DELETE', headers: {authorization: `Bearer ${token}`}, body: data})
            const res = await (response).text().catch(x => console.log(x))
            if(response.status == 401)
                window.location.href = '/login.html'
    
            if(response.status == 400){
                const res = await (response).text().catch(x => console.log(x))        
                alert(res)
                onLoad()
            }
            if(response.status == 200){
                alert(res)
                onLoad()
            }        
        }

        var tr = document.createElement('tr')
        var td_1 = document.createElement('td')
        var td_2 = document.createElement('td')
        var td_3 = document.createElement('td')
        var td_4 = document.createElement('td')
        var td_5 = document.createElement('td')

        td_1.innerText = `${account.FIRST_NAME} ${account.LAST_NAME}`
        td_2.innerText = account.PHONE
        td_3.innerText = account.EMAIL
        td_4.innerText = account.IS_MECHANIC
        
        var form = document.createElement('form')
        var input = document.createElement('input')
        var submit = document.createElement('button')
        var p = document.createElement('p')

        form.addEventListener('submit', formOnSubmit)

        p.setAttribute('class', 'bi bi-trash')

        input.setAttribute('type', 'text')
        input.setAttribute('name', 'id')
        input.setAttribute('value', account.ID)
        input.setAttribute('hidden', 'true')

        submit.setAttribute('type', 'submit')
        submit.setAttribute('value', 'Delete')
        submit.setAttribute('class', 'button')
        
        submit.appendChild(p)
        form.appendChild(input)
        form.appendChild(submit)
        td_5.appendChild(form)
        
        tr.appendChild(td_1)
        tr.appendChild(td_2)
        tr.appendChild(td_3)
        tr.appendChild(td_4)
        tr.appendChild(td_5)
        
        return tr
    })

    for (let i in all_user_accounts)
        user_accounts.appendChild(all_user_accounts[i])

    const garages = result.garages

    const table_garages = document.getElementById("table_garages")
    table_garages.innerHTML = `<tr><th>Mechanic Name</th><th>Garage Name</th><th>Address</th><th>Pincode</th><th>Latitude</th><th>Longitude</th><th>Delete</th></tr>`

    const all_garages = garages.map((garage) => {
        const formOnSubmit = async (e) => {
            e.preventDefault();

            const data = new URLSearchParams();
            for (let pair of new FormData(e.target))
                data.append(pair[0], [pair[1]])

            const response = await fetch('http://localhost:8000/garage', { method: 'DELETE', headers: {authorization: `Bearer ${token}`}, body: data})
            const res = await (response).text().catch(x => console.log(x))
            if(response.status == 401)
                window.location.href = '/login.html'
    
            if(response.status == 400){
                const res = await (response).text().catch(x => console.log(x))        
                alert(res)
                onLoad()
            }
            if(response.status == 200){
                alert(res)
                onLoad()
            }        
        }

        var tr = document.createElement('tr')
        var td_1 = document.createElement('td')
        var td_2 = document.createElement('td')
        var td_3 = document.createElement('td')
        var td_4 = document.createElement('td')
        var td_5 = document.createElement('td')
        var td_6 = document.createElement('td')
        var td_7 = document.createElement('td')

        td_1.innerText = `${garage.FIRST_NAME} ${garage.LAST_NAME}`
        td_2.innerText = garage.GARAGE_NAME
        td_3.innerText = garage.ADDRESS
        td_4.innerText = garage.PINCODE
        td_5.innerText = garage.LOC_LAT
        td_6.innerText = garage.LOC_LON
        
        var form = document.createElement('form')
        var input = document.createElement('input')
        var submit = document.createElement('button')
        var p = document.createElement('p')

        form.addEventListener('submit', formOnSubmit)

        p.setAttribute('class', 'bi bi-trash')

        input.setAttribute('type', 'text')
        input.setAttribute('name', 'id')
        input.setAttribute('value', garage.ID)
        input.setAttribute('hidden', 'true')

        submit.setAttribute('type', 'submit')
        submit.setAttribute('value', 'Delete')
        submit.setAttribute('class', 'button')
        
        submit.appendChild(p)
        form.appendChild(input)
        form.appendChild(submit)
        td_7.appendChild(form)
        
        tr.appendChild(td_1)
        tr.appendChild(td_2)
        tr.appendChild(td_3)
        tr.appendChild(td_4)
        tr.appendChild(td_5)
        tr.appendChild(td_6)
        tr.appendChild(td_7)
        
        return tr
    })

    for (let i in all_garages)
        table_garages.appendChild(all_garages[i])

    const bookings = result.bookings
    const table_booking = document.getElementById("table_booking")
    table_booking.innerHTML = `<tr><th>Name</th><th>Garage Name</th><th>Address</th><th>Time</th><th>Delete</th></tr>`

    const all_booking = bookings.map((booking) => {
        
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
        submit.setAttribute('value', 'Delete')
        submit.setAttribute('class', 'button')
        
        submit.appendChild(p)
        form.appendChild(input)
        form.appendChild(submit)
        td_5.appendChild(form)
        
        tr.appendChild(td_1)
        tr.appendChild(td_2)
        tr.appendChild(td_3)
        tr.appendChild(td_4)
        tr.appendChild(td_5)
        
        return tr
    })

    for (let i in all_booking)
        table_booking.appendChild(all_booking[i])
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
