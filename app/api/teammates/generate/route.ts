import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { teammates } from '@/lib/db/schema';
import { fluxService } from '@/lib/services/flux';
import { validateEnvironment } from '@/lib/env-check';
import { z } from 'zod';

const generateTeammateSchema = z.object({
  userId: z.string().optional(),
  name: z.string().min(1).max(100),
  category: z.string().min(1),
  bio: z.string().min(1).max(500),
  skills: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
  age: z.number().min(18).max(100).optional(),
  location: z.string().max(100).optional(),
  generateImage: z.boolean().default(true),
  imageStyle: z.enum(['realistic', 'artistic', 'professional', 'casual']).default('realistic'),
  imagePrompt: z.string().optional(),
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
    const validation = generateTeammateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { 
      userId, 
      name, 
      category, 
      bio, 
      skills, 
      interests, 
      age, 
      location, 
      generateImage, 
      imageStyle,
      imagePrompt 
    } = validation.data;

    const teammateId = uuidv4();
    
    try {
      let imageUrl = null;
      let finalImagePrompt = null;

      // Generate AI image if requested
      if (generateImage) {
        console.log('Generating teammate image for:', name);
        
        // Create a detailed prompt based on bio and category
        const description = imagePrompt || `${bio}, professional in ${category}`;
        
        const result = await fluxService.generateTeammateImage(
          name,
          category,
          description,
          imageStyle
        );

        if (result.status === 'completed') {
          imageUrl = result.imageUrl;
          finalImagePrompt = result.prompt;
          console.log('Teammate image generated successfully');
        } else {
          console.warn('Failed to generate teammate image:', result.error);
        }
      }

      // Store the teammate in the database
      const newTeammate = await db.insert(teammates).values({
        id: teammateId,
        userId: userId || null,
        name,
        age: age || null,
        location: location || null,
        bio,
        skills: JSON.stringify(skills),
        interests: JSON.stringify(interests),
        category,
        imageUrl,
        imagePrompt: finalImagePrompt,
        compatibilityScore: null, // Will be calculated later based on matching algorithm
      }).returning();

      console.log('Teammate created successfully:', teammateId);

      return NextResponse.json({
        success: true,
        data: {
          ...newTeammate[0],
          skills: skills,
          interests: interests,
        },
        message: 'Teammate generated successfully',
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to store teammate data',
          details: dbError instanceof Error ? dbError.message : 'Unknown database error'
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
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = db.select().from(teammates);

    // Apply filters if provided
    if (userId) {
      query = query.where(eq(teammates.userId, userId)) as any;
    }

    if (category) {
      query = query.where(eq(teammates.category, category)) as any;
    }

    const results = await query.limit(limit);

    // Parse JSON fields for response
    const formattedResults = results.map(teammate => ({
      ...teammate,
      skills: teammate.skills ? JSON.parse(teammate.skills) : [],
      interests: teammate.interests ? JSON.parse(teammate.interests) : [],
    }));

    return NextResponse.json({
      success: true,
      data: formattedResults,
    });

  } catch (error) {
    console.error('Error fetching teammates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch teammates' },
      { status: 500 }
    );
  }
}