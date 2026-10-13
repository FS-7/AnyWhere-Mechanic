const NOT_AUTHENTICATED_PAGE = '401.html'
const NOT_AUTHORIZED_PAGE = '403.html'
const NOT_FOUND_PAGE = '404.html'
const ERROR_PAGE = '500.html'

export const log = (output) => {
    console.log('Info:', output)
}

export const error = (err) => {
    console.log('Error: ', err)
}

export const logout = async () => {
    const response = await fetch(
        `${HOST}:${PORT}/users/logout`,
        {
            method: 'POST',
            credentials: 'include'
        },
    )

    const [success, result] = await checkResponse(response)
    if (success) {
        window.location.href = '/login.html'
    }
};

export const Authenticate_and_Authorize = async (module) => {
    const response = await fetch(
        `${HOST}:${PORT}/users/auth`,
        {
            method: 'GET',
            credentials: 'include'
        },
    );

    const [ success, result ] = await checkResponse(response)
    if (success && result.includes(module)) {
        return
    }
    window.location.href = NOT_AUTHORIZED_PAGE
}

export const checkResponse = async (response) => {
    var result
    switch (response.status){
        case 200:
            const contentType = response.headers.get("content-type")
            if (contentType && contentType.includes("application/json")) {
                result = await response.json();
            } 
            else {
                result = await response.text();
            }
            return [true, result]

        case 201: 
            return [true, []]
            
        case 204:
            return [true, []]

        case 400:
            result = await response.text()
            error(`${400}: ${result}`)
            window.location.href = ERROR_PAGE;
            break

        case 401: 
            result = await response.text()
            error(`${401}: ${result}`)
            window.location.href = NOT_AUTHENTICATED_PAGE;
            break

        case 403:
            result = await response.text()
            error(`${403}: ${result}`)
            window.location.href = NOT_AUTHORIZED_PAGE;
            break

        case 404:
            result = await response.text()
            error(`${404}: ${result}`)
            window.location.href = NOT_FOUND_PAGE;
            break

        case 500:
            result = await response.text()
            error(`${500}: ${result}`)
            window.location.href = ERROR_PAGE
            break

        default:
            result = await response.text()
            error(`${response.status}: ${result}`)
    }
}

export const loadNotifications = async () => {
    const response = await fetch(
        `${HOST}:${PORT}/notifications`, 
        {
            method: 'GET',
            credentials: 'include'
        }
    )

    const [success, result] = await checkResponse(response)
    if (!success)
        return []

    var notifications = result.map((notification) => {
        const tr = document.createElement('tr')
        const td_time = document.createElement('td')
        const td_message = document.createElement('td')

        td_time.innerText = new Date(notification.TIME).toLocaleString()
        td_message.innerText = notification.MESSAGE

        tr.appendChild(td_time)
        tr.appendChild(td_message)
        return tr
    })

    notifications_div.innerText = ''
    for (let notification of notifications)
        notifications_div.appendChild(notification)
}

const notifications_div = document.getElementById('notifications') 
if (notifications_div)
    notifications_div.addEventListener('load', loadNotifications)