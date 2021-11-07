import * as brotliPromise from "brotli-wasm";
import pako from "pako";

addEventListener("message", async (event) => {
  const brotli = await brotliPromise;
  const { body } = await fetch(event.data);
  let readBody = new Uint8Array();
  const bodyReader = body.getReader();
  for (
    let chunk = await bodyReader.read();
    !chunk.done;
    chunk = await bodyReader.read()
  ) {
    readBody = new Uint8Array([...readBody, ...chunk.value]);
  }

  const result = { raw: readBody.length, brotli: {}, gzip: {}, deflate: {} };
  for (let quality = 0; quality <= 12; quality++) {
    const numBytes = brotli.compress(readBody, { quality }).length;
    result.brotli[quality] = {
      numBytes: numBytes,
      percentOfRaw: (numBytes / readBody.length).toFixed(2),
    };

    if (quality <= 9) {
      const numGzipBytes = pako.gzip(readBody, { level: quality }).length;
      result.gzip[quality] = {
        numBytes: numGzipBytes,
        percentOfRaw: (numGzipBytes / readBody.length).toFixed(2),
      };

      const deflateBytes = pako.deflate(readBody, { level: quality }).length;
      result.deflate[quality] = {
        numBytes: deflateBytes,
        percentOfRaw: (deflateBytes / readBody.length).toFixed(2),
      };
    }
  }
  console.log("Result:", result);
  postMessage(result);
});
