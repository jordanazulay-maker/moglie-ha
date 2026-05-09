(function() {
  // ==========================================================
  // 1. THE VISUAL EDITOR COMPONENT
  // ==========================================================
  class MoglieCardEditor extends HTMLElement {
    setConfig(config) {
      this.config = config;
      
      if (!this.contentBuilt) {
        this.innerHTML = `
          <div style="padding-top: 10px;">
            <div style="margin-bottom: 16px;">
              <h3 style="margin-bottom: 8px;">🐒 Moglie Settings</h3>
              <p style="font-size: 0.9em; color: var(--secondary-text-color);">
                Configure Moglie's environment, network, and security trackers!
              </p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
              <div>
                <label style="display: block; font-weight: bold; font-size: 0.8em;">WAN Entity (Network):</label>
                <input type="text" id="wan_entity" placeholder="binary_sensor.wan" value="${this.config.wan_entity || ''}" style="width: 100%; padding: 4px;">
              </div>
              <div>
                <label style="display: block; font-weight: bold; font-size: 0.8em;">Alarm Entity (Security):</label>
                <input type="text" id="alarm_entity" placeholder="alarm_control_panel.home" value="${this.config.alarm_entity || ''}" style="width: 100%; padding: 4px;">
              </div>
              <div>
                <label style="display: block; font-weight: bold; font-size: 0.8em;">Weather Entity:</label>
                <input type="text" id="weather_entity" placeholder="weather.home" value="${this.config.weather_entity || ''}" style="width: 100%; padding: 4px;">
              </div>
              <div>
                <label style="display: block; font-weight: bold; font-size: 0.8em;">Temperature Entity:</label>
                <input type="text" id="temp_entity" placeholder="sensor.outside_temp" value="${this.config.temp_entity || ''}" style="width: 100%; padding: 4px;">
              </div>
              <div>
                <label style="display: block; font-weight: bold; font-size: 0.8em;">Humidity Entity:</label>
                <input type="text" id="humidity_entity" placeholder="sensor.outside_humidity" value="${this.config.humidity_entity || ''}" style="width: 100%; padding: 4px;">
              </div>
            </div>

            <div style="margin-bottom: 16px;">
               <label style="display: flex; align-items: center; font-weight: bold; font-size: 0.9em;">
                 <input type="checkbox" id="hide_moglie" ${this.config.hide_moglie ? 'checked' : ''} style="margin-right: 8px;">
                 Hide Moglie (Text-Only Mode)
               </label>
            </div>
          </div>
        `;
        
        // Add listeners to save config
        const inputs = this.querySelectorAll('input');
        inputs.forEach(input => {
          input.addEventListener('change', this.valueChanged.bind(this));
        });
        
        this.contentBuilt = true;
      }
    }

    valueChanged(ev) {
      if (!this.config) return;
      const target = ev.target;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      if (this.config[target.id] === value) return;

      const newConfig = { ...this.config, [target.id]: value };

      const event = new Event("config-changed", { bubbles: true, composed: true });
      event.detail = { config: newConfig };
      this.dispatchEvent(event);
    }
  }

  customElements.define("moglie-card-editor", MoglieCardEditor);


  // ==========================================================
  // 2. THE MAIN MOGLIE CARD ENGINE
  // ==========================================================
  class MoglieCard extends HTMLElement {
    
    static getConfigElement() { return document.createElement("moglie-card-editor"); }
    static getStubConfig() { return { alarm_entity: "", wan_entity: "" }; }

    setConfig(config) {
      this.config = config;
    }

    getMonkeyUrl(type) {
      const baseUrl = "/hacsfiles/moglie-ha/";
      const images = {
        "festive": "festive.png",
        "normal": "normal.png",
        "rainy": "rainy.png",
        "summer": "summer.png",
        "sweaty": "sweaty.png",
        "winter": "winter.png",
        "sleepy": "sleepy.png"
      };
      return `${baseUrl}${images[type] || "normal.png"}`;
    }

    set hass(hass) {
      if (!this.content) { this.initCard(); }
      this.updateCard(hass);
    }

    initCard() {
      this.innerHTML = `
        <style>
            #moglie-container { 
              padding: 16px; 
              text-align: center; 
              transition: all 0.5s;
              border-radius: var(--ha-card-border-radius, 12px);
              background: var(--ha-card-background, white);
              cursor: pointer;
            }
            .monkey-img { width: 100%; max-width: 200px; transition: filter 0.5s; }
            .hidden { display: none !important; }
        </style>
        <ha-card id="moglie-container">
            <img id="monkey-pic" class="monkey-img" src="">
            <div id="status-text" style="margin-top: 10px; font-weight: bold; color: var(--primary-text-color);"></div>
        </ha-card>
      `;
      this.content = this.querySelector("#moglie-container");
      
      // Setup Action (Tap defaults to more-info on the alarm entity)
      this.content.addEventListener('click', () => {
        if (this.config.alarm_entity) {
          const event = new Event('hass-more-info', { bubbles: true, composed: true });
          event.detail = { entityId: this.config.alarm_entity };
          this.dispatchEvent(event);
        }
      });
    }

    updateCard(hass) {
      const img = this.querySelector("#monkey-pic");
      const text = this.querySelector("#status-text");
      const container = this.content;

      // Extract Entity States
      const getS = (ent) => (this.config[ent] && hass.states[this.config[ent]]) ? hass.states[this.config[ent]].state : null;
      
      const wanState = getS('wan_entity');
      const alarmState = getS('alarm_entity');
      const weatherState = getS('weather_entity');
      const temp = parseFloat(getS('temp_entity'));
      const humidity = parseFloat(getS('humidity_entity'));

      // 1. Base Variables
      let type = "normal";
      let borderColor = "transparent";
      let message = "Moglie is watching the trees...";
      let isOffline = false;

      // 2. Network Priority (Top Level Override)
      if (wanState === "off" || wanState === "disconnected") {
          isOffline = true;
          borderColor = "gray";
          message = "Moglie is stranded. The WAN connection has been lost!";
      } else {
          // 3. Security Checks (Sets base border/message)
          if (alarmState === "armed_home") {
              borderColor = "green";
              message = "The troop is home. The primates are on perimeter patrol.";
          } else if (alarmState === "disarmed") {
              borderColor = "orange";
              message = "System's off! The troop is relaxing.";
          } else if (alarmState && alarmState.startsWith("armed_")) {
              borderColor = "red";
              message = "The troop is away. The primates are watching the trees!";
          }

          // 4. Environmental Checks (Overrides type, message, and borders)
          const hour = new Date().getHours();
          const nightStart = this.config.night_start || 22;
          const nightEnd = this.config.night_end || 6;
          const isNight = (hour >= nightStart || hour < nightEnd);

          if (isNight) {
              type = "sleepy";
              borderColor = "purple";
              message = "Zzz... Moglie is sleeping...";
          } else if (weatherState === "rainy" || weatherState === "pouring") {
              type = "rainy";
              borderColor = "blue";
              message = "Looks like rain, grabbing my coat!";
          } else if (!isNaN(temp) && temp < 50 || weatherState === "snowy") {
              type = "winter";
              borderColor = "cyan";
              message = "Brrr! It's freezing out there!";
          } else if (!isNaN(temp) && temp > 80) {
              if (!isNaN(humidity) && humidity > 70) {
                  type = "sweaty";
              } else {
                  type = "summer";
              }
              borderColor = "#ffb347"; // Yellow-Orange
              message = "It's boiling! Need a banana smoothie.";
          }
      }

      // 5. Secret Anomaly (Festive Fallback)
      const date = new Date();
      if (date.getMonth() === 11 && date.getDate() === 25) { // Christmas logic fallback
          type = "festive";
          message = "Happy Holidays from the troop!";
      }

      // Apply Visuals
      if (this.config.hide_moglie) {
          img.classList.add("hidden");
          message = `MOGLIE'S LATEST UPDATE: ${message}`;
      } else {
          img.classList.remove("hidden");
          img.src = this.getMonkeyUrl(type);
      }

      img.style.filter = isOffline ? "grayscale(100%)" : "none";
      container.style.border = borderColor !== "transparent" ? `3px solid ${borderColor}` : "none";
      text.textContent = message;
    }

    getCardSize() {
      return this.config.hide_moglie ? 1 : 3;
    }
  }

  customElements.define('moglie-card', MoglieCard);

  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "moglie-card",
    name: "Moglie Card",
    description: "Moglie monitors your WAN, security, and weather!",
    preview: true
  });
})();
