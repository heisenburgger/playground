# Playground

`users` can create a `workspace` by instantiating a `template`. templates are
boilerplate code.

these template code will be stored in some cloud storage. when the user creates
a workspace, it will be copied to a storage dedicated to them. whatever changes
they make, it will be stored in this new location.

creating a workspace:
- POST /workspaces { templateId: "react-ts" }
- copy the template code to user allocated storage since this process might
take longer (a template which has lots of files), do this in a background
process

accessing a workspace:
- establish a websocket connection to send data back and forth

- The UI contains
  - file explorer
  - editor
  - a shell
  - a place to view output if possible

- files/directories and file contents should be lazily loaded on demand
  - [ ] when the workspace is requested, get the root files
  - [ ] when the user clicks a file -> show content
  - [ ] when the user clicks a folder -> get the files

- as the user edits the file, send the changes
  - update in the storage allocated to the user 
  - update in the place where the code is going to be eexecuted

- expose the shell to the frontend
  how? -> xterm.js

- creating new files and folders
- installing dependencies
- vim mode
