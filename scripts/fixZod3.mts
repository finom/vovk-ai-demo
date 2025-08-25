import fs from "fs/promises";
import path from "path";

const dir = "src/zod";

// @ts-check
async function walk(dirPath, callback) {
  const files = await fs.readdir(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if ((await fs.stat(fullPath)).isDirectory()) {
      walk(fullPath, callback);
    } else {
      callback(fullPath);
    }
  }
}

walk(dir, async (filePath) => {
  const content = await fs.readFile(filePath, "utf8");
  const updated = content.replace(/from ['"]zod['"]/g, `from 'zod/v3'`);
  if (updated !== content) {
    await fs.writeFile(filePath, updated);
    console.log(`✔ Updated: ${filePath}`);
  }
});
