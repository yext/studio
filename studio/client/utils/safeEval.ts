/**
 * Runs eval in a safer way.
 * Unfortunately, we cannot use the vm module from node, since it does not exist client-side.
 */
export default function safeEval(code: string, context: Record<string, unknown>) {
  const sandbox = { ...context }
  const resultKey = 'SAFE_EVAL_' + Math.floor(Math.random() * 1000000)
  sandbox[resultKey] = {}
  const clearContext = `
    (function(){
      Function = undefined;
      const keys = Object.getOwnPropertyNames(this).concat(['constructor']);
      keys.forEach((key) => {
        const item = this[key];
        if(!item || typeof item.constructor !== 'function') return;
        this[key].constructor = undefined;
      });
    })();
  `
  code = clearContext + resultKey + '=' + code
  if (context) {
    Object.keys(context).forEach(function(key) {
      sandbox[key] = context[key]
    })
  }
  vm.runInNewContext(code, sandbox)
  return sandbox[resultKey]
}
