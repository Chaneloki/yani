# One-time curated import. Edit chapter JSON directly after reviewing the import.
from pathlib import Path
import json, hashlib, re
root=Path(__file__).resolve().parents[1]
def dump(p,x): (root/p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
characters=json.loads((root/'src/content/characters.json').read_text())
for who,real,role,variant in [('natsumi','CHAR_NATSUMI','ROLE_WITCH','witch'),('kentaro','CHAR_KENTARO','ROLE_HERO','hero')]:
 characters[who]['variants']['real']={e:f'./assets/characters/{real}.png' for e in ['neutral','smile']}
 characters[who]['variants'][variant]={e:f'./assets/characters/{role}.png' for e in ['neutral','smile']}
for key,name in [('university_classmate','大學同學'),('workshop_classmate','實習同學')]:
 characters[key]={'name':name,'shortName':name,'color':'#b9c7cb','variants':{}}
dump('src/content/characters.json',characters)
assets=json.loads((root/'src/content/assets.json').read_text())
for key,label,theme in [('campus','大學校園 · 背景待補','evening'),('cafe','咖啡店 · 背景待補','evening'),('ramen','拉麵店回憶 · 背景待補','evening'),('natsumi-room','奈津美的房間 · 背景待補','blue'),('kentaro-room','健太郎的房間 · 背景待補','evening'),('workshop','實習工場 · 背景待補','blue')]:assets['backgrounds'].setdefault(key,{'label':label,'theme':theme,'src':None})
dump('src/content/assets.json',assets)
manifest=json.loads((root/'src/content/manifest.json').read_text())
manifest['start']='prologue.natsumi.exam'
# Existing demo IDs remain intact, so demo-1 saves stay compatible.
manifest['chapters']=[{'id':'prologue','title':'序章 · 約會前夕','file':'chapters/prologue.json','entries':[{'scene':'prologue.natsumi.exam','title':'終於有時間了','perspective':'natsumi'},{'scene':'prologue.kentaro.workshop','title':'比誰都期待的星期六','perspective':'kentaro'}]},{'id':'demo','title':'引擎功能示範','file':'chapters/demo.json','demo':True}]
dump('src/content/manifest.json',manifest)
config={
'natsumi':{
 'file':'序章｜終於有時間了','default':'natsumi','opposite':'kentaro',
 'other':[1,2,6,8,10,11,13,15,16,40,42,44,46,48,51,52,54,56,59,61,63,65,67,69,71,73,75,77,79,81,83,85,87,89,91,93,95,96,98,100,102,104,106,108,110,112],
 'classmate':[18,20,23,24,25,27,30,33],'friend':'university_classmate','embedded':[17,36,113],
 'messages':[(13,15),(19,29),(98,154),(164,205),(215,221)],
 'scenes':[(2,30,'exam','終於有時間了','campus','星期三 · 考試結束'),(31,53,'ramen','短暫的晚飯','ramen','回憶 · 期末考前'),(54,86,'cafe','同學的推薦','cafe','星期三 · 考試後'),(87,154,'invitation','打遊戲約會','natsumi-room','星期三晚上 · 共同時間 A'),(155,161,'research','魔女與勇者','natsumi-room','約會前的幾天'),(162,207,'friday','魔女大人與勇者','natsumi-room','星期五晚上 · 共同時間 B'),(208,248,'night','明天見','natsumi-room','星期五深夜 · 約會前夕')]
},
'kentaro':{
 'file':'序章｜比誰都期待的星期六','default':'kentaro','opposite':'natsumi',
 'other':[14,16,19,21,23,24,27,29,31,36,38,40,42,44,45,48,50,52,53,57,58,60,62,64,66,68,70,72,78,80,82,84,86,88,90,92,94,97,99,101,103,106,108,110,113],
 'classmate':[1,3,7,9],'friend':'workshop_classmate','embedded':[],
 'messages':[(33,39),(95,96),(100,108),(125,125),(137,190),(202,229),(277,351),(360,368),(396,396)],
 'scenes':[(3,45,'workshop','比誰都期待的星期六','workshop','星期三 · 實習課'),(47,91,'ramen','還想再待一會兒','ramen','回憶 · 期末考前'),(93,119,'after-class','替妳高興','workshop','星期三 · 放學後'),(121,234,'invitation','買好了','kentaro-room','星期三晚上 · 共同時間 A'),(236,256,'research','想一起冒險','kentaro-room','約會前的兩天'),(258,354,'friday','一切準備好了','kentaro-room','星期五晚上 · 共同時間 B'),(356,444,'night','好期待啊','kentaro-room','星期五深夜 · 約會前夕')]
}}
scenes=[];report=[];edits=[]
for pov,c in config.items():
 original=(root/'docs/manuscripts'/c['file']).read_text()
 lines=original.splitlines()
 quotes=[i for i,t in enumerate(lines,1) if '「' in t and '」' in t]
 lookup={line:index for index,line in enumerate(quotes)}
 source_report={'file':c['file'],'sha256':hashlib.sha256(original.encode()).hexdigest(),'includedLines':[], 'excludedLines':[i for i,t in enumerate(lines,1) if i not in {j for a,b,*_ in c['scenes'] for j in range(a,b+1)} and t.strip()]}
 for a,b,key,title,bg,time in c['scenes']:
  nodes=[]; pending=[]
  def flush():
   if pending:
    nodes.append({'id':f'line-{pending[0][0]:04d}','type':'narration','text':'\n'.join(x[1] for x in pending),'source':{'file':c['file'],'lines':[x[0] for x in pending]},'stage':{'portraits':[{'character':pov,'variant':'real','expression':'neutral','position':'center'}]}})
    pending.clear()
  for ln in range(a,b+1):
   t=lines[ln-1].strip()
   if not t:flush();continue
   source_report['includedLines'].append(ln)
   # Small, documented consistency corrections only. No plot or voice rewrite.
   changes={('natsumi',63):('妳們','你們'),('natsumi',83):('妳們','你們'),('kentaro',3):('午後的實習工場裡','實習工場裡')}
   if (pov,ln) in changes:
    old,new=changes[pov,ln];updated=t.replace(old,new);edits.append({'file':c['file'],'line':ln,'before':t,'after':updated});t=updated
   q=lookup.get(ln)
   if q is not None and q not in c['embedded']:
    flush()
    speaker=c['opposite'] if q in c['other'] else c['friend'] if q in c['classmate'] else pov
    # Inline attribution remains narration; a bare speaker label is presentation metadata.
    pre,quote=t.split('「',1)
    if pre and pre!='山田：':nodes.append({'id':f'line-{ln:04d}-lead','type':'narration','text':pre,'source':{'file':c['file'],'lines':[ln]}})
    channel='message' if any(lo<=ln<=hi for lo,hi in c['messages']) else 'speech'
    if pov=='kentaro' and ln==396:channel='recollection'
    portraits=[] if speaker in [c['friend']] else [{'character':speaker,'variant':'real','expression':'neutral','position':'center'}]
    nodes.append({'id':f'line-{ln:04d}','type':'dialogue','speaker':speaker,'channel':channel,'text':'「'+quote,'source':{'file':c['file'],'lines':[ln]},'stage':{'portraits':portraits}})
   else:
    if sum(len(x[1])+1 for x in pending)+len(t)>56:flush()
    pending.append((ln,t))
  flush()
  scenes.append({'id':f'prologue.{pov}.{key}','title':title,'perspective':pov,'timeline':time,'stage':{'background':bg,'portraits':[{'character':pov,'variant':'real','expression':'neutral','position':'center'}],'cg':None},'nodes':nodes})
 report.append(source_report)
# Complete sentences take priority over a fixed page length.
from importlib.util import spec_from_file_location, module_from_spec
spec=spec_from_file_location('sentence_reflow',root/'scripts/reflow-sentences.py')
module=module_from_spec(spec);spec.loader.exec_module(module)
for scene in scenes:
 compact=[]
 for node in scene['nodes']:
  pages=[node['text']] if node['type']=='dialogue' else module.sentence_pages(node['text'])
  for i,text in enumerate(pages):compact.append(dict(node,text=text,id=node['id']+(f'-part-{i+1}' if i else '')))
 scene['nodes']=compact
for i,s in enumerate(scenes[:-1]):s['nodes'][-1]['next']=scenes[i+1]['id']
scenes[6]['nodes'][-1]['advanceLabel']='閱讀健太郎視角 ↗'
scenes[-1]['endLabel']='序章讀畢 · 下一章準備中'
staging=json.loads((root/'src/content/prologue-staging.json').read_text())
for scene in scenes:
 scene['stage']['background']=staging['sceneBackgrounds'][scene['id']]
 scene['stage']['bgm']=staging['sceneBgm'][scene['id']]
 for patch in staging.get('nodeBgm',[]):
  if patch['scene']==scene['id']:
   next(n for n in scene['nodes'] if patch['sourceLine'] in n['source']['lines']).setdefault('stage',{})['bgm']=patch['bgm']
 for patch in staging.get('nodeMedia',[]):
  if patch['scene']==scene['id']:
   next(n for n in scene['nodes'] if patch['sourceLine'] in n['source']['lines']).setdefault('stage',{})['media']=patch['media']
 for patch in staging.get('messageAttachments',[]):
  if patch['scene']==scene['id']:
   next(n for n in scene['nodes'] if patch['sourceLine'] in n['source']['lines'])['attachments']=patch['attachments']
 if scene['id'] in ['prologue.natsumi.ramen','prologue.kentaro.ramen']:scene['memory']=True
 for patch in staging['nodeBackgrounds']:
  if patch['scene']==scene['id']:
   node=next(n for n in scene['nodes'] if patch['sourceLine'] in n['source']['lines'])
   node.setdefault('stage',{})['background']=patch['background']
dump('src/content/chapters/prologue.json',{'scenes':scenes})
dump('docs/manuscript-import.json',{'sources':report,'edits':edits,'policy':'原稿保留；僅修正時間用字及男女合稱。標題、署名、完結標記與作者工作留言不作正文。旁白分段、引號與原有措辭保留。'})
print('scenes',len(scenes),'nodes',sum(len(s['nodes']) for s in scenes),'edits',len(edits))
