import {
    HOST,
    PORT,
    Authenticate_and_Authorize,
    logout,
    checkResponse,
} from './shared.js';

await Authenticate_and_Authorize('admin_page');

document.getElementById('logout').addEventListener('click', logout)

var user_limit = 5
var user_offset = 1

var garage_limit = 5
var garage_offset = 1

var booking_limit = 5
var booking_offset = 1
    
const loadUsers = async () => {
    const response = await fetch(`${HOST}:${PORT}/admin/users?limit=${user_limit}&offset=${user_offset}`, {
        method: 'GET',
        credentials: 'include'
    })
    const [ success, result ] = await checkResponse(response)
    if (!success) {
        result = []
    }

    const user_accounts_table = document.getElementById('users');
    user_accounts_table.innerHTML = `<tr><th>Name</th><th>Phone</th><th>Email</th><th>Mechanic?</th><th>Delete</th></tr>`;

    const all_user_accounts = result.map((account) => {
        const formOnSubmit = async (e) => {
            e.preventDefault();

            const data = new URLSearchParams();
            for (let pair of new FormData(e.target))
                data.append(pair[0], [pair[1]]);

            const response = await fetch(
                `${HOST}:${PORT}/admin/users`,
                {
                    method: 'DELETE',
                    body: data,
                    credentials: 'include'
                },
            );
            const [ success, result] = await checkResponse(response)
            if (success){
                alert(result)
                await loadUsers()
                await loadNotifications()
            }
        };

        var tr = document.createElement('tr');
        var td_1 = document.createElement('td');
        var td_2 = document.createElement('td');
        var td_3 = document.createElement('td');
        var td_4 = document.createElement('td');
        var td_5 = document.createElement('td');

        td_1.innerText = `${account.FIRST_NAME} ${account.LAST_NAME}`;
        td_2.innerText = account.PHONE;
        td_3.innerText = account.EMAIL;
        td_4.innerText = account.IS_MECHANIC && 'Yes' || 'No';

        var form = document.createElement('form');
        var input = document.createElement('input');
        var submit = document.createElement('button');
        var p = document.createElement('p');

        form.addEventListener('submit', formOnSubmit);
        form.setAttribute('method', 'post')

        p.setAttribute('class', 'bi bi-trash');

        input.setAttribute('type', 'text');
        input.setAttribute('name', 'id');
        input.setAttribute('value', account.ID);
        input.setAttribute('hidden', 'true');

        submit.setAttribute('type', 'submit');
        submit.setAttribute('value', 'Delete');
        submit.setAttribute('class', 'button');

        submit.appendChild(p);
        form.appendChild(input);
        form.appendChild(submit);
        td_5.appendChild(form);

        tr.appendChild(td_1);
        tr.appendChild(td_2);
        tr.appendChild(td_3);
        tr.appendChild(td_4);
        tr.appendChild(td_5);

        return tr;
    });

    for (let account of all_user_accounts)
        user_accounts_table.appendChild(account);
}

const loadGarages = async () => {
    const response = await fetch(`${HOST}:${PORT}/admin/garages?limit=${garage_limit}&offset=${garage_offset}`, {
        method: 'GET',
        credentials: 'include'
    })
    const [ success, result ] = await checkResponse(response)
    if (!success){
        result = []
    }
    
    const table_garages = document.getElementById('table_garages');
    table_garages.innerHTML = `<tr><th>Mechanic Name</th><th>Garage Name</th><th>Address</th><th>Pincode</th><th>Latitude</th><th>Longitude</th></tr>`;

    const all_garages = result.map((garage) => {
        var tr = document.createElement('tr');
        var td_1 = document.createElement('td');
        var td_2 = document.createElement('td');
        var td_3 = document.createElement('td');
        var td_4 = document.createElement('td');
        var td_5 = document.createElement('td');
        var td_6 = document.createElement('td');

        td_1.innerText = `${garage.FIRST_NAME} ${garage.LAST_NAME}`;
        td_2.innerText = garage.GARAGE_NAME;
        td_3.innerText = garage.ADDRESS;
        td_4.innerText = garage.PINCODE;
        td_5.innerText = garage.LOC_LAT;
        td_6.innerText = garage.LOC_LON;

        tr.appendChild(td_1);
        tr.appendChild(td_2);
        tr.appendChild(td_3);
        tr.appendChild(td_4);
        tr.appendChild(td_5);
        tr.appendChild(td_6);

        return tr;
    });

    for (let garage of all_garages) 
        table_garages.appendChild(garage);
}

const loadBookings = async () => {
    const table_booking = document.getElementById('table_booking');
    
    const response = await fetch(`${HOST}:${PORT}/admin/bookings?limit=${booking_limit}&offset=${booking_offset}`, {
        method: 'GET',
        credentials: 'include'
    })
    const [ success, result ] = await checkResponse(response)
    if (!success){
        result = []
    }
    
    table_booking.innerHTML = `<tr><th>Name</th><th>Garage Name</th><th>Address</th><th>Time</th><th></th><th></th></tr>`;

    const all_booking = result.map((booking) => {
        var tr = document.createElement('tr');
        var td_1 = document.createElement('td');
        var td_2 = document.createElement('td');
        var td_3 = document.createElement('td');
        var td_4 = document.createElement('td');
        var td_5 = document.createElement('td');
        var td_6 = document.createElement('td');

        td_1.innerText = `${booking.FIRST_NAME} ${booking.LAST_NAME}`;
        td_2.innerText = `${booking.GARAGE_NAME}`;
        td_3.innerText = `${booking.ADDRESS}`;
        td_4.innerText = `${booking.DATE_TIME}`;

        const getUpdateStatusForm = () => {
            const updateStatusOnSubmit = async (e) => {
                e.preventDefault();

                const data = new URLSearchParams();
                for (let pair of new FormData(e.target))
                    data.append(pair[0], [pair[1]]);

                const response = await fetch(
                    `${HOST}:${PORT}/admin/bookings/status`,
                    {
                        method: 'PUT',
                        body: data,
                        credentials: 'include'
                    },
                )
                const [ success, result] = await checkResponse(response)
                if (success){
                    alert(result)
                    await loadBookings()
                    await loadNotifications()
                }
            };

            const form = document.createElement('form');
            const input = document.createElement('input');
            const dropdown = document.createElement('select');
            const submit = document.createElement('button');
            const p = document.createElement('p');

            form.addEventListener('submit', updateStatusOnSubmit);
            form.setAttribute('method', 'post')

            p.setAttribute('class', 'bi bi-check2');

            input.setAttribute('type', 'text');
            input.setAttribute('name', 'booking_id');
            input.setAttribute('value', booking.B_ID);
            input.setAttribute('hidden', 'true')

            dropdown.setAttribute('type', 'text');
            dropdown.setAttribute('name', 'status');
            dropdown.setAttribute('value', booking.STATUS);

            const dropdown_options = ['INITIATED', 'ACCEPTED', 'REJECTED', 'ARRIVED', 'NOT ARRIVED', 'COMPLETED', 'NOT COMPLETED']
            
            for (let option of dropdown_options) {
                let dropdown_option = document.createElement('option')
                dropdown_option.setAttribute('value', option)
                dropdown_option.innerText = option

                if (booking.STATUS === option) {
                    dropdown_option.setAttribute('selected', true)
                }

                dropdown.appendChild(dropdown_option)
            }

            submit.setAttribute('type', 'submit');
            submit.setAttribute('value', 'Update');
            submit.setAttribute('class', 'success-btn');
            submit.appendChild(p);

            form.appendChild(input);
            form.appendChild(dropdown);
            form.appendChild(submit);

            return form
        }
        
        const deleteBookingForm = () => {
            const formOnSubmit = async (e) => {
                e.preventDefault();

                const data = new URLSearchParams();
                for (let pair of new FormData(e.target))
                    data.append(pair[0], [pair[1]]);

                const response = await fetch(
                    `${HOST}:${PORT}/admin/bookings`,
                    {
                        method: 'DELETE',
                        body: data,
                        credentials: 'include'
                    },
                )
                const [ success, result] = await checkResponse(response)
                if (success){
                    alert(result)
                    await loadBookings()
                    await loadNotifications()
                }
            };

            const form = document.createElement('form');
            const input = document.createElement('input');
            const submit = document.createElement('button');
            const p = document.createElement('p');

            form.addEventListener('submit', formOnSubmit);
            form.setAttribute('method', 'post')

            p.setAttribute('class', 'bi bi-trash');

            input.setAttribute('type', 'text');
            input.setAttribute('name', 'booking_id');
            input.setAttribute('value', booking.B_ID);
            input.setAttribute('hidden', 'true')

            submit.setAttribute('type', 'submit');
            submit.setAttribute('value', 'Delete');
            submit.setAttribute('class', 'button');

            submit.appendChild(p);
            form.appendChild(input);
            form.appendChild(submit);

            return form
        }

        td_5.appendChild(getUpdateStatusForm());
        td_6.appendChild(deleteBookingForm());

        tr.appendChild(td_1);
        tr.appendChild(td_2);
        tr.appendChild(td_3);
        tr.appendChild(td_4);
        tr.appendChild(td_5);
        tr.appendChild(td_6);

        return tr;
    });

    for (let booking of all_booking) 
        table_booking.appendChild(booking);
}

const Load = async () => {
    await loadUsers()
    setTimeout(() => {}, 500)
    await loadGarages()
    setTimeout(() => {}, 500)
    await loadBookings()
    setTimeout(() => {}, 500)

    const user_limit_input = document.getElementById('user_limit')
    user_limit_input.addEventListener('change', async (e) => { e.target.value && (user_limit = Number(e.target.value)); await loadUsers() })

    const user_offset_input = document.getElementById('user_offset')
    user_offset_input.addEventListener('change', async (e) => { e.target.value && (user_offset = Number(e.target.value)); await loadUsers() })

    document.getElementById('increment_user_offset').addEventListener('click', async (e) => { user_offset += 1; user_offset_input.value = user_offset; await loadUsers() })
    document.getElementById('decrement_user_offset').addEventListener('click', async (e) => { user_offset -= 1; user_offset_input.value = user_offset; await loadUsers() })

    user_offset_input.value = user_offset

    const garage_limit_input = document.getElementById('garage_limit')
    garage_limit_input.addEventListener('change', async (e) => { e.target.value && (garage_limit = Number(e.target.value)); await loadGarages() })

    const garage_offset_input = document.getElementById('garage_offset')
    garage_offset_input.addEventListener('change', async (e) => { e.target.value && (garage_offset = Number(e.target.value)); await loadGarages() })

    document.getElementById('increment_garage_offset').addEventListener('click', async (e) => { garage_offset += 1; garage_offset_input.value = garage_offset; await loadGarages() })
    document.getElementById('decrement_garage_offset').addEventListener('click', async (e) => { garage_offset -= 1; garage_offset_input.value = garage_offset; await loadGarages() })

    garage_offset_input.value = garage_offset

    const booking_limit_input = document.getElementById('booking_limit')
    booking_limit_input.addEventListener('change', async (e) => { e.target.value && (booking_limit = Number(e.target.value)); await loadBookings() })

    const booking_offset_input = document.getElementById('booking_offset')
    booking_offset_input.addEventListener('change', async (e) => { e.target.value && (booking_offset = Number(e.target.value)); await loadBookings() })

    document.getElementById('increment_booking_offset').addEventListener('click', async (e) => { booking_offset += 1; booking_offset_input.value = booking_offset; await loadBookings() })
    document.getElementById('decrement_booking_offset').addEventListener('click', async (e) => { booking_offset -= 1; booking_offset_input.value = booking_offset; await loadBookings() })

    booking_offset_input.value
};

await Load();