import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  FaClipboardList,
  FaTruck,
  FaCheckCircle,
  FaStore,
  FaMapMarkerAlt,
} from 'react-icons/fa';

const OrdersHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (st) => {
    if (st === 'Delivered') return 'bg-success text-white';
    if (st === 'Shipped') return 'bg-info text-white';
    if (st === 'Processing') return 'bg-primary text-white';
    if (st === 'Cancelled') return 'bg-danger text-white';
    return 'bg-warning text-dark';
  };

  return (
    <div className="orders-page pb-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">My Farming Supply Orders</h2>
          <p className="text-muted small mb-0">
            Track deliveries of certified seeds, organic fertilizers, and precision irrigation equipment.
          </p>
        </div>

        <Link to="/marketplace" className="btn btn-agri-primary btn-sm d-flex align-items-center gap-1 shadow-sm">
          <FaStore /> Browse Marketplace
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <FaClipboardList className="display-4 text-success opacity-50 mb-3 mx-auto" />
          <h5 className="fw-bold text-dark">No orders placed yet</h5>
          <p className="text-muted small">Explore our agricultural inputs catalog and place your first demo order.</p>
          <div>
            <Link to="/marketplace" className="btn btn-agri-primary">
              Visit Marketplace
            </Link>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {orders.map((order) => (
            <div key={order._id} className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center pb-3 border-bottom mb-3 gap-2">
                <div>
                  <span className="badge bg-light text-dark border me-2">#{order.orderNumber}</span>
                  <span className="text-muted small">
                    Ordered on {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <span className={`badge ${getStatusBadge(order.orderStatus)} px-3 py-1 fs-6`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Items in this order */}
              <div className="row g-3 mb-3">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="col-md-6">
                    <div className="p-2 border rounded-3 bg-light d-flex align-items-center gap-3">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="rounded object-fit-cover"
                          style={{ width: 48, height: 48 }}
                        />
                      )}
                      <div className="flex-grow-1 overflow-hidden">
                        <div className="fw-semibold small text-truncate">{item.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          Qty: {item.quantity} • ₹{item.price} each
                        </div>
                      </div>
                      <div className="fw-bold small">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Note & Destination */}
              <div className="p-3 rounded-3 bg-light border d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 small">
                <div>
                  <FaTruck className="text-success me-2" />
                  <strong>Logistics Update:</strong> {order.trackingNote || 'In transit to local hub.'}
                </div>
                <div className="text-muted">
                  <FaMapMarkerAlt className="text-danger me-1" />
                  Destination: {order.shippingAddress?.address}, {order.shippingAddress?.city}
                </div>
                <div className="fw-bold fs-6 text-success">
                  Total: ₹{order.totalAmount?.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersHistoryPage;
