declare module '*.worker.ts' {
  class WebWorker extends Worker {
    constructor();
  }

  export default WebWorker
}
