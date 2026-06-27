import React, { useState } from 'react'
import Editor from './components/Editor'
import ThemeCustomizer from './components/ThemeCustomizer'

export default function App() {
  const [theme, setTheme] = useState({ bgColor: '#ffffff', color: '#111827', bgImage: null })

  const containerStyle = {
    color: theme.color,
    minHeight: '100vh',
    backgroundColor: theme.bgImage ? undefined : theme.bgColor,
    backgroundImage: theme.bgImage ? `url(${theme.bgImage})` : undefined,
    backgroundSize: theme.bgImage ? 'cover' : undefined,
    backgroundRepeat: theme.bgImage ? 'no-repeat' : undefined,
  }

  return (
    <div style={containerStyle}>
      <header style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Personal Journal</h1>
        <ThemeCustomizer theme={theme} setTheme={setTheme} />
      </header>
      <main style={{ padding: 16 }}>
        <Editor />
      </main>
    </div>
  )
}
