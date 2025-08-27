export interface SharePermission {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userAvatar?: string;
  permission: 'view' | 'edit';
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  status: 'active' | 'pending' | 'revoked';
}

export interface ShareLink {
  id: string;
  token: string;
  permission: 'view' | 'edit';
  expiresAt?: string;
  createdBy: string;
  createdAt: string;
  maxUses?: number;
  currentUses: number;
  status: 'active' | 'disabled';
  allowAnonymous: boolean;
}

export interface SharedStorageBox {
  storageBoxId: string;
  ownerId: string;
  ownerName: string;
  permissions: SharePermission[];
  shareLinks: ShareLink[];
  isPublic: boolean;
  publicPermission?: 'view' | 'edit';
  lastUpdated: string;
}

export interface ShareInvite {
  id: string;
  email: string;
  permission: 'view' | 'edit';
  message?: string;
  storageBoxId: string;
  storageBoxName: string;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

// Mock data for demonstration
export const SAMPLE_SHARED_STORAGE_BOXES: SharedStorageBox[] = [
  {
    storageBoxId: 'box1',
    ownerId: 'current-user',
    ownerName: 'Current User',
    permissions: [
      {
        id: 'perm-1',
        userId: 'user-2',
        userEmail: 'colleague@lab.com',
        userName: 'Lab Colleague',
        permission: 'edit',
        grantedBy: 'current-user',
        grantedAt: '2024-08-01T10:00:00Z',
        status: 'active'
      },
      {
        id: 'perm-2',
        userId: 'user-3',
        userEmail: 'student@university.edu',
        userName: 'Graduate Student',
        permission: 'view',
        grantedBy: 'current-user',
        grantedAt: '2024-08-05T14:30:00Z',
        expiresAt: '2024-09-05T14:30:00Z',
        status: 'active'
      }
    ],
    shareLinks: [
      {
        id: 'link-1',
        token: 'abc123def456',
        permission: 'view',
        expiresAt: '2024-09-15T23:59:59Z',
        createdBy: 'current-user',
        createdAt: '2024-08-10T09:15:00Z',
        currentUses: 3,
        maxUses: 10,
        status: 'active',
        allowAnonymous: true
      }
    ],
    isPublic: false,
    lastUpdated: '2024-08-15T16:20:00Z'
  }
];

export const SAMPLE_SHARE_INVITES: ShareInvite[] = [
  {
    id: 'invite-1',
    email: 'newmember@lab.com',
    permission: 'edit',
    message: 'Welcome to our plasmid collection! You now have edit access.',
    storageBoxId: 'box1',
    storageBoxName: 'Plasmids Box 1',
    invitedBy: 'current-user',
    invitedAt: '2024-08-20T11:00:00Z',
    expiresAt: '2024-08-27T11:00:00Z',
    status: 'pending'
  }
];