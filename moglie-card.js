class MoglieHaCard extends HTMLElement {
  static getStubConfig() {
    // Setting these to empty strings removes the "Unknown entity" red error box
    return {
      wan_entity: "",
      alarm_entity: "",
      click_entity: "" 
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
    const wanEntity = hass.states[wanId];
    const alarmEntity = hass.states[alarmId];
    
    const wanState = wanEntity ? wanEntity.state : 'unavailable';
    const alarmState = alarmEntity ? alarmEntity.state : 'unknown';
    
    const isWanActive = ['on', 'connected', 'home', 'up'].includes(wanState);
    
    // Removed 'off' from this array so it doesn't trigger "Welcome Home"
    const isHomeState = ['disarmed', 'armed_home'].includes(alarmState);
    
    // Added a specific check for when the system is off
    const isOffState = alarmState === 'off';

    const statusKey = `${wanState}-${alarmState}`;
    if (this._lastStatus === statusKey) return; 
    this._lastStatus = statusKey;

    if (!this.content) {
      this.innerHTML = `
        <ha-card>
          <style>
            .moglie-container { padding: 20px; text-align: center; cursor: pointer; transition: background 0.3s; border-radius: var(--ha-card-border-radius, 12px); }
            .moglie-container:hover { background: rgba(var(--rgb-primary-text-color), 0.05); }
            .text-box { line-height: 1.5; margin-bottom: 10px; font-size: 1.1em; min-height: 80px; }
            .img-container img { width: 110px; transition: all 0.5s ease; pointer-events: none; }
            .status-warning { color: #e74c3c; font-weight: bold; }
            .status-grayscale { filter: grayscale(100%) opacity(0.6); transform: scale(0.95); }
          </style>
          <div class="moglie-container card-content">
            <div class="text-box"></div>
            <div class="img-container">
              <img src="https://raw.githubusercontent.com/jordanazulay-maker/moglie-ha/refs/heads/main/monkey.png" alt="Moglie">
            </div>
          </div>
        </ha-card>
      `;
      this.content = this.querySelector(".text-box");
      this.image = this.querySelector(".img-container img");

      this.querySelector(".moglie-container").addEventListener("click", () => {
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

    // 1. Check WAN First (Overrides everything else)
    if (!isWanActive) {
      this.content.innerHTML = `Moglie is stranded.<br>The WAN connection<br>has been lost!`;
      this.content.className = "text-box status-warning";
      this.image.className = "status-grayscale";
      
    // 2. Check if the system is completely OFF
    } else if (isOffState) {
      this.content.innerHTML = `System's off! The rest of the<br>primates ditched their post<br>for a banana run. Typical.`;
      this.content.className = "text-box";
      this.image.className = "";
      
    // 3. Check if the system is Disarmed or Armed Home
    } else if (isHomeState) {
      this.content.innerHTML = `Welcome Home!<br>The WAN is strong.<br>Tell me you brought<br>more bananas!`;
      this.content.className = "text-box";
      this.image.className = "";
      
    // 4. Default for everything else (Armed Away, etc.)
    } else {
      this.content.innerHTML = `The rest of the primates are<br>on patrol. I'll watch the trees<br>until they get back!`;
      this.content.className = "text-box";
      this.image.className = "";
    }
  }
}

customElements.define("moglie-ha-card", MoglieHaCard);

window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === 'moglie-ha-card')) {
  window.customCards.push({
    type: "moglie-ha-card",
    name: "Moglie-HA",
    description: "WAN and Alarm status monitoring with a friendly monkey."
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
        { name: "click_entity", label: "Click Action Entity (Opens Dialog)", selector: { entity: {} } }
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
