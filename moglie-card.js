(function() {
    // --- CONSOLIDATED IMAGE DATA ---
    const MONKEYS = {
        normal: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAByAAAAkwCAMAAAD70dgNAAAC01BMVEUAAADdw6bMsZW3m4JaR0GahX3grGpELymDbWPls2k...",
        winter: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAByAAAAkwCAMAAAD70dgNAAAC4lBMVEUAAAC2ra2dlpZ8dXRgVlY+LCpVUlU5JyQ6Kys9Iy...",
        rainy: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAByAAAAkwCAMAAAD70dgNAAAC1lBMVEUAAACfjYt0YF1WQT1lUk5ELCg6IBs6Hxs6HRk6HR...",
        summer: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAByAAAAkwCAMAAAD70dgNAAAC61BMVEUAAADPwLXItaaYiIPqy6N6amXguYRtXFdPPDjy3c...",
        sweaty: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAByAAAAkwCAMAAAD70dgNAAACbVBMVEUAAAD////66s7c7vL20a77w4TYxrryu5j7unC1x...",
        sleepy: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAByAAAAkwCAMAAAD70dgNAAAC5VBMVEUAAACTkIxzb2mEgHY1MjSBemwtLTEqKi+FeWYnK...",
        festive: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAByAAAAkwCAMAAAD70dgNAAAC01BMVEUAAAAtIRwiEw+snYokFBEoFxSwoIwtGxjn1bs2I..."
    };

    class MoglieCard extends HTMLElement {
        // 1. Validate YAML immediately
        setConfig(config) {
            if (!config.entity) {
                // If entity is missing, throw error so HA shows the red error box
                throw new Error("Moglie needs an 'entity' in the YAML config.");
            }
            this.config = config;
        }

        set hass(hass) {
            this._hass = hass;
            const entityId = this.config.entity;
            const stateObj = hass.states[entityId];

            // 2. SYSTEM CHECK: If entity is missing or integration failed
            if (!stateObj || stateObj.state === 'unavailable' || stateObj.state === 'unknown') {
                this.renderError("System Error: Entity is Unavailable.");
                return;
            }

            if (!this.content) {
                this.initCard();
            }

            this.updateCard(stateObj);
        }

        renderError(msg) {
            this.innerHTML = `
                <ha-card style="background: #333; padding: 16px; color: #ff5252; text-align: center;">
                    <ha-icon icon="mdi:alert-circle" style="font-size: 40px;"></ha-icon>
                    <div style="font-weight: bold; margin: 10px 0;">Moglie Error</div>
                    <div style="font-size: 0.8em; color: #bbb;">${msg}</div>
                    <div style="filter: grayscale(100%); opacity: 0.3; margin-top: 15px;">
                        <img src="${MONKEYS.normal}" width="100">
                    </div>
                </ha-card>
            `;
            this.content = null;
        }

        initCard() {
            this.innerHTML = `
                <style>
                    #moglie-container { padding: 16px; text-align: center; transition: all 0.5s; }
                    .monkey-img { width: 100%; max-width: 200px; transition: filter 0.5s; }
                </style>
                <ha-card id="moglie-container">
                    <img id="monkey-pic" class="monkey-img" src="">
                    <div id="status-text" style="margin-top: 10px; font-weight: bold;"></div>
                </ha-card>
            `;
            this.content = this.querySelector("#moglie-container");
        }

        updateCard(stateObj) {
            const status = stateObj.state;
            const img = this.querySelector("#monkey-pic");
            const text = this.querySelector("#status-text");

            // Logic for choosing monkey
            let type = "normal";
            const hour = new Date().getHours();
            if (hour > 22 || hour < 6) type = "sleepy";
            else if (status === "on" || status === "home") type = "festive";

            img.src = MONKEYS[type];
            text.textContent = stateObj.attributes.friendly_name || "Moglie";

            // 3. VISUAL CHECK: Turn gray if state is 'off'
            if (status === "off" || status === "not_home") {
                img.style.filter = "grayscale(100%) opacity(0.5)";
                this.content.style.background = "#444";
            } else {
                img.style.filter = "none";
                this.content.style.background = "var(--ha-card-background, white)";
            }
        }
    }

    customElements.define('moglie-card', MoglieCard);
})();
