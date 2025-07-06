'use client';

import Image from 'next/image';

const WHATSAPP_NUMBER = '5493411234567'; // Cambiar por tu número

export default function LandingPage() {
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    'Hola! Me interesa el sistema de gestión para gimnasios, quiero más info.'
  )}`;

  return (
    <>
      <header style={styles.header}>
        <div style={styles.navContainer}>
          <h1 style={styles.logo}>GymManager</h1>
          <nav style={styles.nav}>
            <a href="#features" style={styles.navLink}>
              Funcionalidades
            </a>
            <a href="#testimonials" style={styles.navLink}>
              Testimonios
            </a>
            <a href="#contact" style={styles.navLink}>
              Contacto
            </a>
          </nav>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" style={styles.btnNavWhats}>
            Contactar WhatsApp
          </a>
        </div>
      </header>

      <section style={styles.hero}>
        <div style={styles.heroText}>
          <h2 style={styles.heroTitle}>
            Gestioná tu gimnasio fácil, rápido y sin complicaciones
          </h2>
          <p style={styles.heroSubtitle}>
            Controla socios, membresías, pagos y movimientos en una sola plataforma diseñada para vos.
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.btnPrimary}
          >
            ¡Quiero saber más!
          </a>
        </div>
        <div style={styles.heroImage}>
          <Image
            src="/gym-dashboard.png" // Pon una imagen profesional tuya o usa alguna de bancos gratis
            alt="Dashboard sistema de gestión gimnasio"
            width={600}
            height={400}
            priority
          />
        </div>
      </section>

      <section id="features" style={styles.features}>
        <h3 style={styles.sectionTitle}>¿Por qué elegir GymManager?</h3>
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <Image src="/icon-users.svg" alt="Gestión de socios" width={64} height={64} />
            <h4>Gestión total de socios</h4>
            <p>Mantené el control de tus miembros, vencimientos y planes de forma automática.</p>
          </div>
          <div style={styles.featureCard}>
            <Image src="/icon-finance.svg" alt="Control financiero" width={64} height={64} />
            <h4>Reportes financieros</h4>
            <p>Visualizá ingresos, egresos y estadísticas para tomar mejores decisiones.</p>
          </div>
          <div style={styles.featureCard}>
            <Image src="/icon-access.svg" alt="Acceso multiplataforma" width={64} height={64} />
            <h4>Acceso desde cualquier dispositivo</h4>
            <p>Usalo en celulares, tablets o computadoras con interfaz amigable.</p>
          </div>
          <div style={styles.featureCard}>
            <Image src="/icon-support.svg" alt="Soporte" width={64} height={64} />
            <h4>Soporte dedicado</h4>
            <p>Estamos siempre disponibles para ayudarte a sacar el máximo provecho.</p>
          </div>
        </div>
      </section>

      <section id="testimonials" style={styles.testimonials}>
        <h3 style={styles.sectionTitle}>Qué dicen nuestros clientes</h3>
        <div style={styles.testimonialsGrid}>
          <blockquote style={styles.testimonialCard}>
            <p>
              “Este sistema me permitió ahorrar tiempo y mejorar la retención de socios en mi gimnasio.”
            </p>
            <footer>— Laura R., Dueña de Fitness Center</footer>
          </blockquote>
          <blockquote style={styles.testimonialCard}>
            <p>
              “La interfaz es sencilla y las funciones muy completas, ideal para cualquier gimnasio.”
            </p>
            <footer>— Martín S., Entrenador Personal</footer>
          </blockquote>
          <blockquote style={styles.testimonialCard}>
            <p>
              “Excelente soporte y constantes mejoras. Lo recomiendo sin dudas.”
            </p>
            <footer>— Ana M., Gerente de GymPlus</footer>
          </blockquote>
        </div>
      </section>

      <section id="contact" style={styles.contact}>
        <h3 style={styles.sectionTitle}>¿Querés una demo o consultarnos?</h3>
        <p>Contactanos ahora por WhatsApp para recibir atención personalizada.</p>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.btnPrimary}
        >
          Contactar por WhatsApp
        </a>
      </section>

      <footer style={styles.footer}>
        <p>© 2025 GymManager | Software para gimnasios</p>
      </footer>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    position: 'sticky',
    top: 0,
    backgroundColor: '#121212',
    padding: '1rem 2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
    zIndex: 100,
  },
  navContainer: {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    color: '#FF6B00',
    fontWeight: '900',
    fontSize: '1.8rem',
    cursor: 'default',
  },
  nav: {
    display: 'flex',
    gap: '2rem',
  },
  navLink: {
    color: '#eee',
    fontWeight: 600,
    textDecoration: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  btnNavWhats: {
    backgroundColor: '#25D366',
    color: '#fff',
    padding: '0.5rem 1rem',
    borderRadius: '30px',
    fontWeight: '700',
    fontSize: '0.95rem',
    textDecoration: 'none',
    boxShadow: '0 0 8px rgba(37, 211, 102, 0.7)',
  },

  hero: {
    maxWidth: 1200,
    margin: '3rem auto',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '3rem',
    padding: '0 2rem',
    justifyContent: 'center',
  },
  heroText: {
    flex: '1 1 400px',
    color: '#fff',
    maxWidth: 550,
    textAlign: 'left',
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: '900',
    lineHeight: 1.1,
    color: '#FF6B00',
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    marginTop: '1rem',
    color: '#FFD700',
    fontWeight: 600,
  },
  btnPrimary: {
    display: 'inline-block',
    marginTop: '2rem',
    backgroundColor: '#FF6B00',
    color: '#fff',
    padding: '1rem 2.5rem',
    borderRadius: '40px',
    fontWeight: '700',
    fontSize: '1.2rem',
    textDecoration: 'none',
    boxShadow: '0 0 12px rgba(255, 107, 0, 0.8)',
    transition: 'background-color 0.3s ease',
  },

  heroImage: {
    flex: '1 1 500px',
    maxWidth: 600,
  },

  features: {
    backgroundColor: '#1f1f1f',
    padding: '4rem 2rem',
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#FF6B00',
    fontWeight: '900',
    fontSize: '2rem',
    marginBottom: '2rem',
  },
  featuresGrid: {
    maxWidth: 1000,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '2rem',
  },
  featureCard: {
    backgroundColor: '#292929',
    padding: '2rem 1.5rem',
    borderRadius: '12px',
    color: '#fff',
    boxShadow: '0 0 10px rgba(255, 107, 0, 0.2)',
    textAlign: 'center',
    userSelect: 'none',
  },

  testimonials: {
    padding: '4rem 2rem',
    backgroundColor: '#121212',
    textAlign: 'center',
  },
  testimonialsGrid: {
    maxWidth: 900,
    margin: '2rem auto 0',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
  },
  testimonialCard: {
    backgroundColor: '#1f1f1f',
    padding: '2rem',
    borderRadius: '10px',
    color: '#FFD700',
    fontStyle: 'italic',
    boxShadow: '0 0 10px rgba(255, 107, 0, 0.3)',
  },

  contact: {
    padding: '3rem 2rem',
    backgroundColor: '#1f1f1f',
    textAlign: 'center',
  },

  footer: {
    padding: '1rem 2rem',
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#666',
    backgroundColor: '#121212',
  },
};
