
const address = document.getElementById('address');
const pincode = document.getElementById('pincode');

pincode.addEventListener("change",
    () => {
        console.log("pincode changed\t" + pincode.value)
    }
)