class MoglieHaCard extends HTMLElement {
  static getStubConfig() {
    return {
      wan_entity: "binary_sensor.wan_status",
      alarm_entity: "alarm_control_panel.home_alarm",
      action_type: "navigate",
      action_path: "/history?entity_id=binary_sensor.wan_status"
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

    const wanId = this.config.wan_entity;
    const alarmId = this.config.alarm_entity;
    const wanEntity = hass.states[wanId];
    const alarmEntity = hass.states[alarmId];
    
    const wanState = wanEntity ? wanEntity.state : 'unavailable';
    const alarmState = alarmEntity ? alarmEntity.state : 'unknown';
    
    const isWanActive = (wanState === 'on' || wanState === 'connected' || wanState === 'home' || wanState === 'up');
    const isOnPatrol = (alarmState === 'armed_away');

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

      // DYNAMIC CLICK HANDLER
      this.querySelector(".moglie-container").addEventListener("click", () => {
        const action = this.config.action_type || "navigate";
        const path = this.config.action_path;
        
        let detail = { config: this.config, action: action };
        
        if (action === "navigate") detail.navigation_path = path;
        if (action === "url") detail.url_path = path;
        if (action === "toggle") detail.entity_id = path; // In toggle mode, path = entity_id

        const event = new CustomEvent("hass-action", {
          detail: detail,
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(event);
      });
    }

    if (!isWanActive) {
      this.content.innerHTML = `Moglie is stranded.<br>The WAN connection<br>has been lost!`;
      this.content.className = "text-box status-warning";
      this.image.className = "status-grayscale";
    } else if (isOnPatrol) {
      this.content.innerHTML = `The rest of the primates are<br>on patrol. I'll watch the trees<br>until they get back!`;
      this.content.className = "text-box";
      this.image.className = "";
    } else {
      this.content.innerHTML = `Welcome Home!<br>The WAN is strong.<br>Tell me you brought<br>more bananas!`;
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

// UPDATED EDITOR WITH ACTION BOXES
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
        { 
          name: "action_type", 
          label: "Click Action Type", 
          selector: { 
            select: { 
              options: [
                { value: "navigate", label: "Navigate (Internal)" },
                { value: "url", label: "URL (External)" },
                { value: "toggle", label: "Toggle Entity" },
                { value: "none", label: "No Action" }
              ] 
            } 
          } 
        },
        { name: "action_path", label: "Action Path / Entity ID", selector: { text: {} } }
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
