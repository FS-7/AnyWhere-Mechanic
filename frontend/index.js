
const onLoad = () => {
    fetch()
}

const search = document.getElementById('search');
const searchbox = document.getElementById('searchbox');
const gps = document.getElementById('gps');

const searchFunction = () => {
    let query = searchbox.value;
    fetch();
};

search.onclick(searchFunction);