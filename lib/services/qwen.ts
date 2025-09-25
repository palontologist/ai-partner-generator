export interface QwenGenerationOptions {
  prompt: string;
  image?: string; // Base64 encoded image or URL
  seed?: number;
  randomize_seed?: boolean;
  true_guidance_scale?: number;
  num_inference_steps?: number;
  rewrite_prompt?: boolean;
  negative_prompt?: string;
  watermark?: boolean;
}

export interface GeneratedImageResult {
  id: string;
  imageUrl: string;
  prompt: string;
  parameters: QwenGenerationOptions;
  status: 'completed' | 'failed';
  error?: string;
}

interface DashScopeResponse {
  output?: {
    task_id?: string;
    task_status?: string;
    results?: Array<{
      url: string;
    }>;
  };
  request_id?: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
  code?: string;
  message?: string;
}

class QwenService {
  private baseURL = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';

  private getApiKey(): string {
    if (!process.env.DASHSCOPE_API_KEY) {
      throw new Error('DASHSCOPE_API_KEY is not configured');
    }
    return process.env.DASHSCOPE_API_KEY;
  }

  /**
   * Generate an image using DashScope multimodal generation API
   */
  async generateImage(options: QwenGenerationOptions): Promise<GeneratedImageResult> {
    const id = crypto.randomUUID();

    try {
      console.log('Generating image with DashScope:', {
        prompt: options.prompt,
        negative_prompt: options.negative_prompt,
        watermark: options.watermark
      });

      // Prepare the request payload
      const payload = {
        model: options.image ? "qwen-image-edit" : "qwen-image-generation", // Use edit model if image provided
        input: {
          messages: [
            {
              role: "user",
              content: [
                ...(options.image ? [{
                  image: options.image // Can be URL or base64
                }] : []),
                {
                  text: options.prompt
                }
              ]
            }
          ]
        },
        parameters: {
          negative_prompt: options.negative_prompt || "",
          watermark: options.watermark !== undefined ? options.watermark : false,
          ...(options.seed && { seed: options.seed }),
          ...(options.true_guidance_scale && { guidance_scale: options.true_guidance_scale }),
          ...(options.num_inference_steps && { num_inference_steps: options.num_inference_steps })
        }
      };

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getApiKey()}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DashScope API error: ${response.status} - ${errorText}`);
      }

      const data: DashScopeResponse = await response.json();

      // Check for API errors
      if (data.code && data.code !== '200') {
        throw new Error(`DashScope API error: ${data.code} - ${data.message || 'Unknown error'}`);
      }

      // Extract the generated image URL
      const imageUrl = data.output?.results?.[0]?.url;
      if (!imageUrl) {
        throw new Error('No image URL returned from DashScope API');
      }

      return {
        id: data.request_id || id,
        imageUrl,
        prompt: options.prompt,
        parameters: options,
        status: 'completed',
      };

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
   * Convert Blob to base64 string (if needed for file uploads)
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
      // Test with a simple image generation request
      const testResult = await this.generateImage({
        prompt: "A simple test image",
        watermark: false
      });
      return testResult.status === 'completed';
    } catch (error) {
      console.error('DashScope API health check failed:', error);
      return false;
    }
  }
}

export const qwenService = new QwenService();