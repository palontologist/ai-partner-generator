'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import ImageGenerator from '@/components/ImageGenerator';
import { CategorySelector } from '@/components/CategorySelector';
import { Loader2, User, ImageIcon, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { generateCategoryFacePrompt } from '@/lib/prompt-enhancers';

interface TeammateFormData {
  name: string;
  category: string;
  bio: string;
  skills: string[];
  interests: string[];
  age?: number;
  location?: string;
  generateImage: boolean;
  imageStyle: 'realistic' | 'artistic' | 'professional' | 'casual';
  imagePrompt?: string;
}

interface EnhancedProfileFormProps {
  onSubmit?: (data: TeammateFormData & { imageUrl?: string }) => void;
  initialData?: Partial<TeammateFormData>;
  userId?: string;
}

export default function EnhancedProfileForm({
  onSubmit,
  initialData,
  userId
}: EnhancedProfileFormProps) {
  const [formData, setFormData] = useState<TeammateFormData>({
    name: initialData?.name || '',
    category: initialData?.category || '',
    bio: initialData?.bio || '',
    skills: initialData?.skills || [],
    interests: initialData?.interests || [],
    age: initialData?.age,
    location: initialData?.location || '',
    generateImage: initialData?.generateImage ?? true,
    imageStyle: initialData?.imageStyle || 'realistic',
    imagePrompt: initialData?.imagePrompt || '',
  });

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [showImageGenerator, setShowImageGenerator] = useState(false);

  const handleInputChange = (field: keyof TeammateFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      handleInputChange('skills', [...formData.skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    handleInputChange('skills', formData.skills.filter(s => s !== skill));
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      handleInputChange('interests', [...formData.interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    handleInputChange('interests', formData.interests.filter(i => i !== interest));
  };

  const handleImageGenerated = (imageUrl: string, prompt: string) => {
    setGeneratedImageUrl(imageUrl);
    handleInputChange('imagePrompt', prompt);
    toast.success('Profile image generated successfully!');
  };

  const generateAutoPrompt = () => {
    const { name, category, bio, age, location, imageStyle } = formData;

    if (!name || !category || !bio) {
      toast.error('Please fill in name, category, and bio first');
      return;
    }

    // Create base description from bio
    const baseDescription = `${bio}${age ? `, ${age} years old` : ''}${location ? `, located in ${location}` : ''}`;

    // Use the enhanced prompt generator
    const styleMap = {
      realistic: 'realistic' as const,
      artistic: 'artistic' as const,
      professional: 'professional' as const,
      casual: 'casual' as const
    };

    const enhanced = generateCategoryFacePrompt(
      category,
      name,
      baseDescription,
      {
        style: styleMap[imageStyle],
        age,
        mood: imageStyle === 'casual' ? 'friendly' : 'professional'
      }
    );

    handleInputChange('imagePrompt', enhanced.prompt);
    setShowImageGenerator(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.bio) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/teammates/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Teammate profile created successfully!');
        onSubmit?.({ ...formData, imageUrl: result.data.imageUrl });
        
        // Reset form
        setFormData({
          name: '',
          category: '',
          bio: '',
          skills: [],
          interests: [],
          age: undefined,
          location: '',
          generateImage: true,
          imageStyle: 'realistic',
          imagePrompt: '',
        });
        setGeneratedImageUrl(null);
      } else {
        toast.error(result.error || 'Failed to create teammate profile');
      }
    } catch (error) {
      console.error('Error creating teammate:', error);
      toast.error('Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Create AI Teammate Profile
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter teammate name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="100"
                  value={formData.age || ''}
                  onChange={(e) => handleInputChange('age', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Age (optional)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, Country (optional)"
              />
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <CategorySelector
                selected={formData.category}
                onSelect={(category) => handleInputChange('category', category)}
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio *</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Describe this teammate's background, experience, and personality..."
                rows={4}
                className="resize-none"
                required
              />
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <Label>Interests</Label>
              <div className="flex gap-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add an interest"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                />
                <Button type="button" onClick={addInterest} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest) => (
                  <Badge key={interest} variant="outline" className="flex items-center gap-1">
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Image Generation Options */}
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">AI Profile Image</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="generateImage"
                    checked={formData.generateImage}
                    onChange={(e) => handleInputChange('generateImage', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="generateImage">Generate AI image</Label>
                </div>
              </div>

              {formData.generateImage && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="imageStyle">Image Style</Label>
                      <Select value={formData.imageStyle} onValueChange={(value: any) => handleInputChange('imageStyle', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select image style" />
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
                      <Label htmlFor="imagePrompt">Custom Image Prompt</Label>
                      <div className="flex gap-2">
                        <Input
                          id="imagePrompt"
                          value={formData.imagePrompt}
                          onChange={(e) => handleInputChange('imagePrompt', e.target.value)}
                          placeholder="Custom image description..."
                        />
                        <Button type="button" onClick={generateAutoPrompt} variant="outline" size="sm">
                          Auto
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setShowImageGenerator(true)}
                    variant="outline"
                    className="w-full"
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Preview & Generate Image
                  </Button>

                  {generatedImageUrl && (
                    <div className="space-y-2">
                      <Label>Generated Preview:</Label>
                      <img
                        src={generatedImageUrl}
                        alt="Generated teammate"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Teammate...
                </>
              ) : (
                'Create AI Teammate'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Image Generator Modal/Section */}
      {showImageGenerator && (
        <ImageGenerator
          defaultPrompt={formData.imagePrompt}
          onImageGenerated={handleImageGenerated}
          userId={userId}
          category={formData.category}
        />
      )}
    </div>
  );
}