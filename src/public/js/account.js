import { checkResponse, loadNotifications, logout } from './shared.js';

document.getElementById('logout').addEventListener('click', logout)

const loadUser = async () => {
    const response = await fetch(`/users`, 
        { 
            method: 'GET', 
            credentials: 'include'
        }
    )
    const [ success, result] = await checkResponse(response)
    if (!success) {}
    
    document.getElementById('userfirstname').innerText = result.first_name;
    document.getElementById('userlastname').innerText = result.last_name;
    document.getElementById('userphone').innerText = result.phone;
    document.getElementById('useremail').innerText = result.email;
    document.getElementById('mechanic').innerText = Boolean(result.is_mechanic);
}

const loadGarages = async () => {
    const formOnSubmit = async (e) => {
        e.preventDefault();

        const data = new URLSearchParams();
        for (let pair of new FormData(e.target))
            data.append(pair[0], [pair[1]])

        const response = await fetch(`/garage`, 
            { 
                method: 'DELETE', 
                body: data,
                credentials: 'include'
            }
        )
        const [ success, result] = await checkResponse(response)
        if (success){
            alert(result)
            await loadGarages()
            await loadNotifications()
        }
    }

    const response = await fetch(`/garage`, 
        { 
            method: 'GET', 
            credentials: 'include'
        }
    )
    const [ success, result ] = await checkResponse(response)
    if (!success) 
        return []
    
    const table = document.getElementById('table_garages')
    table.innerHTML = `<tr><th>Garage Name</th><th>Address</th><th>Pincode</th><th>Delete</th></tr>`

    var my_garages = result.map((garage) => {
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
        form.setAttribute('method', 'post')

        p.setAttribute('class', 'bi bi-trash')

        input.setAttribute('type', 'text')
        input.setAttribute('name', 'id')
        input.setAttribute('value', garage.ID)
        input.setAttribute('hidden', 'true')

        submit.setAttribute('type', 'submit')
        submit.setAttribute('value', 'Delete')
        submit.setAttribute('class', 'delete-btn')
        
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

    for (let garage of my_garages)
        table.appendChild(garage)
}

const Load = async () => {
    await loadUser()
    await loadGarages()
}

await Load()

const firstNameFormOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    const response = await fetch(`/users/user/firstname`, 
        { 
            method: 'PUT', 
            credentials: 'include',
            body: data
        }
    )
    const [ success, result] = await checkResponse(response)
    if (success){
        alert(result)
        await loadUser()
        await loadNotifications()
    }
}
document.getElementById('firstname_form').addEventListener('submit', firstNameFormOnSubmit)

const lastNameFormOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    const response = await fetch(`/users/user/lastname`, 
        { 
            method: 'PUT', 
            credentials: 'include',
            body: data
        }
    )
    const [ success, result] = await checkResponse(response)
    if (success){
        alert(result)
        await loadUser()
        await loadNotifications()
    }
}
document.getElementById('lastname_form').addEventListener('submit', lastNameFormOnSubmit)

const emailFormOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    const response = await fetch(`/users/user/email`, 
        { 
            method: 'PUT', 
            credentials: 'include',
            body: data
        }
    )

    const [ success, result] = await checkResponse(response)
    if (success){
        alert(result)
        await loadUser()
        await loadNotifications()
    }
}
document.getElementById('email_form').addEventListener('submit', emailFormOnSubmit)

const phoneFormOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    const response = await fetch(`/users/user/phone`, 
        { 
            method: 'PUT', 
            credentials: 'include',
            body: data
        }
    )

    const [ success, result] = await checkResponse(response)
    if (success){
        alert(result)
        await loadUser()
        await loadNotifications()
    }
}
document.getElementById('phone_form').addEventListener('submit', phoneFormOnSubmit)

const passwordFormOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    const response = await fetch(`/users/user/password`, 
        { 
            method: 'PUT', 
            body: data,
            credentials: 'include'
        }
    )

    const [ success, result] = await checkResponse(response)
    if (success){
        alert(result)
        await loadUser()
        await loadNotifications()
    }
}
document.getElementById('update_password').addEventListener('submit', passwordFormOnSubmit)
