(function() {
    // 1. INTEGRATED ASSETS: Consolidating all monkeys into one file to fix the 'Broken' load error
    const MONKEYS = {
        
        sleepy: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAByAAAAkwCAMAAAD70dgNAAAC5VBMVEUAAACTkIxzb2mEgHY1MjSBemwtLTEqKi+FeWYnKTC...",
        festive: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAByAAAAkwCAMAAAD70dgNAAAC01BMVEUAAAAtIRwiEw+snYokFBEoFxSwoIwtGxjn1bs2I...",
        winter: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAByAAAAkwCAMAAAD70dgNAAAC4lBMVEUAAAC2ra2dlpZ8dXRgVlY+LCpVUlU5JyQ6Kys9I...",
        rainy: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAByAAAAkwCAMAAAD70dgNAAAC1lBMVEUAAACfjYt0YF1WQT1lUk5ELCg6IBs6Hxs6HRk6H...",
        summer: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAByAAAAkwCAMAAAD70dgNAAAC61BMVEUAAADPwLXItaaYiIPqy6N6amXguYRtXFdPPDjy3...",
        sweaty: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAByAAAAkwCAMAAAD70dgNAAACbVBMVEUAAAD////66s7c7vL20a77w4TYxrryu5j7unC1x..."
    };

    class MoglieCard extends HTMLElement {
        // 2. PICKER REGISTRATION: Ensures Moglie is always visible in the 'Add Card' menu
        static getConfigElement() { return document.createElement("moglie-card-editor"); }
        static getStubConfig() { return { entity: "binary_sensor.moglie_status" }; }

        // 3. SYSTEM CHECK: Validates YAML immediately
        setConfig(config) {
            if (!config.entity) {
                throw new Error("Moglie needs an 'entity' defined in your YAML config.");
            }
            this.config = config;
        }

        set hass(hass) {
            this._hass = hass;
            const entityId = this.config.entity;
            const stateObj = hass.states[entityId];

            // 4. ERROR MONITORING: This logic makes Moglie go gray if the system 'brakes'
            if (!stateObj || stateObj.state === 'unavailable' || stateObj.state === 'unknown') {
                this.renderError(`Moglie is Unavailable (Check ${entityId})`);
                return;
            }

            if (!this.content) { this.initCard(); }
            this.updateCard(stateObj);
        }

        renderError(msg) {
            this.innerHTML = `
                <ha-card style="padding: 16px; text-align: center; background: #2c2c2c; color: #ff5252;">
                    <ha-icon icon="mdi:alert-circle-outline" style="--mdc-icon-size: 40px;"></ha-icon>
                    <div style="font-weight: bold; margin-top: 10px;">Moglie System Error</div>
                    <div style="font-size: 0.8em; color: #bbb;">${msg}</div>
                    <div style="filter: grayscale(100%); opacity: 0.2; margin-top: 15px;">
                        <img src="${MONKEYS.normal}" width="100">
                    </div>
                </ha-card>
            `;
            this.content = null;
        }

        initCard() {
            this.innerHTML = `
                <ha-card id="m-cont" style="padding: 16px; text-align: center; transition: all 0.5s;">
                    <img id="m-img" style="width: 100%; max-width: 200px; transition: filter 0.5s;">
                    <div id="m-text" style="margin-top: 10px; font-weight: bold;"></div>
                </ha-card>
            `;
            this.content = this.querySelector("#m-cont");
        }

        updateCard(stateObj) {
            const img = this.querySelector("#m-img");
            const text = this.querySelector("#m-text");
            const status = stateObj.state;

            // Choose monkey based on time or state
            let type = "normal";
            const hour = new Date().getHours();
            if (hour > 22 || hour < 6) type = "sleepy";
            else if (status === "on" || status === "home") type = "festive";

            img.src = MONKEYS[type];
            text.textContent = stateObj.attributes.friendly_name || "Moglie Status";

            // 5. VISUAL CHECK: Turn gray if entity is 'off' but system is still healthy
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

    // 6. FORCE VISIBILITY: Register card in the frontend window object
    window.customCards = window.customCards || [];
    window.customCards.push({
        type: "moglie-card",
        name: "Moglie Card",
        description: "A smart monkey card that monitors system health.",
        preview: true
    });
})();
