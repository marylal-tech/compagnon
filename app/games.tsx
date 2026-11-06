'use client';
import { useEffect, useState } from 'react';
import { ArrowRight, Check, Copy, Lightbulb, RotateCcw } from 'lucide-react';

export type GameType='word'|'animal'|'quiz';
const words=['PATTE','CHIEN','NICHE','TIGRE','LAPIN','ZEBRE','PLUME','CORGI','POILS','FAUNE'];
const animals=[
 {name:'RENARD',clues:['Je suis un mammifère.','On peut me croiser en forêt, mais aussi en ville.','Ma queue est longue et touffue.','On me reconnaît souvent à mon pelage roux.']},
 {name:'LOUTRE',clues:['Je suis un mammifère.','Je suis très à l’aise dans l’eau.','Mon pelage est dense et mes pattes sont palmées.','Mon nom commence par L et contient six lettres.']},
 {name:'HERISSON',clues:['Je suis un petit mammifère.','Je suis surtout actif la nuit.','Je peux me rouler en boule.','Mon dos est couvert de piquants.']},
 {name:'CHAT',clues:['Je suis un mammifère.','Je peux vivre auprès des humains.','Mes moustaches m’aident à percevoir mon environnement.','Mon ronronnement est bien connu.']},
 {name:'LAPIN',clues:['Je suis un mammifère herbivore.','Je peux vivre en terrier.','Mes pattes arrière sont puissantes.','Mes longues oreilles sont caractéristiques.']},
 {name:'ECUREUIL',clues:['Je suis un petit mammifère.','Je grimpe facilement aux arbres.','Je peux cacher des graines pour plus tard.','Ma queue touffue m’aide à garder l’équilibre.']},
];
const questions=[
 {q:'Quelle photo sera la plus utile pour préparer une affiche ?',a:['Une photo récente où l’animal est bien visible','Une photo de groupe prise de loin','Une image très retouchée'],ok:0,why:'Une photo nette et récente aide à reconnaître l’animal et ses signes distinctifs.'},
 {q:'Une fiche de préparation est surtout utile…',a:['Uniquement pour les animaux âgés','Avant d’en avoir besoin','Seulement après plusieurs semaines de recherche'],ok:1,why:'Préparer les informations à l’avance permet de les retrouver plus facilement au moment utile.'},
 {q:'Quel élément aide à reconnaître un animal ?',a:['Le prénom de son propriétaire','Son jouet préféré uniquement','Une marque particulière de son pelage'],ok:2,why:'Une tache, une cicatrice visible ou un signe distinctif peut compléter la description.'},
 {q:'Avant d’ouvrir une porte donnant sur la rue, que vérifier ?',a:['Que l’animal reste dans un espace sécurisé','La météo uniquement','Le nombre de notifications sur son téléphone'],ok:0,why:'Prendre le temps de repérer l’animal et de sécuriser l’accès est une habitude de prévention.'},
 {q:'Pourquoi relire une affiche avant de la diffuser ?',a:['Pour ajouter le maximum d’informations personnelles','Pour vérifier le lieu, la date et le contact','Pour supprimer toute description'],ok:1,why:'Une affiche compréhensible et un contact exact facilitent les retours utiles.'},
 {q:'Pour construire un service utile, on commence par…',a:['Ajouter le plus de fonctions possible','Inventer des témoignages','Écouter les personnes concernées'],ok:2,why:'Les retours des propriétaires permettent d’adapter les outils à leurs besoins réels.'},
];
function normalize(s:string){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase();}
export function letterColors(guess:string,target:string){
 const result=Array(5).fill('absent'), rest=target.split('');
 for(let i=0;i<5;i++) if(guess[i]===target[i]){result[i]='correct';rest[i]='';}
 for(let i=0;i<5;i++) if(result[i]!=='correct'){const j=rest.indexOf(guess[i]);if(j>=0){result[i]='present';rest[j]='';}}
 return result;
}
export default function Games({type}:{type:GameType}){
 const [day,setDay]=useState(''); const [guesses,setGuesses]=useState<string[]>([]); const [entry,setEntry]=useState(''); const [notice,setNotice]=useState('');
 const [hint,setHint]=useState(1); const [answers,setAnswers]=useState<number[]>([]); const [ready,setReady]=useState(false);
 useEffect(()=>{const d=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());setDay(d);try{const v=JSON.parse(localStorage.getItem(`compagnons:${type}:${d}`)||'{}');setGuesses(Array.isArray(v.guesses)?v.guesses:[]);setHint(v.hint||1);setAnswers(Array.isArray(v.answers)?v.answers:[]);}catch{}setReady(true);},[type]);
 const index=day.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
 const target=words[index%words.length], animal=animals[index%animals.length];
 const quiz=Array.from({length:3},(_,i)=>questions[(index+i)%questions.length]);
 const won=type==='word'?guesses.includes(target):guesses.includes(animal.name);
 const ended=type==='quiz'?answers.length>=3:won||guesses.length>=(type==='word'?6:4);
 const score=answers.reduce((s,a,i)=>s+(quiz[i]?.ok===a?1:0),0);
 function save(g=guesses,h=hint,a=answers){try{localStorage.setItem(`compagnons:${type}:${day}`,JSON.stringify({guesses:g,hint:h,answers:a}));}catch{}}
 async function share(){const value=type==='word'?`Compagnons · Mot mystère · ${day}\n${won?guesses.length:'X'}/6\n${guesses.map(g=>letterColors(g,target).map(c=>c==='correct'?'🟩':c==='present'?'🟨':'⬜').join('')).join('\n')}`:type==='animal'?`Compagnons · Animal mystère · ${day}\n${won?'Trouvé !':'À retenter demain'} · ${hint} indice(s)`:`Compagnons · Quiz · ${day}\n${score}/3 bonnes réponses`;
 try{await navigator.clipboard.writeText(value);setNotice('Résultat copié, sans révéler la réponse !');}catch{setNotice(value);}}
 function submit(e:React.FormEvent){e.preventDefault();if(ended)return;const value=normalize(entry);if(type==='word'&&!/^[A-Z]{5}$/.test(value)){setNotice('Propose 5 lettres, sans espace.');return;}if(!value)return;if(guesses.includes(value)){setNotice('Tu as déjà proposé cette réponse.');return;}const next=[...guesses,value];setGuesses(next);setEntry('');setNotice('');save(next);}
 if(!ready) return <p>Préparation du défi…</p>;
 return <div className="game-play"><div className="eyebrow">LES JEUX DU JOUR · {day.split('-').reverse().join('.')}</div>
 <h2>{type==='word'?'Le mot mystère':type==='animal'?'Qui se cache ici ?':'Le petit quiz'}</h2>
 <p>{type==='word'?'Un mot de 5 lettres dans l’univers des animaux. À toi de le trouver en 6 essais.':type==='animal'?'Quatre essais et des indices pour découvrir un animal. À toi de jouer !':'Trois questions pour apprendre un petit quelque chose, chaque jour.'}</p>
 {type==='word'&&<><div className="word-grid" aria-label="Grille du mot mystère">{Array.from({length:6},(_,row)=>Array.from({length:5},(_,col)=>{const g=guesses[row];const color=g?letterColors(g,target)[col]:'';return <span key={`${row}-${col}`} className={`letter ${color}`} aria-label={g?`${g[col]} : ${color==='correct'?'bien placée':color==='present'?'mal placée':'absente'}`:'Case vide'}>{g?.[col]||(!ended&&row===guesses.length?entry[col]:'')}</span>;}))}</div><div className="legend"><span><i className="correct"/> Bien placée</span><span><i className="present"/> Mal placée</span><span><i className="absent"/> Absente</span></div></>}
 {type==='animal'&&<><div className="mystery-face" aria-hidden="true">?</div><ol className="hints">{animal.clues.slice(0,hint).map(c=><li key={c}>{c}</li>)}</ol>{hint<4&&!ended&&<button className="btn pale" onClick={()=>{setHint(hint+1);save(guesses,hint+1);}}><Lightbulb size={17}/> Un indice de plus</button>}<p className="tiny">{guesses.length}/4 essais{guesses.length>0?` · Déjà proposés : ${guesses.join(', ')}`:''}</p></>}
 {type!=='quiz'&&!ended&&<form className="guess-form" onSubmit={submit}><label className="sr-only" htmlFor="guess">{type==='word'?'Proposition de 5 lettres':'Nom de l’animal'}</label><input id="guess" autoComplete="off" value={entry} maxLength={type==='word'?5:30} onChange={e=>setEntry(normalize(e.target.value).replace(type==='word'?/[^A-Z]/g:/[^A-Z -]/g,''))} placeholder={type==='word'?'TON MOT':'L’animal est…'} required/><button className="btn primary" type="submit">Valider <ArrowRight size={17}/></button></form>}
 {type==='quiz'&&!ended&&<div className="quiz-question"><span className="tag">Question {answers.length+1} / 3</span><h3>{quiz[answers.length].q}</h3><div className="quiz-options">{quiz[answers.length].a.map((a,i)=><button key={a} onClick={()=>{const next=[...answers,i];setAnswers(next);save(guesses,hint,next);setNotice(quiz[answers.length].why);}}>{String.fromCharCode(65+i)}<span>{a}</span><ArrowRight size={16}/></button>)}</div></div>}
 {ended&&<div className="game-result"><Check size={25}/><h3>{type==='quiz'?`${score} / 3 · Bien joué !`:won?'Bien joué, tu as trouvé !':`La réponse était ${type==='word'?target:animal.name.toLowerCase()}.`}</h3><p>Un nouveau défi t’attend demain.</p><button className="btn primary" onClick={share}><Copy size={17}/> Partager mon résultat</button>{type==='quiz'&&<div className="quiz-recap">{quiz.map((q,i)=><p key={q.q}><b>{answers[i]===q.ok?'✓':'○'} {q.q}</b><br/>{q.a[q.ok]}<br/><small>{q.why}</small></p>)}</div>}</div>}
 <p className="status" role="status">{notice}</p><p className="tiny game-foot"><RotateCcw size={13}/> Défis renouvelés chaque jour, à l’heure de Paris. Progression conservée sur cet appareil.</p></div>;
}
