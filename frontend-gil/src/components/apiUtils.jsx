// apiUtils.js
const handleApiResponse = async (response, navigate) => {
    if (response.status === 401) {
      // Token is expired or invalid
      localStorage.removeItem('token');
      navigate('/login');
      throw new Error('Authentication token expired');
    }
    
    if (!response.ok) {
      throw new Error('API request failed');
    }
    
    return response.json();
  };
  
  const authenticatedFetch = async (url, options = {}, navigate) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      throw new Error('No authentication token found');
    }
  
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };
  
    const response = await fetch(url, {
      ...options,
      headers
    });
  
    return handleApiResponse(response, navigate);
  };
  
  export { authenticatedFetch };