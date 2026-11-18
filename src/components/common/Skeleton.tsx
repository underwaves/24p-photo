import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="rounded-3xl overflow-hidden bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark animate-pulse">
      <div className="aspect-[4/3] bg-card-light-subtle dark:bg-card-dark-subtle" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-card-light-subtle dark:bg-card-dark-subtle rounded-full w-1/4" />
        <div className="h-6 bg-card-light-subtle dark:bg-card-dark-subtle rounded-full w-3/4" />
        <div className="h-4 bg-card-light-subtle dark:bg-card-dark-subtle rounded-full w-1/2" />
      </div>
    </div>
  );
};

export const MasonrySkeleton: React.FC = () => {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="break-inside-avoid rounded-2xl overflow-hidden bg-card-light-subtle dark:bg-card-dark-subtle border border-border-light dark:border-border-dark animate-pulse"
          style={{ height: `${240 + (i % 3) * 80}px` }}
        />
      ))}
    </div>
  );
};
