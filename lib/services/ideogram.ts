import Replicate from 'replicate';
import { v4 as uuidv4 } from 'uuid';
import { enhanceFacePrompt, generateCategoryFacePrompt, FaceGenerationOptions } from '@/lib/prompt-enhancers';

export interface IdeogramGenerationOptions {
  prompt: string;
  aspect_ratio?: '1:1' | '16:10' | '10:16' | '16:9' | '9:16' | '3:2' | '2:3';
  model?: 'V_3_TURBO' | 'V_3';
  magic_prompt_option?: 'Auto' | 'On' | 'Off';
  seed?: number;
  style_type?: 'Auto' | 'General' | 'Realistic' | 'Design' | 'Render_3D' | 'Anime';
  color_palette?: {
    name?: string;
    colors?: string[];
  };
}

export interface GeneratedImageResult {
  id: string;
  imageUrl: string;
  prompt: string;
  replicateId: string;
  parameters: IdeogramGenerationOptions;
  status: 'completed' | 'failed';
  error?: string;
}

class IdeogramService {
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
   * Generate an image using Ideogram v3 Turbo
   */
  async generateImage(options: IdeogramGenerationOptions): Promise<GeneratedImageResult> {
    const id = uuidv4();
    
    try {
      const input = {
        prompt: options.prompt,
        aspect_ratio: options.aspect_ratio || '1:1',
        model: options.model || 'V_3_TURBO',
        magic_prompt_option: options.magic_prompt_option || 'Auto',
        ...(options.seed && { seed: options.seed }),
        ...(options.style_type && { style_type: options.style_type }),
        ...(options.color_palette && { color_palette: options.color_palette }),
      };

      console.log('Generating image with Ideogram v3 Turbo:', input);

      const replicate = this.getReplicateClient();
      const prediction = await replicate.run(
        'ideogram-ai/ideogram-v3-turbo' as any,
        {
          input,
        }
      );

      // The prediction result should be an array of image URLs
      const imageUrls = Array.isArray(prediction) ? prediction : [prediction];
      const imageUrl = imageUrls[0] as string;

      if (!imageUrl) {
        throw new Error('No image URL returned from Ideogram API');
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
      style_type: enhanced.styleType,
      magic_prompt_option: 'On',
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
      style_type: style as any,
      magic_prompt_option: 'On',
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

export const ideogramService = new IdeogramService();