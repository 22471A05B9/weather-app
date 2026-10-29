// Weather App
// Uses the free Open-Meteo APIs (no API key needed):
//   1. Geocoding API: turns a city name into latitude and longitude
//   2. Forecast API: returns current weather and a daily forecast

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

// Open-Meteo weather codes -> [description, icon]
const WEATHER_CODES = {
  0: ["Clear sky", "☀️"],
  1: ["Mainly clear", "🌤️"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"],
  45: ["Fog", "🌫️"],
  48: ["Rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"],
  53: ["Drizzle", "🌦️"],
  55: ["Heavy drizzle", "🌧️"],
  61: ["Light rain", "🌧️"],
  63: ["Rain", "🌧️"],
  65: ["Heavy rain", "🌧️"],
  71: ["Light snow", "🌨️"],
  73: ["Snow", "🌨️"],
  75: ["Heavy snow", "❄️"],
  80: ["Rain showers", "🌦️"],
  81: ["Heavy showers", "🌧️"],
  82: ["Violent showers", "⛈️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Thunderstorm with hail", "⛈️"],
  99: ["Severe thunderstorm", "⛈️"],
};

function describeCode(code) {
  return WEATHER_CODES[code] || ["Unknown", "❓"];
}

function toFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

function formatTemp(celsius, unit) {
  const value = unit === "F" ? toFahrenheit(celsius) : celsius;
  return Math.round(value) + "°" + unit;
}

function buildGeocodeUrl(city) {
  return GEOCODE_URL + "?name=" + encodeURIComponent(city) + "&count=1&language=en&format=json";
}

function buildForecastUrl(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    timezone: "auto",
    forecast_days: "5",
  });
  return FORECAST_URL + "?" + params.toString();
}

// Fetches location + weather for a city. Throws an Error with a friendly message on failure.
async function getWeather(city) {
  const geoResponse = await fetch(buildGeocodeUrl(city));
  if (!geoResponse.ok) throw new Error("Could not look up that city. Please try again.");
  const geo = await geoResponse.json();
  if (!geo.results || geo.results.length === 0) throw new Error('City "' + city + '" was not found.');

  const place = geo.results[0];
  const weatherResponse = await fetch(buildForecastUrl(place.latitude, place.longitude));
  if (!weatherResponse.ok) throw new Error("Could not load the weather. Please try again.");
  const weather = await weatherResponse.json();

  return {
    name: place.name,
    country: place.country || "",
    current: weather.current,
    daily: weather.daily,
  };
}

// ----- Everything below touches the page (DOM) -----
if (typeof document !== "undefined") {
  let unit = localStorage.getItem("unit") || "C";
  let lastData = null;

  const form = document.getElementById("search-form");
  const input = document.getElementById("city-input");
  const message = document.getElementById("message");
  const unitButton = document.getElementById("unit-toggle");

  function setMessage(text, isError) {
    message.textContent = text;
    message.className = "message" + (isError ? " error" : "");
  }

  function render(data) {
    const [description, icon] = describeCode(data.current.weather_code);
    document.getElementById("place").textContent = data.name + (data.country ? ", " + data.country : "");
    document.getElementById("icon").textContent = icon;
    document.getElementById("temp").textContent = formatTemp(data.current.temperature_2m, unit);
    document.getElementById("description").textContent = description;
    document.getElementById("feels").textContent = formatTemp(data.current.apparent_temperature, unit);
    document.getElementById("humidity").textContent = data.current.relative_humidity_2m + "%";
    document.getElementById("wind").textContent = Math.round(data.current.wind_speed_10m) + " km/h";

    const list = document.getElementById("forecast");
    list.innerHTML = "";
    data.daily.time.forEach(function (dateString, i) {
      const day = new Date(dateString + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short" });
      const item = document.createElement("li");
      const dayEl = document.createElement("span");
      dayEl.className = "day";
      dayEl.textContent = day;
      const iconEl = document.createElement("span");
      iconEl.className = "fi";
      iconEl.textContent = describeCode(data.daily.weather_code[i])[1];
      const rangeEl = document.createElement("span");
      rangeEl.textContent =
        formatTemp(data.daily.temperature_2m_max[i], unit) + " / " + formatTemp(data.daily.temperature_2m_min[i], unit);
      item.append(dayEl, iconEl, rangeEl);
      list.appendChild(item);
    });

    document.getElementById("current").classList.remove("hidden");
    document.getElementById("forecast-section").classList.remove("hidden");
  }

  async function search(city) {
    setMessage("Loading...", false);
    try {
      lastData = await getWeather(city);
      render(lastData);
      setMessage("", false);
      localStorage.setItem("lastCity", city);
    } catch (error) {
      const offline = error instanceof TypeError; // fetch fails with TypeError when offline
      setMessage(offline ? "No internet connection. Please check and try again." : error.message, true);
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const city = input.value.trim();
    if (city) search(city);
  });

  unitButton.addEventListener("click", function () {
    unit = unit === "C" ? "F" : "C";
    localStorage.setItem("unit", unit);
    unitButton.textContent = "°" + unit;
    if (lastData) render(lastData);
  });

  unitButton.textContent = "°" + unit;
  const saved = localStorage.getItem("lastCity");
  if (saved) {
    input.value = saved;
    search(saved);
  }
}

if (typeof module !== "undefined") {
  module.exports = { describeCode, toFahrenheit, formatTemp, buildGeocodeUrl, buildForecastUrl, getWeather };
}
