import React from 'react';

interface HeaderProps {
  title: string;
  children?: React.ReactNode;
}

export default function Header({ title, children }: HeaderProps) {
  return (
    <header className="mb-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold">{title}</h1>
      {children}
    </header>
  );
}
