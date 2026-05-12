import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useSelector } from "react-redux";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, premiumUsers: 0, totalConnections: 0 });
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loggedInUser = useSelector((store) => store.user);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Fetch both stats and users concurrently to speed up loading
        const [statsRes, usersRes] = await Promise.all([
          axios.get(`${BASE_URL}/admin/stats`, { withCredentials: true }),
          axios.get(`${BASE_URL}/admin/users`, { withCredentials: true })
        ]);

        setStats(statsRes.data.data);
        setUsers(usersRes.data.data);
      } catch (err) {
        console.error("Admin fetch error:", err);
        setError(err.response?.data?.message || "Failed to load admin data");
      } finally {
        setIsLoading(false);
      }
    };

    if (loggedInUser?.role === "admin") {
      fetchAdminData();
    }
  }, [loggedInUser]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="alert alert-error max-w-lg shadow-lg">
          <span>❌ {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black">Admin Dashboard ⚙️</h1>
        <div className="badge badge-primary badge-lg p-4 font-bold">God Mode Enabled</div>
      </div>

      {/* 📊 STATS SECTION */}
      <div className="stats stats-vertical lg:stats-horizontal shadow-xl border border-base-300 w-full mb-10 bg-base-200">
        <div className="stat">
          <div className="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <div className="stat-title">Total Developers</div>
          <div className="stat-value text-primary">{stats.totalUsers}</div>
          <div className="stat-desc">Registered on DevNet</div>
        </div>
        
        <div className="stat">
          <div className="stat-figure text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <div className="stat-title">Premium Members</div>
          <div className="stat-value text-secondary">{stats.premiumUsers}</div>
          <div className="stat-desc">Revenue generating users</div>
        </div>
        
        <div className="stat">
          <div className="stat-figure text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </div>
          <div className="stat-title">Network Connections</div>
          <div className="stat-value text-accent">{stats.totalConnections}</div>
          <div className="stat-desc">Accepted friend requests</div>
        </div>
      </div>

      {/* 👥 USERS TABLE SECTION */}
      <div className="bg-base-100 shadow-xl rounded-box border border-base-300 overflow-hidden">
        <div className="p-4 border-b border-base-300 bg-base-200">
          <h2 className="text-xl font-bold">User Management Directory</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            {/* Table Header */}
            <thead>
              <tr className="bg-base-200">
                <th>Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            {/* Table Body */}
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="font-bold">{u.firstName} {u.lastName}</td>
                  <td>{u.emailId}</td>
                  <td>
                    <div className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-ghost'}`}>
                      {u.role.toUpperCase()}
                    </div>
                  </td>
                  <td>
                    {u.isPremium ? (
                      <span className="badge badge-secondary badge-outline badge-sm">Premium</span>
                    ) : (
                      <span className="badge badge-ghost badge-outline badge-sm">Free</span>
                    )}
                  </td>
                  <td className="text-sm opacity-70">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button className="btn btn-xs btn-outline btn-error" onClick={() => alert("Delete feature coming soon!")}>
                      Ban User
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {users.length === 0 && (
            <div className="text-center p-10 opacity-50">
              No users found in the database.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;