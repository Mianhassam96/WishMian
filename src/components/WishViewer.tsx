"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { decodeWish, getTemplate } from "@/lib/wish";
import type { WishData, Template } from "@/lib/wish";
import { Share2, RotateCcw, Sparkles, Music, VolumeX, Check, Heart } from "lucide-react";
import ExplosionCanvas from "./ExplosionCanvas";
import confetti from "canvas-confetti";

type Stage = "silence"|"tap"|"flash"|"exploding"|"chat"|"cinematic"|"message"|"finale"|"share";

function createSound(){if(typeof window==="undefined")return null;try{const ctx=new(window.AudioContext||(window as unknown as{webkitAudioContext:typeof AudioContext}).webkitAudioContext)();return{tap:()=>{const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.setValueAtTime(880,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(440,ctx.currentTime+0.1);g.gain.setValueAtTime(0.25,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.15);o.start();o.stop(ctx.currentTime+0.15);},pop:()=>{const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type="sine";o.frequency.setValueAtTime(600,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(900,ctx.currentTime+0.06);g.gain.setValueAtTime(0.12,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.1);o.start();o.stop(ctx.currentTime+0.1);},boom:()=>{const buf=ctx.createBuffer(1,ctx.sampleRate*0.3,ctx.sampleRate);const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2);const src=ctx.createBufferSource();const g=ctx.createGain();src.buffer=buf;src.connect(g);g.connect(ctx.destination);g.gain.setValueAtTime(0.55,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.3);src.start();},};}catch{return null;}}

function useTyping(text:string,speed=40,startDelay=0){const[displayed,setDisplayed]=useState("");const[done,setDone]=useState(false);useEffect(()=>{setDisplayed("");setDone(false);let i=0;const t=setTimeout(()=>{const tick=()=>{i++;setDisplayed(text.slice(0,i));if(i>=text.length){setDone(true);return;}const ch=text[i-1];const d=ch==="."||ch==="!"||ch==="?"?speed*8:ch===","?speed*3:speed+(Math.random()-0.5)*12;setTimeout(tick,d);};tick();},startDelay);return()=>clearTimeout(t);},[text,speed,startDelay]);return{displayed,done};}

function TypingDots({color}:{color:string}){return(<div style={{display:"flex",gap:4,alignItems:"center",padding:"10px 14px"}}>{[0,1,2].map(i=><motion.div key={i} style={{width:7,height:7,borderRadius:"50%",background:color}} animate={{y:[0,-5,0],opacity:[0.3,1,0.3]}} transition={{duration:0.7,repeat:Infinity,delay:i*0.18,ease:"easeInOut"}}/>)}</div>);}

function ChatBubble({text,from,color,delay,onDone}:{text:string;from:"them"|"you";color:string;delay:number;onDone?:()=>void}){const[phase,setPhase]=useState<"hidden"|"typing"|"shown">("hidden");const{displayed,done}=useTyping(text,38,phase==="typing"?0:9999999);const snd=useRef<ReturnType<typeof createSound>>(null);useEffect(()=>{snd.current=createSound();},[]);useEffect(()=>{const dur=from==="them"?Math.min(text.length*28+400,2200):300;const t1=setTimeout(()=>setPhase("typing"),delay);const t2=setTimeout(()=>{setPhase("shown");snd.current?.pop();},delay+dur);return()=>{clearTimeout(t1);clearTimeout(t2);};},[delay,from,text.length]);useEffect(()=>{if(done&&onDone)onDone();},[done,onDone]);const isRight=from==="you";const now=new Date();const time=now.getHours()+":"+String(now.getMinutes()).padStart(2,"0");if(phase==="hidden")return null;return(<motion.div initial={{opacity:0,y:12,scale:0.92}} animate={{opacity:1,y:0,scale:1}} transition={{duration:0.3,ease:[0.22,1,0.36,1]}} style={{display:"flex",flexDirection:"column",alignItems:isRight?"flex-end":"flex-start",marginBottom:8}}>{phase==="typing"&&from==="them"&&<div style={{background:"rgba(255,255,255,0.07)",borderRadius:"18px 18px 18px 4px",border:"1px solid rgba(255,255,255,0.1)",display:"inline-block"}}><TypingDots color={color}/></div>}{phase==="shown"&&<><div style={{maxWidth:"80%",padding:"12px 16px",borderRadius:isRight?"18px 18px 4px 18px":"18px 18px 18px 4px",background:isRight?("linear-gradient(135deg,"+color+"dd,"+color+"99)"):"rgba(255,255,255,0.09)",border:!isRight?"1px solid rgba(255,255,255,0.1)":"none",fontSize:"0.95rem",lineHeight:1.6,color:"#fff",backdropFilter:"blur(12px)"}}>{displayed}{!done&&<span style={{opacity:0.3}}>|</span>}</div><span style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.18)",marginTop:3,padding:"0 4px"}}>{time}</span></> }</motion.div>);}

function fireConfetti(color:string,wave=1){confetti({particleCount:wave===2?200:120,spread:90,origin:{y:0.55},colors:[color,"#fff","#ffd700","#ff6b6b"]});setTimeout(()=>confetti({particleCount:80,spread:130,origin:{y:0.4},colors:[color,"#fff","#a78bfa"]}),350);if(wave===2){setTimeout(()=>confetti({particleCount:60,angle:60,spread:80,origin:{x:0,y:0.6},colors:[color,"#ffd700"]}),600);setTimeout(()=>confetti({particleCount:60,angle:120,spread:80,origin:{x:1,y:0.6},colors:[color,"#ffd700"]}),600);}}

export default function WishViewer(){
  const[stage,setStage]=useState<Stage>("silence");
  const[data,setData]=useState<WishData|null>(null);
  const[template,setTemplate]=useState<Template|null>(null);
  const[musicOn,setMusicOn]=useState(true);
  const[chatDone,setChatDone]=useState(false);
  const[copied,setCopied]=useState(false);
  const audioRef=useRef<HTMLAudioElement|null>(null);
  const soundRef=useRef<ReturnType<typeof createSound>>(null);
  const chatRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    soundRef.current=createSound();
    const params=new URLSearchParams(window.location.search);
    const encoded=params.get("data");
    if(!encoded){setStage("tap");return;}
    const decoded=decodeWish(encoded);
    if(!decoded){setStage("tap");return;}
    setData(decoded);setTemplate(getTemplate(decoded.occasion,decoded.mood));setStage("silence");
  },[]);

  useEffect(()=>{
    if(!template||!data)return;
    const f=data.occasion==="birthday"?"/audio/birthday.mp3":template.musicFile;
    const audio=new Audio(f);audio.loop=true;audio.volume=0;audioRef.current=audio;
    return()=>{audio.pause();audio.src="";};
  },[template,data]);

  const startMusic=()=>{const audio=audioRef.current;if(!audio||!musicOn)return;audio.play().catch(()=>{});let vol=0;const fade=setInterval(()=>{vol=Math.min(vol+0.015,0.5);audio.volume=vol;if(vol>=0.5)clearInterval(fade);},100);};
  const toggleMusic=()=>{const audio=audioRef.current;if(!audio)return;if(musicOn){audio.pause();setMusicOn(false);}else{audio.play().catch(()=>{});setMusicOn(true);}};

  const handleTap=()=>{
    if(stage!=="tap")return;
    soundRef.current?.tap();
    setStage("flash");
    setTimeout(()=>{setStage("exploding");soundRef.current?.boom();startMusic();},500);
    setTimeout(()=>setStage("chat"),2800);
  };

  const handleReplay=()=>{audioRef.current?.pause();if(audioRef.current)audioRef.current.currentTime=0;setChatDone(false);setStage("silence");};
  const handleShare=async()=>{const url=window.location.href;if(navigator.share){await navigator.share({title:"A wish for you",url}).catch(()=>{});}else{await navigator.clipboard.writeText(url).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),2000);}};

  useEffect(()=>{if(stage==="chat"&&chatRef.current)chatRef.current.scrollTop=chatRef.current.scrollHeight;},[stage,chatDone]);

  useEffect(()=>{
    if(stage==="cinematic"){const t=setTimeout(()=>{setStage("message");},5000);return()=>clearTimeout(t);}
    if(stage==="message"){const t=setTimeout(()=>{setStage("finale");fireConfetti(gc,1);},13000);return()=>clearTimeout(t);}
    if(stage==="finale"){const t=setTimeout(()=>fireConfetti(gc,2),2500);return()=>clearTimeout(t);}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[stage]);

  if(!data||!template)return(<div style={{position:"fixed",inset:0,background:"#060010",display:"flex",alignItems:"center",justifyContent:"center"}}><motion.div animate={{opacity:[0.3,1,0.3]}} transition={{duration:1.5,repeat:Infinity}}><span style={{color:"rgba(255,255,255,0.3)",fontSize:"0.7rem",letterSpacing:"0.2em",textTransform:"uppercase"}}>Opening...</span></motion.div></div>);

  const gc=template.glowColor;
  const chatMsgs=[
    {text:"Hey "+data.name+"… 😊",from:"them" as const,delay:300},
    {text:"I wanted to tell you something…",from:"them" as const,delay:2400},
    {text:"What is it? 👀",from:"you" as const,delay:4800},
    {text:"You've been really important to me.",from:"them" as const,delay:6200},
    {text:"Today is your special day "+template.emoji,from:"them" as const,delay:9500},
    {text:"Omg really?! 🥹",from:"you" as const,delay:12500},
    {text:"Open your surprise below ↓",from:"them" as const,delay:14000},
  ];
  const onChatDone=()=>{setChatDone(true);setTimeout(()=>setStage("cinematic"),2000);};

  return(
    <div style={{minHeight:"100vh",background:"#060010",position:"relative",overflow:"hidden"}}>
      <AnimatePresence mode="wait">

      {stage==="silence"&&<motion.div key="silence" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0,transition:{duration:0.8}}} onClick={()=>setStage("tap")} style={{position:"fixed",inset:0,background:"#030008",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",userSelect:"none"}}>
        <motion.div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at center,"+gc+"12 0%,transparent 60%)"}} animate={{opacity:[0.4,1,0.4]}} transition={{duration:4,repeat:Infinity,ease:"easeInOut"}}/>
        <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1,duration:2}} style={{fontSize:"0.8rem",letterSpacing:"0.25em",textTransform:"uppercase",color:"rgba(255,255,255,0.22)",marginBottom:52,textAlign:"center",lineHeight:2.2}}>Hey… someone has something for you</motion.p>
        <motion.div initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} transition={{delay:2.5,duration:1}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
          <motion.div animate={{scale:[1,1.1,1],boxShadow:["0 0 30px "+gc+"25","0 0 60px "+gc+"55","0 0 30px "+gc+"25"]}} transition={{duration:2,repeat:Infinity,ease:"easeInOut"}} style={{width:80,height:80,borderRadius:"50%",border:"1.5px solid "+gc+"44",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:"0.55rem",letterSpacing:"0.3em",textTransform:"uppercase",color:gc+"bb"}}>TAP</span>
          </motion.div>
          <motion.p animate={{opacity:[0.15,0.4,0.15]}} transition={{duration:3,repeat:Infinity}} style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.2)",letterSpacing:"0.1em"}}>tap to open</motion.p>
        </motion.div>
      </motion.div>}

      {stage==="tap"&&<motion.div key="tap" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={handleTap} style={{position:"fixed",inset:0,background:"#030008",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",userSelect:"none",overflow:"hidden"}}>
        <motion.div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at center,"+gc+"20 0%,transparent 55%)"}} animate={{scale:[1,1.08,1]}} transition={{duration:2,repeat:Infinity,ease:"easeInOut"}}/>
        <motion.div animate={{scale:[1,1.15,1]}} transition={{duration:1.5,repeat:Infinity,ease:"easeInOut"}} style={{fontSize:"0.6rem",letterSpacing:"0.35em",textTransform:"uppercase",color:"rgba(255,255,255,0.3)",marginBottom:44}}>For {data.name}</motion.div>
        <motion.div animate={{scale:[1,1.18,1]}} transition={{duration:1.4,repeat:Infinity,ease:"easeInOut"}} style={{width:88,height:88,borderRadius:"50%",border:"2px solid "+gc+"66",boxShadow:"0 0 40px "+gc+"40,0 0 80px "+gc+"20",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:"0.58rem",letterSpacing:"0.28em",textTransform:"uppercase",color:gc}}>TAP</span>
        </motion.div>
      </motion.div>}

      {stage==="flash"&&<motion.div key="flash" initial={{opacity:0}} animate={{opacity:[0,1,1,0]}} transition={{duration:0.5,times:[0,0.1,0.8,1]}} style={{position:"fixed",inset:0,background:"#fff",zIndex:100}}/>}

      {stage==="exploding"&&<motion.div key="exploding" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0,transition:{duration:1}}} style={{position:"fixed",inset:0,background:"#060010",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at center,"+gc+"40 0%,transparent 55%)"}}/>
        <ExplosionCanvas colors={template.particleColors} style={template.animationStyle}/>
        <motion.div initial={{scale:0,opacity:0}} animate={{scale:[0,1.5,1],opacity:[0,1,1]}} transition={{duration:0.8,ease:[0.22,1,0.36,1]}} style={{fontSize:90,position:"relative",zIndex:2,filter:"drop-shadow(0 0 30px "+gc+")"}}>{template.emoji}</motion.div>
      </motion.div>}

      {stage==="chat"&&<motion.div key="chat" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0,y:-20,transition:{duration:1.2}}} style={{position:"fixed",inset:0,background:"#060010",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,"+gc+","+gc+"88)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,boxShadow:"0 0 20px "+gc+"44"}}>{template.emoji}</div>
          <div><div style={{color:"#fff",fontSize:"0.9rem",fontWeight:600}}>WishMian</div><motion.div animate={{opacity:[0.4,1,0.4]}} transition={{duration:2,repeat:Infinity}} style={{color:"rgba(255,255,255,0.3)",fontSize:"0.68rem"}}>delivering your surprise…</motion.div></div>
          <div style={{marginLeft:"auto",display:"flex",gap:12}}>
            <button onClick={toggleMusic} style={{background:"none",border:"none",cursor:"pointer",color:musicOn?gc:"rgba(255,255,255,0.3)"}}>{musicOn?<Music size={16}/>:<VolumeX size={16}/>}</button>
            <button onClick={handleReplay} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.3)"}}><RotateCcw size={14}/></button>
          </div>
        </div>
        <div ref={chatRef} style={{flex:1,overflowY:"auto",padding:"20px 16px",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
          {chatMsgs.map((m,i)=><ChatBubble key={i} text={m.text} from={m.from} color={gc} delay={m.delay} onDone={i===chatMsgs.length-1?onChatDone:undefined}/>)}
        </div>
        <AnimatePresence>{chatDone&&<motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} style={{padding:"14px 20px 32px"}}>
          <motion.button onClick={()=>setStage("cinematic")} whileHover={{scale:1.02}} whileTap={{scale:0.97}} style={{width:"100%",height:58,borderRadius:18,border:"none",cursor:"pointer",background:"linear-gradient(135deg,"+gc+","+gc+"bb)",boxShadow:"0 0 40px "+gc+"55",color:"#fff",fontSize:"1rem",fontWeight:700}}>Open Your Wish {template.emoji}</motion.button>
        </motion.div>}</AnimatePresence>
      </motion.div>}

      {stage==="cinematic"&&<motion.div key="cinematic" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0,transition:{duration:1.5}}} style={{position:"fixed",inset:0,background:"#060010",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"40px 24px"}}>
        <motion.div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 60%,"+gc+"28 0%,transparent 60%)"}} animate={{opacity:[0.5,1,0.5]}} transition={{duration:3,repeat:Infinity}}/>
        <motion.p initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.5,duration:1}} style={{fontSize:"0.6rem",letterSpacing:"0.35em",textTransform:"uppercase",color:gc+"88",marginBottom:24}}>{template.label}</motion.p>
        <motion.div initial={{opacity:0,scale:0.7,filter:"blur(20px)"}} animate={{opacity:1,scale:1,filter:"blur(0px)"}} transition={{delay:1,duration:2,ease:[0.16,1,0.3,1]}} style={{fontSize:"clamp(3rem,12vw,6rem)",fontWeight:900,letterSpacing:"-0.04em",color:"#fff",textShadow:"0 0 60px "+gc+"80,0 0 120px "+gc+"40",lineHeight:1,marginBottom:20}}>{data.name}</motion.div>
        <motion.div initial={{scaleX:0}} animate={{scaleX:1}} transition={{delay:2.5,duration:1.2,ease:[0.22,1,0.36,1]}} style={{width:120,height:2,background:"linear-gradient(90deg,transparent,"+gc+",transparent)",marginBottom:20}}/>
        <motion.p initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:3,duration:1}} style={{color:"rgba(255,255,255,0.4)",fontSize:"1rem",letterSpacing:"0.05em"}}>your moment is here {template.emoji}</motion.p>
      </motion.div>}

      {stage==="message"&&<motion.div key="message" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:1.2}} style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px"}}>
          <a href="/" style={{display:"flex",alignItems:"center",gap:6,opacity:0.35,textDecoration:"none"}}><Sparkles size={13} color="#fff"/><span style={{color:"#fff",fontSize:"0.62rem",letterSpacing:"0.22em",textTransform:"uppercase"}}>WishMian</span></a>
          <div style={{display:"flex",gap:14}}>
            <button onClick={toggleMusic} style={{background:"none",border:"none",cursor:"pointer",color:musicOn?gc:"rgba(255,255,255,0.3)"}}>{musicOn?<Music size={17}/>:<VolumeX size={17}/>}</button>
            <button onClick={handleReplay} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.3)"}}><RotateCcw size={15}/></button>
            <button onClick={handleShare} style={{background:"none",border:"none",cursor:"pointer",color:gc,display:"flex",alignItems:"center",gap:5,fontSize:"0.82rem"}}><Share2 size={15}/> Share</button>
          </div>
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"16px 24px 32px",textAlign:"center"}}>
          {data.photo&&<motion.div initial={{opacity:0,scale:0.75}} animate={{opacity:1,scale:1}} transition={{delay:0.2,type:"spring",bounce:0.4}} style={{marginBottom:24}}><div style={{width:110,height:110,borderRadius:"50%",overflow:"hidden",border:"3px solid "+gc,boxShadow:"0 0 30px "+gc+"50,0 0 60px "+gc+"20"}}><img src={data.photo} alt={data.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/></div></motion.div>}
          <motion.p initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.3}} style={{fontSize:"0.62rem",letterSpacing:"0.28em",textTransform:"uppercase",color:gc+"85",marginBottom:10}}>{template.label}</motion.p>
          <motion.h1 initial={{opacity:0,y:28,filter:"blur(14px)"}} animate={{opacity:1,y:0,filter:"blur(0px)"}} transition={{delay:0.5,duration:1.1,ease:[0.16,1,0.3,1]}} style={{fontSize:"clamp(2.6rem,9vw,4.2rem)",fontWeight:800,letterSpacing:"-0.03em",lineHeight:1.05,marginBottom:22,textShadow:"0 0 40px "+gc+"65,0 0 80px "+gc+"28",color:"#fff"}}>{data.name} {template.emoji}</motion.h1>
          <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:0.9,duration:0.9}} style={{maxWidth:400,width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid "+gc+"22",borderRadius:22,padding:"22px 26px",boxShadow:"0 0 40px "+gc+"10",backdropFilter:"blur(20px)",marginBottom:18}}>
            <p style={{fontSize:"1.05rem",lineHeight:1.75,color:"rgba(255,255,255,0.88)",fontWeight:300}}>{data.message}</p>
          </motion.div>
          {data.from&&<motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.4}} style={{color:"rgba(255,255,255,0.28)",fontSize:"0.88rem",marginBottom:28}}>&mdash; {data.from}</motion.p>}
          <motion.div animate={{y:[0,-13,0],rotate:[-3,3,-3]}} transition={{duration:4.5,repeat:Infinity,ease:"easeInOut"}} style={{fontSize:50,marginBottom:28}}>{template.emoji}</motion.div>
          <motion.div initial={{scaleX:0}} animate={{scaleX:1}} transition={{delay:1.2,duration:0.9}} style={{display:"flex",gap:5,marginBottom:32}}>{template.colorPalette.map((c:string,i:number)=><div key={i} style={{width:36,height:3,borderRadius:2,background:c}}/>)}</motion.div>
          <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:2}}>
            <button onClick={()=>{fireConfetti(gc);setStage("finale");}} style={{padding:"14px 32px",borderRadius:50,border:"none",cursor:"pointer",background:"linear-gradient(135deg,"+gc+","+gc+"bb)",color:"#fff",fontSize:"0.95rem",fontWeight:700,letterSpacing:"0.03em",boxShadow:"0 0 30px "+gc+"50,0 8px 24px "+gc+"30",display:"flex",alignItems:"center",gap:8}}><Heart size={16} fill="white"/> Did this make you smile?</button>
          </motion.div>
        </div>
      </motion.div>}

      {stage==="finale"&&<motion.div key="finale" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed",inset:0,background:"#060010",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",textAlign:"center"}}>
        <motion.div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at center,"+gc+"30 0%,transparent 60%)"}} animate={{opacity:[0.6,1,0.6]}} transition={{duration:2,repeat:Infinity}}/>
        <motion.div className="float-anim" style={{fontSize:80,marginBottom:24,position:"relative",zIndex:1}}>🎉</motion.div>
        <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} style={{fontSize:"clamp(2rem,6vw,3rem)",fontWeight:800,color:"#fff",marginBottom:12,position:"relative",zIndex:1,textShadow:"0 0 40px "+gc+"80"}}>{template.label}!</motion.h1>
        <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}} style={{color:"rgba(255,255,255,0.5)",fontSize:"1rem",marginBottom:40,position:"relative",zIndex:1}}>Stay blessed, always ✨</motion.p>
        <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.7}} style={{display:"flex",flexDirection:"column",gap:12,width:"100%",maxWidth:360,position:"relative",zIndex:1}}>
          <button onClick={handleShare} style={{height:56,borderRadius:18,border:"none",cursor:"pointer",background:"linear-gradient(135deg,"+gc+","+gc+"bb)",boxShadow:"0 0 40px "+gc+"50",color:"#fff",fontSize:"1rem",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>{copied?<><Check size={18}/> Copied!</>:<><Share2 size={18}/> Share this wish</>}</button>
          <a href="/" style={{height:56,borderRadius:18,border:"1.5px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.7)",fontSize:"0.95rem",fontWeight:600,textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Sparkles size={16}/> Create your own wish</a>
          <button onClick={handleReplay} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.25)",fontSize:"0.85rem",padding:"8px"}}><RotateCcw size={14} style={{display:"inline",marginRight:6}}/>Replay</button>
        </motion.div>
      </motion.div>}

      </AnimatePresence>
    </div>
  );
}