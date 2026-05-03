class MoglieHaCard extends HTMLElement {
  static getStubConfig() {
    return { wan_entity: "", alarm_entity: "" };
  }

  static getConfigElement() {
    return document.createElement("moglie-ha-card-editor");
  }

  setConfig(config) {
    if (!config.wan_entity) throw new Error("Please define a WAN entity");
    this.config = config;
  }

  set hass(hass) {
    if (!this.config) return;

    const wanId = this.config.wan_entity;
    const alarmId = this.config.alarm_entity;
    const wanEntity = hass.states[wanId];
    const alarmEntity = hass.states[alarmId];
    
    const wanState = wanEntity ? wanEntity.state : 'unavailable';
    const alarmState = alarmEntity ? alarmEntity.state : 'unknown';
    
    const isWanActive = (wanState === 'on' || wanState === 'connected' || wanState === 'home' || wanState === 'up');
    const isOnPatrol = (alarmState === 'armed_away');

    // Logic: Only update the DOM if the values actually changed
    const statusKey = `${wanState}-${alarmState}`;
    if (this._lastStatus === statusKey) return; 
    this._lastStatus = statusKey;

    if (!this.content) {
      this.innerHTML = `
        <ha-card>
          <style>
            .moglie-container { padding: 20px; text-align: center; cursor: pointer; transition: background 0.3s; }
            .moglie-container:hover { background: rgba(255,255,255,0.05); }
            .text-box { line-height: 1.5; margin-bottom: 10px; font-size: 1.1em; min-height: 80px; }
            .img-container img { width: 110px; transition: all 0.5s ease; }
            .status-warning { color: #e74c3c; font-weight: bold; }
            .status-grayscale { filter: grayscale(100%) opacity(0.6); transform: scale(0.95); }
          </style>
          <div class="moglie-container card-content">
            <div class="text-box"></div>
            <div class="img-container">
              <img src="https://raw.githubusercontent.com/jordanazulay-maker/moglie-ha/refs/heads/main/monkey.png" alt="Moglie">
            </div>
          </div>
        </ha-card>
      `;
      this.content = this.querySelector(".text-box");
      this.image = this.querySelector(".img-container img");

      // RESTORE CLICK ACTION
      this.querySelector(".moglie-container").addEventListener("click", () => {
        const event = new CustomEvent("hass-action", {
          detail: {
            config: this.config,
            action: "navigate",
            navigation_path: `/history?entity_id=${wanId}`
          },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(event);
      });
    }

    // Update Content
    if (!isWanActive) {
      this.content.innerHTML = `Moglie is stranded.<br>The WAN connection<br>has been lost!`;
      this.content.className = "text-box status-warning";
      this.image.className = "status-grayscale";
    } else if (isOnPatrol) {
      this.content.innerHTML = `The rest of the primates are<br>on patrol. I'll watch the trees<br>until they get back!`;
      this.content.className = "text-box";
      this.image.className = "";
    } else {
      this.content.innerHTML = `Welcome Home!<br>The WAN is strong.<br>Tell me you brought<br>more bananas!`;
      this.content.className = "text-box";
      this.image.className = "";
    }
  }
}
