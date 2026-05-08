import { normal_monkey as n_b64 } from './normal-monkey.js';
import { winter_monkey as w_b64 } from './winter-monkey.js';
import { rainy_monkey as r_b64 } from './rainy-monkey.js';
import { summer_monkey as s_b64 } from './summer-monkey.js';
import { sleepy_monkey as sl_b64 } from './sleepy-monkey.js';
import { festive_monkey as f_b64 } from './festive-monkey.js';

/* -------------------------------------------------------------------
   MAIN CARD COMPONENT - ECO OPTIMIZED
------------------------------------------------------------------- */
class MoglieCard extends HTMLElement {
  static getConfigElement() { return document.createElement("moglie-card-editor"); }
  static getStubConfig() { return { wan_entity: "", alarm_entity: "", weather_entity: "", enable_night_mode: true, night_start: 22, night_end: 6 }; }

  setConfig(config) {
    this.config = config;
    if (!this.content) {
      this.innerHTML = `
        <ha-card>
          <div id="m-cont" style="padding: 16px; border-radius: 10px; text-align: center; transition: all 0.3s ease; cursor: pointer;">
            <img id="m-img" src="${n_b64}" style="width: 150px; height: 150px; object-fit: contain; transition: transform 0.5s ease;" />
            <div id="m-txt" style="margin-top: 10px; font-weight: bold; min-height: 2em;"></div>
          </div>
        </ha-card>`;
      this.cont = this.querySelector('#m-cont');
      this.img = this.querySelector('#m-img');
      this.txt = this.querySelector('#m-txt');

      this.cont.addEventListener('click', () => {
        if (this.config?.alarm_entity) this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: this.config.alarm_entity } }));
      });
    }
    if (!config.wan_entity && !config.alarm_entity && !config.weather_entity) this.showErr("⚠️ Configure at least one entity (WAN, Alarm, Weather).");
  }

  showErr(m) {
    this.txt.innerHTML = `<div style="margin-bottom:12px;">${m}</div>`;
    this.cont.style.border = "2px dashed red";
    this.img.style.filter = "grayscale(100%)";
  }

  set hass(hass) {
    if (!this.config) return;
    const c = this.config;
    
    const wan = c.wan_entity ? hass.states[c.wan_entity] : null;
    const alrm = c.alarm_entity ? hass.states[c.alarm_entity] : null;
    const wthr = c.weather_entity ? hass.states[c.weather_entity] : null;

    if (!wan && !alrm && !wthr) return;

    // Fast-track strings
    const wState = wan ? wan.state.toLowerCase() : 'on';
    const aState = alrm ? alrm.state.toLowerCase() : 'disarmed';
    const weState = wthr ? wthr.state.toLowerCase() : 'unknown';

    const d = new Date();
    const hr = d.getHours();

    // 🚀 ULTRA-OPTIMIZATION: The Fast-Bail Cache
    // Halts processing instantly if crucial elements haven't changed since the last HA tick
    const sHash = `${wState}|${aState}|${weState}|${hr}|${d.getDate()}|${c.enable_night_mode}`;
    if (this._last === sHash) return; 
    this._last = sHash;

    // Core Logic Flags
    const wanOk = /on|connected|true/.test(wState);
    const aOff = /disarmed|off/.test(aState);
    const aHome = /home|night|stay/.test(aState);

    // Weather Engine
    let t = null, isF = true, isC = false;
    if (wthr) {
      t = parseFloat(wthr.attributes?.temperature ?? weState);
      const unit = (wthr.attributes?.temperature_unit || wthr.attributes?.unit_of_measurement || 'F').toUpperCase();
      isF = unit.includes('F');
      isC = unit.includes('C');
    }
    const isRain = /(rain|pour|shower|storm)/.test(weState);
    const isSnow = /(snow|hail)/.test(weState);
    const isHot = t !== null && (isF ? t >= 80 : t >= 27);
    const isCold = t !== null && (isF ? t < 50 : t < 10);

    // Time & Holiday Engine
    const isWknd = d.getDay() === 0 || d.getDay() === 6;
    const mo = d.getMonth(), dt = d.getDate();
    const isXmas = mo === 11 && (dt === 24 || dt === 25); 
    const isApril = mo === 3 && dt === 1;

    const nS = parseInt(c.night_start) || 22, nE = parseInt(c.night_end) || 6;
    const isNight = nS > nE ? (hr >= nS || hr < nE) : (hr >= nS && hr < nE);
    const showNight = c.enable_night_mode !== false && isNight;

    // Text Engine: Greetings
    let greet = "";
    if (!showNight && !isXmas && !isApril) {
      if (hr >= 6 && hr < 11) greet = isWknd ? "Lazy weekend morning! " : "Good morning! I need a banana coffee. ";
      else if (hr >= 11 && hr < 17) greet = isWknd ? "Weekend vibes! " : "Afternoon watch is clear. ";
      else if (hr >= 17 && hr < nS) greet = "Sun's getting low. ";
    }

    // Text Engine: Night Troop Logic
    let nTxt = "The troop is sleeping...";
    if (alrm) {
      if (aHome) nTxt = "The troop is fast asleep in the canopy. <br><small style='color:#4CAF50;font-weight:bold;'>(Primates are silently securing the perimeter.)</small>";
      else if (aOff) nTxt = "The troop is sleeping... <br><small style='color:orange;font-weight:bold;'>(But the primates are off duty! Who is watching the trees?!)</small>";
      else nTxt = "The canopy is empty tonight. <br><small style='color:#F44336;font-weight:bold;'>(Primates are on HIGH ALERT in the dark!)</small>";
    }

    const aHomeTxt = (isWknd ? "The troop is relaxing in the branches. " : "The troop is home. ") + "The primates are on perimeter patrol.";
    const disTxt = "System's off! The primates ditched their post for a banana run.";

    const q = {
      off: c.quote_offline || "Moglie is stranded. The WAN connection has been lost!",
      cold: c.quote_cold || "Brrr! It's freezing out there!",
      rain: c.quote_rain || "Looks like rain, grabbing my coat!",
      hot: c.quote_hot || "It's boiling! Need a banana smoothie.",
      dis: c.quote_disarmed || `${greet}${disTxt}`,
      home: c.quote_armed_home || `${greet}${aHomeTxt}`,
      away: c.quote_armed_away || "The troop is away. The primates are watching the trees!",
      night: c.quote_night || nTxt
    };

    // Styling Engine
    let bdr = "2px solid #03a9f4";
    if (alrm) bdr = aOff ? "2px solid orange" : (aHome ? "2px solid #4CAF50" : "2px solid #F44336");

    this.img.style.filter = "none";
    if (isApril) this.img.classList.add('anti-gravity'); else this.img.classList.remove('anti-gravity');
    
    // Render Tree
    if (wan && !wanOk) {
      this.upd(n_b64, q.off, "2px solid gray");
      this.img.style.filter = "grayscale(100%)";
    }
    else if (isApril) this.upd(n_b64, "Why is the blood rushing to my head?", bdr);
    else if (isXmas) this.upd(f_b64, "Merry Christmas to the troop!", bdr);
    else if (showNight) this.upd(sl_b64, q.night, "2px solid #673AB7");
    else if (wthr && isRain) this.upd(r_b64, q.rain, "2px solid #2196F3");
    else if (wthr && (isSnow || isCold)) this.upd(w_b64, q.cold, "2px solid #00BCD4");
    else if (wthr && isHot) this.upd(s_b64, q.hot, "2px solid #FF9800"); 
    else if (alrm) this.upd(n_b64, aOff ? q.dis : (aHome ? q.home : q.away), bdr);
    else this.upd(n_b64, "Moglie is standing by!", bdr);
  }

  // DOM Minimizer: Only repaints if values diverge
  upd(img, txt, bdr) {
    if (this.img.src !== img) this.img.src = img;
    if (this.txt.innerHTML !== txt) this.txt.innerHTML = txt;
    if (this.cont.style.border !== bdr) this.cont.style.border = bdr;
  }
}
customElements.define('moglie-card', MoglieCard);

/* -------------------------------------------------------------------
   VISUAL EDITOR COMPONENT - STATIC CACHED
------------------------------------------------------------------- */
const MOGLIE_SCHEMA = [
  { name: "wan_entity", selector: { entity: { domain: "binary_sensor" } } },
  { name: "alarm_entity", selector: { entity: { domain: "alarm_control_panel" } } },
  { name: "weather_entity", selector: { entity: { domain: "weather" } } },
  { name: "enable_night_mode", label: "Enable Night Mode", selector: { boolean: {} } },
  { name: "night_start", selector: { number: { min: 0, max: 23, mode: "box" } } },
  { name: "night_end", selector: { number: { min: 0, max: 23, mode: "box" } } },
  { name: "quote_offline", selector: { text: {} } },
  { name: "quote_disarmed", selector: { text: {} } },
  { name: "quote_armed_home", selector: { text: {} } },
  { name: "quote_armed_away", selector: { text: {} } },
  { name: "quote_night", selector: { text: {} } },
  { name: "quote_hot", selector: { text: {} } },
  { name: "quote_cold", selector: { text: {} } },
  { name: "quote_rain", selector: { text: {} } }
];

const MOGLIE_LABELS = {
  wan_entity: "WAN Entity (binary_sensor)", alarm_entity: "Alarm Entity (alarm_control_panel)", weather_entity: "Weather Entity (weather)", enable_night_mode: "Enable Night Mode (Sleepy Monkey)", night_start: "Night Mode Start Hour (0-23)", night_end: "Night Mode End Hour (0-23)", quote_offline: "Custom Quote: WAN Offline", quote_disarmed: "Custom Quote: Disarmed", quote_armed_home: "Custom Quote: Armed Home", quote_armed_away: "Custom Quote: Armed Away", quote_night: "Custom Quote: Night Mode", quote_hot: "Custom Quote: Hot Weather", quote_cold: "Custom Quote: Cold Weather", quote_rain: "Custom Quote: Rainy Weather"
};

class MoglieCardEditor extends HTMLElement {
  setConfig(config) { this._cfg = config; if (this._f) this._f.data = config; else this.render(); }
  set hass(hass) { this._h = hass; if (this._f) this._f.hass = hass; else this.render(); }

  render() {
    if (!this._h || !this._cfg || this._f) return;
    this._f = document.createElement("ha-form");
    this._f.hass = this._h;
    this._f.data = this._cfg;
    this._f.schema = MOGLIE_SCHEMA;
    this._f.computeLabel = (s) => MOGLIE_LABELS[s.name] || s.name;
    this._f.addEventListener("value-changed", (ev) => {
      this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: ev.detail.value }, bubbles: true, composed: true }));
    });
    this.appendChild(this._f);
  }
}
customElements.define("moglie-card-editor", MoglieCardEditor);

/* -------------------------------------------------------------------
   CARD REGISTRATION
------------------------------------------------------------------- */
window.customCards = window.customCards || [];
window.customCards.push({ type: "moglie-card", name: "Moglie HA", description: "Moglie monitors your Troop, Weather, and Canopy with Eco-Intelligence.", preview: true });
