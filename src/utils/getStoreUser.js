export const getStoredUser = () => {
    try {
        const item = localStorage.getItem('user');
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.log("Failed to parse stored user!")
        return null;
    }
}