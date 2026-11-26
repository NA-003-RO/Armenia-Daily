import { useEffect,useRef, useState } from "react";

const LOCAL_API = "/api/settings";
const LOCAL_AI_URL = "/ai/api/chat";
const AI_MODEL = "qwen2.5:3b";

const METEO_CACHE_KEY = "Armenia-Daily_meteo_cache_v1";
const METEO_CACHE_TTL_MS = 10 * 60 * 1000;

const DEFAULT_SETTINGS = {
  id: "default",
  baseCurrency: "USD",
  targetCurrencies: [
    "USD",
    "RUR",
    "EUR",
    "GBP",
    "GEL",
    "AED",
    "CHF",
    "UAH",
    "AUD",
    "CAD",
  ],
  spreadPercent: 0.4,
  cityName: "Yerevan",
  latitude: 40.1792,
  longitude: 44.4991,
  pollIntervalSec: 30,
};

const EXCHANGE_CURRENCIES = [
  { code: "USD", apiCode: "USD", label: "USD" },
  { code: "RUR", apiCode: "RUB", label: "RUR" },
  { code: "EUR", apiCode: "EUR", label: "EUR" },
  { code: "GBP", apiCode: "GBP", label: "GBP" },
  { code: "GEL", apiCode: "GEL", label: "GEL" },
  { code: "AED", apiCode: "AED", label: "AED" },
  { code: "CHF", apiCode: "CHF", label: "CHF" },
  { code: "UAH", apiCode: "UAH", label: "UAH" },
  { code: "AUD", apiCode: "AUD", label: "AUD" },
  { code: "CAD", apiCode: "CAD", label: "CAD" },
];

const CRYPTO_COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "tether", symbol: "USDT", name: "Tether" },
  { id: "the-open-network", symbol: "TON", name: "Toncoin" },
];

const ARMENIA_LOCATIONS = [
  // Марзы и Ереван
  {
    id: "loc-yerevan",
    name: "Ереван",
    category: "regions",
    sub: "Столица • центр страны",
    lat: 40.1814,
    lon: 44.5144,
  },
  {
    id: "loc-aragatsotn",
    name: "Арагацотн",
    category: "regions",
    sub: "Центр: Аштарак • Апаран, Талин",
    lat: 40.3,
    lon: 44.4,
  },
  {
    id: "loc-ararat",
    name: "Арарат",
    category: "regions",
    sub: "Центр: Арташат • Масис, Веди",
    lat: 39.9539,
    lon: 44.5506,
  },
  {
    id: "loc-armavir",
    name: "Армавир",
    category: "regions",
    sub: "Центр: Армавир • Вагаршапат, Мецамор",
    lat: 40.1544,
    lon: 44.0381,
  },
  {
    id: "loc-gegharkunik",
    name: "Гегаркуник",
    category: "regions",
    sub: "Центр: Гавар • Севан, Мартуни, Варденис",
    lat: 40.3667,
    lon: 45.1333,
  },
  {
    id: "loc-kotayk",
    name: "Котайк",
    category: "regions",
    sub: "Центр: Раздан • Абовян, Чаренцаван",
    lat: 40.5,
    lon: 44.7667,
  },
  {
    id: "loc-lori",
    name: "Лори",
    category: "regions",
    sub: "Центр: Ванадзор • Степанаван, Спитак",
    lat: 40.8128,
    lon: 44.4883,
  },
  {
    id: "loc-shirak",
    name: "Ширак",
    category: "regions",
    sub: "Центр: Гюмри • Артик, Маралик",
    lat: 40.7833,
    lon: 43.8333,
  },
  {
    id: "loc-syunik",
    name: "Сюник",
    category: "regions",
    sub: "Центр: Капан • Горис, Сисиан, Мегри",
    lat: 39.2011,
    lon: 46.415,
  },
  {
    id: "loc-tavush",
    name: "Тавуш",
    category: "regions",
    sub: "Центр: Иджеван • Дилижан, Берд",
    lat: 40.8756,
    lon: 45.1492,
  },
  {
    id: "loc-vayots-dzor",
    name: "Вайоц Дзор",
    category: "regions",
    sub: "Центр: Ехегнадзор • Джермук, Вайк",
    lat: 39.7667,
    lon: 45.35,
  },

  // Города Армении
  {
    id: "city-gyumri",
    name: "Гюмри",
    category: "cities",
    sub: "Марз Ширак",
    lat: 40.7833,
    lon: 43.8333,
  },
  {
    id: "city-vanadzor",
    name: "Ванадзор",
    category: "cities",
    sub: "Марз Лори",
    lat: 40.8128,
    lon: 44.4883,
  },
  {
    id: "city-abovyan",
    name: "Абовян",
    category: "cities",
    sub: "Марз Котайк",
    lat: 40.2739,
    lon: 44.6256,
  },
  {
    id: "city-vagharshapat",
    name: "Вагаршапат (Эчмиадзин)",
    category: "cities",
    sub: "Марз Армавир",
    lat: 40.1728,
    lon: 44.2925,
  },
  {
    id: "city-hrazdan",
    name: "Раздан",
    category: "cities",
    sub: "Марз Котайк",
    lat: 40.5,
    lon: 44.7667,
  },
  {
    id: "city-kapan",
    name: "Капан",
    category: "cities",
    sub: "Марз Сюник",
    lat: 39.2011,
    lon: 46.415,
  },
  {
    id: "city-goris",
    name: "Горис",
    category: "cities",
    sub: "Марз Сюник",
    lat: 39.5111,
    lon: 46.3417,
  },
  {
    id: "city-sisian",
    name: "Сисиан",
    category: "cities",
    sub: "Марз Сюник",
    lat: 39.5208,
    lon: 46.0322,
  },
  {
    id: "city-dilijan",
    name: "Дилижан",
    category: "cities",
    sub: "Марз Тавуш",
    lat: 40.7408,
    lon: 44.8631,
  },
  {
    id: "city-ijevan",
    name: "Иджеван",
    category: "cities",
    sub: "Марз Тавуш",
    lat: 40.8756,
    lon: 45.1492,
  },
  {
    id: "city-sevan",
    name: "Севан",
    category: "cities",
    sub: "Марз Гегаркуник",
    lat: 40.555,
    lon: 44.9536,
  },
  {
    id: "city-gavar",
    name: "Гавар",
    category: "cities",
    sub: "Марз Гегаркуник",
    lat: 40.3667,
    lon: 45.1333,
  },
  {
    id: "city-ashtarak",
    name: "Аштарак",
    category: "cities",
    sub: "Марз Арагацотн",
    lat: 40.3,
    lon: 44.4,
  },
  {
    id: "city-artashat",
    name: "Арташат",
    category: "cities",
    sub: "Марз Арарат",
    lat: 39.9539,
    lon: 44.5506,
  },
  {
    id: "city-jermuk",
    name: "Джермук",
    category: "cities",
    sub: "Марз Вайоц Дзор",
    lat: 39.8417,
    lon: 45.6736,
  },
];

const UNIQUE_COORDS = [];
const coordKeyToIndex = new Map();
for (const loc of ARMENIA_LOCATIONS) {
  const key = `${loc.lat},${loc.lon}`;
  if (!coordKeyToIndex.has(key)) {
    coordKeyToIndex.set(key, UNIQUE_COORDS.length);
    UNIQUE_COORDS.push({ lat: loc.lat, lon: loc.lon, key });
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function readMeteoCache() {
  try {
    const raw = localStorage.getItem(METEO_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.ts !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeMeteoCache(payload) {
  try {
    localStorage.setItem(
      METEO_CACHE_KEY,
      JSON.stringify({ ...payload, ts: Date.now() })
    );
  } catch {
    // ignore
  }
}

function formatRate(val) {
  if (typeof val !== "number" || Number.isNaN(val)) return "—";
  return val < 20 ? val.toFixed(3) : val.toFixed(2);
}

function getAqiBadge(aqi) {
  if (typeof aqi !== "number" || Number.isNaN(aqi)) {
    return { label: "—", color: "#94a3b8" };
  }
  if (aqi <= 50) return { label: "Хорошо", color: "#4ade80" };
  if (aqi <= 100) return { label: "Умеренно", color: "#facc15" };
  if (aqi <= 150) return { label: "Чувствительным", color: "#fb923c" };
  return { label: "Повышенный", color: "#f87171" };
}

function formatDuration(seconds) {
  if (typeof seconds !== "number" || Number.isNaN(seconds)) return "—";
  const mins = Math.round(seconds / 60);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h} ч ${m} мин` : `${m} мин`;
}

function renderCategoryTabs(activeValue, onChange) {
  const tabs = [
    { id: "all", label: "Все категории" },
    { id: "regions", label: "Марзы и Ереван" },
    { id: "cities", label: "Города" },
  ];

  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          style={{
            padding: "6px 12px",
            borderRadius: "8px",
            border: "1px solid #475569",
            cursor: "pointer",
            background: activeValue === tab.id ? "#2563eb" : "#1e293b",
            color: "#f8fafc",
            fontWeight: 600,
            fontSize: "12px",
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [midRates, setMidRates] = useState({});
  const [prevMidRates, setPrevMidRates] = useState({});
  const [fxLastUpdate, setFxLastUpdate] = useState("—");
  const prevMidRatesRef = useRef({});
  const [fxSource, setFxSource] = useState("—");
  const [fxError, setFxError] = useState("");

  const [cryptoPrices, setCryptoPrices] = useState({});
  const [cryptoError, setCryptoError] = useState("");

  const [weatherItems, setWeatherItems] = useState([]);
  const [weatherError, setWeatherError] = useState("");
  const [weatherCategory, setWeatherCategory] = useState("all");

  const [airItems, setAirItems] = useState([]);
  const [airError, setAirError] = useState("");
  const [airCategory, setAirCategory] = useState("all");

  const [fromLocId, setFromLocId] = useState("loc-yerevan");
  const [toLocId, setToLocId] = useState("city-dilijan");
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeError, setRouteError] = useState("");
  const [routeLoading, setRouteLoading] = useState(false);

  const [localApiOk, setLocalApiOk] = useState(false);
  const [lastUpdate, setLastUpdate] = useState("—");

  const [amountInput, setAmountInput] = useState("100");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [quoteType, setQuoteType] = useState("buy");
  const [direction, setDirection] = useState("toAmd");

  // Состояния локального AI-помощника
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const fetchLocalSettings = async () => {
    try {
      const res = await fetch(LOCAL_API, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      if (!res.ok && res.status !== 304) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      const normalized =
        data && typeof data === "object"
          ? { ...DEFAULT_SETTINGS, ...data }
          : DEFAULT_SETTINGS;
      setSettings(normalized);
      setLocalApiOk(true);
      return normalized;
    } catch {
      setLocalApiOk(false);
      return settings;
    }
  };

  const fetchRatesToAmd = async () => {
    const apiCodes = EXCHANGE_CURRENCIES.map((c) => c.apiCode).join(",");

    const buildMidMap = (apiRatesObj) => {
      const map = {};
      for (const item of EXCHANGE_CURRENCIES) {
        const rateFromAmd = apiRatesObj?.[item.apiCode];
        if (typeof rateFromAmd === "number" && rateFromAmd > 0) {
          map[item.code] = 1 / rateFromAmd;
        }
      }
      return map;
    };

    try {
      const url = `https://api.frankfurter.app/latest?from=AMD&to=${apiCodes}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Frankfurter HTTP ${res.status}`);
      const data = await res.json();
      const map = buildMidMap(data.rates || {});
      if (Object.keys(map).length < 5) {
        throw new Error("Frankfurter вернул неполный список валют");
      }
      setMidRates(map);
      setFxSource("Frankfurter");
      setFxError("");
      return;
    } catch {
      try {
        const res2 = await fetch("https://open.er-api.com/v6/latest/AMD", {
          cache: "no-store",
        });
        if (!res2.ok) throw new Error(`ER-API HTTP ${res2.status}`);
        const data2 = await res2.json();
        const map = buildMidMap(data2.rates || {});
        if (Object.keys(map).length === 0) {
          throw new Error("Нет нужных валют в ER-API");
        }
        setMidRates(map);
        setFxSource("Open ER-API");
        setFxError("");
      } catch (err2) {
        setFxError(err2?.message || "Ошибка загрузки курсов");
      }
    }
  };

  const fetchCryptoInAmd = async () => {
    const ids = CRYPTO_COINS.map((c) => c.id).join(",");
    const cgUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
      ids
    )}&vs_currencies=amd,usd`;

    const fallbackRates = {
      bitcoin: { amd: 36500000, usd: 94000 },
      ethereum: { amd: 1280000, usd: 3300 },
      tether: { amd: 388, usd: 1.0 },
      "the-open-network": { amd: 2150, usd: 5.55 },
    };

    try {
      const res = await fetch(cgUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);
      const data = await res.json();
      if (!data || Object.keys(data).length === 0) {
        throw new Error("Empty CoinGecko response");
      }

      const normalized = {};
      for (const coin of CRYPTO_COINS) {
        const entry = data?.[coin.id];
        if (entry && typeof entry.amd === "number") {
          normalized[coin.id] = {
            amd: entry.amd,
            usd: typeof entry.usd === "number" ? entry.usd : fallbackRates[coin.id]?.usd ?? 0,
          };
        } else if (fallbackRates[coin.id]) {
          normalized[coin.id] = fallbackRates[coin.id];
        }
      }

      if (Object.keys(normalized).length === 0) {
        throw new Error("No crypto rate data");
      }

      setCryptoPrices(normalized);
      setCryptoError("");
    } catch (err) {
      setCryptoPrices((prev) => {
        if (prev && Object.keys(prev).length > 0) return prev;
        const built = {};
        for (const coin of CRYPTO_COINS) {
          built[coin.id] = fallbackRates[coin.id] || { amd: 0, usd: 0 };
        }
        return built;
      });
      setCryptoError(
        err?.message
          ? `Fallback rates active (${err.message})`
          : "Fallback rates active"
      );
    }
  };

  const fetchMeteoWithCache = async (force = false) => {
    const cached = readMeteoCache();
    const isFresh =
      cached &&
      Array.isArray(cached.weatherItems) &&
      cached.weatherItems.length > 0 &&
      Array.isArray(cached.airItems) &&
      cached.airItems.length > 0 &&
      Date.now() - cached.ts < METEO_CACHE_TTL_MS;

    if (!force && isFresh) {
      setWeatherItems(cached.weatherItems);
      setAirItems(cached.airItems);
      setWeatherError("");
      setAirError("");
      return;
    }

    const lats = UNIQUE_COORDS.map((c) => c.lat).join(",");
    const lons = UNIQUE_COORDS.map((c) => c.lon).join(",");

    let nextWeather = cached?.weatherItems || [];
    let nextAir = cached?.airItems || [];

    try {
      const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,wind_speed_10m`;
      const resW = await fetch(wUrl);
      if (resW.status === 429) {
        throw new Error(
          "Лимит запросов Open-Meteo (429) — подожди 1 минуту и нажми «Обновить»"
        );
      }
      if (!resW.ok) throw new Error(`Open-Meteo HTTP ${resW.status}`);
      const rawW = await resW.json();
      const listW = Array.isArray(rawW) ? rawW : [rawW];

      nextWeather = ARMENIA_LOCATIONS.map((loc) => {
        const idx = coordKeyToIndex.get(`${loc.lat},${loc.lon}`);
        const item = listW[idx] || {};
        return {
          ...loc,
          temp: item.current?.temperature_2m ?? null,
          wind: item.current?.wind_speed_10m ?? null,
        };
      });

      setWeatherItems(nextWeather);
      setWeatherError("");
    } catch (err) {
      if (nextWeather.length > 0) setWeatherItems(nextWeather);
      setWeatherError(err?.message || "Ошибка загрузки погоды");
    }

    await sleep(2000);

    try {
      const aUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lats}&longitude=${lons}&current=us_aqi,pm2_5,pm10`;
      let resA = await fetch(aUrl);
      if (resA.status === 429) {
        await sleep(3000);
        resA = await fetch(aUrl);
      }
      if (resA.status === 429) {
        throw new Error(
          "Лимит запросов Air Quality (429) — подожди 1 минуту и нажми «Обновить»"
        );
      }
      if (!resA.ok) throw new Error(`Air Quality HTTP ${resA.status}`);
      const rawA = await resA.json();
      const listA = Array.isArray(rawA) ? rawA : [rawA];

      nextAir = ARMENIA_LOCATIONS.map((loc) => {
        const idx = coordKeyToIndex.get(`${loc.lat},${loc.lon}`);
        const cur = listA[idx]?.current || {};
        return {
          ...loc,
          aqi: cur.us_aqi ?? null,
          pm25: cur.pm2_5 ?? null,
          pm10: cur.pm10 ?? null,
        };
      });

      setAirItems(nextAir);
      setAirError("");
    } catch (err) {
      if (nextAir.length > 0) setAirItems(nextAir);
      setAirError(err?.message || "Ошибка загрузки качества воздуха");
    }

    if (nextWeather.length > 0 && nextAir.length > 0) {
      writeMeteoCache({ weatherItems: nextWeather, airItems: nextAir });
    }
  };

  const fetchRouteBetweenLocations = async (srcId, dstId) => {
    if (srcId === dstId) {
      setRouteInfo({ distanceKm: "0.0", durationText: "0 мин" });
      setRouteError("");
      return;
    }

    const fromLoc = ARMENIA_LOCATIONS.find((c) => c.id === srcId);
    const toLoc = ARMENIA_LOCATIONS.find((c) => c.id === dstId);
    if (!fromLoc || !toLoc) return;

    setRouteLoading(true);
    try {
      const coords = `${fromLoc.lon},${fromLoc.lat};${toLoc.lon},${toLoc.lat}`;
      const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=false`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
      const data = await res.json();
      const route = data?.routes?.[0];
      if (!route) throw new Error("Маршрут не найден");

      setRouteInfo({
        distanceKm: (route.distance / 1000).toFixed(1),
        durationText: formatDuration(route.duration),
      });
      setRouteError("");
    } catch (err) {
      setRouteError(err?.message || "Ошибка расчёта маршрута");
    } finally {
      setRouteLoading(false);
    }
  };

  const fetchAll = async (forceMeteo = false) => {
    const cfg = await fetchLocalSettings();
    await fetchRatesToAmd();
    await fetchCryptoInAmd();
    await fetchMeteoWithCache(forceMeteo);
    setLastUpdate(new Date().toLocaleTimeString());
    return cfg;
  };

  useEffect(() => {
    fetchRouteBetweenLocations(fromLocId, toLocId);
  }, [fromLocId, toLocId]);

  useEffect(() => {
    let timerId;

    const tick = async () => {
      const cfg = await fetchAll(false);
      const sec = Math.max(30, Number(cfg.pollIntervalSec || 30));
      timerId = setTimeout(tick, sec * 1000);
    };

    tick();
    return () => clearTimeout(timerId);
  }, []);

  const spreadFactor = Math.max(0, Number(settings.spreadPercent ?? 0.4)) / 100;

  const getBuySellForCurrency = (code) => {
    const mid = midRates[code];
    if (typeof mid !== "number" || mid <= 0) {
      return { buy: null, sell: null };
    }
    return {
      buy: mid * (1 - spreadFactor),
      sell: mid * (1 + spreadFactor),
    };
  };

const askLocalAi = async (customPrompt) => {
    const promptText = (customPrompt ?? aiQuestion).trim();
    if (!promptText || aiLoading) return;

    setAiLoading(true);
    setAiError("");
    setAiAnswer("");

    const fxSnapshot = EXCHANGE_CURRENCIES.map((c) => {
      const q = getBuySellForCurrency(c.code);
      return `${c.label}: покупка ${formatRate(q.buy)}, продажа ${formatRate(q.sell)} AMD`;
    }).join("; ");

    const weatherSnapshot = weatherItems
      .slice(0, 12)
      .map((w) => `${w.name}: ${w.temp ?? "—"}°C`)
      .join(", ");

    const airSnapshot = airItems
      .slice(0, 12)
      .map((a) => `${a.name}: AQI ${a.aqi ?? "—"}`)
      .join(", ");

    const locationsList = ARMENIA_LOCATIONS.map((loc) => loc.name).join(", ");

    const fromLoc = ARMENIA_LOCATIONS.find((c) => c.id === fromLocId);
    const toLoc = ARMENIA_LOCATIONS.find((c) => c.id === toLocId);
    const routeSnapshot =
      routeInfo && fromLoc && toLoc
        ? `${fromLoc.name} -> ${toLoc.name}: ${routeInfo.distanceKm} км, ~${routeInfo.durationText}`
        : "нет данных маршрута";

    const systemContext = `Ты локальный AI-помощник дашборда Armenia-Daily.
Твоя строгая специализация — ТОЛЬКО Армения, её марзы и города, а также данные этого дашборда (погода, воздух AQI, курсы к AMD, маршруты по Армении).
Правила:
1. Отвечай только про Армению, её марзы, города и данные дашборда.
2. Если вопрос не связан с Арменией или данными дашборда, ответь одной короткой фразой: "Я отвечаю только про Армению, её марзы, города и данные дашборда Armenia-Daily." — и больше ничего не добавляй.
3. Не придумывай факты, погоду, AQI, расстояния и время в пути, которых нет в контексте.
4. Отвечай кратко, по делу и на русском языке.

Доступные локации (марзы и города Армении): ${locationsList || "Ереван и марзы Армении"}.
Погода по марзам и городам: ${weatherSnapshot || "нет данных"}.
Качество воздуха (AQI): ${airSnapshot || "нет данных"}.
Актуальный маршрут: ${routeSnapshot}.
Курсы обмена к AMD: ${fxSnapshot || "нет данных"}.`;

    try {
      const res = await fetch(LOCAL_AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: AI_MODEL,
          stream: true,
          options: {
            temperature: 0.2,
          },
          messages: [
            { role: "system", content: systemContext },
            { role: "user", content: promptText },
          ],
        }),
      });

      if (!res.ok) {
        throw new Error(
          `Ollama HTTP ${res.status} (проверь, запущен ли контейнер ollama и скачана ли модель ${AI_MODEL})`
        );
      }

      if (!res.body) {
        const data = await res.json();
        setAiAnswer(data?.message?.content || "Пустой ответ от модели.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const chunk = JSON.parse(trimmed);
            const piece = chunk?.message?.content || "";
            if (piece) {
              accumulated += piece;
              setAiAnswer(accumulated);
            }
          } catch {
            // пропускаем неполную JSON-строку до следующего чанка
          }
        }
      }

      if (!accumulated) {
        setAiAnswer("Пустой ответ от модели.");
      }
    } catch (err) {
      setAiError(err?.message || "Ошибка запроса к локальному AI");
    } finally {
      setAiLoading(false);
    }
  };

  const selectedQuotes = getBuySellForCurrency(selectedCurrency);
  const calcRate =
    quoteType === "buy" ? selectedQuotes.buy : selectedQuotes.sell;
  const parsedAmount = Math.max(0, Number(amountInput) || 0);

  const convertedValue =
    typeof calcRate === "number" && calcRate > 0
      ? direction === "toAmd"
        ? (parsedAmount * calcRate).toFixed(2)
        : (parsedAmount / calcRate).toFixed(2)
      : "—";

  const regionsWeather = weatherItems.filter(
    (item) => item.category === "regions"
  );
  const citiesWeather = weatherItems.filter(
    (item) => item.category === "cities"
  );

  const regionsAir = airItems.filter((item) => item.category === "regions");
  const citiesAir = airItems.filter((item) => item.category === "cities");

  const regionLocations = ARMENIA_LOCATIONS.filter(
    (item) => item.category === "regions"
  );
  const cityLocations = ARMENIA_LOCATIONS.filter(
    (item) => item.category === "cities"
  );

  const renderWeatherGrid = (items) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "12px",
      }}
    >
      {items.map((loc) => (
        <div
          key={loc.id}
          style={{
            background: "#1e293b",
            padding: "14px",
            borderRadius: "10px",
            border: "1px solid #334155",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: "15px" }}>{loc.name}</div>
          <div
            style={{
              fontSize: "12px",
              color: "#94a3b8",
              marginTop: "2px",
              marginBottom: "8px",
            }}
          >
            {loc.sub}
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#fbbf24",
            }}
          >
            {loc.temp !== null ? `${loc.temp} °C` : "—"}
          </div>
          <div
            style={{ fontSize: "13px", color: "#cbd5e1", marginTop: "4px" }}
          >
            Ветер: {loc.wind !== null ? `${loc.wind} км/ч` : "—"}
          </div>
        </div>
      ))}
    </div>
  );

  const renderAirGrid = (items) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "12px",
      }}
    >
      {items.map((loc) => {
        const badge = getAqiBadge(loc.aqi);
        return (
          <div
            key={loc.id}
            style={{
              background: "#1e293b",
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #334155",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <strong style={{ fontSize: "15px" }}>{loc.name}</strong>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: badge.color,
                }}
              >
                {badge.label}
              </span>
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                marginTop: "2px",
                marginBottom: "8px",
              }}
            >
              {loc.sub}
            </div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: badge.color,
              }}
            >
              AQI {loc.aqi ?? "—"}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#cbd5e1",
                marginTop: "6px",
              }}
            >
              PM2.5: {loc.pm25 ?? "—"} • PM10: {loc.pm10 ?? "—"}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        background: "#0f172a",
        color: "#f8fafc",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "26px" }}>Armenia-Daily</h1>
            <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "14px" }}>
              Обменник (AMD) • Крипто в AMD • Погода, воздух и маршруты по
              марзам и городам Армении • {fxSource}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "13px",
              color: "#cbd5e1",
            }}
          >
            <span>{localApiOk ? "🟢 API :3001 OK" : "🔴 API :3001 Offline"}</span>
            <span>• Обновлено: {lastUpdate}</span>
            <button
              type="button"
              onClick={() => fetchAll(true)}
              style={{
                padding: "5px 10px",
                borderRadius: "6px",
                border: "1px solid #475569",
                background: "#1e293b",
                color: "#f8fafc",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Обновить
            </button>
          </div>
        </header>

        {/* Локальный AI-помощник (Ollama) */}
        <section
          style={{
            background: "#1e293b",
            padding: "18px",
            borderRadius: "12px",
            border: "1px solid #334155",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "17px" }}>
              🤖 Локальный AI-помощник по Армении ({AI_MODEL})
            </h2>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {[
                "Где сейчас лучшая погода и чистый воздух?",
                "Сколько AMD выйдет за 250 USD по покупке?",
                "Куда съездить на 1 день из Еревана?",
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setAiQuestion(preset);
                    askLocalAi(preset);
                  }}
                  style={{
                    padding: "5px 10px",
                    borderRadius: "6px",
                    border: "1px solid #475569",
                    background: "#0f172a",
                    color: "#cbd5e1",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && askLocalAi()}
              placeholder="Спроси про курсы AMD, погоду в марзах, воздух или поездку по Армении..."
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #475569",
                background: "#0f172a",
                color: "#f8fafc",
              }}
            />
            <button
              type="button"
              onClick={() => askLocalAi()}
              disabled={aiLoading}
              style={{
                padding: "10px 18px",
                borderRadius: "8px",
                border: "none",
                background: aiLoading ? "#475569" : "#2563eb",
                color: "#fff",
                fontWeight: 600,
                cursor: aiLoading ? "not-allowed" : "pointer",
              }}
            >
              {aiLoading ? "Думает..." : "Спросить"}
            </button>
          </div>

          {aiError && (
            <p style={{ color: "#f87171", margin: "12px 0 0", fontSize: "14px" }}>
              Ошибка: {aiError}
            </p>
          )}

          {aiAnswer && (
            <div
              style={{
                marginTop: "12px",
                padding: "12px 14px",
                borderRadius: "8px",
                background: "#0f172a",
                color: "#e2e8f0",
                fontSize: "14px",
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
              }}
            >
              {aiAnswer}
            </div>
          )}
        </section>

        {/* Блок 1: Таблица Покупка / Продажа + калькулятор */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              background: "#1e293b",
              padding: "18px",
              borderRadius: "12px",
              border: "1px solid #334155",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "12px", fontSize: "17px" }}>
              💱 Курсы обмена: Покупка / Продажа (AMD)
            </h2>

            {fxError ? (
              <p style={{ color: "#f87171", margin: 0 }}>Ошибка: {fxError}</p>
            ) : Object.keys(midRates).length === 0 ? (
              <p style={{ color: "#94a3b8", margin: 0 }}>Загрузка курсов...</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "14px",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid #334155",
                        color: "#94a3b8",
                        textAlign: "left",
                      }}
                    >
                      <th style={{ padding: "8px 6px" }}>Валюта</th>
                      <th style={{ padding: "8px 6px", textAlign: "right" }}>
                        Покупка
                      </th>
                      <th style={{ padding: "8px 6px", textAlign: "right" }}>
                        Продажа
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {EXCHANGE_CURRENCIES.map((curr) => {
                      const { buy, sell } = getBuySellForCurrency(curr.code);
                      return (
                        <tr
                          key={curr.code}
                          style={{
                            borderBottom: "1px solid #283548",
                          }}
                        >
                          <td style={{ padding: "9px 6px", fontWeight: 700 }}>
                            {curr.label}
                          </td>
                          <td
                            style={{
                              padding: "9px 6px",
                              textAlign: "right",
                              color: "#4ade80",
                              fontWeight: 600,
                            }}
                          >
                            {formatRate(buy)}
                          </td>
                          <td
                            style={{
                              padding: "9px 6px",
                              textAlign: "right",
                              color: "#38bdf8",
                              fontWeight: 600,
                            }}
                          >
                            {formatRate(sell)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div
            style={{
              background: "#1e293b",
              padding: "18px",
              borderRadius: "12px",
              border: "1px solid #334155",
              alignSelf: "start",
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: "17px" }}>
              🧮 Калькулятор обмена
            </h2>

            <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
              <button
                type="button"
                onClick={() => setQuoteType("buy")}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  background: quoteType === "buy" ? "#16a34a" : "#0f172a",
                  color: "#fff",
                  fontWeight: 600,
                }}
              >
                Покупка ({formatRate(selectedQuotes.buy)})
              </button>
              <button
                type="button"
                onClick={() => setQuoteType("sell")}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  background: quoteType === "sell" ? "#0284c7" : "#0f172a",
                  color: "#fff",
                  fontWeight: 600,
                }}
              >
                Продажа ({formatRate(selectedQuotes.sell)})
              </button>
            </div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <button
                type="button"
                onClick={() => setDirection("toAmd")}
                style={{
                  flex: 1,
                  padding: "7px",
                  borderRadius: "6px",
                  border: "1px solid #475569",
                  cursor: "pointer",
                  background: direction === "toAmd" ? "#334155" : "transparent",
                  color: "#f8fafc",
                  fontSize: "13px",
                }}
              >
                Валюта → AMD
              </button>
              <button
                type="button"
                onClick={() => setDirection("fromAmd")}
                style={{
                  flex: 1,
                  padding: "7px",
                  borderRadius: "6px",
                  border: "1px solid #475569",
                  cursor: "pointer",
                  background: direction === "fromAmd" ? "#334155" : "transparent",
                  color: "#f8fafc",
                  fontSize: "13px",
                }}
              >
                AMD → Валюта
              </button>
            </div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                style={{
                  padding: "8px 10px",
                  borderRadius: "6px",
                  border: "1px solid #475569",
                  background: "#0f172a",
                  color: "#f8fafc",
                }}
              >
                {EXCHANGE_CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.label}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="0"
                step="any"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="Сумма"
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #475569",
                  background: "#0f172a",
                  color: "#f8fafc",
                }}
              />
            </div>

            <div
              style={{
                padding: "12px",
                borderRadius: "8px",
                background: "#0f172a",
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              {direction === "toAmd"
                ? `${parsedAmount} ${selectedCurrency} = ${convertedValue} AMD`
                : `${parsedAmount} AMD = ${convertedValue} ${selectedCurrency}`}
            </div>
          </div>
        </section>

        {/* Блок 2: Криптовалюты в AMD + Маршруты по марзам и городам Армении */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              background: "#1e293b",
              padding: "18px",
              borderRadius: "12px",
              border: "1px solid #334155",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "12px", fontSize: "17px" }}>
              🪙 Криптовалюты в AMD
            </h2>

            {cryptoError ? (
              <p style={{ color: "#f87171", margin: 0 }}>Ошибка: {cryptoError}</p>
            ) : Object.keys(cryptoPrices).length === 0 ? (
              <p style={{ color: "#94a3b8", margin: 0 }}>
                Загрузка криптокурсов...
              </p>
            ) : (
              <div style={{ display: "grid", gap: "10px" }}>
                {CRYPTO_COINS.map((coin) => {
                  const info = cryptoPrices[coin.id];
                  const amdVal = info?.amd;
                  const usdVal = info?.usd;
                  return (
                    <div
                      key={coin.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        background: "#0f172a",
                      }}
                    >
                      <div>
                        <strong>{coin.symbol}</strong>{" "}
                        <span style={{ color: "#94a3b8", fontSize: "13px" }}>
                          {coin.name}
                        </span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700, color: "#a78bfa" }}>
                          {typeof amdVal === "number"
                            ? `${amdVal.toLocaleString("ru-RU")} AMD`
                            : "—"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                          {typeof usdVal === "number" ? `$${usdVal}` : ""}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div
            style={{
              background: "#1e293b",
              padding: "18px",
              borderRadius: "12px",
              border: "1px solid #334155",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "12px", fontSize: "17px" }}>
              🚗 Маршруты по марзам и городам Армении (OSRM)
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: "14px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    color: "#94a3b8",
                    marginBottom: "4px",
                  }}
                >
                  Откуда
                </label>
                <select
                  value={fromLocId}
                  onChange={(e) => setFromLocId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    border: "1px solid #475569",
                    background: "#0f172a",
                    color: "#f8fafc",
                  }}
                >
                  <optgroup label="Марзы и Ереван">
                    {regionLocations.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Города Армении">
                    {cityLocations.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    color: "#94a3b8",
                    marginBottom: "4px",
                  }}
                >
                  Куда
                </label>
                <select
                  value={toLocId}
                  onChange={(e) => setToLocId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    border: "1px solid #475569",
                    background: "#0f172a",
                    color: "#f8fafc",
                  }}
                >
                  <optgroup label="Марзы и Ереван">
                    {regionLocations.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Города Армении">
                    {cityLocations.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {routeError ? (
              <p style={{ color: "#f87171", margin: 0 }}>Ошибка: {routeError}</p>
            ) : routeLoading ? (
              <p style={{ color: "#94a3b8", margin: 0 }}>Расчёт маршрута...</p>
            ) : routeInfo ? (
              <div
                style={{
                  padding: "14px",
                  borderRadius: "8px",
                  background: "#0f172a",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Расстояние
                  </div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "#38bdf8",
                    }}
                  >
                    {routeInfo.distanceKm} км
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Примерное время на авто
                  </div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "#fbbf24",
                    }}
                  >
                    {routeInfo.durationText}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* Блок 3: Качество воздуха по категориям */}
        <section style={{ marginBottom: "28px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "19px" }}>
              🌬 Качество воздуха (AQI / PM2.5 / PM10) по категориям
            </h2>
            {renderCategoryTabs(airCategory, setAirCategory)}
          </div>

          {airError && (
            <p style={{ color: "#f87171", marginTop: 0 }}>{airError}</p>
          )}

          {airItems.length === 0 ? (
            !airError && (
              <p style={{ color: "#94a3b8" }}>Загрузка качества воздуха...</p>
            )
          ) : (
            <div style={{ display: "grid", gap: "20px" }}>
              {(airCategory === "all" || airCategory === "regions") && (
                <div>
                  <h3
                    style={{
                      margin: "0 0 12px",
                      fontSize: "16px",
                      color: "#93c5fd",
                    }}
                  >
                    Категория: Марзы и Ереван
                  </h3>
                  {renderAirGrid(regionsAir)}
                </div>
              )}

              {(airCategory === "all" || airCategory === "cities") && (
                <div>
                  <h3
                    style={{
                      margin: "0 0 12px",
                      fontSize: "16px",
                      color: "#93c5fd",
                    }}
                  >
                    Категория: Города Армении
                  </h3>
                  {renderAirGrid(citiesAir)}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Блок 4: Погода по категориям */}
        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "19px" }}>
              🌤 Погода по Армении (по категориям)
            </h2>
            {renderCategoryTabs(weatherCategory, setWeatherCategory)}
          </div>

          {weatherError && (
            <p style={{ color: "#f87171", marginTop: 0 }}>{weatherError}</p>
          )}

          {weatherItems.length === 0 ? (
            !weatherError && (
              <p style={{ color: "#94a3b8" }}>Загрузка погоды по категориям...</p>
            )
          ) : (
            <div style={{ display: "grid", gap: "24px" }}>
              {(weatherCategory === "all" || weatherCategory === "regions") && (
                <div>
                  <h3
                    style={{
                      margin: "0 0 12px",
                      fontSize: "16px",
                      color: "#93c5fd",
                    }}
                  >
                    Категория: Марзы и Ереван
                  </h3>
                  {renderWeatherGrid(regionsWeather)}
                </div>
              )}

              {(weatherCategory === "all" || weatherCategory === "cities") && (
                <div>
                  <h3
                    style={{
                      margin: "0 0 12px",
                      fontSize: "16px",
                      color: "#93c5fd",
                    }}
                  >
                    Категория: Города Армении
                  </h3>
                  {renderWeatherGrid(citiesWeather)}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
