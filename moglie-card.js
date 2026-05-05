class MoglieHaCard extends HTMLElement {
  static getStubConfig() {
    return {
      wan_entity: "",
      alarm_entity: "",
      click_entity: "",
      weather_entity: "", // New Weather Setting
      night_start: "22:00:00",
      night_end: "06:00:00"
    };
  }

  static getConfigElement() {
    return document.createElement("moglie-ha-card-editor");
  }

  setConfig(config) {
    this.config = config;
  }

  set hass(hass) {
    if (!this.config || !hass) return;
    
    this._hass = hass; 

    const wanId = this.config.wan_entity;
    const alarmId = this.config.alarm_entity;
    const weatherId = this.config.weather_entity; // Grab weather from config

    const wanEntity = wanId ? hass.states[wanId] : null;
    const alarmEntity = alarmId ? hass.states[alarmId] : null;
    const weatherEntity = weatherId ? hass.states[weatherId] : null; // Grab weather state
    
    const wanState = wanEntity ? wanEntity.state : 'unavailable';
    const alarmState = alarmEntity ? alarmEntity.state : 'unknown';
    const weatherState = weatherEntity ? weatherEntity.state : 'unknown';
    
    const isWanActive = ['on', 'connected', 'home', 'up'].includes(wanState);
    const isHomeState = ['armed_home'].includes(alarmState);
    const isOffState = ['off', 'disarmed'].includes(alarmState);
    
    // Check if it's raining based on standard Home Assistant weather states
    const isRaining = ['rain', 'pouring', 'lightning-rainy', 'snowy-rainy'].includes(weatherState);

    // --- Night Mode Logic ---
    let isNightMode = false;
    
    // Fallback to 10PM and 6AM if the config hasn't been updated yet
    const start = this.config.night_start || "22:00";
    const end = this.config.night_end || "06:00";

    const now = new Date();
    // Grab just the HH:MM portion from the current time to ensure a clean comparison
    const currentHHMM = now.toTimeString().substring(0, 5); 
    const startHHMM = start.substring(0, 5);
    const endHHMM = end.substring(0, 5);

    if (startHHMM > endHHMM) {
      // Time window wraps around midnight (e.g. 22:00 to 06:00)
      isNightMode = currentHHMM >= startHHMM || currentHHMM <= endHHMM;
    } else {
      // Time window is within the same day (e.g. 01:00 to 05:00)
      isNightMode = currentHHMM >= startHHMM && currentHHMM <= endHHMM;
    }

    // Include isNightMode AND isRaining in the statusKey so the card updates instantly
    const statusKey = `${wanState}-${alarmState}-${isNightMode}-${isRaining}`;
    if (this._lastStatus === statusKey) return; 
    this._lastStatus = statusKey;

    if (!this.content) {
      this.innerHTML = `
        <ha-card>
          <style>
            .moglie-container { padding: 20px; text-align: center; cursor: pointer; transition: all 0.3s ease; border-radius: var(--ha-card-border-radius, 12px); box-sizing: border-box; }
            .moglie-container:hover { background: rgba(var(--rgb-primary-text-color), 0.05); }
            .text-box { line-height: 1.5; margin-bottom: 10px; font-size: 1.1em; min-height: 80px; }
            .img-container img { width: 110px; transition: all 0.5s ease; pointer-events: none; }
            .status-warning { color: #e74c3c; font-weight: bold; }
            .status-grayscale { filter: grayscale(100%) opacity(0.6); transform: scale(0.95); }
          </style>
          <div class="moglie-container card-content">
            <div class="text-box"></div>
            <div class="img-container">
              <img alt="Moglie">
            </div>
          </div>
        </ha-card>
      `;
      this.container = this.querySelector(".moglie-container");
      this.content = this.querySelector(".text-box");
      this.image = this.querySelector(".img-container img");

      this.container.addEventListener("click", () => {
        const clickEntity = this.config.click_entity;
        if (!clickEntity) return;

        const event = new CustomEvent("hass-action", {
          detail: {
            config: {
              entity: clickEntity, 
              tap_action: {
                action: "more-info" 
              }
            },
            action: "tap"
          },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(event);
      });
    }

    // --- Dynamic Image Selection ---
    const dayImage = "/hacsfiles/moglie-ha/monkey.png";
    const nightImage = "/hacsfiles/moglie-ha/sleepy-monkey.png";
    const rainImage = "/hacsfiles/moglie-ha/rainy-monkey.png";

    // Night mode takes priority (he's asleep inside). If day and raining, raincoat. Otherwise, normal.
    if (isNightMode) {
      this.image.src = nightImage;
    } else if (isRaining) {
      this.image.src = rainImage;
    } else {
      this.image.src = dayImage;
    }

    // Apply State Messaging and Styling
    if (!isWanActive) {
      this.content.innerHTML = `Moglie is stranded.<br>The WAN connection<br>has been lost!`;
      this.content.className = "text-box status-warning";
      this.image.className = "status-grayscale";
      this.container.style.border = "2px solid #9e9e9e"; 
    } else if (isOffState) {
      this.content.innerHTML = isNightMode 
        ? `The rest of the pack is sleeping.<br>Why aren't we?` 
        : `System's off! The rest of the<br>primates ditched their post<br>for a banana run. Typical.`;
      this.content.className = "text-box";
      this.image.className = "";
      this.container.style.border = "2px solid #ff9800"; 
    } else if (isHomeState) {
      this.content.innerHTML = isNightMode 
        ? `The rest of the pack is sleeping.<br>Why aren't we?` 
        : `Welcome Home!<br>The WAN is strong.<br>Tell me you brought<br>more bananas!`;
      this.content.className = "text-box";
      this.image.className = "";
      this.container.style.border = "2px solid #4caf50"; 
    } else {
      // The default "Away / Patrol" state
      if (isNightMode) {
        this.content.innerHTML = `The rest of the pack is sleeping.<br>Why aren't we?`;
      } else if (isRaining) {
        // Special quote if it's raining while on patrol!
        this.content.innerHTML = `The rest of the primates are<br>on patrol in the rain. Glad<br>I have my raincoat!`;
      } else {
        this.content.innerHTML = `The rest of the primates are<br>on patrol. I'll watch the trees<br>until they get back!`;
      }
      this.content.className = "text-box";
      this.image.className = "";
      this.container.style.border = "2px solid #f44336"; 
    }
  }
}

customElements.define("moglie-ha-card", MoglieHaCard);

window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === 'moglie-ha-card')) {
  window.customCards.push({
    type: "moglie-ha-card",
    name: "Moglie-HA",
    description: "WAN, Alarm, and Weather status monitoring with a friendly monkey."
  });
}

class MoglieHaCardEditor extends HTMLElement {
  setConfig(config) { this._config = config; }
  set hass(hass) { this._hass = hass; this.renderForm(); }
  
  renderForm() {
    if (!this._hass || !this._config) return;
    if (!this.formElement) {
      this.innerHTML = `<ha-form></ha-form>`;
      this.formElement = this.querySelector("ha-form");
      
      this.formElement.schema = [
        { name: "wan_entity", label: "WAN Status Entity", selector: { entity: {} } },
        { name: "alarm_entity", label: "Alarm Control Panel", selector: { entity: { domain: "alarm_control_panel" } } },
        { name: "weather_entity", label: "Weather Entity (For Raincoat)", selector: { entity: { domain: "weather" } } },
        { name: "click_entity", label: "Click Action Entity (Opens Dialog)", selector: { entity: {} } },
        { name: "night_start", label: "Night Mode Start", selector: { time: {} } },
        { name: "night_end", label: "Night Mode End", selector: { time: {} } }
      ];

      this.formElement.addEventListener("value-changed", (ev) => {
        const event = new CustomEvent("config-changed", {
          detail: { config: ev.detail.value },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(event);
      });
    }
    this.formElement.hass = this._hass;
    this.formElement.data = this._config;
  }
}
customElements.define("moglie-ha-card-editor", MoglieHaCardEditor);
