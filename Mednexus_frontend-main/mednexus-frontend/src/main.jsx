import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './contexts/ToastContext'
import { PersonalizationProvider } from './contexts/PersonalizationContext'
import { LanguageProvider } from './contexts/LanguageContext'

// Get the root element
const rootElement = document.getElementById('root')

// Set initial theme attributes
const savedTheme = localStorage.getItem('mednexus-theme')
if (savedTheme) {
  try {
    const theme = JSON.parse(savedTheme)
    rootElement.setAttribute('data-theme-color', theme.color || 'blue')
    rootElement.setAttribute('data-color-mode', theme.colorMode || 'single')
    rootElement.setAttribute('data-pattern', theme.pattern || 'none')
    rootElement.setAttribute('data-pattern-intensity', theme.patternIntensity || 'medium')
    // Apply dark mode class early to avoid flash
    if (theme.mode === 'dark' || (theme.mode === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    }
  } catch (e) {
    console.error('Error parsing saved theme:', e)
  }
}

// Add a class to the root element for theme styling
rootElement.classList.add('theme-root')

// Render the app
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <PersonalizationProvider>
              <LanguageProvider>
                <App />
              </LanguageProvider>
            </PersonalizationProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
