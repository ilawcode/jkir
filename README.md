# JKIR - JSON Görüntüleyici ve Analiz Aracı

Next.js 15 + React 19 + Bootstrap 5 ile geliştirilmiş, kapsamlı bir JSON görüntüleme, düzenleme ve analiz aracı.

![JKIR](https://img.shields.io/badge/version-2.0-blue) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![React](https://img.shields.io/badge/React-19-61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)

## 🚀 Özellikler

### 📁 Collection Explorer (Postman Tarzı Dosya Yönetimi)

- **Klasör ve Dosya Yapısı**: Postman benzeri hiyerarşik klasör/dosya organizasyonu
- **Sağ Tık Menüsü**:
  - Yeni dosya/klasör oluşturma
  - Yeniden adlandırma
  - Silme
  - Çoğaltma (Duplicate)
  - **Java POJO Oluşturma** (dosya ve klasör seviyesinde)
- **Arama**: Klasör ve dosyalar arasında anlık arama
- **LocalStorage**: Tüm çalışmalarınız tarayıcıda otomatik kaydedilir
- **Import/Export**: Workspace'i JSON olarak dışa/içe aktarma

### 📝 Sol Panel (JSON Editör)

- **Format & Minify**: JSON verisini otomatik formatlama veya sıkıştırma
- **Dikey Araç Çubuğu**: Yapıştır, Kopyala, Temizle işlemleri
- **Çift Yönlü Senkronizasyon**: Sağ paneldeki düzenlemeler anında yansır
- **Syntax Highlighting**: JSON sözdizimi renklendirme

### 👁️ Sağ Panel (Görüntüleme Modları)

#### 1. Code View
- VS Code tarzı syntax highlighting
- Satır numaraları
- Düzenlenebilir JSON editör

#### 2. Tree View
- **Katlanabilir Ağaç Yapısı**: Her node açılıp kapatılabilir
- **Tümünü Aç/Kapat**: Tek tıkla tüm düğümleri genişlet veya daralt
- **Arama**: Alan adlarında arama yaparak doğrudan ilgili node'a git
  - Derin yapılarda (6-7+ seviye) bile çalışır
  - Aranan element otomatik olarak ekranın üstüne scroll edilir
  - Sarı highlight animasyonu ile vurgulanır
- **Sağ Tık Düzenleme**: Node değerlerini düzenleyebilme
- **Tablo Oluşturma**: Node'dan Confluence-uyumlu Markdown tablo oluşturma

#### 3. Flow View
- **Görsel Diyagram**: JSON yapısını class/object diyagramı olarak görselleştirme
- **Zoom Kontrolü**: Yakınlaştırma/uzaklaştırma
- **PNG Export**: Diyagramı PNG olarak indirme
- **Tümünü Aç/Kapat**: Tüm kutuları genişlet veya daralt
- **Arama**: Obje isimlerinde arama, doğrudan ilgili node'a gitme
- **Tablo Görünümü**: Her kutu için tablo görünümü ve Markdown kopyalama
  - Parametre Adı, Tip, Açıklama kolonları
  - Confluence'a yapıştırmaya hazır format

#### 4. Query View
- **Key/Value Arama**: JSON içinde arama
- **Sonuç Filtreleme**: Arama sonuçlarını filtreleme
- **Path Gösterimi**: Bulunan değerlerin tam yolunu görme

### ☕ Java POJO Oluşturucu

JSON yapısından otomatik Java class oluşturma:

#### Desteklenen Formatlar:
1. **Java 17 Record**: Modern, immutable record sınıfları
2. **Classic POJO**: Getter/Setter metodları ile geleneksel Java sınıfları
3. **Lombok Class**: `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor` annotation'ları

#### Özellikler:
- **Dosya Hiyerarşisi**: Her obje için ayrı `.java` dosyası
- **Akıllı Tip Çıkarımı**: İç içe objeler otomatik olarak doğru sınıf tipiyle tanımlanır
- **Array Desteği**: `List<T>` olarak dönüştürülür
- **Tekli Kopyalama**: Her dosyayı ayrı ayrı kopyalayabilme
- **ZIP İndirme**: Tüm dosyaları tek bir ZIP arşivi olarak indirme
- **Klasör Desteği**: Klasör üzerinde sağ tık ile tüm dosyaların POJO'larını oluşturma

### 🎨 Tema Desteği

- **Açık/Koyu Tema**: Toggle ile tema değiştirme
- **Sistem Tercihi**: Varsayılan olarak sistem temasını takip eder
- **LocalStorage**: Tema tercihi kaydedilir

## 📦 Kurulum

```bash
# Repository'yi klonlayın
git clone https://github.com/ilawcode/jkir.git

# Proje dizinine gidin
cd jkir

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

## 🛠️ Teknoloji Yığını

| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| Next.js | 15 | App Router ile React Framework |
| React | 19 | UI Kütüphanesi |
| TypeScript | 5 | Tip Güvenliği |
| Bootstrap | 5 | CSS Framework |
| JSZip | - | ZIP dosyası oluşturma |
| html2canvas | - | PNG export |

## 📁 Proje Yapısı

```
jkir/
├── app/
│   ├── page.tsx          # Ana sayfa
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global stiller
├── components/
│   ├── CollectionExplorer.tsx   # Dosya/klasör yönetimi
│   ├── CollectionItem.tsx       # Tekil dosya/klasör item
│   ├── TreeView.tsx             # Ağaç görünümü
│   ├── TreeNode.tsx             # Ağaç node bileşeni
│   ├── FlowView.tsx             # Akış diyagramı
│   ├── FlowNode.tsx             # Akış node bileşeni
│   ├── PojoModal.tsx            # POJO oluşturucu modal
│   ├── TableGenerationModal.tsx # Tablo oluşturma modal
│   └── ...
├── hooks/
│   └── useCollections.ts  # Collection state yönetimi
├── types/
│   └── collections.ts     # TypeScript tipleri
├── utils/
│   └── pojoGenerator.ts   # POJO kod üreteci
└── public/
    └── ...
```

## 🔧 Kullanım Senaryoları

### JSON Analizi
1. Sol panele JSON yapıştırın
2. "Format & Görüntüle" butonuna tıklayın
3. Farklı görünüm modları arasında geçiş yapın

### POJO Oluşturma
1. Dosya üzerinde sağ tık → "POJO Oluştur"
2. Format seçin (Record, Classic, Lombok)
3. Dosyaları kopyalayın veya ZIP olarak indirin

### Confluence Tablosu
1. Tree View veya Flow View'da node üzerinde sağ tık
2. "Tablo Oluştur" seçin
3. Markdown'ı kopyalayın
4. Confluence'a yapıştırın

### Workspace Yedekleme
1. Üst menüden "Export" butonuna tıklayın
2. JSON dosyasını kaydedin
3. Daha sonra "Import" ile geri yükleyin

## 📝 Lisans

MIT License

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

Made with ❤️ by [ilawcode](https://github.com/ilawcode)
