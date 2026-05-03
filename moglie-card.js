class MoglieHaCard extends HTMLElement {
  // 1. Link the Visual Editor
  static getConfigElement() {
    return document.createElement("moglie-ha-card-editor");
  }

  static getStubConfig() {
    return {
      header: "Moglie Status",
      entity: "sun.sun",
      alarm_entity: "alarm_control_panel.home_alarm"
    };
  }

  setConfig(config) {
    this.config = config;
  }

  set hass(hass) {
    const wanEntityId = this.config.entity;
    const alarmEntityId = this.config.alarm_entity;
    
    const wanState = hass.states[wanEntityId];
    const alarmState = hass.states[alarmEntityId];

    const isWanActive = wanState && (wanState.state === 'on' || wanState.state === 'above_horizon' || wanState.state === 'home' || wanState.state === 'connected');
    const isAlarmArmed = alarmState && (alarmState.state.includes('armed'));

    if (!this.content) {
      this.innerHTML = `
        <ha-card>
          <style>
            .moglie-container {
              padding: 20px;
              text-align: center;
              cursor: pointer;
              transition: background 0.3s ease;
            }
            .text-box {
              line-height: 1.5;
              margin-bottom: 15px;
              font-size: 1.1em;
            }
            .img-container img {
              width: 110px;
              transition: filter 0.5s ease, transform 0.3s ease;
            }
            .status-warning { color: #e74c3c; font-weight: bold; }
            .status-grayscale { filter: grayscale(100%) opacity(0.6); transform: scale(0.95); }
          </style>
          <div class="moglie-container card-content">
            <div class="text-box"></div>
            <div class="img-container">
              <img src="https://raw.githubusercontent.com/jordanazulay-maker/moglie-ha/main/monkey.png" alt="Moglie">
            </div>
          </div>
        </ha-card>
      `;
      this.content = this.querySelector(".text-box");
      this.image = this.querySelector(".img-container img");
      
      this.querySelector(".moglie-container").onclick = () => {
        const event = new Event("hass-action", { bubbles: true, composed: true });
        event.detail = {
          config: this.config,
          action: "navigate",
          navigation_path: `/history?entity_id=${wanEntityId}`
        };
        this.dispatchEvent(event);
      };
    }

    // Logic for WAN and Alarm Status
    if (isAlarmArmed) {
        this.content.innerHTML = `Moglie is on high alert!<br>The pack is protected.<br>Watching for intruders!`;
        this.image.classList.remove("status-grayscale");
    } else if (isWanActive) {
      this.content.innerHTML = `Welcome Home!<br>The WAN is strong.<br>Tell me you brought<br>more bananas!`;
      this.content.classList.remove("status-warning");
      this.image.classList.remove("status-grayscale");
    } else {
      this.content.innerHTML = `Moglie is stranded.<br>WAN connection lost.<br>He can't find the pack!`;
      this.content.classList.add("status-warning");
      this.image.classList.add("status-grayscale");
    }
  }

  getCardSize() { return 3; }
}

// 2. The Visual Editor UI
class MoglieHaCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._initialized) this._render();
  }

  _render() {
    this._initialized = true;
    this.innerHTML = `
      <div class="card-config">
        <ha-entity-picker
          .label="WAN Status Entity"
          .hass=${this._hass}
          .value=${this._config.entity}
          .configValue=${"entity"}
          @value-changed=${this._valueChanged}
        ></ha-entity-picker>
        <ha-entity-picker
          .label="Alarm System Entity"
          .hass=${this._hass}
          .value=${this._config.alarm_entity}
          .configValue=${"alarm_entity"}
          @value-changed=${this._valueChanged}
        ></ha-entity-picker>
      </div>
    `;
  }

  _valueChanged(ev) {
    if (!this._config || !this._hass) return;
    const target = ev.target;
    const newConfig = { ...this._config, [target.configValue]: ev.detail.value };
    const event = new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

// 3. Official Registration
customElements.define("moglie-ha-card", MoglieHaCard);
customElements.define("moglie-ha-card-editor", MoglieHaCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "moglie-ha-card",
  name: "Moglie HA",
  preview: true,
  description: "Dynamic feedback card for WAN and Alarm status."
});
