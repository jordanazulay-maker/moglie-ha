import { normal_monkey as n_b64 } from './normal-monkey.js';
import { MOGLIE_TRANSLATIONS } from './moglie-localization.js';

const basePath = new URL('.', import.meta.url).href;

const cb = '?v=1.0.0';

const w_png = basePath + 'winter.png' + cb;
const r_png = basePath + 'rainy.png' + cb;
const s_png = basePath + 'summer.png' + cb;
const sw_png = basePath + 'sweaty.png' + cb;
const sl_png = basePath + 'sleepy.png' + cb;
const f_png = basePath + 'festive.png' + cb;
const f1_png = basePath + 'festive1.png' + cb;

class MoglieCard extends HTMLElement {
  static getConfigElement() { return document.createElement("moglie-card-editor"); }

  static getStubConfig() {
    return {
      use_wan: false,
      use_alarm: false,
      use_weather: false,
      wan_entity: "",
      alarm_entity: "",
      weather_entity: "",
      use_tap_entity: false,
      use_hold_entity: false,
      tap_entity: "",
      hold_entity: "",
      enable_night_mode: true,
      night_start: "",
      night_end: "",
      enable_typing: true,
      use_custom_quotes: false,
      hide_moglie: false
    };
  }

  getCardSize() {
    return 3;
  }

  disconnectedCallback() {
    if (this._typeTimer) clearTimeout(this._typeTimer);
    if (this.pressTimer) clearTimeout(this.pressTimer);
  }

  setConfig(config) {
    this.config = { ...config };
    this._last = null;
    this._currentAlertEntity = null;

    if (!this.cont) {
      this.innerHTML = `
        <style>
          .anti-gravity { transform: rotate(180deg); }
          #m-cont { 
            padding: 16px; border-radius: 10px; text-align: center; transition: all 0.3s ease; 
            cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; 
            user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
          }
          #m-img { 
            width: 100%; max-width: 150px; height: auto; aspect-ratio: 1/1; object-fit: contain; 
            transition: transform 0.5s ease; z-index: 1; pointer-events: none;
          }
          #m-txt { margin-bottom: 15px; font-weight: bold; min-height: 3.5em; width: 95%; line-height: 1.4; color: var(--primary-text-color); display: flex; flex-direction: column; align-items: center; justify-content: center; }
          .rtl { direction: rtl; text-align: right; }
          .hidden { display: none !important; }
        </style>
        <ha-card>
          <div id="m-cont">
            <div id="m-txt"></div>
            <img id="m-img" src="${n_b64}" />
          </div>
        </ha-card>`;
      this.cont = this.querySelector('#m-cont');
      this.img = this.querySelector('#m-img');
      this.txt = this.querySelector('#m-txt');

      this.isHold = false;
      let isTouch = false;

      const startPress = () => {
        this.isHold = false;
        if (this.pressTimer) clearTimeout(this.pressTimer);
        this.pressTimer = setTimeout(() => {
          this.isHold = true;
          this.img.style.transform = "scale(1.1) rotate(-5deg)";
          setTimeout(() => { this.img.style.transform = "scale(1) rotate(0deg)"; }, 200);
          this.handleAct('hold');
        }, 500); 
      };

      const endPress = () => {
        if (this.pressTimer) clearTimeout(this.pressTimer);
      };

      this.cont.addEventListener('touchstart', () => { isTouch = true; startPress(); }, { passive: true });
      this.cont.addEventListener('touchend', endPress);
      this.cont.addEventListener('touchmove', endPress, { passive: true });
      this.cont.addEventListener('touchcancel', endPress);
      this.cont.addEventListener('mousedown', () => { if (!isTouch) startPress(); });
      this.cont.addEventListener('mouseup', () => { if (!isTouch) endPress(); });
      this.cont.addEventListener('mouseleave', () => { if (!isTouch) endPress(); });
      this.cont.addEventListener('contextmenu', (e) => e.preventDefault());

      this.cont.addEventListener('click', () => {
        if (this.isHold) return; 
        this.img.style.transform = "scale(1.1) rotate(5deg)";
        setTimeout(() => { this.img.style.transform = "scale(1) rotate(0deg)"; }, 200);
        this.handleAct('tap');
      });
    }
  }

  typeMessage(message) {
    if (this._typeTimer) clearTimeout(this._typeTimer);

    if (this.config.enable_typing === false) {
      this.txt.innerHTML = message;
      return;
    }

    let i = 0;
    const type = () => {
      if (i < message.length) {
        // FIX: Account for both HTML Tags AND encoded HTML entities/emojis
        if (message.charAt(i) === '<') {
          let end = message.indexOf('>', i);
          i = end !== -1 ? end + 1 : i + 1;
        } else if (message.charAt(i) === '&') {
          let end = message.indexOf(';', i);
          i = end !== -1 ? end + 1 : i + 1;
        } else {
          i++;
        }
        this.txt.innerHTML = message.substring(0, i);
        this._typeTimer = setTimeout(type, 30);
      }
    };
    type();
  }

  showErr(m) {
    if (this._typeTimer) clearTimeout(this._typeTimer);
    this.img.setAttribute('src', n_b64);
    this.img.style.filter = "grayscale(100%) opacity(0.6)";
    this.txt.innerHTML = `<span style="color: #ff5252;">${m}</span>`;
    this.cont.style.border = "2px dashed #ff5252";
    // FIX: Clear the cache so it forces a re-render when the error resolves
    this._last = null; 
  }

  set hass(hass) {
    if (!this.config) return;
    const c = this.config;

    let lang = (hass.language || "en").split("-")[0];
    if (lang === "zh") lang = "zh-CN"; 

    const defaultQuotes = MOGLIE_TRANSLATIONS[lang] || MOGLIE_TRANSLATIONS["en"];

    if (lang === "he" || lang === "ar") this.txt.classList.add('rtl'); else this.txt.classList.remove('rtl');
    if (c.hide_moglie) this.img.classList.add('hidden'); else this.img.classList.remove('hidden');

    const wan = (c.use_wan && c.wan_entity) ? hass.states[c.wan_entity] : null;
    const alrm = (c.use_alarm && c.alarm_entity) ? hass.states[c.alarm_entity] : null;
    const wthr = (c.use_weather && c.weather_entity) ? hass.states[c.weather_entity] : null;

    if ((c.use_wan && !wan) || (c.use_alarm && !alrm) || (c.use_weather && !wthr)) {
        return this.showErr(defaultQuotes.error || "Entity not found");
    }

    const wState = wan ? wan.state.toLowerCase() : 'on';
    const aState = alrm ? alrm.state.toLowerCase() : 'none';
    const weState = wthr ? wthr.state.toLowerCase() : 'unknown';

    const d = new Date();
    const hr = d.getHours();
    const month = d.getMonth(); 
    const day = d.getDate();

    const unit = hass.config?.unit_system?.temperature || '°C';

    let t = null, h = null, isRain = false, isThunder = false;
    if (c.use_weather && wthr) {
      isThunder = /(thunder|storm|lightning|tornado)/.test(weState);
      isRain = /(rain|pour|drizzle|shower)/.test(weState) && !isThunder; 
      
      // FIX: Ensure temp doesn't default to 70 and melt a celsius user's dashboard
      t = wthr.attributes?.temperature !== undefined ? parseFloat(wthr.attributes.temperature) : null;
      h = wthr.attributes?.humidity !== undefined ? parseFloat(wthr.attributes.humidity) : null;
    }

    const isCold = t !== null && ((unit === '°F' && t < 50) || (unit !== '°F' && t < 10));
    const isHot = t !== null && ((unit === '°F' && t > 80) || (unit !== '°F' && t > 26));

    const wanOk = c.use_wan ? /on|connected|true/.test(wState) : true;
    const aOff = c.use_alarm ? /disarmed|off/.test(aState) : false;
    const aHome = c.use_alarm ? /home|stay|night/.test(aState) : false;

    const nS = parseInt(c.night_start);
    const nE = parseInt(c.night_end);

    let isNight = false;
    if (!isNaN(nS) && !isNaN(nE)) {
      isNight = nS > nE ? (hr >= nS || hr < nE) : (hr >= nS && hr < nE);
    }

    const showNight = c.enable_night_mode !== false && isNight;

    const safeStr = (s) => s || "";

    let greet = "";
    if (!showNight) {
        if (hr < 11) greet = safeStr(defaultQuotes.morning);
        else if (hr >= 11 && hr < 17) greet = safeStr(defaultQuotes.afternoon);
        else greet = safeStr(defaultQuotes.evening); 
    }

    const uQ = c.use_custom_quotes;
    const checkQ = (key, defaultText, useGreet = false) => {
      if (uQ && typeof c[key] !== 'undefined') {
        return c[key] === "" ? "" : (useGreet ? greet + c[key] : c[key]);
      }
      return useGreet ? greet + safeStr(defaultText) : safeStr(defaultText);
    };

    const safeThunder = defaultQuotes.thunder || "Thunder and lightning! Grabbing my raincoat!";

    const q = {
      nice_day: (uQ && typeof c.quote_nice_day !== 'undefined') 
                  ? (c.quote_nice_day === "" ? "" : greet + c.quote_nice_day) 
                  : (greet ? greet.trim() : "Hello!"),
      off: checkQ('quote_offline', defaultQuotes.off),
      rain: checkQ('quote_rain', defaultQuotes.rain, true),
      thunder: checkQ('quote_thunder', safeThunder, false), 
      dis: checkQ('quote_disarmed', defaultQuotes.dis, true), 
      home: checkQ('quote_armed_home', defaultQuotes.home, true), 
      away: checkQ('quote_armed_away', defaultQuotes.away, true),
      night: checkQ('quote_night', defaultQuotes.night),
      hot: checkQ('quote_hot', defaultQuotes.hot, true),
      cold: checkQ('quote_cold', defaultQuotes.cold, true)
    };

    let outfit = n_b64, quote = "", border = "2px solid #4CAF50", isGrayscale = false;

    if (c.use_wan && !wanOk) { 
        outfit = n_b64; quote = q.off; border = "2px solid gray"; isGrayscale = true; 
        this._currentAlertEntity = c.wan_entity;
    } else if (showNight) { 
        outfit = sl_png; quote = q.night; border = "2px solid #673AB7"; 
        this._currentAlertEntity = c.alarm_entity || c.weather_entity || c.wan_entity;
    } else if (c.use_weather && isThunder) { 
        outfit = r_png; quote = q.thunder; border = "2px solid #607D8B";
        this._currentAlertEntity = c.weather_entity;
    } else if (c.use_weather && isRain) { 
        outfit = r_png; quote = q.rain; border = "2px solid #2196F3"; 
        this._currentAlertEntity = c.weather_entity;
    } else if (c.use_weather && isCold) { 
        outfit = w_png; quote = q.cold; border = "2px solid #00BCD4"; 
        this._currentAlertEntity = c.weather_entity;
    } else if (c.use_weather && isHot) { 
        outfit = (h !== null && h > 70) ? sw_png : s_png; quote = q.hot; border = "2px solid #FF9800"; 
        this._currentAlertEntity = c.weather_entity;
    } else if (c.use_alarm) { 
        if (aOff) { 
            outfit = n_b64; quote = q.dis; border = "2px solid orange"; 
        } else if (!aHome) {
            outfit = n_b64; quote = q.away; border = "2px solid #F44336";
        } else {
            outfit = n_b64; quote = q.home; border = "2px solid #4CAF50";
        }
        this._currentAlertEntity = c.alarm_entity;
    } else {
      outfit = n_b64; 
      border = "2px solid #4CAF50";
      quote = q.nice_day;
      this._currentAlertEntity = c.alarm_entity || c.weather_entity || c.wan_entity || null;
    }

    let patrolTxt = "";
    if (c.use_alarm && alrm && wanOk) {
      if (aHome) patrolTxt = `<br><small style="color:#4CAF50;">${safeStr(defaultQuotes.p_patrol)}</small>`;
      else if (aOff) patrolTxt = `<br><small style="color:orange;">${safeStr(defaultQuotes.p_off)}</small>`;
      else patrolTxt = `<br><small style="color:#F44336;">${safeStr(defaultQuotes.p_alert)}</small>`;
    }

    if (month === 9 && day === 31) { 
        outfit = f1_png;
    } else if (month === 11 && day === 25) { 
        outfit = f_png; 
    }

    const visualHash = `${outfit}|${quote}|${patrolTxt}|${border}|${isGrayscale}|${c.hide_moglie}`;
    if (this._last === visualHash) return; 
    this._last = visualHash;

    this.img.src = outfit;
    this.img.style.filter = isGrayscale ? "grayscale(100%)" : "none";
    this.cont.style.border = border;
    this.typeMessage(quote + patrolTxt);
  }

  handleAct(a) {
    // FIX: Provide a default action so 'hass-action' opens 'more-info' natively on click
    const act = this.config[a + '_action'] || { action: 'more-info' };

    let targetEntity = this._currentAlertEntity || this.config.alarm_entity || this.config.wan_entity || ""; 

    if (a === 'tap' && this.config.use_tap_entity) targetEntity = this.config.tap_entity;
    if (a === 'hold' && this.config.use_hold_entity) targetEntity = this.config.hold_entity;

    const actionConfig = { ...this.config };

    if (targetEntity) {
      actionConfig.entity = targetEntity;
    }

    if (act && act.action && act.action !== 'none') {
      // Apply the defaulted or defined action string to pass cleanly to HA handler
      actionConfig[a + '_action'] = act;
      
      this.dispatchEvent(new CustomEvent('hass-action', {
        bubbles: true,
        composed: true,
        detail: {
          config: actionConfig,
          action: a
        }
      }));
    }
  }
}

customElements.define('moglie-card', MoglieCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "moglie-card",
  name: "Moglie Card",
  preview: true,
  description: "A friendly companion for your Home Assistant dashboard."
});
