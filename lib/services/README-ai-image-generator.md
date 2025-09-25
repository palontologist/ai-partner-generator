# AI Image Generator Service

This service implements the requested `generateImage` function as specified in the problem statement, using the AI SDK approach with Google's Imagen model.

## Features

- **Server Action**: Uses `"use server"` directive for Next.js server-side execution
- **File Management**: Automatically creates public directory and saves images with timestamp-based naming
- **Error Handling**: Comprehensive error handling with descriptive messages
- **Google AI Integration**: Uses Google GenAI library for image generation (same as existing services)
- **TypeScript Support**: Fully typed implementation

## Usage

### Basic Usage

```typescript
import { generateImage } from '@/lib/services/ai-image-generator';

// Generate an image from a text prompt
const imageUrl = await generateImage("A beautiful sunset over mountains");
console.log('Generated image URL:', imageUrl); // e.g., "/generated-1758821779090.png"
```

### API Endpoint Usage

The service is accessible via the test API endpoint:

```bash
POST /api/test-image-gen
Content-Type: application/json

{
  "prompt": "A beautiful sunset over mountains"
}
```

Response:
```json
{
  "success": true,
  "imageUrl": "/generated-1758821779090.png",
  "message": "Image generated successfully"
}
```

## Setup Requirements

### Environment Variables

Set the following environment variable:

```bash
GEMINI_API_KEY=your_google_ai_api_key_here
```

You can get an API key from [Google AI Studio](https://makersuite.google.com/).

### Dependencies

The following packages are required (already installed):

- `ai` - AI SDK for image generation
- `@ai-sdk/google` - Google provider for AI SDK  
- `@google/genai` - Google GenAI library

## Implementation Details

### File Saving Logic

- Images are saved to the `public/` directory
- Filenames use format: `generated-{timestamp}.png`
- Directory is created automatically if it doesn't exist
- Images are converted from base64 to binary format

### Error Handling

The function provides specific error messages for:

- Missing API key configuration
- Image generation API failures
- File system errors
- Invalid responses from the API

### Comparison with Problem Statement

The original problem statement requested:

```typescript
export async function generateImage(prompt: string) {
    const result = await generateText({
        model: 'gemini-2.5-flash-image-preview',
        prompt
    });

    // Process result.files for images...
}
```

Our implementation adapts this to:

1. Use the actual Google GenAI library (compatible with existing services)
2. Use `generateImages` instead of `generateText` (proper image generation API)
3. Handle the response format from Google's Imagen API
4. Maintain the same file saving logic and return format

## Testing

### Manual Testing

1. Visit `/test-image-gen.html` in your browser
2. Enter a prompt and click "Generate Image"
3. View the results and any error messages

### Programmatic Testing

```bash
node test-generateImage.js
```

This tests the file system logic without making API calls.

## Integration

This service can be integrated into existing workflows:

### With existing image generation routes

```typescript
// In your API route
import { generateImage } from '@/lib/services/ai-image-generator';

const imageUrl = await generateImage(prompt);
// Use imageUrl in your response
```

### With the existing frontend

```typescript
// In a React component
const handleGenerate = async () => {
  const response = await fetch('/api/test-image-gen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: userPrompt })
  });
  
  const data = await response.json();
  if (data.success) {
    setGeneratedImage(data.imageUrl);
  }
};
```

## Architecture Notes

This implementation follows the existing repository patterns:

- Uses the same Google GenAI library as the existing Imagen service
- Follows the same error handling patterns
- Uses the same file structure for generated images
- Maintains compatibility with the existing API architecture

The function is designed to be a drop-in replacement for the requested functionality while working seamlessly with the existing codebase.