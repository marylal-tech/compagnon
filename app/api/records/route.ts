import { getChatGPTUser } from '../../chatgpt-auth';
import { getDb } from '../../../db';
import { records } from '../../../db/schema';
import { and, eq } from 'drizzle-orm';
export async function GET() {
 const user=await getChatGPTUser(); if(!user) return Response.json({error:'Connectez-vous pour accéder à votre espace.'},{status:401});
 const rows=await getDb().select().from(records).where(eq(records.owner,user.userId));
 return Response.json(rows.map(r=>({id:r.id,kind:r.kind,...JSON.parse(r.content)})),{headers:{'Cache-Control':'private, no-store'}});
}
export async function POST(req:Request) {
 const user=await getChatGPTUser(); if(!user) return Response.json({error:'Connectez-vous pour enregistrer vos informations.'},{status:401});
 const origin=req.headers.get('origin'); if(origin && origin!==new URL(req.url).origin) return Response.json({error:'Origine refusée.'},{status:403});
 if(Number(req.headers.get('content-length')||0)>2000000) return Response.json({error:'Le fichier est trop volumineux.'},{status:413});
 let body; try{const raw=await req.text(); if(raw.length>2000000) throw Error(); body=JSON.parse(raw);}catch{return Response.json({error:'Le formulaire est invalide ou trop volumineux.'},{status:400});}
 const {kind,id}=body; const v=body.data;
 if(!v || !['pet','participation','experience'].includes(kind) || (id && typeof id!=='string')) return Response.json({error:'Formulaire invalide.'},{status:400});
 const clean=(value:unknown,max=1000)=>typeof value==='string'?value.trim().slice(0,max):'';
 let data:Record<string,string|boolean>;
 if(kind==='pet'){
  const name=clean(v.name,60), species=clean(v.species,20), photo=clean(v.photo,1500000);
  if(!name || !['Chien','Chat'].includes(species) || (photo && !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(photo))) return Response.json({error:'Vérifiez le nom, l’espèce et la photo.'},{status:400});
  data={name,species,description:clean(v.description,800),town:clean(v.town,100),photo};
 }else if(kind==='participation'){
  if(v.consent!==true || !clean(v.name,80) || !clean(v.town,100)) return Response.json({error:'Complétez les champs obligatoires et votre accord.'},{status:400});
  data={name:clean(v.name,80),town:clean(v.town,100),interest:clean(v.interest,100),message:clean(v.message,1500),consent:true,email:user.email};
 }else{
  if(v.consent!==true || !clean(v.message,2000)) return Response.json({error:'Rédigez votre témoignage et confirmez votre accord.'},{status:400});
  data={town:clean(v.town,100),species:clean(v.species,20),message:clean(v.message,2000),consent:true};
 }
 const db=getDb();
 if(id){
  const found=await db.select().from(records).where(and(eq(records.id,id),eq(records.owner,user.userId),eq(records.kind,kind)));
  if(!found.length) return Response.json({error:'Élément introuvable.'},{status:404});
  await db.update(records).set({content:JSON.stringify(data)}).where(and(eq(records.id,id),eq(records.owner,user.userId)));
  return Response.json({id,kind,...data});
 }
 const newId=crypto.randomUUID();
 await db.insert(records).values({id:newId,owner:user.userId,kind,content:JSON.stringify(data),createdAt:new Date().toISOString()});
 return Response.json({id:newId,kind,...data},{status:201});
}
export async function DELETE(req:Request){
 const user=await getChatGPTUser(); if(!user) return Response.json({error:'Connexion requise.'},{status:401});
 const origin=req.headers.get('origin'); if(origin && origin!==new URL(req.url).origin) return Response.json({error:'Origine refusée.'},{status:403});
 const id=new URL(req.url).searchParams.get('id'); if(!id) return Response.json({error:'Identifiant manquant.'},{status:400});
 await getDb().delete(records).where(and(eq(records.id,id),eq(records.owner,user.userId)));
 return Response.json({ok:true});
}
