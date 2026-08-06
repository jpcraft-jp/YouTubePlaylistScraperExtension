import browser from "webextension-polyfill";

async function getPlaylistArray(token: string): Promise<string[]> {

    const PlaylistArray = await browser.runtime.sendMessage({
        action: "getPlaylistArrayFromBackend",
        token: token
    });

    return PlaylistArray;
}

window.addEventListener("message", async (event: MessageEvent<messageData>) => {
    if (event.data.action === "getPlaylistArrayFromBackend") {
        if (event.data.source === "yt-ext-response") return;

        const token = event.data.token;
        
        if (!token) {
            console.error("Token is missing in the message data");
            window.postMessage({ action: "getPlaylistArrayFromBackend", requestId: event.data.requestId, data: { error: "Token is missing" }, source: "yt-ext-response" }, "*");
            return;
        }
        if (!event.data.requestId) {
            console.error("Request ID is missing in the message data");
            return;
        }
        var playlistArray = await getPlaylistArray(token);
        window.postMessage({ action: "getPlaylistArrayFromBackend", requestId: event.data.requestId, data: playlistArray, source: "yt-ext-response" }, "*");
        return;
    }


})