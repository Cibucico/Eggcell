// Stands in for Supabase's API gateway on one port:
//   /auth/v1/*  -> the sign-in service (GoTrue)
//   /rest/v1/*  -> the data API (PostgREST)
import http from "node:http";

const routes = [
  ["/auth/v1", Number(process.env.AUTH_PORT ?? 9999)],
  ["/rest/v1", Number(process.env.REST_PORT ?? 3001)],
];
const port = Number(process.env.GATEWAY_PORT ?? 54321);

http
  .createServer((req, res) => {
    const route = routes.find(([prefix]) => req.url.startsWith(prefix));
    if (!route) {
      res.writeHead(404).end("not found");
      return;
    }
    const [prefix, target] = route;
    const upstream = http.request(
      {
        host: "127.0.0.1",
        port: target,
        method: req.method,
        path: req.url.slice(prefix.length) || "/",
        headers: { ...req.headers, host: `127.0.0.1:${target}` },
      },
      (up) => {
        res.writeHead(up.statusCode ?? 502, up.headers);
        up.pipe(res);
      },
    );
    upstream.on("error", () => res.writeHead(502).end("service unavailable"));
    req.pipe(upstream);
  })
  .listen(port, "127.0.0.1", () => console.log(`Local Supabase gateway on http://127.0.0.1:${port}`));
