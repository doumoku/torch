const QUERY_BUTTON_HTML = `<button type="button" class="control-icon torch" data-action="toggleTorchHelp"><i class="fas fa-question" inert></i></button>`;
const DISABLED_ICON_HTML = `<i class="fas fa-slash fa-stack-1x" inert></i>`;
const TORCH_BUTTON_HTML = (tooltip, active, disabled) => {
  if (disabled) {
    return `
    <button type="button" class="control-icon torch fa-stack" data-action="toggleTorch" data-tooltip="${tooltip}">
      <i class="fas fa-slash fa-stack-1x" inert></i>
      <i class="fas fa-fire fa-stack-1x" inert></i>
    </button>`;
  } else {
    return `
    <button type="button" class="control-icon torch${active ? " active" : ""}" data-action="toggleTorch" data-tooltip="${tooltip}">
      <i class="fas fa-fire" inert></i>
    </button>`;
  }
};
const SOURCE_PALETTE_HTML = (items) => {
  return `<div class="palette light-sources" data-palette="lightSources">${items}</div>`;
};
const SOURCE_PALETTE_ITEM_HTML = (name, img, clazz) => {
  return `
  <a class="light-source-control ${clazz}" data-action="lightSource" data-light-source="${name}">
    <span inert><img class="light-source-icon" src="${img}"/>${name}</span>
  </a>
  `;
};

export default class TokenHUD {
  /*
   * Add a button to instruct users how to use the module
   */
  static async addQueryButton(hud, token, hudHtml) {
    let tbutton = $(QUERY_BUTTON_HTML)[0];
    const helpClickListener = async (event) => {
      event.preventDefault();
      event.stopPropagation();
      new Dialog({
        title: game.i18n.localize("torch.help.setupSources.title"),
        content: game.i18n.localize("torch.help.setupSources.body"),
        buttons: {
          close: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize("Close"),
          },
        },
        default: "close",
      }).render(true);
    };
    hudHtml.querySelector(".col.left").prepend(tbutton);
    hud.options.actions["toggleTorchHelp"] = helpClickListener;
  }
  /*
   * Add a torch button to the Token HUD - called from TokenHUD render hook
   */

  static async addFlameButton(
    hud,
    token,
    hudHtml,
    forceLightSourceOff,
    toggleLightSource,
    togglelightHeld,
    changeLightSource,
  ) {
    let sources = token.ownedLightSources;

    // Build the torch button and light source palette HTML
    let sourceItems = "";
    for (let source of sources) {
      const exhausted = token.lightSourceIsExhausted(source.name)
        ? "exhausted"
        : "";
      sourceItems =
        sourceItems +
        SOURCE_PALETTE_ITEM_HTML(source.name, source.image, exhausted);
    }
    let html = TORCH_BUTTON_HTML(
      `"${game.i18n.localize("torch.hud.tooltip")}"`, //localized tooltip
      token.lightSourceState === token.STATE_ON ||
        token.lightSourceState === token.STATE_DIM, //active
      token.lightSourceIsExhausted(token.currentLightSource), //disabled
    );
    let paletteHtml = SOURCE_PALETTE_HTML(sourceItems);
    // Get it into the DOM as the top HUD button on the left
    let tbutton = $(html)[0];
    let palette = $(paletteHtml)[0];

    //Create listeners
    const torchClickListener = async (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!palette.classList.contains("active")) {
        if (token.lightSourceIsExhausted(token.currentLightSource)) {
          new Dialog({
            title: game.i18n.localize("torch.help.supplyExhausted.title"),
            content: game.i18n.localize("torch.help.supplyExhausted.body"),
            buttons: {
              close: {
                icon: '<i class="fas fa-check"></i>',
                label: "Close",
              },
            },
            default: "close",
          }).render(true);
        } else {
          if (event.shiftKey) {
            togglelightHeld(token);
          } else if (event.altKey) {
            await forceLightSourceOff(token);
            TokenHUD.syncFlameButtonState(tbutton, token);
          } else {
            await toggleLightSource(token);
            TokenHUD.syncFlameButtonState(tbutton, token);
          }
        }
      }
    };
    const contextMenuListener = async (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (token.lightSourceState === token.STATE_OFF) {
        palette.classList.toggle("active", true);
      }
    };
    const sourceListener = async (event) => {
      event.preventDefault();
      event.stopPropagation();
      const sourceName = event.target.getAttribute("data-light-source");
      await changeLightSource(token, sourceName);
      TokenHUD.syncDisabledState(tbutton, token);
      palette.classList.toggle("active", false);
    };
    // Enable torch button click, context menu, and light source listeners
    hud.options.actions["toggleTorch"] = torchClickListener;
    hud.options.actions["lightSource"] = sourceListener;
    tbutton.addEventListener("contextmenu", contextMenuListener);
    hudHtml.querySelector(".col.left").prepend(tbutton, palette);
  }

  static syncDisabledState(tbutton, token) {
    let oldSlash = tbutton.querySelector(".fa-slash");
    let wasDisabled = !!oldSlash;
    let willBeDisabled = token.lightSourceIsExhausted(token.currentLightSource);
    if (!wasDisabled && willBeDisabled) {
      let disabledIcon = $(DISABLED_ICON_HTML);
      tbutton.classList.add("fa-stack");
      tbutton.querySelector("i").classList.add("fa-stack-1x");
      tbutton.prepend(disabledIcon);
    } else if (wasDisabled && !willBeDisabled) {
      oldSlash.remove();
      tbutton.querySelector("i").classList.remove("fa-stack-1x");
      tbutton.classList.remove("fa-stack");
    }
  }

  static syncFlameButtonState(tButton, token) {
    let state = token.lightSourceState;
    if (state === token.STATE_ON) {
      tButton.classList.add("active");
    } else if (state === token.STATE_DIM) {
      tButton.classList.add("active");
    } else {
      tButton.classList.remove("active");
    }
  }
}
