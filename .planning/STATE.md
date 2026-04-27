# Project State

## Overview
GSD Project initialized for adding comparative view to Jkir data viewer using manual bypass into YOLO mode.

## Technical Decisions
- Will be utilizing CodeMirror's inherent merge features (`@codemirror/merge`) as opposed to a purely custom react diff element, due to the existing strong dependency on `@codemirror/*`.

## Upcoming
- Running Phase 1 -> Context menu and comparative state injection
- Running Phase 2 -> Diff editor render

## Accumulated Context
### Roadmap Evolution
- Phase 3 added: uygulama girişinde simle mode seçimi ve workpsace seçimi ekleyeceğiz. Simple mode ile direk kulalnıcı klasör oluşturmadan kod editor açık halde defaultta bir dosya var gibi açılacak yeni dosya ekleyebilir, dosyaları karşılaştırabilir diğer kısımdan sadece fark olarak klasör oluşturmak zorunda kalmayacak ve her seferinde dosyalar silinecek eğer saklama istiyor ise workspace kısmını kullanacak, seçimler altına uygulamanın çalışma prensibini de anlatan cümle olarak eklenecek, kullanıcı seçim altında her zaman bu modda aç seçeneği işratleyebilir bu sefer uygulamaya geldiğinde tekrar seçim ekranı açılmadan direk, ilgili mod açılacak en üst bar da mod değişitrme özelliği eklenecek mod değiştirirken yine default seçimim olacak
