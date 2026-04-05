'use client';

import Link from 'next/link';
import { ArrowLeft, User, Youtube, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TeamPage() {
  const teamMembers = [
    { name: 'Saarthi Bansotra', contribution: '' },
    { name: 'Devesh Bhavsar', contribution: '' },
    { name: 'Bijeo Vinukumar', contribution: '' },
    { name: 'Shreyas Dabhade', contribution: '' },
    { name: 'Saad Dandekar', contribution: '' },
    { name: 'Dristi Barik', contribution: '' },
    { name: 'Eben Varghese', contribution: '' },
    { name: 'Aditya Gupta', contribution: '' },
    { name: 'Harsh Halankar', contribution: '' },
    { name: 'Saurabh Humane', contribution: '' },
    { name: 'Ritika Joshi', contribution: '' },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <Link href="/">
            <Button variant="ghost" className="rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </Link>
          <div className="text-lg font-black tracking-tight text-slate-900">
            FixGenie<span className="text-blue-600"> AI</span> Team
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:py-24 lg:px-8">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Meet Our Team
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          The brilliant minds behind FixGenie AI.
        </p>
      </section>

      {/* Youtube Video Section */}
      <section className="mx-auto max-w-4xl px-4 pb-20 lg:px-8">
        <div className="mb-8 flex items-center justify-center gap-2 text-2xl font-bold text-slate-900">
          <Youtube className="h-6 w-6 text-red-500" /> Project Demonstration
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="aspect-video w-full bg-slate-100 flex items-center justify-center text-slate-400">
            {/* Embed Youtube Video Here */}
            <span>[ YouTube placeholder link / embed ]</span>
          </div>
        </div>
      </section>

      {/* Team Contributions Section */}
      <section className="mx-auto max-w-6xl px-4 pb-24 lg:px-8">
        <div className="mb-10 flex items-center justify-center gap-2 text-3xl font-bold text-slate-900">
          <User className="h-7 w-7 text-blue-600" /> Team Contributions
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <h3 className="mb-2 text-xl font-bold text-slate-900">{member.name}</h3>
              <p className="text-sm text-slate-500 italic">
                Contribution: {member.contribution}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 text-center text-slate-600">
        <div className="mx-auto max-w-7xl px-4 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            <span>
              This project was developed as part of learning at{' '}
              <a
                href="https://www.pce.ac.in/"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-blue-600 hover:underline"
              >
                Pillai College of Engineering (PCE)
              </a>.
            </span>
          </div>
          <div className="text-xs text-slate-400">
            © {new Date().getFullYear()} FixGenie AI Team. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
