from pathlib import Path
import json,re,sys
sys.stdout.reconfigure(encoding='utf8')
p=Path('src/i18n/vi.json');c=json.loads(p.read_text(encoding='utf8'))
for k,v in list(c.items()):
 v=v.replace('Người tiêu dùng','Người dùng API').replace('người tiêu dùng','người dùng API').replace('điểm cuối','endpoint').replace('Điểm cuối','Endpoint').replace('hạn ngạch','hạn mức').replace('Hạn ngạch','Hạn mức').replace('Sân chơi','Khu vực thử API').replace('sân chơi','khu vực thử API').replace('sandbox','môi trường thử nghiệm').replace('Sandbox','Môi trường thử nghiệm').replace('hộp cát','môi trường thử nghiệm').replace('Hộp cát','Môi trường thử nghiệm').replace('mã thông báo','token').replace('Mã thông báo','Token').replace('thiết bị đầu cuối','endpoint').replace('đo từ xa','dữ liệu giám sát').replace('Đo từ xa','Dữ liệu giám sát').replace('nhà phát triển','lập trình viên').replace('Nhà phát triển','Lập trình viên').replace('Bảng thông tin','Bảng điều khiển').replace('bảng thông tin','bảng điều khiển').replace('giới hạn tỷ lệ','giới hạn tốc độ').replace('Giới hạn tỷ lệ','Giới hạn tốc độ').replace('tải trọng','dữ liệu yêu cầu').replace('Tải trọng','Dữ liệu yêu cầu')
 c[k]=v
# Product names, technical identifiers and protocol values do not change by language.
proper=['Neural LLM v4','Vision OCR v2','Vision Object Detect','Vector Embeddings','NeuralSpeech AI','StellarPay Financial','GeoRoute Maps v2','SecureAuth Identity','MarketPulse Live Data','VisionAI Core','Neural LLM Inference v4','Global FX Settlement','ZeroTrust Auth Guard','HyperStream Weather API','Realtime Event Stream','Build Pipeline API','API HUB','API Hub','DM Sans','Geist','JetBrains Mono','OpenAPI','OpenAPI 3.1','API','cURL','Node.js','Python','TypeScript','JSON','YAML','OAuth2','POST','GET','PUT','PATCH','DELETE','HEAD','OPTIONS','JWT','HTTP','HTTPS','TCP','IP','URL','SDK','CORS','NS','SP','GR','SA','MP','CV','K','LLM','DNS']
for k in list(c):
 if k in proper or re.match(r'^[/#]|^https?://|^demo_|^\\"|^[-+]?\s*\\"|^\w+_\w+|^\w+\([^ ]*\)$',k) or re.match(r'^[A-Z]{1,4}$',k) or re.search(r'\bv\d+(?:\.\d+)*$',k) or re.match(r'^(?:curl |npm |import |const |Bearer |POST /|GET /)',k):c[k]=k
for k in proper:c[k]=k
for k in list(c):
 if re.match(r'^(Authorization|Content-Type|Accept|X-[\w-]+):|^(application|text|image|multipart)/|^\d{2}:\d{2} UTC$',k):c[k]=k
c.update(json.loads(Path('src/i18n/vi-overrides.json').read_text(encoding='utf-8-sig')))
# Verify interpolation variables before shipping.
invalid=[]
for k,v in c.items():
 if sorted(re.findall(r'\{\{\d+\}\}',k)) != sorted(re.findall(r'\{\{\d+\}\}',v)):invalid.append((k,v))
p.write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('Catalog',len(c),'invalid placeholders',len(invalid))
for k,v in invalid:print(k,'=>',v)
