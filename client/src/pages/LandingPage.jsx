import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaLeaf,
  FaCloudSun,
  FaVial,
  FaBug,
  FaStore,
  FaUserGraduate,
  FaArrowRight,
  FaCheckCircle,
  FaChartLine,
  FaShieldAlt,
  FaQuestionCircle,
  FaComments,
  FaCalendarCheck,
} from 'react-icons/fa';

const LandingPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const features = [
    {
      icon: <FaCloudSun className="text-warning fs-3" />,
      title: 'Precision Agro-Meteorology',
      desc: 'Real-time temperature, precipitation probability, humidity, and automated spray/irrigation precautions tailored to your fields.',
    },
    {
      icon: <FaVial className="text-info fs-3" />,
      title: 'NPK Soil Health Diagnostics',
      desc: 'Instant educational analysis of soil pH, Nitrogen, Phosphorus, Potassium, and organic matter with scientific amendment guidance.',
    },
    {
      icon: <FaBug className="text-danger fs-3" />,
      title: 'Pest Early Warning Alerts',
      desc: 'Verified regional pest bulletins, biological IPM recommendations, pheromone thresholds, and farmer field symptom reporting.',
    },
    {
      icon: <FaStore className="text-success fs-3" />,
      title: 'Certified Input Marketplace',
      desc: 'Explore high-yielding certified seeds, organic compost, water-soluble fertilizers, and drip systems with demo checkout.',
    },
    {
      icon: <FaUserGraduate className="text-primary fs-3" />,
      title: 'Agronomist Consultations',
      desc: 'Connect directly with certified soil scientists and plant pathologists for personalized crop health advice.',
    },
    {
      icon: <FaCalendarCheck className="text-secondary fs-3" />,
      title: 'Automated Farm Calendar',
      desc: 'Smart reminders for irrigation intervals, top-dressing fertigation, scouting windows, and harvesting timelines.',
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Register Your Farms',
      desc: 'Add your land parcels, GPS locations, acreage, soil types, and existing irrigation infrastructure.',
    },
    {
      step: '02',
      title: 'Log Sown Crops & Plots',
      desc: 'Record planting dates, varieties, and stage progress. The system automatically creates your crop calendar.',
    },
    {
      step: '03',
      title: 'Monitor & Receive Alerts',
      desc: 'Get proactive alerts on heatwaves, heavy downpours, pest outbreaks, and NPK deficiency corrections.',
    },
    {
      step: '04',
      title: 'Consult & Maximize Yield',
      desc: 'Seek expert advisory, order certified farming supplies, and make data-driven agricultural decisions.',
    },
  ];

  const testimonials = [
    {
      quote:
        'The automated drip fertigation reminders and soil NPK interpretation helped me balance our cotton nutrition and save 25% on redundant fertilizer expenses.',
      author: 'Ramesh Patil',
      role: 'Cotton & Vegetable Farmer, Baramati (Illustrative Profile)',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80',
    },
    {
      quote:
        'As an agronomist, reviewing structured farmer consultation requests with soil history and stage timelines allows me to prescribe accurate biological IPM solutions.',
      author: 'Dr. Anand Sharma',
      role: 'Senior Agronomist, Agricultural University (Illustrative Profile)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    {
      quote:
        'The pest early warning system notified our grower group about pink bollworm trap counts before severe damage occurred. It truly modernized our farm operations.',
      author: 'Priya Sharma',
      role: 'Cereal Producer, Ludhiana (Illustrative Profile)',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    },
  ];

  const faqs = [
    {
      q: 'Does Agri-Tech test soil physically through the app?',
      a: 'No. The platform analyzes laboratory test figures or on-farm sensor measurements entered by you and provides automated educational interpretations against agronomic benchmarks.',
    },
    {
      q: 'How does the weather forecast generate farming precautions?',
      a: 'Our agro-meteorological algorithm analyzes rainfall probability, wind velocity, and ambient temperatures to suggest operational precautions like delaying pesticide sprays before rain or scheduling light drip irrigation during heat stress.',
    },
    {
      q: 'Are marketplace orders real financial transactions?',
      a: 'No. This application features a demo checkout simulation designed for demonstration and learning. No actual credit card information is collected or charged.',
    },
    {
      q: 'Can agricultural experts and administrators use the system?',
      a: 'Yes! Agri-Tech includes dedicated role portals for Farmers, certified Agricultural Experts, and System Administrators with granular permissions.',
    },
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-gradient py-5 py-lg-6">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="badge bg-light text-success fw-bold px-3 py-2 rounded-pill mb-3 shadow-sm">
                🌾 Next-Gen Smart Farming Platform
              </span>
              <h1 className="display-4 fw-extrabold text-white mb-3" style={{ lineHeight: 1.15 }}>
                Empowering Farmers with Data-Driven Agriculture
              </h1>
              <p className="lead text-white-50 mb-4 fs-5">
                Manage your farms, monitor crop growth stages, access local weather precautions, analyze soil NPK balance, receive pest alerts, and consult certified agricultural scientists — all in one unified platform.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/register" className="btn btn-agri-accent btn-lg px-4 shadow">
                  Get Started Free <FaArrowRight className="ms-2" />
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg px-4">
                  Demo Sign In
                </Link>
              </div>

              <div className="d-flex align-items-center gap-4 mt-5 text-white-50 small">
                <div className="d-flex align-items-center gap-2">
                  <FaCheckCircle className="text-warning" /> Multi-Role Support
                </div>
                <div className="d-flex align-items-center gap-2">
                  <FaCheckCircle className="text-warning" /> English & हिन्दी
                </div>
                <div className="d-flex align-items-center gap-2">
                  <FaCheckCircle className="text-warning" /> Real Agro-Advisories
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card shadow-lg border-0 rounded-4 overflow-hidden bg-white text-dark p-3">
                <div className="p-3 bg-light rounded-3 mb-3 border">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-success">Smart Farming Preview</span>
                    <span className="text-muted small">Pune • Maharashtra</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <h2 className="display-6 fw-bold mb-0">28°C</h2>
                      <span className="text-muted small">Optimal Field Conditions</span>
                    </div>
                    <FaCloudSun className="display-4 text-warning" />
                  </div>
                </div>

                <div className="border rounded-3 p-3 mb-3 bg-white">
                  <div className="d-flex justify-content-between small text-muted mb-1">
                    <span>Cotton (Sector A-1)</span>
                    <span className="fw-bold text-success">Fruiting Stage • 75%</span>
                  </div>
                  <div className="agri-progress mb-2">
                    <div className="agri-progress-bar" style={{ width: '75%' }}></div>
                  </div>
                  <div className="d-flex justify-content-between small">
                    <span className="text-muted">Next Irrigation: Tomorrow</span>
                    <span className="badge bg-success-subtle text-success">Health: Excellent</span>
                  </div>
                </div>

                <div className="border rounded-3 p-3 bg-light-subtle">
                  <div className="d-flex align-items-center gap-2 text-danger fw-semibold small mb-1">
                    <FaBug /> Regional Pest Advisory
                  </div>
                  <p className="mb-0 small text-secondary">
                    Pink Bollworm pheromone monitoring active. Recommended bio-spray: Neem Oil 1500 ppm.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter (Clearly identified sample/platform data) */}
      <section className="py-4 bg-white border-bottom shadow-sm">
        <div className="container">
          <div className="row text-center g-4">
            <div className="col-6 col-md-3">
              <h3 className="fw-bold text-success mb-1">1,200+</h3>
              <p className="text-muted small mb-0">Registered Acres Monitored</p>
            </div>
            <div className="col-6 col-md-3">
              <h3 className="fw-bold text-success mb-1">98.4%</h3>
              <p className="text-muted small mb-0">Agronomic Advisory Accuracy</p>
            </div>
            <div className="col-6 col-md-3">
              <h3 className="fw-bold text-success mb-1">24/7</h3>
              <p className="text-muted small mb-0">Kisan Agro-Weather Guidance</p>
            </div>
            <div className="col-6 col-md-3">
              <h3 className="fw-bold text-success mb-1">100%</h3>
              <p className="text-muted small mb-0">Verified Demo Security</p>
            </div>
          </div>
          <div className="text-center mt-2">
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
              * Identified illustrative demonstration metrics representing platform test capacity.
            </span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-5 bg-cream">
        <div className="container py-4">
          <div className="text-center max-w-xl mx-auto mb-5">
            <span className="badge bg-success-subtle text-success fw-bold px-3 py-2 rounded-pill mb-2">
              Comprehensive Modules
            </span>
            <h2 className="fw-bold text-dark mb-3">Designed for the Complete Agricultural Lifecycle</h2>
            <p className="text-muted">
              From soil preparation and seed sowing to pest monitoring and harvesting, Agri-Tech connects every link in your farming chain.
            </p>
          </div>

          <div className="row g-4">
            {features.map((feat, idx) => (
              <div key={idx} className="col-md-6 col-lg-4">
                <div className="card h-100 agri-card border-0 p-4">
                  <div className="mb-3">{feat.icon}</div>
                  <h5 className="fw-bold text-dark mb-2">{feat.title}</h5>
                  <p className="text-muted small mb-0">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-5 bg-white border-top border-bottom">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="badge bg-primary-subtle text-primary fw-bold px-3 py-2 rounded-pill mb-2">
              Simple 4-Step Process
            </span>
            <h2 className="fw-bold text-dark">How Agri-Tech Works for You</h2>
          </div>

          <div className="row g-4">
            {workflowSteps.map((ws, idx) => (
              <div key={idx} className="col-md-6 col-lg-3">
                <div className="p-3 border rounded-3 h-100 bg-light">
                  <span className="display-6 fw-bold text-success opacity-50 d-block mb-2">{ws.step}</span>
                  <h6 className="fw-bold text-dark mb-2">{ws.title}</h6>
                  <p className="text-muted small mb-0">{ws.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-5 bg-cream">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="badge bg-warning-subtle text-warning-emphasis fw-bold px-3 py-2 rounded-pill mb-2">
              Farmer Stories
            </span>
            <h2 className="fw-bold text-dark">Trusted by Progressive Growers & Agronomists</h2>
            <span className="text-muted small d-block">* Illustrative demo profiles demonstrating real-world usage</span>
          </div>

          <div className="row g-4">
            {testimonials.map((t, idx) => (
              <div key={idx} className="col-lg-4 col-md-6">
                <div className="card h-100 border-0 shadow-sm p-4 rounded-4">
                  <p className="text-secondary fst-italic mb-4">"{t.quote}"</p>
                  <div className="d-flex align-items-center mt-auto">
                    <img
                      src={t.avatar}
                      alt={t.author}
                      className="rounded-circle me-3 object-fit-cover"
                      style={{ width: 48, height: 48 }}
                    />
                    <div>
                      <h6 className="fw-bold mb-0 text-dark">{t.author}</h6>
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>{t.role}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark">Frequently Asked Questions</h2>
            <p className="text-muted">Clear, transparent answers about our smart farming technology.</p>
          </div>

          <div className="max-w-2xl mx-auto" style={{ maxWidth: 750 }}>
            <div className="accordion" id="faqAccordion">
              {faqs.map((faq, idx) => (
                <div key={idx} className="accordion-item mb-3 border rounded-3 overflow-hidden">
                  <h2 className="accordion-header">
                    <button
                      className={`accordion-button ${activeFaq === idx ? '' : 'collapsed'}`}
                      type="button"
                      onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    >
                      <FaQuestionCircle className="me-2 text-success" />
                      <strong>{faq.q}</strong>
                    </button>
                  </h2>
                  <div className={`accordion-collapse collapse ${activeFaq === idx ? 'show' : ''}`}>
                    <div className="accordion-body text-secondary small">{faq.a}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)', color: 'white' }}>
        <div className="container text-center py-4">
          <h2 className="display-6 fw-bold mb-3">Ready to Modernize Your Farming Journey?</h2>
          <p className="lead text-white-50 max-w-xl mx-auto mb-4" style={{ maxWidth: 600 }}>
            Join our smart farming community today. Access instant agro-weather forecasts, soil analysis, and certified experts.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/register" className="btn btn-agri-accent btn-lg px-4">
              Create Your Free Account
            </Link>
            <Link to="/marketplace" className="btn btn-outline-light btn-lg px-4">
              Explore Marketplace
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
