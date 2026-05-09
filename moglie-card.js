(function() {
  class MoglieCard extends HTMLElement {
    
    // 1. Provide default YAML for the card picker (Custom Editor crash fixed)
    static getStubConfig() { return { entity: "binary_sensor.moglie_status" }; }

    // 2. Validate the YAML configuration immediately
    setConfig(config) {
      if (!config.entity) {
        throw new Error("Moglie needs an 'entity' defined in your YAML configuration.");
      }
      this.config = config;
    }

    // 3. The Path Engine: Points strictly to your new PNG files
    getMonkeyUrl(state) {
      const baseUrl = "/local/community/moglie-ha/";
      
      // Fallback for system errors
      if (state === 'unavailable' || state === 'unknown') {
        return `${baseUrl}normal.png`; 
      }

      // Map the HA state to the exact PNG filenames you uploaded
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
      const entityId = this.config.entity;
      const stateObj = hass.states[entityId];

      // 4. SYSTEM CHECK: If the entity is broken, show the "Gray Error" state
      if (!stateObj || stateObj.state === 'unavailable' || stateObj.state === 'unknown') {
        this.renderStatus(`System Error: ${entityId} is Unavailable`, true);
        return;
      }

      if (!this.content) { this.initCard(); }
      this.updateCard(stateObj);
    }

    // 5. Visual Rendering: Handles the "Gray / Broken" UI
    renderStatus(msg, isError = false) {
      this.innerHTML = `
        <ha-card style="padding: 16px; text-align: center; border: ${isError ? '2px solid #ff5252' : 'none'}; background: ${isError ? '#2c2c2c' : 'var(--ha-card-background, white)'};">
          <div style="filter: grayscale(100%); opacity: 0.3;">
            <img src="/local/community/moglie-ha/normal.png" width="100">
          </div>
          <div style="margin-top: 10px; color: ${isError ? '#ff5252' : 'inherit'}; font-weight: bold;">
            ${msg}
          </div>
        </ha-card>
      `;
      this.content = null; // Forces a full re-render if the system comes back online
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

      // Point the image source to the engine's URL
      img.src = this.getMonkeyUrl(status);
      text.textContent = stateObj.attributes.friendly_name || "Moglie Status";

      // 6. Apply grayscale if the monkey is 'off' but the system is still healthy
      if (status === "off" || status === "not_home") {
        img.style.filter = "grayscale(100%) opacity(0.5)";
        this.content.style.background = "var(--secondary-background-color, #444)";
      } else {
        img.style.filter = "none";
        this.content.style.background = "var(--ha-card-background, white)";
      }
    }
  }

  customElements.define('moglie-card', MoglieCard);

  // Register in the Card Picker so it never disappears
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "moglie-card",
    name: "Moglie Card",
    description: "System-aware monkey status card.",
    preview: true
  });
})();
