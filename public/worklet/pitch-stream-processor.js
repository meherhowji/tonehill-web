import * as ts from ''
class PitchStream extends AudioWorkletProcessor {
  constructor(options) {
    importScripts('./tf.min.js')
    super();
    console.log(options)
    // this.tf= options[0]
    this.model = options.parametersOptions.model
  }

  getPitchHz(modelPitch) {
    const PT_OFFSET = 25.58;
    const PT_SLOPE = 63.07;
    const fmin = 10.0;
    const bins_per_octave = 12.0;
    const cqt_bin = modelPitch * PT_SLOPE + PT_OFFSET;
    return fmin * Math.pow(2.0, (1.0 * cqt_bin) / bins_per_octave);
  }

  process(inputs, outputs) {
    // This example only handles mono channel.
    const inputChannelData = inputs[0][0];

    const input = tf.reshape(tf.tensor(inputChannelData), [NUM_INPUT_SAMPLES]);
    const output = this.model.execute({ input_audio_samples: input });
    const uncertainties = output[0].dataSync();
    const pitches = output[1].dataSync();

    for (let i = 0; i < pitches.length; ++i) {
      let confidence = 1.0 - uncertainties[i];
      if (confidence < CONF_THRESHOLD) {
        continue;
      }
      this.port.postMessage(getPitchHz(pitches[i]));
    }

    return true;
  }
}

registerProcessor("pitch-stream", PitchStream);
