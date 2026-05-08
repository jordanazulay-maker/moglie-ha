/**
 * MOGLIE HOME ASSISTANT CARD
 * Integrated Version with System Error Checking
 */

// --- MONKEY IMAGE DATA (BASE64) ---
const MONKEYS = {
  normal: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAByAAAAkwCAMAAAD70dgNAAAC01BMVEUAAADdw6bMsZW3m4JaR0GahX3grGpELymDbWPls2k...", // (truncated for length)
  winter: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAByAAAAkwCAMAAAD70dgNAAAC4lBMVEUAAAC2ra2dlpZ8dXRgVlY+LCpVUlU5JyQ6Kys9Iy...",
  rainy: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAByAAAAkwCAMAAAD70dgNAAAC1lBMVEUAAACfjYt0YF1WQT1lUk5ELCg6IBs6Hxs6HRk6HR...",
  summer: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAByAAAAkwCAMAAAD70dgNAAAC61BMVEUAAADPwLXItaaYiIPqy6N6amXguYRtXFdPPDjy3c...",
  sweaty: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAByAAAAkwCAMAAAD70dgNAAACbVBMVEUAAAD////66s7c7vL20a77w4TYxrryu5j7unC1x...",
  sleepy: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAByAAAAkwCAMAAAD70dgNAAAC5VBMVEUAAACTkIxzb2mEgHY1MjSBemwtLTEqKi+FeWYnK...",
  festive: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAByAAAAkwCAMAAAD70dgNAAAC01BMVEUAAAAtIRwiEw+snYokFBEoFxSwoIwtGxjn1bs2I..."
};

class MoglieCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("moglie-card-editor");
  }

  static getStubConfig() {
    return {
      entity: "",
      use_wan: false,
      use_weather: false,
      enable_night_mode: true,
      night_start: 22,
      night_end: 6
    };
  }

  // 1. SYSTEM CHECK: Validate YAML configuration immediately
  setConfig(config) {
    if (!config.entity) {
      throw new Error("Moglie needs a valid 'entity' defined in your YAML configuration.");
    }
    this.config = { ...config };
  }

  set hass(hass) {
    this._hass = hass;
    const entityId = this.config.entity;
    const stateObj = hass.states[entityId];

    // 2. SYSTEM CHECK: Check if entity exists or is in an error state
    if (!stateObj || stateObj.state === 'unavailable' || stateObj.state === 'unknown') {
      this.renderError(`Entity "${entityId}" is currently unavailable. Check your HA configuration.`);
      return;
    }

    if (!this.content) {
      this.initCard();
    }

    this.updateCard(stateObj);
  }

  // 3. SYSTEM CHECK: Render a "Grayed Out" Error UI
  renderError(message) {
    this.innerHTML = `
      <ha-card style="padding: 16px; background: #2c2c2c; color: #ff5252; border: 1px solid #ff5252;">
        <div style="display: flex; align-items: center; justify-content: center; flex-direction: column;">
          <ha-icon icon="mdi:alert-circle-outline" style="--mdc-icon-size: 40px; margin-bottom: 10px;"></ha-icon>
          <div style="text-align: center;">
            <div style="font-weight: bold; font-size: 1.1em;">Moglie System Error</div>
            <div style="font-size: 0.85em; color: #bbb; margin-top: 4px;">${message}</div>
          </div>
          <div style="filter: grayscale(100%); opacity: 0.2; margin-top: 15px;">
            <img src="${MONKEYS.normal}" width="100">
          </div>
        </div>
      </ha-card>
    `;
    this.content = null; // Ensure we re-init if fixed
  }

  initCard() {
    this.innerHTML = `
      <style>
        .anti-gravity { transform: rotate(180deg); }
        #m-cont { padding: 16px; border-radius: 10px; text-align: center; transition: all 0.3s ease; }
        .monkey-img { width: 100%; max-width: 250px; transition: filter 0.5s ease; }
        .status-text { margin-top: 8px; font-weight: bold; font-size: 1.2em; }
      </style>
      <ha-card id="m-cont">
        <div id="monkey-wrapper">
          <img id="monkey-display" class="monkey-img" src="">
        </div>
        <div id="status-display" class="status-text"></div>
      </ha-card>
    `;
    this.content = this.querySelector("#m-cont");
  }

  updateCard(stateObj) {
    const status = stateObj.state;
    const imgElement = this.querySelector("#monkey-display");
    const textElement = this.querySelector("#status-display");

    // Example Logic: Change monkey based on state or time
    let monkeyType = "normal";
    
    // Night Mode Check
    const hour = new Date().getHours();
    if (this.config.enable_night_mode && (hour >= this.config.night_start || hour < this.config.night_end)) {
      monkeyType = "sleepy";
    } else if (status === "on" || status === "home") {
      monkeyType = "festive";
    }

    imgElement.src = MONKEYS[monkeyType];
    textElement.textContent = stateObj.attributes.friendly_name || "Moglie Status";
    
    // Apply grayscale if the state is 'off'
    if (status === "off" || status === "not_home") {
        imgElement.style.filter = "grayscale(100%) opacity(0.6)";
        this.content.style.background = "#f0f0f0";
    } else {
        imgElement.style.filter = "none";
        this.content.style.background = "var(--ha-card-background, white)";
    }
  }

  getCardSize() {
    return 3;
  }
}

customElements.define('moglie-card', MoglieCard);
