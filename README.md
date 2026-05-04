<div style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">

  <div style="display: flex; justify-content: center; align-items: center; width: 100%;">
    <img src="https://raw.githubusercontent.com/jordanazulay-maker/moglie-ha/refs/heads/main/monkey.png" alt="Moglie Mascot" width="200" style="margin-bottom: 20px;">
  </div>
  
  <h1 style="border-bottom: none;">Moglie HA</h1>
  
  <p style="font-size: 1.2em; max-width: 600px; margin: 0 auto 20px auto; line-height: 1.5;">
    <b>You can put this primate right on your dashboard!</b><br>
    Moglie monitors your WAN status and security state to let you know if the pack is safe or if he's lost his connection.
  </p>

  <a href="https://my.home-assistant.io/redirect/hacs_repository/?owner=jordanazulay-maker&repository=moglie-ha&category=plugin" target="_blank" rel="noreferrer">
    <img src="https://my.home-assistant.io/badges/hacs_repository.svg" alt="Add Repository to HACS" style="margin-bottom: 30px;">
  </a>

  <hr style="border: 0; height: 1px; background: #eee; margin: 40px 0;">

</div>

<div style="max-width: 800px; margin: 0 auto; line-height: 1.6;">

  <h3>🌟 Features</h3>
  <ul>
    <li><b>Connectivity Watchdog:</b> Instant visual feedback if your WAN (internet) goes offline.</li>
    <li><b>Security Awareness:</b> Dynamic messaging based on your Alarm Control Panel status (Armed Away vs. Home).</li>
    <li><b>Zero Dependencies:</b> Built entirely as a standalone custom card.</li>
    <li><b>Visual Editor:</b> Easily configure your entities right from the Home Assistant UI without writing any code.</li>
  </ul>

  <h3>🚀 1. Installation</h3>
  <p><b>Option A: HACS (Recommended)</b></p>
  <ol>
    <li>Click the blue badge at the top of this page to automatically add the repository to HACS (or add it manually as a <b>Frontend</b> repository).</li>
    <li>Click <b>Download</b>.</li>
    <li>Refresh your browser.</li>
  </ol>

  <p><b>Option B: Manual</b></p>
  <ol>
    <li>Download the <code>moglie-ha-card.js</code> file and place it in your Home Assistant <code>www/</code> (config/www) folder.</li>
    <li>Go to <b>Settings</b> > <b>Dashboards</b> > <b>3 dots (top right)</b> > <b>Resources</b>.</li>
    <li>Add a new resource: <code>/local/moglie-ha-card.js</code> and set the type to <b>JavaScript Module</b>.</li>
  </ol>

  <h3>⚙️ 2. Dashboard Configuration</h3>
  <p>Thanks to the built-in visual editor, adding Moglie to your dashboard is easy!</p>
  <ol>
    <li>Edit your dashboard and click <b>Add Card</b>.</li>
    <li>Search for <b>Moglie-HA</b> in the card picker.</li>
    <li>Select your WAN entity, Alarm entity, and Click action using the UI dropdowns.</li>
    <li>Click <b>Save</b>!</li>
  </ol>

  <p><b>YAML Alternative:</b><br>
  If you prefer to write YAML, you can use the following configuration in a Manual card:</p>
  <pre><code>type: custom:moglie-ha-card
wan_entity: binary_sensor.wan_status
alarm_entity: alarm_control_panel.home_alarm
click_entity: binary_sensor.wan_status</code></pre>

  <p style="background-color: #f6f8fa; padding: 15px; border-left: 5px solid #238636; border-radius: 6px;">
    <b>💡 Pro-Tip:</b> Moglie is interactive! Set the <code>click_entity</code> to your WAN sensor, and tapping the card will open a dialog so you can see exactly when the "pack" went offline.
  </p>

</div>
