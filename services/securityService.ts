
import { CitizenProfile, ViewMode } from '../types';

export class SecurityService {
  /**
   * Evaluate if a user can access a specific view mode based on their role.
   */
  static evaluateAccess(user: CitizenProfile, view: ViewMode): { allowed: boolean; reason?: string } {
    // Defensive check: If user is undefined/null, deny access
    if (!user) {
      return { allowed: false, reason: 'User profile not found.' };
    }

    // Administrator has full access
    if (user.role === 'Lurah / Admin') {
      return { allowed: true };
    }

    // Role-based Access Control (RBAC) Rules
    switch (view) {
      case ViewMode.SETTINGS:
        return { 
          allowed: false, 
          reason: 'RBAC_DENIED: Akses Pengaturan dibatasi untuk Administrator.' 
        };
      
      // Default: Allow access to all other modules for standard citizens
      default:
        return { allowed: true };
    }
  }

  /**
   * Check if a user has a specific granular permission.
   */
  static hasPermission(user: CitizenProfile, permission: string): boolean {
    if (!user) return false;

    // Admin has all permissions
    if (user.role === 'Lurah / Admin') return true;

    // Permissions map by Role
    const rolePermissions: Record<string, string[]> = {
      'Warga Berkarya': ['MARKET_MANAGE', 'POS_ACCESS', 'CREATE_PROMO'],
      'Warga Berdaya': ['POS_ACCESS'],
      'Warga Bergerak': ['PATROL_REPORT', 'EMERGENCY_BROADCAST'],
    };

    // System Settings is strictly Admin only
    if (permission === 'SYSTEM_SETTINGS') return false;

    const userPerms = rolePermissions[user.role] || [];
    return userPerms.includes(permission);
  }
}
