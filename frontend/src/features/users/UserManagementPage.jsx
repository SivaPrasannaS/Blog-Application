import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { activateUserAsync, clearUsersError, deactivateUserAsync, fetchUsersAsync, updateUserRoleAsync } from './usersSlice';

const ALLOWED_ROLE_OPTIONS = ['ROLE_USER', 'ROLE_MANAGER'];

function UserManagementPage() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.users);
  const visibleUsers = items.filter((user) => !user.roles.includes('ROLE_ADMIN'));

  useEffect(() => {
    dispatch(fetchUsersAsync());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearUsersError());
    }
  }, [dispatch, error]);

  const handleRoleChange = async (id, role) => {
    try {
      await dispatch(updateUserRoleAsync({ id, role })).unwrap();
      toast.success('Role updated');
    } catch {
      // Errors are surfaced once through the slice error effect.
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await dispatch(deactivateUserAsync(id)).unwrap();
      toast.success('User deactivated');
    } catch {
      // Errors are surfaced once through the slice error effect.
    }
  };

  const handleActivate = async (id) => {
    try {
      await dispatch(activateUserAsync(id)).unwrap();
      toast.success('User activated');
    } catch {
      // Errors are surfaced once through the slice error effect.
    }
  };

  return (
    <div className="container">
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="h4 mb-0">User management</h1>
            {loading ? <span className="spinner-border spinner-border-sm" aria-hidden="true" /> : null}
          </div>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={ALLOWED_ROLE_OPTIONS.includes(user.roles[0]) ? user.roles[0] : 'ROLE_USER'}
                        onChange={(event) => handleRoleChange(user.id, event.target.value)}
                      >
                        <option value="ROLE_USER">ROLE_USER</option>
                        <option value="ROLE_MANAGER">ROLE_MANAGER</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${user.active ? 'text-bg-success' : 'text-bg-secondary'}`}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-end">
                      {user.active ? (
                        <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleDeactivate(user.id)}>
                          Deactivate
                        </button>
                      ) : (
                        <button type="button" className="btn btn-outline-success btn-sm" onClick={() => handleActivate(user.id)}>
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {visibleUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-secondary py-4">No managed users available.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserManagementPage;