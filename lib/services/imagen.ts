import { v4 as uuidv4 } from 'uuid';

// Utility functions for generating diverse human characteristics
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

// Note: The example provided uses a different Google AI package than @google/generative-ai
// The current @google/generative-ai package doesn't support Imagen directly
// This implementation provides a structure for when the API becomes available

export interface ImagenGenerationOptions {
  prompt: string;
  aspect_ratio?: '1:1' | '16:10' | '10:16' | '16:9' | '9:16' | '3:2' | '2:3';
  style_type?: 'realistic' | 'artistic' | 'professional' | 'casual';
  magic_prompt_option?: 'Auto' | 'On' | 'Off';
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
  parameters: ImagenGenerationOptions;
  status: 'completed' | 'failed';
  error?: string;
}

class ImagenService {
  private apiKey: string | null = null;

  private getApiKey(): string {
    if (!this.apiKey) {
      this.apiKey = process.env.GEMINI_API_KEY || '';
      if (!this.apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
      }
    }
    return this.apiKey;
  }

  /**
   * Generate an image using Google's Imagen model
   */
  async generateImage(options: ImagenGenerationOptions): Promise<GeneratedImageResult> {
    const id = uuidv4();
    
    try {
      console.log('Generating image with Google Imagen API...');
      
      // Import the Google GenAI library
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey: this.getApiKey()
      });

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
        numberOfImages: options.number_of_images || 1,
        outputMimeType: options.output_mime_type || "image/jpeg",
        personGeneration: options.person_generation || "ALLOW_ALL",
        aspectRatio: options.aspect_ratio || "1:1",
        imageSize: options.image_size || "1K",
        ...(options.seed && { seed: options.seed }),
      };

      console.log('Generating with config:', config);

      // Generate the image using Google GenAI
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: enhancedPrompt,
        config,
      });

      if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("No images generated");
      }

      // Process the first generated image
      const generatedImage = response.generatedImages[0];
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
      console.error('Error generating image with Imagen:', error);
      
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
  }  /**
   * Process the generated image from Google GenAI Imagen
   * Converts image bytes to file and returns URL
   */
  private async processGeneratedImage(generatedImage: any, imageId: string): Promise<string> {
    try {
      // Get image bytes from the Google GenAI format
      if (!generatedImage.image || !generatedImage.image.imageBytes) {
        throw new Error('No image data found in generated result');
      }

      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Get image bytes and convert from base64
      const imgBytes = generatedImage.image.imageBytes;
      const buffer = Buffer.from(imgBytes, "base64");
      
      // Create filename and path
      const filename = `imagen-${imageId}.png`;
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
   * Generate category-specific imagery
   */
  async generateCategoryImage(
    category: string,
    context: string,
    style: string = 'realistic'
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
      image_size: '2K',
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
   * Generate enhanced realistic human face with advanced prompting and diversity
   */
  async generateRealisticHumanFace(params: {
    age?: string;
    gender?: string;
    ethnicity?: string;
    expression?: string;
    profession?: string;
    style?: 'headshot' | 'portrait' | 'environmental';
    lighting?: 'natural' | 'studio' | 'dramatic' | 'golden-hour';
    forceRandomization?: boolean;
  } = {}): Promise<GeneratedImageResult> {
    const {
      age,
      gender = 'person',
      ethnicity,
      expression,
      profession = 'professional',
      style = 'headshot',
      lighting = 'natural',
      forceRandomization = true
    } = params;

    // Generate diverse characteristics if not specified or if randomization is forced
    const characteristics = forceRandomization ? generateDiverseHumanCharacteristics() : null;

    // Use provided parameters or fall back to generated ones
    const finalAge = age || characteristics?.age || 'adult';
    const finalEthnicity = ethnicity || characteristics?.ethnicity || '';
    const finalExpression = expression || characteristics?.expression || 'natural confident smile';

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

    // Human characteristics with diversity
    const humanFeatures = [
      `${finalAge} ${gender}`,
      finalEthnicity,
      finalExpression,
      'authentic human face',
      'genuine expression',
      'natural realistic skin',
      'detailed eyes',
      'realistic facial proportions',
      characteristics?.facialFeatures,
      characteristics?.eyeColor,
      characteristics?.hairStyle,
      characteristics?.hairColor
    ].filter(Boolean);

    // Quality and technical specs
    const technicalSpecs = [
      'photorealistic',
      'highly detailed',
      'professional quality',
      'commercial photography',
      'clean composition',
      'perfect exposure',
      'unique individual',
      'distinct facial features',
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
      style_type: 'realistic',
      person_generation: 'ALLOW_ALL',
      image_size: '2K',
      seed: characteristics?.seed, // Use the generated seed for diversity
    });
  }



  /**
   * Check if API is configured and working
   */
  async healthCheck(): Promise<boolean> {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey: this.getApiKey()
      });
      
      // Try to list models to verify API connectivity
      // For now, just check if we can create the client
      return true;
    } catch (error) {
      console.error('Google GenAI health check failed:', error);
      return false;
    }
  }
}

export const imagenService = new ImagenService();