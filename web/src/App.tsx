import * as React from 'react'
import AppBar from './AppBar'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

import './App.css'

function App() {
  const currentUrl = React.useMemo(() => {
    return window.location.pathname.split('/')[1] ?? ''
  }, [])

  const [alias, setAlias] = React.useState(currentUrl)
  const [url, setUrl] = React.useState('')

  React.useEffect(() => {
    fetch('/_api_/list')
      .then((res) => res.json())
      .catch(console.error)
  }, [])

  const handleSubmit: React.FormEventHandler = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      fetch('/_api_/new', {
        method: 'POST',
        body: new URLSearchParams({ alias, url }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
      })
        .then(() => {
          window.location.assign('/' + alias)
        })
        .catch(console.error)

      setAlias('')
      setUrl('')
    },
    [alias, url],
  )

  return (
    <div className="App">
      <AppBar />
      <p>Hello!</p>
      <Paper elevation={3}>
        <form onSubmit={handleSubmit}>
          <TextField
            required
            id="alias"
            label="go/"
            defaultValue=""
            autoFocus={true}
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
          />
          <TextField
            required
            id="url"
            label="URL"
            defaultValue=""
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button type="submit" variant="contained">
            Create link
          </Button>
        </form>
      </Paper>
    </div>
  )
}

export default App
