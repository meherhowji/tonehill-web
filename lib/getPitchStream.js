
const NUM_INPUT_SAMPLES = 1024;
const MODEL_SAMPLE_RATE = 16000;
const NUM_INP_CHANNELS = 1;
const NUM_OUT_CHANNELS = 1;
const CONF_THRESHOLD = 0.9;

async function getPitchStream(model) {
  const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

  let context = new AudioContext({
    latencyHint: "playback",
  });
  await context.audioWorklet.addModule("/worklet/pitch-stream-processor.js");

  const micNode = context.createMediaStreamSource(mediaStream);

  const pitchStreamNode = new AudioWorkletNode(context, "pitch-stream");

  pitchStreamNode.port.onmessage = ({ data }) => {
    console.log(data);
  };

  micNode.connect(pitchStreamNode).connect(context.destination);
}

export { getPitchStream };
