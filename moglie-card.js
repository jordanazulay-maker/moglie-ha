set hass(hass) {
    this._hass = hass;
    if (!this.config) return;

    const hasWan = this.config.wan_entity && hass.states[this.config.wan_entity];
    const hasAlarm = this.config.alarm_entity && hass.states[this.config.alarm_entity];
    const hasWeather = this.config.weather_entity && hass.states[this.config.weather_entity];

    if (!hasWan && !hasAlarm && !hasWeather) return;

    const wanState = hasWan ? String(hass.states[this.config.wan_entity].state).toLowerCase() : 'on';
    const alarmState = hasAlarm ? String(hass.states[this.config.alarm_entity].state).toLowerCase() : 'disarmed';
    
    const isWanActive = wanState === 'on' || wanState === 'connected' || wanState === 'true';
    const isOffState = alarmState.includes('disarmed') || alarmState === 'off';
    const isHomeState = alarmState.includes('home') || alarmState.includes('night') || alarmState.includes('stay');

    // Standard border colors for daytime
    let dynamicBorder = "2px solid var(--primary-color, #03a9f4)";
    if (hasAlarm) {
      if (isOffState) dynamicBorder = "2px solid orange";
      else if (isHomeState) dynamicBorder = "2px solid green";
      else dynamicBorder = "2px solid red";
    }

    // Night Mode Logic
    const currentHour = new Date().getHours();
    const nightStart = parseInt(this.config.night_start) || 22;
    const nightEnd = parseInt(this.config.night_end) || 6;
    let isNightTime = nightStart > nightEnd ? (currentHour >= nightStart || currentHour < nightEnd) : (currentHour >= nightStart && currentHour < nightEnd);
    const showNight = (this.config.enable_night_mode !== false) && isNightTime;

    // Define the Patrol Subtitle (Only if alarm is configured)
    let patrolStatus = "";
    if (hasAlarm) {
      patrolStatus = (isOffState || isHomeState) 
        ? "The primates haven't started their patrol." 
        : "The primates are on patrol.";
    }

    // Quotes
    const quotes = {
      offline: this.config.quote_offline || "WAN connection lost!",
      // If alarm exists, append the patrol status in smaller, slightly faded text
      night: this.config.quote_night || `Zzz... Moglie is sleeping.${hasAlarm ? `<br><small style="opacity: 0.7;">(${patrolStatus})</small>` : ""}`,
      disarmed: this.config.quote_disarmed || "System's off! Taking a banana break.",
      armedHome: this.config.quote_armed_home || (hasWan ? "Welcome Home! WAN is strong." : "Welcome Home! Everything is secure."),
      armedAway: this.config.quote_armed_away || (hasWan ? "WAN stable. I'll watch the trees!" : "I'm watching the trees!")
    };

    this.image.style.filter = "none";
    
    // Priority Tree
    if (hasWan && !isWanActive) {
      this.updateUI('normal', normal_b64, quotes.offline, "2px solid gray");
      this.image.style.filter = "grayscale(100%)";
    } else if (showNight) {
      // RESTORED: Keep the cozy purple border!
      this.updateUI('sleepy', sleepy_b64, quotes.night, "2px solid #673AB7");
    } else if (hasAlarm) {
      const text = isOffState ? quotes.disarmed : (isHomeState ? quotes.armedHome : quotes.armedAway);
      this.updateUI('normal', normal_b64, text, dynamicBorder);
    } else {
      this.updateUI('normal', normal_b64, "Moglie is standing by!", dynamicBorder);
    }
  }
