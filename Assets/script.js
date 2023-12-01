const apiKey = '4dc9fa4b4b1800747dd2935ad674fe6c';
const latAndLon = 'https://nominatim.openstreetmap.org/search?format=json&q=';
const temp = document.getElementById('temp');
const wind = document.getElementById('wind');
const humidity = document.getElementById('humidity');
const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('search-btn');
const cityName = document.getElementById('city-name');
const buttons = document.getElementsByTagName('button');
const searchContainer = document.querySelector('.search-container');
const forecastContainer = document.getElementById('forecast-container');
let search;

const options = {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
};

if (localStorage.length !== 0) {
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i) !== null && localStorage.key(i) !== undefined) {
            const btn = document.createElement('button');
            btn.textContent = localStorage.key(i);
            searchContainer.append(btn);
        }
    }
    addButtonEventListeners();
} else {
    addButtonEventListeners();
}

async function displayForecast(e) {
    const searchValue = searchInput.value;
    const btnValue = e.target.textContent;
    try {
        if (searchValue !== '') {
            validateBtn(btnValue, searchValue);
            const res = await fetch(`${latAndLon}${searchValue}&format=json`); 
            const data = await res.json();
            getWeather(data[0].lat, data[0].lon);
        }
    } catch (err) {
        console.log(err);
    }
}

async function getWeather(lat, lon) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
        const res = await fetch(url);
        const data = await res.json();
        const date = new Date(data.list[0].dt_txt);
        const daysToCome = getNextFiveDays(date, data);
        cityName.textContent = `${data.city.name} (${date.toLocaleString('en-US', options)})`;
        forecastContainer.textContent = '';
        display5DayForecast(data); 
        temp.textContent = `Temp: ${data.list[0].main.temp} F`;
        wind.textContent = `Wind: ${data.list[0].wind.speed} MPH`;
        humidity.textContent = `Humidity: ${data.list[0].main.humidity}%`;
        addButtonEventListeners();
    } catch (err) {
        console.log(err);
    }
}

function display5DayForecast(data) {
    forecastContainer.textContent = ''; 
    for (let i = 0; i < 5; i++) {
        const futureDate = new Date(data.list[i * 8].dt_txt);
        const iconCode = data.list[i * 8].weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;

        forecastContainer.innerHTML += `
            <div>
                <h3>${futureDate.toLocaleString('en-US', options)}</h3>
                <img src="${iconUrl}" alt="Weather Icon">
                <p>Temp: ${data.list[i * 8].main.temp} F</p>
                <p>Wind: ${data.list[i * 8].wind.speed} MPH</p>
                <p>Humidity: ${data.list[i * 8].main.humidity} %</p>
            </div>
        `;
    }
}

function getNextFiveDays(date, data) {
    let day = parseInt(date.toLocaleString('en-US', { day: 'numeric' })) + 1;
    let condition = day + 5;
    let daysToCome = [];

    for (let i = 0; day !== condition; i++) {
        if (data.list[i] !== undefined) {
            let nextDay = parseInt(data.list[i].dt_txt.substring(8, 10));
            if (nextDay === day) {
                daysToCome.push(data.list[i]);
                day++;
                nextDay++;
            } else if (day === 31) {
                day = 1;
            }
            continue;
        }
        i++;
        day++;
    }
    return daysToCome;
}

function validateBtn(btnValue, searchValue) {
    const valueIsDuplicate = noDuplicateBtns(searchValue);
    const btn = document.createElement('button');

    if (btnValue === 'Search' && !(valueIsDuplicate)) {
        search = searchValue;
        btn.textContent = search;
    } else if (btnValue === 'Search' && valueIsDuplicate) {
        search = searchInput.value;
        btn.textContent = search;
        searchContainer.append(btn);
        localStorage.setItem(search, search);
    } else {
        search = btnValue;
    }
}

function noDuplicateBtns(value) {
    for (let i = 1; i < buttons.length; i++) {
        if (buttons[i].textContent === value) {
            return false;
        }
    }
    return true;
}

function addButtonEventListeners() {
    for (let btn of buttons) {
        btn.addEventListener('click', displayForecast);
    }
}

