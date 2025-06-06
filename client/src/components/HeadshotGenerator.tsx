
import { useState } from 'react';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { CreateHeadshotRequestInput, HeadshotWithUser } from '../../../server/src/schema';

interface HeadshotGeneratorProps {
  userId: number;
  onHeadshotCreated: (headshot: HeadshotWithUser) => void;
}

export function HeadshotGenerator({ userId, onHeadshotCreated }: HeadshotGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [backgroundStyle, setBackgroundStyle] = useState<string>('');
  const [attire, setAttire] = useState<string>('');
  const [expression, setExpression] = useState<string>('');

  const backgroundOptions = [
    { value: 'plain', label: '🎨 Plain Background', desc: 'Clean, minimal backdrop', popular: true },
    { value: 'office', label: '🏢 Office Setting', desc: 'Professional workspace', popular: true },
    { value: 'studio', label: '📸 Studio Setup', desc: 'Professional photo studio', popular: false },
    { value: 'outdoor', label: '🌳 Outdoor Scene', desc: 'Natural environment', popular: false },
    { value: 'gradient', label: '🌈 Gradient Backdrop', desc: 'Smooth color transition', popular: false }
  ];

  const attireOptions = [
    { value: 'business_casual', label: '👔 Business Casual', desc: 'Smart but relaxed', popular: true },
    { value: 'formal', label: '🤵 Formal Wear', desc: 'Traditional business attire', popular: true },
    { value: 'smart_casual', label: '✨ Smart Casual', desc: 'Polished yet comfortable', popular: false },
    { value: 'casual', label: '👕 Casual', desc: 'Relaxed everyday wear', popular: false }
  ];

  const expressionOptions = [
    { value: 'professional', label: '🎯 Professional', desc: 'Composed and competent', popular: true },
    { value: 'friendly', label: '😄 Friendly', desc: 'Welcoming and personable', popular: true },
    { value: 'confident', label: '😤 Confident', desc: 'Strong and assured', popular: false },
    { value: 'smiling', label: '😊 Smiling', desc: 'Warm and approachable', popular: false },
    { value: 'serious', label: '😐 Serious', desc: 'Professional and focused', popular: false }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl || !backgroundStyle || !attire || !expression) return;

    setIsLoading(true);
    try {
      const requestData: CreateHeadshotRequestInput = {
        user_id: userId,
        original_image_url: imageUrl,
        background_style: backgroundStyle as 'plain' | 'office' | 'outdoor' | 'studio' | 'gradient',
        attire: attire as 'business_casual' | 'formal' | 'casual' | 'smart_casual',
        expression: expression as 'smiling' | 'serious' | 'confident' | 'friendly' | 'professional'
      };

      const headshot = await trpc.createHeadshotRequest.mutate(requestData);
      
      // Create HeadshotWithUser object
      const headshotWithUser: HeadshotWithUser = {
        ...headshot,
        user: {
          id: userId,
          email: '',
          name: '',
          created_at: new Date(),
          updated_at: new Date()
        }
      };
      
      onHeadshotCreated(headshotWithUser);

      // Reset form
      setImageUrl('');
      setBackgroundStyle('');
      setAttire('');
      setExpression('');
    } catch (error) {
      console.error('Failed to create headshot request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = imageUrl && backgroundStyle && attire && expression;

  return (
    <div className="space-y-8">
      {/* Instructions */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertDescription className="text-blue-800">
          <strong>📋 Instructions:</strong> Upload your photo to an image hosting service (like Imgur, Google Photos, or Dropbox) 
          and paste the direct image URL below. Then choose your preferred style options.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Image Upload Section */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              📷 Step 1: Upload Your Photo
            </h3>
            <p className="text-slate-600 text-sm mb-4">
              Provide a clear, well-lit photo of your face for the best results
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-base font-medium">
              Image URL *
            </Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/your-photo.jpg"
              value={imageUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageUrl(e.target.value)}
              className="text-center text-lg py-3"
              required
            />
            <p className="text-sm text-slate-500 text-center">
              💡 Tip: Use services like <a href="https://imgur.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Imgur</a> for free image hosting
            </p>
          </div>

          {/* Image Preview */}
          {imageUrl && (
            <div className="flex justify-center">
              <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-blue-200">
                <img 
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={() => {}}
                />
              </div>
            </div>
          )}
        </div>

        {/* Background Style Selection */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              🎨 Step 2: Choose Background Style
            </h3>
            <p className="text-slate-600 text-sm">
              Select the backdrop that best fits your professional needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {backgroundOptions.map((option) => (
              <Card 
                key={option.value}
                className={`cursor-pointer transition-all hover:shadow-lg relative ${
                  backgroundStyle === option.value 
                    ? 'ring-3 ring-blue-500 bg-blue-50 shadow-lg' 
                    : 'hover:bg-slate-50 border-slate-200'
                }`}
                onClick={() => setBackgroundStyle(option.value)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{option.label}</h4>
                      <p className="text-xs text-slate-600 mt-1">{option.desc}</p>
                    </div>
                    {option.popular && (
                      <Badge className="bg-orange-100 text-orange-800 text-xs ml-2">Popular</Badge>
                    )}
                    {backgroundStyle === option.value && (
                      <Badge className="bg-blue-500 ml-2">✓</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Attire Selection */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              👔 Step 3: Select Attire Style
            </h3>
            <p className="text-slate-600 text-sm">
              Choose the dress code that matches your industry
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {attireOptions.map((option) => (
              <Card 
                key={option.value}
                className={`cursor-pointer transition-all hover:shadow-lg relative ${
                  attire === option.value 
                    ? 'ring-3 ring-green-500 bg-green-50 shadow-lg' 
                    : 'hover:bg-slate-50 border-slate-200'
                }`}
                onClick={() => setAttire(option.value)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{option.label}</h4>
                      <p className="text-sm text-slate-600 mt-1">{option.desc}</p>
                    </div>
                    {option.popular && (
                      <Badge className="bg-orange-100 text-orange-800 text-xs ml-2">Popular</Badge>
                    )}
                    {attire === option.value && (
                      <Badge className="bg-green-500 ml-2">✓</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Expression Selection */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              😊 Step 4: Pick Your Expression
            </h3>
            <p className="text-slate-600 text-sm">
              Choose the facial expression that conveys your professional image
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {expressionOptions.map((option) => (
              <Card 
                key={option.value}
                className={`cursor-pointer transition-all hover:shadow-lg relative ${
                  expression === option.value 
                    ? 'ring-3 ring-purple-500 bg-purple-50 shadow-lg' 
                    : 'hover:bg-slate-50 border-slate-200'
                }`}
                onClick={() => setExpression(option.value)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{option.label}</h4>
                      <p className="text-xs text-slate-600 mt-1">{option.desc}</p>
                    </div>
                    {option.popular && (
                      <Badge className="bg-orange-100 text-orange-800 text-xs ml-2">Popular</Badge>
                    )}
                    {expression === option.value && (
                      <Badge className="bg-purple-500 ml-2">✓</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-6 border-t border-slate-200">
          <div className="text-center space-y-4">
            <Button 
              type="submit" 
              size="lg"
              className="w-full max-w-md bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-lg py-4"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-3">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Generating your professional headshot...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  ✨ Generate My Professional Headshot
                </span>
              )}
            </Button>
            
            {!isFormValid && (
              <p className="text-sm text-slate-500">
                {!imageUrl ? '📷 Please provide an image URL' :
                 !backgroundStyle ? '🎨 Choose a background style' :
                 !attire ? '👔 Select your attire' :
                 !expression ? '😊 Pick your expression' :
                 'Complete all steps above'}
              </p>
            )}

            {isFormValid && !isLoading && (
              <p className="text-sm text-green-600 font-medium">
                ✅ Ready to generate! This will take 1-2 minutes.
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
