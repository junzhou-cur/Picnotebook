"""
Mock Experiment Record Generation API for Testing
Provides simplified endpoints for testing the frontend integration
"""

from flask import Flask, request, jsonify, send_file, make_response
from flask_cors import CORS
import json
import logging
import os
import shutil
import subprocess
from datetime import datetime
from werkzeug.utils import secure_filename
import uuid
import time
import random
import sqlite3
import zipfile
from io import BytesIO

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:3002", "http://127.0.0.1:3000", "http://127.0.0.1:3002", "http://0.0.0.0:3002", "https://picnotebook.com"])

# Configuration
UPLOAD_FOLDER = 'uploads'
IMAGE_FOLDER = os.path.join(UPLOAD_FOLDER, 'images')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'tiff', 'bmp', 'gif'}

# Create upload directories
os.makedirs(IMAGE_FOLDER, exist_ok=True)

# Mock data for testing
MOCK_RECORDS = {}

# Authentication endpoints
@app.route('/login', methods=['POST'])
@app.route('/auth/api/login', methods=['POST'])
def login():
    """Mock login endpoint"""
    data = request.get_json()
    username = data.get('username', '') or data.get('email', '')
    password = data.get('password', '')
    
    # Accept any credentials for testing
    if username and password:
        token = f'mock_token_{uuid.uuid4().hex[:8]}'
        # Extract user information from email
        email = username if '@' in username else f'{username}@test.com'
        username_part = username.split('@')[0]
        
        # Create a proper user profile based on email
        if email == 'junzhou@umich.edu':
            first_name = 'Jun'
            last_name = 'Zhou'
            role = 'researcher'
        else:
            # For other users, try to extract name from username or use default
            if '.' in username_part:
                name_parts = username_part.split('.')
                first_name = name_parts[0].capitalize()
                last_name = name_parts[1].capitalize() if len(name_parts) > 1 else 'User'
            else:
                first_name = username_part.capitalize()
                last_name = 'User'
            role = 'researcher'
        
        return jsonify({
            'success': True,
            'access_token': token,
            'refresh_token': f'refresh_{token}',
            'user': {
                'id': 1,
                'username': username_part,
                'email': email,
                'first_name': first_name,
                'last_name': last_name,
                'role': role,
                'full_name': f'{first_name} {last_name}'
            }
        }), 200
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

# Google OAuth endpoints
@app.route('/auth/google/login', methods=['POST'])
def google_login():
    """Mock Google OAuth login endpoint"""
    data = request.get_json()
    google_token = data.get('token', '')
    google_id = data.get('google_id', '')
    email = data.get('email', '')
    name = data.get('name', '')
    
    # Mock Google OAuth validation - in production, validate token with Google
    if google_token and email:
        token = f'mock_token_{uuid.uuid4().hex[:8]}'
        
        # Extract names
        name_parts = name.split(' ') if name else email.split('@')[0].split('.')
        first_name = name_parts[0].capitalize() if name_parts else 'User'
        last_name = ' '.join(name_parts[1:]).capitalize() if len(name_parts) > 1 else 'Google'
        
        return jsonify({
            'success': True,
            'access_token': token,
            'refresh_token': f'refresh_{token}',
            'user': {
                'id': hash(email) % 10000,  # Generate consistent ID from email
                'username': email.split('@')[0],
                'email': email,
                'first_name': first_name,
                'last_name': last_name,
                'role': 'researcher',
                'full_name': f'{first_name} {last_name}',
                'google_id': google_id,
                'provider': 'google'
            }
        }), 200
    else:
        return jsonify({'success': False, 'message': 'Invalid Google token'}), 401

@app.route('/auth/google/callback', methods=['GET', 'POST'])
def google_callback():
    """Mock Google OAuth callback endpoint"""
    # In production, this would handle the OAuth callback from Google
    # For mock purposes, we'll just return a success message
    code = request.args.get('code', '')
    if code:
        return jsonify({
            'message': 'Google OAuth callback received',
            'code': code,
            'redirect_to': '/dashboard'
        }), 200
    else:
        return jsonify({'error': 'No authorization code provided'}), 400

@app.route('/register', methods=['POST'])
@app.route('/auth/api/register', methods=['POST'])
def register():
    """Mock registration endpoint"""
    data = request.get_json()
    username = data.get('username', '')
    email = data.get('email', '')
    password = data.get('password', '')
    
    if username and email and password:
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'user': {
                'id': 1,
                'username': username,
                'email': email
            }
        }), 201
    else:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400

@app.route('/user', methods=['GET'])
def get_user():
    """Mock get user endpoint"""
    return jsonify({
        'id': 1,
        'username': 'testuser',
        'email': 'testuser@test.com',
        'role': 'researcher'
    }), 200

@app.route('/generate_experiment_record', methods=['POST'])
def generate_experiment_record():
    """
    Mock experiment record generation
    """
    try:
        # Simulate processing time
        time.sleep(2)
        
        # Check if file was uploaded
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        researcher = request.form.get('researcher', 'Unknown')
        project_hint = request.form.get('project_hint', '')
        
        # Save the original image file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        saved_filename = f"{timestamp}_{filename}"
        image_path = os.path.join(IMAGE_FOLDER, saved_filename)
        
        try:
            file.save(image_path)
            logger.info(f"Saved original image: {image_path}")
        except Exception as e:
            logger.error(f"Failed to save image: {e}")
            return jsonify({'error': f'Failed to save image: {str(e)}'}), 500
        
        # Generate mock record
        record_id = f"EXP_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6].upper()}"
        
        # Mock project classification based on filename
        filename = file.filename.lower()
        if 'cf' in filename or 'cftr' in filename:
            project_code = 'CF1282'
            project_name = 'CFTR W1282X Prime Editing'
            category = 'gene_editing'
            confidence = 0.95
        elif 'cgbe' in filename or 'base' in filename:
            project_code = 'MizCGBE'
            project_name = 'Miniaturized Cytosine Base Editor'
            category = 'gene_editing'
            confidence = 0.88
        elif 'apoc' in filename or 'lipid' in filename:
            project_code = 'APOC3'
            project_name = 'APOC3 Gene Silencing Therapy'
            category = 'therapy'
            confidence = 0.92
        else:
            project_code = 'GENERAL'
            project_name = 'General Lab Research'
            category = 'analysis'
            confidence = 0.65
        
        # Mock experiment record
        experiment_record = {
            'record_id': record_id,
            'experiment_id': f'{project_code}-{datetime.now().strftime("%Y%m%d")}-001',
            'title': f'{project_name} - Experiment {random.randint(1, 999)}',
            'date': datetime.now().strftime('%Y-%m-%d'),
            'researcher': researcher,
            'project_code': project_code,
            'project_name': project_name,
            'project_category': category,
            'confidence_score': confidence,
            'objective': f'Test the effectiveness of {project_name} approach under controlled conditions.',
            'methods': 'Standard laboratory protocols were followed. Sample preparation included buffer optimization and temperature control.',
            'results': f'Preliminary results show {random.randint(50, 95)}% efficiency. Further analysis required.',
            'observations': 'Sample exhibited expected behavior. No unexpected reactions observed.',
            'conclusions': 'Results are promising and warrant further investigation.',
            'measurements': [
                {
                    'type': 'temperature',
                    'value': str(random.randint(20, 37)),
                    'unit': '°C',
                    'confidence': 0.9,
                    'context': 'Incubation temperature'
                },
                {
                    'type': 'ph',
                    'value': str(round(random.uniform(6.5, 8.0), 1)),
                    'unit': '',
                    'confidence': 0.85,
                    'context': 'Buffer pH'
                },
                {
                    'type': 'time',
                    'value': str(random.randint(30, 120)),
                    'unit': 'min',
                    'confidence': 0.92,
                    'context': 'Reaction time'
                }
            ],
            'tables_detected': random.randint(0, 2),
            'charts_available': random.randint(0, 1),
            'original_filename': filename,
            'saved_image_path': image_path,
            'saved_filename': saved_filename,
            'processing_timestamp': datetime.now().isoformat(),
            'raw_text': f'Mock extracted text from {file.filename}. This would contain the OCR results.',
            'ocr_confidence': random.randint(75, 95),
            'needs_review': confidence < 0.8 or random.choice([True, False]),
            'review_status': 'pending'
        }
        
        # Store mock record
        MOCK_RECORDS[record_id] = experiment_record
        
        result = {
            'success': True,
            'record_id': record_id,
            'experiment_record': experiment_record,
            'processing_summary': {
                'ocr_confidence': experiment_record['ocr_confidence'],
                'tables_detected': experiment_record['tables_detected'],
                'charts_available': experiment_record['charts_available'],
                'project_classification': {
                    'code': project_code,
                    'name': project_name,
                    'category': category,
                    'confidence': confidence
                },
                'needs_review': experiment_record['needs_review'],
                'extracted_measurements': len(experiment_record['measurements'])
            }
        }
        
        logger.info(f"Generated mock experiment record: {record_id}")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Mock experiment record generation failed: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/experiment_record/<record_id>', methods=['GET'])
def get_experiment_record(record_id):
    """
    Retrieve experiment record by ID
    """
    try:
        if record_id in MOCK_RECORDS:
            return jsonify({
                'success': True,
                'record': MOCK_RECORDS[record_id]
            })
        else:
            return jsonify({'error': 'Record not found'}), 404
            
    except Exception as e:
        logger.error(f"Failed to retrieve record {record_id}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/experiment_record/<record_id>', methods=['PUT'])
def update_experiment_record(record_id):
    """
    Update experiment record with corrections
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        if record_id not in MOCK_RECORDS:
            return jsonify({'error': 'Record not found'}), 404
        
        reviewer = data.get('reviewer', 'Unknown')
        updates = data.get('updates', {})
        
        if not updates:
            return jsonify({'error': 'No updates provided'}), 400
        
        # Update the record
        record = MOCK_RECORDS[record_id]
        for field, value in updates.items():
            if field in record:
                record[field] = value
        
        record['reviewed_by'] = reviewer
        record['reviewed_at'] = datetime.now().isoformat()
        record['review_status'] = 'approved'
        
        return jsonify({
            'success': True,
            'message': 'Record updated successfully',
            'record': record
        })
        
    except Exception as e:
        logger.error(f"Failed to update record {record_id}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/experiment_records/pending', methods=['GET'])
def get_pending_records():
    """
    Get experiment records that need review
    """
    try:
        pending_records = []
        for record_id, record in MOCK_RECORDS.items():
            if record.get('needs_review', False) or record.get('review_status') == 'pending':
                pending_records.append({
                    'record_id': record_id,
                    'title': record['title'],
                    'project_code': record['project_code'],
                    'project_name': record['project_name'],
                    'researcher': record['researcher'],
                    'date': record['date'],
                    'ocr_confidence': record['ocr_confidence'],
                    'needs_review': record['needs_review'],
                    'processing_timestamp': record['processing_timestamp']
                })
        
        return jsonify({
            'success': True,
            'pending_count': len(pending_records),
            'records': pending_records
        })
        
    except Exception as e:
        logger.error(f"Failed to get pending records: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/experiment_image/<record_id>', methods=['GET'])
def get_experiment_image(record_id):
    """
    Serve the original image file for an experiment record
    """
    try:
        if record_id not in MOCK_RECORDS:
            return jsonify({'error': 'Record not found'}), 404
        
        record = MOCK_RECORDS[record_id]
        image_path = record.get('saved_image_path')
        
        if not image_path or not os.path.exists(image_path):
            return jsonify({'error': 'Image file not found'}), 404
        
        return send_file(image_path, as_attachment=False)
        
    except Exception as e:
        logger.error(f"Failed to serve image for record {record_id}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/images/<filename>', methods=['GET'])
def serve_image(filename):
    """
    Serve image files directly by filename
    """
    try:
        image_path = os.path.join(IMAGE_FOLDER, filename)
        
        if not os.path.exists(image_path):
            return jsonify({'error': 'Image not found'}), 404
        
        return send_file(image_path, as_attachment=False)
        
    except Exception as e:
        logger.error(f"Failed to serve image {filename}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/lab_records', methods=['GET'])
def get_lab_records():
    """
    Get all lab records from the database
    """
    try:
        # Connect to the SQLite database
        db_path = '/Users/zhoujun/Desktop/Claude/picnotebook/instance/lab_notebook.db'
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Query all lab notes
        cursor.execute("""
            SELECT id, title, content, created_at, project_id
            FROM lab_notes
            ORDER BY created_at DESC
        """)
        
        notes = []
        for row in cursor.fetchall():
            note = dict(row)
            
            # Extract experiment codes from content as tags
            content = note.get('content', '')
            tags = []
            
            # Look for experiment codes like P.ATB1, P.CF05, etc.
            import re
            pattern = r'P\.[A-Z0-9]+'
            matches = re.findall(pattern, content)
            tags = list(set(matches))  # Remove duplicates
            
            # Create a preview (first 150 characters)
            preview = content[:150] + '...' if len(content) > 150 else content
            # Clean up the preview by removing markdown and extra whitespace
            preview = re.sub(r'[#*`]', '', preview)
            preview = ' '.join(preview.split())
            
            notes.append({
                'id': note['id'],
                'title': note['title'] or f"Lab Note - {note['created_at'][:10]}",
                'content': content,
                'created_at': note['created_at'],
                'project_id': note['project_id'],
                'tags': tags,
                'preview': preview
            })
        
        conn.close()
        
        return jsonify(notes)
        
    except Exception as e:
        logger.error(f"Failed to get lab records: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/detected_tables', methods=['GET'])
def get_detected_tables():
    """
    Get detected tables from lab notes
    """
    try:
        # For now, return mock data since we don't have actual table detection yet
        # In production, this would query a tables database
        tables = [
            {
                'id': 1,
                'note_id': 2,
                'note_title': 'Lab Note - 2025-08-03 19:54',
                'table_data': [
                    ['Sample', 'Concentration', 'pH', 'Temperature'],
                    ['A1', '500 ng/mL', '7.4', '37°C'],
                    ['A2', '250 ng/mL', '7.2', '37°C'],
                    ['Control', '0 ng/mL', '7.0', '25°C']
                ],
                'headers': ['Sample', 'Concentration', 'pH', 'Temperature'],
                'created_at': '2025-08-03T23:54:53.451205',
                'confidence': 0.92,
                'rows': 4,
                'columns': 4,
                'description': 'Heparin sodium concentration measurements'
            },
            {
                'id': 2,
                'note_id': 3,
                'note_title': 'Lab Note - 2025-08-03 21:09',
                'table_data': [
                    ['Time (min)', 'Absorbance', 'Concentration'],
                    ['0', '0.000', '0'],
                    ['15', '0.245', '12.3'],
                    ['30', '0.489', '24.5'],
                    ['60', '0.923', '46.2']
                ],
                'headers': ['Time (min)', 'Absorbance', 'Concentration'],
                'created_at': '2025-08-04T01:09:44.016820',
                'confidence': 0.88,
                'rows': 5,
                'columns': 3,
                'description': 'Time-course absorbance measurements'
            },
            {
                'id': 3,
                'note_id': 4,
                'note_title': 'Lab Note - 2025-08-03 22:30',
                'table_data': [
                    ['Sample ID', 'Cell Count', 'Viability (%)', 'Notes'],
                    ['ATLAS-001', '2.3×10⁶', '95', 'Good morphology'],
                    ['ATLAS-002', '1.8×10⁶', '92', 'Some debris'],
                    ['ATLAS-003', '2.1×10⁶', '94', 'Excellent']
                ],
                'headers': ['Sample ID', 'Cell Count', 'Viability (%)', 'Notes'],
                'created_at': '2025-08-04T02:30:30.053466',
                'confidence': 0.95,
                'rows': 4,
                'columns': 4,
                'description': 'Cell viability assessment'
            }
        ]
        
        return jsonify(tables)
        
    except Exception as e:
        logger.error(f"Failed to get detected tables: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/generated_charts', methods=['GET'])
def get_generated_charts():
    """
    Get generated charts from lab notes
    """
    try:
        # For now, return mock data
        # In production, this would query a charts database
        charts = [
            {
                'id': 1,
                'note_id': 2,
                'note_title': 'Lab Note - 2025-08-03 19:54',
                'chart_type': 'line',
                'chart_data': {
                    'labels': ['0 min', '15 min', '30 min', '45 min', '60 min', '90 min', '120 min'],
                    'datasets': [{
                        'label': 'pH Level',
                        'data': [7.4, 7.35, 7.32, 7.28, 7.25, 7.22, 7.20],
                        'borderColor': '#3B82F6',
                        'backgroundColor': 'rgba(59, 130, 246, 0.1)'
                    }]
                },
                'title': 'pH Change Over Time',
                'description': 'pH monitoring during heparin sodium treatment',
                'created_at': '2025-08-03T23:54:53.451205',
                'data_points': 7
            },
            {
                'id': 2,
                'note_id': 3,
                'note_title': 'Lab Note - 2025-08-03 21:09',
                'chart_type': 'bar',
                'chart_data': {
                    'labels': ['Sample A', 'Sample B', 'Sample C', 'Control'],
                    'datasets': [{
                        'label': 'Absorbance at 280nm',
                        'data': [0.923, 0.845, 0.756, 0.123],
                        'backgroundColor': ['#10B981', '#3B82F6', '#8B5CF6', '#6B7280']
                    }]
                },
                'title': 'Protein Concentration Analysis',
                'description': 'Absorbance measurements for protein quantification',
                'created_at': '2025-08-04T01:09:44.016820',
                'data_points': 4
            },
            {
                'id': 3,
                'note_id': 4,
                'note_title': 'Lab Note - 2025-08-03 22:30',
                'chart_type': 'pie',
                'chart_data': {
                    'labels': ['Viable Cells', 'Dead Cells', 'Debris'],
                    'datasets': [{
                        'label': 'Cell Distribution',
                        'data': [94, 4, 2],
                        'backgroundColor': ['#10B981', '#EF4444', '#FCD34D']
                    }]
                },
                'title': 'Cell Viability Distribution',
                'description': 'Cell viability assessment for ATLAS samples',
                'created_at': '2025-08-04T02:30:30.053466',
                'data_points': 3
            }
        ]
        
        return jsonify(charts)
        
    except Exception as e:
        logger.error(f"Failed to get generated charts: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/ngs_sequences', methods=['GET'])
def get_ngs_sequences():
    """
    Get saved NGS sequences from database
    """
    try:
        # Connect to sequences database
        conn = sqlite3.connect('sequences.db')
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("SELECT output_name, amplicon_seq, sgRNA FROM sequences")
        sequences = []
        for row in cursor.fetchall():
            sequences.append(dict(row))
        
        conn.close()
        return jsonify(sequences)
        
    except Exception as e:
        logger.error(f"Failed to get NGS sequences: {e}")
        # Return mock data if database fails
        return jsonify([
            {
                'output_name': 'CF1282_PE_001',
                'amplicon_seq': 'ATGGCTAGCGGCACTGCGGCTGGAGGTGGAGATCGACTTCCGCAGCAACGAG',
                'sgRNA': 'GGCACTGCGGCTGGAGGTGG'
            },
            {
                'output_name': 'APOC3_BE_002',
                'amplicon_seq': 'CTGGACGAGCTGTACAAGTCCGGACTCAGATCTCGAGCTCAAGCTTCGAAT',
                'sgRNA': 'TCCGGACTCAGATCTCGAGC'
            }
        ])

@app.route('/save_ngs_sequence', methods=['POST'])
def save_ngs_sequence():
    """
    Save NGS sequence to database
    """
    try:
        data = request.get_json()
        output_name = data.get('output_name')
        amplicon_seq = data.get('amplicon_seq')
        sgRNA = data.get('sgRNA')
        
        if not all([output_name, amplicon_seq, sgRNA]):
            return jsonify({'error': 'All fields are required'}), 400
        
        # Connect to sequences database
        conn = sqlite3.connect('sequences.db')
        cursor = conn.cursor()
        
        # Create table if it doesn't exist
        cursor.execute('''CREATE TABLE IF NOT EXISTS sequences
                         (output_name TEXT PRIMARY KEY, amplicon_seq TEXT, sgRNA TEXT)''')
        
        # Insert or replace sequence
        cursor.execute("INSERT OR REPLACE INTO sequences (output_name, amplicon_seq, sgRNA) VALUES (?, ?, ?)",
                      (output_name, amplicon_seq, sgRNA))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Sequence saved successfully'})
        
    except Exception as e:
        logger.error(f"Failed to save NGS sequence: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/analyze_ngs', methods=['POST'])
def analyze_ngs():
    """
    Run NGS analysis using miseq.py
    """
    try:
        # Get uploaded files
        fastq_files = []
        for key in request.files:
            if key.startswith('fastq_'):
                fastq_files.append(request.files[key])
        
        excel_file = request.files.get('excel_file')
        if not excel_file:
            return jsonify({'error': 'Excel file is required'}), 400
        
        if len(fastq_files) == 0:
            return jsonify({'error': 'At least one FASTQ file is required'}), 400
        
        # Get parameters
        window_center = int(request.form.get('window_center', -10))
        window_size = int(request.form.get('window_size', 20))
        num_processes = int(request.form.get('num_processes', 4))
        base_editor_output = request.form.get('base_editor_output', 'true').lower() == 'true'
        
        # Create output directory on Desktop
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        desktop_path = os.path.expanduser('~/Desktop')
        output_dir = os.path.join(desktop_path, f'NGS_Analysis_{timestamp}')
        os.makedirs(output_dir, exist_ok=True)
        logger.info(f"Created output directory: {output_dir}")
        
        # Save uploaded files to output directory
        fastq_paths = []
        for i, fastq_file in enumerate(fastq_files):
            filename = secure_filename(fastq_file.filename)
            path = os.path.join(output_dir, filename)
            fastq_file.save(path)
            fastq_paths.append(path)
            logger.info(f"Saved FASTQ file: {filename}")
        
        excel_filename = secure_filename(excel_file.filename)
        excel_path = os.path.join(output_dir, excel_filename)
        excel_file.save(excel_path)
        logger.info(f"Saved Excel file: {excel_filename}")
        
        # Read Excel file to get sample information
        try:
            import pandas as pd
            df = pd.read_excel(excel_path)
            logger.info(f"Excel columns: {df.columns.tolist()}")
            
            if 'OutputName' not in df.columns or 'SampleNames' not in df.columns:
                return jsonify({'error': 'Excel must have OutputName and SampleNames columns'}), 400
            
            # Get output name and sample names
            output_name = df['OutputName'].iloc[0] if len(df) > 0 else f'NGS_Analysis_{timestamp}'
            sample_names = df['SampleNames'].tolist()
            
            logger.info(f"Output name: {output_name}")
            logger.info(f"Sample names: {sample_names}")
            
            if len(sample_names) != len(fastq_files):
                return jsonify({'error': f'Number of sample names ({len(sample_names)}) must match number of FASTQ files ({len(fastq_files)})'})
            
        except Exception as e:
            logger.error(f"Error reading Excel file: {e}")
            return jsonify({'error': f'Error reading Excel file: {str(e)}'}), 400
        
        # Try to get amplicon and sgRNA from database or use defaults for CF1282
        try:
            conn = sqlite3.connect('sequences.db')
            cursor = conn.cursor()
            
            # Create table if it doesn't exist
            cursor.execute('''CREATE TABLE IF NOT EXISTS sequences 
                             (output_name TEXT PRIMARY KEY, amplicon_seq TEXT, sgRNA TEXT)''')
            
            # Insert default CF1282 sequence if not exists
            default_amplicon = "GGGAAGAACTGGATCAGGGAAGAGTACTTTGTTATCAGCTTTTTTGAGACTACTGAACACTGAAGGAGAAATCCAGATCGATGGTGTGTCTTGGGATTCAATAACTTTGCAACAGTGGAGGAAAGCCTTTGGAGTGATACCACAGGTGAGCAAAAGGACTTAGCCAGAAAAAAGGCAACTAAATTATATTTTTTACTGCTATTTGATACTTGTACTCAAGAAATTCATATTACTCTGCAAAATATATTTGTTATGCATTGCTGTCTTTTTTCTCCAGTGCAGTTTTCTCATAGGC"
            default_sgRNA = "CAATAACTTTGCAACAGTGG"
            cursor.execute('INSERT OR IGNORE INTO sequences (output_name, amplicon_seq, sgRNA) VALUES (?, ?, ?)', 
                          ('CF1282', default_amplicon, default_sgRNA))
            conn.commit()
            
            cursor.execute("SELECT amplicon_seq, sgRNA FROM sequences WHERE output_name LIKE ?", (f"{output_name[:4]}%",))
            result = cursor.fetchone()
            conn.close()
            
            if not result:
                logger.warning(f"No sequences found for output name prefix: {output_name[:4]}")
                # Use default CF1282 sequences as fallback
                amplicon_seq = default_amplicon
                sgRNA = default_sgRNA
                logger.info("Using default CF1282 sequences as fallback")
            else:
                amplicon_seq, sgRNA = result
                logger.info(f"Found sequences - Amplicon: {amplicon_seq[:50]}..., sgRNA: {sgRNA}")
            
        except Exception as e:
            logger.error(f"Database error: {e}")
            # Use default CF1282 sequences as fallback
            amplicon_seq = "GGGAAGAACTGGATCAGGGAAGAGTACTTTGTTATCAGCTTTTTTGAGACTACTGAACACTGAAGGAGAAATCCAGATCGATGGTGTGTCTTGGGATTCAATAACTTTGCAACAGTGGAGGAAAGCCTTTGGAGTGATACCACAGGTGAGCAAAAGGACTTAGCCAGAAAAAAGGCAACTAAATTATATTTTTTACTGCTATTTGATACTTGTACTCAAGAAATTCATATTACTCTGCAAAATATATTTGTTATGCATTGCTGTCTTTTTTCTCCAGTGCAGTTTTCTCATAGGC"
            sgRNA = "CAATAACTTTGCAACAGTGG"
            logger.info("Using default CF1282 sequences due to database error")
        
        # Now run the complete NGS analysis workflow
        logger.info("Starting complete NGS analysis workflow...")
        
        try:
            # Save files to Desktop folder using gene name
            desktop_path = os.path.expanduser('~/Desktop')
            gene_folder = os.path.join(desktop_path, output_name)
            os.makedirs(gene_folder, exist_ok=True)
            
            # Copy FASTQ files to gene folder
            for fastq_file in fastq_files:
                filename = secure_filename(fastq_file.filename)
                dest_path = os.path.join(gene_folder, filename)
                fastq_file.save(dest_path)
                logger.info(f"Saved FASTQ file: {filename}")
            
            # Create batch.txt file
            batch_file = os.path.join(gene_folder, 'batch.txt')
            with open(batch_file, 'w') as f:
                f.write("# CRISPResso Batch File\n")
                for sample_name in sample_names:
                    f.write(f"{sample_name}\t{sample_name}.fastq.gz\n")
            
            # Create preprocessing script
            preprocessing_file = os.path.join(gene_folder, 'pre_processing_NGS_data_SE.txt')
            with open(preprocessing_file, 'w') as f:
                f.write("#!/bin/bash\n")
                f.write("# HX-Miseq data analysis protocol\n")
                f.write("# Quality check with fastqc\n")
                f.write(f"for FILE in ~/{gene_folder}/*.fastq.gz; do\n")
                f.write("  fastqc $FILE\n")
                f.write("done\n")
                f.write("# Adapter trimming\n")
                f.write("for FILE in *.fastq.gz; do\n")
                f.write(f"  cutadapt -a AGATCGGAAG -o ~/{gene_folder}/CA_$FILE $FILE\n")
                f.write("done\n")
                f.write(f"cd ~/{gene_folder}\n")
                f.write("# Quality trimming\n")
                f.write("for file in CA*.gz; do\n")
                f.write("  Trimmomatic SE -phred33 $file TriSE_$file LEADING:3 TRAILING:3 SLIDINGWINDOW:4:15 MINLEN:30 -threads 16\n")
                f.write("done\n")
            
            # Run the actual analysis commands
            logger.info("Running CRISPResso analysis...")
            
            # Run CRISPResso directly as we know it works
            crispresso_cmd = [
                "/opt/anaconda3/bin/conda", "run", "-n", "osx64_env",
                "CRISPRessoBatch", 
                "--batch_settings", "batch.txt",
                "--amplicon_seq", amplicon_seq,
                "-g", sgRNA,
                "-p", str(num_processes),
                "--base_editor_output",
                "-wc", str(window_center),
                "-w", str(window_size)
            ]
            
            crispresso_result = subprocess.run(
                crispresso_cmd,
                cwd=gene_folder,
                capture_output=True,
                text=True,
                timeout=1800  # 30 minutes
            )
            
            if crispresso_result.returncode == 0:
                logger.info("CRISPResso analysis completed successfully!")
                
                # Copy analysis script
                try:
                    analysis_script_src = "/Users/zhoujun/Desktop/Miseq/General/NEW_analyze_crispresso_output.py"
                    crispresso_output_dir = os.path.join(gene_folder, "CRISPRessoBatch_on_batch")
                    if os.path.exists(analysis_script_src) and os.path.exists(crispresso_output_dir):
                        analysis_script_dest = os.path.join(crispresso_output_dir, "NEW_analyze_crispresso_output.py")
                        shutil.copy(analysis_script_src, analysis_script_dest)
                        logger.info("Copied NEW_analyze_crispresso_output.py")
                except Exception as e:
                    logger.warning(f"Could not copy analysis script: {e}")
                
                result = {
                    'success': True,
                    'message': 'Complete NGS analysis workflow completed successfully',
                    'output_path': gene_folder,
                    'pipeline_used': 'complete_crispresso_analysis',
                    'files_processed': len(fastq_files),
                    'crispresso_completed': True,
                    'analysis_output': crispresso_result.stdout[:1000] if crispresso_result.stdout else "Analysis completed"
                }
            else:
                logger.error(f"CRISPResso failed: {crispresso_result.stderr}")
                result = {
                    'success': False,
                    'message': f'CRISPResso analysis failed: {crispresso_result.stderr[:500]}',
                    'output_path': gene_folder,
                    'pipeline_used': 'manual_setup_only',
                    'files_processed': len(fastq_files),
                    'crispresso_completed': False
                }
            
            
            # Use result from safe analysis
            analysis_results = {
                'success': result['success'],
                'message': result['message'],
                'output_path': result['output_path'],
                'pipeline_used': result['pipeline_used'],
                'files_processed': result['files_processed'],
                'parameters': {
                    'window_center': window_center,
                    'window_size': window_size,
                    'num_processes': num_processes,
                    'base_editor_output': base_editor_output
                },
                'sequences': {
                    'amplicon': amplicon_seq,
                    'sgRNA': sgRNA
                },
                'sample_names': sample_names
            }
            
            # Add additional info if available
            if 'conda_available' in result:
                analysis_results['conda_available'] = result['conda_available']
            if 'instructions' in result:
                analysis_results['instructions_file'] = result['instructions']
            if 'batch_file' in result:
                analysis_results['batch_file'] = result['batch_file']
            
            return jsonify(analysis_results)
            
        except ImportError as e:
            logger.error(f"Could not import miseq: {e}")
            # Fall back to basic file processing without full analysis
            return jsonify({
                'success': False,
                'error': 'NGS analysis tools not available. Files saved for manual processing.',
                'output_path': output_dir,
                'message': 'FASTQ and Excel files have been saved to the output directory for manual analysis.',
                'files_saved': [os.path.basename(p) for p in fastq_paths] + [excel_filename]
            })
            
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            logger.error(f"Analysis failed: {e}")
            logger.error(f"Full traceback: {error_details}")
            return jsonify({
                'success': False,
                'error': f'Analysis failed: {str(e)}',
                'error_details': error_details,
                'output_path': output_dir,
                'message': 'Files saved but analysis encountered an error.'
            }), 500
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logger.error(f"Failed to run NGS analysis: {e}")
        logger.error(f"Full traceback: {error_details}")
        return jsonify({
            'error': str(e),
            'error_details': error_details
        }), 500

# Security configuration for bash commands
ALLOWED_COMMANDS = {
    'ls', 'pwd', 'whoami', 'date', 'echo', 'cat', 'head', 'tail', 'wc', 'grep',
    'find', 'which', 'ps', 'top', 'df', 'du', 'free', 'uptime', 'uname',
    'git', 'python', 'pip', 'npm', 'node', 'conda', 'jupyter', 'fastqc',
    'mkdir', 'touch', 'cp', 'mv', 'chmod', 'chown', '/opt/anaconda3/bin/conda',
    'CRISPResso', 'CRISPRessoBatch', 'cutadapt', 'trimmomatic', 'gunzip', 'gzip',
    'unzip', 'tar', 'curl', 'wget', 'cd'
}

FORBIDDEN_PATTERNS = [
    'rm', 'del', 'format', 'fdisk', 'mkfs', 'dd', 'kill', 'killall',
    'shutdown', 'reboot', 'halt', 'init', 'passwd', 'sudo', 'su',
    '>', '>>', '|', ';', '||', '`', '$('
]

def is_command_safe(command):
    """Check if a command is safe to execute"""
    command_lower = command.lower().strip()
    
    # Check for forbidden patterns (word boundaries to avoid false positives)
    import re
    for pattern in FORBIDDEN_PATTERNS:
        # Use word boundaries for dangerous commands, but exact match for operators
        if pattern in ['>', '>>', '|', ';', '||', '`', '$(']:
            if pattern in command_lower:
                return False, f"Forbidden pattern detected: {pattern}"
        else:
            # Use word boundaries for command names to avoid false positives
            if re.search(r'\b' + re.escape(pattern) + r'\b', command_lower):
                return False, f"Forbidden pattern detected: {pattern}"
    
    # Extract base command (first word)
    base_command = command_lower.split()[0] if command_lower.split() else ""
    
    # Check if base command is in allowed list
    if base_command not in ALLOWED_COMMANDS:
        return False, f"Command not allowed: {base_command}"
    
    return True, "Command is safe"

@app.route('/execute_command', methods=['POST'])
def execute_command():
    """Execute bash commands with security restrictions"""
    try:
        data = request.get_json()
        if not data or 'command' not in data:
            return jsonify({'error': 'No command provided'}), 400
        
        command = data['command'].strip()
        if not command:
            return jsonify({'error': 'Empty command'}), 400
        
        # Security check
        is_safe, message = is_command_safe(command)
        if not is_safe:
            return jsonify({
                'error': f'Security violation: {message}',
                'command': command,
                'allowed_commands': list(ALLOWED_COMMANDS)
            }), 403
        
        # Set working directory (default to project root)
        working_dir = data.get('working_dir', '/Users/zhoujun/Desktop/Claude/picnotebook')
        if not os.path.exists(working_dir):
            working_dir = '/Users/zhoujun/Desktop/Claude/picnotebook'
        
        # Execute command with timeout
        start_time = time.time()
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=30,  # 30 second timeout
                cwd=working_dir
            )
            
            execution_time = time.time() - start_time
            
            response = {
                'success': True,
                'command': command,
                'working_dir': working_dir,
                'return_code': result.returncode,
                'stdout': result.stdout,
                'stderr': result.stderr,
                'execution_time': round(execution_time, 3),
                'timestamp': datetime.now().isoformat()
            }
            
            logger.info(f"Executed command: {command} (return code: {result.returncode})")
            return jsonify(response)
            
        except subprocess.TimeoutExpired:
            return jsonify({
                'error': 'Command timed out (30s limit)',
                'command': command,
                'working_dir': working_dir
            }), 408
            
        except Exception as e:
            logger.error(f"Command execution failed: {e}")
            return jsonify({
                'error': f'Execution failed: {str(e)}',
                'command': command,
                'working_dir': working_dir
            }), 500
            
    except Exception as e:
        logger.error(f"Failed to execute command: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/get_working_directory', methods=['GET'])
def get_working_directory():
    """Get current working directory and list contents"""
    try:
        cwd = os.getcwd()
        contents = []
        
        try:
            for item in os.listdir(cwd):
                item_path = os.path.join(cwd, item)
                is_dir = os.path.isdir(item_path)
                size = os.path.getsize(item_path) if not is_dir else None
                contents.append({
                    'name': item,
                    'type': 'directory' if is_dir else 'file',
                    'size': size
                })
        except PermissionError:
            contents = [{'error': 'Permission denied'}]
        
        return jsonify({
            'current_directory': cwd,
            'contents': contents,
            'allowed_commands': list(ALLOWED_COMMANDS)
        })
        
    except Exception as e:
        logger.error(f"Failed to get working directory: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/upload_ngs_files', methods=['POST'])
def upload_ngs_files():
    """Upload FASTQ files for NGS analysis"""
    try:
        # Get uploaded files
        files = []
        for key in request.files:
            if key.startswith('file'):
                files.append(request.files[key])
        
        if not files:
            return jsonify({'error': 'No files uploaded'}), 400
        
        project_name = request.form.get('project_name', 'NGS_Analysis')
        
        # Create project directory on Desktop
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        desktop_path = os.path.expanduser('~/Desktop')
        project_dir = os.path.join(desktop_path, f'{project_name}_{timestamp}')
        os.makedirs(project_dir, exist_ok=True)
        
        # Save uploaded files
        saved_files = []
        for file in files:
            if file.filename:
                filename = secure_filename(file.filename)
                file_path = os.path.join(project_dir, filename)
                file.save(file_path)
                saved_files.append(filename)
                logger.info(f"Saved file: {filename}")
        
        return jsonify({
            'success': True,
            'project_directory': project_dir,
            'files_saved': saved_files,
            'message': f'Successfully uploaded {len(saved_files)} files to {project_dir}'
        })
        
    except Exception as e:
        logger.error(f"File upload failed: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ngs/setup', methods=['POST', 'OPTIONS'])
def api_ngs_setup():
    """Setup NGS analysis files only (fast operation)"""
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
    
    try:
        data = request.get_json()
        
        # Import web-safe workflow (no bash commands)
        from ngs_web_workflow import run_web_workflow
        
        # Validate required fields
        required_fields = ['gene_name', 'amplicon_seq', 'sgRNA']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if batch_content is provided
        batch_content = data.get('batch_content', None)
        if not batch_content:
            return jsonify({'error': 'batch_content is required'}), 400
        
        # Run the web-safe workflow with batch content (setup only)
        result = run_web_workflow(
            gene_name=data['gene_name'],
            amplicon_seq=data['amplicon_seq'],
            sgRNA=data['sgRNA'],
            sample_names=data.get('sample_names', []),
            batch_content=batch_content
        )
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': 'NGS analysis setup completed. Run CRISPResso manually.',
                'output_folder': result['gene_folder'],
                'note': 'Use the generated files to run CRISPResso manually via terminal',
                'files': {
                    'batch_file': result['batch_file'],
                    'config_file': result['config_file'],
                    'analysis_script': result['analysis_script'],
                    'indel_template': result['indel_template'],
                    'summary_file': result['summary_file'],
                    'instructions_html': result['instructions_html']
                }
            })
        else:
            return jsonify({'error': 'NGS analysis setup failed'}), 500
            
    except Exception as e:
        logger.error(f"NGS analysis setup error: {str(e)}")
        return jsonify({'error': f'NGS analysis setup failed: {str(e)}'}), 500

@app.route('/api/ngs/results/<gene_name>', methods=['GET', 'OPTIONS'])
def api_ngs_results(gene_name):
    """Get NGS analysis results for a gene"""
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
    
    try:
        # Look for results in the Desktop directory (where CRISPResso was run)
        gene_folder = f"/Users/zhoujun/Desktop/{gene_name}"
        
        if not os.path.exists(gene_folder):
            return jsonify({'error': f'Results not found for {gene_name}'}), 404
        
        # Look for CRISPResso batch results
        batch_results_folder = os.path.join(gene_folder, "CRISPRessoBatch_on_crispresso_batch")
        
        results = {
            'gene_name': gene_name,
            'status': 'completed',
            'output_folder': gene_folder,
            'files': []
        }
        
        if os.path.exists(batch_results_folder):
            # List all files in the results folder
            for root, dirs, files in os.walk(batch_results_folder):
                for file in files:
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, gene_folder)
                    results['files'].append({
                        'name': file,
                        'path': relative_path,
                        'full_path': file_path,
                        'type': 'result_file'
                    })
        
        # Look for main result files in gene folder
        for file in os.listdir(gene_folder):
            if file.endswith(('.html', '.txt', '.zip')):
                results['files'].append({
                    'name': file,
                    'path': file,
                    'full_path': os.path.join(gene_folder, file),
                    'type': 'main_result'
                })
        
        # Format response to match frontend expectations
        response_data = {
            'success': True,
            'summary': {
                'gene_name': gene_name,
                'status': results['status'],
                'output_folder': results['output_folder'],
                'files_created': len(results['files']),
                'analysis_type': 'real_crispresso_analysis',
                'note': f'CRISPResso analysis completed successfully with {len(results["files"])} output files',
                'available_results': [f['name'] for f in results['files'][:10]],  # Show first 10 files
                'next_steps': [
                    'Review HTML analysis reports for detailed results',
                    'Check modification frequency summaries',
                    'Analyze nucleotide conversion patterns',
                    'Download result files for further analysis'
                ],
                'files': results['files']
            }
        }
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error retrieving NGS results: {str(e)}")
        return jsonify({'error': f'Failed to retrieve results: {str(e)}'}), 500

@app.route('/api/ngs/status/<gene_name>', methods=['GET', 'OPTIONS'])
def api_ngs_status(gene_name):
    """Get NGS analysis status for a gene"""
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
    
    try:
        # Look for results in the Desktop directory (where CRISPResso was run)
        gene_folder = f"/Users/zhoujun/Desktop/{gene_name}"
        
        if not os.path.exists(gene_folder):
            return jsonify({
                'gene_name': gene_name,
                'status': 'not_found',
                'message': f'No analysis found for {gene_name}'
            })
        
        # Check for CRISPResso batch results
        batch_results_folder = os.path.join(gene_folder, "CRISPRessoBatch_on_crispresso_batch")
        
        if os.path.exists(batch_results_folder):
            # Check if analysis is complete by looking for key result files
            key_files = ['CRISPRessoBatch_status.json', 'MODIFICATION_PERCENTAGE_SUMMARY.txt']
            all_files_exist = all(os.path.exists(os.path.join(batch_results_folder, f)) for f in key_files)
            
            if all_files_exist:
                return jsonify({
                    'gene_name': gene_name,
                    'status': 'completed',
                    'message': 'Analysis completed successfully',
                    'output_folder': gene_folder,
                    'results_available': True
                })
            else:
                return jsonify({
                    'gene_name': gene_name,
                    'status': 'running',
                    'message': 'Analysis in progress',
                    'output_folder': gene_folder,
                    'results_available': False
                })
        else:
            return jsonify({
                'gene_name': gene_name,
                'status': 'pending',
                'message': 'Analysis not started or failed',
                'output_folder': gene_folder,
                'results_available': False
            })
        
    except Exception as e:
        logger.error(f"Error checking NGS status: {str(e)}")
        return jsonify({
            'gene_name': gene_name,
            'status': 'error',
            'message': f'Failed to check status: {str(e)}'
        }), 500

@app.route('/api/ngs/download/<gene_name>', methods=['GET', 'OPTIONS'])
def api_ngs_download(gene_name):
    """Download NGS analysis results as a ZIP file"""
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
    
    try:
        # Look for results in the Desktop directory (where CRISPResso was run)
        gene_folder = f"/Users/zhoujun/Desktop/{gene_name}"
        
        if not os.path.exists(gene_folder):
            return jsonify({'error': f'No analysis found for {gene_name}'}), 404
        
        # Create a ZIP file in memory
        zip_buffer = BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            # Add all files from the gene folder
            for root, dirs, files in os.walk(gene_folder):
                for file in files:
                    file_path = os.path.join(root, file)
                    # Create relative path for the ZIP file
                    relative_path = os.path.relpath(file_path, gene_folder)
                    try:
                        zip_file.write(file_path, relative_path)
                    except Exception as e:
                        logger.warning(f"Could not add file {file_path} to ZIP: {str(e)}")
                        continue
        
        zip_buffer.seek(0)
        
        # Create response with ZIP file
        response = make_response(zip_buffer.read())
        response.headers['Content-Type'] = 'application/zip'
        response.headers['Content-Disposition'] = f'attachment; filename="{gene_name}_analysis_results.zip"'
        response.headers['Access-Control-Allow-Origin'] = '*'
        
        logger.info(f"Successfully created ZIP download for {gene_name}")
        return response
        
    except Exception as e:
        logger.error(f"Error creating download ZIP: {str(e)}")
        return jsonify({'error': f'Failed to create download: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'mock_experiment_api',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0-mock',
        'mock_records': len(MOCK_RECORDS)
    })

if __name__ == '__main__':
    print("=== Mock Experiment Record Generation API ===")
    print("Available endpoints:")
    print("  POST /generate_experiment_record - Process lab note and generate record")
    print("  GET  /experiment_record/<id> - Get specific record")
    print("  PUT  /experiment_record/<id> - Update record with corrections")
    print("  GET  /experiment_records/pending - Get records needing review")
    print("  GET  /health - Health check")
    print("")
    print("Note: This is a MOCK API for testing frontend integration")
    print("")
    
    # Run the application
    app.run(host="0.0.0.0", port=5005, debug=True)