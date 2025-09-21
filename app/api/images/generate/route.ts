import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { generatedImages, imageGenerationHistory } from '@/lib/db/schema';
import { fluxService } from '@/lib/services/flux';
import { validateEnvironment } from '@/lib/env-check';
import { z } from 'zod';

const generateImageSchema = z.object({
  prompt: z.string().min(1).max(1000),
  userId: z.string().optional(),
  teammateId: z.string().optional(),
  style: z.enum(['realistic', 'artistic', 'professional', 'casual']).default('realistic'),
  aspectRatio: z.enum(['1:1', '16:10', '10:16', '16:9', '9:16', '3:2', '2:3']).default('1:1'),
  category: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check environment configuration
    const envCheck = validateEnvironment();
    if (!envCheck.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Service not properly configured', 
          details: `Missing environment variables: ${envCheck.missingVars.join(', ')}`,
          missingVars: envCheck.missingVars
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const validation = generateImageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { prompt, userId, teammateId, style, aspectRatio, category } = validation.data;

    console.log('Starting image generation:', { prompt, style, aspectRatio });

    const startTime = Date.now();
    let generationSuccess = false;
    let errorType: string | null = null;

    try {
      // Generate the image using Flux service
      const result = await fluxService.generateImage({
        prompt,
        aspect_ratio: aspectRatio,
        model: 'flux-dev',
        seed: Math.floor(Math.random() * 1000000),
        steps: 20,
        guidance: 3.5,
        prompt_upsampling: true,
      });

      generationSuccess = result.status === 'completed';
      
      if (!generationSuccess) {
        errorType = result.error || 'Unknown generation error';
      }

      // Store the generated image in the database
      if (result.status === 'completed') {
        const imageId = uuidv4();
        
        await db.insert(generatedImages).values({
          id: imageId,
          userId: userId || null,
          teammateId: teammateId || null,
          prompt: result.prompt,
          imageUrl: result.imageUrl,
          replicateId: result.replicateId,
          model: 'black-forest-labs/flux-dev',
          parameters: JSON.stringify(result.parameters),
          status: 'completed',
        });

        console.log('Image generated and stored successfully:', imageId);
      }

      // Log generation history
      if (userId) {
        const generationTime = Math.round((Date.now() - startTime) / 1000);
        
        await db.insert(imageGenerationHistory).values({
          id: uuidv4(),
          userId,
          prompt,
          category: category || null,
          style,
          generationTime,
          success: generationSuccess,
          errorType,
        });
      }

      return NextResponse.json({
        success: generationSuccess,
        data: result,
        message: generationSuccess ? 'Image generated successfully' : 'Image generation failed',
      });

    } catch (serviceError) {
      console.error('Service error during image generation:', serviceError);
      errorType = 'service_error';
      generationSuccess = false;

      // Log failed generation
      if (userId) {
        const generationTime = Math.round((Date.now() - startTime) / 1000);
        
        await db.insert(imageGenerationHistory).values({
          id: uuidv4(),
          userId,
          prompt,
          category: category || null,
          style,
          generationTime,
          success: false,
          errorType: 'service_error',
        });
      }

      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to generate image', 
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