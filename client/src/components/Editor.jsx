import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

function TextBlock({ text, onChange }) {
  return (
    <div className="block">
      <textarea value={text} onChange={e => onChange(e.target.value)} style={{ width: '100%', minHeight: 80 }} />
    </div>
  )
}

function SpotifyBlock({ code, onEdit }) {
  return (
    <div className="block">
      <div style={{ marginBottom: 8 }}>
        <div dangerouslySetInnerHTML={{ __html: code }} />
      </div>
      <div>
        <button onClick={onEdit}>Edit Embed</button>
      </div>
    </div>
  )
}

export default function Editor() {
  const [blocks, setBlocks] = useState([{ id: String(Date.now()), type: 'text', content: '' }])
  const [templates, setTemplates] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gj_templates') || 'null') || []
    } catch { return [] }
  })
  const [tokens, setTokens] = useState(null)
  const [fileId, setFileId] = useState(null)

  useEffect(() => {
    function onMessage(e) {
      if (e.data && e.data.access_token) {
        setTokens(e.data)
        localStorage.setItem('gj_tokens', JSON.stringify(e.data))
      }
    }
    window.addEventListener('message', onMessage)
    const saved = localStorage.getItem('gj_tokens')
    if (saved) setTokens(JSON.parse(saved))
    return () => window.removeEventListener('message', onMessage)
  }, [])

  function addText() { setBlocks([...blocks, { id: String(Date.now() + Math.random()), type: 'text', content: '' }]) }
  function addSpotify() { setBlocks([...blocks, { id: String(Date.now() + Math.random()), type: 'spotify', content: '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/" width="100%" height="80" frameBorder="0" allowtransparency="true" allow="encrypted-media"></iframe>' }]) }

  function update(i, content) {
    const c = [...blocks]; c[i].content = content; setBlocks(c)
  }

  function onDragEnd(result) {
    if (!result.destination) return
    const src = result.source.index
    const dst = result.destination.index
    const items = Array.from(blocks)
    const [moved] = items.splice(src, 1)
    items.splice(dst, 0, moved)
    setBlocks(items)
  }

  async function startAuth() {
    const r = await axios.get('http://localhost:4000/auth/url')
    const w = window.open(r.data.url, 'auth', 'width=600,height=700')
    if (!w) alert('Popup blocked. Allow popups for this site.')
  }

  async function saveToDrive() {
    if (!tokens) return alert('Please authenticate first')
    const filename = prompt('Filename to save as', 'journal.json')
    if (!filename) return
    const content = JSON.stringify({ blocks })
    const r = await axios.post('http://localhost:4000/save', { content, filename, tokens })
    if (r.data && r.data.fileId) setFileId(r.data.fileId)
    alert('Saved')
  }

  async function loadFromDrive() {
    if (!tokens) return alert('Please authenticate first')
    const id = prompt('File ID to load from', fileId || '')
    if (!id) return
    const r = await axios.post('http://localhost:4000/load', { fileId: id, tokens })
    if (r.data && r.data.content) {
      const data = JSON.parse(r.data.content)
      setBlocks(data.blocks || [{ type: 'text', content: '' }])
      setFileId(id)
    }
  }

  // Templates
  const builtin = [
    { name: 'Daily', blocks: [ { id: 't1', type: 'text', content: 'Today I...\n\nHighlights:\n- ' }, { id: 't2', type: 'text', content: 'Mood: ' } ] },
    { name: 'Gratitude', blocks: [ { id: 'g1', type: 'text', content: 'I am grateful for:\n1.\n2.\n3.' } ] },
    { name: 'Travel', blocks: [ { id: 'r1', type: 'text', content: 'Location:\nNotes:\nPhoto ideas:' } ] }
  ]

  function applyTemplate(t) {
    setBlocks(t.blocks.map(b => ({ ...b, id: String(Date.now() + Math.random()) })))
  }

  function saveTemplate() {
    const name = prompt('Template name')
    if (!name) return
    const t = { name, blocks }
    const list = [...templates, t]
    setTemplates(list)
    localStorage.setItem('gj_templates', JSON.stringify(list))
    alert('Saved template')
  }

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button onClick={addText}>Add Text</button>
        <button onClick={addSpotify} style={{ marginLeft: 8 }}>Add Spotify Embed</button>
        <button onClick={startAuth} style={{ marginLeft: 8 }}>Connect Google Drive</button>
        <button onClick={saveToDrive} style={{ marginLeft: 8 }}>Save</button>
        <button onClick={loadFromDrive} style={{ marginLeft: 8 }}>Load</button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="editor-droppable">
          {(provided) => (
            <div className="editor" ref={provided.innerRef} {...provided.droppableProps}>
              {blocks.map((b, i) => (
                <Draggable key={b.id} draggableId={b.id} index={i}>
                  {(prov) => (
                    <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}>
                      {b.type === 'text' ? <TextBlock text={b.content} onChange={v => update(i, v)} /> : <SpotifyBlock code={b.content} onEdit={() => {
                        const val = prompt('Paste Spotify track URL, URI, or ID')
                        if (!val) return
                        // extract track id
                        const m = val.match(/track\/([a-zA-Z0-9]+)/) || val.match(/spotify:track:([a-zA-Z0-9]+)/) || [null, val]
                        const id = m && m[1] ? m[1] : val
                        const iframe = `<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/${id}" width="100%" height="80" frameBorder="0" allowtransparency="true" allow="encrypted-media"></iframe>`
                        update(i, iframe)
                      }} />}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
