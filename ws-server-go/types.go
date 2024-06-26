package main

type DirEntry struct {
	Name string `json:"name"`
	Type string `json:"type"`
}

type Event struct {
	Name string `json:"name"`
}

type TerminalOutputEvent struct {
	Event
	Data string `json:"data"`
}

type DirListingsEvent struct {
	Event
	Files []*DirEntry `json:"files"`
	Path  string      `json:"path"`
}

type FileContentEvent struct {
	Event
	Content  string `json:"content"`
	Filename string `json:"filename"`
}
