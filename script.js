const apiKey = '869c9b76471a4de19b1297fd33d80ac0';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const currentWeather = document.getElementById('currentWeather');
const forecast = document.getElementById('forecast');
const recentSearches = document.getElementById('recentSearches');
const locationBtn = document.getElementById('locationBtn'); // Button for current location

// Fetch recent cities from localStorage
let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];

// Fetch Weather Data
async function fetchWeather(city = '', lat = null, lon = null) {
  try {
    let url = '';

    // If city is provided, fetch weather data for that city
    if (city) {
      if (!isValidCity(city)) {
        alert('Please enter a valid city name');
        return;
      }
      url = `${apiUrl}?q=${city}&appid=${apiKey}&units=metric`;
    }
    // If latitude and longitude are provided, fetch weather data for the current location
    else if (lat && lon) {
      url = `${apiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('City not found or invalid location');
    const data = await response.json();
    displayCurrentWeather(data);
    fetchForecast(data.coord.lat, data.coord.lon); // Fetch forecast based on lat, lon
  } catch (error) {
    alert(error.message);
  }
}

// Fetch 5-Day Forecast
async function fetchForecast(lat, lon) {
  try {
    const response = await fetch(`${forecastUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    const data = await response.json();
    if (data.list && data.list.length > 0) {
      displayForecast(data); // Display the forecast if data exists
    } else {
      forecast.innerHTML = '<p>No forecast data available.</p>';
    }
  } catch (error) {
    console.error('Error fetching forecast:', error);
  }
}

// Display Current Weather
function displayCurrentWeather(data) {
  let weatherIconClass = '';

  // Assign classes based on weather condition (you can add more conditions if needed)
  switch (data.weather[0].main) {
    case 'Clear':
      weatherIconClass = 'text-yellow-400'; // Sunny
      break;
    case 'Clouds':
      weatherIconClass = 'text-gray-400'; // Cloudy
      break;
    case 'Rain':
      weatherIconClass = 'text-blue-500'; // Rainy
      break;
    case 'Thunderstorm':
      weatherIconClass = 'text-indigo-600'; // Stormy
      break;
    case 'Snow':
      weatherIconClass = 'text-white'; // Snowy
      break;
    case 'Mist':
      weatherIconClass = 'text-gray-300'; // Misty
      break;
    case 'Drizzle':
      weatherIconClass = 'text-green-500'; // Drizzle
      break;
    default:
      weatherIconClass = 'text-gray-600'; // Default color
      break;
  }

  const weatherHTML = `
    <h2 class="text-xl font-bold">Current Weather in ${data.name}</h2>
    <p>Temperature: ${data.main.temp} °C</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind Speed: ${data.wind.speed} m/s</p>
    <div class="flex items-center space-x-2">
      <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}" class="w-16 h-16 ${weatherIconClass}">
      <span class="${weatherIconClass} text-xl">${data.weather[0].description}</span>
    </div>
  `;
  currentWeather.innerHTML = weatherHTML;

  addRecentSearch(data.name);
}

// Display 5-Day Forecast
function displayForecast(data) {
  const forecasts = {};

  // Filter unique dates
  data.list.forEach((item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString('en-IN', { 
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
    }); // Format the date with locale handling
    if (!forecasts[date]) {
      forecasts[date] = item; // Add the first entry for each date
    }
  });

  let forecastHTML = '<h2 class="text-xl font-bold">5-Day Forecast</h2>';

  // Loop through unique forecasts
  Object.values(forecasts).forEach((item) => {
    let forecastIconClass = '';
  
    // Assign classes based on weather condition
    switch (item.weather[0].main) {
      case 'Clear':
        forecastIconClass = 'text-yellow-400'; // Sunny
        break;
      case 'Clouds':
        forecastIconClass = 'text-gray-400'; // Cloudy
        break;
      case 'Rain':
        forecastIconClass = 'text-blue-500'; // Rainy
        break;
      case 'Thunderstorm':
        forecastIconClass = 'text-indigo-600'; // Stormy
        break;
      case 'Snow':
        forecastIconClass = 'text-white'; // Snowy
        break;
      case 'Mist':
        forecastIconClass = 'text-gray-300'; // Misty
        break;
      case 'Drizzle':
        forecastIconClass = 'text-green-500'; // Drizzle
        break;
      default:
        forecastIconClass = 'text-gray-600'; // Default color
        break;
    }

    forecastHTML += `
      <div class="border p-2 my-2 flex items-center space-x-4">
        <p class="text-lg">${item.dt_txt.split(' ')[0]}</p>
        <p class="text-lg">Temp: ${item.main.temp} °C</p>
        <p class="text-lg">Humidity: ${item.main.humidity}%</p>
        <p class="text-lg">Wind Speed: ${item.wind.speed} m/s</p>
        <div class="flex items-center space-x-2">
          <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].description}" class="w-12 h-12 ${forecastIconClass}">
          <span class="${forecastIconClass} text-xl">${item.weather[0].description}</span>
        </div>
      </div>
    `;
  });
  forecast.innerHTML = forecastHTML;
}

// Add Recent Search
function addRecentSearch(city) {
  if (!recentCities.includes(city)) {
    recentCities.push(city);
    localStorage.setItem('recentCities', JSON.stringify(recentCities));
    updateRecentCitiesDropdown();
  }
}

// Update Recent Cities Dropdown
function updateRecentCitiesDropdown() {
  const dropdown = `
    <label for="recentCities">Recent Searches:</label>
    <select id="cityDropdown" class="w-full p-3 bg-gray-100 rounded-lg mt-2 border focus:outline-none focus:ring-2 focus:ring-blue-500">
      <option value="" disabled selected>Select a city</option>
      ${recentCities.map((city) => `<option value="${city}">${city}</option>`).join('')}
    </select>
  `;
  recentSearches.innerHTML = dropdown;

  // Add event listener to the dropdown to fetch weather for selected city
  document.getElementById('cityDropdown').addEventListener('change', (e) => {
    fetchWeather(e.target.value);
  });
}

// Event Listener for Search Button
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (!city) {
    alert('Please enter a city name');
    return;
  }
  fetchWeather(city);
  cityInput.value = ''; // Clear the input field after search
});

// Event Listener for Location Button
locationBtn.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      fetchWeather('', lat, lon); // Fetch weather using the location coordinates
    }, () => {
      alert('Unable to retrieve your location. Please enable location services.');
    });
  } else {
    alert('Geolocation is not supported by this browser.');
  }
});

// Validate City Name
function isValidCity(city) {
  // Check if city name contains only alphabets and spaces
  const cityRegex = /^[a-zA-Z\s]+$/;
  return cityRegex.test(city);
}

// Initialize Recent Searches Dropdown on page load
updateRecentCitiesDropdown();
