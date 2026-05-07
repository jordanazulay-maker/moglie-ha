import { normal_monkey as normal_b64 } from './normal-monkey.js';
import { winter_monkey as winter_b64 } from './winter-monkey.js';
import { rainy_monkey as rainy_b64 } from './rainy-monkey.js';
import { summer_monkey as summer_b64 } from './summer-monkey.js';
import { sleepy_monkey as sleepy_b64 } from './sleepy-monkey.js';

const blobCache = {};

async function getMonkeyUrl(monkeyKey, base64URI) {
  if (blobCache[monkeyKey]) return blobCache[monkeyKey];

  try {
    const res = await fetch(base64URI);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    
    blobCache[monkeyKey] = url;
    return url;
  } catch (e) {
    console.error(`[Moglie HA] Error converting ${monkeyKey} base64`, e);
    return base64URI;
  }
}

console.info(
  `%c🐒 MOGLIE-HA %c a monkey has appeared! `,
  'color: white; background: #FF9800; font-weight: 700; padding: 4px; border-radius: 4px 0 0 4px;',
  'color: #FF9800; background: white; font-weight: 700; padding: 4px; border-radius: 0 4px 4px 0; border: 1px solid #FF9800;'
);

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
            <img id="moglie-image" src="" data-img-src="" style="width: 150px; height: 150px; object-fit: contain; transition: all 0.3s ease;" />
            <div id="moglie-text" class="text-box" style="margin-top: 10px; font-weight: bold; min-height: 2em;"></div>
          </div>
        </ha-card>
      `;
      this.container = this.querySelector('#moglie-container');
      this.image = this.querySelector('#moglie-image');
      this.content = this.querySelector('#moglie-text');

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

  async showError(message) {
    this.content.innerHTML = `
      <div style="margin-bottom: 12px;">${message}</div>
      <button id="moglie-reload-btn" style="background: var(--primary-color, #03a9f4); color: var(--text-primary-color, white); border: none; border-radius: 6px; padding: 8px 16px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: background 0.2s;">
        🔄 Reload Dashboard
      </button>
    `;
    this.container.style.border = "2px dashed var(--error-color, red)";
    
    const blobUrl = await getMonkeyUrl('normal', normal_b64);
    this.image.src = blobUrl;
    this.image.setAttribute('data-img-src', blobUrl);
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
    const statusKey = `${wanState}-${alarmState}-${isNightMode}-${isRaining}-${isHot}-${showWinter}-${configHash}`;
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

    this.content.className = "text-box";
    this.image.style.filter = "none"; 

    if (!isWanActive) {
      this.updateUI('normal', normal_b64, quotes.offline, "2px solid var(--disabled-text-color, gray)");
      this.content.classList.add("status-warning");
      this.image.style.filter = "grayscale(100%)";
    } else if (isNightMode) {
      this.updateUI('sleepy', sleepy_b64, quotes.night, "2px solid #673AB7");
    } else if (isRaining) {
      this.updateUI('rainy', rainy_b64, quotes.rain, "2px solid #2196F3");
    } else if (showWinter) {
      this.updateUI('winter', winter_b64, quotes.cold, "2px solid #0
