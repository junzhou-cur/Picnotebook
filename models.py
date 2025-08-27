from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
import json

db = SQLAlchemy()

class User(UserMixin, db.Model):
    """User model with authentication"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    last_login = db.Column(db.DateTime)
    reset_token = db.Column(db.String(255), nullable=True)
    reset_token_expires = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    projects = db.relationship('Project', backref='owner', lazy='dynamic', cascade='all, delete-orphan')
    lab_notes = db.relationship('LabNote', backref='author', lazy='dynamic', cascade='all, delete-orphan')
    project_memberships = db.relationship('ProjectMember', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if provided password matches hash"""
        return check_password_hash(self.password_hash, password)
    
    def get_full_name(self):
        """Get user's full name"""
        return f"{self.first_name} {self.last_name}"
    
    def to_dict(self):
        """Convert user to dictionary (excluding sensitive info)"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': self.get_full_name(),
            'is_active': self.is_active,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
    
    def __repr__(self):
        return f'<User {self.username}>'

class Project(db.Model):
    """Project model for organizing lab experiments"""
    __tablename__ = 'projects'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False, index=True)
    description = db.Column(db.Text)
    hypothesis = db.Column(db.Text)
    purpose = db.Column(db.Text)
    current_progress = db.Column(db.Text)
    future_plan = db.Column(db.Text)  # AI-generated future plans based on experiment progress
    progress_percentage = db.Column(db.Integer, default=0, nullable=False)  # 0-100 progress
    status = db.Column(db.String(50), default='active', nullable=False)  # active, completed, paused
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    lab_notes = db.relationship('LabNote', backref='project', lazy='dynamic', cascade='all, delete-orphan')
    members = db.relationship('ProjectMember', backref='project', lazy='dynamic', cascade='all, delete-orphan')
    protocols = db.relationship('Protocol', backref='project', lazy='dynamic', cascade='all, delete-orphan')
    
    def get_note_count(self):
        """Get number of lab notes in this project"""
        return self.lab_notes.count()
    
    def get_recent_notes(self, limit=5):
        """Get recent lab notes"""
        return self.lab_notes.order_by(LabNote.created_at.desc()).limit(limit).all()
    
    def to_dict(self):
        """Convert project to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'hypothesis': self.hypothesis,
            'purpose': self.purpose,
            'current_progress': self.current_progress,
            'future_plan': self.future_plan,
            'progress_percentage': self.progress_percentage,
            'status': self.status,
            'owner_id': self.owner_id,
            'owner': self.owner.get_full_name() if self.owner else None,
            'note_count': self.get_note_count(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Project {self.name}>'

class LabNote(db.Model):
    """Lab note model for storing processed experiment records"""
    __tablename__ = 'lab_notes'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(300), nullable=False)
    content = db.Column(db.Text, nullable=False)  # Processed markdown content
    original_image_path = db.Column(db.String(500))  # Path to original uploaded image
    processing_status = db.Column(db.String(50), default='pending', nullable=False)  # pending, processing, completed, failed
    processing_result = db.Column(db.Text)  # Raw API response for debugging
    auto_classified = db.Column(db.Boolean, default=False, nullable=False)  # Was this auto-assigned to project?
    
    # Foreign keys
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    def to_dict(self):
        """Convert lab note to dictionary"""
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'original_image_path': self.original_image_path,
            'processing_status': self.processing_status,
            'auto_classified': self.auto_classified,
            'project_id': self.project_id,
            'project_name': self.project.name if self.project else None,
            'author_id': self.author_id,
            'author_name': self.author.get_full_name() if self.author else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<LabNote {self.title}>'

class ProjectMember(db.Model):
    """Many-to-many relationship for project collaboration"""
    __tablename__ = 'project_members'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    role = db.Column(db.String(50), default='member', nullable=False)  # owner, admin, member, viewer
    joined_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Unique constraint
    __table_args__ = (db.UniqueConstraint('project_id', 'user_id', name='unique_project_member'),)
    
    def to_dict(self):
        """Convert project member to dictionary"""
        return {
            'id': self.id,
            'project_id': self.project_id,
            'user_id': self.user_id,
            'user_name': self.user.get_full_name() if self.user else None,
            'role': self.role,
            'joined_at': self.joined_at.isoformat() if self.joined_at else None
        }
    
    def __repr__(self):
        return f'<ProjectMember {self.user.username} in {self.project.name}>'

class ProcessingJob(db.Model):
    """Track async processing jobs"""
    __tablename__ = 'processing_jobs'
    
    id = db.Column(db.String(36), primary_key=True)  # UUID
    job_type = db.Column(db.String(50), nullable=False)  # 'image_processing', 'report_generation'
    status = db.Column(db.String(50), default='pending', nullable=False)  # pending, processing, completed, failed
    progress = db.Column(db.Integer, default=0, nullable=False)  # 0-100
    result = db.Column(db.Text)  # JSON result
    error_message = db.Column(db.Text)
    
    # Relationships
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'))
    lab_note_id = db.Column(db.Integer, db.ForeignKey('lab_notes.id'))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    started_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    
    user = db.relationship('User', backref='processing_jobs')
    project = db.relationship('Project', backref='processing_jobs')
    lab_note = db.relationship('LabNote', backref='processing_jobs')
    
    def to_dict(self):
        """Convert processing job to dictionary"""
        return {
            'id': self.id,
            'job_type': self.job_type,
            'status': self.status,
            'progress': self.progress,
            'error_message': self.error_message,
            'user_id': self.user_id,
            'project_id': self.project_id,
            'lab_note_id': self.lab_note_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
    
    def __repr__(self):
        return f'<ProcessingJob {self.id} - {self.job_type}>'

class Protocol(db.Model):
    """Protocol model for storing experimental protocols"""
    __tablename__ = 'protocols'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(300), nullable=False)
    content = db.Column(db.Text, nullable=False)  # Protocol text content
    version = db.Column(db.Integer, default=1, nullable=False)  # Version tracking
    change_history = db.Column(db.Text)  # JSON array of changes with highlighting
    
    # Foreign keys
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    author = db.relationship('User', backref='protocols')
    
    def add_change(self, old_text, new_text, change_description, lab_note_id=None):
        """Add a change to the protocol history"""
        import json
        import difflib
        
        # Create diff highlighting
        diff = list(difflib.unified_diff(
            old_text.splitlines(keepends=True),
            new_text.splitlines(keepends=True),
            fromfile='old',
            tofile='new'
        ))
        
        change_record = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'version': self.version,
            'description': change_description,
            'lab_note_id': lab_note_id,
            'old_text': old_text,
            'new_text': new_text,
            'diff': diff
        }
        
        # Load existing history
        history = []
        if self.change_history:
            try:
                history = json.loads(self.change_history)
            except:
                history = []
        
        history.append(change_record)
        self.change_history = json.dumps(history)
        self.version += 1
        self.content = new_text
    
    def get_highlighted_content(self):
        """Get protocol content with latest changes highlighted"""
        import json
        
        if not self.change_history:
            return self.content
        
        try:
            history = json.loads(self.change_history)
            if not history:
                return self.content
            
            # Get the latest change
            latest_change = history[-1]
            old_text = latest_change.get('old_text', '')
            new_text = latest_change.get('new_text', self.content)
            
            # Simple highlighting by marking new/changed lines
            old_lines = old_text.splitlines()
            new_lines = new_text.splitlines()
            
            highlighted_lines = []
            for i, line in enumerate(new_lines):
                if i >= len(old_lines) or line != old_lines[i]:
                    # This line is new or changed - mark for highlighting
                    highlighted_lines.append({'text': line, 'changed': True})
                else:
                    highlighted_lines.append({'text': line, 'changed': False})
            
            return highlighted_lines
        except:
            return self.content
    
    def to_dict(self):
        """Convert protocol to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'content': self.content,
            'version': self.version,
            'project_id': self.project_id,
            'project_name': self.project.name if self.project else None,
            'author_id': self.author_id,
            'author_name': self.author.get_full_name() if self.author else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'highlighted_content': self.get_highlighted_content(),
            'change_count': len(json.loads(self.change_history)) if self.change_history else 0
        }
    
    def __repr__(self):
        return f'<Protocol {self.name} v{self.version}>'

class Sequence(db.Model):
    """Sequence model for storing DNA/RNA sequences and FASTQ data"""
    __tablename__ = 'sequences'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(300), nullable=False)
    sequence_type = db.Column(db.String(50), nullable=False)  # 'DNA', 'RNA', 'protein', 'fastq'
    sequence_data = db.Column(db.Text, nullable=False)  # Actual sequence or FASTQ content
    description = db.Column(db.Text)
    
    # FASTQ-specific fields
    original_filename = db.Column(db.String(500))  # Original uploaded filename
    file_format = db.Column(db.String(20))  # 'fasta', 'fastq', 'fastq.gz'
    quality_scores = db.Column(db.Text)  # Quality scores for FASTQ
    read_count = db.Column(db.Integer)  # Number of reads in FASTQ
    file_size = db.Column(db.Integer)  # File size in bytes
    
    # Analysis results
    gc_content = db.Column(db.Float)  # GC content percentage
    sequence_length = db.Column(db.Integer)  # Length of sequence
    analysis_results = db.Column(db.Text)  # JSON for analysis results
    
    # Foreign keys
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    project = db.relationship('Project', backref='sequences')
    user = db.relationship('User', backref='sequences')
    amplicons = db.relationship('Amplicon', backref='sequence', lazy='dynamic', cascade='all, delete-orphan')
    
    def analyze_sequence(self):
        """Analyze sequence and calculate statistics"""
        import json
        from collections import Counter
        
        if not self.sequence_data:
            return
        
        # Calculate basic statistics
        if self.sequence_type.lower() == 'fastq':
            # Parse FASTQ format
            lines = self.sequence_data.strip().split('\n')
            sequences = []
            qualities = []
            
            for i in range(1, len(lines), 4):  # Sequence lines
                if i < len(lines):
                    sequences.append(lines[i])
            
            for i in range(3, len(lines), 4):  # Quality lines
                if i < len(lines):
                    qualities.append(lines[i])
            
            self.read_count = len(sequences)
            all_sequence = ''.join(sequences)
            self.quality_scores = json.dumps(qualities[:100])  # Store first 100 quality strings
        else:
            all_sequence = self.sequence_data.upper()
            self.read_count = 1
        
        # Calculate GC content
        if all_sequence:
            base_counts = Counter(all_sequence)
            total_bases = sum(base_counts.values())
            gc_count = base_counts.get('G', 0) + base_counts.get('C', 0)
            self.gc_content = (gc_count / total_bases * 100) if total_bases > 0 else 0
            self.sequence_length = len(all_sequence)
            
            # Store analysis results
            analysis = {
                'base_composition': dict(base_counts),
                'total_bases': total_bases,
                'gc_content': self.gc_content,
                'sequence_length': self.sequence_length,
                'read_count': self.read_count
            }
            self.analysis_results = json.dumps(analysis)
    
    def to_dict(self):
        """Convert sequence to dictionary"""
        import json
        
        analysis = {}
        if self.analysis_results:
            try:
                analysis = json.loads(self.analysis_results)
            except:
                pass
        
        return {
            'id': self.id,
            'name': self.name,
            'sequence_type': self.sequence_type,
            'description': self.description,
            'original_filename': self.original_filename,
            'file_format': self.file_format,
            'sequence_length': self.sequence_length,
            'gc_content': self.gc_content,
            'read_count': self.read_count,
            'file_size': self.file_size,
            'project_id': self.project_id,
            'project_name': self.project.name if self.project else None,
            'user_id': self.user_id,
            'user_name': self.user.get_full_name() if self.user else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'analysis_results': analysis,
            'amplicon_count': self.amplicons.count()
        }
    
    def __repr__(self):
        return f'<Sequence {self.name} ({self.sequence_type})>'

class Amplicon(db.Model):
    """Amplicon model for storing PCR amplicon results and analysis"""
    __tablename__ = 'amplicons'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(300), nullable=False)
    primer_forward = db.Column(db.String(500))  # Forward primer sequence
    primer_reverse = db.Column(db.String(500))  # Reverse primer sequence
    target_region = db.Column(db.String(300))  # Target genomic region
    expected_size = db.Column(db.Integer)  # Expected amplicon size in bp
    
    # Analysis results
    amplicon_sequence = db.Column(db.Text)  # Identified amplicon sequence
    actual_size = db.Column(db.Integer)  # Actual amplicon size
    primer_efficiency = db.Column(db.Float)  # Primer binding efficiency
    specificity_score = db.Column(db.Float)  # Specificity score
    
    # PCR conditions
    annealing_temp = db.Column(db.Float)  # Annealing temperature
    cycle_count = db.Column(db.Integer)  # Number of PCR cycles
    pcr_conditions = db.Column(db.Text)  # JSON for PCR conditions
    
    # Results and analysis
    analysis_output = db.Column(db.Text)  # JSON for detailed analysis
    quality_metrics = db.Column(db.Text)  # JSON for quality metrics
    
    # Foreign keys
    sequence_id = db.Column(db.Integer, db.ForeignKey('sequences.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    project = db.relationship('Project', backref='amplicons')
    user = db.relationship('User', backref='amplicons')
    
    def analyze_amplicon(self):
        """Analyze amplicon and calculate quality metrics"""
        import json
        import re
        
        if not self.amplicon_sequence or not self.primer_forward or not self.primer_reverse:
            return
        
        sequence = self.amplicon_sequence.upper()
        forward_primer = self.primer_forward.upper()
        reverse_primer = self.primer_reverse.upper()
        
        # Calculate actual size
        self.actual_size = len(sequence)
        
        # Check primer binding sites
        forward_matches = len(re.findall(forward_primer, sequence))
        reverse_matches = len(re.findall(reverse_primer, sequence))
        
        # Calculate primer efficiency (simplified)
        self.primer_efficiency = (forward_matches + reverse_matches) / 2.0 * 100
        
        # Calculate specificity score (simplified - based on primer matches and size accuracy)
        size_accuracy = 1.0
        if self.expected_size:
            size_diff = abs(self.actual_size - self.expected_size)
            size_accuracy = max(0, 1 - (size_diff / self.expected_size))
        
        self.specificity_score = (self.primer_efficiency / 100) * size_accuracy * 100
        
        # Store detailed analysis
        analysis = {
            'forward_primer_matches': forward_matches,
            'reverse_primer_matches': reverse_matches,
            'size_accuracy': size_accuracy,
            'gc_content': self._calculate_gc_content(sequence),
            'tm_forward': self._calculate_tm(forward_primer),
            'tm_reverse': self._calculate_tm(reverse_primer),
        }
        self.analysis_output = json.dumps(analysis)
        
        # Store quality metrics
        metrics = {
            'primer_efficiency': self.primer_efficiency,
            'specificity_score': self.specificity_score,
            'size_match': size_accuracy > 0.9,
            'primer_binding': forward_matches > 0 and reverse_matches > 0
        }
        self.quality_metrics = json.dumps(metrics)
    
    def _calculate_gc_content(self, sequence):
        """Calculate GC content of sequence"""
        if not sequence:
            return 0
        gc_count = sequence.count('G') + sequence.count('C')
        return (gc_count / len(sequence)) * 100
    
    def _calculate_tm(self, primer):
        """Simple Tm calculation for primer"""
        if not primer:
            return 0
        # Simplified formula: Tm = 4*(G+C) + 2*(A+T)
        gc_count = primer.count('G') + primer.count('C')
        at_count = primer.count('A') + primer.count('T')
        return 4 * gc_count + 2 * at_count
    
    def to_dict(self):
        """Convert amplicon to dictionary"""
        import json
        
        analysis = {}
        quality_metrics = {}
        pcr_conditions = {}
        
        try:
            if self.analysis_output:
                analysis = json.loads(self.analysis_output)
            if self.quality_metrics:
                quality_metrics = json.loads(self.quality_metrics)
            if self.pcr_conditions:
                pcr_conditions = json.loads(self.pcr_conditions)
        except:
            pass
        
        return {
            'id': self.id,
            'name': self.name,
            'primer_forward': self.primer_forward,
            'primer_reverse': self.primer_reverse,
            'target_region': self.target_region,
            'expected_size': self.expected_size,
            'actual_size': self.actual_size,
            'primer_efficiency': self.primer_efficiency,
            'specificity_score': self.specificity_score,
            'annealing_temp': self.annealing_temp,
            'cycle_count': self.cycle_count,
            'sequence_id': self.sequence_id,
            'sequence_name': self.sequence.name if self.sequence else None,
            'project_id': self.project_id,
            'project_name': self.project.name if self.project else None,
            'user_id': self.user_id,
            'user_name': self.user.get_full_name() if self.user else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'analysis_output': analysis,
            'quality_metrics': quality_metrics,
            'pcr_conditions': pcr_conditions
        }
    
    def __repr__(self):
        return f'<Amplicon {self.name} ({self.target_region})>'

class Milestone(db.Model):
    """Milestone model for tracking project progress"""
    __tablename__ = 'milestones'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(300), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(50), default='pending', nullable=False)  # pending, in_progress, completed, blocked
    priority = db.Column(db.String(20), default='medium', nullable=False)  # high, medium, low
    progress = db.Column(db.Integer, default=0, nullable=False)  # 0-100
    due_date = db.Column(db.Date)
    completed_date = db.Column(db.DateTime)
    assignee = db.Column(db.String(100))
    notes = db.Column(db.Text)
    dependencies = db.Column(db.Text)  # JSON array of milestone IDs
    
    # Foreign keys
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    tasks = db.relationship('Task', backref='milestone', lazy='dynamic', cascade='all, delete-orphan')
    
    def calculate_progress(self):
        """Calculate progress based on completed tasks"""
        total_tasks = self.tasks.count()
        if total_tasks == 0:
            return 0
        completed_tasks = self.tasks.filter_by(completed=True).count()
        return int((completed_tasks / total_tasks) * 100)
    
    def update_status(self):
        """Update status based on progress"""
        progress = self.calculate_progress()
        if progress == 100:
            self.status = 'completed'
            if not self.completed_date:
                self.completed_date = datetime.now(timezone.utc)
        elif progress > 0:
            self.status = 'in_progress'
        else:
            self.status = 'pending'
        self.progress = progress
    
    def to_dict(self):
        """Convert milestone to dictionary"""
        dependencies = []
        try:
            if self.dependencies:
                dependencies = json.loads(self.dependencies)
        except:
            pass
            
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'progress': self.progress,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'completed_date': self.completed_date.isoformat() if self.completed_date else None,
            'assignee': self.assignee,
            'notes': self.notes,
            'dependencies': dependencies,
            'project_id': self.project_id,
            'project_name': self.project.name if self.project else None,
            'tasks': [task.to_dict() for task in self.tasks],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Milestone {self.title}>'

class Task(db.Model):
    """Task model for tracking individual tasks within milestones"""
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(300), nullable=False)
    completed = db.Column(db.Boolean, default=False, nullable=False)
    assignee = db.Column(db.String(100))
    due_date = db.Column(db.Date)
    completed_date = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    
    # Foreign keys
    milestone_id = db.Column(db.Integer, db.ForeignKey('milestones.id'), nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    def to_dict(self):
        """Convert task to dictionary"""
        return {
            'id': self.id,
            'title': self.title,
            'completed': self.completed,
            'assignee': self.assignee,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'completed_date': self.completed_date.isoformat() if self.completed_date else None,
            'notes': self.notes,
            'milestone_id': self.milestone_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Task {self.title}>'