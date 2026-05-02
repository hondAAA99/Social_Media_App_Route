import multer from 'multer';
import multerStorageEnum from '../enum/multerStorageType.js';
import { tmpdir } from 'node:os';
export function fileUpload({ fileType, storageType = multerStorageEnum.memory }) {
    const storage = (storageType == multerStorageEnum.memory) ? multer.memoryStorage() : multer.diskStorage({
        destination: tmpdir(),
        filename: (req, file, cb) => {
            const prefix = Math.random();
            cb(null, prefix);
        }
    });
    const result = multer({ storage, fileFilter: function fileFilter(req, file, cb) {
            if (fileType.includes(file.mimetype))
                cb(null, true);
            cb(null, false);
        } });
    return result;
}
