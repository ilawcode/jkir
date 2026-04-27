# Roadmap: File Comparison Tool

## Overview

A focused modification to integrate JSON/XML file comparison using CodeMirror merge capabilities directly within the existing application's split router framework.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

### Phase 1: Comparison Initialization Logic
**Goal**: Integrate context menu "Compare" action and modify state to track comparison targets.
**Depends on**: Nothing
**Requirements**: REQ-01, REQ-02
**Success Criteria** (what must be TRUE):
  1. Users can right click a JSON or XML file and see "Compare" or "Karşılaştır".
  2. The application records the active file vs the secondary file being compared.
**Plans**: 1 plan

Plans:
- [ ] 01-01: Update `CollectionContextMenu.tsx`, `CodeView.tsx` etc. to pipe out comparisons.

### Phase 2: Diff Code Editor Representation
**Goal**: Render the differences visually inside `.tsx` coding views using CodeMirror tools.
**Depends on**: Phase 1
**Requirements**: REQ-03, REQ-04, REQ-05
**Success Criteria** (what must be TRUE):
  1. When comparison state is active, the files occupy code viewer real estate as a diff viewer.
  2. Additions, deletions, and modifications are highlighted distinctly in the UI.
**Plans**: 1 plan

Plans:
- [ ] 02-01: Implement CodeMirror Diff/Merge view hooking into the comparison outputs generated in Phase 1.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Comparison Initialization Logic | 0/1 | Not started | - |
| 2. Diff Code Editor Representation | 0/1 | Not started | - |

### Phase 3: uygulama girişinde simle mode seçimi ve workpsace seçimi ekleyeceğiz. Simple mode ile direk kulalnıcı klasör oluşturmadan kod editor açık halde defaultta bir dosya var gibi açılacak yeni dosya ekleyebilir, dosyaları karşılaştırabilir diğer kısımdan sadece fark olarak klasör oluşturmak zorunda kalmayacak ve her seferinde dosyalar silinecek eğer saklama istiyor ise workspace kısmını kullanacak, seçimler altına uygulamanın çalışma prensibini de anlatan cümle olarak eklenecek, kullanıcı seçim altında her zaman bu modda aç seçeneği işratleyebilir bu sefer uygulamaya geldiğinde tekrar seçim ekranı açılmadan direk, ilgili mod açılacak en üst bar da mod değişitrme özelliği eklenecek mod değiştirirken yine default seçimim olacak

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 2
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 3 to break down)
