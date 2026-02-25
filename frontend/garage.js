form = document.getElementById("form")
function helloworld(e) {
    e.preventDefault();
    console.log("hello")
}

form.addEventListener('submit', event => helloworld(event))