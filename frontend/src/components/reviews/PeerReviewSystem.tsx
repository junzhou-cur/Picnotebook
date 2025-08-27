'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Badge, Modal, ModalFooter, LoadingSpinner } from '../ui';
import { reviewService, ReviewRequest, Review, ReviewCreateRequest, ReviewSubmissionRequest } from '../../services/reviewService';
import { authService, User } from '../../services/authService';
import { format } from 'date-fns';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  MessageSquare,
  Star,
  Calendar,
  User as UserIcon,
  FileText,
  Download,
  Bell,
  Edit,
  Trash2
} from 'lucide-react';

interface PeerReviewSystemProps {
  isOpen: boolean;
  onClose: () => void;
  experimentId?: string;
  entryId?: string;
  projectId?: string;
}

export const PeerReviewSystem: React.FC<PeerReviewSystemProps> = ({
  isOpen,
  onClose,
  experimentId,
  entryId,
  projectId
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'my_reviews' | 'templates' | 'stats'>('requests');
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ReviewRequest | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [availableReviewers, setAvailableReviewers] = useState<User[]>([]);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Forms
  const [createForm, setCreateForm] = useState<ReviewCreateRequest>({
    experiment_id: experimentId || '',
    entry_id: entryId,
    assigned_to: [],
    title: '',
    description: '',
    priority: 'medium',
    review_type: 'general',
    deadline: ''
  });

  const [reviewForm, setReviewForm] = useState<ReviewSubmissionRequest>({
    request_id: '',
    status: 'approved',
    score: 5,
    summary: '',
    recommendations: [],
    comments: []
  });

  const [commentInput, setCommentInput] = useState('');
  const [recommendationInput, setRecommendationInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadRequests();
      loadAvailableReviewers();
    }
  }, [isOpen, statusFilter, typeFilter]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.review_type = typeFilter;
      if (searchQuery) params.search = searchQuery;
      
      const response = await reviewService.getReviewRequests(params);
      setRequests(response.requests);
    } catch (error) {
      console.error('Failed to load review requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableReviewers = async () => {
    try {
      const params: any = {};
      if (projectId) params.project_id = projectId;
      if (experimentId) params.experiment_id = experimentId;
      
      const reviewers = await reviewService.getAvailableReviewers(params);
      setAvailableReviewers(reviewers);
    } catch (error) {
      console.error('Failed to load available reviewers:', error);
    }
  };

  const handleCreateRequest = async () => {
    if (!createForm.title.trim() || !createForm.description.trim() || createForm.assigned_to.length === 0) {
      return;
    }

    setLoading(true);
    try {
      await reviewService.createReviewRequest(createForm);
      setShowCreateForm(false);
      setCreateForm({
        experiment_id: experimentId || '',
        entry_id: entryId,
        assigned_to: [],
        title: '',
        description: '',
        priority: 'medium',
        review_type: 'general',
        deadline: ''
      });
      await loadRequests();
    } catch (error) {
      console.error('Failed to create review request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewForm.summary.trim()) return;

    setLoading(true);
    try {
      await reviewService.submitReview(reviewForm);
      setShowReviewForm(false);
      setSelectedRequest(null);
      await loadRequests();
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRecommendation = () => {
    if (recommendationInput.trim()) {
      setReviewForm(prev => ({
        ...prev,
        recommendations: [...prev.recommendations, recommendationInput.trim()]
      }));
      setRecommendationInput('');
    }
  };

  const addComment = () => {
    if (commentInput.trim()) {
      setReviewForm(prev => ({
        ...prev,
        comments: [...prev.comments, {
          content: commentInput.trim(),
          type: 'general'
        }]
      }));
      setCommentInput('');
    }
  };

  const removeRecommendation = (index: number) => {
    setReviewForm(prev => ({
      ...prev,
      recommendations: prev.recommendations.filter((_, i) => i !== index)
    }));
  };

  const removeComment = (index: number) => {
    setReviewForm(prev => ({
      ...prev,
      comments: prev.comments.filter((_, i) => i !== index)
    }));
  };

  const toggleReviewer = (reviewerId: string) => {
    setCreateForm(prev => ({
      ...prev,
      assigned_to: prev.assigned_to.includes(reviewerId)
        ? prev.assigned_to.filter(id => id !== reviewerId)
        : [...prev.assigned_to, reviewerId]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const startReview = (request: ReviewRequest) => {
    setSelectedRequest(request);
    setReviewForm({
      request_id: request.id,
      status: 'approved',
      score: 5,
      summary: '',
      recommendations: [],
      comments: []
    });
    setShowReviewForm(true);
  };

  const sendReminder = async (requestId: string) => {
    try {
      await reviewService.sendReviewReminder(requestId);
      // Show success message
    } catch (error) {
      console.error('Failed to send reminder:', error);
    }
  };

  const generateReport = async (requestId: string) => {
    try {
      const blob = await reviewService.generateReviewReport(requestId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `review_report_${requestId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Peer Review System" size="xl">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'requests', label: 'Review Requests', icon: FileText },
              { key: 'my_reviews', label: 'My Reviews', icon: UserIcon },
              { key: 'templates', label: 'Templates', icon: Edit },
              { key: 'stats', label: 'Statistics', icon: Star },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Review Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Review Requests</h3>
                <p className="text-sm text-gray-600">Manage and track peer review requests</p>
              </div>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div>
                <Input
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="methodology">Methodology</option>
                <option value="data_analysis">Data Analysis</option>
                <option value="interpretation">Interpretation</option>
                <option value="protocol">Protocol</option>
                <option value="general">General</option>
              </select>

              <Button variant="outline" onClick={loadRequests}>
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>

            {/* Requests List */}
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <Card key={request.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{request.title}</h4>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                          <Badge className={getPriorityColor(request.priority)}>
                            {request.priority}
                          </Badge>
                          <Badge variant="default">{request.review_type}</Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{request.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <UserIcon className="w-4 h-4 mr-1" />
                            {request.requested_by.first_name} {request.requested_by.last_name}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {request.assigned_to.length} reviewer{request.assigned_to.length !== 1 ? 's' : ''}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {format(new Date(request.created_at), 'MMM d, yyyy')}
                          </div>
                          {request.deadline && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              Due: {format(new Date(request.deadline), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button  variant="outline" onClick={() => startReview(request)}>
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                        <Button  variant="outline" onClick={() => sendReminder(request.id)}>
                          <Bell className="w-4 h-4" />
                        </Button>
                        <Button  variant="outline" onClick={() => generateReport(request.id)}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                {requests.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No review requests</h3>
                    <p className="text-gray-600 mb-4">Get started by creating your first review request</p>
                    <Button onClick={() => setShowCreateForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Request
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Create Request Modal */}
        {showCreateForm && (
          <Modal 
            isOpen={showCreateForm} 
            onClose={() => setShowCreateForm(false)} 
            title="Create Review Request"
            size="lg"
          >
            <div className="space-y-4">
              <Input
                label="Title"
                value={createForm.title}
                onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief title for the review request"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Detailed description of what needs to be reviewed"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Type
                  </label>
                  <select
                    value={createForm.review_type}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, review_type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="methodology">Methodology</option>
                    <option value="data_analysis">Data Analysis</option>
                    <option value="interpretation">Interpretation</option>
                    <option value="protocol">Protocol</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <Input
                label="Deadline (Optional)"
                type="date"
                value={createForm.deadline}
                onChange={(e) => setCreateForm(prev => ({ ...prev, deadline: e.target.value }))}
              />

              {/* Reviewer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Reviewers ({createForm.assigned_to.length} selected)
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
                  {availableReviewers.map((reviewer) => (
                    <div key={reviewer.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={createForm.assigned_to.includes(reviewer.id)}
                        onChange={() => toggleReviewer(reviewer.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {reviewer.first_name} {reviewer.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{reviewer.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <ModalFooter>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRequest} loading={loading}>
                Create Request
              </Button>
            </ModalFooter>
          </Modal>
        )}

        {/* Review Form Modal */}
        {showReviewForm && selectedRequest && (
          <Modal 
            isOpen={showReviewForm} 
            onClose={() => setShowReviewForm(false)} 
            title={`Review: ${selectedRequest.title}`}
            size="lg"
          >
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-900 mb-2">Request Details</h4>
                <p className="text-sm text-gray-600">{selectedRequest.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Status
                  </label>
                  <select
                    value={reviewForm.status}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="approved">Approved</option>
                    <option value="needs_revision">Needs Revision</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={reviewForm.score}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, score: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Summary
                </label>
                <textarea
                  value={reviewForm.summary}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, summary: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Overall summary of your review..."
                  required
                />
              </div>

              {/* Recommendations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recommendations
                </label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={recommendationInput}
                    onChange={(e) => setRecommendationInput(e.target.value)}
                    placeholder="Add recommendation..."
                    onKeyPress={(e) => e.key === 'Enter' && addRecommendation()}
                  />
                  <Button  onClick={addRecommendation}>Add</Button>
                </div>
                <div className="space-y-1">
                  {reviewForm.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <span className="text-sm text-blue-800">{rec}</span>
                      <button
                        onClick={() => removeRecommendation(index)}
                        className="text-blue-600 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments
                </label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Add comment..."
                    onKeyPress={(e) => e.key === 'Enter' && addComment()}
                  />
                  <Button  onClick={addComment}>Add</Button>
                </div>
                <div className="space-y-1">
                  {reviewForm.comments.map((comment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{comment.content}</span>
                      <button
                        onClick={() => removeComment(index)}
                        className="text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <ModalFooter>
              <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitReview} loading={loading}>
                Submit Review
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};