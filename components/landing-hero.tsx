'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Workflow } from 'lucide-react';

export function LandingHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-black/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-black/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Glassmorphism hero card */}
          <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl p-12 max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 backdrop-blur-xl bg-black/10 border border-black/20 rounded-full px-4 py-2 mb-8">
              <Sparkles className="h-4 w-4 text-black" />
              <span className="text-sm font-medium text-black">AI-Powered Workflow Builder</span>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-black mb-6 leading-tight">
              Build AI Workflows
              <br />
              <span className="text-black/60">Visually</span>
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-black/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Create, connect, and execute AI-powered workflows with our intuitive drag-and-drop interface.
              No coding required.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/app">
                <Button
                  size="lg"
                  className="bg-black text-white hover:bg-black/90 rounded-xl px-8 py-6 text-lg font-semibold transition-all"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="backdrop-blur-xl bg-white/20 border-2 border-black/20 text-black hover:bg-white/30 rounded-xl px-8 py-6 text-lg font-semibold"
              >
                Learn More
              </Button>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl p-6">
                <div className="w-12 h-12 bg-black/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Workflow className="h-6 w-6 text-black" />
                </div>
                <h3 className="font-semibold text-black mb-2">Visual Builder</h3>
                <p className="text-sm text-black/60">Drag-and-drop interface for effortless workflow creation</p>
              </div>
              <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl p-6">
                <div className="w-12 h-12 bg-black/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Zap className="h-6 w-6 text-black" />
                </div>
                <h3 className="font-semibold text-black mb-2">Real-time Execution</h3>
                <p className="text-sm text-black/60">Execute workflows instantly with live progress tracking</p>
              </div>
              <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl p-6">
                <div className="w-12 h-12 bg-black/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Sparkles className="h-6 w-6 text-black" />
                </div>
                <h3 className="font-semibold text-black mb-2">AI Assistant</h3>
                <p className="text-sm text-black/60">Chat with AI to build and modify workflows naturally</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

