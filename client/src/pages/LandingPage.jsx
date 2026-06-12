import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  HardHat,
  LogIn,
  Menu,
  ArrowRight,
  ShieldCheck,
  GitMerge,
  Zap,
  PlugZap,
  Droplet,
  Hammer,
  Wrench,
  Settings,
  Home,
  Briefcase,
  CheckCircle2,
  Layers,
  Search,
  Users,
  Sparkles,
  Shield,
  Clock,
  Star,
  Rocket,
  Phone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { getHealthStatus } from '../services/api.js';
import './LandingPage.css';

// Inline brand SVGs to prevent lucide-react build errors for brand icons
const Facebook = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Instagram = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const Twitter = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

const Linkedin = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [health, setHealth] = useState(null);
  const [healthError, setHealthError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const canvasRef = useRef(null);

  // Counter states
  const [counters, setCounters] = useState({
    technicians: 0,
    services: 0,
    satisfaction: 0,
    time: 0,
  });

  // Fetch health status
  useEffect(() => {
    const loadHealth = async () => {
      try {
        const data = await getHealthStatus();
        setHealth(data);
      } catch {
        setHealthError('No se pudo conectar con la API.');
      }
    };
    loadHealth();
  }, []);

  // Header scroll class
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Particle background logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let mouse = { x: null, y: null };
    const PARTICLE_COUNT = 60;
    const CONNECTION_DIST = 150;
    const MOUSE_DIST = 200;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        if (mouse.x !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_DIST) {
            const force = ((MOUSE_DIST - dist) / MOUSE_DIST) * 0.02;
            this.vx += dx * force;
            this.vy += dy * force;
          }
        }

        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 1.5) {
          this.vx = (this.vx / speed) * 1.5;
          this.vy = (this.vy / speed) * 1.5;
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(11, 17, 32, 0.15)';
        ctx.fill();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(11, 17, 32, ${0.06 * (1 - dist / CONNECTION_DIST)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Scroll reveal trigger
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal-up');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.style.animationDelay || '0s';
            entry.target.style.transitionDelay = delay;
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Counter triggers
  useEffect(() => {
    const statsGrid = document.querySelector('.stats-grid');
    if (!statsGrid) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter('technicians', 500);
            animateCounter('services', 2500);
            animateCounter('satisfaction', 98);
            animateCounter('time', 15);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(statsGrid);

    const animateCounter = (key, target) => {
      const duration = 2000;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCounters((prev) => ({
          ...prev,
          [key]: Math.floor(target * eased),
        }));
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          setCounters((prev) => ({ ...prev, [key]: target }));
        }
      };
      requestAnimationFrame(step);
    };

    return () => observer.disconnect();
  }, []);

  // 3D Tilt handlers
  const handleMouseMove3D = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  };

  const handleMouseLeave3D = (e) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  };

  // Smooth scroll helper
  const handleAnchorClick = (e, targetId) => {
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="landing-page-root">
      <canvas id="particleCanvas" ref={canvasRef} />

      {/* Header */}
      <header id="mainHeader" className={scrolled ? 'scrolled' : ''}>
        <div className="container header-inner">
          <div className="logo">
            <div className="logo-icon">
              <Activity />
            </div>
            <span className="logo-text">Tecnilink</span>
          </div>

          <nav className="nav-links">
            <a href="#servicios" onClick={(e) => handleAnchorClick(e, '#servicios')}>
              Servicios
            </a>
            <a href="#como-funciona" onClick={(e) => handleAnchorClick(e, '#como-funciona')}>
              Cómo funciona
            </a>
            <a href="#testimonios" onClick={(e) => handleAnchorClick(e, '#testimonios')}>
              Testimonios
            </a>
            <a href="#contacto" onClick={(e) => handleAnchorClick(e, '#contacto')}>
              Contacto
            </a>
          </nav>

          <div className="header-actions">
            <Link to="/login" className="nav-link-secondary">
              <HardHat style={{ width: '16px', height: '16px' }} /> Soy Técnico
            </Link>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary btn-sm">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="nav-link-secondary">
                  <LogIn style={{ width: '16px', height: '16px' }} /> Iniciar sesión
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Registrarse
                </Link>
              </>
            )}
          </div>

          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu />
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <a href="#servicios" onClick={(e) => handleAnchorClick(e, '#servicios')}>
            Servicios
          </a>
          <a href="#como-funciona" onClick={(e) => handleAnchorClick(e, '#como-funciona')}>
            Cómo funciona
          </a>
          <a href="#testimonios" onClick={(e) => handleAnchorClick(e, '#testimonios')}>
            Testimonios
          </a>
          <a href="#contacto" onClick={(e) => handleAnchorClick(e, '#contacto')}>
            Contacto
          </a>
          <Link to="/login" className="nav-link-secondary" onClick={() => setMobileMenuOpen(false)}>
            Soy Técnico
          </Link>
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="btn btn-primary"
              style={{ textAlign: 'center' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="nav-link-secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
                style={{ textAlign: 'center' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero" id="hero">
        <div className="container hero-grid">
          <div className="hero-content reveal-up">
            <div className="badge animate-pulse-slow">
              <span className="badge-dot"></span>
              Soporte técnico a domicilio
            </div>
            <h1 className="hero-title">
              El experto que necesitas, <span className="gradient-text">a un clic de distancia.</span>
            </h1>
            <p className="hero-description">
              Gestiona solicitudes técnicas de manera rápida y segura. Conecta con{' '}
              <strong>carpinteros, electricistas y gasfiteros</strong> verificados y listos para
              solucionar tus problemas.
            </p>
            <div className="hero-buttons">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg">
                  Solicitar un servicio <ArrowRight style={{ width: '18px', height: '18px' }} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Solicitar un servicio <ArrowRight style={{ width: '18px', height: '18px' }} />
                  </Link>
                  <Link to="/login" className="btn btn-outline btn-lg">
                    Ofrecer mis servicios
                  </Link>
                </>
              )}
            </div>
            <div className="trust-badges">
              <div className="trust-badge">
                <ShieldCheck style={{ width: '16px', height: '16px' }} /> Profesionales verificados
              </div>
              <div className="trust-badge">
                <GitMerge style={{ width: '16px', height: '16px' }} /> Flujo trazable
              </div>
              <div className="trust-badge">
                <Zap style={{ width: '16px', height: '16px' }} /> Atención rápida
              </div>
            </div>
          </div>

          <div className="hero-visual reveal-up" style={{ animationDelay: '0.2s' }}>
            <div
              className="service-card card-3d"
              onMouseMove={handleMouseMove3D}
              onMouseLeave={handleMouseLeave3D}
            >
              <div className="service-card-header">
                <h3>Servicios Disponibles</h3>
                <div className="live-indicator">
                  <span className="live-dot"></span> En vivo
                </div>
              </div>
              <div className="service-list">
                <div className="service-item" style={{ animationDelay: '0.3s' }}>
                  <div className="service-item-left">
                    <div className="service-icon electric">
                      <PlugZap />
                    </div>
                    <div>
                      <p className="service-name">Electricistas</p>
                      <p className="service-desc">Instalaciones y reparaciones</p>
                    </div>
                  </div>
                  <div className="available-badge">
                    <span className="avail-dot"></span> Disponibles
                  </div>
                </div>

                <div className="service-item" style={{ animationDelay: '0.5s' }}>
                  <div className="service-item-left">
                    <div className="service-icon plumber">
                      <Droplet />
                    </div>
                    <div>
                      <p className="service-name">Gasfiteros</p>
                      <p className="service-desc">Fugas, tuberías y desagües</p>
                    </div>
                  </div>
                  <div className="available-badge">
                    <span className="avail-dot"></span> Disponibles
                  </div>
                </div>

                <div className="service-item" style={{ animationDelay: '0.7s' }}>
                  <div className="service-item-left">
                    <div className="service-icon carpenter">
                      <Hammer />
                    </div>
                    <div>
                      <p className="service-name">Carpinteros</p>
                      <p className="service-desc">Muebles y estructuras a medida</p>
                    </div>
                  </div>
                  <div className="available-badge">
                    <span className="avail-dot"></span> Disponibles
                  </div>
                </div>
              </div>

              {/* API Connection Indicator */}
              <div
                style={{
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: '1px solid #f1f5f9',
                  fontSize: '13px',
                }}
              >
                <span style={{ fontWeight: '600', color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                  Estado de la Plataforma:
                </span>
                {health ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: '500' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#22c55e',
                      }}
                    />
                    Servidor en línea ({health.environment})
                  </div>
                ) : healthError ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontWeight: '500' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#ef4444',
                      }}
                    />
                    Error de conexión con el backend
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#eab308', fontWeight: '500' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#eab308',
                        animation: 'pulse 1.5s infinite',
                      }}
                    />
                    Verificando sistema...
                  </div>
                )}
              </div>
            </div>

            {/* Decorative floaters */}
            <div className="floating-element float-1">
              <Wrench style={{ width: '24px', height: '24px' }} />
            </div>
            <div className="floating-element float-2">
              <Settings style={{ width: '20px', height: '20px' }} />
            </div>
            <div className="floating-element float-3">
              <Home style={{ width: '22px', height: '22px' }} />
            </div>
            <div className="dashed-border"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item reveal-up">
              <span className="stat-number">{counters.technicians}</span>
              <span className="stat-plus">+</span>
              <p className="stat-label">Técnicos verificados</p>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item reveal-up" style={{ animationDelay: '0.1s' }}>
              <span className="stat-number">{counters.services}</span>
              <span className="stat-plus">+</span>
              <p className="stat-label">Servicios completados</p>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item reveal-up" style={{ animationDelay: '0.2s' }}>
              <span className="stat-number">{counters.satisfaction}</span>
              <span className="stat-plus">%</span>
              <p className="stat-label">Clientes satisfechos</p>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item reveal-up" style={{ animationDelay: '0.3s' }}>
              <span className="stat-number">{counters.time}</span>
              <span className="stat-plus">min</span>
              <p className="stat-label">Tiempo promedio de respuesta</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section" id="servicios">
        <div className="container">
          <div className="section-header reveal-up">
            <div className="badge badge-center">
              <Briefcase style={{ width: '14px', height: '14px' }} /> Nuestros Servicios
            </div>
            <h2 className="section-title">
              Todo lo que tu hogar necesita, <span className="gradient-text">en un solo lugar</span>
            </h2>
            <p className="section-subtitle">
              Profesionales capacitados para cada tipo de trabajo en tu hogar u oficina.
            </p>
          </div>
          <div className="services-grid">
            <div
              className="service-card-big card-3d reveal-up"
              onMouseMove={handleMouseMove3D}
              onMouseLeave={handleMouseLeave3D}
            >
              <div className="service-card-big-icon electric-bg">
                <PlugZap />
              </div>
              <h3>Electricistas</h3>
              <p>
                Instalaciones eléctricas, reparación de cortocircuitos, cableado estructurado y
                mantenimiento preventivo.
              </p>
              <ul className="service-features">
                <li>
                  <CheckCircle2 style={{ width: '16px', height: '16px', color: '#22c55e' }} />{' '}
                  Certificados
                </li>
                <li>
                  <CheckCircle2 style={{ width: '16px', height: '16px', color: '#22c55e' }} />{' '}
                  Herramientas propias
                </li>
                <li>
                  <CheckCircle2 style={{ width: '16px', height: '16px', color: '#22c55e' }} />{' '}
                  Garantía de trabajo
                </li>
              </ul>
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-outline btn-sm">
                  Solicitar <ArrowRight style={{ width: '14px', height: '14px' }} />
                </Link>
              ) : (
                <Link to="/login" className="btn btn-outline btn-sm">
                  Solicitar <ArrowRight style={{ width: '14px', height: '14px' }} />
                </Link>
              )}
            </div>

            <div
              className="service-card-big card-3d reveal-up"
              style={{ animationDelay: '0.15s' }}
              onMouseMove={handleMouseMove3D}
              onMouseLeave={handleMouseLeave3D}
            >
              <div className="service-card-big-icon plumber-bg">
                <Droplet />
              </div>
              <h3>Gasfiteros</h3>
              <p>
                Reparación de fugas, instalación de tuberías, mantenimiento de desagües y
                sistemas de agua caliente.
              </p>
              <ul className="service-features">
                <li>
                  <CheckCircle2 style={{ width: '16px', height: '16px', color: '#22c55e' }} />{' '}
                  Respuesta rápida
                </li>
                <li>
                  <CheckCircle2 style={{ width: '16px', height: '16px', color: '#22c55e' }} />{' '}
                  Materiales de calidad
                </li>
                <li>
                  <CheckCircle2 style={{ width: '16px', height: '16px', color: '#22c55e' }} />{' '}
                  Presupuesto previo
                </li>
              </ul>
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-outline btn-sm">
                  Solicitar <ArrowRight style={{ width: '14px', height: '14px' }} />
                </Link>
              ) : (
                <Link to="/login" className="btn btn-outline btn-sm">
                  Solicitar <ArrowRight style={{ width: '14px', height: '14px' }} />
                </Link>
              )}
            </div>

            <div
              className="service-card-big card-3d reveal-up"
              style={{ animationDelay: '0.3s' }}
              onMouseMove={handleMouseMove3D}
              onMouseLeave={handleMouseLeave3D}
            >
              <div className="service-card-big-icon carpenter-bg">
                <Hammer />
              </div>
              <h3>Carpinteros</h3>
              <p>
                Muebles a medida, reparación de puertas, instalación de closets y todo tipo de
                estructuras de madera.
              </p>
              <ul className="service-features">
                <li>
                  <CheckCircle2 style={{ width: '16px', height: '16px', color: '#22c55e' }} />{' '}
                  Diseño personalizado
                </li>
                <li>
                  <CheckCircle2 style={{ width: '16px', height: '16px', color: '#22c55e' }} />{' '}
                  Madera de calidad
                </li>
                <li>
                  <CheckCircle2 style={{ width: '16px', height: '16px', color: '#22c55e' }} />{' '}
                  Entrega puntual
                </li>
              </ul>
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-outline btn-sm">
                  Solicitar <ArrowRight style={{ width: '14px', height: '14px' }} />
                </Link>
              ) : (
                <Link to="/login" className="btn btn-outline btn-sm">
                  Solicitar <ArrowRight style={{ width: '14px', height: '14px' }} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section" id="como-funciona">
        <div className="container">
          <div className="section-header reveal-up">
            <div className="badge badge-center">
              <Layers style={{ width: '14px', height: '14px' }} /> Proceso Simple
            </div>
            <h2 className="section-title">
              ¿Cómo funciona <span className="gradient-text">Tecnilink</span>?
            </h2>
            <p className="section-subtitle">
              En solo 3 pasos tendrás a un profesional en tu puerta.
            </p>
          </div>
          <div className="steps-grid">
            <div className="step-card reveal-up">
              <div className="step-number">01</div>
              <div className="step-icon-wrap">
                <Search />
              </div>
              <h3>Describe tu problema</h3>
              <p>Cuéntanos qué necesitas reparar o instalar. Adjunta fotos si es necesario.</p>
              <div className="step-connector"></div>
            </div>

            <div className="step-card reveal-up" style={{ animationDelay: '0.15s' }}>
              <div className="step-number">02</div>
              <div className="step-icon-wrap">
                <Users />
              </div>
              <h3>Conecta con expertos</h3>
              <p>Te asignamos al técnico más cercano y mejor calificado para tu necesidad.</p>
              <div className="step-connector"></div>
            </div>

            <div className="step-card reveal-up" style={{ animationDelay: '0.3s' }}>
              <div className="step-number">03</div>
              <div className="step-icon-wrap">
                <CheckCircle2 />
              </div>
              <h3>Problema resuelto</h3>
              <p>El técnico llega, soluciona y tú calificas el servicio. ¡Así de fácil!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="showcase-section">
        <div className="container">
          <div className="showcase-grid reveal-up">
            <div className="showcase-image">
              <img src="/assets/services-illustration.png" alt="Servicios de Tecnilink" loading="lazy" />
            </div>
            <div className="showcase-content">
              <div className="badge">
                <Sparkles style={{ width: '14px', height: '14px' }} /> ¿Por qué elegirnos?
              </div>
              <h2 className="section-title" style={{ textAlign: 'left', margin: 0 }}>
                La plataforma que <span className="gradient-text">revoluciona</span> el soporte técnico
              </h2>
              <p className="showcase-text">
                Tecnilink no es solo una app de servicios. Es una plataforma integral que garantiza
                calidad, seguridad y trazabilidad en cada solicitud.
              </p>
              <div className="feature-list">
                <div className="feature-item">
                  <div className="feature-icon">
                    <Shield style={{ width: '20px', height: '20px' }} />
                  </div>
                  <div>
                    <h4>Técnicos verificados</h4>
                    <p>Cada profesional pasa por un riguroso proceso de verificación.</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon">
                    <Clock style={{ width: '20px', height: '20px' }} />
                  </div>
                  <div>
                    <h4>Seguimiento en tiempo real</h4>
                    <p>Conoce el estado de tu solicitud en cada momento.</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon">
                    <Star style={{ width: '20px', height: '20px' }} />
                  </div>
                  <div>
                    <h4>Sistema de calificaciones</h4>
                    <p>Califica y revisa opiniones antes de contratar.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section" id="testimonios">
        <div className="container">
          <div className="section-header reveal-up">
            <div className="badge badge-center">
              <Star style={{ width: '14px', height: '14px' }} /> Testimonios
            </div>
            <h2 className="section-title">
              Lo que dicen nuestros <span className="gradient-text">clientes</span>
            </h2>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card card-3d reveal-up">
              <div className="stars">★★★★★</div>
              <p>
                "El electricista llegó en menos de 20 minutos. Resolvió el problema rápido y dejó
                todo limpio. ¡Excelente servicio!"
              </p>
              <div className="testimonial-author">
                <div
                  className="author-avatar"
                  style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}
                >
                  MR
                </div>
                <div>
                  <strong>María Rodríguez</strong>
                  <span>Lima, Perú</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card card-3d reveal-up" style={{ animationDelay: '0.15s' }}>
              <div className="stars">★★★★★</div>
              <p>
                "Necesitaba un carpintero urgente para un closet. La plataforma me conectó con un
                profesional increíble en minutos."
              </p>
              <div className="testimonial-author">
                <div
                  className="author-avatar"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
                >
                  CP
                </div>
                <div>
                  <strong>Carlos Paredes</strong>
                  <span>Arequipa, Perú</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card card-3d reveal-up" style={{ animationDelay: '0.3s' }}>
              <div className="stars">★★★★★</div>
              <p>
                "Como gasfitero, Tecnilink me ha permitido conseguir más clientes y organizar
                mejor mi trabajo. La recomiendo."
              </p>
              <div className="testimonial-author">
                <div
                  className="author-avatar"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                  LT
                </div>
                <div>
                  <strong>Luis Torres</strong>
                  <span>Cusco, Perú</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="contacto">
        <div className="container">
          <div className="cta-card reveal-up">
            <div className="cta-bg-pattern"></div>
            <h2>¿Listo para resolver tus problemas del hogar?</h2>
            <p>
              Únete a miles de personas que ya confían en Tecnilink para mantener su hogar en
              perfectas condiciones.
            </p>
            <div className="cta-buttons">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-white btn-lg">
                  <Rocket style={{ width: '18px', height: '18px' }} /> Comenzar ahora
                </Link>
              ) : (
                <Link to="/register" className="btn btn-white btn-lg">
                  <Rocket style={{ width: '18px', height: '18px' }} /> Comenzar ahora
                </Link>
              )}
              <a href="#contacto" onClick={(e) => handleAnchorClick(e, '#contacto')} className="btn btn-ghost btn-lg">
                <Phone style={{ width: '18px', height: '18px' }} /> Contáctanos
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo">
                <div className="logo-icon">
                  <Activity />
                </div>
                <span className="logo-text">Tecnilink</span>
              </div>
              <p>
                La plataforma que conecta hogares con profesionales de confianza para todo tipo de
                soporte técnico.
              </p>
              <div className="social-links">
                <a href="#">
                  <Facebook style={{ width: '18px', height: '18px' }} />
                </a>
                <a href="#">
                  <Instagram style={{ width: '18px', height: '18px' }} />
                </a>
                <a href="#">
                  <Twitter style={{ width: '18px', height: '18px' }} />
                </a>
                <a href="#">
                  <Linkedin style={{ width: '18px', height: '18px' }} />
                </a>
              </div>
            </div>

            <div className="footer-links">
              <h4>Servicios</h4>
              <a href="#servicios" onClick={(e) => handleAnchorClick(e, '#servicios')}>
                Electricistas
              </a>
              <a href="#servicios" onClick={(e) => handleAnchorClick(e, '#servicios')}>
                Gasfiteros
              </a>
              <a href="#servicios" onClick={(e) => handleAnchorClick(e, '#servicios')}>
                Carpinteros
              </a>
            </div>

            <div className="footer-links">
              <h4>Empresa</h4>
              <a href="#como-funciona" onClick={(e) => handleAnchorClick(e, '#como-funciona')}>
                Sobre nosotros
              </a>
              <a href="#como-funciona" onClick={(e) => handleAnchorClick(e, '#como-funciona')}>
                Cómo funciona
              </a>
              <a href="#testimonios" onClick={(e) => handleAnchorClick(e, '#testimonios')}>
                Testimonios
              </a>
            </div>

            <div className="footer-links">
              <h4>Soporte</h4>
              <a href="#contacto" onClick={(e) => handleAnchorClick(e, '#contacto')}>
                Centro de ayuda
              </a>
              <a href="#contacto" onClick={(e) => handleAnchorClick(e, '#contacto')}>
                Términos
              </a>
              <a href="#contacto" onClick={(e) => handleAnchorClick(e, '#contacto')}>
                Privacidad
              </a>
              <a href="#contacto" onClick={(e) => handleAnchorClick(e, '#contacto')}>
                Contacto
              </a>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2026 Tecnilink. Todos los derechos reservados.</p>
            <p>Hecho con ❤️ en Perú</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
