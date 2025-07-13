'use client';

import { useState } from 'react';
import supabase from '../../lib/supabaseClient';
import Link from 'next/link';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error && error.message !== 'Email not confirmed') {
      setMessage(`Error signing up: ${error.message}`);
      console.error('Sign up error:', error);
    } else if (error && error.message === 'Email not confirmed') {
      // This error occurs if email confirmation is required and the user clicks the link in the email.
      // For immediate signup success feedback, we handle the profile insertion here as well.
      // If you want to wait for email confirmation, you would move the profile creation
      // to a Supabase function triggered by the auth event.
      const { data: { user }, error: getUserError } = await supabase.auth.getUser();

      if (getUserError || !user) {
        setMessage(`Sign up successful! Please check your email to confirm. Could not retrieve user info.`);
        console.error('Error retrieving user after signup:', getUserError);
      } else {
        // Insert profile data after successful signup
        const { error: profileError } = await supabase.from('profiles').insert({ user_id: user.id, role: 'vendedor', tenant_id: '00000000-0000-0000-0000-000000000000' }); // Use a real tenant_id
        if (profileError) {
          setMessage(`Sign up successful! Please check your email to confirm. Error creating profile: ${profileError.message}`);
          console.error('Error creating profile:', profileError);
        } else {
          setMessage('Sign up successful! Please check your email to confirm.');
        }
      }
    } else {
      setMessage('Sign up successful! Please check your email to confirm.');
      // Optionally, redirect the user or show a confirmation message
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Sign Up</h1>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;