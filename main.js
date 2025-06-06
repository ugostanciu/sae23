
const API_TOKEN = "30d71a74ad1c665d279168dca98378581270be4587da3ab13c51ffde8de4cbae";

// Elements DOM
const postalInput = document.getElementById("postal-input");
const cityDropdown = document.getElementById("cityDropdown");
const submitBtn = document.getElementById("submitBtn");
const daySlider = document.getElementById("daySlider");
const sliderValue = document.getElementById("sliderValue");
const weatherForm = document.getElementById("weatherForm");
const loading = document.getElementById("loading");
const weatherResults = document.getElementById("weatherResults");
const weatherGrid = document.getElementById("weatherGrid");
const errorMessage = document.getElementById("errorMessage");
const locationForm = document.getElementById("locationForm");

// Variables globales
let selectedCity = null;
let weatherData = [];


function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    setTimeout(() => {
        errorMessage.style.display = "none";
    }, 5000);
}

function showLoading(show) {
    loading.style.display = show ? "block" : "none";
}

function updateSliderValue() {
    const days = parseInt(daySlider.value);
    sliderValue.textContent = days === 1 ? "1 jour" : `${days} jours`;
}


async function getCitiesFromZip(zip) {
    try {
        const response = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${zip}`);
        if (!response.ok) throw new Error("Erreur réseau");
        return await response.json();
    } catch (error) {
        console.error("Erreur API Geo:", error);
        showError("Impossible de récupérer les villes pour ce code postal");
        return [];
    }
}

async function getWeatherData(cityCode, days = 1) {
    const promises = [];
    for (let i = 0; i < days; i++) {
        promises.push(
            fetch(`https://api.meteo-concept.com/api/forecast/daily/${i}?token=${API_TOKEN}&insee=${cityCode}`)
                .then(response => {
                    if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
                    return response.json();
                })
        );
    }
    return Promise.all(promises);
}


function populateCityOptions(cities) {
    cityDropdown.innerHTML = '<option value="">Sélectionnez une ville</option>';
    
    if (cities.length === 0) {
        showError("Aucune ville trouvée pour ce code postal");
        cityDropdown.style.display = "none";
        submitBtn.disabled = true;
        return;
    }

    cities.forEach(city => {
        const option = document.createElement("option");
        option.value = city.code;
        option.textContent = `${city.nom} (${city.codesPostaux[0]})`;
        option.dataset.lat = city.centre?.coordinates?.[1] || '';
        option.dataset.lon = city.centre?.coordinates?.[0] || '';
        cityDropdown.appendChild(option);
    });

    cityDropdown.style.display = "block";
    updateSubmitButton();
}

function updateSubmitButton() {
    submitBtn.disabled = !cityDropdown.value;
}

function getWeatherIcon(code) {
    if (code === 0) return "☀️";
    if ([1, 2].includes(code)) return "⛅";
    if ([3, 4, 5].includes(code)) return "☁️";
    if ([6, 7].includes(code)) return "🌫️";
    if ((code >= 10 && code <= 16) || (code >= 40 && code <= 48)) return "🌧️";
    if ((code >= 20 && code <= 22) || (code >= 30 && code <= 32) || (code >= 60 && code <= 78)) return "❄️";
    if ((code >= 100 && code <= 142)) return "⛈️";
    if (code === 235) return "🌨️";
    return "🌤️";
}

function getWeatherClass(code) {
    if (code === 0) return "weather-sunny";
    if ([1, 2, 3, 4, 5].includes(code)) return "weather-cloudy";
    if ((code >= 10 && code <= 16) || (code >= 40 && code <= 48)) return "weather-rainy";
    if ((code >= 20 && code <= 32) || (code >= 60 && code <= 78)) return "weather-snowy";
    if (code >= 100 && code <= 142) return "weather-stormy";
    return "weather-cloudy";
}

function updateBackgroundWeather(code) {
    const body = document.body;
    let backgroundUrl = "";
    let weatherClass = "";


    if (code === 0) {
        backgroundUrl = "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')";
        weatherClass = "weather-sunny";
    } else if ([1, 2].includes(code)) {
        backgroundUrl = "url('https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')";
        weatherClass = "weather-cloudy";
    } else if ([3, 4, 5].includes(code)) {
        backgroundUrl = "url('https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')";
        weatherClass = "weather-cloudy";
    } else if ([6, 7].includes(code)) {
        backgroundUrl = "url('https://images.unsplash.com/photo-1487621167305-5d248087c724?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')";
        weatherClass = "weather-foggy";
    } else if (
        (code >= 10 && code <= 16) || 
        (code >= 40 && code <= 48) || 
        (code >= 210 && code <= 212)  
    ) {
        backgroundUrl = "url('https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')";
        weatherClass = "weather-rainy";
    } else if (
        (code >= 20 && code <= 22) ||
        (code >= 30 && code <= 32) ||
        (code >= 60 && code <= 68) ||
        (code >= 70 && code <= 78) ||
        (code >= 220 && code <= 222) ||
        (code >= 230 && code <= 232)
    ) {
        backgroundUrl = "url('https://images.unsplash.com/photo-1477601263568-180e2c6d046e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')";
        weatherClass = "weather-snowy";
    } else if (
        (code >= 100 && code <= 108) ||
        (code >= 120 && code <= 138) ||
        [140, 141, 142].includes(code)
    ) {
        backgroundUrl = "url('https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')";
        weatherClass = "weather-stormy";
    } else if (code === 235) {
        backgroundUrl = "url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')";
        weatherClass = "weather-hail";
    } else {
        backgroundUrl = "url('https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')";
        weatherClass = "weather-default";
    }

    body.style.backgroundImage = backgroundUrl;
    body.className = weatherClass;
}

function getWeatherDescription(code) {
    if (code === 0) return "Soleil";
    if ([1, 2].includes(code)) return "Peu nuageux";
    if ([3, 4, 5].includes(code)) return "Nuageux";
    if ([6, 7].includes(code)) return "Brouillard";
    if ((code >= 10 && code <= 16) || (code >= 40 && code <= 48) || (code >= 210 && code <= 212)) return "Pluie";
    if ((code >= 20 && code <= 22) || (code >= 30 && code <= 32) || (code >= 60 && code <= 78) || (code >= 220 && code <= 232)) return "Neige";
    if ((code >= 100 && code <= 142)) return "Orage";
    if (code === 235) return "Grêle";
    return "Météo inconnue";
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
}

function getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

function renderWeatherCards(data) {
    weatherGrid.innerHTML = "";
    const selectedOptions = getSelectedOptions();
    const days = parseInt(daySlider.value);
    
    data.slice(0, days).forEach((dayData, index) => {
        const forecast = dayData.forecast;
        const city = dayData.city;
        const outfit = getOutfitRecommendation(forecast.weather, forecast.tmin, forecast.tmax);
        
        const card = document.createElement("div");
        card.className = "weather-card";
        
        const date = index === 0 ? "Aujourd'hui" : formatDate(forecast.datetime);
        
        card.innerHTML = `
            <div class="weather-card-header">
                <div class="weather-date">${date}</div>
                <div class="weather-icon">${getWeatherIcon(forecast.weather)}</div>
            </div>
            <div class="weather-info">
                <div class="weather-detail temperature-range">
                    <div class="weather-detail-label">Températures</div>
                    <div class="weather-detail-value">${forecast.tmin}°C - ${forecast.tmax}°C</div>
                </div>
                <div class="weather-detail">
                    <div class="weather-detail-label">Probabilité de pluie</div>
                    <div class="weather-detail-value">${forecast.probarain}%</div>
                </div>
                <div class="weather-detail">
                    <div class="weather-detail-label">Ensoleillement</div>
                    <div class="weather-detail-value">${forecast.sun_hours}h</div>
                </div>
                <div class="weather-detail outfit-recommendation">
                    <div class="outfit-header">
                        <span class="outfit-icon">${outfit.icon}</span>
                        <span class="outfit-title">${outfit.title}</span>
                    </div>
                    <div class="outfit-items">
                        ${outfit.items.map(item => `<span class="outfit-item">${item}</span>`).join('')}
                    </div>
                </div>
                ${selectedOptions.coordinates ? `
                <div class="weather-detail">
                    <div class="weather-detail-label">Latitude</div>
                    <div class="weather-detail-value">${city.latitude.toFixed(4)}°</div>
                </div>
                <div class="weather-detail">
                    <div class="weather-detail-label">Longitude</div>
                    <div class="weather-detail-value">${city.longitude.toFixed(4)}°</div>
                </div>
                ` : ''}
                ${selectedOptions.rain ? `
                <div class="weather-detail">
                    <div class="weather-detail-label">Cumul de pluie</div>
                    <div class="weather-detail-value">${forecast.rr1 || 0} mm</div>
                </div>
                ` : ''}
                ${selectedOptions.wind ? `
                <div class="weather-detail">
                    <div class="weather-detail-label">Vent moyen</div>
                    <div class="weather-detail-value">${forecast.wind10m || 0} km/h</div>
                </div>
                ` : ''}
                ${selectedOptions.winddir ? `
                <div class="weather-detail">
                    <div class="weather-detail-label">Direction du vent</div>
                    <div class="weather-detail-value">${getWindDirection(forecast.dirwind10m || 0)} (${forecast.dirwind10m || 0}°)</div>
                </div>
                ` : ''}
            </div>
        `;
        
        weatherGrid.appendChild(card);
    });
    

    if (data.length > 0) {
        updateBackgroundWeather(data[0].forecast.weather);
    }
    
    locationForm.style.display = "none";
    weatherResults.style.display = "block";
}

function getSelectedOptions() {
    return {
        coordinates: document.getElementById("coordinates").checked,
        rain: document.getElementById("rain").checked,
        wind: document.getElementById("wind").checked,
        winddir: document.getElementById("winddir").checked
    };
}


postalInput.addEventListener("input", async (e) => {
    const zip = e.target.value.trim();
    
    if (zip.length === 5 && /^\d{5}$/.test(zip)) {
        const cities = await getCitiesFromZip(zip);
        populateCityOptions(cities);
    } else {
        cityDropdown.style.display = "none";
        submitBtn.disabled = true;
    }
});

cityDropdown.addEventListener("change", (e) => {
    const selectedOption = e.target.selectedOptions[0];
    if (selectedOption && selectedOption.value) {
        selectedCity = {
            code: selectedOption.value,
            name: selectedOption.textContent,
            lat: parseFloat(selectedOption.dataset.lat),
            lon: parseFloat(selectedOption.dataset.lon)
        };
    } else {
        selectedCity = null;
    }
    updateSubmitButton();
});

daySlider.addEventListener("input", updateSliderValue);

weatherForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    if (!selectedCity) {
        showError("Veuillez sélectionner une ville");
        return;
    }

    const days = parseInt(daySlider.value);
    
    showLoading(true);
    
    try {
        const data = await getWeatherData(selectedCity.code, days);
        weatherData = data;
        renderWeatherCards(data);
    } catch (error) {
        console.error("Erreur lors de la récupération des données météo:", error);
        showError("Impossible de récupérer les données météorologiques. Veuillez réessayer.");
    } finally {
        showLoading(false);
    }
});


updateSliderValue();


document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.matches("input[type='checkbox']")) {
        e.target.checked = !e.target.checked;
    }
});


if (window.innerWidth <= 768) {
    daySlider.addEventListener("touchstart", (e) => {
        e.target.focus();
    });
}


function getOutfitRecommendation(weatherCode, tempMin, tempMax) {
    const avgTemp = (tempMin + tempMax) / 2;
    let outfit = {
        icon: "👕",
        title: "Tenue recommandée",
        items: []
    };

    
    if (avgTemp >= 25) {
        outfit.items.push("T-shirt léger", "Short ou jupe", "Sandales");
        outfit.icon = "🩳";
    } else if (avgTemp >= 20) {
        outfit.items.push("T-shirt", "Pantalon léger", "Baskets");
        outfit.icon = "👕";
    } else if (avgTemp >= 15) {
        outfit.items.push("Pull fin", "Jean", "Baskets fermées");
        outfit.icon = "👔";
    } else if (avgTemp >= 10) {
        outfit.items.push("Pull chaud", "Pantalon", "Chaussures fermées");
        outfit.icon = "🧥";
    } else if (avgTemp >= 5) {
        outfit.items.push("Manteau", "Pull", "Écharpe", "Chaussures chaudes");
        outfit.icon = "🧥";
    } else {
        outfit.items.push("Manteau d'hiver", "Pull épais", "Bonnet", "Gants", "Bottes");
        outfit.icon = "🧥";
    }

    
    if ((weatherCode >= 10 && weatherCode <= 16) || (weatherCode >= 40 && weatherCode <= 48) || (weatherCode >= 210 && weatherCode <= 212)) {
        
        outfit.items.push("Parapluie", "Veste imperméable");
        if (!outfit.items.includes("Bottes")) {
            outfit.items.push("Chaussures étanches");
        }
    } else if ((weatherCode >= 20 && weatherCode <= 32) || (weatherCode >= 60 && weatherCode <= 78) || (weatherCode >= 220 && weatherCode <= 232)) {
        
        outfit.items.push("Bottes d'hiver", "Gants chauds", "Bonnet");
        if (avgTemp < 15 && !outfit.items.includes("Manteau d'hiver")) {
            outfit.items.push("Veste chaude");
        }
    } else if ((weatherCode >= 100 && weatherCode <= 142)) {
        
        outfit.items.push("Veste imperméable", "Éviter les objets métalliques");
    } else if ([6, 7].includes(weatherCode)) {
        
        outfit.items.push("Vêtements visibles", "Veste légère");
    } else if (weatherCode === 0 && avgTemp >= 20) {
        // Grand soleil
        outfit.items.push("Lunettes de soleil", "Crème solaire", "Chapeau");
    }

    return outfit;
}