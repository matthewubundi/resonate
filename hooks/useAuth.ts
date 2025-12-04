import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

/**
 * Hook to protect routes that require authentication
 * Redirects to login if user is not authenticated
 */
export const useRequireAuth = (redirectTo: () => void) => {
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            redirectTo();
        }
    }, [user, loading, redirectTo]);

    return { user, loading };
};

/**
 * Hook to get the current user's profile data
 */
export const useUserProfile = () => {
    const { user } = useAuth();

    if (!user) return null;

    return {
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name || '',
        avatarUrl: user.user_metadata?.avatar_url || '',
        createdAt: user.created_at,
    };
};
