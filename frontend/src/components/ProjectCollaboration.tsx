'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Search, 
  Mail, 
  Shield, 
  Crown, 
  Eye, 
  Edit3, 
  Trash2, 
  X,
  Check,
  Loader2
} from 'lucide-react';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ProjectCollaborationProps {
  projectId: number;
  userRole: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Member {
  id: number | null;
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  joined_at: string;
  is_owner: boolean;
  can_edit: boolean;
  can_remove: boolean;
}

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
}

export function ProjectCollaboration({ projectId, userRole, isOpen, onClose }: ProjectCollaborationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [showAddForm, setShowAddForm] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [showAvailableList, setShowAvailableList] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Fetch project members
  const { data: members = [], isLoading: membersLoading, refetch: refetchMembers } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => api.getProjectMembers(projectId),
    enabled: isOpen,
  });

  // Search users
  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['user-search', searchQuery],
    queryFn: () => api.searchUsers(searchQuery),
    enabled: searchQuery.length >= 2,
    onSuccess: (data) => {
      setTotalUsers(data.total_users);
    }
  });

  // Get available users
  const { data: availableData, isLoading: availableLoading } = useQuery({
    queryKey: ['available-users', projectId],
    queryFn: () => api.getAvailableUsers(projectId),
    enabled: isOpen && showAddForm,
    onSuccess: (data) => {
      setTotalUsers(data.total_users);
      setAvailableUsers(data.users);
    }
  });

  const searchResults = searchData?.users || [];

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: (data: { email: string; role: 'admin' | 'member' | 'viewer' }) => 
      api.addProjectMember(projectId, data),
    onSuccess: () => {
      refetchMembers();
      setShowAddForm(false);
      setSearchQuery('');
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Update member mutation
  const updateMemberMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: number; role: string }) => 
      api.updateProjectMember(projectId, memberId, role),
    onSuccess: () => {
      refetchMembers();
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (memberId: number) => api.removeProjectMember(projectId, memberId),
    onSuccess: () => {
      refetchMembers();
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const handleAddMember = () => {
    if (!selectedUser) return;
    
    addMemberMutation.mutate({
      email: selectedUser.email,
      role: selectedRole,
    });
  };

  const handleRemoveMember = (member: Member) => {
    if (member.id && window.confirm(`Remove ${member.username} from this project?`)) {
      removeMemberMutation.mutate(member.id);
    }
  };

  const handleRoleChange = (member: Member, newRole: string) => {
    if (member.id) {
      updateMemberMutation.mutate({ memberId: member.id, role: newRole });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'admin': return <Shield className="w-4 h-4 text-blue-600" />;
      case 'member': return <Edit3 className="w-4 h-4 text-green-600" />;
      case 'viewer': return <Eye className="w-4 h-4 text-gray-600" />;
      default: return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'member': return 'bg-green-100 text-green-800 border-green-200';
      case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canManageMembers = userRole === 'owner' || userRole === 'admin';

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-lab-primary" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Project Collaboration</h2>
              <p className="text-sm text-gray-600">
                Manage project members and permissions • {totalUsers} registered users
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Add Member Section */}
          {canManageMembers && (
            <div className="mb-6">
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Member</span>
                </button>
              ) : (
                <div className="card p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Add New Member</h3>
                    <button
                      onClick={() => setShowAvailableList(!showAvailableList)}
                      className="text-sm text-lab-primary hover:text-lab-primary-dark"
                    >
                      {showAvailableList ? 'Hide Available Users' : 'Show Available Users'}
                    </button>
                  </div>

                  {/* Available Users List */}
                  {showAvailableList && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700">Available Users</h4>
                        <span className="text-xs text-gray-500">
                          {availableData?.available_count || 0} can be invited
                        </span>
                      </div>
                      {availableLoading ? (
                        <div className="text-center py-2">
                          <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                          Loading...
                        </div>
                      ) : availableUsers.length > 0 ? (
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {availableUsers.slice(0, 8).map((user: User) => (
                            <button
                              key={user.id}
                              onClick={() => {
                                setSelectedUser(user);
                                setShowAvailableList(false);
                              }}
                              className="w-full p-2 text-left text-sm hover:bg-white rounded border-b border-gray-200 last:border-b-0"
                            >
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-lab-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                                  {user.full_name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{user.full_name}</p>
                                  <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                          {availableUsers.length > 8 && (
                            <p className="text-xs text-gray-500 text-center pt-2">
                              ... and {availableUsers.length - 8} more users
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-2">
                          All users are already members or no users available
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* User Search */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Users
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-10"
                        placeholder="Search by name or email..."
                      />
                    </div>
                    
                    {/* Search Results */}
                    {searchQuery.length >= 2 && (
                      <div className="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                        {searchLoading ? (
                          <div className="p-3 text-center text-gray-500">
                            <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                            Searching...
                          </div>
                        ) : searchResults.length > 0 ? (
                          searchResults.map((user: User) => (
                            <button
                              key={user.id}
                              onClick={() => {
                                setSelectedUser(user);
                                setSearchQuery('');
                              }}
                              className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-lab-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                                  {user.full_name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{user.full_name}</p>
                                  <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-center text-gray-500">No users found</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selected User */}
                  {selectedUser && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selected User
                      </label>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-lab-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {selectedUser.full_name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{selectedUser.full_name}</p>
                          <p className="text-sm text-gray-500">{selectedUser.email}</p>
                        </div>
                        <button
                          onClick={() => setSelectedUser(null)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Role Selection */}
                  {selectedUser && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'member' | 'viewer')}
                        className="input-field"
                      >
                        <option value="viewer">Viewer - Can view project and notes</option>
                        <option value="member">Member - Can view and add notes</option>
                        <option value="admin">Admin - Can manage project and members</option>
                      </select>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setSelectedUser(null);
                        setSearchQuery('');
                      }}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddMember}
                      disabled={!selectedUser || addMemberMutation.isPending}
                      className="btn-primary flex items-center space-x-2"
                    >
                      {addMemberMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span>{addMemberMutation.isPending ? 'Adding...' : 'Add Member'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Members List */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Project Members ({members.length})
            </h3>
            
            {membersLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-lab-primary mx-auto mb-2" />
                <p className="text-gray-600">Loading members...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member: Member) => (
                  <div key={member.user_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-lab-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {member.username.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.username}</p>
                        <p className="text-sm text-gray-500 flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span>{member.email}</span>
                        </p>
                        <p className="text-xs text-gray-400">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Role Badge */}
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(member.role)}`}>
                        {getRoleIcon(member.role)}
                        <span className="capitalize">{member.role}</span>
                      </div>
                      
                      {/* Role Change (for admins/owners) */}
                      {canManageMembers && member.role !== 'owner' && (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                          disabled={updateMemberMutation.isPending}
                        >
                          <option value="viewer">Viewer</option>
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                      
                      {/* Remove Button */}
                      {member.can_remove && canManageMembers && (
                        <button
                          onClick={() => handleRemoveMember(member)}
                          disabled={removeMemberMutation.isPending}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                          title="Remove member"
                        >
                          {removeMemberMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}