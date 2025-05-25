// src/components/admin/AdminUsersPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    UserCircleIcon,
    ShieldCheckIcon,
    ShieldExclamationIcon,
    EnvelopeIcon,
    PhoneIcon,
    AcademicCapIcon,
    BuildingOfficeIcon,
    ExclamationTriangleIcon,
    CheckIcon,
    XMarkIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

// Components
import Card from '../common/Card';
import Button from '../common/Button';
import Loader from '../common/Loader';
import Modal from '../common/Modal';

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

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

    // Form state for creating/editing users
    const [userForm, setUserForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        studentId: '',
        roles: ['USER'],
        status: 'ACTIVE'
    });

    // Mock data
    const mockUsers = [
        {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@university.edu',
            phone: '+1234567890',
            department: 'Computer Science',
            studentId: 'CS2021001',
            roles: ['USER', 'EVENT_ORGANIZER'],
            status: 'ACTIVE',
            profilePictureUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            createdAt: '2025-01-15T10:30:00',
            lastLogin: '2025-05-25T08:15:00',
            eventsAttended: 12,
            eventsOrganized: 3
        },
        {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@university.edu',
            phone: '+1234567891',
            department: 'Business Administration',
            studentId: 'BA2020045',
            roles: ['USER'],
            status: 'ACTIVE',
            profilePictureUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            createdAt: '2025-02-10T14:22:00',
            lastLogin: '2025-05-24T16:45:00',
            eventsAttended: 8,
            eventsOrganized: 0
        },
        {
            id: 3,
            firstName: 'Mike',
            lastName: 'Johnson',
            email: 'mike.johnson@university.edu',
            phone: '+1234567892',
            department: 'Engineering',
            studentId: 'ENG2019087',
            roles: ['ADMIN'],
            status: 'ACTIVE',
            profilePictureUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            createdAt: '2024-09-05T09:10:00',
            lastLogin: '2025-05-25T09:30:00',
            eventsAttended: 25,
            eventsOrganized: 15
        },
        {
            id: 4,
            firstName: 'Sarah',
            lastName: 'Wilson',
            email: 'sarah.wilson@university.edu',
            phone: '+1234567893',
            department: 'Psychology',
            studentId: 'PSY2021034',
            roles: ['USER'],
            status: 'INACTIVE',
            profilePictureUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            createdAt: '2025-03-12T11:45:00',
            lastLogin: '2025-04-20T14:20:00',
            eventsAttended: 3,
            eventsOrganized: 0
        },
        {
            id: 5,
            firstName: 'Dr. Robert',
            lastName: 'Brown',
            email: 'robert.brown@university.edu',
            phone: '+1234567894',
            department: 'Computer Science',
            studentId: null,
            roles: ['FACULTY', 'EVENT_ORGANIZER'],
            status: 'ACTIVE',
            profilePictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            createdAt: '2024-08-20T08:00:00',
            lastLogin: '2025-05-25T07:45:00',
            eventsAttended: 18,
            eventsOrganized: 22
        }
    ];

    const departments = ['Computer Science', 'Business Administration', 'Engineering', 'Psychology', 'Mathematics', 'Physics', 'Chemistry', 'Biology'];
    const roles = ['USER', 'ADMIN', 'EVENT_ORGANIZER', 'FACULTY', 'STUDENT'];

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setUsers(mockUsers);
            setLoading(false);
        }, 1000);
    }, []);

    useEffect(() => {
        filterAndSortUsers();
    }, [users, searchTerm, roleFilter, statusFilter, departmentFilter, sortBy, sortOrder]);

    const filterAndSortUsers = () => {
        let filtered = [...users];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(user =>
                `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.department.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Role filter
        if (roleFilter !== 'ALL') {
            filtered = filtered.filter(user => user.roles.includes(roleFilter));
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

            if (sortBy === 'createdAt' || sortBy === 'lastLogin') {
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

    const handleCreateUser = async () => {
        try {
            setActionLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            const newUser = {
                id: Date.now(),
                ...userForm,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                eventsAttended: 0,
                eventsOrganized: 0
            };

            setUsers(prev => [newUser, ...prev]);
            setShowCreateModal(false);
            setUserForm({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                department: '',
                studentId: '',
                roles: ['USER'],
                status: 'ACTIVE'
            });
            toast.success('User created successfully');
        } catch (error) {
            console.error('Error creating user:', error);
            toast.error('Failed to create user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateUser = async (userId, updates) => {
        try {
            setActionLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            setUsers(prev => prev.map(user =>
                user.id === userId ? { ...user, ...updates } : user
            ));

            toast.success('User updated successfully');
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Failed to update user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;

        try {
            setActionLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
            setShowDeleteModal(false);
            setSelectedUser(null);
            toast.success('User deleted successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user');
        } finally {
            setActionLoading(false);
        }
    };

    const toggleUserRole = async (userId, role) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const hasRole = user.roles.includes(role);
        const updatedRoles = hasRole
            ? user.roles.filter(r => r !== role)
            : [...user.roles, role];

        await handleUpdateUser(userId, { roles: updatedRoles });
    };

    const toggleUserStatus = async (userId) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        await handleUpdateUser(userId, { status: newStatus });
    };

    const exportUsers = () => {
        // Create CSV content
        const headers = ['Name', 'Email', 'Department', 'Student ID', 'Roles', 'Status', 'Created At'];
        const csvContent = [
            headers.join(','),
            ...filteredUsers.map(user => [
                `"${user.firstName} ${user.lastName}"`,
                user.email,
                user.department,
                user.studentId || '',
                `"${user.roles.join(', ')}"`,
                user.status,
                new Date(user.createdAt).toLocaleDateString()
            ].join(','))
        ].join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);

        toast.success('User data exported successfully');
    };

    const getRoleColor = (role) => {
        const colors = {
            'ADMIN': 'bg-red-100 text-red-800',
            'FACULTY': 'bg-purple-100 text-purple-800',
            'EVENT_ORGANIZER': 'bg-blue-100 text-blue-800',
            'STUDENT': 'bg-green-100 text-green-800',
            'USER': 'bg-gray-100 text-gray-800'
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    const getStatusBadge = (status) => {
        return status === 'ACTIVE'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
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

    const handleFormChange = (field, value) => {
        setUserForm(prev => ({
            ...prev,
            [field]: value
        }));
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
                    </div>
                    <div className="mt-4 sm:mt-0 flex space-x-3">
                        <Button variant="outline" onClick={exportUsers}>
                            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                            Export
                        </Button>
                        <Button onClick={() => setShowCreateModal(true)}>
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
                                    placeholder="Search by name, email, or student ID..."
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
                                    <option key={role} value={role}>{role}</option>
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
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sort By
                            </label>
                            <div className="flex space-x-2">
                                <select
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="name">Name</option>
                                    <option value="createdAt">Created Date</option>
                                    <option value="lastLogin">Last Login</option>
                                    <option value="department">Department</option>
                                </select>
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
                            <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Try adjusting your search criteria or add a new user.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Table Header */}
                            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                                <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="col-span-3">User</div>
                                    <div className="col-span-2">Contact</div>
                                    <div className="col-span-2">Department</div>
                                    <div className="col-span-2">Roles</div>
                                    <div className="col-span-1">Status</div>
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
                                                            className="h-10 w-10 rounded-full"
                                                            src={user.profilePictureUrl}
                                                            alt={`${user.firstName} ${user.lastName}`}
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <UserCircleIcon className="h-6 w-6 text-gray-500" />
                                                        </div>
                                                    )}
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {user.firstName} {user.lastName}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {user.studentId || 'Faculty/Staff'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contact */}
                                            <div className="col-span-2">
                                                <div className="text-sm text-gray-900 space-y-1">
                                                    <div className="flex items-center">
                                                        <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
                                                        <span className="truncate">{user.email}</span>
                                                    </div>
                                                    {user.phone && (
                                                        <div className="flex items-center">
                                                            <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                                                            <span>{user.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Department */}
                                            <div className="col-span-2">
                                                <div className="flex items-center">
                                                    <BuildingOfficeIcon className="h-4 w-4 mr-1 text-gray-400" />
                                                    <span className="text-sm text-gray-900">{user.department}</span>
                                                </div>
                                            </div>

                                            {/* Roles */}
                                            <div className="col-span-2">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.map(role => (
                                                        <span
                                                            key={role}
                                                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(role)}`}
                                                        >
                                                            {role}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <div className="col-span-1">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(user.status)}`}>
                                                    {user.status}
                                                </span>
                                            </div>

                                            {/* Actions */}
                                            <div className="col-span-2">
                                                <div className="flex items-center space-x-2">
                                                    {/* View */}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setShowUserModal(true);
                                                        }}
                                                        className="text-gray-600 hover:text-gray-900"
                                                        title="View User Details"
                                                    >
                                                        <EyeIcon className="h-5 w-5" />
                                                    </button>

                                                    {/* Toggle Status */}
                                                    <button
                                                        onClick={() => toggleUserStatus(user.id)}
                                                        className={user.status === 'ACTIVE' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                                                        title={user.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
                                                        disabled={actionLoading}
                                                    >
                                                        {user.status === 'ACTIVE' ?
                                                            <XMarkIcon className="h-5 w-5" /> :
                                                            <CheckIcon className="h-5 w-5" />
                                                        }
                                                    </button>

                                                    {/* Toggle Admin */}
                                                    <button
                                                        onClick={() => toggleUserRole(user.id, 'ADMIN')}
                                                        className={user.roles.includes('ADMIN') ? 'text-red-600 hover:text-red-900' : 'text-blue-600 hover:text-blue-900'}
                                                        title={user.roles.includes('ADMIN') ? 'Remove Admin Role' : 'Grant Admin Role'}
                                                        disabled={actionLoading}
                                                    >
                                                        {user.roles.includes('ADMIN') ?
                                                            <ShieldExclamationIcon className="h-5 w-5" /> :
                                                            <ShieldCheckIcon className="h-5 w-5" />
                                                        }
                                                    </button>

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

                {/* User Details Modal */}
                <Modal
                    isOpen={showUserModal}
                    onClose={() => setShowUserModal(false)}
                    title="User Details"
                    size="lg"
                >
                    {selectedUser && (
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                {selectedUser.profilePictureUrl ? (
                                    <img
                                        className="h-16 w-16 rounded-full"
                                        src={selectedUser.profilePictureUrl}
                                        alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                                    />
                                ) : (
                                    <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                                        <UserCircleIcon className="h-10 w-10 text-gray-500" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {selectedUser.firstName} {selectedUser.lastName}
                                    </h3>
                                    <p className="text-sm text-gray-500">{selectedUser.studentId || 'Faculty/Staff'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h4>
                                    <dl className="space-y-2">
                                        <div>
                                            <dt className="text-xs font-medium text-gray-500">Email</dt>
                                            <dd className="text-sm text-gray-900">{selectedUser.email}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs font-medium text-gray-500">Phone</dt>
                                            <dd className="text-sm text-gray-900">{selectedUser.phone || 'Not provided'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs font-medium text-gray-500">Department</dt>
                                            <dd className="text-sm text-gray-900">{selectedUser.department}</dd>
                                        </div>
                                    </dl>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Account Information</h4>
                                    <dl className="space-y-2">
                                        <div>
                                            <dt className="text-xs font-medium text-gray-500">Status</dt>
                                            <dd>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedUser.status)}`}>
                                                    {selectedUser.status}
                                                </span>
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs font-medium text-gray-500">Roles</dt>
                                            <dd className="flex flex-wrap gap-1">
                                                {selectedUser.roles.map(role => (
                                                    <span
                                                        key={role}
                                                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(role)}`}
                                                    >
                                                        {role}
                                                    </span>
                                                ))}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs font-medium text-gray-500">Member Since</dt>
                                            <dd className="text-sm text-gray-900">{formatDate(selectedUser.createdAt)}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs font-medium text-gray-500">Last Login</dt>
                                            <dd className="text-sm text-gray-900">{formatDate(selectedUser.lastLogin)}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Activity Summary</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-2xl font-semibold text-gray-900">{selectedUser.eventsAttended}</div>
                                        <div className="text-xs text-gray-500">Events Attended</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-2xl font-semibold text-gray-900">{selectedUser.eventsOrganized}</div>
                                        <div className="text-xs text-gray-500">Events Organized</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Create User Modal */}
                <Modal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    title="Create New User"
                    size="lg"
                    footer={
                        <div className="flex justify-end space-x-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowCreateModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateUser}
                                disabled={actionLoading}
                            >
                                {actionLoading ? 'Creating...' : 'Create User'}
                            </Button>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={userForm.firstName}
                                    onChange={(e) => handleFormChange('firstName', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={userForm.lastName}
                                    onChange={(e) => handleFormChange('lastName', e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email *
                            </label>
                            <input
                                type="email"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={userForm.email}
                                onChange={(e) => handleFormChange('email', e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={userForm.phone}
                                    onChange={(e) => handleFormChange('phone', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Student ID
                                </label>
                                <input
                                    type="text"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={userForm.studentId}
                                    onChange={(e) => handleFormChange('studentId', e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Department *
                            </label>
                            <select
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={userForm.department}
                                onChange={(e) => handleFormChange('department', e.target.value)}
                            >
                                <option value="">Select a department</option>
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Roles
                            </label>
                            <div className="space-y-2">
                                {roles.map(role => (
                                    <label key={role} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={userForm.roles.includes(role)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    handleFormChange('roles', [...userForm.roles, role]);
                                                } else {
                                                    handleFormChange('roles', userForm.roles.filter(r => r !== role));
                                                }
                                            }}
                                        />
                                        <span className="ml-2 text-sm text-gray-700">{role}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={userForm.status}
                                onChange={(e) => handleFormChange('status', e.target.value)}
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>
                    </div>
                </Modal>

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
                            {selectedUser && `"${selectedUser.firstName} ${selectedUser.lastName}"`} will be permanently deleted.
                            This action cannot be undone and will remove all associated data.
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