const API = {
  geocode: 'https://geocoding-api.open-meteo.com/v1/search',
  forecast: 'https://api.open-meteo.com/v1/forecast'
};

const state = {
  unit: localStorage.getItem('skycast-unit') || 'fahrenheit',
  currentLocation: localStorage.getItem('skycast-city') || 'Chicago'
};

const elements = {
  form: document.querySelector('#searchForm'),
  input: document.querySelector('#cityInput'),
  unitToggle: document.querySelector('#unitToggle'),
  quickCities: document.querySelectorAll('[data-city]'),
  toast: document.querySelector('#toast'),
  locationName: document.querySelector('#locationName'),
  updatedTime: document.querySelector('#updatedTime'),
  weatherIcon: document.querySelector('#weatherIcon'),
  conditionBadge: document.querySelector('#conditionBadge'),
  currentTemp: document.querySelector('#currentTemp'),
  currentCondition: document.querySelector('#currentCondition'),
  feelsLike: document.querySelector('#feelsLike'),
  windSpeed: document.querySelector('#windSpeed'),
  humidity: document.querySelector('#humidity'),
  rainChance: document.querySelector('#rainChance'),
  uvIndex: document.querySelector('#uvIndex'),
  forecastList: document.querySelector('#forecastList'),
  insightList: document.querySelector('#insightList')
};

const weatherCodes = {
  0: ['Clear sky', '☀️'],
  1: ['Mostly clear', '🌤️'], 2: ['Partly cloudy', '⛅'], 3: ['Overcast', '☁️'],
  45: ['Fog', '🌫️'], 48: ['Rime fog', '🌫️'],
  51: ['Light drizzle', '🌦️'], 53: ['Drizzle', '🌦️'], 55: ['Heavy drizzle', '🌧️'],
  61: ['Light rain', '🌧️'], 63: ['Rain', '🌧️'], 65: ['Heavy rain', '⛈️'],
  71: ['Light snow', '🌨️'], 73: ['Snow', '🌨️'], 75: ['Heavy snow', '❄️'],
  80: ['Rain showers', '🌦️'], 81: ['Rain showers', '🌧️'], 82: ['Heavy showers', '⛈️'],
  95: ['Thunderstorm', '⛈️'], 96: ['Thunderstorm with hail', '⛈️'], 99: ['Severe thunderstorm', '⛈️']
};

function getWeatherInfo(code) {
  return weatherCodes[code] || ['Mixed conditions', '🌡️'];
}

function unitSymbol() {
  return state.unit === 'fahrenheit' ? '°F' : '°C';
}

function windUnit() {
  return state.unit === 'fahrenheit' ? 'mph' : 'km/h';
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Network response was not OK');
  return response.json();
}

async function geocodeCity(city) {
  const params = new URLSearchParams({ name: city, count: 1, language: 'en', format: 'json' });
  const data = await fetchJson(`${API.geocode}?${params}`);
  if (!data.results?.length) throw new Error(`No city found for "${city}"`);
  return data.results[0];
}

async function getForecast(location) {
  const params = new URLSearchParams({
    latitude: location.latitude,
    longitude: location.longitude,
    timezone: 'auto',
    temperature_unit: state.unit,
    wind_speed_unit: state.unit === 'fahrenheit' ? 'mph' : 'kmh',
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
    hourly: 'precipitation_probability',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,wind_speed_10m_max',
    forecast_days: 7
  });
  return fetchJson(`${API.forecast}?${params}`);
}

function formatDate(dateString, options = {}) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', ...options }).format(new Date(dateString));
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => elements.toast.classList.remove('show'), 2600);
}

function setLoading(isLoading) {
  const button = elements.form.querySelector('button');
  button.disabled = isLoading;
  button.textContent = isLoading ? 'Loading...' : 'Get Weather';
}

function renderCurrent(location, forecast) {
  const current = forecast.current;
  const [condition, icon] = getWeatherInfo(current.weather_code);
  const rainChance = forecast.hourly.precipitation_probability?.[new Date(current.time).getHours()] ?? forecast.daily.precipitation_probability_max[0];

  elements.locationName.textContent = `${location.name}, ${location.country}`;
  elements.updatedTime.textContent = `Updated ${new Date(current.time).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  elements.weatherIcon.textContent = icon;
  elements.conditionBadge.textContent = condition;
  elements.currentTemp.textContent = `${Math.round(current.temperature_2m)}°`;
  elements.currentCondition.textContent = condition;
  elements.feelsLike.textContent = `Feels like ${Math.round(current.apparent_temperature)}${unitSymbol()}`;
  elements.windSpeed.textContent = `${Math.round(current.wind_speed_10m)} ${windUnit()}`;
  elements.humidity.textContent = `${current.relative_humidity_2m}%`;
  elements.rainChance.textContent = `${rainChance}%`;
  elements.uvIndex.textContent = Math.round(forecast.daily.uv_index_max[0]);
}

function renderForecast(forecast) {
  const maxTemps = forecast.daily.temperature_2m_max;
  const minTemp = Math.min(...forecast.daily.temperature_2m_min);
  const maxTemp = Math.max(...maxTemps);

  elements.forecastList.innerHTML = forecast.daily.time.map((date, index) => {
    const [condition, icon] = getWeatherInfo(forecast.daily.weather_code[index]);
    const high = Math.round(forecast.daily.temperature_2m_max[index]);
    const low = Math.round(forecast.daily.temperature_2m_min[index]);
    const width = Math.max(15, ((high - minTemp) / (maxTemp - minTemp || 1)) * 100);
    return `
      <article class="forecast-day">
        <div>
          <p class="date">${index === 0 ? 'Today' : formatDate(date)}</p>
          <p class="muted">${condition}</p>
        </div>
        <div class="icon">${icon}</div>
        <div>
          <strong>${high}° / ${low}°</strong>
          <div class="temp-bar" aria-hidden="true"><div class="temp-fill" style="--w: ${width}%"></div></div>
        </div>
        <p class="muted">Rain ${forecast.daily.precipitation_probability_max[index]}% · Wind ${Math.round(forecast.daily.wind_speed_10m_max[index])} ${windUnit()}</p>
      </article>`;
  }).join('');
}

function renderInsights(forecast) {
  const today = forecast.daily;
  const rain = today.precipitation_probability_max[0];
  const uv = today.uv_index_max[0];
  const wind = today.wind_speed_10m_max[0];
  const high = today.temperature_2m_max[0];

  const insights = [
    rain >= 50 ? ['Bring an umbrella', `Rain probability reaches ${rain}% today.`] : ['Low rain risk', `Rain probability is only ${rain}% today.`],
    uv >= 6 ? ['Use sun protection', `UV index peaks around ${Math.round(uv)}, so sunscreen is smart.`] : ['Comfortable UV level', `UV index stays near ${Math.round(uv)} today.`],
    wind >= 22 ? ['Windy conditions', `Wind may reach ${Math.round(wind)} ${windUnit()}. Secure loose items.`] : ['Manageable wind', `Peak wind is about ${Math.round(wind)} ${windUnit()}.`],
    high >= (state.unit === 'fahrenheit' ? 86 : 30) ? ['Hydration alert', `High temperature reaches ${Math.round(high)}${unitSymbol()}.`] : ['Outdoor friendly', `High temperature is around ${Math.round(high)}${unitSymbol()}.`]
  ];

  elements.insightList.innerHTML = insights.map(([title, body]) => `
    <article class="insight">
      <strong>${title}</strong>
      <p class="muted">${body}</p>
    </article>`).join('');
}

async function loadWeather(city) {
  const cleanCity = city.trim();
  if (!cleanCity) return showToast('Please enter a city name.');

  try {
    setLoading(true);
    const location = await geocodeCity(cleanCity);
    const forecast = await getForecast(location);
    renderCurrent(location, forecast);
    renderForecast(forecast);
    renderInsights(forecast);
    state.currentLocation = cleanCity;
    localStorage.setItem('skycast-city', cleanCity);
  } catch (error) {
    showToast(error.message || 'Something went wrong. Try another city.');
  } finally {
    setLoading(false);
  }
}

elements.form.addEventListener('submit', (event) => {
  event.preventDefault();
  loadWeather(elements.input.value);
});

elements.unitToggle.addEventListener('click', () => {
  state.unit = state.unit === 'fahrenheit' ? 'celsius' : 'fahrenheit';
  localStorage.setItem('skycast-unit', state.unit);
  elements.unitToggle.textContent = state.unit === 'fahrenheit' ? '°F' : '°C';
  loadWeather(state.currentLocation);
});

elements.quickCities.forEach(button => {
  button.addEventListener('click', () => {
    elements.input.value = button.dataset.city;
    loadWeather(button.dataset.city);
  });
});

elements.unitToggle.textContent = state.unit === 'fahrenheit' ? '°F' : '°C';
elements.input.value = state.currentLocation;
loadWeather(state.currentLocation);
