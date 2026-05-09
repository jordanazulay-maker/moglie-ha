# Moglie HA — Your Smart Home Companion!

[![HACS Repository](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=jordanazulay-maker&repository=moglie-ha&category=plugin)

<p align="center">
  <img src="https://raw.githubusercontent.com/jordanazulay-maker/moglie-ha/main/monkey.png" alt="Moglie Mascot" width="200">
</p>

> **The smartest primate for your dashboard!**
> 
> Moglie isn't just a mascot; he's a highly intelligent status monitor. He tracks your internet connectivity, security system, and the local elements to keep your "troop" informed and entertained.

---

## 🌟 Enhanced Features

* **🌍 Global Citizen:** Moglie now speaks multiple languages! He automatically detects your Home Assistant system language (English, Hebrew, Spanish, French, German, Italian, or Portuguese) and adjusts his quotes accordingly.
* **✍️ Interactive Typewriter:** Moglie's updates now appear word-by-word with a sleek typewriter animation, making your dashboard feel alive.
* **🇮🇱 RTL Support:** Fully optimized for Right-to-Left languages. When Hebrew is detected, Moglie automatically flips the text alignment and setup interface.
* **🌐 Connectivity Watchdog:** Powered by a **Base64 engine**, Moglie is 100% offline-proof. If your WAN drops, he stays rendered and turns grayscale to let you know he's lost.
* **🛡️ Security Awareness:** Dynamic border colors and specific "patrol" sub-texts change based on your Alarm Control Panel status.
* **🌦️ Weather & Environment:** Moglie reacts to rain, snow, heat, and even humidity! If it's over 80°F (27°C) and 70% humidity, watch him start to sweat.
* **🌙 Night Mode:** Moglie follows your schedule. Define your custom sleep hours, and he'll change into his pajamas right on time.
* **🎨 Polished "Clean UI":** No messy bubbles. Status messages float cleanly above Moglie for a modern, subtitle-style look.

## 🐒 How Moglie Reacts

Moglie’s behavior is driven by a complex priority engine. He evaluates your home's state in this order: **Network > Night Mode > Weather > Security**.

### 🚨 Status Visuals
* ⚫ **Offline:** Gray border + Grayscale Moglie. *"Moglie is stranded. The WAN connection has been lost!"*.
* 🟢 **Armed Home:** Green border. *"The troop is home."*.
* 🟠 **Disarmed:** Orange border. *"System's off! The troop is relaxing."*.
* 🔴 **Armed Away:** Red border. *"The troop is away."*.

### ⛅ Environmental Outfits
* 🌙 **Night:** Purple border + Sleepy Monkey.
* ☔ **Rain:** Blue border + Raincoat.
* ❄️ **Cold/Snow:** Cyan border + Winter Gear.
* 😎 **Hot:** Yellow-Orange border + Sunglasses.
* 🥵 **Humid:** Yellow-Orange border + Sweaty Monkey (Temp > 80°F, Humidity > 70%).

## 🛠️ Configuration

Moglie is built with a **Translated Visual Editor**. Every setting—from WAN entity to Night Mode hours—is available in your native language.

```yaml
type: custom:moglie-card
wan_entity: binary_sensor.wan_status
alarm_entity: alarm_control_panel.home_alarm
weather_entity: weather.home
enable_night_mode: true
night_start: 22
night_end: 6
hide_moglie: false # Toggle for text-only mode
