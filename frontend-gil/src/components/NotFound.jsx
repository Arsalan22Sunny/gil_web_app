// NotFound.jsx
const NotFound = () => {
    const navigate = useNavigate();
  
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-gray-900">404</h1>
          <div className="mt-4 flex items-center justify-center">
            <div className="h-1 w-16 bg-indigo-600"></div>
            <p className="mx-3 text-xl font-semibold uppercase text-indigo-600">Page Not Found</p>
            <div className="h-1 w-16 bg-indigo-600"></div>
          </div>
          <p className="mt-6 text-gray-600">Sorry, we couldn't find the page you're looking for.</p>
          <div className="mt-8 space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go Back
            </button>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default NotFound;