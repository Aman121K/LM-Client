import React from 'react';
import './UserStatistics.css';

const UserStatistics = ({ users, teamLeads }) => {
  const calculateStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.loginstatus === 1).length;
    const inactiveUsers = totalUsers - activeUsers;
    
    const roleStats = {
      admin: users.filter(user => user.usertype === 'admin').length,
      tl: users.filter(user => user.usertype === 'tl').length,
      user: users.filter(user => user.usertype === 'user').length
    };
    
    const usersWithTL = users.filter(user => user.tl_name).length;
    const usersWithoutTL = totalUsers - usersWithTL;
    
    const recentUsers = users.filter(user => {
      const regDate = new Date(user.RegDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return regDate > thirtyDaysAgo;
    }).length;
    
    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      roleStats,
      usersWithTL,
      usersWithoutTL,
      recentUsers
    };
  };

  const stats = calculateStats();

  const getPercentage = (value, total) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  return (
    <div className="user-statistics">
      <h3>User Statistics</h3>
      
      <div className="stats-grid">
        <div className="stat-card total-users">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>

        <div className="stat-card active-users">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeUsers}</div>
            <div className="stat-label">Active Users</div>
            <div className="stat-percentage">
              {getPercentage(stats.activeUsers, stats.totalUsers)}%
            </div>
          </div>
        </div>

        <div className="stat-card inactive-users">
          <div className="stat-icon">🔴</div>
          <div className="stat-content">
            <div className="stat-value">{stats.inactiveUsers}</div>
            <div className="stat-label">Inactive Users</div>
            <div className="stat-percentage">
              {getPercentage(stats.inactiveUsers, stats.totalUsers)}%
            </div>
          </div>
        </div>

        <div className="stat-card recent-users">
          <div className="stat-icon">🆕</div>
          <div className="stat-content">
            <div className="stat-value">{stats.recentUsers}</div>
            <div className="stat-label">New (30 days)</div>
            <div className="stat-percentage">
              {getPercentage(stats.recentUsers, stats.totalUsers)}%
            </div>
          </div>
        </div>
      </div>

      <div className="stats-details">
        <div className="role-breakdown">
          <h4>Role Breakdown</h4>
          <div className="role-stats">
            <div className="role-stat">
              <span className="role-icon">👑</span>
              <span className="role-name">Admins</span>
              <span className="role-count">{stats.roleStats.admin}</span>
            </div>
            <div className="role-stat">
              <span className="role-icon">👥</span>
              <span className="role-name">Team Leads</span>
              <span className="role-count">{stats.roleStats.tl}</span>
            </div>
            <div className="role-stat">
              <span className="role-icon">👤</span>
              <span className="role-name">Users</span>
              <span className="role-count">{stats.roleStats.user}</span>
            </div>
          </div>
        </div>

        <div className="tl-assignment">
          <h4>Team Lead Assignment</h4>
          <div className="tl-stats">
            <div className="tl-stat">
              <span className="tl-label">Assigned to TL</span>
              <span className="tl-count">{stats.usersWithTL}</span>
            </div>
            <div className="tl-stat">
              <span className="tl-label">Not Assigned</span>
              <span className="tl-count">{stats.usersWithoutTL}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatistics;
