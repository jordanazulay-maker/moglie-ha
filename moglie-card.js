import { normal_monkey as normal_b64 } from './normal-monkey.js';
import { winter_monkey as winter_b64 } from './winter-monkey.js';
import { rainy_monkey as rainy_b64 } from './rainy-monkey.js';
import { summer_monkey as summer_b64 } from './summer-monkey.js';
import { sleepy_monkey as sleepy_b64 } from './sleepy-monkey.js';
import { festive_monkey as festive_b64 } from './festive-monkey.js';

console.info(
  `%c🐒 MOGLIE-HA %c a monkey has appeared! `,
  'color: white; background: #FF9800; font-weight: 700; padding: 4px; border-radius: 4px 0 0 4px;',
  'color: #FF9800; background: white; font-weight: 700; padding: 4px; border-radius: 0 4px 4px 0; border: 1px solid #FF9800;'
);

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
        <ha-card>
          <div id="moglie-container" style="padding: 16px; border-radius: 10px; text-align: center; transition: all 0.3s ease; cursor: pointer;">
            <img id="moglie-image" style="width: 150px; height: 150px; object-fit: contain; transition: transform 0.5s ease;" />
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

    // Require at least one entity to be configured
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

    // Fetch states safely with optional chaining
    const wanEntity = this.config.wan_entity ? hass.states[this.config.wan_entity] : null;
    const alarmEntity = this.config.alarm_entity ? hass.states[this.config.alarm_entity] : null;
    const weatherEntity = this.config.weather_entity ? hass.states[this.config.weather_entity] : null;

    // Fallback values
    const wanState = wanEntity ? String(wanEntity.state).toLowerCase() : 'on';
    const alarmState = alarmEntity ? String(alarmEntity.state).toLowerCase() : 'disarmed';
    const weatherState = weatherEntity ? String(weatherEntity.state).toLowerCase() : 'unknown';
    
    const isWanActive = wanState === 'on' || wanState === 'connected' || wanState === 'true'; 
    const isOffState = alarmState.includes('disarmed') || alarmState === 'off';
    const isHomeState = alarmState.includes('home') || alarmState.includes('night') || alarmState.includes('stay');

    const currentHour = new Date().getHours();
    const d = new Date();
    const isChristmas = d.getMonth() === 11 && (d.getDate() === 24 || d.getDate() === 25); 
    const isAprilFools = d.getMonth() === 3 && d.getDate() === 1;
    
    const nightStart = parseInt(this.config.night_start) || 22;
    const nightEnd = parseInt(this.config.night_end) || 6;
    const isNightMode = nightStart > nightEnd ? (currentHour >= nightStart || currentHour < nightEnd) : (currentHour >= nightStart && currentHour < nightEnd);

    const isRaining = weatherState.includes('rain') || weatherState.includes('storm');
    
    const statusKey = `${wanState}-${alarmState}-${isNightMode}-${isRaining}-${isChristmas}-${isAprilFools}`;
    if (this._lastStatus === statusKey) return; 
    this._lastStatus = statusKey;

    const quotes = {
      offline: this.config.quote_offline || "WAN connection lost!",
      night: this.config.quote_night || "Zzz... Moglie is sleeping...",
      disarmed: this.config.quote_disarmed || "System's off! Taking a banana break.",
      armedHome: this.config.quote_armed_home || (this.config.wan_entity ? "Welcome Home! WAN is strong." : "Welcome Home! Everything is secure."),
      armedAway: this.config.quote_armed_away || (this.config.wan_entity ? "WAN stable. I'll watch the trees!" : "I'm watching the trees!")
    };

    let border = "2px solid var(--primary-color, gray)";
    if (alarmEntity) {
      border = isOffState ? "2px solid orange" : (isHomeState ? "2px solid green" : "2px solid red");
    }

    this.image.style.filter = "none"; 
    if (wanEntity && !isWanActive) {
      this.updateUI('normal', normal_b64, quotes.offline, "2px solid gray");
      this.image.style.filter = "grayscale(100%)";
    } else if (isNightMode) {
      this.updateUI('sleepy', sleepy_b64, quotes.night, "2px solid #673AB7");
    } else if (alarmEntity) {
      const text = isOffState ? quotes.disarmed : (isHomeState ? quotes.armedHome : quotes.armedAway);
      this.updateUI('normal', normal_b64, text, border);
    } else {
      this.updateUI('normal', normal_b64, "Moglie is standing by!", border);
    }
  }

  updateUI(monkeyKey, base64Data, text, borderStyle) {
    if (this.image.src !== base64Data) this.image.src = base64Data;
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

/* -------------------------------------------------------------------
   CARD PICKER REGISTRATION
------------------------------------------------------------------- */
window.customCards = window.customCards || [];
window.customCards.push({
  type: "moglie-card",
  name: "Moglie HA",
  description: "Moglie monitors your WAN status and optional security/weather state.",
  preview: true,
  documentationURL: "https://github.com/jordanazulay-maker/moglie-ha"
});
