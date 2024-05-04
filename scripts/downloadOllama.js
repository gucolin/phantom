/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require("fs");
const https = require("https");
const os = require("os");
const path = require("path");

// Mapping of OS to binary info
const binariesInfo = {
  darwin: {
    url: "https://github.com/ollama/ollama/releases/download/v0.1.30/ollama-darwin",
    path: "../binaries/darwin/ollama-darwin",
  },
  linux: {
    url: "https://github.com/ollama/ollama/releases/download/v0.1.30/ollama-linux-amd64",
    path: "../binaries/linux/ollama-linux-amd64",
  },
  win32: {
    url: "https://github.com/ollama/ollama/releases/download/v0.1.30/ollama-windows-amd64.exe",
    path: "../binaries/win32/ollama-windows-amd64.exe",
  },
};

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  fs.mkdirSync(dirname, { recursive: true });
}

function setExecutable(filePath) {
  fs.chmod(filePath, 0o755, (err) => {
    if (err) throw err;
    console.log(`Set ${filePath} as executable.`);
  });
}

function downloadIfMissing(platformKey) {
  const info = binariesInfo[platformKey];
  const filePath = path.join(__dirname, info.path);
  ensureDirectoryExistence(filePath);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.log(`Downloading ${platformKey} Ollama binary...`);
      const request = https.get(info.url, (response) => {
        if (response.statusCode === 200) {
          const file = fs.createWriteStream(filePath);
          response.pipe(file);
          file.on("finish", () => {
            file.close(() => {
              console.log(`Downloaded ${platformKey} Ollama binary.`);
              // Set as executable if not on Windows
              if (platformKey !== "win32") {
                setExecutable(filePath);
              }
            });
          });
        } else if (response.statusCode === 302 || response.statusCode === 301) {
          // Handle redirection (if any)
          console.log(`Redirection to ${response.headers.location}`);
          binariesInfo[platformKey].url = response.headers.location;
          downloadIfMissing(platformKey); // Retry with the new URL
        } else {
          console.error(
            `Failed to download ${platformKey} binary. Status code: ${response.statusCode}`
          );
        }
      });
      request.on("error", (error) => {
        console.error(
          `Error downloading ${platformKey} binary: ${error.message}`
        );
      });
    } else {
      console.log(`${platformKey} Ollama binary already exists.`);
      // Ensure it's executable if it already exists and not on Windows
      if (platformKey !== "win32") {
        setExecutable(filePath);
      }
    }
  });
}

const platform = os.platform();

if (process.argv[2] === "all") {
  Object.keys(binariesInfo).forEach(downloadIfMissing);
} else {
  downloadIfMissing(platform);
}
