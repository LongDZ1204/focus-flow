import { useStore } from '../store/useStore';

export function playTingSound() {
  if (useStore.getState().isMuted) return;
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
  osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1.0); // Slide down
  
  gain.gain.setValueAtTime(0.5, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start();
  osc.stop(ctx.currentTime + 1.0);
}

export function playSuccessSound() {
  if (useStore.getState().isMuted) return;
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  
  const playNote = (freq: number, startTime: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
    
    gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration);
  };
  
  playNote(523.25, 0, 0.4); // C5
  playNote(659.25, 0.15, 0.4); // E5
  playNote(783.99, 0.3, 0.6); // G5 
}

let ambientCtx: AudioContext | null = null;
let noiseNode: AudioBufferSourceNode | null = null;
let filterNode: BiquadFilterNode | null = null;
let masterGain: GainNode | null = null;
let lfoNode: OscillatorNode | null = null;

export function startFocusMusic() {
  if (useStore.getState().isMuted) {
    stopFocusMusic();
    return;
  }

  if (!ambientCtx) {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    ambientCtx = new AudioContext();
  }

  if (ambientCtx.state === 'suspended') {
    ambientCtx.resume();
  }

  if (noiseNode) return; // Đang chạy rồi

  const bufferSize = ambientCtx.sampleRate * 2;
  const buffer = ambientCtx.createBuffer(1, bufferSize, ambientCtx.sampleRate);
  const output = buffer.getChannelData(0);

  // Tạo Brown Noise (Siêu trầm, tập trung cao)
  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    output[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = output[i];
    output[i] *= 3.5; 
  }

  noiseNode = ambientCtx.createBufferSource();
  noiseNode.buffer = buffer;
  noiseNode.loop = true;

  filterNode = ambientCtx.createBiquadFilter();
  filterNode.type = 'lowpass';
  filterNode.frequency.value = 350; // Giới hạn tần số tạo tiếng ù nhẹ

  masterGain = ambientCtx.createGain();
  masterGain.gain.value = 0; // Bắt đầu ở âm lượng 0
  masterGain.gain.linearRampToValueAtTime(0.8, ambientCtx.currentTime + 3); // Fade in mượt mà trong 3s

  // LFO: Tạo nhịp điệu giống tiếng sóng biển vỗ chậm
  lfoNode = ambientCtx.createOscillator();
  lfoNode.type = 'sine';
  lfoNode.frequency.value = 0.1; // Mỗi chu kỳ 10 giây (rất chậm)

  const lfoGain = ambientCtx.createGain();
  lfoGain.gain.value = 150; // Sóng dập dềnh dao động 150Hz

  lfoNode.connect(lfoGain);
  lfoGain.connect(filterNode.frequency);

  noiseNode.connect(filterNode);
  filterNode.connect(masterGain);
  masterGain.connect(ambientCtx.destination);

  noiseNode.start();
  lfoNode.start();
}

export function stopFocusMusic() {
  if (masterGain && ambientCtx) {
    // Fade out mượt mà trong 1.5s
    masterGain.gain.cancelScheduledValues(ambientCtx.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, ambientCtx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.01, ambientCtx.currentTime + 1.5);
    
    setTimeout(() => {
      if (noiseNode) {
        noiseNode.stop();
        noiseNode.disconnect();
        noiseNode = null;
      }
      if (lfoNode) {
        lfoNode.stop();
        lfoNode.disconnect();
        lfoNode = null;
      }
      if (filterNode) {
        filterNode.disconnect();
        filterNode = null;
      }
    }, 1500);
  }
}
