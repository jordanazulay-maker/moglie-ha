<div style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">

  <div style="display: flex; justify-content: center; align-items: center; width: 100%;">
    <img src="https://raw.githubusercontent.com/jordanazulay-maker/moglie-ha/main/monkey.png" alt="Moglie Mascot" width="200" style="margin-bottom: 20px;">
  </div>
  
  <h1 style="border-bottom: none;">Moglie HA</h1>
  
  <p style="font-size: 1.2em; max-width: 600px; margin: 0 auto 20px auto; line-height: 1.5;">
    <b>You can put this primate right on your dashboard!</b><br>
    Moglie monitors your WAN status, security state, and local weather to let you know if the pack is safe, if he's lost his connection, or if it's time for his sunglasses!
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
    <li><b>Security Awareness:</b> Dynamic messaging based on your Alarm Control Panel status.</li>
    <li><b>🌙 Night Mode:</b> Set a custom sleep schedule! Moglie automatically changes into his pajamas during user-defined nighttime hours.</li>
    <li><b>🌧️🌡️ Weather Aware:</b> Pass in your local weather entity, and Moglie will throw on his raincoat if it starts pouring, or his sunglasses if the temperature climbs above 90 degrees!</li>
    <li><b>✏️ Fully Customizable Text:</b> You can now customize every single message Moglie says directly in the Visual Editor to fit your exact style.</li>
    <li><b>Dynamic Visuals:</b> Card border colors shift dynamically based on status, and Moglie goes grayscale when stranded offline.</li>
    <li><b>Interactive Dialogs:</b> Tap the card to instantly bring up the more-info dialog for your designated entity.</li>
    <li><b>Zero Dependencies:</b> Built entirely as a standalone custom card.</li>
    <li><b>Visual Editor:</b> Easily configure your entities, custom text, and sleep schedule right from the Home Assistant UI without writing any code.</li>
  </ul>

  <h3>🐒 How Moglie Reacts</h3>
  <p>Moglie changes his mood (and his card's border color) based on what's going on with your network, security system, and the elements:</p>
  <ul>
    <li>⚫ <b>WAN Offline:</b> Gray border + Grayscale Moglie. <i>"Moglie is stranded. The WAN connection has been lost!"</i></li>
    <li>🟢 <b>Armed Home:</b> Green border. <i>"Welcome Home! The WAN is strong. Tell me you brought more bananas!"</i></li>
    <li>🟠 <b>Disarmed:</b> Orange border. <i>"System's off! The rest of the primates ditched their post for a banana run. Typical."</i></li>
    <li>🔴 <b>Armed Away / Other:</b> Red border. <i>"The rest of the primates are on patrol. I'll watch the trees until they get back!"</i></li>
  </ul>
  <p><i>(Psst... no matter the security status, if it starts pouring, if it gets sweltering hot, or if it's between your configured <code>Night Mode</code> hours, Moglie will prioritize putting on his appropriate gear!)</i></p>

</div>
