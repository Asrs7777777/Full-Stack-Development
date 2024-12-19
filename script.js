const apiKey = '13fb57b6efb3d94e936280dd42911093';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const currentWeather = document.getElementById('currentWeather');
const forecast = document.getElementById('forecast');
const recentSearches = document.getElementById('recentSearches');
const locationBtn = document.getElementById('locationBtn');

let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];

async function fetchWeather(city = '', lat = null, lon = null) {
    try {
        let url = '';

        if (city) {
            if (!isValidCity(city)) {
                alert('Please enter a valid city name');
                return;
            }
            url = `${apiUrl}?q=${city}&appid=${apiKey}&units=metric`;
        } else if (lat && lon) {
            url = `${apiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('City not found or invalid location');
        const data = await response.json();
        displayCurrentWeather(data);
        fetchForecast(data.coord.lat, data.coord.lon);
    } catch (error) {
        alert(error.message);
    }
}

async function fetchForecast(lat, lon) {
    try {
        const response = await fetch(`${forecastUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        if (data.list && data.list.length > 0) {
            displayForecast(data);
        } else {
            forecast.innerHTML = '<p>No forecast data available.</p>';
        }
    } catch (error) {
        console.error('Error fetching forecast:', error);
    }
}

function displayCurrentWeather(data) {
    const weatherIcon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    const weatherHTML = `
        <h2 class="text-xl font-bold">Current Weather in ${data.name}</h2>
        <p>Temperature: ${data.main.temp} °C</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
        <div class="flex items-center space-x-2">
            <img src="${weatherIcon}" alt="${data.weather[0].description}" class="w-16 h-16">
            <span class="text-xl">${data.weather[0].description}</span>
        </div>
    `;
    currentWeather.innerHTML = weatherHTML;
    addRecentSearch(data.name);
}

/*function displayForecast(data) {
  const forecasts = {};
  const today = new Date();
  const startDate = new Date(today); // Start from today
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 4); // End after 4 days (5-day forecast total)

  // Loop through the forecast list and filter out forecasts outside the desired date range
  let count = 0; // To limit to 5 days only
  data.list.forEach(item => {
      // Format the date to just include the date (no time)
      const forecastDate = new Date(item.dt * 1000);
      const formattedDate = forecastDate.toLocaleDateString('en-IN', { 
          weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
      });

      // Check if the date is within the desired range and we haven't already added 5 days
      if (forecastDate >= startDate && forecastDate <= endDate && count < 5) {
          // Store the first forecast for each unique date
          if (!forecasts[formattedDate]) {
              forecasts[formattedDate] = item;
              count++;
          }
      }
  });

  let forecastHTML = '<h2 class="text-xl font-bold">Weather Forecast</h2>';

  // Loop through the filtered forecast data and display it
  Object.keys(forecasts).forEach(date => {
      const item = forecasts[date];
      const forecastIcon = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;

      forecastHTML += `
          <div class="border p-2 my-2 flex items-center space-x-4">
              <p class="text-lg">${date}</p>
              <p class="text-lg">Temp: ${item.main.temp} °C</p>
              <p class="text-lg">Humidity: ${item.main.humidity}%</p>
              <p class="text-lg">Wind Speed: ${item.wind.speed} m/s</p>
              <div class="flex items-center space-x-2">
                  <img src="${forecastIcon}" alt="${item.weather[0].description}" class="w-12 h-12">
                  <span class="text-xl">${item.weather[0].description}</span>
              </div>
          </div>
      `;
  });

  forecast.innerHTML = forecastHTML;
}*/

function displayForecast(data) {
    const forecasts = {};
    const today = new Date();
    const startDate = new Date(today); 
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 5); // Cover 5 unique days including today
  
    // Loop through the forecast list and filter forecasts for 5 unique days
    let count = 0;
    data.list.forEach(item => {
        const forecastDate = new Date(item.dt * 1000);
        const formattedDate = forecastDate.toLocaleDateString('en-IN', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
  
        if (!forecasts[formattedDate] && count < 5) { // Ensure one forecast per day
            forecasts[formattedDate] = item;
            count++;
        }
    });
  
    if (Object.keys(forecasts).length === 0) {
        forecast.innerHTML = '<p>No forecast data available.</p>';
        return;
    }
  
    let forecastHTML = '<h2 class="text-xl font-bold">Weather Forecast</h2>';
    Object.keys(forecasts).forEach(date => {
        const item = forecasts[date];
        const forecastIcon = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
        forecastHTML += `
            <div class="border p-2 my-2 flex items-center space-x-4">
                <p class="text-lg">${date}</p>
                <p class="text-lg">Temp: ${item.main.temp} °C</p>
                <p class="text-lg">Humidity: ${item.main.humidity}%</p>
                <p class="text-lg">Wind Speed: ${item.wind.speed} m/s</p>
                <div class="flex items-center space-x-2">
                    <img src="${forecastIcon}" alt="${item.weather[0].description}" class="w-12 h-12">
                    <span class="text-xl">${item.weather[0].description}</span>
                </div>
            </div>
        `;
    });
  
    forecast.innerHTML = forecastHTML;
  }
  


function addRecentSearch(city) {
    if (!recentCities.includes(city)) {
        recentCities.push(city);
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
        updateRecentCitiesDropdown();
    }
}

function updateRecentCitiesDropdown() {
    const dropdown = `
        <label for="recentCities">Recent Searches:</label>
        <select id="cityDropdown" class="w-full p-3 bg-gray-100 rounded-lg mt-2 border">
            <option value="" disabled selected>Select a city</option>
            ${recentCities.map(city => `<option value="${city}">${city}</option>`).join('')}
        </select>
    `;
    recentSearches.innerHTML = dropdown;
    document.getElementById('cityDropdown').addEventListener('change', (e) => {
        fetchWeather(e.target.value);
    });
}

function isValidCity(city) {
    const cityRegex = /^[a-zA-Z\s]+$/;
    return cityRegex.test(city);
}

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (!city) {
        alert('Please enter a city name');
        return;
    }
    fetchWeather(city);
    cityInput.value = '';
});

/*locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeather('', lat, lon);
        }, () => {
            alert('Unable to retrieve your location. Please enable location services.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});*/
locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                // Fetch weather for the exact location
                fetchWeather('', lat, lon);
                console.log(`Latitude: ${lat}, Longitude: ${lon}`);
            },
            (error) => {
                // Handle different geolocation errors
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        alert('You denied the request for location. Please enable location access.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert('Location information is unavailable. Please check your device settings.');
                        break;
                    case error.TIMEOUT:
                        alert('The request to get your location timed out. Please try again.');
                        break;
                    default:
                        alert('An unknown error occurred while retrieving your location.');
                        break;
                }
            },
            {
                enableHighAccuracy: true, // Use high-accuracy GPS data if available
                timeout: 10000,           // Timeout after 10 seconds
                maximumAge: 60000         // Cache location for 1 minute
            }
        );
    } else {
        alert('Geolocation is not supported by your browser. Please use a modern browser.');
    }
});


updateRecentCitiesDropdown();
