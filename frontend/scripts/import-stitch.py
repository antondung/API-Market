"""Convert the provided Stitch screens to React JSX; do not execute source scripts."""
from pathlib import Path
from bs4 import BeautifulSoup, NavigableString, Comment
import json, re

root = Path(__file__).resolve().parents[2]
out = root / 'frontend/src/screens'
out.mkdir(parents=True, exist_ok=True)
sources = sorted((root / 'stitch_api_hub_design_system').glob('*/code.html'))
route_names = {
 'api_hub_developer_api_marketplace_management_platform': ('/', 'Home', 'public'),
 'api_marketplace_explore_apis_api_hub': ('/marketplace', 'Explore APIs', 'public'),
 'neural_llm_v4_api_product_details_api_hub': ('/apis/neural-llm', 'API Detail', 'public'),
 'neural_llm_v4_api_documentation_api_hub': ('/apis/neural-llm/docs', 'Documentation', 'public'),
 'neural_llm_v4_api_playground_api_hub': ('/apis/neural-llm/playground', 'Playground', 'public'),
 'compare_apis_api_hub': ('/compare', 'Compare APIs', 'public'),
 'api_hub_pricing_plan_selection': ('/pricing', 'Pricing', 'public'),
 'subscription_checkout_api_hub': ('/checkout', 'Checkout', 'consumer'),
 'api_hub_consumer_dashboard_overview': ('/app/overview', 'Overview', 'consumer'),
 'api_hub_consumer_dashboard': ('/app/analytics', 'Consumer Analytics', 'consumer'),
 'api_hub_my_apis_subscriptions': ('/app/subscriptions', 'Subscriptions', 'consumer'),
 'api_hub_centralized_api_key_management': ('/app/keys', 'API Keys', 'consumer'),
 'api_hub_usage_quota_monitoring': ('/app/usage', 'Usage & Quota', 'consumer'),
 'api_hub_request_history': ('/app/requests', 'Request History', 'consumer'),
 'api_cost_guard_notification_center_api_hub': ('/app/cost-guard', 'Cost Guard & Alerts', 'consumer'),
 'api_hub_my_profile_account_management': ('/app/profile', 'Profile', 'consumer'),
 'api_hub_user_account_profile_settings': ('/app/settings', 'Account Settings', 'consumer'),
 'api_hub_provider_dashboard': ('/provider/overview', 'Provider Dashboard', 'provider'),
 'api_hub_provider_workspace': ('/provider/workspace', 'Provider Workspace', 'provider'),
 'api_hub_my_apis_inventory_management': ('/provider/apis', 'My APIs', 'provider'),
 'api_hub_create_edit_api_wizard': ('/provider/apis/new', 'Create API', 'provider'),
 'api_hub_endpoint_management': ('/provider/endpoints', 'Endpoints & Versions', 'provider'),
 'api_hub_openapi_import_auto_documentation_workspace': ('/provider/import', 'OpenAPI Import', 'provider'),
 'api_hub_provider_onboarding_verification_suite': ('/provider/verification', 'Provider Verification', 'provider'),
 'api_hub_provider_compliance_verification_workspace': ('/provider/compliance', 'Compliance', 'provider'),
 'api_hub_publishing_workflow_review_status_tracker': ('/provider/review', 'Publishing Workflow', 'provider'),
 'api_hub_provider_pricing_plan_management': ('/provider/plans', 'Pricing Plans', 'provider'),
 'api_hub_provider_subscriber_subscription_management': ('/provider/subscribers', 'Subscribers', 'provider'),
 'api_hub_provider_analytics_api_health_dashboard': ('/provider/analytics', 'Analytics & Health', 'provider'),
 'api_hub_enterprise_admin_dashboard': ('/admin/overview', 'Admin Dashboard', 'admin'),
 'api_hub_admin_console': ('/admin/console', 'Admin Console', 'admin'),
 'api_hub_admin_user_management': ('/admin/users', 'User Management', 'admin'),
 'api_hub_admin_provider_verification_approval': ('/admin/providers', 'Provider Approvals', 'admin'),
 'api_hub_api_review_publishing_approval_console': ('/admin/reviews', 'API Review', 'admin'),
 'api_hub_admin_reports_moderation_console': ('/admin/reports', 'Reports & Moderation', 'admin'),
 'api_hub_admin_subscription_payment_sandbox_monitoring': ('/admin/payments', 'Sandbox Payments', 'admin'),
 'api_hub_system_monitoring_api_gateway_operations': ('/admin/monitoring', 'Gateway Monitoring', 'admin'),
 'api_hub_enterprise_audit_logs_administrative_activity': ('/admin/audit', 'Audit Logs', 'admin'),
 'api_hub_access_denied_403': ('/403', 'Access Denied', 'public'),
 'api_hub_unauthenticated_protected_route': ('/protected', 'Sign In Required', 'public'),
}
aliases = {'class':'className','for':'htmlFor','tabindex':'tabIndex','colspan':'colSpan','rowspan':'rowSpan','readonly':'readOnly','maxlength':'maxLength','autocomplete':'autoComplete','autofocus':'autoFocus','spellcheck':'spellCheck','fill-rule':'fillRule','clip-rule':'clipRule','stroke-width':'strokeWidth','stroke-linecap':'strokeLinecap','stroke-linejoin':'strokeLinejoin','viewbox':'viewBox','srcset':'srcSet','crossorigin':'crossOrigin','accept-charset':'acceptCharset','preserveaspectratio':'preserveAspectRatio','contenteditable':'contentEditable','gradientunits':'gradientUnits'}
void = {'input','img','hr','br','area','base','col','embed','link','meta','param','source','track','wbr'}
boolean = {'disabled','required','multiple','readOnly','autoFocus','hidden','checked','selected','open'}
def camel(s):
 return re.sub(r'-([a-z])',lambda m:m[1].upper(),s)
def display_label(node):
 parts=[]
 for child in node.descendants:
  if not isinstance(child, NavigableString):continue
  if any('material-symbols' in ' '.join(parent.get('class',[])) for parent in child.parents if hasattr(parent,'get')):continue
  if str(child).strip():parts.append(str(child).strip())
 return ' '.join(parts) or node.get_text(' ',strip=True)

def jsx(node):
 if isinstance(node, Comment): return ''
 if isinstance(node, NavigableString):
  text=str(node)
  if node.find_parent(['code','pre']) or any('material-symbols' in ' '.join(p.get('class',[])) for p in node.parents if hasattr(p,'get')):
   return '{'+json.dumps(text,ensure_ascii=False)+'}' if text.strip() else '\n'
  row=node.find_parent('tr')
  if row and row.find_parent('tbody') and text.strip() in {'Active','Pending','Approved','Rejected','Suspended','Under Review','Published','Draft'}:
   return '{actions.recordText('+json.dumps('row-'+str(list(row.parent.find_all('tr',recursive=False)).index(row)))+', '+json.dumps(text)+')}'
  return '{actions.text('+json.dumps(text,ensure_ascii=False)+')}' if text.strip() else '\n'
 if node.name in {'script','style','link'}: return ''
 attrs=[]
 if node.get('placeholder'):attrs.append('data-source-placeholder={'+json.dumps(node.get('placeholder'),ensure_ascii=False)+'}')
 if node.name in {'button','a'} or node.get('onclick'):
  attrs.append('data-action-text={'+json.dumps(node.get_text(' ',strip=True),ensure_ascii=False)+'}')
 classes=node.get('class',[])
 if any('material-symbols' in c for c in classes) and not node.has_attr('aria-hidden'):attrs.append('aria-hidden={true}')
 onclick=node.get('onclick')
 for key,value in node.attrs.items():
  if key.startswith('on') or key in {'selected','data-active-classes'}: continue
  key=aliases.get(key,key)
  if (node.name=='svg' or node.find_parent('svg')) and not key.startswith(('aria-','data-')):key=camel(key)
  if key in {'rows','cols','tabIndex','colSpan','rowSpan','maxLength','minLength','size','span'}:
   attrs.append(key+'={'+str(int(value))+'}');continue
  if key=='style':
   styles={camel(k.strip()):v.strip() for chunk in value.split(';') if ':' in chunk for k,v in [chunk.split(':',1)]}
   attrs.append('style={'+json.dumps(styles)+'}');continue
  if key=='className': value=' '.join(value);value=value.replace('min-h-screen','min-h-dvh')
  if key=='value' and node.name in {'input','textarea','select'}: key='defaultValue'
  if key=='checked': key='defaultChecked'; attrs.append('defaultChecked={true}');continue
  if key in boolean: attrs.append(key+'={true}');continue
  if isinstance(value,list):value=' '.join(value)
  if key in {'placeholder','aria-label','title','alt'}:
   attrs.append(key+'={actions.text('+json.dumps(value,ensure_ascii=False)+')}')
  else:attrs.append(key+'={'+json.dumps(value,ensure_ascii=False)+'}')
 if node.name=='img' and not node.get('alt'):attrs.append('alt=""')
 if node.name in {'input','select','textarea'}:
  if not node.get('id'):attrs.append('aria-label={actions.text('+json.dumps(node.get('placeholder') or node.get('name') or 'Input')+')}')
 if node.name=='option' and not node.has_attr('value'):attrs.append('value={'+json.dumps(node.get_text(' ',strip=True))+'}')
 if node.name=='input' and not node.get('type'):attrs.append('type="text"')
 if node.name=='button':
  if not node.get('type'):attrs.append('type="button"')
  if not node.get('aria-label'):
   label=display_label(node)
   label=re.sub(r'\b[a-z]+(?:_[a-z]+)+\b', '', label).strip() or label
   label={'play_arrow':'Try API','close':'Close','more_vert':'More actions','content_copy':'Copy','download':'Download','delete':'Delete','refresh':'Refresh','chevron_left':'Previous','chevron_right':'Next','visibility':'View'}.get(label,label)
   attrs.append('aria-label={actions.text('+json.dumps(label)+')}')
 if onclick:
  attrs.append('data-handler={'+json.dumps(onclick)+'}')
  if node.name not in {'button','a','input'}:attrs+=['role="button"','tabIndex={0}']
 id=node.get('id')
 if id and ('hidden' in classes or re.search(r'(stage|tab|content|state|panel|view|modal|loading|drawer|response|resp|rbody)',id,re.I)):
  attrs=[a for a in attrs if not a.startswith('className=')]
  base=' '.join(c for c in classes if c!='hidden')
  attrs.append('className={actions.visible('+json.dumps(id)+', '+str('hidden' not in classes).lower()+') ? '+json.dumps(base)+' : '+json.dumps(base+' hidden')+'}')
 tag=node.name
 if tag=='lineargradient':tag='linearGradient'
 if tag=='tr' and node.find_parent('tbody'):
  record='row-'+str(list(node.parent.find_all('tr',recursive=False)).index(node))
  attrs+=['data-record="'+record+'"','hidden={!actions.matches('+json.dumps(node.get_text(' ',strip=True))+')}']
 children=''.join(jsx(c) for c in node.children)
 if tag=='textarea':
  attrs.append('defaultValue={'+json.dumps(node.get_text())+'}');children=''
 if tag=='form':attrs.append('onSubmit={actions.submit}')
 return '<'+tag+' '+' '.join(attrs)+(' />' if tag in void else '>'+children+'</'+tag+'>')

manifest=[]; extra_css=[]
for index,path in enumerate(sources):
 soup=BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')
 folder=path.parent.name; name='Screen'+str(index)
 route,title,role=route_names.get(folder,('/design/'+folder.removeprefix('api_hub_'),folder.replace('_',' ').title(),'design'))
 main=soup.main or soup.body
 for el in main.select('script'):el.decompose()
 content=''.join(jsx(n) for n in main.children)
 styles='\n'.join(s.get_text() for s in soup.select('head style') if '@layer base' not in s.get_text())
 # Legacy exports may set margins for their own sidebars. The shared app shell owns these.
 styles=re.sub(r'(?:body|main)\s*\{[^}]*\}', '', styles)
 if styles: extra_css.append(styles)
 (out/(name+'.tsx')).write_text("import { useScreenActions } from '../features/screen-actions';\nexport default function "+name+"() { const actions = useScreenActions(); return <><section className=\"stitch-screen\" onClick={actions.click} onChange={actions.change} onKeyDown={actions.keydown}>"+content+"</section>{actions.overlay}</>; }\n",encoding='utf-8')
 manifest.append({'path':route,'title':title,'role':role,'file':name,'source':folder})
 tailwind=soup.find('script',id='tailwind-config')
 if index==0 and tailwind:
  config=tailwind.get_text().strip().replace('tailwind.config =','module.exports =',1)
  config=config.replace('theme: {',"content: ['./index.html', './src/**/*.{ts,tsx}'], theme: {",1)
  (root/'frontend/tailwind.config.cjs').write_text(config,encoding='utf-8')
(out/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
(root/'frontend/src/stitch.css').write_text('\n'.join(set(extra_css)),encoding='utf-8')
print('Converted',len(manifest),'Stitch screens to TSX.')
