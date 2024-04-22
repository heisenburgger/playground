import { SocketMessageSend } from '../types'

export function sendMessage(socket: WebSocket, msg: SocketMessageSend) {
  socket.send(JSON.stringify(msg))
}
