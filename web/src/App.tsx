import GoLinkAppBar from './AppBar'

import './App.css'
import { Box, CssBaseline, Toolbar } from '@mui/material'
import Create from './Create'

function App() {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <GoLinkAppBar />
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
      >
        <Toolbar />
        <Create />
      </Box>
    </Box>
  )
}

export default App
