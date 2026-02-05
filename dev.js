import chokidar from 'chokidar';
import { convertMarkdownToHtml } from './convert_md.js';
import express from 'express';
import fs from 'fs';

const PUBLISH_INDEX = JSON.parse(
    fs.readFileSync('./content/publish_index.json', 'utf-8')
);
if (!Array.isArray(PUBLISH_INDEX)) throw new Error('publish_index.json is not a valid array');

function generate(path) {
    const entry = PUBLISH_INDEX.find(entry => entry.sourcePath === path);
    if (!entry) throw new Error(`Entry not found for ${path}`);
    convertMarkdownToHtml(
        entry.sourcePath,
        `./docs/${entry.urlPath}`,
        entry.title,
        entry.type
    );
}

function main() {
    for (const entry of PUBLISH_INDEX) {
        generate(entry.sourcePath);
    }

    // Watch for changes in markdown files and config files
    chokidar
        .watch(PUBLISH_INDEX.map(entry => entry.sourcePath))
        .on('change', (path) => {
            console.log(`File ${path} has been changed, regenerating...`);
            generate(path);
        });

    // Create express app
    const app = express();
    const PORT = 3000;

    // Serve static files from docs
    app.use(express.static('docs'));

    // Start the server
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

main();