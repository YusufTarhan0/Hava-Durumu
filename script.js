document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const currentDateTime = document.getElementById('currentDateTime');
    const currentDate = document.getElementById('currentDate');
    const searchBtn = document.getElementById('searchBtn');
    const cityInput = document.getElementById('cityInput');
    const currentWeather = document.querySelector('.current-weather');
    const weatherDetails = document.querySelector('.weather-details');
    const forecastSection = document.querySelector('.forecast-section');
    const notFound = document.getElementById('notFound');
    const loading = document.getElementById('loading');
    
    // Weather elements
    const weatherIcon = document.getElementById('weatherIcon');
    const temperature = document.getElementById('temperature');
    const description = document.getElementById('description');
    const cityName = document.getElementById('cityName');
    const humidityValue = document.getElementById('humidityValue');
    const windValue = document.getElementById('windValue');
    const pressureValue = document.getElementById('pressureValue');
    const feelsLikeValue = document.getElementById('feelsLikeValue');
    const forecastContainer = document.getElementById('forecastContainer');
    
    // API Configuration - Ücretsiz OpenWeatherMap API key
    const APIKey = '841f7af243e4abe7b007d21bade4ff8f';
    const baseURL = 'https://api.openweathermap.org/data/2.5';
    
    // Initialize app
    function init() {
        updateDateTime();
        setEventListeners();
        
        // Update time every second
        setInterval(updateDateTime, 1000);
        
        // Varsayılan şehir için hava durumunu yükle
        loadDefaultWeather();
    }
    
    // Varsayılan hava durumunu yükle (konum izni ile)
    function loadDefaultWeather() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    getWeatherByCoords(lat, lon);
                },
                error => {
                    // Konum izni verilmezse varsayılan şehri kullan
                    console.log('Konum izni verilmedi, varsayılan şehir kullanılıyor...');
                    getWeatherData('Istanbul');
                }
            );
        } else {
            // Geolocation desteklenmiyorsa varsayılan şehri kullan
            getWeatherData('Istanbul');
        }
    }
    
    // Koordinatlarla hava durumu al
    async function getWeatherByCoords(lat, lon) {
        showLoading();
        
        try {
            const currentResponse = await fetch(
                `${baseURL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${APIKey}&lang=tr`
            );
            const currentData = await currentResponse.json();
            
            if (currentData.cod !== 200) {
                showError();
                return;
            }
            
            const forecastResponse = await fetch(
                `${baseURL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${APIKey}&lang=tr`
            );
            const forecastData = await forecastResponse.json();
            
            displayWeatherData(currentData, forecastData);
            
        } catch (error) {
            console.error("Hava durumu verileri alınırken hata:", error);
            showError();
        }
    }
    
    // Update date and time display
    function updateDateTime() {
        const now = new Date();
        
        // Format options
        const dateOptions = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        const timeOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        
        // Format date and time
        const formattedDate = now.toLocaleDateString('tr-TR', dateOptions);
        const formattedTime = now.toLocaleTimeString('tr-TR', timeOptions);
        
        // Update DOM
        currentDateTime.textContent = `${formattedDate} - ${formattedTime}`;
        currentDate.textContent = formattedDate;
    }
    
    // Set up event listeners
    function setEventListeners() {
        searchBtn.addEventListener('click', handleSearch);
        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }
    
    // Handle search functionality
    function handleSearch() {
        const city = cityInput.value.trim();
        if (city !== '') {
            getWeatherData(city);
            cityInput.blur(); // Remove focus from input
        }
    }
    
    // Main function to get weather data
    async function getWeatherData(city) {
        showLoading();
        
        try {
            // Fetch current weather data
            const currentResponse = await fetch(
                `${baseURL}/weather?q=${city}&units=metric&appid=${APIKey}&lang=tr`
            );
            const currentData = await currentResponse.json();
            
            // Check if city was found
            if (currentData.cod !== 200) {
                showError();
                return;
            }
            
            // Fetch 5-day forecast data
            const forecastResponse = await fetch(
                `${baseURL}/forecast?q=${city}&units=metric&appid=${APIKey}&lang=tr`
            );
            const forecastData = await forecastResponse.json();
            
            // Display all weather data
            displayWeatherData(currentData, forecastData);
            
        } catch (error) {
            console.error("Hava durumu verileri alınırken hata:", error);
            showError();
        }
    }
    
    // Display weather data on the page
    function displayWeatherData(currentData, forecastData) {
        // Update UI state
        hideLoading();
        showContent();
        
        // Update current weather information
        updateCurrentWeather(currentData);
        
        // Update weather details
        updateWeatherDetails(currentData);
        
        // Update forecast
        updateForecast(forecastData);
        
        // Update background based on weather condition
        updateBackground(currentData.weather[0].main);
        
        // Add animation effects
        animateWeatherChange();
    }
    
    // Update current weather section
    function updateCurrentWeather(data) {
        // Set weather icon (OpenWeatherMap icon URL'sini kullan)
        const iconCode = data.weather[0].icon;
        weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        weatherIcon.alt = data.weather[0].description;
        
        // Set temperature and description
        temperature.innerHTML = `${Math.round(data.main.temp)}<span>°C</span>`;
        description.textContent = data.weather[0].description;
        
        // Set location
        cityName.textContent = `${data.name}, ${data.sys.country}`;
    }
    
    // Update weather details cards
    function updateWeatherDetails(data) {
        humidityValue.textContent = `${data.main.humidity}%`;
        windValue.textContent = `${Math.round(data.wind.speed)} km/s`;
        pressureValue.textContent = `${data.main.pressure} hPa`;
        feelsLikeValue.textContent = `${Math.round(data.main.feels_like)}°C`;
    }
    
    // Update 5-day forecast
    function updateForecast(data) {
        forecastContainer.innerHTML = '';
        
        // Filter to get one forecast per day (at 12:00 PM)
        const dailyForecasts = data.list.filter(item => {
            return item.dt_txt.includes('12:00:00');
        }).slice(0, 5);
        
        // Create forecast elements for each day
        dailyForecasts.forEach((forecast, index) => {
            const date = new Date(forecast.dt * 1000);
            const dayName = getDayName(date, index);
            
            const forecastDay = document.createElement('div');
            forecastDay.className = 'forecast-day';
            forecastDay.innerHTML = `
                <p class="day">${dayName}</p>
                <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" 
                     alt="${forecast.weather[0].description}" 
                     class="forecast-icon">
                <div class="forecast-temps">
                    <span class="max-temp">${Math.round(forecast.main.temp_max)}°</span>
                    <span class="min-temp">${Math.round(forecast.main.temp_min)}°</span>
                </div>
            `;
            
            forecastContainer.appendChild(forecastDay);
        });
    }
    
    // Get day name for forecast
    function getDayName(date, index) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        if (index === 0) return 'Bugün';
        if (date.toDateString() === tomorrow.toDateString()) return 'Yarın';
        
        return date.toLocaleDateString('tr-TR', { weekday: 'short' });
    }
    
    // Update background based on weather condition
    function updateBackground(condition) {
        // Remove all weather classes
        document.body.className = '';
        
        // Add appropriate weather class
        switch(condition.toLowerCase()) {
            case 'clear':
                document.body.classList.add('clear');
                break;
            case 'clouds':
                document.body.classList.add('clouds');
                break;
            case 'rain':
                document.body.classList.add('rain');
                break;
            case 'drizzle':
                document.body.classList.add('drizzle');
                break;
            case 'snow':
                document.body.classList.add('snow');
                break;
            case 'mist':
            case 'fog':
            case 'haze':
                document.body.classList.add('mist');
                break;
            case 'thunderstorm':
                document.body.classList.add('thunderstorm');
                break;
            default:
                // Keep default gradient
                break;
        }
    }
    
    // Show loading state
    function showLoading() {
        loading.classList.add('active');
        currentWeather.classList.remove('active');
        weatherDetails.classList.remove('active');
        forecastSection.classList.remove('active');
        notFound.classList.remove('active');
    }
    
    // Hide loading and show content
    function hideLoading() {
        loading.classList.remove('active');
        console.log("sadasddsa");
        
    }
    
    // Show content with animation
    function showContent() {
        currentWeather.classList.add('active');
        weatherDetails.classList.add('active');
        forecastSection.classList.add('active');
        notFound.classList.remove('active');
    }
    
    // Show error state
    function showError() {
        hideLoading();
        currentWeather.classList.remove('active');
        weatherDetails.classList.remove('active');
        forecastSection.classList.remove('active');
        notFound.classList.add('active');
        console.log("git değişikliği");
        
    }
    
    // Animate weather change
    function animateWeatherChange() {
        document.querySelector('.container').classList.add('weather-change');
        setTimeout(() => {
            document.querySelector('.container').classList.remove('weather-change');
        }, 1000);
    }
    
    // Initialize the application
    init();
});