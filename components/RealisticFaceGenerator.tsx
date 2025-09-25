'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Download, Copy, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface RealisticFaceParams {
  age: string;
  gender: string;
  ethnicity: string;
  expression: string;
  profession: string;
  style: 'headshot' | 'portrait' | 'environmental';
  lighting: 'natural' | 'studio' | 'dramatic' | 'golden-hour';
  customPrompt?: string;
}

interface GeneratedFace {
  id: string;
  imageUrl: string;
  prompt: string;
  parameters: RealisticFaceParams;
  status: 'completed' | 'failed';
  error?: string;
}

interface RealisticFaceGeneratorProps {
  userId?: string;
  onImageGenerated?: (imageUrl: string, prompt: string, params: RealisticFaceParams) => void;
}

export default function RealisticFaceGenerator({
  userId,
  onImageGenerated
}: RealisticFaceGeneratorProps) {
  const [params, setParams] = useState<RealisticFaceParams>({
    age: 'adult',
    gender: 'person',
    ethnicity: '',
    expression: 'natural confident smile',
    profession: 'professional',
    style: 'headshot',
    lighting: 'natural',
    customPrompt: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFace, setGeneratedFace] = useState<GeneratedFace | null>(null);
  const [copied, setCopied] = useState(false);
  const [envStatus, setEnvStatus] = useState<{
    isValid: boolean;
    missingVars: string[];
    message: string;
  } | null>(null);

  useEffect(() => {
    // Check environment configuration
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

  const handleParamChange = (key: keyof RealisticFaceParams, value: string) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedFace(null);

    try {
      const response = await fetch('/api/images/human-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          userId,
        }),
      });

      const result = await response.json();

      if (result.success && result.data.status === 'completed') {
        const faceData: GeneratedFace = {
          id: result.data.id,
          imageUrl: result.data.imageUrl,
          prompt: result.data.prompt,
          parameters: params,
          status: 'completed',
        };
        
        setGeneratedFace(faceData);
        onImageGenerated?.(faceData.imageUrl, faceData.prompt, params);
        toast.success('Realistic human face generated successfully!');
      } else {
        setGeneratedFace({
          id: 'error',
          imageUrl: '',
          prompt: result.generatedPrompt || params.customPrompt || 'realistic human face',
          parameters: params,
          status: 'failed',
          error: result.data?.error || result.error || 'Failed to generate face',
        });
        toast.error(result.data?.error || result.error || 'Failed to generate face');
      }
    } catch (error) {
      console.error('Error generating face:', error);
      setGeneratedFace({
        id: 'error',
        imageUrl: '',
        prompt: params.customPrompt || 'realistic human face',
        parameters: params,
        status: 'failed',
        error: 'Network error occurred',
      });
      toast.error('Network error occurred while generating face');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = async () => {
    if (generatedFace?.prompt) {
      try {
        await navigator.clipboard.writeText(generatedFace.prompt);
        setCopied(true);
        toast.success('Prompt copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast.error('Failed to copy prompt');
      }
    }
  };

  const handleDownload = () => {
    if (generatedFace?.imageUrl) {
      const link = document.createElement('a');
      link.href = generatedFace.imageUrl;
      link.download = `realistic-face-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const generatePresetPrompt = () => {
    const elements = [
      params.age !== 'adult' && params.age,
      params.gender !== 'person' && params.gender,
      params.ethnicity && params.ethnicity,
      params.expression,
      params.profession
    ].filter(Boolean);
    
    return `Professional ${params.lighting} light portrait of ${elements.join(' ')}, ${params.style} framing, realistic human face`;
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Realistic Human Face Generator
          <Badge variant="secondary" className="ml-2">
            <Sparkles className="h-3 w-3 mr-1" />
            Enhanced Prompting
          </Badge>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Parameters Panel */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <Select value={params.age} onValueChange={(value) => handleParamChange('age', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="young adult">Young Adult (20-30)</SelectItem>
                    <SelectItem value="adult">Adult (30-50)</SelectItem>
                    <SelectItem value="middle-aged">Middle-aged (50-65)</SelectItem>
                    <SelectItem value="senior">Senior (65+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={params.gender} onValueChange={(value) => handleParamChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="person">Person (neutral)</SelectItem>
                    <SelectItem value="man">Man</SelectItem>
                    <SelectItem value="woman">Woman</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ethnicity (Optional)</Label>
              <Input
                value={params.ethnicity}
                onChange={(e) => handleParamChange('ethnicity', e.target.value)}
                placeholder="e.g., Asian, Hispanic, African American, Caucasian, etc."
              />
            </div>

            <div className="space-y-2">
              <Label>Expression</Label>
              <Select value={params.expression} onValueChange={(value) => handleParamChange('expression', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="natural confident smile">Natural confident smile</SelectItem>
                  <SelectItem value="warm friendly smile">Warm friendly smile</SelectItem>
                  <SelectItem value="professional neutral">Professional neutral</SelectItem>
                  <SelectItem value="serious professional">Serious professional</SelectItem>
                  <SelectItem value="approachable smile">Approachable smile</SelectItem>
                  <SelectItem value="contemplative">Contemplative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Profession/Context</Label>
              <Select value={params.profession} onValueChange={(value) => handleParamChange('profession', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business professional">Business Professional</SelectItem>
                  <SelectItem value="creative professional">Creative Professional</SelectItem>
                  <SelectItem value="healthcare professional">Healthcare Professional</SelectItem>
                  <SelectItem value="tech professional">Tech Professional</SelectItem>
                  <SelectItem value="academic">Academic/Researcher</SelectItem>
                  <SelectItem value="consultant">Consultant</SelectItem>
                  <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                  <SelectItem value="artist">Artist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Style</Label>
                <Select value={params.style} onValueChange={(value: any) => handleParamChange('style', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="headshot">Corporate Headshot</SelectItem>
                    <SelectItem value="portrait">Classic Portrait</SelectItem>
                    <SelectItem value="environmental">Environmental Portrait</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Lighting</Label>
                <Select value={params.lighting} onValueChange={(value: any) => handleParamChange('lighting', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="natural">Natural Light</SelectItem>
                    <SelectItem value="studio">Studio Lighting</SelectItem>
                    <SelectItem value="dramatic">Dramatic Lighting</SelectItem>
                    <SelectItem value="golden-hour">Golden Hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Custom Prompt (Optional)</Label>
              <Textarea
                value={params.customPrompt}
                onChange={(e) => handleParamChange('customPrompt', e.target.value)}
                placeholder="Add specific details or override the generated prompt..."
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use automatically generated professional prompts
              </p>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <Label className="text-sm font-medium">Preview Prompt:</Label>
              <p className="text-xs text-muted-foreground mt-1">
                {params.customPrompt || generatePresetPrompt()}
              </p>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || (envStatus && !envStatus.isValid) || false}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Realistic Face...
                </>
              ) : (
                <>
                  <User className="mr-2 h-4 w-4" />
                  Generate Realistic Human Face
                </>
              )}
            </Button>
          </div>

          {/* Results Panel */}
          <div className="space-y-4">
            {!generatedFace && !isGenerating && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-96 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                    <User className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="font-medium mb-2">Generate Realistic Human Face</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure the parameters and click generate to create a photorealistic human portrait
                  </p>
                </CardContent>
              </Card>
            )}

            {isGenerating && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-96 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                  </div>
                  <h3 className="font-medium mb-2">Generating Realistic Face...</h3>
                  <p className="text-sm text-muted-foreground">
                    Creating a high-quality photorealistic human portrait
                  </p>
                </CardContent>
              </Card>
            )}

            {generatedFace && (
              <Card>
                <CardContent className="p-6">
                  {generatedFace.status === 'completed' ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={generatedFace.imageUrl}
                          alt="Generated realistic human face"
                          className="w-full h-auto rounded-lg shadow-lg"
                          loading="lazy"
                        />
                        <Badge className="absolute top-2 right-2">
                          Realistic Face
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-muted-foreground mb-2">Generated prompt:</p>
                          <p className="text-sm bg-muted p-2 rounded break-words">
                            {generatedFace.prompt}
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
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{generatedFace.parameters.style}</Badge>
                        <Badge variant="secondary">{generatedFace.parameters.lighting} light</Badge>
                        <Badge variant="secondary">{generatedFace.parameters.profession}</Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <div className="text-destructive mb-2">❌ Generation Failed</div>
                      <p className="text-sm text-muted-foreground">
                        {generatedFace.error || 'Unknown error occurred'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}