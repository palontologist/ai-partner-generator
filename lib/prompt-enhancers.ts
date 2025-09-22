/**
 * Prompt enhancement utilities for generating more realistic human faces
 */

export interface FaceGenerationOptions {
  style?: 'realistic' | 'artistic' | 'professional' | 'casual';
  age?: number;
  gender?: 'male' | 'female' | 'non-binary' | 'neutral';
  ethnicity?: string;
  mood?: 'neutral' | 'confident' | 'friendly' | 'thoughtful' | 'professional';
  lighting?: 'studio' | 'natural' | 'dramatic' | 'soft';
  background?: 'clean' | 'office' | 'outdoor' | 'gradient';
  cameraSettings?: boolean;
  facialDetails?: boolean;
}

export interface EnhancedPromptResult {
  prompt: string;
  styleType: string;
  enhancements: string[];
}

/**
 * Generate realistic face-focused prompts with professional photography terminology
 */
export function enhanceFacePrompt(
  baseDescription: string,
  options: FaceGenerationOptions = {}
): EnhancedPromptResult {
  const {
    style = 'realistic',
    age,
    gender = 'neutral',
    ethnicity,
    mood = 'professional',
    lighting = 'studio',
    background = 'clean',
    cameraSettings: includeCameraSettings = true,
    facialDetails: includeFacialDetails = true
  } = options;

  const enhancements: string[] = [];

  // Base style templates
  const styleTemplates = {
    realistic: 'photorealistic portrait, professional headshot',
    artistic: 'artistic portrait, creative lighting, stylized',
    professional: 'professional business portrait, corporate headshot',
    casual: 'casual friendly portrait, approachable'
  };

  // Lighting options
  const lightingOptions = {
    studio: 'soft studio lighting, professional photography setup',
    natural: 'natural window lighting, soft and even illumination',
    dramatic: 'dramatic side lighting, professional portrait lighting',
    soft: 'soft diffused lighting, flattering portrait lighting'
  };

  // Background options
  const backgroundOptions = {
    clean: 'clean simple background, professional backdrop',
    office: 'modern office environment, professional setting',
    outdoor: 'outdoor natural setting, blurred background',
    gradient: 'gradient background, studio portrait setup'
  };

  // Mood expressions
  const moodExpressions = {
    neutral: 'neutral expression, direct eye contact with camera',
    confident: 'confident expression, slight smile, strong eye contact',
    friendly: 'warm friendly smile, approachable expression',
    thoughtful: 'thoughtful expression, intelligent gaze',
    professional: 'professional demeanor, confident and approachable'
  };

  // Camera settings for realism
  const cameraSettings = '85mm portrait lens, f/2.8 aperture, shallow depth of field, sharp focus on face';

  // Facial detail enhancements
  const facialDetails = 'detailed facial features, realistic skin texture, natural pores and fine details, high resolution facial anatomy, realistic proportions, anatomically correct features';

  // Age-specific enhancements
  let ageEnhancement = '';
  if (age) {
    if (age < 25) {
      ageEnhancement = 'young adult, fresh-faced, youthful appearance';
      enhancements.push('youthful features');
    } else if (age < 35) {
      ageEnhancement = 'young professional, vibrant and energetic';
      enhancements.push('young professional');
    } else if (age < 50) {
      ageEnhancement = 'experienced professional, mature and confident';
      enhancements.push('mature professional');
    } else {
      ageEnhancement = 'seasoned expert, distinguished appearance';
      enhancements.push('experienced veteran');
    }
  }

  // Gender and ethnicity considerations
  let demographicEnhancement = '';
  if (gender !== 'neutral') {
    demographicEnhancement += `${gender}, `;
  }
  if (ethnicity) {
    demographicEnhancement += `${ethnicity} ethnicity, `;
  }

  // Build the enhanced prompt
  let prompt = `${styleTemplates[style]}, ${demographicEnhancement}${baseDescription}`;

  if (ageEnhancement) {
    prompt += `, ${ageEnhancement}`;
  }

  prompt += `, ${moodExpressions[mood]}, ${lightingOptions[lighting]}, ${backgroundOptions[background]}`;

  if (includeFacialDetails) {
    prompt += `, ${facialDetails}`;
  }

  if (includeCameraSettings) {
    prompt += `, ${cameraSettings}`;
  }

  // Add quality and realism enhancers
  prompt += ', ultra high resolution, photorealistic, detailed, professional portrait photography, natural lighting, realistic anatomy, high detail, sharp focus';

  const styleType = style === 'realistic' ? 'Realistic' : 'General';

  return {
    prompt,
    styleType,
    enhancements: [
      style,
      mood,
      lighting,
      background,
      ...(ageEnhancement ? [ageEnhancement] : []),
      'photorealistic',
      'high detail'
    ]
  };
}

/**
 * Generate category-specific face prompts
 */
export function generateCategoryFacePrompt(
  category: string,
  name: string,
  description: string,
  options: Partial<FaceGenerationOptions> = {}
): EnhancedPromptResult {
  const categoryEnhancements = {
    'business': 'corporate executive, business professional, confident leader',
    'academic': 'scholarly researcher, intellectual academic, thoughtful professor',
    'travel': 'experienced traveler, adventurous explorer, worldly professional',
    'creative': 'innovative creative, artistic professional, imaginative expert',
    'lifestyle': 'wellness coach, lifestyle expert, health-focused professional',
    'technology': 'tech professional, software engineer, IT specialist, innovative thinker'
  };

  const categoryPrompt = categoryEnhancements[category as keyof typeof categoryEnhancements] || category;

  const baseDescription = `${categoryPrompt}, named ${name}, ${description}`;

  return enhanceFacePrompt(baseDescription, {
    style: 'realistic',
    mood: 'professional',
    lighting: 'studio',
    background: 'clean',
    ...options
  });
}

/**
 * Generate diverse face variations for more realistic results
 */
export function generateDiverseFacePrompt(
  baseDescription: string,
  variation: 'diverse' | 'natural' | 'professional' | 'artistic' = 'diverse'
): EnhancedPromptResult {
  const variations = {
    diverse: {
      style: 'realistic' as const,
      mood: 'confident' as const,
      lighting: 'natural' as const,
      background: 'clean' as const,
      facialDetails: true,
      cameraSettings: true
    },
    natural: {
      style: 'realistic' as const,
      mood: 'friendly' as const,
      lighting: 'natural' as const,
      background: 'outdoor' as const,
      facialDetails: true,
      cameraSettings: true
    },
    professional: {
      style: 'professional' as const,
      mood: 'professional' as const,
      lighting: 'studio' as const,
      background: 'office' as const,
      facialDetails: true,
      cameraSettings: true
    },
    artistic: {
      style: 'artistic' as const,
      mood: 'thoughtful' as const,
      lighting: 'dramatic' as const,
      background: 'gradient' as const,
      facialDetails: true,
      cameraSettings: false
    }
  };

  return enhanceFacePrompt(baseDescription, variations[variation]);
}

/**
 * Quick presets for common face generation scenarios
 */
export const facePromptPresets = {
  professionalHeadshot: (name: string, role: string) =>
    enhanceFacePrompt(`${name}, ${role}`, {
      style: 'professional',
      mood: 'confident',
      lighting: 'studio',
      background: 'clean'
    }),

  casualPortrait: (name: string, description: string) =>
    enhanceFacePrompt(`${name}, ${description}`, {
      style: 'casual',
      mood: 'friendly',
      lighting: 'natural',
      background: 'outdoor'
    }),

  creativeProfessional: (name: string, field: string) =>
    enhanceFacePrompt(`${name}, creative ${field} professional`, {
      style: 'artistic',
      mood: 'thoughtful',
      lighting: 'dramatic',
      background: 'gradient'
    }),

  executivePortrait: (name: string, company: string) =>
    enhanceFacePrompt(`${name}, ${company} executive`, {
      style: 'professional',
      mood: 'confident',
      lighting: 'studio',
      background: 'office',
      age: 45
    })
};