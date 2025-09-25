import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/lib/services/ai-image-generator';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const imageUrl = await generateImage(prompt);
    
    return NextResponse.json({
      success: true,
      imageUrl,
      message: 'Image generated successfully'
    });
  } catch (error) {
    console.error('Error in test image generation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}