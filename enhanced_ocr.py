"""
Enhanced OCR processing module with image preprocessing for handwritten lab notes.
Integrates Tesseract OCR with OpenCV preprocessing for improved text recognition.
"""

import cv2
import pytesseract
from PIL import Image
import numpy as np
import os
import logging
from datetime import datetime
from typing import Optional, Tuple, Dict, Any

# Configure logging
logger = logging.getLogger(__name__)

class EnhancedOCR:
    """Enhanced OCR processor with image preprocessing capabilities."""
    
    def __init__(self, tesseract_path: Optional[str] = None):
        """
        Initialize the Enhanced OCR processor.
        
        Args:
            tesseract_path: Path to tesseract executable (auto-detected if None)
        """
        # Set tesseract path if provided (mainly for Windows)
        if tesseract_path:
            pytesseract.pytesseract.tesseract_cmd = tesseract_path
        
        # Verify tesseract is available
        try:
            pytesseract.get_tesseract_version()
            logger.info("Tesseract OCR initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Tesseract: {e}")
            raise
    
    def preprocess_image(self, image_path: str, preprocessing_type: str = "standard") -> np.ndarray:
        """
        Preprocess image to enhance OCR accuracy.
        
        Args:
            image_path: Path to the input image
            preprocessing_type: Type of preprocessing ("standard", "aggressive", "handwriting")
            
        Returns:
            Preprocessed image as numpy array
        """
        try:
            # Read image
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError(f"Could not read image from {image_path}")
            
            # Convert to grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            if preprocessing_type == "standard":
                return self._standard_preprocessing(gray)
            elif preprocessing_type == "aggressive":
                return self._aggressive_preprocessing(gray)
            elif preprocessing_type == "handwriting":
                return self._handwriting_preprocessing(gray)
            else:
                return self._standard_preprocessing(gray)
                
        except Exception as e:
            logger.error(f"Error in image preprocessing: {e}")
            raise
    
    def _standard_preprocessing(self, gray_img: np.ndarray) -> np.ndarray:
        """Standard preprocessing pipeline for printed text."""
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray_img, (5, 5), 0)
        
        # Adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 11, 2
        )
        
        return thresh
    
    def _aggressive_preprocessing(self, gray_img: np.ndarray) -> np.ndarray:
        """Aggressive preprocessing for poor quality images."""
        # Noise reduction with bilateral filter
        denoised = cv2.bilateralFilter(gray_img, 9, 75, 75)
        
        # Contrast enhancement using CLAHE
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(denoised)
        
        # Morphological operations to clean up
        kernel = np.ones((2, 2), np.uint8)
        morph = cv2.morphologyEx(enhanced, cv2.MORPH_CLOSE, kernel)
        
        # Adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            morph, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 15, 4
        )
        
        return thresh
    
    def _handwriting_preprocessing(self, gray_img: np.ndarray) -> np.ndarray:
        """Specialized preprocessing for handwritten text."""
        # Gaussian blur for smoothing
        blurred = cv2.GaussianBlur(gray_img, (3, 3), 0)
        
        # Contrast enhancement
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(blurred)
        
        # Adaptive thresholding with different parameters for handwriting
        thresh = cv2.adaptiveThreshold(
            enhanced, 255, cv2.ADAPTIVE_THRESH_MEAN_C,
            cv2.THRESH_BINARY, 15, 8
        )
        
        # Dilation to connect broken characters
        kernel = np.ones((2, 2), np.uint8)
        dilated = cv2.dilate(thresh, kernel, iterations=1)
        
        # Erosion to restore character thickness
        eroded = cv2.erode(dilated, kernel, iterations=1)
        
        return eroded
    
    def extract_text(
        self, 
        image_path: str, 
        preprocessing_type: str = "standard",
        tesseract_config: str = "--psm 6",
        save_processed: bool = False
    ) -> Dict[str, Any]:
        """
        Extract text from image using enhanced OCR.
        
        Args:
            image_path: Path to input image
            preprocessing_type: Type of preprocessing to apply
            tesseract_config: Tesseract configuration options
            save_processed: Whether to save the preprocessed image
            
        Returns:
            Dictionary containing extracted text and metadata
        """
        try:
            # Preprocess the image
            processed_img = self.preprocess_image(image_path, preprocessing_type)
            
            # Save processed image if requested
            if save_processed:
                processed_path = image_path.replace('.', '_processed.')
                cv2.imwrite(processed_path, processed_img)
                logger.info(f"Saved preprocessed image to {processed_path}")
            
            # Perform OCR
            text = pytesseract.image_to_string(processed_img, config=tesseract_config)
            
            # Get additional OCR data (confidence scores, etc.)
            ocr_data = pytesseract.image_to_data(processed_img, output_type=pytesseract.Output.DICT)
            
            # Calculate average confidence
            confidences = [int(conf) for conf in ocr_data['conf'] if int(conf) > 0]
            avg_confidence = np.mean(confidences) if confidences else 0
            
            # Clean up the extracted text
            cleaned_text = self._clean_text(text)
            
            result = {
                'text': cleaned_text,
                'raw_text': text,
                'confidence': avg_confidence,
                'preprocessing_type': preprocessing_type,
                'word_count': len(cleaned_text.split()),
                'character_count': len(cleaned_text),
                'ocr_data': ocr_data
            }
            
            logger.info(f"OCR extraction completed. Confidence: {avg_confidence:.1f}%")
            return result
            
        except Exception as e:
            logger.error(f"Error in OCR text extraction: {e}")
            raise
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize extracted text."""
        if not text:
            return ""
        
        # Remove excessive whitespace
        cleaned = ' '.join(text.split())
        
        # Remove common OCR artifacts
        artifacts = ['|', '~', '`', '^']
        for artifact in artifacts:
            cleaned = cleaned.replace(artifact, '')
        
        # Fix common OCR mistakes in scientific text
        replacements = {
            '0': 'O',  # Zero to O in chemical formulas (context-dependent)
            'l': 'I',  # lowercase l to uppercase I in specific contexts
            '5': 'S',  # Five to S in specific contexts
        }
        
        # Apply replacements carefully (you might want to make this more sophisticated)
        # For now, just return the basic cleaned text
        return cleaned.strip()
    
    def extract_text_with_multiple_methods(self, image_path: str) -> Dict[str, Any]:
        """
        Try multiple preprocessing methods and return the best result.
        
        Args:
            image_path: Path to input image
            
        Returns:
            Best OCR result with highest confidence
        """
        methods = ["standard", "aggressive", "handwriting"]
        results = []
        
        for method in methods:
            try:
                result = self.extract_text(image_path, preprocessing_type=method)
                results.append(result)
                logger.info(f"Method {method}: {result['confidence']:.1f}% confidence")
            except Exception as e:
                logger.warning(f"Method {method} failed: {e}")
                continue
        
        if not results:
            raise RuntimeError("All preprocessing methods failed")
        
        # Return the result with highest confidence
        best_result = max(results, key=lambda x: x['confidence'])
        best_result['all_results'] = results
        
        logger.info(f"Best method: {best_result['preprocessing_type']} "
                   f"({best_result['confidence']:.1f}% confidence)")
        
        return best_result


# Convenience function for quick OCR
def extract_text_from_image(image_path: str, enhanced: bool = True) -> str:
    """
    Quick function to extract text from an image.
    
    Args:
        image_path: Path to the image file
        enhanced: Whether to use enhanced preprocessing
        
    Returns:
        Extracted text string
    """
    try:
        ocr_processor = EnhancedOCR()
        
        if enhanced:
            result = ocr_processor.extract_text_with_multiple_methods(image_path)
            return result['text']
        else:
            # Simple OCR without preprocessing
            img = Image.open(image_path)
            return pytesseract.image_to_string(img)
            
    except Exception as e:
        logger.error(f"Failed to extract text from {image_path}: {e}")
        return ""


# Integrated function for OCR + Lab Note Parsing
def process_lab_note_image(image_path: str, enhanced: bool = True, db_path: str = "lab_records.db") -> Dict[str, Any]:
    """
    Process lab note image: OCR extraction + structured parsing + database storage.
    
    Args:
        image_path: Path to the lab note image
        enhanced: Whether to use enhanced OCR preprocessing
        db_path: Path to SQLite database for storage
        
    Returns:
        Complete processing results including OCR and structured data
    """
    try:
        # Import here to avoid circular imports
        from lab_note_parser import LabNoteParser
        
        # Step 1: Extract text using enhanced OCR
        ocr_processor = EnhancedOCR()
        if enhanced:
            ocr_result = ocr_processor.extract_text_with_multiple_methods(image_path)
            extracted_text = ocr_result['text']
            ocr_confidence = ocr_result['confidence']
            ocr_method = ocr_result['preprocessing_type']
        else:
            img = Image.open(image_path)
            extracted_text = pytesseract.image_to_string(img)
            ocr_confidence = 0.0
            ocr_method = "basic"
        
        # Step 2: Parse and structure the extracted text
        parser = LabNoteParser(db_path)
        structured_data = parser.process_extracted_text(extracted_text)
        
        # Step 3: Combine results
        complete_result = {
            "image_path": image_path,
            "ocr_results": {
                "extracted_text": extracted_text,
                "confidence": ocr_confidence,
                "method": ocr_method
            },
            "structured_data": structured_data,
            "processing_timestamp": datetime.now().isoformat()
        }
        
        logger.info(f"Successfully processed lab note image: {image_path}")
        return complete_result
        
    except Exception as e:
        logger.error(f"Error processing lab note image {image_path}: {e}")
        raise


# Example usage
if __name__ == "__main__":
    # Example usage
    image_path = "test_lab_note.jpg"  # Replace with actual image path
    
    try:
        ocr = EnhancedOCR()
        result = ocr.extract_text_with_multiple_methods(image_path)
        
        print("=== Enhanced OCR Results ===")
        print(f"Extracted Text:\n{result['text']}")
        print(f"\nConfidence: {result['confidence']:.1f}%")
        print(f"Best Method: {result['preprocessing_type']}")
        print(f"Word Count: {result['word_count']}")
        
    except Exception as e:
        print(f"OCR processing failed: {e}")