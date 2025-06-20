# AutoJobr - Smart Job Application Automation Platform

![AutoJobr Logo](https://via.placeholder.com/800x200/4F46E5/FFFFFF?text=AutoJobr+-+Smart+Job+Application+Automation)

**AutoJobr** is a comprehensive job application automation platform that combines AI-powered resume parsing, intelligent form filling, application tracking, Chrome extension automation, and detailed analytics to help job seekers land their dream jobs faster and more efficiently.

## 🚀 Features

### Core Features
- **AI Resume Parsing** - Upload resume and auto-extract all information using Groq AI
- **Smart Onboarding** - Comprehensive user profile setup with missing field detection
- **Chrome Extension** - Auto-fill job application forms across major job boards
- **Application Tracking** - Comprehensive dashboard to manage all job applications
- **Real Job Data** - Integration with live job feeds from major platforms
- **Analytics Dashboard** - Detailed insights into job search performance
- **Form Auto-Fill** - Intelligent form filling for LinkedIn, Indeed, Workday, Naukri, and more

### Advanced Features
- **Multi-Site Support** - Works with LinkedIn, Indeed, Glassdoor, Naukri, Workday, AngelList, Monster, ZipRecruiter
- **Intelligent Field Mapping** - Automatically maps user data to form fields across different job sites
- **Daily Application Limits** - Prevents spam and maintains application quality
- **Smart Filtering** - Only apply to jobs matching your criteria
- **Real-time Sync** - Chrome extension syncs with web dashboard
- **Resume Text Extraction** - Supports PDF, DOCX, and TXT formats
- **Cover Letter Generation** - AI-powered cover letter creation using Groq

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **AI/ML**: Groq Cloud API for resume parsing and text generation
- **Form Handling**: React Hook Form with Zod validation
- **File Processing**: PDF parsing, DOCX text extraction
- **Charts**: Recharts for analytics visualization
- **Chrome Extension**: Manifest V3 with content scripts and background workers
- **Build Tool**: Vite
- **Containerization**: Docker & Docker Compose

## 🏃 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Groq API key (get from [Groq Cloud](https://console.groq.com))
- Chrome browser (for extension testing)

### Local Development
```bash
# Clone the repository
git clone https://github.com/yourusername/autojobr.git
cd autojobr

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your Groq API key

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Chrome Extension Setup
```bash
# Build the extension (optional - files are included)
cd chrome-extension

# Load extension in Chrome:
# 1. Open Chrome and go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the chrome-extension folder
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d --build

# Access at http://localhost:3000
```

## 📋 User Onboarding Flow

### 1. Resume Upload & AI Parsing
- Upload resume (PDF, DOCX, TXT)
- AI extracts personal details, work experience, skills, education
- Missing information is identified for manual input

### 2. Personal Information
- First Name, Last Name (required)
- Email, Phone Number (required)
- Current Address (City, State, Country)
- LinkedIn Profile URL
- Portfolio/Website URL

### 3. Professional Details
- Current Company & Job Title
- Years of Experience (required)
- Skills (comma-separated)
- Current Industry
- Education & Certifications

### 4. Work Authorization
- Country where you want to work (required)
- Legal work authorization (Yes/No)
- Visa sponsorship requirements (Yes/No)
- Current work status (Citizen, H1B, F1, OPT, etc.)

### 5. Employment Preferences
- Notice Period/Earliest Start Date (required)
- Willing to relocate (Yes/No)
- Desired salary range
- Employment types (Full-time, Part-time, Contract, Internship)
- Remote work preference

### 6. Optional: Diversity & Background Info
- Gender identity, race/ethnicity (for EEO compliance)
- Disability status, veteran status
- Previous employment at companies
- Conflict of interest disclosures

## 🔧 Chrome Extension Features

### Supported Job Sites
- **LinkedIn** - Full form automation including Easy Apply
- **Indeed** - Application forms and profile completion
- **Glassdoor** - Job applications and company reviews
- **Naukri** - Indian job portal with complete form support
- **Workday** - Enterprise ATS system used by many companies
- **AngelList** - Startup job applications
- **Monster** - Traditional job board applications
- **ZipRecruiter** - Quick apply functionality

### Form Fields Supported
- Personal Information (Name, Email, Phone, Address)
- Professional Details (Current Company, Title, Experience)
- Work Authorization & Visa Status
- Employment Preferences (Salary, Start Date, Relocation)
- Resume & Cover Letter Upload
- Custom Questions & Assessments

### Smart Features
- **Auto-Detection** - Automatically detects job application pages
- **Field Mapping** - Intelligent mapping of user data to form fields
- **Skip Optional** - Configurable skipping of optional fields
- **Form Navigation** - Handles multi-step application processes
- **Error Handling** - Graceful handling of form validation errors
- **Visual Feedback** - Highlights filled fields and shows progress

## 📊 Analytics & Insights

### Key Metrics Tracked
- Total applications submitted
- Response rates by company/industry
- Average response time
- Interview conversion rates
- Application success by job board
- Daily/weekly application trends

### AI-Powered Insights
- Best times to apply for higher response rates
- Company size preferences based on success patterns
- Keyword optimization suggestions
- Salary negotiation recommendations
- Interview preparation tips

## 🔒 Security & Privacy

### Data Protection
- All sensitive data encrypted at rest and in transit
- Groq API calls are secure and don't store personal data
- Local storage with optional cloud sync
- GDPR compliant data handling
- User-controlled data export and deletion

### Chrome Extension Security
- Manifest V3 compliance for enhanced security
- Minimal permissions requested
- Content scripts run in isolated environments
- No data transmission to third parties
- User consent for all automation actions

## 🚢 Deployment Options

### 1. Docker (Recommended)
```bash
# Quick deployment
docker-compose up -d --build

# Custom configuration
docker build -t autojobr .
docker run -p 3000:80 -e VITE_GROQ_API_KEY=your_key autojobr
```

### 2. Virtual Machine
```bash
# Automated setup script
curl -fsSL https://raw.githubusercontent.com/yourusername/autojobr/main/deployment/vm-setup.sh | bash

# Manual setup
git clone https://github.com/yourusername/autojobr.git
cd autojobr
npm install
npm run build
npm run preview
```

### 3. Cloud Platforms
- **AWS EC2**: Use provided CloudFormation template
- **Google Cloud**: Deploy to Compute Engine or Cloud Run
- **DigitalOcean**: One-click app deployment
- **Netlify/Vercel**: Static site deployment for frontend

## 🔧 Configuration

### Environment Variables
```env
# Required
VITE_GROQ_API_KEY=your_groq_api_key

# Optional
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:3001/api
DATABASE_URL=postgresql://user:pass@localhost:5432/autojobr
```

### Chrome Extension Configuration
```javascript
// In chrome-extension/config.js
const CONFIG = {
  dailyApplicationLimit: 10,
  autoApplyEnabled: false,
  skipOptionalFields: true,
  supportedSites: ['linkedin.com', 'indeed.com', 'glassdoor.com']
};
```

## 🏗️ Project Structure

```
autojobr/
├── src/
│   ├── components/
│   │   ├── Auth/              # Login and authentication
│   │   ├── Onboarding/        # User onboarding flow
│   │   ├── Layout/            # App layout components
│   │   ├── Jobs/              # Job search and listings
│   │   └── Applications/      # Application management
│   ├── services/
│   │   ├── groqService.ts     # AI resume parsing
│   │   ├── resumeParser.ts    # File processing
│   │   ├── jobService.ts      # Job data fetching
│   │   └── chromeExtension.ts # Extension communication
│   ├── pages/                 # Main application pages
│   └── types/                 # TypeScript definitions
├── chrome-extension/
│   ├── manifest.json          # Extension configuration
│   ├── background.js          # Background service worker
│   ├── content.js             # Content script for form filling
│   ├── popup.html/js          # Extension popup interface
│   └── icons/                 # Extension icons
├── deployment/                # Deployment scripts and configs
└── docs/                      # Documentation
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Fork and clone
git clone https://github.com/yourusername/autojobr.git
cd autojobr

# Install dependencies
npm install

# Start development
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Areas for Contribution
- Additional job board integrations
- Enhanced AI parsing capabilities
- Mobile app development
- API integrations (ATS systems)
- Internationalization (i18n)
- Accessibility improvements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: [docs.autojobr.com](https://docs.autojobr.com)
- **GitHub Issues**: Report bugs and request features
- **Discord Community**: [discord.gg/autojobr](https://discord.gg/autojobr)
- **Email Support**: support@autojobr.com

### Troubleshooting

#### Common Issues
1. **Groq API Errors**: Ensure your API key is valid and has sufficient credits
2. **Extension Not Working**: Check if extension is enabled and has required permissions
3. **Resume Parsing Failed**: Try converting to PDF or check file format
4. **Form Filling Issues**: Some sites may have updated their form structure

#### Debug Mode
```bash
# Enable debug logging
VITE_DEBUG=true npm run dev

# Chrome extension debug
# Open chrome://extensions/ and click "Inspect views: background page"
```

## 🔄 Roadmap

### Version 2.0 (Q2 2025)
- [ ] Mobile applications (iOS/Android)
- [ ] Advanced AI job matching with ML models
- [ ] Integration with major ATS systems
- [ ] Video interview practice with AI feedback
- [ ] Salary negotiation assistant

### Version 2.1 (Q3 2025)
- [ ] Team collaboration features for career coaches
- [ ] Advanced analytics with predictive insights
- [ ] API for third-party integrations
- [ ] White-label solutions for career services
- [ ] Multi-language support

### Version 3.0 (Q4 2025)
- [ ] AI-powered interview preparation
- [ ] Automated reference checking
- [ ] Skills assessment integration
- [ ] Career path recommendations
- [ ] Enterprise features and SSO

---

**Made with ❤️ by the AutoJobr Team**

*Empowering job seekers worldwide with AI-powered automation to find their dream careers faster and more efficiently.*

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/autojobr?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/autojobr?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/autojobr)
![GitHub license](https://img.shields.io/github/license/yourusername/autojobr)
![Chrome Web Store](https://img.shields.io/chrome-web-store/v/extension-id)
![Chrome Web Store Users](https://img.shields.io/chrome-web-store/users/extension-id)