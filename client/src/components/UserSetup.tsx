
import { useState } from 'react';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { User, CreateUserInput } from '../../../server/src/schema';

interface UserSetupProps {
  onUserReady: (user: User) => void;
}

export function UserSetup({ onUserReady }: UserSetupProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const user = await trpc.getUserByEmail.query(email);
      if (user) {
        onUserReady(user);
      } else {
        setError('User not found. Please sign up first.');
        setIsLogin(false);
      }
    } catch {
      setError('Failed to find user. Please try again or sign up.');
      setIsLogin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const userData: CreateUserInput = { email, name };
      const user = await trpc.createUser.mutate(userData);
      onUserReady(user);
    } catch {
      setError('Failed to create account. Email might already exist.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="text-center flex items-center justify-center gap-2">
            👋 {isLogin ? 'Welcome Back' : 'Join Us'}
          </CardTitle>
          <CardDescription className="text-indigo-100 text-center">
            {isLogin 
              ? 'Sign in to access your headshot studio'
              : 'Create your account to get started'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">📧 Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
              />
            </div>
            
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">👤 Full Name</Label>
                <Input
                  id="name"
                  
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  ⏳ {isLogin ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  ✨ {isLogin ? 'Sign In' : 'Create Account'}
                </span>
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-indigo-600 hover:text-indigo-800 text-sm underline"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
