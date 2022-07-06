export default async function writeStudioFile(path, content) {
  const res = await fetch(`http://127.0.0.1:8080/write-file/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: content
  })
  return res.text()
}