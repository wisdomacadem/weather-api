# SkyCast — Professional Weather API App

A polished, recruiter-ready weather dashboard built with HTML, CSS, and vanilla JavaScript. It uses the Open-Meteo Geocoding API and Forecast API to search locations and display live weather, a 7-day forecast, and practical weather insights.

## Live Demo

Deploy with GitHub Pages, then add your live link here:

`https://your-username.github.io/weather-api-app/`

## Why This Project Stands Out

This is not just a basic tutorial weather app. It demonstrates real front-end engineering habits:

- City search with geocoding
- Live forecast data from a public API
- Async/await data fetching
- Loading state and error handling
- Fahrenheit/Celsius unit toggle
- Local storage for user preferences
- Responsive mobile-first design
- Clean visual hierarchy and recruiter-friendly presentation
- Accessible labels and semantic HTML
- No API key required

## Tech Stack

- HTML5
- CSS3
- JavaScript ES6+
- Open-Meteo Geocoding API
- Open-Meteo Forecast API
- GitHub Pages

## Features

- Search weather by city
- Quick city buttons
- Current temperature and condition
- Feels-like temperature
- Wind speed
- Humidity
- Rain probability
- UV index
- 7-day forecast cards
- Daily decision insights
- Responsive glassmorphism UI
- Saves last city and unit preference

## API Used

This app uses Open-Meteo because it is free for non-commercial use and does not require an API key.

- Geocoding endpoint: `https://geocoding-api.open-meteo.com/v1/search`
- Forecast endpoint: `https://api.open-meteo.com/v1/forecast`

## Folder Structure

```txt
weather-api-app/
├── index.html
├── styles.css
├── script.js
└── README.md
```

## How To Run Locally

1. Download or clone the repository.
2. Open `index.html` in your browser.
3. Search for any city.

For best results, use a local server:

```bash
python3 -m http.server 5500
```

Then open:

```txt
http://localhost:5500
```

## How To Deploy To GitHub Pages

1. Create a new repository named `weather-api-app`.
2. Upload these files:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `README.md`
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Click **Save**.
6. Wait for GitHub to create your live link.

## Future Improvements

- Add hourly forecast chart
- Add dark/light mode
- Add user location button
- Add air quality data
- Add animated weather backgrounds
- Add TypeScript version
- Rebuild in React with reusable components

## Recruiter Talking Points

I built this project to practice working with real API data, user input, async JavaScript, state management, error handling, and responsive UI design. I focused on making the project look polished and professional rather than only functional.
