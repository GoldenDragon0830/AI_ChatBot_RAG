import axios from "axios";
const API_BASE_URL = 'https://soundglide.com/backend/api/westsidewok/appchat';
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
})

/**
 * Create a new group
 * @param {string} business_id - The business ID
 * @param {string} company_id - The company ID  
 * @param {string} user_id - The user ID
 * @param {string} initial_message - Initial message (optional)
 * @returns {Promise} Group data
 */
export async function createGroup(business_id, company_id, user_id, initial_message = "") {
    try {
        const res = await axios.post(
            `${API_BASE_URL}/groups`,
            {
                business_id,
                company_id,
                user_id,
                initial_message
            },
        );
        return res.data;
    } catch (error) {
        console.error("Error creating group: ", error);
        // throw error;
    }
}

/**
 * Get group by company ID and user ID
 * @param {string} company_id - The company ID
 * @param {string} user_id - The user ID
 * @returns {Promise} Group data or null
 */

export async function getGroupByCompany(company_id, user_id) {
    try {
        const res = await axios.get(`${API_BASE_URL}/groups/by-company`, {
            params: {
                company_id,
                user_id
            }
        })
        return res.data;
    } catch (error) {
        console.error("Error getting Group by Company: ", error);
        // throw error;
    }
}

/**
 * Get all messages from a group
 * @param {string} group_id - The group ID
 * @returns {Promise} Array of messages
 */
export async function getMessages(group_id) {
    try {
        const response = await axios.get(`${API_BASE_URL}/messages/${group_id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching messages:', error);
        // throw error;
    }
}

/**
 * Send a message to a group
 * @param {string} _id - Message ID
 * @param {Date} createdAt - Creation timestamp (ISO string or timestamp)
 * @param {string} text - Message text
 * @param {Object} user - User object with _id and other properties
 * @param {string} group_id - Group ID
 * @returns {Promise} Message data
 */
export async function sendMessage(_id, createdAt, text, user, group_id) {
    try {
        const response = await axios.post(`${API_BASE_URL}/messages`, {
            _id,
            createdAt,
            text,
            user,
            group_id
        });
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        // throw error;
    }
}

/**
 * Get account by company ID
 * @param {string} company_id - The company ID
 * @returns {Promise} Account data or null
 */
export async function getAccountByCompanyId(company_id) {
    try {
        const response = await apiClient.get(`/accounts/by-company/${company_id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching account by company ID:', error);
        // throw error;
    }
}

/**
 * Get company by ID
 * @param {string} company_id - The company ID
 * @returns {Promise} Company data or null
 */
export async function getCompanyById(company_id) {
    try {
        const response = await apiClient.get(`/companies/${company_id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching company by ID:', error);
        // throw error;
    }
}
