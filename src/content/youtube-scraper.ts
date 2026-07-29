import browser from 'webextension-polyfill';

console.log("🔥 JP's YouTube Scraper Content Script geladen!");

async function getPlaylistName() {
    const element = document.querySelectorAll("yt-dynamic-text-view-model.ytPageHeaderViewModelTitle.ytPageHeaderViewModelTitleMedium.ytPageHeaderViewModelTitleOverlay.dynamicTextViewModelHost")[0]?.getElementsByTagName("h1")[0]?.getElementsByTagName("span")[0] as HTMLElement;
    return element ? element.innerText : "";
}

async function scrollAndCollect() {
  const urls = new Set<string>();
  let lastCount = 0;
  
  while (true) {
    const links = document.querySelectorAll("ytd-playlist-video-list-renderer #content > #container > #meta h3 > a");
    links.forEach(link => {
        const formatted_link = link as HTMLAnchorElement;
        if (formatted_link.href) {
            urls.add(formatted_link.href);
        }
    });

    if (urls.size === lastCount) {
      console.log("Alle Videos geladen!");
      break;
    }
    
    lastCount = urls.size;
    console.log(`Bisher ${urls.size} Videos gefunden...`);

    const elements = document.querySelectorAll("ytd-playlist-video-list-renderer > #contents > *");
    if (elements.length > 0) {
        elements[elements.length - 1].scrollIntoView();
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  window.scrollTo({ top: 0, behavior: 'smooth' })

  return urls;
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
    const playlistUrls = Array.from(await scrollAndCollect());

    return { status: "success", message: playlistUrls };
  }
});