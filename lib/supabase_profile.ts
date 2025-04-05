import 'react-native-url-polyfill/auto'
import { LifetimeHabitStats } from '@/types/types'
import { useSupabaseClient } from './supabase';

export async function getUserLoginCount(user_id: string): Promise<number> {
    try {
        const client = useSupabaseClient();

        const { data, error, count } = await client
            .from('user_logins')
            .select('id', { count: 'exact', head: true }) // Only fetch count without data
            .eq('user_id', user_id);

        if (error) {
            console.error('Error fetching unique login count:', error);
            return 0;
        }

        return count ?? 0; // Return count or 0 if count is null
    } catch (error) {
        console.error('Unexpected error:', error);
        return 0;
    }
}




export const getLifetimeHabitStats = async (
    user_id: string
): Promise<LifetimeHabitStats | null> => {
    const client = useSupabaseClient();

    // Get user join date
    const { data: loginData, error: loginError } = await client
        .from('user_logins')
        .select('logged_in_at')
        .eq('user_id', user_id)
        .order('logged_in_at', { ascending: true })
        .limit(1)
        .single();

    if (loginError) throw loginError;

    // Get all habits and their creation dates
    const { data: habitsData, error: habitsError } = await client
        .from('habits')
        .select('id, name, created_at')
        .eq('user_id', user_id);

    if (habitsError) throw habitsError;

    // Get all tracking history
    const { data: trackingData, error: trackingError } = await client
        .from('habit_tracking_history')
        .select('habit_id, tracked_habit_date')
        .eq('user_id', user_id)
        .order('tracked_habit_date', { ascending: true });

    if (trackingError) throw trackingError;

    // Calculate total days tracked
    const totalDaysTracked = trackingData.length;

    // Calculate habit frequencies and find most consistent habit
    const habitFrequency: { [key: string]: number } = {};
    habitsData.forEach(habit => {
        habitFrequency[habit.id] = trackingData.filter(
            track => track.habit_id === habit.id
        ).length;
    });

    const mostFrequentHabitId = Object.entries(habitFrequency).reduce(
        (a, b) => (b[1] > a[1] ? b : a)
    )[0];

    const mostConsistentHabit = habitsData.find(
        h => h.id === mostFrequentHabitId
    )?.name || '';

    const completionRates = habitsData.map(habit => {
        const habitStartDate = new Date(habit.created_at);
        const totalPossibleDays = Math.max(1, Math.floor(
            (new Date().getTime() - habitStartDate.getTime()) / (1000 * 60 * 60 * 24)
        ));
        const daysTracked = habitFrequency[habit.id] || 0;

        // Ensure we don't divide by zero and cap at 100%
        return Math.min(100, (daysTracked / totalPossibleDays) * 100);
    }).filter(rate => !isNaN(rate) && isFinite(rate)); // Filter out any NaN or Infinity values

    // Calculate average completion rate
    const completionRate = completionRates.length
        ? completionRates.reduce((a, b) => a + b, 0) / completionRates.length
        : 0;

    // Calculate current/most recent longest streak
    let longestStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    habitsData.forEach(habit => {
        const habitTracking = trackingData
            .filter(track => track.habit_id === habit.id)
            .map(track => new Date(track.tracked_habit_date))
            .sort((a, b) => b.getTime() - a.getTime()); // Sort in descending order to start from most recent

        if (habitTracking.length === 0) return;

        let currentStreak = 1;
        const mostRecent = habitTracking[0];
        mostRecent.setHours(0, 0, 0, 0);

        // If the most recent tracking is not today or yesterday, streak is 0
        const daysSinceLastTracking = Math.floor(
            (today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastTracking > 1) {
            longestStreak = Math.max(longestStreak, 0);
            return;
        }

        // Calculate current streak
        for (let i = 1; i < habitTracking.length; i++) {
            const current = habitTracking[i];
            const previous = habitTracking[i - 1];
            current.setHours(0, 0, 0, 0);
            previous.setHours(0, 0, 0, 0);

            const dayDiff = Math.floor(
                (previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (dayDiff === 1) {
                currentStreak++;
            } else {
                break; // Stop counting as soon as we find a break in the streak
            }
        }

        longestStreak = Math.max(longestStreak, currentStreak);
    });

    return {
        totalDaysTracked,
        completionRate,
        mostConsistentHabit,
        longestStreak,
        joinDate: new Date(loginData.logged_in_at)
    };
};

export const updateHabitOrder = async (habitId: string, newOrder: number) => {
    const client = useSupabaseClient();

    const { data, error } = await client
        .from('habits')
        .update({ order: newOrder })
        .eq('id', habitId);

    if (error) {
        console.error('Error updating habit order:', error);
        return false;
    }
    return true;
};

export const sendFeedback = async (
    userId: string,
    email: string,
    subject: string,
    description: string,
    type: string) => {
    const client = useSupabaseClient();

    const { data, error } = await client
        .from('feedback')
        .insert({ user_id: userId, email, subject, description, type, status: 'new' })
        .single(); // Use .single() to get the inserted row or error

    if (error) {
        console.error('Error Sending Feedback', error);
        return { success: false, message: 'Error Sending Feedback', data: error };
    } else {
        //console.log('Sent feedback successfully:', data, error);
        return { success: true, message: 'Sent feedback successfully', data };
    }

}

export const updateUserSetting = async (
    settingName: string,
    settingValue: string
): Promise<boolean | string> => {
    const client = useSupabaseClient();

    const { data, error } = await client.auth.getUser();

    if (error) {
        console.error("Error fetching user when updating user:", error);
        return error.message;
    }

    if (!data) return "User not found";

    if (settingName === "email") {
        const result = await client.auth.updateUser({ email: settingValue });
        if (result.error) {
            console.error("Error updating email:", result.error);
            return result.error.message;
        }
        return true;
    }

    if (settingName === "name") {
        const { error } = await client
            .from("profiles")
            .update({ full_name: settingValue })
            .eq("id", data.user.id);

        if (error) {
            //console.error("Error updating username:", error.message);
            return error.message;
        }
        return true;
    }

    if (settingName === "password") {
        const { error } = await client.auth.updateUser({
            password: settingValue,
        });

        if (error) {
            //console.log("Error updating password:", error.message);
            return error.message;
        }
        return true;
    }

    return "Invalid setting name";
};
