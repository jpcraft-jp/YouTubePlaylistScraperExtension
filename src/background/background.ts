import browser from "webextension-polyfill";

console.log("Hello from the background!");

browser.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed:", details);
});




browser.runtime.onMessage.addListener(async (message)=> {
  if (message && message.action && message.token) {
    const stogae = await browser.storage.local.get(["tokens", "playlistData"]);
    const tokens = stogae.tokens;
    const playlist = stogae.playlistData as string[];
    if (tokens.includes(message.token)) {
      if (message.action == "getPlaylistArrayFromBackend") {
        return playlist;
      } else {
        console.error("Unknown action:", message.action);
      }
    } else {
      console.error("Invalid token:", message.token);
    }
  }
})