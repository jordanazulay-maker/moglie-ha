import { normal_monkey as n_b64 } from './normal-monkey.js';
import { MOGLIE_TRANSLATIONS } from './moglie-localization.js';

// DYNAMIC ZERO-CONFIG PATH RESOLUTION:
// Automatically detects the installation path (HACS or Manual) and strips cache-busting query parameters.
const basePath = import.meta.url.replace(/moglie-card\.js.*$/, '');

const w_png = basePath + 'winter.png';
const r_png = basePath + 'rainy.png';
const s_png = basePath + 'summer.png';
const sw_png = basePath + 'sweaty.png';
const sl_png = basePath + 'sleepy.png';
const f_png = basePath + 'festive.png';
const f1_png = basePath + 'festive1.png';

class MoglieCard extends HTMLElement {
  static getConfigElement() { return document.createElement("moglie-card-editor"); }
  
  static getStubConfig() { 
    return { 
      use_wan: false, 
      use_alarm: false, 
      use_weather: false, 
      wan_entity: "", 
      alarm_entity: "", 
      weather_entity: "", 
      use_tap_entity: false,
      use_hold_entity: false,
      tap_entity: "", 
      hold_entity: "",
      enable_night_mode: true, 
      night_start: "", 
      night_end: "", 
      enable_typing: true,
      use_custom_quotes: false, 
      hide_moglie: false 
    }; 
  }

  getCardSize() {
    return 3; 
  }

  // Prevent memory leaks when the card is removed from the dashboard
  disconnectedCallback() {
    if (this._typeTimer) clearTimeout(this._typeTimer);
    if (this.pressTimer) clearTimeout(this.pressTimer);
  }

  setConfig(config) {
    this.config = { ...config };
    this._last = null;
    this._currentAlertEntity = null;
    
    if (!this.cont) {
      this.innerHTML = `
        <style>
          .anti-gravity { transform: rotate(180deg); }
          #m-cont { 
            padding: 16px; border-radius: 10px; text-align: center; transition: all 0.3s ease; 
            cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; 
            user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
          }
          #m-img { 
            width: 100%; max-width: 150px; height: auto; aspect-ratio: 1/1; object-fit: contain; 
            transition: transform 0.5s ease; z-index: 1; pointer-events: none;
          }
          #m-txt { margin-bottom: 15px; font-weight: bold; min-height: 3.5em; width: 95%; line-height: 1.4; color: var(--primary-text-color); display: flex; flex-direction: column; align-items: center; justify-content: center; }
          .rtl { direction: rtl; text-align: right; }
          .hidden { display: none !important; }
        </style>
        <ha-card>
          <div id="m-cont">
            <div id="m-txt"></div>
            <img id="m-img" src="${n_b64}" />
          </div>
        </ha-card>`;
      this.cont = this.querySelector('#m-cont');
      this.img = this.querySelector('#m-img');
      this.txt = this.querySelector('#m-txt');

      this.isHold = false;
      let isTouch = false;

      const startPress = () => {
        this.isHold = false;
        if (this.pressTimer) clearTimeout(this.pressTimer);
        this.pressTimer = setTimeout(() => {
          this.isHold = true;
          this.img.style.transform = "scale(1.1) rotate(-5deg)";
          setTimeout(() => { this.img.style.transform = "scale(1) rotate(0deg)"; }, 200);
          this.handleAct('hold');
        }, 500); 
      };

      const endPress = () => {
        if (this.pressTimer) clearTimeout(this.pressTimer);
      };

      this.cont.addEventListener('touchstart', () => { isTouch = true; startPress(); }, { passive: true });
      this.cont.addEventListener('touchend', endPress);
      this.cont.addEventListener('touchmove', endPress, { passive: true });
      this.cont.addEventListener('touchcancel', endPress);
      this.cont.addEventListener('mousedown', () => { if (!isTouch) startPress(); });
      this.cont.addEventListener('mouseup', () => { if (!isTouch) endPress(); });
      this.cont.addEventListener('mouseleave', () => { if (!isTouch) endPress(); });
      this.cont.addEventListener('contextmenu', (e) => e.preventDefault());

      this.cont.addEventListener('click', () => {
        if (this.isHold) return; 
        this.img.style.transform = "scale(1.1) rotate(5deg)";
        setTimeout(() => { this.img.style.transform = "scale(1) rotate(0deg)"; }, 200);
        this.handleAct('tap');
      });
    }
  }

  typeMessage(message) {
    if (this._typeTimer) clearTimeout(this._typeTimer);
    
    if (this.config.enable_typing === false) {
      this.txt.innerHTML = message;
      return;
    }

    let i = 0;
    const type = () => {
      if (i < message.length) {
        if (message.charAt(i) === '<') {
          let end = message.indexOf('>', i);
          i = end !== -1 ? end + 1 : i + 1;
        } else {
          i++;
        }
        this.txt.innerHTML = message.substring(0, i);
        this._typeTimer = setTimeout(type, 30);
      }
    };
    type();
  }

  showErr(m) {
    if (this._typeTimer) clearTimeout(this._typeTimer);
    this.img.setAttribute('src', n_b64);
    this.img.style.filter = "grayscale(100%) opacity(0.6)";
    this.txt.innerHTML = `<span style="color: #ff5252;">${m}</span>`;
    this.cont.style.border = "2px dashed #ff5252";
  }

  set hass(hass) {
    if (!this.config) return;
    const c = this.config;
    const lang = (hass.language || "en").split("-")[0];
    const defaultQuotes = MOGLIE_TRANSLATIONS[lang] || MOGLIE_TRANSLATIONS["en"];
    
    if (lang === "he" || lang === "ar") this.txt.classList.add('rtl'); else this.txt.classList.remove('rtl');
    if (c.hide_moglie) this.img.classList.add('hidden'); else this.img.classList.remove('hidden');

    const wan = (c.use_wan && c.wan_entity) ? hass.states[c.wan_entity] : null;
    const alrm = (c.use_alarm && c.alarm_entity) ? hass.states[c.alarm_entity] : null;
    const wthr = (c.use_weather && c.weather_entity) ? hass.states[c.weather_entity] : null;

    if ((c.use_wan && !wan) || (c.use_alarm && !alrm) || (c.use_weather && !wthr)) {
        return this.showErr(defaultQuotes.error || "Entity not found");
    }

    const wState = wan ? wan.state.toLowerCase() : 'on';
    const aState = alrm ? alrm.state.toLowerCase() : 'none';
    const weState = wthr ? wthr.state.toLowerCase() : 'unknown';

    const d = new Date();
    const hr = d.getHours();
    const month = d.getMonth(); 
    const day = d.getDate();

    const unit = hass.config?.unit_system?.temperature || '°C';

    // WEATHER LOGIC: Extract temp, humidity, and detect rain/thunder
    let t = null, h = null, isRain = false, isThunder = false;
    if (c.use_weather && wthr) {
      // Thunder logic taking precedence over simple rain
      isThunder = /(thunder|storm|lightning|tornado)/.test(weState);
      isRain = /(rain|pour|drizzle|shower)/.test(weState) && !isThunder; 
      
      t = parseFloat(wthr.attributes?.temperature ?? 70);
      h = parseFloat(wthr.attributes?.humidity ?? 0);
    }
    
    const isCold = t !== null && ((unit === '°F' && t < 50) || (unit !== '°F' && t < 10));
    const isHot = t !== null && ((unit === '°F' && t > 80) || (unit !== '°F' && t > 26));

    const sHash = `${wState}|${aState}|${weState}|${t}|${h}|${hr}|${month}|${day}|${lang}|${c.hide_moglie}`;
    if (this._last === sHash) return; 
    this._last = sHash;

    const wanOk = c.use_wan ? /on|connected|true/.test(wState) : true;
    const aOff = c.use_alarm ? /disarmed|off/.test(aState) : false;
    const aHome = c.use_alarm ? /home|stay|night/.test(aState) : false;

    // TIME LOGIC
    const nS = parseInt(c.night_start);
    const nE = parseInt(c.night_end);
    
    // Only calculate night mode if BOTH start and end times are valid numbers
    let isNight = false;
    if (!isNaN(nS) && !isNaN(nE)) {
      isNight = nS > nE ? (hr >= nS || hr < nE) : (hr >= nS && hr < nE);
    }
    
    const showNight = c.enable_night_mode !== false && isNight;

    const safeStr = (s) => s || "";

    let greet = "";
    if (!showNight) {
        if (hr < 11) greet = safeStr(defaultQuotes.morning);
        else if (hr >= 11 && hr < 17) greet = safeStr(defaultQuotes.afternoon);
        else greet = safeStr(defaultQuotes.evening); 
    }

    const uQ = c.use_custom_quotes;
    const checkQ = (key, defaultText, useGreet = false) => {
      if (uQ && typeof c[key] !== 'undefined') {
        return c[key] === "" ? "" : (useGreet ? greet + c[key] : c[key]);
      }
      return useGreet ? greet + safeStr(defaultText) : safeStr(defaultText);
    };

    // Cache-busting fallback for Thunder!
    const safeThunder = defaultQuotes.thunder || "Thunder and lightning! Grabbing my raincoat!";

    const q = {
      nice_day: (uQ && typeof c.quote_nice_day !== 'undefined') 
                  ? (c.quote_nice_day === "" ? "" : greet + c.quote_nice_day) 
                  : (greet ? greet.trim() : "Hello!"),
      off: checkQ('quote_offline', defaultQuotes.off),
      rain: checkQ('quote_rain', defaultQuotes.rain, true),
      thunder: checkQ('quote_thunder', safeThunder, false), // <--- FALSE ensures no greeting is prepended
      dis: checkQ('quote_disarmed', defaultQuotes.dis, true), 
      home: checkQ('quote_armed_home', defaultQuotes.home, true), 
      away: checkQ('quote_armed_away', defaultQuotes.away, true),
      night: checkQ('quote_night', defaultQuotes.night),
      hot: checkQ('quote_hot', defaultQuotes.hot, true),
      cold: checkQ('quote_cold', defaultQuotes.cold, true)
    };

    // n_b64 handles the base, but other states will use the loaded PNGs
    let outfit = n_b64, quote = "", border = "2px solid #4CAF50", isGrayscale = false;

    // Determine the most relevant entity to show on tap
    if (c.use_wan && !wanOk) { 
        outfit = n_b64; quote = q.off; border = "2px solid gray"; isGrayscale = true; 
        this._currentAlertEntity = c.wan_entity;
    } else if (showNight) { 
        outfit = sl_png; quote = q.night; border = "2px solid #673AB7"; 
        this._currentAlertEntity = c.alarm_entity || c.weather_entity || c.wan_entity;
    } else if (c.use_weather && isThunder) { 
        outfit = r_png; quote = q.thunder; border = "2px solid #607D8B"; // Rainy monkey + Stormy Blue-Grey border
        this._currentAlertEntity = c.weather_entity;
    } else if (c.use_weather && isRain) { 
        outfit = r_png; quote = q.rain; border = "2px solid #2196F3"; 
        this._currentAlertEntity = c.weather_entity;
    } else if (c.use_weather && isCold) { 
        outfit = w_png; quote = q.cold; border = "2px solid #00BCD4"; 
        this._currentAlertEntity = c.weather_entity;
    } else if (c.use_weather && isHot) { 
        outfit = (h !== null && h > 70) ? sw_png : s_png; quote = q.hot; border = "2px solid #FF9800"; 
        this._currentAlertEntity = c.weather_entity;
    } else if (c.use_alarm) { 
        if (aOff) { 
            outfit = n_b64; quote = q.dis; border = "2px solid orange"; 
        } else if (!aHome) {
            outfit = n_b64; quote = q.away; border = "2px solid #F44336";
        } else {
            outfit = n_b64; quote = q.home; border = "2px solid #4CAF50";
        }
        this._currentAlertEntity = c.alarm_entity;
    } else {
      outfit = n_b64; 
      border = "2px solid #4CAF50";
      quote = q.nice_day;
      this._currentAlertEntity = c.alarm_entity || c.weather_entity || c.wan_entity || null;
    }

    let patrolTxt = "";
    if (c.use_alarm && alrm && wanOk) {
      if (aHome) patrolTxt = `<br><small style="color:#4CAF50;">${safeStr(defaultQuotes.p_patrol)}</small>`;
      else if (aOff) patrolTxt = `<br><small style="color:orange;">${safeStr(defaultQuotes.p_off)}</small>`;
      else patrolTxt = `<br><small style="color:#F44336;">${safeStr(defaultQuotes.p_alert)}</small>`;
    }

    if (month === 9 && day === 31) { 
        outfit = f1_png;
    } else if (month === 11 && day === 25) { 
        outfit = f_png; 
    }

    this.img.src = outfit;
    this.img.style.filter = isGrayscale ? "grayscale(100%)" : "none";
    this.cont.style.border = border;
    this.typeMessage(quote + patrolTxt);
  }
  
  handleAct(a) {
    const act = this.config[a + '_action'];
    
    // Provide a logical fallback so HA always has an entity to default to
    let targetEntity = this._currentAlertEntity || this.config.alarm_entity || this.config.wan_entity || ""; 

    if (a === 'tap' && this.config.use_tap_entity) targetEntity = this.config.tap_entity;
    if (a === 'hold' && this.config.use_hold_entity) targetEntity = this.config.hold_entity;
    
    const actionConfig = { ...this.config };
    
    // Only assign the entity if it isn't an empty string
    if (targetEntity) {
      actionConfig.entity = targetEntity;
    }
    
    if (act && act.action && act.action !== 'none') {
      this.dispatchEvent(new CustomEvent('hass-action', {
        bubbles: true,
        composed: true,
        detail: { config: actionConfig, action: a }
      }));
    } 
    else if (!act && a === 'tap' && this._currentAlertEntity) {
      // Improved Fallback: Dynamic more-info popup based on current state
      this.dispatchEvent(new CustomEvent('hass-more-info', { 
        bubbles: true, 
        composed: true, 
        detail: { entityId: this._currentAlertEntity } 
      }));
    }
  }
}

class MoglieCardEditor extends HTMLElement {
  setConfig(config) { 
    // Create virtual arrays for the dropdowns based on the booleans
    const active_features = [];
    if (config.use_wan) active_features.push("wan");
    if (config.use_alarm) active_features.push("alarm");
    if (config.use_weather) active_features.push("weather");

    const advanced_features = [];
    if (config.use_tap_entity) advanced_features.push("tap");
    if (config.use_hold_entity) advanced_features.push("hold");
    if (config.enable_night_mode !== false) advanced_features.push("night"); // defaults to true
    if (config.hide_moglie) advanced_features.push("stealth");
    if (config.enable_typing !== false) advanced_features.push("typing"); // defaults to true
    if (config.use_custom_quotes) advanced_features.push("quotes");

    this._cfg = { ...config, active_features, advanced_features }; 
    this.render(); 
  }
  
  set hass(hass) { 
    this._h = hass;
    const lang = (hass.language || "en").split("-")[0];
    if (lang === "he" || lang === "ar") this.style.direction = "rtl";
    if (this._f) this._f.hass = hass;
    this.render();
  }

  _computeSchema() {
    const c = this._cfg || {};
    const feats = c.active_features || []; 
    const adv = c.advanced_features || []; 
    
    return [
      {
        name: "active_features",
        label: "Active Core Features",
        selector: {
          select: {
            multiple: true,
            mode: "dropdown",
            options: [
              { label: "Internet / WAN Monitor", value: "wan" },
              { label: "Security Alarm", value: "alarm" },
              { label: "Weather", value: "weather" }
            ]
          }
        }
      },
      // Conditional Core Entities
      ...(feats.includes("wan") ? [{ name: "wan_entity", label: "WAN Entity (Binary Sensor)", selector: { entity: { domain: "binary_sensor" } } }] : []),
      ...(feats.includes("alarm") ? [{ name: "alarm_entity", label: "Alarm Entity", selector: { entity: { domain: "alarm_control_panel" } } }] : []),
      ...(feats.includes("weather") ? [{ name: "weather_entity", label: "Weather Entity", selector: { entity: { domain: "weather" } } }] : []),
      
      // Standard Actions (Always visible)
      {
        type: "grid",
        name: "",
        schema: [
          { name: "tap_action", label: "Tap Action", selector: { ui_action: {} } },
          { name: "hold_action", label: "Hold Action", selector: { ui_action: {} } }
        ]
      },

      // Advanced Options Dropdown
      {
        name: "advanced_features",
        label: "Advanced Options",
        selector: {
          select: {
            multiple: true,
            mode: "dropdown",
            options: [
              { label: "Use Custom Tap Entity", value: "tap" },
              { label: "Use Custom Hold Entity", value: "hold" },
              { label: "Enable Night Mode", value: "night" },
              { label: "Hide Moglie (Stealth Mode)", value: "stealth" },
              { label: "Enable Typing Animation", value: "typing" },
              { label: "Enable Custom Quotes", value: "quotes" }
            ]
          }
        }
      },

      // Conditional Custom Entities
      ...(adv.includes("tap") || adv.includes("hold") ? [
        {
          type: "grid",
          name: "",
          schema: [
            ...(adv.includes("tap") ? [{ name: "tap_entity", label: "Custom Tap Entity", selector: { entity: {} } }] : []),
            ...(adv.includes("hold") ? [{ name: "hold_entity", label: "Custom Hold Entity", selector: { entity: {} } }] : [])
          ]
        }
      ] : []),

      // Conditional Night Mode settings
      ...(adv.includes("night") ? [
        {
          type: "grid",
          name: "",
          schema: [
            { name: "night_start", label: "Night Mode Start (Hour)", selector: { number: { min: 0, max: 23, mode: "box" } } },
            { name: "night_end", label: "Night Mode End (Hour)", selector: { number: { min: 0, max: 23, mode: "box" } } }
          ]
        }
      ] : []),

      // Conditional Custom Quotes settings
      ...(adv.includes("quotes") ? [
        {
          type: "grid",
          name: "",
          schema: [
            { name: "quote_nice_day", label: "Quote: Nice Day", selector: { text: {} } },
            { name: "quote_offline", label: "Quote: Offline", selector: { text: {} } },
            { name: "quote_rain", label: "Quote: Rain", selector: { text: {} } },
            { name: "quote_thunder", label: "Quote: Thunder", selector: { text: {} } }, 
            { name: "quote_cold", label: "Quote: Cold", selector: { text: {} } },
            { name: "quote_hot", label: "Quote: Hot", selector: { text: {} } },
            { name: "quote_disarmed", label: "Quote: Disarmed", selector: { text: {} } },
            { name: "quote_armed_home", label: "Quote: Armed Home", selector: { text: {} } },
            { name: "quote_armed_away", label: "Quote: Armed Away", selector: { text: {} } },
            { name: "quote_night", label: "Quote: Night", selector: { text: {} } }
          ]
        }
      ] : [])
    ];
  }
  
  render() {
    if (!this._h) return;
    if (this._f) {
      this._f.data = this._cfg;
      this._f.schema = this._computeSchema(); 
      return;
    }
    this._f = document.createElement("ha-form");
    this._f.hass = this._h;
    this._f.data = this._cfg;
    this._f.schema = this._computeSchema();
    
    // GUARANTEE: If a field somehow doesn't get our explicit label, format it beautifully anyway
    this._f.computeLabel = (s) => s.label || s.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    
    this._f.addEventListener("value-changed", (e) => {
      const newConfig = { ...e.detail.value };
      
      const feats = newConfig.active_features || [];
      newConfig.use_wan = feats.includes("wan");
      newConfig.use_alarm = feats.includes("alarm");
      newConfig.use_weather = feats.includes("weather");
      delete newConfig.active_features;

      const adv = newConfig.advanced_features || [];
      newConfig.use_tap_entity = adv.includes("tap");
      newConfig.use_hold_entity = adv.includes("hold");
      newConfig.enable_night_mode = adv.includes("night");
      newConfig.hide_moglie = adv.includes("stealth");
      newConfig.enable_typing = adv.includes("typing");
      newConfig.use_custom_quotes = adv.includes("quotes");
      delete newConfig.advanced_features;

      this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: newConfig }, bubbles: true, composed: true }));
    });
    this.appendChild(this._f);
  }
}

customElements.define("moglie-card-editor", MoglieCardEditor);
customElements.define('moglie-card', MoglieCard);

window.customCards = window.customCards || [];
window.customCards.push({ type: "moglie-card", name: "Moglie HA", description: "Smart Mascot Monitor", preview: true });
