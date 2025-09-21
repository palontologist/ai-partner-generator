import { CategoryConfig, CollaborationCategory } from '@/types'

export const COLLABORATION_CATEGORIES: Record<CollaborationCategory, CategoryConfig> = {
  business: {
    id: 'business',
    name: 'Business & Entrepreneurship',
    description: 'Find co-founders, business partners, and startup team members',
    icon: '💼',
    color: 'from-blue-500 to-purple-600',
    subcategories: [
      {
        id: 'startup',
        name: 'Startup Development',
        description: 'Early-stage company building and product development'
      },
      {
        id: 'franchise',
        name: 'Franchise Opportunities',
        description: 'Franchise partnerships and multi-location businesses'
      },
      {
        id: 'consulting',
        name: 'Consulting & Services',
        description: 'Professional services and consulting partnerships'
      },
      {
        id: 'ecommerce',
        name: 'E-commerce & Retail',
        description: 'Online stores, marketplaces, and retail ventures'
      }
    ],
    requiredFields: ['businessStage', 'industry', 'timeCommitment'],
    optionalFields: ['fundingStatus', 'revenue', 'teamSize', 'location'],
    matchingCriteria: {
      skillWeight: 0.25,
      goalWeight: 0.30,
      personalityWeight: 0.20,
      locationWeight: 0.10,
      scheduleWeight: 0.10,
      experienceWeight: 0.05
    },
    suggestedSkills: [
      'Business Strategy', 'Marketing', 'Sales', 'Finance', 'Operations',
      'Product Management', 'Software Development', 'Design', 'Legal', 'HR'
    ],
    commonGoals: [
      'Launch MVP', 'Raise funding', 'Scale operations', 'Expand market',
      'Build team', 'Develop product', 'Establish partnerships'
    ]
  },

  academic: {
    id: 'academic',
    name: 'Academic & Research',
    description: 'Connect with study partners, research collaborators, and academic mentors',
    icon: '🎓',
    color: 'from-green-500 to-blue-500',
    subcategories: [
      {
        id: 'study-groups',
        name: 'Study Groups',
        description: 'Course-specific study partnerships and exam preparation'
      },
      {
        id: 'research',
        name: 'Research Collaboration',
        description: 'Academic research projects and paper writing'
      },
      {
        id: 'thesis',
        name: 'Thesis & Dissertation',
        description: 'Graduate-level research and writing support'
      },
      {
        id: 'conferences',
        name: 'Conferences & Events',
        description: 'Academic conference attendance and presentation partners'
      }
    ],
    requiredFields: ['academicLevel', 'fieldOfStudy', 'institution'],
    optionalFields: ['researchInterests', 'publications', 'advisors'],
    matchingCriteria: {
      skillWeight: 0.20,
      goalWeight: 0.35,
      personalityWeight: 0.15,
      locationWeight: 0.15,
      scheduleWeight: 0.10,
      experienceWeight: 0.05
    },
    suggestedSkills: [
      'Research Methods', 'Statistical Analysis', 'Writing', 'Presentation',
      'Data Analysis', 'Literature Review', 'Critical Thinking', 'Time Management'
    ],
    commonGoals: [
      'Complete coursework', 'Publish paper', 'Present at conference',
      'Finish thesis', 'Apply for grants', 'Network with peers'
    ]
  },

  travel: {
    id: 'travel',
    name: 'Travel & Adventure',
    description: 'Find travel companions for adventures, cultural experiences, and explorations',
    icon: '✈️',
    color: 'from-orange-500 to-red-500',
    subcategories: [
      {
        id: 'backpacking',
        name: 'Backpacking & Budget Travel',
        description: 'Budget-conscious travel and extended journeys'
      },
      {
        id: 'adventure',
        name: 'Adventure Sports',
        description: 'Hiking, climbing, diving, and extreme sports'
      },
      {
        id: 'cultural',
        name: 'Cultural Immersion',
        description: 'Language learning, cultural exchange, and local experiences'
      },
      {
        id: 'luxury',
        name: 'Luxury Travel',
        description: 'Premium accommodations and exclusive experiences'
      },
      {
        id: 'digital-nomad',
        name: 'Digital Nomad',
        description: 'Remote work travel and location-independent lifestyle'
      }
    ],
    requiredFields: ['travelStyle', 'budgetRange', 'destinations'],
    optionalFields: ['activityLevel', 'accommodationPrefs', 'dietaryRestrictions'],
    matchingCriteria: {
      skillWeight: 0.10,
      goalWeight: 0.25,
      personalityWeight: 0.25,
      locationWeight: 0.20,
      scheduleWeight: 0.15,
      experienceWeight: 0.05
    },
    suggestedSkills: [
      'Languages', 'Navigation', 'Photography', 'Cultural Sensitivity',
      'Budget Management', 'Safety Awareness', 'Planning', 'Adaptability'
    ],
    commonGoals: [
      'Explore new destinations', 'Learn languages', 'Experience cultures',
      'Adventure activities', 'Document journey', 'Meet locals'
    ]
  },

  creative: {
    id: 'creative',
    name: 'Creative Projects',
    description: 'Collaborate on artistic endeavors, content creation, and creative ventures',
    icon: '🎨',
    color: 'from-purple-500 to-pink-500',
    subcategories: [
      {
        id: 'filmmaking',
        name: 'Film & Video',
        description: 'Movie production, documentaries, and video content'
      },
      {
        id: 'music',
        name: 'Music & Audio',
        description: 'Bands, recording, composition, and audio production'
      },
      {
        id: 'writing',
        name: 'Writing & Publishing',
        description: 'Books, articles, scripts, and collaborative writing'
      },
      {
        id: 'visual-arts',
        name: 'Visual Arts & Design',
        description: 'Painting, sculpture, graphic design, and exhibitions'
      },
      {
        id: 'digital-content',
        name: 'Digital Content',
        description: 'Social media, podcasts, blogs, and online platforms'
      }
    ],
    requiredFields: ['creativeField', 'projectType', 'experienceLevel'],
    optionalFields: ['portfolio', 'equipment', 'budget', 'timeline'],
    matchingCriteria: {
      skillWeight: 0.30,
      goalWeight: 0.25,
      personalityWeight: 0.20,
      locationWeight: 0.10,
      scheduleWeight: 0.10,
      experienceWeight: 0.05
    },
    suggestedSkills: [
      'Creativity', 'Technical Skills', 'Storytelling', 'Visual Design',
      'Audio Production', 'Video Editing', 'Writing', 'Project Management'
    ],
    commonGoals: [
      'Complete creative project', 'Build portfolio', 'Gain exposure',
      'Learn new techniques', 'Collaborate with others', 'Monetize work'
    ]
  },

  lifestyle: {
    id: 'lifestyle',
    name: 'Lifestyle & Personal',
    description: 'Find partners for fitness, hobbies, personal development, and life goals',
    icon: '🌱',
    color: 'from-green-400 to-cyan-500',
    subcategories: [
      {
        id: 'fitness',
        name: 'Fitness & Health',
        description: 'Workout partners, wellness journeys, and healthy lifestyle'
      },
      {
        id: 'hobbies',
        name: 'Hobbies & Interests',
        description: 'Shared interests, collections, and recreational activities'
      },
      {
        id: 'personal-dev',
        name: 'Personal Development',
        description: 'Self-improvement, goal achievement, and life coaching'
      },
      {
        id: 'relationships',
        name: 'Social & Relationships',
        description: 'Social events, friendship building, and community involvement'
      }
    ],
    requiredFields: ['lifestyleGoals', 'commitmentLevel', 'interests'],
    optionalFields: ['schedule', 'location', 'experience'],
    matchingCriteria: {
      skillWeight: 0.15,
      goalWeight: 0.30,
      personalityWeight: 0.25,
      locationWeight: 0.15,
      scheduleWeight: 0.10,
      experienceWeight: 0.05
    },
    suggestedSkills: [
      'Motivation', 'Accountability', 'Communication', 'Empathy',
      'Organization', 'Goal Setting', 'Time Management', 'Flexibility'
    ],
    commonGoals: [
      'Improve fitness', 'Learn new skills', 'Build habits',
      'Achieve goals', 'Make friends', 'Have fun'
    ]
  },

  professional: {
    id: 'professional',
    name: 'Professional Development',
    description: 'Connect for career growth, skill development, and professional networking',
    icon: '📈',
    color: 'from-indigo-500 to-purple-600',
    subcategories: [
      {
        id: 'mentorship',
        name: 'Mentorship',
        description: 'Career guidance, industry insights, and professional growth'
      },
      {
        id: 'networking',
        name: 'Professional Networking',
        description: 'Industry connections, career opportunities, and collaborations'
      },
      {
        id: 'skill-sharing',
        name: 'Skill Exchange',
        description: 'Mutual learning, training, and professional skill development'
      },
      {
        id: 'career-change',
        name: 'Career Transition',
        description: 'Industry switching, role changes, and career pivots'
      }
    ],
    requiredFields: ['careerStage', 'industry', 'professionalGoals'],
    optionalFields: ['currentRole', 'targetRole', 'skills', 'certifications'],
    matchingCriteria: {
      skillWeight: 0.25,
      goalWeight: 0.30,
      personalityWeight: 0.15,
      locationWeight: 0.10,
      scheduleWeight: 0.15,
      experienceWeight: 0.05
    },
    suggestedSkills: [
      'Leadership', 'Communication', 'Strategic Thinking', 'Problem Solving',
      'Industry Knowledge', 'Networking', 'Mentoring', 'Project Management'
    ],
    commonGoals: [
      'Advance career', 'Learn new skills', 'Change industries',
      'Build network', 'Find mentorship', 'Share knowledge'
    ]
  },

  volunteer: {
    id: 'volunteer',
    name: 'Volunteer & Social Impact',
    description: 'Join forces for community service, social causes, and making a difference',
    icon: '🤝',
    color: 'from-pink-500 to-rose-600',
    subcategories: [
      {
        id: 'community',
        name: 'Community Service',
        description: 'Local volunteering, community improvement, and civic engagement'
      },
      {
        id: 'nonprofit',
        name: 'Nonprofit Work',
        description: 'NGO partnerships, charity work, and social organizations'
      },
      {
        id: 'environmental',
        name: 'Environmental Action',
        description: 'Conservation, sustainability, and environmental advocacy'
      },
      {
        id: 'social-justice',
        name: 'Social Justice',
        description: 'Advocacy, equality movements, and human rights work'
      }
    ],
    requiredFields: ['causeArea', 'timeCommitment', 'location'],
    optionalFields: ['experience', 'skills', 'availability'],
    matchingCriteria: {
      skillWeight: 0.20,
      goalWeight: 0.35,
      personalityWeight: 0.20,
      locationWeight: 0.15,
      scheduleWeight: 0.05,
      experienceWeight: 0.05
    },
    suggestedSkills: [
      'Compassion', 'Organization', 'Communication', 'Fundraising',
      'Event Planning', 'Social Media', 'Grant Writing', 'Community Building'
    ],
    commonGoals: [
      'Make impact', 'Help others', 'Build community',
      'Raise awareness', 'Organize events', 'Support causes'
    ]
  },

  sports: {
    id: 'sports',
    name: 'Sports & Fitness',
    description: 'Find training partners, team members, and competition companions',
    icon: '🏃',
    color: 'from-yellow-500 to-orange-600',
    subcategories: [
      {
        id: 'team-sports',
        name: 'Team Sports',
        description: 'Basketball, soccer, volleyball, and group activities'
      },
      {
        id: 'individual',
        name: 'Individual Sports',
        description: 'Running, cycling, swimming, and personal fitness'
      },
      {
        id: 'competition',
        name: 'Competitive Sports',
        description: 'Tournaments, races, and competitive training'
      },
      {
        id: 'recreational',
        name: 'Recreational Activities',
        description: 'Casual sports, fun activities, and social games'
      }
    ],
    requiredFields: ['sportsType', 'skillLevel', 'commitmentLevel'],
    optionalFields: ['competitiveLevel', 'schedule', 'equipment'],
    matchingCriteria: {
      skillWeight: 0.25,
      goalWeight: 0.25,
      personalityWeight: 0.20,
      locationWeight: 0.20,
      scheduleWeight: 0.05,
      experienceWeight: 0.05
    },
    suggestedSkills: [
      'Athletic Ability', 'Teamwork', 'Discipline', 'Motivation',
      'Strategy', 'Physical Fitness', 'Coordination', 'Sportsmanship'
    ],
    commonGoals: [
      'Improve fitness', 'Compete in events', 'Learn new sports',
      'Join teams', 'Have fun', 'Stay active'
    ]
  },

  technology: {
    id: 'technology',
    name: 'Technology & Innovation',
    description: 'Collaborate on tech projects, learn programming, and explore innovation',
    icon: '💻',
    color: 'from-cyan-500 to-blue-600',
    subcategories: [
      {
        id: 'software-dev',
        name: 'Software Development',
        description: 'Coding projects, app development, and programming'
      },
      {
        id: 'data-science',
        name: 'Data Science & AI',
        description: 'Machine learning, data analysis, and AI projects'
      },
      {
        id: 'cybersecurity',
        name: 'Cybersecurity',
        description: 'Security research, penetration testing, and protection'
      },
      {
        id: 'hardware',
        name: 'Hardware & IoT',
        description: 'Electronics, robotics, and Internet of Things projects'
      }
    ],
    requiredFields: ['techArea', 'experienceLevel', 'projectType'],
    optionalFields: ['programmingLanguages', 'frameworks', 'tools'],
    matchingCriteria: {
      skillWeight: 0.35,
      goalWeight: 0.25,
      personalityWeight: 0.15,
      locationWeight: 0.10,
      scheduleWeight: 0.10,
      experienceWeight: 0.05
    },
    suggestedSkills: [
      'Programming', 'Problem Solving', 'System Design', 'Testing',
      'Documentation', 'Version Control', 'Debugging', 'Innovation'
    ],
    commonGoals: [
      'Build applications', 'Learn technologies', 'Complete projects',
      'Contribute to open source', 'Launch products', 'Solve problems'
    ]
  },

  learning: {
    id: 'learning',
    name: 'Learning & Education',
    description: 'Study partners for courses, certifications, and skill development',
    icon: '📚',
    color: 'from-violet-500 to-purple-600',
    subcategories: [
      {
        id: 'language',
        name: 'Language Learning',
        description: 'Practice partners, conversation exchange, and fluency building'
      },
      {
        id: 'certification',
        name: 'Professional Certifications',
        description: 'IT, project management, and industry certification prep'
      },
      {
        id: 'online-courses',
        name: 'Online Courses',
        description: 'MOOCs, bootcamps, and structured learning programs'
      },
      {
        id: 'skill-development',
        name: 'Skill Development',
        description: 'New skills, hobbies, and personal enrichment'
      }
    ],
    requiredFields: ['learningGoals', 'subject', 'timeCommitment'],
    optionalFields: ['currentLevel', 'targetLevel', 'studyMethods'],
    matchingCriteria: {
      skillWeight: 0.20,
      goalWeight: 0.35,
      personalityWeight: 0.20,
      locationWeight: 0.10,
      scheduleWeight: 0.10,
      experienceWeight: 0.05
    },
    suggestedSkills: [
      'Teaching', 'Patience', 'Communication', 'Organization',
      'Motivation', 'Persistence', 'Curiosity', 'Adaptability'
    ],
    commonGoals: [
      'Master subject', 'Pass certification', 'Practice skills',
      'Learn together', 'Share knowledge', 'Stay motivated'
    ]
  }
}