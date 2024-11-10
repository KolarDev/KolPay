const AppError = require('../../../utils/appError');
const APIqueries = require('../../../utils/APIqueries');
const logger = require('../../../logger');

// General query function. This function can perform any query from any database collection
const getAllAndQuery = (Model) => {
  return async (req, res, next) => {
    const features = new APIqueries(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;

    if (!doc) return next(new AppError('No document found !', 404));

    // Winston custom logger
    logger.info(`Admin ${req.user.fullname} queried for ${Model}`);

    // RESPONSE
    res.status(200).json({
      status: 'success',
      result: doc.length,
      data: {
        data: doc,
      },
    });
  };
};

module.exports = {
  getAllAndQuery,
};
