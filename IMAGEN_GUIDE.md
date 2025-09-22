# Imagen Integration Guide

This document explains how to use Google's Imagen for image generation in the AI Partner Generator.

## Setup

### 1. Install Dependencies

The required `@google/genai` package is already installed. If you need to install it manually:

```bash
pnpm add @google/genai
```

### 2. Environment Variables

Add your Google AI API key to your `.env` file:

```env
GEMINI_API_KEY=your_google_ai_api_key_here
```

You can get your API key from the [Google AI Studio](https://makersuite.google.com/app/apikey).

## Usage

### Via API Endpoint

Send a POST request to `/api/images/generate` with the `provider` field set to `imagen`:

```javascript
const response = await fetch('/api/images/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'generate an image of a professional business partner',
    provider: 'imagen',
    aspectRatio: '1:1',
    style: 'realistic',
    userId: 'optional-user-id',
    category: 'business'
  })
});

const result = await response.json();
```

### Direct Service Usage

```typescript
import { imagenService } from '@/lib/services/imagen';

const result = await imagenService.generateImage({
  prompt: 'generate an image of a human partner',
  aspect_ratio: '1:1',
  style_type: 'realistic',
  number_of_images: 1,
  person_generation: 'ALLOW_ALL',
  image_size: '2K'
});

if (result.status === 'completed') {
  console.log('Generated image URL:', result.imageUrl);
}
```

## Configuration Options

### ImagenGenerationOptions

- `prompt` (string, required): The text description for image generation
- `aspect_ratio` (optional): '1:1', '16:10', '10:16', '16:9', '9:16', '3:2', '2:3'
- `style_type` (optional): 'realistic', 'artistic', 'professional', 'casual'
- `number_of_images` (optional): Number of images to generate (default: 1)
- `person_generation` (optional): 'ALLOW_ALL', 'ALLOW_ADULT', 'BLOCK_ALL'
- `image_size` (optional): '1K', '2K', '4K'
- `output_mime_type` (optional): 'image/jpeg', 'image/png'

## Provider Selection

You can choose between different image generation providers:

- `ideogram`: Uses Ideogram AI via Replicate (default)
- `imagen`: Uses Google's Imagen model

Set the provider in your API requests or user preferences:

```javascript
// In API request
{
  "provider": "imagen",
  "prompt": "your prompt here"
}

// User preference (stored in database)
await db.update(userPreferences)
  .set({ preferredProvider: 'imagen' })
  .where(eq(userPreferences.userId, userId));
```

## Error Handling

The service includes comprehensive error handling:

```typescript
const result = await imagenService.generateImage(options);

if (result.status === 'failed') {
  console.error('Generation failed:', result.error);
  // Handle error appropriately
} else {
  // Use the generated image
  console.log('Success:', result.imageUrl);
}
```

## Testing

Test the Imagen integration:

```bash
# Set your API key first
export GEMINI_API_KEY=your_api_key_here

# Run the test script
node scripts/test-imagen.js
```

## Features

### Human Portrait Generation

Generate realistic human portraits for teammates:

```typescript
const portrait = await imagenService.generateTeammateImage(
  'Alex Smith',
  'business',
  'Confident and approachable business professional',
  'professional'
);
```

### Category-Specific Images

Generate images for specific categories:

```typescript
const categoryImage = await imagenService.generateCategoryImage(
  'technology',
  'modern workspace with computers',
  'professional'
);
```

### Realistic Face Generation

Generate detailed realistic faces:

```typescript
const face = await imagenService.generateRealisticHumanFace({
  age: 'adult',
  gender: 'person',
  expression: 'confident smile',
  profession: 'business',
  style: 'headshot',
  lighting: 'natural'
});
```

## Database Tracking

All image generations are tracked in the database with:

- Provider used (ideogram/imagen)
- Generation parameters
- Success/failure status
- Generation time
- User association

This enables analytics and user preference learning.

## Best Practices

1. **Handle Failures Gracefully**: Always check the result status
2. **Use Appropriate Prompts**: Be specific about what you want
3. **Consider Performance**: Imagen may have different response times than Ideogram
4. **Monitor Usage**: Track API usage for cost management
5. **User Preferences**: Allow users to choose their preferred provider

## Troubleshooting

### Common Issues

1. **API Key Not Set**: Ensure `GEMINI_API_KEY` is in your environment
2. **Network Errors**: Check internet connectivity and API status
3. **Invalid Prompts**: Ensure prompts comply with content policies
4. **Rate Limits**: Implement proper retry logic for rate-limited requests

### Debug Mode

Enable detailed logging by setting:

```env
NODE_ENV=development
```

This will log detailed information about API calls and responses.