'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, 
  X, 
  Users, 
  Link2, 
  Mail, 
  Eye, 
  Edit3, 
  Copy, 
  Trash2, 
  Plus,
  Clock,
  Globe,
  Shield,
  AlertTriangle,
  Check
} from 'lucide-react';
import { StorageBox } from '@/types/storage';
import { SharePermission, ShareLink, SharedStorageBox, SAMPLE_SHARED_STORAGE_BOXES } from '@/types/sharing';

interface StorageBoxSharingManagerProps {
  isOpen: boolean;
  onClose: () => void;
  storageBox: StorageBox;
}

export function StorageBoxSharingManager({ isOpen, onClose, storageBox }: StorageBoxSharingManagerProps) {
  const [activeTab, setActiveTab] = useState<'people' | 'links' | 'settings'>('people');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePermission, setInvitePermission] = useState<'view' | 'edit'>('view');
  const [inviteMessage, setInviteMessage] = useState('');
  
  // Mock shared storage box data
  const sharedBox = SAMPLE_SHARED_STORAGE_BOXES.find(sb => sb.storageBoxId === storageBox.id) || {
    storageBoxId: storageBox.id,
    ownerId: 'current-user',
    ownerName: 'Current User',
    permissions: [],
    shareLinks: [],
    isPublic: false,
    lastUpdated: new Date().toISOString()
  };

  const [linkSettings, setLinkSettings] = useState({
    permission: 'view' as 'view' | 'edit',
    expiresIn: '30', // days
    maxUses: 10,
    allowAnonymous: true
  });

  // Generate share link
  const generateShareLink = () => {
    const expiresAt = linkSettings.expiresIn ? 
      new Date(Date.now() + parseInt(linkSettings.expiresIn) * 24 * 60 * 60 * 1000).toISOString() : 
      undefined;

    const newLink: ShareLink = {
      id: `link-${Date.now()}`,
      token: Math.random().toString(36).substr(2, 12),
      permission: linkSettings.permission,
      expiresAt,
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
      maxUses: linkSettings.maxUses > 0 ? linkSettings.maxUses : undefined,
      currentUses: 0,
      status: 'active',
      allowAnonymous: linkSettings.allowAnonymous
    };

    // In real app, save to backend
    console.log('Generated share link:', newLink);
    setShowLinkModal(false);
    
    // Show success message
    alert(`Share link generated! Token: ${newLink.token}`);
  };

  // Send invitation
  const sendInvitation = () => {
    if (!inviteEmail) return;

    const newPermission: SharePermission = {
      id: `perm-${Date.now()}`,
      userId: `user-${Date.now()}`,
      userEmail: inviteEmail,
      userName: inviteEmail.split('@')[0], // Extract name from email
      permission: invitePermission,
      grantedBy: 'current-user',
      grantedAt: new Date().toISOString(),
      status: 'pending'
    };

    // In real app, send to backend
    console.log('Sent invitation:', { email: inviteEmail, permission: invitePermission, message: inviteMessage });
    
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteMessage('');
    
    alert(`Invitation sent to ${inviteEmail}!`);
  };

  // Copy link to clipboard
  const copyLink = (token: string) => {
    const url = `${window.location.origin}/shared/storage-box/${storageBox.id}?token=${token}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Share2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Share Storage Box</h2>
                <p className="text-sm text-gray-500">{storageBox.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('people')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'people'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>People ({sharedBox.permissions.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'links'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Link2 className="w-4 h-4" />
                <span>Links ({sharedBox.shareLinks.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'settings'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Settings</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* People Tab */}
          {activeTab === 'people' && (
            <div className="space-y-6">
              {/* Add People Button */}
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Invite People</span>
              </button>

              {/* Current Permissions */}
              <div className="space-y-4">
                {/* Owner */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {sharedBox.ownerName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{sharedBox.ownerName} (You)</p>
                      <p className="text-sm text-gray-500">Owner</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Owner
                    </span>
                  </div>
                </div>

                {/* Shared Permissions */}
                {sharedBox.permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {permission.userName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{permission.userName}</p>
                        <p className="text-sm text-gray-500">{permission.userEmail}</p>
                        {permission.expiresAt && (
                          <p className="text-xs text-yellow-600 flex items-center space-x-1 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>Expires {new Date(permission.expiresAt).toLocaleDateString()}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={permission.permission}
                        onChange={(e) => {
                          // Update permission in real app
                          console.log(`Updated ${permission.userEmail} to ${e.target.value}`);
                        }}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="view">Can View</option>
                        <option value="edit">Can Edit</option>
                      </select>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${permission.userName}'s access?`)) {
                            console.log(`Removed ${permission.userEmail}`);
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {sharedBox.permissions.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No one else has access to this storage box</p>
                    <p className="text-gray-400 text-sm">Invite people to collaborate</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Links Tab */}
          {activeTab === 'links' && (
            <div className="space-y-6">
              {/* Create Link Button */}
              <button
                onClick={() => setShowLinkModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Share Link</span>
              </button>

              {/* Current Links */}
              <div className="space-y-4">
                {sharedBox.shareLinks.map((link) => (
                  <div key={link.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Link2 className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-900">Share Link</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          link.permission === 'edit' 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {link.permission === 'edit' ? 'Can Edit' : 'Can View'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyLink(link.token)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Copy Link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Disable this share link?')) {
                              console.log(`Disabled link ${link.id}`);
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Disable Link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center space-x-4">
                        <span>Uses: {link.currentUses}{link.maxUses ? `/${link.maxUses}` : ''}</span>
                        {link.expiresAt && (
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Expires {new Date(link.expiresAt).toLocaleDateString()}</span>
                          </span>
                        )}
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          link.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {link.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Created {new Date(link.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}

                {sharedBox.shareLinks.length === 0 && (
                  <div className="text-center py-12">
                    <Link2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No share links created</p>
                    <p className="text-gray-400 text-sm">Create links for easy sharing</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-yellow-800">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">General Access Settings</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Control who can access this storage box and what they can do
                </p>
              </div>

              {/* Public Access */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Public Access</h3>
                      <p className="text-sm text-gray-500">Allow anyone with the link to access</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sharedBox.isPublic}
                      onChange={(e) => {
                        console.log('Toggle public access:', e.target.checked);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>

              {/* Link Expiration Policy */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Default Link Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Permission</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="view">View Only</option>
                      <option value="edit">Can Edit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Expiration</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="7">7 days</option>
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                      <option value="">Never</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <h3 className="font-medium text-red-900 mb-3">Danger Zone</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      if (confirm('Remove all shared access? This cannot be undone.')) {
                        console.log('Revoke all access');
                      }
                    }}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Revoke All Access
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Invite Modal */}
        <AnimatePresence>
          {showInviteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90] p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg shadow-xl max-w-lg w-full"
              >
                <div className="border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Invite People</h3>
                    <button
                      onClick={() => setShowInviteModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@lab.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Permission Level</label>
                    <select
                      value={invitePermission}
                      onChange={(e) => setInvitePermission(e.target.value as 'view' | 'edit')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="view">Can View - Read-only access</option>
                      <option value="edit">Can Edit - Full access to modify</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                    <textarea
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      rows={3}
                      placeholder="Add a personal message..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setShowInviteModal(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={sendInvitation}
                      disabled={!inviteEmail}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                    >
                      Send Invite
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Create Link Modal */}
        <AnimatePresence>
          {showLinkModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90] p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg shadow-xl max-w-lg w-full"
              >
                <div className="border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Create Share Link</h3>
                    <button
                      onClick={() => setShowLinkModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Permission</label>
                      <select
                        value={linkSettings.permission}
                        onChange={(e) => setLinkSettings(prev => ({...prev, permission: e.target.value as 'view' | 'edit'}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="view">View Only</option>
                        <option value="edit">Can Edit</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expires In</label>
                      <select
                        value={linkSettings.expiresIn}
                        onChange={(e) => setLinkSettings(prev => ({...prev, expiresIn: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="1">1 day</option>
                        <option value="7">7 days</option>
                        <option value="30">30 days</option>
                        <option value="">Never</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses (0 = unlimited)</label>
                    <input
                      type="number"
                      value={linkSettings.maxUses}
                      onChange={(e) => setLinkSettings(prev => ({...prev, maxUses: parseInt(e.target.value) || 0}))}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="allowAnonymous"
                      checked={linkSettings.allowAnonymous}
                      onChange={(e) => setLinkSettings(prev => ({...prev, allowAnonymous: e.target.checked}))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="allowAnonymous" className="text-sm text-gray-700">
                      Allow anonymous access (no login required)
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setShowLinkModal(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={generateShareLink}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Generate Link
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}