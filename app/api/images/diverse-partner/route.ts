import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { generatedImages, imageGenerationHistory } from '@/lib/db/schema';
import { imagenService } from '@/lib/services/imagen';
import { validateImageGenerationEnvironment } from '@/lib/env-check';
import { z } from 'zod';

const generateDiversePartnerSchema = z.object({
  category: z.string().optional().default('business'),
  description: z.string().optional().default('professional and approachable'),
  style: z.enum(['realistic', 'artistic', 'professional', 'casual']).default('realistic'),
  gender: z.enum(['male', 'female', 'non-binary', 'any']).default('any'),
  userId: z.string().optional(),
  teammateId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = generateDiversePartnerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { category, description, style, gender, userId, teammateId } = validation.data;

    // Check environment configuration for Imagen
    const envCheck = validateImageGenerationEnvironment('imagen');
    if (!envCheck.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Imagen service not properly configured', 
          details: `Missing environment variables: ${envCheck.missingVars.join(', ')}`,
          missingVars: envCheck.missingVars
        },
        { status: 503 }
      );
    }

    console.log('Starting diverse AI partner generation:', { category, description, style, gender });

    const startTime = Date.now();
    let generationSuccess = false;
    let errorType: string | null = null;

    try {
      // Generate diverse AI partner using Imagen
      const result = await imagenService.generateDiverseAIPartner({
        category,
        description,
        style,
        gender,
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
          model: 'imagen-4.0-generate-001',
          provider: 'imagen',
          parameters: JSON.stringify({
            ...result.parameters,
            category,
            description,
            style,
            gender
          }),
          status: 'completed',
        });

        console.log('Diverse AI partner generated and stored successfully:', imageId);
      }

      // Log generation history
      if (userId) {
        const generationTime = Math.round((Date.now() - startTime) / 1000);
        
        await db.insert(imageGenerationHistory).values({
          id: uuidv4(),
          userId,
          prompt: result.prompt,
          category: category,
          style,
          provider: 'imagen',
          generationTime,
          success: generationSuccess,
          errorType,
        });
      }

      return NextResponse.json({
        success: generationSuccess,
        data: result,
        provider: 'imagen',
        message: generationSuccess ? 'Diverse AI partner generated successfully using Imagen' : 'AI partner generation failed with Imagen',
      });

    } catch (serviceError) {
      console.error('Service error during diverse AI partner generation:', serviceError);
      errorType = 'service_error';
      generationSuccess = false;

      // Log failed generation
      if (userId) {
        const generationTime = Math.round((Date.now() - startTime) / 1000);
        
        await db.insert(imageGenerationHistory).values({
          id: uuidv4(),
          userId,
          prompt: `Diverse ${category} AI partner`,
          category: category,
          style,
          provider: 'imagen',
          generationTime,
          success: false,
          errorType: 'service_error',
        });
      }

      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to generate diverse AI partner with Imagen', 
          provider: 'imagen',
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

    // Filter for Imagen-generated diverse partners
    const images = await query
      .where(eq(generatedImages.provider, 'imagen'))
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: images,
    });

  } catch (error) {
    console.error('Error fetching diverse AI partners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch diverse AI partners' },
      { status: 500 }
    );
  }
}