'use client';

import { useState } from 'react';
import Link from 'next/link'; // Import Link for navigation
import { useRouter } from 'next/navigation'; // Import useRouter for redirection
import supabase from '../../lib/supabaseClient'; // Ensure this import is correct


const LoginPage = () => {
  const router = useRouter(); // Initialize useRouter
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('Login error:', error.message);
      // TODO: Show error message to user
    } else if (data.user) {
      console.log('User logged in:', data.user);
      // Fetch user profile to get the role
      console.log('Attempting to fetch profile for user ID:', data.user.id); // Log before fetching profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', data.user.id)
 .maybeSingle(); // Use maybeSingle() to handle potential absence of profile

      console.log('Profile fetch result:', { profileData, profileError }); // Log result after fetching

      if (profileError) {
        console.error('Error fetching profile:', profileError.message);
        // TODO: Handle profile fetch error - maybe redirect to a default page or show an error
        // If profileError is the "multiple or no rows" error, maybeSingle() should prevent it.
        // This error handling branch is now more for other potential fetch errors.
        router.push('/dashboard'); // Default redirect if profile fetch fails
      } else {
        console.log('User profile fetched:', profileData);
        // Proceed with redirection based on profile role
      }



      if (profileData && profileData.role === 'vendedor') {
        router.push('/catalog'); // Redirect vendors to the catalog page
      } else {
        router.push('/dashboard'); // Redirect other roles to the dashboard page
      }
    }
  };
  return (

    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4">
      <div className="p-6 max-w-sm w-full bg-white rounded-xl shadow-md space-y-4">
        <h1 className="text-2xl font-bold text-center text-gray-900">Login</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
 <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 font-semibold">Login</button>
        </form>
        <div className="text-center mt-4">
          <Link href="/signup" className="text-sm text-blue-600 hover:underline">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>

  );
};

export default LoginPage;