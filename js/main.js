// Global variables

let myCoords = {lat: null, lon: null};
let myWeather = null;
const locationElement = document.querySelector(".message__location");


// Global flow

clearView();
getPositionFromNav();
locationElement.addEventListener('change', getWeatherDataFromInput);

// --------------------- FUNCTION -------------------


// Get coords from navigator

function getPositionFromNav() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(saveNavPosition, showNavPositionError);
    }
    else {
        console.log("Browser doesn't have geolocation.");
    }
}

function saveNavPosition(geolocationPosition) {
    
    myCoords.lat = geolocationPosition.coords.latitude;
    myCoords.lon = geolocationPosition.coords.longitude;

    getWeatherData(createApiLinkFromCoords());
}

function showNavPositionError(error) {
    console.log("There was an error. Could't get position.");
}




// Get weather info from openWeather

function createApiLinkFromCoords() {

    let parameters = {
        lat: myCoords.lat,
        lon: myCoords.lon,
        appid: "6e0f8c0e8cbacc7d258b5ef8035fed24",
        units: 'metric',
        lang: 'pt_br'
    }

    if (parameters.lat && parameters.lon) {
        return createApiLink(parameters);
    }
    else {
        return false;
    }
}

function createApiLinkFromPlaceName(placename) {

    let parameters = {
        q: placename,
        appid: "6e0f8c0e8cbacc7d258b5ef8035fed24",
        units: 'metric',
        lang: 'pt_br'
    }

    if (parameters.q) {
        return createApiLink(parameters);
    }
    else {
        return false;
    }
}

function createApiLink(parameters) {

    let link = "http://api.openweathermap.org/data/2.5/weather?";
    const attrs = Object.getOwnPropertyNames(parameters);
    console.log(attrs);

    attrs.forEach(att => {
        if (parameters[att]) {
            link += `${att}=${parameters[att]}&`;
        }
    })

    return link;
}


function getWeatherData(link) {
    const promise = axios.get(link);
    promise.then(saveWeatherData).catch(showGetWeatherError);
}

function getWeatherDataFromInput(event) {
    console.log("mudou");
    let input = event.target.value;
    console.log(input);
    let link = createApiLinkFromPlaceName(input);
    getWeatherData(link);
}



function saveWeatherData(response) {
    myWeather = response.data;
    loadWeatherView();
}

function showGetWeatherError (error) {
    myWeather = null;
    errorView();
}



// Criando as views

function loadTexts (upper, main, lower){
    const upperText = document.querySelector(".message__upperText");
    const locationText = document.querySelector(".message__location");
    const lowerText = document.querySelector(".message__lowerText");

    console.log(lower);

    if (upper != null) {upperText.innerHTML = upper;}
    if (main != null) {locationText.value = main;}
    if (lower != null) {lowerText.innerHTML = lower;}
}

function loadWeatherView () {

    setBackground();

    let link = `http://openweathermap.org/img/wn/${myWeather.weather[0].icon}.png`;
    loadTexts(
        `Está fazendo <strong>${myWeather.main.temp}°</strong> em`,
        myWeather.name,
        `deixa eu adivinhar... o clima está assim:</br><strong>${myWeather.weather[0].description}</strong> <img src="${link}">`);
}

function clearView () {
    setBackground();
    loadTexts ("Ainda não sei aonde vc está :(", "", "");
}

function errorView () {
    setBackground();
    loadTexts ("Esse lugar existe?", null, "");
}


function getHours () {
    
    let date = null;
    let hours = (new Date()).getHours(); 
    
    if (myWeather) {
        console.log("aqui");
        hours = (new Date(myWeather.dt)).getHours();
    }

    return hours;
}


function setBackground() {

    let hours = getHours();

    console.log(hours)

    if (hours < 6) {
        document.body.style.backgroundColor = `rgb(0,0,0)`;
    }
    else if (hours < 12) {
        document.body.style.backgroundColor = `rgb(166, 222, 255)`;
    }
    else if (hours < 18) {
        document.body.style.backgroundColor = `rgb(223, 155, 100)`;
    } else {
        document.body.style.backgroundColor = `rgb(108, 26, 185)`;
    }
}