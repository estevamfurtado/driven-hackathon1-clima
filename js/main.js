// Global variables

let myCoords = {lat: null, lon: null};
let myWeather = null;
const locationElement = document.querySelector(".message__location");

let sun = "☀︎";
let cloud = "☁️";
let moon = "🌕";
let rain = "💧";
let snow = "❄️";
let star = "⭐";
let thunder = "⚡";


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
    // console.log(attrs);

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
    loadingView();
    // console.log("mudou");
    let input = event.target.value;
    // console.log(input);
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



// VIEWS

function loadTexts (upper, main, lower){
    const upperText = document.querySelector(".message__upperText");
    const locationText = document.querySelector(".message__location");
    const lowerText = document.querySelector(".message__lowerText");

    // console.log(lower);

    if (upper != null) {upperText.innerHTML = upper;}
    if (main != null) {locationText.value = main;}
    if (lower != null) {lowerText.innerHTML = lower;}
}



function getTime () {
    
    let date = new Date();
    let offset = - date.getTimezoneOffset()/60;    

    if (myWeather) {
        offset = myWeather.timezone/3600;
    }

    // console.log(date.getUTCHours());
    // console.log(date.getUTCMinutes());
    // console.log(offset);

    let time = {};
    time.h = (date.getUTCHours() + 24 + offset - (offset % 1)) % 24;
    time.m = date.getUTCMinutes() + (offset % 1) * 60; 

    return time;
}


function setBackground(time) {

    let color = {h: time.h + time.m/60};
    let prevPoint = null;
    let nextPoint = null;

    let points = [
        {r: 0, g:0, b:0, h: 0}, // 0,0,0
        {r: 67, g:43, b:78, h: 5}, // 67, 43, 78
        {r: 235, g:170, b:224, h:5.5}, // 235, 170, 224
        {r: 133, g:190, b:216, h:6.25}, // 133, 190, 216
        {r: 81, g:200, b:255, h:9}, // 81, 200, 255
        {r: 240, g:65, b:41, h: 12}, // 240, 128, 128
        {r: 81, g:200, b:255, h: 15}, // 81, 200, 255
        {r: 63, g:184, b:240, h: 17}, // 63, 184, 240
        {r: 240, g:63, b:63, h: 17.5}, // 240, 63, 116
        {r: 64, g:32, b:94, h: 18} // 64, 32, 94
    ]

    let continuar = true;
    
    let i = 1;
    while(continuar) {
        if (i === points.length) {
            
            prevPoint = points[i-1];
            nextPoint = points[0];
            nextPoint.h = nextPoint.h + 24;
            continuar = false;
        }
        else if (points[i].h > color.h) {
            nextPoint = points[i];
            prevPoint = points[i-1];
            continuar = false;
        }
        i++;
    }

    color.r = prevPoint.r + (nextPoint.r - prevPoint.r) * (color.h - prevPoint.h) / (nextPoint.h - prevPoint.h)
    color.g = prevPoint.g + (nextPoint.g - prevPoint.g) * (color.h - prevPoint.h) / (nextPoint.h - prevPoint.h)
    color.b = prevPoint.b + (nextPoint.b - prevPoint.b) * (color.h - prevPoint.h) / (nextPoint.h - prevPoint.h)

    document.body.style.backgroundColor = `rgb(${color.r},${color.g},${color.b})`;
}


function loadWeatherView () {
    let time = getTime();
    setBackground(time);

    let timeStamp = `${time.h}h ${time.m}m`;

    let link = `http://openweathermap.org/img/wn/${myWeather.weather[0].icon}.png`;
    //<img src="${link}">

    loadTexts(
        `São ${timeStamp} e fazem <strong>${myWeather.main.temp}°</strong> em`,
        myWeather.name,
        `O clima está assim: <strong>${myWeather.weather[0].description}</strong>`);

    createFloatingEmojis();
}

function clearView () {
    let time = getTime();
    setBackground(time);
    loadTexts ("Ainda não sei aonde vc está :(", "", "");
}

function loadingView () {
    let time = getTime();
    setBackground(time);
    loadTexts ("Buncando infos sobre", null, "");
}

function errorView () {
    let time = getTime();
    setBackground(time);
    loadTexts ("Esse lugar existe?", null, "");
}




function clearBackGround () {
    const bg = document.querySelector(".bg");
    bg.innerHTML = "";
}

function createFloatingEmojis () {

    clearBackGround();

    let weatherEl = numOfElements();

    if (weatherEl.sun === 1) {
        console.log("sun!");
        addSun();
    } else {
        console.log("moon!");
        addMoon();
    }

    addStars(weatherEl.star);
    addClouds(weatherEl.cloud);
    addSnow(weatherEl.snow);
    addRain(weatherEl.rain);
    addThunder(weatherEl.thunder);
}

function numOfElements() {
    
    let time = getTime();
    let isDay = (time.h >= 6 && time.h < 18);

    let obj = {
        sun: 1,
        cloud: 0,
        snow: 0,
        thunder: 0,
        rain: 0,
        star: 0
    }

    if (isDay) {
        obj.sun = 1;
    }
    else {
        obj.sun = 0;
    }

    let id = myWeather.weather[0].id;
    
    if (id > 800) {
        // clouds
        obj.cloud = 50;
    } else if (id === 800) {
        // clear
        if (!isDay) {
            console.log("céu limpo de noite");
            obj.star = 10;
        }
    } else if (id >= 700) {
        // atmosphere
        obj.cloud = 50;
    } else if (id >= 600) {
        // snow
        obj.cloud = 50;
        obj.snow = 50;
        
    } else if (id >= 500) {
        // rain
        obj.cloud = 50;
        obj.rain = 50;
    } else if (id >= 300) {
        // drizzle
        obj.cloud = 50;
        obj.rain = 50;
    } else if (id >= 200) {
        // thunder
        obj.cloud = 50;
        obj.thunder = 10;
        obj.rain = 50;
    }
    
    

    return obj;
}

function addClouds(num) {
    const bg = document.querySelector(".bg");
    for (let i = 0; i < num; i++) {

        let emojiEl = createEmoji(cloud, 60, 15);
        positionElement(emojiEl, 100);
        setTimeout(() => {
            moveElement (emojiEl, -20);;
        }, 1000);

        bg.appendChild(emojiEl);
    }
}

function addStars(num) {
    const bg = document.querySelector(".bg");
    for (let i = 0; i < num; i++) {

        let emojiEl = createEmoji(star, 60, 15);
        positionElement(emojiEl, 100);
        setTimeout(() => {
            moveElement (emojiEl, -20);;
        }, 1000);

        bg.appendChild(emojiEl);
    }
}

function addRain(num) {
    const bg = document.querySelector(".bg");
    for (let i = 0; i < num; i++) {

        let emojiEl = createEmoji(rain, 60, 5);
        positionElement(emojiEl, null, -20);
        setTimeout(() => {
            moveElement (emojiEl, null, 100);;
        }, 1000);

        bg.appendChild(emojiEl);
    }
}

function addSnow(num) {
    const bg = document.querySelector(".bg");
    for (let i = 0; i < num; i++) {

        let emojiEl = createEmoji(snow, 60, 15);
        positionElement(emojiEl, null, -20);
        setTimeout(() => {
            moveElement (emojiEl, null, 100);;
        }, 1000);

        bg.appendChild(emojiEl);
    }
}

function addThunder(num) {
    const bg = document.querySelector(".bg");
    for (let i = 0; i < num; i++) {

        let emojiEl = createEmoji(thunder, 60, 5);
        positionElement(emojiEl, null, -20);
        setTimeout(() => {
            moveElement (emojiEl, null, 100);;
        }, 1000);

        bg.appendChild(emojiEl);
    }
}



function addSun() {
    const bg = document.querySelector(".bg");
    let emojiEl = createEmoji(sun, 100, 15);
    positionElement(emojiEl, 100, 50);
    setTimeout(() => {
        moveElement (emojiEl, -20);;
    }, 1000);

    console.log(emojiEl);
    bg.appendChild(emojiEl);
}

function addMoon() {
    const bg = document.querySelector(".bg");
    let emojiEl = createEmoji(moon, 100, 15);
    positionElement(emojiEl, 100, 50);
    setTimeout(() => {
        moveElement (emojiEl, -20);;
    }, 1000);

    bg.appendChild(emojiEl);
}






function createEmoji (emoji, size, secs) {
    let emojiEl = document.createElement("div");

    emojiEl.innerHTML = emoji;
    emojiEl.classList.add("floatingEmoji");
    emojiEl.style.fontSize = size + "px";
    let wait = Math.floor(Math.random() * secs/2);
    let time = secs + Math.floor(Math.random() * 5);
    emojiEl.style.transition = `all ${time}s linear ${wait}s`;

    return emojiEl;
}

function positionElement (element, x, y) {
    let top = Math.floor(Math.random() * 110 - 10);
    let left = Math.floor(Math.random() * 110 - 10);
    if (x) {left = x};
    if (y) {top = y};

    element.style.top = top + "%";
    element.style.left = left + "%";
}

function moveElement (element, x, y) {

    if (x) {
        element.style.left = x + "%"
    };
    if (y) {element.style.top = y + "%"};
}

