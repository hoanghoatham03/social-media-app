import DataUriParser from "datauri/parser.js";
import path from "path";
import sharp from "sharp";

const getDataUri = async (file) => {
  const parser = new DataUriParser();

  // Check if file has buffer and originalname
  if (!file || !file.buffer || !file.originalname) {
    throw new Error("Invalid file data");
  }

  //compress the image
  const compressedBuffer = await sharp(file.buffer)
    .resize({ width: 800, height: 800, fit: "inside" })
    .toFormat("webp", { quality: 80 })
    .toBuffer();

  //get the extension name
  const extName = path.extname(file.originalname).toString();

  //format the datauri
  const dataUri = parser.format(extName, compressedBuffer).content;

  return dataUri;
};

export default getDataUri;
