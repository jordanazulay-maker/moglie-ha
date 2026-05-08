Moglie HA, Your smart home companion!

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=jordanazulay-maker&repository=moglie-ha&category=plugin)

<p align="center">
  <img src="https://raw.githubusercontent.com/jordanazulay-maker/moglie-ha/main/monkey.png" alt="Moglie Mascot" width="200">
</p>

> **You can put this primate right on your dashboard!**
> 
> Moglie monitors your WAN status, security state, and local weather to let you know if the pack is safe, if he's lost his connection, or if it's time for his sunglasses or winter coat!

---

## 🌟 Features

* **🌐 Connectivity Watchdog:** Instant visual feedback if your WAN (internet) goes offline.
* **🛡️ Security Awareness:** Dynamic messaging and border colors based on your Alarm Control Panel status.
* **🌙 Night Mode:** Set a custom sleep schedule! Moglie automatically changes into his pajamas during user-defined nighttime hours.
* **🌧️❄️🌡️ Weather Aware:** Pass in your local weather entity, and Moglie will throw on his raincoat if it starts pouring, his sunglasses if the temperature climbs above 80°F (27°C), or bundle up in his winter gear if it snows or drops below 50°F (10°C)!
* **🥵 Humidity Sensing:** If the temperature is high and the humidity crosses 70%, Moglie will start sweating!
* **✏️ Fully Customizable Text:** Customize every single message Moglie says directly in the Visual Editor to fit your exact style.
* **🙈 Hide Moglie (Text-Only Mode):** Toggle "Hide Moglie" to turn the card into a sleek, text-based status feed (e.g., *"MOGLIE'S LATEST UPDATE: System's off!"*).
* **🎨 Dynamic Visuals:** Card border colors shift dynamically based on status, and Moglie goes grayscale when stranded offline.
* **🛠️ Clean Visual Editor:** A streamlined "Features to Monitor" dropdown lets you pick exactly what you want to track, keeping the configuration menu clutter-free.
* **📦 Zero Dependencies:** Built entirely as a standalone custom card.

## 🐒 How Moglie Reacts

Moglie changes his mood, his outfit, and his card's border color based on what's going on with your network, security system, and the elements:

### 🚨 Security & Network Status
* ⚫ **WAN Offline:** Gray border + Grayscale Moglie. *"Moglie is stranded. The WAN connection has been lost!"*
* 🟢 **Armed Home:** Green border. *"The troop is home. The primates are on perimeter patrol."*
* 🟠 **Disarmed:** Orange border. *"System's off! The troop is relaxing."*
* 🔴 **Armed Away / Other:** Red border. *"The troop is away. The primates are watching the trees!"*

### ⛅ Environment Priorities
*(Psst... no matter the security status, Moglie will prioritize putting on his appropriate gear for the weather or time of day!)*

* 🌙 **Night Mode:** Purple border + Sleepy Monkey. *"Zzz... Moglie is sleeping..."*
* ☔ **Raining:** Blue border + Rainy Monkey. *"Looks like rain, grabbing my coat!"*
* ❄️ **Cold/Snow:** Cyan border + Winter Monkey. *"Brrr! It's freezing out there!"*
* 😎 **Hot:** Yellow-Orange border + Summer Monkey. *"It's boiling! Need a banana smoothie."*
* 🥵 **Hot & Humid:** Yellow-Orange border + Sweaty Monkey. (Triggered when Temp > 80°F and Humidity > 70%).

### 👆 Interactive Actions (Tap & Hold)
Moglie supports any standard Home Assistant action, allowing you to control your home directly from the card:

* **Standard Actions:** Configure `tap_action` or `hold_action` in the Visual Editor to `toggle` a switch, `Maps` to a path, open a `url`, or `perform-action` (call a service).
* **Smart Default:** If no custom tap action is set, Moglie defaults to opening the more-info dialog for your designated Alarm Entity.

### 🤫 Secret Seasonal Anomalies
* 📅 **???:** Rumor has it Moglie occasionally checks the calendar. Be on the lookout during a certain festive winter holiday or a notoriously silly spring day. He might just show off a rare outfit or completely forget how gravity works... you'll just have to wait and see!
