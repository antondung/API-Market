from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'src/screens/manifest.json').read_text(encoding='utf-8'))
flows={'/marketplace','/pricing','/compare','/apis/neural-llm','/apis/neural-llm/docs','/apis/neural-llm/playground','/checkout','/app/subscriptions','/app/keys','/app/requests','/app/cost-guard','/app/profile','/app/settings','/provider/apis','/provider/apis/new','/provider/import','/provider/endpoints','/provider/plans','/provider/verification','/provider/compliance','/provider/review','/admin/users','/admin/providers','/admin/reviews','/admin/reports','/admin/audit'}
lines=['# Stitch screen coverage','','48 màn hình nguồn có ánh xạ vào route. Các flow chính được triển khai bằng component React có state; các dashboard và showcase giữ layout nguồn với sample data. Tất cả chạy ở local demo mode.','','| Screen nguồn | Route | Vai trò | Cách triển khai |','| --- | --- | --- | --- |']
for item in manifest:
 mode='React flow + local persistence' if item['path'] in flows else 'Stitch layout + sample interactions'
 lines.append(f"| {item['source']} | `{item['path']}` | {item['role']} | {mode} |")
lines+=['','Route bổ sung: `/login`, `/register`, `/account`, `/notifications`, `/app/reports`, `/provider/revenue`, `/admin/apis`, `/admin/subscriptions`, và fallback 404.','','Các source conversions nằm trong `src/screens/Screen*.tsx`; route production dùng feature overrides ở `src/App.tsx` cho các màn hình cần form, mutation và data flow thực tế của demo. Không có iframe hoặc thực thi script từ HTML nguồn.']
(root/'SCREEN_COVERAGE.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('Coverage document generated for',len(manifest),'source screens.')
