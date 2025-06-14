const apiKey = "ded21336816f47678c1192235253005";

function getWeather() {
  const loc = document.getElementById("locationInput").value.trim();
  if (loc) fetchWeather(loc);
}

function getWeatherByGPS() {
  if (!navigator.geolocation) return alert("Geolocation not supported.");
  navigator.geolocation.getCurrentPosition(
    pos => fetchWeather(`${pos.coords.latitude},${pos.coords.longitude}`),
    () => alert("Could not get location.")
  );
}

async function fetchWeather(query) {
  const cur = document.getElementById("current-weather");
  const fcast = document.getElementById("forecast");
  const alertEl = document.getElementById("alert");

  cur.textContent = "Loading...";
  fcast.innerHTML = "";
  alertEl.style.display = "none";

  try {
    const url = `https://api.allorigins.workers.dev/raw?url=http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(query)}&days=7&aqi=yes&alerts=no`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("API error");
    const data = await res.json();

    const current = data.current;
    const condition = current.condition.text.toLowerCase();

    cur.innerHTML = `
      <h2>${data.location.name}</h2>
      <p><strong>${current.temp_c}°C</strong></p>
      <img src="${current.condition.icon}" alt="${condition}" />
      <p>${current.condition.text}</p>
      <p>Wind: ${current.wind_kph} km/h</p>
      <p>Humidity: ${current.humidity}%</p>
    `;

    const alerts = [];
    if (condition.includes("rain")) alerts.push("🌧️ Rain expected today!");
    if (current.wind_kph > 30) alerts.push(`💨 High wind alert: ${current.wind_kph} km/h`);
    if (alerts.length) {
      alertEl.innerHTML = alerts.join("<br>");
      alertEl.style.display = "block";
    }

    setBackground(condition);

    data.forecast.forecastday.forEach(day => {
      const div = document.createElement("div");
      div.className = "forecast-day";
      div.innerHTML = `
        <p><strong>${day.date}</strong></p>
        <img src="${day.day.condition.icon}" alt="${day.day.condition.text}" />
        <p>${day.day.avgtemp_c}°C</p>
        <p>${day.day.condition.text}</p>
      `;
      fcast.appendChild(div);
    });

  } catch (err) {
    cur.textContent = `Error: ${err.message}`;
  }
}

function setBackground(conditionText) {
  const bg = document.getElementById("background");
  let url = "";
  if (conditionText.includes("sunny")) url = "https://i.gifer.com/7bK.gif";
  else if (conditionText.includes("rain")) url = "https://i.gifer.com/7VE.gif";
  else if (conditionText.includes("snow")) url = "https://i.gifer.com/YXj.gif";
  else if (conditionText.includes("cloud")) url = "https://i.gifer.com/8T1j.gif";
  else url = "https://i.gifer.com/fxg.gif";
  bg.style.backgroundImage = `url('${url}')`;
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

window.onload = () => {
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
  }
};
