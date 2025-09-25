import { experimental_generateImage, createGateway } from 'ai';
import fs from 'node:fs';

async function testGeminiImageGeneration() {
  // Check if OPENAI_API_KEY is set
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY environment variable is not set');
    console.error('Please set it to your Vercel AI Gateway API key');
    process.exit(1);
  }

  try {
    console.log('Testing Gemini image generation with AI SDK...');

    const gatewayProvider = createGateway({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const imageModel = gatewayProvider.imageModel('google/gemini-2.5-flash-image-preview');

    const result = await experimental_generateImage({
      model: imageModel,
      prompt: 'Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme',
    });

    console.log('Generation successful!');
    console.log('Generated images:', result.images.length);

    // Save generated images
    for (const image of result.images) {
      if (image.data) {
        const timestamp = Date.now();
        const fileName = `generated-${timestamp}.png`;

        fs.mkdirSync('output', { recursive: true });

        // Convert to buffer and save
        const arrayBuffer = await image.data.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.promises.writeFile(`output/${fileName}`, buffer);

        console.log(`Generated and saved image: output/${fileName}`);
      }
    }

    console.log('Test completed successfully!');

  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testGeminiImageGeneration().catch(console.error);