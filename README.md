# YouTube Playlist Scraper Extension


A lightweight and sleek browser extension designed to extract YouTube playlist metadata and URLs smoothly, bypassing limitations and featuring a modern Glassmorphism UI.

## Features

* **Quick Extraction:** Scrapes YouTube playlist data directly via DOM traversal.
* **Modern UI:** Built with a clean Glassmorphism popup interface.
* **Local Data Handling:** Easily copy your scraped data instantly as JSON.
* **Firefox Ready:** Fully configured with `web-ext` for easy bundling.
* **Chrome Ready:** Fully configured with `crx` for easy buindling.

## How It Works

The extension injects a lightweight script into the active YouTube playlist tab when opened. It reads the playlist DOM elements to gather titles, video URLs, and metadata locally in your browser, bypassing external API restrictions. The popup interface then organizes this data for quick export.


## Preperation
```bash
npm install
```



## Development Setup

To Develop on this extension, follow these steps:

1. **Start Browser with HMR:**
   
   - **Start Firefox to Develop:**
      ```bash
      npm run dev:firefox
      ```
   - **Start Chrome to Develop:**
      ```bash
      npm run dev:chrome
      ```


## Building for Release

To build the extension package for release, follow these steps:

1. **Build the release package:**
   - **Build the release package for firefox**
      ```bash
      npm run release:firefox
      ```
   - **Build the release package for Chrome:**
      ```bash
      npm run release:chrome
      ```
   - **Build the full release package for All:**
      ```bash
      npm run release
      ```

2. **Finished and get builded files:**

   After running the build command, look into the newly created **\`release/\`** folder. You will find your ready-to-use extension \`.zip\` file located right in there!


## This is the oreginal Reponsetory:

[YouTube Playlist Scraper Extension Repo](https://github.com/jpcraft-jp/YouTubePlaylistScraperExtension)