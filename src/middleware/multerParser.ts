
import multer from "multer"
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },

  filename: function (req: any, file: any, cb: any) {
    cb(null, `${file.fieldname}_${Date.now()}_${file.originalname}`)
  }
});
const fileFilter = (req: any, file: any, cb: any) => {
  // commenting mime check for bug fix for now
  // if(file.fieldname == 'avatar') {
  //   for profile added validation on type.
  //   if (file.mimetype === "image/jpg" || file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
  //     cb(null, true);
  //   } else {
  //     cb(new Error("Image uploaded is not of type jpg/jpeg or png"), false);
  //   }
  // } else {
  //   cb(null, true);
  // }
  cb(null, true);
}
const upload = multer({ storage: storage, fileFilter: fileFilter });


export const uploadFile = function (item) {
  if (item) {
    return upload.single(item);
  }
};

/**
 * upload files under different keys and different count
 * field array is like
 * [{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 8 }]
 * @param items
 * @private
 */
export const uploadMultiFiles = function (items) {
  return upload.fields(items);
};

