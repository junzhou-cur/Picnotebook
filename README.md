# Lab Notebook Image Processor App

A web application for processing handwritten lab notes using AI transcription and automatic organization into research projects.

## Features

- **Project Management**: Create and organize lab projects with hypothesis, purpose, and progress tracking
- **Image Processing**: Upload images of handwritten notes and transcribe them using xAI's Grok models
- **Auto-Classification**: Automatically match notes to appropriate projects based on content
- **Report Generation**: Generate comprehensive project reports summarizing all notes and progress
- **Structured Output**: Convert handwritten notes into well-formatted Markdown lab entries

## Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Get xAI API Key**:
   - Visit [https://x.ai/api](https://x.ai/api) to get your API key
   - You'll need this to use the transcription features

## Usage

1. **Run the Web Application**:
   ```bash
   python app.py
   ```
   The app will be available at `http://localhost:5000`

2. **Enter API Key**:
   - Enter your xAI API key in the configuration section at the top of the page

3. **Create a Project**:
   - Click "Create New Project" to set up a new research project
   - Fill in the project name, hypothesis, purpose, and current progress

4. **Process Lab Notes**:
   - Upload an image of your handwritten notes (drag & drop or click to browse)
   - Click "Process with AI" to transcribe and structure the notes using Grok
   - The processed text will appear in the text area
   - Click "Save to Project" to automatically classify and save to the appropriate project

5. **Manage Projects**:
   - View all your projects on the main dashboard
   - Click "View" to see project details and all associated lab notes
   - Click "Report" to generate comprehensive project summaries

6. **Generate Reports**:
   - Access detailed reports for any project with AI-generated summaries
   - Reports include purpose, key findings, progress tracking, and next steps

## File Structure

```
lab-notebook-app/
├── app.py                    # Flask web application
├── app_desktop.py           # Desktop GUI version (backup)
├── requirements.txt         # Python dependencies
├── templates/              # HTML templates
│   ├── base.html           # Base template
│   ├── index.html          # Main dashboard
│   ├── create_project.html # Project creation
│   ├── project.html        # Project details
│   └── report.html         # Report viewer
├── static/                 # Static files
│   ├── css/
│   │   └── style.css       # Custom styling
│   └── js/
│       └── main.js         # JavaScript functions
├── uploads/               # Temporary image uploads
├── projects/             # Project data storage
│   └── [project_name]/
│       ├── project_info.json    # Project metadata
│       ├── lab_note_*.md        # Processed lab notes
│       └── project_report.md    # Generated reports
└── README.md            # This file
```

## Requirements

- Python 3.7+
- xAI API access
- Image files (JPG, PNG) of handwritten lab notes

## Features

### Web Interface
- **Modern responsive design** with Bootstrap styling
- **Drag & drop image upload** with preview
- **Real-time processing feedback** with loading indicators
- **Project dashboard** with overview of all research projects
- **Auto-classification** of notes to appropriate projects
- **Comprehensive reporting** with formatted output

### AI Processing
- **Handwriting recognition** using xAI's Grok models
- **Structured output** conversion to Markdown format
- **Smart project matching** based on content analysis
- **Progress tracking** with automatic updates

## Notes

- Uses "grok-beta" model by default (free tier available)
- For better performance, change to "grok-4" in the code if you have premium access
- All data stored locally in the `projects/` directory
- Web interface accessible at `http://localhost:5000`
- Maximum file upload size: 16MB
- Supported image formats: JPG, JPEG, PNG
- Desktop GUI version available as `app_desktop.py`