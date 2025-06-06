
import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeadshotGenerator } from '@/components/HeadshotGenerator';
import { HeadshotGallery } from '@/components/HeadshotGallery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { User, HeadshotWithUser, CreateUserInput } from '../../server/src/schema';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userHeadshots, setUserHeadshots] = useState<HeadshotWithUser[]>([]);
  const [activeTab, setActiveTab] = useState('generate');
  const [showUserSetup, setShowUserSetup] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [tempUserData, setTempUserData] = useState({ email: '', name: '' });

  // Create a demo user automatically
  const createDemoUser = useCallback(async () => {
    try {
      const demoEmail = `demo-${Date.now()}@headshot.studio`;
      const userData: CreateUserInput = {
        email: demoEmail,
        name: 'Demo User'
      };
      const user = await trpc.createUser.mutate(userData);
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to create demo user:', error);
      setShowUserSetup(true);
    }
  }, []);

  useEffect(() => {
    createDemoUser();
  }, [createDemoUser]);

  const loadUserHeadshots = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const headshots = await trpc.getUserHeadshots.query({ user_id: currentUser.id });
      setUserHeadshots(headshots);
    } catch (error) {
      console.error('Failed to load user headshots:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    loadUserHeadshots();
  }, [loadUserHeadshots]);

  const handleHeadshotCreated = (newHeadshot: HeadshotWithUser) => {
    setUserHeadshots((prev: HeadshotWithUser[]) => [newHeadshot, ...prev]);
    setActiveTab('gallery');
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUserData.email || !tempUserData.name) return;
    
    setIsCreatingUser(true);
    try {
      const userData: CreateUserInput = {
        email: tempUserData.email,
        name: tempUserData.name
      };
      const user = await trpc.createUser.mutate(userData);
      setCurrentUser(user);
      setShowUserSetup(false);
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Show user setup form if demo user creation fails
  if (showUserSetup && !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-center flex items-center justify-center gap-2">
              📸 AI Headshot Studio
            </CardTitle>
            <CardDescription className="text-indigo-100 text-center">
              Quick setup to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">📧 Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={tempUserData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setTempUserData(prev => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">👤 Your Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={tempUserData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setTempUserData(prev => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                disabled={isCreatingUser}
              >
                {isCreatingUser ? (
                  <span className="flex items-center gap-2">
                    ⏳ Setting up...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    ✨ Start Creating Headshots
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state while creating demo user
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📸</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            AI Headshot Studio
          </h1>
          <p className="text-slate-600">
            ⏳ Loading your studio...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            📸 AI Headshot Studio
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Generate professional, hyper-realistic corporate headshots with AI. 
            Upload your photo, choose your preferences, and get stunning results in minutes! ✨
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto">
            <TabsTrigger value="generate" className="flex items-center gap-2 text-base">
              🎨 Create Headshot
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2 text-base">
              🖼️ My Gallery ({userHeadshots.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <Card className="border-0 shadow-xl max-w-4xl mx-auto">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center justify-center gap-2 text-xl">
                  🎯 Create Your Professional Headshot
                </CardTitle>
                <CardDescription className="text-blue-100 text-center">
                  Upload your photo and customize your professional look
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <HeadshotGenerator 
                  userId={currentUser.id} 
                  onHeadshotCreated={handleHeadshotCreated}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <Card className="border-0 shadow-xl max-w-6xl mx-auto">
              <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center justify-center gap-2 text-xl">
                  🎨 Your Headshot Collection
                </CardTitle>
                <CardDescription className="text-green-100 text-center">
                  View, download, and manage your generated headshots
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <HeadshotGallery 
                  headshots={userHeadshots} 
                  onRefresh={loadUserHeadshots}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Stats Dashboard */}
        {userHeadshots.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-4xl mx-auto">
            {[
              { 
                label: 'Total Created', 
                value: userHeadshots.length, 
                icon: '📊',
                color: 'bg-blue-50 border-blue-200 text-blue-800'
              },
              { 
                label: 'Completed', 
                value: userHeadshots.filter(h => h.status === 'completed').length,
                icon: '✅',
                color: 'bg-green-50 border-green-200 text-green-800'
              },
              { 
                label: 'Processing', 
                value: userHeadshots.filter(h => h.status === 'processing').length,
                icon: '⏳',
                color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
              },
              { 
                label: 'Ready to Download', 
                value: userHeadshots.filter(h => h.status === 'completed' && h.generated_image_url).length,
                icon: '💾',
                color: 'bg-purple-50 border-purple-200 text-purple-800'
              }
            ].map((stat, index) => (
              <Card key={index} className={`${stat.color} border-2`}>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Getting Started Guide for New Users */}
        {userHeadshots.length === 0 && activeTab === 'generate' && (
          <div className="max-w-3xl mx-auto mt-8">
            <Card className="border-2 border-indigo-200 bg-indigo-50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center gap-2">
                  🚀 Getting Started Guide
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📷</div>
                    <h4 className="font-medium text-indigo-800">1. Upload Photo</h4>
                    <p className="text-indigo-600">Paste URL of your photo or upload to an image host</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">🎨</div>
                    <h4 className="font-medium text-indigo-800">2. Choose Style</h4>
                    <p className="text-indigo-600">Select background, attire, and expression preferences</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">✨</div>
                    <h4 className="font-medium text-indigo-800">3. Generate</h4>
                    <p className="text-indigo-600">AI creates your professional headshot in minutes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-slate-500 text-sm">
          <p>✨ Powered by AI • Create professional headshots in minutes</p>
        </div>
      </div>
    </div>
  );
}

export default App;
