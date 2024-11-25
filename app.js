const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Directory for the stream folder
const streamDir = path.join(__dirname, 'stream');

// Ensure the 'stream' folder exists
if (!fs.existsSync(streamDir)) {
    fs.mkdirSync(streamDir, { recursive: true });
}

// Middleware to parse raw binary data
app.use((req, res, next) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
        req.body = Buffer.concat(chunks); // Concatenate chunks into a buffer
        next();
    });
});

// Handle file writing to the 'stream' folder via PUT requests
app.put('/stream/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(streamDir, filename);

    // Write the incoming data to the file
    fs.writeFile(filePath, req.body, (err) => {
        if (err) {
            console.error(`Failed to write file: ${filePath}`, err);
            return res.status(500).send('Failed to write file.');
        }
        console.log(`File written: ${filePath}`);
        res.status(200).send('File written successfully.');
    });
});

// Serve the 'stream' folder as static content for playback
app.use('/stream', express.static(streamDir));
app.use('/', express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Stream folder exposed at http://localhost:${PORT}/stream`);
});
