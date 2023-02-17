import {
  Typography,
  FormControl,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Button,
} from '@mui/material'
import React from 'react'

export default function Create() {
  const currentUrl = React.useMemo(() => {
    return window.location.pathname.split('/')[1] ?? ''
  }, [])

  const [alias, setAlias] = React.useState(currentUrl)
  const [url, setUrl] = React.useState('')

  const [adornGoLink, setAdornGoLink] = React.useState(alias !== '')

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
    <>
      <Typography variant="h3">Create a GoLink</Typography>
      <Typography variant="subtitle1"></Typography>

      <div>
        <FormControl fullWidth sx={{ m: 1, width: '50ch' }} variant="outlined">
          <InputLabel htmlFor="outlined-adornment-alias">Go Link</InputLabel>
          <OutlinedInput
            id="outlined-adornment-alias"
            required={true}
            type={'text'}
            onFocus={(e) => {
              setAdornGoLink(true)
            }}
            onBlur={(e) => {
              setAdornGoLink(alias !== '')
            }}
            startAdornment={
              adornGoLink ? (
                <InputAdornment position="start">go/</InputAdornment>
              ) : null
            }
            value={alias}
            onChange={(e) => {
              setAlias(e.target.value)
            }}
            label="Go Link"
          />
        </FormControl>
      </div>
      <div>
        <FormControl fullWidth sx={{ m: 1, width: '100ch' }} variant="outlined">
          <InputLabel htmlFor="outlined-adornment-url">Target URL</InputLabel>
          <OutlinedInput
            required={true}
            id="outlined-adornment-url"
            type={'text'}
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
            }}
            label="Target URL"
          />
        </FormControl>
      </div>
      <div>
        <FormControl fullWidth sx={{ m: 1, width: '10ch' }}>
          <Button onClick={handleSubmit} variant="contained">
            Create
          </Button>
        </FormControl>
      </div>
    </>
  )
}
