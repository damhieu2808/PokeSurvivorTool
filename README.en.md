# PokeSurvivor Bot

[Tiếng Việt](README.md) · **English**

Auto-play bot for [pokesurvivor.com](https://pokesurvivor.com/) and [pokesurvivor.doofcraft.com](https://pokesurvivor.doofcraft.com/) (detects the game version from the site). Paid, cheap ([how to buy](#buy-an-activation-code)) · by [damhieu2808](https://github.com/damhieu2808)

## Install on PC (Chrome)

1. [**Download the bot (ZIP)**](https://github.com/damhieu2808/PokeSurvivorTool/archive/refs/heads/main.zip). This link always gets the latest version.
2. Unzip it, open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and pick the unzipped folder.

## Install on a phone (Android)

> ℹ️ The whole bot is inside the userscript file. The userscript manager runs that code in the page itself, so pokesurvivor.com blocking scripts added to the page (CSP) no longer matters. **Firefox** is recommended. Edge / Kiwi + Tampermonkey on Android did not work with the old version; the new way is not tested there yet.

1. Install **Firefox** (Play Store).
2. In Firefox, install the **Violentmonkey** or **Tampermonkey** add-on (menu ⋮ → Add-ons).
3. Tap the copy button on the block below, paste into that browser's **address bar** and open it:

```
https://raw.githubusercontent.com/damhieu2808/PokeSurvivorTool/v2.2.9/psbot.user.js
```

4. The manager opens its install page → tap **Install**. If an older version is installed, install over it.
5. Open the game: the **PokeSurvivor Bot** panel appears in the top-left corner.

The manager checks for new versions on its own from time to time. To update right away: open the manager → **Check for updates**, or open the link from step 3 again.

## Install on iPhone / iPad

1. Install the **Userscripts** app (App Store, free).
2. Open **Settings → Safari → Extensions → Userscripts**: turn it on and allow it on all websites.
3. In **Safari**, paste the link from step 3 of the Android section into the address bar and open it.
4. Tap the extensions icon (puzzle piece or **aA**) in the address bar → **Userscripts** → **Install**.
5. Open the game in Safari: the panel appears in the top-left corner. iOS is untested; pokesurvivor.com may be blocked as on Android. If something goes wrong, use the contact below.

## Buy an activation code

The bot needs a valid **activation code** to run. The panel, Moveset, Level-up and Item still open without one.

| Plan | Price (VND) |
|---|---|
| 10 days | 30k |
| 30 days | 70k |
| 90 days | 180k |
| Lifetime | 350k |

Lifetime plan: 1 machine, works for as long as the tool does.

⚠ Plans last while the game does not block the tool. If it does, I will try everything to get the tool running again; if nothing works, there is no refund.

**Free 2-hour trial:** message [Zalo 0355011166](https://zalo.me/0355011166) your machine id (step 1 below). Needs bot 2.0.7 or later.

1. Install the bot and open the game. The panel shows **🔒 An activation code is needed** and your **machine id** (like `ABCD-1234`): press **Copy**.
2. Pay by bank transfer (the panel's **💳 Buy a code** tab has the QR code and account), with the machine id as the message.
3. Message [Zalo 0355011166 (Đàm Xuân Hiếu)](https://zalo.me/0355011166) or [TikTok @phuongnguyenconhat](https://www.tiktok.com/@phuongnguyenconhat) the transfer screenshot + machine id.
4. Paste the code you get (starts with `PSB1.`) into the panel → **Enter** → **▶ Run**.

- Renewing before it runs out adds the new days after the current ones. Press **Renew** on the panel to enter the new code.
- Each browser and each game site (pokesurvivor.com / doofcraft) has its own machine id. Playing both: send both ids, you get one code for both.
- Clearing the browser's site data changes the machine id: message the author for a new code, no days lost.
- If a game update breaks the bot, the author will try everything to get it running again; if nothing works, there is no refund.

## Updates

- **PC:** when the panel shows the yellow line "⬆ Có bản mới" (new version available), download the ZIP from step 1 again and unzip it over the old folder.
- **Phone:** the userscript manager updates it from time to time (or tap **Check for updates**).

Need help installing: contact [Zalo 0355011166](https://zalo.me/0355011166) or [TikTok @phuongnguyenconhat](https://www.tiktok.com/@phuongnguyenconhat) · [License](LICENSE)
