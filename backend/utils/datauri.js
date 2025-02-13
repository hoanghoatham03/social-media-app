import DataUriParser from "datauri/parser.js";
import path from "path";

const getDataUri = (file) => {
  const parser = new DataUriParser();

  // Check if file has buffer and originalname
  if (!file || !file.buffer || !file.originalname) {
    throw new Error("Invalid file data");
  }

  //get the extension name
  const extName = path.extname(file.originalname).toString();

  //format the datauri
  const dataUri = parser.format(extName, file.buffer).content;

  return dataUri;
};

export default getDataUri;
