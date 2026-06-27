import React from 'react'

export default function ThemeCustomizer({ theme, setTheme }) {
  function onBgColor(e) {
    setTheme({ ...theme, bgColor: e.target.value, bgImage: null })
  }

  function onColor(e) {
    setTheme({ ...theme, color: e.target.value })
  }

  function onUpload(e) {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => setTheme({ ...theme, bgImage: reader.result })
    reader.readAsDataURL(f)
  }

  function removeBg() {
    setTheme({ ...theme, bgImage: null })
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        Background:
        <input type="color" value={theme.bgColor} onChange={onBgColor} />
      </label>
      <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        Text:
        <input type="color" value={theme.color} onChange={onColor} />
      </label>
      <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        Upload:
        <input type="file" accept="image/*" onChange={onUpload} />
      </label>
      {theme.bgImage && <button onClick={removeBg}>Remove Bg</button>}
    </div>
  )
}
