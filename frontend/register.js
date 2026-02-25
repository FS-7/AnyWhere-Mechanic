form = document.getElementById("form")
function register(e) {
    e.preventDefault();
    console.log("Registering")
}

form.addEventListener('submit', event => register(event))