import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import {
  FaStore,
  FaSearch,
  FaShoppingCart,
  FaTrash,
  FaPlus,
  FaMinus,
  FaCheckCircle,
  FaShieldAlt,
  FaStar,
  FaTag,
  FaTimes,
  FaTruck,
} from 'react-icons/fa';

const CATEGORIES = [
  'All',
  'Seeds',
  'Fertilizers',
  'Agricultural Tools',
  'Irrigation Equipment',
  'Organic Farming Supplies',
  'Crop Protection Products',
];

const MarketplacePage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartSubtotal, cartCount } = useCart();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortBy, setSortBy] = useState('-createdAt');

  // Drawer & Checkout Modal states
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '+91 9822012345',
    address: user?.address || 'Plot 42, Shivraj Nagar',
    city: user?.location?.city || 'Pune',
    state: user?.location?.state || 'Maharashtra',
    postalCode: '411001',
  });

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, organicOnly, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (organicOnly) params.organicOnly = true;
      if (sortBy) params.sort = sortBy;
      if (search) params.search = search;

      const res = await api.get('/products', { params });
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleDemoCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    try {
      setCheckingOut(true);
      const itemsPayload = cartItems.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
      }));

      const res = await api.post('/orders', {
        items: itemsPayload,
        shippingAddress,
      });

      if (res.data.success) {
        setPlacedOrder(res.data.order);
        clearCart();
        setShowCheckoutModal(false);
        fetchProducts(); // refresh stock numbers
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Demo checkout encountered an error');
    } finally {
      setCheckingOut(false);
    }
  };

  const shippingFee = cartSubtotal > 1500 || cartSubtotal === 0 ? 0 : 99;
  const grandTotal = cartSubtotal + shippingFee;

  return (
    <div className="marketplace-page pb-5 position-relative">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">{t('marketplace.title')}</h2>
          <p className="text-muted small mb-0">{t('marketplace.subtitle')}</p>
        </div>

        <button
          className="btn btn-agri-primary position-relative d-flex align-items-center gap-2 shadow-sm"
          onClick={() => setShowCartDrawer(true)}
        >
          <FaShoppingCart /> View Cart ({cartCount})
          {cartCount > 0 && (
            <span className="badge bg-danger rounded-pill ms-1">₹{cartSubtotal.toLocaleString()}</span>
          )}
        </button>
      </div>

      {/* Demo Notice Banner */}
      <div className="alert alert-info border-info-subtle shadow-sm rounded-4 mb-4 small d-flex align-items-center gap-3">
        <FaShieldAlt className="fs-3 text-info flex-shrink-0" />
        <div>
          <strong>Educational Demonstration Mode:</strong> {t('marketplace.demoNotice')} Orders update real database stock
          and trigger simulated agricultural logistics tracking without asking for real cards.
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${
              selectedCategory === cat ? 'btn-agri-primary' : 'btn-light border text-secondary'
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search & Sorting Toolbar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-md-6">
            <form onSubmit={handleSearchSubmit}>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FaSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search seeds, fertilizers, drip components..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" className="btn btn-agri-primary">
                  Search
                </button>
              </div>
            </form>
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="-createdAt">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          <div className="col-md-3">
            <div className="form-check form-switch pt-1">
              <input
                className="form-check-input"
                type="checkbox"
                id="organicSwitch"
                checked={organicOnly}
                onChange={(e) => setOrganicOnly(e.target.checked)}
              />
              <label className="form-check-label small fw-semibold text-success" htmlFor="organicSwitch">
                🌿 Certified Organic Only
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Product Catalog Cards */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <FaStore className="display-4 text-success opacity-50 mb-3 mx-auto" />
          <h5 className="fw-bold text-dark">No products found matching filters</h5>
          <p className="text-muted small">Try adjusting your search keywords or switching category filters.</p>
        </div>
      ) : (
        <div className="row g-4">
          {products.map((prod) => (
            <div key={prod._id} className="col-sm-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm rounded-4 agri-card overflow-hidden d-flex flex-column">
                <div className="position-relative">
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="card-img-top object-fit-cover"
                    style={{ height: 180 }}
                  />
                  {prod.isOrganic && (
                    <span className="position-absolute top-0 start-0 m-2 badge bg-success shadow-sm">
                      🌿 100% Organic
                    </span>
                  )}
                  {prod.stockQuantity <= 5 && prod.stockQuantity > 0 && (
                    <span className="position-absolute top-0 end-0 m-2 badge bg-warning text-dark shadow-sm">
                      Only {prod.stockQuantity} left
                    </span>
                  )}
                </div>

                <div className="card-body p-3 d-flex flex-column">
                  <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                    {prod.brand} • {prod.category}
                  </span>

                  <h6 className="fw-bold text-dark mb-1 text-truncate-2" style={{ minHeight: 40 }}>
                    {prod.name}
                  </h6>

                  <div className="d-flex align-items-center gap-1 text-warning small mb-2">
                    <FaStar /> <span className="text-dark fw-bold">{prod.rating || 4.8}</span>
                    <span className="text-muted">({prod.reviewsCount || 18})</span>
                  </div>

                  <p className="text-muted small mb-3 flex-grow-1" style={{ fontSize: '0.8rem', maxHeight: 42, overflow: 'hidden' }}>
                    {prod.description}
                  </p>

                  <div className="d-flex justify-content-between align-items-baseline mb-3">
                    <div>
                      <span className="fs-5 fw-bold text-dark">₹{prod.price}</span>
                      {prod.originalPrice > prod.price && (
                        <span className="text-muted text-decoration-line-through small ms-2">
                          ₹{prod.originalPrice}
                        </span>
                      )}
                    </div>
                    <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                      per {prod.unit}
                    </span>
                  </div>

                  <button
                    disabled={prod.stockQuantity === 0}
                    className="btn btn-sm btn-agri-primary w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 mt-auto"
                    onClick={() => addToCart(prod, 1)}
                  >
                    <FaShoppingCart /> {prod.stockQuantity === 0 ? 'Out of Stock' : t('marketplace.addToCart')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cart Drawer Overlay */}
      {showCartDrawer && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1040 }}
            onClick={() => setShowCartDrawer(false)}
          ></div>
          <div
            className="position-fixed top-0 end-0 bg-white shadow-lg h-100 p-4 d-flex flex-column"
            style={{ width: '100%', maxWidth: 420, zIndex: 1050 }}
          >
            <div className="d-flex justify-content-between align-items-center pb-3 border-bottom mb-3">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <FaShoppingCart className="text-success" />
                Shopping Cart ({cartCount})
              </h5>
              <button className="btn btn-sm btn-light border-0" onClick={() => setShowCartDrawer(false)}>
                <FaTimes />
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center my-auto py-5 text-muted">
                <FaShoppingCart className="display-4 opacity-25 mb-3" />
                <p>Your agricultural cart is empty.</p>
              </div>
            ) : (
              <div className="flex-grow-1 overflow-auto pe-1">
                {cartItems.map((item) => (
                  <div key={item._id} className="p-2 mb-2 border rounded-3 bg-light d-flex align-items-center gap-2">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="rounded object-fit-cover"
                      style={{ width: 50, height: 50 }}
                    />
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="fw-semibold text-truncate small">{item.name}</div>
                      <div className="text-muted small">
                        ₹{item.price} / {item.unit}
                      </div>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <button
                          className="btn btn-sm btn-outline-secondary py-0 px-2"
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        >
                          <FaMinus style={{ fontSize: '0.65rem' }} />
                        </button>
                        <span className="fw-bold small">{item.quantity}</span>
                        <button
                          className="btn btn-sm btn-outline-secondary py-0 px-2"
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        >
                          <FaPlus style={{ fontSize: '0.65rem' }} />
                        </button>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold small">₹{(item.price * item.quantity).toLocaleString()}</div>
                      <button
                        className="btn btn-sm text-danger p-0 mt-1"
                        onClick={() => removeFromCart(item._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-top mt-auto">
              <div className="d-flex justify-content-between small text-muted mb-1">
                <span>Subtotal:</span>
                <span>₹{cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between small text-muted mb-2">
                <span>Delivery:</span>
                <span>{shippingFee === 0 ? 'Free' : `₹${shippingFee}`}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                <span>Total:</span>
                <span className="text-success">₹{grandTotal.toLocaleString()}</span>
              </div>

              <button
                disabled={cartItems.length === 0}
                className="btn btn-agri-primary w-100 py-2 fw-semibold"
                onClick={() => {
                  setShowCartDrawer(false);
                  setShowCheckoutModal(true);
                }}
              >
                Proceed to Demo Checkout
              </button>
            </div>
          </div>
        </>
      )}

      {/* Demo Checkout Modal */}
      {showCheckoutModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-light">
                <div>
                  <h5 className="modal-title fw-bold text-dark">
                    🌾 Complete Your Demo Agricultural Order
                  </h5>
                  <span className="badge bg-warning text-dark mt-1">
                    Simulation Only • Zero Charges Apply
                  </span>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowCheckoutModal(false)}></button>
              </div>

              <form onSubmit={handleDemoCheckout}>
                <div className="modal-body p-4">
                  <div className="row g-4">
                    <div className="col-md-7">
                      <h6 className="fw-bold text-dark mb-3">
                        <FaTruck className="text-success me-2" />
                        Farm Delivery Destination
                      </h6>

                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label small fw-semibold">Recipient Farmer Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={shippingAddress.fullName}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                            required
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Contact Phone Number *</label>
                          <input
                            type="tel"
                            className="form-control"
                            value={shippingAddress.phone}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                            required
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Postal PIN Code *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={shippingAddress.postalCode}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                            required
                          />
                        </div>

                        <div className="col-12">
                          <label className="form-label small fw-semibold">Farm Address / Landmark *</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Plot number, canal road..."
                            value={shippingAddress.address}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                            required
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">District / City *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={shippingAddress.city}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                            required
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">State *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={shippingAddress.state}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-md-5">
                      <div className="p-3 bg-light rounded-4 border">
                        <h6 className="fw-bold text-dark mb-2">Order Items ({cartCount})</h6>
                        <div className="overflow-auto mb-3" style={{ maxHeight: 180 }}>
                          {cartItems.map((it) => (
                            <div key={it._id} className="d-flex justify-content-between small text-muted mb-1">
                              <span className="text-truncate" style={{ maxWidth: 170 }}>
                                {it.name} (x{it.quantity})
                              </span>
                              <span className="fw-semibold">₹{(it.price * it.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        <hr />

                        <div className="d-flex justify-content-between small text-muted mb-1">
                          <span>Items Subtotal:</span>
                          <span>₹{cartSubtotal.toLocaleString()}</span>
                        </div>
                        <div className="d-flex justify-content-between small text-muted mb-2">
                          <span>Delivery Fee:</span>
                          <span>{shippingFee === 0 ? 'Free' : `₹${shippingFee}`}</span>
                        </div>
                        <div className="d-flex justify-content-between fw-bold fs-5 text-dark mb-3">
                          <span>Payable Amount:</span>
                          <span className="text-success">₹{grandTotal.toLocaleString()}</span>
                        </div>

                        <div className="p-2 bg-success-subtle rounded text-success small mb-3 border border-success-subtle">
                          ✓ Verified Demo Approval: Instant validation against live stock.
                        </div>

                        <button
                          type="submit"
                          disabled={checkingOut}
                          className="btn btn-agri-primary w-100 py-2 fw-semibold"
                        >
                          {checkingOut ? 'Confirming Demo Order...' : 'Confirm Demo Order'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Order Confirmed Success Modal */}
      {placedOrder && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-center p-4">
              <div
                className="d-inline-flex align-items-center justify-content-center text-white bg-success rounded-circle mx-auto mb-3"
                style={{ width: 64, height: 64 }}
              >
                <FaCheckCircle className="fs-2" />
              </div>

              <h4 className="fw-bold text-dark mb-1">Demo Order Placed Successfully!</h4>
              <p className="text-muted small">
                Order Reference: <strong>#{placedOrder.orderNumber}</strong>
              </p>

              <div className="p-3 bg-light rounded-3 border text-start small mb-3">
                <div><strong>Amount:</strong> ₹{placedOrder.totalAmount?.toLocaleString()}</div>
                <div><strong>Payment:</strong> {placedOrder.paymentMethod}</div>
                <div><strong>Delivery Status:</strong> {placedOrder.orderStatus}</div>
                <div><strong>Destination:</strong> {placedOrder.shippingAddress?.address}, {placedOrder.shippingAddress?.city}</div>
              </div>

              <div className="d-flex gap-2 justify-content-center">
                <Link to="/orders" className="btn btn-agri-primary">
                  View All My Orders
                </Link>
                <button className="btn btn-light border" onClick={() => setPlacedOrder(null)}>
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
