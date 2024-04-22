import { WebSocketServer } from 'ws';
import * as pty from 'node-pty'

let ptyProcess: pty.IPty;

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  console.log("client connected")
  ptyProcess = pty.spawn("bash", [], {
    name: 'xterm-color'
  })

  ptyProcess.onData(data => {
    console.log("ptyProcess callback:", data)
    ws.send(JSON.stringify({ type: "TERM_OUTPUT", data }))
  })

  ws.on('error', console.error);

  ws.on('message', function message(data) {
    try {
      const buffer = Buffer.from(data as Buffer)
      const decoder = new TextDecoder('utf-8')
      const event = JSON.parse(decoder.decode(buffer))
      if (event.type === 'TERM_INPUT') {
        ptyProcess.write(event.data)
      }
    } catch (err) {
      console.error("error: reading websocket message:", err)
    }
  });
});
