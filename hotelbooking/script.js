// Mobile nav toggle
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

function openMenu() {
  sidebar.classList.add("open");
  overlay.classList.add("show");
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.textContent = "✕";
}

function closeMenu() {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.textContent = "☰";
}

menuToggle.addEventListener("click", () => {
  sidebar.classList.contains("open") ? closeMenu() : openMenu();
});

overlay.addEventListener("click", closeMenu);

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    document
      .querySelectorAll(".nav-link")
      .forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    if (window.innerWidth <= 780) closeMenu();
  });
});

const cardStack = document.getElementById("cardStack");
cardStack.addEventListener("click", () => {
  if (window.innerWidth <= 780) {
    cardStack.classList.toggle("tapped");
  }
});

const copyBtn = document.getElementById("copyBtn");
copyBtn.addEventListener("click", async () => {
  const password = "soleil-2026";
  try {
    await navigator.clipboard.writeText(password);
  } catch (err) {
    const temp = document.createElement("textarea");
    temp.value = password;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);
  }
  const originalText = copyBtn.textContent;
  copyBtn.textContent = "Copied!";
  copyBtn.classList.add("copied");
  setTimeout(() => {
    copyBtn.textContent = originalText;
    copyBtn.classList.remove("copied");
  }, 1500);
});

document
  .getElementById("printBtn")
  .addEventListener("click", () => window.print());

// ---------- LIVE LOCATION + WEATHER ----------

function describeWeatherCode(code) {
  const map = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Foggy",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Rain showers",
    82: "Violent showers",
    95: "Thunderstorm",
    96: "Thunderstorm",
    99: "Severe thunderstorm",
  };
  return map[code] || "Clear";
}

function describeWind(speedKmh) {
  if (speedKmh < 5) return "calm";
  if (speedKmh < 15) return "light breeze";
  if (speedKmh < 30) return "breezy";
  return "windy";
}

function fallbackWeather() {
  document.getElementById("weatherLocation").textContent = "Today in Cassis";
  document.getElementById("weatherTemp").textContent = "27°";
  document.getElementById("weatherDesc").textContent = "Sunny · light breeze";
}

async function loadLocationWeather() {
  const locationEl = document.getElementById("weatherLocation");
  const tempEl = document.getElementById("weatherTemp");
  const descEl = document.getElementById("weatherDesc");

  if (!navigator.geolocation) {
    fallbackWeather();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        // 1. Reverse-geocode coordinates into a city name
        const geoRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        );
        const geoData = await geoRes.json();
        const city =
          geoData.city ||
          geoData.locality ||
          geoData.principalSubdivision ||
          "your location";
        locationEl.textContent = `Today in ${city}`;

        // 2. Fetch current weather for those coordinates
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m`,
        );
        const weatherData = await weatherRes.json();
        const temp = Math.round(weatherData.current.temperature_2m);
        const wind = weatherData.current.wind_speed_10m;
        const code = weatherData.current.weather_code;

        tempEl.textContent = `${temp}°`;
        descEl.textContent = `${describeWeatherCode(code)} · ${describeWind(wind)}`;
      } catch (err) {
        fallbackWeather();
      }
    },
    () => {
      // user denied permission, or geolocation failed
      fallbackWeather();
    },
  );
}

loadLocationWeather();
