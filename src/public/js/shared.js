export const HOST = "http://192.168.1.7"
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
