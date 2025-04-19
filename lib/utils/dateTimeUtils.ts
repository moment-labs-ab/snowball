
export const getUtcTimeString = (date: Date): string => {
    const timeString = date.getUTCHours().toString().padStart(2, '0') + ':' +
        date.getUTCMinutes().toString().padStart(2, '0');

    return timeString;
}

export const getDateISOStringFromUtcTimeString = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    
    // Set the time to the provided UTC hours and minutes
    date.setUTCHours(hours, minutes, 0, 0);
    
    return date.toISOString();
}