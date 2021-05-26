import zlib from "zlib";
import { Writable, Readable } from "stream";
import MeasureStream from "./MeasureStream";

function createCompressionStreams<
  T extends Writable & { bytesWritten?: number }
>(
  type: string,
  maxLevel: number,
  createCompressionStream: (level: number) => T
) {
  // create a compression stream for every level, up to max level
  // (-1 is technically the minimum level for GZIP and deflate, but
  // it is just an alias so we'll ignore it)
  return [...Array(maxLevel + 1).keys()].map((level) => {
    const stream = createCompressionStream(level);
    const measureStream = new MeasureStream();
    stream.pipe(measureStream);
    return {
      type,
      level,
      stream,
      measureStream,
    };
  });
}

export default async function measureCompressionEffect(
  inputStream: NodeJS.ReadableStream | Readable
) {
  // Set up compression streams for brotli, gzip and deflate
  const allStreams = [
    ...createCompressionStreams(
      "brotli",
      zlib.constants.BROTLI_MAX_QUALITY - 3,
      (level) =>
        zlib.createBrotliCompress({
          params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: level,
          },
        })
    ),
    ...createCompressionStreams("gzip", zlib.constants.Z_MAX_LEVEL, (level) =>
      zlib.createGzip({
        level,
      })
    ),
    ...createCompressionStreams(
      "deflate",
      zlib.constants.Z_MAX_LEVEL,
      (level) => zlib.createDeflate({ level })
    ),
  ];

  // Make sure we don't get any warnings about exceeding max listeners
  // (assuming there are no existing listeners)
  inputStream.setMaxListeners(allStreams.length);

  // pipe the input stream to all of the compression streams
  allStreams.map(({ stream }) => inputStream.pipe(stream));

  // wait for all of the compression streams to finish
  await Promise.all(
    allStreams.map(
      ({ type, level, stream }) =>
        new Promise<void>((resolve, reject) => {
          stream.on("close", () => {
            console.log(`Got close event for ${type}-${level}`);
            resolve();
          });
          stream.on("error", (err) => {
            console.error(`Got error event for ${type}-${level}`, err);
            reject(err);
          });
        })
    )
  );

  return {
    // just pick any counter to get input bytes from
    raw: allStreams[0].stream.bytesWritten,
    // render all results, grouped by compression type
    ...allStreams.reduce((acc, cur) => {
      acc[cur.type] = acc[cur.type] || {};
      acc[cur.type][cur.level] = cur.measureStream.bytesWritten;
      return acc;
    }, {}),
  };
}
