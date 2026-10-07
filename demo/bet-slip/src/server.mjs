import http from 'node:http';
import { config } from './config.mjs';
import { quote } from './slip.mjs';

const routes = {
  'POST /slip/quote': (body) => quote(body),
};

http
  .createServer(async (req, res) => {
    const handler = routes[`${req.method} ${req.url}`];
    let raw = '';
    for await (const c of req) raw += c;
    try {
      if (!handler) throw Object.assign(new Error('Not found'), { status: 404 });
      const out = await handler(raw ? JSON.parse(raw) : {});
      res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(out));
    } catch (err) {
      res.writeHead(err.status ?? 500, { 'content-type': 'application/json' }).end(JSON.stringify({ error: err.message }));
    }
  })
  .listen(config.port, () => console.log(`bet-slip on :${config.port}`));
