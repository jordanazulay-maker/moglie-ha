class MoglieHaCard extends HTMLElement {
  // 1. Metadata for the Card Picker
  static getStubConfig() {
    return {
      wan_entity: "",
      alarm_entity: ""
    };
  }

  // LINK THE EDITOR
  static getConfigElement() {
    return document.createElement("moglie-ha-card-editor");
  }

  // 2. Set the configuration from UI/YAML
  setConfig(config) {
    if (!config.wan_entity) {
      throw new Error("You need to define a WAN Status Entity");
    }
    if (!config.alarm_entity) {
      throw new Error("You need to define an Alarm Control Panel Entity");
    }
    this.config = config;
  }

  // 3. Logic and Rendering
  set hass(hass) {
    const wanId = this.config.wan_entity;
    const alarmId = this.config.alarm_entity;
    
    // Fetch states
    const wanEntity = hass.states[wanId];
    const alarmEntity = hass.states[alarmId];
    
    const wanState = wanEntity ? wanEntity.state : 'unavailable';
    const alarmState = alarmEntity ? alarmEntity.state : 'unavailable';
    
    // Check if WAN is active (you might need to adjust these state strings based on your specific sensor)
    const isWanActive = (wanState === 'on' || wanState === 'connected' || wanState === 'home');

    // Create the base structure once
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
            .moglie-container:hover {
              background: rgba(0, 0, 0, 0.05);
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
            .status-warning {
              color: #e74c3c;
              font-weight: bold;
            }
            .status-grayscale {
              filter: grayscale(100%) opacity(0.6);
              transform: scale(0.95);
            }
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
      
      // Handle navigation on click (Navigating to the Alarm history as an example)
      this.querySelector(".moglie-container").onclick = () => {
        const event = new Event("hass-action", { bubbles: true, composed: true });
        event.detail = {
          config: this.config,
          action: "navigate",
          navigation_path: `/history?entity_id=${alarmId}`
        };
        this.dispatchEvent(event);
      };
    }

    // Dynamic Updates
    if (isWanActive) {
      this.content.innerHTML = `
        Welcome Home!<br>
        The WAN is strong.<br>
        Tell me you brought<br>
        more bananas!
      `;
      this.content.classList.remove("status-warning");
      this.image.classList.remove("status-grayscale");
    } else {
      this.content.innerHTML = `
        Moglie is stranded.<br>
        The WAN connection<br>
        has been lost!
      `;
      this.content.classList.add("status-warning");
      this.image.classList.add("status-grayscale");
    }
  }

  getCardSize() {
    return 3;
  }
}

// 4. Register the main card element
customElements.define("moglie-ha-card", MoglieHaCard);

// 5. Add to Home Assistant Card Picker
window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === 'moglie-ha-card')) {
  window.customCards.push({
    type: "moglie-ha-card",
    name: "Moglie-HA",
    preview: true,
    description: "The official Moglie-HA dashboard card with dynamic mascot feedback."
  });
}

// =========================================
// 6. The Visual Editor Class
// =========================================
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

    // Build the form only once
    if (!this.formElement) {
      this.innerHTML = `<ha-form></ha-form>`;
      this.formElement = this.querySelector("ha-form");

      // Define the UI fields: WAN and Alarm Entities
      this.formElement.schema = [
        { 
          name: "wan_entity", 
          selector: { entity: {} } 
        },
        { 
          name: "alarm_entity", 
          selector: { entity: { domain: "alarm_control_panel" } } 
        }
      ];

      // Listen for changes in the UI and update the card's YAML
      this.formElement.addEventListener("value-changed", (ev) => {
        const event = new CustomEvent("config-changed", {
          detail: { config: ev.detail.value },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(event);
      });
    }

    // Keep the form updated with current states
    this.formElement.hass = this._hass;
    this.formElement.data = this._config;
  }
}

// Register the editor element
customElements.define("moglie-ha-card-editor", MoglieHaCardEditor);
