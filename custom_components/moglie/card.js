class MoglieHaCard extends HTMLElement {
  // 1. This makes the card show up in the Card Picker with default values
  static getStubConfig() {
    return {
      header: "Moglie",
      entity: "sun.sun"
    };
  }

  // 2. Set up the internal properties
  set hass(hass) {
    this._hass = hass;
    if (!this.content) {
      this.innerHTML = `
        <ha-card header="${this.config.header}">
          <div class="card-content"></div>
        </ha-card>
      `;
      this.content = this.querySelector(".card-content");
    }

    const entityId = this.config.entity;
    const state = hass.states[entityId] ? hass.states[entityId].state : 'N/A';
    this.content.innerHTML = `
      The state of <b>${entityId}</b> is ${state}.
    `;
  }

  // 3. Set the configuration from the UI/YAML
  setConfig(config) {
    if (!config.entity) {
      throw new Error("You need to define an entity");
    }
    this.config = config;
  }

  // 4. Determine the height of the card in the dashboard grid
  getCardSize() {
    return 1;
  }
}

// 5. Register the custom element
customElements.define("moglie-ha-card", MoglieHaCard);

// 6. Add metadata for the Home Assistant Card Picker
window.customCards = window.customCards || [];
window.customCards.push({
  type: "moglie-ha-card",
  name: "Moglie HA Card",
  preview: true,
  description: "A custom card for the Moglie-HA project"
});
