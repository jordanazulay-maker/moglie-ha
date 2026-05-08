(function() {
  class MoglieCard extends HTMLElement {
    // 1. Tell Home Assistant the card exists for the 'Add Card' menu
    static getConfigElement() { return document.createElement("moglie-card-editor"); }
    static getStubConfig() { return { entity: "binary_sensor.moglie_status" }; }

    // 2. Validate the YAML configuration
    setConfig(config) {
      if (!config.entity) {
        throw new Error("Moglie needs an 'entity' defined in your YAML configuration.");
      }
      this.config = config;
    }

    // 3. The Path Engine: Points to your new PNG files in the HACS folder
    getMonkeyUrl(state) {
      const baseUrl = "/local/community/moglie-ha/";
      
      // Fallback for system errors
      if (state === 'unavailable' || state === 'unknown') {
        return `${baseUrl}monkey.png`; 
      }

      const images = {
        "on": "festive.png",
        "home": "festive.png",
        "off": "monkey.png",
        "rainy": "rainy.png",
        "summer": "summer.png",
        "sweaty": "sweaty.png",
        "winter": "winter.png",
        "sleep": "sleepy.png"
      };

      return `${baseUrl}${images[state] || "monkey.png"}`;
    }

    set hass(hass) {
      const entityId = this.config.entity;
      const stateObj = hass.states[entityId];

      // 4. SYSTEM CHECK: If the entity is broken, show the "Gray Error" state
      if (!stateObj || stateObj.state === 'unavailable' || stateObj.state === 'unknown') {
        this.renderStatus("System Error: Entity Unavailable", true);
        return;
      }

      if (!this.content) { this.initCard(); }
      this.updateCard(stateObj);
    }

    // 5. Visual Rendering: Handles both normal "off" (gray) and "error" (gray + red border)
    renderStatus(msg, isError = false) {
      this.innerHTML = `
        <ha-card style="padding: 16px; text-align: center; border: ${isError ? '2px solid #ff5252' : 'none'};">
          <div style="filter: grayscale(100%); opacity: 0.3;">
            <img src="/local/community/moglie-ha/monkey.png" width="100">
          </div>
          <div style="margin-top: 10px; color: ${isError ? '#ff5252' : 'inherit'}; font-weight: bold;">
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
          <div id="m-text" style="margin-top: 10px; font-weight: bold;"></div>
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

      // Apply grayscale if the monkey is 'off' or 'away'
      if (status === "off" || status === "not_home") {
        img.style.filter = "grayscale(100%) opacity(0.5)";
        this.content.style.background = "var(--secondary-background-color)";
      } else {
        img.style.filter = "none";
        this.content.style.background = "var(--ha-card-background, white)";
      }
    }
  }

  customElements.define('moglie-card', MoglieCard);

  // Register in the Card Picker
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "moglie-card",
    name: "Moglie Card",
    description: "System-aware monkey status card using PNG assets.",
    preview: true
  });
})();
