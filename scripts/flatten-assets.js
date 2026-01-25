const fs = require("fs");
const path = require("path");

async function build() {
  const openNextDir = path.join(process.cwd(), ".open-next");
  const assetsDir = path.join(openNextDir, "assets");

  console.log("--- Flattening OpenNext Assets ---");

  // 1. Handle worker.js -> _worker.js
  const workerPath = path.join(openNextDir, "worker.js");
  const targetWorkerPath = path.join(openNextDir, "_worker.js");

  if (fs.existsSync(workerPath)) {
    console.log("Renaming worker.js to _worker.js...");
    fs.renameSync(workerPath, targetWorkerPath);
  } else if (fs.existsSync(targetWorkerPath)) {
    console.log("_worker.js already exists.");
  } else {
    console.error("CRITICAL: Neither worker.js nor _worker.js found!");
  }

  // 2. Handle assets
  if (fs.existsSync(assetsDir)) {
    console.log("Copying assets to root...");
    copyRecursiveSync(assetsDir, openNextDir);
    console.log("Assets flattened successfully.");
  } else {
    console.log("No assets directory found to flatten.");
  }

  // 3. Handle _routes.json (ensure it's in the root of .open-next)
  const routesPath = path.join(process.cwd(), "public", "_routes.json");
  const targetRoutesPath = path.join(openNextDir, "_routes.json");
  if (fs.existsSync(routesPath)) {
    console.log("Copying _routes.json to root...");
    fs.copyFileSync(routesPath, targetRoutesPath);
  }
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName),
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

build().catch((err) => {
  console.error("Build helper failed:", err);
  process.exit(1);
});
