export const rafThrottle = (callback: any) => {
  let requestId: any = null;

  let lastArgs: any;

  const later = (context: any) => () => {
    requestId = null;
    callback.apply(context, lastArgs);
  };

  const throttled = function(...args: any[]) {
    lastArgs = args;
    if (requestId === null) {
      // @ts-ignore
      requestId = requestAnimationFrame(later(this));
    }
  };

  throttled.cancel = () => {
    cancelAnimationFrame(requestId);
    requestId = null;
  };

  return throttled;
};
