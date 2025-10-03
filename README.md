# 🚀 BioSteller - NASA Space Biology Explorer

<div align="center">
<img width="1200" height="475" alt="BioSteller Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

**An interactive AI-powered web application to explore NASA's Space Biology data**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)

[🌐 Live Demo](#) | [📖 Documentation](#features) | [🚀 Quick Start](#quick-start) | [🤝 Contributing](#contributing)

</div>

## 🌟 Overview

BioSteller transforms NASA's vast repository of space biology research into an accessible, interactive platform. Using cutting-edge AI technology, it helps researchers, students, and space enthusiasts explore complex biological data from space missions, making groundbreaking discoveries more understandable and actionable.

### 🎯 Perfect for NASA Space Apps Challenge

BioSteller addresses the challenge of making NASA's extensive space biology database more accessible and actionable for:
- 🔬 **Researchers** seeking to discover patterns across multiple studies
- 🎓 **Students** learning about space biology and astrobiology
- 🚀 **Space enthusiasts** exploring the effects of space on living organisms
- 💡 **Innovators** looking for inspiration from space biology research

---

## ✨ Features

### 🔍 **AI-Powered Research Tools**

#### **Smart Search & Summarization**
- **Natural Language Queries**: Ask questions in plain English about space biology topics
- **AI-Generated Summaries**: Get comprehensive overviews of research areas with key findings
- **Intelligent Filtering**: Advanced filters by year, organisms, missions, research areas, and publication types
- **Extended Search**: Dynamically expand search results to find more relevant studies
- **Suggested Topics**: Discover trending research areas and popular queries

#### **Advanced Analysis Features**
- **Comparative Analysis**: Side-by-side comparison of multiple research reports
- **Hypothesis Generation**: AI generates testable scientific hypotheses based on data patterns
- **Timeline Analysis**: AI-powered impact analysis showing mission effectiveness, future potential, and real-world applications

### 📊 **Interactive Visualizations**

#### **Knowledge Graph**
- **Dynamic Network Visualization**: Interactive graph showing connections between experiments, organisms, missions, and findings
- **Real-time Filtering**: Filter nodes by type (experiments, organisms, missions, findings)
- **Physics Simulation**: Adjustable force parameters for optimal graph layout
- **Export Capabilities**: Save graphs as SVG or PNG files
- **Zoom & Pan**: Navigate large networks with smooth interactions

#### **Data Dashboard**
- **Publication Timeline**: Visualize research trends over time
- **Organism Distribution**: See which organisms are most studied
- **Mission Breakdown**: Understand research across different space platforms
- **Research Area Analytics**: Identify focus areas in space biology
- **Export Features**: Download dashboard visualizations

#### **Interactive Timeline**
- **Chronological Research View**: Browse studies by publication year
- **Time Range Slider**: Focus on specific time periods
- **Mission Milestones**: Key space missions and their biological research
- **Trend Analysis**: Identify research evolution over decades

### 🤖 **AI Chat Assistant**
- **Contextual Q&A**: Ask follow-up questions about your search results
- **Research Guidance**: Get explanations of complex scientific concepts
- **Data Exploration**: Dive deeper into specific findings with conversational AI
- **Citation Support**: Access source URLs and publication details

### 📚 **Learning & Discovery**

#### **Glossary & Learning Paths**
- **Scientific Terminology**: Clear definitions of space biology terms
- **Guided Learning**: Structured paths through complex topics
- **Context-Aware Explanations**: Definitions relevant to current search results

#### **Media Gallery**
- **Visual Research Assets**: Images, diagrams, and visual data from studies
- **Interactive Media**: Explore visual elements of space biology research

### 🎨 **User Experience**
- **Dark/Light Theme**: Comfortable viewing in any environment
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Accessible Interface**: Screen reader friendly with proper ARIA labels
- **Fast Performance**: Optimized React components with efficient rendering
- **Progressive Loading**: Smooth experience even with large datasets

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **Google Gemini API Key** ([Get one here](https://ai.google.dev/))

### 📥 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/codeslayer86/BioSteller
   cd BioSteller
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Set up environment variables**
   
   Create `.env.local` in the root directory:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   Create `backend/.env`:
   ```bash
   PORT=3001
   API_KEY=your_gemini_api_key_here
   ```

5. **Initialize the database**
   ```bash
   cd backend
   npm run knex:migrate:latest
   cd ..
   ```

### 🏃‍♂️ Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on `http://localhost:3001`

2. **Start the frontend development server** (in a new terminal)
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:3000`

3. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

---

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1** - Modern UI library with hooks and context
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **D3.js** - Data visualization and force-directed graphs
- **Recharts** - Chart components for React

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Knex.js** - SQL query builder
- **SQLite3** - Database (development)
- **MySQL2** - Database (production)
- **Google Gemini AI** - AI-powered analysis and chat
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection

### Development Tools
- **Nodemon** - Auto-restart development server
- **ESLint** - Code linting
- **TypeScript Compiler** - Type checking

---

## 📁 Project Structure

```
biosteller/
├── 📁 components/           # Reusable React components
│   ├── 📁 icons/           # SVG icon components
│   ├── SearchBar.tsx       # AI search interface
│   ├── KnowledgeGraph.tsx  # Interactive network visualization
│   ├── DataDashboard.tsx   # Charts and analytics
│   ├── DetailedReport.tsx  # Research findings display
│   └── ...
├── 📁 contexts/            # React context providers
│   ├── SearchContext.tsx   # Global search state
│   └── ThemeContext.tsx    # Dark/light theme
├── 📁 pages/               # Main application pages
│   ├── HomePage.tsx        # Landing page
│   ├── ExplorePage.tsx     # Main search and analysis
│   ├── TimelinePage.tsx    # Chronological view
│   └── AboutPage.tsx       # Project information
├── 📁 services/            # API and external services
│   ├── aiService.ts        # Frontend AI service
│   └── 📁 ai/             # AI provider implementations
├── 📁 utils/              # Utility functions
├── 📁 backend/            # Node.js backend
│   ├── 📁 routes/         # API endpoints
│   ├── 📁 services/       # Backend AI service
│   ├── 📁 database/       # Database migrations
│   └── server.js          # Express server
├── package.json           # Frontend dependencies
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

---

## 🔧 Configuration

### Environment Variables

#### Frontend (`.env.local`)
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

#### Backend (`backend/.env`)
```bash
PORT=3001
API_KEY=your_gemini_api_key_here

# Database (SQLite for development)
DB_CLIENT=sqlite3
DB_FILENAME=./database/dev.sqlite3

# Production MySQL (optional)
# DB_HOST=127.0.0.1
# DB_USER=your_mysql_user
# DB_PASSWORD=your_mysql_password
# DB_NAME=biosteller_db
```

### Database Setup

The application uses SQLite for development and supports MySQL for production:

```bash
# Run migrations
cd backend
npm run knex:migrate:latest

# Create new migration
npm run knex:migrate:make migration_name
```

---

## 🎯 Usage Examples

### 🔍 Search Examples
Try these sample queries to explore BioSteller's capabilities:

- "Plant growth in microgravity conditions"
- "Effects of space radiation on human cells"
- "Bone density changes in astronauts"
- "Protein crystallization experiments on ISS"
- "Sleep patterns during long-duration spaceflight"

### 📊 Analysis Workflows

1. **Discovering Research Patterns**
   - Search for a broad topic
   - Use knowledge graph to see connections
   - Apply filters to narrow focus
   - Generate timeline analysis

2. **Comparative Studies**
   - Search and select multiple reports
   - Use comparison tool for side-by-side analysis
   - Export results for further research

3. **Hypothesis Development**
   - Gather comprehensive search results
   - Use AI hypothesis generation
   - Explore suggested next steps

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'Add feature'`
6. Push to branch: `git push origin feature-name`
7. Submit a pull request

### Contribution Areas
- 🐛 Bug fixes and improvements
- ✨ New features and visualizations
- 📚 Documentation updates
- 🎨 UI/UX enhancements
- 🧪 Test coverage
- 🌐 Accessibility improvements

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **NASA** for providing open access to space biology research data
- **Google AI** for the Gemini API powering our AI features
- **React Community** for excellent libraries and tools
- **Open Source Contributors** who make projects like this possible

---

## 📞 Support

Having issues? We're here to help!

- 📧 **Email**: omar2086pcc40sh@gmail.com
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/codeslayer86/BioSteller/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/codeslayer86/BioSteller/discussions/)
- 📖 **Documentation**: [Wiki](https://github.com/codeslayer86/BioSteller/wiki)

---

<div align="center">

**🚀 Ready to explore biology beyond Earth? [Start your journey with BioSteller!](http://localhost:3000) 🌌**

Made with ❤️ for the NASA Space Apps Challenge

</div>
