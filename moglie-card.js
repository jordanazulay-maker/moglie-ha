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

    const wanState = hasWan ? String(hass.states[this.config.wan_entity].state).toLowerCase() : 'on';
    const alarmState = hasAlarm ? String(hass.states[this.config.alarm_entity].state).toLowerCase() : 'disarmed';
    const weatherState = hasWeather ? String(hass.states[this.config.weather_entity].state).toLowerCase() : 'unknown';

    const isWanActive = wanState === 'on' || wanState === 'connected' || wanState === 'true';
    const isOffState = alarmState.includes('disarmed') || alarmState === 'off';
    const isHomeState = alarmState.includes('home') || alarmState.includes('night') || alarmState.includes('stay');

    // 2. Night Mode Logic
    const currentHour = new Date().getHours();
    const nightStart = parseInt(this.config.night_start) || 22;
    const nightEnd = parseInt(this.config.night_end) || 6;
    let isNightTime = nightStart > nightEnd ? (currentHour >= nightStart || currentHour < nightEnd) : (currentHour >= nightStart && currentHour < nightEnd);
    const showNight = (this.config.enable_night_mode !== false) && isNightTime;

    // 3. Prevent infinite rendering loops (THIS WAS CAUSING THE BREAK!)
    const statusKey = `${wanState}-${alarmState}-${weatherState}-${showNight}`;
    if (this._lastStatus === statusKey) return; 
    this._lastStatus = statusKey;

    // 4. Set Daytime Borders
    let dynamicBorder = "2px solid var(--primary-color, #03a9f4)";
    if (hasAlarm) {
      dynamicBorder = isOffState ? "2px solid orange" : (isHomeState ? "2px solid green" : "2px solid red");
    }

    // 5. Build Night Mode Text explicitly
    let baseNightQuote = this.config.quote_night || "Zzz... Moglie is sleeping.";
    let patrolText = "";
    if (hasAlarm) {
      patrolText = (isOffState || isHomeState) 
        ? "<br><small style='opacity: 0.7;'>(The primates haven't started their patrol.)</small>" 
        : "<br><small style='opacity: 0.7;'>(The primates are on patrol.)</small>";
    }
    const fullNightQuote = `${baseNightQuote}${patrolText}`;

    // 6. Define general quotes
    const quotes = {
      offline: this.config.quote_offline || "WAN connection lost!",
      disarmed: this.config.quote_disarmed || "System's off! Taking a banana break.",
      armedHome: this.config.quote_armed_home || (hasWan ? "Welcome Home! WAN is strong." : "Welcome Home! Everything is secure."),
      armedAway: this.config.quote_armed_away || (hasWan ? "WAN stable. I'll watch the trees!" : "I'm watching the trees!")
    };

    this.image.style.filter = "none";
    
    // 7. Priority rendering
    if (hasWan && !isWanActive) {
      this.updateUI('normal', normal_b64, quotes.offline, "2px solid gray");
      this.image.style.filter = "grayscale(100%)";
    } else if (showNight) {
      // Kept the Purple! + Combined Text
      this.updateUI('sleepy', sleepy_b64, fullNightQuote, "2px solid #673AB7");
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
