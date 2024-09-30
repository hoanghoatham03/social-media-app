import multer from 'multer';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    }, 
    filename: (req, file, cb) => {
        cb(null, req.body.name);
    },
});

export const upload = multer({ storage: storage });