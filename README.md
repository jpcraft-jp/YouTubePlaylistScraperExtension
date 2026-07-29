# YouTube Playlist Scraper Extension

A lightweight and sleek browser extension designed to extract YouTube playlist metadata and URLs smoothly, bypassing limitations and featuring a modern Glassmorphism UI.

## Features

* **Quick Extraction:** Scrapes YouTube playlist data directly via DOM traversal.
* **Modern UI:** Built with a clean Glassmorphism popup interface.
* **Local Data Handling:** Easily copy your scraped data instantly as JSON.
* **Firefox Ready:** Fully configured with `web-ext` for easy bundling.

## How It Works

The extension injects a lightweight script into the active YouTube playlist tab when opened. It reads the playlist DOM elements to gather titles, video URLs, and metadata locally in your browser, bypassing external API restrictions. The popup interface then organizes this data for quick export.

## Installation & Building

To build the extension package for release, follow these steps:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the release package:**
   ```bash
   npm run build:release
   ```

After running the build command, look into the newly created **\`release/\`** folder. You will find your ready-to-use extension \`.zip\` file located right in there!