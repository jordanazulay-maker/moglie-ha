set hass(hass) {
    this._hass = hass;
    if (!this.config) return;
    
    // Check if we have at least one entity to work with
    const hasWan = !!this.config.wan_entity;
    const hasAlarm = !!this.config.alarm_entity;
    const hasWeather = !!this.config.weather_entity;
    
    if (!hasWan && !hasAlarm && !hasWeather) return;

    // Fetch states safely
    const wanEntity = hasWan ? hass.states[this.config.wan_entity] : null;
    const alarmEntity = hasAlarm ? hass.states[this.config.alarm_entity] : null;
    const weatherEntity = hasWeather ? hass.states[this.config.weather_entity] : null;

    // Default values
    const wanState = wanEntity ? String(wanEntity.state).toLowerCase() : 'on';
    const alarmState = alarmEntity ? String(alarmEntity.state).toLowerCase() : 'disarmed';
    const weatherState = weatherEntity ? String(weatherEntity.state).toLowerCase() : 'unknown';
    
    const isWanActive = wanState === 'on' || wanState === 'connected' || wanState === 'true'; 
    const isOffState = alarmState.includes('disarmed') || alarmState === 'off';
    const isHomeState = alarmState.includes('home') || alarmState.includes('night') || alarmState.includes('stay') || alarmState.includes('partial');

    // ... (Keep existing Time/Holiday/Weather logic) ...

    const quotes = {
      offline: this.config.quote_offline || "Moglie is stranded. The WAN connection has been lost!",
      cold: this.config.quote_cold || "Brrr! It's freezing out there!",
      rain: this.config.quote_rain || "Looks like rain, grabbing my coat!",
      hot: this.config.quote_hot || "It's boiling! Need a banana smoothie.",
      night: this.config.quote_night || "Zzz... Moglie is sleeping...",
      disarmed: this.config.quote_disarmed || "System's off! I'm taking a banana break.",
      // DYNAMIC QUOTES: Only mention WAN if the entity exists
      armedHome: this.config.quote_armed_home || (hasWan ? "Welcome Home! The WAN is strong." : "Welcome Home! Everything looks secure."),
      armedAway: this.config.quote_armed_away || (hasWan ? "The WAN is stable. I'll watch the trees!" : "I'm watching the trees until you get back!")
    };

    // ... (Keep existing Border logic) ...

    // UI Priority Tree
    if (hasWan && !isWanActive) {
      this.updateUI('normal', normal_b64, quotes.offline, "2px solid var(--disabled-text-color, gray)");
      this.image.style.filter = "grayscale(100%)";
    } else if (isAprilFools) {
      this.updateUI('normal', normal_b64, "Why is the blood rushing to my head?", alarmBorder);
    } else if (isChristmas) {
      this.updateUI('festive', festive_b64, "Merry Christmas!", alarmBorder);
    } else if (isNightMode) {
      this.updateUI('sleepy', sleepy_b64, fullNightQuote, "2px solid #673AB7");
    } else if (hasWeather && isRaining) {
      this.updateUI('rainy', rainy_b64, quotes.rain, "2px solid #2196F3");
    } else if (hasWeather && showWinter) {
      this.updateUI('winter', winter_b64, quotes.cold, "2px solid #00BCD4");
    } else if (hasWeather && isHot) {
      this.updateUI('summer', summer_b64, quotes.hot, "2px solid #FF9800"); 
    } else if (hasAlarm) {
      // Use alarm-specific quotes if alarm is configured
      const text = isOffState ? quotes.disarmed : (isHomeState ? quotes.armedHome : quotes.armedAway);
      this.updateUI('normal', normal_b64, text, alarmBorder);
    } else {
      // Fallback if only WAN is configured and it is active
      this.updateUI('normal', normal_b64, "Everything looks good!", alarmBorder);
    }
  }
