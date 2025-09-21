import Replicate from 'replicate';
import { v4 as uuidv4 } from 'uuid';

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
    const stylePrompts = {
      realistic: 'photorealistic portrait, ultra-realistic human face, professional studio lighting, 85mm lens, shallow depth of field, clean neutral background, high resolution, detailed facial features, natural skin texture, authentic human expression',
      artistic: 'artistic portrait, creative professional lighting, stylized but realistic human features, contemporary photography, artistic composition',
      professional: 'professional business portrait, formal attire, corporate headshot style, studio lighting, confident expression, polished appearance, office or neutral background',
      casual: 'casual friendly portrait, natural lighting, approachable smile, relaxed expression, warm and welcoming demeanor, soft lighting'
    };

    // Enhanced prompt construction for more realistic human photos
    const basePrompt = stylePrompts[style];
    const categoryContext = this.getCategorySpecificContext(category);
    const humanFeatureEnhancements = 'realistic human proportions, natural facial expressions, authentic eye contact, professional photography quality';
    
    const prompt = `${basePrompt}, ${description}, ${categoryContext}, ${humanFeatureEnhancements}, person named ${name}`;

    return this.generateImage({
      prompt,
      aspect_ratio: '1:1',
      style_type: style === 'realistic' ? 'Realistic' : 'General',
      magic_prompt_option: 'On',
    });
  }

  /**
   * Get category-specific context for human portraits
   */
  private getCategorySpecificContext(category: string): string {
    const categoryContexts = {
      'business': 'confident business professional, smart attire, leadership qualities',
      'academic': 'intelligent scholar, thoughtful expression, academic environment',
      'travel': 'adventurous spirit, worldly experience, friendly approachable demeanor',
      'creative': 'creative artist, expressive eyes, artistic sensibility',
      'lifestyle': 'healthy lifestyle coach, positive energy, motivational presence',
      'technology': 'tech professional, innovative mindset, modern professional appearance',
      'healthcare': 'caring healthcare professional, trustworthy appearance, compassionate expression',
      'education': 'experienced educator, knowledgeable demeanor, approachable teacher',
      'sports': 'athletic professional, fit physique, determined expression',
      'finance': 'financial expert, professional appearance, analytical mindset'
    };

    return categoryContexts[category as keyof typeof categoryContexts] || 'experienced professional, competent appearance';
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
   * Enhanced human portrait generation with demographic considerations
   */
  async generateDiverseHumanPortrait(
    description: string,
    options: {
      style?: 'realistic' | 'artistic' | 'professional' | 'casual';
      ageRange?: 'young' | 'middle-aged' | 'senior';
      ethnicity?: string;
      gender?: string;
      category?: string;
    } = {}
  ): Promise<GeneratedImageResult> {
    const { style = 'realistic', ageRange, ethnicity, gender, category } = options;
    
    // Base photography setup for realistic human photos
    const photographyBase = 'professional portrait photography, studio lighting, 85mm lens, shallow depth of field, natural expression';
    
    // Age-appropriate descriptors
    const ageDescriptors = {
      'young': 'youthful appearance, energetic expression, early career professional',
      'middle-aged': 'experienced professional, confident mature appearance, established career',
      'senior': 'distinguished senior professional, wisdom in expression, executive presence'
    };
    
    // Professional context based on category
    const categoryContext = category ? this.getCategorySpecificContext(category) : 'professional expert';
    
    // Build comprehensive prompt
    let prompt = `${photographyBase}, ${description}`;
    
    if (ageRange && ageDescriptors[ageRange]) {
      prompt += `, ${ageDescriptors[ageRange]}`;
    }
    
    if (ethnicity) {
      prompt += `, ${ethnicity} heritage`;
    }
    
    if (gender) {
      prompt += `, ${gender} professional`;
    }
    
    prompt += `, ${categoryContext}`;
    
    // Style-specific enhancements
    const styleEnhancements = {
      realistic: 'photorealistic human face, natural skin texture, authentic facial features, realistic lighting, genuine expression',
      artistic: 'artistic portrait style, creative lighting, expressive human features, contemporary photography',
      professional: 'corporate headshot style, business professional appearance, confident expression, formal setting',
      casual: 'natural casual portrait, soft lighting, relaxed expression, approachable demeanor'
    };
    
    prompt += `, ${styleEnhancements[style]}`;
    
    // Final quality and realism modifiers
    prompt += ', high resolution, professional photography quality, realistic human proportions, detailed facial features';
    
    return this.generateImage({
      prompt,
      aspect_ratio: '1:1',
      style_type: style === 'realistic' ? 'Realistic' : 'General',
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