from celery import Celery
from flask import Flask
import os

def make_celery(app):
    """Create Celery instance"""
    # Get broker and backend URLs with fallbacks
    broker = app.config.get('broker_url') or app.config.get('CELERY_BROKER_URL', 'redis://localhost:6379/0')
    backend = app.config.get('result_backend') or app.config.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')
    
    celery = Celery(
        app.import_name,
        backend=backend,
        broker=broker
    )
    
    # Use new-style configuration for Celery 5.x
    celery.conf.update(
        result_backend=backend,
        broker_url=broker,
        task_serializer='json',
        accept_content=['json'],
        result_serializer='json',
        timezone='UTC',
        enable_utc=True,
    )

    class ContextTask(celery.Task):
        """Make celery tasks work with Flask app context."""
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery

def create_celery_app():
    """Create minimal Flask app for Celery worker"""
    app = Flask(__name__)
    
    # Use only new-style Celery configuration keys
    app.config['broker_url'] = os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0')
    app.config['result_backend'] = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///lab_notebook.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    return app