class YoutubePlaylistExtensionApi {
    private token: string;
    constructor(token: string) {
        this.token = token;
    }

    async getPlaylistArray(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const requestId = crypto.randomUUID();

            const handler = (event: MessageEvent) => {
                if (event.source !== window) return;
                if (event.data?.source !== "yt-ext-response") return;
                if (event.data?.requestId !== requestId) return;

                window.removeEventListener("message", handler);
                if (event.data.error) {
                    reject(new Error(event.data.error));
                } else {
                    resolve(event.data.data);
                }
            };
            window.addEventListener("message", handler);

            window.postMessage({
                source: "yt-ext-request",
                action: "getPlaylistArrayFromBackend",
                requestId,
                token: this.token,
            }, "*");
        });
    }
}

declare global {
    interface Window {
        youtubePlaylistExtensionApi: typeof YoutubePlaylistExtensionApi | undefined;
    }
}

window.youtubePlaylistExtensionApi = YoutubePlaylistExtensionApi;

export default YoutubePlaylistExtensionApi;