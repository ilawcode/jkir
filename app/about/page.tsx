'use client';

import React from 'react';
import Link from 'next/link';

const AboutPage = () => {
  return (
    <div className="about-container">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

        .about-container {
          font-family: 'Inter', sans-serif;
          background: #0f172a;
          color: #f1f5f9;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .hero-section {
          position: relative;
          padding: 120px 20px;
          text-align: center;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          overflow: hidden;
        }

        .back-link {
          position: absolute;
          top: 30px;
          left: 30px;
          z-index: 10;
          color: #94a3b8;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #60a5fa;
        }

        .hero-image-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.2;
          z-index: 0;
          object-fit: cover;
          filter: blur(10px);
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 900px;
          margin: 0 auto;
        }

        .hero-title {
          font-size: 5rem;
          font-weight: 800;
          margin-bottom: 24px;
          letter-spacing: -0.02em;
          background: linear-gradient(to right, #60a5fa, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 1.6rem;
          color: #94a3b8;
          margin-bottom: 48px;
          line-height: 1.6;
          font-weight: 300;
        }

        .cta-button {
          padding: 18px 48px;
          font-size: 1.2rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(to right, #3b82f6, #8b5cf6);
          border-radius: 50px;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-block;
          box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
        }

        .cta-button:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 15px 30px rgba(59, 130, 246, 0.5);
          color: white;
        }

        .section {
          padding: 100px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-title {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 60px;
          text-align: center;
          letter-spacing: -0.01em;
          color: #f8fafc;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 40px;
        }

        .feature-card {
          background: rgba(30, 41, 59, 0.4);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 40px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .feature-card:hover {
          transform: translateY(-10px);
          border-color: rgba(59, 130, 246, 0.4);
          background: rgba(30, 41, 59, 0.6);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 24px;
          display: inline-block;
          filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.3));
        }

        .feature-title {
          font-size: 1.6rem;
          font-weight: 700;
          margin-bottom: 16px;
          color: #60a5fa;
        }

        .feature-desc {
          color: #94a3b8;
          line-height: 1.7;
          font-size: 1.05rem;
        }

        .context-menu-section {
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%);
          border-radius: 40px;
          padding: 80px 40px;
          margin-top: 60px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .context-menu-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: flex-start;
        }

        @media (max-width: 992px) {
          .context-menu-grid {
            grid-template-columns: 1fr;
          }
          .hero-title {
            font-size: 3.5rem;
          }
          .section-title {
            font-size: 2.2rem;
          }
        }

        .menu-list {
          list-style: none;
          padding: 0;
        }

        .menu-item {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          padding: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: background 0.3s;
          border-radius: 12px;
        }

        .menu-item:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .menu-item:last-child {
          border-bottom: none;
        }

        .menu-emoji {
          font-size: 1.8rem;
          background: rgba(59, 130, 246, 0.15);
          padding: 12px;
          border-radius: 16px;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .menu-text h4 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: #e2e8f0;
        }

        .menu-text p {
          margin: 8px 0 0;
          font-size: 1rem;
          color: #94a3b8;
          line-height: 1.5;
        }

        .image-container {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0,0,0,0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .image-container img {
           transition: transform 0.5s;
        }

        .image-container:hover img {
          transform: scale(1.05);
        }

        .constraints-section {
          text-align: center;
          background: linear-gradient(to bottom, #0f172a, #1e1b4b);
          padding-bottom: 120px;
        }

        .constraint-tag {
          display: inline-block;
          background: rgba(239, 68, 68, 0.12);
          color: #f87171;
          padding: 10px 24px;
          border-radius: 50px;
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 24px;
          border: 1px solid rgba(239, 68, 68, 0.3);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .footer {
          text-align: center;
          padding: 60px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          color: #64748b;
          font-size: 0.95rem;
        }

        .tech-tag {
          background: rgba(255, 255, 255, 0.05);
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 600;
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>

      {/* Hero Section */}
      <section className="hero-section">
        <Link href="/" className="back-link">
          <span>←</span> Back to Application
        </Link>
        <img src="/hero.png" alt="Hero Background" className="hero-image-bg" />
        <div className="hero-content">
          <h1 className="hero-title">JKIR</h1>
          <p className="hero-subtitle">
            The JSON Kit & Interactive Reader. <br />
            An advanced environment for analyzing, visualizing, and mastering complex data structures with surgical precision.
          </p>
          <Link href="/" className="cta-button">Launch Application</Link>
        </div>
      </section>

      {/* Main Features */}
      <section className="section">
        <h2 className="section-title">Engineered Excellence</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <span className="feature-icon">🌲</span>
            <h3 className="feature-title">Intuitive Tree Navigation</h3>
            <p className="feature-desc">
              Explore massive JSON structures without getting lost. Our hierarchical tree view provides collapse/expand 
              mechanics, type detection, and rapid search to pinpoint data points instantly.
            </p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">⚡</span>
            <h3 className="feature-title">Data Flow Architecture</h3>
            <p className="feature-desc">
              Visualise relationships at a glance. Automatically transform nested structures into architectural diagrams 
              that map out object properties and class-like connections.
            </p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">⚖️</span>
            <h3 className="feature-title">Professional Diff Engine</h3>
            <p className="feature-desc">
              Compare versions of JSON or XML with pixel-perfect accuracy. Our integrated comparison view highlights 
              every change, allowing you to track schema evolutions effortlessly.
            </p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📊</span>
            <h3 className="feature-title">Automated Documentation</h3>
            <p className="feature-desc">
              Generate documentation in seconds. Export structured tables containing field names, data types, 
              and sample values directly into Markdown or Confluence formats.
            </p>
          </div>
        </div>
      </section>

      {/* Usage Modes */}
      <section className="section" style={{ background: 'rgba(59, 130, 246, 0.03)', borderRadius: '60px', padding: '100px 60px' }}>
        <h2 className="section-title">Built for Your Workflow</h2>
        <div className="context-menu-grid">
          <div className="image-container">
            <img src="/visualization.png" alt="Workflow Visualization" style={{ width: '100%', display: 'block' }} />
          </div>
          <div style={{ alignSelf: 'center' }}>
            <h3 style={{ color: '#f1f5f9', marginBottom: '30px', fontSize: '2rem' }}>Operational Agility</h3>
            <ul className="menu-list">
              <li className="menu-item" style={{ background: 'rgba(255, 255, 255, 0.03)', marginBottom: '15px' }}>
                <div className="menu-emoji">💨</div>
                <div className="menu-text">
                  <h4>Simple Mode</h4>
                  <p>Designed for rapid, one-off analyses. No persistence, no overhead. Data remains in volatile memory and is purged upon session termination.</p>
                </div>
              </li>
              <li className="menu-item" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                <div className="menu-emoji">📁</div>
                <div className="menu-text">
                  <h4>Workspace Mode</h4>
                  <p>A full file management system. Create directories, save persistent collections, and organize your research. Synced to Local Storage for multi-session continuity.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Context Menu Mastery */}
      <section className="section">
        <h2 className="section-title">Mastering the Interface</h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '80px', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto 80px' }}>
          JKIR maximizes screen real estate by moving complex actions into context-aware menus. Right-click any element to unlock its full potential.
        </p>
        
        <div className="context-menu-section">
          <div className="context-menu-grid">
            <div>
              <h3 style={{ color: '#60a5fa', marginBottom: '35px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                Explorer Tools
              </h3>
              <ul className="menu-list">
                <li className="menu-item">
                  <div className="menu-emoji">✏️</div>
                  <div className="menu-text">
                    <h4>Organization</h4>
                    <p>Rename files and folders instantly. Duplicate existing collections to create version backups or templates.</p>
                  </div>
                </li>
                <li className="menu-item">
                  <div className="menu-emoji">◫</div>
                  <div className="menu-text">
                    <h4>Split-Pane Editing</h4>
                    <p>Open any file in the secondary editor pane. Perfect for comparing logic across different modules.</p>
                  </div>
                </li>
                <li className="menu-item">
                  <div className="menu-emoji">⚖️</div>
                  <div className="menu-text">
                    <h4>Inter-file Comparison</h4>
                    <p>Right-click a file to set it as a comparison target. Launch the diff view against any other file in your workspace.</p>
                  </div>
                </li>
                <li className="menu-item">
                  <div className="menu-emoji">☕</div>
                  <div className="menu-text">
                    <h4>POJO Generation</h4>
                    <p>Convert JSON schemas into Java Plain Old Java Objects (POJOs) with type-safe field mapping.</p>
                  </div>
                </li>
                <li className="menu-item">
                  <div className="menu-emoji">🚀</div>
                  <div className="menu-text">
                    <h4>Ecosystem Export</h4>
                    <p>Turn your folder hierarchies into Postman collections, ready for immediate import into your testing suite.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 style={{ color: '#60a5fa', marginBottom: '35px' }}>Data Node Controls</h3>
              <ul className="menu-list">
                <li className="menu-item">
                  <div className="menu-emoji">📝</div>
                  <div className="menu-text">
                    <h4>In-Situ Editing</h4>
                    <p>Modify keys and values directly within the Tree View. Changes are reflected in the raw JSON source automatically.</p>
                  </div>
                </li>
                <li className="menu-item" style={{ marginBottom: '40px' }}>
                  <div className="menu-emoji">📊</div>
                  <div className="menu-text">
                    <h4>Schema Documentation</h4>
                    <p>Select any node to generate a documentation table for that specific subtree. Includes depth-aware property analysis.</p>
                  </div>
                </li>
              </ul>
              <div className="image-container">
                <img src="/comparison.png" alt="Context Menu Example" style={{ width: '100%', display: 'block' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Constraints */}
      <section className="section constraints-section">
        <span className="constraint-tag">System Boundaries</span>
        <h2 className="section-title">Operational Constraints</h2>
        <div className="feature-grid" style={{ textAlign: 'left' }}>
          <div className="feature-card" style={{ borderLeft: '4px solid #ef4444' }}>
            <h4 style={{ color: '#f87171', fontWeight: '700' }}>Storage Quotas</h4>
            <p className="feature-desc">Workspace Mode utilizes Local Storage, which is restricted by browser limits (typically 5-10MB). For larger datasets, Simple Mode is recommended.</p>
          </div>
          <div className="feature-card" style={{ borderLeft: '4px solid #ef4444' }}>
            <h4 style={{ color: '#f87171', fontWeight: '700' }}>Schema Specificity</h4>
            <p className="feature-desc">While the editor supports XML, visualization and flow tools are primarily optimized for JSON structures. Non-structured text lacks visual mapping.</p>
          </div>
          <div className="feature-card" style={{ borderLeft: '4px solid #ef4444' }}>
            <h4 style={{ color: '#f87171', fontWeight: '700' }}>Compute Intensity</h4>
            <p className="feature-desc">Generating flow diagrams for deeply nested objects (10+ levels) or massive arrays may impact UI responsiveness on low-power devices.</p>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="section" style={{ textAlign: 'center' }}>
        <h2 className="section-title" style={{ fontSize: '2.5rem' }}>The Foundation</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <span className="tech-tag">Next.js 15</span>
          <span className="tech-tag">TypeScript</span>
          <span className="tech-tag">CodeMirror 6</span>
          <span className="tech-tag">Bootstrap 5</span>
          <span className="tech-tag">Local Storage API</span>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2026 JKIR - The Professional JSON Reader. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default AboutPage;
