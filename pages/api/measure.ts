import fetch from "node-fetch";
import { VercelRequest, VercelResponse } from "@vercel/node";
import measureCompressionEffect from "../../logic/measureCompressionEffect";

export default async (request: VercelRequest, response: VercelResponse) => {
  const { url: urlParam } = request.query;
  const url = decodeURIComponent(
    Array.isArray(urlParam) ? urlParam[0] : urlParam
  );

  let inputStream: NodeJS.ReadableStream;
  let contentEncoding: string;
  try {
    const urlResp = await fetch(url);
    contentEncoding = urlResp.headers.get("content-encoding");
    inputStream = urlResp.body;
  } catch (e) {
    console.error("Failed to fetch url", { e, url });
    response.status(500).json({
      error: "Failed to fetch URL",
    });
    return;
  }

  if (contentEncoding) {
    // content is already encoded
    const result = {
      url,
      contentEncoding,
    };
    console.log("Already compressed", { url, result });
    response.status(200).json(result);
  } else {
    try {
      console.log(`measuring effect of compression...`, { url });
      const result = await measureCompressionEffect(inputStream);
      console.log("Compression successful", {
        url,
        result,
      });
      response.status(200).json(result);
    } catch (e) {
      console.error("Compression failed", { e, url });
      response.status(500).json({
        error: "Compression failed",
      });
    }
  }
};
