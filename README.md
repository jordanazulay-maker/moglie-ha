# Moglie HA — Your Global Smart Home Companion!

[![HACS Repository](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=jordanazulay-maker&repository=moglie-ha&category=plugin)

<p align="center">
  <img src="https://raw.githubusercontent.com/jordanazulay-maker/moglie-ha/main/monkey.png" alt="Moglie Mascot" width="200">
</p>

> **The smartest, most expressive mascot for your dashboard!**
> 
> Moglie is an intelligent status monitor that tracks your internet connectivity, security system, and local weather. He's built to be a living part of your home, reacting to the world around him in real-time.

---

## 🌟 Enhanced Features

* **🌍 Fully Multilingual:** Moglie speaks your language! He automatically detects your Home Assistant profile settings and translates all quotes and setup menus. Currently supporting **13 languages**.
* **🎛️ Modular & Dynamic Editor:** Build the card your way. WAN, Alarm, and Weather are now individual toggles! The smart UI automatically groups and hides advanced options (like entities, custom quotes, and night mode) until you actually enable them.
* **🕒 Daily Routines:** Moglie has his own schedule! When the weather is nice, he will prepare for the day in the morning, enjoy banana snacks in the afternoon, and quiet down in the canopy by evening.
* **👆 Interactive Tap & Hold Actions:** Click or long-press on Moglie to trigger native Home Assistant actions. You can even bind these actions to completely custom, independent entities without cluttering the UI!
* **💬 Custom Quotes:** Don't like the default phrases? Override any state (Rain, Thunder, Cold, Night, Armed, etc.) with your own custom text directly from the UI.
* **✍️ Interactive Typewriter:** Status updates appear word-by-word with a sleek typewriter animation (now fully optimized to prevent ghost-typing on rapid state changes).
* **🌐 Offline-Proof (Base64):** Moglie is built to survive network drops. Since all image data is baked into the code (Base64), he will stay rendered even if your internet is completely severed.
* **🛡️ Security Patrol:** Moglie watches your Alarm Control Panel. He changes border colors and adds specific "patrol" sub-texts depending on whether the "troop" is home or away.
* **🇮🇱 RTL Auto-Detection:** For Right-to-Left languages like Hebrew and Arabic, Moglie automatically flips the entire UI, alignment, and setup interface for a native experience.
* **🌦️ Environmental Outfits:** Watch Moglie change clothes! He reacts to rain, snow, thunderstorms, and extreme temperatures. He even starts to sweat if it’s over 80°F (27°C) with high humidity.
* **📱 Mobile Optimized:** Features intelligent touch-tracking to prevent ghost-clicks and double-fires on mobile companion apps.
* **🎨 Clean & Modern UI:** No clunky speech bubbles. Status messages float elegantly above Moglie for a polished, subtitle-style look that fits any dashboard theme.
* **👻 Stealth Mode:** Need a minimalist dashboard? Toggle "Hide Moglie" to keep his intelligent status text but hide the monkey image.

## 🌍 Supported Languages

Moglie is a worldly monkey and currently supports **12 languages**! The card will automatically detect your Home Assistant language settings and translate Moglie's status updates.

* 🇺🇸 English (`en`)
* 🇮🇱 Hebrew (`he`)
* 🇸🇦 Arabic (`ar`)
* 🇪🇸 Spanish (`es`)
* 🇫🇷 French (`fr`)
* 🇩🇪 German (`de`)
* 🇮🇹 Italian (`it`)
* 🇵🇹 Portuguese (`pt`)
* 🇳🇱 Dutch (`nl`)
* 🇷🇺 Russian (`ru`)
* 🇯🇵 Japanese (`ja`)
* 🇨🇳 Chinese - Simplified (`zh-CN`)

*Note: For Right-to-Left (RTL) languages like Hebrew and Arabic, the card automatically adjusts the text direction!*

## 🐒 How Moglie Reacts

Moglie uses a smart priority engine to decide what's most important:
**Network Status > Night Mode > Weather > Security > Daily Routine**

### 🚨 Status Visuals
* ⚫ **Offline:** Grayscale Moglie + Gray border. *"Moglie is stranded. The WAN connection has been lost!"*
* 🟢 **Armed Home:** Green border. *"The troop is home."*
* 🟠 **Disarmed:** Orange border. *"System's off! The troop is relaxing."*
* 🔴 **Armed Away:** Red border. *"The troop is away. Watching the trees!"*

### ⛅ Environmental Outfits
* 🌙 **Night:** Sleepy Monkey + Purple border.
* ⛈️ **Thunderstorm:** Raincoat + Stormy Blue-Grey border.
* ☔ **Rain:** Raincoat + Blue border.
* ❄️ **Cold/Snow:** Winter Gear + Cyan border.
* 😎 **Hot:** Sunglasses + Orange border.
* 🥵 **Humid:** Sweaty Monkey (Triggered by high heat + high humidity).

## 🚀 Installation via HACS

Moglie is easily installed via the Home Assistant Community Store (HACS).

1. Go to **HACS** in your Home Assistant instance.
2. Click on the 3 dots in the top right corner and select **Custom repositories**.
3. Add the URL of this repository: `https://github.com/jordanazulay-maker/moglie-ha`
4. Select **Dashboard** as the category and click **Add**.
5. Close the popup, search for "Moglie HA" in HACS, and click **Download**.
6. Refresh your browser window. You can now add the "Moglie HA" card to your dashboard!

## 📄 License & Copyright

**Copyright (c) 2026 Jordan Azulay**

This project is licensed under the **PolyForm Noncommercial License 1.0.0**. 

You are free to use, modify, and distribute this software for personal and non-commercial purposes.

**Permitted Uses Include:**
* Personal use for research, experimentation, and private study.
* Use by charitable organizations, educational institutions, public research organizations, public safety/health organizations, environmental protection organizations, or government institutions, provided they receive no payment in connection with the software.

**Strictly Prohibited:**
* Use by any commercial entity or for commercial purposes (including paid smart home installations and consulting) is strictly prohibited without prior permission.

Please see the `LICENSE.txt` file in this repository for the full legal text.
