"""
Lab Note Text Parser and Structuring Module
Parses extracted OCR text from lab notes into structured JSON format,
stores in SQLite database, and provides basic NLP categorization.
"""

import sqlite3
import json
import re
from datetime import datetime
from typing import Dict, List, Any, Optional
import logging
from security_utils import encrypt_lab_record, decrypt_lab_record, audit_log, security_manager

# Configure logging
logger = logging.getLogger(__name__)

class LabNoteParser:
    """Parser for extracting structured data from lab note text."""
    
    def __init__(self, db_path: str = "lab_records.db"):
        """
        Initialize the lab note parser.
        
        Args:
            db_path: Path to SQLite database file
        """
        self.db_path = db_path
        self.create_database()
    
    def create_database(self):
        """Create the SQLite database schema for lab records."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Main experiments table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS experiments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    experiment_id TEXT UNIQUE,
                    date TEXT,
                    researcher TEXT,
                    title TEXT,
                    methods TEXT,
                    results TEXT,
                    observations TEXT,
                    raw_text TEXT,
                    encryption_metadata TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Structured sections table for more detailed storage
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS experiment_sections (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    experiment_id TEXT,
                    section_type TEXT,
                    section_content TEXT,
                    confidence_score REAL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (experiment_id) REFERENCES experiments (experiment_id)
                )
            ''')
            
            # Measurements and data points
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS measurements (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    experiment_id TEXT,
                    measurement_type TEXT,
                    value TEXT,
                    unit TEXT,
                    timestamp TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (experiment_id) REFERENCES experiments (experiment_id)
                )
            ''')
            
            conn.commit()
            conn.close()
            logger.info("Database schema created successfully")
            
        except Exception as e:
            logger.error(f"Error creating database: {e}")
            raise
    
    def parse_text_to_json(self, text: str) -> Dict[str, Any]:
        """
        Parse extracted text into structured JSON format.
        
        Args:
            text: Raw OCR extracted text
            
        Returns:
            Dictionary containing structured lab note data
        """
        data = {
            "experiment_id": "",
            "date": "",
            "researcher": "",
            "title": "",
            "methods": "",
            "results": "",
            "observations": "",
            "raw_text": text.strip(),
            "measurements": [],
            "sections": {}
        }
        
        # Enhanced regex patterns for common lab note fields
        patterns = {
            "experiment_id": [
                r"Experiment\s*(?:ID|#)?:?\s*([A-Z0-9-]+)",
                r"Exp\s*(?:ID|#)?:?\s*([A-Z0-9-]+)",
                r"ID:?\s*([A-Z0-9-]+)"
            ],
            "date": [
                r"Date:?\s*(\d{4}-\d{2}-\d{2})",
                r"Date:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
                r"(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})"
            ],
            "researcher": [
                r"Researcher:?\s*((?:Dr\.?\s*)?[\w\s.]+?)(?=\n|$)",
                r"(?:By|Author):?\s*((?:Dr\.?\s*)?[\w\s.]+?)(?=\n|$)",
                r"Name:?\s*((?:Dr\.?\s*)?[\w\s.]+?)(?=\n|$)"
            ],
            "title": [
                r"Title:?\s*(.*?)(?=\n|$)",
                r"Experiment:?\s*(.*?)(?=\n|$)",
                r"Subject:?\s*(.*?)(?=\n|$)"
            ]
        }
        
        # Extract basic fields
        for field, pattern_list in patterns.items():
            for pattern in pattern_list:
                match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
                if match:
                    data[field] = match.group(1).strip()
                    break
        
        # Extract sections with more sophisticated parsing
        sections = self._extract_sections(text)
        data["methods"] = sections.get("methods", "")
        data["results"] = sections.get("results", "")
        data["observations"] = sections.get("observations", "")
        data["sections"] = sections
        
        # Extract measurements
        data["measurements"] = self._extract_measurements(text)
        
        # Generate experiment ID if not found
        if not data["experiment_id"]:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            data["experiment_id"] = f"EXP_{timestamp}"
        
        return data
    
    def _extract_sections(self, text: str) -> Dict[str, str]:
        """Extract different sections from the lab note text."""
        sections = {
            "methods": "",
            "results": "",
            "observations": "",
            "materials": "",
            "procedure": "",
            "discussion": "",
            "conclusion": ""
        }
        
        # Define section keywords and their variations
        section_keywords = {
            "methods": [r"methods?", r"procedure", r"protocol", r"experimental\s+setup"],
            "results": [r"results?", r"findings", r"data", r"outcomes?"],
            "observations": [r"observations?", r"notes?", r"comments?"],
            "materials": [r"materials?", r"reagents?", r"equipment", r"supplies"],
            "procedure": [r"procedure", r"steps?", r"process"],
            "discussion": [r"discussion", r"analysis", r"interpretation"],
            "conclusion": [r"conclusion", r"summary", r"final\s+thoughts?"]
        }
        
        # Split text into lines for processing
        lines = text.split('\n')
        current_section = None
        section_content = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Check if line starts a new section
            section_found = False
            for section_name, keywords in section_keywords.items():
                for keyword in keywords:
                    pattern = rf"^{keyword}:?"
                    if re.match(pattern, line, re.IGNORECASE):
                        # Save previous section if exists
                        if current_section and section_content:
                            sections[current_section] = '\n'.join(section_content).strip()
                        
                        # Start new section
                        current_section = section_name
                        section_content = []
                        
                        # Include content after the section header if any
                        content_after_header = re.sub(pattern, '', line, flags=re.IGNORECASE).strip()
                        if content_after_header and content_after_header != ':':
                            section_content.append(content_after_header)
                        
                        section_found = True
                        break
                if section_found:
                    break
            
            # Add line to current section if no new section found
            if not section_found and current_section:
                section_content.append(line)
        
        # Save the last section
        if current_section and section_content:
            sections[current_section] = '\n'.join(section_content).strip()
        
        return sections
    
    def _extract_measurements(self, text: str) -> List[Dict[str, Any]]:
        """Extract numerical measurements and data points from text."""
        measurements = []
        
        # Common measurement patterns
        measurement_patterns = [
            # Temperature: 25°C, 25C, 25 degrees
            (r"(\d+(?:\.\d+)?)\s*(?:°C|C|degrees?\s*(?:C|Celsius))", "temperature", "°C"),
            # pH: pH 7.4, pH: 7.4
            (r"pH:?\s*(\d+(?:\.\d+)?)", "pH", ""),
            # Volume: 10ml, 10 ml, 10mL
            (r"(\d+(?:\.\d+)?)\s*(?:ml|mL|milliliters?)", "volume", "mL"),
            # Mass: 5g, 5 grams
            (r"(\d+(?:\.\d+)?)\s*(?:g|grams?)", "mass", "g"),
            # Time: 30min, 30 minutes, 2hr, 2 hours
            (r"(\d+(?:\.\d+)?)\s*(?:min|minutes?)", "time", "min"),
            (r"(\d+(?:\.\d+)?)\s*(?:hr|hours?)", "time", "hr"),
            # Concentration: 0.1M, 0.1 M
            (r"(\d+(?:\.\d+)?)\s*M", "concentration", "M"),
            # Percentage: 50%, 50 percent
            (r"(\d+(?:\.\d+)?)\s*(?:%|percent)", "percentage", "%"),
        ]
        
        for pattern, measurement_type, unit in measurement_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                measurements.append({
                    "type": measurement_type,
                    "value": float(match.group(1)),
                    "unit": unit,
                    "raw_text": match.group(0)
                })
        
        return measurements
    
    def categorize_sections(self, text: str) -> Dict[str, List[str]]:
        """
        Basic NLP categorization of text sections.
        
        Args:
            text: Input text to categorize
            
        Returns:
            Dictionary with categorized sections
        """
        sections = {
            "methods": [],
            "results": [],
            "observations": [],
            "materials": [],
            "data": []
        }
        
        # Keywords for each category
        category_keywords = {
            "methods": ["mixed", "heated", "added", "measured", "prepared", "stirred", "incubated"],
            "results": ["observed", "found", "showed", "indicated", "demonstrated", "revealed"],
            "observations": ["noted", "noticed", "appeared", "seemed", "looked", "visible"],
            "materials": ["solution", "reagent", "chemical", "equipment", "instrument"],
            "data": ["temperature", "pH", "concentration", "volume", "mass", "time"]
        }
        
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip().lower()
            if not line:
                continue
            
            # Score each line against categories
            category_scores = {}
            for category, keywords in category_keywords.items():
                score = sum(1 for keyword in keywords if keyword in line)
                if score > 0:
                    category_scores[category] = score
            
            # Assign to category with highest score
            if category_scores:
                best_category = max(category_scores, key=category_scores.get)
                sections[best_category].append(line)
        
        return sections
    
    def store_in_database(self, data: Dict[str, Any], user_id: str = None) -> bool:
        """
        Store structured data in SQLite database with encryption.
        
        Args:
            data: Structured lab note data
            user_id: User ID for audit logging
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Encrypt sensitive data if encryption is enabled
            encrypted_data = encrypt_lab_record(data.copy())
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Prepare data for database insertion
            if encrypted_data.get('_encrypted'):
                # Use encrypted versions of sensitive fields
                methods = encrypted_data.get('methods_encrypted', '')
                results = encrypted_data.get('results_encrypted', '')  
                observations = encrypted_data.get('observations_encrypted', '')
                raw_text = encrypted_data.get('raw_text_encrypted', '')
                researcher = encrypted_data.get('researcher_encrypted', data.get('researcher', ''))
                
                # Store encryption metadata
                encryption_metadata = json.dumps({
                    'methods_salt': encrypted_data.get('methods_salt', ''),
                    'methods_nonce': encrypted_data.get('methods_nonce', ''),
                    'results_salt': encrypted_data.get('results_salt', ''),
                    'results_nonce': encrypted_data.get('results_nonce', ''),
                    'observations_salt': encrypted_data.get('observations_salt', ''),
                    'observations_nonce': encrypted_data.get('observations_nonce', ''),
                    'raw_text_salt': encrypted_data.get('raw_text_salt', ''),
                    'raw_text_nonce': encrypted_data.get('raw_text_nonce', ''),
                    'researcher_salt': encrypted_data.get('researcher_salt', ''),
                    'researcher_nonce': encrypted_data.get('researcher_nonce', ''),
                    'encrypted': True,
                    'version': '1.0'
                })
            else:
                # Use original data (encryption disabled)
                methods = data.get("methods", "")
                results = data.get("results", "")
                observations = data.get("observations", "")
                raw_text = data.get("raw_text", "")
                researcher = data.get("researcher", "")
                encryption_metadata = json.dumps({'encrypted': False})
            
            # Insert main experiment record
            cursor.execute('''
                INSERT OR REPLACE INTO experiments 
                (experiment_id, date, researcher, title, methods, results, observations, raw_text, encryption_metadata, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ''', (
                data["experiment_id"],
                data["date"],
                researcher,
                data["title"],
                methods,
                results,
                observations,
                raw_text,
                encryption_metadata
            ))
            
            # Insert section details
            for section_type, content in data["sections"].items():
                if content.strip():
                    cursor.execute('''
                        INSERT INTO experiment_sections (experiment_id, section_type, section_content)
                        VALUES (?, ?, ?)
                    ''', (data["experiment_id"], section_type, content))
            
            # Insert measurements
            for measurement in data["measurements"]:
                cursor.execute('''
                    INSERT INTO measurements (experiment_id, measurement_type, value, unit)
                    VALUES (?, ?, ?, ?)
                ''', (
                    data["experiment_id"],
                    measurement["type"],
                    str(measurement["value"]),
                    measurement["unit"]
                ))
            
            conn.commit()
            conn.close()
            
            # Audit log
            audit_log(
                "lab_record_stored", 
                user_id, 
                data["experiment_id"], 
                f"Stored lab record with encryption: {encrypted_data.get('_encrypted', False)}"
            )
            
            logger.info(f"Successfully stored experiment {data['experiment_id']} in database (encrypted: {encrypted_data.get('_encrypted', False)})")
            return True
            
        except Exception as e:
            logger.error(f"Error storing data in database: {e}")
            audit_log("lab_record_store_failed", user_id, data.get("experiment_id"), str(e))
            return False
    
    def process_extracted_text(self, text: str) -> Dict[str, Any]:
        """
        Main function to process extracted OCR text.
        
        Args:
            text: Raw OCR extracted text
            
        Returns:
            Processed and structured data
        """
        try:
            # Parse text to structured JSON
            structured_data = self.parse_text_to_json(text)
            
            # Store in database
            success = self.store_in_database(structured_data)
            structured_data["stored_successfully"] = success
            
            # Add categorization results
            categorized = self.categorize_sections(text)
            structured_data["categorized_sections"] = categorized
            
            logger.info(f"Successfully processed lab note: {structured_data['experiment_id']}")
            return structured_data
            
        except Exception as e:
            logger.error(f"Error processing extracted text: {e}")
            raise
    
    def get_experiment(self, experiment_id: str, user_id: str = None, decrypt: bool = True) -> Optional[Dict[str, Any]]:
        """Retrieve experiment data from database with decryption."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM experiments WHERE experiment_id = ?
            ''', (experiment_id,))
            
            result = cursor.fetchone()
            conn.close()
            
            if result:
                columns = [description[0] for description in cursor.description]
                experiment_data = dict(zip(columns, result))
                
                # Handle decryption if data is encrypted
                if decrypt and experiment_data.get('encryption_metadata'):
                    try:
                        encryption_meta = json.loads(experiment_data['encryption_metadata'])
                        if encryption_meta.get('encrypted'):
                            # Reconstruct encrypted record format for decryption
                            encrypted_record = {
                                'experiment_id': experiment_data['experiment_id'],
                                'date': experiment_data['date'],
                                'title': experiment_data['title'],
                                '_encrypted': True,
                                '_encryption_version': encryption_meta.get('version', '1.0')
                            }
                            
                            # Add encrypted fields and metadata
                            sensitive_fields = ['methods', 'results', 'observations', 'raw_text', 'researcher']
                            for field in sensitive_fields:
                                if experiment_data.get(field):  # Field has encrypted data
                                    encrypted_record[f'{field}_encrypted'] = experiment_data[field]
                                    encrypted_record[f'{field}_salt'] = encryption_meta.get(f'{field}_salt', '')
                                    encrypted_record[f'{field}_nonce'] = encryption_meta.get(f'{field}_nonce', '')
                            
                            # Decrypt the record
                            decrypted_record = decrypt_lab_record(encrypted_record)
                            
                            # Update experiment_data with decrypted values
                            for field in sensitive_fields:
                                if field in decrypted_record:
                                    experiment_data[field] = decrypted_record[field]
                            
                            # Audit log
                            audit_log("lab_record_accessed", user_id, experiment_id, "Decrypted lab record accessed")
                    
                    except Exception as e:
                        logger.error(f"Failed to decrypt experiment {experiment_id}: {e}")
                        audit_log("lab_record_decrypt_failed", user_id, experiment_id, str(e))
                
                # Remove encryption metadata from returned data
                experiment_data.pop('encryption_metadata', None)
                return experiment_data
            
            return None
            
        except Exception as e:
            logger.error(f"Error retrieving experiment {experiment_id}: {e}")
            return None
    
    def list_experiments(self, limit: int = 50) -> List[Dict[str, Any]]:
        """List recent experiments from database."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT experiment_id, date, researcher, title, created_at 
                FROM experiments 
                ORDER BY created_at DESC 
                LIMIT ?
            ''', (limit,))
            
            results = cursor.fetchall()
            conn.close()
            
            columns = [description[0] for description in cursor.description]
            return [dict(zip(columns, row)) for row in results]
            
        except Exception as e:
            logger.error(f"Error listing experiments: {e}")
            return []
    
    def search_experiments(self, query: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Search experiments using full-text search across all fields.
        
        Args:
            query: Search query string
            limit: Maximum number of results to return
            
        Returns:
            List of matching experiments with relevance scoring
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Use FTS (Full-Text Search) if available, otherwise use LIKE queries
            search_pattern = f"%{query}%"
            
            cursor.execute('''
                SELECT 
                    experiment_id, 
                    date, 
                    researcher, 
                    title, 
                    methods,
                    results,
                    observations,
                    raw_text,
                    created_at,
                    -- Calculate relevance score
                    (
                        CASE WHEN experiment_id LIKE ? THEN 10 ELSE 0 END +
                        CASE WHEN title LIKE ? THEN 8 ELSE 0 END +
                        CASE WHEN researcher LIKE ? THEN 6 ELSE 0 END +
                        CASE WHEN methods LIKE ? THEN 4 ELSE 0 END +
                        CASE WHEN results LIKE ? THEN 4 ELSE 0 END +
                        CASE WHEN observations LIKE ? THEN 3 ELSE 0 END +
                        CASE WHEN raw_text LIKE ? THEN 1 ELSE 0 END
                    ) as relevance_score
                FROM experiments 
                WHERE 
                    experiment_id LIKE ? OR
                    title LIKE ? OR
                    researcher LIKE ? OR
                    methods LIKE ? OR
                    results LIKE ? OR
                    observations LIKE ? OR
                    raw_text LIKE ?
                ORDER BY relevance_score DESC, created_at DESC
                LIMIT ?
            ''', (
                search_pattern, search_pattern, search_pattern, search_pattern,
                search_pattern, search_pattern, search_pattern,
                search_pattern, search_pattern, search_pattern, search_pattern,
                search_pattern, search_pattern, search_pattern,
                limit
            ))
            
            results = cursor.fetchall()
            conn.close()
            
            columns = [description[0] for description in cursor.description]
            return [dict(zip(columns, row)) for row in results]
            
        except Exception as e:
            logger.error(f"Error searching experiments: {e}")
            return []
    
    def search_measurements(self, measurement_type: str = None, min_value: float = None, max_value: float = None, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Search measurements by type and/or value range.
        
        Args:
            measurement_type: Type of measurement to filter by (e.g., 'temperature', 'pH')
            min_value: Minimum value for range search
            max_value: Maximum value for range search
            limit: Maximum number of results
            
        Returns:
            List of matching measurements with experiment info
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            conditions = []
            params = []
            
            if measurement_type:
                conditions.append("m.measurement_type LIKE ?")
                params.append(f"%{measurement_type}%")
            
            if min_value is not None:
                conditions.append("CAST(m.value AS REAL) >= ?")
                params.append(min_value)
            
            if max_value is not None:
                conditions.append("CAST(m.value AS REAL) <= ?")
                params.append(max_value)
            
            where_clause = " AND ".join(conditions) if conditions else "1=1"
            params.append(limit)
            
            cursor.execute(f'''
                SELECT 
                    m.experiment_id,
                    m.measurement_type,
                    m.value,
                    m.unit,
                    m.timestamp,
                    e.title,
                    e.researcher,
                    e.date,
                    m.created_at
                FROM measurements m
                JOIN experiments e ON m.experiment_id = e.experiment_id
                WHERE {where_clause}
                ORDER BY m.created_at DESC
                LIMIT ?
            ''', params)
            
            results = cursor.fetchall()
            conn.close()
            
            columns = [description[0] for description in cursor.description]
            return [dict(zip(columns, row)) for row in results]
            
        except Exception as e:
            logger.error(f"Error searching measurements: {e}")
            return []
    
    def get_search_suggestions(self, partial_query: str, limit: int = 10) -> Dict[str, List[str]]:
        """
        Get search suggestions based on partial query.
        
        Args:
            partial_query: Partial search term
            limit: Maximum suggestions per category
            
        Returns:
            Dictionary with suggestions categorized by field type
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            suggestions = {
                'experiment_ids': [],
                'researchers': [],
                'titles': [],
                'measurement_types': []
            }
            
            search_pattern = f"%{partial_query}%"
            
            # Get experiment ID suggestions
            cursor.execute('''
                SELECT DISTINCT experiment_id 
                FROM experiments 
                WHERE experiment_id LIKE ? 
                ORDER BY experiment_id 
                LIMIT ?
            ''', (search_pattern, limit))
            suggestions['experiment_ids'] = [row[0] for row in cursor.fetchall()]
            
            # Get researcher suggestions
            cursor.execute('''
                SELECT DISTINCT researcher 
                FROM experiments 
                WHERE researcher LIKE ? AND researcher IS NOT NULL AND researcher != ''
                ORDER BY researcher 
                LIMIT ?
            ''', (search_pattern, limit))
            suggestions['researchers'] = [row[0] for row in cursor.fetchall()]
            
            # Get title suggestions
            cursor.execute('''
                SELECT DISTINCT title 
                FROM experiments 
                WHERE title LIKE ? AND title IS NOT NULL AND title != ''
                ORDER BY title 
                LIMIT ?
            ''', (search_pattern, limit))
            suggestions['titles'] = [row[0] for row in cursor.fetchall()]
            
            # Get measurement type suggestions
            cursor.execute('''
                SELECT DISTINCT measurement_type 
                FROM measurements 
                WHERE measurement_type LIKE ? 
                ORDER BY measurement_type 
                LIMIT ?
            ''', (search_pattern, limit))
            suggestions['measurement_types'] = [row[0] for row in cursor.fetchall()]
            
            conn.close()
            return suggestions
            
        except Exception as e:
            logger.error(f"Error getting search suggestions: {e}")
            return {'experiment_ids': [], 'researchers': [], 'titles': [], 'measurement_types': []}


# Convenience function for quick processing
def process_lab_note_text(text: str, db_path: str = "lab_records.db") -> Dict[str, Any]:
    """
    Quick function to process lab note text.
    
    Args:
        text: Extracted OCR text
        db_path: Path to SQLite database
        
    Returns:
        Structured lab note data
    """
    parser = LabNoteParser(db_path)
    return parser.process_extracted_text(text)


# Example usage and testing
if __name__ == "__main__":
    # Sample extracted text for testing
    sample_text = """
    Experiment ID: EXP-2025-001
    Date: 2025-08-03
    Researcher: Dr. Jane Smith
    Title: Protein Crystallization Study
    
    Materials:
    - Protein solution (10mg/mL)
    - Buffer solution pH 7.4
    - Crystallization plates
    
    Methods:
    Mixed 10ml of Solution A with 5ml of Solution B. 
    Heated to 50°C for 30min.
    Added 0.1M NaCl solution dropwise.
    
    Results:
    Observed color change to blue after 15min.
    pH level measured at 7.2.
    Crystal formation visible after 2hr.
    
    Observations:
    Slight precipitation noted after 20min.
    Temperature remained stable throughout.
    No contamination observed.
    """
    
    try:
        parser = LabNoteParser()
        result = parser.process_extracted_text(sample_text)
        
        print("=== Lab Note Processing Results ===")
        print(f"Experiment ID: {result['experiment_id']}")
        print(f"Researcher: {result['researcher']}")
        print(f"Date: {result['date']}")
        print(f"Title: {result['title']}")
        print(f"\nExtracted Measurements:")
        for measurement in result['measurements']:
            print(f"  - {measurement['type']}: {measurement['value']} {measurement['unit']}")
        
        print(f"\nStored in database: {result['stored_successfully']}")
        
    except Exception as e:
        print(f"Error processing sample text: {e}")