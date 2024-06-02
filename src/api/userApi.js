import axios from 'axios';

const url = 'https://courtcaller.azurewebsites.net/api';

export const fetchTeamData = async (pageNumber = 1, pageSize = 10) => {
  try {
    const response = await axios.get(`${url}/Users`, {
      params: {
        pageNumber,
        pageSize
      }
    });
    console.log('API response full data:', response.data); // In ra toàn bộ dữ liệu phản hồi từ API

    // Giả sử API trả về một mảng
    if (Array.isArray(response.data)) {
      const items = response.data;
      const totalCount = parseInt(response.headers['x-total-count'], 10) || 100; // Giả định tổng số bản ghi là 100 nếu không có header

      return {
        items,
        totalCount
      };
    } else {
      throw new Error('Invalid API response structure');
    }
  } catch (error) {
    console.error('Error fetching team data:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateUserBanStatus = async (userId, banned) => {
  try {
    const response = await axios.put(`${url}/Users/${userId}/${banned ? 'ban' : 'unban'}`);
    return response.data;
  } catch (error) {
    console.error('Error updating user ban status:', error.response ? error.response.data : error.message);
    throw error;
  }
};
