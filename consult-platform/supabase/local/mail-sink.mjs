// Catches every email the local sign-in service sends and saves it to a file
// instead of delivering it, so confirmation and reset links can be opened
// during local testing. Never used in production.
import { mkdirSync, writeFileSync } from "node:fs";
import net from "node:net";

const dir = process.env.MAIL_DIR ?? ".local-supabase/mail";
const port = Number(process.env.MAIL_PORT ?? 2525);
mkdirSync(dir, { recursive: true });
let count = 0;

net
  .createServer((socket) => {
    let buffer = "";
    let inData = false;
    let message = "";
    socket.write("220 local mail sink\r\n");
    socket.on("data", (chunk) => {
      buffer += chunk.toString("utf8");
      for (;;) {
        if (inData) {
          const end = buffer.indexOf("\r\n.\r\n");
          if (end === -1) return;
          message = buffer.slice(0, end);
          buffer = buffer.slice(end + 5);
          inData = false;
          count += 1;
          const file = `${dir}/${String(Date.now())}-${count}.eml`;
          writeFileSync(file, message);
          console.log(`saved ${file}`);
          socket.write("250 saved\r\n");
          continue;
        }
        const nl = buffer.indexOf("\r\n");
        if (nl === -1) return;
        const line = buffer.slice(0, nl);
        buffer = buffer.slice(nl + 2);
        const verb = line.slice(0, 4).toUpperCase();
        if (verb === "EHLO" || verb === "HELO") socket.write("250 localhost\r\n");
        else if (verb === "DATA") {
          inData = true;
          socket.write("354 go ahead\r\n");
        } else if (verb === "QUIT") {
          socket.write("221 bye\r\n");
          socket.end();
        } else socket.write("250 ok\r\n");
      }
    });
    socket.on("error", () => {});
  })
  .listen(port, "127.0.0.1", () => console.log(`Local mail sink on 127.0.0.1:${port}, saving to ${dir}`));
