// SSTV Decoder - compatible with SSTV-Encoder-main/encode.js
// Browser-only decoder for WAV/AudioBuffer. Supports the encoder's modes.

const MODES = {
  martin1:  {name:'Martin M1',  vis:0x1A, lines:256, width:320, blank:0.000572, scan:0.146432, sync:0.004862, layout:'gbr'},
  martin2:  {name:'Martin M2',  vis:0x0A, lines:256, width:320, blank:0.000572, scan:0.073216,  sync:0.004862, layout:'gbr'},
  scottie1: {name:'Scottie 1',  vis:0x1E, lines:256, width:320, blank:0.0015,   scan:0.138240, sync:0.009,     layout:'gbr'},
  scottie2: {name:'Scottie 2',  vis:0x0E, lines:256, width:320, blank:0.0015,   scan:0.088064,  sync:0.009,     layout:'gbr'},
  scottiedx:{name:'Scottie DX', vis:0x19, lines:256, width:320, blank:0.0015,   scan:0.3456,    sync:0.009,     layout:'gbr'},
  pd50:     {name:'PD-50',      vis:0x5D, lines:256, width:320, blank:0.00208,  scan:0.091520,  sync:0.02,      layout:'ybyr'},
  pd90:     {name:'PD-90',      vis:0x63, lines:256, width:320, blank:0.00208,  scan:0.170240,  sync:0.02,      layout:'ybyr'},
  pd120:    {name:'PD-120',     vis:0x7D, lines:496, width:640, blank:0.00208,  scan:0.121600,  sync:0.02,      layout:'ybyr'},
  pd160:    {name:'PD-160',     vis:0x13, lines:400, width:512, blank:0.00208,  scan:0.195584,  sync:0.02,      layout:'ybyr'},
  pd180:    {name:'PD-180',     vis:0x03, lines:496, width:640, blank:0.00208,  scan:0.18304,   sync:0.02,      layout:'ybyr'},
  pd240:    {name:'PD-240',     vis:0x43, lines:496, width:640, blank:0.00208,  scan:0.24448,   sync:0.02,      layout:'ybyr'},
  pd290:    {name:'PD-290',     vis:0x3D, lines:616, width:800, blank:0.00208,  scan:0.2288,    sync:0.02,      layout:'ybyr'},
  wrasse:   {name:'WRASSE SC2-180', vis:0x3B, lines:256, width:320, blank:0.0005, scan:0.235, sync:0.0055225, layout:'rgb'}
};

const clamp=(v,a=0,b=255)=>Math.max(a,Math.min(b,v));
const freqToByte=f=>clamp(Math.round((f-1500)/3.1372549));

function makeComplexDemod(samples, sampleRate, center=1900) {
  // Mix down and low-pass. A short smoothing window preserves SSTV pixel transitions.
  const n=samples.length, re=new Float32Array(n), im=new Float32Array(n);
  let r=0,i=0;
  const a=Math.exp(-2*Math.PI*900/sampleRate);
  const step=2*Math.PI*center/sampleRate;
  let c=1,s=0, cs=Math.cos(step), ss=Math.sin(step);
  for(let k=0;k<n;k++){
    const x=samples[k];
    const mr=x*c, mi=-x*s;
    r=a*r+(1-a)*mr; i=a*i+(1-a)*mi;
    re[k]=r; im[k]=i;
    const nc=c*cs-s*ss, ns=s*cs+c*ss; c=nc; s=ns;
  }
  return {re,im};
}

function instantaneousFrequency(re,im,sampleRate){
  const n=re.length, out=new Float32Array(n);
  let prev=Math.atan2(im[0],re[0]), phase=prev;
  for(let k=1;k<n;k++){
    const p=Math.atan2(im[k],re[k]);
    let d=p-prev;
    while(d>Math.PI)d-=2*Math.PI;
    while(d<-Math.PI)d+=2*Math.PI;
    phase+=d; prev=p;
    out[k]=1900 + d*sampleRate/(2*Math.PI);
  }
  // median-ish 3 point smoothing
  for(let k=2;k<n-1;k++) out[k]=(out[k-1]+out[k]+out[k+1])/3;
  return out;
}

function toneScore(freq, target){
  const d=Math.abs(freq-target);
  return Math.max(0,1-d/180);
}

function averageFreq(f,start,end,sr){
  let a=Math.max(0,Math.floor(start*sr)), b=Math.min(f.length,Math.floor(end*sr));
  let sum=0,n=0;
  for(let i=a;i<b;i++){ const x=f[i]; if(x>900&&x<2600){sum+=x;n++;} }
  return n?sum/n:0;
}

function findPrefix(f,sr){
  const pat=[1900,1500,1900,1500,2300,1500,2300,1500];
  const step=0.1;
  // Search every 10ms. Prefix has eight exact 100ms tones.
  let best={score:-1,time:0};
  const max=Math.min(f.length/sr-0.8,30);
  for(let t=0;t<max;t+=0.01){
    let score=0;
    for(let j=0;j<8;j++) score+=toneScore(averageFreq(f,t+j*step+0.015,t+(j+1)*step-0.015,sr),pat[j]);
    score/=8;
    if(score>best.score)best={score,time:t};
  }
  return best.score>0.68?best:null;
}

function decodeVIS(f,sr,prefixStart){
  const visStart=prefixStart+0.8+0.3+0.01+0.3;
  // start bit, 7 data bits LSB first in the encoder, parity, stop
  const bits=[];
  for(let j=0;j<7;j++){
    const a=averageFreq(f,visStart+0.03*(1+j)+0.006,visStart+0.03*(2+j)-0.006,sr);
    bits.push(Math.abs(a-1100)<Math.abs(a-1300));
  }
  let code=0; for(let j=0;j<7;j++) if(bits[j]) code|=1<<j;
  const parityFreq=averageFreq(f,visStart+0.03*8+0.006,visStart+0.03*9-0.006,sr);
  const parityBit=Math.abs(parityFreq-1100)<Math.abs(parityFreq-1300);
  const ones=bits.filter(Boolean).length;
  const parityOk=((ones+(parityBit?1:0))%2)===0;
  const mode=Object.entries(MODES).find(([,m])=>m.vis===code);
  return {visStart,code,parityOk,mode:mode?.[0]||null};
}

function yrybToRgb(Y,RY,BY){
  // Inverse of the encoder's Y/R-Y/B-Y transform, with standard-ish clipping.
  const r = Y + 1.371*(RY-128);
  const b = Y + 1.732*(BY-128);
  const g = Y - 0.336*(RY-128) - 0.698*(BY-128);
  return [clamp(Math.round(r)),clamp(Math.round(g)),clamp(Math.round(b))];
}

function sampleBand(f,sr,start,duration,count){
  const out=new Float32Array(count);
  // Sample near the center of each pixel. The encoder uses a frequency curve,
  // so local instantaneous frequency is the pixel value at the corresponding time.
  const margin=Math.min(duration*0.18,0.002);
  for(let x=0;x<count;x++){
    const t=start + (x+0.5)*duration/count;
    const a=Math.floor((t-margin)*sr), b=Math.floor((t+margin)*sr);
    let sum=0,n=0;
    for(let k=Math.max(0,a);k<Math.min(f.length,b);k++){
      const q=f[k]; if(q>1200&&q<2450){sum+=q;n++;}
    }
    out[x]=n?sum/n:1900;
  }
  return out;
}

function canvasFromImage(image){
  const c=document.createElement('canvas'); c.width=image.width; c.height=image.height;
  return c;
}

function decodeSSTV(audioBuffer, opts={}){
  const sr=audioBuffer.sampleRate;
  const ch=audioBuffer.numberOfChannels;
  const n=audioBuffer.length;
  const mono=new Float32Array(n);
  for(let c=0;c<ch;c++){const d=audioBuffer.getChannelData(c);for(let i=0;i<n;i++)mono[i]+=d[i]/ch;}
  const dem=makeComplexDemod(mono,sr,1900);
  const inst=instantaneousFrequency(dem.re,dem.im,sr);
  const prefix=findPrefix(inst,sr);
  if(!prefix) throw new Error('SSTV prefix tidak ditemukan. Pastikan audio dimulai dengan sinyal SSTV dan cukup bersih.');
  const vis=decodeVIS(inst,sr,prefix.time);
  const modeKey=opts.mode&&opts.mode!=='auto'?opts.mode:vis.mode;
  if(!modeKey||!MODES[modeKey]) throw new Error(`VIS ${vis.code} terdeteksi, tetapi mode tersebut belum dikenali.`);
  const m=MODES[modeKey];
  const canvas=document.createElement('canvas'); canvas.width=m.width; canvas.height=m.lines;
  const ctx=canvas.getContext('2d'); const img=ctx.createImageData(m.width,m.lines);
  let t=vis.visStart+0.03*10;

  const put=(line,x,rgb)=>{const p=(line*m.width+x)*4;img.data[p]=rgb[0];img.data[p+1]=rgb[1];img.data[p+2]=rgb[2];img.data[p+3]=255;};
  for(let line=0;line<m.lines;line++){
    let bands;
    if(m.layout==='gbr'){
      if(modeKey.startsWith('scottie')){
        // Scottie: after each G,B, and before R a sync pulse is emitted.
        const Gstart=t+m.blank; const G=sampleBand(inst,sr,Gstart,m.scan,m.width); t=Gstart+m.scan;
        const Bstart=t+m.blank; const B=sampleBand(inst,sr,Bstart,m.scan,m.width); t=Bstart+m.scan;
        t+=m.sync; const Rstart=t+m.blank; const R=sampleBand(inst,sr,Rstart,m.scan,m.width); t=Rstart+m.scan;
        bands=[G,B,R];
      } else {
        t+=m.sync+m.blank;
        const G=sampleBand(inst,sr,t,m.scan,m.width); t+=m.scan+m.blank;
        const B=sampleBand(inst,sr,t,m.scan,m.width); t+=m.scan+m.blank;
        const R=sampleBand(inst,sr,t,m.scan,m.width); t+=m.scan+m.blank;
        bands=[G,B,R];
      }
      for(let x=0;x<m.width;x++) put(line,x,[freqToByte(bands[2][x]),freqToByte(bands[0][x]),freqToByte(bands[1][x])]);
    } else if(m.layout==='rgb'){
      t+=m.sync+m.blank;
      const R=sampleBand(inst,sr,t,m.scan,m.width); t+=m.scan;
      const G=sampleBand(inst,sr,t,m.scan,m.width); t+=m.scan;
      const B=sampleBand(inst,sr,t,m.scan,m.width); t+=m.scan;
      for(let x=0;x<m.width;x++) put(line,x,[freqToByte(R[x]),freqToByte(G[x]),freqToByte(B[x])]);
    } else {
      // PD: each group is Y1, R-Y, B-Y, Y2. Chroma is shared by two lines in encoder.
      t+=m.sync+m.blank;
      const Y1=sampleBand(inst,sr,t,m.scan,m.width); t+=m.scan;
      const RY=sampleBand(inst,sr,t,m.scan,m.width); t+=m.scan;
      const BY=sampleBand(inst,sr,t,m.scan,m.width); t+=m.scan;
      const Y2=sampleBand(inst,sr,t,m.scan,m.width); t+=m.scan;
      for(let x=0;x<m.width;x++) put(line,x,yrybToRgb(freqToByte(Y1[x]),freqToByte(RY[x]),freqToByte(BY[x])));
      if(line+1<m.lines){for(let x=0;x<m.width;x++) put(line+1,x,yrybToRgb(freqToByte(Y2[x]),freqToByte(RY[x]),freqToByte(BY[x])));}
      line++;
    }
  }
  ctx.putImageData(img,0,0);
  return {canvas,mode:m,modeKey,vis,prefix};
}

window.SSTVDecoder={MODES,decodeSSTV};
