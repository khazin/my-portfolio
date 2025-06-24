'use client'; // required for useEffect in app router

import Link from 'next/link';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    fetch('/api/parse-resume', { method: 'GET' })
      .then(res => res.json())
      .then(data => console.log('API response:', data))
      .catch(error => console.error('API error:', error));
  }, []);
 return (
    <meta httpEquiv="refresh" content="0; url=/index.html" />
  );
  // return (
  //   <main className="p-8 text-center">
  //     <h1 className="text-2xl font-bold mb-4">Welcome to Resume Parser</h1>
  //     <Link href="/upload" className="text-blue-600 underline">
  //       Go to Upload Page
  //     </Link>
  //   </main>
  // );
}
