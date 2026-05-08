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
      night_start: 22,
      night_end: 6
    };
  }

  setConfig(config) {
    this.config = config;

    if (!this.content) {
      this.innerHTML = `
        <style>
          .anti-gravity { transform: rotate(180deg); }
        </style>
        <ha-card>
          <div id="moglie-container" style="padding: 16px; border-radius: 10px; text-align: center; transition: all 0.3s ease; cursor: pointer;">
            <img id="moglie-image" data-img-src="normal" style="width: 150px; height: 150px; object-fit: contain; transition: transform 0.5s ease;" />
            <div id="moglie-text" class="text-box" style="margin-top: 10px; font-weight: bold; min-height: 2em;"></div>
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

    // VALIDATION: Check if at least one entity is configured
    if (!config.wan_entity && !config.alarm_entity && !config.weather_entity) {
      this.showError("⚠️ Please configure at least one entity (WAN, Alarm, or Weather) in the Visual Editor.");
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
    if (!this.config.wan_entity && !this.config.alarm_entity && !this.config.weather_entity) return;

    // Fetch states safely
    const wanEntity = this.config.wan_entity ? hass.states[this.config.wan_entity] : null;
    const alarmEntity = this.config.alarm_entity ? hass.states[this.config.alarm_entity] : null;
    const weatherEntity = this.config.weather_entity ? hass.states[this.config.weather_entity] : null;

    // Default values if entities are missing
    const wanState = wanEntity ? String(wanEntity.state).toLowerCase() : 'on';
    const alarmState = alarmEntity ? String(alarmEntity.state).toLowerCase() : 'disarmed';
    const weatherState = weatherEntity ? String(weatherEntity.state).toLowerCase() : 'unknown';
    
    const isWanActive = wanState === 'on' || wanState === 'connected' || wanState === 'true'; 
    const isOffState = alarmState.includes('disarmed') || alarmState === 'off';
    const isHomeState = alarmState.includes('home') || alarmState.includes('night') || alarmState.includes('stay') || alarmState.includes('partial');

    // Logic for Time/Holidays
    const currentHour = new Date().getHours();
    const d = new Date();
    const isChristmas = d.getMonth() === 11 && (d.getDate() === 24 || d.getDate() === 25); 
    const isAprilFools = d.getMonth() === 3 && d.getDate() === 1;
    const nightStart = parseInt(this.config.night_start) || 22;
    const nightEnd = parseInt(this.config.night_end) || 6;
    const isNightMode = nightStart > nightEnd ? (currentHour >= nightStart || currentHour < nightEnd) : (currentHour >= nightStart && currentHour < nightEnd);

    // Weather Logic
    const isRaining = weatherState.includes('rain') || weatherState.includes('pour') || weatherState.includes('shower') || weatherState.includes('storm');
    let temp = null;
    if (weatherEntity?.attributes?.temperature !== undefined) {
      temp = parseFloat(weatherEntity.attributes.temperature);
    }

    const unitStr = weatherEntity?.attributes?.temperature_unit || 'F';
    const isF = unitStr.toUpperCase().includes('F');
    const isC = unitStr.toUpperCase().includes('C');
    const isSnowing = ['snowy', 'snowy-rainy', 'hail'].includes(weatherState);
    const isHot = temp !== null && ((isF && temp >= 80) || (isC && temp >= 27));
    const isCold = temp !== null && ((isF && temp < 50) || (isC && temp < 10));
    const showWinter = isSnowing || isCold;

    const statusKey = `${wanState}-${alarmState}-${isNightMode}-${isRaining}-${isHot}-${showWinter}-${isChristmas}-${isAprilFools}`;
    if (this._lastStatus === statusKey) return; 
    this._lastStatus = statusKey;

    const quotes = {
      offline: this.config.quote_offline || "Moglie is stranded. The WAN connection has been lost!",
      cold: this.config.quote_cold || "Brrr! It's freezing out there!",
      rain: this.config.quote_rain || "Looks like rain, grabbing my coat!",
      hot: this.config.quote_hot || "It's boiling! Need a banana smoothie.",
      night: this.config.quote_night || "Zzz... Moglie is sleeping...",
      disarmed: this.config.quote_disarmed || "System's off! The rest of the primates ditched their post for a banana run.",
      armedHome: this.config.quote_armed_home || "Welcome Home! The WAN is strong. Tell me you brought more bananas!",
      armedAway: this.config.quote_armed_away || "The rest of the primates are on patrol. I'll watch the trees!"
    };

    // Border logic: prioritize Alarm, fallback to Gray if no entities exist
    let alarmBorder = "2px solid var(--disabled-text-color, gray)"; 
    if (alarmEntity) {
      if (isOffState) alarmBorder = "2px solid var(--warning-color, orange)";
      else if (isHomeState) alarmBorder = "2px solid var(--success-color, green)";
      else alarmBorder = "2px solid var(--error-color, red)";
    } else if (wanEntity || weatherEntity) {
      alarmBorder = "2px solid var(--primary-color, #03a9f4)";
    }

    const patrolStatus = (isOffState || isHomeState) ? "The primates haven't started their patrol." : "The primates are on patrol.";
    const fullNightQuote = `${quotes.night}<br><span style="font-size: 0.85em; font-weight: normal; opacity: 0.8;">(${patrolStatus})</span>`;

    this.image.style.filter = "none"; 
    if (isAprilFools) this.image.classList.add('anti-gravity'); else this.image.classList.remove('anti-gravity');

    // UI Priority Tree
    if (wanEntity && !isWanActive) {
      this.updateUI('normal', normal_b64, quotes.offline, "2px solid var(--disabled-text-color, gray)");
      this.image.style.filter = "grayscale(100%)";
    } else if (isAprilFools) {
      this.updateUI('normal', normal_b64, "Why is the blood rushing to my head?", alarmBorder);
    } else if (isChristmas) {
      this.updateUI('festive', festive_b64, "Merry Christmas!", alarmBorder);
    } else if (isNightMode) {
      this.updateUI('sleepy', sleepy_b64, fullNightQuote, "2px solid #673AB7");
    } else if (weatherEntity && isRaining) {
      this.updateUI('rainy', rainy_b64, quotes.rain, "2px solid #2196F3");
    } else if (weatherEntity && showWinter) {
      this.updateUI('winter', winter_b64, quotes.cold, "2px solid #00BCD4");
    } else if (weatherEntity && isHot) {
      this.updateUI('summer', summer_b64, quotes.hot, "2px solid #FF9800"); 
    } else if (alarmEntity && isOffState) {
      this.updateUI('normal', normal_b64, quotes.disarmed, alarmBorder);
    } else if (alarmEntity && isHomeState) {
      this.updateUI('normal', normal_b64, quotes.armedHome, alarmBorder);
    } else if (alarmEntity) {
      this.updateUI('normal', normal_b64, quotes.armedAway, alarmBorder);
    } else {
      // Default state if only WAN is active or entities are idle
      this.updateUI('normal', normal_b64, "Everything looks good!", alarmBorder);
    }
  }

  updateUI(monkeyKey, base64Data, text, borderStyle) {
    if (this.image.getAttribute('data-img-src') !== monkeyKey) {
      this.image.setAttribute('data-img-src', monkeyKey);
      this.image.src = base64Data; 
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
      { name: "night_start", selector: { number: { min: 0, max: 23, mode: "box" } } },
      { name: "night_end", selector: { number: { min: 0, max: 23, mode: "box" } } }
    ];
    this._form.addEventListener("value-changed", (ev) => {
      this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: ev.detail.value }, bubbles: true, composed: true }));
    });
    this.appendChild(this._form);
  }
}
customElements.define("moglie-card-editor", MoglieCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "moglie-card",
  name: "Moglie HA",
  description: "Moglie monitors your status with flexible entity configuration."
});
