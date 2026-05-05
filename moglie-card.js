import { normal_monkey } from "./normal-monkey.js";

class MoglieHaCard extends HTMLElement {
  static getStubConfig() {
    return {
      wan_entity: "",
      alarm_entity: "",
      click_entity: "",
      weather_entity: "",
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

    if (!this.content) {
      this.innerHTML = `
        <ha-card>
          <style>
            .moglie-container { padding: 20px; text-align: center; cursor: pointer; transition: all 0.3s ease; border-radius: var(--ha-card-border-radius, 12px); box-sizing: border-box; }
            .moglie-container:hover { background: rgba(var(--rgb-primary-text-color), 0.05); }
            .text-box { line-height: 1.5; margin-bottom: 10px; font-size: 1.1em; min-height: 80px; color: var(--primary-text-color); }
            
            /* THE FIX FOR THE BLUE TINT IS HERE */
            .img-container img { 
              width: 110px; 
              transition: all 0.5s ease; 
              pointer-events: none; 
              filter: none !important; 
              background: transparent !important; 
              color: unset !important;
            }
            
            .status-warning { color: var(--error-color); font-weight: bold; }
            .status-config-err { color: var(--warning-color); font-weight: bold; font-size: 0.9em; }
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
        const actionConfig = this.config.tap_action || { action: "more-info" };
        if (actionConfig.action === "none") return;

        const targetEntity = this.config.tap_action?.entity || this.config.click_entity || this.config.wan_entity;

        const event = new CustomEvent("hass-action", {
          detail: { config: { entity: targetEntity, tap_action: actionConfig }, action: "tap" },
          bubbles: true, composed: true,
        });
        this.dispatchEvent(event);
      });
    }

    const wanId = this.config.wan_entity;
    const alarmId = this.config.alarm_entity;
    const weatherId = this.config.weather_entity;

    const showWarning = (message) => {
      this.image.src = normal_monkey; 
      this.image.className = "status-grayscale";
      this.content.innerHTML = message;
      this.content.className = "text-box status-config-err";
      this.container.style.border = "2px dashed var(--warning-color)";
    };

    if (!wanId || !alarmId) {
      showWarning(`Moglie needs more information to do his job!<br>The primates get antsy when I have nothing to say.<br><span style="font-size:0.8em; color:var(--secondary-text-color);">(Configure WAN & Alarm entities)</span>`);
      return;
    }

    const wanEntity = hass.states[wanId];
    const alarmEntity = hass.states[alarmId];

    if (!wanEntity || !alarmEntity) {
      showWarning(`Moglie needs more information!<br>Make sure your entities are correct.`);
      return;
    }

    // Set the image from your normal-monkey.js file
    this.image.src = normal_monkey;

    this.content.innerHTML = `Moglie has arrived!<br>And he is no longer blue!`;
    this.content.className = "text-box";
    this.image.className = "";
    this.container.style.border = "2px solid var(--success-color)"; 
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
        { name: "alarm_entity", label: "Alarm Control Panel", selector: { entity: { domain: "alarm_control_panel" } } }
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
