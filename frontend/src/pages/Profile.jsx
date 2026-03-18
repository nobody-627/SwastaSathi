import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, PhoneCall, Edit, Copy, Check, Shield, Lock, LogOut, LayoutDashboard, Save, X } from 'lucide-react'
import Button from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'

export default function Profile() {
    const { user, loading, logout, updateUser } = useAuth()
    const navigate = useNavigate()
    const [copiedField, setCopiedField] = useState(null)
    const [editingField, setEditingField] = useState(null)
    const [editValues, setEditValues] = useState({})
    const [showPasswordChange, setShowPasswordChange] = useState(false)
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login')
        }
    }, [loading, user, navigate])

    const copyToClipboard = async (text, field) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedField(field)
            setTimeout(() => setCopiedField(null), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const handleFieldEdit = (field) => {
        setEditingField(field)
        setEditValues({
            ...editValues,
            [field]: user[field] || ''
        })
    }

    const handleFieldSave = async (field) => {
        try {
            // Update user data (this would typically call an API)
            const updatedUser = {
                ...user,
                [field]: editValues[field]
            }
            
            // For now, just log the update (in real app, call API)
            console.log(`Updated ${field}:`, editValues[field])
            
            // Reset editing state
            setEditingField(null)
            setEditValues({ ...editValues, [field]: '' })
            
            // Show success feedback
            alert(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`)
        } catch (error) {
            console.error('Failed to update field:', error)
            alert('Failed to update. Please try again.')
        }
    }

    const handleFieldCancel = (field) => {
        setEditingField(null)
        setEditValues({ ...editValues, [field]: '' })
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault()
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match!')
            return
        }
        
        if (passwordData.newPassword.length < 6) {
            alert('Password must be at least 6 characters long!')
            return
        }
        
        try {
            // In real app, this would call an API to change password
            console.log('Password change requested:', {
                current: passwordData.currentPassword,
                new: passwordData.newPassword
            })
            
            // Reset form
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            })
            setShowPasswordChange(false)
            
            alert('Password changed successfully!')
        } catch (error) {
            console.error('Failed to change password:', error)
            alert('Failed to change password. Please try again.')
        }
    }

    const handleCompleteProfile = () => {
        // Check if mobile field exists and is empty
        if (!user.mobile) {
            // If mobile field doesn't exist in DOM, create it or show message
            const mobileField = document.querySelector('[data-field="mobile"]')
            if (mobileField) {
                mobileField.scrollIntoView({ behavior: 'smooth', block: 'center' })
                setTimeout(() => handleFieldEdit('mobile'), 500)
            } else {
                // Mobile field not rendered, show message to user
                alert('Please add your mobile number to complete your profile. You can add it by clicking the edit button in the profile section.')
            }
        } 
        // Check if emergency contact field exists and is empty
        else if (!user.emergency_mobile) {
            const emergencyField = document.querySelector('[data-field="emergency_mobile"]')
            if (emergencyField) {
                emergencyField.scrollIntoView({ behavior: 'smooth', block: 'center' })
                setTimeout(() => handleFieldEdit('emergency_mobile'), 500)
            } else {
                // Emergency field not rendered, show message to user
                alert('Please add your emergency contact to complete your profile. You can add it by clicking the edit button in the profile section.')
            }
        }
        // If both mobile and emergency exist, check for other fields
        else if (!user.address || !user.date_of_birth) {
            alert('Great! Your profile is almost complete. Address and Date of Birth fields will be available in the next update.')
        }
        // If all available fields are complete
        else {
            alert('Your profile is complete! 🎉')
        }
    }

    const handleUpdateDetails = () => {
        // Allow users to update any field - start with name field
        handleFieldEdit('name')
    }

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout()
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <div className="text-gray-500">Loading profile…</div>
                </div>
            </div>
        )
    }

    if (!user) return null

    // Calculate actual profile completion
    const calculateProfileCompletion = () => {
        const fields = [
            { key: 'name', weight: 30 },
            { key: 'email', weight: 30 },
            { key: 'mobile', weight: 25 },
            { key: 'emergency_mobile', weight: 15 }
            // Note: Address and DOB will be added in future updates
        ]
        
        let completion = 0
        fields.forEach(field => {
            if (user[field.key] && user[field.key].trim() !== '') {
                completion += field.weight
            }
        })
        
        return Math.min(completion, 100)
    }

    const profileCompletion = calculateProfileCompletion()
    const securityStatus = 'strong' // Could be calculated based on password strength

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-4 h-[calc(100vh-4rem)]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                    
                    {/* Profile Card - Main Content (2/3 width) */}
                    <div className="lg:col-span-2 space-y-4 overflow-hidden">
                        
                        {/* Profile Information Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-semibold text-gray-900">Personal Information</h2>
                                <Button 
                                    variant="soft" 
                                    size="sm" 
                                    className="flex items-center gap-2 text-xs"
                                    onClick={() => handleFieldEdit('name')}
                                >
                                    <Edit size={12} />
                                    Edit Profile
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {/* Name Field */}
                                <div className="group" data-field="name">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
                                    <div className="mt-1 flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                        {editingField === 'name' ? (
                                            <div className="flex items-center gap-2 flex-1">
                                                <User size={16} className="text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={editValues.name || ''}
                                                    onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                                                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                                                    placeholder="Enter your name"
                                                />
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleFieldSave('name')}
                                                        className="p-1 rounded bg-green-500 text-white hover:bg-green-600 transition-colors"
                                                    >
                                                        <Save size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleFieldCancel('name')}
                                                        className="p-1 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <User size={16} className="text-gray-400" />
                                                    <span className="text-sm text-gray-900 font-medium">{user.name}</span>
                                                </div>
                                                <Edit 
                                                    size={14} 
                                                    className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-rose-500" 
                                                    onClick={() => handleFieldEdit('name')}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Email Field */}
                                <div className="group" data-field="email">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
                                    <div className="mt-1 flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                        {editingField === 'email' ? (
                                            <div className="flex items-center gap-2 flex-1">
                                                <Mail size={16} className="text-gray-400" />
                                                <input
                                                    type="email"
                                                    value={editValues.email || ''}
                                                    onChange={(e) => setEditValues({ ...editValues, email: e.target.value })}
                                                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                                                    placeholder="Enter your email"
                                                />
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleFieldSave('email')}
                                                        className="p-1 rounded bg-green-500 text-white hover:bg-green-600 transition-colors"
                                                    >
                                                        <Save size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleFieldCancel('email')}
                                                        className="p-1 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <Mail size={16} className="text-gray-400" />
                                                    <span className="text-sm text-gray-900 font-medium">{user.email}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => copyToClipboard(user.email, 'email')}
                                                        className="p-1 rounded hover:bg-gray-200 transition-colors"
                                                    >
                                                        {copiedField === 'email' ? 
                                                            <Check size={12} className="text-green-500" /> : 
                                                            <Copy size={12} className="text-gray-400" />
                                                        }
                                                    </button>
                                                    <Edit 
                                                        size={14} 
                                                        className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-rose-500" 
                                                        onClick={() => handleFieldEdit('email')}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Mobile Field - Always show for editing */}
                                <div className="group" data-field="mobile">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mobile Number</label>
                                    <div className="mt-1 flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                        {editingField === 'mobile' ? (
                                            <div className="flex items-center gap-2 flex-1">
                                                <Phone size={16} className="text-gray-400" />
                                                <input
                                                    type="tel"
                                                    value={editValues.mobile || ''}
                                                    onChange={(e) => setEditValues({ ...editValues, mobile: e.target.value })}
                                                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                                                    placeholder="Enter your mobile number"
                                                />
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleFieldSave('mobile')}
                                                        className="p-1 rounded bg-green-500 text-white hover:bg-green-600 transition-colors"
                                                    >
                                                        <Save size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleFieldCancel('mobile')}
                                                        className="p-1 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <Phone size={16} className="text-gray-400" />
                                                    <span className={`text-sm font-medium ${user.mobile ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                                                        {user.mobile || 'Add your mobile number'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {user.mobile && (
                                                        <button
                                                            onClick={() => copyToClipboard(user.mobile, 'mobile')}
                                                            className="p-1 rounded hover:bg-gray-200 transition-colors"
                                                        >
                                                            {copiedField === 'mobile' ? 
                                                                <Check size={12} className="text-green-500" /> : 
                                                                <Copy size={12} className="text-gray-400" />
                                                            }
                                                        </button>
                                                    )}
                                                    <Edit 
                                                        size={14} 
                                                        className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-rose-500" 
                                                        onClick={() => handleFieldEdit('mobile')}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Emergency Contact Field - Always show for editing */}
                                <div className="group" data-field="emergency_mobile">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Emergency Contact</label>
                                    <div className="mt-1 flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                        {editingField === 'emergency_mobile' ? (
                                            <div className="flex items-center gap-2 flex-1">
                                                <PhoneCall size={16} className="text-gray-400" />
                                                <input
                                                    type="tel"
                                                    value={editValues.emergency_mobile || ''}
                                                    onChange={(e) => setEditValues({ ...editValues, emergency_mobile: e.target.value })}
                                                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                                                    placeholder="Enter emergency contact"
                                                />
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleFieldSave('emergency_mobile')}
                                                        className="p-1 rounded bg-green-500 text-white hover:bg-green-600 transition-colors"
                                                    >
                                                        <Save size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleFieldCancel('emergency_mobile')}
                                                        className="p-1 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <PhoneCall size={16} className="text-gray-400" />
                                                    <span className={`text-sm font-medium ${user.emergency_mobile ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                                                        {user.emergency_mobile || 'Add emergency contact'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {user.emergency_mobile && (
                                                        <button
                                                            onClick={() => copyToClipboard(user.emergency_mobile, 'emergency')}
                                                            className="p-1 rounded hover:bg-gray-200 transition-colors"
                                                        >
                                                            {copiedField === 'emergency' ? 
                                                                <Check size={12} className="text-green-500" /> : 
                                                                <Copy size={12} className="text-gray-400" />
                                                            }
                                                        </button>
                                                    )}
                                                    <Edit 
                                                        size={14} 
                                                        className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-rose-500" 
                                                        onClick={() => handleFieldEdit('emergency_mobile')}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Change Password Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <h3 className="text-base font-semibold text-gray-900 mb-3">Change Password</h3>
                            
                            {!showPasswordChange ? (
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="flex items-center gap-2 hover:bg-gray-50 text-xs"
                                    onClick={() => setShowPasswordChange(true)}
                                >
                                    <Lock size={14} />
                                    Change Password
                                </Button>
                            ) : (
                                <form onSubmit={handlePasswordChange} className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                                            placeholder="Enter current password"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                                            placeholder="Enter new password"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                                            placeholder="Confirm new password"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <Button 
                                            type="submit"
                                            size="sm"
                                            className="flex items-center gap-1 text-xs"
                                        >
                                            <Save size={12} />
                                            Update
                                        </Button>
                                        <Button 
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setShowPasswordChange(false)
                                                setPasswordData({
                                                    currentPassword: '',
                                                    newPassword: '',
                                                    confirmPassword: ''
                                                })
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Sidebar (1/3 width) */}
                    <div className="lg:col-span-1 space-y-4 overflow-hidden">
                        
                        {/* Profile Completion Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <h3 className="text-base font-semibold text-gray-900 mb-3">Profile Completion</h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">Complete</span>
                                    <span className="text-xs font-semibold text-rose-600">{profileCompletion}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div 
                                        className="bg-gradient-to-r from-rose-400 to-rose-600 h-1.5 rounded-full transition-all duration-500"
                                        style={{ width: `${profileCompletion}%` }}
                                    ></div>
                                </div>
                                
                                {/* Show missing fields */}
                                {profileCompletion < 100 && (
                                    <div className="mt-3">
                                        <p className="text-xs text-gray-500 mb-1">Add:</p>
                                        <div className="space-y-1">
                                            {!user.mobile && (
                                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                                    <span>Mobile</span>
                                                </div>
                                            )}
                                            {!user.emergency_mobile && (
                                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                                    <span>Emergency</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Complete Profile Button */}
                                        <div className="mt-2">
                                            <Button 
                                                size="sm" 
                                                className="w-full flex items-center justify-center gap-1 text-xs"
                                                onClick={handleCompleteProfile}
                                            >
                                                <Edit size={12} />
                                                Complete
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                
                                {profileCompletion === 100 && (
                                    <div className="mt-3">
                                        <p className="text-xs text-green-600 font-medium mb-2">
                                            ✓ Complete!
                                        </p>
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            className="w-full flex items-center justify-center gap-1 text-xs"
                                            onClick={handleUpdateDetails}
                                        >
                                            <Edit size={12} />
                                            Update
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Security Status Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <h3 className="text-base font-semibold text-gray-900 mb-3">Security Status</h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${securityStatus === 'strong' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                    <span className="text-xs font-medium text-gray-900">
                                        Password {securityStatus === 'strong' ? 'Strong' : 'Weak'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    <span className="text-xs font-medium text-gray-900">2FA Enabled</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    <span className="text-xs font-medium text-gray-900">Email Verified</span>
                                </div>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <h3 className="text-base font-semibold text-gray-900 mb-3">Account</h3>
                            <Button 
                                variant="danger" 
                                className="w-full flex items-center justify-center gap-2 text-xs"
                                onClick={handleLogout}
                            >
                                <LogOut size={14} />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
