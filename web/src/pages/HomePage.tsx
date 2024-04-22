import Editor, { loader } from '@monaco-editor/react'

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
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 grid grid-cols-[350px_1fr_1fr] p-4 gap-4">
        <div className="">
        </div>
        <div className="bg-bg2 rounded-lg h-[100%] px-2">
          <Editor
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
                handleMouseWheel: false,
              },
              wordWrap: 'on',
            }}
            theme="my-theme" defaultLanguage="javascript" defaultValue="// some comment" />
        </div>
        <div className="bg-bg2 rounded-lg">
        </div>
      </div>
    </div>
  )
}
