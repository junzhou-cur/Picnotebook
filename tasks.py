import os
import base64
import json
import requests
import uuid
from datetime import datetime, timezone
from celery import current_task
from celery_app import create_celery_app, make_celery
from models import db, LabNote, Project, ProcessingJob, User

# Create Flask app and Celery instance for tasks
flask_app = create_celery_app()
celery = make_celery(flask_app)

# Initialize database
with flask_app.app_context():
    db.init_app(flask_app)

def update_job_progress(job_id, progress, status=None, result=None, error_message=None):
    """Update processing job progress"""
    try:
        job = ProcessingJob.query.get(job_id)
        if job:
            job.progress = progress
            if status:
                job.status = status
            if result:
                job.result = json.dumps(result) if isinstance(result, dict) else result
            if error_message:
                job.error_message = error_message
            if status == 'processing' and not job.started_at:
                job.started_at = datetime.now(timezone.utc)
            elif status in ['completed', 'failed']:
                job.completed_at = datetime.now(timezone.utc)
            db.session.commit()
    except Exception as e:
        print(f"Error updating job progress: {str(e)}")

def update_project_future_plan(project_id, api_key, new_note_content):
    """Generate and update project future plan based on latest experiment progress"""
    try:
        project = Project.query.get(project_id)
        if not project:
            return False
        
        # Get recent lab notes for context
        recent_notes = LabNote.query.filter_by(project_id=project_id)\
            .order_by(LabNote.created_at.desc()).limit(5).all()
        
        # Build context for AI
        context = f"""Project: {project.name}
Description: {project.description or 'No description'}
Hypothesis: {project.hypothesis or 'No hypothesis'}
Purpose: {project.purpose or 'No purpose'}
Current Progress: {project.current_progress or 'No progress noted'}
Current Future Plan: {project.future_plan or 'No future plan'}

Recent Experiment Notes:
"""
        
        for note in recent_notes:
            context += f"- {note.title}: {note.content[:300]}...\n"
        
        context += f"\nLatest Note Added: {new_note_content[:500]}..."
        
        # AI prompt for future plan generation
        prompt = f"""Based on the project information and recent experimental progress above, generate an updated future plan for this research project.

The future plan should:
1. Build upon current findings and results
2. Address logical next steps based on experimental outcomes
3. Consider potential challenges or needed optimizations
4. Be specific and actionable
5. Be 2-3 paragraphs maximum

Focus on what should be done next given the experimental progress shown in the lab notes.

Context:
{context}

Updated Future Plan:"""

        # Make API call to generate future plan
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': 'grok-beta',
            'messages': [
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'max_tokens': 500,
            'temperature': 0.7
        }
        
        response = requests.post(
            'https://api.x.ai/v1/chat/completions',
            headers=headers,
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            future_plan = result['choices'][0]['message']['content'].strip()
            
            # Update project future plan
            project.future_plan = future_plan
            db.session.commit()
            
            print(f"Updated future plan for project {project_id}")
            return True
        else:
            print(f"Failed to generate future plan: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Error updating project future plan: {str(e)}")
        return False

@celery.task(bind=True)
def process_image_async(self, image_path, api_key, user_id, project_id=None):
    """
    Asynchronously process uploaded image with xAI API
    """
    job_id = self.request.id
    
    try:
        # Update job status
        update_job_progress(job_id, 10, 'processing')
        
        # Read and encode image
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image file not found: {image_path}")
        
        with open(image_path, 'rb') as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')
        
        update_job_progress(job_id, 20)
        
        # Check if using demo mode
        if api_key == "demo-key-for-testing":
            # Demo mode - simulate AI processing with a realistic response
            update_job_progress(job_id, 50)
            
            generated_text = f"""# Lab Note Analysis - {datetime.now().strftime('%Y-%m-%d')}

## Experimental Observations
Based on the handwritten lab notes, the following key points were identified:

**Materials & Methods:**
- Experimental setup appears to focus on molecular biology techniques
- Notes indicate preparation of samples and reagents
- Reference to specific protocols and procedures

**Observations:**
- Multiple experimental conditions were tested
- Results show varying outcomes across different treatment groups
- Data collection includes quantitative measurements

**Key Findings:**
- Preliminary results suggest promising experimental outcomes
- Some variability noted in experimental replicates
- Further optimization may be needed for consistent results

**Next Steps:**
- Repeat experiments with refined protocols
- Increase sample size for statistical significance
- Consider alternative experimental approaches

*Note: This analysis was generated from handwritten lab notes using AI processing.*"""

            update_job_progress(job_id, 70)
            
            # Simulate successful API response format
            result = {
                'choices': [{
                    'message': {
                        'content': generated_text
                    }
                }]
            }
        else:
            # Real API processing
            # Prepare AI prompt
            example = """
# Lab Notebook Entry: Genomic DNA Extraction and PCR Protocol

**Date:** July 16, 2025  
**Experimenter:** [Your Name/Anonymous]  
**Title:** Genomic DNA Extraction from Cell Culture, Followed by PCR, Gel Electrophoresis, and DNA Purification  
**Objective:** Extract genomic DNA from cell culture wells, amplify via PCR, verify product size on gel, and purify for sequencing.  

## Materials
- Cell culture media  
- PBS (Phosphate-Buffered Saline)  
- Genomic DNA extraction buffer  

## Procedure

### 1. Genomic DNA Extraction
- Remove the cell culture media slowly using a 150 μL multichannel pipette.  
- Add PBS to cover the bottom of each well (~100 μL).  

## Observations/Notes
- Ensure gentle pipetting to avoid cell disruption during media removal.  

**Next Steps:** Sequence purified DNA and analyze results.  
**End of Entry**
"""
            
            prompt = f"Transcribe this handwritten lab note image and reorganize it into a structured Markdown lab notebook entry similar to this example: {example}"
            
            update_job_progress(job_id, 30)
            
            # Make API request
            url = "https://api.x.ai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            data = {
                "model": "grok-beta",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                        ]
                    }
                ],
                "temperature": 0.7,
                "max_tokens": 2048
            }
            
            update_job_progress(job_id, 50)
            
            response = requests.post(url, headers=headers, json=data, timeout=120)
            response.raise_for_status()
            result = response.json()
            
            if 'choices' not in result or not result['choices']:
                raise ValueError("No choices in API response")
            
            generated_text = result['choices'][0]['message']['content']
        
        update_job_progress(job_id, 70)
        
        # Auto-classify to project if not specified
        target_project_id = project_id
        auto_classified = False
        
        if not target_project_id:
            target_project_id, auto_classified = classify_note_to_project(generated_text, api_key, user_id)
        
        update_job_progress(job_id, 80)
        
        # Create lab note
        lab_note = LabNote(
            title=extract_title_from_content(generated_text),
            content=generated_text,
            original_image_path=image_path,
            processing_status='completed',
            processing_result=json.dumps(result),
            auto_classified=auto_classified,
            project_id=target_project_id,
            author_id=user_id
        )
        
        db.session.add(lab_note)
        db.session.commit()
        
        update_job_progress(job_id, 90)
        
        # Update project progress
        if target_project_id:
            update_project_progress(target_project_id, generated_text)
        
        # Update future plan based on new note
        if target_project_id:
            try:
                update_project_future_plan(target_project_id, api_key, generated_text)
            except Exception as e:
                print(f"Warning: Failed to update future plan: {str(e)}")
        
        # Final result
        result_data = {
            'lab_note_id': lab_note.id,
            'title': lab_note.title,
            'content': generated_text,
            'project_id': target_project_id,
            'auto_classified': auto_classified
        }
        
        update_job_progress(job_id, 100, 'completed', result_data)
        
        return result_data
        
    except Exception as e:
        error_msg = f"Image processing failed: {str(e)}"
        update_job_progress(job_id, 0, 'failed', None, error_msg)
        raise

def classify_note_to_project(content, api_key, user_id):
    """
    Auto-classify lab note to appropriate project
    Returns (project_id, was_auto_classified)
    """
    try:
        # Get user's projects
        user_projects = Project.query.filter_by(owner_id=user_id).all()
        
        if not user_projects:
            # Create a default project if none exist
            default_project = Project(
                name="General Lab Notes",
                description="Auto-created project for unclassified notes",
                purpose="General research notes and experiments",
                owner_id=user_id
            )
            db.session.add(default_project)
            db.session.commit()
            return default_project.id, True
        
        if len(user_projects) == 1:
            # Only one project, assign to it
            return user_projects[0].id, True
        
        # Build project context for classification
        project_infos = {}
        for project in user_projects:
            project_infos[project.name] = {
                'id': project.id,
                'hypothesis': project.hypothesis or '',
                'purpose': project.purpose or '',
                'current_progress': project.current_progress or ''
            }
        
        # Use AI to classify
        classification_prompt = f"""
Given this lab note:
{content}

And these projects:
{json.dumps(project_infos, indent=2)}

Determine which project this note most likely belongs to based on semantic match to hypothesis, purpose, and progress. Return only the project name if a clear match exists; if ambiguous or no match, return "NONE".
"""
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": "grok-beta",
            "messages": [
                {"role": "user", "content": [{"type": "text", "text": classification_prompt}]}
            ],
            "temperature": 0.5,
            "max_tokens": 100
        }
        
        response = requests.post("https://api.x.ai/v1/chat/completions", headers=headers, json=data, timeout=60)
        response.raise_for_status()
        result = response.json()
        
        matched_project_name = result['choices'][0]['message']['content'].strip()
        
        if matched_project_name in project_infos:
            return project_infos[matched_project_name]['id'], True
        else:
            # Default to first project if no match
            return user_projects[0].id, False
            
    except Exception as e:
        print(f"Classification error: {str(e)}")
        # Return first project as fallback
        return user_projects[0].id if user_projects else None, False

def extract_title_from_content(content):
    """Extract title from markdown content"""
    lines = content.split('\n')
    for line in lines:
        line = line.strip()
        if line.startswith('# '):
            return line[2:].strip()
        elif line.startswith('**Title:**'):
            return line.replace('**Title:**', '').strip()
    
    # Fallback to first non-empty line
    for line in lines:
        line = line.strip()
        if line and not line.startswith('#'):
            return line[:100] + ('...' if len(line) > 100 else '')
    
    return "Lab Note Entry"

def update_project_progress(project_id, note_content):
    """Update project progress with new note summary"""
    try:
        project = Project.query.get(project_id)
        if project:
            current_time = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')
            progress_update = f"\n\n[{current_time}] New lab note added: {extract_title_from_content(note_content)}"
            
            if project.current_progress:
                project.current_progress += progress_update
            else:
                project.current_progress = f"Project started with lab note: {extract_title_from_content(note_content)}"
            
            project.updated_at = datetime.now(timezone.utc)
            db.session.commit()
    except Exception as e:
        print(f"Error updating project progress: {str(e)}")

@celery.task(bind=True)
def generate_project_report_async(self, project_id, api_key, user_id):
    """
    Asynchronously generate comprehensive project report
    """
    job_id = self.request.id
    
    try:
        update_job_progress(job_id, 10, 'processing')
        
        # Get project and verify access
        project = Project.query.get(project_id)
        if not project:
            raise ValueError("Project not found")
        
        if project.owner_id != user_id:
            raise ValueError("Access denied")
        
        update_job_progress(job_id, 20)
        
        # Get all lab notes for the project
        lab_notes = LabNote.query.filter_by(project_id=project_id).order_by(LabNote.created_at).all()
        
        if not lab_notes:
            raise ValueError("No lab notes found for this project")
        
        update_job_progress(job_id, 30)
        
        # Concatenate all notes
        concatenated_notes = ""
        for note in lab_notes:
            concatenated_notes += f"## {note.title}\n\n{note.content}\n\n---\n\n"
        
        update_job_progress(job_id, 50)
        
        # Generate comprehensive report
        summary_prompt = f"""
Project Information:
Name: {project.name}
Hypothesis: {project.hypothesis or 'Not specified'}
Purpose: {project.purpose or 'Not specified'}
Current Progress: {project.current_progress or 'Not specified'}

Lab Notes ({len(lab_notes)} entries):
{concatenated_notes}

Create a comprehensive project report including:
1. Executive Summary
2. Project Overview (hypothesis, purpose, objectives)
3. Methodology and Experiments Summary
4. Key Findings and Results
5. Progress Timeline
6. Conclusions and Next Steps
7. Recommendations

Format as professional markdown report.
"""
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": "grok-beta",
            "messages": [
                {"role": "user", "content": [{"type": "text", "text": summary_prompt}]}
            ],
            "temperature": 0.7,
            "max_tokens": 3000
        }
        
        update_job_progress(job_id, 70)
        
        response = requests.post("https://api.x.ai/v1/chat/completions", headers=headers, json=data, timeout=180)
        response.raise_for_status()
        result = response.json()
        
        report_content = result['choices'][0]['message']['content']
        
        update_job_progress(job_id, 90)
        
        # Save report (you could save to file or database)
        result_data = {
            'project_id': project_id,
            'project_name': project.name,
            'report_content': report_content,
            'note_count': len(lab_notes),
            'generated_at': datetime.now(timezone.utc).isoformat()
        }
        
        update_job_progress(job_id, 100, 'completed', result_data)
        
        return result_data
        
    except Exception as e:
        error_msg = f"Report generation failed: {str(e)}"
        update_job_progress(job_id, 0, 'failed', None, error_msg)
        raise

@celery.task
def cleanup_old_uploads():
    """Clean up old upload files"""
    try:
        upload_dir = 'uploads'
        if os.path.exists(upload_dir):
            current_time = datetime.now(timezone.utc).timestamp()
            for filename in os.listdir(upload_dir):
                file_path = os.path.join(upload_dir, filename)
                if os.path.isfile(file_path):
                    file_age = current_time - os.path.getmtime(file_path)
                    # Delete files older than 24 hours
                    if file_age > 86400:
                        os.remove(file_path)
                        print(f"Cleaned up old upload: {filename}")
    except Exception as e:
        print(f"Cleanup error: {str(e)}")

# Periodic tasks can be configured here
from celery.schedules import crontab

celery.conf.beat_schedule = {
    'cleanup-uploads': {
        'task': 'tasks.cleanup_old_uploads',
        'schedule': crontab(hour=2, minute=0),  # Run daily at 2 AM
    },
}