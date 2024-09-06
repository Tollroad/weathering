
const cityInput = document.querySelector(".city-input");
const searchBtn = document.querySelector(".search-btn");
const displaySection = document.querySelector(".not-found");
const searchCitySection = document.querySelector(".search-city");
const weatherInfoSection = document.querySelector(".weather-info");

// data variables
const countryName = document.querySelector(".country-txt");
const temprature = document.querySelector(".temp-txt");
const condition = document.querySelector(".condition-txt");
const humidityValue = document.querySelector(".humidity-value-txt");
const windvalue = document.querySelector(".wind-value-txt");
const weatherImg = document.querySelector(".weather-summary-img");
const currentDate = document.querySelector(".current-date-txt");
const forecastItemContainer = document.querySelector(".forecast-item-container");

let apiKey;  

fetch('./apikey.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    apiKey = data.key;
  })
  .catch(error => console.error('Error fetching API key:', error));

searchBtn.addEventListener("click", () => {
  if (cityInput.value.trim() != "") {
    updateWeatherInfo(cityInput.value);
    cityInput.value = "";
    cityInput.blur();
  }
});

cityInput.addEventListener("keydown", (event) => {
  if (event.key == "Enter" && cityInput.value.trim() != "") {
    updateWeatherInfo(cityInput.value);
    cityInput.value = "";
    cityInput.blur();
  }
});

function getWeatherIcon(id) {
  if (id <= 232) {
    return "thunderstorm.svg";
  }
  if (id <= 321 && id >= 233) {
    return "drizzle.svg";
  }
  if (id <= 531 && id >= 322) {
    return "rain.svg";
  }
  if (id <= 622 && id >= 532) {
    return "snow.svg";
  }
  if (id <= 781 && id >= 623) {
    return "atmosphere.svg";
  }
  if (id == 800) {
    return "clear.svg";
  } else {
    return "clouds.svg";
  }
}

function getCurrentdate() {
  getDate = new Date();
  const options = {
    weekday: "short",
    day: "2-digit",
    month: "short",
  };
  return getDate.toLocaleDateString("en-GB", options);
}

async function getfetchData(endPoint, city) {
  const apiurl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;

  const response = await fetch(apiurl);
//   console.log("run");

  return response.json();
}

async function updateWeatherInfo(city) {
  const weatherData = await getfetchData("weather", city);
  if (weatherData.cod != 200) {
    showDisplaySection(displaySection);
    return;
  }
//   console.log(weatherData);
  const {
    name: country,
    main: { temp, humidity },
    weather: [{ id, main }],
    wind: { speed },
  } = weatherData;
  {
    countryName.textContent = country;
    temprature.textContent = Math.round(temp) + " °C";
    humidityValue.textContent = humidity + "%";
    windvalue.textContent = speed + " m/s";
    condition.textContent = main;
    weatherImg.src = `assets/weather/${getWeatherIcon(id)}`;
    currentDate.textContent = getCurrentdate();
  }
  await updateForecastInfo(city);
  showDisplaySection(weatherInfoSection);
}

async function updateForecastInfo(city) {
  const forecastData = await getfetchData("forecast", city);
  const timeTaken = "12:00:00";
  const todayDate = new Date().toISOString().split("T")[0];

  forecastItemContainer.innerHTML = '';
  forecastData.list.forEach((forecastWeather) => {
    if (
      forecastWeather.dt_txt.includes(timeTaken) &&
      !forecastWeather.dt_txt.includes(todayDate)
    ) {
      updateForecastItems(forecastWeather);
    }
  });
}

function updateForecastItems(weatherData) {
//   console.log(weatherData);
  const {
    dt_txt: date,
    weather: [{ id }],
    main: { temp },
  } = weatherData;

  const dateTaken = new Date(date);
  const dateOption = {
    day: '2-digit',
    month:'short'
  }

  const dateResult = dateTaken.toLocaleDateString('en-US',dateOption)

  const forecastItem = `
    <div class="forecast-item">
        <h5 class="forecast-item-date regular-txt">${dateResult}
        </h5>
        <img src="assets//weather/${getWeatherIcon(id)}" class="forecast-item-img">
        <h5 class="forecast-item-temp">${Math.round(temp)}°C</h5>
    </div>
    `
    forecastItemContainer.insertAdjacentHTML('beforeend',forecastItem)
}

function showDisplaySection(section) {
  [weatherInfoSection, searchCitySection, displaySection].forEach(
    (section) => (section.style.display = "none")
  );

  section.style.display = "flex";
}
