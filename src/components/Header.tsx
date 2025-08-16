import React from 'react';

interface HeaderProps {
  title: string;
  children?: React.ReactNode;
}

export default function Header({ title, children }: HeaderProps) {
  return (
    <header className="mb-6 flex items-center justify-between">
      <h1 className="text-3xl font-bold text-primary">{title}</h1>
      {children}
    </header>
  );
}
