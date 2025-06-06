
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { HeadshotWithUser } from '../../../server/src/schema';

interface HeadshotGalleryProps {
  headshots: HeadshotWithUser[];
  onRefresh: () => void;
}

export function HeadshotGallery({ headshots, onRefresh }: HeadshotGalleryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'processing': return '⏳';
      case 'failed': return '❌';
      default: return '⏳';
    }
  };

  const formatStyle = (value: string) => {
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (headshots.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📸</div>
        <h3 className="text-xl font-medium text-slate-600 mb-2">
          No headshots yet
        </h3>
        <p className="text-slate-500 mb-6">
          Create your first professional headshot to get started!
        </p>
        <Button 
          onClick={onRefresh}
          variant="outline"
          className="flex items-center gap-2"
        >
          🔄 Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Your Headshots</h3>
        <Button 
          onClick={onRefresh}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          🔄 Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {headshots.map((headshot: HeadshotWithUser) => (
          <Card key={headshot.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-sm font-medium">
                    Headshot #{headshot.id}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {headshot.created_at.toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(headshot.status)}>
                  {getStatusIcon(headshot.status)} {formatStyle(headshot.status)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Image Preview */}
              <div className="space-y-2">
                {headshot.generated_image_url ? (
                  <div className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                    <img 
                      src={headshot.generated_image_url}
                      alt="Generated headshot"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg bg-slate-100 flex items-center justify-center">
                    <div className="text-center text-slate-500">
                      <div className="text-3xl mb-2">
                        {headshot.status === 'processing' ? '⏳' : '📷'}
                      </div>
                      <p className="text-sm">
                        {headshot.status === 'processing' 
                          ? 'Generating...' 
                          : 'No image yet'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Specifications */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Background:</span>
                  <span className="font-medium">{formatStyle(headshot.background_style)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Attire:</span>
                  <span className="font-medium">{formatStyle(headshot.attire)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Expression:</span>
                  <span className="font-medium">{formatStyle(headshot.expression)}</span>
                </div>
              </div>

              {/* Error Message */}
              {headshot.error_message && (
                <div className="text-red-600 text-xs bg-red-50 p-2 rounded border border-red-200">
                  {headshot.error_message}
                </div>
              )}

              {/* View Details */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                  >
                    👁️ View Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      📸 Headshot #{headshot.id}
                    </DialogTitle>
                    <DialogDescription>
                      Created on {headshot.created_at.toLocaleDateString()} at {headshot.created_at.toLocaleTimeString()}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {/* Images */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Original Image</h4>
                        <div className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                          <img 
                            src={headshot.original_image_url}
                            alt="Original"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Generated Headshot</h4>
                        <div className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                          {headshot.generated_image_url ? (
                            <img 
                              src={headshot.generated_image_url}
                              alt="Generated"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                              <div className="text-center">
                                <div className="text-4xl mb-2">
                                  {headshot.status === 'processing' ? '⏳' : '📷'}
                                </div>
                                <p className="text-sm">
                                  {headshot.status === 'processing' 
                                    ? 'Still generating...' 
                                    : 'Not ready yet'
                                  }
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Status:</span>
                        <Badge className={`ml-2 ${getStatusColor(headshot.status)}`}>
                          {getStatusIcon(headshot.status)} {formatStyle(headshot.status)}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-slate-500">Background:</span>
                        <span className="ml-2 font-medium">{formatStyle(headshot.background_style)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Attire:</span>
                        <span className="ml-2 font-medium">{formatStyle(headshot.attire)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Expression:</span>
                        <span className="ml-2 font-medium">{formatStyle(headshot.expression)}</span>
                      </div>
                    </div>

                    {/* Error Message */}
                    {headshot.error_message && (
                      <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
                        <strong>Error:</strong> {headshot.error_message}
                      </div>
                    )}

                    {/* Download Button */}
                    {headshot.generated_image_url && (
                      <Button 
                        asChild 
                        className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
                      >
                        <a 
                          href={headshot.generated_image_url} 
                          download={`headshot-${headshot.id}.jpg`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          💾 Download Headshot
                        </a>
                      </Button>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
