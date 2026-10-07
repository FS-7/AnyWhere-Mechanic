export const HOST = "http://localhost"
export const PORT = "8000"

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

export class User{
    first_name = ''
    last_name = ''
    email = ''
    phone = ''
    auth = {
        token: '',
        authorized: []
    }

    isAuthenticated = () => {
        if (this.auth.token)
            return true
        return false
    }

    isAuthorized = (module) => {
        if (module in this.auth.authorized)
            return true
        return false
    }

    load = () => {
        this.first_name = localStorage.getItem('first_name')
        this.last_name = localStorage.getItem('last_name')
        this.email = localStorage.getItem('email')
        this.phone = localStorage.getItem('phone')
        this.auth.token = localStorage.getItem('auth_token')
        this.auth.authorized = JSON.parse(localStorage.getItem('authorized_list'))
        log("User Loaded")
        return true
    }

    save = () => {
        localStorage.setItem('first_name', this.first_name)
        localStorage.setItem('last_name', this.last_name)
        localStorage.setItem('email', this.email)
        localStorage.setItem('phone', this.phone)
        localStorage.setItem('auth_token', this.auth.token)
        localStorage.setItem('authorized_list', JSON.stringify(this.auth.authorized))
        log("User Saved")
        return true
    }
    
    reset = () => {
        localStorage.clear()
        log("User Logged out")
        return true
    }
}

const getUser = () => {
    return new User()
}

export const user = getUser()
user.load()

export const logout = async () => {
    const response = await fetch(
        `${HOST}:${PORT}/users/logout`,
        {
            method: 'POST',
            headers: { authorization: `Bearer ${user.auth.token}` },
        },
    )

    const [success, result] = await checkResponse(response)
    if (success) {
        user.first_name = ''
        user.last_name = ''
        user.email = ''
        user.phone = ''
        user.auth.token = ''
        user.auth.authorized = []
        user.reset()
        window.location.href = '/login.html'
    }
};

export const Authenticate = () => {
    if (!user.isAuthenticated())
        window.location.href = NOT_AUTHENTICATED_PAGE
}

export const Authorize = (module) => {
    return true
    if (user.isAuthorized(module))
        return true
    return false
}

export const checkResponse = async (response) => {
    var result
    switch (response.status){
        case 200:
            result = await response.json() 
            return [true, result]

        case 400:
            error(400)
            window.location.href = ERROR_PAGE;
            result = await response.text()
            error(result)
            break

        case 401: 
            error(401)
            result = await response.text()
            error(result)
            window.location.href = NOT_AUTHENTICATED_PAGE;
            break

        case 403:
            error(403)
            result = await response.text()
            error(result)
            window.location.href = NOT_AUTHORIZED_PAGE;
            break

        case 404:
            error(404)
            result = await response.text()
            error(result)
            window.location.href = NOT_FOUND_PAGE;
            break

        case 500:
            error(500)
            result = await response.text()
            error(result)
            window.location.href = ERROR_PAGE
            break

        default:
            result = await response.text()
            error(result)
            window.location.href = ERROR_PAGE
    }
}
