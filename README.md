# Weather App

A weather application that fetches real-time weather data from a third-party API and shows it in a simple, easy-to-read interface.

**Live demo:** https://22471a05b9.github.io/weather-app/

## Screenshots
_Add 2-3 screenshots here: save them in a `screenshots/` folder, then use `![Weather result](screenshots/weather.png)`._

## Features
- Search any city and see its current temperature, "feels like" temperature, humidity and wind speed
- 5-day forecast with daily high and low temperatures
- Switch between °C and °F (your choice is remembered)
- Remembers the last city you searched
- Friendly messages for a city that is not found or for no internet connection

## Tech stack
HTML, CSS, JavaScript (Fetch API), [Open-Meteo](https://open-meteo.com/) geocoding and forecast APIs (free, no API key)

## Requirements
- A modern web browser
- An internet connection (the app calls the Open-Meteo API)

## How to run
```bash
# No installation needed. Open index.html in your browser,
# or use the VS Code "Live Server" extension.
```

## How it works
1. The city name is sent to the Open-Meteo geocoding API, which returns latitude and longitude.
2. Those coordinates are sent to the forecast API, which returns current weather and a daily forecast.
3. `script.js` turns the weather code into a description and icon, then updates the page.

## Author
Lakshmiprasanna Pentyala - [LinkedIn](https://www.linkedin.com/in/lakshmiprasanna-pentyala-3a554236b/) | [GitHub](https://github.com/22471A05B9)
