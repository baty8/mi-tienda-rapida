
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4">
      <p>Redirigiendo...</p>
    </div>
  );
};

export default LoginPage;
