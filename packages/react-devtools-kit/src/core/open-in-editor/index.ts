export function openInEditor(fileName: string, line: number, column: number) {
  try {
    // Use vue-devtools kit's openInEditor which handles the server communication
    // But we need to adapt the call signature or implementation
    // For now, we can reuse the existing mechanism if available in the global context
    // or reimplement a simple fetch to the dev server

    // The standard Vite way: fetch('/__open-in-editor?file=...')
    const url = `/__open-in-editor?file=${encodeURIComponent(`${fileName}:${line}:${column}`)}`
    fetch(url).catch(() => {})
  }
  catch (e) {
    console.error('Failed to open in editor:', e)
  }
}
