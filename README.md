# JSON Görüntüleyici (JKIR)

Next.js + Bootstrap 5 ile geliştirilmiş, split-view (bölünmüş ekran) yapısına sahip gelişmiş bir JSON görüntüleme ve düzenleme aracı.

## Özellikler

### Sol Panel (Editör)
- **Format & Minify**: JSON verisini otomatik formatlama veya tek satıra sıkıştırma.
- **Dikey Araç Çubuğu**: Yapıştır, Kopyala, Temizle gibi işlemlere hızlı erişim.
- **Local Storage**: Sayfa yenilense bile verileriniz kaybolmaz.
- **Çift Yönlü Senkronizasyon**: Sağ panelde yapılan düzenlemeler anında sol panele yansır.

### Sağ Panel (Görüntüleyici)
1.  **Code View**: VS Code stili renklendirilmiş (syntax highlighting) JSON editörü.
2.  **Tree View**: Katlanabilir ağaç yapısı. Düğümlere sağ tıklayarak düzenleme yapabilirsiniz.
3.  **Flow View**: JSON yapısını class/object diyagramı şeklinde görselleştirir.
4.  **Query View**: JSON içinde key/value araması yapmanızı ve sonuçları filtrelemenizi sağlar.

## Kullanım

Projeyi yerel ortamda çalıştırmak için:

```bash
git clone https://github.com/ilawcode/jkir.git
cd jkir
npm install
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) (veya 3001) adresine gidin.

## Teknoloji Yığını
- Next.js 15 (App Router)
- React 19
- Bootstrap 5
- TypeScript
