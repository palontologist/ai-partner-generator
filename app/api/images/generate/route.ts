import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { generatedImages, imageGenerationHistory } from '@/lib/db/schema';
import { ideogramService } from '@/lib/services/ideogram';
import { validateEnvironment } from '@/lib/env-check';
import { z } from 'zod';

/**
 * Enhance prompts specifically for human photo generation
 */
function enhanceHumanPhotoPrompt(prompt: string, style: string, category?: string): string {
  // Check if this looks like a human/person description
  const humanKeywords = ['person', 'professional', 'expert', 'named', 'years old', 'portrait', 'headshot', 'human', 'man', 'woman', 'individual'];
  const isHumanPhoto = humanKeywords.some(keyword => prompt.toLowerCase().includes(keyword));
  
  if (!isHumanPhoto) {
    return prompt; // Return original prompt if not human-related
  }
  
  // Add realistic human photo enhancement based on style
  const styleEnhancements = {
    realistic: 'ultra-realistic human photography, professional portrait lighting, 85mm lens, natural skin texture, authentic facial expressions, realistic human proportions, detailed eyes and facial features, diverse ethnicity representation',
    professional: 'professional corporate headshot, business portrait lighting, confident expression, polished appearance, high-end photography quality, inclusive professional representation',
    artistic: 'artistic portrait photography, creative lighting, professional human photography, expressive and natural, diverse human beauty',
    casual: 'natural portrait photography, soft lighting, authentic expression, approachable and friendly demeanor, genuine human connection'
  };
  
  const enhancement = styleEnhancements[style as keyof typeof styleEnhancements] || styleEnhancements.realistic;
  
  // Technical photography specifications for realism
  const technicalSpecs = 'shot with professional camera, sharp focus, natural lighting, realistic colors, human photorealism, authentic diversity';
  
  // Diversity and inclusion considerations
  const inclusivitySpecs = 'representative of diverse backgrounds, inclusive human representation, authentic cultural diversity';
  
  // Combine original prompt with enhancements
  return `${prompt}, ${enhancement}, ${technicalSpecs}, ${inclusivitySpecs}`;
}

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
      // Enhance prompt for human photo generation
      const enhancedPrompt = enhanceHumanPhotoPrompt(prompt, style, category);
      
      // Generate the image using Ideogram service
      const result = await ideogramService.generateImage({
        prompt: enhancedPrompt,
        aspect_ratio: aspectRatio,
        style_type: style === 'realistic' ? 'Realistic' : 'General',
        magic_prompt_option: 'On',
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
          model: 'ideogram-ai/ideogram-v3-turbo',
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