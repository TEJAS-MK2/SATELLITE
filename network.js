(function(){
  const nativeFetch=window.fetch.bind(window);
  const OSIRIS='https://osirisai.live/api/';
  const proxies=[
    u=>'https://api.allorigins.win/raw?url='+encodeURIComponent(u),
    u=>'https://corsproxy.io/?url='+encodeURIComponent(u),
    u=>'https://api.codetabs.com/v1/proxy?quest='+encodeURIComponent(u)
  ];
  function timed(url,opts,ms){const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);return nativeFetch(url,{...(opts||{}),signal:c.signal}).finally(()=>clearTimeout(t))}
  window.fetch=async function(input,opts){
    const url=typeof input==='string'?input:input?.url||'';
    if(!url.startsWith(OSIRIS)) return nativeFetch(input,opts);
    try{return await timed(input,opts,1100)}catch(e){}
    let last;
    for(const make of proxies){
      try{const r=await timed(make(url),{cache:'no-store'},1800);if(r.ok)return r;last=new Error('proxy HTTP '+r.status)}catch(e){last=e}
    }
    throw last||new Error('OSIRIS network unavailable');
  };
})();
