import { useEffect, useState } from 'react';
import "./Popup.css";
import browser from 'webextension-polyfill';
import JsonBox from './JsonBox';

export default function Popup() {
  const [playlistTitel, setPlaylistTitel] = useState("Anime");
  const [playlistData, setplaylistData] = useState<string[]>([]);
  const [showPageError, setShowPageError] = useState<boolean>(false); // todo: implement right implementation

  // 1. Beim Starten des Popups Daten aus dem localStorage laden
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

    async function fetchPlaylistTitle() {
      try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (!tabs[0]?.id) return;

        const response = await browser.tabs.sendMessage(tabs[0].id, {
          action: "getPlaylistTitel"
        });

        if (response && response.message) {
          setPlaylistTitel(response.message);
        }
      } catch (error) {
        console.error("Konnte den Titel nicht abrufen:", error);
      }
    }

    fetchPlaylistTitle();
  }, []);

  // 2. Automatisch im localStorage speichern, sobald sich playlistData ändert
  useEffect(() => {
    if (playlistData && playlistData.length > 0) {
      localStorage.setItem("playlistData", JSON.stringify(playlistData));
    }
  }, [playlistData]);

  const handleGetJsonClick = async () => {
    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0]?.id) return;

      console.log("Starte das Einsammeln der Playlist...");
      const response = await browser.tabs.sendMessage(tabs[0].id, {
        action: "getPlaylistArray"
      });

      if (response && response.message) {
        setplaylistData(response.message);
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
      {playlistData && playlistData.length > 0 && (

        <JsonBox jsonData={JSON.stringify(playlistData, null, 4)} />
      )}
    </div>
  );
}