import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import type { Brand, CouponTemplate } from '../types';

const AdminDashboard: React.FC = () => {
  const { logout } = useAdmin();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'brands' | 'coupons'>('brands');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [coupons, setCoupons] = useState<CouponTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Brand form
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandName, setBrandName] = useState('');
  
  // Coupon form
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponTemplate | null>(null);
  const [couponForm, setCouponForm] = useState({
    brandId: '',
    couponPrefix: '',
    validityDays: 30,
    rarityPercentage: 50,
    discountPercentage: 10,
    redeemUrl: '',
    terms: ''
  });

  useEffect(() => {
    fetchBrands();
    fetchCoupons();
  }, []);

  const fetchBrands = async () => {
    try {
      const res = await client.get('/admin/brands');
      setBrands(res.data);
    } catch (e) {
      console.error('Failed to fetch brands', e);
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await client.get('/admin/coupons');
      setCoupons(res.data);
    } catch (e) {
      console.error('Failed to fetch coupons', e);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Brand CRUD
  const openBrandModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setBrandName(brand.name);
    } else {
      setEditingBrand(null);
      setBrandName('');
    }
    setShowBrandModal(true);
  };

  const saveBrand = async () => {
    if (!brandName.trim()) return;
    setLoading(true);
    try {
      if (editingBrand) {
        await client.put(`/admin/brands/${editingBrand.id}`, { name: brandName });
      } else {
        await client.post('/admin/brands', { name: brandName });
      }
      await fetchBrands();
      setShowBrandModal(false);
      setBrandName('');
    } catch (e) {
      console.error('Failed to save brand', e);
    } finally {
      setLoading(false);
    }
  };

  const deleteBrand = async (id: string) => {
    if (!confirm('Delete this brand?')) return;
    try {
      await client.delete(`/admin/brands/${id}`);
      await fetchBrands();
    } catch (e) {
      console.error('Failed to delete brand', e);
    }
  };

  // Coupon CRUD
  const openCouponModal = (coupon?: CouponTemplate) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setCouponForm({
        brandId: coupon.brandId,
        couponPrefix: coupon.couponPrefix,
        validityDays: coupon.validityDays,
        rarityPercentage: coupon.rarityPercentage,
        discountPercentage: coupon.discountPercentage,
        redeemUrl: coupon.redeemUrl,
        terms: coupon.terms
      });
    } else {
      setEditingCoupon(null);
      setCouponForm({
        brandId: brands[0]?.id || '',
        couponPrefix: '',
        validityDays: 30,
        rarityPercentage: 50,
        discountPercentage: 10,
        redeemUrl: '',
        terms: ''
      });
    }
    setShowCouponModal(true);
  };

  const saveCoupon = async () => {
    if (!couponForm.brandId || !couponForm.couponPrefix) return;
    setLoading(true);
    try {
      if (editingCoupon) {
        await client.put(`/admin/coupons/${editingCoupon.id}`, couponForm);
      } else {
        await client.post('/admin/coupons', couponForm);
      }
      await fetchCoupons();
      setShowCouponModal(false);
    } catch (e) {
      console.error('Failed to save coupon', e);
    } finally {
      setLoading(false);
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon template?')) return;
    try {
      await client.delete(`/admin/coupons/${id}`);
      await fetchCoupons();
    } catch (e) {
      console.error('Failed to delete coupon', e);
    }
  };

  const getRarityColor = (percentage: number) => {
    if (percentage <= 25) return 'text-yellow-500'; // Gold - Legendary
    if (percentage <= 50) return 'text-purple-500'; // Purple - Epic
    if (percentage <= 75) return 'text-blue-500'; // Blue - Rare
    return 'text-gray-500'; // Gray - Common
  };

  const getRarityBg = (percentage: number) => {
    if (percentage <= 25) return 'bg-yellow-100 border-yellow-300';
    if (percentage <= 50) return 'bg-purple-100 border-purple-300';
    if (percentage <= 75) return 'bg-blue-100 border-blue-300';
    return 'bg-gray-100 border-gray-300';
  };

  const getBrandName = (brandId: string) => {
    return brands.find(c => c.id === brandId)?.name || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-game-bg p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-panel-bg border-4 border-white rounded-[30px] p-6 mb-6 shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-titan text-4xl text-orange-400" style={{ WebkitTextStroke: '1.5px white' }}>
                🔐 ADMIN PANEL
              </h1>
              <p className="font-nunito font-bold text-gray-500 text-sm mt-1">Configuration Portal</p>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full border-2 border-white shadow-lg transition-all"
            >
              LOGOUT
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border-4 border-blue-300 rounded-2xl p-4 text-center">
            <div className="text-3xl font-titan text-blue-500">{brands.length}</div>
            <div className="font-nunito font-bold text-gray-600 text-sm">Brands</div>
          </div>
          <div className="bg-white border-4 border-purple-300 rounded-2xl p-4 text-center">
            <div className="text-3xl font-titan text-purple-500">{coupons.length}</div>
            <div className="font-nunito font-bold text-gray-600 text-sm">Coupon Templates</div>
          </div>
          <div className="bg-white border-4 border-green-300 rounded-2xl p-4 text-center">
            <div className="text-3xl font-titan text-green-500">{coupons.filter(c => c.rarityPercentage <= 25).length}</div>
            <div className="font-nunito font-bold text-gray-600 text-sm">Legendary Coupons</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('brands')}
            className={`px-6 py-3 font-bold rounded-t-xl transition-all ${
              activeTab === 'brands' 
                ? 'bg-white border-4 border-b-0 border-white text-orange-500' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            🏢 Brands
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-6 py-3 font-bold rounded-t-xl transition-all ${
              activeTab === 'coupons' 
                ? 'bg-white border-4 border-b-0 border-white text-orange-500' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            🎟️ Coupons
          </button>
        </div>

        {/* Content */}
        <div className="bg-white border-4 border-white rounded-b-[30px] rounded-tr-[30px] p-6 shadow-xl">
        {activeTab === 'brands' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-titan text-2xl text-gray-700">Brand Management</h2>
                <button
                  onClick={() => openBrandModal()}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full"
                >
                  + Add Brand
                </button>
              </div>
              
              <div className="space-y-2">
                {brands.map(brand => (
                  <div key={brand.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                    <div>
                      <div className="font-bold text-gray-800">{brand.name}</div>
                      <div className="text-xs text-gray-500">ID: {brand.id}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openBrandModal(brand)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-4 rounded-full text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteBrand(brand.id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-4 rounded-full text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'coupons' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-titan text-2xl text-gray-700">Coupon Templates</h2>
                <button
                  onClick={() => openCouponModal()}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full"
                  disabled={brands.length === 0}
                >
                  + Add Coupon
                </button>
              </div>
              
              <div className="space-y-3">
                {coupons.map(coupon => (
                  <div key={coupon.id} className={`p-4 rounded-xl border-2 ${getRarityBg(coupon.rarityPercentage)}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-gray-800">{coupon.couponPrefix}</span>
                          <span className="text-sm bg-white px-2 py-1 rounded-full border border-gray-300">
                            {getBrandName(coupon.brandId)}
                          </span>
                          <span className={`text-xs font-bold ${getRarityColor(coupon.rarityPercentage)}`}>
                            {coupon.rarityPercentage}% Rarity
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 space-y-1">
                          <div>💰 Discount: <strong>{coupon.discountPercentage}%</strong></div>
                          <div>⏰ Valid for: <strong>{coupon.validityDays} days</strong></div>
                          <div className="text-xs text-gray-500 truncate">🔗 {coupon.redeemUrl}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openCouponModal(coupon)}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-full text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCoupon(coupon.id)}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-full text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Company Modal */}
      {/* Brand Modal */}
      {showBrandModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border-4 border-orange-400">
            <h3 className="font-titan text-2xl text-orange-500 mb-4">
              {editingBrand ? 'Edit Brand' : 'Add Brand'}
            </h3>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Brand Name"
              className="w-full p-3 border-2 border-gray-300 rounded-xl mb-4 font-bold focus:border-orange-400 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={saveBrand}
                disabled={loading || !brandName.trim()}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-full"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setShowBrandModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full border-4 border-orange-400 my-8">
            <h3 className="font-titan text-2xl text-orange-500 mb-4">
              {editingCoupon ? 'Edit Coupon Template' : 'Add Coupon Template'}
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-sm mb-1">Brand</label>
                <select
                  value={couponForm.brandId}
                  onChange={(e) => setCouponForm({ ...couponForm, brandId: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 rounded-xl font-bold focus:border-orange-400 focus:outline-none"
                >
                  <option value="">Select Brand</option>
                  {brands.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-sm mb-1">Coupon Prefix</label>
                <input
                  type="text"
                  value={couponForm.couponPrefix}
                  onChange={(e) => setCouponForm({ ...couponForm, couponPrefix: e.target.value.toUpperCase() })}
                  placeholder="e.g., SAVE, WIN, FYND"
                  className="w-full p-3 border-2 border-gray-300 rounded-xl font-bold focus:border-orange-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-sm mb-1">Discount %</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="0.01" // Support decimals
                    value={couponForm.discountPercentage}
                    onChange={(e) => setCouponForm({ ...couponForm, discountPercentage: parseFloat(e.target.value) || 0 })}
                    className="w-full p-3 border-2 border-gray-300 rounded-xl font-bold focus:border-orange-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-sm mb-1">Validity (days)</label>
                  <input
                    type="number"
                    min="1"
                    value={couponForm.validityDays}
                    onChange={(e) => setCouponForm({ ...couponForm, validityDays: parseInt(e.target.value) || 1 })}
                    className="w-full p-3 border-2 border-gray-300 rounded-xl font-bold focus:border-orange-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-sm mb-1">
                  Rarity % <span className="text-xs text-gray-500">(Lower = More Rare)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={couponForm.rarityPercentage}
                  onChange={(e) => setCouponForm({ ...couponForm, rarityPercentage: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border-2 border-gray-300 rounded-xl font-bold focus:border-orange-400 focus:outline-none"
                />
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <span className={getRarityColor(couponForm.rarityPercentage) + ' font-bold'}>
                    {couponForm.rarityPercentage <= 25 ? '⭐ Legendary' : 
                     couponForm.rarityPercentage <= 50 ? '💜 Epic' :
                     couponForm.rarityPercentage <= 75 ? '💙 Rare' : '⚪ Common'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-sm mb-1">Redeem URL</label>
                <input
                  type="url"
                  value={couponForm.redeemUrl}
                  onChange={(e) => setCouponForm({ ...couponForm, redeemUrl: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full p-3 border-2 border-gray-300 rounded-xl font-bold focus:border-orange-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-sm mb-1">Terms & Conditions</label>
                <textarea
                  value={couponForm.terms}
                  onChange={(e) => setCouponForm({ ...couponForm, terms: e.target.value })}
                  placeholder="Enter terms and conditions..."
                  rows={3}
                  className="w-full p-3 border-2 border-gray-300 rounded-xl font-bold focus:border-orange-400 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={saveCoupon}
                disabled={loading || !couponForm.brandId || !couponForm.couponPrefix}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-full"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setShowCouponModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
