const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const PORTS = [5173, 8080, 8000, 3000];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// Connected Live-Reload Clients (SSE)
const sseClients = new Set();

function broadcastReload() {
  for (const res of sseClients) {
    try {
      res.write('data: reload\n\n');
    } catch {
      sseClients.delete(res);
    }
  }
}

// Watch directory for file changes
let reloadTimeout = null;
fs.watch(ROOT_DIR, { recursive: false }, (eventType, filename) => {
  if (!filename || filename.startsWith('.') || filename === 'package.json') return;
  clearTimeout(reloadTimeout);
  reloadTimeout = setTimeout(() => {
    console.log(`[dev] File changed (${filename}), refreshing browser...`);
    broadcastReload();
  }, 100);
});

const liveReloadSnippet = `
<!-- Dev Live Reload -->
<script>
  (function() {
    const es = new EventSource('/__livereload');
    es.onmessage = function(e) {
      if (e.data === 'reload') {
        console.log('[dev] Reloading page...');
        location.reload();
      }
    };
  })();
</script>
`;

function handleRequest(req, res) {
  const host = req.headers.host || 'localhost';
  const url = new URL(req.url, `http://${host}`);
  let pathname = decodeURIComponent(url.pathname);

  // SSE Live Reload Endpoint
  if (pathname === '/__livereload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write('\n');
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  // Resolve path to local filesystem
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  let filePath = path.join(ROOT_DIR, pathname);

  // If path has no extension and file doesn't exist, try appending .html
  if (!path.extname(filePath) && !fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath += '.html';
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>404 Not Found</h1><p>File <code>${pathname}</code> could not be found.</p><p><a href="/">Return Home</a></p>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    if (ext === '.html') {
      fs.readFile(filePath, 'utf8', (readErr, content) => {
        if (readErr) {
          res.writeHead(500);
          res.end('Server Error');
          return;
        }
        // Inject live reload script before </body>
        const injected = content.includes('</body>')
          ? content.replace('</body>', `${liveReloadSnippet}</body>`)
          : content + liveReloadSnippet;

        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(injected);
      });
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });
}

// Start listeners on each requested port
PORTS.forEach(port => {
  const server = http.createServer(handleRequest);
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`  ℹ️ Port ${port} is already in use, skipping.`);
    } else {
      console.error(`  ⚠️ Port ${port} error:`, err.message);
    }
  });
  server.listen(port, '0.0.0.0', () => {
    console.log(`  ➜ Local:   http://localhost:${port}/`);
    console.log(`  ➜ Network: http://192.168.1.22:${port}/`);
  });
});

console.log(`\n  ✨ Cleopatra Coiffeur Atelier Multi-Port Dev Server Starting...\n`);
