<div style="text-align: center;">

To use this card, you first need to install <b>custom:button-card</b> via HACS.<br><br>

1. Open <b>HACS</b> in Home Assistant.<br>
2. Go to <b>Frontend</b>.<br>
3. Click <b>Explore & Download Repositories</b>.<br>
4. Search for <b>Button Card</b> (by <i>Thomas Loven</i>).<br>
5. Click it and select <b>Download</b>.<br>
6. Restart Home Assistant.<br><br>

After installation, add the resource if it wasn’t added automatically:<br>
Settings → Dashboards → Resources → Add Resource<br>
URL: <code>/hacsfiles/button-card/button-card.js</code><br>
Type: <b>JavaScript Module</b><br><br>

Next, place <b>monkey.png</b> in the <b>/www</b> folder inside your Home Assistant configuration directory.<br><br>

If you don't already have a <b>www</b> folder, create it manually.<br><br>

Replace <b>INPUT</b> in the card template with your WAN status entity (for example: <code>binary_sensor.be25_wan_status</code>).<br><br>

Finally, go to your Home Assistant dashboard, add a <b>button card</b>, and paste the provided code.
<br><br>

<table style="margin-left: auto; margin-right: auto; border-collapse: collapse;">
  <tr>
    <td style="text-align: center; padding: 10px;">
      <b>You can put this primate right<br>
      on your Home Assistant dashboard!<br>
      I can let you know if<br>
      Home Assistant loses connection.</b>
    </td>
  </tr>
</table>

<br>

<img src="monkey.png" alt="Monkey Mascot" width="300" style="display: block; margin-left: auto; margin-right: auto;">

</div>
