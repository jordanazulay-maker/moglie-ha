class MoglieHaCard extends HTMLElement {
  static getStubConfig() {
    return {
      wan_entity: "",
      alarm_entity: "",
      click_entity: "",
      night_start: "22:00:00",
      night_end: "06:00:00"
    };
  }

  static getConfigElement() {
    return document.createElement("moglie-ha-card-editor");
  }

  setConfig(config) {
    this.config = config;
  }

  set hass(hass) {
    if (!this.config || !hass) return;
    
    this._hass = hass; 

    const wanId = this.config.wan_entity;
    const alarmId = this.config.alarm_entity;
    const wanEntity = hass.states[wanId];
    const alarmEntity = hass.states[alarmId];
    
    const wanState = wanEntity ? wanEntity.state : 'unavailable';
    const alarmState = alarmEntity ? alarmEntity.state : 'unknown';
    
    const isWanActive = ['on', 'connected', 'home', 'up'].includes(wanState);
    const isHomeState = ['armed_home'].includes(alarmState);
    const isOffState = ['off', 'disarmed'].includes(alarmState);

    // --- Night Mode Logic ---
    let isNightMode = false;
    if (this.config.night_start && this.config.night_end) {
      const now = new Date();
      // Format current time to HH:MM:SS to easily compare with HA's time selector string
      const currentTimeStr = now.toTimeString().split(' ')[0]; 
      
      const start = this.config.night_start;
      const end = this.config.night_end;

      if (start > end) {
        // Time window wraps around midnight (e.g. 22:00:00 to 06:00:00)
        isNightMode = currentTimeStr >= start || currentTimeStr <= end;
      } else {
        // Time window is within the same day (e.g. 01:00:00 to 05:00:00)
        isNightMode = currentTimeStr >= start && currentTimeStr <= end;
      }
    }

    // Include isNightMode in the statusKey so the card updates when the time crosses the threshold
    const statusKey = `${wanState}-${alarmState}-${isNightMode}`;
    if (this._lastStatus === statusKey) return; 
    this._lastStatus = statusKey;

    if (!this.content) {
      this.innerHTML = `
        <ha-card>
          <style>
            .moglie-container { padding: 20px; text-align: center; cursor: pointer; transition: all 0.3s ease; border-radius: var(--ha-card-border-radius, 12px); box-sizing: border-box; }
            .moglie-container:hover { background: rgba(var(--rgb-primary-text-color), 0.05); }
            .text-box { line-height: 1.5; margin-bottom: 10px; font-size: 1.1em; min-height: 80px; }
            .img-container img { width: 110px; transition: all 0.5s ease; pointer-events: none; }
            .status-warning { color: #e74c3c; font-weight: bold; }
            .status-grayscale { filter: grayscale(100%) opacity(0.6); transform: scale(0.95); }
          </style>
          <div class="moglie-container card-content">
            <div class="text-box"></div>
            <div class="img-container">
              <img alt="Moglie">
            </div>
          </div>
        </ha-card>
      `;
      this.container = this.querySelector(".moglie-container");
      this.content = this.querySelector(".text-box");
      this.image = this.querySelector(".img-container img");

      this.container.addEventListener("click", () => {
        const clickEntity = this.config.click_entity;
        if (!clickEntity) return;

        const event = new CustomEvent("hass-action", {
          detail: {
            config: {
              entity: clickEntity, 
              tap_action: {
                action: "more-info" 
              }
            },
            action: "tap"
          },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(event);
      });
    }

    // Dynamically assign the image source based on Night Mode
    const dayImage = "https://raw.githubusercontent.com/jordanazulay-maker/moglie-ha/refs/heads/main/monkey.png";
    const nightImage = "
