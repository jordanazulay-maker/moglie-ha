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

* **🌍 Fully Multilingual:** Moglie speaks your language! He automatically detects your Home Assistant profile settings and translates all quotes and setup menus. Currently supporting:
  * **English, Spanish, French, German, Italian, Portuguese, and Hebrew.**
* **✍️ Interactive Typewriter:** Status updates appear word-by-word with a sleek typewriter animation, making Moglie feel like he's actually talking to you.
* **🌐 Offline-Proof (Base64):** Moglie is built to survive network drops. Since all image data is baked into the code (Base64), he will stay rendered even if your internet is completely severed.
* **🛡️ Security Patrol:** Moglie watches your Alarm Control Panel. He changes border colors and adds specific "patrol" sub-texts depending on whether the "troop" is home or away.
* **🇮🇱 RTL Auto-Detection:** For Right-to-Left languages like Hebrew, Moglie automatically flips the entire UI, alignment, and setup interface for a native experience.
* **🌦️ Environmental Outfits:** Watch Moglie change clothes! He reacts to rain, snow, and extreme temperatures. He even starts to sweat if it’s over 80°F (27°C) with high humidity.
* **🎨 Clean & Modern UI:** No clunky speech bubbles. Status messages float elegantly above Moglie for a polished, subtitle-style look that fits any dashboard theme.

## 🐒 How Moglie Reacts

Moglie uses a smart priority engine to decide what's most important:
**Network Status > Night Mode > Weather > Security**

### 🚨 Status Visuals
* ⚫ **Offline:** Grayscale Moglie + Gray border. *"Moglie is stranded. The WAN connection has been lost!"*
* 🟢 **Armed Home:** Green border. *"The troop is home."*
* 🟠 **Disarmed:** Orange border. *"System's off! The troop is relaxing."*
* 🔴 **Armed Away:** Red border. *"The troop is away. Watching the trees!"*

### ⛅ Environmental Outfits
* 🌙 **Night:** Sleepy Monkey + Purple border.
* ☔ **Rain:** Raincoat + Blue border.
* ❄️ **Cold/Snow:** Winter Gear + Cyan border.
* 😎 **Hot:** Sunglasses + Orange border.
* 🥵 **Humid:** Sweaty Monkey (Triggered by high heat + high humidity).

## 🛠️ Configuration

Moglie features a **Fully Translated Visual Editor**. You don't need to touch YAML to set him up—every setting is available in the UI in your native language.

```yaml
type: custom:moglie-card
wan_entity: binary_sensor.wan_status
alarm_entity: alarm_control_panel.home_alarm
weather_entity: weather.home
enable_night_mode: true
night_start: 22
night_end: 6
