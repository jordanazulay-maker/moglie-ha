// Register the main card
customElements.define('moglie-card', MoglieCard);

// =========================================================
// RESTORED: MOGLIE VISUAL EDITOR (The "UX")
// =========================================================
class MoglieCardEditor extends HTMLElement {
  setConfig(config) {
    this.config = config;
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }

  set hass(hass) {
    this._hass = hass;
  }

  render() {
    // Build the Smart/Modular UI based on the README
    this.innerHTML = `
      <style>
        .row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; font-family: Roboto, sans-serif; }
        .section { padding: 16px; border: 1px solid var(--divider-color); border-radius: 8px; margin-bottom: 16px; background: var(--secondary-background-color); }
        .hidden { display: none !important; }
        input[type="text"], input[type="number"] { width: 100%; padding: 8px; margin-top: 6px; box-sizing: border-box; background: var(--card-background-color); color: var(--primary-text-color); border: 1px solid var(--divider-color); border-radius: 4px; }
        input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
        label { font-weight: 500; color: var(--primary-text-color); }
        .title { font-weight: bold; font-size: 1.1em; margin-bottom: 10px; display: block; border-bottom: 1px solid var(--divider-color); padding-bottom: 5px;}
      </style>
      <div id="editor-form">
        
        <div class="row">
          <label>Enable Typewriter Animation</label>
          <input type="checkbox" id="enable_typing" ${this.config.enable_typing !== false ? 'checked' : ''}>
        </div>
        <div class="row">
          <label>Hide Moglie (Text Only Mode)</label>
          <input type="checkbox" id="hide_moglie" ${this.config.hide_moglie ? 'checked' : ''}>
        </div>

        <div class="section">
          <div class="row" style="margin-bottom:0;">
            <label>Use WAN / Internet Monitor</label>
            <input type="checkbox" id="use_wan" ${this.config.use_wan ? 'checked' : ''}>
          </div>
          <div class="collapsible ${this.config.use_wan ? '' : 'hidden'}" id="wan_sec" style="margin-top:10px;">
            <label>WAN Sensor Entity</label>
            <input type="text" id="wan_entity" value="${this.config.wan_entity || ''}" placeholder="binary_sensor.wan_status">
          </div>
        </div>

        <div class="section">
          <div class="row" style="margin-bottom:0;">
            <label>Use Weather Monitor</label>
            <input type="checkbox" id="use_weather" ${this.config.use_weather ? 'checked' : ''}>
          </div>
          <div class="collapsible ${this.config.use_weather ? '' : 'hidden'}" id="weather_sec" style="margin-top:10px;">
            <label>Weather Entity</label>
            <input type="text" id="weather_entity" value="${this.config.weather_entity || ''}" placeholder="weather.home">
          </div>
        </div>

        <div class="section">
          <div class="row" style="margin-bottom:0;">
            <label>Use Security / Alarm Monitor</label>
            <input type="checkbox" id="use_alarm" ${this.config.use_alarm ? 'checked' : ''}>
          </div>
          <div class="collapsible ${this.config.use_alarm ? '' : 'hidden'}" id="alarm_sec" style="margin-top:10px;">
            <label>Alarm Control Panel Entity</label>
            <input type="text" id="alarm_entity" value="${this.config.alarm_entity || ''}" placeholder="alarm_control_panel.home">
          </div>
        </div>

        <div class="section">
          <div class="row" style="margin-bottom:0;">
            <label>Enable Night Mode</label>
            <input type="checkbox" id="enable_night_mode" ${this.config.enable_night_mode !== false ? 'checked' : ''}>
          </div>
          <div class="collapsible ${this.config.enable_night_mode !== false ? '' : 'hidden'}" id="night_sec" style="margin-top:10px;">
            <label>Night Start Hour (0-23)</label>
            <input type="number" id="night_start" value="${this.config.night_start !== undefined ? this.config.night_start : '20'}">
            <br><br>
            <label>Night End Hour (0-23)</label>
            <input type="number" id="night_end" value="${this.config.night_end !== undefined ? this.config.night_end : '7'}">
          </div>
        </div>

      </div>
    `;

    // Listen for UI changes and update the YAML config behind the scenes
    const form = this.querySelector('#editor-form');
    form.addEventListener('change', (e) => this.valueChanged(e));
    form.addEventListener('keyup', (e) => this.valueChanged(e));
  }

  valueChanged(ev) {
    const target = ev.target;
    if (!this.config || !target) return;

    let val = target.type === 'checkbox' ? target.checked : target.value;
    
    if (this.config[target.id] === val) return;

    const newConfig = { ...this.config, [target.id]: val };

    // Dynamic UI logic: Hide/Show groups based on toggles
    if (target.id === 'use_wan') this.querySelector('#wan_sec').classList.toggle('hidden', !val);
    if (target.id === 'use_weather') this.querySelector('#weather_sec').classList.toggle('hidden', !val);
    if (target.id === 'use_alarm') this.querySelector('#alarm_sec').classList.toggle('hidden', !val);
    if (target.id === 'enable_night_mode') this.querySelector('#night_sec').classList.toggle('hidden', !val);

    this.config = newConfig;
    
    // Tell Home Assistant to save the config
    const event = new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

// Register the Visual Editor
customElements.define("moglie-card-editor", MoglieCardEditor);

// Register in the Custom Card picker for HACS/Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
  type: "moglie-card",
  name: "Moglie Card",
  preview: true,
  description: "A friendly companion for your Home Assistant dashboard."
});
