# BMad Method Implementation for PicNotebook

## Project Overview
PicNotebook is a lab notebook application that allows researchers to upload and manage their experiment notes with image processing and OCR capabilities.

## BMad Method Configuration
- **Version**: 4.35.0
- **IDE**: Claude Code
- **Workflow**: Two-phase (Planning + Development)

## Agent Roles

### Planning Phase Agents
1. **Analyst**: Analyzes requirements and creates detailed specifications
2. **PM (Product Manager)**: Creates PRDs and manages feature planning
3. **Architect**: Designs system architecture and technical specifications

### Development Phase Agents
1. **SM (Scrum Master)**: Breaks down tasks into detailed stories
2. **Dev**: Implements features based on detailed context

## Project Structure
```
picnotebook/
├── bmad-core/           # BMad Method core files
│   ├── agents/          # AI agent definitions
│   ├── teams/           # Team configurations
│   ├── docs/            # Documentation (PRDs, Architecture)
│   ├── workflows/       # Workflow definitions
│   └── context/         # Context engineering files
├── frontend/            # Next.js frontend application
├── backend files        # Flask backend (app.py, models.py, etc.)
└── bmad-config.json     # BMad configuration
```

## Key Features to Implement with BMad
1. Enhanced OCR processing for lab notes
2. Real-time collaboration features
3. Advanced search and filtering
4. Data visualization and analysis
5. Mobile optimization

## Testing Commands
- Frontend: `cd frontend && npm test`
- Backend: `python -m pytest`
- Linting: `cd frontend && npm run lint`
- Type checking: `cd frontend && npm run typecheck`

## Development Workflow
1. Use BMad planning agents to create PRDs and architecture docs
2. SM agent breaks down into detailed stories
3. Dev agent implements with full context
4. QA agent validates implementation

## Context Engineering Rules
- Always include relevant file context when making changes
- Preserve existing code conventions and patterns
- Use existing libraries and frameworks (Next.js, Flask, SQLAlchemy)
- Follow security best practices