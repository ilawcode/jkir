import React, { useState } from 'react';

interface ModeSelectionScreenProps {
  onSelectMode: (mode: 'simple' | 'workspace', remember: boolean) => void;
}

export default function ModeSelectionScreen({ onSelectMode }: ModeSelectionScreenProps) {
  const [remember, setRemember] = useState(false);

  return (
    <div className="mode-selection-wrapper">
      <style>{`
        .mode-selection-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f6f8fd 0%, #f1f5f9 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1e293b;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .dark-theme .mode-selection-wrapper {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #f8fafc;
        }

        /* Animated background blobs */
        .mode-selection-wrapper::before,
        .mode-selection-wrapper::after {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
          z-index: 0;
          animation: float 10s infinite ease-in-out alternate;
        }

        .mode-selection-wrapper::before {
          background: rgba(99, 102, 241, 0.2);
          top: -200px;
          left: -200px;
        }

        .mode-selection-wrapper::after {
          background: rgba(16, 185, 129, 0.2);
          bottom: -200px;
          right: -200px;
          animation-delay: -5s;
        }

        .dark-theme .mode-selection-wrapper::before {
          background: rgba(99, 102, 241, 0.15);
        }

        .dark-theme .mode-selection-wrapper::after {
          background: rgba(16, 185, 129, 0.15);
        }

        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, 50px) scale(1.1); }
        }

        .mode-container {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 24px;
          padding: 3rem;
          max-width: 800px;
          width: 100%;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.05);
          position: relative;
          z-index: 1;
          text-align: center;
        }

        .dark-theme .mode-container {
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .mode-header {
          margin-bottom: 3rem;
        }

        .mode-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .mode-header p {
          font-size: 1.1rem;
          color: #64748b;
          margin: 0;
        }

        .dark-theme .mode-header p {
          color: #94a3b8;
        }

        .mode-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .mode-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 2rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid transparent;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .dark-theme .mode-card {
          background: #0f172a;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
        }

        .mode-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .dark-theme .mode-card:hover {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
        }

        .mode-card.simple {
          border-color: rgba(99, 102, 241, 0.1);
        }

        .mode-card.simple:hover {
          border-color: #6366f1;
        }

        .mode-card.workspace {
          border-color: rgba(16, 185, 129, 0.1);
        }

        .mode-card.workspace:hover {
          border-color: #10b981;
        }

        .icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-bottom: 1.5rem;
        }

        .simple .icon-wrapper {
          background: rgba(99, 102, 241, 0.1);
          color: #6366f1;
        }

        .workspace .icon-wrapper {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .mode-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }

        .simple .mode-title {
          color: #4f46e5;
        }

        .workspace .mode-title {
          color: #059669;
        }

        .dark-theme .simple .mode-title {
          color: #818cf8;
        }

        .dark-theme .workspace .mode-title {
          color: #34d399;
        }

        .mode-desc {
          color: #64748b;
          line-height: 1.6;
          flex-grow: 1;
          margin-bottom: 1.5rem;
        }

        .dark-theme .mode-desc {
          color: #cbd5e1;
        }

        .mode-btn {
          width: 100%;
          padding: 0.75rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .simple .mode-btn {
          background: rgba(99, 102, 241, 0.1);
          color: #4f46e5;
        }

        .simple:hover .mode-btn {
          background: #6366f1;
          color: white;
        }

        .workspace .mode-btn {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
        }

        .workspace:hover .mode-btn {
          background: #10b981;
          color: white;
        }

        .dark-theme .simple .mode-btn {
          background: rgba(99, 102, 241, 0.2);
          color: #818cf8;
        }
        
        .dark-theme .simple:hover .mode-btn {
          background: #6366f1;
          color: white;
        }

        .dark-theme .workspace .mode-btn {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
        }

        .dark-theme .workspace:hover .mode-btn {
          background: #10b981;
          color: white;
        }

        .remember-wrapper {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.5);
          padding: 0.75rem 1.25rem;
          border-radius: 99px;
          cursor: pointer;
          user-select: none;
          transition: all 0.2s;
        }

        .dark-theme .remember-wrapper {
          background: rgba(0, 0, 0, 0.2);
        }

        .remember-wrapper:hover {
          background: rgba(255, 255, 255, 0.8);
        }

        .dark-theme .remember-wrapper:hover {
          background: rgba(0, 0, 0, 0.4);
        }

        .remember-checkbox {
          appearance: none;
          width: 20px;
          height: 20px;
          border: 2px solid #cbd5e1;
          border-radius: 6px;
          outline: none;
          cursor: pointer;
          position: relative;
          transition: all 0.2s;
        }

        .dark-theme .remember-checkbox {
          border-color: #475569;
        }

        .remember-checkbox:checked {
          background-color: #6366f1;
          border-color: #6366f1;
        }

        .remember-checkbox:checked::after {
          content: '✓';
          position: absolute;
          color: white;
          font-size: 14px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-weight: bold;
        }

        .remember-label {
          font-size: 0.95rem;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
        }

        .dark-theme .remember-label {
          color: #94a3b8;
        }
      `}</style>

      <div className="mode-container">
        <div className="mode-header">
          <h1>Jkir'e Hoş Geldiniz</h1>
          <p>Çalışma tarzınıza en uygun modu seçin</p>
        </div>

        <div className="mode-cards">
          <div className="mode-card simple" onClick={() => onSelectMode('simple', remember)}>
            <div className="icon-wrapper">
              ⚡
            </div>
            <h2 className="mode-title">Simple Mode</h2>
            <p className="mode-desc">
              Klasör veya proje yapısı oluşturmadan doğrudan kodlamaya başlayın. Dosyaları hızlıca karşılaştırın ve düzenleyin.
              <br/><br/>
              <strong>Not:</strong> Bu modda verileriniz tarayıcıda kalıcı olarak saklanmaz, sekme kapandığında silinir.
            </p>
            <button className="mode-btn">Simple Mode Seç</button>
          </div>

          <div className="mode-card workspace" onClick={() => onSelectMode('workspace', remember)}>
            <div className="icon-wrapper">
              📁
            </div>
            <h2 className="mode-title">Workspace Mode</h2>
            <p className="mode-desc">
              Tam teşekküllü bir çalışma alanı. Kendi klasör yapınızı oluşturun, projelerinizi yönetin ve verilerinizi organize edin.
              <br/><br/>
              <strong>Not:</strong> Tüm verileriniz tarayıcınızın yerel depolama (localStorage) alanında güvenle saklanır.
            </p>
            <button className="mode-btn">Workspace Mode Seç</button>
          </div>
        </div>

        <label className="remember-wrapper">
          <input 
            type="checkbox" 
            className="remember-checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <span className="remember-label">Seçimimi hatırla ve her zaman bu modda aç</span>
        </label>
      </div>
    </div>
  );
}
