import { normal_monkey as normal_b64 } from './normal-monkey.js';
import { winter_monkey as winter_b64 } from './winter-monkey.js';
import { rainy_monkey as rainy_b64 } from './rainy-monkey.js';
import { summer_monkey as summer_b64 } from './summer-monkey.js';
import { sleepy_monkey as sleepy_b64 } from './sleepy-monkey.js';
import { festive_monkey as festive_b64 } from './festive-monkey.js';

/* -------------------------------------------------------------------
   MAIN CARD COMPONENT
------------------------------------------------------------------- */
class MoglieCard extends HTMLElement {
  
  static getConfigElement() {
    return document.createElement("moglie-card-editor");
  }

  static getStubConfig() {
    return { 
      wan_entity: "", 
      alarm_entity: "", 
      weather_entity: "", 
      enable_night_mode: true,
      night_start: 22, 
      night_end: 6 
    };
  }

  setConfig(config) {
    this.config = config;

    if (!this.content) {
      this.innerHTML = `
        <ha-card>
          <div id="moglie-container" style="padding: 16px; border-radius: 10px; text-align: center; transition: all 0.3s ease; cursor: pointer;">
            <img id="moglie-image" data-img-src="normal" style="width: 150px; height: 150px; object-fit: contain; transition: transform 0.5s ease;" />
            <div id="moglie-text" style="margin-top: 10px; font-weight: bold; min-height: 2em;"></div>
          </div>
        </ha-card>
      `;
      this.container = this.querySelector('#moglie-container');
      this.image = this.querySelector('#moglie-image');
      this.content = this.querySelector('#moglie-text');
      this.image.src = normal_b64;

      this.container.addEventListener('click', () => {
        if (!this.config || !this.config.alarm_entity) return;
        this.dispatchEvent(new CustomEvent('hass-more-info', {
          bubbles: true, composed: true, detail: { entityId: this.config.alarm_entity }
        }));
      });
    }

    if (!config.wan_entity && !config.alarm_entity && !config.weather_entity) {
      this.showError("⚠️ Please configure at least one entity (WAN, Alarm, or Weather).");
    }
  }

  showError(message) {
    this.content.innerHTML = `<div style="margin-bottom: 12px;">${message}</div>`;
    this.container.style.border = "2px dashed var(--error-color, red)";
    this.image.src = normal_b64;
    this.image.style.filter = "grayscale(100%)";
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.config) return;

    // 1. Fetch states safely
    const hasWan = this.config.wan_entity && hass.states[this.config.wan_entity];
    const hasAlarm = this.config.alarm_entity && hass.states[this.config.alarm_entity];
    const hasWeather = this.config.weather_entity && hass.states[this.config.weather_entity];

    if (!hasWan && !hasAlarm && !hasWeather) return;

    const wanEntity = hasWan ? hass.states[this.config.wan_entity] : null;
    const alarmEntity = hasAlarm ? hass.states[this.config.alarm_entity] : null;
    const weatherEntity = hasWeather ? hass.states[this.config.weather_entity] : null;

    const wanState = hasWan ? String(wanEntity.state).toLowerCase() : 'on';
    const alarmState = hasAlarm ? String(alarmEntity.state).toLowerCase() : 'disarmed';
    const weatherState = hasWeather ? String(weatherEntity.state).toLowerCase() : 'unknown';

    const isWanActive = wanState === 'on' || wanState === 'connected' || wanState === 'true';
    const isOffState = alarmState.includes('disarmed') || alarmState === 'off';
    const isHomeState = alarmState.includes('home') || alarmState.includes('night') || alarmState.includes('stay');

    // 2. Weather Logic
    const isRaining = weatherState.includes('rain') || weatherState.includes('pour') || weatherState.includes('shower') || weatherState.includes('storm');
    
    let temp = null;
    let isF = true, isC = false;
    
    if (hasWeather) {
      if (weatherEntity.attributes && weatherEntity.attributes.temperature !== undefined) {
        temp = parseFloat(weatherEntity.attributes.temperature);
      } else if (!isNaN(parseFloat(weatherState))) {
        temp = parseFloat(weatherState);
      }
      let unitStr = weatherEntity.attributes?.temperature_unit || weatherEntity.attributes?.unit_of_measurement || 'F';
      isF = String(unitStr).toUpperCase().includes('F');
      isC = String(unitStr).toUpperCase().includes('C');
    }

    const isSnowing = ['snowy', 'snowy-rainy', 'hail'].includes(weatherState);
    const isHot = temp !== null && ((isF && temp >= 80) || (isC && temp >= 27));
    const isCold = temp !== null && ((isF && temp < 50) || (isC && temp < 10));
    const showWinter = isSnowing || isCold;

    // 3. LEVEL 2: Time Intelligence & Holidays
    const d = new Date();
    const currentHour = d.getHours();
    const currentDay = d.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = currentDay === 0 || currentDay === 6;

    const isChristmas = d.getMonth() === 11 && (d.getDate() === 24 || d.getDate() === 25); 
    const isAprilFools = d.getMonth() === 3 && d.getDate() === 1;

    const nightStart = parseInt(this.config.night_start) || 22;
    const nightEnd = parseInt(this.config.night_end) || 6;
    let isNightTime = nightStart > nightEnd ? (currentHour >= nightStart || currentHour < nightEnd) : (currentHour >= nightStart && currentHour < nightEnd);
    const showNight = (this.config.enable_night_mode !== false) && isNightTime;

    // 4. Cache check to prevent freezing
    const configHash = JSON.stringify(this.config);
    const statusKey = `${wanState}-${alarmState}-${weatherState}-${showNight}-${isChristmas}-${isAprilFools}-${currentHour}-${configHash}`;
    if (this._lastStatus === statusKey) return; 
    this._lastStatus = statusKey;

    // 5. Build Dynamic Time Greetings
    let timeGreeting = "";
    if (!showNight && !isChristmas && !isAprilFools) {
      if (currentHour >= 6 && currentHour < 11) {
        timeGreeting = isWeekend ? "Lazy weekend morning! " : "Good morning! I need a banana coffee. ";
      } else if (currentHour >= 11 && currentHour < 17) {
        timeGreeting = isWeekend ? "Weekend vibes! " : "Afternoon watch is clear. ";
      } else if (currentHour >= 17 && currentHour < nightStart) {
        timeGreeting = "Sun's getting low. ";
      }
    }

    // 6. Build The Pack vs Primates Quotes
    let nightText = "";
    if (hasAlarm) {
      if (isHomeState) nightText = "The pack is sleeping safely. <br><small style='opacity: 0.8;'>(The primates are on night patrol.)</small>";
      else if (isOffState) nightText = "The pack is sleeping... <br><small style='color: orange;'>(But the primates are off duty! Who is watching the trees?!)</small>";
      else nightText = "The pack is away. <br><small style='opacity: 0.8;'>(The primates hold the night watch.)</small>";
    } else {
      nightText = "The pack is sleeping...";
    }
    const fullNightQuote = this.config.quote_night || nightText;

    let armedHomeText = isWeekend ? "The pack is relaxing at home. " : "The pack is home. ";
    armedHomeText += "The primates are on perimeter patrol.";
    let disarmedText = "System's off! The primates ditched their post for a banana run.";

    const quotes = {
      offline: this.config.quote_offline || "Moglie is stranded. The WAN connection has been lost!",
      cold: this.config.quote_cold || "Brrr! It's freezing out there!",
      rain: this.config.quote_rain || "Looks like rain, grabbing my coat!",
      hot: this.config.quote_hot || "It's boiling! Need a banana smoothie.",
      disarmed: this.config.quote_disarmed || `${timeGreeting}${disarmedText}`,
      armedHome: this.config.quote_armed_home || `${timeGreeting}${armedHomeText}`,
      armedAway: this.config.quote_armed_away || "The pack is away. The primates are watching the trees!"
    };

    // 7. Set Borders
    let dynamicBorder = "2px solid var(--primary-color, #03a9f4)";
    if (hasAlarm) {
      dynamicBorder = isOffState ? "2px solid var(--warning-color, orange)" : (isHomeState ? "2px solid var(--success-color, green)" : "2px solid var(--error-color, red)");
    }

    this.image.style.filter = "none";
    if (isAprilFools) this.image.classList.add('anti-gravity'); else this.image.classList.remove('anti-gravity');
    
    // 8. Priority rendering tree
    if (hasWan && !isWanActive) {
      this.updateUI('normal', normal_b64, quotes.offline, "2px solid var(--disabled-text-color, gray)");
      this.image.style.filter = "grayscale(100%)";
    } else if (isAprilFools) {
      this.updateUI('normal', normal_b64, "Why is the blood rushing to my head?", dynamicBorder);
    } else if (isChristmas) {
      this.updateUI('festive', festive_b64, "Merry Christmas to the pack!", dynamicBorder);
    } else if (showNight) {
      this.updateUI('sleepy', sleepy_b64, fullNightQuote, "2px solid #673AB7");
    } else if (hasWeather && isRaining) {
      this.updateUI('rainy', rainy_b64, quotes.rain, "2px solid #2196F3");
    } else if (hasWeather && showWinter) {
      this.updateUI('winter', winter_b64, quotes.cold, "2px solid #00BCD4");
    } else if (hasWeather && isHot) {
      this.updateUI('summer', summer_b64, quotes.hot, "2px solid #FF9800"); 
    } else if (hasAlarm) {
      const text = isOffState ? quotes.disarmed : (isHomeState ? quotes.armedHome : quotes.armedAway);
      this.updateUI('normal', normal_b64, text, dynamicBorder);
    } else {
      this.updateUI('normal', normal_b64, "Moglie is standing by!", dynamicBorder);
    }
  }

  updateUI(monkeyKey, imgBase64, text, borderStyle) {
    if (this.image.getAttribute('data-img-src') !== monkeyKey) {
      this.image.setAttribute('data-img-src', monkeyKey);
      this.image.src = imgBase64;
    }
    this.content.innerHTML = text;
    this.container.style.border = borderStyle;
  }
}
customElements.define('moglie-card', MoglieCard);

/* -------------------------------------------------------------------
   VISUAL EDITOR COMPONENT
------------------------------------------------------------------- */
class MoglieCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    if (this._form) this._form.data = config; else this.render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._form) this._form.hass = hass; else this.render();
  }

  render() {
    if (!this._hass || !this._config || this._form) return;
    this._form = document.createElement("ha-form");
    this._form.hass = this._hass;
    this._form.data = this._config;

    this._form.schema = [
      { name: "wan_entity", selector: { entity: { domain: "binary_sensor" } } },
      { name: "alarm_entity", selector: { entity: { domain: "alarm_control_panel" } } },
      { name: "weather_entity", selector: { entity: { domain: "weather" } } },
      { name: "enable_night_mode", label: "Enable Night Mode", selector: { boolean: {} } },
      { name: "night_start", selector: { number: { min: 0, max: 23, mode: "box" } } },
      { name: "night_end", selector: { number: { min: 0, max: 23, mode: "box" } } },
      { name: "quote_offline", selector: { text: {} } },
      { name: "quote_disarmed", selector: { text: {} } },
      { name: "quote_armed_home", selector: { text: {} } },
      { name: "quote_armed_away", selector: { text: {} } },
      { name: "quote_night", selector: { text: {} } },
      { name: "quote_hot", selector: { text: {} } },
      { name: "quote_cold", selector: { text: {} } },
      { name: "quote_rain", selector: { text: {} } }
    ];

    this._form.computeLabel = (schema) => {
      const labels = {
        wan_entity: "WAN Entity (binary_sensor)",
        alarm_entity: "Alarm Entity (alarm_control_panel)",
        weather_entity: "Weather Entity (weather)",
        enable_night_mode: "Enable Night Mode (Sleepy Monkey)",
        night_start: "Night Mode Start Hour (0-23)",
        night_end: "Night Mode End Hour (0-23)",
        quote_offline: "Custom Quote: WAN Offline",
        quote_disarmed: "Custom Quote: Disarmed",
        quote_armed_home: "Custom Quote: Armed Home",
        quote_armed_away: "Custom Quote: Armed Away",
        quote_night: "Custom Quote: Night Mode",
        quote_hot: "Custom Quote: Hot Weather",
        quote_cold: "Custom Quote: Cold Weather",
        quote_rain: "Custom Quote: Rainy Weather"
      };
      return labels[schema.name] || schema.name;
    };

    this._form.addEventListener("value-changed", (ev) => {
      this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: ev.detail.value }, bubbles: true, composed: true }));
    });
    this.appendChild(this._form);
  }
}
customElements.define("moglie-card-editor", MoglieCardEditor);

/* -------------------------------------------------------------------
   CARD REGISTRATION (Required to show up in Dashboard)
------------------------------------------------------------------- */
window.customCards = window.customCards || [];
window.customCards.push({
  type: "moglie-card",
  name: "Moglie HA",
  description: "Moglie monitors your WAN, Weather, and Security state with Time Intelligence.",
  preview: true
});
