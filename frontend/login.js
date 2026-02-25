form = document.getElementById("form")

//  LOGIN
function login(e) {
    e.preventDefault();
    console.log("Logging in")
}

form.addEventListener('submit', event => login(event))