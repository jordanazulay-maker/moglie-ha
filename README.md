<div style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">

  <div style="display: flex; justify-content: center; align-items: center; width: 100%;">
    <img src="https://raw.githubusercontent.com/jordanazulay-maker/moglie-ha/refs/heads/main/monkey.png" alt="Moglie Mascot" width="200" style="margin-bottom: 20px;">
  </div>
  
  <h1 style="border-bottom: none;">Moglie HA</h1>
  
  <p style="font-size: 1.2em; max-width: 600px; margin: 0 auto 20px auto; line-height: 1.5;">
    <b>You can put this primate right on your dashboard!</b><br>
    Moglie monitors your WAN status and security state to let you know if the pack is safe or if he's lost his connection.
  </p>

  <a href="https://my.home-assistant.io/redirect/hacs_repository/?owner=jordanazulay-maker&repository=moglie-ha&category=integration" target="_blank" rel="noreferrer">
    <img src="https://my.home-assistant.io/badges/hacs_repository.svg" alt="Add Repository to HACS" style="margin-bottom: 30px;">
  </a>

  <hr style="border: 0; height: 1px; background: #eee; margin: 40px 0;">

</div>

<div style="max-width: 800px; margin: 0 auto; line-height: 1.6;">

  <h3>🌟 Features</h3>
  <ul>
    <li><b>Connectivity Watchdog:</b> Instant visual feedback if your WAN (internet) goes offline.</li>
    <li><b>Security Awareness:</b> Dynamic messaging based on your Alarm Control Panel status (Armed Away vs. Home).</li>
    <li><b>Zero-Asset Install:</b> Links directly to GitHub images so you don't have to manage local files.</li>
  </ul>

  <h3>🛠️ 1. Prerequisites</h3>
  <p>To use this card, you first need to install <b>custom:button-card</b> via HACS:</p>
  <ul>
    <li>Open <b>HACS</b> → <b>Frontend</b>.</li>
    <li>Click <b>Explore & Download Repositories</b>.</li>
    <li>Search for <b>Button Card</b> and download it.</li>
    <li>Restart Home Assistant.</li>
  </ul>

  <h3>🚀 2. Installation</h3>
  <p><b>Option A: 1-Click (Recommended)</b><br>Click the blue badge at the top of this page to automatically add the repository to HACS.</p>
  <p><b>Option B: Manual</b><br>Download the <code>custom_components/moglie</code> folder and place it in your <code>/config/custom_components/</code> directory, then restart.</p>

  <h3>⚙️ 3. Dashboard Configuration</h3>
  <ol>
    <li><b>Get the Code:</b> Open the <code>card.yml</code> file in this repository and copy the contents.</li>
    <li><b>Set your Entities:</b> 
      <ul>
        <li>Replace the main <code>INPUT</code> with your WAN status (e.g., <code>binary_sensor.wan_status</code>).</li>
        <li>Update the <code>alarmState</code> variable in the JavaScript section with your alarm entity (e.g., <code>alarm_control_panel.home_alarm</code>).</li>
      </ul>
    </li>
    <li><b>Add to Dashboard:</b> Go to your Home Assistant dashboard, add a <b>Manual Card</b>, and paste your updated code.</li>
  </ol>

  <p style="background-color: #f6f8fa; padding: 15px; border-left: 5px solid #238636; border-radius: 6px;">
    <b>💡 Pro-Tip:</b> Moglie is interactive! Tapping the card will take you directly to the connection history so you can see exactly when the "pack" went offline.
  </p>

</div>
