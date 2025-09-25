import { v4 as uuidv4 } from 'uuid';
import { experimental_generateImage, gateway, createGateway } from 'ai';

// Utility functions for generating diverse human characteristics (reused from imagen service)
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomSeed(): number {
  return Math.floor(Math.random() * 1000000);
}

function generateDiverseHumanCharacteristics() {
  const ethnicities = [
    'Caucasian', 'African American', 'Hispanic', 'Asian', 'Middle Eastern',
    'Native American', 'Pacific Islander', 'Mixed ethnicity', 'South Asian',
    'European', 'Mediterranean', 'Scandinavian', 'Latin American'
  ];

  const ages = [
    'young adult (25-30)', 'adult (30-40)', 'mature adult (40-50)',
    'middle-aged (35-45)', 'experienced professional (45-55)'
  ];

  const facialFeatures = [
    'oval face', 'round face', 'square face', 'heart-shaped face',
    'angular features', 'soft features', 'defined cheekbones',
    'gentle features', 'strong jawline', 'delicate features'
  ];

  const eyeColors = [
    'brown eyes', 'blue eyes', 'green eyes', 'hazel eyes',
    'amber eyes', 'gray eyes', 'dark brown eyes'
  ];

  const hairStyles = [
    'short professional haircut', 'medium length hair', 'shoulder length hair',
    'neat business cut', 'modern styled hair', 'classic hairstyle',
    'contemporary cut', 'professional styling'
  ];

  const hairColors = [
    'dark brown hair', 'black hair', 'blonde hair', 'light brown hair',
    'auburn hair', 'gray hair', 'salt and pepper hair', 'chestnut hair'
  ];

  const expressions = [
    'warm smile', 'confident expression', 'friendly demeanor',
    'professional smile', 'approachable look', 'genuine smile',
    'calm expression', 'engaging smile', 'trustworthy appearance'
  ];

  return {
    ethnicity: getRandomElement(ethnicities),
    age: getRandomElement(ages),
    facialFeatures: getRandomElement(facialFeatures),
    eyeColor: getRandomElement(eyeColors),
    hairStyle: getRandomElement(hairStyles),
    hairColor: getRandomElement(hairColors),
    expression: getRandomElement(expressions),
    seed: generateRandomSeed()
  };
}

export interface GeminiGenerationOptions {
  prompt: string;
  aspect_ratio?: '1:1' | '16:10' | '10:16' | '16:9' | '9:16' | '3:2' | '2:3';
  style_type?: 'realistic' | 'artistic' | 'professional' | 'casual';
  seed?: number;
  number_of_images?: number;
  output_mime_type?: 'image/jpeg' | 'image/png';
  person_generation?: 'ALLOW_ALL' | 'ALLOW_ADULT' | 'BLOCK_ALL';
  image_size?: '1K' | '2K' | '4K';
}

export interface GeneratedImageResult {
  id: string;
  imageUrl: string;
  prompt: string;
  replicateId: string;
  parameters: GeminiGenerationOptions;
  status: 'completed' | 'failed';
  error?: string;
}

class GeminiService {
  private apiKey: string | null = null;

  private getApiKey(): string {
    if (!this.apiKey) {
      this.apiKey = process.env.OPENAI_API_KEY || '';
      if (!this.apiKey) {
        throw new Error('OPENAI_API_KEY is not configured');
      }
    }
    return this.apiKey;
  }

  /**
   * Generate an image using Google's Gemini model through Vercel's AI Gateway
   */
  async generateImage(options: GeminiGenerationOptions): Promise<GeneratedImageResult> {
    const id = uuidv4();

    try {
      console.log('Generating image with Google Gemini via AI Gateway...');

      // Create enhanced prompt with diversity features
      const characteristics = generateDiverseHumanCharacteristics();
      const enhancedPrompt = [
        options.prompt,
        `diverse ${characteristics.ethnicity} person`,
        `${characteristics.age}`,
        characteristics.facialFeatures,
        characteristics.eyeColor,
        characteristics.hairStyle,
        characteristics.hairColor,
        characteristics.expression,
        'photorealistic, professional photography',
        'unique individual, authentic human appearance'
      ].join(', ');

      console.log('Using enhanced diverse prompt:', enhancedPrompt);

      // Configure the generation parameters
      const config = {
        model: 'google/gemini-2.5-flash-image-preview' as const,
        prompt: enhancedPrompt,
        size: this.mapAspectRatioToSize(options.aspect_ratio || '1:1'),
        n: options.number_of_images || 1,
        responseFormat: 'url' as const,
      };

      console.log('Generating with config:', config);

      // Generate the image using AI SDK with gateway
      const gatewayProvider = createGateway({
        apiKey: this.getApiKey(),
      });

      const imageModel = gatewayProvider.imageModel('google/gemini-2.5-flash-image-preview');

      const result = await experimental_generateImage({
        model: imageModel,
        prompt: enhancedPrompt,
        size: this.mapAspectRatioToSize(options.aspect_ratio || '1:1'),
        n: options.number_of_images || 1,
      });

      if (!result.images || result.images.length === 0) {
        throw new Error("No images generated");
      }

      // Process the first generated image
      const generatedImage = result.images[0];
      const imageUrl = await this.processGeneratedImage(generatedImage, id);

      return {
        id,
        imageUrl,
        prompt: enhancedPrompt,
        replicateId: id,
        parameters: { ...options, seed: characteristics.seed },
        status: 'completed',
      };

    } catch (error) {
      console.error('Error generating image with Gemini:', error);

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
   * Process the generated image from AI SDK
   * Downloads the image and saves it to the public directory
   */
  private async processGeneratedImage(generatedImage: any, imageId: string): Promise<string> {
    try {
      // Get image data from the generated result
      if (!generatedImage.data || !generatedImage.data[0]) {
        throw new Error('No image data found in generated result');
      }

      const fs = await import('fs/promises');
      const path = await import('path');

      // Get image bytes from the response
      const imageData = generatedImage.data[0];
      const buffer = Buffer.from(await imageData.arrayBuffer());

      // Create filename and path
      const filename = `gemini-${imageId}.png`;
      const filepath = path.join(process.cwd(), 'public', 'generated', filename);

      // Ensure the directory exists
      await fs.mkdir(path.dirname(filepath), { recursive: true });

      // Save the image file
      await fs.writeFile(filepath, buffer);

      // Return the public URL
      return `/generated/${filename}`;

    } catch (error) {
      console.error('Error processing generated image:', error);
      throw new Error(`Failed to process generated image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Map aspect ratio to AI SDK size format
   */
  private mapAspectRatioToSize(aspectRatio: string): '1792x1024' | '1024x1792' | '1024x1024' | '1536x1024' | '1024x1536' {
    switch (aspectRatio) {
      case '16:9':
        return '1792x1024';
      case '9:16':
        return '1024x1792';
      case '1:1':
      default:
        return '1024x1024';
    }
  }

  /**
   * Generate a teammate portrait based on description with enhanced diversity
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
    });

    return this.generateImage({
      prompt: enhancedPrompt,
      aspect_ratio: '1:1',
      style_type: 'realistic',
      person_generation: 'ALLOW_ALL',
      image_size: '2K',
      seed: generateRandomSeed(), // Always use a random seed for teammate generation
    });
  }

  /**
   * Generate diverse AI partner/teammate specifically for the app
   * This method ensures maximum diversity for each generation
   */
  async generateDiverseAIPartner(params: {
    category?: string;
    description?: string;
    style?: 'realistic' | 'artistic' | 'professional' | 'casual';
    gender?: 'male' | 'female' | 'non-binary' | 'any';
  } = {}): Promise<GeneratedImageResult> {
    const {
      category = 'business',
      description = 'professional and approachable',
      style = 'realistic',
      gender = 'any'
    } = params;

    // Generate completely random characteristics
    const characteristics = generateDiverseHumanCharacteristics();

    // Gender-specific adjustments if specified
    const genderTerm = gender === 'any' ? 'person' :
                     gender === 'non-binary' ? 'person' : gender;

    // Build a diverse prompt
    const diversePrompt = [
      'professional headshot photography, 85mm lens, shallow depth of field',
      `${characteristics.age} ${characteristics.ethnicity} ${genderTerm}`,
      characteristics.facialFeatures,
      characteristics.eyeColor,
      characteristics.hairStyle,
      characteristics.hairColor,
      characteristics.expression,
      'confident and approachable demeanor',
      'professional business attire',
      'looking directly at camera',
      'studio lighting, clean background',
      'photorealistic, highly detailed',
      'unique individual, distinct facial features',
      'authentic human appearance',
      description,
      'no text, no watermark, professional quality'
    ].join(', ');

    console.log('Generating diverse AI partner with characteristics:', characteristics);

    return this.generateImage({
      prompt: diversePrompt,
      aspect_ratio: '1:1',
      style_type: 'realistic',
      person_generation: 'ALLOW_ALL',
      image_size: '2K',
      seed: characteristics.seed,
    });
  }

  /**
   * Create enhanced prompts for realistic human portraits with diversity
   */
  private createHumanPortraitPrompt(params: {
    name: string;
    category: string;
    description: string;
    style: 'realistic' | 'artistic' | 'professional' | 'casual';
  }): string {
    const { name, category, description, style } = params;

    // Generate diverse human characteristics
    const characteristics = generateDiverseHumanCharacteristics();

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

    // Human descriptors with generated characteristics
    const humanDescriptors = [
      'authentic human face',
      characteristics.expression,
      'confident posture',
      'looking at camera',
      'professional appearance',
      characteristics.facialFeatures,
      characteristics.eyeColor,
      characteristics.hairStyle,
      characteristics.hairColor
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

    // Combine all elements into a comprehensive prompt with diversity
    const promptParts = [
      photoQuality,
      `${characteristics.age} ${characteristics.ethnicity} person`,
      humanDescriptors.join(', '),
      contextualClothing,
      lightingSetups[style],
      backgrounds[style],
      description ? `personality: ${description}` : '',
      'photorealistic, highly detailed, sharp focus',
      'professional photography, portrait photography',
      'unique individual, distinct facial features',
      'no text, no watermark, no logo'
    ].filter(Boolean);

    return promptParts.join(', ');
  }

  /**
   * Check if API is configured and working
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Try to create the client with the API key
      this.getApiKey();
      return true;
    } catch (error) {
      console.error('Gemini AI Gateway health check failed:', error);
      return false;
    }
  }
}

export const geminiService = new GeminiService();