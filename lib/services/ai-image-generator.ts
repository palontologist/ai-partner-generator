"use server";

import * as fs from 'node:fs';
import { promisify } from 'node:util';
import * as path from 'node:path';

// Helper to handle file saving
const writeFile = promisify(fs.writeFile);

export async function generateImage(prompt: string) {
    try {
        // Import Google GenAI (same as the existing Imagen service)
        const { GoogleGenAI } = await import('@google/genai');
        
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not configured');
        }

        const ai = new GoogleGenAI({
            apiKey: apiKey
        });

        // Use generateImages method similar to existing Imagen service
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-001', // Use the same model as existing service
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: "image/png",
                aspectRatio: "1:1",
                imageSize: "1K",
            }
        });

        let fileName = '';

        // Process generated images similar to the problem statement's approach
        if (response.generatedImages && response.generatedImages.length > 0) {
            const generatedImage = response.generatedImages[0];
            
            // Check if image data exists
            if (generatedImage.image && generatedImage.image.imageBytes) {
                const timestamp = Date.now();
                fileName = `generated-${timestamp}.png`;

                // Ensure the 'public' directory exists
                const publicDir = path.join(process.cwd(), 'public');
                if (!fs.existsSync(publicDir)) {
                    fs.mkdirSync(publicDir, { recursive: true });
                }

                // Convert from base64 and save (similar to existing processGeneratedImage method)
                const imgBytes = generatedImage.image.imageBytes;
                const buffer = Buffer.from(imgBytes, "base64");
                
                await writeFile(path.join(publicDir, fileName), buffer);
            }
        }

        return `/${fileName}`;
    } catch (error) {
        console.error('Error generating image:', error);
        throw error;
    }
}