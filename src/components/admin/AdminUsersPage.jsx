// src/components/admin/AdminUsersPage.jsx - Fixed to work with correct API
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    UserIcon,
    PencilIcon,
    TrashIcon,
    CheckIcon,
    XMarkIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    ServerIcon
} from '@heroicons/react/24/outline';

// Services
import adminUserService from '../../services/adminUserService.js';

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [connectionError, setConnectionError] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [departmentFilter, setDepartmentFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterAndSortUsers();
    }, [users, searchTerm, roleFilter, statusFilter, departmentFilter, sortBy, sortOrder]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setConnectionError(false);

            // Fetch users and roles from the correct API endpoints
            const [usersResponse, rolesResponse] = await Promise.all([
                adminUserService.getAllUsers(),
                adminUserService.getAllRoles()
            ]);

            // Process users data to include computed status
            const processedUsers = (usersResponse.data || []).map(user => ({
                ...user,
                // Compute status based on user properties
                status: getUserStatus(user),
                // Ensure roles is always an array
                roles: user.roles || ['USER']
            }));

            setUsers(processedUsers);
            setRoles(rolesResponse.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setConnectionError(true);

            // Show user-friendly error message
            toast.error('Failed to load user data. Please check if the backend services are running.');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to determine user status based on API properties
    const getUserStatus = (user) => {
        if (!user.enabled) {
            return 'INACTIVE';
        } else if (!user.accountNonLocked) {
            return 'SUSPENDED';
        } else if (!user.accountNonExpired) {
            return 'EXPIRED';
        } else {
            return 'ACTIVE';
        }
    };

    const filterAndSortUsers = () => {
        let filtered = [...users];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(user =>
                `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.username?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Role filter
        if (roleFilter !== 'ALL') {
            filtered = filtered.filter(user =>
                user.roles && user.roles.includes(roleFilter)
            );
        }

        // Status filter
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(user => user.status === statusFilter);
        }

        // Department filter
        if (departmentFilter !== 'ALL') {
            filtered = filtered.filter(user => user.department === departmentFilter);
        }

        // Sort
        filtered.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (sortBy === 'name') {
                aValue = `${a.firstName} ${a.lastName}`;
                bValue = `${b.firstName} ${b.lastName}`;
            }

            if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setFilteredUsers(filtered);
        setCurrentPage(1);
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;

        try {
            setActionLoading(true);
            await adminUserService.deleteUser(selectedUser.id);

            setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
            toast.success('User deleted successfully');
            setShowDeleteModal(false);
            setSelectedUser(null);
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error(error.message || 'Failed to delete user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleUserStatus = async (userId, currentStatus) => {
        try {
            setActionLoading(true);

            if (currentStatus === 'ACTIVE') {
                await adminUserService.deactivateUser(userId);
            } else {
                await adminUserService.activateUser(userId);
            }

            const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            setUsers(prev => prev.map(user =>
                user.id === userId
                    ? { ...user, status: newStatus, enabled: newStatus === 'ACTIVE' }
                    : user
            ));

            toast.success(`User ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            console.error('Error updating user status:', error);
            toast.error(error.message || 'Failed to update user status');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badgeClasses = {
            'ACTIVE': 'bg-green-100 text-green-800',
            'INACTIVE': 'bg-red-100 text-red-800',
            'SUSPENDED': 'bg-orange-100 text-orange-800',
            'EXPIRED': 'bg-yellow-100 text-yellow-800'
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClasses[status] || 'bg-gray-100 text-gray-800'}`}>
                {status || 'Unknown'}
            </span>
        );
    };

    const getRoleBadges = (roles) => {
        if (!roles || roles.length === 0) return null;

        return roles.map(role => (
            <span key={role} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1">
                {role}
            </span>
        ));
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    // Pagination logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    // Get unique departments for filter
    const departments = [...new Set(users.map(user => user.department).filter(Boolean))];

    const Card = ({ children, className = '' }) => (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
            {children}
        </div>
    );

    const Button = ({ children, variant = 'primary', onClick, disabled = false, className = '' }) => {
        const baseClasses = 'inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
        const variants = {
            primary: 'border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
            outline: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
            danger: 'border-transparent bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
        };

        return (
            <button
                onClick={onClick}
                disabled={disabled}
                className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            >
                {children}
            </button>
        );
    };

    const Loader = () => (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    );

    const Modal = ({ isOpen, onClose, title, children }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
                    <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                        {title}
                                    </h3>
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
            >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                        <p className="mt-1 text-gray-600">
                            Manage user accounts, roles, and permissions
                        </p>
                        {connectionError && (
                            <div className="mt-2 flex items-center text-red-600">
                                <ServerIcon className="h-5 w-5 mr-1" />
                                <span className="text-sm font-medium">
                                    Unable to connect to user service. Please check backend services.
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Button
                            onClick={() => toast.info('User creation feature coming soon!')}
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Add User
                        </Button>
                    </div>
                </div>

                {/* Filters and Search */}
                <Card className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search Users
                            </label>
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Search by name, email, or username..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Role Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>
                            <select
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="ALL">All Roles</option>
                                {roles.map(role => (
                                    <option key={role.name} value={role.name}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="SUSPENDED">Suspended</option>
                                <option value="EXPIRED">Expired</option>
                            </select>
                        </div>

                        {/* Department Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Department
                            </label>
                            <select
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                            >
                                <option value="ALL">All Departments</option>
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>
                                        {dept}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sort By
                            </label>
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                >
                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Users Table */}
                <Card>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                                <UserIcon className="h-6 w-6 text-gray-500" />
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {connectionError
                                    ? 'Unable to load users. Please check backend connection.'
                                    : 'Try adjusting your search criteria or add a new user.'
                                }
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Table Header */}
                            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                                <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="col-span-3">User</div>
                                    <div className="col-span-2">Department</div>
                                    <div className="col-span-2">Roles</div>
                                    <div className="col-span-1">Status</div>
                                    <div className="col-span-2">Joined</div>
                                    <div className="col-span-2">Actions</div>
                                </div>
                            </div>

                            {/* Table Body */}
                            <div className="divide-y divide-gray-200">
                                {currentUsers.map((user) => (
                                    <div key={user.id} className="px-6 py-4 hover:bg-gray-50">
                                        <div className="grid grid-cols-12 gap-4 items-center">
                                            {/* User Info */}
                                            <div className="col-span-3">
                                                <div className="flex items-center">
                                                    {user.profilePictureUrl ? (
                                                        <img
                                                            className="h-10 w-10 rounded-full object-cover"
                                                            src={user.profilePictureUrl}
                                                            alt={`${user.firstName} ${user.lastName}`}
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <span className="text-gray-500 font-medium">
                                                                {user.firstName?.[0]}{user.lastName?.[0]}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {user.firstName} {user.lastName}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {user.email}
                                                        </p>
                                                        {user.username && (
                                                            <p className="text-xs text-gray-400">
                                                                @{user.username}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Department */}
                                            <div className="col-span-2">
                                                <p className="text-sm text-gray-900">{user.department || 'Not specified'}</p>
                                                {user.studentId && (
                                                    <p className="text-xs text-gray-500">ID: {user.studentId}</p>
                                                )}
                                            </div>

                                            {/* Roles */}
                                            <div className="col-span-2">
                                                <div className="flex flex-wrap gap-1">
                                                    {getRoleBadges(user.roles)}
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <div className="col-span-1">
                                                {getStatusBadge(user.status)}
                                            </div>

                                            {/* Joined Date */}
                                            <div className="col-span-2">
                                                <p className="text-sm text-gray-900">
                                                    {formatDate(user.createdAt)}
                                                </p>
                                                {user.graduationYear && (
                                                    <p className="text-xs text-gray-500">
                                                        Grad: {user.graduationYear}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="col-span-2">
                                                <div className="flex items-center space-x-2">
                                                    {/* View Profile */}
                                                    <button
                                                        className="text-gray-600 hover:text-gray-900"
                                                        title="View Profile"
                                                        onClick={() => {
                                                            toast.info('Profile view feature coming soon!');
                                                        }}
                                                    >
                                                        <UserIcon className="h-5 w-5" />
                                                    </button>

                                                    {/* Edit */}
                                                    <button
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Edit User"
                                                        onClick={() => {
                                                            toast.info('User edit feature coming soon!');
                                                        }}
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>

                                                    {/* Toggle Status */}
                                                    <button
                                                        onClick={() => handleToggleUserStatus(user.id, user.status)}
                                                        className={user.status === 'ACTIVE' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                                                        title={user.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
                                                        disabled={actionLoading}
                                                    >
                                                        {user.status === 'ACTIVE' ? (
                                                            <XMarkIcon className="h-5 w-5" />
                                                        ) : (
                                                            <CheckIcon className="h-5 w-5" />
                                                        )}
                                                    </button>

                                                    {/* Admin Role Indicator */}
                                                    {user.roles && user.roles.includes('ADMIN') && (
                                                        <ShieldCheckIcon className="h-5 w-5 text-purple-600" title="Admin User" />
                                                    )}

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Delete User"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </Card>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of{' '}
                            {filteredUsers.length} users
                        </div>
                        <div className="flex space-x-1">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 text-sm rounded ${
                                        currentPage === page
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 text-sm border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    title="Delete User"
                >
                    <div className="text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Are you sure you want to delete this user?
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            "{selectedUser?.firstName} {selectedUser?.lastName}" will be permanently deleted. This action cannot be undone.
                        </p>
                        <div className="flex justify-center space-x-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleDeleteUser}
                                disabled={actionLoading}
                            >
                                {actionLoading ? 'Deleting...' : 'Delete User'}
                            </Button>
                        </div>
                    </div>
                </Modal>
            </motion.div>
        </div>
    );
};

export default AdminUsersPage;
