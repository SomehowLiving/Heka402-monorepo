/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/nanoassert";
exports.ids = ["vendor-chunks/nanoassert"];
exports.modules = {

/***/ "(ssr)/../node_modules/nanoassert/index.js":
/*!*******************************************!*\
  !*** ../node_modules/nanoassert/index.js ***!
  \*******************************************/
/***/ ((module) => {

eval("module.exports = assert\n\nclass AssertionError extends Error {}\nAssertionError.prototype.name = 'AssertionError'\n\n/**\n * Minimal assert function\n * @param  {any} t Value to check if falsy\n * @param  {string=} m Optional assertion error message\n * @throws {AssertionError}\n */\nfunction assert (t, m) {\n  if (!t) {\n    var err = new AssertionError(m)\n    if (Error.captureStackTrace) Error.captureStackTrace(err, assert)\n    throw err\n  }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vbm9kZV9tb2R1bGVzL25hbm9hc3NlcnQvaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsWUFBWSxLQUFLO0FBQ2pCLFlBQVksU0FBUztBQUNyQixZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2hla2E0MDItZnJvbnRlbmQvLi4vbm9kZV9tb2R1bGVzL25hbm9hc3NlcnQvaW5kZXguanM/Yzk3YSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IGFzc2VydFxuXG5jbGFzcyBBc3NlcnRpb25FcnJvciBleHRlbmRzIEVycm9yIHt9XG5Bc3NlcnRpb25FcnJvci5wcm90b3R5cGUubmFtZSA9ICdBc3NlcnRpb25FcnJvcidcblxuLyoqXG4gKiBNaW5pbWFsIGFzc2VydCBmdW5jdGlvblxuICogQHBhcmFtICB7YW55fSB0IFZhbHVlIHRvIGNoZWNrIGlmIGZhbHN5XG4gKiBAcGFyYW0gIHtzdHJpbmc9fSBtIE9wdGlvbmFsIGFzc2VydGlvbiBlcnJvciBtZXNzYWdlXG4gKiBAdGhyb3dzIHtBc3NlcnRpb25FcnJvcn1cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0ICh0LCBtKSB7XG4gIGlmICghdCkge1xuICAgIHZhciBlcnIgPSBuZXcgQXNzZXJ0aW9uRXJyb3IobSlcbiAgICBpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKGVyciwgYXNzZXJ0KVxuICAgIHRocm93IGVyclxuICB9XG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/../node_modules/nanoassert/index.js\n");

/***/ })

};
;