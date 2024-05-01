export const errorHandler = (err, req, res, next) => {
    return res.status(err.statusCode || 500).send({
        success: false,
        message: err.message || "Something went wrong",
        error: err.error || [],
        stack: err.stack || ""
    });
};