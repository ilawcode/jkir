# 🚀 JKIR (JSON Kit & Interactive Reader)

Merhaba Ekip,

Geliştirdiğimiz yeni nesil JSON görüntüleme ve analiz aracı **JKIR**'i sizlerle paylaşmaktan heyecan duyuyorum. Bu araç, karmaşık JSON verileriyle çalışırken yaşadığımız zorlukları çözmek ve geliştirme sürecimizi hızlandırmak için tasarlandı.

## 🌟 Nedir?

**JKIR**, verilerinizi sadece "görüntülemenizi" değil, onları **analiz etmenizi**, **düzenlemenizi** ve **görselleştirmenizi** sağlayan güçlü bir web uygulamasıdır. Klasik JSON formatlayıcıların ötesine geçerek, yazılım geliştiriciler ve analistler için tam donanımlı bir çalışma masası sunar.

![Uygulama Ekran Görüntüsü](https://github.com/ilawcode/jkir/raw/main/public/screenshot-placeholder.png) *(Temsili Görsel)*

---

## 🔥 Temel Özellikler

### 1. Modern ve Esnek Arayüz 🎨
*   **Split View (Bölünmüş Ekran):** Sol panelde kodunuzu düzenlerken, sağ panelde anlık görselleştirme sonuçlarını görün.
*   **Collapsible Sidebar:** Odaklanmak istediğinizde sol paneli gizleyerek tam ekran çalışma imkanı.
*   **Light Theme:** Göz yormayan, VS Code standartlarında modern renk paleti.

### 2. Akıllı JSON Editörü 📝
*   **Otomatik Formatlama:** Karmaşık ve sıkıştırılmış JSON verilerini tek tıkla okunabilir hale getirin.
*   **Hata Denetimi:** Yazım hatalarını anında tespit edin.
*   **Minify:** Veriyi sıkıştırarak transfer için hazırlayın.
*   **Kalıcı Hafıza:** Sayfayı yenileseniz bile çalışmanız kaybolmaz (Local Storage entegrasyonu).

### 3. Gelişmiş Görselleştirme Araçları 📊
*   **🌲 Tree View:** JSON verisini katlanabilir ağaç yapısında gezin. Düğümlere sağ tıklayarak veriyi düzenleyin.
*   **⚡ Flow View:** Veri yapısını otomatik olarak Class/Object diyagramına dönüştürün. İlişkileri görsel olarak analiz edin.
*   **🔍 Query View:** Büyük JSON dosyalarında kaybolmayın. Key/Value bazlı arama yapın ve sonuçları filtreleyin.

### 4. Dokümantasyon Kolaylığı 📚
*   **Otomatik Tablo Oluşturucu:** JSON yapısını analiz ederek saniyeler içinde **Confluence/Markdown** uyumlu dokümantasyon tabloları oluşturun.
    *   *Kullanım:* Tree View üzerinde sağ tık -> `📊 Tablo Oluştur`.
    *   *Çıktı:* Alan Adı, Veri Tipi ve Açıklama sütunlarını içeren hazır tablo.

---

## 🛠 Teknoloji Yığını

Bu proje, modern web teknolojilerinin en güncel sürümleri kullanılarak geliştirilmiştir:
*   **Framework:** Next.js 15 (App Router)
*   **Dil:** TypeScript
*   **UI:** Bootstrap 5 & Custom CSS
*   **İkon Seti:** Native Emojis & CSS Shapes

---

## 🚀 Kurulum ve Çalıştırma

Projeyi yerel ortamınızda denemek için:

```bash
# Repoyu klonlayın
git clone https://github.com/ilawcode/jkir.git

# Proje dizinine gidin
cd jkir

# Bağımlılıkları yükleyin
npm install

# Uygulamayı başlatın
npm run dev
```

Uygulama **[http://localhost:3000](http://localhost:3000)** adresinde çalışacaktır.

---

Görüş ve önerilerinizi bekliyorum!

İyi çalışmalar.
