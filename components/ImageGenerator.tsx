'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, ImageIcon, Download, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ImageGeneratorProps {
  defaultPrompt?: string;
  onImageGenerated?: (imageUrl: string, prompt: string) => void;
  showAdvancedOptions?: boolean;
  userId?: string;
  teammateId?: string;
  category?: string;
}

interface GeneratedImage {
  id: string;
  imageUrl: string;
  prompt: string;
  status: 'completed' | 'failed';
  error?: string;
}

export default function ImageGenerator({
  defaultPrompt = '',
  onImageGenerated,
  showAdvancedOptions = true,
  userId,
  teammateId,
  category
}: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [style, setStyle] = useState<'realistic' | 'artistic' | 'professional' | 'casual'>('realistic');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '16:10' | '10:16' | '3:2' | '2:3'>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [copied, setCopied] = useState(false);
  const [envStatus, setEnvStatus] = useState<{
    isValid: boolean;
    missingVars: string[];
    message: string;
  } | null>(null);

  useEffect(() => {
    // Check environment configuration on component mount
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.configuration) {
          setEnvStatus({
            isValid: data.configuration.isValid,
            missingVars: data.configuration.missingVars || [],
            message: data.configuration.message || 'Configuration status unknown'
          });
        }
      })
      .catch(error => {
        console.error('Failed to check environment status:', error);
        setEnvStatus({
          isValid: false,
          missingVars: ['Unknown'],
          message: 'Failed to check configuration status'
        });
      });
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt for image generation');
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style,
          aspectRatio,
          userId,
          teammateId,
          category,
        }),
      });

      const result = await response.json();

      if (result.success && result.data.status === 'completed') {
        const imageData: GeneratedImage = {
          id: result.data.id,
          imageUrl: result.data.imageUrl,
          prompt: result.data.prompt,
          status: 'completed',
        };
        
        setGeneratedImage(imageData);
        onImageGenerated?.(imageData.imageUrl, imageData.prompt);
        toast.success('Image generated successfully!');
      } else {
        setGeneratedImage({
          id: 'error',
          imageUrl: '',
          prompt,
          status: 'failed',
          error: result.data?.error || result.error || 'Failed to generate image',
        });
        toast.error(result.data?.error || result.error || 'Failed to generate image');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setGeneratedImage({
        id: 'error',
        imageUrl: '',
        prompt,
        status: 'failed',
        error: 'Network error occurred',
      });
      toast.error('Network error occurred while generating image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = async () => {
    if (generatedImage?.prompt) {
      try {
        await navigator.clipboard.writeText(generatedImage.prompt);
        setCopied(true);
        toast.success('Prompt copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast.error('Failed to copy prompt');
      }
    }
  };

  const handleDownload = () => {
    if (generatedImage?.imageUrl) {
      const link = document.createElement('a');
      link.href = generatedImage.imageUrl;
      link.download = `generated-image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          AI Image Generator
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Environment Status Warning */}
        {envStatus && !envStatus.isValid && (
          <div className="p-4 border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">!</div>
              <span className="font-medium">Configuration Required</span>
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-300 mt-2">
              {envStatus.message}
            </p>
            <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              Missing: {envStatus.missingVars.join(', ')}
            </div>
          </div>
        )}
        
        {/* Prompt Input */}
        <div className="space-y-2">
          <Label htmlFor="prompt">Image Description</Label>
          <Textarea
            id="prompt"
            placeholder="Describe the image you want to generate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Advanced Options */}
        {showAdvancedOptions && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="style">Style</Label>
              <Select value={style} onValueChange={(value: any) => setStyle(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realistic">Realistic</SelectItem>
                  <SelectItem value="artistic">Artistic</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={(value: any) => setAspectRatio(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select aspect ratio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1:1">Square (1:1)</SelectItem>
                  <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                  <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                  <SelectItem value="16:10">Wide (16:10)</SelectItem>
                  <SelectItem value="10:16">Tall (10:16)</SelectItem>
                  <SelectItem value="3:2">Classic (3:2)</SelectItem>
                  <SelectItem value="2:3">Classic Portrait (2:3)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || !prompt.trim() || (envStatus && !envStatus.isValid)}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Image...
            </>
          ) : (
            <>
              <ImageIcon className="mr-2 h-4 w-4" />
              Generate Image
            </>
          )}
        </Button>

        {/* Generated Image Display */}
        {generatedImage && (
          <Card>
            <CardContent className="p-6">
              {generatedImage.status === 'completed' ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={generatedImage.imageUrl}
                      alt={generatedImage.prompt}
                      className="w-full h-auto rounded-lg shadow-lg"
                      loading="lazy"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground mb-2">Generated prompt:</p>
                      <p className="text-sm bg-muted p-2 rounded break-words">
                        {generatedImage.prompt}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyPrompt}
                        disabled={copied}
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Badge variant="secondary">Style: {style}</Badge>
                    <Badge variant="secondary">Aspect: {aspectRatio}</Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="text-destructive mb-2">❌ Generation Failed</div>
                  <p className="text-sm text-muted-foreground">
                    {generatedImage.error || 'Unknown error occurred'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}