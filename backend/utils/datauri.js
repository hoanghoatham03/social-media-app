import DataURI from 'datauri/parser.js';
import path from 'path';

const dUri = new DataURI();

const getDataUri = (file) => {
  const ext = path.extname(file.originalname).toString();
  return dUri.format(ext, file.buffer).content;
};

export default getDataUri;

