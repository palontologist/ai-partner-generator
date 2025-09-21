import Replicate from 'replicate';
import { v4 as uuidv4 } from 'uuid';
import { enhanceFacePrompt, generateCategoryFacePrompt, FaceGenerationOptions } from '@/lib/prompt-enhancers';

export interface FluxGenerationOptions {
  prompt: string;
  aspect_ratio?: '1:1' | '16:9' | '2:3' | '3:2' | '4:5' | '5:4' | '9:16' | '16:10';
  model?: 'flux-dev' | 'flux-schnell';
  seed?: number;
  steps?: number;
  guidance?: number;
  interval?: number;
  safety_tolerance?: number;
  prompt_upsampling?: boolean;
}

export interface GeneratedImageResult {
  id: string;
  imageUrl: string;
  prompt: string;
  replicateId: string;
  parameters: FluxGenerationOptions;
  status: 'completed' | 'failed';
  error?: string;
}

class FluxService {
  private replicate: Replicate | null = null;

  private getReplicateClient() {
    if (!this.replicate) {
      if (!process.env.REPLICATE_API_TOKEN) {
        throw new Error('REPLICATE_API_TOKEN is not configured');
      }

      this.replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      });
    }
    return this.replicate;
  }

  /**
   * Generate an image using Flux Dev
   */
  async generateImage(options: FluxGenerationOptions): Promise<GeneratedImageResult> {
    const id = uuidv4();
    
    try {
      const input = {
        prompt: options.prompt,
        aspect_ratio: options.aspect_ratio || '1:1',
        model: options.model || 'flux-dev',
        seed: options.seed,
        steps: options.steps || 20,
        guidance: options.guidance || 3.5,
        interval: options.interval || 2,
        safety_tolerance: options.safety_tolerance || 2,
        prompt_upsampling: options.prompt_upsampling !== false,
      };

      console.log('Generating image with Flux Dev:', input);

      const replicate = this.getReplicateClient();
      const prediction = await replicate.run(
        'black-forest-labs/flux-dev' as any,
        {
          input,
        }
      );

      // The prediction result should be an array of image URLs
      const imageUrls = Array.isArray(prediction) ? prediction : [prediction];
      const imageUrl = imageUrls[0] as string;

      if (!imageUrl) {
        throw new Error('No image URL returned from Flux API');
      }

      return {
        id,
        imageUrl,
        prompt: options.prompt,
        replicateId: id, // In a real scenario, this would be from the prediction
        parameters: options,
        status: 'completed',
      };

    } catch (error) {
      console.error('Error generating image:', error);

      return {
        id,
        imageUrl: '',
        prompt: options.prompt,
        replicateId: id,
        parameters: options,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Generate a teammate portrait based on description
   */
  async generateTeammateImage(
    name: string,
    category: string,
    description: string,
    style: 'realistic' | 'artistic' | 'professional' | 'casual' = 'realistic'
  ): Promise<GeneratedImageResult> {
    // Extract age from description if available
    const ageMatch = description.match(/(\d+)\s*years?\s*old/i);
    const age = ageMatch ? parseInt(ageMatch[1]) : null;

    // Use enhanced prompt generation
    const baseDescription = `${name}, ${category} professional, ${description}`;

    const styleMap = {
      realistic: 'realistic' as const,
      artistic: 'artistic' as const,
      professional: 'professional' as const,
      casual: 'casual' as const
    };

    const enhanced = enhanceFacePrompt(baseDescription, {
      style: styleMap[style],
      age,
      mood: style === 'casual' ? 'friendly' : 'professional',
      lighting: style === 'artistic' ? 'dramatic' : 'studio',
      background: style === 'professional' ? 'office' : 'clean'
    });

    return this.generateImage({
      prompt: enhanced.prompt,
      aspect_ratio: '1:1',
      model: 'flux-dev',
      seed: Math.floor(Math.random() * 1000000), // Random seed for variety
      steps: 20,
      guidance: 3.5,
      prompt_upsampling: true,
    });
  }

  /**
   * Generate category-specific imagery
   */
  async generateCategoryImage(
    category: string,
    context: string,
    style: string = 'General'
  ): Promise<GeneratedImageResult> {
    const categoryPrompts = {
      'business': 'professional business environment, modern office, collaboration',
      'academic': 'academic research setting, university environment, scholarly',
      'travel': 'travel and adventure, beautiful destinations, exploration',
      'creative': 'creative workspace, artistic environment, innovation',
      'lifestyle': 'healthy lifestyle, wellness, personal development',
      'technology': 'modern technology, innovation, digital workspace'
    };

    const basePrompt = categoryPrompts[category as keyof typeof categoryPrompts] || category;
    const prompt = `${basePrompt}, ${context}, high quality, professional, vibrant`;

    return this.generateImage({
      prompt,
      aspect_ratio: '16:9',
      model: 'flux-dev',
      seed: Math.floor(Math.random() * 1000000),
      steps: 20,
      guidance: 3.5,
      prompt_upsampling: true,
    });
  }

  /**
   * Check if API is configured and working
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Try to list models to verify API connectivity
      const replicate = this.getReplicateClient();
      const models = await replicate.models.list();
      return true;
    } catch (error) {
      console.error('Replicate API health check failed:', error);
      return false;
    }
  }
}

export const fluxService = new FluxService();