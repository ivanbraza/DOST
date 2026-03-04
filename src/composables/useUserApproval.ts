import { ref, computed } from 'vue'
import { supabaseAdmin } from '@/lib/supabase'
import { useToast } from 'vue-toastification'
import type { PendingUser, ApprovalAction } from '@/types/database'

/**
 * Composable for managing user registration approvals
 * Provides functionality for admins to view, approve, and reject pending user registrations
 */
export function useUserApproval() {
  const toast = useToast()

  // State
  const pendingUsers = ref<PendingUser[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const processingUserId = ref<string | null>(null)

  // Computed
  const hasPendingUsers = computed(() => pendingUsers.value.length > 0)
  const pendingCount = computed(() => pendingUsers.value.length)

  /**
   * Fetch all users who have verified their email but are not yet approved
   */
  async function fetchPendingUsers(): Promise<{ users: PendingUser[] | null; error: Error | null }> {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabaseAdmin.auth.admin.listUsers()

      if (fetchError) {
        throw fetchError
      }

      if (!data?.users) {
        pendingUsers.value = []
        return { users: [], error: null }
      }

      // Filter users who:
      // 1. Have confirmed their email (email_confirmed_at is not null)
      // 2. Have not been approved yet (user_metadata.approved === false or undefined)
      const pending = data.users.filter(user => {
        const isEmailVerified = user.email_confirmed_at !== null
        const isNotApproved = user.user_metadata?.approved === false
        return isEmailVerified && isNotApproved
      }).map(user => ({
        id: user.id,
        email: user.email ?? null,
        created_at: user.created_at ?? null,
        user_metadata: {
          full_name: user.user_metadata?.full_name,
          prefix: user.user_metadata?.prefix,
          suffix: user.user_metadata?.suffix,
          department: user.user_metadata?.department,
          position: user.user_metadata?.position,
          role: user.user_metadata?.role,
          approved: user.user_metadata?.approved,
        },
        email_confirmed_at: user.email_confirmed_at ?? null,
      })) as PendingUser[]

      pendingUsers.value = pending
      return { users: pending, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pending users'
      error.value = errorMessage
      toast.error(errorMessage)
      return { users: null, error: err as Error }
    } finally {
      loading.value = false
    }
  }

  /**
   * Approve a user registration - sets approved flag to true
   */
  async function approveUser(userId: string): Promise<{ success: boolean; error: Error | null }> {
    processingUserId.value = userId
    
    try {
      const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          user_metadata: { approved: true }
        }
      )

      if (updateError) {
        throw updateError
      }

      // Remove from pending list
      pendingUsers.value = pendingUsers.value.filter(user => user.id !== userId)
      
      toast.success('User approved successfully!')
      return { success: true, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve user'
      toast.error(errorMessage)
      return { success: false, error: err as Error }
    } finally {
      processingUserId.value = null
    }
  }

  /**
   * Reject a user registration - deletes the user account
   * @param userId - The ID of the user to reject
   * @param comment - Optional rejection reason/comment for audit purposes
   */
  async function rejectUser(userId: string, comment?: string): Promise<{ success: boolean; error: Error | null }> {
    processingUserId.value = userId

    try {
      // Get user info before deletion for logging
      const userToReject = pendingUsers.value.find(u => u.id === userId)
      
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

      if (deleteError) {
        throw deleteError
      }

      // Log rejection details (useful for audit trail)
      console.log('[User Rejection]', {
        userId,
        email: userToReject?.email,
        name: userToReject?.user_metadata?.full_name,
        rejectionReason: comment || 'No reason provided',
        rejectedAt: new Date().toISOString()
      })

      // Remove from pending list
      pendingUsers.value = pendingUsers.value.filter(user => user.id !== userId)
      
      toast.success('User registration rejected and account deleted.')
      return { success: true, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject user'
      toast.error(errorMessage)
      return { success: false, error: err as Error }
    } finally {
      processingUserId.value = null
    }
  }

  /**
   * Process user approval action (approve or reject)
   * @param userId - The ID of the user
   * @param action - 'approve' or 'reject'
   * @param comment - Optional comment (used for rejections)
   */
  async function processUserAction(
    userId: string, 
    action: ApprovalAction,
    comment?: string
  ): Promise<{ success: boolean; error: Error | null }> {
    if (action === 'approve') {
      return approveUser(userId)
    } else {
      return rejectUser(userId, comment)
    }
  }

  /**
   * Get formatted user display name
   */
  function getUserDisplayName(user: PendingUser): string {
    const prefix = user.user_metadata?.prefix && user.user_metadata.prefix !== 'None' 
      ? user.user_metadata.prefix + ' ' 
      : ''
    const name = user.user_metadata?.full_name || user.email || 'Unknown User'
    const suffix = user.user_metadata?.suffix && user.user_metadata.suffix !== 'None'
      ? ', ' + user.user_metadata.suffix
      : ''
    return `${prefix}${name}${suffix}`
  }

  /**
   * Check if a specific user is currently being processed
   */
  function isProcessing(userId: string): boolean {
    return processingUserId.value === userId
  }

  return {
    // State
    pendingUsers,
    loading,
    error,
    processingUserId,

    // Computed
    hasPendingUsers,
    pendingCount,

    // Methods
    fetchPendingUsers,
    approveUser,
    rejectUser,
    processUserAction,
    getUserDisplayName,
    isProcessing,
  }
}
