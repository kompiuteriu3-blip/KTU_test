import express from 'express';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const message = process.env.MESSAGE || 'Hello from TestApp!';

app.get('/', (req, res) => {
  const html = `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>TestApp</title>
      <style>
        html, body { height: 100%; margin: 0; }
        body { display: flex; align-items: center; justify-content: center; background: #0b0f19; color: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; }
        .center { text-align: center; }
        .title { font-size: 4rem; font-weight: 800; letter-spacing: 0.02em; }
        .subtitle { margin-top: 1rem; font-size: 1rem; opacity: 0.8; }
      </style>
    </head>
    <body>
      <div class="center">
        <div class="title">${message}</div>
        <div class="subtitle" id="local-time"></div>
      </div>
      <script>
        (function() {
          function pad(n){ return String(n).padStart(2,'0'); }
          function tzShort(date){
            try {
              var parts = new Intl.DateTimeFormat(navigator.language || undefined, { timeZoneName: 'short' }).formatToParts(date);
              var tz = parts.find(function(p){ return p.type === 'timeZoneName'; });
              return tz && tz.value ? tz.value : Intl.DateTimeFormat().resolvedOptions().timeZone;
            } catch(e) {
              return Intl.DateTimeFormat().resolvedOptions().timeZone;
            }
          }
          function renderLocalTime() {
            var el = document.getElementById('local-time');
            if (!el) return;
            var now = new Date();
            var y = now.getFullYear();
            var m = pad(now.getMonth()+1);
            var d = pad(now.getDate());
            var h = pad(now.getHours());
            var mi = pad(now.getMinutes());
            var s = pad(now.getSeconds());
            el.textContent = y+"-"+m+"-"+d+" "+h+":"+mi+":"+s+" "+tzShort(now);
          }
          renderLocalTime();
          setInterval(renderLocalTime, 1000);
        })();
      </script>
    </body>
  </html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// JSON endpoint if needed
app.get('/api', (req, res) => {
  res.json({ message, time: new Date().toISOString() });
});

app.get('/healthz', (req, res) => {
  res.send('ok');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
