'use client'

import { useState } from 'react'

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-fei-text/5 bg-fei-bg/75 backdrop-blur-md">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="FEI" className="h-8 w-auto" />
          <span className="hidden text-xs font-medium text-fei-sky sm:block">
            Football English Intelligence
          </span>
        </a>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-6 sm:flex">
            <a href="#get-started" className="text-sm text-fei-text/60 hover:text-fei-text transition-colors">About</a>
            <a href="#get-started" className="text-sm text-fei-text/60 hover:text-fei-text transition-colors">Roles</a>
            <a href="https://instagram.com/fei.football" target="_blank" rel="noopener noreferrer" className="text-fei-text/40 hover:text-fei-sky transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a href="https://linkedin.com/company/football-english-intelligence" target="_blank" rel="noopener noreferrer" className="text-fei-text/40 hover:text-fei-sky transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
          </div>

          <a href="/login" className="hidden rounded-full border border-fei-sky px-5 py-2 text-sm font-medium text-fei-sky transition-colors hover:bg-fei-sky/10 sm:block">
            Login
          </a>
          <a href="/register" className="rounded-full bg-fei-yellow px-5 py-2 text-sm font-semibold text-fei-bg transition-colors hover:bg-fei-yellow/90">
            Get Started
          </a>
        </div>
      </nav>
    </header>
  )
}
