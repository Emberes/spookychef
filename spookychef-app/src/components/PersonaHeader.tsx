import React from 'react';

interface Persona {
  displayName: string;
  imdbUrl: string;
}

interface PersonaHeaderProps {
  persona: Persona;
}

const PersonaHeader: React.FC<PersonaHeaderProps> = ({ persona }) => {
  return (
    <div className="persona-header">
      <h2>{persona.displayName}</h2>
      <a href={persona.imdbUrl} target="_blank" rel="noopener noreferrer">
        IMDb
      </a>
    </div>
  );
};

export default PersonaHeader;
