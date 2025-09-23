import { Client } from "@gradio/client";

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
  private client: Client | null = null;

  private async getClient() {
    if (!this.client) {
      this.client = await Client.connect("Qwen/Qwen-Image-Edit");
    }
    return this.client;
  }

  /**
   * Generate an image using Qwen Image Edit
   */
  async generateImage(options: QwenGenerationOptions): Promise<GeneratedImageResult> {
    const id = crypto.randomUUID();

    try {
      // Fetch example image if no image provided
      const image = options.image || await this.fetchExampleImage();

      console.log('Generating image with Qwen Image Edit:', {
        prompt: options.prompt,
        seed: options.seed,
        randomize_seed: options.randomize_seed,
        true_guidance_scale: options.true_guidance_scale,
        num_inference_steps: options.num_inference_steps,
        rewrite_prompt: options.rewrite_prompt
      });

      const client = await this.getClient();
      const result = await client.predict("/infer", {
        image: image,
        prompt: options.prompt,
        seed: options.seed || 0,
        randomize_seed: options.randomize_seed || true,
        true_guidance_scale: options.true_guidance_scale || 1,
        num_inference_steps: options.num_inference_steps || 1,
        rewrite_prompt: options.rewrite_prompt || true,
      });

      console.log('Qwen result:', result);

      // Extract image URL from result
      // The result format may vary, so we need to handle different response structures
      let imageUrl = '';

      if (result.data && typeof result.data === 'object') {
        // Try to extract image URL from various possible response formats
        if (Array.isArray(result.data)) {
          imageUrl = result.data[0] as string;
        } else if (result.data && typeof result.data === 'object' && 'url' in result.data) {
          imageUrl = (result.data as any).url;
        } else if (result.data && typeof result.data === 'object' && 'data' in result.data) {
          imageUrl = (result.data as any).data;
        } else if (typeof result.data === 'string') {
          imageUrl = result.data;
        }
      }

      if (!imageUrl) {
        throw new Error('No image URL returned from Qwen API');
      }

      return {
        id,
        imageUrl,
        prompt: options.prompt,
        parameters: options,
        status: 'completed',
      };

    } catch (error) {
      console.error('Error generating image with Qwen:', error);

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
   * Fetch example image from the test URL
   */
  private async fetchExampleImage(): Promise<Blob> {
    const response = await fetch("https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png");
    if (!response.ok) {
      throw new Error('Failed to fetch example image');
    }
    return await response.blob();
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
      const client = await this.getClient();
      return !!client;
    } catch (error) {
      console.error('Qwen API health check failed:', error);
      return false;
    }
  }
}

export const qwenService = new QwenService();