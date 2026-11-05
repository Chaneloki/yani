// Preserve prose exactly; only insert page boundaries after complete punctuation.
export function paginateText(text,limit=85,maxSentences=2){
 const units=text.match(/[^。！？；]+[。！？；]+[」』”’）】]*|[^。！？；]+$/gu)||[text];
 const pages=[];let page='',sentences=0;
 for(const unit of units){if(page && (Array.from(page+unit).length>limit || sentences>=maxSentences)){pages.push(page);page='';sentences=0;}page+=unit;sentences++;}
 if(page)pages.push(page);return pages;
}
