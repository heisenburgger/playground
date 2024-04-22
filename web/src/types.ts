import React from "react"

type GetDirListingsEvent = {
  name: 'GET_DIR_LISTINGS'
  path: string
}

type DirListingsEvent = {
  path: string
  name: 'DIR_LISTINGS'
  files: DirEntry[]
}

type GetFileContentEvent = {
  name: 'GET_FILE_CONTENT'
  filename: string
}

type FileContentEvent = {
  name: 'FILE_CONTENT'
  content: string
  filename: string
}

type TerminalInputEvent = {
  name: 'TERMINAL_INPUT'
  data: string
}

type TerminalOutputEvent = {
  name: 'TERMINAL_OUTPUT'
  data: string
}

export type DirEntry = {
  type: 'dir'
  name: string
} | {
  type: 'file'
  name: string
}

export type EditorFileSystem = Record<string, DirEntry[] | undefined>
export type SocketMessageSend = GetDirListingsEvent | GetFileContentEvent | TerminalInputEvent
export type SocketMessageRecv = DirListingsEvent | FileContentEvent | TerminalOutputEvent
export type SetEditorFileSystem = React.Dispatch<React.SetStateAction<EditorFileSystem>>
