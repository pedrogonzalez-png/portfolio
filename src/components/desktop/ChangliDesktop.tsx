import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { changliDesktop } from "../../data/changliDesktop";
import "../../styles/changli-desktop.css";

type SlotProps = {
  id: string;
  className?: string;
  x: number; y: number; w: number; h: number;
  children: ReactNode;
};
function Slot({ id, className = "", x, y, w, h, children }: SlotProps) {
  return (
    <div data-changli-slot={id} className={"changli-slot " + className}
      style={{ left:x+"%", top:y+"%", width:w+"%", height:h+"%" }}>
      {children}
    </div>
  );
}

function MediaSlot({ src, className="", label }: {
  src:string; className?:string; label:string;
}) {
  return src ? (
    <img className={"changli-media " + className} src={src}
      alt="" aria-hidden="true" loading="lazy" decoding="async" />
  ) : (
    <div className={"changli-media-placeholder " + className} aria-hidden="true"
      data-media-placeholder={label}>
      <span className="changli-media-marker">✧</span>
      <span className="changli-media-label">{label}</span>
    </div>
  );
}

function useLocalTime() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(interval);
  }, []);
  return now;
}
function dateInfo(now:Date) {
  return {
    time:new Intl.DateTimeFormat("pt-BR",{hour:"2-digit",minute:"2-digit"}).format(now),
    day:new Intl.DateTimeFormat("pt-BR",{day:"2-digit"}).format(now),
    month:new Intl.DateTimeFormat("pt-BR",{month:"long"}).format(now).toUpperCase(),
    weekday:new Intl.DateTimeFormat("pt-BR",{weekday:"long"}).format(now),
    long:new Intl.DateTimeFormat("pt-BR",{day:"numeric",month:"long",year:"numeric"}).format(now),
  };
}
function CalendarMonth({ now }: { now:Date }) {
  const year=now.getFullYear(),month=now.getMonth();
  const first=new Date(year,month,1).getDay();
  const length=new Date(year,month+1,0).getDate();
  const cells=Array.from({length:Math.ceil((first+length)/7)*7},(_,i)=>{
    const number=i-first+1;
    return number>0&&number<=length?number:null;
  });
  return (
    <div className="changli-calendar-days" aria-label="Calendário do mês atual">
      <div className="changli-calendar-head">
        {["D","S","T","Q","Q","S","S"].map((letter,i)=>
          <span key={letter+i}>{letter}</span>)}
      </div>
      <div className="changli-calendar-grid">
        {cells.map((day,i)=>(
          <span key={i} className={day===now.getDate()?"is-today":""}>
            {day??""}
          </span>
        ))}
      </div>
    </div>
  );
}
function Clocks({now}:{now:Date}) {
  const formatter=(timeZone:string)=>new Intl.DateTimeFormat("pt-BR",{
    hour:"2-digit",minute:"2-digit",timeZone,
  }).format(now);
  const zones=[
    {city:"Kolkata",tz:"Asia/Kolkata"},
    {city:"Tóquio",tz:"Asia/Tokyo"},
    {city:"Melbourne",tz:"Australia/Melbourne"},
    {city:"Seul",tz:"Asia/Seoul"},
  ];
  return (
    <div className="changli-world-grid">
      {zones.map(zone=>(
        <div key={zone.city} className="changli-world-tile">
          <span>{zone.city}</span><strong>{formatter(zone.tz)}</strong>
        </div>
      ))}
    </div>
  );
}
function StatsTile({icon,value,label}:{icon:string;value:number;label:string}) {
  return <div className="changli-stat-tile changli-glass">
    <span className="changli-stat-glyph">{icon}</span>
    <strong>{value}%</strong><small>{label}</small>
  </div>;
}
function Notes() {
  return <div className="changli-notes changli-glass">
    <div className="changli-tile-top"><span>Notes</span><span className="changli-chip">＋</span></div>
    <div className="changli-notes-stack">
      {changliDesktop.notes.map((note,i)=>(
        <div key={note} className={"changli-note changli-note-"+i}>{note}</div>
      ))}
    </div>
  </div>;
}
function Profile() {
  return <div className="changli-profile changli-glass">
    <div className="changli-profile-cover">
      <MediaSlot src={changliDesktop.media.profileBanner} label="BANNER" />
    </div>
    <div className="changli-profile-avatar">
      <MediaSlot src={changliDesktop.media.profileAvatar} label="AVATAR"/>
    </div>
    <div className="changli-profile-settings">⚙</div>
    <div className="changli-profile-meta">
      <strong>{changliDesktop.profile.handle}</strong>
      <div className="changli-profile-times">
        <span><strong>{changliDesktop.profile.days}</strong><small>days</small></span>
        <span><strong>{changliDesktop.profile.hours}</strong><small>hours</small></span>
        <span><strong>{changliDesktop.profile.minutes}</strong><small>mins</small></span>
      </div>
    </div>
    <div className="changli-profile-bottom"><span>♙ Lock</span><span>⏻</span></div>
  </div>;
}
function FeatureArtwork() {
  return <div className="changli-feature changli-glass">
    <MediaSlot src={changliDesktop.media.featureArtwork} label="ARTE / CHANGLI" />
    <div className="changli-feature-caption"><span>★★★★★</span>
      <strong>Changli</strong><small>THE ETERNAL BLAZE</small>
    </div>
  </div>;
}
function Todo() {
  return <div className="changli-todo changli-glass">
    <div className="changli-tile-top"><span>To-Do</span><span className="changli-chip">＋</span></div>
    {changliDesktop.tasks.map((task,i)=>
      <div key={task} className={"changli-task changli-task-"+i}>
        <span className="changli-task-ring"/><span>{task}</span>
      </div>)}
  </div>;
}
function Brand() {
  return <div className="changli-brand changli-glass">
    <MediaSlot src={changliDesktop.media.brandArtwork} label="ARTE DA MARCA"/>
    <span className="changli-brand-text">WUTHERING<br/>WAVES</span>
  </div>;
}
function Player() {
  return <div className="changli-player changli-glass">
    <div className="changli-player-symbol">♫</div>
    <div className="changli-player-controls"><span>♬</span><span className="changli-player-play">▶</span><span>Ⅱ</span></div>
  </div>;
}
function Calendar({now}:{now:Date}) {
  const info=dateInfo(now);
  return <div className="changli-calendar changli-glass">
    <div className="changli-calendar-left">
      <span className="changli-calendar-icon">▣</span>
      <small>{info.month}</small>
      <span>{info.weekday}</span><strong>{info.day}</strong>
    </div>
    <CalendarMonth now={now}/>
  </div>;
}
function WorldTime({now}:{now:Date}) {
  const info=dateInfo(now);
  return <div className="changli-world changli-glass">
    <div className="changli-world-header">
      <span>♧ Campinas</span><span>⚙</span>
    </div>
    <strong className="changli-world-time">{info.time}</strong>
    <small>{info.weekday}, {info.long}</small>
    <Clocks now={now}/>
  </div>;
}
function Poster() {
  return <div className="changli-poster changli-glass">
    <MediaSlot src={changliDesktop.media.rightPortrait} label="IMAGEM VERTICAL / CHANGLI"/>
  </div>;
}
function Weather() {
  const sample=changliDesktop.weatherSample;
  const metrics=[
    {icon:"♧",label:"Humidity",value:sample.humidity},
    {icon:"➴",label:"Wind",value:sample.wind},
    {icon:"☂",label:"Rain Chance",value:sample.rain},
    {icon:"◉",label:"Visibility",value:sample.visibility},
    {icon:"☼",label:"Sunrise",value:sample.sunrise},
    {icon:"☾",label:"Sunset",value:sample.sunset},
  ];
  return <div className="changli-weather changli-glass" aria-label="Exemplo visual de widget de clima, sem API conectada">
    <div className="changli-weather-primary">
      <strong>{sample.temperature}°C</strong>
      <div><span>{sample.summary}</span><small>Exemplo · {sample.city}</small></div>
      <span className="changli-weather-icon">☀</span>
    </div>
    <div className="changli-weather-grid">
      {metrics.map(metric=>
        <div key={metric.label}><span className="changli-metric-icon">{metric.icon}</span>
          <small>{metric.label}</small><strong>{metric.value}</strong></div>)}
    </div>
  </div>;
}
function Timers() {
  return <div className="changli-timers">
    {[{name:"Focus",time:"25:00",icon:"⚙"},{name:"Stopwatch",time:"0:00",icon:"✿"},
      {name:"Countdown",time:"0:00",icon:"⌛"}].map(timer=>
      <div className="changli-timer changli-glass" key={timer.name}>
        <span>{timer.icon}</span><strong>{timer.time}</strong><small>{timer.name}</small>
      </div>)}
  </div>;
}

/**
 * Decorative reproduction of the author's screenshot using real HTML/CSS.
 * All positions are deterministic for the reference 1914x862 composition.
 * Widgets are readonly, per the decision that visitors only select accent color.
 * Background video and all artwork are LOCAL OPTIONAL SLOTS in changliDesktop.ts.
 */
export function ChangliDesktop({ active=true, accent }: { active?:boolean;accent?:string|null }) {
  const now=useLocalTime();
  return (
    <div className="changli-desktop" style={{
      "--changli-accent":accent||"#dc693e",
    } as CSSProperties} aria-label="Desktop Changli com widgets em posições da referência">
      <div className="changli-wallpaper-layer" aria-hidden="true">
        <div className="changli-wallpaper-gradient"/>
        {changliDesktop.media.backgroundImage&&
          <img src={changliDesktop.media.backgroundImage} alt="" className="changli-wallpaper-media"/>}
        {active&&changliDesktop.media.backgroundVideo&&
          <video src={changliDesktop.media.backgroundVideo}
            poster={changliDesktop.media.backgroundImage || undefined}
            className="changli-wallpaper-media" autoPlay muted loop playsInline preload="metadata"/>}
        <div className="changli-wallpaper-vignette"/>
        <span className="changli-wallpaper-line changli-wallpaper-line-one"/>
        <span className="changli-wallpaper-line changli-wallpaper-line-two"/>
        {!changliDesktop.media.backgroundImage&&!changliDesktop.media.backgroundVideo&&
          <span className="changli-wallpaper-hint">BACKGROUND VIDEO / IMAGEM LOCAL</span>}
      </div>

      <Slot id="notes" x={1.2} y={10} w={8.3} h={18}><Notes/></Slot>
      <Slot id="profile" x={9.4} y={10.5} w={12.1} h={17.5}><Profile/></Slot>
      <div className="changli-meter-cluster">
        {changliDesktop.sampleMeters.map(stat=>
          <StatsTile key={stat.label} {...stat}/>)}
      </div>
      <Slot id="feature" x={2.45} y={28.6} w={19.3} h={21.1}><FeatureArtwork/></Slot>
      <Slot id="todo" x={22.8} y={30.1} w={7.7} h={17.7}><Todo/></Slot>
      <Slot id="brand" x={1.7} y={50.5} w={17.1} h={15}><Brand/></Slot>
      <Slot id="player" x={3.8} y={65.8} w={12.2} h={7.7}><Player/></Slot>
      <Slot id="calendar" x={3.8} y={75} w={12.2} h={16.4}><Calendar now={now}/></Slot>
      <Slot id="world-clock" x={16.1} y={65.5} w={8.8} h={16.9}><WorldTime now={now}/></Slot>
      <Slot id="portrait" x={86.1} y={2.2} w={11.8} h={61.6}><Poster/></Slot>
      <Slot id="weather" x={85.7} y={64.5} w={12.5} h={17.2}><Weather/></Slot>
      <Slot id="timers" x={85.9} y={82} w={12.5} h={12.2}><Timers/></Slot>
    </div>
  );
}
