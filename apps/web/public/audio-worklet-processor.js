class PCMProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0][0];
    if (input && input.length > 0) {
      this.port.postMessage({ samples: new Float32Array(input) });
    }
    return true;
  }
}
registerProcessor("pcm-processor", PCMProcessor);
