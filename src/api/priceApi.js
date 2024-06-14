import axios from 'axios';


const url = 'https://courtcaller.azurewebsites.net/api';
export const fetchPrice = async (branchId) => {
  try {
    const response = await axios.post(`${url}/Prices/showprice`, null, {
      params: {
        branchId
      }
    });

    return {
      weekdayPrice: response.data.weekdayPrice,
      weekendPrice: response.data.weekendPrice,
    };
  } catch (error) {
    console.error('Error fetching prices', error);
    throw error;
  }
};
