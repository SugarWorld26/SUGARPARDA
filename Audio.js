// ================================================================
//  Audio.js — SugarWorld Audio Manager
//  Música de menú, 5 niveles, victoria, resultados y 12 SFX
//  Todo sintetizado con Web Audio API — sin archivos externos
// ================================================================
const AudioManager = (() => {

  let _ctx = null;
  let _masterGain = null;
  let _musicGain  = null;
  let _sfxGain    = null;

  // Estado música
  let _musicNodes  = [];
  let _musicStart  = 0;
  let _musicDur    = 0;
  let _musicLoop   = 0;
  let _musicTimer  = null;
  let _currentTrack = null;
  let _rangazoTimer = null;

  // ── Init ────────────────────────────────────────────────────
  function _init() {
    if (_ctx) return;
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
    _masterGain = _ctx.createGain(); _masterGain.gain.value = 1.0;
    _musicGain  = _ctx.createGain(); _musicGain.gain.value  = 0.55;
    _sfxGain    = _ctx.createGain(); _sfxGain.gain.value    = 0.85;
    _musicGain.connect(_masterGain);
    _sfxGain.connect(_masterGain);
    _masterGain.connect(_ctx.destination);
  }

  function _resume() {
    if (_ctx && _ctx.state === 'suspended') _ctx.resume();
  }

  // ── Primitivas de síntesis ───────────────────────────────────
  function _osc(freq, type, when, dur, vol, detune, target) {
    if (!freq || freq <= 0) return;
    const o = _ctx.createOscillator();
    const g = _ctx.createGain();
    o.type = type || 'square';
    o.frequency.value = freq;
    if (detune) o.detune.value = detune;
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vol, when + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, when + dur - 0.01);
    o.connect(g); g.connect(target || _musicGain);
    o.start(when); o.stop(when + dur + 0.02);
    _musicNodes.push(o, g);
  }

  function _sweep(f0, f1, type, when, dur, vol, target) {
    if (!f0 || !f1) return;
    const o = _ctx.createOscillator();
    const g = _ctx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(f0, when);
    o.frequency.exponentialRampToValueAtTime(f1, when + dur);
    g.gain.setValueAtTime(vol, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + dur);
    o.connect(g); g.connect(target || _sfxGain);
    o.start(when); o.stop(when + dur + 0.02);
  }

  function _noise(when, dur, vol, decay, target) {
    const buf = _ctx.createBuffer(1, Math.ceil(_ctx.sampleRate * dur), _ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++)
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (_ctx.sampleRate * decay));
    const src = _ctx.createBufferSource();
    const g   = _ctx.createGain();
    src.buffer = buf; g.gain.value = vol;
    src.connect(g); g.connect(target || _sfxGain);
    src.start(when);
  }

  function _sfxOsc(freq, type, when, dur, vol, detune) {
    if (!freq || freq <= 0) return;
    const o = _ctx.createOscillator();
    const g = _ctx.createGain();
    o.type = type || 'square';
    o.frequency.value = freq;
    if (detune) o.detune.value = detune;
    g.gain.setValueAtTime(vol, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + dur);
    o.connect(g); g.connect(_sfxGain);
    o.start(when); o.stop(when + dur + 0.02);
  }

  // ── Notas ────────────────────────────────────────────────────
  const N = {
    C3:130.81, D3:146.83, E3:164.81, F3:174.61, G3:196.00,
    A3:220.00, Bb3:233.08, B3:246.94,
    C4:261.63, D4:293.66, Eb4:311.13, E4:329.63, F4:349.23,
    Fs4:369.99, G4:392.00, Ab4:415.30, A4:440.00, Bb4:466.16, B4:493.88,
    C5:523.25, D5:587.33, Eb5:622.25, E5:659.25, F5:698.46,
    Fs5:739.99, G5:783.99, Ab5:830.61, A5:880.00, Bb5:932.33, B5:987.77,
    C6:1046.50, D6:1174.66,
    E2:82.41, F2:87.31, G2:98.00, A2:110.00, B2:123.47,
    R:0,
  };

  // ── MÚSICA: definiciones de pistas ───────────────────────────

  const TRACKS = {

    // ── MENÚ PRINCIPAL ─────────────────────────────────────────
    menu: {
      bpm: 128,
      build(loopStart, B, totalDur) {
        const melody = [
          {n:'E5',d:.25},{n:'G5',d:.25},{n:'A5',d:.5},{n:'G5',d:.25},{n:'E5',d:.25},{n:'C5',d:.5},
          {n:'D5',d:.25},{n:'F5',d:.25},{n:'G5',d:.5},{n:'F5',d:.25},{n:'D5',d:.25},{n:'B4',d:.5},
          {n:'C5',d:.25},{n:'E5',d:.25},{n:'G5',d:.25},{n:'E5',d:.25},
          {n:'A5',d:.5},{n:'R',d:.25},{n:'A5',d:.25},
          {n:'B5',d:.25},{n:'A5',d:.25},{n:'G5',d:.25},{n:'F5',d:.25},{n:'E5',d:1},
          {n:'C5',d:.25},{n:'E5',d:.25},{n:'G5',d:.25},{n:'E5',d:.25},{n:'F5',d:.5},{n:'D5',d:.5},
          {n:'G4',d:.25},{n:'B4',d:.25},{n:'D5',d:.25},{n:'B4',d:.25},{n:'C5',d:.5},{n:'A4',d:.5},
          {n:'F4',d:.25},{n:'A4',d:.25},{n:'C5',d:.25},{n:'A4',d:.25},
          {n:'G4',d:.5},{n:'R',d:.25},{n:'G4',d:.25},
          {n:'A4',d:.25},{n:'B4',d:.25},{n:'C5',d:.25},{n:'D5',d:.25},{n:'E5',d:1},
        ];
        const bass = [
          {n:'C3',d:.5},{n:'G3',d:.5},{n:'E3',d:.5},{n:'G3',d:.5},
          {n:'F3',d:.5},{n:'C3',d:.5},{n:'A3',d:.5},{n:'F3',d:.5},
          {n:'G3',d:.5},{n:'D3',d:.5},{n:'B3',d:.5},{n:'G3',d:.5},
          {n:'C3',d:.5},{n:'E3',d:.5},{n:'G3',d:.5},{n:'C3',d:.5},
        ];
        const arp = [
          {n:'C4',d:.25},{n:'E4',d:.25},{n:'G4',d:.25},{n:'C5',d:.25},
          {n:'F3',d:.25},{n:'A3',d:.25},{n:'C4',d:.25},{n:'F4',d:.25},
          {n:'G3',d:.25},{n:'B3',d:.25},{n:'D4',d:.25},{n:'G4',d:.25},
          {n:'C4',d:.25},{n:'E4',d:.25},{n:'G4',d:.25},{n:'B4',d:.25},
        ];
        const bells = [1047,1319,1568,1047,1319,784,1047,1319];

        // Lead
        let t = loopStart;
        for (const n of melody) {
          if (N[n.n]) { _osc(N[n.n],'square',t,n.d*B*.85,.13,0); _osc(N[n.n]*2,'triangle',t,n.d*B*.80,.05,7); }
          t += n.d*B;
        }
        // Bajo
        t = loopStart; let bi=0;
        while (t < loopStart+totalDur-.01) { const bn=bass[bi%bass.length]; _osc(N[bn.n],'sawtooth',t,bn.d*B*.85,.16); t+=bn.d*B; bi++; }
        // Arpegio
        t = loopStart; let ai=0;
        while (t < loopStart+totalDur-.01) { const an=arp[ai%arp.length]; _osc(N[an.n],'triangle',t,an.d*B*.85,.06,4); t+=an.d*B; ai++; }
        // Pad
        t = loopStart;
        const pads=[{n:'C3',d:4},{n:'F3',d:4},{n:'G3',d:4},{n:'C3',d:4},{n:'C3',d:4},{n:'F3',d:4},{n:'G3',d:4},{n:'C3',d:4}];
        let pi=0;
        while (t < loopStart+totalDur-.01) { const pn=pads[pi%pads.length]; _osc(N[pn.n],'triangle',t,pn.d*B*.9,.04); t+=pn.d*B; pi++; }
        // Campanitas + percusión suave
        const bars=Math.ceil(totalDur/(4*B));
        for (let bar=0;bar<bars;bar++) {
          const bt=loopStart+bar*4*B;
          _osc(bells[bar%bells.length],'sine',bt,.45,.09);
          _drumHat(bt+B,.18); _drumHat(bt+3*B,.18);
          for (let h=0;h<8;h++) _drumHat(bt+h*.5*B,.09);
        }
      },
    },

    // ── NIVEL 1: Glucowood ─────────────────────────────────────
    level1: {
      bpm: 120,
      build(loopStart, B, totalDur) {
        const melody=[
          {n:'E5',d:.5},{n:'E5',d:.5},{n:'R',d:.5},{n:'G5',d:.5},
          {n:'A5',d:1},{n:'G5',d:.5},{n:'E5',d:.5},
          {n:'D5',d:.5},{n:'D5',d:.5},{n:'R',d:.5},{n:'F4',d:.5},
          {n:'A4',d:1},{n:'G4',d:.5},{n:'E4',d:.5},
          {n:'C5',d:.5},{n:'B4',d:.5},{n:'A4',d:.5},{n:'G4',d:.5},
          {n:'E4',d:.5},{n:'G4',d:.5},{n:'A4',d:1},
          {n:'C5',d:.5},{n:'D5',d:.5},{n:'E5',d:.5},{n:'C5',d:.5},{n:'G4',d:2},
        ];
        const bass=[
          {n:'C3',d:1},{n:'G3',d:1},{n:'A3',d:1},{n:'F3',d:1},
          {n:'C3',d:1},{n:'G3',d:1},{n:'A3',d:.5},{n:'G3',d:.5},{n:'F3',d:1},
        ];
        const arp=[
          {n:'C4',d:.25},{n:'E4',d:.25},{n:'G4',d:.25},{n:'C5',d:.25},
          {n:'A3',d:.25},{n:'E4',d:.25},{n:'F4',d:.25},{n:'A4',d:.25},
          {n:'G3',d:.25},{n:'D4',d:.25},{n:'G4',d:.25},{n:'B4',d:.25},
          {n:'C4',d:.25},{n:'E4',d:.25},{n:'G4',d:.25},{n:'E4',d:.25},
        ];
        let t=loopStart;
        for (const n of melody) { _osc(N[n.n],'square',t,n.d*B*.88,.18); t+=n.d*B; }
        t=loopStart; let bi=0;
        while(t<loopStart+totalDur-.01){const bn=bass[bi%bass.length];_osc(N[bn.n]/2,'sawtooth',t,bn.d*B*.85,.20);t+=bn.d*B;bi++;}
        t=loopStart; let ai=0;
        while(t<loopStart+totalDur-.01){const an=arp[ai%arp.length];_osc(N[an.n],'triangle',t,an.d*B*.85,.08,5);t+=an.d*B;ai++;}
        const bars=Math.ceil(totalDur/(4*B));
        for(let bar=0;bar<bars;bar++){
          const bt=loopStart+bar*4*B;
          _drumKick(bt,.28); _drumSnare(bt+2*B,.22);
          for(let h=0;h<4;h++) _drumHat(bt+h*B,.12);
        }
      },
    },

    // ── NIVEL 2: Picos de Glucosa ──────────────────────────────
    level2: {
      bpm: 138,
      build(loopStart, B, totalDur) {
        const melody=[
          {n:'A4',d:.5},{n:'R',d:.25},{n:'A4',d:.25},{n:'C5',d:.5},{n:'R',d:.5},
          {n:'E5',d:.75},{n:'D5',d:.25},{n:'C5',d:.5},{n:'B4',d:.5},
          {n:'A4',d:.5},{n:'R',d:.25},{n:'G4',d:.25},{n:'A4',d:.5},{n:'R',d:.5},
          {n:'F4',d:.75},{n:'E4',d:.25},{n:'D4',d:.5},{n:'E4',d:.5},
          {n:'G4',d:.5},{n:'R',d:.25},{n:'G4',d:.25},{n:'B4',d:.5},{n:'R',d:.5},
          {n:'D5',d:.75},{n:'C5',d:.25},{n:'B4',d:.5},{n:'Ab4',d:.5},
          {n:'A4',d:1},{n:'E5',d:.5},{n:'D5',d:.25},{n:'C5',d:.25},
          {n:'B4',d:.5},{n:'A4',d:.5},{n:'A4',d:2},
        ];
        const bass=[
          {n:'A2',d:1},{n:'A2',d:1},{n:'C3',d:1},{n:'E3',d:1},
          {n:'D3',d:1},{n:'D3',d:1},{n:'F3',d:1},{n:'E3',d:1},
          {n:'G3',d:1},{n:'G3',d:1},{n:'B3',d:.5},{n:'A3',d:.5},{n:'G3',d:1},
          {n:'A2',d:1},{n:'A2',d:.5},{n:'E3',d:.5},{n:'A2',d:2},
        ];
        const arp=[
          {n:'A3',d:.25},{n:'C4',d:.25},{n:'E4',d:.25},{n:'A4',d:.25},
          {n:'G3',d:.25},{n:'B3',d:.25},{n:'D4',d:.25},{n:'G4',d:.25},
          {n:'F3',d:.25},{n:'A3',d:.25},{n:'C4',d:.25},{n:'F4',d:.25},
          {n:'E3',d:.25},{n:'Ab3',d:.25},{n:'B3',d:.25},{n:'E4',d:.25},
        ];
        let t=loopStart;
        for(const n of melody){_osc(N[n.n],'square',t,n.d*B*.85,.20);t+=n.d*B;}
        t=loopStart;let bi=0;
        while(t<loopStart+totalDur-.01){const bn=bass[bi%bass.length];_osc(N[bn.n]/2,'sawtooth',t,bn.d*B*.85,.20);t+=bn.d*B;bi++;}
        t=loopStart;let ai=0;
        while(t<loopStart+totalDur-.01){const an=arp[ai%arp.length];_osc(N[an.n],'triangle',t,an.d*B*.85,.07,-8);t+=an.d*B;ai++;}
        // Pad con vibrato
        const padDef=[{n:'A2',d:4},{n:'D3',d:4},{n:'G3',d:4},{n:'A2',d:4}];
        t=loopStart;let pi=0;
        while(t<loopStart+totalDur-.01){
          const pn=padDef[pi%padDef.length];
          _osc(N[pn.n],'sawtooth',t,pn.d*B*.9,.06);
          t+=pn.d*B;pi++;
        }
        const bars=Math.ceil(totalDur/(4*B));
        for(let bar=0;bar<bars;bar++){
          const bt=loopStart+bar*4*B;
          _drumKick(bt,.32);_drumKick(bt+.5*B,.22);
          _drumSnare(bt+2*B,.26);_drumKick(bt+2.5*B,.22);_drumSnare(bt+3*B,.26);
          for(let h=0;h<8;h++) _drumHat(bt+h*.5*B,.11);
        }
      },
    },

    // ── NIVEL 3: Ciudad Páncreas ───────────────────────────────
    level3: {
      bpm: 110,
      build(loopStart, B, totalDur) {
        const melody=[
          {n:'C5',d:.5},{n:'Bb4',d:.5},{n:'Ab4',d:.5},{n:'G4',d:.5},
          {n:'Eb4',d:1},{n:'R',d:.5},{n:'F4',d:.5},
          {n:'G4',d:.5},{n:'Ab4',d:.5},{n:'Bb4',d:.5},{n:'C5',d:.5},
          {n:'D5',d:1.5},{n:'R',d:.5},
          {n:'Eb5',d:.5},{n:'D5',d:.5},{n:'C5',d:.5},{n:'Bb4',d:.5},
          {n:'Ab4',d:1},{n:'G4',d:.5},{n:'F4',d:.5},
          {n:'Eb4',d:.5},{n:'F4',d:.5},{n:'G4',d:.5},{n:'Ab4',d:.5},{n:'C4',d:2},
        ];
        const bass=[
          {n:'C3',d:.5},{n:'C3',d:.5},{n:'Eb3',d:.5},{n:'C3',d:.5},
          {n:'Ab3',d:.5},{n:'C3',d:.5},{n:'G3',d:.5},{n:'C3',d:.5},
          {n:'F3',d:.5},{n:'C3',d:.5},{n:'Eb3',d:.5},{n:'C3',d:.5},
          {n:'G3',d:.5},{n:'C3',d:.5},{n:'Ab3',d:.5},{n:'Bb3',d:.5},
        ];
        const arp=[
          {n:'C4',d:.25},{n:'Eb4',d:.25},{n:'G4',d:.25},{n:'Bb4',d:.25},
          {n:'Ab3',d:.25},{n:'C4',d:.25},{n:'Eb4',d:.25},{n:'Ab4',d:.25},
          {n:'F3',d:.25},{n:'Ab3',d:.25},{n:'C4',d:.25},{n:'F4',d:.25},
          {n:'G3',d:.25},{n:'Bb3',d:.25},{n:'D4',d:.25},{n:'G4',d:.25},
        ];
        // Lead synth doble
        let t=loopStart;
        for(const n of melody){
          if(N[n.n]){
            _osc(N[n.n],'sawtooth',t,n.d*B*.88,.14,0);
            _osc(N[n.n],'sawtooth',t,n.d*B*.85,.08,8);
          }
          t+=n.d*B;
        }
        t=loopStart;let bi=0;
        while(t<loopStart+totalDur-.01){const bn=bass[bi%bass.length];_osc(N[bn.n],'sawtooth',t,bn.d*B*.85,.20);t+=bn.d*B;bi++;}
        t=loopStart;let ai=0;
        while(t<loopStart+totalDur-.01){const an=arp[ai%arp.length];_osc(N[an.n],'triangle',t,an.d*B*.85,.05,3);t+=an.d*B;ai++;}
        const padDef=[{n:'C3',d:4},{n:'Ab3',d:4},{n:'F3',d:4},{n:'G3',d:4}];
        t=loopStart;let pi=0;
        while(t<loopStart+totalDur-.01){const pn=padDef[pi%padDef.length];_osc(N[pn.n],'sawtooth',t,pn.d*B*.9,.05,-12);t+=pn.d*B;pi++;}
        // Four-on-the-floor con clap
        const bars=Math.ceil(totalDur/(4*B));
        for(let bar=0;bar<bars;bar++){
          const bt=loopStart+bar*4*B;
          _drumKick(bt,.38);_drumKick(bt+B,.38);_drumKick(bt+2*B,.38);_drumKick(bt+3*B,.38);
          _drumSnare(bt+B,.24);_drumSnare(bt+3*B,.24);
          for(let h=0;h<16;h++) _drumHat(bt+h*.25*B,.08);
        }
      },
    },

    // ── NIVEL 4: Laboratorio de Insulina ──────────────────────
    level4: {
      bpm: 125,
      build(loopStart, B, totalDur) {
        const melody=[
          {n:'E4',d:.5},{n:'R',d:.5},{n:'F4',d:.25},{n:'E4',d:.25},{n:'R',d:1},
          {n:'G4',d:.5},{n:'R',d:.5},{n:'F4',d:.5},{n:'R',d:.5},
          {n:'Eb4',d:.75},{n:'R',d:.25},{n:'D4',d:.5},{n:'R',d:.5},
          {n:'E4',d:.5},{n:'R',d:.25},{n:'E4',d:.25},{n:'F4',d:.5},{n:'E4',d:.5},{n:'R',d:1},
          {n:'C5',d:.5},{n:'R',d:.5},{n:'B4',d:.25},{n:'Bb4',d:.25},{n:'R',d:1},
          {n:'A4',d:.5},{n:'R',d:.5},{n:'G4',d:.5},{n:'R',d:.5},
          {n:'F4',d:.75},{n:'R',d:.25},{n:'E4',d:.5},{n:'R',d:.5},
          {n:'E4',d:.5},{n:'F4',d:.25},{n:'G4',d:.25},{n:'E4',d:2},
        ];
        const bass=[
          {n:'E2',d:.5},{n:'E2',d:.5},{n:'E2',d:.5},{n:'F2',d:.5},
          {n:'E2',d:.5},{n:'E2',d:.5},{n:'G2',d:.5},{n:'E2',d:.5},
          {n:'E2',d:.5},{n:'E2',d:.5},{n:'A2',d:.5},{n:'E2',d:.5},
          {n:'E2',d:.5},{n:'F2',d:.5},{n:'E2',d:.5},{n:'E2',d:.5},
        ];
        const arp=[
          {n:'E3',d:.25},{n:'B3',d:.25},{n:'F3',d:.25},{n:'B3',d:.25},
          {n:'E3',d:.25},{n:'Bb3',d:.25},{n:'F3',d:.25},{n:'G3',d:.25},
          {n:'A3',d:.25},{n:'E3',d:.25},{n:'A3',d:.25},{n:'F3',d:.25},
          {n:'G3',d:.25},{n:'E3',d:.25},{n:'G3',d:.25},{n:'F3',d:.25},
        ];
        // Lead con triple oscilador
        let t=loopStart;
        for(const n of melody){
          if(N[n.n]){
            _osc(N[n.n],'square',t,n.d*B*.82,.10,0);
            _osc(N[n.n],'square',t,n.d*B*.80,.07,7);
            _osc(N[n.n],'square',t,n.d*B*.78,.05,-5);
          }
          t+=n.d*B;
        }
        t=loopStart;let bi=0;
        while(t<loopStart+totalDur-.01){const bn=bass[bi%bass.length];_osc(N[bn.n],'sawtooth',t,bn.d*B*.85,.22);t+=bn.d*B;bi++;}
        t=loopStart;let ai=0;
        while(t<loopStart+totalDur-.01){const an=arp[ai%arp.length];_osc(N[an.n],'square',t,an.d*B*.85,.04,-3);t+=an.d*B;ai++;}
        // Drone
        const pads=[{n:'E2',d:8},{n:'A2',d:4},{n:'F2',d:4}];
        t=loopStart;let pi=0;
        while(t<loopStart+totalDur-.01){const pn=pads[pi%pads.length];_osc(N[pn.n],'sawtooth',t,pn.d*B*.9,.04);t+=pn.d*B;pi++;}
        // Batería industrial
        const bars=Math.ceil(totalDur/(4*B));
        for(let bar=0;bar<bars;bar++){
          const bt=loopStart+bar*4*B;
          _drumKick(bt,.42);_drumKick(bt+2*B,.42);
          _drumSnare(bt+2*B,.26);
          _drumMetal(bt+.75*B);_drumMetal(bt+1.75*B);_drumMetal(bt+2.75*B);_drumMetal(bt+3.75*B);
          for(let h=0;h<8;h++) _drumHat(bt+h*.5*B,.08);
        }
      },
    },

    // ── NIVEL 5: Mundo del Azúcar y las Piruletas ─────────────
    level5: {
      bpm: 160,
      build(loopStart, B, totalDur) {
        const melody=[
          {n:'G4',d:.25},{n:'A4',d:.25},{n:'B4',d:.25},{n:'C5',d:.25},
          {n:'D5',d:.5},{n:'R',d:.25},{n:'D5',d:.25},
          {n:'E5',d:.25},{n:'D5',d:.25},{n:'C5',d:.25},{n:'B4',d:.25},{n:'C5',d:.5},{n:'R',d:.5},
          {n:'E5',d:.25},{n:'Fs5',d:.25},{n:'G5',d:.5},{n:'A5',d:.25},{n:'G5',d:.25},{n:'Fs5',d:.25},{n:'E5',d:.25},
          {n:'D5',d:.5},{n:'E5',d:.25},{n:'Fs5',d:.25},{n:'G5',d:1},
          {n:'D5',d:.25},{n:'E5',d:.25},{n:'Fs5',d:.25},{n:'G5',d:.25},
          {n:'A5',d:.5},{n:'R',d:.25},{n:'A5',d:.25},
          {n:'B5',d:.25},{n:'A5',d:.25},{n:'G5',d:.25},{n:'Fs5',d:.25},{n:'G5',d:.5},{n:'R',d:.5},
          {n:'C6',d:.25},{n:'B5',d:.25},{n:'A5',d:.25},{n:'G5',d:.25},
          {n:'Fs5',d:.5},{n:'E5',d:.25},{n:'D5',d:.25},
          {n:'G5',d:.5},{n:'Fs5',d:.25},{n:'E5',d:.25},{n:'D5',d:2},
        ];
        const bass=[
          {n:'G3',d:.5},{n:'G3',d:.5},{n:'D4',d:.5},{n:'G3',d:.5},
          {n:'C4',d:.5},{n:'C4',d:.5},{n:'G3',d:.5},{n:'C4',d:.5},
          {n:'D4',d:.5},{n:'D4',d:.5},{n:'A3',d:.5},{n:'D4',d:.5},
          {n:'G3',d:.5},{n:'B3',d:.5},{n:'D4',d:.5},{n:'G3',d:.5},
        ];
        const arp=[
          {n:'G4',d:.125},{n:'B4',d:.125},{n:'D5',d:.125},{n:'G5',d:.125},
          {n:'C4',d:.125},{n:'E4',d:.125},{n:'G4',d:.125},{n:'C5',d:.125},
          {n:'D4',d:.125},{n:'Fs4',d:.125},{n:'A4',d:.125},{n:'D5',d:.125},
          {n:'G4',d:.125},{n:'B4',d:.125},{n:'D5',d:.125},{n:'G5',d:.125},
        ];
        const counter=[
          {n:'D6',d:.5},{n:'R',d:.5},{n:'C6',d:.5},{n:'R',d:.5},
          {n:'B5',d:.5},{n:'R',d:.5},{n:'A5',d:.5},{n:'R',d:.5},
          {n:'G5',d:.5},{n:'A5',d:.25},{n:'B5',d:.25},{n:'C6',d:.5},{n:'R',d:.5},
          {n:'D6',d:1},{n:'R',d:1},
          {n:'E5',d:.5},{n:'R',d:.5},{n:'Fs5',d:.5},{n:'R',d:.5},
          {n:'G5',d:.5},{n:'R',d:.5},{n:'A5',d:.5},{n:'R',d:.5},
          {n:'B5',d:.5},{n:'A5',d:.25},{n:'G5',d:.25},{n:'Fs5',d:.5},{n:'R',d:.5},
          {n:'G5',d:2},
        ];
        let t=loopStart;
        for(const n of melody){_osc(N[n.n],'square',t,n.d*B*.88,.20);t+=n.d*B;}
        t=loopStart;let bi=0;
        while(t<loopStart+totalDur-.01){const bn=bass[bi%bass.length];_osc(N[bn.n]/2,'sawtooth',t,bn.d*B*.85,.20);t+=bn.d*B;bi++;}
        t=loopStart;let ai=0;
        while(t<loopStart+totalDur-.01){const an=arp[ai%arp.length];_osc(N[an.n],'triangle',t,an.d*B*.85,.06,4);t+=an.d*B;ai++;}
        // Xilofón de caramelo
        t=loopStart;
        for(const n of counter){
          if(N[n.n]){
            _osc(N[n.n],'sine',t,Math.min(n.d*B,.18),.13);
          }
          t+=n.d*B;
        }
        const bars=Math.ceil(totalDur/(4*B));
        for(let bar=0;bar<bars;bar++){
          const bt=loopStart+bar*4*B;
          _drumKick(bt,.38);_drumKick(bt+B,.30);
          _drumSnare(bt+B,.24);_drumKick(bt+2*B,.38);
          _drumKick(bt+2.5*B,.28);_drumSnare(bt+3*B,.24);_drumKick(bt+3.5*B,.22);
          for(let h=0;h<16;h++) _drumHat(bt+h*.25*B,.07);
        }
      },
    },
  };

  // ── Percusión ────────────────────────────────────────────────
  function _drumKick(when, vol) {
    const c=_ctx, sr=c.sampleRate;
    const buf=c.createBuffer(1,Math.ceil(sr*.18),sr);
    const d=buf.getChannelData(0);
    for(let i=0;i<d.length;i++){const t=i/sr;d[i]=Math.sin(2*Math.PI*(60+200*Math.exp(-t*25))*t)*Math.exp(-t*10);}
    const src=c.createBufferSource(),g=c.createGain();
    src.buffer=buf;g.gain.value=vol||.30;
    src.connect(g);g.connect(_musicGain);src.start(when);
    _musicNodes.push(src,g);
  }
  function _drumSnare(when, vol) {
    const c=_ctx,sr=c.sampleRate;
    const buf=c.createBuffer(1,Math.ceil(sr*.10),sr);
    const d=buf.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.exp(-i/(sr*.05))*.25;
    const src=c.createBufferSource(),g=c.createGain();
    src.buffer=buf;g.gain.value=vol||.22;
    src.connect(g);g.connect(_musicGain);src.start(when);
    _musicNodes.push(src,g);
  }
  function _drumHat(when, vol) {
    const c=_ctx,sr=c.sampleRate;
    const buf=c.createBuffer(1,Math.ceil(sr*.02),sr);
    const d=buf.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.exp(-i/(sr*.008))*.10;
    const src=c.createBufferSource(),g=c.createGain();
    src.buffer=buf;g.gain.value=vol||.10;
    src.connect(g);g.connect(_musicGain);src.start(when);
    _musicNodes.push(src,g);
  }
  function _drumMetal(when) {
    const c=_ctx,sr=c.sampleRate;
    const buf=c.createBuffer(1,Math.ceil(sr*.16),sr);
    const d=buf.getChannelData(0);
    for(let i=0;i<d.length;i++){const t=i/sr;d[i]=((Math.random()*2-1)*.5+Math.sin(2*Math.PI*800*t)*.5)*Math.exp(-t*28);}
    const src=c.createBufferSource(),g=c.createGain();
    src.buffer=buf;g.gain.value=.18;
    src.connect(g);g.connect(_musicGain);src.start(when);
    _musicNodes.push(src,g);
  }

  // ── Motor de loop de música ──────────────────────────────────
  function _stopMusic() {
    if (_musicTimer) { clearTimeout(_musicTimer); _musicTimer = null; }
    _musicNodes.forEach(n => { try { n.stop ? n.stop(0) : n.disconnect(); } catch(e){} });
    _musicNodes = [];
    _currentTrack = null;
  }

  function _calcLoopDur(track) {
    const B = 60 / track.bpm;
    // Ejecutar en modo "dry-run" contando duración: usamos un flag temporal
    // En vez de eso calculamos según la melodía de cada pista manualmente
    // Aproximación: la pista tiene una duración fija conocida en beats
    // Se calcula la primera vez ejecutando build y midiendo
    return B; // placeholder — se calcula real abajo
  }

  function _scheduleLoop(track, loopStart) {
    const B = 60 / track.bpm;
    // Calcular totalDur: necesitamos saber cuántos beats dura el loop
    // Lo hacemos guardando el tiempo máximo alcanzado durante build
    let maxT = loopStart;
    const origOsc = _osc;
    // Monkey-patch temporal para medir duración
    const times = [];
    // En vez de monkey-patch, usamos valores conocidos por pista
    const beatCounts = {
      menu:16, level1:12, level2:16, level3:12, level4:16, level5:16
    };
    // Obtener nombre de la pista
    const name = Object.keys(TRACKS).find(k => TRACKS[k] === track) || 'menu';
    const beats = beatCounts[name] || 16;
    const totalDur = beats * B * 4; // 4 beats por compás

    track.build(loopStart, B, totalDur);
    return totalDur;
  }

  function _scheduleMore(track) {
    if (_currentTrack !== track) return;
    const now = _ctx.currentTime;
    const loopsNeeded = Math.floor((now - _musicStart) / _musicDur) + 2;
    while (_musicLoop <= loopsNeeded) {
      _scheduleLoop(track, _musicStart + _musicLoop * _musicDur);
      _musicLoop++;
    }
    _musicTimer = setTimeout(() => _scheduleMore(track), 600);
  }

  function _playTrack(trackName) {
    _init(); _resume();
    _stopMusic();
    const track = TRACKS[trackName];
    if (!track) return;
    _currentTrack = track;
    const now = _ctx.currentTime;
    _musicDur = _scheduleLoop(track, now + 0.05);
    _musicStart = now + 0.05;
    _musicLoop  = 1;
    _scheduleMore(track);
  }

  // ── EFECTOS DE SONIDO ────────────────────────────────────────
  const SFX = {

    jump() {
      _init(); _resume();
      const now = _ctx.currentTime;
      _sweep(220, 660, 'square',   now,      .12, .22, _sfxGain);
      _sweep(440, 880, 'triangle', now+.02,  .10, .10, _sfxGain);
    },

    checkpoint() {
      _init(); _resume();
      const now = _ctx.currentTime;
      [523,659,784,1047].forEach((f,i) => _sfxOsc(f,'square',now+i*.08,.14,.18));
    },

    apple() {
      _init(); _resume();
      const now = _ctx.currentTime;
      _sfxOsc(880,  'sine', now,      .07, .16);
      _sfxOsc(1047, 'sine', now+.06,  .07, .14);
      _sfxOsc(1319, 'sine', now+.12,  .10, .18);
    },

    enemy() {
      _init(); _resume();
      const now = _ctx.currentTime;
      _sweep(440, 110, 'sawtooth', now,    .18, .25, _sfxGain);
      _noise(now, .15, .30, .04, _sfxGain);
      _sfxOsc(110, 'square', now+.05, .15, .20);
    },

    slowInsulin() {
      _init(); _resume();
      const now = _ctx.currentTime;
      _sweep(660, 330, 'triangle', now,    .30, .18, _sfxGain);
      _sfxOsc(330, 'sine', now+.25, .20, .12);
    },

    fastInsulin() {
      _init(); _resume();
      const now = _ctx.currentTime;
      _sweep(880, 220, 'sawtooth', now,     .10, .22, _sfxGain);
      _sweep(660, 165, 'square',   now+.05, .12, .15, _sfxGain);
      _noise(now, .08, .18, .02, _sfxGain);
    },

    glucagon() {
      _init(); _resume();
      const now = _ctx.currentTime;
      const notes=[392,494,587,784,587,784,1047];
      const durs =[.08,.08,.08,.15,.08,.08,.25];
      let t=now;
      notes.forEach((f,i)=>{ _sfxOsc(f,'square',t,durs[i],.20); t+=durs[i]+.01; });
    },

    hypo() {
      _init(); _resume();
      const now = _ctx.currentTime;
      _sweep(440, 55,  'sawtooth', now,     .50, .30, _sfxGain);
      _sweep(330, 41,  'square',   now+.15, .40, .20, _sfxGain);
      _noise(now+.10, .40, .20, .15, _sfxGain);
    },

    hole() {
      _init(); _resume();
      const now = _ctx.currentTime;
      _sweep(660, 40,  'sawtooth', now,     .55, .28, _sfxGain);
      _sweep(220, 30,  'square',   now+.20, .40, .18, _sfxGain);
      _noise(now+.10, .45, .25, .20, _sfxGain);
    },

    rangazo() {
      _init(); _resume();
      const now = _ctx.currentTime;
      const notes=[784,988,1175,988,1175,1568];
      const durs =[.07,.07,.07,.07,.07,.18];
      let t=now;
      notes.forEach((f,i)=>{
        _sfxOsc(f,   'square',   t, durs[i], .13);
        _sfxOsc(f*2, 'triangle', t, durs[i], .05);
        t+=durs[i]+.01;
      });
    },

    pickup() {
      _init(); _resume();
      const now = _ctx.currentTime;
      _sweep(440,  880,  'triangle', now,     .12, .16, _sfxGain);
      _sweep(660,  1320, 'square',   now+.06, .10, .10, _sfxGain);
    },

    winLevel() {
      _init(); _resume();
      const now = _ctx.currentTime;
      const fan=[{f:523,d:.10},{f:659,d:.10},{f:784,d:.10},{f:659,d:.07},{f:784,d:.07},{f:1047,d:.28}];
      let t=now;
      fan.forEach(n=>{ _sfxOsc(n.f,'square',t,n.d,.22); _sfxOsc(n.f,'triangle',t,n.d,.10,7); t+=n.d+.01; });
      t+=.04;
      [523,659,784,1047].forEach(f=>{ _sfxOsc(f,'square',t,.80,.08); _sfxOsc(f,'triangle',t,.80,.04); });
      _sfxOsc(2093,'sine',t+.10,.40,.11);
      _sfxOsc(1568,'sine',t+.25,.35,.09);
      _sfxOsc(1047,'sine',t+.45,.50,.13);
      for(let i=0;i<8;i++) _noise(now+i*.06,.05,.10,.015,_sfxGain);
    },

    winFinal() {
      _init(); _resume();
      const now = _ctx.currentTime;
      for(let i=0;i<16;i++) _noise(now+i*.04,.05,.04+i*.010,.015,_sfxGain);
      const p1=[{f:392,d:.10},{f:523,d:.10},{f:659,d:.10},{f:784,d:.20}];
      let t=now+.20;
      p1.forEach(n=>{ _sfxOsc(n.f,'square',t,n.d,.20); _sfxOsc(n.f*2,'triangle',t,n.d,.08); t+=n.d+.01; });
      t+=.12;
      const p2=[{f:523,d:.09},{f:659,d:.09},{f:784,d:.09},{f:1047,d:.09},{f:1319,d:.09},{f:1047,d:.07},{f:1319,d:.07},{f:1568,d:.30}];
      p2.forEach(n=>{ _sfxOsc(n.f,'square',t,n.d,.22); _sfxOsc(n.f,'triangle',t,n.d,.10,5); t+=n.d+.01; });
      t+=.06;
      [262,330,392,523,659,784,1047].forEach((f,i)=>{ _sfxOsc(f,'square',t+i*.03,1.80,.05); _sfxOsc(f,'triangle',t+i*.03,1.80,.03,4); });
      [2093,1760,1568,1319,1047,880,784].forEach((f,i)=>{ _sfxOsc(f,'sine',t+.30+i*.12,.60,.12); });
      for(let i=0;i<12;i++) _noise(t+1.50+i*.04,.05,.13,.015,_sfxGain);
      _sfxOsc(1047,'square',t+2.0,1.0,.18);
      _sfxOsc(523, 'sine',  t+2.0,2.0,.11);
    },
  };

  // ── Rangazo: toca el jingle solo si llevamos >3s en rangazo ─
  let _inRangazo = false;
  let _rangazoSecs = 0;
  let _rangazoPlayed = false;

  function tickRangazo(dt, isRangazo) {
    if (isRangazo) {
      _rangazoSecs += dt;
      if (_rangazoSecs >= 3 && !_rangazoPlayed) {
        SFX.rangazo();
        _rangazoPlayed = true;
      }
    } else {
      _rangazoSecs = 0;
      _rangazoPlayed = false;
    }
  }

  // ── API pública ──────────────────────────────────────────────
  return {
    playMusic(lvlIdx) {
      // lvlIdx: -1 = menú, 0-4 = niveles
      const names = ['level1','level2','level3','level4','level5'];
      const name  = lvlIdx < 0 ? 'menu' : (names[lvlIdx] || 'level1');
      _playTrack(name);
    },
    stopMusic() { _stopMusic(); },
    sfx(name)  {
      if (SFX[name]) SFX[name]();
    },
    tickRangazo,
    unlock() { _init(); _resume(); },
    setMusicVol(v) { _init(); if (_musicGain) _musicGain.gain.value = v; },
    setSfxVol(v)   { _init(); if (_sfxGain)   _sfxGain.gain.value   = v; },
  };

})();
