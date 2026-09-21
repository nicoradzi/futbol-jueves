/* FÚTBOL DEL JUEVES · Firebase backend adapter */
(function(){
  if(!window.firebase||!window.FIREBASE_CONFIG)return;
  if(!firebase.apps.length)firebase.initializeApp(window.FIREBASE_CONFIG);
  const auth=firebase.auth(),db=firebase.firestore();
  const docId=(table,row)=>{
    if(row.id!=null)return String(row.id);
    if((table==="attendance"||table==="match_players")&&row.match_id&&row.player_id)return String(row.match_id)+"__"+String(row.player_id);
    return null;
  };
  const clean=o=>JSON.parse(JSON.stringify(o)),toObj=s=>({id:s.id,...s.data()});
  class Query{
    constructor(table){this.table=table;this.ref=db.collection(table);this.filters=[];this.orderBy=null;this.asc=true;this.method="GET";this.body=null;this.singleMode=null;this.wantData=false}
    select(){this.wantData=true;return this}
    eq(k,v){this.filters.push({k,op:"==",v});return this}
    in(k,v){this.filters.push({k,op:"in",v});return this}
    order(k,o={}){this.orderBy=k;this.asc=o.ascending!==false;return this}
    maybeSingle(){this.singleMode="maybe";return this}
    single(){this.singleMode="single";return this}
    insert(b){this.method="POST";this.body=b;return this}
    update(b){this.method="PATCH";this.body=b;return this}
    delete(){this.method="DELETE";return this}
    upsert(b){this.method="UPSERT";this.body=b;return this}
    async execute(){try{
      if(this.method==="POST"||this.method==="UPSERT"){
        const rows=Array.isArray(this.body)?this.body:[this.body],out=[];
        for(const row of rows){const data=clean(row),id=docId(this.table,data),ref=id?this.ref.doc(id):this.ref.doc();await ref.set(data,this.method==="UPSERT"?{merge:true}:{});out.push({id:ref.id,...data})}
        return{data:this.singleMode?out[0]||null:this.wantData?out:null,error:null};
      }
      let q=this.ref;for(const f of this.filters)q=q.where(f.k,f.op,f.v);if(this.orderBy)q=q.orderBy(this.orderBy,this.asc?"asc":"desc");
      const snap=await q.get(),rows=snap.docs.map(toObj);
      if(this.method==="GET"){if(this.singleMode==="single"&&rows.length!==1)return{data:null,error:new Error(rows.length?"Se esperaba un solo registro.":"No se encontró el registro.")};if(this.singleMode==="maybe")return{data:rows[0]||null,error:null};return{data:rows,error:null}}
      const batch=db.batch(),out=[];
      if(this.method==="PATCH")snap.docs.forEach(d=>{const data=clean(this.body);batch.update(d.ref,data);out.push({id:d.id,...d.data(),...data})});
      if(this.method==="DELETE")snap.docs.forEach(d=>batch.delete(d.ref));
      await batch.commit();return{data:this.wantData?out:null,error:null};
    }catch(error){return{data:null,error}}}
    then(a,b){return this.execute().then(a,b)}
    catch(a){return this.execute().catch(a)}
  }
  window.__FDJ_FIREBASE={auth,db};
  window.supabase={createClient:()=>({from:t=>new Query(t),auth:{
    getSession:async()=>({data:{session:auth.currentUser?{user:auth.currentUser}:null}}),
    signInWithPassword:async({email,password})=>{try{const c=await auth.signInWithEmailAndPassword(email,password);return{data:{user:c.user,session:{user:c.user}},error:null}}catch(error){return{data:{user:null,session:null},error}}},
    signOut:async()=>{try{await auth.signOut();return{error:null}}catch(error){return{error}}},
    onAuthStateChange:fn=>({data:{subscription:auth.onAuthStateChanged(u=>fn(u?"SIGNED_IN":"SIGNED_OUT",u?{user:u}:null))}})
  }})};
})();