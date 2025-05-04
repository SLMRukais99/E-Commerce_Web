// not Found

const notFound = (req, res, next) => { //route la yethum pilanta overaala aha route or url pilayaha iruthal ithuka varum
  const error = new Error(`Not Found : ${req.originalUrl}`);
  res.status(404);
  next(error);//Not Found : ${req.originalUrl} , in here request url print ahum ok
};

// Error Handler -- ithu vanthu ella error rayum receive pannum not ony 404 errors

const errorHandler = (err, req, res, next) => {   // ithukulla url sari but athukulla error throw ana than ithukulla varum, here route ok enbathal 200 thane staus code, athenal athenai 500 aha mathurom, but ullu ku error vanthal than inth error handler kka varum,
  const statuscode = res.statusCode == 200 ? 500 : res.statusCode;
  res.status(statuscode);
  res.json({
    status: "fail",
    message: err?.message,
    stack: err?.stack,
  });
};

module.exports = { errorHandler, notFound };
