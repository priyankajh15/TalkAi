import { useState, useEffect } from 'react';
import { getCurrentEndpoint } from '../services/apiConfig';

const ServerStatus = () => {
  const [endpoint, setEndpoint] = useState(getCurrentEndpoint());

  useEffect(() => {
    // Check endpoint every 5 seconds
    const interval = setInterval(() => {
      setEndpoint(getCurrentEndpoint());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    return endpoint === 'primary' ? 'bg-green-500' : 'bg-yellow-500';
  };

  const getStatusText = () => {
    return endpoint === 'primary' ? 'Fly.io (Fast)' : 'Render (Backup)';
  };

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg text-sm">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`}></div>
      <span className="text-gray-700 dark:text-gray-300">
        Server: <span className="font-semibold">{getStatusText()}</span>
      </span>
    </div>
  );
};

export default ServerStatus;
