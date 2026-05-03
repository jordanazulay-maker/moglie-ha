class MoglieHaCard extends HTMLElement {
  // 1. This makes the card show up in the Card Picker with default values
  static getStubConfig() {
    return {
      header: "Moglie Status",
      entity: "sun.sun"
    };
  }

  // 2. Set up the internal properties and render logic
  set hass(hass) {
    this._hass = hass;
    const entityId = this.config.entity;
    const entity = hass.states[entityId];
    const state = entity ? entity.state : 'unavailable';
    
    // Only create the card structure once
    if (!this.content) {
      this.innerHTML = `
        <ha-card>
          <style>
            .moglie-container {
              padding: 16px;
              text-align: center;
              cursor: pointer;
            }
            .text {
              line-height: 1.4;
              margin-bottom: 12px;
            }
            .img img {
              width: 100px;
              transition: filter 0.3s ease;
            }
            .stranded {
              color: #e74c3c;
              font-weight: bold;
            }
            .grayscale {
              filter: grayscale(100%) opacity(0.7);
            }
          </style>
          <div class="moglie-container card-content"></div>
        </ha-card>
      `;
      this.content = this.querySelector(".card-content");
    }

    // 3. Dynamic content logic
    const imgUrl = "https://raw.githubusercontent.com/jordanazulay-maker/moglie-ha/refs/heads/main/monkey.png";
    
    if (state === 'on' || state === 'above_horizon') {
      this.content.innerHTML = `
        <div class="text">
          Welcome Home!<br>
          We've checked all the trees,<br>
          no surprises here.<br>
          Please tell me you<br>
          brought us more bananas!
        </div>
        <div class="img">
          <img src="${imgUrl}">
        </div>
      `;
    } else {
      this.content.innerHTML = `
        <div class="text stranded">
          Moglie is stranded.<br>
          He can't find the<br>
          rest of the pack!
        </div>
        <div class="img">
          <img src="${imgUrl}" class="grayscale">
        </div>
      `;
    }

    // Handle the tap action (navigation)
    this.onclick = () => {
      const event = new Event("hass-action", {
        bubbles: true,
        composed: true,
      });
      event.detail = {
        config: this.config,
        action: "navigate",
        navigation_path: `/history?entity_id=${entityId}`
      };
      this.dispatchEvent(event);
    };
  }

  // 4. Set the configuration from the UI/YAML
  setConfig(config) {
    if (!config.entity) {
      throw new Error("You need to define an entity");
    }
    this.config = config;
  }

  // 5. Determine the height of the card in the dashboard grid
  getCardSize() {
    return 3;
  }
}

// 6. Register the custom element
customElements.define("moglie-ha-card", MoglieHaCard);

// 7. Add metadata for the Home Assistant Card Picker
window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === 'moglie-ha-card')) {
  window.customCards.push({
    type: "moglie-ha-card",
    name: "Moglie HA Card",
    preview: true,
    description: "A custom card for the Moglie-HA project featuring a dynamic monkey mascot."
  });
}
