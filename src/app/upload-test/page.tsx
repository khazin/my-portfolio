export default function UploadTestPage() {
  async function onSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const res = await fetch('/api/upload-test', { method: 'POST', body: formData });
    const json = await res.json();
    console.log(json);
  }

  return (
    <form onSubmit={onSubmit}>
      <input type="file" name="resume" />
      <button type="submit">Upload Test</button>
    </form>
  );
}
