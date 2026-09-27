import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import App from './App'
import MarketsPage from './MarketsPage'
import VisionPage from './VisionPage'
import TeamPage from './TeamPage'
import './index.css'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

const rootEl = document.getElementById('root')!
const appWindow = window as typeof window & {
  __reactRoot?: ReturnType<typeof ReactDOM.createRoot>
}

const root = appWindow.__reactRoot ?? ReactDOM.createRoot(rootEl)
appWindow.__reactRoot = root

root.render(
  <BrowserRouter>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/markets" element={<MarketsPage />} />
      <Route path="/vision" element={<VisionPage />} />
      <Route path="/team" element={<TeamPage />} />
    </Routes>
  </BrowserRouter>,
)

import.meta.hot?.dispose(() => {
  root.unmount()
  delete appWindow.__reactRoot
})
