// src/pages/index.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import '../app/globals.css';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/login');
  }, []);

  return null; 
}
