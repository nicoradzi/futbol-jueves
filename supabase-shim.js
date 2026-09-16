/* FÚTBOL DEL JUEVES · cliente Supabase sin CDN
   Implementa sólo las operaciones que usa esta app, usando fetch nativo del navegador. */
(function(){
  const cfg=window.APP_CONFIG||{};
  const URL=cfg.SUPABASE_URL;
  const KEY=cfg.SUPABASE_ANON_KEY;
  if(!URL||!KEY)return;

  let session=null;
  try{session=JSON.parse(localStorage.getItem('fdj_session')||'null')}catch(e){session=null}
  const listeners=[];
  const notifyAuth=()=>listeners.forEach(fn=>{try{fn('SIGNED_IN',session)}catch(e){}});
  const headers=(extra={})=>Object.assign({apikey:KEY,'Content-Type':'application/json'},session?.access_token?{Authorization:'Bearer '+session.access_token}:{Authorization:'Bearer '+KEY},extra);

  async function authRequest(path,body){
    const r=await fetch(URL+'/auth/v1/'+path,{method:'POST',headers:headers(),body:JSON.stringify(body)});
    const json=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(json.msg||json.error_description||json.message||'Error de autenticación');
    return json;
  }

  class Query{
    constructor(table){this.table=table;this.method='GET';this.body=null;this.params=[];this.wantData=false;this.singleMode=null;this.prefer=[]}
    select(fields='*'){this.wantData=true;this.params.push('select='+encodeURIComponent(fields));return this}
    eq(k,v){this.params.push(encodeURIComponent(k)+'=eq.'+encodeURIComponent(String(v)));return this}
    in(k,values){this.params.push(encodeURIComponent(k)+'=in.('+values.map(v=>encodeURIComponent(String(v))).join(',')+')');return this}
    order(k,opt={}){this.params.push('order='+encodeURIComponent(k)+'.'+(opt.ascending===false?'desc':'asc'));return this}
    maybeSingle(){this.singleMode='maybe';return this}
    single(){this.singleMode='single';return this}
    insert(body){this.method='POST';this.body=body;return this}
    update(body){this.method='PATCH';this.body=body;return this}
    delete(){this.method='DELETE';return this}
    upsert(body){this.method='POST';this.body=body;this.prefer.push('resolution=merge-duplicates');return this}
    async execute(){
      let endpoint=URL+'/rest/v1/'+encodeURIComponent(this.table);
      if(this.params.length)endpoint+='?'+this.params.join('&');
      const prefer=[...this.prefer];
      if(this.wantData || this.singleMode)prefer.push('return=representation');
      const r=await fetch(endpoint,{method:this.method,headers:headers(prefer.length?{'Prefer':prefer.join(', ')}:{}),body:this.method==='GET'||this.method==='DELETE'?undefined:JSON.stringify(this.body)});
      const text=await r.text();
      let data=null;
      try{data=text?JSON.parse(text):null}catch(e){data=text}
      if(!r.ok){
        if(this.singleMode==='maybe' && r.status===406)return {data:null,error:null};
        return {data:null,error:new Error(data?.message||data?.details||data?.hint||data?.error_description||('HTTP '+r.status))};
      }
      if(this.singleMode){
        if(Array.isArray(data)){if(data.length===0&&this.singleMode==='maybe')data=null;else data=data[0]??null}
      }
      return {data,error:null};
    }
    then(resolve,reject){return this.execute().then(resolve,reject)}
    catch(reject){return this.execute().catch(reject)}
  }

  const client={
    from:(table)=>new Query(table),
    auth:{
      getSession:async()=>({data:{session}}),
      signInWithPassword:async({email,password})=>{
        try{
          const json=await authRequest('token?grant_type=password',{email,password});
          session={access_token:json.access_token,refresh_token:json.refresh_token,user:json.user,expires_at:Math.floor(Date.now()/1000)+(json.expires_in||3600)};
          localStorage.setItem('fdj_session',JSON.stringify(session));
          notifyAuth();
          return {data:{user:json.user,session},error:null};
        }catch(error){return {data:{user:null,session:null},error}}
      },
      signOut:async()=>{session=null;localStorage.removeItem('fdj_session');listeners.forEach(fn=>{try{fn('SIGNED_OUT',null)}catch(e){}});return {error:null}},
      onAuthStateChange:(fn)=>{listeners.push(fn);return{data:{subscription:{unsubscribe:()=>{const i=listeners.indexOf(fn);if(i>=0)listeners.splice(i,1)}}}}}
    }
  };
  window.supabase={createClient:()=>client};
})();
