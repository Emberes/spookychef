"use client";

import { useState, useEffect } from 'react';
import PersonaHeader from '@/components/PersonaHeader';

interface Persona {
  displayName: string;
  imdbUrl: string;
}

export default function Home() {
  const [persona, setPersona] = useState<Persona | null>(null);

  useEffect(() => {
    fetch('/api/persona')
      .then((res) => res.json())
      .then((data) => setPersona(data));
  }, []);

  return (
    <main>
      {persona && <PersonaHeader persona={persona} />}
    </main>
  );
}