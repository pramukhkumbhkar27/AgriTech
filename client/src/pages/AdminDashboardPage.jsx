import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  FaShieldAlt,
  FaUsers,
  FaTractor,
  FaStore,
  FaClipboardList,
  FaRupeeSign,
  FaFlag,
  FaUserCheck,
  FaBan,
  FaEdit,
  FaPlus,
  FaTrashAlt,
} from 'react-icons/fa';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'products', 'orders', 'moderation'
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reportedPosts, setReportedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // User search/filter
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Add Product Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Seeds',
    description: '',
    price: '',
    originalPrice: '',
    unit: '1 kg pack',
    stockQuantity: 50,
    imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
    brand: 'AgriTech Select',
    isOrganic: false,
  });

  useEffect(() => {
    fetchAdminOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'products') fetchProducts();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'moderation') fetchModeration();
  }, [activeTab, userRoleFilter]);

  const fetchAdminOverview = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/admin');
      if (res.data.success) {
        setMetrics(res.data.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = {};
      if (userRoleFilter) params.role = userRoleFilter;
      if (userSearch) params.search = userSearch;
      const res = await api.get('/admin/users', { params });
      if (res.data.success) setUsers(res.data.users);
    } catch {
      // silent
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      if (res.data.success) setProducts(res.data.products);
    } catch {
      // silent
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/admin/all');
      if (res.data.success) setOrders(res.data.orders);
    } catch {
      // silent
    }
  };

  const fetchModeration = async () => {
    try {
      const res = await api.get('/admin/moderation/forum');
      if (res.data.success) setReportedPosts(res.data.reportedPosts);
    } catch {
      // silent
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/status`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/products', newProduct);
      if (res.data.success) {
        setShowProductModal(false);
        fetchProducts();
        setNewProduct({
          name: '',
          category: 'Seeds',
          description: '',
          price: '',
          originalPrice: '',
          unit: '1 kg pack',
          stockQuantity: 50,
          imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
          brand: 'AgriTech Select',
          isOrganic: false,
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create product');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleModeratePost = async (postId, action) => {
    try {
      await api.put(`/admin/moderation/forum/${postId}`, { action });
      fetchModeration();
    } catch (err) {
      alert(err.response?.data?.message || 'Moderation action failed');
    }
  };

  if (loading && !metrics) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status"></div>
      </div>
    );
  }

  const { stats, ordersByStatus } = metrics || { stats: {}, ordersByStatus: [] };

  return (
    <div className="admin-page pb-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">
            <FaShieldAlt className="text-danger me-2" />
            Administrative System Control Center
          </h2>
          <p className="text-muted small mb-0">
            System overview, role management, catalog inventory, order fulfillment, and community moderation.
          </p>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {[
          { id: 'overview', label: '📊 System Overview' },
          { id: 'users', label: '👥 User & Role Management' },
          { id: 'products', label: '🛒 Inventory & Catalog' },
          { id: 'orders', label: '📦 Order Fulfillment' },
          { id: 'moderation', label: '🚩 Forum Moderation' },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${
              activeTab === tab.id ? 'btn-agri-primary' : 'btn-light border text-secondary'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: System Overview */}
      {activeTab === 'overview' && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-3">
              <div className="stat-card">
                <div className="stat-icon-wrapper" style={{ background: '#d1fae5', color: '#065f46' }}>
                  <FaUsers />
                </div>
                <div>
                  <div className="text-muted small">Total Users</div>
                  <h3 className="fw-bold mb-0">{stats.totalUsers || 0}</h3>
                  <small className="text-muted">{stats.farmersCount} Farmers • {stats.expertsCount} Experts</small>
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="stat-card">
                <div className="stat-icon-wrapper" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                  <FaTractor />
                </div>
                <div>
                  <div className="text-muted small">Monitored Farms & Crops</div>
                  <h3 className="fw-bold mb-0">{stats.totalFarms || 0} Farms</h3>
                  <small className="text-muted">{stats.totalCrops} Crop Cycles</small>
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="stat-card">
                <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#92400e' }}>
                  <FaStore />
                </div>
                <div>
                  <div className="text-muted small">Marketplace Orders</div>
                  <h3 className="fw-bold mb-0">{stats.totalOrders || 0}</h3>
                  <small className="text-muted">{stats.totalProducts} Active SKUs</small>
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="stat-card">
                <div className="stat-icon-wrapper" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                  <FaRupeeSign />
                </div>
                <div>
                  <div className="text-muted small">Demo Gross Volume</div>
                  <h3 className="fw-bold mb-0">₹{(stats.totalRevenue || 0).toLocaleString()}</h3>
                  <small className="text-muted">Simulated GMV</small>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
            <h5 className="fw-bold text-dark mb-3">Recent Orders Placed Across System</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 small">
                <thead className="table-light">
                  <tr>
                    <th>Order #</th>
                    <th>Farmer</th>
                    <th>Items Count</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics?.recentOrders?.map((ord) => (
                    <tr key={ord._id}>
                      <td className="fw-bold">#{ord.orderNumber}</td>
                      <td>{ord.farmer?.name} ({ord.farmer?.email})</td>
                      <td>{ord.items?.length} products</td>
                      <td className="fw-semibold text-success">₹{ord.totalAmount?.toLocaleString()}</td>
                      <td><span className="badge bg-light text-dark border">{ord.orderStatus}</span></td>
                      <td className="text-muted">{new Date(ord.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Tab 2: User & Role Management */}
      {activeTab === 'users' && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-3">
            <h5 className="fw-bold text-dark mb-0">Registered User Accounts ({users.length})</h5>

            <div className="d-flex gap-2">
              <select
                className="form-select form-select-sm"
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="farmer">Farmer</option>
                <option value="expert">Expert</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Current Role</th>
                  <th>Status</th>
                  <th>Assign Role</th>
                  <th className="text-end">Account Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="fw-bold">{u.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {u.phone || 'No phone'} • {u.location?.city || 'India'}
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span
                        className={`badge ${
                          u.role === 'admin'
                            ? 'bg-danger'
                            : u.role === 'expert'
                            ? 'bg-primary'
                            : 'bg-success'
                        } text-uppercase`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.isActive ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm w-auto"
                        value={u.role}
                        onChange={(e) => handleChangeRole(u._id, e.target.value)}
                      >
                        <option value="farmer">Farmer</option>
                        <option value="expert">Expert</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="text-end">
                      <button
                        className={`btn btn-sm ${u.isActive ? 'btn-outline-danger' : 'btn-outline-success'} py-0 px-2`}
                        onClick={() => handleToggleUserStatus(u._id)}
                      >
                        {u.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Inventory & Catalog */}
      {activeTab === 'products' && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark mb-0">Marketplace Products Catalog ({products.length})</h5>
            <button className="btn btn-sm btn-agri-primary" onClick={() => setShowProductModal(true)}>
              <FaPlus /> Add New Product
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Available</th>
                  <th>Organic</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img src={p.imageUrl} alt="" className="rounded object-fit-cover" style={{ width: 40, height: 40 }} />
                        <div>
                          <div className="fw-bold">{p.name}</div>
                          <div className="text-muted" style={{ fontSize: '0.7rem' }}>{p.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge bg-light text-dark border">{p.category}</span></td>
                    <td className="fw-bold">₹{p.price} / {p.unit}</td>
                    <td>
                      <span className={`badge ${p.stockQuantity > 10 ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                        {p.stockQuantity} units
                      </span>
                    </td>
                    <td>{p.isOrganic ? '🌿 Yes' : 'No'}</td>
                    <td>★ {p.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Order Fulfillment */}
      {activeTab === 'orders' && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <h5 className="fw-bold text-dark mb-3">All Customer Orders ({orders.length})</h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Destination</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord._id}>
                    <td className="fw-bold">#{ord.orderNumber}</td>
                    <td>
                      <div>{ord.shippingAddress?.fullName}</div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>{ord.shippingAddress?.phone}</div>
                    </td>
                    <td>{ord.shippingAddress?.city}, {ord.shippingAddress?.state}</td>
                    <td className="fw-bold text-success">₹{ord.totalAmount?.toLocaleString()}</td>
                    <td>
                      <span className="badge bg-light text-dark border">{ord.orderStatus}</span>
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm w-auto"
                        value={ord.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                      >
                        <option value="Placed">Placed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Forum Moderation */}
      {activeTab === 'moderation' && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <FaFlag className="text-danger" /> Community Reported Forum Content ({reportedPosts.length})
          </h5>

          {reportedPosts.length === 0 ? (
            <div className="text-center py-4 text-muted small">
              No reported posts in the moderation queue. Community forum is clean!
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {reportedPosts.map((post) => (
                <div key={post._id} className="p-3 border rounded-3 bg-light">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="fw-bold text-dark mb-0">{post.title}</h6>
                      <small className="text-muted">
                        Author: {post.author?.name} ({post.author?.email})
                      </small>
                    </div>
                    <span className="badge bg-danger">Flagged by Member</span>
                  </div>

                  <p className="small text-secondary mb-2">{post.content}</p>

                  <div className="p-2 bg-white rounded border small text-danger mb-3">
                    <strong>Report Reason:</strong> {post.reportReason || 'Flagged as inappropriate'}
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => handleModeratePost(post._id, 'approve')}
                    >
                      Approve & Clear Flag
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleModeratePost(post._id, 'remove')}
                    >
                      Remove from Forum
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Product Modal */}
      {showProductModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-dark">Add New Marketplace Product</h5>
                <button type="button" className="btn-close" onClick={() => setShowProductModal(false)}></button>
              </div>

              <form onSubmit={handleCreateProduct}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label small fw-semibold">Product Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Category *</label>
                      <select
                        className="form-select"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      >
                        <option value="Seeds">Seeds</option>
                        <option value="Fertilizers">Fertilizers</option>
                        <option value="Agricultural Tools">Agricultural Tools</option>
                        <option value="Irrigation Equipment">Irrigation Equipment</option>
                        <option value="Organic Farming Supplies">Organic Farming Supplies</option>
                        <option value="Crop Protection Products">Crop Protection Products</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Price (₹) *</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Stock Quantity *</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={newProduct.stockQuantity}
                        onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Unit</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newProduct.unit}
                        onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Description *</label>
                      <textarea
                        rows="2"
                        className="form-control"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        required
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowProductModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-agri-primary">
                    Create Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
