import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import AuthGuard from '../components/AuthGuard';
import { useToast } from '../context/ToastContext';

function ProfileContent() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    mobileNumber: '',
  });
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    addressType: 'HOME',
    isDefault: false,
  });

  useEffect(() => {
    if (!user?.username) return;
    api.getProfileByUsername(user.username)
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [user?.username]);

  const handleEdit = () => {
    if (profile) {
      setEditForm({
        fullName: profile.fullName || '',
        mobileNumber: profile.mobileNumber || '',
      });
    }
    setEditing(true);
  };

  const handleSave = async () => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      const updated = await api.updateProfile(profile.id, editForm);
      setProfile(updated);
      setEditing(false);
      showToast('Profile updated successfully', { type: 'success' });
    } catch (e) {
      showToast(e.message || 'Failed to update profile', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      addressType: 'HOME',
      isDefault: false,
    });
    setShowAddressModal(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      country: address.country || 'India',
      addressType: address.addressType || 'HOME',
      isDefault: address.isDefault || false,
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async () => {
    if (!profile?.id) return;
    try {
      let updatedProfile;
      if (editingAddress) {
        await api.updateAddress(profile.id, editingAddress.id, addressForm);
      } else {
        await api.addAddress(profile.id, addressForm);
      }
      updatedProfile = await api.getProfileByUsername(user.username);
      setProfile(updatedProfile);
      setShowAddressModal(false);
      showToast('Address saved successfully', { type: 'success' });
    } catch (e) {
      showToast(e.message || 'Failed to save address', { type: 'error' });
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!profile?.id || !confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.deleteAddress(profile.id, addressId);
      const updatedProfile = await api.getProfileByUsername(user.username);
      setProfile(updatedProfile);
      showToast('Address deleted successfully', { type: 'success' });
    } catch (e) {
      showToast(e.message || 'Failed to delete address', { type: 'error' });
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    if (!profile?.id) return;
    try {
      await api.setDefaultAddress(profile.id, addressId);
      const updatedProfile = await api.getProfileByUsername(user.username);
      setProfile(updatedProfile);
      showToast('Default address updated', { type: 'success' });
    } catch (e) {
      showToast(e.message || 'Failed to set default address', { type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse h-48 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-amazon-dark">My Profile</h1>
        {profile && !editing && (
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-amazon-orange text-amazon-dark font-medium rounded hover:bg-amazon-light transition"
          >
            Edit Profile
          </button>
        )}
      </div>

      {profile ? (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-semibold text-amazon-dark mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Username</p>
                <p className="font-medium text-gray-900">{profile.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="font-medium text-gray-900">{profile.email}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 mb-1">Full Name</p>
                {editing ? (
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:ring-amazon-orange focus:border-amazon-orange"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="font-medium text-gray-900">{profile.fullName || '—'}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 mb-1">Mobile Number</p>
                {editing ? (
                  <input
                    type="text"
                    value={editForm.mobileNumber}
                    onChange={(e) => setEditForm({ ...editForm, mobileNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:ring-amazon-orange focus:border-amazon-orange"
                    placeholder="Enter your mobile number"
                    maxLength={10}
                  />
                ) : (
                  <p className="font-medium text-gray-900">{profile.mobileNumber || '—'}</p>
                )}
              </div>
            </div>

            {editing && (
              <div className="flex gap-3 pt-4 border-t mt-6">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-amazon-orange text-amazon-dark font-medium rounded hover:bg-amazon-light disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-amazon-dark">Saved Addresses</h2>
              <button
                onClick={handleAddAddress}
                className="px-4 py-2 bg-amazon-orange text-amazon-dark font-medium rounded hover:bg-amazon-light transition"
              >
                Add Address
              </button>
            </div>
            {profile.addresses?.length > 0 ? (
              <div className="space-y-3">
                {profile.addresses.map((a) => (
                  <div key={a.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {a.addressLine1}
                          {a.addressLine2 && `, ${a.addressLine2}`}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {a.city}, {a.state} - {a.postalCode}, {a.country}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Type: {a.addressType}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {a.isDefault && (
                          <span className="px-2 py-1 bg-amazon-orange text-amazon-dark text-xs font-medium rounded">
                            Default
                          </span>
                        )}
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditAddress(a)}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          {!a.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(a.id)}
                              className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAddress(a.id)}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No saved addresses yet.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border p-8 text-center text-gray-500">
          Profile not found. Create one from your first checkout.
        </div>
      )}

      {showAddressModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowAddressModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h3 className="font-bold text-lg mb-4">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Address Line 1"
                  value={addressForm.addressLine1}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-amazon-orange focus:border-amazon-orange"
                  required
                />
                <input
                  type="text"
                  placeholder="Address Line 2 (optional)"
                  value={addressForm.addressLine2}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-amazon-orange focus:border-amazon-orange"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="px-3 py-2 border rounded focus:ring-amazon-orange focus:border-amazon-orange"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="px-3 py-2 border rounded focus:ring-amazon-orange focus:border-amazon-orange"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    className="px-3 py-2 border rounded focus:ring-amazon-orange focus:border-amazon-orange"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    className="px-3 py-2 border rounded focus:ring-amazon-orange focus:border-amazon-orange"
                    required
                  />
                </div>
                <select
                  value={addressForm.addressType}
                  onChange={(e) => setAddressForm({ ...addressForm, addressType: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-amazon-orange focus:border-amazon-orange"
                >
                  <option value="HOME">Home</option>
                  <option value="WORK">Work</option>
                  <option value="OTHER">Other</option>
                </select>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  />
                  <span className="text-sm">Set as default address</span>
                </label>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAddress}
                  className="px-4 py-2 bg-amazon-orange text-amazon-dark rounded hover:bg-amazon-light"
                >
                  Save Address
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Profile() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
