// =========================================================
// RESTORED: MOGLIE VISUAL EDITOR (The "UX")
// =========================================================
class MoglieCardEditor extends HTMLElement {
  setConfig(config) {
    this.config = { ...config };
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }

  set hass(hass) {
    this._hass = hass;
  }

  render() {
    if (!this.config) return;

    // Build the Smart/Modular UI based on the README features
    this.innerHTML = `
      <style>
        .row { display: flex; align-items: center; margin-bottom: 12px; font-family: Roboto, sans-serif;}
        .row label { margin-left: 8px; font-weight: 500; color: var(--primary-text-color); }
        .section { padding: 12px; margin-bottom: 12px; background: var(--secondary-background-color); border-radius: 8px; border: 1px solid var(--divider-color); }
        .hidden { display: none; }
        input[type="text"], input[type="number"] { width: 100%; padding: 8px; margin-top: 8px; background: var(--card-background-color); color: var(--primary-text-color); border: 1px solid var(--divider-color); border-radius: 4px; }
        input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--primary-color); cursor: pointer; }
      </style>
      
      <div id="editor-form">
        <div class="row">
          <input type="checkbox" id="enable_typing" ${this.config.enable_typing !== false ? 'checked' : ''}>
          <label>Enable Typewriter Animation</label>
        </div>
        <div class="row">
          <input type="checkbox" id="hide_moglie" ${this.config.hide_moglie ? 'checked' : ''}>
          <label>Hide Moglie (Text Only Mode)</label>
        </div>

        <div class="section">
          <div class="row">
            <input type="checkbox" id="use_wan" ${this.config.use_wan ? 'checked' : ''}>
            <label>Enable WAN / Internet Monitor</label>
          </div>
          <div id="wan_opts" class="${this.config.use_wan ? '' : 'hidden'}">
            <input type="text" id="wan_entity" value="${this.config.wan_entity || ''}" placeholder="Entity ID (e.g. binary_sensor.wan)">
          </div>
        </div>

        <div class="section">
          <div class="row">
            <input type="checkbox" id="use_weather" ${this.config.use_weather ? 'checked' : ''}>
            <label>Enable Weather Monitor</label>
          </div>
          <div id="wthr_opts" class="${this.config.use_weather ? '' : 'hidden'}">
            <input type="text" id="weather_entity" value="${this.config.weather_entity || ''}" placeholder="Entity ID (e.g. weather.home)">
          </div>
        </div>

        <div class="section">
          <div class="row">
            <input type="checkbox" id="use_alarm" ${this.config.use_alarm ? 'checked' : ''}>
            <label>Enable Security / Alarm Monitor</label>
          </div>
          <div id="alrm_opts" class="${this.config.use_alarm ? '' : 'hidden'}">
            <input type="text" id="alarm_entity" value="${this.config.alarm_entity || ''}" placeholder="Entity ID (e.g. alarm_control_panel.home)">
          </div>
        </div>
        
        <div class="section">
          <div class="row">
            <input type="checkbox" id="enable_night_mode" ${this.config.enable_night_mode !== false ? 'checked' : ''}>
            <label>Enable Night Mode</label>
          </div>
          <div id="night_opts" class="${this.config.enable_night_mode !== false ? '' : 'hidden'}">
            <input type="number" id="night_start" value="${this.config.night_start || '20'}" placeholder="Night Start Hour (0-23)">
            <input type="number" id="night_end" value="${this.config.night_end || '7'}" placeholder="Night End Hour (0-23)">
          </div>
        </div>
      </div>
    `;

    // Bind inputs so Home Assistant saves them safely
    this.querySelectorAll('input').forEach(input => {
      input.addEventListener('change', (e) => this.valueChanged(e));
      if (input.type === 'text' || input.type === 'number') {
        input.addEventListener('keyup', (e) => this.valueChanged(e));
      }
    });
  }

  valueChanged(ev) {
    const target = ev.target;
    if (!this.config || !target) return;

    let value = target.type === 'checkbox' ? target.checked : target.value;
    if (this.config[target.id] === value) return;

    // Safely update config
    this.config = { ...this.config, [target.id]: value };

    // Dynamically show/hide sections like promised in the README
    if (target.id === 'use_wan') this.querySelector('#wan_opts').classList.toggle('hidden', !value);
    if (target.id === 'use_weather') this.querySelector('#wthr_opts').classList.toggle('hidden', !value);
    if (target.id === 'use_alarm') this.querySelector('#alrm_opts').classList.toggle('hidden', !value);
    if (target.id === 'enable_night_mode') this.querySelector('#night_opts').classList.toggle('hidden', !value);

    // Fire the official Home Assistant event to save the UI inputs to the background YAML
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this.config },
      bubbles: true,
      composed: true,
    }));
  }
}

// Ensure Home Assistant can find the Editor Class
customElements.define("moglie-card-editor", MoglieCardEditor);

// (Optional) Register in the HACS / Custom Card picker
window.customCards = window.customCards || [];
window.customCards.push({
  type: "moglie-card",
  name: "Moglie Card",
  preview: true,
  description: "A friendly companion for your Home Assistant dashboard."
});
