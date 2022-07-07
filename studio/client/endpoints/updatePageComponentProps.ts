export default async function updatePageComponentProps(
  updatedState: {
    name: 'Banner',
    props: Record<string, number | string | boolean>
  }[]
) {
  const res = await fetch('http://127.0.0.1:8080/update-page-component-props', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ updatedState })
  })
  return res.text()
}