# JKIR — Ürün Özeti ve Vizyon (Yönetici Sunumu)

Bu belge, **JKIR** uygulamasının ne olduğunu, hangi iş problemlerini çözdüğünü ve ürün vizyonunu özetler. Direktörlük veya paydaş sunumlarında doğrudan kullanılabilir.

---

## 1. Kısa özet (elevator pitch)

**JKIR**, API ve entegrasyon ekiplerinin **JSON ve XML** yüklerini tek bir çatı altında **düzenlemek, görselleştirmek, dokümante etmek ve (isteğe bağlı) yerel yapay zeka ile analiz etmek** için tasarlanmış, tarayıcıda çalışan bir **veri çalışma masasıdır**. Veri sunucuya gönderilmeden cihazda işlenebilir; workspace yapısı Postman benzeri klasör/dosya modeliyle yönetilir.

---

## 2. Hangi problemi çözüyoruz?

| Problem | JKIR yaklaşımı |
|--------|----------------|
| Ham JSON/XML’in okunması ve hata ayıklanması zor | Code editörü, sözdizimi vurgusu, format/minify, JSON/XML desteği |
| Yapının “büyük resmi” görülmüyor | Tree, Flow ve Query görünümleri ile hiyerarşik ve diyagramsal bakış |
| Dokümantasyon (Confluence vb.) elle uzun sürüyor | Tablo üretimi, Confluence uyumlu Markdown; klasör bazlı **Analiz Üret** (yerel LLM) |
| Örnek yükler dağınık | Koleksiyon (klasör/dosya), arama, import/export, tarayıcıda kalıcı kayıt |
| Backend kodu üretimi | JSON’dan **Java POJO** (Record, Classic, Lombok) üretimi ve ZIP indirme |
| Request/response sözleşmelerinin sınıflandırılması | Dosya oluştururken **Request / Response** ve **Success / Error / Business Error** etiketleri |

---

## 3. Ürün kimdir? (hedef kullanıcı ve değer)

- **Yazılım geliştiriciler** ve **entegrasyon mühendisleri:** API gövdelerini hızlıca inceleme, düzenleme, görselleştirme.
- **Teknik analistler / mimarlar:** Yapıyı diyagram ve sorgu ile anlama; dokümantasyon çıktıları.
- **Kalite ve dokümantasyon ekipleri:** Confluence’a uygun tablolar ve analiz metinleri.

**Değer önerisi:** Daha az bağlam kaybı, daha hızlı inceleme, dokümantasyon ve kod üretiminde **tekrarlanabilir otomasyon**, verinin mümkün olduğunda **cihazda kalması** (özellikle yerel LLM ile).

---

## 4. Uygulama ne yapıyor? (modül modül)

### 4.1 Workspace ve koleksiyon yönetimi

- Postman tarzı **klasör ve dosya** ağacı.
- **Sağ tık menüsü:** yeni dosya/klasör, yeniden adlandır, kopyala, sil; dosyada **sağda aç** (split editör).
- **Arama:** koleksiyon içinde isimle arama.
- **Import / Export:** workspace’i JSON olarak yedekleme ve geri yükleme.
- **Kalıcılık:** tarayıcı **localStorage** ile otomatik kayıt (sunucu zorunlu değil).

### 4.2 Dosya tipleri ve semantik etiketler

- Dosyalar **JSON** veya **XML** olarak tanımlanır (uzantı ve içerik).
- Yeni dosya oluştururken:
  - **Request** veya **Response** rolü,
  - Response için **Success**, **Error** veya **Business Error** varyantı seçilebilir.
- Mevcut eski veriler için: uzantıya göre `fileType` tamamlanır; rol/varyant yoksa varsayılan **response + success** atanır (geriye dönük uyum).

Bu sayede koleksiyon, sadece “dosya listesi” değil; **sözleşme ve senaryo** düşüncesine yakın bir yapı sunar.

### 4.3 Kod ve çift panel (split) editör

- **Code** sekmesi: CodeMirror tabanlı editör; JSON ve XML için uygun dil desteği.
- İsteğe bağlı **iki panel** (sol/sağ) ile iki dosyayı yan yana açma (ör. request/response karşılaştırması).
- Seçilen dosya içeriği **Tree / Flow / Query** görünümlerine beslenir.

### 4.4 Görselleştirme sekmeleri

| Sekme | İşlev |
|-------|--------|
| **Tree** | Katlanabilir ağaç; düğüm düzenleme; Confluence uyumlu tablo üretimi (node bazlı). |
| **Flow** | Yapının diyagram görünümü; zoom, PNG export, tablo/Markdown kopyalama. |
| **Query** | Anahtar/değer araması, sonuç filtreleme, JSON path benzeri konum bilgisi. |
| **Analiz** | (Üretim sonrası) Klasör bazlı LLM analizinin **Confluence Markdown** çıktısı; ham metin ve **önizleme** arasında geçiş. |

### 4.5 Java POJO üretimi

- Dosya veya klasör seçimiyle JSON yapısından **Java** sınıfları üretilir.
- Formatlar: **Java 17 Record**, **klasik POJO**, **Lombok**.
- Tek tek kopyalama veya **ZIP** ile toplu indirme.

### 4.6 Yerel yapay zeka ile analiz (LLM)

- **Tarayıcıda** çalışır; varsayılan model yolu **Hugging Face Transformers.js** ve **Qwen3** ONNX modeli.
- **WebGPU** varsa hızlandırma; yoksa CPU (WASM) ile çalışma.
- Klasöre sağ tık → **Analiz Üret:** klasördeki JSON/XML dosyaları toplanır, kod içinde tanımlı **standart doküman şablonu** (kullanıcıya gösterilmez) ile prompt oluşturulur, çıktı **Confluence uyumlu Markdown** olarak **Analiz** sekmesinde gösterilir.
- Model indirme ve üretim aşamalarında **durum metni ve ilerleme çubuğu**; model tarayıcı önbelleğinde tutulduğunda tekrar indirme minimize edilir.

**Gizlilik açısından not:** Analiz, kullanıcı cihazında çalıştığı sürece ham veri harici bir LLM API’sine gönderilmek zorunda değildir (kurumsal veri için avantaj).

### 4.7 Tema ve kullanılabilirlik

- Açık / koyu tema; tercih saklanır.
- Yeniden boyutlandırılabilir sol panel (sidebar).

---

## 5. Vizyon: nereye gidiyoruz?

**Kısa vadeli vizyon:** Entegrasyon ve API yaşam döngüsünde “tek ekranda” — örnek yükleri düzenle, görselleştir, etiketle, dokümante et ve gerektiğinde yerel AI ile özet/analiz üret.

**Orta vadeli vizyon (örnek yönler):**

- Daha fazla **yerel veya seçilebilir model**; ekip politikasına uygun dağıtım.
- **Ekip workspace’leri** veya paylaşım (şu an tek kullanıcı/tarayıcı odaklı localStorage).
- **OpenAPI / şema** ile daha sıkı bağlantı; otomatik doğrulama ve şema tabanlı dokümantasyon.
- Kurumsal **Confluence / Jira** entegrasyonları (tek tıkla yapıştırmanın ötesinde API ile gönderim).

**Prensip:** Veri ve entegrasyon bilgisinin **hızlı tüketilebilir**, **tekrar kullanılabilir** ve **güvenli** (mümkün olduğunda edge/local) kalması.

---

## 6. Teknik özet (yönetici seviyesi)

- **Mimari:** Tek sayfa uygulaması benzeri deneyim; **Next.js (App Router)**, **React 19**, **TypeScript**.
- **Ön yüz:** Bootstrap 5, özel CSS; CodeMirror 6.
- **Yerel LLM:** `@huggingface/transformers`, ONNX Runtime Web; önizleme için `react-markdown`.
- **Veri:** İstemci tarafında state + localStorage; sunucu tarafı kalıcı veri zorunlu değil (kurulum kolaylığı).

*(README’deki sürüm numaraları zaman zaman geride kalabilir; güncel paket sürümleri `package.json` dosyasından doğrulanmalıdır.)*

---

## 7. Sınırlar ve dürüst beklenti yönetimi

- **Tarayıcı belleği ve performans:** Büyük modeller ve çok büyük dosyalar cihaz kapasitesine bağlıdır.
- **LLM çıktısı:** Otomatik metinlerin **doğrulanması** gerekir; üretim kalitesi modele ve prompt’a bağlıdır.
- **Çok kullanıcılı işbirliği:** Şu anki sürüm öncelikle **bireysel workspace** odaklıdır; merkezi paylaşım ayrı bir ürün genişlemesi gerektirir.

---

## 8. Sunumda kullanılabilecek 5 cümle

1. JKIR, API ve entegrasyon ekipleri için JSON/XML odaklı, tarayıcıda çalışan bir **veri ve dokümantasyon çalışma masasıdır**.
2. Postman benzeri **klasör yapısı**, **çift panel kod editörü** ve **ağaç / akış / sorgu** görünümleriyle yapıyı her açıdan anlamayı kolaylaştırır.
3. **Java POJO** ve **Confluence uyumlu tablolar** ile geliştirme ve wiki süreçlerini hızlandırır.
4. **Request/response** ve **hata türü** etiketleriyle örnek yükler sadece dosya değil, **sözleşme düşüncesiyle** yönetilir.
5. **Yerel LLM** ile klasör bazlı analiz, veriyi dışarı göndermeden dokümantasyon taslağı üretmeyi hedefler; vizyon, güvenli ve verimli entegrasyon yaşam döngüsüdür.

---

## 9. İlgili belgeler

| Belge | İçerik |
|--------|--------|
| [README.md](../README.md) | Kurulum, özellik listesi, proje yapısı |
| [PROJE_TANITIM.md](../PROJE_TANITIM.md) | Kısa ekip tanıtım metni |
| [DEV_NOTES.md](../DEV_NOTES.md) | Geliştirici notları ve son özellik dalı özeti |

---

*Bu dosya sunum ve paydaş hizalığı içindir; teknik uygulama ayrıntıları kod ve README ile güncellenmelidir.*
