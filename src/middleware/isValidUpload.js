const multer = require('multer');
const { uploadImage } = require('../helpers/uploadImage');
const logger = require('../../loggerConfigs');

const isValidUpload = fields => {
  return (req, res, next) => {
    uploadImage(fields)(req, res, err => {
      if (err) {
        if (err instanceof multer.MulterError) {
          let errorMessage = '';

          for (const field of fields) {
            if (err.fieldname === field.name) {
              errorMessage = `File size exceeded the limit (5KB) for the ${field.name}.`;
              break;
            }
          }

          if (!errorMessage) {
            errorMessage = `An error occurred while uploading the image. MulterError: ${JSON.stringify(
              err
            )}`;
          }

          logger.error(`isValidUpload Middleware-File Size: ${errorMessage}`);
          return res.status(500).json({
            ok: false,
            message: errorMessage,
          });
        }

        logger.error(`isValidUpload Middleware: ${err.message}`);
        return res.status(500).json({
          ok: false,
          message: `An error occurred while uploading the image. Error: ${JSON.stringify(
            err
          )}`,
        });
      }

      next();
    });
  };
};

module.exports = isValidUpload;
