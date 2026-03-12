import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../services/axiosInstance';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

function AnalyticsDashboard() {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const [summaryResponse, monthlyResponse] = await Promise.all([
          axiosInstance.get('/api/analytics/summary'),
          axiosInstance.get('/api/analytics/monthly')
        ]);
        setSummary(summaryResponse.data);
        setMonthly(monthlyResponse.data);
      } catch (error) {
        toast.error(error.message || 'Unable to load analytics');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return <LoadingSkeleton lines={8} />;
  }

  return (
    <div className="container">
      <div className="row g-4 mb-4">
        {Object.entries(summary || {}).map(([key, value]) => (
          <div className="col-12 col-md-6 col-xl-3" key={key}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <p className="text-uppercase small text-secondary mb-2">{key}</p>
                <p className="display-6 mb-0">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h1 className="h4 mb-3">Monthly publishing volume</h1>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Posts created</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(monthly || {}).map(([month, count]) => (
                  <tr key={month}>
                    <td>{month}</td>
                    <td>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;