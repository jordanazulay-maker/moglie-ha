(function() {
  // ==========================================================
  // 1. THE VISUAL EDITOR COMPONENT
  // ==========================================================
  class MoglieCardEditor extends HTMLElement {
    setConfig(config) {
      this.config = config;
      
      // Build the UI if it doesn't exist yet
      if (!this.contentBuilt) {
        this.innerHTML = `
          <div style="padding-top: 10px;">
            <div style="margin-bottom: 16px;">
              <h3 style="margin-bottom: 8px;">🐒 Moglie Settings</h3>
              <p style="font-size: 0.9em; color: var(--secondary-text-color);">
                Link Moglie to a Home Assistant entity to bring the monkey to life.
              </p>
            </div>
            
            <div style="margin-bottom: 16px;">
              <label style="display: block; font-weight: bold; margin-bottom: 4px;">Tracked Entity (Required):</label>
              <input type="text" id="editor-entity" 
                     placeholder="e.g., person.jordan or binary_sensor.moglie_status" 
                     value="${this.config.entity || ''}" 
                     style="width: 100%; padding: 8px; border: 1px solid var(--divider-color, #ccc); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color);">
            </div>
            
            <div style="font-size: 0.8em; color: var(--secondary-text-color); margin-top: 10px;">
              <i>Note: Moglie will automatically turn gray if the system detects an error with this entity.</i>
            </div>
          </div>
        `;
        
        // Listen for when the user types in the box
        const input = this.querySelector('#editor-entity');
        input.addEventListener('focusout', this.valueChanged.bind(this));
        
        this.contentBuilt = true;
      }
    }

    // Tell Home Assistant to save the changes
    valueChanged(ev) {
      if (!this.config) return;
      const target = ev.target;
      
      if (this.config.entity === target.value) return;

      const newConfig = { ...this.config, entity: target.value };

      // Dispatch the official HA config-changed event
      const event = new Event("config-changed", {
        bubbles: true,
        composed: true,
      });
      event.detail = { config: newConfig };
      this.dispatchEvent(event);
    }
  }

  // Register the editor
  customElements.define("moglie-card-editor", MoglieCardEditor);


  // ==========================================================
  // 2. THE MAIN MOGLIE CARD ENGINE
  // ==========================================================
  class MoglieCard extends HTMLElement {
    
    // TURNED BACK ON: Link the card to our new visual editor!
    static getConfigElement() { return document.createElement("moglie-card-editor"); }
    static getStubConfig() { return { entity: "binary_sensor.moglie_status" }; }

    setConfig(config) {
      this.config = config;
    }

    getMonkeyUrl(state) {
      const baseUrl = "/hacsfiles/moglie-ha/";
      
      if (state === 'unavailable' || state === 'unknown') {
        return `${baseUrl}normal.png`; 
      }

      const images = {
        "on": "festive.png",
        "home": "festive.png",
        "off": "normal.png",
        "not_home": "normal.png",
        "rainy": "rainy.png",
        "summer": "summer.png",
        "sweaty": "sweaty.png",
        "winter": "winter.png",
        "sleep": "sleepy.png"
      };

      return `${baseUrl}${images[state] || "normal.png"}`;
    }

    set hass(hass) {
      // Safely tell the user to use the new editor if they haven't typed an entity yet
      if (!this.config || !this.config.entity) {
        this.renderStatus("Please use the editor to assign an Entity.", true);
        return;
      }

      const entityId = this.config.entity;
      const stateObj = hass.states[entityId];

      if (!stateObj || stateObj.state === 'unavailable' || stateObj.state === 'unknown') {
        this.renderStatus(`System Error: ${entityId} is Unavailable`, true);
        return;
      }

      if (!this.content) { this.initCard(); }
      this.updateCard(stateObj);
    }

    renderStatus(msg, isError = false) {
      this.innerHTML = `
        <ha-card style="padding: 16px; text-align: center; border: ${isError ? '2px solid #ff5252' : 'none'}; background: ${isError ? 'var(--secondary-background-color, #2c2c2c)' : 'var(--ha-card-background, white)'};">
          <div style="filter: grayscale(100%); opacity: 0.3;">
            <img src="/hacsfiles/moglie-ha/normal.png" width="100" onerror="this.style.display='none'">
          </div>
          <div style="margin-top: 10px; color: ${isError ? '#ff5252' : 'var(--primary-text-color)'}; font-weight: bold;">
            ${msg}
          </div>
        </ha-card>
      `;
      this.content = null; 
    }

    initCard() {
      this.innerHTML = `
        <ha-card id="m-cont" style="padding: 16px; text-align: center; transition: all 0.5s;">
          <img id="m-img" style="width: 100%; max-width: 200px; transition: filter 0.5s;">
          <div id="m-text" style="margin-top: 10px; font-weight: bold; color: var(--primary-text-color);"></div>
        </ha-card>
      `;
      this.content = this.querySelector("#m-cont");
    }

    updateCard(stateObj) {
      const img = this.querySelector("#m-img");
      const text = this.querySelector("#m-text");
      const status = stateObj.state;

      img.src = this.getMonkeyUrl(status);
      text.textContent = stateObj.attributes.friendly_name || "Moglie Status";

      if (status === "off" || status === "not_home") {
        img.style.filter = "grayscale(100%) opacity(0.5)";
        this.content.style.background = "var(--secondary-background-color, #444)";
      } else {
        img.style.filter = "none";
        this.content.style.background = "var(--ha-card-background, white)";
      }
    }

    getCardSize() {
      return 3;
    }
  }

  // Register the main card
  customElements.define('moglie-card', MoglieCard);

  // Expose it to the HA Picker
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "moglie-card",
    name: "Moglie Card",
    description: "System-aware monkey status card.",
    preview: true
  });
})();
