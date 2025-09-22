'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ImageGenerator from '@/components/ImageGenerator';
import EnhancedProfileForm from '@/components/EnhancedProfileForm';
import RealisticFaceGenerator from '@/components/RealisticFaceGenerator';
import { GoogleAd, HeaderAd, SidebarAd, ContentAd, BottomAd } from '@/components/GoogleAds';
import VisitorCounter from '@/components/VisitorCounter';
import { ImageIcon, Users, Sparkles, Zap, Target, Globe, User } from 'lucide-react';

export default function AIGeneratorPage() {
  const [generatedTeammates, setGeneratedTeammates] = useState<any[]>([]);

  const handleTeammateCreated = (teammate: any) => {
    setGeneratedTeammates(prev => [teammate, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header Ad */}
        <HeaderAd className="mb-6" />

        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Teammate Generator
            </h1>
          </div>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Create intelligent AI teammates with stunning visual profiles using advanced image generation technology
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
              <Zap className="h-4 w-4" />
              Ideogram v3 Turbo
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
              <Target className="h-4 w-4" />
              Smart Matching
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
              <Globe className="h-4 w-4" />
              Global Database
            </Badge>
          </div>

          {/* Visitor Counter */}
          <div className="mt-6">
            <VisitorCounter className="" />
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Create Teammate
            </TabsTrigger>
             <TabsTrigger value="realistic-face" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Realistic Faces
            </TabsTrigger>
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              General Images
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Your Creations
            </TabsTrigger>
          </TabsList>

          {/* Create Teammate Tab */}
          <TabsContent value="create">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main content */}
              <div className="lg:col-span-3">
                <EnhancedProfileForm
                  onSubmit={handleTeammateCreated}
                  userId="demo-user" // In a real app, this would come from authentication
                />
                
                {/* Content Ad */}
                <div className="mt-8">
                  <ContentAd />
                </div>
              </div>
              
              {/* Sidebar with ad */}
              <div className="lg:col-span-1 space-y-6">
                <SidebarAd />
                
                {/* Detailed Analytics */}
                <VisitorCounter showDetailed={true} />
              </div>
            </div>
          </TabsContent>

          {/* Realistic Face Generator Tab */}
          <TabsContent value="realistic-face">
            <div className="max-w-6xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Realistic Human Face Generator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Generate highly realistic human portraits using advanced AI prompting techniques. 
                    Perfect for creating professional headshots, corporate profiles, and realistic character portraits.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <div className="font-semibold text-blue-700 dark:text-blue-300">85mm Lens</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">Professional focal length</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                      <div className="font-semibold text-green-700 dark:text-green-300">Sharp Focus</div>
                      <div className="text-xs text-green-600 dark:text-green-400">Crystal clear details</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                      <div className="font-semibold text-purple-700 dark:text-purple-300">Natural Skin</div>
                      <div className="text-xs text-purple-600 dark:text-purple-400">Realistic textures</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                      <div className="font-semibold text-orange-700 dark:text-orange-300">Pro Lighting</div>
                      <div className="text-xs text-orange-600 dark:text-orange-400">Studio quality</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <RealisticFaceGenerator userId="demo-user" />
              
              {/* Content Ad */}
              <ContentAd />
            </div>
          </TabsContent>          {/* Generate Images Tab */}
          <TabsContent value="generate">
            <div className="max-w-4xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Standalone Image Generator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Generate high-quality images using Ideogram v3 Turbo AI model. Perfect for creating avatars, 
                    professional headshots, or creative visual content.
                  </p>
                </CardContent>
              </Card>
              
              <ImageGenerator
                showAdvancedOptions={true}
                userId="demo-user"
              />
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <div className="max-w-6xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Your AI Teammates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedTeammates.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No teammates created yet</h3>
                      <p className="text-muted-foreground">
                        Start by creating your first AI teammate in the &quot;Create Teammate&quot; tab
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {generatedTeammates.map((teammate, index) => (
                        <Card key={index} className="overflow-hidden">
                          <CardContent className="p-6">
                            {teammate.imageUrl && (
                              <div className="aspect-square mb-4 overflow-hidden rounded-lg">
                                <img
                                  src={teammate.imageUrl}
                                  alt={teammate.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            
                            <div className="space-y-2">
                              <h3 className="font-semibold text-lg">{teammate.name}</h3>
                              
                              {teammate.age && teammate.location && (
                                <p className="text-sm text-muted-foreground">
                                  {teammate.age} years old • {teammate.location}
                                </p>
                              )}
                              
                              <Badge variant="outline" className="w-fit">
                                {teammate.category}
                              </Badge>
                              
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {teammate.bio}
                              </p>
                              
                              {teammate.skills && teammate.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {teammate.skills.slice(0, 3).map((skill: string) => (
                                    <Badge key={skill} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {teammate.skills.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{teammate.skills.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardContent className="p-6">
              <User className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Realistic Faces</h3>
              <p className="text-sm text-muted-foreground">
                Generate photorealistic human portraits with advanced prompting and professional quality
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <ImageIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">AI Image Generation</h3>
              <p className="text-sm text-muted-foreground">
                Generate high-quality, professional images using Ideogram v3 Turbo model
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Smart Profiles</h3>
              <p className="text-sm text-muted-foreground">
                Create detailed teammate profiles with skills, interests, and AI-generated visuals
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <Sparkles className="h-12 w-12 text-cyan-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Database Integration</h3>
              <p className="text-sm text-muted-foreground">
                Store and manage your creations with Turso database and Drizzle ORM
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Ad */}
        <div className="mt-12">
          <BottomAd />
        </div>
      </div>
    </div>
  );
}