<div style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">

  <img src="monkey.png" alt="Moglie Mascot" width="200" style="margin-bottom: 20px;">
  
  <h1 style="border-bottom: none;">Moglie HA</h1>
  
  <p style="font-size: 1.2em; max-width: 600px; margin: 0 auto 20px auto; line-height: 1.5;">
    <b>You can put this primate right on your dashboard!</b><br>
    Moglie monitors your WAN status and lets you know if Home Assistant loses its connection to the pack.
  </p>

  <a href="https://my.home-assistant.io/redirect/hacs_repository/?owner=jordanazulay-maker&repository=moglie-ha&category=integration" target="_blank" rel="noreferrer">
    <img src="https://my.home-assistant.io/badges/hacs_repository.svg" alt="Add Repository to HACS" style="margin-bottom: 30px;">
  </a>

  <hr style="border: 0; height: 1px; background: #eee; margin: 40px 0;">

</div>

<div style="max-width: 800px; margin: 0 auto; line-height: 1.6;">

  <h3>🛠️ 1. Prerequisites</h3>
  <p>To use this card, you first need to install <b>custom:button-card</b> via HACS:</p>
  <ul>
    <li>Open <b>HACS</b> → <b>Frontend</b>.</li>
    <li>Click <b>Explore & Download Repositories</b>.</li>
    <li>Search for <b>Button Card</b> (by <i>Thomas Loven</i>) and download it.</li>
    <li>Restart Home Assistant.</li>
  </ul>

  <h3>🚀 2. Installation</h3>
  <p><b>Option A: 1-Click (Recommended)</b><br>Click the blue badge at the top of this page to automatically add the repository to HACS.</p>
  <p><b>Option B: Manual</b><br>Download the <code>custom_components/moglie</code> folder and place it in your <code>/config/custom_components/</code> directory, then restart.</p>

  <h3>⚙️ 3. Dashboard Configuration</h3>
  <ol>
    <li><b>Get the Code:</b> Open the <code>card.yml</code> file in this repository and copy the contents.</li>
    <li><b>Set your Sensor:</b> Replace <code>INPUT</code> in the code with your actual WAN status entity (e.g., <code>binary_sensor.be25_wan_status</code>).</li>
    <li><b>Add to Dashboard:</b> Go to your Home Assistant dashboard, add a <b>Bubble Card</b> (or Manual Card), and paste your updated code.</li>
  </ol>

  <p style="background-color: #f6f8fa; padding: 15px; border-left: 5px solid #238636; border-radius: 6px;">
    <b>💡 Pro-Tip:</b> Because the card links directly to your GitHub assets, you don't need to move any files to your <code>/www</code> folder. Moglie will appear automatically!
  </p>

</div>
