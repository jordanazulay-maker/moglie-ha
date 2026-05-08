import { normal_monkey as n_b64 } from './normal-monkey.js';
import { winter_monkey as w_b64 } from './winter-monkey.js';
import { rainy_monkey as r_b64 } from './rainy-monkey.js';
import { summer_monkey as s_b64 } from './summer-monkey.js';
import { sweaty_monkey as sw_b64 } from './sweaty-monkey.js';
import { sleepy_monkey as sl_b64 } from './sleepy-monkey.js';
import { festive_monkey as f_b64 } from './festive-monkey.js';

class MoglieCard extends HTMLElement {
  static getConfigElement() { return document.createElement("moglie-card-editor"); }
  static getStubConfig() { return { use_wan: false, use_alarm: false, use_weather: false, wan_entity: "", alarm_entity: "", weather_entity: "", enable_night_mode: true, night_start: 22, night_end: 6, use_custom_quotes: false, hide_moglie: false, enable_hold: false }; }

  setConfig(config) {
    this.config = { ...config };
    if (this.config.use_wan === undefined) this.config.use_wan = !!this.config.wan_entity;
    if (this.config.use_alarm === undefined) this.config.use_alarm = !!this.config.alarm_entity;
    if (this.config.use_weather === undefined) this.config.use_weather = !!this.config.weather_entity;
    
    this._last = null;

    if (!this.content) {
      this.innerHTML = `
        <style>
          .anti-gravity { transform: rotate(180deg); }
          #m-cont { padding: 16px; border-radius: 10px; text-align: center; transition: all 0.3s ease; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; }
          #m-img { width: 100%; max-width: 150px; height: auto; aspect-ratio: 1/1; object-fit: contain; transition: transform 0.5s ease; }
          #m-txt { margin-top: 10px; font-weight: bold; min-height: 2em; width: 100%; }
        </style>
        <ha-card>
          <div id="m-cont">
            <img id="m-img" src="${n_b64}" />
            <div id="m-txt"></div>
          </div>
        </ha-card>`;
      this.cont = this.querySelector('#m-cont');
      this.img = this.querySelector('#m-img');
      this.txt = this.querySelector('#m-txt');

      let timer, moved = false;
      this.cont.addEventListener('pointerdown', () => {
        moved = false;
        timer = setTimeout(() => { timer = null; if (this.config.enable_hold) this.handleAct('hold'); }, 500);
      });
      this.cont.addEventListener('pointermove', () => { moved = true; if (timer) clearTimeout(timer); });
      this.cont.addEventListener('pointercancel', () => { if (timer) clearTimeout(timer); });
      this.cont.addEventListener('pointerup', () => {
        if (timer && !moved) { clearTimeout(timer); this.handleAct('tap'); }
      });
    }

    if (!(this.config.use_wan && this.config.wan_entity) && 
        !(this.config.use_alarm && this.config.alarm_entity) && 
        !(this.config.use_weather && this.config.weather_entity)) {
      this.showErr("⚠️ Enable and configure at least one entity (WAN, Alarm, Weather).");
    }
  }

  handleAct(a) {
    const act = this.config[a + '_action'];
    if (!act) {
      if (a === 'tap' && this.config.alarm_entity) {
        this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: this.config.alarm_entity } }));
      }
      return;
    }
    this.dispatchEvent(new CustomEvent('hass-action', { bubbles: true, composed: true, detail: { config: this.config, action: a } }));
  }

  showErr(m) {
    this.txt.innerHTML = `<div style="margin-bottom:12px;">${m}</div>`;
    this.cont.style.border = "2px dashed var(--error-color, red)";
    this.img.style.filter = "grayscale(100%)";
  }

  set hass(hass) {
    if (!this.config) return;
    const c = this.config;
    
    const wan = (c.use_wan && c.wan_entity) ? hass.states[c.wan_entity] : null;
    const alrm = (c.use_alarm && c.alarm_entity) ? hass.states[c.alarm_entity] : null;
    const wthr = (c.use_weather && c.weather_entity) ? hass.states[c.weather_entity] : null;

    if (!wan && !alrm && !wthr) return;

    const wState = wan ? wan.state.toLowerCase() : 'on';
    const aState = alrm ? alrm.state.toLowerCase() : 'disarmed';
    const weState = wthr ? wthr.state.toLowerCase() : 'unknown';

    const d = new Date();
    const hr = d.getHours();

    const sHash = `${wState}|${aState}|${weState}|${hr}|${d.getDate()}|${c.enable_night_mode}|${c.use_custom_quotes}|${c.hide_moglie}|${c.use_wan}|${c.use_alarm}|${c.use_weather}|${c.enable_hold}`;
    if (this._last === sHash) return; 
    this._last = sHash;

    const wanOk = /on|connected|true/.test(wState);
    const aOff = /disarmed|off/.test(aState);
    const aHome = /home|night|stay/.test(aState);

    let t = null, h = null, isF = true, isC = false;
    if (wthr) {
      t = parseFloat(wthr.attributes?.temperature ?? weState);
      h = parseFloat(wthr.attributes?.humidity ?? 0);
      const unit = (wthr.attributes?.temperature_unit || wthr.attributes?.unit_of_measurement || 'F').toUpperCase();
      isF = unit.includes('F');
      isC = unit.includes('C');
    }
    const isRain = /(rain|pour|shower|storm)/.test(weState);
    const isSnow = /(snow|hail)/.test(weState);
    const isHot = t !== null && (isF ? t >= 80 : t >= 27);
    const isCold = t !== null && (isF ? t < 50 : t < 10);
    const isHumid = h > 70;

    const isWknd = d.getDay() === 0 || d.getDay() === 6;
    const mo = d.getMonth(), dt = d.getDate();
    const isXmas = mo === 11 && (dt === 24 || dt === 25); 
    const isApril = mo === 3 && dt === 1;

    const nS = c.night_start !== undefined && c.night_start !== "" ? parseInt(c.night_start) : 22;
    const nE = c.night_end !== undefined && c.night_end !== "" ? parseInt(c.night_end) : 6;
    const isNight = nS > nE ? (hr >= nS || hr < nE) : (hr >= nS && hr < nE);
    const showNight = c.enable_night_mode !== false && isNight;

    let greet = "";
    if (!showNight && !isXmas && !isApril) {
      if (hr >= 6 && hr < 11) greet = isWknd ? "Lazy weekend morning! " : "Good morning! I need a banana coffee. ";
      else if (hr >= 11 && hr < 17) greet = isWknd ? "Weekend vibes! " : "Afternoon watch is clear. ";
      else if (hr >= 17 && hr < nS) greet = "Sun's getting low. ";
    }

    let patrolTxt = "";
    if (alrm) {
      if (aHome) {
        patrolTxt = showNight 
          ? "<br><small style='color:var(--success-color, #4CAF50);font-weight:bold;'>(Primates are silently securing the perimeter.)</small>" 
          : "<br><small style='color:var(--success-color, #4CAF50);font-weight:bold;'>(Primates are on perimeter patrol.)</small>";
      } else if (aOff) {
        patrolTxt = "<br><small style='color:var(--warning-color, orange);font-weight:bold;'>(But the primates are off duty! Who is watching the trees?!)</small>";
      } else {
        patrolTxt = showNight 
          ? "<br><small style='color:var(--error-color, #F44336);font-weight:bold;'>(Primates are on HIGH ALERT in the dark!)</small>" 
          : "<br><small style='color:var(--error-color, #F44336);font-weight:bold;'>(Primates are on HIGH ALERT!)</small>";
      }
    }

    let nTxt = "The troop is sleeping...";
    if (alrm) {
      if (aHome) nTxt = "The troop is fast asleep in the canopy.";
      else if (aOff) nTxt = "The troop is sleeping...";
      else nTxt = "The canopy is empty tonight.";
    }

    const uQ = c.use_custom_quotes;
    const q = {
      off: (uQ && c.quote_offline) || "Moglie is stranded. The WAN connection has been lost!",
      cold: (uQ && c.quote_cold) || "Brrr! It's freezing out there!",
      rain: (uQ && c.quote_rain) || "Looks like rain, grabbing my coat!",
      hot: (uQ && c.quote_hot) || "It's boiling! Need a banana smoothie.",
      dis: (uQ && c.quote_disarmed) || `${greet}System's off! The troop is relaxing.`,
      home: (uQ && c.quote_armed_home) || `${greet}${isWknd ? "The troop is relaxing in the branches." : "The troop is home."}`,
      away: (uQ && c.quote_armed_away) || "The troop is away.",
      night: (uQ && c.quote_night) || nTxt
    };

    let outfit = n_b64;
    let quote = "Moglie is standing by!";
    let border = "2px solid var(--primary-color, #03a9f4)";
    let isGrayscale = false;

    if (alrm) {
      border = aOff ? "2px solid var(--warning-color, orange)" : (aHome ? "2px solid var(--success-color, #4CAF50)" : "2px solid var(--error-color, #F44336)");
      quote = aOff ? q.dis : (aHome ? q.home : q.away);
    }

    if (wan && !wanOk) { 
      outfit = n_b64; 
      quote = q.off; 
      border = "2px solid var(--disabled-text-color, gray)"; 
      isGrayscale = true; 
      patrolTxt = ""; 
    }
    else if (isApril) { 
      outfit = n_b64; 
      quote = "Why is the blood rushing to my head?"; 
    }
    else if (isXmas) { 
      outfit = f_b64; 
      quote = "Merry Christmas to the troop!"; 
    }
    else if (showNight) { 
      outfit = sl_b64; 
      quote = q.night; 
      border = "2px solid var(--primary-color, #673AB7)"; 
    }
    else if (wthr && isRain) { 
      outfit = r_b64; 
      quote = q.rain; 
      border = "2px solid var(--info-color, #2196F3)"; 
    }
    else if (wthr && (isSnow || isCold)) { 
      outfit = w_b64; 
      quote = q.cold; 
      border = "2px solid var(--info-color, #00BCD4)"; 
    }
    else if (wthr && isHot) { 
      outfit = isHumid ? sw_b64 : s_b64; 
      quote = q.hot; 
      border = "2px solid var(--warning-color, #FF9800)"; 
    }

    quote += patrolTxt;

    if (c.hide_moglie) {
      this.img.style.display = "none";
      let cleanQuote = quote.replace(/<br>|<small.*?>|<\/small>/g, ' ').replace(/\s+/g, ' ').trim();
      quote = `<div style="color: var(--secondary-text-color, gray); font-size: 0.85em; text-transform: uppercase; margin-bottom: 4px;">Moglie's latest update:</div><i>"${cleanQuote}"</i>`;
    } else {
      this.img.style.display = "block";
    }

    this.img.style.filter = isGrayscale ? "grayscale(100%)" : "none";
    if (isApril && !c.hide_moglie) this.img.classList.add('anti-gravity'); else this.img.classList.remove('anti-gravity');

    this.upd(outfit, quote, border);
  }

  upd(img, txt, bdr) {
    if (this.img.getAttribute('src') !== img) this.img.setAttribute('src', img);
    if (this.txt.innerHTML !== txt) this.txt.innerHTML = txt;
    if (this.cont.style.border !== bdr) this.cont.style.border = bdr;
  }
}
customElements.define('moglie-card', MoglieCard);

const M_LBLS = {
  monitored_features: "Features to Monitor",
  wan_entity: "WAN Entity", alarm_entity: "Alarm Entity", weather_entity: "Weather Entity", 
  tap_action: "Tap Action", hold_action: "Hold Action", enable_hold: "Enable Hold Action",
  tap_action_entity: "Entity to Toggle (Tap)", hold_action_entity: "Entity to Toggle (Hold)",
  tap_action_perform: "Action to Perform (Tap)", tap_action_data: "Action Data (Tap)",
  hold_action_perform: "Action to Perform (Hold)", hold_action_data: "Action Data (Hold)",
  enable_night_mode: "Enable Night Mode", night_start: "Night Start Hour", night_end: "Night End Hour", 
  hide_moglie: "Hide Moglie (Text Only Mode)", use_custom_quotes: "Enable Custom Quotes", 
  quote_offline: "Quote: WAN Offline", quote_disarmed: "Quote: Disarmed", 
  quote_armed_home: "Quote: Armed Home", quote_armed_away: "Quote: Armed Away", 
  quote_night: "Quote: Night Mode", quote_hot: "Quote: Hot Weather", 
  quote_cold: "Quote: Cold Weather", quote_rain: "Quote: Rainy Weather"
};

class MoglieCardEditor extends HTMLElement {
  setConfig(config) { 
    this._cfg = { ...config }; 
    
    if (this._cfg.use_wan === undefined) this._cfg.use_wan = !!this._cfg.wan_entity;
    if (this._cfg.use_alarm === undefined) this._cfg.use_alarm = !!this._cfg.alarm_entity;
    if (this._cfg.use_weather === undefined) this._cfg.use_weather = !!this._cfg.weather_entity;

    this._cfg.monitored_features = [];
    if (this._cfg.use_wan) this._cfg.monitored_features.push("wan");
    if (this._cfg.use_alarm) this._cfg.monitored_features.push("alarm");
    if (this._cfg.use_weather) this._cfg.monitored_features.push("weather");

    if (this._f) { this._f.data = this._cfg; this._upd(); } else this.render(); 
  }
  
  set hass(hass) { this._h = hass; if (this._f) this._f.hass = hass; else this.render(); }

  _upd() {
    const s = [
      { 
        name: "monitored_features", 
        selector: { 
          select: { 
            multiple: true, 
            mode: "dropdown",
            options: [
              { label: "WAN Status", value: "wan" },
              { label: "Security Alarm", value: "alarm" },
              { label: "Weather", value: "weather" }
            ]
          } 
        } 
      }
    ];

    if (this._cfg.use_wan) s.push({ name: "wan_entity", selector: { entity: { domain: "binary_sensor" } } });
    if (this._cfg.use_alarm) s.push({ name: "alarm_entity", selector: { entity: { domain: "alarm_control_panel" } } });
    if (this._cfg.use_weather) s.push({ name: "weather_entity", selector: { entity: { domain: "weather" } } });

    // Tap Action Config
    s.push({ name: "tap_action", selector: { ui_action: {} } });
    if (this._cfg.tap_action?.action === "perform-action") {
        s.push({ name: "tap_action_perform", selector: { action: {} } });
        s.push({ name: "tap_action_data", selector: { object: {} } });
    } else if (this._cfg.tap_action?.action === "toggle") {
        s.push({ name: "tap_action_entity", selector: { entity: {} } });
    }

    // Hold Action Config (Now optional)
    s.push({ name: "enable_hold", selector: { boolean: {} } });
    if (this._cfg.enable_hold) {
        s.push({ name: "hold_action", selector: { ui_action: {} } });
        if (this._cfg.hold_action?.action === "perform-action") {
            s.push({ name: "hold_action_perform", selector: { action: {} } });
            s.push({ name: "hold_action_data", selector: { object: {} } });
        } else if (this._cfg.hold_action?.action === "toggle") {
            s.push({ name: "hold_action_entity", selector: { entity: {} } });
        }
    }

    s.push({ name: "enable_night_mode", selector: { boolean: {} } });

    if (this._cfg.enable_night_mode !== false) {
      s.push({ type: "grid", schema: [
        { name: "night_start", selector: { number: { min: 0, max: 23, mode: "box" } } },
        { name: "night_end", selector: { number: { min: 0, max: 23, mode: "box" } } }
      ]});
    }

    s.push(
      { name: "hide_moglie", selector: { boolean: {} } },
      { name: "use_custom_quotes", selector: { boolean: {} } }
    );

    if (this._cfg.use_custom_quotes) {
      s.push(
        { name: "quote_offline", selector: { text: {} } }, { name: "quote_disarmed", selector: { text: {} } },
        { name: "quote_armed_home", selector: { text: {} } }, { name: "quote_armed_away", selector: { text: {} } },
        { name: "quote_night", selector: { text: {} } }, { name: "quote_hot", selector: { text: {} } },
        { name: "quote_cold", selector: { text: {} } }, { name: "quote_rain", selector: { text: {} } }
      );
    }
    this._f.schema = s;
  }

  render() {
    if (!this._h || !this._cfg || this._f) return;
    this._f = document.createElement("ha-form");
    this._f.hass = this._h;
    this._f.data = this._cfg;
    this._upd();
    this._f.computeLabel = (s) => M_LBLS[s.name] || s.name;
    this._f.addEventListener("value-changed", (e) => {
      const newConfig = { ...e.detail.value };
      const feats = newConfig.monitored_features || [];
      newConfig.use_wan = feats.includes("wan");
      newConfig.use_alarm = feats.includes("alarm");
      newConfig.use_weather = feats.includes("weather");

      this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: newConfig }, bubbles: true, composed: true }));
    });
    this.appendChild(this._f);
  }
}
customElements.define("moglie-card-editor", MoglieCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({ type: "moglie-card", name: "Moglie HA", description: "Moglie Troop & Canopy Monitor", preview: true });
