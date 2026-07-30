import { useEffect, useState } from 'react';
import "./Popup.css";
import browser, { action } from 'webextension-polyfill';
import JsonBox from './JsonBox';

export default function Popup() {
  const [playlistTitel, setPlaylistTitel] = useState("Anime");
  const [playlistData, setplaylistData] = useState<string[]>([]);
  const [showPageError, setShowPageError] = useState<boolean>(false);
  const [progressCount, setProgressCount] = useState<number | null>(null);
  const [videoCount, setVideoCount] = useState<number>(0);


  useEffect(() => {
    async function checkPage() {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const url = tabs[0]?.url ?? "";
      setShowPageError(!url.startsWith("https://www.youtube.com/playlist"));
    }
    checkPage();
  }, []);

  useEffect(() => {
    console.log("Hello from the popup!");

    const storagedPlaylistDataString = localStorage.getItem("playlistData");
    if (storagedPlaylistDataString != null) {
      try {
        const storagedPlaylistData = JSON.parse(storagedPlaylistDataString);
        setplaylistData(storagedPlaylistData);
      } catch (err) {
        console.error("Fehler beim Parsen des LocalStorage:", err);
      }
    }

    async function fetchPlaylistData() {
      try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (!tabs[0]?.id) return;

        const titel_response = await browser.tabs.sendMessage(tabs[0].id, {
          action: "getPlaylistTitel"
        });
        const vidoCount_response = await browser.tabs.sendMessage(tabs[0].id, {
          action: "getPlaylistVideoCount"
        })

        if (titel_response && titel_response.message) {
          setPlaylistTitel(titel_response.message);
        }
        if (vidoCount_response && vidoCount_response.message) {
          setVideoCount(vidoCount_response.message);
        }
      } catch (error) {
        console.error("Konnte die Playlist data nicht abrufen:", error);
      }
    }

    fetchPlaylistData();
  }, []);
  useEffect(() => {
    const listener = (message: any) => {
      if (message.action === "progressUpdate") {
        setProgressCount(message.count);
      }
    };
    browser.runtime.onMessage.addListener(listener);
    return () => browser.runtime.onMessage.removeListener(listener);
  }, []);

  // 2. Automatisch im localStorage speichern, sobald sich playlistData ändert
  useEffect(() => {
    if (playlistData && playlistData.length > 0) {
      localStorage.setItem("playlistData", JSON.stringify(playlistData));
    }
  }, [playlistData]);

  const handleGetJsonClick = async () => {
    try {
      setplaylistData([]);
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0]?.id) return;

      console.log("Starte das Einsammeln der Playlist...");
      const response = await browser.tabs.sendMessage(tabs[0].id, {
        action: "getPlaylistArray"
      });

      if (response && response.message) {
        setProgressCount(videoCount);
        setplaylistData(response.message);
        setProgressCount(null);
      }
    } catch (error) {
      console.error("Fehler beim Abrufen der Playlist-Daten:", error);
    }
  };

  return (
    <div id='main_element'>
      {showPageError ? (
        <div className='element_box error_element'>
          <span>Nicht in Einer youtube Playlist</span>
        </div>
      ) : null
      }
      <div className='element_box'>
        <h3 className='side_titel'>Get {playlistTitel} Playlist JSON</h3>
      </div>
      <div className='element_box'>
        <div className='Button' onClick={handleGetJsonClick}>
          <h5>Get JSON</h5>
        </div>
      </div>
      {progressCount != null ? (
        <div className="element_box">
          <div className='bar-track-titel-box'>
            <span className="label">
              Loaded
            </span>
            <span className="value">
              {((progressCount / videoCount) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="bar-track">
            <div className="bar-fill thin" style={{ width: `${videoCount > 0 ? `${((progressCount / videoCount) * 100).toFixed(1)}%` : "0%"}` }}>

            </div>
          </div>
        </div>
      ) : null
      }
      {playlistData && playlistData.length > 0 && (
        <JsonBox jsonData={JSON.stringify(playlistData, null, 4)} />
      )}
    </div>
  );
}