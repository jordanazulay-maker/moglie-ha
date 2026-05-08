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
      // 1. Create the HTML
      this.innerHTML = `
        <style>
          /* April Fools Anti-Gravity */
          .anti-gravity {
            transform: rotate(180deg);
          }
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

      // 2. Safely attach the massive string via object property, bypassing the HTML parser!
      this.image.src = normal_b64;

      this._imgRetries = 0;
      this.image.onerror = () => {
        if (this._imgRetries < 3) {
          this._imgRetries++;
          console.warn(`[Moglie HA] Image failed to load. Attempting refresh (${this._imgRetries}/3)...`);
          setTimeout(() => {
            const currentSrc = this.image.src;
            this.image.src = ''; 
            this.image.src = currentSrc; 
          }, 1000);
        } else {
          console.error("[Moglie HA] Image failed to load after 3 attempts.");
        }
      };

      this.container.addEventListener('click', () => {
        if (!this.config || !this.config.alarm_entity) return;
        this.dispatchEvent(new CustomEvent('hass-more-info', {
          bubbles: true,
          composed: true,
          detail: { entityId: this.config.alarm_entity }
        }));
      });
    }

    if (this._hass) {
      this._lastStatus = null; 
      this.hass = this._hass;
    }

    if (!config.wan_entity || !config.alarm_entity || !config.weather_entity) {
      this.showError("⚠️ Please configure Moglie's entities in the Visual Editor.");
    }
  }

  showError(message) {
    this.content.innerHTML = `
      <div style="margin-bottom: 12px;">${message}</div>
      <button id="moglie-reload-btn" style="background: var(--primary-color, #03a9f4); color: var(--text-primary-color, white); border: none; border-radius: 6px; padding: 8px 16px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: background 0.2s;">
        🔄 Reload Dashboard
      </button>
    `;
    this.container.style.border = "2px dashed var(--error-color, red)";
    
    this.image.src = normal_b64;
    this.image.setAttribute('data-img-src', 'normal');
    this.image.style.filter = "grayscale(100%)";

    const reloadBtn = this.querySelector('#moglie-reload-btn');
    if (reloadBtn) {
      reloadBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        window.location.reload(true); 
      });
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.config || !this.config.wan_entity || !this.config.alarm_entity || !this.config.weather_entity) return;

    const wanEntity = hass.states[this.config.wan_entity];
    const alarmEntity = hass.states[this.config.alarm_entity];
    const weatherEntity = hass.states[this.config.weather_entity];

    if (!wanEntity || !alarmEntity || !weatherEntity) {
      let missing = [];
      if (!wanEntity) missing.push(this.config.wan_entity);
      if (!alarmEntity) missing.push(this.config.alarm_entity);
      if (!weatherEntity) missing.push(this.config.weather_entity);
      
      this.showError(`⚠️ Cannot find entity: <b>${missing.join(', ')}</b>. Check your spelling or click below to refresh data after install.`);
      return;
    }

    const wanState = String(wanEntity.state).toLowerCase();
    const alarmState = String(alarmEntity.state).toLowerCase();
    const weatherState = String(weatherEntity.state).toLowerCase();
    
    const isWanActive = wanState === 'on' || wanState === 'connected' || wanState === 'true'; 
    const isOffState = alarmState.includes('disarmed') || alarmState === 'off';
    const isHomeState = alarmState.includes('home') || alarmState.includes('night') || alarmState.includes('stay') || alarmState.includes('partial');

    const currentHour = new Date().getHours();
    
    // Holiday & Easter Egg Date Logic
    const d = new Date();
    const isChristmas = d.getMonth() === 11 && (d.getDate() === 24 || d.getDate() === 25); 
    const isAprilFools = d.getMonth() === 3 && d.getDate() === 1;
    
    const nightStart = parseInt(this.config.night_start) || 22;
    const nightEnd = parseInt(this.config.night_end) || 6;
    
    let isNightMode = false;
    if (nightStart > nightEnd) {
      isNightMode = currentHour >= nightStart || currentHour < nightEnd;
    } else {
      isNightMode = currentHour >= nightStart && currentHour < nightEnd;
    }

    const isRaining = weatherState.includes('rain') || 
                      weatherState.includes('pour') || 
                      weatherState.includes('drizzle') || 
                      weatherState.includes('shower') || 
                      weatherState.includes('storm');

    let temp = null;
    if (weatherEntity.attributes && weatherEntity.attributes.temperature !== undefined) {
      temp = parseFloat(weatherEntity.attributes.temperature);
    } else if (!isNaN(parseFloat(weatherState))) {
      temp = parseFloat(weatherState);
    }
      
    let unitStr = 'F';
    if (weatherEntity.attributes) {
        if (weatherEntity.attributes.temperature_unit) {
            unitStr = String(weatherEntity.attributes.temperature_unit);
        } else if (weatherEntity.attributes.unit_of_measurement) {
            unitStr = String(weatherEntity.attributes.unit_of_measurement);
        }
    }
    const isF = unitStr.toUpperCase().includes('F');
    const isC = unitStr.toUpperCase().includes('C');
      
    const isSnowing = ['snowy', 'snowy-rainy', 'hail'].includes(weatherState);
    
    const isHot = temp !== null && ((isF && temp >= 80) || (isC && temp >= 27));
    const isCold = temp !== null && ((isF && temp < 50) || (isC && temp < 10));
    const showWinter = isSnowing || isCold;

    const configHash = JSON.stringify(this.config);
    const statusKey = `${wanState}-${alarmState}-${isNightMode}-${isRaining}-${isHot}-${showWinter}-${isChristmas}-${isAprilFools}-${configHash}`;
    if (this._lastStatus === statusKey) return; 
    this._lastStatus = statusKey;

    const quotes = {
      offline: this.config.quote_offline || "Moglie is stranded. The WAN connection has been lost!",
      cold: this.config.quote_cold || "Brrr! It's freezing out there!",
      rain: this.config.quote_rain || "Looks like rain, grabbing my coat!",
      hot: this.config.quote_hot || "It's boiling! Need a banana smoothie.",
      night: this.config.quote_night || "Zzz... Moglie is sleeping...",
      disarmed: this.config.quote_disarmed || "System's off! The rest of the primates ditched their post for a banana run. Typical.",
      armedHome: this.config.quote_armed_home || "Welcome Home! The WAN is strong. Tell me you brought more bananas!",
      armedAway: this.config.quote_armed_away || "The rest of the primates are on patrol. I'll watch the trees until they get back!"
    };

    // Determine the border color based on the alarm state
    let alarmBorder = "2px solid var(--error-color, red)"; // Default to Armed Away
    if (isOffState) {
      alarmBorder = "2px solid var(--warning-color, orange)";
    } else if (isHomeState) {
      alarmBorder = "2px solid var(--success-color, green)";
    }

    this.content.className = "text-box";
    this.image.style.filter = "none"; 

    // April Fools triggers gravity inversion
    if (isAprilFools) {
      this.image.classList.add('anti-gravity');
    } else {
      this.image.classList.remove('anti-gravity');
    }

    if (!isWanActive) {
      this.updateUI('normal', normal_b64, quotes.offline, "2px solid var(--disabled-text-color, gray)");
      this.content.classList.add("status-warning");
      this.image.style.filter = "grayscale(100%)";
    } else if (isAprilFools) {
      this.updateUI('normal', normal_b64, "Why is the blood rushing to my head?", alarmBorder);
    } else if (isChristmas) {
      this.updateUI('festive', festive_b64, "The rest of the pack and I wish you a Merry Christmas!", alarmBorder);
    } else if (isNightMode) {
      this.updateUI('sleepy', sleepy_b64, quotes.night, "2px solid #673AB7");
    } else if (isRaining) {
      this.updateUI('rainy', rainy_b64, quotes.rain, "2px solid #2196F3");
    } else if (showWinter) {
      this.updateUI('winter', winter_b64, quotes.cold, "2px solid #00BCD4");
    } else if (isHot) {
      this.updateUI('summer', summer_b64, quotes.hot, "2px solid #FF9800"); 
    } else if (isOffState) {
      this.updateUI('normal', normal_b64, quotes.disarmed, "2px solid var(--warning-color, orange)");
    } else if (isHomeState) {
      this.updateUI('normal', normal_b64, quotes.armedHome, "2px solid var(--success-color, green)");
    } else {
      this.updateUI('normal', normal_b64, quotes.armedAway, "2px solid var(--error-color, red)");
    }
  }

  updateUI(monkeyKey, base64Data, text, borderStyle) {
    if (this.image && this.image.getAttribute('data-img-src') !== monkeyKey) {
      this._imgRetries = 0; 
      this.image.setAttribute('data-img-src', monkeyKey);
      this.image.src = base64Data; 
    }
    
    this.content.innerHTML = text;
    this.container.style.border = borderStyle;
  }

  getCardSize() { return 3; }
}
customElements.define('moglie-card', MoglieCard);

/* -------------------------------------------------------------------
   VISUAL EDITOR COMPONENT (NATIVE HA-FORM)
------------------------------------------------------------------- */
class MoglieCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    if (this._form) {
      this._form.data = config;
    } else {
      this.render();
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (this._form) {
      this._form.hass = hass;
    } else {
      this.render();
    }
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
        night_start: "Night Mode Start Hour (0-23)",
        night_end: "Night Mode End Hour (0-23)",
        quote_offline: "Custom Quote: WAN Offline",
        quote_disarmed: "Custom Quote: Disarmed",
        quote_armed_home: "Custom Quote: Armed Home",
        quote_armed_away: "Custom Quote: Armed Away",
        quote_night: "Custom Quote: Night Mode",
        quote_hot: "Custom Quote: Hot Weather (>= 80F / 27C)",
        quote_cold: "Custom Quote: Cold Weather (< 50F / 10C)",
        quote_rain: "Custom Quote: Rainy Weather"
      };
      return labels[schema.name] || schema.name;
    };

    this._form.addEventListener("value-changed", (ev) => {
      this.dispatchEvent(new CustomEvent("config-changed", {
        detail: { config: ev.detail.value },
        bubbles: true,
        composed: true,
      }));
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
  description: "Moglie monitors your WAN status and security state.",
  preview: true,
  documentationURL: "https://github.com/jordanazulay-maker/moglie-ha"
});
