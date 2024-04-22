import Editor, { loader } from '@monaco-editor/react'
import { useEffect, useRef, useState } from 'react'
import { sendMessage } from '../lib/ws'
import { EditorFileSystem, SocketMessageRecv } from '../types'
import { FileTree } from './components/FileTree'
import { Terminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'

loader.init().then((monaco) => {
  monaco.editor.defineTheme('my-theme', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#1c2333'
    },
  })
})

export function HomePage() {
  const terminalNodeRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<Terminal | null>(null)
  const [fileSystem, setFileSystem] = useState<EditorFileSystem>({
    "/": []
  })
  const [fileContent, setFileContent] = useState("")
  const socketRef = useRef<WebSocket | null>(null)

  function init() {
    // TODO: configure this url
    if (socketRef.current) {
      return
    }

    const socket = new WebSocket("ws://localhost:8080/ws")
    socketRef.current = socket

    const terminal = new Terminal({
      theme: {
        'foreground': 'F9F5FC',
        'background': '#1c2333',
      }
    })

    terminal.onData(data => {
      sendMessage(socket, {
        name: 'TERMINAL_INPUT',
        data
      })
    })

    if (terminalNodeRef.current && !terminalRef.current) {
      terminal.open(terminalNodeRef.current)
      terminalRef.current = terminal
    }

    socket.onopen = () => {
      console.log("debug: ws server connection opened")
      sendMessage(socket, {
        name: 'GET_DIR_LISTINGS',
        path: '/'
      })
    }

    socket.onerror = (err) => {
      console.error("error: failed to connect to ws server:", err)
    }

    socket.onmessage = (msg) => {
      try {
        const event: SocketMessageRecv = JSON.parse(msg.data)
        switch (event.name) {
          case 'DIR_LISTINGS': {
            setFileSystem(prev => ({
              ...prev,
              [event.path]: event.files
            }))
            break
          }
          case 'FILE_CONTENT': {
            setFileContent(event.content)
            break
          }
          case 'TERMINAL_OUTPUT': {
            if (terminalRef.current) {
              terminalRef.current.write(event.data)
            }
            break
          }
        }
      } catch (err) {
        console.error("error: parsing incoming ws server message:", err)
      }
    }

    socket.onclose = () => {
      console.error("error: ws server connection closed")
    }
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 grid grid-cols-[350px_1fr_500px] p-4 gap-4 overflow-hidden">
        {socketRef.current && (
          <FileTree setFileSystem={setFileSystem} fileSystem={fileSystem} dirEntries={fileSystem["/"] ?? []} socket={socketRef.current} />
        )}
        <div className="bg-bg2 rounded-lg h-[100%] px-2">
          <Editor
            value={fileContent}
            options={{
              fontSize: 16,
              fontFamily: "JetBrains Mono",
              lineNumbers: "off",
              padding: {
                top: 16,
                bottom: 16,
              },
              minimap: {
                enabled: false
              },
              overviewRulerLanes: 0,
              glyphMargin: false,
              folding: false,
              lineDecorationsWidth: 0,
              lineNumbersMinChars: 0,
              scrollbar: {
                vertical: "hidden",
                horizontal: "hidden",
              },
              wordWrap: 'on',
            }}
            theme="my-theme" />
        </div>
        <div className="bg-bg2 rounded-lg" ref={terminalNodeRef}>
        </div>
      </div>
    </div>
  )
}
