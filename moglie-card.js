class MoglieHaCard extends HTMLElement {
  static getStubConfig() {
    return {
      wan_entity: "",
      alarm_entity: ""
    };
  }

  static getConfigElement() {
    return document.createElement("moglie-ha-card-editor");
  }

  setConfig(config) {
    if (!config.wan_entity || !config.alarm_entity) {
      throw new Error("Please define both WAN and Alarm entities");
    }
    this.config = config;
  }

  set hass(hass) {
    const wanId = this.config.wan_entity;
    const alarmId = this.config.alarm_entity;
    const wanEntity = hass.states[wanId];
    const alarmEntity = hass.states[alarmId];
    
    const wanState = wanEntity ? wanEntity.state : 'unavailable';
    const alarmState = alarmEntity ? alarmEntity.state : 'disarmed';
    
    const isWanActive = (wanState === 'on' || wanState === 'connected' || wanState === 'home');

    if (!this.content) {
      this.innerHTML = `
        <ha-card>
          <style>
            .moglie-container { padding: 20px; text-align: center; cursor: pointer; }
            .text-box { line-height: 1.5; margin-bottom: 15px; font-size: 1.1em; }
            .img-container img { width: 110px; transition: all 0.5s ease; }
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
    }

    if (!isWanActive) {
      this.content.innerHTML = `Moglie is stranded.<br>The WAN connection<br>has been lost!`;
      this.content.classList.add("status-warning");
      this.image.classList.add("status-grayscale");
    } else if (alarmState === 'armed_away' || alarmState === 'armed_home') {
      this.content.innerHTML = `The rest of the primates are<br>on patrol. I'll watch the trees<br>until they get back!`;
      this.content.classList.remove("status-warning");
      this.image.classList.remove("status-grayscale");
    } else {
      this.content.innerHTML = `Welcome Home!<br>The WAN is strong.<br>Tell me you brought<br>more bananas!`;
      this.content.classList.remove("status-warning");
      this.image.classList.remove("status-grayscale");
    }
  }
}

customElements.define("moglie-ha-card", MoglieHaCard);

// Register card for the UI picker
window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === 'moglie-ha-card')) {
  window.customCards.push({
    type: "moglie-ha-card",
    name: "Moglie-HA",
    description: "WAN and Alarm status monitoring."
  });
}

// THE EDITOR - Fixed to ONLY show the two entity pickers
class MoglieHaCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this.renderForm();
  }

  renderForm() {
    if (!this._hass || !this._config) return;

    if (!this.formElement) {
      this.innerHTML = `<ha-form></ha-form>`;
      this.formElement = this.querySelector("ha-form");

      // Removed 'header' and generic 'entity'. Added specific named entities.
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
