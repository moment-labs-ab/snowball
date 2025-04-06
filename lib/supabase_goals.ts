import 'react-native-url-polyfill/auto'
import { PostgrestError } from '@supabase/supabase-js'
import { Goal, Milestones } from '@/types/types'
import { useSupabaseClient } from './supabase'

export const insertNewGoal = async (
    name: string,
    emoji: string,
    habit_ids: { id: string; name: string }[], // Expecting an array of habit objects
    user_id: string,
    description: string,
    expectedEndDate: Date,
    milestones: object,
    color: string,
    tags?: object
): Promise<{ success: boolean; message: string; data?: Goal | PostgrestError }> => {
    const client = useSupabaseClient();

    // Insert the goal into goal_objects
    const { data, error } = await client
        .from("goal_objects")
        .insert([
            {
                name,
                emoji,
                tags,
                user_id,
                description,
                expected_end_date: expectedEndDate,
                milestones,
                color,
            },
        ])
        .select("id") // Get the new goal's ID
        .single();

    if (error || !data) {
        console.error("Error inserting goal:", error);
        return { success: false, message: "Error inserting goal", data: error };
    }

    const goalId = data.id;

    // If habit_ids exist, insert them into goal_habits
    if (habit_ids.length > 0) {
        const { error: habitError } = await client
            .from("goal_habits_reference")
            .insert(
                habit_ids.map((habit) => ({
                    goal_id: goalId,
                    habit_id: habit.id,
                    habit_name: habit.name,
                    user_id: user_id
                }))
            );

        if (habitError) {
            console.error("Error inserting habits:", habitError);
            return { success: false, message: "Goal created, but habit linking failed", data: habitError };
        }
    }

    const new_goal = await getUserSingleGoal(user_id, goalId)

    if (new_goal) {
        return { success: true, message: "Goal inserted successfully", data: new_goal };
    } else {
        return { success: true, message: "Goal not inserted successfully" };
    }
};

export const getGoalCount = async (userId: string): Promise<number | null> => {
    const client = useSupabaseClient();

    try {
        const { data, error, count } = await client
            .from('goal_objects')
            .select('id', { count: 'exact', head: true }) // Only fetch count without data
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching Goals Count:', error);
            return null;
        }
        return count ?? 0; // Return count or 0 if count is null
    } catch (error) {
        console.error('Unexpected error:', error);
        return null;
    }
}


export const updateGoal = async (
    id: string,
    user_id: string,
    name?: string,
    emoji?: string,
    habit_ids?: { id: string; name: string }[], // Expecting an array of habit objects
    description?: string,
    expectedEndDate?: Date,
    milestones?: object,
    color?: string,
    tags?: object
): Promise<{ success: boolean; message: string; data?: Goal | PostgrestError }> => {
    const client = useSupabaseClient();

    // Step 1: Update goal_objects (excluding habit_ids)
    const { data, error } = await client
        .from("goal_objects")
        .update({
            ...(name && { name }),
            ...(emoji && { emoji }),
            ...(description && { description }),
            ...(expectedEndDate && { expected_end_date: expectedEndDate }),
            ...(milestones && { milestones }),
            ...(color && { color }),
            ...(tags && { tags }),
        })
        .eq("id", id)
        .eq("user_id", user_id);

    if (error) {
        console.error("Error updating goal:", error);
        return { success: false, message: "Error updating goal", data: error };
    }

    // Step 2: If habit_ids are provided, update goal_habits table
    if (habit_ids) {
        // Start a transaction-like sequence to ensure consistency
        const { error: deleteError } = await client
            .from("goal_habits_reference")
            .delete()
            .eq("goal_id", id);

        if (deleteError) {
            console.error("Error deleting existing habit links:", deleteError);
            return { success: false, message: "Failed to update habits", data: deleteError };
        }

        if (habit_ids.length > 0) {
            const { error: insertError } = await client
                .from("goal_habits_reference")
                .insert(
                    habit_ids.map((habit) => ({
                        goal_id: id,
                        habit_id: habit.id,
                        habit_name: habit.name,
                        user_id: user_id
                    }))
                );

            if (insertError) {
                console.error("Error inserting new habits:", insertError);
                return { success: false, message: "Failed to update habits", data: insertError };
            }
        }
    }
    const updatedGoalData = await getUserSingleGoal(user_id, id)
    if (updatedGoalData) {
        return { success: true, message: "Goal updated successfully", data: updatedGoalData };

    } else {
        return { success: false, message: "Failed to update habits" };
    }
};

const getUserHabitsForGoal = async (
    goal_id: string
): Promise<{ id: string; name: string }[]> => {
    const client = useSupabaseClient();

    const { data, error } = await client
        .from("goal_habits_reference")
        .select("habit_id, habit_name")
        .eq("goal_id", goal_id);

    if (error) {
        console.error("Error fetching habits for goal:", error);
        return [];
    }

    return data.map((habit) => ({
        id: habit.habit_id,
        name: habit.habit_name,
    }));
};


export const getUserGoals = async (userId: string): Promise<Goal[]> => {
    const client = useSupabaseClient();

    const { data, error } = await client.from('goal_objects')
        .select('*')
        .eq('user_id', userId)
        .eq('accomplished', false)
        .eq('archived', false)

        .order('expected_end_date', { ascending: true });
    if (error && userId) {
        console.error('Error fetching habits:', error);
        return [];
    }
    if (data) {
        const goalsWithHabits = await Promise.all(
            data.map(async (goal) => ({
                ...goal,
                habit_ids: await getUserHabitsForGoal(goal.id),
            }))
        );
        return goalsWithHabits as Goal[];
    } else {
        return [];
    }
};

export const getUserArchivedGoals = async (userId: string): Promise<Goal[]> => {
    const client = useSupabaseClient();

    const { data, error } = await client
        .from('goal_objects')
        .select('*')
        .eq('user_id', userId)
        .or('accomplished.eq.true, archived.eq.true')


    if (error && userId) {
        console.error('Error fetching habits:', error);
        return [];
    }
    if (data) {
        const goalsWithHabits = await Promise.all(
            data.map(async (goal) => ({
                ...goal,
                habit_ids: await getUserHabitsForGoal(goal.id),
            }))
        );
        return goalsWithHabits as Goal[];
    } else {
        return [];
    }
};

export const getUserSingleGoal = async (
    userId: string,
    goal_id: string
): Promise<Goal | undefined> => {
    const client = useSupabaseClient();

    const { data, error } = await client
        .from("goal_objects")
        .select("*")
        .eq("user_id", userId)
        .eq("id", goal_id)
        .order("expected_end_date", { ascending: true })
        .single();

    if (error) {
        console.error("Error fetching goal:", error);
        return undefined;
    }

    if (!data) return undefined;

    // Fetch associated habits for the goal
    const habits = await getUserHabitsForGoal(goal_id);

    return {
        ...data,
        habit_ids: habits, // Add habits array to the goal object
    } as Goal;
};


export const addCheckToMilestone = async (userId: string, milestone_name: string) => {

}

//Defining the types for handling habit changes.
type ChangeHandler = (payload: { eventType: string; new: Goal; old: Goal }) => void;
//** DB Listener. Listens for changes in the Habit table to automatically change the user's homepage.
/* 
* @param handleChange 
* @returns 
*/
export const listenToGoalsTable = (handleChange: ChangeHandler) => {
    const client = useSupabaseClient();

    const subscription = client
        .channel('table_db_changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'goal_objects',
            },
            (payload: any) => {
                const eventType = payload.eventType;
                const newRecord = payload.new as Goal;
                const oldRecord = payload.old as Goal;
                handleChange({ eventType, new: newRecord, old: oldRecord });
            }
        )
        .subscribe();

    // Return an unsubscribe function
    return () => {
        subscription.unsubscribe();
    };
};

export const deleteGoal = async (
    id: string,
    user_id: string
): Promise<{ success: boolean; message: string; data?: any }> => {
    const client = useSupabaseClient();

    const { data, error } = await client
        .from('goal_objects')
        .delete()
        .eq('id', id)
        .eq('user_id', user_id);

    if (error) {
        console.error('Error deleting goal:', error);
        return { success: false, message: 'Error deleting goal', data: error };
    } else {
        //console.log('Goal deleted successfully:', data);
        return { success: true, message: 'Goal deleted successfully', data };
    }
};

/**
* Updates the milestones for a specific user in the goal_objects table.
*
* @param userId - The ID of the user whose milestones need to be updated.
* @param updatedMilestones - An array of milestone objects to update.
* @returns A promise with the response from Supabase.
*/
export const updateUserMilestones = async (userId: string, goalId: string, updatedMilestones: Milestones[]): Promise<void> => {
    const client = useSupabaseClient();

    try {
        // Perform the update query
        const { data, error } = await client
            .from('goal_objects')
            .update({ milestones: updatedMilestones })
            .eq('user_id', userId)
            .eq('id', goalId);

        if (error) {
            throw new Error(`Error updating milestones: ${error.message}`);
        }

        //console.log('Milestones updated successfully:', data);
    } catch (error) {
        console.error('Failed to update milestones:', error);
        throw error;
    }
}

export const archiveGoal = async (goal_id: string, userId: string): Promise<{ success: boolean; message: string; data?: any }> => {
    const client = useSupabaseClient();

    const { data, error } = await client
        .from('goal_objects')
        .update({ archived: true })
        .eq('user_id', userId)
        .eq('id', goal_id)

    if (error) {
        console.error('Error archiving goal:', error);
        return { success: false, message: 'Error archiving goal', data: error };
    } else {
        //console.log('Goal archived successfully:', data);
        return { success: true, message: 'Goal archived successfully', data };
    }
}

export const accomplishGoal = async (goal_id: string, userId: string): Promise<{ success: boolean; message: string; data?: any }> => {
    const client = useSupabaseClient();

    const { data, error } = await client
        .from('goal_objects')
        .update({ accomplished: true })
        .eq('user_id', userId)
        .eq('id', goal_id)

    if (error) {
        console.error('Error accomplishing goal:', error);
        return { success: false, message: 'Error accomplishing goal', data: error };
    } else {
        //console.log('Goal accomplished successfully:', data);
        return { success: true, message: 'Goal accomplished successfully', data };
    }
}

type HabitIds = {
    id: string;
    name: string;
};

async function getHabitsForGoal(goalId: string): Promise<HabitIds[] | null> {
    const client = useSupabaseClient();

    const { data, error } = await client
        .from("goals_habits_reference")
        .select("habit_id, habit_name")
        .eq("goal_id", goalId);

    if (error) {
        console.error("Error fetching habits for goal:", error);
        return null;
    }

    // Transform data into desired format
    const habitList: HabitIds[] = data.map((habit) => ({
        id: habit.habit_id,
        name: habit.habit_name,
    }));

    return habitList;
}


