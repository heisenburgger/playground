import { Fragment } from 'react/jsx-runtime'
import { sendMessage } from '../../lib/ws'
import { DirEntry, EditorFileSystem, SetEditorFileSystem } from '../../types'
import { File as FileIcon, Folder as FolderIcon } from 'lucide-react'

type Props = {
  fileSystem: EditorFileSystem
  setFileSystem: SetEditorFileSystem
  dirEntries: DirEntry[]
  socket: WebSocket
}

export function FileTree(props: Props) {
  const { dirEntries, socket, fileSystem, setFileSystem } = props

  if (!dirEntries.length) {
    return <p className="text-sm pl-4 text-muted">No file or directory</p>
  }

  return (
    <div className="flex flex-col gap-2 overflow-auto scroller">
      {dirEntries.map(entry => {
        const segments = entry.name.split('/')
        const name = segments[segments.length - 1]
        return (
          <Fragment key={entry.name}>
            <button onClick={() => {
              if (!socket) {
                return
              }

              if (entry.type === 'file') {
                sendMessage(socket, {
                  name: 'GET_FILE_CONTENT',
                  filename: entry.name
                })
              } else if (entry.type === 'dir' && !fileSystem[entry.name]) {
                sendMessage(socket, {
                  name: 'GET_DIR_LISTINGS',
                  path: entry.name
                })
              } else if (entry.type === 'dir' && fileSystem[entry.name]) {
                setFileSystem(prev => ({
                  ...prev,
                  [entry.name]: undefined
                }))
              }
            }} className="flex gap-2 items-center">
              {entry.type === 'dir' ? <FolderIcon size={18} /> : <FileIcon size={18} />}
              <span>{name}</span>
            </button>
            {entry.type === 'dir' && Array.isArray(fileSystem[entry.name]) && (
              <div className="pl-4">
                <FileTree setFileSystem={setFileSystem} fileSystem={fileSystem} dirEntries={fileSystem[entry.name] ?? []} socket={socket} />
              </div>
            )}
          </Fragment>
        )
      })}
    </div>
  )

}
