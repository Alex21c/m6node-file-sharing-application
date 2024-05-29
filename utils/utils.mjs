/**
 * Generate custom error, helpful when passing this value to next()
 * @param {Number} statusCode valid http status code
 * @param {JSON} metadata you can provide json data, e.g. {sucess: true, message: "file uploaded"} or any custom data
 * @returns 
 */
export const throwNewError = (statusCode, metadata)=>{
  // console.log(metadata);
  const error = new Error("Custom Error");
  error.statusCode = statusCode,
  error.metadata = metadata;
  return error;
}

