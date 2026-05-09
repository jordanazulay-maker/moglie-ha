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
        
        const input = this.querySelector('#editor-entity');
        input.addEventListener('focusout', this.valueChanged.bind(this));
        this.contentBuilt = true;
      }
    }

    valueChanged(ev) {
      if (!this.config) return;
      const target = ev.target;
      if (this.config.entity === target.value) return;

      const newConfig = { ...this.config, entity: target.value };

      const event = new Event("config-changed", { bubbles: true, composed: true });
      event.detail = { config: newConfig };
      this.dispatchEvent(event);
    }
  }

  customElements.define("moglie-card-editor", MoglieCardEditor);


  // ==========================================================
  // 2. THE MAIN MOGLIE CARD ENGINE (PNG VERSION)
  // ==========================================================
  class MoglieCard extends HTMLElement {
    
    // Link the card to our custom visual editor
    static getConfigElement() { return document.createElement("moglie-card-editor"); }
    static getStubConfig() { return { entity: "binary_sensor.moglie_status" }; }

    setConfig(config) {
      this.config = config;
    }

    // PNG Routing Engine
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
      // 1. Missing Entity Check
      if (!this.config || !this.config.entity) {
        this.renderStatus("Please use the editor to assign an Entity.", true);
        return;
      }

      const entityId = this.config.entity;
      const stateObj = hass.states[entityId];

      // 2. System Error Check
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
      // Using the exact HTML IDs from your uploaded file
      this.innerHTML = `
        <style>
            #moglie-container { padding: 16px; text-align: center; transition: all 0.5s; }
            .monkey-img { width: 100%; max-width: 200px; transition: filter 0.5s; }
        </style>
        <ha-card id="moglie-container">
            <img id="monkey-pic" class="monkey-img" src="">
            <div id="status-text" style="margin-top: 10px; font-weight: bold;"></div>
        </ha-card>
      `;
      this.content = this.querySelector("#moglie-container");
    }

    updateCard(stateObj) {
      const status = stateObj.state;
      const img = this.querySelector("#monkey-pic");
      const text = this.querySelector("#status-text");

      // Logic from your uploaded file for choosing the monkey
      let type = "normal";
      const hour = new Date().getHours();
      
      if (hour > 22 || hour < 6) {
          type = "sleepy";
      } else if (status === "on" || status === "home") {
          type = "festive";
      }

      // Fetch the PNG instead of the Base64 array
      img.src = this.getMonkeyUrl(type);
      text.textContent = stateObj.attributes.friendly_name || "Moglie";

      // VISUAL CHECK: Turn gray if state is 'off'
      if (status === "off" || status === "not_home") {
          img.style.filter = "grayscale(100%) opacity(0.5)";
          this.content.style.background = "#444";
      } else {
          img.style.filter = "none";
          this.content.style.background = "var(--ha-card-background, white)";
      }
    }

    getCardSize() {
      return 3;
    }
  }

  customElements.define('moglie-card', MoglieCard);

  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "moglie-card",
    name: "Moglie Card",
    description: "System-aware monkey status card.",
    preview: true
  });
})();
