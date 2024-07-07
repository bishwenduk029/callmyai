class AudioProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
      const inputData = inputs[0][0];
      this.port.postMessage(inputData);
      return true;
    }
  }
  
  registerProcessor('audio-processor', AudioProcessor);