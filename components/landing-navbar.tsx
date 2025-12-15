'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Glassmorphism navbar */}
          <div className="w-full backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl px-6 py-3 shadow-lg">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">AI</span>
                </div>
                <span className="text-black font-semibold text-xl">Workflow</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <Link href="#features" className="text-black/80 hover:text-black transition-colors font-medium">
                  Features
                </Link>
                <Link href="#about" className="text-black/80 hover:text-black transition-colors font-medium">
                  About
                </Link>
                <Link href="/app" className="text-black/80 hover:text-black transition-colors font-medium">
                  Get Started
                </Link>
                <Link href="/app">
                  <Button className="bg-black text-white hover:bg-black/90 rounded-lg px-6">
                    Launch App
                  </Button>
                </Link>
              </div>

              {/* Mobile menu button */}
              <button
                className="md:hidden text-black"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="md:hidden mt-4 pb-4 space-y-4 border-t border-white/20 pt-4">
                <Link
                  href="#features"
                  className="block text-black/80 hover:text-black transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="#about"
                  className="block text-black/80 hover:text-black transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/app"
                  className="block text-black/80 hover:text-black transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
                <Link href="/app" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-black text-white hover:bg-black/90 rounded-lg mt-2">
                    Launch App
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

