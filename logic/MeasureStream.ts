import { Writable, WritableOptions } from "stream";

export default class MeasureStream extends Writable {
  private _bytesWritten = 0;

  constructor(opts?: WritableOptions) {
    super(opts);
  }

  get bytesWritten() {
    return this._bytesWritten;
  }

  _write(
    chunk: { length: number },
    _encoding: BufferEncoding,
    cb: (error?: Error) => void
  ) {
    this._bytesWritten += chunk.length;
    this.emit("progress");
    cb();
  }
}
