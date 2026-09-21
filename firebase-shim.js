/* FÚTBOL DEL JUEVES · Firebase backend adapter */
(function(){
  if(!window.firebase||!window.FIREBASE_CONFIG) return;
  if(!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
  const auth=firebase.auth(), db=firebase.firestore();
  window.__FDJ_FIREBASE={auth,db};

  const docId=(table,row)=>{
    if(row.id!=null) return String(row.id);
    if(table==="attendance"&&row.match_id&&row.player_id) return String(row.match_id)+"__"+String(row.player_id);
    if(table==="match_players"&&row.match_id&&row.player_id) return String(row.match_id)+"__"+String(row.player_id);
    return null;
  };
  const clean=(obj)=>JSON.parse(JSON.stringify(obj));
  const convertDoc=(snap)=>({id:snap.id,...snap.data()});

  class Query{
    constructor(table){this.table=table;this.ref=db.collection(table);this.filters=[];this.orderBy=null;this.orderAsc=true;this.method="GET";this.body=null;this.singleMode=null;this.wantData=false;this.prefer=[]}
    select(){this.wantData=true;return this}
    eq(k,v){this.filters.push({k,op:"==",v});return this}
    in(k,values){this.filters.push({k,op:"in",v:values});return this}
    order(k,opt={}){this.orderBy=k;this.orderAsc=opt.ascending!==false;return this}
    maybeSingle(){this.singleMode="maybe";return this}
    single(){this.singleMode="single";return this}
    insert(body){this.method="POST";this.body=body;return this}
    update(body){this.method="PATCH";this.body=body;return this}
    delete(){this.method="DELETE";return this}
    upsert(body){this.method="UPSERT";this.body=body;return this}
    async execute(){
      try{
        if(this.method==="POST"||this.method==="UPSERT"){
          const rows=Array.isArray(this.body)?this.body:[this.body];
          const out=[];
          for(const row of rows){
            const data=clean(row),id=docId(this.table,data),ref=id?this.ref.doc(id):this.ref.doc();
            if(this.method==="UPSERT") await ref.set(data,{merge:true}); else await ref.set(data);
            out.push({id:ref.id,...data});
          }
          if(this.singleMode==="single") return {data:out[0]||null,error:out.length?null:new Error("No se insertó ningún registro")};
          return {data:this.wantData||this.singleMode?out:null,error:null};
        }
        let q=this.ref;
        for(const f of this.filters) q=q.where(f.k,f.op,f.v);
        if(this.orderBy) q=q.orderBy(this.orderBy,this.orderAsc?"asc":"desc");
        const snap=await q.get();
        let rows=snap.docs.map(convertDoc);
        if(this.method==="GET"){
          if(this.singleMode==="single"&&rows.length!==1) return {data:null,error:new Error(rows.length?"Se esperaba un solo registro.":"No se encontró el registro.")};
          if(this.singleMode==="maybe") return {data:rows[0]||null,error:null};
          return {data:rows,error:null};
        }
        if(this.method==="PATCH"){
          const batch=db.batch(),out=[];
          snap.docs.forEach(d=>{const data=clean(this.body);batch.update(d.ref,data);out.push({id:d.id,...d.data(),...data})});
          await batch.commit();
          return {data:this.wantData?out:null,error:null};
        }
        if(this.method==="DELETE"){
          const batch=db.batch();snap.docs.forEach(d=>batch.delete(d.ref));await batch.commit();return {data:null,error:null};
        }
        return {data:null,error:null};
      }catch(error){return {data:null,error}};
    }
    then(resolve,reject){return this.execute().then(resolve,reject)}
    catch(reject){return this.execute().catch(reject)}
  }

  const client={
    from:table=>new Query(table),
    auth:{
      getSession:async()=>({data:{session:auth.currentUser?{user:auth.currentUser}:null}}),
      signInWithPassword:async({email,password})=>{
        try{const c=await auth.signInWithEmailAndPassword(email,password);return{data:{user:c.user,session:{user:c.user}},error:null}}
        catch(error){return{data:{user:null,session:null},error}}
      },
      signOut:async()=>{try{await auth.signOut();return{error:null}}catch(error){return{error}}},
      onAuthStateChange:(fn)=>({data:{subscription:auth.onAuthStateChanged(user=>fn(user?"SIGNED_IN":"SIGNED_OUT",user?{user}:null))}})
    }
  };
  window.supabase={createClient:()=>client};
})();