# Moglie HA

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
* **🛡️ Security Awareness:** Dynamic messaging based on your Alarm Control Panel status.
* **🌙 Night Mode:** Set a custom sleep schedule! Moglie automatically changes into his pajamas during user-defined nighttime hours.
* **🌧️❄️🌡️ Weather Aware:** Pass in your local weather entity, and Moglie will throw on his raincoat if it starts pouring, his sunglasses if the temperature climbs above 80°F (27°C), or bundle up in his winter gear if it snows or drops below 50°F (10°C)!
* **✏️ Fully Customizable Text:** You can now customize every single message Moglie says directly in the Visual Editor to fit your exact style.
* **🎨 Dynamic Visuals:** Card border colors shift dynamically based on status, and Moglie goes grayscale when stranded offline.
* **👆 Interactive Dialogs:** Tap the card to instantly bring up the more-info dialog for your designated alarm entity.
* **🎁 Hidden Surprises:** Moglie loves to celebrate! Keep an eye on him during certain times of the year—you might catch him feeling unusually festive or acting a little topsy-turvy.
* **🛠️ Self-Healing & Stability:** Built-in image load auto-retries and a handy "Reload Dashboard" button if entities are missing or need a fresh pull after an update! Oh, and check your browser console for a surprise when he wakes up.
* **📦 Zero Dependencies:** Built entirely as a standalone custom card.
* **⚙️ Visual Editor:** Easily configure your entities, custom text, and sleep schedule right from the Home Assistant UI without writing any code.

## 🐒 How Moglie Reacts

Moglie changes his mood, his outfit, and his card's border color based on what's going on with your network, security system, and the elements:

### 🚨 Security & Network Status
* ⚫ **WAN Offline:** Gray border + Grayscale Moglie. *"Moglie is stranded. The WAN connection has been lost!"*
* 🟢 **Armed Home:** Green border. *"Welcome Home! The WAN is strong. Tell me you brought more bananas!"*
* 🟠 **Disarmed:** Orange border. *"System's off! The rest of the primates ditched their post for a banana run. Typical."*
* 🔴 **Armed Away / Other:** Red border. *"The rest of the primates are on patrol. I'll watch the trees until they get back!"*

### ⛅ Environment Priorities
*(Psst... no matter the security status, Moglie will prioritize putting on his appropriate gear for the weather or time of day!)*

* 🌙 **Night Mode:** Purple border + Sleepy Monkey. *"Zzz... Moglie is sleeping..."*
* ☔ **Raining:** Blue border + Rainy Monkey. *"Looks like rain, grabbing my coat!"*
* ❄️ **Cold/Snow:** Cyan border + Winter Monkey. *"Brrr! It's freezing out there!"*
* 😎 **Hot:** Yellow-Orange border + Summer Monkey. *"It's boiling! Need a banana smoothie."*

### 🤫 Secret Seasonal Anomalies
* 📅 **???:** Rumor has it Moglie occasionally checks the calendar. Be on the lookout during a certain festive winter holiday or a notoriously silly spring day. He might just show off a rare outfit or completely forget how gravity works... you'll just have to wait and see!
