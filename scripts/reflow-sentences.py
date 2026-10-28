"""Reflow the current edited chapter, never replace it from the manuscript."""
from pathlib import Path
import json, copy

def sentence_pages(text, target=62):
    sentences=[];start=0;depth=0
    for i,ch in enumerate(text):
        if ch in '「『':depth+=1
        elif ch in '」』':depth=max(0,depth-1)
        if ch in '。！？' and depth==0:
            sentences.append(text[start:i+1]);start=i+1
    if start<len(text):sentences.append(text[start:])
    pages=[];page=''
    for sentence in sentences:
        if page and len(page)+len(sentence)>target:
            pages.append(page);page=''
        page+=sentence
    if page:pages.append(page)
    assert ''.join(pages)==text
    return pages

def reflow(data):
    changed=0
    for scene in data['scenes']:
        old=scene['nodes'];result=[];i=0
        while i<len(old):
            group=[old[i]];i+=1
            while i<len(old) and old[i].get('source')==group[0].get('source') and old[i]['type']==group[0]['type'] and old[i].get('speaker')==group[0].get('speaker') and '-part-' in old[i]['id']:
                group.append(old[i]);i+=1
            if len(group)==1 and not group[0]['text'].rstrip().endswith(('，',',')):
                result.extend(group);continue
            text=''.join(n['text'] for n in group)
            # A short quote remains one spoken/message unit, never half a quote.
            pages=[text] if group[0]['type']=='dialogue' else sentence_pages(text)
            if [n['text'] for n in group]!=pages:changed+=1
            new=[]
            for j,page in enumerate(pages):
                node=copy.deepcopy(group[min(j,len(group)-1)])
                node['id']=group[j]['id'] if j<len(group) else f"{group[0]['id']}-sentence-{j+1}"
                node['text']=page;node.pop('next',None);node.pop('advanceLabel',None)
                new.append(node)
            for key in ['next','advanceLabel']:
                if key in group[-1]:new[-1][key]=group[-1][key]
            assert len(new)>=len(group), 'Reflow would remove a stable ID; review this paragraph manually.'
            result.extend(new)
        scene['nodes']=result
    return changed

if __name__=='__main__':
    path=Path(__file__).resolve().parents[1]/'src/content/chapters/prologue.json'
    data=json.loads(path.read_text());changed=reflow(data)
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    print(f'Reflowed {changed} paragraph groups; {sum(len(s["nodes"]) for s in data["scenes"])} pages.')
