(function() {
  // 1. Image Data (Keep your base64 strings here)
  const MONKEYS = {
    normal: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    error: "data:image/png;base64,..." 
  };

  class MoglieCard extends HTMLElement {
    // 2. Card Picker Registration
    static getConfigElement() {
      return document.createElement("moglie-card-editor");
    }

    static getStubConfig() {
      return { entity: "binary_sensor.moglie_status" };
    }

    // 3. Robust Config Validation
    setConfig(config) {
      if (!config.entity) {
        // This makes HA show its own red error card in the UI
        throw new Error("You must define an entity for Moglie.");
      }
      this.config = config;
    }

    set hass(hass) {
      const entityId = this.config.entity;
      const stateObj = hass.states[entityId];

      // 4. SYSTEM CHECK: If integration failed or YAML entity is wrong
      if (!stateObj || stateObj.state === 'unavailable') {
        this.renderStatus("System Error: Entity Unavailable", true);
        return;
      }

      if (!this.content) { this.initCard(); }
      this.updateCard(stateObj);
    }

    renderStatus(msg, isError = false) {
      this.innerHTML = `
        <ha-card style="padding: 16px; text-align: center; border: ${isError ? '2px solid #ff5252' : 'none'};">
          <div style="filter: grayscale(100%); opacity: 0.3;">
            <img src="${MONKEYS.normal}" width="100">
          </div>
          <div style="margin-top: 10px; color: ${isError ? '#ff5252' : 'inherit'};">
            <strong>${msg}</strong>
          </div>
        </ha-card>
      `;
    }

    initCard() {
      this.innerHTML = `<ha-card id="container" style="padding: 16px; text-align: center;"></ha-card>`;
      this.content = this.querySelector("#container");
    }

    updateCard(stateObj) {
        // Normal card logic here...
        this.content.innerHTML = `<div>${stateObj.state}</div>`;
    }
  }

  customElements.define('moglie-card', MoglieCard);

  // 5. Tell HA this card exists for the Picker UI
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "moglie-card",
    name: "Moglie Card",
    description: "A smart monkey card that monitors system health.",
    preview: true
  });
})();
