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
        const enhancedPrompt = this.createHumanPortraitPrompt({
      name,
      category,
      description,
      style
    })
    
    return this.generateImage({
      prompt:enhancedPrompt,
      aspect_ratio: '1:1',
      style_type: 'Realistic',
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
   * Create enhanced prompts for realistic human portraits
   */
  private createHumanPortraitPrompt(params: {
    name: string;
    category: string;
    description: string;
    style: 'realistic' | 'artistic' | 'professional' | 'casual';
  }): string {
    const { name, category, description, style } = params;
    
    // Base photographic quality terms
    const photoQuality = [
      'professional headshot photography',
      'shallow depth of field',
      'bokeh background',
      'natural skin texture',
      'detailed facial features',
      'high resolution',
      '85mm lens',
      'perfect focus on eyes',
      'natural eye catchlight',
      'professional retouching quality'
    ].join(', ');

    // Lighting setups based on style
    const lightingSetups = {
      realistic: 'soft natural lighting, window light, gentle shadows, warm color temperature',
      artistic: 'dramatic lighting, rim light, creative shadows, artistic mood',
      professional: 'studio lighting, key light with fill, corporate headshot lighting, clean and bright',
      casual: 'natural daylight, outdoor lighting, relaxed atmosphere, golden hour warmth'
    };

    // Background suggestions
    const backgrounds = {
      realistic: 'neutral blurred background, clean and simple',
      artistic: 'creative blurred background, artistic bokeh',
      professional: 'office environment background blur, professional setting',
      casual: 'natural outdoor background blur, relaxed setting'
    };

    // Gender and age neutral descriptors
    const humanDescriptors = [
      'authentic human face',
      'genuine expression',
      'natural smile',
      'confident posture',
      'looking at camera',
      'professional appearance'
    ];

    // Category-specific clothing and context
    const categoryContext = {
      business: 'business attire, suit or professional blazer, corporate professional',
      academic: 'smart casual attire, academic professional, scholarly appearance',
      technology: 'modern casual professional, tech industry style, contemporary look',
      creative: 'creative professional attire, artistic style, expressive fashion',
      healthcare: 'professional medical attire, clean and trustworthy appearance',
      education: 'educator professional attire, approachable and knowledgeable',
      finance: 'formal business attire, finance professional, conservative style',
      marketing: 'trendy professional attire, modern marketing professional',
      consulting: 'high-end professional attire, consultant appearance, polished look',
      travel: 'smart casual travel attire, adventure-ready professional, global mindset',
      life: 'wellness-focused professional attire, balanced lifestyle appearance, positive energy',
      default: 'professional attire, clean and modern appearance'
    };

    const contextualClothing = categoryContext[category.toLowerCase() as keyof typeof categoryContext] || categoryContext.default;

    // Combine all elements into a comprehensive prompt
    const promptParts = [
      photoQuality,
      humanDescriptors.join(', '),
      contextualClothing,
      lightingSetups[style],
      backgrounds[style],
      description ? `personality: ${description}` : '',
      'photorealistic, highly detailed, sharp focus',
      'professional photography, portrait photography',
      'no text, no watermark, no logo'
    ].filter(Boolean);

    return promptParts.join(', ');
  }

  /**
   * Generate enhanced realistic human face with advanced prompting
   */
  async generateRealisticHumanFace(params: {
    age?: string;
    gender?: string;
    ethnicity?: string;
    expression?: string;
    profession?: string;
    style?: 'headshot' | 'portrait' | 'environmental';
    lighting?: 'natural' | 'studio' | 'dramatic' | 'golden-hour';
  } = {}): Promise<GeneratedImageResult> {
    const {
      age = 'adult',
      gender = 'person',
      ethnicity = '',
      expression = 'natural confident smile',
      profession = 'professional',
      style = 'headshot',
      lighting = 'natural'
    } = params;

    // Professional photography foundation
    const photographyBase = [
      'professional headshot photography',
      '85mm lens',
      'shallow depth of field',
      'bokeh background',
      'sharp focus on eyes',
      'natural skin texture',
      'detailed facial features',
      'high resolution portrait'
    ];

    // Lighting configurations
    const lightingSetups = {
      natural: 'soft natural window light, gentle shadows, warm color temperature, flattering illumination',
      studio: 'professional studio lighting, key light with fill light, hair light, clean bright lighting',
      dramatic: 'dramatic portrait lighting, strong directional light, artistic shadows, moody atmosphere',
      'golden-hour': 'golden hour natural light, warm sunset glow, soft rim lighting, beautiful skin tones'
    };

    // Style-specific framing
    const frameStyles = {
      headshot: 'tight headshot framing, shoulders visible, corporate headshot style',
      portrait: 'portrait framing, chest up, classic portrait composition',
      environmental: 'environmental portrait, person in professional setting, context visible'
    };

    // Professional appearance
    const professionalLook = [
      `${profession} appearance`,
      'professional attire',
      'well-groomed',
      'confident posture',
      'approachable demeanor'
    ];

    // Human characteristics
    const humanFeatures = [
      `${age} ${gender}`,
      ethnicity,
      expression,
      'authentic human face',
      'genuine expression',
      'natural realistic skin',
      'detailed eyes',
      'realistic facial proportions'
    ].filter(Boolean);

    // Quality and technical specs
    const technicalSpecs = [
      'photorealistic',
      'highly detailed',
      'professional quality',
      'commercial photography',
      'clean composition',
      'perfect exposure',
      'no artifacts',
      'no text, no watermark'
    ];

    const fullPrompt = [
      ...photographyBase,
      ...humanFeatures,
      ...professionalLook,
      frameStyles[style],
      lightingSetups[lighting],
      ...technicalSpecs
    ].join(', ');

    return this.generateImage({
      prompt: fullPrompt,
      aspect_ratio: '3:2',
      style_type: 'Realistic',
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