set hass(hass) {
    if (!this.config || !hass) return;
    
    this._hass = hass; 

    const wanId = this.config.wan_entity;
    const alarmId = this.config.alarm_entity;
    const wanEntity = hass.states[wanId];
    const alarmEntity = hass.states[alarmId];
    
    const wanState = wanEntity ? wanEntity.state : 'unavailable';
    const alarmState = alarmEntity ? alarmEntity.state : 'unknown';
    
    // Cleaner matching using arrays
    const isWanActive = ['on', 'connected', 'home', 'up'].includes(wanState);
    
    // Group away, night, and transitional states into the patrol condition
    const isOnPatrol = ['armed_away', 'armed_night', 'arming', 'pending'].includes(alarmState);

    const statusKey = `${wanState}-${alarmState}`;
    if (this._lastStatus === statusKey) return; 
    this._lastStatus = statusKey;

    if (!this.content) {
      this.innerHTML = `
        <ha-card>
          <style>
            .moglie-container { padding: 20px; text-align: center; cursor: pointer; transition: background 0.3s; border-radius: var(--ha-card-border-radius, 12px); }
            .moglie-container:hover { background: rgba(var(--rgb-primary-text-color), 0.05); }
            .text-box { line-height: 1.5; margin-bottom: 10px; font-size: 1.1em; min-height: 80px; }
            .img-container img { width: 110px; transition: all 0.5s ease; pointer-events: none; }
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

      // CLICK HANDLER: Set to more-info to open the control panel
      this.querySelector(".moglie-container").addEventListener("click", () => {
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

    if (!isWanActive) {
      this.content.innerHTML = `Moglie is stranded.<br>The WAN connection<br>has been lost!`;
      this.content.className = "text-box status-warning";
      this.image.className = "status-grayscale";
    } else if (isOnPatrol) {
      this.content.innerHTML = `The rest of the primates are<br>on patrol. I'll watch the trees<br>until they get back!`;
      this.content.className = "text-box";
      this.image.className = "";
    } else {
      // This will now correctly trigger for 'disarmed' and 'armed_home'
      this.content.innerHTML = `Welcome Home!<br>The WAN is strong.<br>Tell me you brought<br>more bananas!`;
      this.content.className = "text-box";
      this.image.className = "";
    }
  }
