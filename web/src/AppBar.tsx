import * as React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import { SearchBar } from './SearchBar'
import {
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'

import { Add, HelpCenter } from '@mui/icons-material'

const drawerWidth = 240

export default function GoLinkAppBar() {
  const showAbout = React.useCallback(() => {
    alert('todo')
  }, [])

  return (
    <>
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
      >
        <Toolbar>
          <SearchBar />
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar>
          <Typography variant="h4">GoLinks</Typography>
        </Toolbar>
        <Divider />
        <List>
          <ListItem key={'create'} disablePadding>
            <ListItemButton selected={true}>
              <ListItemIcon>
                <Add />
              </ListItemIcon>
              <ListItemText primary={'Create New'} />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem key={'about'} disablePadding>
            <ListItemButton onClick={showAbout}>
              <ListItemIcon>
                <HelpCenter />
              </ListItemIcon>
              <ListItemText primary={'About'} />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
        <Typography variant="caption" sx={{ p: 2 }}>
          &copy; 2021 GoLinks
        </Typography>
      </Drawer>
    </>
  )
}
