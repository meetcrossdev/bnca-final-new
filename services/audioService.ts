/**
 * Audio service to synthesize powerful, cinematic firework sounds using Web Audio API.
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let compressor: DynamicsCompressorNode | null = null;
let currentVolume = 1.0;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Dynamics compressor to prevent clipping while allowing high "loudness" feel
    compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-18, audioCtx.currentTime);
    compressor.knee.setValueAtTime(30, audioCtx.currentTime);
    compressor.ratio.setValueAtTime(15, audioCtx.currentTime);
    compressor.attack.setValueAtTime(0, audioCtx.currentTime);
    compressor.release.setValueAtTime(0.1, audioCtx.currentTime);
    
    masterGain = audioCtx.createGain();
    // Use the stored volume setting (scaled for "July 4th" impact)
    masterGain.gain.setValueAtTime(currentVolume * 1.5, audioCtx.currentTime);

    compressor.connect(masterGain);
    masterGain.connect(audioCtx.destination);
  }
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return { ctx: audioCtx, output: compressor! };
};

/**
 * Sets the master volume level.
 * @param level 0.0 to 1.0
 */
export const setMasterVolume = (level: number) => {
  currentVolume = level;
  if (masterGain && audioCtx) {
    // Smooth transition to new volume
    masterGain.gain.setTargetAtTime(level * 1.5, audioCtx.currentTime, 0.1);
  } else if (!audioCtx && level > 0) {
    // Ensure initialized if setting volume above 0
    initAudio();
  }
};

/**
 * Synthesizes a loud, realistic firework explosion.
 * @param panValue -1 (left) to 1 (right) for spatial positioning.
 */
export const playFireworkPop = (panValue: number = 0) => {
  const { ctx, output } = initAudio();
  const now = ctx.currentTime;
  
  const panner = ctx.createStereoPanner();
  panner.pan.setValueAtTime(panValue, now);
  panner.connect(output);

  // Randomize characteristics for unique explosions
  const intensity = 0.9 + Math.random() * 0.4; 
  const pitchShift = 0.8 + Math.random() * 0.4;

  // 1. THE SHOCKWAVE (Heavy Low-End Thump)
  const boomOsc = ctx.createOscillator();
  const boomGain = ctx.createGain();
  boomOsc.type = 'sine';
  boomOsc.frequency.setValueAtTime(55 * pitchShift, now);
  boomOsc.frequency.exponentialRampToValueAtTime(10 * pitchShift, now + 0.25);
  
  boomGain.gain.setValueAtTime(0, now);
  boomGain.gain.linearRampToValueAtTime(1.2 * intensity, now + 0.002);
  boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
  
  boomOsc.connect(boomGain);
  boomGain.connect(panner);
  boomOsc.start(now);
  boomOsc.stop(now + 0.7);

  // 2. THE CRACK (Sharp Initial Snap)
  const crackBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.02, ctx.sampleRate);
  const crackData = crackBuffer.getChannelData(0);
  for (let i = 0; i < crackBuffer.length; i++) {
    crackData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / crackBuffer.length, 2);
  }
  
  const crackSource = ctx.createBufferSource();
  const crackGain = ctx.createGain();
  const crackFilter = ctx.createBiquadFilter();
  
  crackSource.buffer = crackBuffer;
  crackFilter.type = 'highpass';
  crackFilter.frequency.setValueAtTime(4000, now);
  
  crackGain.gain.setValueAtTime(0.9 * intensity, now);
  crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
  
  crackSource.connect(crackFilter);
  crackFilter.connect(crackGain);
  crackGain.connect(panner);
  crackSource.start(now);

  // 3. THE BODY (Sustained Rumble)
  const blastBuffer = ctx.createBuffer(1, ctx.sampleRate * 2.5, ctx.sampleRate);
  const blastData = blastBuffer.getChannelData(0);
  for (let i = 0; i < blastBuffer.length; i++) {
    blastData[i] = Math.random() * 2 - 1;
  }
  
  const blastSource = ctx.createBufferSource();
  const blastGain = ctx.createGain();
  const blastFilter = ctx.createBiquadFilter();
  
  blastSource.buffer = blastBuffer;
  blastFilter.type = 'lowpass';
  blastFilter.frequency.setValueAtTime(1000 * pitchShift, now);
  blastFilter.frequency.exponentialRampToValueAtTime(100, now + 1.8);
  
  blastGain.gain.setValueAtTime(0, now);
  blastGain.gain.linearRampToValueAtTime(0.6 * intensity, now + 0.01);
  blastGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
  
  blastSource.connect(blastFilter);
  blastFilter.connect(blastGain);
  blastGain.connect(panner);
  blastSource.start(now);

  // 4. THE SIZZLE (Sparkling Trail)
  const sizzleSource = ctx.createBufferSource();
  const sizzleGain = ctx.createGain();
  const sizzleFilter = ctx.createBiquadFilter();
  
  sizzleSource.buffer = blastBuffer; 
  sizzleFilter.type = 'bandpass';
  sizzleFilter.frequency.setValueAtTime(6000, now);
  sizzleFilter.Q.setValueAtTime(8, now);
  
  sizzleGain.gain.setValueAtTime(0, now);
  sizzleGain.gain.linearRampToValueAtTime(0.2 * intensity, now + 0.15);
  sizzleGain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);
  
  sizzleSource.connect(sizzleFilter);
  sizzleFilter.connect(sizzleGain);
  sizzleGain.connect(panner);
  sizzleSource.start(now + 0.05);
};

/**
 * Synthesizes a celebratory chime/bell sound for the New Year moment.
 */
export const playNewYearChime = () => {
  const { ctx, output } = initAudio();
  const now = ctx.currentTime;

  const playNote = (freq: number, startTime: number, duration: number) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    
    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(0.4, startTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    osc.connect(g);
    g.connect(output);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  playNote(523.25, now, 2.5);
  playNote(659.25, now + 0.3, 2.5);
  playNote(783.99, now + 0.6, 2.5);
  playNote(1046.50, now + 0.9, 5.0);
};