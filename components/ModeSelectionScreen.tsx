import React, { useState } from 'react';
import { AppMode } from '../hooks/useAppMode';

interface ModeSelectionScreenProps {
  onSelectMode: (mode: 'simple' | 'workspace', remember: boolean) => void;
}

export default function ModeSelectionScreen({ onSelectMode }: ModeSelectionScreenProps) {
  const [remember, setRemember] = useState(false);

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light dark:bg-dark">
      <div className="card shadow-lg p-4" style={{ maxWidth: '600px', width: '100%' }}>
        <div className="text-center mb-4">
          <h2>Uygulama Modunu Seçin</h2>
          <p className="text-muted">Lütfen çalışmak istediğiniz modu seçin.</p>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div 
              className="card h-100 cursor-pointer border-primary mode-card" 
              onClick={() => onSelectMode('simple', remember)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-body text-center">
                <h4 className="card-title text-primary">Simple Mode</h4>
                <p className="card-text small">
                  Klasör oluşturmadan hızlıca kod editörünü kullanın, dosyaları karşılaştırın. 
                  <strong> Veriler kaydedilmez.</strong>
                </p>
                <button className="btn btn-outline-primary mt-2">Seç</button>
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div 
              className="card h-100 cursor-pointer border-success mode-card" 
              onClick={() => onSelectMode('workspace', remember)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-body text-center">
                <h4 className="card-title text-success">Workspace Mode</h4>
                <p className="card-text small">
                  Klasörler oluşturun, dosyalarınızı yönetin ve tarayıcınızda 
                  <strong> kalıcı olarak saklayın.</strong>
                </p>
                <button className="btn btn-outline-success mt-2">Seç</button>
              </div>
            </div>
          </div>
        </div>

        <div className="form-check d-flex justify-content-center mt-2">
          <input 
            className="form-check-input me-2" 
            type="checkbox" 
            id="rememberChoice" 
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <label className="form-check-label user-select-none" htmlFor="rememberChoice">
            Her zaman bu modda aç
          </label>
        </div>
      </div>
    </div>
  );
}
