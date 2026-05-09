import { normal_monkey as n_b64 } from './normal-monkey.js';
import { winter_monkey as w_b64 } from './winter-monkey.js';
import { rainy_monkey as r_b64 } from './rainy-monkey.js';
import { summer_monkey as s_b64 } from './summer-monkey.js';
import { sweaty_monkey as sw_b64 } from './sweaty-monkey.js';
import { sleepy_monkey as sl_b64 } from './sleepy-monkey.js';
import { festive_monkey as f_b64 } from './festive-monkey.js';
import { MOGLIE_TRANSLATIONS } from './moglie-localization.js';

class MoglieCard extends HTMLElement {
  static getConfigElement() { return document.createElement("moglie-card-editor"); }
  static getStubConfig() { return { use_wan: false, use_alarm: false, use_weather: false, wan_entity: "", alarm_entity: "", weather_entity: "", enable_night_mode: true, night_start: 22, night_end: 6, use_custom_quotes: false, hide_moglie: false }; }

  setConfig(config) {
    this.config = { ...config };
    this._last = null;
    this._typing = false;

    if (!this.content) {
      this.innerHTML = `
        <style>
          .anti-gravity { transform: rotate(180deg); }
          #m-cont { padding: 16px; border-radius: 10px; text-align: center; transition: all 0.3s ease; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; }
          #m-img { width: 100%; max-width: 150px; height: auto; aspect-ratio: 1/1; object-fit: contain; transition: transform 0.5s ease; z-index: 1; }
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

      this.cont.addEventListener('click', () => {
          this.img.style.transform = "scale(1.1) rotate(5deg)";
          setTimeout(() => { this.img.style.transform = "scale(1) rotate(0deg)"; }, 200);
          this.handleAct('tap');
      });
    }
  }

  typeMessage(message) {
    if (this._typing) return;
    this._typing = true;
    this.txt.innerHTML = "";
    let i = 0;
    const type = () => {
      if (i < message.length) {
        if (message.charAt(i) === '<') {
          let end = message.indexOf('>', i);
          this.txt.innerHTML += message.substring(i, end + 1);
          i = end + 1;
        } else {
          this.txt.innerHTML += message.charAt(i);
          i++;
        }
        setTimeout(type, 30);
      } else {
        this._typing = false;
      }
    };
    type();
  }

  showErr(m) {
    this.img.setAttribute('src', n_b64);
    this.img.style.filter = "grayscale(100%) opacity(0.6)";
    this.txt.innerHTML = `<span style="color: #ff5252;">${m}</span>`;
    this.cont.style.border = "2px dashed #ff5252";
  }

  set hass(hass) {
    if (!this.config) return;
    const c = this.config;
    const lang = (hass.language || "en").split("-")[0];
    const defaultQuotes = MOGLIE_TRANSLATIONS[lang] || MOGLIE_TRANSLATIONS["en"];
    
    if (lang === "he") this.txt.classList.add('rtl'); else this.txt.classList.remove('rtl');
    if (c.hide_moglie) this.txt.classList.add('hidden'); else this.txt.classList.remove('hidden');

    const wan = (c.use_wan && c.wan_entity) ? hass.states[c.wan_entity] : null;
    const alrm = (c.use_alarm && c.alarm_entity) ? hass.states[c.alarm_entity] : null;
    const wthr = (c.use_weather && c.weather_entity) ? hass.states[c.weather_entity] : null;

    if (c.use_wan && c.wan_entity && !wan) return this.showErr("I think the primates found a problem in your config. Check your YAML!");
    if (c.use_alarm && c.alarm_entity && !alrm) return this.showErr("I think the primates found a problem in your config. Check your YAML!");
    if (c.use_weather && c.weather_entity && !wthr) return this.showErr("I think the primates found a problem in your config. Check your YAML!");

    const wState = wan ? wan.state.toLowerCase() : 'on';
    const aState = alrm ? alrm.state.toLowerCase() : 'disarmed';
    const weState = wthr ? wthr.state.toLowerCase() : 'unknown';

    const d = new Date();
    const hr = d.getHours();
    const sHash = `${wState}|${aState}|${weState}|${hr}|${lang}|${c.hide_moglie}`;
    if (this._last === sHash) return; 
    this._last = sHash;

    const wanOk = /on|connected|true/.test(wState);
    const aOff = /disarmed|off/.test(aState);
    const aHome = /home|stay|night/.test(aState);
    
    let t = null, h = null, isRain = /(rain|pour|storm)/.test(weState);
    if (wthr) {
      t = parseFloat(wthr.attributes?.temperature ?? 70);
      h = parseFloat(wthr.attributes?.humidity ?? 0);
    }

    const nS = parseInt(c.night_start || 22);
    const nE = parseInt(c.night_end || 6);
    const isNight = nS > nE ? (hr >= nS || hr < nE) : (hr >= nS && hr < nE);
    const showNight = c.enable_night_mode !== false && isNight;

    // Greeting Logic
    let greet = "";
    if (!showNight) {
        if (hr >= 6 && hr < 11) greet = defaultQuotes.morning;
        else if (hr >= 11 && hr < 17) greet = defaultQuotes.afternoon;
        else if (hr >= 17 && hr < nS) greet = defaultQuotes.evening;
    }

    const uQ = c.use_custom_quotes;
    const q = {
      off: (uQ && c.quote_offline) || defaultQuotes.off,
      rain: (uQ && c.quote_rain) || defaultQuotes.rain,
      dis: (uQ && c.quote_disarmed) || (greet + defaultQuotes.dis),
      home: (uQ && c.quote_armed_home) || (greet + defaultQuotes.home),
      away: (uQ && c.quote_armed_away) || defaultQuotes.away,
      night: (uQ && c.quote_night) || defaultQuotes.night,
      hot: (uQ && c.quote_hot) || defaultQuotes.hot,
      cold: (uQ && c.quote_cold) || defaultQuotes.cold
    };

    let outfit = n_b64, quote = q.home, border = "2px solid #4CAF50", isGrayscale = false;

    if (!wanOk) { 
        outfit = n_b64; quote = q.off; border = "2px solid gray"; isGrayscale = true; 
    } else if (showNight) { 
        outfit = sl_b64; quote = q.night; border = "2px solid #673AB7"; 
    } else if (isRain) { 
        outfit = r_b64; quote = q.rain; border = "2px solid #2196F3"; 
    } else if (t !== null && t < 50) { 
        outfit = w_b64; quote = q.cold; border = "2px solid #00BCD4"; 
    } else if (t !== null && t > 80) { 
        outfit = (h > 70) ? sw_b64 : s_b64; quote = q.hot; border = "2px solid #FF9800"; 
    } else if (aOff) { 
        outfit = n_b64; quote = q.dis; border = "2px solid orange"; 
    } else if (!aHome) {
        outfit = n_b64; quote = q.away; border = "2px solid #F44336";
    }

    let patrolTxt = "";
    if (alrm && wanOk) {
      if (aHome) patrolTxt = `<br><small style="color:#4CAF50;">${defaultQuotes.p_patrol}</small>`;
      else if (aOff) patrolTxt = `<br><small style="color:orange;">${defaultQuotes.p_off}</small>`;
      else patrolTxt = `<br><small style="color:#F44336;">${defaultQuotes.p_alert}</small>`;
    }

    this.img.src = outfit;
    this.img.style.filter = isGrayscale ? "grayscale(100%)" : "none";
    this.cont.style.border = border;
    this.typeMessage(quote + patrolTxt);
  }
  
  handleAct(a) {
    const act = this.config[a + '_action'];
    if (!act && a === 'tap' && this.config.alarm_entity) {
      this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: this.config.alarm_entity } }));
    }
  }
}
customElements.define('moglie-card', MoglieCard);
