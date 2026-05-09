(function() {
  class MoglieCard extends HTMLElement {
    
    static getStubConfig() { return { entity: "binary_sensor.moglie_status" }; }

    // 1. SAFE CONFIGURATION: We no longer throw an error here. 
    // Throwing an error here crashes the Home Assistant live preview.
    setConfig(config) {
      this.config = config;
    }

    // 2. The Path Engine
    getMonkeyUrl(state) {
      const baseUrl = "/local/community/moglie-ha/";
      
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
      // 3. SAFE ENTITY CHECK: We handle the missing entity here instead of setConfig
      if (!this.config || !this.config.entity) {
        this.renderStatus("Please define an 'entity' in your YAML.", true);
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
        <ha-card style="padding: 16px; text-align: center; border: ${isError ? '2px solid #ff5252' : 'none'}; background: ${isError ? '#2c2c2c' : 'var(--ha-card-background, white)'};">
          <div style="filter: grayscale(100%); opacity: 0.3;">
            <img src="/local/community/moglie-ha/normal.png" width="100" onerror="this.style.display='none'">
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

      if (status === "off" || status === "not_home") {
        img.style.filter = "grayscale(100%) opacity(0.5)";
        this.content.style.background = "var(--secondary-background-color, #444)";
      } else {
        img.style.filter = "none";
        this.content.style.background = "var(--ha-card-background, white)";
      }
    }

    // Tells Home Assistant roughly how big the card is for dashboard spacing
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
