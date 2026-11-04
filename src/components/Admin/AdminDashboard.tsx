import React, { useState, useEffect } from 'react';
import api from '../../services/api'; 
import { Trash2, Edit, X, Save, Search } from 'lucide-react';

interface UserData {
  id: number;
  username: string;
  role: string;
  created_at: string;
  proficiencyLevel?: string;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editForm, setEditForm] = useState({
    username: '',
    password: '',
    role: 'user',
    proficiencyLevel: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleEditClick = async (user: UserData) => {
    try {
      // Fetch full details including level
      const response = await api.get(`/admin/users/${user.id}`);
      const fullUser = response.data;
      
      setEditingUser(fullUser);
      setEditForm({
        username: fullUser.username,
        password: '', // Don't show hash
        role: fullUser.role || 'user',
        proficiencyLevel: fullUser.proficiencyLevel || ''
      });
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;

    try {
      await api.put(`/admin/users/${editingUser.id}`, editForm);
      setEditingUser(null);
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 p-8 overflow-y-auto transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage users and system settings</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-100 dark:hover:border-blue-900 transition-all group"
            >
              <div className="bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 p-2 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </div>
              <span className="font-semibold">Exit Admin</span>
            </button>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Total Users</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{users.length}</p>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Admins</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex items-center">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="flex-1 outline-none text-gray-700 dark:text-gray-200 bg-transparent ml-3 placeholder-gray-400 dark:placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">ID</th>
                <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">User</th>
                <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Role</th>
                <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Created At</th>
                <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">No users found.</td></tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400">#{user.id}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{user.username}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                          : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => handleEditClick(user)}
                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(user.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200 transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit User</h2>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={editForm.username}
                  onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
                </label>
                <input 
                  type="password" 
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={editForm.password}
                  onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select 
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={editForm.role}
                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proficiency Level</label>
                <select 
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={editForm.proficiencyLevel}
                  onChange={(e) => setEditForm({...editForm, proficiencyLevel: e.target.value})}
                >
                  <option value="">Not Set</option>
                  <option value="Principiante">Principiante</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzato">Avanzato</option>
                  <option value="Esperto">Esperto</option>
                  <option value="Madrelingua">Madrelingua</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button 
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200 transition-colors">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete User?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
