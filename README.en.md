# PokeSurvivor Bot

[Tiếng Việt](README.md) · **English**

Auto-play bot for [pokesurvivor.com](https://pokesurvivor.com/), [pokesurvivor.doofcraft.com](https://pokesurvivor.doofcraft.com/) and [PokéLit](https://pokelit.0d4y.cc/) (detects the game version from the site). Paid, cheap ([how to buy](#buy-an-activation-code)) · by [damhieu2808](https://github.com/damhieu2808)

> **Version 3.0.0:** adds PokéLit. Only needed if you play PokéLit; nothing changed for pokesurvivor.com / Doofcraft, no need to update.

## Install on PC (Chrome)

1. [**Download the bot (ZIP)**](https://github.com/damhieu2808/PokeSurvivorTool/archive/refs/heads/main.zip). This link always gets the latest version.
2. Unzip it, open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and pick the unzipped folder.

## Install on a phone (Android)

> ℹ️ The whole bot is inside the userscript file. The userscript manager runs that code in the page itself, so pokesurvivor.com blocking scripts added to the page (CSP) no longer matters. **Kiwi Browser** is recommended (there is a [video guide on TikTok @phuongnguyenconhat](https://www.tiktok.com/@phuongnguyenconhat)); Firefox works too.

1. Install a browser: **Kiwi Browser** (recommended) or **Firefox** (Play Store).
2. Install a userscript manager:
   - Kiwi: install **Tampermonkey** from the Chrome Web Store (menu ⋮ → Extensions), following the TikTok video above.
   - Firefox: install the **Violentmonkey** or **Tampermonkey** add-on (menu ⋮ → Add-ons).
3. Tap the copy button on the block below, paste into that browser's **address bar** and open it:

```
https://raw.githubusercontent.com/damhieu2808/PokeSurvivorTool/v3.0.8/psbot.user.js
```

4. The manager opens its install page → tap **Install**. If an older version is installed, install over it.
5. Open the game: the **PokeSurvivor Bot** panel appears in the top-left corner.

The manager checks for new versions on its own from time to time. To update right away: open the manager → **Check for updates**, or open the link from step 3 again.

## Install on iPhone / iPad

There are 3 ways, pick one:

**Way 1: the GEAR app.** Install **Gear Browser** (App Store). Video guide on [TikTok @phuongnguyenconhat](https://www.tiktok.com/@phuongnguyenconhat).

**Way 2: the Orion browser.** Install **Orion Browser** (App Store), add the **Tampermonkey** or **Violentmonkey** extension in Orion, then paste the link from step 3 of the Android section into the address bar, open it and tap **Install**.

**Way 3: Userscripts in Safari.**

1. Install the **Userscripts** app (App Store, free).
2. Open the **iPhone / iPad Settings** → scroll down to **Safari** → **Extensions** → turn on **Userscripts** and choose *Allow on all websites*.
3. Open Safari, tap the **Userscripts** extension icon → **+ (New remote script)** → paste the link from step 3 of the Android section and save.

Open the game: the panel appears in the top-left corner. If something goes wrong, use the contact below.

## Buy an activation code

The bot needs a valid **activation code** to run. The panel, Moveset, Level-up and Item still open without one.

| Plan | Price (VND) |
|---|---|
| 10 days | 50k |
| 30 days | 100k ⭐ Popular |
| 90 days | 200k |
| Lifetime | 400k 🔥 Best deal (pay once, 1 machine) |

Lifetime plan: 1 machine, works for as long as the tool does.

⚠ No refunds once purchased, even if the game goes down or blocks the tool. Plans last while the game does not block the tool. If it does, I will try everything to get the tool running again; if nothing works, the bot stops.

**Free 2-hour trial:** message [Zalo 0355011166](https://zalo.me/0355011166) your machine id (step 1 below). Needs bot 2.0.7 or later.

1. Install the bot and open the game. The panel shows **🔒 An activation code is needed** and your **machine id** (like `ABCD-1234`): press **Copy**.
2. Message [Zalo 0355011166 (Đàm Xuân Hiếu)](https://zalo.me/0355011166) or [TikTok @phuongnguyenconhat](https://www.tiktok.com/@phuongnguyenconhat) the plan you want + machine id.
3. Pay with the transfer details sent back to you, then send the transfer screenshot.
4. Paste the code you get (starts with `PSB1.`) into the panel → **Enter** → **▶ Run**.

- Renewing before it runs out adds the new days after the current ones. Press **Renew** on the panel to enter the new code.
- Each browser and each game site (pokesurvivor.com / doofcraft / PokéLit) has its own machine id. Playing several: send the id of each, you get one code for all.
- Clearing the browser's site data changes the machine id: message the author for a new code, no days lost.
- If a game update breaks the bot, the author will try everything to get it running again; if nothing works, the bot stops and there is no refund.

## Updates

- **PC:** when the panel shows the yellow line "⬆ Có bản mới" (new version available), download the ZIP from step 1 again and unzip it over the old folder.
- **Phone:** the userscript manager updates it from time to time (or tap **Check for updates**).
- **PokéLit:** that site doesn't let the bot check for new versions, so there is no "⬆ New version" line: look on pokesurvivor.com / doofcraft or the Releases page.

**PokéLit note:** the game has an anti-cheat, and a run with tampered timer functions earns nothing. So on PokéLit the bot does **not run in the background**: keep the game window on screen (partly covered by another window is fine); minimised, in another tab, or fully covered by another window, Chrome stops drawing and the game freezes. If the game's **Auto level / Auto item** (or Quick level-ups / Auto bond) is on, the bot stands down and hides the matching tab; Moveset stays while Auto bond is off, because it sets the bond order.

Need help installing: contact [Zalo 0355011166](https://zalo.me/0355011166) or [TikTok @phuongnguyenconhat](https://www.tiktok.com/@phuongnguyenconhat) · [License](LICENSE)

## Thanks

The bot uses open-source code (MIT License) by these authors, details in [LICENSE](LICENSE). Thank you for sharing:

- [BoundlessEgret · pokesurvivor-autofarm](https://github.com/BoundlessEgret/pokesurvivor-autofarm)
- [aparmor2 · pokesurvivor-mod](https://github.com/aparmor2/pokesurvivor-mod)
- [readygolol · PokéSurvivor Trash Time Helper](https://greasyfork.org/scripts/600408)
