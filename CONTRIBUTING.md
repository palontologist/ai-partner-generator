# Contributing to TeamMate Finder

Thank you for your interest in contributing to TeamMate Finder! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/ai-partner-generator.git`
3. Install dependencies: `pnpm install`
4. Create a feature branch: `git checkout -b feature/your-feature-name`
5. Start the development server: `pnpm dev`

### Project Structure
```
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── categories/         # Category-specific components
│   ├── profile/           # Profile management
│   ├── matching/          # Matching system UI
│   ├── communication/     # Chat and messaging
│   └── ui/               # Shared UI components
├── lib/                   # Utility functions and configurations
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
└── styles/               # Global styles and themes
```

## 🎯 Contribution Areas

### 🧠 Matching Algorithm
Help improve our compatibility scoring and teammate matching logic:
- **Skill complementarity**: Enhance how we identify complementary skill sets
- **Goal alignment**: Improve shared objective detection
- **Personality matching**: Develop better personality compatibility metrics
- **Context awareness**: Enhance category-specific matching criteria

### 🎨 User Experience
Contribute to making the platform more intuitive and engaging:
- **Onboarding flow**: Streamline new user experience
- **Profile creation**: Make profile building more engaging
- **Results presentation**: Improve how matches are displayed
- **Mobile responsiveness**: Enhance mobile user experience

### 🏗 Technical Infrastructure
Help scale and optimize the platform:
- **Performance optimization**: Improve load times and responsiveness
- **Testing coverage**: Add unit, integration, and E2E tests
- **Accessibility**: Ensure WCAG compliance
- **API development**: Build robust backend services

### 📊 Analytics & Insights
Contribute to understanding user behavior and success metrics:
- **Success tracking**: Implement collaboration success metrics
- **User behavior analytics**: Add meaningful usage insights
- **A/B testing framework**: Enable feature experimentation
- **Feedback systems**: Improve user feedback collection

## 🛠 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Use descriptive variable and function names
- Add JSDoc comments for complex functions

### Component Guidelines
```typescript
// Example component structure
interface ComponentProps {
  // Always define prop interfaces
  title: string
  onAction: (data: ActionData) => void
  variant?: 'primary' | 'secondary'
}

export function Component({ title, onAction, variant = 'primary' }: ComponentProps) {
  // Component implementation
}
```

### Testing Requirements
- Add unit tests for utility functions
- Include component tests for UI elements
- Write integration tests for critical flows
- Ensure accessibility testing coverage

### Performance Considerations
- Use React.memo for expensive components
- Implement lazy loading for large pages
- Optimize images and assets
- Monitor bundle size impact

## 🎭 Category-Specific Contributions

### Business & Entrepreneurship
- Industry-specific matching criteria
- Business model compatibility assessment
- Investment stage alignment
- Market expertise matching

### Academic & Research
- Academic discipline compatibility
- Research methodology alignment
- Publication collaboration features
- Conference and event coordination

### Travel & Adventure
- Destination preference matching
- Travel style compatibility
- Budget range alignment
- Activity level coordination

### Creative Projects
- Artistic style compatibility
- Creative process alignment
- Portfolio collaboration features
- Creative feedback systems

## 📝 Commit Guidelines

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```
feat(matching): add skill complementarity scoring
fix(profile): resolve photo upload issue
docs(readme): update installation instructions
test(matching): add unit tests for compatibility algorithm
```

## 🔍 Pull Request Process

### Before Submitting
- [ ] Run tests: `pnpm test`
- [ ] Check linting: `pnpm lint`
- [ ] Build successfully: `pnpm build`
- [ ] Test in different browsers
- [ ] Update documentation if needed

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #issue_number
```

### Review Process
1. Automated checks must pass
2. At least one code review required
3. No merge conflicts
4. Documentation updated if needed

## 🐛 Bug Reports

### Bug Report Template
```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., Windows 10, macOS Big Sur]
- Browser: [e.g., Chrome 95, Firefox 94]
- Device: [e.g., Desktop, iPhone 12]

**Additional Context**
Screenshots, error logs, etc.
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution you'd like**
Clear description of desired feature

**Describe alternatives you've considered**
Alternative solutions or features

**Additional context**
Mockups, examples, use cases
```

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Special mentions in community updates

## 📞 Getting Help

- **Discord**: Join our community server
- **GitHub Discussions**: For questions and ideas
- **GitHub Issues**: For bugs and feature requests
- **Email**: team@teammatefinder.com

## 📄 Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a welcoming environment for all contributors.

---

*Thank you for contributing to TeamMate Finder! Together, we're building the future of collaborative connections.* 🤝