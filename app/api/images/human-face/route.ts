import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { generatedImages, imageGenerationHistory } from '@/lib/db/schema';
import { ideogramService } from '@/lib/services/ideogram';
import { validateEnvironment } from '@/lib/env-check';
import { z } from 'zod';

const humanFaceSchema = z.object({
  userId: z.string().optional(),
  age: z.string().optional().default('adult'),
  gender: z.string().optional().default('person'),
  ethnicity: z.string().optional().default(''),
  expression: z.string().optional().default('natural confident smile'),
  profession: z.string().optional().default('professional'),
  style: z.enum(['headshot', 'portrait', 'environmental']).optional().default('headshot'),
  lighting: z.enum(['natural', 'studio', 'dramatic', 'golden-hour']).optional().default('natural'),
  customPrompt: z.string().optional(),
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
    const validation = humanFaceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { userId, customPrompt, ...faceParams } = validation.data;

    console.log('Generating realistic human face:', faceParams);

    const startTime = Date.now();
    let generationSuccess = false;
    let errorType: string | null = null;

    try {
      let result;
      
      if (customPrompt) {
        // Use custom prompt with enhanced realistic face prompting
        const enhancedPrompt = `${customPrompt}, professional headshot photography, 85mm lens, shallow depth of field, bokeh background, sharp focus on eyes, natural skin texture, detailed facial features, photorealistic, highly detailed, authentic human face, genuine expression, no text, no watermark`;
        
        result = await ideogramService.generateImage({
          prompt: enhancedPrompt,
          aspect_ratio: '3:2',
          style_type: 'Realistic',
          magic_prompt_option: 'On',
        });
      } else {
        // Use the enhanced human face generation method
        result = await ideogramService.generateRealisticHumanFace(faceParams);
      }

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
          teammateId: null,
          prompt: result.prompt,
          imageUrl: result.imageUrl,
          replicateId: result.replicateId,
          model: 'ideogram-ai/ideogram-v3-turbo',
          parameters: JSON.stringify({
            ...result.parameters,
            faceParams,
            type: 'human-face'
          }),
          status: 'completed',
        });

        console.log('Human face image generated and stored successfully:', imageId);
      }

      // Log generation history
      if (userId) {
        const generationTime = Math.round((Date.now() - startTime) / 1000);
        
        await db.insert(imageGenerationHistory).values({
          id: uuidv4(),
          userId,
          prompt: result.prompt,
          category: 'human-face',
          style: faceParams.style,
          generationTime,
          success: generationSuccess,
          errorType,
        });
      }

      return NextResponse.json({
        success: generationSuccess,
        data: result,
        generatedPrompt: result.prompt,
        parameters: faceParams,
        message: generationSuccess ? 'Human face generated successfully' : 'Face generation failed',
      });

    } catch (serviceError) {
      console.error('Service error during human face generation:', serviceError);
      errorType = 'service_error';
      generationSuccess = false;

      // Log failed generation
      if (userId) {
        const generationTime = Math.round((Date.now() - startTime) / 1000);
        
        await db.insert(imageGenerationHistory).values({
          id: uuidv4(),
          userId,
          prompt: customPrompt || 'realistic human face',
          category: 'human-face',
          style: faceParams.style,
          generationTime,
          success: false,
          errorType: 'service_error',
        });
      }

      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to generate human face', 
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
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = db.select().from(generatedImages);

    if (userId) {
      query = query.where(eq(generatedImages.userId, userId)) as any;
    }

    // Filter for human face generations
    const images = await query.limit(limit);
    const humanFaceImages = images.filter(img => {
      try {
        const params = img.parameters ? JSON.parse(img.parameters) : {};
        return params.type === 'human-face';
      } catch {
        return false;
      }
    });

    return NextResponse.json({
      success: true,
      data: humanFaceImages,
    });

  } catch (error) {
    console.error('Error fetching human face images:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch human face images' },
      { status: 500 }
    );
  }
}