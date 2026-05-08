import { normal_monkey as normal_b64 } from './normal-monkey.js';
import { winter_monkey as winter_b64 } from './winter-monkey.js';
import { rainy_monkey as rainy_b64 } from './rainy-monkey.js';
import { summer_monkey as summer_b64 } from './summer-monkey.js';
import { sleepy_monkey as sleepy_b64 } from './sleepy-monkey.js';
import { festive_monkey as festive_b64 } from './festive-monkey.js';

class MoglieCard extends HTMLElement {
  static getConfigElement() { return document.createElement("moglie-card-editor"); }
  
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
            <img id="moglie-image" style="width: 150px; height: 150px; object-fit: contain;" />
            <div id="moglie-text" style="margin-top: 10px; font-weight: bold; min-height: 2em;"></div>
          </div>
        </ha-card>`;
      this.container = this.querySelector('#moglie-container');
      this.image = this.querySelector('#moglie-image');
      this.content = this.querySelector('#moglie-text');
      this.image.src = normal_b64;
    }

    if (!config.wan_entity && !config.alarm_entity && !config.weather_entity) {
      this.showError("⚠️ Configure at least one entity (WAN, Alarm, or Weather).");
    }
  }

  showError(message) {
    this.content.innerHTML = message;
    this.container.style.border = "2px dashed red";
    this.image.style.filter = "grayscale(100%)";
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.config) return;

    const hasWan = this.config.wan_entity && hass.states[this.config.wan_entity];
    const hasAlarm = this.config.alarm_entity && hass.states[this.config.alarm_entity];
    const hasWeather = this.config.weather_entity && hass.states[this.config.weather_entity];

    if (!hasWan && !hasAlarm && !hasWeather) return;

    const wanState = hasWan ? String(hass.states[this.config.wan_entity].state).toLowerCase() : 'on';
    const alarmState = hasAlarm ? String(hass.states[this.config.alarm_entity].state).toLowerCase() : 'disarmed';
    const weatherState = hasWeather ? String(hass.states[this.config.weather_entity].state).toLowerCase() : 'unknown';

    const isWanActive = wanState === 'on' || wanState === 'connected' || wanState === 'true';
    const isOffState = alarmState.includes('disarmed') || alarmState === 'off';
    const isHomeState = alarmState.includes('home') || alarmState.includes('night') || alarmState.includes('stay');

    // Night Mode Logic
    const currentHour = new Date().getHours();
    const nightStart = parseInt(this.config.night_start) || 22;
    const nightEnd = parseInt(this.config.night_end) || 6;
    let isNightTime = nightStart > nightEnd ? (currentHour >= nightStart || currentHour < nightEnd) : (currentHour >= nightStart && currentHour < nightEnd);
    
    // Only trigger night mode if it's enabled in config AND it is actually night time
    const showNight = (this.config.enable_night_mode !== false) && isNightTime;

    const quotes = {
      offline: this.config.quote_offline || "WAN connection lost!",
      night: this.config.quote_night || "Zzz... Moglie is sleeping...",
      disarmed: this.config.quote_disarmed || "System's off! Taking a banana break.",
      armedHome: this.config.quote_armed_home || (hasWan ? "Welcome Home! WAN is strong." : "Welcome Home! Everything is secure."),
      armedAway: this.config.quote_armed_away || (hasWan ? "WAN is stable. I'll watch the trees!" : "I'm watching the trees!")
    };

    let border = "2px solid var(--primary-color, #03a9f4)";
    if (hasAlarm) {
      border = isOffState ? "2px solid orange" : (isHomeState ? "2px solid green" : "2px solid red");
    }

    this.image.style.filter = "none";
    
    if (hasWan && !isWanActive) {
      this.updateUI('normal', normal_b64, quotes.offline, "2px solid gray");
      this.image.style.filter = "grayscale(100%)";
    } else if (showNight) {
      this.updateUI('sleepy', sleepy_b64, quotes.night, "2px solid #673AB7");
    } else if (hasAlarm) {
      const text = isOffState ? quotes.disarmed : (isHomeState ? quotes.armedHome : quotes.armedAway);
      this.updateUI('normal', normal_b64, text, border);
    } else {
      this.updateUI('normal', normal_b64, "Moglie is standing by!", border);
    }
  }

  updateUI(key, img, text, border) {
    if (this.image.src !== img) this.image.src = img;
    this.content.innerHTML = text;
    this.container.style.border = border;
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
  description: "Moglie monitors your WAN status with optional security/night mode.",
  preview: true
});
