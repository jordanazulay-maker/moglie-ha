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
  // 2. THE MAIN MOGLIE CARD ENGINE (BASE64 VERSION)
  // ==========================================================
  class MoglieCard extends HTMLElement {
    
    // Link the card to our custom visual editor
    static getConfigElement() { return document.createElement("moglie-card-editor"); }
    static getStubConfig() { return { entity: "binary_sensor.moglie_status" }; }

    setConfig(config) {
      this.config = config;
    }

    // Base64 Routing Engine
    getMonkeyBase64(type) {
      // IMPORTANT: These variables must match the exact variable names you exported 
      // inside your imported JS files (e.g., normal-monkey.js, sleepy-monkey.js).
      // If your variables are named something like 'normalMonkeyBase64', change them here!
      const base64Images = {
        "festive": typeof festiveMonkey !== 'undefined' ? festiveMonkey : "",
        "normal": typeof normalMonkey !== 'undefined' ? normalMonkey : "",
        "rainy": typeof rainyMonkey !== 'undefined' ? rainyMonkey : "",
        "summer": typeof summerMonkey !== 'undefined' ? summerMonkey : "",
        "sweaty": typeof sweatyMonkey !== 'undefined' ? sweatyMonkey : "",
        "winter": typeof winterMonkey !== 'undefined' ? winterMonkey : "",
        "sleepy": typeof sleepyMonkey !== 'undefined' ? sleepyMonkey : ""
      };

      return base64Images[type] || base64Images["normal"];
    }

    set hass(hass) {
      if (!this.content) { this.initCard(); }
      
      const img = this.querySelector("#monkey-pic");
      const text = this.querySelector("#status-text");

      // --- NEW SAFE ERROR CHECK ---
      // If the config is missing an entity, OR the entity doesn't exist in Home Assistant
      if (!this.config || !this.config.entity || !hass.states[this.config.entity]) {
          
          // 1. Force the normal monkey image
          if (img) img.src = this.getMonkeyBase64("normal"); 
          
          // 2. Turn him gray and slightly faded
          if (img) img.style.filter = "grayscale(100%) opacity(0.6)";
          
          // 3. Set your custom error message safely
          if (text) {
              text.textContent = "I think the primates found a problem in your config. Check your YAML!";
              text.style.color = "#ff5252"; // Red text for error
          }
          
          // 4. Change background to highlight the error
          if (this.content) {
              this.content.style.border = "2px solid #ff5252";
              this.content.style.background = "var(--secondary-background-color, #2c2c2c)";
          }
          
          // STOP running the rest of the code so it doesn't crash reading state
          return; 
      }
      // --- END ERROR CHECK ---

      const stateObj = hass.states[this.config.entity];
      
      // Reset the error styling back to normal if the connection recovers
      if (text) text.style.color = "var(--primary-text-color)";
      if (this.content) {
          this.content.style.border = "none";
      }

      this.updateCard(stateObj);
    }

    initCard() {
      // Exactly matching your original uploaded HTML/CSS
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

      // Logic from your original uploaded file
      let type = "normal";
      const hour = new Date().getHours();
      
      if (hour > 22 || hour < 6) {
          type = "sleepy";
      } else if (status === "on" || status === "home") {
          type = "festive";
      }

      // Fetch the Base64 image
      img.src = this.getMonkeyBase64(type);
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
