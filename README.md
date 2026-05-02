<div align="center">

<img src="monkey.png" alt="Monkey Mascot" width="250" style="margin-bottom: 15px;">

<table>
  <tr>
    <td align="center" style="padding: 15px;">
      <b>You can put this primate right on your Home Assistant dashboard!<br>
      I can let you know if Home Assistant loses connection.</b>
    </td>
  </tr>
</table>

<br>

[![Add Repository to HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=jordanazulay-maker&repository=moglie-ha&category=integration)

</div>

---

### 🛠️ 1. Prerequisites (Button Card)
To use this card, you first need to install **custom:button-card** via HACS.

1. Open **HACS** in Home Assistant.
2. Go to **Frontend**.
3. Click **Explore & Download Repositories**.
4. Search for **Button Card** (by *Thomas Loven*).
5. Click it and select **Download**.
6. Restart Home Assistant.

> **Note:** After installation, add the resource if it wasn’t added automatically by going to `Settings` → `Dashboards` → `Resources` → `Add Resource`:
> * **URL:** `/hacsfiles/button-card/button-card.js`
> * **Type:** JavaScript Module

---

### 🚀 2. Install Moglie HA

**Option A: 1-Click via HACS (Recommended)**
Click the button below to instantly open your Home Assistant and add the repository:

[![Add Repository to HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=jordanazulay-maker&repository=moglie-ha&category=integration)

**Option B: Manual Installation**
1. Download the `custom_components/moglie` folder from this repository.
2. Place it inside your Home Assistant's `config/custom_components/` directory.
3. Restart Home Assistant.

---

### ⚙️ 3. Dashboard Configuration

1. **Move the Image:** Place the `monkey.png` file from `custom_components/moglie` in the `/www` folder inside your Home Assistant configuration directory. *(If you don't already have a `www` folder, create it manually).*
2. **Set your Sensor:** Replace `INPUT` in the card template with your actual WAN status entity (for example: `binary_sensor.be25_wan_status`).
3. **Add to Dashboard:** Go to your Home Assistant dashboard, add a **Bubble Card**, and paste the code provided in the `card.yml` file from this repository.
