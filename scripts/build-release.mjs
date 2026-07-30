import { build } from "vite";
import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync } from "fs";
import { execSync } from "child_process";
import { generateKeyPairSync } from "crypto";
import path from "path";
import ChromeExtension from "crx";

const targetBrowser = process.argv[2]; // "firefox" oder "chrome"
if (!targetBrowser) {
  console.error("Bitte Browser angeben: node build-release.mjs firefox|chrome");
  process.exit(1);
}

const distDir = path.resolve("dist");
const releaseDir = path.resolve("release");
const pkg = JSON.parse(readFileSync("package.json", "utf-8"));

if (!existsSync(releaseDir)) {
  mkdirSync(releaseDir, { recursive: true });
}

// 1. Vite-Build programmatisch anstoßen, mit passendem mode
await build({ mode: targetBrowser });

if (targetBrowser === "firefox") {
  // 2a. Firefox: web-ext build per CLI, da es kein eigenes JS-API-Äquivalent
  //     von Vite ist, sondern ein separates Mozilla-Tool
  execSync(
    "web-ext build --source-dir dist --artifacts-dir release --overwrite-dest",
    { stdio: "inherit" }
  );

  // 3a. Umbenennen mit live ausgelesener Version
  const base = `release/${pkg.name}-${pkg.version}`;
  renameSync(`${base}.zip`, `${base}-firefox.zip`);

  console.log(`✅ Release-Zip erstellt: ${base}-firefox.zip`);

} else if (targetBrowser === "chrome") {
  // 2b. Chrome: .crx bauen statt web-ext, da web-ext firefox-spezifisch signiert
  const keyPath = path.resolve("chrome-extension-key.pem");

  // Privaten Key einmalig erzeugen, falls noch keiner existiert.
  // WICHTIG: Diese Datei musst du dauerhaft aufheben und NIE ins Git-Repo committen!
  // Ohne diesen Key ändert sich bei jedem Build die Extension-ID.
  if (!existsSync(keyPath)) {
    console.log("Kein Private Key gefunden, erzeuge einen neuen...");
    const { privateKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
      publicKeyEncoding: { type: "spki", format: "pem" },
    });
    writeFileSync(keyPath, privateKey);
    console.log(`Private Key gespeichert unter: ${keyPath}`);
  }

  const privateKey = readFileSync(keyPath);

  const crx = new ChromeExtension({
    privateKey,
    rootDirectory: distDir,
  });

  try {
    await crx.load();
    const crxBuffer = await crx.pack();

    const outPath = path.join(releaseDir, `${pkg.name}-${pkg.version}-chrome.crx`);
    writeFileSync(outPath, crxBuffer);

    console.log(`✅ Release-CRX erstellt: ${outPath}`);
  } catch (err) {
    console.error("Fehler beim Erstellen der .crx-Datei:", err);
    process.exit(1);
  }

  // Zusätzlich auch als .zip fürs Chrome Web Store Upload
  // (Store verlangt eine .zip, kein .crx, daher beides bauen)
  execSync(
    `cd ${distDir} && zip -r ../release/${pkg.name}-${pkg.version}-chrome.zip .`,
    { stdio: "inherit", shell: "/bin/bash" }
  );

  console.log(
    `✅ Release-Zip erstellt: release/${pkg.name}-${pkg.version}-chrome.zip`
  );

} else {
  console.error(`Unbekannter Browser: ${targetBrowser}`);
  process.exit(1);
}
