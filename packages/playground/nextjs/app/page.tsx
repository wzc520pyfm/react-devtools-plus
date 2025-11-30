import React from 'react';

export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Next.js Playground</h1>
      <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <p>This is a Next.js application.</p>
        <p>
          If the React DevTools integration works, you should see the overlay and be able to toggle it.
        </p>
        <p>
          Check the "Plugins" tab in the DevTools panel to see the custom Next.js plugin.
        </p>
      </div>
    </main>
  );
}

