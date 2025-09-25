import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { generatedImages, imageGenerationHistory } from '@/lib/db/schema';
import { ideogramService } from '@/lib/services/ideogram';
import { imagenService } from '@/lib/services/imagen';
import { qwenService } from '@/lib/services/qwen';
import { geminiService } from '@/lib/services/gemini';
import { validateImageGenerationEnvironment } from '@/lib/env-check';
import { z } from 'zod';

const generateImageSchema = z.object({
  prompt: z.string().min(1).max(1000),
  userId: z.string().optional(),
  teammateId: z.string().optional(),
  style: z.enum(['realistic', 'artistic', 'professional', 'casual']).default('realistic'),
  seed: z.number().optional(),
  randomize_seed: z.boolean().default(true),
  true_guidance_scale: z.number().default(1),
  num_inference_steps: z.number().default(1),
  rewrite_prompt: z.boolean().default(true),
  category: z.string().optional(),
  provider: z.enum(['ideogram', 'imagen', 'qwen', 'gemini']).default('ideogram'),
  aspectRatio: z.enum(['1:1', '16:10', '10:16', '16:9', '9:16', '3:2', '2:3']).default('1:1'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = generateImageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { prompt, userId, teammateId, style, aspectRatio, seed, randomize_seed, true_guidance_scale, num_inference_steps, rewrite_prompt, category, provider } = validation.data;

    // Check environment configuration for the selected provider
    const envCheck = validateImageGenerationEnvironment(provider);
    if (!envCheck.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: `${provider} service not properly configured`, 
          details: `Missing environment variables: ${envCheck.missingVars.join(', ')}`,
          missingVars: envCheck.missingVars
        },
        { status: 503 }
      );
    }

    console.log('Starting image generation:', { prompt, style, aspectRatio, seed, randomize_seed, true_guidance_scale, num_inference_steps, rewrite_prompt, provider });

    const startTime = Date.now();
    let generationSuccess = false;
    let errorType: string | null = null;
    let result: any;

    try {
      // Select the appropriate service based on provider
      if (provider === 'imagen') {
        result = await imagenService.generateImage({
          prompt,
          aspect_ratio: aspectRatio,
          style_type: style,
          number_of_images: 1,
        });
      } else if (provider === 'qwen') {
        result = await qwenService.generateImage({
          prompt,
          seed,
          randomize_seed,
          true_guidance_scale,
          num_inference_steps,
          rewrite_prompt,
        });
      } else if (provider === 'gemini') {
        result = await geminiService.generateImage({
          prompt,
          aspect_ratio: aspectRatio,
          style_type: style,
          number_of_images: 1,
        });
      } else {
        // Default to Ideogram
        result = await ideogramService.generateImage({
          prompt,
          aspect_ratio: aspectRatio,
          style_type: style === 'realistic' ? 'Realistic' : 'General',
          magic_prompt_option: 'On',
        });
      }

      generationSuccess = result.status === 'completed';
      
      if (!generationSuccess) {
        errorType = result.error || 'Unknown generation error';
      }

      // Store the generated image in the database (with better error handling)
      if (result.status === 'completed') {
        try {
          const imageId = uuidv4();

          await db.insert(generatedImages).values({
            id: imageId,
            userId: (userId && userId !== 'demo-user') ? userId : null,
            teammateId: teammateId || null,
            prompt: result.prompt,
            imageUrl: result.imageUrl,
            replicateId: result.replicateId || result.id, // Using the generation ID as replicateId for compatibility
            model: provider === 'imagen' ? 'imagen-4.0-generate-001' :
                   provider === 'qwen' ? 'DashScope/qwen-image' :
                   provider === 'gemini' ? 'google/gemini-2.5-flash-image-preview' :
                   'ideogram-ai/ideogram-v3-turbo',
            provider: provider,
            parameters: JSON.stringify(result.parameters),
            status: 'completed',
          });

          console.log('Image generated and stored successfully:', imageId);
        } catch (dbError) {
          console.warn('Failed to store image in database, but generation was successful:', dbError);
          // Don't fail the whole request if database storage fails
        }
      }

      // Log generation history (only if userId is provided and valid)
      if (userId && userId !== 'demo-user') {
        try {
          const generationTime = Math.round((Date.now() - startTime) / 1000);
          
          await db.insert(imageGenerationHistory).values({
            id: uuidv4(),
            userId,
            prompt,
            category: category || null,
            style,
            provider,
            generationTime,
            success: generationSuccess,
            errorType,
          });
        } catch (historyError) {
          console.warn('Failed to log generation history:', historyError);
          // Don't fail the whole request if history logging fails
        }
      }

      return NextResponse.json({
        success: generationSuccess,
        data: result,
        provider,
        message: generationSuccess ? `Image generated successfully using ${provider}` : `Image generation failed with ${provider}`,
      });

    } catch (serviceError) {
      console.error(`Service error during image generation with ${provider}:`, serviceError);
      errorType = 'service_error';
      generationSuccess = false;

      // Log failed generation (only if userId is provided and valid)
      if (userId && userId !== 'demo-user') {
        try {
          const generationTime = Math.round((Date.now() - startTime) / 1000);
          
          await db.insert(imageGenerationHistory).values({
            id: uuidv4(),
            userId,
            prompt,
            category: category || null,
            style,
            provider,
            generationTime,
            success: false,
            errorType: 'service_error',
          });
        } catch (historyError) {
          console.warn('Failed to log failed generation history:', historyError);
          // Don't fail the whole request if history logging fails
        }
      }

      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to generate image with ${provider}`, 
          provider,
          details: serviceError instanceof Error ? serviceError.message : 'Unknown service error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const teammateId = searchParams.get('teammateId');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = db.select().from(generatedImages);

    if (userId) {
      query = query.where(eq(generatedImages.userId, userId)) as any;
    }

    if (teammateId) {
      query = query.where(eq(generatedImages.teammateId, teammateId)) as any;
    }

    const images = await query.limit(limit);

    return NextResponse.json({
      success: true,
      data: images,
    });

  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}