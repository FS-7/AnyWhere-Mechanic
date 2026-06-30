var token = localStorage.getItem('token')
if(!token)
    window.location.href = "/login.html"

const onLoad = async () => {
    const response_user = await fetch('http://localhost:8000/users', { method: "GET", headers: {authorization: `Bearer ${token}`} }).catch(x => { console.log(x.status) })
    if(response_user.status == 401)
        window.location.href = '/login.html'
    if(response_user.status == 400){
        const res = await (response).text().catch(x => console.log(x))        
        alert(res)
        onLoad()
    }
    
    const user = await (response_user).json().catch(x => console.log(x))
    
    const response_garages = await fetch('http://localhost:8000/garage', { method: "GET", headers: {authorization: `Bearer ${token}`} }).catch(x => { console.log(x.status) })
    if(response_garages.status == 401)
        window.location.href = '/login.html'
    if(response_garages.status == 400){
        const res = await (response).text().catch(x => console.log(x))        
        alert(res)
        onLoad()
    }
    
    const garages = await (response_garages).json().catch(x => console.log(x))

    if(!user && !garages){
        alert("Relogin")
        return 
    }

    const result = {user: user, garages: garages.result}
    
    document.getElementById("userfirstname").innerText = result.user.firstname;
    document.getElementById("userlastname").innerText = result.user.lastname;
    document.getElementById("userphone").innerText = result.user.phone;
    document.getElementById("useremail").innerText = result.user.email;
    document.getElementById("mechanic").innerText = Boolean(result.user.mechanic);

    const table_garages = document.getElementById("table_garages")
    table_garages.innerHTML = `<tr><th>Garage Name</th><th>Address</th><th>Pincode</th><th>Delete</th></tr>`

    var my_garages = result.garages

    my_garages = my_garages.map((garage) => {
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

        td_1.innerText = garage.GARAGE_NAME
        td_2.innerText = garage.ADDRESS
        td_3.innerText = garage.PINCODE
        
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
        td_4.appendChild(form)
        
        tr.appendChild(td_1)
        tr.appendChild(td_2)
        tr.appendChild(td_3)
        tr.appendChild(td_4)
        
        return tr
    })

    for (let garage in my_garages)
        table_garages.appendChild(my_garages[garage])
}

onLoad()

const firstNameFormOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    const response = await fetch('http://localhost:8000/users/user/firstname', { method: 'PUT', headers: {authorization: `Bearer ${token}`}, body: data})
    if(response.status == 401){
        alert("Unauthorized")
        window.location.href = "/login.html"
    }
    
    if(response.status == 400){
        const res = await (response).text().catch(x => console.log(x))        
        alert(res)
        onLoad()
    }
    
    if(response.status == 200) {
        const res = await (response).text().catch(x => console.log(x))
        alert(res)
    }
    onLoad()
}
document.getElementById('firstname_form').addEventListener('submit', firstNameFormOnSubmit)

const lastNameFormOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    const response = await fetch('http://localhost:8000/users/user/lastname', { method: 'PUT', headers: {authorization: `Bearer ${token}`}, body: data})
    if(response.status == 401){
        alert("Unauthorized")
        window.location.href = "/login.html"
    }

    if(response.status == 400){
        const res = await (response).text().catch(x => console.log(x))        
        alert(res)
        onLoad()
    }
    
    if(response.status == 200) {
        const res = await (response).text().catch(x => console.log(x))
        alert(res)
    }
    onLoad()
}
document.getElementById('lastname_form').addEventListener('submit', lastNameFormOnSubmit)

const emailFormOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    const response = await fetch('http://localhost:8000/users/user/email', { method: 'PUT', headers: {authorization: `Bearer ${token}`}, body: data})
    if(response.status == 401){
        alert("Unauthorized")
        window.location.href = "/login.html"
    }
    
    if(response.status == 400){
        const res = await (response).text().catch(x => console.log(x))        
        alert(res)
        onLoad()
    }
    
    if(response.status == 200) {
        const res = await (response).text().catch(x => console.log(x))
        alert(res)
    }
    onLoad()
}
document.getElementById('email_form').addEventListener('submit', emailFormOnSubmit)

const phoneFormOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    const response = await fetch('http://localhost:8000/users/user/phone', { method: 'PUT', headers: {authorization: `Bearer ${token}`}, body: data})
    if(response.status == 401){
        alert("Unauthorized")
        window.location.href = "/login.html"
    }
    
    if(response.status == 400){
        const res = await (response).text().catch(x => console.log(x))        
        alert(res)
        onLoad()
    }
    
    if(response.status == 200) {
        const res = await (response).text().catch(x => console.log(x))
        alert(res)
    }
    onLoad()
}
document.getElementById('phone_form').addEventListener('submit', phoneFormOnSubmit)

const mechanicFormOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    const response = await fetch('http://localhost:8000/users/user/mechanic', { method: 'PUT', headers: {authorization: `Bearer ${token}`}, body: data})
    if(response.status == 401){
        alert("Unauthorized")
        window.location.href = "/login.html"
    }
    
    if(response.status == 400){
        const res = await (response).text().catch(x => console.log(x))        
        alert(res)
        onLoad()
    }
    
    if(response.status == 200) {
        const res = await (response).text().catch(x => console.log(x))
        alert(res)
    }
    onLoad()
}
document.getElementById('mechanic_form').addEventListener('submit', mechanicFormOnSubmit)

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
