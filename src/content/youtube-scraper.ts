import browser from 'webextension-polyfill';

console.log("🔥 JP's YouTube Scraper Content Script geladen!");


declare global {
  interface Window {
    ytInitialData: any
  }
}


async function getPlaylistName() {
    const element = document.querySelectorAll("yt-dynamic-text-view-model.ytPageHeaderViewModelTitle.ytPageHeaderViewModelTitleMedium.ytPageHeaderViewModelTitleOverlay.dynamicTextViewModelHost")[0]?.getElementsByTagName("h1")[0]?.getElementsByTagName("span")[0] as HTMLElement;
    return element ? element.innerText : "";
}




async function fetchAllPlaylistVideos(ytInitialData: any) {
    const videoIds = new Set();
    
    // Deine Extraktions-Logik
    function extract(jsonObj: any) {
        if (jsonObj === null || typeof jsonObj !== 'object') return;
        for (const key of Object.keys(jsonObj)) {
            const val = jsonObj[key];
            if (key === 'videoId' && typeof val === 'string') {
                videoIds.add(val);
            } else {
                extract(val);
            }
        }
    }

    let previousSize = 0;
    let attemptsWithoutChange = 0;

    console.log("Starte automatisches Laden der Playlist...");

    // Schleife läuft, solange sich die Anzahl der Videos noch vergrößert
    while (true) {
        // 1. Aktuelle Daten aus dem globalen YouTube-Objekt parsen
        if (ytInitialData) {
            extract(ytInitialData);
        }

        document.querySelectorAll('a#video-title').forEach(el => {
            const href = el.getAttribute('href');
            if (href && href.includes('v=')) {
                const match = href.match(/[?&]v=([^&]+)/);
                if (match) videoIds.add(match[1]);
            }
        });
        
        browser.runtime.sendMessage({
            action: "progressUpdate",
            count: videoIds.size
        }).catch(() => {});

        console.log(`Bisher gesammelte eindeutige IDs: ${videoIds.size}`);

        // Prüfen, ob neue Videos hinzugekommen sind
        if (videoIds.size === previousSize) {
            attemptsWithoutChange++;
            // Wenn 3 Mal in Folge trotz Scrollen keine neuen IDs dazukommen, sind wir am Ende
            if (attemptsWithoutChange >= 3) {
                console.log("Ende der Playlist erreicht oder keine neuen Videos mehr geladen.");
                break;
            }
        } else {
            attemptsWithoutChange = 0;
            previousSize = videoIds.size;
        }

        // 2. Ans Ende der Seite scrollen, um den nächsten "Chunk" zu triggern
        window.scrollTo(0, document.documentElement.scrollHeight);

        // 3. Warten, bis YouTube nachgeladen hat (ca. 2 Sekunden)
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`Fertig! Insgesamt ${videoIds.size} Videos gefunden.`);

    window.scrollTo({ top: 0, behavior: 'smooth' });

    return videoIds;
}



async function getVideoCount() {
    const element = document.querySelectorAll("ytd-page-manager#page-manager > ytd-browse > yt-page-header-renderer > yt-page-header-view-model > div:nth-of-type(2) > div > div > div > yt-content-metadata-view-model > div:nth-of-type(2) > span:nth-of-type(5)")[0] as HTMLElement;

    const anzahl = element ? Number(element.innerText.split(" ")[0]) : 0;
    return anzahl;
}

// Der korrekte Listener für browser.tabs.sendMessage
browser.runtime.onMessage.addListener(async (request, _sender) => {
  if (request.action === "getPlaylistTitel") {
    const playlistTitel = await getPlaylistName();
    return { status: "success", message: playlistTitel };
  }

  if (request.action === "getPlaylistArray") {
    var allVideoIds = await fetchAllPlaylistVideos(window.ytInitialData);
    var playlistUrls: Array<String> = []
    allVideoIds.forEach((value, value2, set) => {
      playlistUrls.push("https://www.youtube.com/watch?v=" + value)
    })

    return { status: "success", message: playlistUrls };
  }
  if (request.action === "getPlaylistVideoCount") {
    var video_count = await getVideoCount();

    return { status: "success", message: video_count };
  }
});