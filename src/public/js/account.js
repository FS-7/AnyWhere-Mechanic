import { HOST, PORT, Authenticate_and_Authorize, checkResponse, logout } from './shared.js';

await Authenticate_and_Authorize('account_page')

document.getElementById('logout').addEventListener('click', logout)

const Load = async () => {
    const response_user = await fetch(`${HOST}:${PORT}/users`, 
        { 
            method: 'GET', 
            credentials: 'include'
        }
    )
    const [ user_success, user_result] = await checkResponse(response_user)
    if (!user_success) {}
    
    const response_garages = await fetch(`${HOST}:${PORT}/garage`, 
        { 
            method: 'GET', 
            credentials: 'include'
        }
    )

    var result
    var garage_result
    
    const contentType = response_garages.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
        result = await response_garages.json();
        garage_result = result
    } 
    else {
        result = await response_garages.text();
        garage_result = []
    }
    
    document.getElementById('userfirstname').innerText = user_result.first_name;
    document.getElementById('userlastname').innerText = user_result.last_name;
    document.getElementById('userphone').innerText = user_result.phone;
    document.getElementById('useremail').innerText = user_result.email;
    document.getElementById('mechanic').innerText = Boolean(user_result.mechanic);

    const table_garages = document.getElementById('table_garages')
    table_garages.innerHTML = `<tr><th>Garage Name</th><th>Address</th><th>Pincode</th><th>Delete</th></tr>`

    var my_garages = garage_result.map((garage) => {
        const formOnSubmit = async (e) => {
            e.preventDefault();

            const data = new URLSearchParams();
            for (let pair of new FormData(e.target))
                data.append(pair[0], [pair[1]])

            const response = await fetch(`${HOST}:${PORT}/garage`, 
                { 
                    method: 'DELETE', 
                    body: data,
                    credentials: 'include'
                }
            )
            const [ success, result] = await checkResponse(response)
            if (success){
                alert(result)
                Load()
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

Load()

const firstNameFormOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    const response = await fetch(`${HOST}:${PORT}/users/user/firstname`, 
        { 
            method: 'PUT', 
            credentials: 'include',
            body: data
        }
    )
    const [ success, result] = await checkResponse(response)
    if (success){
        alert(result)
    }
    onLoad()
}
document.getElementById('firstname_form').addEventListener('submit', firstNameFormOnSubmit)

const lastNameFormOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    const response = await fetch(`${HOST}:${PORT}/users/user/lastname`, 
        { 
            method: 'PUT', 
            credentials: 'include',
            body: data
        }
    )
    const [ success, result] = await checkResponse(response)
    if (success){
        alert(result)
    }
    onLoad()
}
document.getElementById('lastname_form').addEventListener('submit', lastNameFormOnSubmit)

const emailFormOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    const response = await fetch(`${HOST}:${PORT}/users/user/email`, 
        { 
            method: 'PUT', 
            credentials: 'include',
            body: data
        }
    )

    const [ success, result] = await checkResponse(response)
    if (success){
        alert(result)
    }

    onLoad()
}
document.getElementById('email_form').addEventListener('submit', emailFormOnSubmit)

const phoneFormOnSubmit = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    for (let pair of new FormData(e.target))
        data.append(pair[0], [pair[1]])

    const response = await fetch(`${HOST}:${PORT}/users/user/phone`, 
        { 
            method: 'PUT', 
            credentials: 'include',
            body: data
        }
    )

    const [ success, result] = await checkResponse(response)
    if (success){
        alert(result)
    }

    onLoad()
}
document.getElementById('phone_form').addEventListener('submit', phoneFormOnSubmit)
