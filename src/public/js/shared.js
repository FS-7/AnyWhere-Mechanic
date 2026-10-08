export const HOST = "http://192.168.1.6"
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
    token =  ''

    isAuthenticated = () => {
        if (this.token)
            return true
        return false
    }

    isAuthorized = async (module) => {
        const response = await fetch(
                `${HOST}:${PORT}/users/auth`,
                {
                    method: 'GET',
                    headers: { authorization: `Bearer ${user.token}` },
                },
            );
        const [ success, result] = await checkResponse(response)
        if (success && result.includes(module)) {
            return true
        }
        return false
    }

    load = () => {
        this.first_name = localStorage.getItem('first_name')
        this.last_name = localStorage.getItem('last_name')
        this.email = localStorage.getItem('email')
        this.phone = localStorage.getItem('phone')
        this.token = localStorage.getItem('auth_token')
        log("User Loaded")
        return true
    }

    save = () => {
        localStorage.setItem('first_name', this.first_name)
        localStorage.setItem('last_name', this.last_name)
        localStorage.setItem('email', this.email)
        localStorage.setItem('phone', this.phone)
        localStorage.setItem('auth_token', this.token)
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
            headers: { authorization: `Bearer ${user.token}` },
        },
    )

    const [success, result] = await checkResponse(response)
    if (success) {
        user.reset()
        window.location.href = '/login.html'
    }
};

export const Authenticate = () => {
    if (!user.isAuthenticated())
        window.location.href = NOT_AUTHENTICATED_PAGE
}

export const Authorize = async (user, module) => {
    if (!await user.isAuthorized(module))
        window.location.href = NOT_AUTHORIZED_PAGE
    return true
}

export const checkResponse = async (response) => {
    var result
    switch (response.status){
        case 200:
            var result;
            const contentType = response.headers.get("content-type")
            if (contentType && contentType.includes("application/json")) {
                result = await response.json();
            } 
            else {
                result = await response.text();
            }
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
