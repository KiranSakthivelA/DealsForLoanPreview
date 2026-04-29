import { Link } from 'react-router-dom';
import { Target, Globe, ShieldCheck, TrendingUp, Users, Award, CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <div style={{ backgroundColor: 'var(--background-color)', minHeight: '100vh' }}>
      
      {/* Hero Section (Navy Gradient) */}
      <section style={{ background: 'linear-gradient(135deg, var(--accent-color) 0%, #001D3D 100%)', color: 'white', padding: '6rem 0 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '32px 32px', opacity: 0.5 }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>About Deals For Loan</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '3rem', lineHeight: '1.6' }}>
            We are dedicated to transforming your financial journey through trust, transparency, and tailored solutions.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem 2rem', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-color)' }}>19+</div>
              <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Years of Excellence</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem 2rem', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-color)' }}>1M+</div>
              <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Happy Customers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision (2-Column Cards) */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          <div className="card" style={{ padding: '3rem', textAlign: 'center', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '80px', height: '80px', background: 'rgba(45, 46, 137, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: 'var(--accent-color)' }}>
              <Target size={40} />
            </div>
            <h2 style={{ fontSize: '2rem', color: 'var(--accent-color)', marginBottom: '1rem' }}>Our Mission</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
              To provide seamless, secure, and accessible financial services that empower individuals and businesses to achieve their everyday goals without friction.
            </p>
          </div>

          <div className="card" style={{ padding: '3rem', textAlign: 'center', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '80px', height: '80px', background: 'rgba(243, 158, 30, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: 'var(--primary-color)' }}>
              <Globe size={40} />
            </div>
            <h2 style={{ fontSize: '2rem', color: 'var(--accent-color)', marginBottom: '1rem' }}>Our Vision</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
              To become the most trusted and innovative DSA partner nationwide, bridging the gap between premium banking institutions and everyday consumers.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values (2x2 Grid) */}
      <section style={{ padding: '4rem 0 6rem', backgroundColor: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--accent-color)', fontWeight: 800 }}>Our Core Values</h2>
            <div style={{ width: '60px', height: '4px', background: 'var(--primary-color)', margin: '1rem auto', borderRadius: '2px' }}></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {[
              { icon: <ShieldCheck size={28} />, title: 'Trust & Security', desc: 'We maintain the highest standards of data protection and privacy for our clients.' },
              { icon: <Users size={28} />, title: 'Customer First', desc: 'Every decision we make is centered around improving the customer experience.' },
              { icon: <TrendingUp size={28} />, title: 'Innovation', desc: 'Constantly adopting new technologies to make loan processing faster and easier.' },
              { icon: <Award size={28} />, title: 'Integrity', desc: 'Honest, transparent communication with absolutely no hidden fees.' }
            ].map((value, idx) => (
              <div key={idx} style={{ padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', backgroundColor: '#fafafa', display: 'flex', gap: '1.5rem', transition: 'all 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ width: '56px', height: '56px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
                  {value.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>{value.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>{value.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '5rem 0', background: 'linear-gradient(135deg, var(--primary-color) 0%, #ff8c00 100%)', textAlign: 'center', color: 'white' }}>
        <div className="container">
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Ready to Start Your Journey?</h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            Join thousands of happy customers who have already transformed their financial lives with us.
          </p>
          <Link to="/apply" className="btn" style={{ background: 'var(--accent-color)', color: 'white', padding: '1.25rem 3rem', fontSize: '1.1rem', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            Apply Now
          </Link>
        </div>
      </section>

    </div>
  );
}
