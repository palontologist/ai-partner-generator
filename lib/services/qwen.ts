import OpenAI from "openai";

export interface QwenGenerationOptions {
  prompt: string;
  image?: Blob;
  seed?: number;
  randomize_seed?: boolean;
  true_guidance_scale?: number;
  num_inference_steps?: number;
  rewrite_prompt?: boolean;
}

export interface GeneratedImageResult {
  id: string;
  imageUrl: string;
  prompt: string;
  parameters: QwenGenerationOptions;
  status: 'completed' | 'failed';
  error?: string;
}

class QwenService {
  private client: OpenAI | null = null;

  private getClient() {
    if (!this.client) {
      if (!process.env.DASHSCOPE_API_KEY) {
        throw new Error('DASHSCOPE_API_KEY is not configured');
      }

      this.client = new OpenAI({
        apiKey: process.env.DASHSCOPE_API_KEY,
        baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
      });
    }
    return this.client;
  }

  /**
   * Generate an image using DashScope Qwen Image Generation
   */
  async generateImage(options: QwenGenerationOptions): Promise<GeneratedImageResult> {
    const id = crypto.randomUUID();

    try {
      const client = this.getClient();

      // Convert image to base64 if provided
      let imageBase64 = '';
      if (options.image) {
        imageBase64 = await this.blobToBase64(options.image);
      }

      console.log('Generating image with DashScope:', {
        prompt: options.prompt,
        seed: options.seed,
        randomize_seed: options.randomize_seed,
        true_guidance_scale: options.true_guidance_scale,
        num_inference_steps: options.num_inference_steps,
        rewrite_prompt: options.rewrite_prompt
      });

      // Try to use the images.generate endpoint first (if supported)
      try {
        const response = await client.images.generate({
          model: "wanx-image-generation", // DashScope image generation model
          prompt: options.prompt,
          n: 1,
          size: "1024x1024",
          response_format: "url"
        });

        const imageUrl = response.data[0]?.url;
        if (!imageUrl) {
          throw new Error('No image URL returned from DashScope API');
        }

        return {
          id,
          imageUrl,
          prompt: options.prompt,
          parameters: options,
          status: 'completed',
        };
      } catch (imageGenError) {
        console.warn('Image generation endpoint not available, trying chat completion with vision model:', imageGenError);

        // Fallback to using chat completion with vision model for image editing
        if (options.image) {
          const response = await client.chat.completions.create({
            model: "qwen-vl-plus", // Vision-language model for image editing
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: options.prompt
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:image/png;base64,${imageBase64}`,
                      detail: "high"
                    }
                  }
                ]
              }
            ],
            max_tokens: 1000
          });

          // Extract image description or analysis from response
          const content = response.choices[0]?.message?.content;
          if (!content) {
            throw new Error('No content returned from vision model');
          }

          // For now, we'll return a placeholder since the vision model returns text, not images
          // In a real implementation, you might need to use a different service for image generation
          return {
            id,
            imageUrl: '', // Vision model doesn't generate images
            prompt: options.prompt,
            parameters: options,
            status: 'failed',
            error: 'Vision model returned text analysis instead of generated image'
          };
        } else {
          // Text-to-image generation using chat completion
          const response = await client.chat.completions.create({
            model: "qwen-plus",
            messages: [
              {
                role: "user",
                content: `Generate a detailed image description for: ${options.prompt}. Please provide a vivid, detailed description that could be used to create an image.`
              }
            ],
            max_tokens: 500
          });

          const description = response.choices[0]?.message?.content;
          if (!description) {
            throw new Error('No description returned from model');
          }

          return {
            id,
            imageUrl: '', // Chat model doesn't generate images
            prompt: options.prompt,
            parameters: options,
            status: 'failed',
            error: 'Chat model returned text description instead of generated image'
          };
        }
      }

    } catch (error) {
      console.error('Error generating image with DashScope:', error);

      return {
        id,
        imageUrl: '',
        prompt: options.prompt,
        parameters: options,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Convert Blob to base64 string
   */
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:image/png;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Generate a teammate portrait based on description (adapted for Qwen)
   */
  async generateTeammateImage(
    name: string,
    category: string,
    description: string,
    style: 'realistic' | 'artistic' | 'professional' | 'casual' = 'realistic'
  ): Promise<GeneratedImageResult> {
    const basePrompt = `${name}, ${category} professional, ${description}`;

    const stylePrompts = {
      realistic: 'highly detailed, photorealistic, professional headshot',
      artistic: 'artistic style, creative, unique portrait',
      professional: 'professional business portrait, clean background',
      casual: 'casual friendly portrait, natural setting'
    };

    const prompt = `${basePrompt}, ${stylePrompts[style]}`;

    return this.generateImage({
      prompt,
      seed: Math.floor(Math.random() * 1000),
      randomize_seed: true,
      true_guidance_scale: 1.5,
      num_inference_steps: 20,
      rewrite_prompt: true,
    });
  }

  /**
   * Generate category-specific imagery (adapted for Qwen)
   */
  async generateCategoryImage(
    category: string,
    context: string,
    style: string = 'General'
  ): Promise<GeneratedImageResult> {
    const categoryPrompts = {
      'business': 'professional business environment, modern office, collaboration, corporate',
      'academic': 'academic research setting, university environment, scholarly, educational',
      'travel': 'travel and adventure, beautiful destinations, exploration, scenic',
      'creative': 'creative workspace, artistic environment, innovation, design',
      'lifestyle': 'healthy lifestyle, wellness, personal development, modern living',
      'technology': 'modern technology, innovation, digital workspace, futuristic'
    };

    const basePrompt = categoryPrompts[category as keyof typeof categoryPrompts] || category;
    const prompt = `${basePrompt}, ${context}, high quality, professional, vibrant, detailed`;

    return this.generateImage({
      prompt,
      seed: Math.floor(Math.random() * 1000),
      randomize_seed: true,
      true_guidance_scale: 1.5,
      num_inference_steps: 20,
      rewrite_prompt: true,
    });
  }

  /**
   * Check if the service is configured and working
   */
  async healthCheck(): Promise<boolean> {
    try {
      const client = this.getClient();
      // Try a simple chat completion to test the API
      const response = await client.chat.completions.create({
        model: "qwen-plus",
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 10
      });
      return !!response;
    } catch (error) {
      console.error('DashScope API health check failed:', error);
      return false;
    }
  }
}

export const qwenService = new QwenService();