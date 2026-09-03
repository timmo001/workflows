var __defProp = Object.defineProperty;
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};
// node_modules/effect/dist/Context.js
var exports_Context = {};
__export(exports_Context, {
  Reference: () => Reference,
  Service: () => Service,
  ServiceTypeId: () => ServiceTypeId,
  add: () => add,
  addOrOmit: () => addOrOmit,
  addUnsafe: () => addUnsafe,
  empty: () => empty,
  get: () => get,
  getOption: () => getOption,
  getOrElse: () => getOrElse2,
  getOrUndefined: () => getOrUndefined2,
  getOrUndefinedUnsafe: () => getOrUndefinedUnsafe,
  getUnsafe: () => getUnsafe,
  hasSameCache: () => hasSameCache,
  isContext: () => isContext,
  isKey: () => isKey,
  isReference: () => isReference,
  make: () => make5,
  makeUnsafe: () => makeUnsafe,
  merge: () => merge,
  mergeAll: () => mergeAll,
  omit: () => omit,
  pick: () => pick
});

// node_modules/effect/dist/Pipeable.js
var pipeArguments = (self, args) => {
  switch (args.length) {
    case 0:
      return self;
    case 1:
      return args[0](self);
    case 2:
      return args[1](args[0](self));
    case 3:
      return args[2](args[1](args[0](self)));
    case 4:
      return args[3](args[2](args[1](args[0](self))));
    case 5:
      return args[4](args[3](args[2](args[1](args[0](self)))));
    case 6:
      return args[5](args[4](args[3](args[2](args[1](args[0](self))))));
    case 7:
      return args[6](args[5](args[4](args[3](args[2](args[1](args[0](self)))))));
    case 8:
      return args[7](args[6](args[5](args[4](args[3](args[2](args[1](args[0](self))))))));
    case 9:
      return args[8](args[7](args[6](args[5](args[4](args[3](args[2](args[1](args[0](self)))))))));
    default: {
      let ret = self;
      for (let i = 0, len = args.length;i < len; i++) {
        ret = args[i](ret);
      }
      return ret;
    }
  }
};
var Prototype = {
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var Class = /* @__PURE__ */ function() {
  function PipeableBase() {}
  PipeableBase.prototype = Prototype;
  return PipeableBase;
}();

// node_modules/effect/dist/Function.js
var dual = function(arity, body) {
  if (typeof arity === "function") {
    return function() {
      return arity(arguments) ? body.apply(this, arguments) : (self) => body(self, ...arguments);
    };
  }
  switch (arity) {
    case 0:
    case 1:
      throw new RangeError(`Invalid arity ${arity}`);
    case 2:
      return function(a, b) {
        if (arguments.length >= 2) {
          return body(a, b);
        }
        return function(self) {
          return body(self, a);
        };
      };
    case 3:
      return function(a, b, c) {
        if (arguments.length >= 3) {
          return body(a, b, c);
        }
        return function(self) {
          return body(self, a, b);
        };
      };
    default:
      return function() {
        if (arguments.length >= arity) {
          return body.apply(this, arguments);
        }
        const args = arguments;
        return function(self) {
          return body(self, ...args);
        };
      };
  }
};
var identity = (a) => a;
var constant = (value) => () => value;
var constTrue = /* @__PURE__ */ constant(true);
var constFalse = /* @__PURE__ */ constant(false);
var constNull = /* @__PURE__ */ constant(null);
var constUndefined = /* @__PURE__ */ constant(undefined);
var constVoid = constUndefined;
function pipe(a, ...args) {
  return pipeArguments(a, args);
}
function flow(ab, bc, cd, de, ef, fg, gh, hi, ij) {
  switch (arguments.length) {
    case 1:
      return ab;
    case 2:
      return function() {
        return bc(ab.apply(this, arguments));
      };
    case 3:
      return function() {
        return cd(bc(ab.apply(this, arguments)));
      };
    case 4:
      return function() {
        return de(cd(bc(ab.apply(this, arguments))));
      };
    case 5:
      return function() {
        return ef(de(cd(bc(ab.apply(this, arguments)))));
      };
    case 6:
      return function() {
        return fg(ef(de(cd(bc(ab.apply(this, arguments))))));
      };
    case 7:
      return function() {
        return gh(fg(ef(de(cd(bc(ab.apply(this, arguments)))))));
      };
    case 8:
      return function() {
        return hi(gh(fg(ef(de(cd(bc(ab.apply(this, arguments))))))));
      };
    case 9:
      return function() {
        return ij(hi(gh(fg(ef(de(cd(bc(ab.apply(this, arguments)))))))));
      };
  }
  return;
}
function memoize(f) {
  const cache = new WeakMap;
  return (a) => {
    const cached = cache.get(a);
    if (cached !== undefined)
      return cached;
    const result = f(a);
    cache.set(a, result);
    return result;
  };
}
function memoizeIdempotent(f) {
  const cache = new WeakMap;
  return (a) => {
    const cached = cache.get(a);
    if (cached !== undefined)
      return cached;
    const result = f(a);
    cache.set(a, result);
    cache.set(result, result);
    return result;
  };
}

// node_modules/effect/dist/internal/equal.js
var getAllObjectKeys = (obj) => {
  const keys = new Set(Reflect.ownKeys(obj));
  if (obj.constructor === Object)
    return keys;
  if (obj instanceof Error) {
    keys.delete("stack");
  }
  const proto = Object.getPrototypeOf(obj);
  let current = proto;
  while (current !== null && current !== Object.prototype) {
    const ownKeys = Reflect.ownKeys(current);
    for (let i = 0;i < ownKeys.length; i++) {
      keys.add(ownKeys[i]);
    }
    current = Object.getPrototypeOf(current);
  }
  if (keys.has("constructor") && typeof obj.constructor === "function" && proto === obj.constructor.prototype) {
    keys.delete("constructor");
  }
  return keys;
};
var byReferenceInstances = /* @__PURE__ */ new WeakSet;

// node_modules/effect/dist/Predicate.js
function isString(input) {
  return typeof input === "string";
}
function isNumber(input) {
  return typeof input === "number";
}
function isBoolean(input) {
  return typeof input === "boolean";
}
function isBigInt(input) {
  return typeof input === "bigint";
}
function isSymbol(input) {
  return typeof input === "symbol";
}
function isPropertyKey(u) {
  return isString(u) || isNumber(u) || isSymbol(u);
}
function isFunction(input) {
  return typeof input === "function";
}
function isUndefined(input) {
  return input === undefined;
}
function isNotUndefined(input) {
  return input !== undefined;
}
function isNotNull(input) {
  return input !== null;
}
function isNullish(input) {
  return input === null || input === undefined;
}
function isNotNullish(input) {
  return input != null;
}
function isNever(_) {
  return false;
}
function isUnknown(_) {
  return true;
}
function isObject(input) {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}
function isObjectKeyword(input) {
  return typeof input === "object" && input !== null || isFunction(input);
}
var hasProperty = /* @__PURE__ */ dual(2, (self, property) => isObjectKeyword(self) && (property in self));
var isTagged = /* @__PURE__ */ dual(2, (self, tag) => hasProperty(self, "_tag") && self["_tag"] === tag);
function isError(input) {
  return input instanceof Error;
}
function isIterable(input) {
  return hasProperty(input, Symbol.iterator) || isString(input);
}

// node_modules/effect/dist/Hash.js
var symbol = "~effect/interfaces/Hash";
var hash = (self) => {
  switch (typeof self) {
    case "number":
      return number(self);
    case "bigint":
      return string(self.toString(10));
    case "boolean":
      return string(String(self));
    case "symbol":
      return string(String(self));
    case "string":
      return string(self);
    case "undefined":
      return string("undefined");
    case "function":
    case "object": {
      if (self === null) {
        return string("null");
      } else if (self instanceof Date) {
        if (Number.isNaN(self.getTime())) {
          return string("Invalid Date");
        }
        return string(self.toISOString());
      } else if (self instanceof RegExp) {
        return string(self.toString());
      } else {
        if (byReferenceInstances.has(self)) {
          return random(self);
        }
        if (hashCache.has(self)) {
          return hashCache.get(self);
        }
        const h = withVisitedTracking(self, () => {
          if (isHash(self)) {
            return self[symbol]();
          } else if (typeof self === "function") {
            return random(self);
          } else if (self instanceof DataView) {
            return array(new Uint8Array(self.buffer, self.byteOffset, self.byteLength));
          } else if (Array.isArray(self) || ArrayBuffer.isView(self)) {
            return array(self);
          } else if (self instanceof Map) {
            return hashMap(self);
          } else if (self instanceof Set) {
            return hashSet(self);
          }
          return structure(self);
        });
        hashCache.set(self, h);
        return h;
      }
    }
    default:
      throw new Error(`BUG: unhandled typeof ${typeof self} - please report an issue at https://github.com/Effect-TS/effect/issues`);
  }
};
var random = (self) => {
  if (!randomHashCache.has(self)) {
    randomHashCache.set(self, number(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)));
  }
  return randomHashCache.get(self);
};
var combine = /* @__PURE__ */ dual(2, (self, b) => self * 53 ^ b);
var optimize = (n) => n & 3221225471 | n >>> 1 & 1073741824;
var isHash = (u) => hasProperty(u, symbol);
var number = (n) => {
  if (n !== n) {
    return string("NaN");
  }
  if (n === Infinity) {
    return string("Infinity");
  }
  if (n === -Infinity) {
    return string("-Infinity");
  }
  let h = n | 0;
  if (h !== n) {
    h ^= n * 4294967295;
  }
  while (n > 4294967295) {
    h ^= n /= 4294967295;
  }
  return optimize(h);
};
var string = (str) => {
  let h = 5381, i = str.length;
  while (i) {
    h = h * 33 ^ str.charCodeAt(--i);
  }
  return optimize(h);
};
var structureKeys = (o, keys) => {
  let h = 12289;
  for (const key of keys) {
    h ^= combine(hash(key), hash(o[key]));
  }
  return optimize(h);
};
var structure = (o) => structureKeys(o, getAllObjectKeys(o));
var iterableWith = (seed, f) => (iter) => {
  let h = seed;
  for (const element of iter) {
    h ^= f(element);
  }
  return optimize(h);
};
var array = /* @__PURE__ */ iterableWith(6151, hash);
var hashMap = /* @__PURE__ */ iterableWith(/* @__PURE__ */ string("Map"), ([k, v]) => combine(hash(k), hash(v)));
var hashSet = /* @__PURE__ */ iterableWith(/* @__PURE__ */ string("Set"), hash);
var randomHashCache = /* @__PURE__ */ new WeakMap;
var hashCache = /* @__PURE__ */ new WeakMap;
var visitedObjects = /* @__PURE__ */ new WeakSet;
function withVisitedTracking(obj, fn) {
  if (visitedObjects.has(obj)) {
    return string("[Circular]");
  }
  visitedObjects.add(obj);
  const result = fn();
  visitedObjects.delete(obj);
  return result;
}

// node_modules/effect/dist/Equal.js
var symbol2 = "~effect/interfaces/Equal";
function equals() {
  if (arguments.length === 1) {
    return (self) => compareBoth(self, arguments[0]);
  }
  return compareBoth(arguments[0], arguments[1]);
}
function compareBoth(self, that) {
  if (self === that)
    return true;
  if (self == null || that == null)
    return false;
  const selfType = typeof self;
  if (selfType !== typeof that) {
    return false;
  }
  if (selfType === "number" && self !== self && that !== that) {
    return true;
  }
  if (selfType !== "object" && selfType !== "function") {
    return false;
  }
  if (byReferenceInstances.has(self) || byReferenceInstances.has(that)) {
    return false;
  }
  return withCache(self, that, compareObjects);
}
function withVisitedTracking2(self, that, fn) {
  const hasLeft = visitedLeft.has(self);
  const hasRight = visitedRight.has(that);
  if (hasLeft && hasRight) {
    return true;
  }
  if (hasLeft || hasRight) {
    return false;
  }
  visitedLeft.add(self);
  visitedRight.add(that);
  const result = fn();
  visitedLeft.delete(self);
  visitedRight.delete(that);
  return result;
}
var visitedLeft = /* @__PURE__ */ new WeakSet;
var visitedRight = /* @__PURE__ */ new WeakSet;
function compareObjects(self, that) {
  if (hash(self) !== hash(that)) {
    return false;
  } else if (self instanceof Date) {
    if (!(that instanceof Date))
      return false;
    const selfTime = self.getTime();
    const thatTime = that.getTime();
    return selfTime === thatTime || Number.isNaN(selfTime) && Number.isNaN(thatTime);
  } else if (self instanceof RegExp) {
    if (!(that instanceof RegExp))
      return false;
    return self.toString() === that.toString();
  }
  const selfIsEqual = isEqual(self);
  const thatIsEqual = isEqual(that);
  if (selfIsEqual !== thatIsEqual)
    return false;
  const bothEquals = selfIsEqual && thatIsEqual;
  if (typeof self === "function" && !bothEquals) {
    return false;
  }
  return withVisitedTracking2(self, that, () => {
    if (bothEquals) {
      return self[symbol2](that);
    } else if (Array.isArray(self)) {
      if (!Array.isArray(that) || self.length !== that.length) {
        return false;
      }
      return compareArrays(self, that);
    } else if (ArrayBuffer.isView(self)) {
      const selfIsDataView = self instanceof DataView;
      if (!ArrayBuffer.isView(that) || self.byteLength !== that.byteLength || selfIsDataView !== that instanceof DataView) {
        return false;
      }
      if (selfIsDataView) {
        const thatDataView = that;
        return compareTypedArrays(new Uint8Array(self.buffer, self.byteOffset, self.byteLength), new Uint8Array(thatDataView.buffer, thatDataView.byteOffset, thatDataView.byteLength));
      }
      return compareTypedArrays(self, that);
    } else if (self instanceof Map) {
      if (!(that instanceof Map) || self.size !== that.size) {
        return false;
      }
      return compareMaps(self, that);
    } else if (self instanceof Set) {
      if (!(that instanceof Set) || self.size !== that.size) {
        return false;
      }
      return compareSets(self, that);
    }
    return compareRecords(self, that);
  });
}
function withCache(self, that, f) {
  let selfMap = equalityCache.get(self);
  if (!selfMap) {
    selfMap = new WeakMap;
    equalityCache.set(self, selfMap);
  } else if (selfMap.has(that)) {
    return selfMap.get(that);
  }
  const result = f(self, that);
  selfMap.set(that, result);
  let thatMap = equalityCache.get(that);
  if (!thatMap) {
    thatMap = new WeakMap;
    equalityCache.set(that, thatMap);
  }
  thatMap.set(self, result);
  return result;
}
var equalityCache = /* @__PURE__ */ new WeakMap;
function compareArrays(self, that) {
  for (let i = 0;i < self.length; i++) {
    if (!compareBoth(self[i], that[i])) {
      return false;
    }
  }
  return true;
}
function compareTypedArrays(self, that) {
  if (self.length !== that.length) {
    return false;
  }
  for (let i = 0;i < self.length; i++) {
    if (self[i] !== that[i]) {
      return false;
    }
  }
  return true;
}
function compareRecords(self, that) {
  const selfKeys = getAllObjectKeys(self);
  const thatKeys = getAllObjectKeys(that);
  if (selfKeys.size !== thatKeys.size) {
    return false;
  }
  for (const key of selfKeys) {
    if (!thatKeys.has(key) || !compareBoth(self[key], that[key])) {
      return false;
    }
  }
  return true;
}
function makeCompareMap(keyEquivalence, valueEquivalence) {
  return function compareMaps(self, that) {
    const thatEntries = Array.from(that);
    for (const [selfKey, selfValue] of self) {
      let found = false;
      for (let i = 0;i < thatEntries.length; i++) {
        const [thatKey, thatValue] = thatEntries[i];
        if (keyEquivalence(selfKey, thatKey) && valueEquivalence(selfValue, thatValue)) {
          thatEntries[i] = thatEntries[thatEntries.length - 1];
          thatEntries.pop();
          found = true;
          break;
        }
      }
      if (!found) {
        return false;
      }
    }
    return true;
  };
}
var compareMaps = /* @__PURE__ */ makeCompareMap(compareBoth, compareBoth);
function makeCompareSet(equivalence) {
  return function compareSets(self, that) {
    const thatValues = Array.from(that);
    for (const selfValue of self) {
      let found = false;
      for (let i = 0;i < thatValues.length; i++) {
        const thatValue = thatValues[i];
        if (equivalence(selfValue, thatValue)) {
          thatValues[i] = thatValues[thatValues.length - 1];
          thatValues.pop();
          found = true;
          break;
        }
      }
      if (!found) {
        return false;
      }
    }
    return true;
  };
}
var compareSets = /* @__PURE__ */ makeCompareSet(compareBoth);
var isEqual = (u) => hasProperty(u, symbol2);
var byReferenceUnsafe = (obj) => {
  byReferenceInstances.add(obj);
  return obj;
};

// node_modules/effect/dist/Redactable.js
var symbolRedactable = /* @__PURE__ */ Symbol.for("~effect/Redactable");
var isRedactable = (u) => hasProperty(u, symbolRedactable);
function redact(u) {
  if (isRedactable(u))
    return getRedacted(u);
  return u;
}
function getRedacted(redactable) {
  return redactable[symbolRedactable](globalThis[currentFiberTypeId]?.context ?? emptyContext);
}
var currentFiberTypeId = "~effect/Fiber/currentFiber";
var emptyMap = /* @__PURE__ */ new Map;
var emptyContext = {
  "~effect/Context": {},
  base: emptyMap,
  depth: 0,
  mapUnsafe: emptyMap,
  pipe() {
    return pipeArguments(this, arguments);
  }
};

// node_modules/effect/dist/Formatter.js
function format(input, options) {
  const space = options?.space ?? 0;
  const ancestors = new WeakSet;
  const gap = !space ? "" : typeof space === "number" ? " ".repeat(space) : space;
  const ind = (d) => gap.repeat(d);
  const wrap = (v, body) => {
    const ctor = v?.constructor;
    return ctor && ctor !== Object.prototype.constructor && ctor.name ? `${ctor.name}(${body})` : body;
  };
  const ownKeys = (o) => {
    try {
      return Reflect.ownKeys(o);
    } catch {
      return ["[ownKeys threw]"];
    }
  };
  function recur(v, d = 0) {
    if (typeof v === "string")
      return JSON.stringify(v);
    if (typeof v === "number" || v == null || typeof v === "boolean" || typeof v === "symbol")
      return String(v);
    if (typeof v === "bigint")
      return String(v) + "n";
    if (typeof v === "object" || typeof v === "function") {
      if (ancestors.has(v))
        return CIRCULAR;
      ancestors.add(v);
      let output;
      if (symbolRedactable in v) {
        output = recur(getRedacted(v), d);
      } else if (Array.isArray(v)) {
        output = !gap || v.length <= 1 ? `[${v.map((x) => recur(x, d)).join(",")}]` : `[
${ind(d + 1)}${v.map((x) => recur(x, d + 1)).join(`,
` + ind(d + 1))}
${ind(d)}]`;
      } else if (v instanceof Date) {
        output = formatDate(v);
      } else if (!options?.ignoreToString && hasProperty(v, "toString") && typeof v["toString"] === "function" && v["toString"] !== Object.prototype.toString && v["toString"] !== Array.prototype.toString) {
        const s = safeToString(v);
        output = v instanceof Error && v.cause ? `${s} (cause: ${recur(v.cause, d)})` : s;
      } else if (Symbol.iterator in v) {
        output = `${v.constructor.name}(${recur(Array.from(v), d)})`;
      } else {
        const keys = ownKeys(v);
        if (!gap || keys.length <= 1) {
          const body = `{${keys.map((k) => `${formatPropertyKey(k)}:${recur(v[k], d)}`).join(",")}}`;
          output = wrap(v, body);
        } else {
          const body = `{
${keys.map((k) => `${ind(d + 1)}${formatPropertyKey(k)}: ${recur(v[k], d + 1)}`).join(`,
`)}
${ind(d)}}`;
          output = wrap(v, body);
        }
      }
      ancestors.delete(v);
      return output;
    }
    return String(v);
  }
  return recur(input, 0);
}
var CIRCULAR = "[Circular]";
function formatPropertyKey(name) {
  return typeof name === "string" ? JSON.stringify(name) : String(name);
}
function formatPath(path) {
  return path.map((key) => `[${formatPropertyKey(key)}]`).join("");
}
function formatDate(date) {
  try {
    return date.toISOString();
  } catch {
    return "Invalid Date";
  }
}
function safeToString(input) {
  try {
    const s = input.toString();
    return typeof s === "string" ? s : String(s);
  } catch {
    return "[toString threw]";
  }
}
function formatJson(input, options) {
  const ancestors = [];
  return JSON.stringify(input, function(key, value) {
    const original = Object.getOwnPropertyDescriptor(this, key)?.value;
    const redacted = hasProperty(original, symbolRedactable) ? redact(original) : redact(value);
    if (typeof redacted === "bigint") {
      return format(redacted);
    }
    if (typeof redacted !== "object" || redacted === null) {
      return redacted;
    }
    while (ancestors.length > 0 && ancestors[ancestors.length - 1] !== this) {
      ancestors.pop();
    }
    if (ancestors.includes(redacted)) {
      return;
    }
    ancestors.push(redacted);
    return redacted;
  }, options?.space) ?? "null";
}

// node_modules/effect/dist/Inspectable.js
var NodeInspectSymbol = /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom");
var toJson = (input) => {
  try {
    input = redact(input);
    if (hasProperty(input, "toJSON") && isFunction(input["toJSON"]) && input["toJSON"].length === 0) {
      return input.toJSON();
    } else if (Array.isArray(input)) {
      return input.map(toJson);
    }
    return input;
  } catch {
    return "[toJSON threw]";
  }
};
var toStringUnknown = (u, whitespace = 2) => {
  if (typeof u === "string") {
    return u;
  }
  try {
    return typeof u === "object" ? formatJson(u, {
      space: whitespace
    }) : format(u, {
      space: whitespace
    });
  } catch {
    return String(u);
  }
};
var BaseProto = {
  toJSON() {
    return toJson(this);
  },
  [NodeInspectSymbol]() {
    return this.toJSON();
  },
  toString() {
    return format(this.toJSON());
  }
};

class Class2 {
  [NodeInspectSymbol]() {
    return this.toJSON();
  }
  toString() {
    return format(this.toJSON());
  }
}

// node_modules/effect/dist/Utils.js
class SingleShotGen {
  called = false;
  self;
  constructor(self) {
    this.self = self;
  }
  next(a) {
    return this.called ? {
      value: a,
      done: true
    } : (this.called = true, {
      value: this.self,
      done: false
    });
  }
  [Symbol.iterator]() {
    return new SingleShotGen(this.self);
  }
}
var pickInternalCall = () => {
  const InternalTypeId = "~effect/Utils/internal";
  const standard = {
    [InternalTypeId]: (body) => {
      return body();
    }
  };
  const forced = {
    [InternalTypeId]: (body) => {
      try {
        return body();
      } finally {}
    }
  };
  const isNotOptimizedAway = standard[InternalTypeId](() => new Error().stack)?.includes(InternalTypeId) === true;
  return isNotOptimizedAway ? standard[InternalTypeId] : forced[InternalTypeId];
};
var internalCall = /* @__PURE__ */ pickInternalCall();

// node_modules/effect/dist/internal/record.js
function assignProperty(self, key, value) {
  if (key === "__proto__") {
    Object.defineProperty(self, key, {
      value,
      writable: true,
      enumerable: true,
      configurable: true
    });
  } else {
    self[key] = value;
  }
}
function assignProperties(self, source) {
  for (const key of Reflect.ownKeys(source)) {
    if (Object.prototype.propertyIsEnumerable.call(source, key)) {
      assignProperty(self, key, source[key]);
    }
  }
}

// node_modules/effect/dist/internal/core.js
var EffectTypeId = `~effect/Effect`;
var ExitTypeId = `~effect/Exit`;
var effectVariance = {
  _A: identity,
  _E: identity,
  _R: identity
};
var identifier = `${EffectTypeId}/identifier`;
var args = `${EffectTypeId}/args`;
var evaluate = `${EffectTypeId}/evaluate`;
var contA = `${EffectTypeId}/successCont`;
var contE = `${EffectTypeId}/failureCont`;
var contAll = `${EffectTypeId}/ensureCont`;
var Yield = /* @__PURE__ */ Symbol.for("effect/Effect/Yield");
var PipeInspectableProto = {
  pipe() {
    return pipeArguments(this, arguments);
  },
  toJSON() {
    return {
      ...this
    };
  },
  toString() {
    return format(this.toJSON(), {
      ignoreToString: true,
      space: 2
    });
  },
  [NodeInspectSymbol]() {
    return this.toJSON();
  }
};
var StructuralProto = {
  [symbol]() {
    return structureKeys(this, Object.keys(this));
  },
  [symbol2](that) {
    const selfKeys = Object.keys(this);
    const thatKeys = Object.keys(that);
    if (selfKeys.length !== thatKeys.length)
      return false;
    for (let i = 0;i < selfKeys.length; i++) {
      if (selfKeys[i] !== thatKeys[i] || !equals(this[selfKeys[i]], that[selfKeys[i]])) {
        return false;
      }
    }
    return true;
  }
};
var EffectProto = {
  [EffectTypeId]: effectVariance,
  ...PipeInspectableProto,
  [Symbol.iterator]() {
    return new SingleShotGen(this);
  },
  toJSON() {
    return {
      _id: "Effect",
      op: this[identifier],
      ...args in this ? {
        args: this[args]
      } : undefined
    };
  }
};
var isEffect = (u) => hasProperty(u, EffectTypeId);
var isExit = (u) => hasProperty(u, ExitTypeId);
var CauseTypeId = "~effect/Cause";
var CauseReasonTypeId = "~effect/Cause/Reason";
var isCause = (self) => hasProperty(self, CauseTypeId);
var isCauseReason = (self) => hasProperty(self, CauseReasonTypeId);

class CauseImpl {
  [CauseTypeId];
  reasons;
  constructor(failures) {
    this[CauseTypeId] = CauseTypeId;
    this.reasons = failures;
  }
  pipe() {
    return pipeArguments(this, arguments);
  }
  toJSON() {
    return {
      _id: "Cause",
      failures: this.reasons.map((f) => f.toJSON())
    };
  }
  toString() {
    return `Cause(${format(this.reasons)})`;
  }
  [NodeInspectSymbol]() {
    return this.toJSON();
  }
  [symbol2](that) {
    return isCause(that) && this.reasons.length === that.reasons.length && this.reasons.every((e, i) => equals(e, that.reasons[i]));
  }
  [symbol]() {
    return array(this.reasons);
  }
}
var annotationsMap = /* @__PURE__ */ new WeakMap;

class ReasonBase {
  [CauseReasonTypeId];
  annotations;
  _tag;
  constructor(_tag, annotations, originalError) {
    this[CauseReasonTypeId] = CauseReasonTypeId;
    this._tag = _tag;
    if (annotations !== constEmptyAnnotations && typeof originalError === "object" && originalError !== null && annotations.size > 0) {
      const prevAnnotations = annotationsMap.get(originalError);
      if (prevAnnotations) {
        annotations = new Map([...prevAnnotations, ...annotations]);
      }
      annotationsMap.set(originalError, annotations);
    }
    this.annotations = annotations;
  }
  annotate(annotations, options) {
    if (annotations.mapUnsafe.size === 0)
      return this;
    const newAnnotations = new Map(this.annotations);
    annotations.mapUnsafe.forEach((value, key) => {
      if (options?.overwrite !== true && newAnnotations.has(key))
        return;
      newAnnotations.set(key, value);
    });
    const self = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    self.annotations = newAnnotations;
    return self;
  }
  pipe() {
    return pipeArguments(this, arguments);
  }
  toString() {
    return format(this);
  }
  [NodeInspectSymbol]() {
    return this.toString();
  }
}
var constEmptyAnnotations = /* @__PURE__ */ new Map;

class Fail extends ReasonBase {
  error;
  constructor(error, annotations = constEmptyAnnotations) {
    super("Fail", annotations, error);
    this.error = error;
  }
  toString() {
    return `Fail(${format(this.error)})`;
  }
  toJSON() {
    return {
      _tag: "Fail",
      error: this.error
    };
  }
  [symbol2](that) {
    return isFailReason(that) && equals(this.error, that.error) && equals(this.annotations, that.annotations);
  }
  [symbol]() {
    return combine(string(this._tag))(combine(hash(this.error))(hash(this.annotations)));
  }
}
var causeFromReasons = (reasons) => new CauseImpl(reasons);
var causeEmpty = /* @__PURE__ */ new CauseImpl([]);
var causeFail = (error) => new CauseImpl([new Fail(error)]);

class Die extends ReasonBase {
  defect;
  constructor(defect, annotations = constEmptyAnnotations) {
    super("Die", annotations, defect);
    this.defect = defect;
  }
  toString() {
    return `Die(${format(this.defect)})`;
  }
  toJSON() {
    return {
      _tag: "Die",
      defect: this.defect
    };
  }
  [symbol2](that) {
    return isDieReason(that) && equals(this.defect, that.defect) && equals(this.annotations, that.annotations);
  }
  [symbol]() {
    return combine(string(this._tag))(combine(hash(this.defect))(hash(this.annotations)));
  }
}
var causeDie = (defect) => new CauseImpl([new Die(defect)]);
var causeAnnotate = /* @__PURE__ */ dual((args2) => isCause(args2[0]), (self, annotations, options) => {
  if (annotations.mapUnsafe.size === 0)
    return self;
  return new CauseImpl(self.reasons.map((f) => f.annotate(annotations, options)));
});
var isFailReason = (self) => self._tag === "Fail";
var isDieReason = (self) => self._tag === "Die";
var isInterruptReason = (self) => self._tag === "Interrupt";
function defaultEvaluate(_fiber) {
  return exitDie(`Effect.evaluate: Not implemented`);
}
var makePrimitiveProto = (options) => ({
  ...EffectProto,
  [identifier]: options.op,
  [evaluate]: options[evaluate] ?? defaultEvaluate,
  [contA]: options[contA],
  [contE]: options[contE],
  [contAll]: options[contAll]
});
var makePrimitive = (options) => {
  const Proto = makePrimitiveProto(options);
  return function() {
    const self = Object.create(Proto);
    self[args] = options.single === false ? arguments : arguments[0];
    return self;
  };
};
var makeExit = (options) => {
  const Proto = {
    [ExitTypeId]: ExitTypeId,
    _tag: options.op,
    get [options.prop]() {
      return this[args];
    },
    ...makePrimitiveProto(options),
    toString() {
      return `${options.op}(${format(this[args])})`;
    },
    toJSON() {
      return {
        _id: "Exit",
        _tag: options.op,
        [options.prop]: this[args]
      };
    },
    [symbol2](that) {
      return isExit(that) && that._tag === this._tag && equals(this[args], that[args]);
    },
    [symbol]() {
      return combine(string(options.op), hash(this[args]));
    }
  };
  return function(value) {
    const self = Object.create(Proto);
    self[args] = value;
    return self;
  };
};
var exitSucceed = /* @__PURE__ */ makeExit({
  op: "Success",
  prop: "value",
  [evaluate](fiber) {
    const cont = fiber.getCont(contA);
    return cont ? cont[contA](this[args], fiber, this) : fiber.yieldWith(this);
  }
});
var StackTraceKey = {
  key: "effect/Cause/StackTrace"
};
var InterruptorStackTrace = {
  key: "effect/Cause/InterruptorStackTrace"
};
var exitFailCause = /* @__PURE__ */ makeExit({
  op: "Failure",
  prop: "cause",
  [evaluate](fiber) {
    let cause = this[args];
    let annotated = false;
    if (fiber.currentStackFrame) {
      cause = causeAnnotate(cause, {
        mapUnsafe: new Map([[StackTraceKey.key, fiber.currentStackFrame]])
      });
      annotated = true;
    }
    let cont = fiber.getCont(contE);
    while (fiber.interruptible && fiber._interruptedCause && cont) {
      cont = fiber.getCont(contE);
    }
    return cont ? cont[contE](cause, fiber, annotated ? undefined : this) : fiber.yieldWith(annotated ? exitFailCause(cause) : this);
  }
});
var exitFail = (e) => exitFailCause(causeFail(e));
var exitDie = (defect) => exitFailCause(causeDie(defect));
var withFiber = /* @__PURE__ */ makePrimitive({
  op: "WithFiber",
  [evaluate](fiber) {
    return this[args](fiber);
  }
});
var YieldableError = /* @__PURE__ */ function() {

  class YieldableError2 extends globalThis.Error {
  }
  const proto = /* @__PURE__ */ makePrimitiveProto({
    op: "YieldableError",
    [evaluate]() {
      return exitFail(this);
    }
  });
  delete proto.toString;
  Object.assign(YieldableError2.prototype, proto);
  return YieldableError2;
}();
var Error2 = /* @__PURE__ */ function() {
  const plainArgsSymbol = /* @__PURE__ */ Symbol.for("effect/Data/Error/plainArgs");
  return class Base extends YieldableError {
    constructor(args2) {
      super(args2?.message, args2?.cause ? {
        cause: args2.cause
      } : undefined);
      if (args2) {
        assignProperties(this, args2);
        Object.defineProperty(this, plainArgsSymbol, {
          value: args2,
          enumerable: false
        });
      }
    }
    toJSON() {
      return {
        ...this[plainArgsSymbol],
        ...this
      };
    }
  };
}();
var TaggedError = (tag) => {

  class Base extends Error2 {
    _tag = tag;
  }
  Base.prototype.name = tag;
  return Base;
};
var NoSuchElementErrorTypeId = "~effect/Cause/NoSuchElementError";
var isNoSuchElementError = (u) => hasProperty(u, NoSuchElementErrorTypeId);

class NoSuchElementError extends (/* @__PURE__ */ TaggedError("NoSuchElementError")) {
  [NoSuchElementErrorTypeId] = NoSuchElementErrorTypeId;
  constructor(message) {
    super({
      message
    });
  }
}
var DoneTypeId = "~effect/Cause/Done";
var isDone = (u) => hasProperty(u, DoneTypeId);
var DoneVoid = {
  [DoneTypeId]: DoneTypeId,
  _tag: "Done",
  value: undefined
};
var Done = (value) => {
  if (value === undefined)
    return DoneVoid;
  return {
    [DoneTypeId]: DoneTypeId,
    _tag: "Done",
    value
  };
};
var doneVoid = /* @__PURE__ */ exitFail(DoneVoid);
var done = (value) => {
  if (value === undefined)
    return doneVoid;
  return exitFail(Done(value));
};

// node_modules/effect/dist/Effectable.js
var Prototype2 = (options) => makePrimitiveProto({
  op: options.label,
  [evaluate]: options.evaluate
});

// node_modules/effect/dist/Combiner.js
function make(combine2) {
  return {
    combine: combine2
  };
}

// node_modules/effect/dist/Reducer.js
function make2(combine2, initialValue, combineAll) {
  return {
    combine: combine2,
    initialValue,
    combineAll: combineAll ?? ((collection) => {
      let out = initialValue;
      for (const value of collection) {
        out = combine2(out, value);
      }
      return out;
    })
  };
}

// node_modules/effect/dist/Equivalence.js
var make3 = (isEquivalent) => (self, that) => self === that || isEquivalent(self, that);
var isStrictEquivalent = (x, y) => x === y;
var strictEqual = () => isStrictEquivalent;
function Array_(item) {
  return make3((self, that) => {
    if (self.length !== that.length)
      return false;
    for (let i = 0;i < self.length; i++) {
      if (!item(self[i], that[i]))
        return false;
    }
    return true;
  });
}

// node_modules/effect/dist/internal/doNotation.js
var let_ = (map) => dual(3, (self, name, f) => map(self, (a) => ({
  ...a,
  [name]: f(a)
})));
var bindTo = (map) => dual(2, (self, name) => map(self, (a) => ({
  [name]: a
})));
var bind = (map, flatMap) => dual(3, (self, name, f) => flatMap(self, (a) => map(f(a), (b) => ({
  ...a,
  [name]: b
}))));

// node_modules/effect/dist/internal/option.js
var TypeId = "~effect/data/Option";
var CommonProto = {
  [TypeId]: {
    _A: (_) => _
  },
  ...PipeInspectableProto,
  [Symbol.iterator]() {
    return new SingleShotGen(this);
  }
};
var SomeProto = /* @__PURE__ */ Object.defineProperty(/* @__PURE__ */ Object.assign(/* @__PURE__ */ Object.create(CommonProto), {
  _tag: "Some",
  _op: "Some",
  [symbol2](that) {
    return isOption(that) && isSome(that) && equals(this.value, that.value);
  },
  [symbol]() {
    return combine(hash(this._tag))(hash(this.value));
  },
  toString() {
    return `some(${format(this.value)})`;
  },
  toJSON() {
    return {
      _id: "Option",
      _tag: this._tag,
      value: toJson(this.value)
    };
  }
}), "valueOrUndefined", {
  get() {
    return this.value;
  }
});
var NoneHash = /* @__PURE__ */ hash("None");
var NoneProto = /* @__PURE__ */ Object.assign(/* @__PURE__ */ Object.create(CommonProto), {
  _tag: "None",
  _op: "None",
  valueOrUndefined: undefined,
  [symbol2](that) {
    return isOption(that) && isNone(that);
  },
  [symbol]() {
    return NoneHash;
  },
  toString() {
    return `none()`;
  },
  toJSON() {
    return {
      _id: "Option",
      _tag: this._tag
    };
  }
});
var isOption = (input) => hasProperty(input, TypeId);
var isNone = (fa) => fa._tag === "None";
var isSome = (fa) => fa._tag === "Some";
var none = /* @__PURE__ */ Object.create(NoneProto);
var some = (value) => {
  const a = Object.create(SomeProto);
  a.value = value;
  return a;
};

// node_modules/effect/dist/internal/result.js
var TypeId2 = "~effect/data/Result";
var CommonProto2 = {
  [TypeId2]: {
    _A: (_) => _,
    _E: (_) => _
  },
  ...PipeInspectableProto,
  [Symbol.iterator]() {
    return new SingleShotGen(this);
  }
};
var SuccessProto = /* @__PURE__ */ Object.assign(/* @__PURE__ */ Object.create(CommonProto2), {
  _tag: "Success",
  _op: "Success",
  [symbol2](that) {
    return isResult(that) && isSuccess(that) && equals(this.success, that.success);
  },
  [symbol]() {
    return combine(hash(this._tag))(hash(this.success));
  },
  toString() {
    return `success(${format(this.success)})`;
  },
  toJSON() {
    return {
      _id: "Result",
      _tag: this._tag,
      value: toJson(this.success)
    };
  }
});
var FailureProto = /* @__PURE__ */ Object.assign(/* @__PURE__ */ Object.create(CommonProto2), {
  _tag: "Failure",
  _op: "Failure",
  [symbol2](that) {
    return isResult(that) && isFailure(that) && equals(this.failure, that.failure);
  },
  [symbol]() {
    return combine(hash(this._tag))(hash(this.failure));
  },
  toString() {
    return `failure(${format(this.failure)})`;
  },
  toJSON() {
    return {
      _id: "Result",
      _tag: this._tag,
      failure: toJson(this.failure)
    };
  }
});
var isResult = (input) => hasProperty(input, TypeId2);
var isFailure = (result) => result._tag === "Failure";
var isSuccess = (result) => result._tag === "Success";
var fail = (failure) => {
  const a = Object.create(FailureProto);
  a.failure = failure;
  return a;
};
var succeed = (success) => {
  const a = Object.create(SuccessProto);
  a.success = success;
  return a;
};

// node_modules/effect/dist/Order.js
function make4(compare) {
  return (self, that) => self === that ? 0 : compare(self, that);
}
var Number2 = /* @__PURE__ */ make4((self, that) => {
  if (globalThis.Number.isNaN(self) && globalThis.Number.isNaN(that))
    return 0;
  if (globalThis.Number.isNaN(self))
    return -1;
  if (globalThis.Number.isNaN(that))
    return 1;
  return self < that ? -1 : 1;
});
var BigInt2 = /* @__PURE__ */ make4((self, that) => self < that ? -1 : 1);
var mapInput = /* @__PURE__ */ dual(2, (self, f) => make4((b1, b2) => self(f(b1), f(b2))));
var Date2 = /* @__PURE__ */ mapInput(Number2, (date) => date.getTime());
var isLessThan = (O) => dual(2, (self, that) => O(self, that) === -1);
var isGreaterThan = (O) => dual(2, (self, that) => O(self, that) === 1);
var isLessThanOrEqualTo = (O) => dual(2, (self, that) => O(self, that) !== 1);
var isGreaterThanOrEqualTo = (O) => dual(2, (self, that) => O(self, that) !== -1);

// node_modules/effect/dist/Option.js
var none2 = () => none;
var some2 = some;
var isOption2 = isOption;
var isNone2 = isNone;
var isSome2 = isSome;
var match = /* @__PURE__ */ dual(2, (self, {
  onNone,
  onSome
}) => isNone2(self) ? onNone() : onSome(self.value));
var getOrElse = /* @__PURE__ */ dual(2, (self, onNone) => isNone2(self) ? onNone() : self.value);
var fromNullishOr = (a) => a == null ? none2() : some2(a);
var fromUndefinedOr = (a) => a === undefined ? none2() : some2(a);
var fromNullOr = (a) => a === null ? none2() : some2(a);
var getOrNull = /* @__PURE__ */ getOrElse(constNull);
var getOrUndefined = /* @__PURE__ */ getOrElse(constUndefined);
var liftThrowable = (f) => (...a) => {
  try {
    return some2(f(...a));
  } catch {
    return none2();
  }
};
var getOrThrowWith = /* @__PURE__ */ dual(2, (self, onNone) => {
  if (isSome2(self)) {
    return self.value;
  }
  throw onNone();
});
var getOrThrow = /* @__PURE__ */ getOrThrowWith(() => new Error("getOrThrow called on a None"));
var map = /* @__PURE__ */ dual(2, (self, f) => isNone2(self) ? none2() : some2(f(self.value)));
var flatMap = /* @__PURE__ */ dual(2, (self, f) => isNone2(self) ? none2() : f(self.value));
var flatten = /* @__PURE__ */ flatMap(identity);
var filter = /* @__PURE__ */ dual(2, (self, predicate) => isNone2(self) ? none2() : predicate(self.value) ? some2(self.value) : none2());
var makeEquivalence = (isEquivalent) => make3((x, y) => isNone2(x) ? isNone2(y) : isNone2(y) ? false : isEquivalent(x.value, y.value));

// node_modules/effect/dist/Context.js
var ServiceTypeId = "~effect/Context/Service";
var Service = function() {
  function KeyClass() {}
  const self = KeyClass;
  Object.setPrototypeOf(self, ServiceProto);
  const init = (key, options) => {
    self.key = key;
    if (options?.defaultValue) {
      self[ReferenceTypeId] = ReferenceTypeId;
      self.defaultValue = options.defaultValue;
    }
    if (options?.make) {
      self.make = options.make;
    }
    if (options?.fiberCached) {
      cacheKeys.add(key);
    }
    return self;
  };
  return arguments.length > 0 ? init(arguments[0], arguments[1]) : init;
};
var ServiceProto = {
  [ServiceTypeId]: ServiceTypeId,
  .../* @__PURE__ */ Prototype2({
    label: "Service",
    evaluate(fiber) {
      return exitSucceed(get(fiber.context, this));
    }
  }),
  toJSON() {
    return {
      _id: "Service",
      key: this.key
    };
  },
  of(self) {
    return self;
  },
  context(self) {
    return make5(this, self);
  },
  use(f) {
    return withFiber((fiber) => f(get(fiber.context, this)));
  },
  useSync(f) {
    return withFiber((fiber) => exitSucceed(f(get(fiber.context, this))));
  }
};
var cacheKeys = /* @__PURE__ */ new Set;
var ReferenceTypeId = "~effect/Context/Reference";
var TypeId3 = "~effect/Context";
var MaxDepth = 8;
var FlattenAfterBaseHits = 8;
var makeImpl = (cacheRoot, base, overlay, depth) => {
  const self = Object.create(Proto);
  self.cacheRoot = cacheRoot ?? self;
  self.base = base;
  self.overlay = overlay;
  self.depth = depth;
  self._flat = undefined;
  self.baseHits = 0;
  return self;
};
var applyOverlays = (map2, overlay) => {
  if (!overlay)
    return;
  applyOverlays(map2, overlay.parent);
  map2.set(overlay.key, overlay.value);
};
var flatten2 = (self) => {
  if (self._flat)
    return self._flat;
  if (!self.overlay)
    return self._flat = self.base;
  const map2 = new Map(self.base);
  applyOverlays(map2, self.overlay);
  return self._flat = map2;
};
var withFlat = (self, f) => {
  const map2 = new Map(self.mapUnsafe);
  f(map2);
  return makeUnsafe(map2);
};
var notFound = /* @__PURE__ */ Symbol();
var lookup = (self, key) => {
  const impl = self;
  for (let overlay = impl.overlay;overlay; overlay = overlay.parent) {
    if (overlay.key === key)
      return overlay.value;
  }
  const value = impl.base.get(key);
  if (value === undefined && !impl.base.has(key))
    return notFound;
  if (impl.overlay && ++impl.baseHits >= FlattenAfterBaseHits) {
    impl.base = flatten2(impl);
    impl.overlay = undefined;
    impl.depth = 0;
  }
  return value;
};
var makeUnsafe = (mapUnsafe) => makeImpl(undefined, mapUnsafe, undefined, 0);
var Proto = {
  get mapUnsafe() {
    return flatten2(this);
  },
  ...PipeInspectableProto,
  [TypeId3]: {
    _Services: (_) => _
  },
  toJSON() {
    return {
      _id: "Context",
      services: Array.from(this.mapUnsafe).map(([key, value]) => ({
        key,
        value
      }))
    };
  },
  [symbol2](that) {
    if (!isContext(that))
      return false;
    const self = this.mapUnsafe;
    const other = that.mapUnsafe;
    if (self.size !== other.size)
      return false;
    for (const [key, value] of self) {
      if (!other.has(key) || !equals(value, other.get(key)))
        return false;
    }
    return true;
  },
  [symbol]() {
    return number(this.mapUnsafe.size);
  }
};
var hasSameCache = (self, that) => self.cacheRoot === that.cacheRoot;
var isContext = (u) => hasProperty(u, TypeId3);
var isKey = (u) => hasProperty(u, ServiceTypeId);
var isReference = (u) => !!u[ReferenceTypeId];
var empty = () => emptyContext2;
var emptyContext2 = /* @__PURE__ */ makeUnsafe(/* @__PURE__ */ new Map);
var make5 = (key, service) => makeUnsafe(new Map([[key.key, service]]));
var add = /* @__PURE__ */ dual(3, (self, key, service) => addUnsafe(self, key.key, service));
var addUnsafe = (self, key, service) => {
  const impl = self;
  const cacheRoot = cacheKeys.has(key) ? undefined : impl.cacheRoot;
  if (impl.depth >= MaxDepth) {
    const map2 = new Map(impl.mapUnsafe);
    map2.set(key, service);
    return makeImpl(cacheRoot, map2, undefined, 0);
  }
  return makeImpl(cacheRoot, impl.base, {
    key,
    value: service,
    parent: impl.overlay
  }, impl.depth + 1);
};
var addOrOmit = /* @__PURE__ */ dual(3, (self, key, service) => service._tag === "None" ? omit(key)(self) : add(self, key, service.value));
var getOrElse2 = /* @__PURE__ */ dual(3, (self, key, orElse) => {
  const value = lookup(self, key.key);
  if (value !== notFound)
    return value;
  return isReference(key) ? getDefaultValue(key) : orElse();
});
var getOrUndefined2 = /* @__PURE__ */ dual(2, (self, key) => getOrUndefinedUnsafe(self, key.key));
var getOrUndefinedUnsafe = (self, key) => {
  const value = lookup(self, key);
  return value === notFound ? undefined : value;
};
var getUnsafe = /* @__PURE__ */ dual(2, (self, service) => {
  const value = lookup(self, service.key);
  if (value === notFound) {
    if (isReference(service))
      return getDefaultValue(service);
    throw serviceNotFoundError(service);
  }
  return value;
});
var get = getUnsafe;
var defaultValueCacheKey = "~effect/Context/defaultValue";
var getDefaultValue = (ref) => {
  if (defaultValueCacheKey in ref) {
    return ref[defaultValueCacheKey];
  }
  return ref[defaultValueCacheKey] = ref.defaultValue();
};
var serviceNotFoundError = (service) => {
  const error = new Error(`Service not found${service.key ? `: ${String(service.key)}` : ""}`);
  if (error.stack) {
    const lines = error.stack.split(`
`);
    lines.splice(1, 3);
    error.stack = lines.join(`
`);
  }
  return error;
};
var getOption = /* @__PURE__ */ dual(2, (self, service) => {
  const value = lookup(self, service.key);
  if (value !== notFound)
    return some2(value);
  return isReference(service) ? some2(getDefaultValue(service)) : none2();
});
var merge = /* @__PURE__ */ dual(2, (self, that) => {
  if (self.mapUnsafe.size === 0)
    return that;
  if (that.mapUnsafe.size === 0)
    return self;
  return withFlat(self, (map2) => that.mapUnsafe.forEach((value, key) => map2.set(key, value)));
});
var mergeAll = (...ctxs) => {
  const map2 = new Map;
  for (let i = 0;i < ctxs.length; i++) {
    ctxs[i].mapUnsafe.forEach((value, key) => {
      map2.set(key, value);
    });
  }
  return makeUnsafe(map2);
};
var pick = (...services) => (self) => {
  const keep = new Set(services.map((key) => key.key));
  return withFlat(self, (map2) => map2.forEach((_, key) => {
    if (!keep.has(key))
      map2.delete(key);
  }));
};
var omit = (...keys) => (self) => withFlat(self, (map2) => {
  for (let i = 0;i < keys.length; i++) {
    map2.delete(keys[i].key);
  }
});
var Reference = Service;
// node_modules/effect/dist/Effect.js
var exports_Effect = {};
__export(exports_Effect, {
  Do: () => Do2,
  Transaction: () => Transaction,
  TypeId: () => TypeId12,
  abortSignal: () => abortSignal2,
  acquireDisposable: () => acquireDisposable2,
  acquireRelease: () => acquireRelease2,
  acquireUseRelease: () => acquireUseRelease2,
  addFinalizer: () => addFinalizer3,
  all: () => all2,
  andThen: () => andThen2,
  annotateCurrentSpan: () => annotateCurrentSpan2,
  annotateLogs: () => annotateLogs,
  annotateLogsScoped: () => annotateLogsScoped2,
  annotateSpans: () => annotateSpans2,
  as: () => as2,
  asSome: () => asSome2,
  asVoid: () => asVoid2,
  awaitAllChildren: () => awaitAllChildren2,
  bind: () => bind3,
  bindTo: () => bindTo3,
  cached: () => cached2,
  cachedInvalidateWithTTL: () => cachedInvalidateWithTTL2,
  cachedWithTTL: () => cachedWithTTL2,
  callback: () => callback2,
  catch: () => catch_3,
  catchCause: () => catchCause3,
  catchCauseFilter: () => catchCauseFilter2,
  catchCauseIf: () => catchCauseIf2,
  catchDefect: () => catchDefect2,
  catchEager: () => catchEager2,
  catchFilter: () => catchFilter2,
  catchIf: () => catchIf2,
  catchNoSuchElement: () => catchNoSuchElement2,
  catchReason: () => catchReason2,
  catchReasons: () => catchReasons2,
  catchTag: () => catchTag3,
  catchTags: () => catchTags2,
  clockWith: () => clockWith2,
  context: () => context2,
  contextWith: () => contextWith2,
  currentParentSpan: () => currentParentSpan2,
  currentSpan: () => currentSpan2,
  delay: () => delay2,
  die: () => die4,
  effectify: () => effectify,
  ensuring: () => ensuring2,
  eventually: () => eventually2,
  exit: () => exit2,
  fail: () => fail6,
  failCause: () => failCause4,
  failCauseSync: () => failCauseSync2,
  failSync: () => failSync2,
  fiber: () => fiber2,
  fiberId: () => fiberId2,
  filter: () => filter5,
  filterMap: () => filterMap2,
  filterMapEffect: () => filterMapEffect2,
  filterMapOrElse: () => filterMapOrElse2,
  filterMapOrFail: () => filterMapOrFail2,
  filterOrElse: () => filterOrElse2,
  filterOrFail: () => filterOrFail2,
  findFirst: () => findFirst2,
  findFirstFilter: () => findFirstFilter2,
  firstSuccessOf: () => firstSuccessOf2,
  flatMap: () => flatMap5,
  flatMapEager: () => flatMapEager2,
  flatten: () => flatten5,
  flip: () => flip2,
  fn: () => fn2,
  fnUntraced: () => fnUntraced2,
  fnUntracedEager: () => fnUntracedEager2,
  forEach: () => forEach2,
  forever: () => forever4,
  forkChild: () => forkChild2,
  forkDetach: () => forkDetach2,
  forkIn: () => forkIn2,
  forkScoped: () => forkScoped2,
  fromNullishOr: () => fromNullishOr3,
  fromOption: () => fromOption3,
  fromResult: () => fromResult2,
  gen: () => gen2,
  head: () => head2,
  ignore: () => ignore2,
  ignoreCause: () => ignoreCause2,
  interrupt: () => interrupt3,
  interruptible: () => interruptible2,
  interruptibleMask: () => interruptibleMask2,
  isEffect: () => isEffect2,
  isFailure: () => isFailure5,
  isSuccess: () => isSuccess5,
  let: () => let_3,
  linkSpans: () => linkSpans2,
  log: () => log,
  logDebug: () => logDebug,
  logError: () => logError,
  logFatal: () => logFatal,
  logInfo: () => logInfo,
  logTrace: () => logTrace,
  logWarning: () => logWarning,
  logWithLevel: () => logWithLevel2,
  makeSpan: () => makeSpan2,
  makeSpanScoped: () => makeSpanScoped2,
  map: () => map7,
  mapBoth: () => mapBoth2,
  mapBothEager: () => mapBothEager2,
  mapEager: () => mapEager2,
  mapError: () => mapError3,
  mapErrorEager: () => mapErrorEager2,
  match: () => match6,
  matchCause: () => matchCause2,
  matchCauseEager: () => matchCauseEager2,
  matchCauseEffect: () => matchCauseEffect2,
  matchCauseEffectEager: () => matchCauseEffectEager2,
  matchEager: () => matchEager2,
  matchEffect: () => matchEffect3,
  never: () => never2,
  onError: () => onError2,
  onErrorFilter: () => onErrorFilter2,
  onErrorIf: () => onErrorIf2,
  onExit: () => onExit2,
  onExitFilter: () => onExitFilter2,
  onExitIf: () => onExitIf2,
  onExitPrimitive: () => onExitPrimitive2,
  onInterrupt: () => onInterrupt2,
  option: () => option2,
  orDie: () => orDie3,
  orElseSucceed: () => orElseSucceed2,
  partition: () => partition3,
  promise: () => promise2,
  provide: () => provide4,
  provideContext: () => provideContext2,
  provideService: () => provideService2,
  provideServiceEffect: () => provideServiceEffect2,
  race: () => race2,
  raceAll: () => raceAll2,
  raceAllFirst: () => raceAllFirst2,
  raceFirst: () => raceFirst2,
  reduce: () => reduce2,
  repeat: () => repeat3,
  repeatOrElse: () => repeatOrElse2,
  replicate: () => replicate2,
  replicateEffect: () => replicateEffect2,
  request: () => request2,
  requestUnsafe: () => requestUnsafe2,
  result: () => result2,
  retry: () => retry2,
  retryOrElse: () => retryOrElse2,
  runCallback: () => runCallback2,
  runCallbackWith: () => runCallbackWith2,
  runFork: () => runFork2,
  runForkWith: () => runForkWith2,
  runPromise: () => runPromise2,
  runPromiseExit: () => runPromiseExit2,
  runPromiseExitWith: () => runPromiseExitWith2,
  runPromiseWith: () => runPromiseWith2,
  runSync: () => runSync2,
  runSyncExit: () => runSyncExit2,
  runSyncExitWith: () => runSyncExitWith2,
  runSyncWith: () => runSyncWith2,
  sandbox: () => sandbox2,
  satisfiesErrorType: () => satisfiesErrorType2,
  satisfiesServicesType: () => satisfiesServicesType2,
  satisfiesSuccessType: () => satisfiesSuccessType2,
  schedule: () => schedule,
  scheduleFrom: () => scheduleFrom2,
  scope: () => scope2,
  scoped: () => scoped2,
  scopedWith: () => scopedWith2,
  service: () => service2,
  serviceOption: () => serviceOption2,
  setContext: () => setContext2,
  sleep: () => sleep2,
  spanAnnotations: () => spanAnnotations2,
  spanLinks: () => spanLinks2,
  succeed: () => succeed6,
  succeedNone: () => succeedNone2,
  succeedSome: () => succeedSome2,
  suspend: () => suspend3,
  sync: () => sync3,
  tap: () => tap3,
  tapCause: () => tapCause3,
  tapCauseFilter: () => tapCauseFilter2,
  tapCauseIf: () => tapCauseIf2,
  tapDefect: () => tapDefect2,
  tapError: () => tapError3,
  tapErrorTag: () => tapErrorTag2,
  timed: () => timed2,
  timeout: () => timeout2,
  timeoutOption: () => timeoutOption2,
  timeoutOrElse: () => timeoutOrElse2,
  tracer: () => tracer2,
  track: () => track,
  trackDefects: () => trackDefects,
  trackDuration: () => trackDuration,
  trackErrors: () => trackErrors,
  trackSuccesses: () => trackSuccesses,
  transposeOption: () => transposeOption2,
  try: () => try_3,
  tryPromise: () => tryPromise2,
  tx: () => tx,
  txRetry: () => txRetry,
  undefined: () => undefined_2,
  uninterruptible: () => uninterruptible2,
  uninterruptibleMask: () => uninterruptibleMask2,
  unwrapReason: () => unwrapReason2,
  updateContext: () => updateContext2,
  updateService: () => updateService3,
  updateServiceScoped: () => updateServiceScoped2,
  useSpan: () => useSpan2,
  validate: () => validate2,
  void: () => void_3,
  when: () => when2,
  whileLoop: () => whileLoop2,
  withErrorReporting: () => withErrorReporting2,
  withExecutionPlan: () => withExecutionPlan2,
  withFiber: () => withFiber2,
  withLogSpan: () => withLogSpan,
  withLogger: () => withLogger,
  withParentSpan: () => withParentSpan3,
  withSpan: () => withSpan3,
  withSpanScoped: () => withSpanScoped2,
  withTracer: () => withTracer2,
  withTracerEnabled: () => withTracerEnabled2,
  withTracerTiming: () => withTracerTiming2,
  yieldNow: () => yieldNow2,
  yieldNowWith: () => yieldNowWith2,
  zip: () => zip2,
  zipWith: () => zipWith2
});

// node_modules/effect/dist/Duration.js
var TypeId4 = "~effect/time/Duration";
var bigint0 = /* @__PURE__ */ BigInt(0);
var bigint1 = /* @__PURE__ */ BigInt(1);
var bigint2 = /* @__PURE__ */ BigInt(2);
var bigint10 = /* @__PURE__ */ BigInt(10);
var bigint1e3 = /* @__PURE__ */ BigInt(1000);
var roundTiesAwayFromZero = (input) => BigInt(input < 0 ? Math.ceil(input - 0.5) : Math.floor(input + 0.5));
var roundMillisToNanos = (millis) => roundTiesAwayFromZero(millis * 1e6);
var parseNanos = (input, scale) => {
  const decimalIndex = input.indexOf(".");
  if (decimalIndex === -1)
    return BigInt(input) * scale;
  const isNegative = input[0] === "-";
  const fractional = input.slice(decimalIndex + 1);
  const fractionalScale = bigint10 ** BigInt(fractional.length);
  const scaled = (BigInt(input.slice(isNegative ? 1 : 0, decimalIndex)) * fractionalScale + BigInt(fractional)) * scale;
  const rounded = scaled / fractionalScale + (scaled % fractionalScale * bigint2 >= fractionalScale ? bigint1 : bigint0);
  return isNegative ? -rounded : rounded;
};
var DURATION_REGEXP = /^(-?\d+(?:\.\d+)?)\s+(nanos?|micros?|millis?|seconds?|minutes?|hours?|days?|weeks?)$/;
var fromInputUnsafe = (input) => {
  switch (typeof input) {
    case "number":
      return millis(input);
    case "bigint":
      return nanos(input);
    case "string": {
      if (input === "Infinity") {
        return infinity;
      }
      if (input === "-Infinity") {
        return negativeInfinity;
      }
      const match2 = DURATION_REGEXP.exec(input);
      if (!match2)
        break;
      const [_, valueStr, unit] = match2;
      if (unit === "nano" || unit === "nanos") {
        return nanos(parseNanos(valueStr, bigint1));
      }
      if (unit === "micro" || unit === "micros") {
        return nanos(parseNanos(valueStr, bigint1e3));
      }
      const value = Number(valueStr);
      switch (unit) {
        case "milli":
        case "millis":
          return millis(value);
        case "second":
        case "seconds":
          return seconds(value);
        case "minute":
        case "minutes":
          return minutes(value);
        case "hour":
        case "hours":
          return hours(value);
        case "day":
        case "days":
          return days(value);
        case "week":
        case "weeks":
          return weeks(value);
      }
      break;
    }
    case "object": {
      if (input === null)
        break;
      if (TypeId4 in input)
        return input;
      if (Array.isArray(input)) {
        if (input.length !== 2 || !input.every(isNumber)) {
          return invalid(input);
        }
        if (Number.isNaN(input[0]) || Number.isNaN(input[1])) {
          return zero;
        }
        if (input[0] === -Infinity || input[1] === -Infinity) {
          return negativeInfinity;
        }
        if (input[0] === Infinity || input[1] === Infinity) {
          return infinity;
        }
        return make6(roundTiesAwayFromZero(input[0] * 1e9 + input[1]));
      }
      const obj = input;
      let millis = 0;
      if (obj.weeks)
        millis += obj.weeks * 604800000;
      if (obj.days)
        millis += obj.days * 86400000;
      if (obj.hours)
        millis += obj.hours * 3600000;
      if (obj.minutes)
        millis += obj.minutes * 60000;
      if (obj.seconds)
        millis += obj.seconds * 1000;
      if (obj.milliseconds)
        millis += obj.milliseconds;
      if (!obj.microseconds && !obj.nanoseconds)
        return make6(millis);
      return make6(roundTiesAwayFromZero(millis * 1e6 + (obj.microseconds ?? 0) * 1000 + (obj.nanoseconds ?? 0)));
    }
  }
  return invalid(input);
};
var invalid = (input) => {
  throw new Error(`Invalid Input: ${input}`);
};
var fromInput = /* @__PURE__ */ liftThrowable(fromInputUnsafe);
var zeroDurationValue = {
  _tag: "Millis",
  millis: 0
};
var infinityDurationValue = {
  _tag: "Infinity"
};
var negativeInfinityDurationValue = {
  _tag: "NegativeInfinity"
};
var DurationProto = {
  [TypeId4]: TypeId4,
  [symbol]() {
    switch (this.value._tag) {
      case "Millis": {
        const nanos = this.value.millis * 1e6;
        return Number.isFinite(nanos) ? hash(roundTiesAwayFromZero(nanos)) : number(this.value.millis);
      }
      case "Nanos":
        return hash(this.value.nanos);
      default:
        return structure(this.value);
    }
  },
  [symbol2](that) {
    return isDuration(that) && equals2(this, that);
  },
  toString() {
    switch (this.value._tag) {
      case "Infinity":
        return "Infinity";
      case "NegativeInfinity":
        return "-Infinity";
      case "Nanos":
        return `${this.value.nanos} nanos`;
      case "Millis":
        return `${this.value.millis} millis`;
    }
  },
  toJSON() {
    switch (this.value._tag) {
      case "Millis":
        return {
          _id: "Duration",
          _tag: "Millis",
          millis: this.value.millis
        };
      case "Nanos":
        return {
          _id: "Duration",
          _tag: "Nanos",
          nanos: String(this.value.nanos)
        };
      case "Infinity":
        return {
          _id: "Duration",
          _tag: "Infinity"
        };
      case "NegativeInfinity":
        return {
          _id: "Duration",
          _tag: "NegativeInfinity"
        };
    }
  },
  [NodeInspectSymbol]() {
    return this.toJSON();
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var make6 = (input) => {
  const duration = Object.create(DurationProto);
  if (typeof input === "number") {
    if (isNaN(input) || input === 0 || Object.is(input, -0)) {
      duration.value = zeroDurationValue;
    } else if (!Number.isFinite(input)) {
      duration.value = input > 0 ? infinityDurationValue : negativeInfinityDurationValue;
    } else if (!Number.isInteger(input)) {
      duration.value = {
        _tag: "Nanos",
        nanos: roundMillisToNanos(input)
      };
    } else {
      duration.value = {
        _tag: "Millis",
        millis: input
      };
    }
  } else if (input === bigint0) {
    duration.value = zeroDurationValue;
  } else {
    duration.value = {
      _tag: "Nanos",
      nanos: input
    };
  }
  return duration;
};
var isDuration = (u) => hasProperty(u, TypeId4);
var isFinite = (self) => self.value._tag !== "Infinity" && self.value._tag !== "NegativeInfinity";
var isZero = (self) => {
  switch (self.value._tag) {
    case "Millis":
      return self.value.millis === 0;
    case "Nanos":
      return self.value.nanos === bigint0;
    case "Infinity":
    case "NegativeInfinity":
      return false;
  }
};
var zero = /* @__PURE__ */ make6(0);
var infinity = /* @__PURE__ */ make6(Infinity);
var negativeInfinity = /* @__PURE__ */ make6(-Infinity);
var nanos = (nanos2) => make6(nanos2);
var millis = (millis2) => make6(millis2);
var seconds = (seconds2) => make6(seconds2 * 1000);
var minutes = (minutes2) => make6(minutes2 * 60000);
var hours = (hours2) => make6(hours2 * 3600000);
var days = (days2) => make6(days2 * 86400000);
var weeks = (weeks2) => make6(weeks2 * 604800000);
var toMillis = (self) => match2(fromInputUnsafe(self), {
  onMillis: identity,
  onNanos: (nanos2) => Number(nanos2) / 1e6,
  onInfinity: () => Infinity,
  onNegativeInfinity: () => -Infinity
});
var toNanosUnsafe = (input) => {
  const self = fromInputUnsafe(input);
  switch (self.value._tag) {
    case "Infinity":
    case "NegativeInfinity":
      throw new Error("Cannot convert infinite duration to nanos");
    case "Nanos":
      return self.value.nanos;
    case "Millis":
      return roundMillisToNanos(self.value.millis);
  }
};
var toNanos = /* @__PURE__ */ liftThrowable(toNanosUnsafe);
var match2 = /* @__PURE__ */ dual(2, (self, options) => {
  switch (self.value._tag) {
    case "Millis":
      return options.onMillis(self.value.millis);
    case "Nanos":
      return options.onNanos(self.value.nanos);
    case "Infinity":
      return options.onInfinity();
    case "NegativeInfinity":
      return (options.onNegativeInfinity ?? options.onInfinity)();
  }
});
var matchPair = /* @__PURE__ */ dual(3, (self, that, options) => {
  if (self.value._tag === "Infinity" || self.value._tag === "NegativeInfinity" || that.value._tag === "Infinity" || that.value._tag === "NegativeInfinity")
    return options.onInfinity(self, that);
  if (self.value._tag === "Millis") {
    return that.value._tag === "Millis" ? options.onMillis(self.value.millis, that.value.millis) : options.onNanos(toNanosUnsafe(self), that.value.nanos);
  } else {
    return options.onNanos(self.value.nanos, toNanosUnsafe(that));
  }
});
var Equivalence = (self, that) => matchPair(self, that, {
  onMillis: (self2, that2) => self2 === that2,
  onNanos: (self2, that2) => self2 === that2,
  onInfinity: (self2, that2) => self2.value._tag === that2.value._tag
});
var subtract = /* @__PURE__ */ dual(2, (self, that) => matchPair(self, that, {
  onMillis: (self2, that2) => make6(self2 - that2),
  onNanos: (self2, that2) => make6(self2 - that2),
  onInfinity: (self2, that2) => {
    const s = self2.value._tag;
    const t = that2.value._tag;
    if (s === "Infinity")
      return t === "Infinity" ? zero : infinity;
    if (s === "NegativeInfinity")
      return t === "NegativeInfinity" ? zero : negativeInfinity;
    return t === "Infinity" ? negativeInfinity : infinity;
  }
}));
var equals2 = /* @__PURE__ */ dual(2, (self, that) => Equivalence(self, that));

// node_modules/effect/dist/internal/array.js
var isArrayNonEmpty = (self) => self.length > 0;

// node_modules/effect/dist/Result.js
var succeed2 = succeed;
var fail2 = fail;
var try_ = (evaluate2) => {
  if (isFunction(evaluate2)) {
    try {
      return succeed2(evaluate2());
    } catch (e) {
      return fail2(e);
    }
  } else {
    try {
      return succeed2(evaluate2.try());
    } catch (e) {
      return fail2(evaluate2.catch(e));
    }
  }
};
var isResult2 = isResult;
var isFailure2 = isFailure;
var isSuccess2 = isSuccess;
var makeEquivalence2 = (success, failure) => make3((x, y) => isFailure2(x) ? isFailure2(y) && failure(x.failure, y.failure) : isSuccess2(y) && success(x.success, y.success));
var mapError = /* @__PURE__ */ dual(2, (self, f) => isFailure2(self) ? fail2(f(self.failure)) : self);
var map2 = /* @__PURE__ */ dual(2, (self, f) => isSuccess2(self) ? succeed2(f(self.success)) : self);
var match3 = /* @__PURE__ */ dual(2, (self, {
  onFailure,
  onSuccess
}) => isFailure2(self) ? onFailure(self.failure) : onSuccess(self.success));
var getOrElse3 = /* @__PURE__ */ dual(2, (self, onFailure) => isFailure2(self) ? onFailure(self.failure) : self.success);
var flatMap2 = /* @__PURE__ */ dual(2, (self, f) => isFailure2(self) ? fail2(self.failure) : f(self.success));

// node_modules/effect/dist/Iterable.js
var makeBy = (f, options) => {
  const max = options?.length !== undefined ? Math.max(1, Math.floor(options.length)) : Infinity;
  return {
    [Symbol.iterator]() {
      let i = 0;
      return {
        next() {
          if (i < max) {
            return {
              value: f(i++),
              done: false
            };
          }
          return {
            done: true,
            value: undefined
          };
        }
      };
    }
  };
};
var repeat = /* @__PURE__ */ dual(2, (self, n) => flatten3(makeBy(() => self, {
  length: n
})));
var forever = (self) => repeat(self, Infinity);
var headUnsafe = (self) => {
  const iterator = self[Symbol.iterator]();
  const result = iterator.next();
  if (result.done)
    throw new Error("headUnsafe: empty iterable");
  return result.value;
};
var constEmpty = {
  [Symbol.iterator]() {
    return constEmptyIterator;
  }
};
var constEmptyIterator = {
  next() {
    return {
      done: true,
      value: undefined
    };
  }
};
var flatten3 = (self) => ({
  [Symbol.iterator]() {
    const outerIterator = self[Symbol.iterator]();
    let innerIterator;
    function next() {
      while (true) {
        if (innerIterator === undefined) {
          const next2 = outerIterator.next();
          if (next2.done) {
            return next2;
          }
          innerIterator = next2.value[Symbol.iterator]();
        }
        const result = innerIterator.next();
        if (!result.done) {
          return result;
        }
        innerIterator = undefined;
      }
    }
    return {
      next
    };
  }
});
var filter2 = /* @__PURE__ */ dual(2, (self, predicate) => ({
  [Symbol.iterator]() {
    const iterator = self[Symbol.iterator]();
    let i = 0;
    return {
      next() {
        let result = iterator.next();
        while (!result.done) {
          if (predicate(result.value, i++)) {
            return {
              done: false,
              value: result.value
            };
          }
          result = iterator.next();
        }
        return {
          done: true,
          value: undefined
        };
      }
    };
  }
}));

// node_modules/effect/dist/Record.js
var map3 = /* @__PURE__ */ dual(2, (self, f) => {
  const out = {
    ...self
  };
  for (const key of keys(self)) {
    assignProperty(out, key, f(self[key], key));
  }
  return out;
});
var keys = (self) => Object.keys(self);

// node_modules/effect/dist/Array.js
var Array2 = globalThis.Array;
var makeBy2 = /* @__PURE__ */ dual(2, (n, f) => {
  const max = Math.max(1, Math.floor(n));
  const out = new Array2(max);
  for (let i = 0;i < max; i++) {
    out[i] = f(i);
  }
  return out;
});
var range = (start, end) => start <= end ? makeBy2(end - start + 1, (i) => start + i) : [start];
var fromIterable = (collection) => Array2.isArray(collection) ? collection : Array2.from(collection);
var ensure = (self) => Array2.isArray(self) ? self : [self];
var append = /* @__PURE__ */ dual(2, (self, last) => [...self, last]);
var appendAll = /* @__PURE__ */ dual(2, (self, that) => fromIterable(self).concat(fromIterable(that)));
var isArray = Array2.isArray;
var isArrayNonEmpty2 = isArrayNonEmpty;
var isReadonlyArrayNonEmpty = isArrayNonEmpty;
function isOutOfBounds(i, as) {
  return !Number.isFinite(i) || i < 0 || i >= as.length;
}
var getUnsafe2 = /* @__PURE__ */ dual(2, (self, index) => {
  const i = Math.floor(index);
  if (isOutOfBounds(i, self)) {
    throw new Error(`Index out of bounds: ${i}`);
  }
  return self[i];
});
var lastNonEmpty = (self) => self[self.length - 1];
var takeWhile = /* @__PURE__ */ dual(2, (self, predicate) => {
  let i = 0;
  const out = [];
  for (const a of self) {
    if (!predicate(a, i)) {
      break;
    }
    out.push(a);
    i++;
  }
  return out;
});
var hashBucketsAdd = (buckets, value) => {
  const hash2 = hash(value);
  const bucket = buckets.get(hash2);
  if (bucket === undefined) {
    buckets.set(hash2, [value]);
    return true;
  }
  for (const previous of bucket) {
    if (equals(previous, value)) {
      return false;
    }
  }
  bucket.push(value);
  return true;
};
var union = /* @__PURE__ */ dual(2, (self, that) => {
  const a = fromIterable(self);
  const b = fromIterable(that);
  if (isReadonlyArrayNonEmpty(a)) {
    return isReadonlyArrayNonEmpty(b) ? dedupe(appendAll(a, b)) : a;
  }
  return b;
});
var empty2 = () => [];
var of = (a) => [a];
var map4 = /* @__PURE__ */ dual(2, (self, f) => self.map(f));
var getSomes = (self) => {
  const out = [];
  for (const a of self) {
    if (isSome2(a)) {
      out.push(a.value);
    }
  }
  return out;
};
var filter3 = /* @__PURE__ */ dual(2, (self, predicate) => {
  const as = fromIterable(self);
  const out = [];
  for (let i = 0;i < as.length; i++) {
    if (predicate(as[i], i)) {
      out.push(as[i]);
    }
  }
  return out;
});
var partition = /* @__PURE__ */ dual(2, (self, f) => {
  const excluded = [];
  const satisfying = [];
  let i = 0;
  for (const a of self) {
    const result = f(a, i++);
    if (isSuccess2(result)) {
      satisfying.push(result.success);
    } else {
      excluded.push(result.failure);
    }
  }
  return [excluded, satisfying];
});
var dedupe = (self) => {
  const input = fromIterable(self);
  if (input.length < 2) {
    return [...input];
  }
  const buckets = new Map;
  const out = [];
  for (const value of input) {
    if (hashBucketsAdd(buckets, value)) {
      out.push(value);
    }
  }
  return out;
};
var reducer = /* @__PURE__ */ make2((a, b) => a.concat(b), []);
function makeReducerConcat() {
  return reducer;
}

// node_modules/effect/dist/Scheduler.js
var Scheduler = /* @__PURE__ */ Reference("effect/Scheduler", {
  fiberCached: true,
  defaultValue: () => new MixedScheduler
});
var setImmediate = "setImmediate" in globalThis ? (f) => {
  const timer = globalThis.setImmediate(f);
  return () => globalThis.clearImmediate(timer);
} : (f) => {
  const timer = setTimeout(f, 0);
  return () => clearTimeout(timer);
};
var setMicrotask = (f) => {
  let cancelled = false;
  Promise.resolve().then(() => {
    if (!cancelled)
      f();
  });
  return () => {
    cancelled = true;
  };
};

class PriorityBuckets {
  buckets = [];
  scheduleTask(task, priority) {
    const buckets = this.buckets;
    const len = buckets.length;
    let bucket;
    let index = 0;
    for (;index < len; index++) {
      if (buckets[index][0] > priority)
        break;
      bucket = buckets[index];
    }
    if (bucket && bucket[0] === priority) {
      bucket[1].push(task);
    } else if (index === len) {
      buckets.push([priority, [task]]);
    } else {
      buckets.splice(index, 0, [priority, [task]]);
    }
  }
  drain() {
    const buckets = this.buckets;
    this.buckets = [];
    return buckets;
  }
}

class MixedScheduler {
  executionMode;
  setImmediate;
  constructor(executionMode = "async", setImmediateFn) {
    this.executionMode = executionMode;
    this.setImmediate = setImmediateFn ?? (executionMode === "sync" ? setMicrotask : setImmediate);
  }
  shouldYield(fiber) {
    return fiber.currentOpCount >= fiber.maxOpsBeforeYield;
  }
  makeDispatcher() {
    return new MixedSchedulerDispatcher(this.setImmediate);
  }
}

class MixedSchedulerDispatcher {
  tasks = /* @__PURE__ */ new PriorityBuckets;
  running = undefined;
  setImmediate;
  constructor(setImmediateFn = setImmediate) {
    this.setImmediate = setImmediateFn;
  }
  scheduleTask(task, priority) {
    this.tasks.scheduleTask(task, priority);
    if (this.running === undefined) {
      this.running = this.setImmediate(this.afterScheduled);
    }
  }
  afterScheduled = () => {
    this.running = undefined;
    this.runTasks();
  };
  runTasks() {
    const buckets = this.tasks.drain();
    for (let i = 0;i < buckets.length; i++) {
      const toRun = buckets[i][1];
      for (let j = 0;j < toRun.length; j++) {
        toRun[j]();
      }
    }
  }
  flush() {
    while (this.tasks.buckets.length > 0) {
      if (this.running !== undefined) {
        this.running();
        this.running = undefined;
      }
      this.runTasks();
    }
  }
}
var MaxOpsBeforeYield = /* @__PURE__ */ Reference("effect/Scheduler/MaxOpsBeforeYield", {
  fiberCached: true,
  defaultValue: () => 2048
});
var PreventSchedulerYield = /* @__PURE__ */ Reference("effect/Scheduler/PreventSchedulerYield", {
  fiberCached: true,
  defaultValue: () => false
});

// node_modules/effect/dist/Data.js
var Class3 = class extends Class {
  constructor(props) {
    super();
    if (props) {
      assignProperties(this, props);
    }
  }
};
var Error3 = Error2;
var TaggedError2 = TaggedError;

// node_modules/effect/dist/Encoding.js
var EncodingErrorTypeId = "~effect/encoding/EncodingError";

class EncodingError extends (/* @__PURE__ */ TaggedError2("EncodingError")) {
  [EncodingErrorTypeId] = EncodingErrorTypeId;
}
var encodeBase64 = (input) => typeof input === "string" ? base64EncodeUint8Array(encoder.encode(input)) : base64EncodeUint8Array(input);
var decodeBase64 = (str) => {
  const stripped = stripCrlf(str);
  const length = stripped.length;
  if (length % 4 !== 0) {
    return fail2(new EncodingError({
      kind: "Decode",
      module: "Base64",
      input: stripped,
      message: `Length must be a multiple of 4, but is ${length}`
    }));
  }
  const index = stripped.indexOf("=");
  if (index !== -1 && (index < length - 2 || index === length - 2 && stripped[length - 1] !== "=")) {
    return fail2(new EncodingError({
      kind: "Decode",
      module: "Base64",
      input: stripped,
      message: `Found a '=' character, but it is not at the end`
    }));
  }
  try {
    const missingOctets = stripped.endsWith("==") ? 2 : stripped.endsWith("=") ? 1 : 0;
    const result = new Uint8Array(3 * (length / 4) - missingOctets);
    for (let i = 0, j = 0;i < length; i += 4, j += 3) {
      const buffer = getBase64Code(stripped.charCodeAt(i)) << 18 | getBase64Code(stripped.charCodeAt(i + 1)) << 12 | getBase64Code(stripped.charCodeAt(i + 2)) << 6 | getBase64Code(stripped.charCodeAt(i + 3));
      result[j] = buffer >> 16;
      result[j + 1] = buffer >> 8 & 255;
      result[j + 2] = buffer & 255;
    }
    return succeed2(result);
  } catch (e) {
    return fail2(new EncodingError({
      kind: "Decode",
      module: "Base64",
      input: stripped,
      message: e instanceof Error ? e.message : "Invalid input"
    }));
  }
};
var decodeBase64String = (str) => map2(decodeBase64(str), (_) => decoder.decode(_));
var encodeBase64Url = (input) => typeof input === "string" ? base64UrlEncodeUint8Array(encoder.encode(input)) : base64UrlEncodeUint8Array(input);
var decodeBase64Url = (str) => {
  const stripped = stripCrlf(str);
  const length = stripped.length;
  if (length % 4 === 1) {
    return fail2(new EncodingError({
      module: "Base64Url",
      kind: "Decode",
      input: stripped,
      message: `Length should be a multiple of 4, but is ${length}`
    }));
  }
  if (!/^[-_A-Z0-9]*?={0,2}$/i.test(stripped)) {
    return fail2(new EncodingError({
      module: "Base64Url",
      kind: "Decode",
      input: stripped,
      message: "Invalid input"
    }));
  }
  let sanitized = length % 4 === 2 ? `${stripped}==` : length % 4 === 3 ? `${stripped}=` : stripped;
  sanitized = sanitized.replace(/-/g, "+").replace(/_/g, "/");
  return decodeBase64(sanitized);
};
var decodeBase64UrlString = (str) => map2(decodeBase64Url(str), (_) => decoder.decode(_));
var encodeHex = (input) => typeof input === "string" ? hexEncodeUint8Array(encoder.encode(input)) : hexEncodeUint8Array(input);
var randomHex = (length) => {
  let result = "";
  for (let i = length >>> 3;i > 0; i--) {
    const word = Math.random() * 4294967296 >>> 0;
    result += byteToHex[word >>> 24] + byteToHex[word >>> 16 & 255] + byteToHex[word >>> 8 & 255] + byteToHex[word & 255];
  }
  return result;
};
var decodeHex = (str) => {
  const bytes = new TextEncoder().encode(str);
  if (bytes.length % 2 !== 0) {
    return fail2(new EncodingError({
      module: "Hex",
      kind: "Decode",
      input: str,
      message: `Length must be a multiple of 2, but is ${bytes.length}`
    }));
  }
  try {
    const length = bytes.length / 2;
    const result = new Uint8Array(length);
    for (let i = 0;i < length; i++) {
      const a = fromHexChar(bytes[i * 2]);
      const b = fromHexChar(bytes[i * 2 + 1]);
      result[i] = a << 4 | b;
    }
    return succeed2(result);
  } catch (e) {
    return fail2(new EncodingError({
      module: "Hex",
      kind: "Decode",
      input: str,
      message: e instanceof Error ? e.message : "Invalid input"
    }));
  }
};
var decodeHexString = (str) => map2(decodeHex(str), (_) => decoder.decode(_));
var encoder = /* @__PURE__ */ new TextEncoder;
var decoder = /* @__PURE__ */ new TextDecoder;
var stripCrlf = (str) => str.replace(/[\n\r]/g, "");
var base64EncodeUint8Array = (bytes) => {
  const length = bytes.length;
  let result = "";
  let i;
  for (i = 2;i < length; i += 3) {
    result += base64abc[bytes[i - 2] >> 2];
    result += base64abc[(bytes[i - 2] & 3) << 4 | bytes[i - 1] >> 4];
    result += base64abc[(bytes[i - 1] & 15) << 2 | bytes[i] >> 6];
    result += base64abc[bytes[i] & 63];
  }
  if (i === length + 1) {
    result += base64abc[bytes[i - 2] >> 2];
    result += base64abc[(bytes[i - 2] & 3) << 4];
    result += "==";
  }
  if (i === length) {
    result += base64abc[bytes[i - 2] >> 2];
    result += base64abc[(bytes[i - 2] & 3) << 4 | bytes[i - 1] >> 4];
    result += base64abc[(bytes[i - 1] & 15) << 2];
    result += "=";
  }
  return result;
};
function getBase64Code(charCode) {
  if (charCode >= base64codes.length) {
    throw new TypeError(`Invalid character ${String.fromCharCode(charCode)}`);
  }
  const code = base64codes[charCode];
  if (code === 255) {
    throw new TypeError(`Invalid character ${String.fromCharCode(charCode)}`);
  }
  return code;
}
var base64abc = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "/"];
var base64codes = [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 62, 255, 255, 255, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 255, 255, 255, 0, 255, 255, 255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 255, 255, 255, 255, 255, 255, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51];
var base64UrlEncodeUint8Array = (data) => base64EncodeUint8Array(data).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
var byteToHex = [];
for (let i = 0;i < 256; i++) {
  byteToHex.push(i.toString(16).padStart(2, "0"));
}
var hexEncodeUint8Array = (bytes) => {
  let result = "";
  for (let i = 0;i < bytes.length; i++) {
    result += byteToHex[bytes[i]];
  }
  return result;
};
var fromHexChar = (byte) => {
  if (48 <= byte && byte <= 57) {
    return byte - 48;
  }
  if (97 <= byte && byte <= 102) {
    return byte - 97 + 10;
  }
  if (65 <= byte && byte <= 70) {
    return byte - 65 + 10;
  }
  throw new TypeError("Invalid input");
};

// node_modules/effect/dist/Tracer.js
var ParentSpanKey = "effect/Tracer/ParentSpan";

class ParentSpan extends (/* @__PURE__ */ Service()(ParentSpanKey, {
  fiberCached: true
})) {
}
var make7 = (options) => options;
var DisablePropagation = /* @__PURE__ */ Reference("effect/Tracer/DisablePropagation", {
  defaultValue: constFalse
});
var CurrentTraceLevel = /* @__PURE__ */ Reference("effect/Tracer/CurrentTraceLevel", {
  defaultValue: () => "Info"
});
var MinimumTraceLevel = /* @__PURE__ */ Reference("effect/Tracer/MinimumTraceLevel", {
  defaultValue: () => "All"
});
var TracerKey = "effect/Tracer";
var Tracer = /* @__PURE__ */ Reference(TracerKey, {
  fiberCached: true,
  defaultValue: () => make7({
    span: (options) => new NativeSpan(options)
  })
});

class NativeSpan {
  _tag = "Span";
  spanId;
  traceId = "native";
  sampled;
  name;
  parent;
  annotations;
  links;
  startTime;
  kind;
  status;
  attributes;
  events = [];
  constructor(options) {
    this.name = options.name;
    this.parent = options.parent;
    this.annotations = options.annotations;
    this.links = options.links;
    this.startTime = options.startTime;
    this.kind = options.kind;
    this.sampled = options.sampled;
    this.status = {
      _tag: "Started",
      startTime: options.startTime
    };
    this.attributes = new Map;
    this.traceId = getOrUndefined(options.parent)?.traceId ?? randomHex(32);
    this.spanId = randomHex(16);
  }
  end(endTime, exit) {
    this.status = {
      _tag: "Ended",
      endTime,
      exit,
      startTime: this.status.startTime
    };
  }
  attribute(key, value) {
    this.attributes.set(key, value);
  }
  event(name, startTime, attributes) {
    this.events.push([name, startTime, attributes ?? {}]);
  }
  addLinks(links) {
    this.links.push(...links);
  }
}

// node_modules/effect/dist/internal/metric.js
var FiberRuntimeMetricsKey = "effect/observability/Metric/FiberRuntimeMetricsKey";

// node_modules/effect/dist/internal/references.js
var CurrentErrorReporters = /* @__PURE__ */ Reference("effect/ErrorReporter/CurrentErrorReporters", {
  defaultValue: () => new Set
});
var CurrentStackFrame = /* @__PURE__ */ Reference("effect/References/CurrentStackFrame", {
  fiberCached: true,
  defaultValue: constUndefined
});
var TracerEnabled = /* @__PURE__ */ Reference("effect/References/TracerEnabled", {
  defaultValue: constTrue
});
var TracerTimingEnabled = /* @__PURE__ */ Reference("effect/References/TracerTimingEnabled", {
  defaultValue: constTrue
});
var TracerSpanAnnotations = /* @__PURE__ */ Reference("effect/References/TracerSpanAnnotations", {
  defaultValue: () => ({})
});
var TracerSpanLinks = /* @__PURE__ */ Reference("effect/References/TracerSpanLinks", {
  defaultValue: () => []
});
var CurrentLogAnnotations = /* @__PURE__ */ Reference("effect/References/CurrentLogAnnotations", {
  defaultValue: () => ({})
});
var CurrentLogLevel = /* @__PURE__ */ Reference("effect/References/CurrentLogLevel", {
  fiberCached: true,
  defaultValue: () => "Info"
});
var MinimumLogLevel = /* @__PURE__ */ Reference("effect/References/MinimumLogLevel", {
  fiberCached: true,
  defaultValue: () => "Info"
});
var CurrentLogSpans = /* @__PURE__ */ Reference("effect/References/CurrentLogSpans", {
  defaultValue: () => []
});

// node_modules/effect/dist/internal/stackTraceLimit.js
var isStackTraceLimitWritable = () => {
  const desc = Object.getOwnPropertyDescriptor(Error, "stackTraceLimit");
  if (desc === undefined) {
    return Object.isExtensible(Error);
  }
  return Object.hasOwn(desc, "writable") ? desc.writable === true : desc.set !== undefined;
};
var canWriteStackTraceLimit = /* @__PURE__ */ isStackTraceLimitWritable();
var getStackTraceLimit = () => Error.stackTraceLimit;
var setStackTraceLimit = (value) => {
  if (canWriteStackTraceLimit) {
    Error.stackTraceLimit = value;
  }
};

// node_modules/effect/dist/internal/tracer.js
var addSpanStackTrace = (options) => {
  if (options?.captureStackTrace === false) {
    return options;
  } else if (options?.captureStackTrace !== undefined && typeof options.captureStackTrace !== "boolean") {
    return options;
  }
  const limit = getStackTraceLimit();
  setStackTraceLimit(3);
  const traceError = new Error;
  setStackTraceLimit(limit);
  return {
    ...options,
    captureStackTrace: spanCleaner(() => traceError.stack)
  };
};
var makeStackCleaner = (line) => (stack) => {
  let cache;
  return () => {
    if (cache !== undefined)
      return cache;
    const trace = stack();
    if (!trace)
      return;
    const lines = trace.split(`
`);
    if (lines[line] !== undefined) {
      cache = lines[line].trim();
      return cache;
    }
  };
};
var spanCleaner = /* @__PURE__ */ makeStackCleaner(3);

// node_modules/effect/dist/internal/effect.js
class Interrupt extends ReasonBase {
  fiberId;
  constructor(fiberId, annotations = constEmptyAnnotations) {
    super("Interrupt", annotations, "Interrupted");
    this.fiberId = fiberId;
  }
  toString() {
    return `Interrupt(${this.fiberId})`;
  }
  toJSON() {
    return {
      _tag: "Interrupt",
      fiberId: this.fiberId
    };
  }
  [symbol2](that) {
    return isInterruptReason(that) && this.fiberId === that.fiberId && this.annotations === that.annotations;
  }
  [symbol]() {
    return combine(string(`${this._tag}:${this.fiberId}`))(random(this.annotations));
  }
}
var makeInterruptReason = (fiberId) => new Interrupt(fiberId);
var causeInterrupt = (fiberId) => new CauseImpl([new Interrupt(fiberId)]);
var hasFails = (self) => self.reasons.some(isFailReason);
var findFail = (self) => {
  const reason = self.reasons.find(isFailReason);
  return reason ? succeed2(reason) : fail2(self);
};
var findError = (self) => {
  for (let i = 0;i < self.reasons.length; i++) {
    const reason = self.reasons[i];
    if (reason._tag === "Fail") {
      return succeed2(reason.error);
    }
  }
  return fail2(self);
};
var hasDies = (self) => self.reasons.some(isDieReason);
var findDefect = (self) => {
  const reason = self.reasons.find(isDieReason);
  return reason ? succeed2(reason.defect) : fail2(self);
};
var hasInterrupts = (self) => self.reasons.some(isInterruptReason);
var causeFilterInterruptors = (self) => {
  let interruptors;
  for (let i = 0;i < self.reasons.length; i++) {
    const f = self.reasons[i];
    if (f._tag !== "Interrupt")
      continue;
    interruptors ??= new Set;
    if (f.fiberId !== undefined) {
      interruptors.add(f.fiberId);
    }
  }
  return interruptors ? succeed2(interruptors) : fail2(self);
};
var hasInterruptsOnly = (self) => self.reasons.length > 0 && self.reasons.every(isInterruptReason);
var causeCombine = /* @__PURE__ */ dual(2, (self, that) => {
  if (self.reasons.length === 0) {
    return that;
  } else if (that.reasons.length === 0) {
    return self;
  }
  const newCause = new CauseImpl(union(self.reasons, that.reasons));
  return equals(self, newCause) ? self : newCause;
});
var causeMap = /* @__PURE__ */ dual(2, (self, f) => {
  let hasFail = false;
  const failures = self.reasons.map((failure) => {
    if (isFailReason(failure)) {
      hasFail = true;
      return new Fail(f(failure.error), failure.annotations);
    }
    return failure;
  });
  return hasFail ? causeFromReasons(failures) : self;
});
var causePartition = (self) => {
  const obj = {
    Fail: [],
    Die: [],
    Interrupt: []
  };
  for (let i = 0;i < self.reasons.length; i++) {
    obj[self.reasons[i]._tag].push(self.reasons[i]);
  }
  return obj;
};
var causeSquash = (self) => {
  const partitioned = causePartition(self);
  if (partitioned.Fail.length > 0) {
    return partitioned.Fail[0].error;
  } else if (partitioned.Die.length > 0) {
    return partitioned.Die[0].defect;
  } else if (partitioned.Interrupt.length > 0) {
    return new globalThis.Error("All fibers interrupted without error");
  }
  return new globalThis.Error("Empty cause");
};
var causePrettyErrors = (self, options) => {
  const errors = [];
  const interrupts = [];
  if (self.reasons.length === 0)
    return errors;
  const prevStackLimit = getStackTraceLimit();
  setStackTraceLimit(1);
  for (const failure of self.reasons) {
    if (failure._tag === "Interrupt") {
      interrupts.push(failure);
      continue;
    }
    errors.push(causePrettyError(failure._tag === "Die" ? failure.defect : failure.error, failure.annotations, options));
  }
  if (errors.length === 0) {
    const cause = new Error("The fiber was interrupted by:");
    cause.name = "InterruptCause";
    cause.stack = interruptCauseStack(cause, interrupts);
    const error = new globalThis.Error("All fibers interrupted without error", {
      cause
    });
    error.name = "InterruptError";
    error.stack = `${error.name}: ${error.message}`;
    errors.push(causePrettyError(error, interrupts[0].annotations, options));
  }
  setStackTraceLimit(prevStackLimit);
  return errors;
};
var causePrettyError = (original, annotations, options) => {
  const kind = typeof original;
  let error;
  if (original && kind === "object") {
    error = new globalThis.Error(causePrettyMessage(original), {
      cause: original.cause ? causePrettyError(original.cause) : undefined
    });
    if (typeof original.name === "string") {
      error.name = original.name;
    }
    if (typeof original.stack === "string") {
      error.stack = cleanErrorStack(original.stack, error, annotations);
    } else {
      const stack = `${error.name}: ${error.message}`;
      error.stack = annotations ? addStackAnnotations(stack, annotations) : stack;
    }
    if (options?.includeCauseInStack) {
      error.stack = renderPrettyError(error);
    }
    for (const key of Object.keys(original)) {
      if (!(key in error)) {
        error[key] = original[key];
      }
    }
  } else {
    error = new globalThis.Error(!original ? `Unknown error: ${original}` : kind === "string" ? original : formatJson(original));
  }
  return error;
};
var causePrettyMessage = (u) => {
  if (typeof u.message === "string") {
    return u.message;
  } else if (typeof u.toString === "function" && u.toString !== Object.prototype.toString && u.toString !== Array.prototype.toString) {
    try {
      return u.toString();
    } catch {}
  }
  return formatJson(u);
};
var locationRegExp = /\((.*)\)/g;
var cleanErrorStack = (stack, error, annotations) => {
  const message = `${error.name}: ${error.message}`;
  const lines = (stack.startsWith(message) ? stack.slice(message.length) : stack).split(`
`);
  const out = [message];
  for (let i = 1;i < lines.length; i++) {
    if (/(?:Generator\.next|~effect\/Effect)/.test(lines[i])) {
      break;
    }
    out.push(lines[i]);
  }
  return annotations ? addStackAnnotations(out.join(`
`), annotations) : out.join(`
`);
};
var addStackAnnotations = (stack, annotations) => {
  const frame = annotations?.get(StackTraceKey.key);
  if (frame) {
    stack = `${stack}
${currentStackTrace(frame)}`;
  }
  return stack;
};
var interruptCauseStack = (error, interrupts) => {
  const out = [`${error.name}: ${error.message}`];
  for (const current of interrupts) {
    const fiberId = current.fiberId !== undefined ? `#${current.fiberId}` : "unknown";
    const frame = current.annotations.get(InterruptorStackTrace.key);
    out.push(`    at fiber (${fiberId})`);
    if (frame)
      out.push(currentStackTrace(frame));
  }
  return out.join(`
`);
};
var currentStackTrace = (frame) => {
  const out = [];
  let current = frame;
  let i = 0;
  while (current && i < 10) {
    const stack = current.stack();
    if (stack) {
      const locationMatchAll = stack.matchAll(locationRegExp);
      let match4 = false;
      for (const [, location] of locationMatchAll) {
        match4 = true;
        out.push(`    at ${current.name} (${location})`);
      }
      if (!match4) {
        out.push(`    at ${current.name} (${stack.replace(/^at /, "")})`);
      }
    } else {
      out.push(`    at ${current.name}`);
    }
    current = current.parent;
    i++;
  }
  return out.join(`
`);
};
var causePretty = (cause) => causePrettyErrors(cause).map(renderPrettyError).join(`
`);
var renderPrettyError = (e) => e.cause ? `${e.stack} {
${renderErrorCause(e.cause, "  ")}
}` : e.stack;
var renderErrorCause = (cause, prefix) => {
  const lines = cause.stack.split(`
`);
  let stack = `${prefix}[cause]: ${lines[0]}`;
  for (let i = 1, len = lines.length;i < len; i++) {
    stack += `
${prefix}${lines[i]}`;
  }
  if (cause.cause) {
    stack += ` {
${renderErrorCause(cause.cause, `${prefix}  `)}
${prefix}}`;
  }
  return stack;
};
var FiberTypeId = "~effect/Fiber";
var fiberVariance = {
  _A: identity,
  _E: identity
};
var fiberIdStore = {
  id: 0
};
var getCurrentFiber = () => globalThis[currentFiberTypeId];

class FiberImpl {
  constructor(context, interruptible = true) {
    this[FiberTypeId] = fiberVariance;
    this.setContext(context);
    this.id = ++fiberIdStore.id;
    this.currentOpCount = 0;
    this.interruptible = interruptible;
    this._stack = [];
    this._observers = [];
    this._exit = undefined;
    this._children = undefined;
    this._interruptedCause = undefined;
    this._yielded = undefined;
    this._running = false;
    this._deferredInterrupt = false;
    this.runtimeMetrics?.recordFiberStart(this.context);
  }
  [FiberTypeId];
  id;
  interruptible;
  currentOpCount;
  _stack;
  _observers;
  _exit;
  _children;
  _interruptedCause;
  _yielded;
  _running;
  _deferredInterrupt;
  context;
  currentScheduler;
  currentTracerContext;
  currentSpan;
  currentLogLevel;
  minimumLogLevel;
  currentStackFrame;
  runtimeMetrics;
  maxOpsBeforeYield;
  currentPreventYield;
  _dispatcher = undefined;
  get currentDispatcher() {
    return this._dispatcher ??= this.currentScheduler.makeDispatcher();
  }
  getRef(ref) {
    return get(this.context, ref);
  }
  addObserver(cb) {
    if (this._exit) {
      cb(this._exit);
      return constVoid;
    }
    this._observers.push(cb);
    return () => {
      if (this._exit)
        return;
      const index = this._observers.indexOf(cb);
      if (index >= 0) {
        this._observers.splice(index, 1);
      }
    };
  }
  interruptUnsafe(fiberId, annotations) {
    if (this._exit) {
      return;
    }
    let cause = causeInterrupt(fiberId);
    if (this.currentStackFrame) {
      cause = causeAnnotate(cause, make5(StackTraceKey, this.currentStackFrame));
    }
    if (annotations) {
      cause = causeAnnotate(cause, annotations);
    }
    this._interruptedCause = this._interruptedCause ? causeCombine(this._interruptedCause, cause) : cause;
    if (this.interruptible) {
      if (this._running) {
        this._deferredInterrupt = true;
      } else {
        this.evaluate(failCause(this._interruptedCause));
      }
    }
  }
  pollUnsafe() {
    return this._exit;
  }
  evaluate(effect) {
    if (this._exit) {
      return;
    } else if (this._yielded !== undefined) {
      const yielded = this._yielded;
      this._yielded = undefined;
      yielded();
    }
    const exit = this.runLoop(effect);
    if (exit === Yield) {
      return;
    }
    const interruptChildren = fiberMiddleware.interruptChildren && fiberMiddleware.interruptChildren(this);
    if (interruptChildren !== undefined) {
      return this.evaluate(flatMap3(interruptChildren, () => exit));
    }
    this._exit = exit;
    this.runtimeMetrics?.recordFiberEnd(this.context, this._exit);
    for (let i = 0;i < this._observers.length; i++) {
      this._observers[i](exit);
    }
    this._observers.length = 0;
    this._stack.length = 0;
    this._children = undefined;
    this.context = empty();
  }
  runLoop(effect) {
    const prevFiber = globalThis[currentFiberTypeId];
    globalThis[currentFiberTypeId] = this;
    const prevRunning = this._running;
    this._running = true;
    let yielding = false;
    let current = effect;
    this.currentOpCount = 0;
    try {
      while (true) {
        if (this._deferredInterrupt) {
          this._deferredInterrupt = false;
          current = failCause(this._interruptedCause);
        }
        this.currentOpCount++;
        if (!yielding && !this.currentPreventYield && this.currentScheduler.shouldYield(this)) {
          yielding = true;
          const prev = current;
          current = flatMap3(yieldNow, () => prev);
        }
        current = this.currentTracerContext ? this.currentTracerContext(current, this) : current[evaluate](this);
        if (current === Yield) {
          const yielded = this._yielded;
          if (ExitTypeId in yielded) {
            this._deferredInterrupt = false;
            this._yielded = undefined;
            return yielded;
          } else if (this._deferredInterrupt) {
            this._yielded = undefined;
            yielded();
            continue;
          }
          return Yield;
        }
      }
    } catch (error) {
      if (!hasProperty(current, evaluate)) {
        return exitDie(`Fiber.runLoop: Not a valid effect: ${String(current)}`);
      }
      return this.runLoop(exitDie(error));
    } finally {
      this._running = prevRunning;
      globalThis[currentFiberTypeId] = prevFiber;
    }
  }
  getCont(symbol3) {
    if (this._deferredInterrupt) {
      this._deferredInterrupt = false;
      return deferredInterruptCont;
    }
    while (true) {
      const op = this._stack.pop();
      if (!op)
        return;
      const cont = op[contAll] && op[contAll](this);
      if (cont) {
        cont[symbol3] = cont;
        return cont;
      }
      if (op[symbol3])
        return op;
    }
  }
  yieldWith(value) {
    this._yielded = value;
    return Yield;
  }
  children() {
    return this._children ??= new Set;
  }
  pipe() {
    return pipeArguments(this, arguments);
  }
  setContext(context) {
    const previous = this.context;
    this.context = context;
    if (previous !== undefined && hasSameCache(previous, context))
      return;
    const scheduler = this.getRef(Scheduler);
    if (scheduler !== this.currentScheduler) {
      this.currentScheduler = scheduler;
      this._dispatcher = undefined;
    }
    this.currentSpan = getOrUndefinedUnsafe(context, ParentSpanKey);
    this.currentLogLevel = this.getRef(CurrentLogLevel);
    this.minimumLogLevel = this.getRef(MinimumLogLevel);
    this.currentStackFrame = this.getRef(CurrentStackFrame);
    this.maxOpsBeforeYield = this.getRef(MaxOpsBeforeYield);
    this.currentPreventYield = this.getRef(PreventSchedulerYield);
    this.runtimeMetrics = getOrUndefinedUnsafe(context, FiberRuntimeMetricsKey);
    const currentTracer = getOrUndefinedUnsafe(context, TracerKey);
    this.currentTracerContext = currentTracer ? currentTracer["context"] : undefined;
  }
  get currentSpanLocal() {
    return this.currentSpan?._tag === "Span" ? this.currentSpan : undefined;
  }
}
var deferredInterruptCont = {
  [contA](_value, fiber) {
    return failCause(fiber._interruptedCause);
  },
  [contE](_cause, fiber) {
    return failCause(fiber._interruptedCause);
  }
};
var fiberMiddleware = {
  interruptChildren: undefined
};
var fiberStackAnnotations = (fiber) => {
  if (!fiber.currentStackFrame)
    return;
  const annotations = new Map;
  annotations.set(InterruptorStackTrace.key, fiber.currentStackFrame);
  return makeUnsafe(annotations);
};
var fiberInterruptChildren = (fiber) => {
  if (fiber._children === undefined || fiber._children.size === 0) {
    return;
  }
  return fiberInterruptAll(fiber._children);
};
var fiberAwait = (self) => {
  const impl = self;
  if (impl._exit)
    return succeed3(impl._exit);
  return callback((resume) => {
    if (impl._exit)
      return resume(succeed3(impl._exit));
    return sync(self.addObserver((exit) => resume(succeed3(exit))));
  });
};
var fiberAwaitAll = (self) => callback((resume) => {
  const iter = self[Symbol.iterator]();
  const exits = [];
  let cancel = undefined;
  function loop() {
    let result = iter.next();
    while (!result.done) {
      if (result.value._exit) {
        exits.push(result.value._exit);
        result = iter.next();
        continue;
      }
      cancel = result.value.addObserver((exit) => {
        exits.push(exit);
        loop();
      });
      return;
    }
    resume(succeed3(exits));
  }
  loop();
  return sync(() => cancel?.());
});
var fiberJoin = (self) => {
  const impl = self;
  if (impl._exit)
    return impl._exit;
  return callback((resume) => {
    if (impl._exit)
      return resume(impl._exit);
    return sync(self.addObserver(resume));
  });
};
var fiberJoinAll = (self) => callback((resume) => {
  const fibers = Array.from(self);
  if (fibers.length === 0)
    return resume(succeed3(empty2()));
  const out = new Array(fibers.length);
  const cancels = empty2();
  let done2 = 0;
  let failed = false;
  for (let i = 0;i < fibers.length; i++) {
    if (failed)
      break;
    cancels.push(fibers[i].addObserver((exit) => {
      done2++;
      if (exit._tag === "Failure") {
        failed = true;
        cancels.forEach((cancel) => cancel());
        return resume(exit);
      }
      out[i] = exit.value;
      if (done2 === fibers.length) {
        resume(succeed3(out));
      }
    }));
  }
  return sync(() => {
    failed = true;
    cancels.forEach((cancel) => cancel());
  });
});
var fiberInterrupt = (self) => withFiber((fiber) => fiberInterruptAs(self, fiber.id));
var fiberInterruptAs = /* @__PURE__ */ dual((args2) => hasProperty(args2[0], FiberTypeId), (self, fiberId, annotations) => withFiber((parent) => {
  let ann = fiberStackAnnotations(parent);
  ann = ann && annotations ? merge(ann, annotations) : ann ?? annotations;
  self.interruptUnsafe(fiberId, ann);
  return asVoid(fiberAwait(self));
}));
var fiberInterruptAll = (fibers) => withFiber((parent) => {
  const annotations = fiberStackAnnotations(parent);
  let fiberArr = empty2();
  for (const fiber of fibers) {
    fiber.interruptUnsafe(parent.id, annotations);
    fiberArr.push(fiber);
  }
  return asVoid(fiberAwaitAll(fiberArr));
});
var succeed3 = exitSucceed;
var failCause = exitFailCause;
var fail3 = exitFail;
var sync = /* @__PURE__ */ makePrimitive({
  op: "Sync",
  [evaluate](fiber) {
    const value = this[args]();
    const cont = fiber.getCont(contA);
    return cont ? cont[contA](value, fiber) : fiber.yieldWith(exitSucceed(value));
  }
});
var suspend = /* @__PURE__ */ makePrimitive({
  op: "Suspend",
  [evaluate](_fiber) {
    return this[args]();
  }
});
var fromOption2 = /* @__PURE__ */ dual((args2) => args2.length >= 2 || isOption2(args2[0]), (option, onNone) => isNone2(option) ? fail3(onNone ? onNone() : new NoSuchElementError("Effect.fromOption: Option.none")) : succeed3(option.value));
var fromResult = /* @__PURE__ */ match3({
  onFailure: fail3,
  onSuccess: succeed3
});
var fromNullishOr2 = (value) => value == null ? fail3(new NoSuchElementError) : succeed3(value);
var yieldNowWith = /* @__PURE__ */ makePrimitive({
  op: "Yield",
  [evaluate](fiber) {
    let resumed = false;
    fiber.currentDispatcher.scheduleTask(() => {
      if (resumed)
        return;
      fiber.evaluate(exitVoid);
    }, this[args] ?? 0);
    return fiber.yieldWith(() => {
      resumed = true;
    });
  }
});
var yieldNow = /* @__PURE__ */ yieldNowWith(0);
var succeedSome = (a) => succeed3(some2(a));
var succeedNone = /* @__PURE__ */ succeed3(/* @__PURE__ */ none2());
var transposeOption = (self) => isNone2(self) ? succeedNone : map5(self.value, some2);
var failCauseSync = (evaluate2) => suspend(() => failCause(internalCall(evaluate2)));
var die = (defect) => exitDie(defect);
var failSync = (error) => suspend(() => fail3(internalCall(error)));
var void_ = /* @__PURE__ */ succeed3(undefined);
var try_2 = (options) => {
  const evaluate2 = typeof options === "function" ? options : options.try;
  const catcher = typeof options === "function" ? (cause) => new UnknownError(cause, "An error occurred in Effect.try") : options.catch;
  return suspend(() => {
    try {
      return succeed3(internalCall(evaluate2));
    } catch (err) {
      return fail3(internalCall(() => catcher(err)));
    }
  });
};
var promise = (evaluate2) => callbackOptions(function(resume, signal) {
  internalCall(() => evaluate2(signal)).then((a) => resume(succeed3(a)), (e) => resume(die(e)));
}, evaluate2.length !== 0);
var tryPromise = (options) => {
  const f = typeof options === "function" ? options : options.try;
  const catcher = typeof options === "function" ? (cause) => new UnknownError(cause, "An error occurred in Effect.tryPromise") : options.catch;
  return callbackOptions(function(resume, signal) {
    const failWithCatch = (cause) => {
      try {
        resume(fail3(internalCall(() => catcher(cause))));
      } catch (err) {
        resume(die(err));
      }
    };
    try {
      internalCall(() => f(signal)).then((a) => resume(succeed3(a)), failWithCatch);
    } catch (err) {
      failWithCatch(err);
    }
  }, f.length !== 0);
};
var withFiberId = (f) => withFiber((fiber) => f(fiber.id));
var fiber = /* @__PURE__ */ withFiber(succeed3);
var fiberId = /* @__PURE__ */ withFiberId(succeed3);
var callbackOptions = /* @__PURE__ */ makePrimitive({
  op: "Async",
  single: false,
  [evaluate](fiber2) {
    const register = internalCall(() => this[args][0].bind(fiber2.currentScheduler));
    let resumed = false;
    let yielded = false;
    const controller = this[args][1] ? new AbortController : undefined;
    const onCancel = register((effect) => {
      if (resumed)
        return;
      resumed = true;
      if (yielded) {
        fiber2.evaluate(effect);
      } else {
        yielded = effect;
      }
    }, controller?.signal);
    if (yielded !== false)
      return yielded;
    yielded = true;
    fiber2._yielded = () => {
      resumed = true;
    };
    if (controller === undefined && onCancel === undefined) {
      return Yield;
    }
    fiber2._stack.push(asyncFinalizer(() => {
      resumed = true;
      controller?.abort();
      return onCancel ?? exitVoid;
    }));
    return Yield;
  }
});
var asyncFinalizer = /* @__PURE__ */ makePrimitive({
  op: "AsyncFinalizer",
  [contAll](fiber2) {
    if (fiber2.interruptible) {
      fiber2.interruptible = false;
      fiber2._stack.push(setInterruptibleTrue);
    }
  },
  [contE](cause, _fiber) {
    return hasInterrupts(cause) ? flatMap3(this[args](), () => failCause(cause)) : failCause(cause);
  }
});
var callback = (register) => callbackOptions(register, register.length >= 2);
var never = /* @__PURE__ */ callback(constVoid);
var gen = (...args2) => suspend(() => fromIteratorUnsafe(args2.length === 1 ? args2[0]() : args2[1].call(args2[0].self)));
var fnUntraced = (body, ...pipeables) => {
  const fn = pipeables.length === 0 ? function() {
    return suspend(() => fromIteratorUnsafe(body.apply(this, arguments)));
  } : function() {
    let effect = suspend(() => fromIteratorUnsafe(body.apply(this, arguments)));
    for (let i = 0;i < pipeables.length; i++) {
      effect = pipeables[i](effect, ...arguments);
    }
    return effect;
  };
  return defineFunctionLength(body.length, fn);
};
var defineFunctionLength = (length, fn) => Object.defineProperty(fn, "length", {
  value: length,
  configurable: true
});
var fnStackCleaner = /* @__PURE__ */ makeStackCleaner(2);
var fn = function() {
  const nameFirst = typeof arguments[0] === "string";
  const name = nameFirst ? arguments[0] : "Effect.fn";
  const spanOptions = nameFirst ? arguments[1] : undefined;
  const prevLimit = getStackTraceLimit();
  setStackTraceLimit(2);
  const defError = new globalThis.Error;
  setStackTraceLimit(prevLimit);
  if (nameFirst) {
    return (body, ...pipeables) => makeFn(name, body, defError, pipeables, nameFirst, spanOptions);
  }
  return makeFn(name, arguments[0], defError, Array.prototype.slice.call(arguments, 1), nameFirst, spanOptions);
};
var makeFn = (name, bodyOrOptions, defError, pipeables, addSpan, spanOptions) => {
  const body = typeof bodyOrOptions === "function" ? bodyOrOptions : pipeables.shift().bind(bodyOrOptions.self);
  return defineFunctionLength(body.length, function(...args2) {
    let result = suspend(() => {
      const iter = body.apply(this, arguments);
      return isEffect(iter) ? iter : fromIteratorUnsafe(iter);
    });
    for (let i = 0;i < pipeables.length; i++) {
      result = pipeables[i](result, ...args2);
    }
    if (!isEffect(result)) {
      return result;
    }
    const prevLimit = getStackTraceLimit();
    setStackTraceLimit(2);
    const callError = new globalThis.Error;
    setStackTraceLimit(prevLimit);
    return updateService(addSpan ? useSpan(name, spanOptions, (span) => provideParentSpan(result, span)) : result, CurrentStackFrame, (prev) => ({
      name,
      stack: fnStackCleaner(() => callError.stack),
      parent: {
        name: `${name} (definition)`,
        stack: fnStackCleaner(() => defError.stack),
        parent: prev
      }
    }));
  });
};
var fnUntracedEager = (body, ...pipeables) => defineFunctionLength(body.length, pipeables.length === 0 ? function() {
  return fromIteratorEagerUnsafe(() => body.apply(this, arguments));
} : function() {
  let effect = fromIteratorEagerUnsafe(() => body.apply(this, arguments));
  for (const pipeable of pipeables) {
    effect = pipeable(effect);
  }
  return effect;
});
var fromIteratorEagerUnsafe = (evaluate2) => {
  try {
    const iterator = evaluate2();
    let value = undefined;
    while (true) {
      const state = iterator.next(value);
      if (state.done) {
        return succeed3(state.value);
      }
      const primitive = state.value;
      if (primitive && primitive._tag === "Success") {
        value = primitive.value;
        continue;
      } else if (primitive && primitive._tag === "Failure") {
        return state.value;
      } else {
        let isFirstExecution = true;
        return suspend(() => {
          if (isFirstExecution) {
            isFirstExecution = false;
            return flatMap3(state.value, (value2) => fromIteratorUnsafe(iterator, value2));
          } else {
            return suspend(() => fromIteratorUnsafe(evaluate2()));
          }
        });
      }
    }
  } catch (error) {
    return die(error);
  }
};
var fromIteratorUnsafe = /* @__PURE__ */ makePrimitive({
  op: "Iterator",
  single: false,
  [contA](value, fiber2) {
    const iter = this[args][0];
    while (true) {
      const state = iter.next(value);
      if (state.done)
        return succeed3(state.value);
      if (!effectIsExit(state.value)) {
        fiber2._stack.push(this);
        return state.value;
      } else if (state.value._tag === "Failure") {
        return state.value;
      }
      value = state.value.value;
    }
  },
  [evaluate](fiber2) {
    return this[contA](this[args][1], fiber2);
  }
});
var as = /* @__PURE__ */ dual(2, (self, value) => {
  const b = succeed3(value);
  return flatMap3(self, (_) => b);
});
var asSome = (self) => map5(self, some2);
var flip = (self) => matchEffect(self, {
  onFailure: succeed3,
  onSuccess: fail3
});
var andThen = /* @__PURE__ */ dual(2, (self, f) => flatMap3(self, (a) => isEffect(f) ? f : internalCall(() => f(a))));
var tap = /* @__PURE__ */ dual(2, (self, f) => flatMap3(self, (a) => as(isEffect(f) ? f : internalCall(() => f(a)), a)));
var asVoid = (self) => flatMap3(self, (_) => exitVoid);
var sandbox = (self) => catchCause(self, fail3);
var raceAll = (all, options) => withFiber((parent) => callback((resume) => {
  const effects = fromIterable(all);
  const len = effects.length;
  let doneCount = 0;
  let done2 = false;
  const fibers = new Set;
  const failures = [];
  const onExit = (exit, fiber2, i) => {
    doneCount++;
    if (exit._tag === "Failure") {
      failures.push(...exit.cause.reasons);
      if (doneCount >= len) {
        resume(failCause(causeFromReasons(failures)));
      }
      return;
    }
    const isWinner = !done2;
    done2 = true;
    resume(fibers.size === 0 ? exit : flatMap3(uninterruptible(fiberInterruptAll(fibers)), () => exit));
    if (isWinner && options?.onWinner) {
      options.onWinner({
        fiber: fiber2,
        index: i,
        parentFiber: parent
      });
    }
  };
  for (let i = 0;i < len; i++) {
    const fiber2 = forkUnsafe(parent, effects[i], true, true, false);
    fibers.add(fiber2);
    fiber2.addObserver((exit) => {
      fibers.delete(fiber2);
      onExit(exit, fiber2, i);
    });
    if (done2)
      break;
  }
  return fiberInterruptAll(fibers);
}));
var raceAllFirst = (all, options) => withFiber((parent) => callback((resume) => {
  let done2 = false;
  const fibers = new Set;
  const onExit = (exit) => {
    done2 = true;
    resume(fibers.size === 0 ? exit : flatMap3(uninterruptible(fiberInterruptAll(fibers)), () => exit));
  };
  let i = 0;
  for (const effect of all) {
    if (done2)
      break;
    const index = i++;
    const fiber2 = forkUnsafe(parent, effect, true, true, false);
    fibers.add(fiber2);
    fiber2.addObserver((exit) => {
      fibers.delete(fiber2);
      const isWinner = !done2;
      onExit(exit);
      if (isWinner && options?.onWinner) {
        options.onWinner({
          fiber: fiber2,
          index,
          parentFiber: parent
        });
      }
    });
  }
  return fiberInterruptAll(fibers);
}));
var race = /* @__PURE__ */ dual((args2) => isEffect(args2[1]), (self, that, options) => raceAll([self, that], options));
var raceFirst = /* @__PURE__ */ dual((args2) => isEffect(args2[1]), (self, that, options) => raceAllFirst([self, that], options));
var flatMap3 = /* @__PURE__ */ dual(2, (self, f) => {
  const onSuccess = Object.create(OnSuccessProto);
  onSuccess[args] = self;
  onSuccess[contA] = f.length !== 1 ? (a) => f(a) : f;
  return onSuccess;
});
var OnSuccessProto = /* @__PURE__ */ makePrimitiveProto({
  op: "OnSuccess",
  [evaluate](fiber2) {
    fiber2._stack.push(this);
    return this[args];
  }
});
var matchCauseEffectEager = /* @__PURE__ */ dual(2, (self, options) => {
  if (effectIsExit(self)) {
    return self._tag === "Success" ? options.onSuccess(self.value) : options.onFailure(self.cause);
  }
  return matchCauseEffect(self, options);
});
var effectIsExit = (effect) => (ExitTypeId in effect);
var flatMapEager = /* @__PURE__ */ dual(2, (self, f) => {
  if (effectIsExit(self)) {
    return self._tag === "Success" ? f(self.value) : self;
  }
  return flatMap3(self, f);
});
var flatten4 = (self) => flatMap3(self, identity);
var map5 = /* @__PURE__ */ dual(2, (self, f) => flatMap3(self, (a) => succeed3(internalCall(() => f(a)))));
var mapEager = /* @__PURE__ */ dual(2, (self, f) => effectIsExit(self) ? exitMap(self, f) : map5(self, f));
var mapErrorEager = /* @__PURE__ */ dual(2, (self, f) => effectIsExit(self) ? exitMapError(self, f) : mapError2(self, f));
var mapBothEager = /* @__PURE__ */ dual(2, (self, options) => effectIsExit(self) ? exitMapBoth(self, options) : mapBoth(self, options));
var catchEager = /* @__PURE__ */ dual(2, (self, f) => {
  if (effectIsExit(self)) {
    if (self._tag === "Success")
      return self;
    const error = findError(self.cause);
    if (isFailure2(error))
      return self;
    return f(error.success);
  }
  return catch_(self, f);
});
var exitInterrupt = (fiberId2) => exitFailCause(causeInterrupt(fiberId2));
var exitIsSuccess = (self) => self._tag === "Success";
var exitIsFailure = (self) => self._tag === "Failure";
var exitFilterCause = (self) => self._tag === "Failure" ? succeed2(self.cause) : fail2(self);
var exitVoid = /* @__PURE__ */ exitSucceed(undefined);
var exitMap = /* @__PURE__ */ dual(2, (self, f) => self._tag === "Success" ? exitSucceed(f(self.value)) : self);
var exitMapError = /* @__PURE__ */ dual(2, (self, f) => {
  if (self._tag === "Success")
    return self;
  const error = findError(self.cause);
  if (isFailure2(error))
    return self;
  return exitFail(f(error.success));
});
var exitMapBoth = /* @__PURE__ */ dual(2, (self, options) => {
  if (self._tag === "Success")
    return exitSucceed(options.onSuccess(self.value));
  const error = findError(self.cause);
  if (isFailure2(error))
    return self;
  return exitFail(options.onFailure(error.success));
});
var exitZipRight = /* @__PURE__ */ dual(2, (self, that) => exitIsSuccess(self) ? that : self);
var exitMatch = /* @__PURE__ */ dual(2, (self, options) => exitIsSuccess(self) ? options.onSuccess(self.value) : options.onFailure(self.cause));
var exitAsVoidAll = (exits) => {
  const failures = [];
  for (const exit of exits) {
    if (exit._tag === "Failure") {
      failures.push(...exit.cause.reasons);
    }
  }
  return failures.length === 0 ? exitVoid : exitFailCause(causeFromReasons(failures));
};
var service = (service2) => service2;
var serviceOption = (service2) => withFiber((fiber2) => succeed3(getOption(fiber2.context, service2)));
var serviceOptional = (service2) => withFiber((fiber2) => fromOption2(getOption(fiber2.context, service2)));
var updateContext = /* @__PURE__ */ dual(2, (self, f) => withFiber((fiber2) => {
  const prevContext = fiber2.context;
  const nextContext = f(prevContext);
  if (prevContext === nextContext)
    return self;
  fiber2.setContext(nextContext);
  return onExitPrimitive(self, () => {
    fiber2.setContext(prevContext);
    return;
  });
}));
var updateService = /* @__PURE__ */ dual(3, (self, service2, f) => updateContext(self, (s) => {
  const prev = getUnsafe(s, service2);
  const next = f(prev);
  if (prev === next)
    return s;
  return add(s, service2, next);
}));
var updateServiceScoped = (service2, update, options) => uninterruptible(withFiber((fiber2) => {
  const original = getUnsafe(fiber2.context, service2);
  const updated = update(original);
  fiber2.setContext(add(fiber2.context, service2, updated));
  return scopeAddFinalizerExit(getUnsafe(fiber2.context, scopeTag), (_) => {
    const current = getUnsafe(fiber2.context, service2);
    let next;
    if (options?.reset === undefined) {
      if (current !== updated)
        return void_;
      next = original;
    } else {
      next = options.reset(original, updated, current);
    }
    fiber2.setContext(add(fiber2.context, service2, next));
    return void_;
  });
}));
var context = () => getContext;
var getContext = /* @__PURE__ */ withFiber((fiber2) => succeed3(fiber2.context));
var contextWith = (f) => withFiber((fiber2) => f(fiber2.context));
var setContext = /* @__PURE__ */ dual(2, (self, context2) => updateContext(self, constant(context2)));
var provideContext = /* @__PURE__ */ dual(2, (self, context2) => {
  if (effectIsExit(self))
    return self;
  return updateContext(self, merge(context2));
});
var provideService = function() {
  if (arguments.length === 1) {
    return dual(2, (self, impl) => provideServiceImpl(self, arguments[0], impl));
  }
  return dual(3, (self, service2, impl) => provideServiceImpl(self, service2, impl)).apply(this, arguments);
};
var provideServiceImpl = (self, service2, implementation) => updateContext(self, add(service2, implementation));
var provideServiceEffect = /* @__PURE__ */ dual(3, (self, service2, acquire) => flatMap3(acquire, (implementation) => provideService(self, service2, implementation)));
var zip = /* @__PURE__ */ dual((args2) => isEffect(args2[1]), (self, that, options) => zipWith(self, that, (a, a2) => [a, a2], options));
var zipWith = /* @__PURE__ */ dual((args2) => isEffect(args2[1]), (self, that, f, options) => options?.concurrent ? map5(all([self, that], {
  concurrency: 2
}), ([a, a2]) => internalCall(() => f(a, a2))) : flatMap3(self, (a) => map5(that, (a2) => internalCall(() => f(a, a2)))));
var filterOrFail = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, predicate, orFailWith) => filterOrElse(self, predicate, orFailWith ? (a) => fail3(orFailWith(a)) : () => fail3(new NoSuchElementError)));
var when = /* @__PURE__ */ dual(2, (self, condition) => flatMap3(condition, (pass) => pass ? asSome(self) : succeedNone));
var replicate = /* @__PURE__ */ dual(2, (self, n) => Array.from({
  length: n
}, () => self));
var replicateEffect = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, n, options) => all(replicate(self, n), options));
var forever2 = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, options) => whileLoop({
  while: constTrue,
  body: constant(options?.disableYield ? self : flatMap3(self, (_) => yieldNow)),
  step: constVoid
}));
var catchCause = /* @__PURE__ */ dual(2, (self, f) => {
  const onFailure = Object.create(OnFailureProto);
  onFailure[args] = self;
  onFailure[contE] = f.length !== 1 ? (cause) => f(cause) : f;
  return onFailure;
});
var OnFailureProto = /* @__PURE__ */ makePrimitiveProto({
  op: "OnFailure",
  [evaluate](fiber2) {
    fiber2._stack.push(this);
    return this[args];
  }
});
var catchCauseIf = /* @__PURE__ */ dual(3, (self, predicate, f) => catchCause(self, (cause) => {
  if (!predicate(cause)) {
    return failCause(cause);
  }
  return internalCall(() => f(cause));
}));
var catchCauseFilter = /* @__PURE__ */ dual(3, (self, filter4, f) => catchCause(self, (cause) => {
  const eb = filter4(cause);
  return isFailure2(eb) ? failCause(eb.failure) : internalCall(() => f(eb.success, cause));
}));
var catch_ = /* @__PURE__ */ dual(2, (self, f) => catchCauseFilter(self, findError, (e) => f(e)));
var catchNoSuchElement = (self) => matchEffect(self, {
  onFailure: (error) => isNoSuchElementError(error) ? succeedNone : fail3(error),
  onSuccess: succeedSome
});
var catchDefect = /* @__PURE__ */ dual(2, (self, f) => catchCauseFilter(self, findDefect, f));
var tapCause = /* @__PURE__ */ dual(2, (self, f) => catchCause(self, (cause) => andThen(internalCall(() => f(cause)), failCause(cause))));
var tapCauseIf = /* @__PURE__ */ dual(3, (self, predicate, f) => catchCauseIf(self, predicate, (cause) => andThen(internalCall(() => f(cause)), failCause(cause))));
var tapCauseFilter = /* @__PURE__ */ dual(3, (self, filter4, f) => catchCause(self, (cause) => {
  const result = filter4(cause);
  if (isFailure2(result)) {
    return failCause(cause);
  }
  return andThen(internalCall(() => f(result.success, cause)), failCause(cause));
}));
var tapError = /* @__PURE__ */ dual(2, (self, f) => tapCauseFilter(self, findError, (e) => f(e)));
var tapErrorTag = /* @__PURE__ */ dual(3, (self, k, f) => {
  const predicate = Array.isArray(k) ? (e) => hasProperty(e, "_tag") && k.includes(e._tag) : isTagged(k);
  return tapError(self, (error) => predicate(error) ? f(error) : void_);
});
var tapDefect = /* @__PURE__ */ dual(2, (self, f) => tapCauseFilter(self, findDefect, (_) => f(_)));
var catchIf = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, predicate, f, orElse) => catchCause(self, (cause) => {
  const error = findError(cause);
  if (isFailure2(error))
    return failCause(error.failure);
  if (!predicate(error.success)) {
    return orElse ? internalCall(() => orElse(error.success)) : failCause(cause);
  }
  return internalCall(() => f(error.success));
}));
var catchFilter = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, filter4, f, orElse) => catchCause(self, (cause) => {
  const error = findError(cause);
  if (isFailure2(error))
    return failCause(error.failure);
  const result = filter4(error.success);
  if (isFailure2(result)) {
    return orElse ? internalCall(() => orElse(result.failure)) : failCause(cause);
  }
  return internalCall(() => f(result.success));
}));
var catchTag = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, k, f, orElse) => {
  const pred = Array.isArray(k) ? (e) => hasProperty(e, "_tag") && k.includes(e._tag) : isTagged(k);
  return catchIf(self, pred, f, orElse);
});
var catchTags = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, cases, orElse) => {
  let keys2;
  return catchFilter(self, (e) => {
    keys2 ??= Object.keys(cases);
    return hasProperty(e, "_tag") && isString(e["_tag"]) && keys2.includes(e["_tag"]) ? succeed2(e) : fail2(e);
  }, (e) => internalCall(() => cases[e["_tag"]](e)), orElse);
});
var catchReason = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, errorTag, reasonTag, f, orElse) => catchIf(self, (e) => isTagged(e, errorTag) && hasProperty(e, "reason"), (e) => {
  const reason = e.reason;
  if (isTagged(reason, reasonTag))
    return f(reason, e);
  return orElse ? internalCall(() => orElse(reason, e)) : fail3(e);
}));
var catchReasons = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, errorTag, cases, orElse) => {
  let keys2;
  return catchIf(self, (e) => isTagged(e, errorTag) && hasProperty(e, "reason") && hasProperty(e.reason, "_tag") && isString(e.reason._tag), (e) => {
    const reason = e.reason;
    keys2 ??= Object.keys(cases);
    if (keys2.includes(reason._tag)) {
      return internalCall(() => cases[reason._tag](reason, e));
    }
    return orElse ? internalCall(() => orElse(reason, e)) : fail3(e);
  });
});
var unwrapReason = /* @__PURE__ */ dual(2, (self, errorTag) => catchFilter(self, (e) => {
  if (isTagged(e, errorTag) && hasProperty(e, "reason")) {
    return succeed2(e.reason);
  }
  return fail2(e);
}, fail3));
var mapError2 = /* @__PURE__ */ dual(2, (self, f) => catch_(self, (error) => failSync(() => f(error))));
var mapBoth = /* @__PURE__ */ dual(2, (self, options) => matchEffect(self, {
  onFailure: (e) => failSync(() => options.onFailure(e)),
  onSuccess: (a) => sync(() => options.onSuccess(a))
}));
var orDie = (self) => catch_(self, die);
var orElseSucceed = /* @__PURE__ */ dual(2, (self, f) => catch_(self, (_) => sync(f)));
var firstSuccessOf = (effects) => suspend(() => {
  const iterator = effects[Symbol.iterator]();
  let state = iterator.next();
  if (state.done) {
    return die(new Error("Received an empty collection of effects"));
  }
  function loop(current) {
    const next = iterator.next();
    if (next.done)
      return current.value;
    return catch_(current.value, (_) => loop(next));
  }
  return loop(state);
});
var eventually = (self) => catch_(self, (_) => flatMap3(yieldNow, () => eventually(self)));
var ignore = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, options) => {
  if (!options?.log) {
    return matchEffect(self, {
      onFailure: (_) => void_,
      onSuccess: (_) => void_
    });
  }
  const logEffect = logWithLevel(options.log === true ? undefined : options.log);
  return matchCauseEffect(self, {
    onFailure(cause) {
      const failure = findFail(cause);
      return isFailure2(failure) ? failCause(failure.failure) : options.message === undefined ? logEffect(cause) : logEffect(options.message, cause);
    },
    onSuccess: (_) => void_
  });
});
var ignoreCause = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, options) => {
  if (!options?.log) {
    return matchCauseEffect(self, {
      onFailure: (_) => void_,
      onSuccess: (_) => void_
    });
  }
  const logEffect = logWithLevel(options.log === true ? undefined : options.log);
  return matchCauseEffect(self, {
    onFailure: (cause) => options.message === undefined ? logEffect(cause) : logEffect(options.message, cause),
    onSuccess: (_) => void_
  });
});
var option = (self) => match4(self, {
  onFailure: none2,
  onSuccess: some2
});
var result = (self) => matchEager(self, {
  onFailure: fail2,
  onSuccess: succeed2
});
var matchCauseEffect = /* @__PURE__ */ dual(2, (self, options) => {
  const primitive = Object.create(OnSuccessAndFailureProto);
  primitive[args] = self;
  primitive[contA] = options.onSuccess.length !== 1 ? (a) => options.onSuccess(a) : options.onSuccess;
  primitive[contE] = options.onFailure.length !== 1 ? (cause) => options.onFailure(cause) : options.onFailure;
  return primitive;
});
var OnSuccessAndFailureProto = /* @__PURE__ */ makePrimitiveProto({
  op: "OnSuccessAndFailure",
  [evaluate](fiber2) {
    fiber2._stack.push(this);
    return this[args];
  }
});
var matchCause = /* @__PURE__ */ dual(2, (self, options) => matchCauseEffect(self, {
  onFailure: (cause) => sync(() => options.onFailure(cause)),
  onSuccess: (value) => sync(() => options.onSuccess(value))
}));
var matchEffect = /* @__PURE__ */ dual(2, (self, options) => matchCauseEffect(self, {
  onFailure: (cause) => {
    const fail4 = cause.reasons.find(isFailReason);
    return fail4 ? internalCall(() => options.onFailure(fail4.error)) : failCause(cause);
  },
  onSuccess: options.onSuccess
}));
var match4 = /* @__PURE__ */ dual(2, (self, options) => matchEffect(self, {
  onFailure: (error) => sync(() => options.onFailure(error)),
  onSuccess: (value) => sync(() => options.onSuccess(value))
}));
var matchEager = /* @__PURE__ */ dual(2, (self, options) => {
  if (effectIsExit(self)) {
    if (self._tag === "Success")
      return exitSucceed(options.onSuccess(self.value));
    const error = findError(self.cause);
    if (isFailure2(error))
      return self;
    return exitSucceed(options.onFailure(error.success));
  }
  return match4(self, options);
});
var matchCauseEager = /* @__PURE__ */ dual(2, (self, options) => {
  if (effectIsExit(self)) {
    if (self._tag === "Success")
      return exitSucceed(options.onSuccess(self.value));
    return exitSucceed(options.onFailure(self.cause));
  }
  return matchCause(self, options);
});
var exit = (self) => effectIsExit(self) ? exitSucceed(self) : exitPrimitive(self);
var exitPrimitive = /* @__PURE__ */ makePrimitive({
  op: "Exit",
  [evaluate](fiber2) {
    fiber2._stack.push(this);
    return this[args];
  },
  [contA](value, _, exit2) {
    return succeed3(exit2 ?? exitSucceed(value));
  },
  [contE](cause, _, exit2) {
    return succeed3(exit2 ?? exitFailCause(cause));
  }
});
var isFailure3 = /* @__PURE__ */ matchEager({
  onFailure: () => true,
  onSuccess: () => false
});
var isSuccess3 = /* @__PURE__ */ matchEager({
  onFailure: () => false,
  onSuccess: () => true
});
var delay = /* @__PURE__ */ dual(2, (self, duration) => andThen(sleep(duration), self));
var timeoutOrElse = /* @__PURE__ */ dual(2, (self, options) => raceFirst(self, flatMap3(sleep(options.duration), options.orElse)));
var timeout = /* @__PURE__ */ dual(2, (self, duration) => timeoutOrElse(self, {
  duration,
  orElse: () => fail3(new TimeoutError)
}));
var timeoutOption = /* @__PURE__ */ dual(2, (self, duration) => raceFirst(asSome(self), as(sleep(duration), none2())));
var timed = (self) => clockWith((clock) => {
  const start = clock.monotonicTimeNanosUnsafe();
  return map5(self, (a) => [nanos(clock.monotonicTimeNanosUnsafe() - start), a]);
});
var ScopeTypeId = "~effect/Scope";
var ScopeCloseableTypeId = "~effect/Scope/Closeable";
var scopeTag = /* @__PURE__ */ Service("effect/Scope");
var scopeClose = (self, exit_) => suspend(() => scopeCloseUnsafe(self, exit_) ?? void_);
var scopeCloseUnsafe = (self, exit_) => {
  if (self.state._tag === "Closed")
    return;
  const closed = {
    _tag: "Closed",
    exit: exit_
  };
  if (self.state._tag === "Empty") {
    self.state = closed;
    return;
  }
  const state = self.state;
  self.state = closed;
  if (state.finalizer !== undefined) {
    return state.finalizer(exit_);
  }
  const finalizers = state.finalizers;
  if (finalizers === undefined || finalizers.size === 0) {
    return;
  } else if (finalizers.size === 1) {
    return finalizers.values().next().value(exit_);
  }
  return scopeCloseFinalizers(self, finalizers, exit_);
};
var combineFinalizerCause = (exit_, finalizer) => exitIsSuccess(exit_) ? finalizer : catchCause(finalizer, (cause) => failCause(causeCombine(exit_.cause, cause)));
var scopeCloseFinalizers = /* @__PURE__ */ fnUntraced(function* (self, finalizers, exit_) {
  let exits = [];
  const fibers = [];
  const arr = Array.from(finalizers.values());
  const parent = getCurrentFiber();
  for (let i = arr.length - 1;i >= 0; i--) {
    const finalizer = arr[i];
    if (self.strategy === "sequential") {
      exits.push(yield* exit(finalizer(exit_)));
    } else {
      fibers.push(forkUnsafe(parent, finalizer(exit_), true, true, "inherit"));
    }
  }
  if (fibers.length > 0) {
    exits = yield* fiberAwaitAll(fibers);
  }
  return yield* exitAsVoidAll(exits);
});
var scopeForkUnsafe = (scope, finalizerStrategy) => {
  const newScope = scopeMakeUnsafe(finalizerStrategy);
  if (scope.state._tag === "Closed") {
    newScope.state = scope.state;
    return newScope;
  }
  const key = {};
  scopeAddFinalizerUnsafe(scope, key, (exit2) => scopeClose(newScope, exit2));
  scopeAddFinalizerUnsafe(newScope, key, (_) => sync(() => scopeRemoveFinalizerUnsafe(scope, key)));
  return newScope;
};
var scopeAddFinalizerExit = (scope, finalizer) => {
  return suspend(() => {
    if (scope.state._tag === "Closed") {
      return finalizer(scope.state.exit);
    }
    scopeAddFinalizerUnsafe(scope, {}, finalizer);
    return void_;
  });
};
var scopeAddFinalizer = (scope, finalizer) => scopeAddFinalizerExit(scope, constant(finalizer));
var scopeAddFinalizerUnsafe = (scope, key, finalizer) => {
  if (scope.state._tag === "Empty") {
    scope.state = {
      _tag: "Open",
      finalizerKey: key,
      finalizer,
      finalizers: undefined
    };
  } else if (scope.state._tag === "Open") {
    const state = scope.state;
    if (state.finalizer !== undefined) {
      state.finalizers = new Map([[state.finalizerKey, state.finalizer]]);
      state.finalizerKey = undefined;
      state.finalizer = undefined;
      state.finalizers.set(key, finalizer);
    } else if (state.finalizers === undefined) {
      state.finalizerKey = key;
      state.finalizer = finalizer;
    } else {
      state.finalizers.set(key, finalizer);
    }
  }
};
var scopeRemoveFinalizerUnsafe = (scope, key) => {
  if (scope.state._tag === "Open") {
    const state = scope.state;
    if (state.finalizerKey === key) {
      state.finalizerKey = undefined;
      state.finalizer = undefined;
    } else if (state.finalizers !== undefined) {
      state.finalizers.delete(key);
    }
  }
};
var scopeFinalizerCountUnsafe = (scope) => scope.state._tag !== "Open" ? 0 : scope.state.finalizer !== undefined ? 1 : scope.state.finalizers?.size ?? 0;
var scopeMakeUnsafe = (finalizerStrategy = "sequential") => ({
  [ScopeCloseableTypeId]: ScopeCloseableTypeId,
  [ScopeTypeId]: ScopeTypeId,
  strategy: finalizerStrategy,
  state: constScopeEmpty
});
var constScopeEmpty = {
  _tag: "Empty"
};
var scope = scopeTag;
var provideScope = /* @__PURE__ */ provideService(scopeTag);
var scoped = (self) => withFiber((fiber2) => {
  const prev = fiber2.context;
  const scope2 = scopeMakeUnsafe();
  fiber2.setContext(add(fiber2.context, scopeTag, scope2));
  return onExitPrimitive(self, (exit2) => {
    fiber2.setContext(prev);
    return scopeCloseUnsafe(scope2, exit2);
  });
});
var scopedWith = (f) => suspend(() => {
  const scope2 = scopeMakeUnsafe();
  return onExit(f(scope2), (exit2) => suspend(() => scopeCloseUnsafe(scope2, exit2) ?? void_));
});
var acquireRelease = (acquire, release, options) => contextWith((context2) => uninterruptibleMask((restore) => flatMap3(scope, (scope2) => tap(options?.interruptible ? restore(acquire) : acquire, (a) => scopeAddFinalizerExit(scope2, (exit2) => provideContext(release(a, exit2), context2))))));
var addFinalizer = (finalizer) => flatMap3(scope, (scope2) => contextWith((context2) => scopeAddFinalizerExit(scope2, (exit2) => provideContext(finalizer(exit2), context2))));
var onExitPrimitive = /* @__PURE__ */ makePrimitive({
  op: "OnExit",
  single: false,
  [evaluate](fiber2) {
    fiber2._stack.push(this);
    return this[args][0];
  },
  [contAll](fiber2) {
    if (fiber2.interruptible && this[args][2] !== true) {
      fiber2._stack.push(setInterruptibleTrue);
      fiber2.interruptible = false;
    }
  },
  [contA](value, _, exit2) {
    exit2 ??= exitSucceed(value);
    const eff = this[args][1](exit2);
    return eff ? flatMap3(eff, (_2) => exit2) : exit2;
  },
  [contE](cause, _, exit2) {
    exit2 ??= exitFailCause(cause);
    const eff = this[args][1](exit2);
    return eff ? flatMap3(combineFinalizerCause(exit2, eff), (_2) => exit2) : exit2;
  }
});
var onExit = /* @__PURE__ */ dual(2, onExitPrimitive);
var ensuring = /* @__PURE__ */ dual(2, (self, finalizer) => onExit(self, (_) => finalizer));
var onExitIf = /* @__PURE__ */ dual(3, (self, predicate, f) => onExit(self, (exit2) => {
  if (!predicate(exit2)) {
    return void_;
  }
  return f(exit2);
}));
var onExitFilter = /* @__PURE__ */ dual(3, (self, filter4, f) => onExit(self, (exit2) => {
  const b = filter4(exit2);
  return isFailure2(b) ? void_ : f(b.success, exit2);
}));
var onError = /* @__PURE__ */ dual(2, (self, f) => onExitFilter(self, exitFilterCause, f));
var onErrorIf = /* @__PURE__ */ dual(3, (self, predicate, f) => onExitIf(self, (exit2) => {
  if (exit2._tag !== "Failure") {
    return false;
  }
  return predicate(exit2.cause);
}, (exit2) => f(exit2.cause)));
var onErrorFilter = /* @__PURE__ */ dual(3, (self, filter4, f) => onExit(self, (exit2) => {
  if (exit2._tag !== "Failure") {
    return void_;
  }
  const result2 = filter4(exit2.cause);
  return isFailure2(result2) ? void_ : f(result2.success, exit2.cause);
}));
var onInterrupt = /* @__PURE__ */ dual(2, (self, finalizer) => onErrorFilter(causeFilterInterruptors, finalizer)(self));
var acquireUseRelease = (acquire, use, release) => uninterruptibleMask((restore) => flatMap3(acquire, (a) => onExitPrimitive(restore(use(a)), (exit2) => release(a, exit2), true)));
var acquireDisposable = (acquire) => acquireRelease(acquire, (resource) => hasProperty(resource, Symbol.asyncDispose) ? promise(() => resource[Symbol.asyncDispose]()) : sync(() => resource[Symbol.dispose]()));
var cachedInvalidateWithTTL = /* @__PURE__ */ dual(2, (self, ttl) => sync(() => {
  const ttlMillis = toMillis(fromInputUnsafe(ttl));
  const isFinite2 = Number.isFinite(ttlMillis);
  const latch = makeLatchUnsafe(false);
  let expiresAt = 0;
  let running = false;
  let exit2;
  const wait = flatMap3(latch.await, () => exit2);
  return [withFiber((fiber2) => {
    const clock = fiber2.getRef(ClockRef);
    const now = isFinite2 ? clock.currentTimeMillisUnsafe() : 0;
    if (running || now < expiresAt)
      return exit2 ?? wait;
    running = true;
    latch.closeUnsafe();
    exit2 = undefined;
    return onExit(self, (exit_) => sync(() => {
      running = false;
      expiresAt = clock.currentTimeMillisUnsafe() + ttlMillis;
      exit2 = exit_;
      latch.openUnsafe();
    }));
  }), sync(() => {
    expiresAt = 0;
    latch.closeUnsafe();
    exit2 = undefined;
  })];
}));
var cachedWithTTL = /* @__PURE__ */ dual(2, (self, timeToLive) => map5(cachedInvalidateWithTTL(self, timeToLive), (tuple) => tuple[0]));
var cached = (self) => cachedWithTTL(self, infinity);
var interrupt = /* @__PURE__ */ withFiber((fiber2) => failCause(causeInterrupt(fiber2.id)));
var uninterruptible = (self) => withFiber((fiber2) => {
  if (!fiber2.interruptible)
    return self;
  fiber2.interruptible = false;
  fiber2._stack.push(setInterruptibleTrue);
  return self;
});
var setInterruptible = /* @__PURE__ */ makePrimitive({
  op: "SetInterruptible",
  [contAll](fiber2) {
    fiber2.interruptible = this[args];
    if (fiber2._interruptedCause && fiber2.interruptible) {
      return () => failCause(fiber2._interruptedCause);
    }
  }
});
var setInterruptibleTrue = /* @__PURE__ */ setInterruptible(true);
var setInterruptibleFalse = /* @__PURE__ */ setInterruptible(false);
var setFiberInterruptible = (fiber2) => {
  fiber2.interruptible = true;
  fiber2._stack.push(setInterruptibleFalse);
  if (fiber2._interruptedCause)
    return failCause(fiber2._interruptedCause);
};
var interruptible = (self) => withFiber((fiber2) => {
  if (fiber2.interruptible)
    return self;
  return setFiberInterruptible(fiber2) ?? self;
});
var uninterruptibleMask = (f) => withFiber((fiber2) => {
  if (!fiber2.interruptible)
    return f(identity);
  fiber2.interruptible = false;
  fiber2._stack.push(setInterruptibleTrue);
  return f(interruptible);
});
var interruptibleMask = (f) => withFiber((fiber2) => {
  if (fiber2.interruptible)
    return f(identity);
  const interrupted = setFiberInterruptible(fiber2);
  const effect = f(uninterruptible);
  return interrupted ?? effect;
});
var abortSignal = /* @__PURE__ */ map5(/* @__PURE__ */ acquireRelease(/* @__PURE__ */ sync(() => new AbortController), (controller) => sync(() => controller.abort())), (_) => _.signal);
var all = (arg, options) => {
  if (isIterable(arg)) {
    return options?.mode === "result" ? forEach(arg, result, options) : forEach(arg, identity, options);
  } else if (options?.discard) {
    return options.mode === "result" ? forEach(Object.values(arg), result, options) : forEach(Object.values(arg), identity, options);
  }
  return suspend(() => {
    const out = {};
    return as(forEach(Object.entries(arg), ([key, effect]) => map5(options?.mode === "result" ? result(effect) : effect, (value) => {
      assignProperty(out, key, value);
    }), {
      discard: true,
      concurrency: options?.concurrency
    }), out);
  });
};
var partition2 = /* @__PURE__ */ dual((args2) => isIterable(args2[0]) && !isEffect(args2[0]), (elements, f, options) => map5(forEach(elements, (a, i) => result(f(a, i)), options), (results) => partition(results, identity)));
var reduce = /* @__PURE__ */ dual(3, (elements, zero2, f) => {
  const arr = fromIterable(elements);
  if (arr.length === 0)
    return sync(zero2);
  return suspend(() => {
    let index = 0;
    let state = zero2();
    return map5(whileLoop({
      while: () => index < arr.length,
      body: () => f(state, arr[index], index),
      step(next) {
        state = next;
        index++;
      }
    }), () => state);
  });
});
var validate = /* @__PURE__ */ dual((args2) => isIterable(args2[0]) && !isEffect(args2[0]), (elements, f, options) => flatMap3(partition2(elements, f, {
  concurrency: options?.concurrency
}), ([excluded, satisfying]) => {
  if (isArrayNonEmpty2(excluded)) {
    return fail3(excluded);
  }
  return options?.discard ? void_ : succeed3(satisfying);
}));
var findFirst = /* @__PURE__ */ dual((args2) => isIterable(args2[0]) && !isEffect(args2[0]), (elements, predicate) => suspend(() => {
  const iterator = elements[Symbol.iterator]();
  const next = iterator.next();
  if (!next.done) {
    return findFirstLoop(iterator, 0, predicate, next.value);
  }
  return succeed3(none2());
}));
var findFirstLoop = (iterator, index, predicate, value) => flatMap3(predicate(value, index), (keep) => {
  if (keep) {
    return succeed3(some2(value));
  }
  const next = iterator.next();
  if (!next.done) {
    return findFirstLoop(iterator, index + 1, predicate, next.value);
  }
  return succeed3(none2());
});
var findFirstFilter = /* @__PURE__ */ dual((args2) => isIterable(args2[0]) && !isEffect(args2[0]), (elements, filter4) => suspend(() => {
  const iterator = elements[Symbol.iterator]();
  const next = iterator.next();
  if (!next.done) {
    return findFirstFilterLoop(iterator, 0, filter4, next.value);
  }
  return succeed3(none2());
}));
var findFirstFilterLoop = (iterator, index, filter4, value) => flatMap3(filter4(value, index), (result2) => {
  if (isSuccess2(result2)) {
    return succeed3(some2(result2.success));
  }
  const next = iterator.next();
  if (!next.done) {
    return findFirstFilterLoop(iterator, index + 1, filter4, next.value);
  }
  return succeed3(none2());
});
var whileLoop = /* @__PURE__ */ makePrimitive({
  op: "While",
  [contA](value, fiber2) {
    this[args].step(value);
    if (this[args].while()) {
      fiber2._stack.push(this);
      return this[args].body();
    }
    return exitVoid;
  },
  [evaluate](fiber2) {
    if (this[args].while()) {
      fiber2._stack.push(this);
      return this[args].body();
    }
    return exitVoid;
  }
});
var forEach = /* @__PURE__ */ dual((args2) => typeof args2[1] === "function", (iterable, f, options) => suspend(() => {
  const concurrencyOption = options?.concurrency ?? 1;
  const concurrency = concurrencyOption === "unbounded" ? Number.POSITIVE_INFINITY : Math.max(1, concurrencyOption);
  if (concurrency === 1) {
    return forEachSequential(iterable, f, options);
  }
  const items = fromIterable(iterable);
  let length = items.length;
  if (length === 0) {
    return options?.discard ? void_ : succeed3([]);
  }
  const out = options?.discard ? undefined : new Array(length);
  const eff = forEachConcurrent({
    f,
    out
  }, items, {
    concurrency
  });
  return eff ? as(eff, out) : succeed3(out);
}));
var head = (self) => flatMap3(self, (elements) => {
  const result2 = elements[Symbol.iterator]().next();
  return result2.done ? fail3(new NoSuchElementError) : succeed3(result2.value);
});
var forEachSequential = (iterable, f, options) => suspend(() => {
  const out = options?.discard ? undefined : [];
  const iterator = iterable[Symbol.iterator]();
  let state = iterator.next();
  let index = 0;
  return as(whileLoop({
    while: () => !state.done,
    body: () => f(state.value, index++),
    step: (b) => {
      if (out)
        out.push(b);
      state = iterator.next();
    }
  }), out);
});
var iterateEagerImpl = (options) => {
  const onItem = options.onItem;
  const step = options.step;
  const runSequential = (state, items, index, end) => {
    for (;index < end; index++) {
      const item = items[index];
      const effect = onItem(state, item, index);
      if (!effectIsExit(effect)) {
        return flatMap3(exit(effect), (itemExit) => step(state, item, itemExit, index) ?? runSequential(state, items, index + 1, end) ?? void_);
      }
      const terminal = step(state, item, effect, index);
      if (terminal)
        return terminal._tag === "Failure" ? terminal : undefined;
    }
  };
  return (state, items, opts) => {
    let index = 0;
    const end = opts?.end ?? items.length;
    const concurrency = opts?.concurrency ?? 1;
    if (concurrency === 1) {
      return runSequential(state, items, 0, end);
    }
    const orderedStep = opts?.orderedStep === true;
    let done2 = false;
    let parentFiber;
    let fibers;
    let resume;
    let interrupted = false;
    let terminal;
    let effect;
    let nextIndex = index;
    const exits = orderedStep ? new Array(end) : undefined;
    const failDefect = (error) => {
      const defect = exitDie(error);
      terminal = defect;
      done2 = true;
      interrupted = true;
      return fibers && fibers.size > 0 ? flatMap3(uninterruptible(fiberInterruptAll(Array.from(fibers))), () => defect) : defect;
    };
    const runStep = (item, exit2, currentIndex) => {
      if (!orderedStep)
        return step(state, item, exit2, currentIndex);
      if (terminal)
        return terminal;
      exits[currentIndex] = exit2;
      while (nextIndex < end) {
        const nextExit = exits[nextIndex];
        if (nextExit === undefined)
          return;
        exits[nextIndex] = undefined;
        const index2 = nextIndex++;
        const result2 = step(state, items[index2], nextExit, index2);
        if (result2)
          return result2;
      }
    };
    const go = () => {
      let paused = false;
      for (;!terminal && index < end; index++) {
        const item = items[index];
        const eff = effect ?? onItem(state, item, index);
        if (effectIsExit(eff)) {
          terminal = runStep(item, eff, index);
          if (terminal)
            break;
        } else if (!parentFiber) {
          return callback((cb) => {
            parentFiber = getCurrentFiber();
            fibers = new Set;
            effect = eff;
            resume = cb;
            let result2;
            try {
              result2 = go();
            } catch (error) {
              return cb(failDefect(error));
            }
            if (result2)
              return cb(result2);
            return suspend(() => {
              terminal = exitVoid;
              interrupted = true;
              return fibers ? fiberInterruptAll(fibers) : void_;
            });
          });
        } else {
          effect = undefined;
          const fiber2 = forkUnsafe(parentFiber, eff, true, true, "inherit");
          if (fiber2._exit) {
            terminal = runStep(item, fiber2._exit, index);
            if (terminal)
              break;
            continue;
          }
          fibers.add(fiber2);
          const currentIndex = index;
          fiber2.addObserver((exit2) => {
            fibers.delete(fiber2);
            try {
              if (terminal) {
                if (!interrupted && exit2._tag === "Failure") {
                  for (const reason of exit2.cause.reasons) {
                    if (reason._tag === "Interrupt")
                      continue;
                    else if (terminal._tag === "Failure") {
                      terminal.cause.reasons.push(reason);
                    } else {
                      terminal = exitFailCause(causeFromReasons([reason]));
                    }
                  }
                }
              } else {
                const result2 = runStep(item, exit2, currentIndex);
                if (result2) {
                  terminal = result2._tag === "Failure" ? exitFailCause(causeFromReasons(result2.cause.reasons.slice())) : result2;
                  go();
                }
              }
              if (paused) {
                const eff2 = go();
                if (eff2)
                  resume(eff2);
              } else if (done2 && fibers.size === 0) {
                resume(terminal ?? void_);
              }
            } catch (error) {
              resume(failDefect(error));
            }
          });
          if (fibers.size < concurrency)
            continue;
          paused = true;
          index++;
          return;
        }
      }
      done2 = true;
      if (terminal) {
        if (fibers && fibers.size > 0) {
          const annotations = fiberStackAnnotations(parentFiber);
          fibers.forEach((f) => f.interruptUnsafe(parentFiber.id, annotations));
          return;
        }
        if (resume || terminal._tag === "Failure") {
          return terminal;
        }
      } else if (resume) {
        if (!fibers) {
          return exitVoid;
        } else if (fibers.size === 0) {
          resume(void_);
        }
      }
    };
    return go();
  };
};
var iterateEager = () => iterateEagerImpl;
var forEachConcurrent = /* @__PURE__ */ iterateEagerImpl({
  onItem(state, item, index) {
    return state.f(item, index);
  },
  step(state, _, exit2, index) {
    if (exit2._tag === "Failure")
      return exit2;
    else if (state.out) {
      state.out[index] = exit2.value;
    }
  }
});
var filterOrElse = /* @__PURE__ */ dual(3, (self, predicate, orElse) => flatMap3(self, (a) => predicate(a) ? succeed3(a) : orElse(a)));
var filterMapOrElse = /* @__PURE__ */ dual(3, (self, filter4, orElse) => flatMap3(self, (a) => {
  const result2 = filter4(a);
  return isFailure2(result2) ? orElse(result2.failure) : succeed3(result2.success);
}));
var filterMapOrFail = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, filter4, orFailWith) => filterMapOrElse(self, filter4, orFailWith ? (x) => fail3(orFailWith(x)) : () => fail3(new NoSuchElementError)));
var filter4 = /* @__PURE__ */ dual((args2) => isIterable(args2[0]) && !isEffect(args2[0]), (elements, predicate, options) => suspend(() => {
  const out = [];
  return as(forEach(elements, (a, i) => {
    const result2 = predicate(a, i);
    if (typeof result2 === "boolean") {
      if (result2)
        out.push(a);
      return void_;
    }
    return map5(result2, (keep) => {
      if (keep) {
        out.push(a);
      }
    });
  }, {
    discard: true,
    concurrency: options?.concurrency
  }), out);
}));
var filterMap = /* @__PURE__ */ dual((args2) => isIterable(args2[0]) && !isEffect(args2[0]), (elements, filter5) => suspend(() => {
  const out = [];
  for (const a of elements) {
    const result2 = filter5(a);
    if (isSuccess2(result2)) {
      out.push(result2.success);
    }
  }
  return succeed3(out);
}));
var filterMapEffect = /* @__PURE__ */ dual((args2) => isIterable(args2[0]) && !isEffect(args2[0]), (elements, filter5, options) => suspend(() => {
  const out = [];
  return as(forEach(elements, (a) => map5(filter5(a), (result2) => {
    if (isSuccess2(result2)) {
      out.push(result2.success);
    }
  }), {
    discard: true,
    concurrency: options?.concurrency
  }), out);
}));
var Do = /* @__PURE__ */ succeed3({});
var bindTo2 = /* @__PURE__ */ bindTo(map5);
var bind2 = /* @__PURE__ */ bind(map5, flatMap3);
var let_2 = /* @__PURE__ */ let_(map5);
var forkChild = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, options) => withFiber((fiber2) => {
  interruptChildrenPatch();
  return succeed3(forkUnsafe(fiber2, self, options?.startImmediately, false, options?.uninterruptible ?? false));
}));
var forkUnsafe = (parent, effect, immediate = false, daemon = false, uninterruptible2 = false) => {
  const parentRuntime = parent;
  const interruptible2 = uninterruptible2 === "inherit" ? parentRuntime.interruptible : !uninterruptible2;
  const child = new FiberImpl(parentRuntime.context, interruptible2);
  if (immediate) {
    child.evaluate(effect);
  } else {
    parentRuntime.currentDispatcher.scheduleTask(() => child.evaluate(effect), 0);
  }
  if (!daemon && !child._exit) {
    parentRuntime.children().add(child);
    child.addObserver(() => parentRuntime._children.delete(child));
  }
  return child;
};
var forkDetach = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, options) => withFiber((fiber2) => succeed3(forkUnsafe(fiber2, self, options?.startImmediately, true, options?.uninterruptible))));
var awaitAllChildren = (self) => withFiber((fiber2) => {
  const initialChildren = fiber2._children && new Set(fiber2._children);
  return onExit(self, (_) => {
    let children = fiber2._children;
    if (children === undefined || children.size === 0) {
      return void_;
    } else if (initialChildren) {
      children = filter2(children, (child) => !initialChildren.has(child));
    }
    return asVoid(fiberAwaitAll(children));
  });
});
var forkIn = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, scope2, options) => withFiber((parent) => {
  const fiber2 = forkUnsafe(parent, self, options?.startImmediately, true, options?.uninterruptible);
  if (!fiber2._exit) {
    if (scope2.state._tag !== "Closed") {
      const key = {};
      const finalizer = () => withFiberId((interruptor) => interruptor === fiber2.id ? void_ : fiberInterrupt(fiber2));
      scopeAddFinalizerUnsafe(scope2, key, finalizer);
      fiber2.addObserver(() => scopeRemoveFinalizerUnsafe(scope2, key));
    } else {
      fiber2.interruptUnsafe(parent.id, fiberStackAnnotations(parent));
    }
  }
  return succeed3(fiber2);
}));
var forkScoped = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, options) => flatMap3(scope, (scope2) => forkIn(self, scope2, options)));
var runForkWith = (context2) => (effect, options) => {
  const fiber2 = new FiberImpl(options?.scheduler ? add(context2, Scheduler, options.scheduler) : context2, options?.uninterruptible !== true);
  fiber2.evaluate(effect);
  if (fiber2._exit)
    return fiber2;
  if (options?.signal) {
    if (options.signal.aborted) {
      fiber2.interruptUnsafe();
    } else {
      const abort = () => fiber2.interruptUnsafe();
      options.signal.addEventListener("abort", abort, {
        once: true
      });
      fiber2.addObserver(() => options.signal.removeEventListener("abort", abort));
    }
  }
  if (options?.onFiberStart) {
    options.onFiberStart(fiber2);
  }
  return fiber2;
};
var fiberRunIn = /* @__PURE__ */ dual(2, (self, scope2) => {
  if (self._exit) {
    return self;
  } else if (scope2.state._tag === "Closed") {
    self.interruptUnsafe(self.id);
    return self;
  }
  const key = {};
  scopeAddFinalizerUnsafe(scope2, key, () => fiberInterrupt(self));
  self.addObserver(() => scopeRemoveFinalizerUnsafe(scope2, key));
  return self;
});
var runFork = /* @__PURE__ */ runForkWith(/* @__PURE__ */ empty());
var runCallbackWith = (context2) => {
  const runFork2 = runForkWith(context2);
  return (effect, options) => {
    const fiber2 = runFork2(effect, options);
    if (options?.onExit) {
      fiber2.addObserver(options.onExit);
    }
    return (interruptor) => {
      return fiber2.interruptUnsafe(interruptor);
    };
  };
};
var runCallback = /* @__PURE__ */ runCallbackWith(/* @__PURE__ */ empty());
var runPromiseExitWith = (context2) => {
  const runFork2 = runForkWith(context2);
  return (effect, options) => {
    const fiber2 = runFork2(effect, options);
    return new Promise((resolve) => {
      fiber2.addObserver((exit2) => resolve(exit2));
    });
  };
};
var runPromiseExit = /* @__PURE__ */ runPromiseExitWith(/* @__PURE__ */ empty());
var runPromiseWith = (context2) => {
  const runPromiseExit2 = runPromiseExitWith(context2);
  return (effect, options) => runPromiseExit2(effect, options).then((exit2) => {
    if (exit2._tag === "Failure") {
      throw causeSquash(exit2.cause);
    }
    return exit2.value;
  });
};
var runPromise = /* @__PURE__ */ runPromiseWith(/* @__PURE__ */ empty());
var runSyncExitWith = (context2) => {
  const runFork2 = runForkWith(context2);
  return (effect) => {
    if (effectIsExit(effect))
      return effect;
    const scheduler = new MixedScheduler("sync");
    const fiber2 = runFork2(effect, {
      scheduler
    });
    fiber2._dispatcher?.flush();
    return fiber2._exit ?? exitDie(new AsyncFiberError(fiber2));
  };
};
var runSyncExit = /* @__PURE__ */ runSyncExitWith(/* @__PURE__ */ empty());
var runSyncWith = (context2) => {
  const runSyncExit2 = runSyncExitWith(context2);
  return (effect) => {
    const exit2 = runSyncExit2(effect);
    if (exit2._tag === "Failure")
      throw causeSquash(exit2.cause);
    return exit2.value;
  };
};
var runSync = /* @__PURE__ */ runSyncWith(/* @__PURE__ */ empty());
var succeedTrue = /* @__PURE__ */ succeed3(true);
var succeedFalse = /* @__PURE__ */ succeed3(false);

class Latch {
  waiters = [];
  scheduled = undefined;
  _isOpen;
  constructor(isOpen) {
    this._isOpen = isOpen;
  }
  scheduleUnsafe(fiber2) {
    if (this.waiters.length === 0) {
      return succeedTrue;
    }
    if (this.scheduled === undefined) {
      this.scheduled = this.waiters;
      fiber2.currentDispatcher.scheduleTask(this.flushScheduled, 0);
    } else {
      for (let i = 0;i < this.waiters.length; i++) {
        this.scheduled.push(this.waiters[i]);
      }
    }
    this.waiters = [];
    return succeedTrue;
  }
  flushScheduled = () => {
    if (this.scheduled === undefined)
      return;
    const waiters = this.scheduled;
    this.scheduled = undefined;
    for (let i = 0;i < waiters.length; i++) {
      waiters[i](exitVoid);
    }
  };
  flushWaiters() {
    const waiters = this.waiters;
    this.waiters = [];
    this.flushScheduled();
    for (let i = 0;i < waiters.length; i++) {
      waiters[i](exitVoid);
    }
  }
  open = /* @__PURE__ */ withFiber((fiber2) => {
    if (this._isOpen)
      return succeedFalse;
    this._isOpen = true;
    return this.scheduleUnsafe(fiber2);
  });
  release = /* @__PURE__ */ withFiber((fiber2) => this._isOpen ? succeedFalse : this.scheduleUnsafe(fiber2));
  openUnsafe() {
    if (this._isOpen)
      return false;
    this._isOpen = true;
    this.flushWaiters();
    return true;
  }
  await = /* @__PURE__ */ callback((resume) => {
    if (this._isOpen) {
      return resume(void_);
    }
    this.waiters.push(resume);
    return sync(() => {
      let index = this.waiters.indexOf(resume);
      if (index !== -1) {
        this.waiters.splice(index, 1);
      } else if (this.scheduled !== undefined) {
        index = this.scheduled.indexOf(resume);
        if (index !== -1) {
          this.scheduled.splice(index, 1);
        }
      }
    });
  });
  closeUnsafe() {
    if (!this._isOpen)
      return false;
    this._isOpen = false;
    return true;
  }
  close = /* @__PURE__ */ sync(() => this.closeUnsafe());
  whenOpen = (self) => flatMap3(this.await, () => self);
  isOpen() {
    return this._isOpen;
  }
}
var makeLatchUnsafe = (open) => new Latch(open ?? false);
var makeLatch = (open) => sync(() => makeLatchUnsafe(open));
var tracer = /* @__PURE__ */ withFiber((fiber2) => succeed3(fiber2.getRef(Tracer)));
var withTracer = /* @__PURE__ */ dual(2, (effect, tracer2) => provideService(effect, Tracer, tracer2));
var withTracerEnabled = /* @__PURE__ */ provideService(TracerEnabled);
var withTracerTiming = /* @__PURE__ */ provideService(TracerTimingEnabled);
var bigint02 = /* @__PURE__ */ BigInt(0);
var NoopSpanProto = {
  _tag: "Span",
  spanId: "noop",
  traceId: "noop",
  sampled: false,
  status: {
    _tag: "Ended",
    startTime: bigint02,
    endTime: bigint02,
    exit: exitVoid
  },
  attributes: /* @__PURE__ */ new Map,
  links: [],
  kind: "internal",
  attribute() {},
  event() {},
  end() {},
  addLinks() {}
};
var noopSpan = (options) => Object.assign(Object.create(NoopSpanProto), options);
var filterDisablePropagation = (span) => {
  if (!span)
    return none2();
  return get(span.annotations, DisablePropagation) ? span._tag === "Span" ? filterDisablePropagation(getOrUndefined(span.parent)) : none2() : some2(span);
};
var makeSpanUnsafe = (fiber2, name, options) => {
  const disablePropagation = !fiber2.getRef(TracerEnabled) || options?.annotations && get(options.annotations, DisablePropagation);
  const parent = options?.parent !== undefined ? some2(options.parent) : options?.root ? none2() : filterDisablePropagation(fiber2.currentSpan);
  let span;
  if (disablePropagation) {
    span = noopSpan({
      name,
      parent,
      annotations: add(options?.annotations ?? empty(), DisablePropagation, true)
    });
  } else {
    const tracer2 = fiber2.getRef(Tracer);
    const clock = fiber2.getRef(ClockRef);
    const timingEnabled = fiber2.getRef(TracerTimingEnabled);
    const annotationsFromEnv = fiber2.getRef(TracerSpanAnnotations);
    const linksFromEnv = fiber2.getRef(TracerSpanLinks);
    const level = options?.level ?? fiber2.getRef(CurrentTraceLevel);
    const links = options?.links !== undefined ? [...linksFromEnv, ...options.links] : linksFromEnv.length === 0 ? [] : linksFromEnv.slice();
    span = tracer2.span({
      name,
      parent,
      annotations: options?.annotations ?? empty(),
      links,
      startTime: timingEnabled ? clock.currentTimeNanosUnsafe() : BigInt(0),
      kind: options?.kind ?? "internal",
      root: options?.root ?? isNone2(parent),
      sampled: options?.sampled ?? (isSome2(parent) && parent.value.sampled === false ? false : !isLogLevelGreaterThan(fiber2.getRef(MinimumTraceLevel), level))
    });
    for (const key in annotationsFromEnv) {
      span.attribute(key, annotationsFromEnv[key]);
    }
    if (options?.attributes !== undefined) {
      for (const key in options.attributes) {
        span.attribute(key, options.attributes[key]);
      }
    }
  }
  return span;
};
var makeSpan = (name, options) => withFiber((fiber2) => succeed3(makeSpanUnsafe(fiber2, name, options)));
var makeSpanScoped = (name, options) => uninterruptible(withFiber((fiber2) => {
  const scope2 = getUnsafe(fiber2.context, scopeTag);
  const span = makeSpanUnsafe(fiber2, name, options ?? {});
  const clock = fiber2.getRef(ClockRef);
  const timingEnabled = fiber2.getRef(TracerTimingEnabled);
  return as(scopeAddFinalizerExit(scope2, (exit2) => endSpan(span, exit2, clock, timingEnabled)), span);
}));
var withSpanScoped = function() {
  const dataFirst = typeof arguments[0] !== "string";
  const name = dataFirst ? arguments[1] : arguments[0];
  const options = addSpanStackTrace(dataFirst ? arguments[2] : arguments[1]);
  if (dataFirst) {
    const self = arguments[0];
    return flatMap3(makeSpanScoped(name, options), (span) => withParentSpan(self, span, options));
  }
  return (self) => flatMap3(makeSpanScoped(name, options), (span) => withParentSpan(self, span, options));
};
var provideSpanStackFrame = (name, stack) => {
  stack = typeof stack === "function" ? stack : constUndefined;
  return updateService(CurrentStackFrame, (parent) => ({
    name,
    stack,
    parent
  }));
};
var spanAnnotations = TracerSpanAnnotations;
var spanLinks = TracerSpanLinks;
var linkSpans = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, span, attributes = {}) => {
  const spans = Array.isArray(span) ? span : [span];
  const links = spans.map((span2) => ({
    span: span2,
    attributes
  }));
  return updateService(self, TracerSpanLinks, (current) => [...current, ...links]);
});
var endSpan = (span, exit2, clock, timingEnabled) => sync(() => {
  if (span.status._tag === "Ended")
    return;
  span.end(timingEnabled ? clock.currentTimeNanosUnsafe() : bigint02, exit2);
});
var useSpan = (name, ...args2) => {
  const options = args2.length === 1 ? undefined : args2[0];
  const evaluate2 = args2[args2.length - 1];
  return withFiber((fiber2) => {
    const span = makeSpanUnsafe(fiber2, name, options);
    const clock = fiber2.getRef(ClockRef);
    const timingEnabled = fiber2.getRef(TracerTimingEnabled);
    return onExit(internalCall(() => evaluate2(span)), (exit2) => endSpan(span, exit2, clock, timingEnabled));
  });
};
var provideParentSpan = /* @__PURE__ */ provideService(ParentSpan);
var withParentSpan = function() {
  const dataFirst = isEffect(arguments[0]);
  const span = dataFirst ? arguments[1] : arguments[0];
  let options = dataFirst ? arguments[2] : arguments[1];
  let provideStackFrame = identity;
  if (span._tag === "Span") {
    options = addSpanStackTrace(options);
    provideStackFrame = provideSpanStackFrame(span.name, options?.captureStackTrace);
  }
  if (dataFirst) {
    return provideParentSpan(provideStackFrame(arguments[0]), span);
  }
  return (self) => provideParentSpan(provideStackFrame(self), span);
};
var withSpan = function() {
  const dataFirst = typeof arguments[0] !== "string";
  const name = dataFirst ? arguments[1] : arguments[0];
  const traceOptions = addSpanStackTrace(arguments[2]);
  if (dataFirst) {
    const self = arguments[0];
    return useSpan(name, arguments[2], (span) => withParentSpan(self, span, traceOptions));
  }
  const fnArg = typeof arguments[1] === "function" ? arguments[1] : undefined;
  const options = fnArg ? undefined : arguments[1];
  return (self, ...args2) => useSpan(name, fnArg ? fnArg(...args2) : options, (span) => withParentSpan(self, span, traceOptions));
};
var annotateSpans = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (effect, ...args2) => updateService(effect, TracerSpanAnnotations, (annotations) => {
  const newAnnotations = args2.length === 1 ? {
    ...annotations,
    ...args2[0]
  } : {
    ...annotations
  };
  if (args2.length === 1) {
    return newAnnotations;
  } else {
    assignProperty(newAnnotations, args2[0], args2[1]);
  }
  return newAnnotations;
}));
var annotateCurrentSpan = (...args2) => withFiber((fiber2) => {
  const span = fiber2.currentSpanLocal;
  if (span) {
    if (args2.length === 1) {
      for (const [key, value] of Object.entries(args2[0])) {
        span.attribute(key, value);
      }
    } else {
      span.attribute(args2[0], args2[1]);
    }
  }
  return void_;
});
var currentSpan = /* @__PURE__ */ withFiber((fiber2) => {
  const span = fiber2.currentSpanLocal;
  return span ? succeed3(span) : fail3(new NoSuchElementError);
});
var currentParentSpan = /* @__PURE__ */ serviceOptional(ParentSpan);
var ClockRef = /* @__PURE__ */ Reference("effect/Clock", {
  defaultValue: () => new ClockImpl
});
var MAX_TIMER_MILLIS = 2 ** 31 - 1;

class ClockImpl {
  currentTimeMillisUnsafe() {
    return Date.now();
  }
  currentTimeMillis = /* @__PURE__ */ sync(() => this.currentTimeMillisUnsafe());
  currentTimeNanosUnsafe() {
    return wallTimeNanos();
  }
  currentTimeNanos = /* @__PURE__ */ sync(() => this.currentTimeNanosUnsafe());
  monotonicTimeNanosUnsafe() {
    return monotonicNowNanos();
  }
  monotonicTimeNanos = /* @__PURE__ */ sync(() => this.monotonicTimeNanosUnsafe());
  sleep(duration) {
    return this.sleepMillis(toMillis(duration));
  }
  sleepMillis(millis2) {
    if (millis2 <= 0)
      return yieldNow;
    else if (!Number.isFinite(millis2))
      return never;
    return callback((resume) => {
      const continuation = millis2 > MAX_TIMER_MILLIS ? this.sleepMillis(millis2 - MAX_TIMER_MILLIS) : void_;
      const handle = setTimeout(() => resume(continuation), Math.min(millis2, MAX_TIMER_MILLIS));
      return sync(() => clearTimeout(handle));
    });
  }
}
var nanosPerMilli = /* @__PURE__ */ BigInt(1e6);
var monotonicNowNanos = /* @__PURE__ */ function() {
  const processHrtime = globalThis.process?.hrtime;
  if (typeof processHrtime?.bigint === "function") {
    return () => processHrtime.bigint();
  }
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return () => BigInt(Math.round(performance.now() * 1e6));
  }
  let previous = /* @__PURE__ */ BigInt(0);
  return () => {
    const current = BigInt(Date.now()) * nanosPerMilli;
    if (current > previous) {
      previous = current;
    }
    return previous;
  };
}();
var wallTimeNanos = /* @__PURE__ */ function() {
  const reanchorThresholdNanos = /* @__PURE__ */ BigInt(1e9);
  let origin;
  return () => {
    const monotonic = monotonicNowNanos();
    const wall = BigInt(Date.now()) * nanosPerMilli;
    if (origin === undefined) {
      origin = wall - monotonic;
    } else {
      const projected = origin + monotonic;
      const skew = wall > projected ? wall - projected : projected - wall;
      if (skew > reanchorThresholdNanos) {
        origin = wall - monotonic;
      }
    }
    return origin + monotonic;
  };
}();
var clockWith = (f) => withFiber((fiber2) => f(fiber2.getRef(ClockRef)));
var sleep = (duration) => clockWith((clock) => clock.sleep(fromInputUnsafe(duration)));
var currentTimeMillis = /* @__PURE__ */ clockWith((clock) => clock.currentTimeMillis);
var TimeoutErrorTypeId = "~effect/Cause/TimeoutError";
class TimeoutError extends (/* @__PURE__ */ TaggedError("TimeoutError")) {
  [TimeoutErrorTypeId] = TimeoutErrorTypeId;
  constructor(message) {
    super({
      message
    });
  }
}
var IllegalArgumentErrorTypeId = "~effect/Cause/IllegalArgumentError";
class IllegalArgumentError extends (/* @__PURE__ */ TaggedError("IllegalArgumentError")) {
  [IllegalArgumentErrorTypeId] = IllegalArgumentErrorTypeId;
  constructor(message) {
    super({
      message
    });
  }
}
var ExceededCapacityErrorTypeId = "~effect/Cause/ExceededCapacityError";
class ExceededCapacityError extends (/* @__PURE__ */ TaggedError("ExceededCapacityError")) {
  [ExceededCapacityErrorTypeId] = ExceededCapacityErrorTypeId;
  constructor(message) {
    super({
      message
    });
  }
}
var AsyncFiberErrorTypeId = "~effect/Cause/AsyncFiberError";
class AsyncFiberError extends (/* @__PURE__ */ TaggedError("AsyncFiberError")) {
  [AsyncFiberErrorTypeId] = AsyncFiberErrorTypeId;
  constructor(fiber2) {
    super({
      message: "An asynchronous Effect was executed with Effect.runSync",
      fiber: fiber2
    });
  }
}
var UnknownErrorTypeId = "~effect/Cause/UnknownError";
class UnknownError extends (/* @__PURE__ */ TaggedError("UnknownError")) {
  [UnknownErrorTypeId] = UnknownErrorTypeId;
  constructor(cause, message) {
    super({
      message,
      cause
    });
  }
}
var ConsoleRef = /* @__PURE__ */ Reference("effect/Console/CurrentConsole", {
  defaultValue: () => globalThis.console
});
var logLevelToOrder = (level) => {
  switch (level) {
    case "All":
      return Number.MIN_SAFE_INTEGER;
    case "Fatal":
      return 50000;
    case "Error":
      return 40000;
    case "Warn":
      return 30000;
    case "Info":
      return 20000;
    case "Debug":
      return 1e4;
    case "Trace":
      return 0;
    case "None":
      return Number.MAX_SAFE_INTEGER;
  }
};
var LogLevelOrder = /* @__PURE__ */ mapInput(Number2, logLevelToOrder);
var isLogLevelGreaterThan = /* @__PURE__ */ isGreaterThan(LogLevelOrder);
var CurrentLoggers = /* @__PURE__ */ Reference("effect/Loggers/CurrentLoggers", {
  defaultValue: () => new Set([defaultLogger, tracerLogger])
});
var LogToStderr = /* @__PURE__ */ Reference("effect/Logger/LogToStderr", {
  defaultValue: constFalse
});
var annotateLogsScoped = function() {
  const entries = typeof arguments[0] === "string" ? [[arguments[0], arguments[1]]] : Object.entries(arguments[0]);
  return uninterruptible(withFiber((fiber2) => {
    const prev = fiber2.getRef(CurrentLogAnnotations);
    const next = {
      ...prev
    };
    for (let i = 0;i < entries.length; i++) {
      const [key, value] = entries[i];
      assignProperty(next, key, value);
    }
    fiber2.setContext(add(fiber2.context, CurrentLogAnnotations, next));
    return scopeAddFinalizerExit(getUnsafe(fiber2.context, scopeTag), (_) => {
      const current = fiber2.getRef(CurrentLogAnnotations);
      const next2 = {
        ...current
      };
      for (let i = 0;i < entries.length; i++) {
        const [key, value] = entries[i];
        if (current[key] !== value)
          continue;
        if (Object.hasOwn(prev, key)) {
          assignProperty(next2, key, prev[key]);
        } else {
          delete next2[key];
        }
      }
      fiber2.setContext(add(fiber2.context, CurrentLogAnnotations, next2));
      return void_;
    });
  }));
};
var LoggerTypeId = "~effect/Logger";
var LoggerProto = {
  [LoggerTypeId]: {
    _Message: identity,
    _Output: identity
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var loggerMake = (log) => {
  const self = Object.create(LoggerProto);
  self.log = log;
  return self;
};
var formatLabel = (key) => key.replace(/[\s="]/g, "_");
var formatLogSpan = (self, now) => {
  const label = formatLabel(self[0]);
  return `${label}=${now - self[1]}ms`;
};
var logWithLevel = (level) => (...message) => {
  let cause = undefined;
  for (let i = 0, len = message.length;i < len; i++) {
    const msg = message[i];
    if (isCause(msg)) {
      if (cause) {
        message.splice(i, 1);
      } else {
        message = message.slice(0, i).concat(message.slice(i + 1));
      }
      cause = cause ? causeFromReasons(cause.reasons.concat(msg.reasons)) : msg;
      i--;
    }
  }
  if (cause === undefined) {
    cause = causeEmpty;
  }
  return withFiber((fiber2) => {
    const logLevel = level ?? fiber2.currentLogLevel;
    if (isLogLevelGreaterThan(fiber2.minimumLogLevel, logLevel)) {
      return void_;
    }
    const clock = fiber2.getRef(ClockRef);
    const loggers = fiber2.getRef(CurrentLoggers);
    if (loggers.size > 0) {
      const date = new Date(clock.currentTimeMillisUnsafe());
      for (const logger of loggers) {
        logger.log({
          cause,
          fiber: fiber2,
          date,
          logLevel,
          message
        });
      }
    }
    return void_;
  });
};
var colors = {
  bold: "1",
  red: "31",
  green: "32",
  yellow: "33",
  blue: "34",
  cyan: "36",
  white: "37",
  gray: "90",
  black: "30",
  bgBrightRed: "101"
};
var logLevelColors = {
  None: [],
  All: [],
  Trace: [colors.gray],
  Debug: [colors.blue],
  Info: [colors.green],
  Warn: [colors.yellow],
  Error: [colors.red],
  Fatal: [colors.bgBrightRed, colors.black]
};
var defaultDateFormat = (date) => `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}.${date.getMilliseconds().toString().padStart(3, "0")}`;
var defaultLogger = /* @__PURE__ */ loggerMake(({
  cause,
  date,
  fiber: fiber2,
  logLevel,
  message
}) => {
  const message_ = Array.isArray(message) ? message.slice() : [message];
  if (cause.reasons.length > 0) {
    message_.push(causePretty(cause));
  }
  const now = date.getTime();
  const spans = fiber2.getRef(CurrentLogSpans);
  let spanString = "";
  for (const span of spans) {
    spanString += ` ${formatLogSpan(span, now)}`;
  }
  const annotations = fiber2.getRef(CurrentLogAnnotations);
  if (Object.keys(annotations).length > 0) {
    message_.push(annotations);
  }
  const console = fiber2.getRef(ConsoleRef);
  const log = fiber2.getRef(LogToStderr) ? console.error : console.log;
  log(`[${defaultDateFormat(date)}] ${logLevel.toUpperCase()} (#${fiber2.id})${spanString}:`, ...message_);
});
var tracerLogger = /* @__PURE__ */ loggerMake(({
  cause,
  fiber: fiber2,
  logLevel,
  message
}) => {
  const clock = fiber2.getRef(ClockRef);
  const annotations = fiber2.getRef(CurrentLogAnnotations);
  const span = fiber2.currentSpan;
  if (span === undefined || span._tag === "ExternalSpan")
    return;
  const attributes = {};
  for (const [key, value] of Object.entries(annotations)) {
    assignProperty(attributes, key, value);
  }
  attributes["effect.fiberId"] = fiber2.id;
  attributes["effect.logLevel"] = logLevel.toUpperCase();
  if (cause.reasons.length > 0) {
    attributes["effect.cause"] = causePretty(cause);
  }
  span.event(toStringUnknown(Array.isArray(message) && message.length === 1 ? message[0] : message), clock.currentTimeNanosUnsafe(), attributes);
});
function interruptChildrenPatch() {
  fiberMiddleware.interruptChildren ??= fiberInterruptChildren;
}
var undefined_ = /* @__PURE__ */ succeed3(undefined);
var withErrorReporting = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, options) => onError(self, (cause) => withFiber((fiber2) => {
  reportCauseUnsafe(fiber2, cause, options?.defectsOnly);
  return void_;
})));
var reportCauseUnsafe = (fiber2, cause, defectsOnly) => {
  const reporters = fiber2.getRef(CurrentErrorReporters);
  if (reporters.size === 0)
    return;
  if (defectsOnly && !hasDies(cause))
    return;
  const opts = {
    cause,
    fiber: fiber2,
    timestamp: fiber2.getRef(ClockRef).currentTimeNanosUnsafe()
  };
  reporters.forEach((reporter) => reporter.report(opts));
};

// node_modules/effect/dist/Exit.js
var isExit2 = isExit;
var succeed4 = exitSucceed;
var failCause2 = exitFailCause;
var fail4 = exitFail;
var die2 = exitDie;
var interrupt2 = exitInterrupt;
var void_2 = exitVoid;
var isSuccess4 = exitIsSuccess;
var isFailure4 = exitIsFailure;
var match5 = exitMatch;

// node_modules/effect/dist/Layer.js
var exports_Layer = {};
__export(exports_Layer, {
  CurrentMemoMap: () => CurrentMemoMap,
  build: () => build,
  buildWithMemoMap: () => buildWithMemoMap,
  buildWithScope: () => buildWithScope,
  catch: () => catch_2,
  catchCause: () => catchCause2,
  catchTag: () => catchTag2,
  effect: () => effect,
  effectContext: () => effectContext,
  effectDiscard: () => effectDiscard,
  empty: () => empty3,
  flatMap: () => flatMap4,
  forkMemoMap: () => forkMemoMap,
  forkMemoMapUnsafe: () => forkMemoMapUnsafe,
  fresh: () => fresh,
  fromBuild: () => fromBuild,
  fromBuildMemo: () => fromBuildMemo,
  isLayer: () => isLayer,
  launch: () => launch,
  makeMemoMap: () => makeMemoMap,
  makeMemoMapUnsafe: () => makeMemoMapUnsafe,
  merge: () => merge2,
  mergeAll: () => mergeAll2,
  mock: () => mock,
  orDie: () => orDie2,
  parentSpan: () => parentSpan,
  provide: () => provide2,
  provideMerge: () => provideMerge,
  satisfiesErrorType: () => satisfiesErrorType,
  satisfiesServicesType: () => satisfiesServicesType,
  satisfiesSuccessType: () => satisfiesSuccessType,
  span: () => span,
  succeed: () => succeed5,
  succeedContext: () => succeedContext,
  suspend: () => suspend2,
  sync: () => sync2,
  syncContext: () => syncContext,
  tap: () => tap2,
  tapCause: () => tapCause2,
  tapError: () => tapError2,
  unwrap: () => unwrap,
  updateService: () => updateService2,
  withParentSpan: () => withParentSpan2,
  withSpan: () => withSpan2
});

// node_modules/effect/dist/Deferred.js
var TypeId5 = "~effect/Deferred";
var DeferredProto = {
  [TypeId5]: {
    _A: identity,
    _E: identity
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var makeUnsafe2 = () => {
  const self = Object.create(DeferredProto);
  self.resumes = undefined;
  self.effect = undefined;
  return self;
};
var _await = (self) => callback((resume) => {
  if (self.effect)
    return resume(self.effect);
  self.resumes ??= [];
  self.resumes.push(resume);
  return sync(() => {
    const resumes = self.resumes;
    if (resumes === undefined)
      return;
    const index = resumes.indexOf(resume);
    if (index >= 0)
      resumes.splice(index, 1);
  });
});
var completeWith = /* @__PURE__ */ dual(2, (self, effect) => sync(() => doneUnsafe(self, effect)));
var done2 = completeWith;
var failCause3 = /* @__PURE__ */ dual(2, (self, cause) => done2(self, exitFailCause(cause)));
var interruptWith = /* @__PURE__ */ dual(2, (self, fiberId2) => failCause3(self, causeInterrupt(fiberId2)));
var isDone2 = (self) => sync(() => isDoneUnsafe(self));
var isDoneUnsafe = (self) => self.effect !== undefined;
var doneUnsafe = (self, effect) => {
  if (self.effect)
    return false;
  self.effect = effect;
  if (self.resumes) {
    const resumes = self.resumes;
    self.resumes = undefined;
    for (let i = 0;i < resumes.length; i++) {
      resumes[i](effect);
    }
  }
  return true;
};

// node_modules/effect/dist/References.js
var CurrentLogAnnotations2 = CurrentLogAnnotations;
var CurrentLogSpans2 = CurrentLogSpans;
var CurrentStackFrame2 = CurrentStackFrame;
var TracerTimingEnabled2 = TracerTimingEnabled;

// node_modules/effect/dist/Scope.js
var Scope = scopeTag;
var makeUnsafe3 = scopeMakeUnsafe;
var provide = provideScope;
var addFinalizerExit = scopeAddFinalizerExit;
var addFinalizer2 = scopeAddFinalizer;
var forkUnsafe2 = scopeForkUnsafe;
var close = scopeClose;

// node_modules/effect/dist/Layer.js
var TypeId6 = "~effect/Layer";
var MemoMapTypeId = "~effect/Layer/MemoMap";
var memoMapReuse = (entry, scope2) => {
  entry.observers++;
  return andThen(scopeAddFinalizerExit(scope2, (exit2) => entry.finalizer(exit2)), entry.effect);
};
var isLayer = (u) => hasProperty(u, TypeId6);
var LayerProto = {
  [TypeId6]: {
    _ROut: identity,
    _E: identity,
    _RIn: identity
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var fromBuildUnsafe = (build) => {
  const self = Object.create(LayerProto);
  self.build = build;
  return self;
};
var fromBuild = (build) => fromBuildUnsafe((memoMap, scope2) => {
  const layerScope = forkUnsafe2(scope2);
  return onExit(build(memoMap, layerScope), (exit2) => exit2._tag === "Failure" ? close(layerScope, exit2) : void_);
});
var fromBuildMemo = (build) => {
  const self = fromBuild((memoMap, scope2) => memoMap.getOrElseMemoize(self, scope2, build));
  return self;
};
var memoMapBuild = (memoMap, layer, scope2, build) => {
  const layerScope = makeUnsafe3();
  const deferred = makeUnsafe2();
  const entry = {
    observers: 1,
    effect: _await(deferred),
    finalizer: (exit2) => suspend(() => {
      entry.observers--;
      if (entry.observers === 0) {
        memoMap.map.delete(layer);
        return close(layerScope, exit2);
      }
      return void_;
    })
  };
  memoMap.map.set(layer, entry);
  return scopeAddFinalizerExit(scope2, entry.finalizer).pipe(flatMap3(() => build(memoMap, layerScope)), onExit((exit2) => {
    entry.effect = exit2;
    return done2(deferred, exit2);
  }));
};

class MemoMapImpl {
  get [MemoMapTypeId]() {
    return MemoMapTypeId;
  }
  parent;
  constructor(parent) {
    this.parent = parent;
  }
  map = /* @__PURE__ */ new Map;
  get(layer, scope2) {
    const local = this.map.get(layer);
    if (local) {
      return memoMapReuse(local, scope2);
    }
    return this.parent?.get(layer, scope2);
  }
  getOrElseMemoize(layer, scope2, build) {
    return suspend(() => {
      const existing = this.get(layer, scope2);
      if (existing) {
        return existing;
      }
      return memoMapBuild(this, layer, scope2, build);
    });
  }
}
var makeMemoMapUnsafe = () => new MemoMapImpl;
var forkMemoMapUnsafe = (parent) => new MemoMapImpl(parent);
var makeMemoMap = /* @__PURE__ */ sync(makeMemoMapUnsafe);
var forkMemoMap = (parent) => sync(() => forkMemoMapUnsafe(parent));

class CurrentMemoMap extends (/* @__PURE__ */ Service()("effect/Layer/CurrentMemoMap")) {
  static forkOrCreate(self) {
    const current = getOrUndefined2(self, CurrentMemoMap);
    return current ? forkMemoMapUnsafe(current) : makeMemoMapUnsafe();
  }
}
var buildWithMemoMap = /* @__PURE__ */ dual(3, (self, memoMap, scope2) => provideService(map5(self.build(memoMap, scope2), add(CurrentMemoMap, memoMap)), CurrentMemoMap, memoMap));
var build = (self) => withFiber((fiber2) => buildWithMemoMap(self, CurrentMemoMap.forkOrCreate(fiber2.context), getUnsafe(fiber2.context, Scope)));
var buildWithScope = /* @__PURE__ */ dual(2, (self, scope2) => withFiber((fiber2) => buildWithMemoMap(self, CurrentMemoMap.forkOrCreate(fiber2.context), scope2)));
var succeed5 = function() {
  if (arguments.length === 1) {
    return (resource) => succeedContext(make5(arguments[0], resource));
  }
  return succeedContext(make5(arguments[0], arguments[1]));
};
var succeedContext = (context2) => fromBuildUnsafe(constant(succeed3(context2)));
var empty3 = /* @__PURE__ */ succeedContext(/* @__PURE__ */ empty());
var sync2 = function() {
  if (arguments.length === 1) {
    return (evaluate2) => syncContext(() => make5(arguments[0], evaluate2()));
  }
  return syncContext(() => make5(arguments[0], arguments[1]()));
};
var syncContext = (evaluate2) => fromBuildMemo(constant(sync(evaluate2)));
var effect = function() {
  if (arguments.length === 1) {
    return (effect2) => effectImpl(arguments[0], effect2);
  }
  return effectImpl(arguments[0], arguments[1]);
};
var effectImpl = (service2, effect2) => effectContext(map5(effect2, (value) => make5(service2, value)));
var effectContext = (effect2) => fromBuildMemo((_, scope2) => provide(effect2, scope2));
var effectDiscard = (effect2) => effectContext(as(effect2, empty()));
var suspend2 = (evaluate2) => fromBuildMemo((memoMap, scope2) => suspend(() => evaluate2().build(memoMap, scope2)));
var unwrap = (self) => {
  const service2 = Service("effect/Layer/unwrap");
  return flatMap4(effect(service2)(self), get(service2));
};
var mergeAllEffect = (layers, memoMap, scope2) => {
  const parentScope = forkUnsafe2(scope2, "parallel");
  return forEach(layers, (layer) => layer.build(memoMap, forkUnsafe2(parentScope, "sequential")), {
    concurrency: layers.length
  }).pipe(map5((context2) => mergeAll(...context2)));
};
var mergeAll2 = (...layers) => fromBuild((memoMap, scope2) => mergeAllEffect(layers, memoMap, scope2));
var merge2 = /* @__PURE__ */ dual(2, (self, that) => mergeAll2(self, ...Array.isArray(that) ? that : [that]));
var provideWith = (self, that, f) => fromBuild((memoMap, scope2) => flatMap3(Array.isArray(that) ? mergeAllEffect(that, memoMap, scope2) : that.build(memoMap, scope2), (context2) => self.build(memoMap, scope2).pipe(provideContext(context2), map5((merged) => f(merged, context2)))));
var provide2 = /* @__PURE__ */ dual(2, (self, that) => provideWith(self, that, identity));
var provideMerge = /* @__PURE__ */ dual(2, (self, that) => provideWith(self, that, (self2, that2) => merge(that2, self2)));
var flatMap4 = /* @__PURE__ */ dual(2, (self, f) => fromBuild((memoMap, scope2) => flatMap3(self.build(memoMap, scope2), (context2) => f(context2).build(memoMap, scope2))));
var tap2 = /* @__PURE__ */ dual(2, (self, f) => fromBuild((memoMap, scope2) => flatMap3(self.build(memoMap, scope2), (context2) => provide(as(f(context2), context2), scope2))));
var tapError2 = /* @__PURE__ */ dual(2, (self, f) => fromBuild((memoMap, scope2) => catch_(self.build(memoMap, scope2), (error) => provide(andThen(f(error), fail3(error)), scope2))));
var tapCause2 = /* @__PURE__ */ dual(2, (self, f) => fromBuild((memoMap, scope2) => catchCause(self.build(memoMap, scope2), (cause) => provide(andThen(f(cause), failCause(cause)), scope2))));
var orDie2 = (self) => fromBuildUnsafe((memoMap, scope2) => orDie(self.build(memoMap, scope2)));
var catch_2 = /* @__PURE__ */ dual(2, (self, onError2) => fromBuildUnsafe((memoMap, scope2) => catch_(self.build(memoMap, scope2), (e) => onError2(e).build(memoMap, scope2))));
var catchTag2 = /* @__PURE__ */ dual(3, (self, k, f) => fromBuildUnsafe((memoMap, scope2) => catchTag(self.build(memoMap, scope2), k, (error) => f(error).build(memoMap, scope2))));
var catchCause2 = /* @__PURE__ */ dual(2, (self, onError2) => fromBuildUnsafe((memoMap, scope2) => catchCause(self.build(memoMap, scope2), (cause) => onError2(cause).build(memoMap, scope2))));
var updateService2 = /* @__PURE__ */ dual(3, (layer, service2, f) => provide2(layer, effect(service2, map5(service2, f))));
var fresh = (self) => fromBuildUnsafe((_, scope2) => self.build(makeMemoMapUnsafe(), scope2));
var launch = (self) => scoped(andThen(build(self), never));
var mock = function() {
  if (arguments.length === 1) {
    return (implementation) => mockImpl(arguments[0], implementation);
  }
  return mockImpl(arguments[0], arguments[1]);
};
var mockImpl = (service2, implementation) => succeed5(service2)(new Proxy({
  ...implementation
}, {
  get(target, prop, _receiver) {
    if (prop in target) {
      return target[prop];
    }
    const prevLimit = getStackTraceLimit();
    setStackTraceLimit(2);
    const error = new Error(`${service2.key}: Unimplemented method "${prop.toString()}"`);
    setStackTraceLimit(prevLimit);
    error.name = "UnimplementedError";
    return makeUnimplemented(error);
  },
  has: constTrue
}));
var makeUnimplemented = (error) => {
  const dead = Object.assign(die(error), {
    [StreamTypeId]: StreamTypeId,
    channel: {
      [ChannelTypeId]: ChannelTypeId,
      transform: () => succeed3(dead),
      pipe() {
        return pipeArguments(this, arguments);
      }
    },
    [ChannelTypeId]: ChannelTypeId,
    transform: () => succeed3(dead)
  });
  function unimplemented() {
    return dead;
  }
  Object.assign(unimplemented, dead);
  Object.setPrototypeOf(unimplemented, Object.getPrototypeOf(dead));
  return unimplemented;
};
var StreamTypeId = "~effect/Stream";
var ChannelTypeId = "~effect/Channel";
var satisfiesSuccessType = () => (layer) => layer;
var satisfiesErrorType = () => (layer) => layer;
var satisfiesServicesType = () => (layer) => layer;
var span = (name, options) => {
  options = addSpanStackTrace(options);
  return effect(ParentSpan, options?.onEnd ? tap(makeSpanScoped(name, options), (span2) => addFinalizer((exit2) => options.onEnd(span2, exit2))) : makeSpanScoped(name, options));
};
var parentSpan = (span2) => succeedContext(ParentSpan.context(span2));
var withSpan2 = function() {
  const dataFirst = typeof arguments[0] !== "string";
  const name = dataFirst ? arguments[1] : arguments[0];
  const options = addSpanStackTrace(dataFirst ? arguments[2] : arguments[1]);
  if (dataFirst) {
    const self = arguments[0];
    return unwrap(map5(options?.onEnd !== undefined ? tap(makeSpanScoped(name, options), (span2) => addFinalizer((exit2) => options.onEnd(span2, exit2))) : makeSpanScoped(name, options), (span2) => withParentSpan2(self, span2)));
  }
  return (self) => unwrap(map5(options?.onEnd !== undefined ? tap(makeSpanScoped(name, options), (span2) => addFinalizer((exit2) => options.onEnd(span2, exit2))) : makeSpanScoped(name, options), (span2) => withParentSpan2(self, span2)));
};
var withParentSpan2 = function() {
  const dataFirst = isLayer(arguments[0]);
  const span2 = dataFirst ? arguments[1] : arguments[0];
  let options = dataFirst ? arguments[2] : arguments[1];
  let provideStackFrame = identity;
  if (span2._tag === "Span") {
    options = addSpanStackTrace(options);
    provideStackFrame = provideSpanStackFrame2(span2.name, options?.captureStackTrace);
  }
  const parentSpanLayer = parentSpan(span2);
  if (dataFirst) {
    return provide2(provideStackFrame(arguments[0]), parentSpanLayer);
  }
  return (self) => provide2(provideStackFrame(self), parentSpanLayer);
};
var provideSpanStackFrame2 = (name, stack) => {
  stack = typeof stack === "function" ? stack : constUndefined;
  return updateService2(CurrentStackFrame2, (parent) => ({
    name,
    stack,
    parent
  }));
};

// node_modules/effect/dist/ExecutionPlan.js
var TypeId7 = "~effect/ExecutionPlan";
var Proto2 = {
  [TypeId7]: TypeId7,
  get captureRequirements() {
    const self = this;
    return contextWith((context2) => succeed3(makeProto(self.steps.map((step) => ({
      ...step,
      provide: isLayer(step.provide) ? provide2(step.provide, succeedContext(context2)) : step.provide
    })))));
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var makeProto = (steps) => {
  const self = Object.create(Proto2);
  self.steps = steps;
  return self;
};
var CurrentMetadata = /* @__PURE__ */ Reference("effect/ExecutionPlan/CurrentMetadata", {
  defaultValue: /* @__PURE__ */ constant({
    attempt: 0,
    stepIndex: 0
  })
});

// node_modules/effect/dist/Cause.js
var isCause2 = isCause;
var isReason = isCauseReason;
var isFailReason2 = isFailReason;
var fromReasons = causeFromReasons;
var empty4 = causeEmpty;
var fail5 = causeFail;
var die3 = causeDie;
var makeFailReason = (error) => new Fail(error);
var makeDieReason = (defect) => new Die(defect);
var makeInterruptReason2 = makeInterruptReason;
var hasInterruptsOnly2 = hasInterruptsOnly;
var map6 = causeMap;
var squash = causeSquash;
var hasFails2 = hasFails;
var findError2 = findError;
var pretty = causePretty;
var isDone3 = isDone;
var Done2 = Done;
var done3 = done;
var IllegalArgumentError2 = IllegalArgumentError;
var ExceededCapacityError2 = ExceededCapacityError;
var UnknownError2 = UnknownError;

// node_modules/effect/dist/Clock.js
var Clock = ClockRef;

// node_modules/effect/dist/internal/dateTime.js
var TypeId8 = "~effect/time/DateTime";
var TimeZoneTypeId = "~effect/time/DateTime/TimeZone";
var Proto3 = {
  [TypeId8]: TypeId8,
  pipe() {
    return pipeArguments(this, arguments);
  },
  [NodeInspectSymbol]() {
    return this.toString();
  },
  toJSON() {
    return toDateUtc(this).toJSON();
  }
};
var ProtoUtc = {
  ...Proto3,
  _tag: "Utc",
  [symbol]() {
    return number(this.epochMilliseconds);
  },
  [symbol2](that) {
    return isDateTime(that) && that._tag === "Utc" && this.epochMilliseconds === that.epochMilliseconds;
  },
  toString() {
    return `DateTime.Utc(${toDateUtc(this).toJSON()})`;
  }
};
var ProtoZoned = {
  ...Proto3,
  _tag: "Zoned",
  [symbol]() {
    return combine(number(this.epochMilliseconds))(hash(this.zone));
  },
  [symbol2](that) {
    return isDateTime(that) && that._tag === "Zoned" && this.epochMilliseconds === that.epochMilliseconds && equals(this.zone, that.zone);
  },
  toString() {
    return `DateTime.Zoned(${formatIsoZoned(this)})`;
  }
};
var ProtoTimeZone = {
  [TimeZoneTypeId]: TimeZoneTypeId,
  [NodeInspectSymbol]() {
    return this.toString();
  }
};
var ProtoTimeZoneNamed = {
  ...ProtoTimeZone,
  _tag: "Named",
  [symbol]() {
    return string(`Named:${this.id}`);
  },
  [symbol2](that) {
    return isTimeZone(that) && that._tag === "Named" && this.id === that.id;
  },
  toString() {
    return `TimeZone.Named(${this.id})`;
  },
  toJSON() {
    return {
      _id: "TimeZone",
      _tag: "Named",
      id: this.id
    };
  }
};
var ProtoTimeZoneOffset = {
  ...ProtoTimeZone,
  _tag: "Offset",
  [symbol]() {
    return string(`Offset:${this.offset}`);
  },
  [symbol2](that) {
    return isTimeZone(that) && that._tag === "Offset" && this.offset === that.offset;
  },
  toString() {
    return `TimeZone.Offset(${offsetToString(this.offset)})`;
  },
  toJSON() {
    return {
      _id: "TimeZone",
      _tag: "Offset",
      offset: this.offset
    };
  }
};
var makeZonedProto = (epochMillis, zone, partsUtc) => {
  const self = Object.create(ProtoZoned);
  self.epochMilliseconds = epochMillis;
  self.zone = zone;
  Object.defineProperty(self, "partsUtc", {
    value: partsUtc,
    enumerable: false,
    writable: true
  });
  Object.defineProperty(self, "adjustedEpochMillis", {
    value: undefined,
    enumerable: false,
    writable: true
  });
  Object.defineProperty(self, "partsAdjusted", {
    value: undefined,
    enumerable: false,
    writable: true
  });
  return self;
};
var isDateTime = (u) => hasProperty(u, TypeId8);
var isTimeZone = (u) => hasProperty(u, TimeZoneTypeId);
var isTimeZoneOffset = (u) => isTimeZone(u) && u._tag === "Offset";
var isTimeZoneNamed = (u) => isTimeZone(u) && u._tag === "Named";
var isUtc = (self) => self._tag === "Utc";
var isZoned = (self) => self._tag === "Zoned";
var Equivalence2 = /* @__PURE__ */ make3((a, b) => a.epochMilliseconds === b.epochMilliseconds);
var Order = /* @__PURE__ */ make4((self, that) => self.epochMilliseconds < that.epochMilliseconds ? -1 : self.epochMilliseconds > that.epochMilliseconds ? 1 : 0);
var makeUtc = (epochMillis) => {
  const self = Object.create(ProtoUtc);
  self.epochMilliseconds = epochMillis;
  Object.defineProperty(self, "partsUtc", {
    value: undefined,
    enumerable: false,
    writable: true
  });
  return self;
};
var fromDateUnsafe = (date) => {
  const epochMillis = date.getTime();
  if (Number.isNaN(epochMillis)) {
    throw new IllegalArgumentError2("Invalid date");
  }
  return makeUtc(epochMillis);
};
var makeUnsafe4 = (input) => {
  if (isDateTime(input)) {
    return input;
  } else if (input instanceof Date) {
    return fromDateUnsafe(input);
  } else if (typeof input === "object") {
    if ("epochMilliseconds" in input) {
      return fromDateUnsafe(new Date(input.epochMilliseconds));
    }
    const date = new Date(0);
    setPartsDate(date, input);
    return fromDateUnsafe(date);
  } else if (typeof input === "string" && !hasZone(input)) {
    return fromDateUnsafe(new Date(input + "Z"));
  }
  return fromDateUnsafe(new Date(input));
};
var hasZone = (input) => /Z|GMT|[+-]\d{2}$|[+-]\d{2}:?\d{2}$|\]$/.test(input);
var minEpochMillis = -8640000000000000 + 12 * 60 * 60 * 1000;
var maxEpochMillis = 8640000000000000 - 14 * 60 * 60 * 1000;
var makeZonedUnsafe = (input, options) => {
  let timeZoneOption = options?.timeZone;
  if (timeZoneOption === undefined && isDateTime(input) && isZoned(input)) {
    return input;
  }
  const self = makeUnsafe4(input);
  if (self.epochMilliseconds < minEpochMillis || self.epochMilliseconds > maxEpochMillis) {
    throw new RangeError(`Epoch millis out of range: ${self.epochMilliseconds}`);
  }
  if (timeZoneOption === undefined && typeof input === "object" && "timeZoneId" in input) {
    timeZoneOption = input.timeZoneId;
  }
  let zone;
  if (timeZoneOption === undefined) {
    const offset = new Date(self.epochMilliseconds).getTimezoneOffset() * -60 * 1000;
    zone = zoneMakeOffset(offset);
  } else if (isTimeZone(timeZoneOption)) {
    zone = timeZoneOption;
  } else if (typeof timeZoneOption === "number") {
    zone = zoneMakeOffset(timeZoneOption);
  } else {
    const parsedZone = zoneFromString(timeZoneOption);
    if (isNone2(parsedZone)) {
      throw new IllegalArgumentError2(`Invalid time zone: ${timeZoneOption}`);
    }
    zone = parsedZone.value;
  }
  if (options?.adjustForTimeZone !== true) {
    return makeZonedProto(self.epochMilliseconds, zone, self.partsUtc);
  }
  return makeZonedFromAdjusted(self.epochMilliseconds, zone, options?.disambiguation ?? "compatible");
};
var makeZoned = /* @__PURE__ */ liftThrowable(makeZonedUnsafe);
var make8 = /* @__PURE__ */ liftThrowable(makeUnsafe4);
var zonedStringRegExp = /^(.{17,35})\[(.+)\]$/;
var makeZonedFromString = (input) => {
  const match6 = zonedStringRegExp.exec(input);
  if (match6 === null) {
    const offset = parseOffset(input);
    return offset !== null ? makeZoned(input, {
      timeZone: offset
    }) : none2();
  }
  const [, isoString, timeZone] = match6;
  return makeZoned(isoString, {
    timeZone
  });
};
var toUtc = (self) => makeUtc(self.epochMilliseconds);
var validZoneCache = /* @__PURE__ */ new Map;
var formatOptions = {
  day: "numeric",
  month: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  timeZoneName: "longOffset",
  fractionalSecondDigits: 3,
  hourCycle: "h23"
};
var zoneMakeIntl = (format2) => {
  const zoneId = format2.resolvedOptions().timeZone;
  if (validZoneCache.has(zoneId)) {
    return validZoneCache.get(zoneId);
  }
  const zone = Object.create(ProtoTimeZoneNamed);
  zone.id = zoneId;
  zone.format = format2;
  validZoneCache.set(zoneId, zone);
  return zone;
};
var zoneMakeNamedUnsafe = (zoneId) => {
  if (validZoneCache.has(zoneId)) {
    return validZoneCache.get(zoneId);
  }
  try {
    return zoneMakeIntl(new Intl.DateTimeFormat("en-US", {
      ...formatOptions,
      timeZone: zoneId
    }));
  } catch {
    throw new IllegalArgumentError2(`Invalid time zone: ${zoneId}`);
  }
};
var zoneMakeOffset = (offset) => {
  const zone = Object.create(ProtoTimeZoneOffset);
  zone.offset = offset;
  return zone;
};
var zoneMakeNamed = /* @__PURE__ */ liftThrowable(zoneMakeNamedUnsafe);
var offsetZoneRegExp = /^(?:GMT|[+-])/;
var zoneFromString = (zone) => {
  if (offsetZoneRegExp.test(zone)) {
    const offset = parseOffset(zone);
    return offset === null ? none2() : some2(zoneMakeOffset(offset));
  }
  return zoneMakeNamed(zone);
};
var zoneToString = (self) => {
  if (self._tag === "Offset") {
    return offsetToString(self.offset);
  }
  return self.id;
};
var toDateUtc = (self) => new Date(self.epochMilliseconds);
var toDate = (self) => {
  if (self._tag === "Utc") {
    return new Date(self.epochMilliseconds);
  } else if (self.zone._tag === "Offset") {
    return new Date(self.epochMilliseconds + self.zone.offset);
  } else if (self.adjustedEpochMilliseconds !== undefined) {
    return new Date(self.adjustedEpochMilliseconds);
  }
  const parts = self.zone.format.formatToParts(self.epochMilliseconds).filter((_) => _.type !== "literal");
  const date = new Date(0);
  date.setUTCFullYear(Number(parts[2].value), Number(parts[0].value) - 1, Number(parts[1].value));
  date.setUTCHours(Number(parts[3].value), Number(parts[4].value), Number(parts[5].value), Number(parts[6].value));
  self.adjustedEpochMilliseconds = date.getTime();
  return date;
};
var zonedOffset = (self) => {
  const date = toDate(self);
  return date.getTime() - toEpochMillis(self);
};
var offsetToString = (offset) => {
  const abs = Math.abs(offset);
  let hours2 = Math.floor(abs / (60 * 60 * 1000));
  let minutes2 = Math.round(abs % (60 * 60 * 1000) / (60 * 1000));
  if (minutes2 === 60) {
    hours2 += 1;
    minutes2 = 0;
  }
  return `${offset < 0 ? "-" : "+"}${String(hours2).padStart(2, "0")}:${String(minutes2).padStart(2, "0")}`;
};
var zonedOffsetIso = (self) => offsetToString(zonedOffset(self));
var toEpochMillis = (self) => self.epochMilliseconds;
var setPartsDate = (date, parts) => {
  if (parts.year !== undefined) {
    date.setUTCFullYear(parts.year);
  }
  if (parts.month !== undefined) {
    date.setUTCMonth(parts.month - 1);
  }
  if (parts.day !== undefined) {
    date.setUTCDate(parts.day);
  }
  if (parts.weekDay !== undefined) {
    const diff = parts.weekDay - date.getUTCDay();
    date.setUTCDate(date.getUTCDate() + diff);
  }
  if (parts.hour !== undefined) {
    date.setUTCHours(parts.hour);
  }
  if (parts.minute !== undefined) {
    date.setUTCMinutes(parts.minute);
  }
  if (parts.second !== undefined) {
    date.setUTCSeconds(parts.second);
  }
  if (parts.millisecond !== undefined) {
    date.setUTCMilliseconds(parts.millisecond);
  }
};
var constDayMillis = 24 * 60 * 60 * 1000;
var makeZonedFromAdjusted = (adjustedMillis, zone, disambiguation) => {
  if (zone._tag === "Offset") {
    return makeZonedProto(adjustedMillis - zone.offset, zone);
  }
  const beforeOffset = calculateNamedOffset(adjustedMillis - constDayMillis, adjustedMillis, zone);
  const afterOffset = calculateNamedOffset(adjustedMillis + constDayMillis, adjustedMillis, zone);
  if (beforeOffset === afterOffset) {
    return makeZonedProto(adjustedMillis - beforeOffset, zone);
  }
  const isForwards = beforeOffset < afterOffset;
  const transitionMillis = beforeOffset - afterOffset;
  if (isForwards) {
    const currentAfterOffset = calculateNamedOffset(adjustedMillis - afterOffset, adjustedMillis, zone);
    if (currentAfterOffset === afterOffset) {
      return makeZonedProto(adjustedMillis - afterOffset, zone);
    }
    const before = makeZonedProto(adjustedMillis - beforeOffset, zone);
    const beforeAdjustedMillis = toDate(before).getTime();
    if (adjustedMillis !== beforeAdjustedMillis) {
      switch (disambiguation) {
        case "reject": {
          const formatted = new Date(adjustedMillis).toISOString();
          throw new RangeError(`Gap time: ${formatted} does not exist in time zone ${zone.id}`);
        }
        case "earlier":
          return makeZonedProto(adjustedMillis - afterOffset, zone);
        case "compatible":
        case "later":
          return before;
      }
    }
    return before;
  }
  const currentBeforeOffset = calculateNamedOffset(adjustedMillis - beforeOffset, adjustedMillis, zone);
  if (currentBeforeOffset === beforeOffset) {
    if (disambiguation === "earlier" || disambiguation === "compatible") {
      return makeZonedProto(adjustedMillis - beforeOffset, zone);
    }
    const laterOffset = calculateNamedOffset(adjustedMillis - beforeOffset + transitionMillis, adjustedMillis + transitionMillis, zone);
    if (laterOffset === beforeOffset) {
      return makeZonedProto(adjustedMillis - beforeOffset, zone);
    }
    if (disambiguation === "reject") {
      const formatted = new Date(adjustedMillis).toISOString();
      throw new RangeError(`Ambiguous time: ${formatted} occurs twice in time zone ${zone.id}`);
    }
  }
  return makeZonedProto(adjustedMillis - afterOffset, zone);
};
var offsetRegExp = /([+-])(\d{2}):(\d{2})$/;
var parseOffset = (offset) => {
  const match6 = offsetRegExp.exec(offset);
  if (match6 === null) {
    return null;
  }
  const [, sign, hours2, minutes2] = match6;
  return (sign === "+" ? 1 : -1) * (Number(hours2) * 60 + Number(minutes2)) * 60 * 1000;
};
var calculateNamedOffset = (utcMillis, adjustedMillis, zone) => {
  const offset = zone.format.formatToParts(utcMillis).find((_) => _.type === "timeZoneName")?.value ?? "";
  if (offset === "GMT") {
    return 0;
  }
  const result2 = parseOffset(offset);
  if (result2 === null) {
    return zonedOffset(makeZonedProto(adjustedMillis, zone));
  }
  return result2;
};
var formatIso = (self) => toDateUtc(self).toISOString();
var formatIsoOffset = (self) => {
  const date = toDate(self);
  return self._tag === "Utc" ? date.toISOString() : `${date.toISOString().slice(0, -1)}${zonedOffsetIso(self)}`;
};
var formatIsoZoned = (self) => self.zone._tag === "Offset" ? formatIsoOffset(self) : `${formatIsoOffset(self)}[${self.zone.id}]`;

// node_modules/effect/dist/Number.js
var Number3 = globalThis.Number;
var remainder = /* @__PURE__ */ dual(2, (self, divisor) => {
  const selfString = self.toString();
  const divisorString = divisor.toString();
  if (selfString.includes("e") || divisorString.includes("e")) {
    if (!globalThis.Number.isFinite(self) || !globalThis.Number.isFinite(divisor) || divisor === 0) {
      return NaN;
    }
    return remainderWithScientificNotation(self, divisor);
  }
  const selfDecCount = (selfString.split(".")[1] || "").length;
  const divisorDecCount = (divisorString.split(".")[1] || "").length;
  const decCount = selfDecCount > divisorDecCount ? selfDecCount : divisorDecCount;
  const selfInt = parseInt(self.toFixed(decCount).replace(".", ""));
  const divisorInt = parseInt(divisor.toFixed(decCount).replace(".", ""));
  return selfInt % divisorInt / Math.pow(10, decCount);
});
function remainderWithScientificNotation(self, divisor) {
  const [selfCoefficient, selfExponent] = toScientificInteger(self);
  const [divisorCoefficient, divisorExponent] = toScientificInteger(divisor);
  const exponent = Math.min(selfExponent, divisorExponent);
  const selfInteger = selfCoefficient * BigInt(10) ** BigInt(selfExponent - exponent);
  const divisorInteger = divisorCoefficient * BigInt(10) ** BigInt(divisorExponent - exponent);
  const out = selfInteger % divisorInteger;
  if (out === BigInt(0)) {
    return self < 0 || Object.is(self, -0) ? -0 : 0;
  }
  const remainder2 = globalThis.Number(`${out}e${exponent}`);
  return remainder2 === 0 ? Math.sign(self) * globalThis.Number.MIN_VALUE : remainder2;
}
function toScientificInteger(n) {
  const scientific = Math.abs(n).toExponential();
  const eIndex = scientific.indexOf("e");
  const digits = scientific.slice(0, eIndex).replace(".", "");
  const coefficient = BigInt(digits) * (n < 0 ? -BigInt(1) : BigInt(1));
  return [coefficient, globalThis.Number(scientific.slice(eIndex + 1)) - digits.length + 1];
}
var nextPow2 = (n) => {
  const nextPow = Math.ceil(Math.log(n) / Math.log(2));
  return Math.max(Math.pow(2, nextPow), 2);
};
var ReducerMax = /* @__PURE__ */ make2((a, b) => Math.max(a, b), -Infinity);
var ReducerMin = /* @__PURE__ */ make2((a, b) => Math.min(a, b), Infinity);

// node_modules/effect/dist/String.js
var String2 = globalThis.String;
var isString2 = isString;
var trim = (self) => self.trim();
var CR = 13;
var LF = 10;
class LinesIterator {
  index;
  length;
  s;
  stripped;
  constructor(s, stripped = false) {
    this.s = s;
    this.stripped = stripped;
    this.index = 0;
    this.length = s.length;
  }
  next() {
    if (this.done) {
      return {
        done: true,
        value: undefined
      };
    }
    const start = this.index;
    while (!this.done && !isLineBreak(this.s[this.index])) {
      this.index = this.index + 1;
    }
    let end = this.index;
    if (!this.done) {
      const char = this.s[this.index];
      this.index = this.index + 1;
      if (!this.done && isLineBreak2(char, this.s[this.index])) {
        this.index = this.index + 1;
      }
      if (!this.stripped) {
        end = this.index;
      }
    }
    return {
      done: false,
      value: this.s.substring(start, end)
    };
  }
  [Symbol.iterator]() {
    return new LinesIterator(this.s, this.stripped);
  }
  get done() {
    return this.index >= this.length;
  }
}
var isLineBreak = (char) => {
  const code = char.charCodeAt(0);
  return code === CR || code === LF;
};
var isLineBreak2 = (char0, char1) => char0.charCodeAt(0) === CR && char1.charCodeAt(0) === LF;

// node_modules/effect/dist/Pull.js
var catchDone = /* @__PURE__ */ dual(2, (effect2, f) => catchCauseFilter(effect2, filterDoneLeftover, (l) => f(l)));
var isDoneCause = (cause) => cause.reasons.some(isDoneFailure);
var isDoneFailure = (failure) => failure._tag === "Fail" && isDone3(failure.error);
var filterDone = (cause) => {
  let done4;
  let hasFailure = false;
  for (const reason of cause.reasons) {
    if (isDoneFailure(reason)) {
      done4 ??= reason.error;
    } else if (reason._tag !== "Interrupt") {
      hasFailure = true;
    }
  }
  if (done4 === undefined)
    return fail2(cause);
  return hasFailure ? fail2(fromReasons(cause.reasons.filter((reason) => !isDoneFailure(reason)))) : succeed2(done4);
};
var filterDoneLeftover = (cause) => {
  const done4 = filterDone(cause);
  return isFailure2(done4) ? done4 : succeed2(done4.success.value);
};
var doneExitFromCause = (cause) => {
  const halt = filterDone(cause);
  return !isFailure2(halt) ? succeed4(halt.success.value) : failCause2(halt.failure);
};
var matchEffect2 = /* @__PURE__ */ dual(2, (self, options) => matchCauseEffect(self, {
  onSuccess: options.onSuccess,
  onFailure: (cause) => {
    const halt = filterDone(cause);
    return !isFailure2(halt) ? options.onDone(halt.success.value) : options.onFailure(halt.failure);
  }
}));

// node_modules/effect/dist/Schedule.js
var TypeId9 = "~effect/Schedule";
var CurrentMetadata2 = /* @__PURE__ */ Reference("effect/Schedule/CurrentMetadata", {
  defaultValue: /* @__PURE__ */ constant({
    input: undefined,
    output: undefined,
    duration: zero,
    attempt: 0,
    start: 0,
    now: 0,
    elapsed: 0,
    elapsedSincePrevious: 0
  })
});
var ScheduleProto = {
  [TypeId9]: {
    _Out: identity,
    _In: identity,
    _Env: identity
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var isSchedule = (u) => hasProperty(u, TypeId9);
var fromStep = (step) => {
  const self = Object.create(ScheduleProto);
  self.step = step;
  return self;
};
var metadataFn = () => {
  let n = 0;
  let previous;
  let start;
  return (now, input) => {
    if (start === undefined)
      start = now;
    const elapsed = now - start;
    const elapsedSincePrevious = previous === undefined ? 0 : now - previous;
    previous = now;
    return {
      input,
      attempt: ++n,
      start,
      now,
      elapsed,
      elapsedSincePrevious
    };
  };
};
var fromStepWithMetadata = (step) => fromStep(map5(step, (f) => {
  const meta = metadataFn();
  return (now, input) => f(meta(now, input));
}));
var toStep = (schedule) => catchCause(schedule.step, (cause) => succeed3(() => failCause(cause)));
var toStepWithMetadata = (schedule) => clockWith((clock) => map5(toStep(schedule), (step) => {
  const metaFn = metadataFn();
  return (input) => suspend(() => {
    const now = clock.currentTimeMillisUnsafe();
    return flatMap3(step(now, input), ([output, duration]) => {
      const meta = metaFn(now, input);
      meta.output = output;
      meta.duration = duration;
      return as(sleep(duration), meta);
    });
  });
}));
var toStepWithSleep = (schedule) => map5(toStepWithMetadata(schedule), (step) => (input) => map5(step(input), (meta) => meta.output));
var passthrough = (self) => fromStep(map5(toStep(self), (step) => (now, input) => matchEffect2(step(now, input), {
  onSuccess: (result2) => succeed3([input, result2[1]]),
  onFailure: failCause,
  onDone: () => done3(input)
})));
var recurs = (times) => while_(forever3, ({
  attempt
}) => succeed3(attempt <= times));
var spaced = (duration) => {
  const decoded = fromInputUnsafe(duration);
  return fromStepWithMetadata(succeed3((meta) => succeed3([meta.attempt - 1, decoded])));
};
var while_ = /* @__PURE__ */ dual(2, (self, predicate) => fromStep(map5(toStep(self), (step) => {
  const meta = metadataFn();
  return (now, input) => flatMap3(step(now, input), (result2) => {
    const [output, duration] = result2;
    const eff = predicate({
      ...meta(now, input),
      output,
      duration
    });
    return flatMap3(isEffect(eff) ? eff : succeed3(eff), (check) => check ? succeed3(result2) : done3(output));
  });
})));
var forever3 = /* @__PURE__ */ spaced(zero);

// node_modules/effect/dist/internal/layer.js
var provideLayer = (self, layer, options) => scopedWith((scope2) => flatMap3(options?.local ? buildWithMemoMap(layer, makeMemoMapUnsafe(), scope2) : buildWithScope(layer, scope2), (context2) => provideContext(self, context2)));
var provide3 = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, source, options) => isContext(source) ? provideContext(self, source) : provideLayer(self, Array.isArray(source) ? mergeAll2(...source) : source, options));

// node_modules/effect/dist/internal/schedule.js
var repeatOrElse = /* @__PURE__ */ dual(3, (self, schedule, orElse) => flatMap3(toStepWithMetadata(schedule), (step) => {
  let meta = CurrentMetadata2.defaultValue();
  return catch_(forever2(tap(flatMap3(suspend(() => provideService(self, CurrentMetadata2, meta)), step), (meta_) => sync(() => {
    meta = meta_;
  })), {
    disableYield: true
  }), (error) => isDone(error) ? succeed3(error.value) : orElse(error, meta.attempt === 0 ? none2() : some2(meta)));
}));
var retryOrElse = /* @__PURE__ */ dual(3, (self, policy, orElse) => flatMap3(toStepWithMetadata(policy), (step) => {
  let meta = CurrentMetadata2.defaultValue();
  let lastError;
  const loop = catch_(suspend(() => provideService(self, CurrentMetadata2, meta)), (error) => {
    lastError = error;
    return flatMap3(step(error), (meta_) => {
      meta = meta_;
      return loop;
    });
  });
  return catchDone(loop, (out) => internalCall(() => orElse(lastError, out)));
}));
var repeat2 = /* @__PURE__ */ dual(2, (self, options) => {
  const schedule = typeof options === "function" ? options(identity) : isSchedule(options) ? options : buildFromOptions(options);
  return repeatOrElse(self, schedule, fail3);
});
var retry = /* @__PURE__ */ dual(2, (self, options) => {
  const schedule = typeof options === "function" ? options(identity) : isSchedule(options) ? options : buildFromOptions(options);
  return retryOrElse(self, schedule, fail3);
});
var scheduleFrom = /* @__PURE__ */ dual(3, (self, initial, schedule) => flatMap3(toStepWithMetadata(schedule), (step) => {
  let meta = CurrentMetadata2.defaultValue();
  const selfWithMeta = suspend(() => provideService(self, CurrentMetadata2, meta));
  return catch_(flatMap3(step(initial), (meta_) => {
    meta = meta_;
    const body = constant(flatMap3(selfWithMeta, step));
    return whileLoop({
      while: constTrue,
      body,
      step(meta_2) {
        meta = meta_2;
      }
    });
  }), (error) => isDone(error) ? succeed3(error.value) : fail3(error));
}));
var passthroughForever = /* @__PURE__ */ passthrough(forever3);
var buildFromOptions = (options) => {
  let schedule = options.schedule ? passthrough(options.schedule) : passthroughForever;
  if (options.while) {
    schedule = while_(schedule, ({
      input
    }) => {
      const applied = options.while(input);
      return isEffect(applied) ? applied : succeed3(applied);
    });
  }
  if (options.until) {
    schedule = while_(schedule, ({
      input
    }) => {
      const applied = options.until(input);
      return isEffect(applied) ? map5(applied, (b) => !b) : succeed3(!applied);
    });
  }
  if (options.times !== undefined) {
    schedule = while_(schedule, ({
      attempt
    }) => succeed3(attempt <= options.times));
  }
  return schedule;
};

// node_modules/effect/dist/internal/executionPlan.js
var makeEventEmitter = (onEvent, currentMetadata) => {
  let lastStepIndex = -1;
  let stepAttempt = 0;
  const emit = (event) => ignoreCause(onEvent(event));
  return {
    begin: clockWith((clock) => suspend(() => {
      const meta = currentMetadata();
      if (meta.stepIndex !== lastStepIndex) {
        lastStepIndex = meta.stepIndex;
        stepAttempt = 0;
      }
      stepAttempt++;
      const state = {
        attempt: meta.attempt,
        stepAttempt,
        stepIndex: meta.stepIndex,
        startNanos: clock.monotonicTimeNanosUnsafe()
      };
      return as(emit({
        _tag: "AttemptStart",
        attempt: state.attempt,
        stepAttempt: state.stepAttempt,
        stepIndex: state.stepIndex
      }), state);
    })),
    end: (state, exit2) => clockWith((clock) => {
      const duration = nanos(clock.monotonicTimeNanosUnsafe() - state.startNanos);
      return emit(exit2._tag === "Success" ? {
        _tag: "AttemptSuccess",
        attempt: state.attempt,
        stepAttempt: state.stepAttempt,
        stepIndex: state.stepIndex,
        duration
      } : {
        _tag: "AttemptFailure",
        attempt: state.attempt,
        stepAttempt: state.stepAttempt,
        stepIndex: state.stepIndex,
        duration,
        cause: exit2.cause
      });
    })
  };
};
var withExecutionPlan = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, plan, options) => suspend(() => {
  let i = 0;
  let meta = {
    attempt: 0,
    stepIndex: 0
  };
  const provideMeta = provideServiceEffect(CurrentMetadata, sync(() => {
    meta = {
      attempt: meta.attempt + 1,
      stepIndex: i
    };
    return meta;
  }));
  const emitter = options?.onEvent === undefined ? undefined : makeEventEmitter(options.onEvent, () => meta);
  const instrument = emitter === undefined ? identity : (attempt) => uninterruptibleMask((restore) => flatMap3(emitter.begin, (state) => onExit(restore(attempt), (exit2) => emitter.end(state, exit2))));
  let result2;
  return flatMap3(whileLoop({
    while: () => i < plan.steps.length && (result2 === undefined || isFailure2(result2)),
    body() {
      const step = plan.steps[i];
      let nextEffect = provideMeta(instrument(provide3(self, step.provide)));
      if (result2) {
        let attempted = false;
        const wrapped = nextEffect;
        nextEffect = suspend(() => {
          if (attempted)
            return wrapped;
          attempted = true;
          return fromResult(result2);
        });
        nextEffect = retry(nextEffect, scheduleFromStep(step, false));
      } else {
        const schedule = scheduleFromStep(step, true);
        nextEffect = schedule ? retry(nextEffect, schedule) : nextEffect;
      }
      return result(nextEffect);
    },
    step(result_) {
      result2 = result_;
      i++;
    }
  }), () => fromResult(result2));
}));
var scheduleFromStep = (step, first) => {
  if (!first) {
    return buildFromOptions({
      schedule: step.schedule ? step.schedule : step.attempts ? undefined : scheduleOnce,
      times: step.attempts,
      while: step.while
    });
  } else if (step.attempts === 1 || !(step.schedule || step.attempts)) {
    return;
  }
  return buildFromOptions({
    schedule: step.schedule,
    while: step.while,
    times: step.attempts ? step.attempts - 1 : undefined
  });
};
var scheduleOnce = /* @__PURE__ */ recurs(1);

// node_modules/effect/dist/Request.js
var TypeId10 = "~effect/Request";
var requestVariance = /* @__PURE__ */ byReferenceUnsafe({
  _E: (_) => _,
  _A: (_) => _,
  _R: (_) => _
});
var RequestPrototype = {
  ...StructuralProto,
  [TypeId10]: requestVariance
};
var makeEntry = (options) => options;

// node_modules/effect/dist/internal/request.js
var request = /* @__PURE__ */ dual(2, (self, resolver) => {
  const withResolver = (resolver2) => callback((resume) => {
    const entry = addEntry(resolver2, self, resume, getCurrentFiber());
    return maybeRemoveEntry(resolver2, entry);
  });
  return isEffect(resolver) ? flatMap3(resolver, withResolver) : withResolver(resolver);
});
var requestUnsafe = (self, options) => {
  const entry = addEntry(options.resolver, self, options.onExit, {
    context: options.context,
    currentScheduler: get(options.context, Scheduler)
  });
  return () => removeEntryUnsafe(options.resolver, entry);
};
var batchPool = [];
var pendingBatches = /* @__PURE__ */ new WeakMap;
var addEntry = (resolver, request2, resume, fiber2) => {
  let batchMap = pendingBatches.get(resolver);
  if (!batchMap) {
    batchMap = new Map;
    pendingBatches.set(resolver, batchMap);
  }
  let batch;
  let completed = false;
  const entry = makeEntry({
    request: request2,
    context: fiber2.context,
    uninterruptible: false,
    completeUnsafe(effect2) {
      if (completed)
        return;
      completed = true;
      resume(effect2);
      batch?.entrySet.delete(entry);
    }
  });
  if (resolver.preCheck !== undefined && !resolver.preCheck(entry)) {
    return entry;
  }
  const key = resolver.batchKey(entry);
  batch = batchMap.get(key);
  if (!batch) {
    if (batchPool.length > 0) {
      batch = batchPool.pop();
      batch.key = key;
      batch.resolver = resolver;
      batch.map = batchMap;
    } else {
      const newBatch = {
        key,
        resolver,
        map: batchMap,
        entrySet: new Set,
        entries: new Set,
        delayEffect: flatMap3(suspend(() => newBatch.resolver.delay), (_) => runBatch(newBatch)),
        run: onExit(suspend(() => newBatch.resolver.runAll(Array.from(newBatch.entries), newBatch.key)), (exit2) => {
          for (const entry2 of newBatch.entrySet) {
            entry2.completeUnsafe(exit2._tag === "Success" ? exitDie(new Error("Effect.request: RequestResolver did not complete request", {
              cause: entry2.request
            })) : exit2);
          }
          newBatch.entries.clear();
          if (batchPool.length < 128) {
            newBatch.entrySet.clear();
            newBatch.key = undefined;
            newBatch.fiber = undefined;
            newBatch.resolver = undefined;
            newBatch.map = undefined;
            batchPool.push(newBatch);
          }
          return void_;
        })
      };
      batch = newBatch;
    }
    batchMap.set(key, batch);
    batch.fiber = runForkWith(fiber2.context)(batch.delayEffect, {
      scheduler: fiber2.currentScheduler
    });
  }
  batch.entrySet.add(entry);
  batch.entries.add(entry);
  if (batch.resolver.collectWhile(batch.entries))
    return entry;
  batch.fiber.interruptUnsafe(fiber2.id);
  batch.fiber = runForkWith(fiber2.context)(runBatch(batch), {
    scheduler: fiber2.currentScheduler
  });
  return entry;
};
var removeEntryUnsafe = (resolver, entry) => {
  if (entry.uninterruptible)
    return;
  const batchMap = pendingBatches.get(resolver);
  if (!batchMap)
    return;
  const key = resolver.batchKey(entry);
  const batch = batchMap.get(key);
  if (!batch)
    return;
  batch.entries.delete(entry);
  batch.entrySet.delete(entry);
  if (batch.entries.size === 0) {
    batchMap.delete(key);
    batch.fiber?.interruptUnsafe();
  }
};
var maybeRemoveEntry = (resolver, entry) => sync(() => removeEntryUnsafe(resolver, entry));
function runBatch(batch) {
  if (!batch.map.has(batch.key))
    return void_;
  batch.map.delete(batch.key);
  return batch.run;
}

// node_modules/effect/dist/Metric.js
var CurrentMetricAttributesKey = "effect/Metric/CurrentMetricAttributes";
var CurrentMetricAttributes = /* @__PURE__ */ Reference(CurrentMetricAttributesKey, {
  defaultValue: () => ({})
});
var MetricRegistryKey = "~effect/observability/Metric/MetricRegistryKey";
var MetricRegistry = /* @__PURE__ */ Reference(MetricRegistryKey, {
  defaultValue: () => new Map
});
var TypeId11 = "~effect/observability/Metric";

class Metric$ {
  [TypeId11] = TypeId11;
  #metadataCache = /* @__PURE__ */ new WeakMap;
  #metadata;
  id;
  description;
  attributes;
  constructor(id, description, attributes) {
    this.id = id;
    this.description = description;
    this.attributes = attributes;
  }
  valueUnsafe(context2) {
    return this.hook(context2).get(context2);
  }
  modifyUnsafe(input, context2) {
    return this.hook(context2).modify(input, context2);
  }
  updateUnsafe(input, context2) {
    return this.hook(context2).update(input, context2);
  }
  hook(context2) {
    const extraAttributes = get(context2, CurrentMetricAttributes);
    if (Object.keys(extraAttributes).length === 0) {
      if (isNotUndefined(this.#metadata)) {
        return this.#metadata.hooks;
      }
      this.#metadata = this.getOrCreate(context2, this.attributes);
      return this.#metadata.hooks;
    }
    const mergedAttributes = mergeAttributes(this.attributes, extraAttributes);
    let metadata = this.#metadataCache.get(mergedAttributes);
    if (isNotUndefined(metadata)) {
      return metadata.hooks;
    }
    metadata = this.getOrCreate(context2, mergedAttributes);
    this.#metadataCache.set(mergedAttributes, metadata);
    return metadata.hooks;
  }
  getOrCreate(context2, attributes) {
    const key = makeKey(this, attributes);
    const registry = get(context2, MetricRegistry);
    if (registry.has(key)) {
      return registry.get(key);
    }
    const hooks = this.createHooks();
    const meta = {
      id: this.id,
      type: this.type,
      description: this.description,
      attributes: attributesToRecord(attributes),
      hooks
    };
    registry.set(key, meta);
    return meta;
  }
  pipe() {
    return pipeArguments(this, arguments);
  }
}
var update = /* @__PURE__ */ dual(2, (self, input) => contextWith((services) => sync(() => self.updateUnsafe(input, services))));
function makeKey(metric, attributes) {
  let key = `${metric.type}:${metric.id}`;
  if (isNotUndefined(metric.description)) {
    key += `:${metric.description}`;
  }
  if (isNotUndefined(attributes)) {
    key += `:${serializeAttributes(attributes)}`;
  }
  return key;
}
function serializeAttributes(attributes) {
  return JSON.stringify(Array.isArray(attributes) ? attributes : Object.entries(attributes));
}
function mergeAttributes(self, other) {
  return {
    ...attributesToRecord(self),
    ...attributesToRecord(other)
  };
}
function attributesToRecord(attributes) {
  if (isNotUndefined(attributes) && Array.isArray(attributes)) {
    return attributes.reduce((acc, [key, value]) => {
      assignProperty(acc, key, value);
      return acc;
    }, {});
  }
  return attributes;
}

// node_modules/effect/dist/Effect.js
var TypeId12 = EffectTypeId;
var isEffect2 = isEffect;
var all2 = all;
var partition3 = partition2;
var reduce2 = reduce;
var validate2 = validate;
var findFirst2 = findFirst;
var findFirstFilter2 = findFirstFilter;
var forEach2 = forEach;
var head2 = head;
var whileLoop2 = whileLoop;
var promise2 = promise;
var tryPromise2 = tryPromise;
var succeed6 = succeed3;
var succeedNone2 = succeedNone;
var succeedSome2 = succeedSome;
var suspend3 = suspend;
var sync3 = sync;
var void_3 = void_;
var undefined_2 = undefined_;
var callback2 = callback;
var never2 = never;
var Do2 = Do;
var bindTo3 = bindTo2;
var let_3 = let_2;
var bind3 = bind2;
var gen2 = gen;
var fail6 = fail3;
var failSync2 = failSync;
var failCause4 = failCause;
var failCauseSync2 = failCauseSync;
var die4 = die;
var try_3 = try_2;
var yieldNow2 = yieldNow;
var yieldNowWith2 = yieldNowWith;
var withFiber2 = withFiber;
var fromResult2 = fromResult;
var fromOption3 = fromOption2;
var transposeOption2 = transposeOption;
var fromNullishOr3 = fromNullishOr2;
var flatMap5 = flatMap3;
var flatten5 = flatten4;
var andThen2 = andThen;
var tap3 = tap;
var result2 = result;
var option2 = option;
var exit2 = exit;
var map7 = map5;
var as2 = as;
var asSome2 = asSome;
var asVoid2 = asVoid;
var flip2 = flip;
var zip2 = zip;
var zipWith2 = zipWith;
var catch_3 = catch_;
var catchTag3 = catchTag;
var catchTags2 = catchTags;
var catchReason2 = catchReason;
var catchReasons2 = catchReasons;
var unwrapReason2 = unwrapReason;
var catchCause3 = catchCause;
var catchDefect2 = catchDefect;
var catchIf2 = catchIf;
var catchFilter2 = catchFilter;
var catchNoSuchElement2 = catchNoSuchElement;
var catchCauseIf2 = catchCauseIf;
var catchCauseFilter2 = catchCauseFilter;
var mapError3 = mapError2;
var mapBoth2 = mapBoth;
var orDie3 = orDie;
var tapError3 = tapError;
var tapErrorTag2 = tapErrorTag;
var tapCause3 = tapCause;
var tapCauseIf2 = tapCauseIf;
var tapCauseFilter2 = tapCauseFilter;
var tapDefect2 = tapDefect;
var eventually2 = eventually;
var retry2 = retry;
var retryOrElse2 = retryOrElse;
var sandbox2 = sandbox;
var ignore2 = ignore;
var ignoreCause2 = ignoreCause;
var withExecutionPlan2 = withExecutionPlan;
var withErrorReporting2 = withErrorReporting;
var orElseSucceed2 = orElseSucceed;
var firstSuccessOf2 = firstSuccessOf;
var timeout2 = timeout;
var timeoutOption2 = timeoutOption;
var timeoutOrElse2 = timeoutOrElse;
var delay2 = delay;
var sleep2 = sleep;
var timed2 = timed;
var raceAll2 = raceAll;
var raceAllFirst2 = raceAllFirst;
var race2 = race;
var raceFirst2 = raceFirst;
var filter5 = filter4;
var filterMap2 = filterMap;
var filterMapEffect2 = filterMapEffect;
var filterOrElse2 = filterOrElse;
var filterMapOrElse2 = filterMapOrElse;
var filterOrFail2 = filterOrFail;
var filterMapOrFail2 = filterMapOrFail;
var when2 = when;
var match6 = match4;
var matchEager2 = matchEager;
var matchCause2 = matchCause;
var matchCauseEager2 = matchCauseEager;
var matchCauseEffectEager2 = matchCauseEffectEager;
var matchCauseEffect2 = matchCauseEffect;
var matchEffect3 = matchEffect;
var isFailure5 = isFailure3;
var isSuccess5 = isSuccess3;
var context2 = context;
var contextWith2 = contextWith;
var provide4 = provide3;
var provideContext2 = provideContext;
var setContext2 = setContext;
var service2 = service;
var serviceOption2 = serviceOption;
var updateContext2 = updateContext;
var updateService3 = updateService;
var updateServiceScoped2 = updateServiceScoped;
var provideService2 = provideService;
var provideServiceEffect2 = provideServiceEffect;
var scope2 = scope;
var scoped2 = scoped;
var scopedWith2 = scopedWith;
var acquireRelease2 = acquireRelease;
var acquireDisposable2 = acquireDisposable;
var acquireUseRelease2 = acquireUseRelease;
var addFinalizer3 = addFinalizer;
var ensuring2 = ensuring;
var onError2 = onError;
var onErrorIf2 = onErrorIf;
var onErrorFilter2 = onErrorFilter;
var onExitPrimitive2 = onExitPrimitive;
var onExit2 = onExit;
var onExitIf2 = onExitIf;
var onExitFilter2 = onExitFilter;
var cached2 = cached;
var cachedWithTTL2 = cachedWithTTL;
var cachedInvalidateWithTTL2 = cachedInvalidateWithTTL;
var interrupt3 = interrupt;
var interruptible2 = interruptible;
var onInterrupt2 = onInterrupt;
var uninterruptible2 = uninterruptible;
var uninterruptibleMask2 = uninterruptibleMask;
var interruptibleMask2 = interruptibleMask;
var abortSignal2 = abortSignal;
var forever4 = forever2;
var repeat3 = repeat2;
var repeatOrElse2 = repeatOrElse;
var replicate2 = replicate;
var replicateEffect2 = replicateEffect;
var schedule = /* @__PURE__ */ dual(2, (self, schedule2) => scheduleFrom2(self, undefined, schedule2));
var scheduleFrom2 = scheduleFrom;
var tracer2 = tracer;
var withTracer2 = withTracer;
var withTracerEnabled2 = withTracerEnabled;
var withTracerTiming2 = withTracerTiming;
var annotateSpans2 = annotateSpans;
var annotateCurrentSpan2 = annotateCurrentSpan;
var currentSpan2 = currentSpan;
var currentParentSpan2 = currentParentSpan;
var spanAnnotations2 = spanAnnotations;
var spanLinks2 = spanLinks;
var linkSpans2 = linkSpans;
var makeSpan2 = makeSpan;
var makeSpanScoped2 = makeSpanScoped;
var useSpan2 = useSpan;
var withSpan3 = withSpan;
var withSpanScoped2 = withSpanScoped;
var withParentSpan3 = withParentSpan;
var request2 = request;
var requestUnsafe2 = requestUnsafe;
var forkChild2 = forkChild;
var forkIn2 = forkIn;
var forkScoped2 = forkScoped;
var forkDetach2 = forkDetach;
var awaitAllChildren2 = awaitAllChildren;
var fiber2 = fiber;
var fiberId2 = fiberId;
var runFork2 = runFork;
var runForkWith2 = runForkWith;
var runCallbackWith2 = runCallbackWith;
var runCallback2 = runCallback;
var runPromise2 = runPromise;
var runPromiseWith2 = runPromiseWith;
var runPromiseExit2 = runPromiseExit;
var runPromiseExitWith2 = runPromiseExitWith;
var runSync2 = runSync;
var runSyncWith2 = runSyncWith;
var runSyncExit2 = runSyncExit;
var runSyncExitWith2 = runSyncExitWith;
var fnUntraced2 = fnUntraced;
var fn2 = fn;
var clockWith2 = clockWith;
var logWithLevel2 = logWithLevel;
var log = /* @__PURE__ */ logWithLevel();
var logFatal = /* @__PURE__ */ logWithLevel("Fatal");
var logWarning = /* @__PURE__ */ logWithLevel("Warn");
var logError = /* @__PURE__ */ logWithLevel("Error");
var logInfo = /* @__PURE__ */ logWithLevel("Info");
var logDebug = /* @__PURE__ */ logWithLevel("Debug");
var logTrace = /* @__PURE__ */ logWithLevel("Trace");
var withLogger = /* @__PURE__ */ dual(2, (effect2, logger) => updateService(effect2, CurrentLoggers, (loggers) => new Set([...loggers, logger])));
var annotateLogs = /* @__PURE__ */ dual((args2) => isEffect2(args2[0]), (effect2, ...args2) => updateService(effect2, CurrentLogAnnotations2, (annotations) => {
  const newAnnotations = args2.length === 1 ? {
    ...annotations,
    ...args2[0]
  } : {
    ...annotations
  };
  if (args2.length === 1) {
    return newAnnotations;
  } else {
    assignProperty(newAnnotations, args2[0], args2[1]);
  }
  return newAnnotations;
}));
var annotateLogsScoped2 = annotateLogsScoped;
var withLogSpan = /* @__PURE__ */ dual(2, (effect2, label) => flatMap3(currentTimeMillis, (now) => updateService(effect2, CurrentLogSpans2, (spans) => {
  const span2 = [label, now];
  return [span2, ...spans];
})));
var track = /* @__PURE__ */ dual((args2) => isEffect2(args2[0]), (self, metric, f) => onExit2(self, (exit3) => {
  const input = f === undefined ? exit3 : internalCall(() => f(exit3));
  return update(metric, input);
}));
var trackSuccesses = /* @__PURE__ */ dual((args2) => isEffect2(args2[0]), (self, metric, f) => tap3(self, (value) => {
  const input = f === undefined ? value : f(value);
  return update(metric, input);
}));
var trackErrors = /* @__PURE__ */ dual((args2) => isEffect2(args2[0]), (self, metric, f) => tapError3(self, (error) => {
  const input = f === undefined ? error : internalCall(() => f(error));
  return update(metric, input);
}));
var trackDefects = /* @__PURE__ */ dual((args2) => isEffect2(args2[0]), (self, metric, f) => tapDefect2(self, (defect) => {
  const input = f === undefined ? defect : internalCall(() => f(defect));
  return update(metric, input);
}));
var trackDuration = /* @__PURE__ */ dual((args2) => isEffect2(args2[0]), (self, metric, f) => clockWith2((clock) => {
  const startTime = clock.monotonicTimeNanosUnsafe();
  return onExit2(self, () => {
    const endTime = clock.monotonicTimeNanosUnsafe();
    const duration = subtract(fromInputUnsafe(endTime), fromInputUnsafe(startTime));
    const input = f === undefined ? duration : internalCall(() => f(duration));
    return update(metric, input);
  });
}));

class Transaction extends (/* @__PURE__ */ Service()("effect/Effect/Transaction")) {
}
var tx = (effect2) => withFiber2((fiber3) => {
  let state = getOrUndefined2(fiber3.context, Transaction);
  if (state) {
    return effect2;
  }
  state = {
    journal: new Map,
    retry: false
  };
  let result3;
  return uninterruptibleMask2((restore) => flatMap5(whileLoop2({
    while: () => !result3,
    body: constant(restore(effect2).pipe(provideService2(Transaction, state), tapCause3(() => {
      if (!state.retry)
        return void_3;
      return restore(awaitPendingTransaction(state));
    }), exit2)),
    step(exit3) {
      if (state.retry || !isTransactionConsistent(state)) {
        return clearTransaction(state);
      }
      if (isSuccess4(exit3)) {
        commitTransaction(fiber3, state);
      } else {
        clearTransaction(state);
      }
      result3 = exit3;
    }
  }), () => result3));
});
var isTransactionConsistent = (state) => {
  for (const [ref, {
    version
  }] of state.journal) {
    if (ref.version !== version) {
      return false;
    }
  }
  return true;
};
var awaitPendingTransaction = (state) => suspend3(() => {
  const key = {};
  const refs = Array.from(state.journal.keys());
  const clearPending = () => {
    for (const clear of refs) {
      clear.pending.delete(key);
    }
  };
  return callback2((resume) => {
    const onCall = () => {
      clearPending();
      resume(void_3);
    };
    for (const ref of refs) {
      ref.pending.set(key, onCall);
    }
    return sync3(clearPending);
  });
});
function commitTransaction(fiber3, state) {
  for (const [ref, {
    value
  }] of state.journal) {
    if (value !== ref.value) {
      ref.version = ref.version + 1;
      ref.value = value;
    }
    for (const pending of ref.pending.values()) {
      fiber3.currentDispatcher.scheduleTask(pending, 0);
    }
    ref.pending.clear();
  }
}
function clearTransaction(state) {
  state.retry = false;
  state.journal.clear();
}
var txRetry = /* @__PURE__ */ flatMap5(Transaction, (state) => {
  state.retry = true;
  return interrupt3;
});
var effectify = (fn3, onError3, onSyncError) => (...args2) => callback2((resume) => {
  try {
    fn3(...args2, (err, result3) => {
      if (err) {
        resume(fail6(onError3 ? onError3(err, args2) : err));
      } else {
        resume(succeed6(result3));
      }
    });
  } catch (err) {
    resume(onSyncError ? fail6(onSyncError(err, args2)) : die4(err));
  }
});
var satisfiesSuccessType2 = () => (effect2) => effect2;
var satisfiesErrorType2 = () => (effect2) => effect2;
var satisfiesServicesType2 = () => (effect2) => effect2;
var mapEager2 = mapEager;
var mapErrorEager2 = mapErrorEager;
var mapBothEager2 = mapBothEager;
var flatMapEager2 = flatMapEager;
var catchEager2 = catchEager;
var fnUntracedEager2 = fnUntracedEager;
// node_modules/effect/dist/FileSystem.js
var exports_FileSystem = {};
__export(exports_FileSystem, {
  FileSystem: () => FileSystem,
  FileTypeId: () => FileTypeId,
  GiB: () => GiB,
  KiB: () => KiB,
  MiB: () => MiB,
  PiB: () => PiB,
  Size: () => Size,
  TiB: () => TiB,
  WatchBackend: () => WatchBackend,
  isFile: () => isFile,
  layerNoop: () => layerNoop,
  make: () => make18,
  makeNoop: () => makeNoop
});

// node_modules/effect/dist/PlatformError.js
var TypeId13 = "~effect/platform/PlatformError";

class BadArgument extends (/* @__PURE__ */ TaggedError2("BadArgument")) {
  get message() {
    return `${this.module}.${this.method}${this.description ? `: ${this.description}` : ""}`;
  }
}

class SystemError extends Error3 {
  get message() {
    return `${this._tag}: ${this.module}.${this.method}${this.pathOrDescriptor !== undefined ? ` (${this.pathOrDescriptor})` : ""}${this.description ? `: ${this.description}` : ""}`;
  }
}

class PlatformError extends (/* @__PURE__ */ TaggedError2("PlatformError")) {
  constructor(reason) {
    if ("cause" in reason) {
      super({
        reason,
        cause: reason.cause
      });
    } else {
      super({
        reason
      });
    }
  }
  [TypeId13] = TypeId13;
  get message() {
    return this.reason.message;
  }
}
var systemError = (options) => new PlatformError(new SystemError(options));
var badArgument = (options) => new PlatformError(new BadArgument(options));

// node_modules/effect/dist/Chunk.js
var TypeId14 = "~effect/collections/Chunk";
function copy(src, srcPos, dest, destPos, len) {
  for (let i = srcPos;i < Math.min(src.length, srcPos + len); i++) {
    dest[destPos + i - srcPos] = src[i];
  }
  return dest;
}
var emptyArray = [];
var makeEquivalence3 = (isEquivalent) => make3((self, that) => self.length === that.length && toReadonlyArray(self).every((value, i) => isEquivalent(value, getUnsafe3(that, i))));
var _equivalence = /* @__PURE__ */ makeEquivalence3(equals);
var ChunkProto = {
  [TypeId14]: {
    _A: (_) => _
  },
  toString() {
    return `Chunk(${format(toReadonlyArray(this))})`;
  },
  toJSON() {
    return {
      _id: "Chunk",
      values: toJson(toReadonlyArray(this))
    };
  },
  [NodeInspectSymbol]() {
    return this.toJSON();
  },
  [symbol2](that) {
    return isChunk(that) && _equivalence(this, that);
  },
  [symbol]() {
    return array(toReadonlyArray(this));
  },
  [Symbol.iterator]() {
    switch (this.backing._tag) {
      case "IArray": {
        return this.backing.array[Symbol.iterator]();
      }
      case "IEmpty": {
        return emptyArray[Symbol.iterator]();
      }
      default: {
        return toReadonlyArray(this)[Symbol.iterator]();
      }
    }
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var makeChunk = (backing) => {
  const chunk = Object.create(ChunkProto);
  chunk.backing = backing;
  switch (backing._tag) {
    case "IEmpty": {
      chunk.length = 0;
      chunk.depth = 0;
      chunk.left = chunk;
      chunk.right = chunk;
      break;
    }
    case "IConcat": {
      chunk.length = backing.left.length + backing.right.length;
      chunk.depth = 1 + Math.max(backing.left.depth, backing.right.depth);
      chunk.left = backing.left;
      chunk.right = backing.right;
      break;
    }
    case "IArray": {
      chunk.length = backing.array.length;
      chunk.depth = 0;
      chunk.left = _empty;
      chunk.right = _empty;
      break;
    }
    case "ISingleton": {
      chunk.length = 1;
      chunk.depth = 0;
      chunk.left = _empty;
      chunk.right = _empty;
      break;
    }
    case "ISlice": {
      chunk.length = backing.length;
      chunk.depth = backing.chunk.depth + 1;
      chunk.left = _empty;
      chunk.right = _empty;
      break;
    }
  }
  return chunk;
};
var isChunk = (u) => hasProperty(u, TypeId14);
var _empty = /* @__PURE__ */ makeChunk({
  _tag: "IEmpty"
});
var empty5 = () => _empty;
var of2 = (a) => makeChunk({
  _tag: "ISingleton",
  a
});
var fromIterable2 = (self) => isChunk(self) ? self : fromArrayUnsafe(fromIterable(self));
var copyToArray = (self, array2, initial) => {
  switch (self.backing._tag) {
    case "IArray": {
      copy(self.backing.array, 0, array2, initial, self.length);
      break;
    }
    case "IConcat": {
      copyToArray(self.left, array2, initial);
      copyToArray(self.right, array2, initial + self.left.length);
      break;
    }
    case "ISingleton": {
      array2[initial] = self.backing.a;
      break;
    }
    case "ISlice": {
      let i = 0;
      let j = initial;
      while (i < self.length) {
        array2[j] = getUnsafe3(self, i);
        i += 1;
        j += 1;
      }
      break;
    }
  }
};
var toReadonlyArray_ = (self) => {
  switch (self.backing._tag) {
    case "IEmpty": {
      return emptyArray;
    }
    case "IArray": {
      return self.backing.array;
    }
    default: {
      const arr = new Array(self.length);
      copyToArray(self, arr, 0);
      self.backing = {
        _tag: "IArray",
        array: arr
      };
      self.left = _empty;
      self.right = _empty;
      self.depth = 0;
      return arr;
    }
  }
};
var toReadonlyArray = toReadonlyArray_;
var fromArrayUnsafe = (self) => self.length === 0 ? empty5() : self.length === 1 ? of2(self[0]) : makeChunk({
  _tag: "IArray",
  array: self
});
var getUnsafe3 = /* @__PURE__ */ dual(2, (self, index) => {
  const i = Math.floor(index);
  switch (self.backing._tag) {
    case "IEmpty": {
      throw new Error(`Index out of bounds: ${i}`);
    }
    case "ISingleton": {
      if (index !== 0) {
        throw new Error(`Index out of bounds: ${i}`);
      }
      return self.backing.a;
    }
    case "IArray": {
      if (i >= self.length || i < 0) {
        throw new Error(`Index out of bounds: ${i}`);
      }
      return self.backing.array[i];
    }
    case "IConcat": {
      return i < self.left.length ? getUnsafe3(self.left, i) : getUnsafe3(self.right, i - self.left.length);
    }
    case "ISlice": {
      return getUnsafe3(self.backing.chunk, i + self.backing.offset);
    }
  }
});
var size = (self) => self.length;

// node_modules/effect/dist/Fiber.js
var await_ = fiberAwait;
var join2 = fiberJoin;
var joinAll = fiberJoinAll;
var interrupt4 = fiberInterrupt;
var getCurrent = getCurrentFiber;
var runIn = fiberRunIn;

// node_modules/effect/dist/Latch.js
var makeUnsafe5 = makeLatchUnsafe;
var make9 = makeLatch;

// node_modules/effect/dist/MutableRef.js
var TypeId15 = "~effect/MutableRef";
var MutableRefProto = {
  [TypeId15]: TypeId15,
  ...PipeInspectableProto,
  toJSON() {
    return {
      _id: "MutableRef",
      current: toJson(this.current)
    };
  }
};
var make10 = (value) => {
  const ref = Object.create(MutableRefProto);
  ref.current = value;
  return ref;
};
var get2 = (self) => self.current;
var set = /* @__PURE__ */ dual(2, (self, value) => {
  self.current = value;
  return self;
});

// node_modules/effect/dist/MutableList.js
var Empty = /* @__PURE__ */ Symbol.for("effect/MutableList/Empty");
var make11 = () => ({
  head: undefined,
  tail: undefined,
  length: 0
});
var emptyBucket = () => ({
  array: [],
  mutable: true,
  offset: 0,
  next: undefined
});
var append2 = (self, message) => {
  if (!self.tail) {
    self.head = self.tail = emptyBucket();
  } else if (!self.tail.mutable) {
    self.tail.next = emptyBucket();
    self.tail = self.tail.next;
  }
  self.tail.array.push(message);
  self.length++;
};
var prepend = (self, message) => {
  self.head = {
    array: [message],
    mutable: true,
    offset: 0,
    next: self.head
  };
  if (!self.tail)
    self.tail = self.head;
  self.length++;
};
var appendAll2 = (self, messages) => appendAllUnsafe(self, fromIterable(messages), !Array.isArray(messages));
var appendAllUnsafe = (self, messages, mutable = false) => {
  if (messages.length === 0) {
    return 0;
  }
  const chunk = {
    array: messages,
    mutable,
    offset: 0,
    next: undefined
  };
  if (self.head) {
    self.tail = self.tail.next = chunk;
  } else {
    self.head = self.tail = chunk;
  }
  self.length += messages.length;
  return messages.length;
};
var clear = (self) => {
  self.head = self.tail = undefined;
  self.length = 0;
};
var takeN = (self, n) => {
  if (n <= 0 || !self.head)
    return [];
  n = Math.min(n, self.length);
  if (n === self.length && self.head?.offset === 0 && !self.head.next) {
    const array3 = self.head.array;
    clear(self);
    return array3;
  }
  const array2 = new Array(n);
  let index = 0;
  let chunk = self.head;
  while (chunk) {
    while (chunk.offset < chunk.array.length) {
      array2[index++] = chunk.array[chunk.offset];
      if (chunk.mutable)
        chunk.array[chunk.offset] = undefined;
      chunk.offset++;
      if (index === n) {
        self.head = chunk;
        self.length -= n;
        if (self.length === 0)
          clear(self);
        return array2;
      }
    }
    chunk = chunk.next;
  }
  clear(self);
  return array2;
};
var takeNVoid = (self, n) => {
  if (n <= 0 || !self.head)
    return;
  n = Math.min(n, self.length);
  if (n === self.length && self.head?.offset === 0 && !self.head.next) {
    clear(self);
    return;
  }
  let count = 0;
  let chunk = self.head;
  while (chunk) {
    const size2 = chunk.array.length - chunk.offset;
    if (count + size2 > n) {
      chunk.offset += n - count;
      self.head = chunk;
      self.length -= n;
      return;
    }
    count += size2;
    chunk = chunk.next;
  }
  clear(self);
  return;
};
var takeAll = (self) => takeN(self, self.length);
var take = (self) => {
  if (!self.head)
    return Empty;
  const message = self.head.array[self.head.offset];
  if (self.head.mutable)
    self.head.array[self.head.offset] = undefined;
  self.head.offset++;
  self.length--;
  if (self.head.offset === self.head.array.length) {
    if (self.head.next) {
      self.head = self.head.next;
    } else {
      clear(self);
    }
  }
  return message;
};
var toArrayN = (self, n) => {
  if (n <= 0)
    return [];
  const length = Math.min(n, self.length);
  const out = new Array(length);
  let index = 0;
  let bucket = self.head;
  while (bucket) {
    for (let i = bucket.offset;i < bucket.array.length; i++) {
      out[index++] = bucket.array[i];
      if (index === length)
        return out;
    }
    bucket = bucket.next;
  }
  return out;
};
var filter6 = (self, f) => {
  const array2 = [];
  let chunk = self.head;
  while (chunk) {
    for (let i = chunk.offset;i < chunk.array.length; i++) {
      if (f(chunk.array[i], i)) {
        array2.push(chunk.array[i]);
      }
    }
    chunk = chunk.next;
  }
  if (array2.length === 0) {
    clear(self);
    return;
  }
  self.head = self.tail = {
    array: array2,
    mutable: true,
    offset: 0,
    next: undefined
  };
  self.length = array2.length;
};
var remove2 = (self, value) => filter6(self, (v) => v !== value);

// node_modules/effect/dist/PubSub.js
var TypeId16 = "~effect/PubSub";
var SubscriptionTypeId = "~effect/PubSub/Subscription";
var make12 = (options) => sync3(() => makePubSubUnsafe(options.atomicPubSub(), new Map, makeUnsafe3(), makeUnsafe5(false), make10(false), options.strategy()));
var bounded = (capacity) => make12({
  atomicPubSub: () => makeAtomicBounded(capacity),
  strategy: () => new BackPressureStrategy
});
var dropping = (capacity) => make12({
  atomicPubSub: () => makeAtomicBounded(capacity),
  strategy: () => new DroppingStrategy
});
var sliding = (capacity) => make12({
  atomicPubSub: () => makeAtomicBounded(capacity),
  strategy: () => new SlidingStrategy
});
var unbounded = (options) => make12({
  atomicPubSub: () => makeAtomicUnbounded(options),
  strategy: () => new DroppingStrategy
});
var makeAtomicBounded = (capacity) => {
  const options = typeof capacity === "number" ? {
    capacity
  } : capacity;
  ensureCapacity(options.capacity);
  const replayBuffer = options.replay && options.replay > 0 ? new ReplayBuffer(Math.ceil(options.replay)) : undefined;
  if (options.capacity === 1) {
    return new BoundedPubSubSingle(replayBuffer);
  } else if (nextPow2(options.capacity) === options.capacity) {
    return new BoundedPubSubPow2(options.capacity, replayBuffer);
  } else {
    return new BoundedPubSubArb(options.capacity, replayBuffer);
  }
};
var makeAtomicUnbounded = (options) => {
  const replay = options?.replay;
  return new UnboundedPubSub(replay && replay > 0 ? new ReplayBuffer(Math.ceil(replay)) : undefined);
};
var shutdown = (self) => uninterruptible2(withFiber2((fiber3) => {
  set(self.shutdownFlag, true);
  return close(self.scope, interrupt2(fiber3.id)).pipe(andThen2(self.strategy.shutdown), when2(self.shutdownHook.open), asVoid2);
}));
var publish = /* @__PURE__ */ dual(2, (self, value) => suspend3(() => {
  if (self.shutdownFlag.current) {
    return succeed6(false);
  }
  if (self.pubsub.publish(value)) {
    self.strategy.completeSubscribersUnsafe(self.pubsub, self.subscribers);
    return succeed6(true);
  }
  return self.strategy.handleSurplus(self.pubsub, self.subscribers, [value], self.shutdownFlag);
}));
var publishAll = /* @__PURE__ */ dual(2, (self, elements) => suspend3(() => {
  if (self.shutdownFlag.current) {
    return succeed6(false);
  }
  const surplus = self.pubsub.publishAll(elements);
  self.strategy.completeSubscribersUnsafe(self.pubsub, self.subscribers);
  if (surplus.length === 0) {
    return succeed6(true);
  }
  return self.strategy.handleSurplus(self.pubsub, self.subscribers, surplus, self.shutdownFlag);
}));
var subscribe = (self) => uninterruptible2(contextWith2((services) => {
  const localScope = get(services, Scope);
  const scope3 = forkUnsafe2(self.scope);
  const subscription = makeSubscriptionUnsafe(self.pubsub, self.subscribers, self.strategy);
  return addFinalizer2(scope3, unsubscribe(subscription)).pipe(andThen2(addFinalizerExit(localScope, (exit3) => close(scope3, exit3))), as2(subscription));
}));
var unsubscribe = (self) => uninterruptible2(withFiber2((state) => {
  set(self.shutdownFlag, true);
  return forEach2(takeAll(self.pollers), (d) => interruptWith(d, state.id), {
    discard: true,
    concurrency: "unbounded"
  }).pipe(tap3(() => sync3(() => {
    self.subscribers.delete(self.subscription);
    self.subscription.unsubscribe();
    self.replayWindow.close();
    self.strategy.onPubSubEmptySpaceUnsafe(self.pubsub, self.subscribers);
  })), when2(self.shutdownHook.open), asVoid2);
}));
var take2 = (self) => suspend3(() => {
  if (self.shutdownFlag.current) {
    return interrupt3;
  }
  if (self.replayWindow.remaining > 0) {
    const message2 = self.replayWindow.take();
    return succeed6(message2);
  }
  const message = self.pollers.length === 0 ? self.subscription.poll() : Empty;
  if (message === Empty) {
    return pollForItem(self);
  } else {
    self.strategy.onPubSubEmptySpaceUnsafe(self.pubsub, self.subscribers);
    return succeed6(message);
  }
});
var takeAll2 = (self) => suspend3(function loop(value) {
  if (self.shutdownFlag.current) {
    return interrupt3;
  }
  let as3 = self.pollers.length === 0 ? self.subscription.pollUpTo(Number.POSITIVE_INFINITY) : [];
  if (value) {
    as3 = value.concat(as3);
  }
  self.strategy.onPubSubEmptySpaceUnsafe(self.pubsub, self.subscribers);
  if (self.replayWindow.remaining > 0) {
    return succeed6(self.replayWindow.takeAll().concat(as3));
  } else if (!isArrayNonEmpty2(as3)) {
    return flatMap5(pollForItem(self), (item) => loop([item]));
  }
  return succeed6(as3);
});
var pollForItem = (self) => {
  const deferred = makeUnsafe2();
  let set2 = self.subscribers.get(self.subscription);
  if (!set2) {
    set2 = new Set;
    self.subscribers.set(self.subscription, set2);
  }
  set2.add(self.pollers);
  append2(self.pollers, deferred);
  self.strategy.completePollersUnsafe(self.pubsub, self.subscribers, self.subscription, self.pollers);
  return onInterrupt2(_await(deferred), () => {
    remove2(self.pollers, deferred);
    return void_3;
  });
};
var AbsentValue = /* @__PURE__ */ Symbol.for("effect/PubSub/AbsentValue");
var addSubscribers = (subscribers, subscription, pollers) => {
  if (!subscribers.has(subscription)) {
    subscribers.set(subscription, new Set);
  }
  const set2 = subscribers.get(subscription);
  set2.add(pollers);
};
var removeSubscribers = (subscribers, subscription, pollers) => {
  if (!subscribers.has(subscription)) {
    return;
  }
  const set2 = subscribers.get(subscription);
  set2.delete(pollers);
  if (set2.size === 0) {
    subscribers.delete(subscription);
  }
};
var makeSubscriptionUnsafe = (pubsub, subscribers, strategy) => new SubscriptionImpl(pubsub, subscribers, pubsub.subscribe(), make11(), makeUnsafe5(false), make10(false), strategy, pubsub.replayWindow());

class BoundedPubSubArb {
  array;
  replayIndices;
  publisherIndex = 0;
  subscribers;
  subscriberCount = 0;
  subscribersIndex = 0;
  capacity;
  replayBuffer;
  constructor(capacity, replayBuffer) {
    this.capacity = capacity;
    this.replayBuffer = replayBuffer;
    this.array = Array.from({
      length: capacity
    });
    this.replayIndices = replayBuffer ? Array.from({
      length: capacity
    }) : [];
    this.subscribers = Array.from({
      length: capacity
    });
  }
  replayWindow() {
    return this.replayBuffer ? new ReplayWindowImpl(this.replayBuffer) : emptyReplayWindow;
  }
  isEmpty() {
    return this.publisherIndex === this.subscribersIndex;
  }
  isFull() {
    return this.publisherIndex === this.subscribersIndex + this.capacity;
  }
  size() {
    return this.publisherIndex - this.subscribersIndex;
  }
  publish(value) {
    if (this.isFull()) {
      return false;
    }
    const replayIndex = this.replayBuffer?.offer(value);
    if (this.subscriberCount !== 0) {
      const index = this.publisherIndex % this.capacity;
      this.array[index] = value;
      if (replayIndex !== undefined) {
        this.replayIndices[index] = replayIndex;
      }
      this.subscribers[index] = this.subscriberCount;
      this.publisherIndex += 1;
    }
    return true;
  }
  publishAll(elements) {
    if (this.subscriberCount === 0) {
      if (this.replayBuffer) {
        this.replayBuffer.offerAll(elements);
      }
      return [];
    }
    const chunk = fromIterable(elements);
    const n = chunk.length;
    const size2 = this.publisherIndex - this.subscribersIndex;
    const available = this.capacity - size2;
    const forPubSub = Math.min(n, available);
    if (forPubSub === 0) {
      return chunk;
    }
    let iteratorIndex = 0;
    const publishAllIndex = this.publisherIndex + forPubSub;
    while (this.publisherIndex !== publishAllIndex) {
      const a = chunk[iteratorIndex++];
      const index = this.publisherIndex % this.capacity;
      this.array[index] = a;
      const replayIndex = this.replayBuffer?.offer(a);
      if (replayIndex !== undefined) {
        this.replayIndices[index] = replayIndex;
      }
      this.subscribers[index] = this.subscriberCount;
      this.publisherIndex += 1;
    }
    return chunk.slice(iteratorIndex);
  }
  slide() {
    if (this.subscribersIndex !== this.publisherIndex) {
      const index = this.subscribersIndex % this.capacity;
      const value = this.array[index];
      this.array[index] = AbsentValue;
      this.subscribers[index] = 0;
      this.subscribersIndex += 1;
      this.replayBuffer?.slide(value, this.replayIndices[index]);
    }
  }
  subscribe() {
    this.subscriberCount += 1;
    return new BoundedPubSubArbSubscription(this, this.publisherIndex, false);
  }
}

class BoundedPubSubArbSubscription {
  self;
  subscriberIndex;
  unsubscribed;
  constructor(self, subscriberIndex, unsubscribed) {
    this.self = self;
    this.subscriberIndex = subscriberIndex;
    this.unsubscribed = unsubscribed;
  }
  isEmpty() {
    return this.unsubscribed || this.self.publisherIndex === this.subscriberIndex || this.self.publisherIndex === this.self.subscribersIndex;
  }
  size() {
    if (this.unsubscribed) {
      return 0;
    }
    return this.self.publisherIndex - Math.max(this.subscriberIndex, this.self.subscribersIndex);
  }
  poll() {
    if (this.unsubscribed) {
      return Empty;
    }
    this.subscriberIndex = Math.max(this.subscriberIndex, this.self.subscribersIndex);
    if (this.subscriberIndex !== this.self.publisherIndex) {
      const index = this.subscriberIndex % this.self.capacity;
      const elem = this.self.array[index];
      this.self.subscribers[index] -= 1;
      if (this.self.subscribers[index] === 0) {
        this.self.array[index] = AbsentValue;
        this.self.subscribersIndex += 1;
      }
      this.subscriberIndex += 1;
      return elem;
    }
    return Empty;
  }
  pollUpTo(n) {
    if (this.unsubscribed) {
      return [];
    }
    this.subscriberIndex = Math.max(this.subscriberIndex, this.self.subscribersIndex);
    const size2 = this.self.publisherIndex - this.subscriberIndex;
    const toPoll = Math.min(n, size2);
    if (toPoll <= 0) {
      return [];
    }
    const builder = [];
    const pollUpToIndex = this.subscriberIndex + toPoll;
    while (this.subscriberIndex !== pollUpToIndex) {
      const index = this.subscriberIndex % this.self.capacity;
      const a = this.self.array[index];
      this.self.subscribers[index] -= 1;
      if (this.self.subscribers[index] === 0) {
        this.self.array[index] = AbsentValue;
        this.self.subscribersIndex += 1;
      }
      builder.push(a);
      this.subscriberIndex += 1;
    }
    return builder;
  }
  unsubscribe() {
    if (!this.unsubscribed) {
      this.unsubscribed = true;
      this.self.subscriberCount -= 1;
      this.subscriberIndex = Math.max(this.subscriberIndex, this.self.subscribersIndex);
      while (this.subscriberIndex !== this.self.publisherIndex) {
        const index = this.subscriberIndex % this.self.capacity;
        this.self.subscribers[index] -= 1;
        if (this.self.subscribers[index] === 0) {
          this.self.array[index] = AbsentValue;
          this.self.subscribersIndex += 1;
        }
        this.subscriberIndex += 1;
      }
    }
  }
}

class BoundedPubSubPow2 {
  array;
  replayIndices;
  mask;
  publisherIndex = 0;
  subscribers;
  subscriberCount = 0;
  subscribersIndex = 0;
  capacity;
  replayBuffer;
  constructor(capacity, replayBuffer) {
    this.capacity = capacity;
    this.replayBuffer = replayBuffer;
    this.array = Array.from({
      length: capacity
    });
    this.replayIndices = replayBuffer ? Array.from({
      length: capacity
    }) : [];
    this.mask = capacity - 1;
    this.subscribers = Array.from({
      length: capacity
    });
  }
  replayWindow() {
    return this.replayBuffer ? new ReplayWindowImpl(this.replayBuffer) : emptyReplayWindow;
  }
  isEmpty() {
    return this.publisherIndex === this.subscribersIndex;
  }
  isFull() {
    return this.publisherIndex === this.subscribersIndex + this.capacity;
  }
  size() {
    return this.publisherIndex - this.subscribersIndex;
  }
  publish(value) {
    if (this.isFull()) {
      return false;
    }
    const replayIndex = this.replayBuffer?.offer(value);
    if (this.subscriberCount !== 0) {
      const index = this.publisherIndex & this.mask;
      this.array[index] = value;
      if (replayIndex !== undefined) {
        this.replayIndices[index] = replayIndex;
      }
      this.subscribers[index] = this.subscriberCount;
      this.publisherIndex += 1;
    }
    return true;
  }
  publishAll(elements) {
    if (this.subscriberCount === 0) {
      if (this.replayBuffer) {
        this.replayBuffer.offerAll(elements);
      }
      return [];
    }
    const chunk = fromIterable(elements);
    const n = chunk.length;
    const size2 = this.publisherIndex - this.subscribersIndex;
    const available = this.capacity - size2;
    const forPubSub = Math.min(n, available);
    if (forPubSub === 0) {
      return chunk;
    }
    let iteratorIndex = 0;
    const publishAllIndex = this.publisherIndex + forPubSub;
    while (this.publisherIndex !== publishAllIndex) {
      const elem = chunk[iteratorIndex++];
      const index = this.publisherIndex & this.mask;
      this.array[index] = elem;
      const replayIndex = this.replayBuffer?.offer(elem);
      if (replayIndex !== undefined) {
        this.replayIndices[index] = replayIndex;
      }
      this.subscribers[index] = this.subscriberCount;
      this.publisherIndex += 1;
    }
    return chunk.slice(iteratorIndex);
  }
  slide() {
    if (this.subscribersIndex !== this.publisherIndex) {
      const index = this.subscribersIndex & this.mask;
      const value = this.array[index];
      this.array[index] = AbsentValue;
      this.subscribers[index] = 0;
      this.subscribersIndex += 1;
      this.replayBuffer?.slide(value, this.replayIndices[index]);
    }
  }
  subscribe() {
    this.subscriberCount += 1;
    return new BoundedPubSubPow2Subscription(this, this.publisherIndex, false);
  }
}

class BoundedPubSubPow2Subscription {
  self;
  subscriberIndex;
  unsubscribed;
  constructor(self, subscriberIndex, unsubscribed) {
    this.self = self;
    this.subscriberIndex = subscriberIndex;
    this.unsubscribed = unsubscribed;
  }
  isEmpty() {
    return this.unsubscribed || this.self.publisherIndex === this.subscriberIndex || this.self.publisherIndex === this.self.subscribersIndex;
  }
  size() {
    if (this.unsubscribed) {
      return 0;
    }
    return this.self.publisherIndex - Math.max(this.subscriberIndex, this.self.subscribersIndex);
  }
  poll() {
    if (this.unsubscribed) {
      return Empty;
    }
    this.subscriberIndex = Math.max(this.subscriberIndex, this.self.subscribersIndex);
    if (this.subscriberIndex !== this.self.publisherIndex) {
      const index = this.subscriberIndex & this.self.mask;
      const elem = this.self.array[index];
      this.self.subscribers[index] -= 1;
      if (this.self.subscribers[index] === 0) {
        this.self.array[index] = AbsentValue;
        this.self.subscribersIndex += 1;
      }
      this.subscriberIndex += 1;
      return elem;
    }
    return Empty;
  }
  pollUpTo(n) {
    if (this.unsubscribed) {
      return [];
    }
    this.subscriberIndex = Math.max(this.subscriberIndex, this.self.subscribersIndex);
    const size2 = this.self.publisherIndex - this.subscriberIndex;
    const toPoll = Math.min(n, size2);
    if (toPoll <= 0) {
      return [];
    }
    const builder = [];
    const pollUpToIndex = this.subscriberIndex + toPoll;
    while (this.subscriberIndex !== pollUpToIndex) {
      const index = this.subscriberIndex & this.self.mask;
      const elem = this.self.array[index];
      this.self.subscribers[index] -= 1;
      if (this.self.subscribers[index] === 0) {
        this.self.array[index] = AbsentValue;
        this.self.subscribersIndex += 1;
      }
      builder.push(elem);
      this.subscriberIndex += 1;
    }
    return builder;
  }
  unsubscribe() {
    if (!this.unsubscribed) {
      this.unsubscribed = true;
      this.self.subscriberCount -= 1;
      this.subscriberIndex = Math.max(this.subscriberIndex, this.self.subscribersIndex);
      while (this.subscriberIndex !== this.self.publisherIndex) {
        const index = this.subscriberIndex & this.self.mask;
        this.self.subscribers[index] -= 1;
        if (this.self.subscribers[index] === 0) {
          this.self.array[index] = AbsentValue;
          this.self.subscribersIndex += 1;
        }
        this.subscriberIndex += 1;
      }
    }
  }
}

class BoundedPubSubSingle {
  publisherIndex = 0;
  subscriberCount = 0;
  subscribers = 0;
  value = AbsentValue;
  replayIndex = 0;
  capacity = 1;
  replayBuffer;
  constructor(replayBuffer) {
    this.replayBuffer = replayBuffer;
  }
  replayWindow() {
    return this.replayBuffer ? new ReplayWindowImpl(this.replayBuffer) : emptyReplayWindow;
  }
  pipe() {
    return pipeArguments(this, arguments);
  }
  isEmpty() {
    return this.subscribers === 0;
  }
  isFull() {
    return !this.isEmpty();
  }
  size() {
    return this.isEmpty() ? 0 : 1;
  }
  publish(value) {
    if (this.isFull()) {
      return false;
    }
    const replayIndex = this.replayBuffer?.offer(value);
    if (this.subscriberCount !== 0) {
      this.value = value;
      if (replayIndex !== undefined) {
        this.replayIndex = replayIndex;
      }
      this.subscribers = this.subscriberCount;
      this.publisherIndex += 1;
    }
    return true;
  }
  publishAll(elements) {
    if (this.subscriberCount === 0) {
      if (this.replayBuffer) {
        this.replayBuffer.offerAll(elements);
      }
      return [];
    }
    const chunk = fromIterable(elements);
    if (chunk.length === 0) {
      return chunk;
    }
    if (this.publish(chunk[0])) {
      return chunk.slice(1);
    } else {
      return chunk;
    }
  }
  slide() {
    if (this.isFull()) {
      const value = this.value;
      this.subscribers = 0;
      this.value = AbsentValue;
      this.replayBuffer?.slide(value, this.replayIndex);
    }
  }
  subscribe() {
    this.subscriberCount += 1;
    return new BoundedPubSubSingleSubscription(this, this.publisherIndex, false);
  }
}

class BoundedPubSubSingleSubscription {
  self;
  subscriberIndex;
  unsubscribed;
  constructor(self, subscriberIndex, unsubscribed) {
    this.self = self;
    this.subscriberIndex = subscriberIndex;
    this.unsubscribed = unsubscribed;
  }
  isEmpty() {
    return this.unsubscribed || this.self.subscribers === 0 || this.subscriberIndex === this.self.publisherIndex;
  }
  size() {
    return this.isEmpty() ? 0 : 1;
  }
  poll() {
    if (this.isEmpty()) {
      return Empty;
    }
    const elem = this.self.value;
    this.self.subscribers -= 1;
    if (this.self.subscribers === 0) {
      this.self.value = AbsentValue;
    }
    this.subscriberIndex += 1;
    return elem;
  }
  pollUpTo(n) {
    if (this.isEmpty() || n < 1) {
      return [];
    }
    const a = this.self.value;
    this.self.subscribers -= 1;
    if (this.self.subscribers === 0) {
      this.self.value = AbsentValue;
    }
    this.subscriberIndex += 1;
    return [a];
  }
  unsubscribe() {
    if (!this.unsubscribed) {
      this.unsubscribed = true;
      this.self.subscriberCount -= 1;
      if (this.subscriberIndex !== this.self.publisherIndex) {
        this.self.subscribers -= 1;
        if (this.self.subscribers === 0) {
          this.self.value = AbsentValue;
        }
      }
    }
  }
}

class UnboundedPubSub {
  publisherHead = {
    value: AbsentValue,
    replayIndex: undefined,
    subscribers: 0,
    next: null
  };
  publisherTail = this.publisherHead;
  publisherIndex = 0;
  subscribersIndex = 0;
  capacity = Number.MAX_SAFE_INTEGER;
  replayBuffer;
  constructor(replayBuffer) {
    this.replayBuffer = replayBuffer;
  }
  replayWindow() {
    return this.replayBuffer ? new ReplayWindowImpl(this.replayBuffer) : emptyReplayWindow;
  }
  isEmpty() {
    return this.publisherHead === this.publisherTail;
  }
  isFull() {
    return false;
  }
  size() {
    return this.publisherIndex - this.subscribersIndex;
  }
  publish(value) {
    const replayIndex = this.replayBuffer?.offer(value);
    const subscribers = this.publisherTail.subscribers;
    if (subscribers !== 0) {
      const node = {
        value,
        replayIndex,
        subscribers,
        next: null
      };
      this.publisherTail.next = node;
      this.publisherTail = this.publisherTail.next;
      this.publisherIndex += 1;
    }
    return true;
  }
  publishAll(elements) {
    if (this.publisherTail.subscribers !== 0) {
      for (const a of elements) {
        this.publish(a);
      }
    } else if (this.replayBuffer) {
      this.replayBuffer.offerAll(elements);
    }
    return [];
  }
  slide() {
    if (this.publisherHead !== this.publisherTail) {
      const node = this.publisherHead.next;
      const value = node.value;
      this.publisherHead = this.publisherHead.next;
      this.publisherHead.value = AbsentValue;
      this.subscribersIndex += 1;
      this.replayBuffer?.slide(value, node.replayIndex);
    }
  }
  subscribe() {
    this.publisherTail.subscribers += 1;
    return new UnboundedPubSubSubscription(this, this.publisherTail, this.publisherIndex, false);
  }
}

class UnboundedPubSubSubscription {
  self;
  subscriberHead;
  subscriberIndex;
  unsubscribed;
  constructor(self, subscriberHead, subscriberIndex, unsubscribed) {
    this.self = self;
    this.subscriberHead = subscriberHead;
    this.subscriberIndex = subscriberIndex;
    this.unsubscribed = unsubscribed;
  }
  isEmpty() {
    if (this.unsubscribed) {
      return true;
    }
    let empty6 = true;
    let loop = true;
    while (loop) {
      if (this.subscriberHead === this.self.publisherTail) {
        loop = false;
      } else {
        if (this.subscriberHead.next.value !== AbsentValue) {
          empty6 = false;
          loop = false;
        } else {
          this.subscriberHead = this.subscriberHead.next;
          this.subscriberIndex += 1;
        }
      }
    }
    return empty6;
  }
  size() {
    if (this.unsubscribed) {
      return 0;
    }
    return this.self.publisherIndex - Math.max(this.subscriberIndex, this.self.subscribersIndex);
  }
  poll() {
    if (this.unsubscribed) {
      return Empty;
    }
    let loop = true;
    let polled = Empty;
    while (loop) {
      if (this.subscriberHead === this.self.publisherTail) {
        loop = false;
      } else {
        const elem = this.subscriberHead.next.value;
        if (elem !== AbsentValue) {
          polled = elem;
          this.subscriberHead.subscribers -= 1;
          if (this.subscriberHead.subscribers === 0) {
            this.self.publisherHead = this.self.publisherHead.next;
            this.self.publisherHead.value = AbsentValue;
            this.self.subscribersIndex += 1;
          }
          loop = false;
        }
        this.subscriberHead = this.subscriberHead.next;
        this.subscriberIndex += 1;
      }
    }
    return polled;
  }
  pollUpTo(n) {
    const builder = [];
    let i = 0;
    while (i !== n) {
      const a = this.poll();
      if (a === Empty) {
        i = n;
      } else {
        builder.push(a);
        i += 1;
      }
    }
    return builder;
  }
  unsubscribe() {
    if (!this.unsubscribed) {
      this.unsubscribed = true;
      this.self.publisherTail.subscribers -= 1;
      while (this.subscriberHead !== this.self.publisherTail) {
        if (this.subscriberHead.next.value !== AbsentValue) {
          this.subscriberHead.subscribers -= 1;
          if (this.subscriberHead.subscribers === 0) {
            this.self.publisherHead = this.self.publisherHead.next;
            this.self.publisherHead.value = AbsentValue;
            this.self.subscribersIndex += 1;
          }
        }
        this.subscriberHead = this.subscriberHead.next;
      }
    }
  }
}

class SubscriptionImpl {
  [SubscriptionTypeId] = {
    _A: identity
  };
  pubsub;
  subscribers;
  subscription;
  pollers;
  shutdownHook;
  shutdownFlag;
  strategy;
  replayWindow;
  constructor(pubsub, subscribers, subscription, pollers, shutdownHook, shutdownFlag, strategy, replayWindow) {
    this.pubsub = pubsub;
    this.subscribers = subscribers;
    this.subscription = subscription;
    this.pollers = pollers;
    this.shutdownHook = shutdownHook;
    this.shutdownFlag = shutdownFlag;
    this.strategy = strategy;
    this.replayWindow = replayWindow;
  }
  pipe() {
    return pipeArguments(this, arguments);
  }
}

class PubSubImpl {
  [TypeId16] = {
    _A: identity
  };
  pubsub;
  subscribers;
  scope;
  shutdownHook;
  shutdownFlag;
  strategy;
  constructor(pubsub, subscribers, scope3, shutdownHook, shutdownFlag, strategy) {
    this.pubsub = pubsub;
    this.subscribers = subscribers;
    this.scope = scope3;
    this.shutdownHook = shutdownHook;
    this.shutdownFlag = shutdownFlag;
    this.strategy = strategy;
  }
  pipe() {
    return pipeArguments(this, arguments);
  }
}
var makePubSubUnsafe = (pubsub, subscribers, scope3, shutdownHook, shutdownFlag, strategy) => new PubSubImpl(pubsub, subscribers, scope3, shutdownHook, shutdownFlag, strategy);
var ensureCapacity = (capacity) => {
  if (capacity <= 0) {
    throw new Error(`Cannot construct PubSub with capacity of ${capacity}`);
  }
};

class BackPressureStrategy {
  publishers = /* @__PURE__ */ make11();
  get shutdown() {
    return withFiber2((fiber3) => forEach2(takeAll(this.publishers), ([_, deferred, last]) => last ? interruptWith(deferred, fiber3.id) : void_3, {
      concurrency: "unbounded",
      discard: true
    }));
  }
  handleSurplus(pubsub, subscribers, elements, isShutdown) {
    return suspend3(() => {
      const deferred = makeUnsafe2();
      this.offerUnsafe(elements, deferred);
      this.onPubSubEmptySpaceUnsafe(pubsub, subscribers);
      this.completeSubscribersUnsafe(pubsub, subscribers);
      return (get2(isShutdown) ? interrupt3 : _await(deferred)).pipe(onInterrupt2(() => {
        this.removeUnsafe(deferred);
        return void_3;
      }));
    });
  }
  onPubSubEmptySpaceUnsafe(pubsub, subscribers) {
    let keepPolling = true;
    while (keepPolling && !pubsub.isFull()) {
      const publisher = take(this.publishers);
      if (publisher === Empty) {
        keepPolling = false;
      } else {
        const [value, deferred] = publisher;
        const published = pubsub.publish(value);
        if (published && publisher[2]) {
          doneUnsafe(deferred, succeed4(true));
        } else if (!published) {
          prepend(this.publishers, publisher);
        }
        this.completeSubscribersUnsafe(pubsub, subscribers);
      }
    }
  }
  completePollersUnsafe(pubsub, subscribers, subscription, pollers) {
    return strategyCompletePollersUnsafe(this, pubsub, subscribers, subscription, pollers);
  }
  completeSubscribersUnsafe(pubsub, subscribers) {
    return strategyCompleteSubscribersUnsafe(this, pubsub, subscribers);
  }
  offerUnsafe(elements, deferred) {
    const iterator = elements[Symbol.iterator]();
    let next = iterator.next();
    if (!next.done) {
      while (true) {
        const value = next.value;
        next = iterator.next();
        if (next.done) {
          append2(this.publishers, [value, deferred, true]);
          break;
        }
        append2(this.publishers, [value, deferred, false]);
      }
    }
  }
  removeUnsafe(deferred) {
    filter6(this.publishers, ([_, d]) => d !== deferred);
  }
}

class DroppingStrategy {
  get shutdown() {
    return void_3;
  }
  handleSurplus(_pubsub, _subscribers, _elements, _isShutdown) {
    return succeed6(false);
  }
  onPubSubEmptySpaceUnsafe(_pubsub, _subscribers) {}
  completePollersUnsafe(pubsub, subscribers, subscription, pollers) {
    return strategyCompletePollersUnsafe(this, pubsub, subscribers, subscription, pollers);
  }
  completeSubscribersUnsafe(pubsub, subscribers) {
    return strategyCompleteSubscribersUnsafe(this, pubsub, subscribers);
  }
}

class SlidingStrategy {
  get shutdown() {
    return void_3;
  }
  handleSurplus(pubsub, subscribers, elements, _isShutdown) {
    return sync3(() => {
      this.slidingPublishUnsafe(pubsub, elements);
      this.completeSubscribersUnsafe(pubsub, subscribers);
      return true;
    });
  }
  onPubSubEmptySpaceUnsafe(_pubsub, _subscribers) {}
  completePollersUnsafe(pubsub, subscribers, subscription, pollers) {
    return strategyCompletePollersUnsafe(this, pubsub, subscribers, subscription, pollers);
  }
  completeSubscribersUnsafe(pubsub, subscribers) {
    return strategyCompleteSubscribersUnsafe(this, pubsub, subscribers);
  }
  slidingPublishUnsafe(pubsub, elements) {
    const it = elements[Symbol.iterator]();
    let next = it.next();
    if (!next.done && pubsub.capacity > 0) {
      let a = next.value;
      let loop = true;
      while (loop) {
        pubsub.slide();
        const pub = pubsub.publish(a);
        if (pub && (next = it.next()) && !next.done) {
          a = next.value;
        } else if (pub) {
          loop = false;
        }
      }
    }
  }
}
var strategyCompletePollersUnsafe = (strategy, pubsub, subscribers, subscription, pollers) => {
  let keepPolling = true;
  while (keepPolling && !subscription.isEmpty()) {
    const poller = take(pollers);
    if (poller === Empty) {
      removeSubscribers(subscribers, subscription, pollers);
      if (pollers.length === 0) {
        keepPolling = false;
      } else {
        addSubscribers(subscribers, subscription, pollers);
      }
    } else {
      const pollResult = subscription.poll();
      if (pollResult === Empty) {
        prepend(pollers, poller);
      } else {
        doneUnsafe(poller, succeed4(pollResult));
        strategy.onPubSubEmptySpaceUnsafe(pubsub, subscribers);
      }
    }
  }
};
var strategyCompleteSubscribersUnsafe = (strategy, pubsub, subscribers) => {
  for (const [subscription, pollersSet] of subscribers) {
    for (const pollers of pollersSet) {
      strategy.completePollersUnsafe(pubsub, subscribers, subscription, pollers);
    }
  }
};

class ReplayBuffer {
  capacity;
  head = {
    value: AbsentValue,
    index: 0,
    next: null
  };
  tail = this.head;
  slideValues = [];
  size = 0;
  index = 0;
  publisherIndex = 0;
  constructor(capacity) {
    this.capacity = capacity;
  }
  slide(value, publisherIndex) {
    this.slideValues[this.index % this.capacity] = {
      value,
      index: publisherIndex
    };
    this.index++;
  }
  offer(a) {
    const index = this.publisherIndex++;
    this.tail.value = a;
    this.tail.index = index;
    this.tail.next = {
      value: AbsentValue,
      index: 0,
      next: null
    };
    this.tail = this.tail.next;
    if (this.size === this.capacity) {
      this.head = this.head.next;
    } else {
      this.size += 1;
    }
    return index;
  }
  offerAll(as3) {
    for (const a of as3) {
      this.offer(a);
    }
  }
}

class ReplayWindowImpl {
  buffer;
  values;
  index = 0;
  remaining;
  slideIndex;
  newestIndex = -1;
  constructor(buffer) {
    this.buffer = buffer;
    this.remaining = buffer.size;
    this.slideIndex = buffer.index;
    this.values = new Array(this.remaining);
    let node = buffer.head;
    for (let i = 0;i < this.remaining; i++) {
      this.values[i] = node.value;
      this.newestIndex = node.index;
      node = node.next;
    }
  }
  close() {
    this.values.length = 0;
    this.remaining = 0;
  }
  sync() {
    const slides = this.buffer.index - this.slideIndex;
    if (slides === 0 || this.remaining === 0) {
      return;
    }
    const count = Math.min(slides, this.buffer.capacity);
    const start = this.buffer.index - count;
    for (let i = 0;i < count; i++) {
      const entry = this.buffer.slideValues[(start + i) % this.buffer.capacity];
      if (entry.index > this.newestIndex) {
        this.index = (this.index + 1) % this.values.length;
        this.values[(this.index + this.remaining - 1) % this.values.length] = entry.value;
        this.newestIndex = entry.index;
      }
    }
    this.slideIndex = this.buffer.index;
  }
  take() {
    if (this.remaining === 0) {
      return;
    }
    this.sync();
    const value = this.values[this.index];
    this.values[this.index] = AbsentValue;
    this.index = (this.index + 1) % this.values.length;
    this.remaining--;
    if (this.remaining === 0) {
      this.close();
    }
    return value;
  }
  takeN(n) {
    const len = Math.min(n, this.remaining);
    const items = new Array(len);
    for (let i = 0;i < len; i++) {
      items[i] = this.take();
    }
    return items;
  }
  takeAll() {
    return this.takeN(this.remaining);
  }
}
var emptyReplayWindow = {
  remaining: 0,
  take: () => {
    return;
  },
  takeN: () => [],
  takeAll: () => [],
  close: () => {
    return;
  }
};

// node_modules/effect/dist/Queue.js
var TypeId17 = "~effect/Queue";
var EnqueueTypeId = "~effect/Queue/Enqueue";
var DequeueTypeId = "~effect/Queue/Dequeue";
var variance = {
  _A: identity,
  _E: identity
};
var QueueProto = {
  [TypeId17]: variance,
  [EnqueueTypeId]: variance,
  [DequeueTypeId]: variance,
  ...PipeInspectableProto,
  toJSON() {
    return {
      _id: "effect/Queue",
      state: this.state._tag,
      size: sizeUnsafe(this)
    };
  }
};
var make13 = (options) => withFiber((fiber3) => {
  const self = Object.create(QueueProto);
  self.dispatcher = fiber3.currentDispatcher;
  self.capacity = options?.capacity ?? Number.POSITIVE_INFINITY;
  self.strategy = options?.strategy ?? "suspend";
  self.messages = make11();
  self.scheduleRunning = false;
  self.state = {
    _tag: "Open",
    takers: new Set,
    offers: new Set,
    awaiters: new Set
  };
  return succeed3(self);
});
var bounded2 = (capacity) => make13({
  capacity
});
var unbounded2 = () => make13();
var offer = (self, message) => suspend(() => {
  if (self.state._tag !== "Open") {
    return exitFalse;
  } else if (self.messages.length >= self.capacity) {
    switch (self.strategy) {
      case "dropping":
        return exitFalse;
      case "suspend":
        if (self.capacity <= 0 && self.state.takers.size > 0) {
          append2(self.messages, message);
          releaseTakers(self);
          return exitTrue;
        }
        return offerRemainingSingle(self, message);
      case "sliding":
        take(self.messages);
        append2(self.messages, message);
        return exitTrue;
    }
  }
  append2(self.messages, message);
  scheduleReleaseTaker(self);
  return exitTrue;
});
var offerUnsafe = (self, message) => {
  if (self.state._tag !== "Open") {
    return false;
  } else if (self.messages.length >= self.capacity) {
    if (self.strategy === "sliding") {
      take(self.messages);
      append2(self.messages, message);
      return true;
    } else if (self.capacity <= 0 && self.state.takers.size > 0) {
      append2(self.messages, message);
      releaseTakers(self);
      return true;
    }
    return false;
  }
  append2(self.messages, message);
  scheduleReleaseTaker(self);
  return true;
};
var offerAll = (self, messages) => suspend(() => {
  if (self.state._tag !== "Open") {
    return succeed3(fromIterable(messages));
  }
  const remaining = offerAllUnsafe(self, messages);
  if (remaining.length === 0) {
    return exitSucceed([]);
  } else if (self.strategy === "dropping") {
    return succeed3(remaining);
  }
  return offerRemainingArray(self, remaining);
});
var offerAllUnsafe = (self, messages) => {
  if (self.state._tag !== "Open") {
    return fromIterable(messages);
  } else if (self.capacity === Number.POSITIVE_INFINITY || self.strategy === "sliding") {
    appendAll2(self.messages, messages);
    if (self.strategy === "sliding") {
      takeN(self.messages, self.messages.length - self.capacity);
    }
    scheduleReleaseTaker(self);
    return [];
  }
  const free = self.capacity <= 0 ? self.state.takers.size : self.capacity - self.messages.length;
  if (free === 0) {
    return fromIterable(messages);
  }
  const remaining = [];
  let i = 0;
  for (const message of messages) {
    if (i < free) {
      append2(self.messages, message);
    } else {
      remaining.push(message);
    }
    i++;
  }
  scheduleReleaseTaker(self);
  return remaining;
};
var failCause5 = /* @__PURE__ */ dual(2, (self, cause) => sync(() => failCauseUnsafe(self, cause)));
var failCauseUnsafe = (self, cause) => {
  if (self.state._tag !== "Open") {
    return false;
  }
  const exit3 = exitFailCause(cause);
  const fail7 = exitZipRight(exit3, exitFailDone);
  if (self.state.offers.size === 0 && self.messages.length === 0) {
    finalize(self, fail7);
    return true;
  }
  self.state = {
    ...self.state,
    _tag: "Closing",
    exit: fail7
  };
  return true;
};
var end = (self) => failCause5(self, causeFail(Done()));
var endUnsafe = (self) => failCauseUnsafe(self, causeFail(Done()));
var shutdown2 = (self) => sync(() => {
  if (self.state._tag === "Done") {
    return true;
  }
  clear(self.messages);
  const offers = self.state.offers;
  finalize(self, self.state._tag === "Open" ? exitInterrupt2 : self.state.exit);
  if (offers.size > 0) {
    for (const entry of offers) {
      if (entry._tag === "Single") {
        entry.resume(exitFalse);
      } else {
        entry.resume(exitSucceed(entry.remaining.slice(entry.offset)));
      }
    }
    offers.clear();
  }
  return true;
});
var takeAll3 = (self) => takeBetween(self, 1, Number.POSITIVE_INFINITY);
var takeBetween = (self, min3, max3) => suspend(() => takeBetweenUnsafe(self, min3, max3) ?? andThen(awaitTake(self), takeBetween(self, 1, max3)));
var take3 = (self) => suspend(() => takeUnsafe(self) ?? andThen(awaitTake(self), take3(self)));
var poll = (self) => suspend(() => {
  const result3 = takeUnsafe(self);
  if (result3 === undefined) {
    return succeed3(none2());
  }
  if (result3._tag === "Success") {
    return succeed3(some2(result3.value));
  }
  return succeed3(none2());
});
var takeUnsafe = (self) => {
  if (self.state._tag === "Done") {
    return self.state.exit;
  }
  if (self.messages.length > 0) {
    const message = take(self.messages);
    releaseCapacity(self);
    return exitSucceed(message);
  } else if (self.capacity <= 0 && self.state.offers.size > 0) {
    self.capacity = 1;
    releaseCapacity(self);
    self.capacity = 0;
    const message = take(self.messages);
    releaseCapacity(self);
    return exitSucceed(message);
  }
  return;
};
var sizeUnsafe = (self) => self.state._tag === "Done" ? 0 : self.messages.length;
var exitFalse = /* @__PURE__ */ exitSucceed(false);
var exitTrue = /* @__PURE__ */ exitSucceed(true);
var exitFailDone = /* @__PURE__ */ exitFail(/* @__PURE__ */ Done());
var exitInterrupt2 = /* @__PURE__ */ exitInterrupt();
var releaseTakers = (self) => {
  self.scheduleRunning = false;
  if (self.state._tag === "Done" || self.state.takers.size === 0) {
    return;
  }
  for (const taker of self.state.takers) {
    self.state.takers.delete(taker);
    taker(exitVoid);
    if (self.messages.length === 0) {
      break;
    }
  }
};
var scheduleReleaseTaker = (self) => {
  if (self.scheduleRunning || self.state._tag === "Done" || self.state.takers.size === 0) {
    return;
  }
  self.scheduleRunning = true;
  self.dispatcher.scheduleTask(() => releaseTakers(self), 0);
};
var takeBetweenUnsafe = (self, min3, max3) => {
  if (self.state._tag === "Done") {
    return self.state.exit;
  } else if (max3 <= 0 || min3 <= 0) {
    return exitSucceed([]);
  } else if (self.capacity <= 0 && self.state.offers.size > 0) {
    self.capacity = 1;
    releaseCapacity(self);
    self.capacity = 0;
    const messages = [take(self.messages)];
    releaseCapacity(self);
    return exitSucceed(messages);
  }
  min3 = Math.min(min3, self.capacity || 1);
  if (min3 <= self.messages.length) {
    const messages = takeN(self.messages, max3);
    releaseCapacity(self);
    return exitSucceed(messages);
  }
};
var offerRemainingSingle = (self, message) => {
  return callback((resume) => {
    if (self.state._tag !== "Open") {
      return resume(exitFalse);
    }
    const entry = {
      _tag: "Single",
      message,
      resume
    };
    self.state.offers.add(entry);
    return sync(() => {
      if (self.state._tag === "Open") {
        self.state.offers.delete(entry);
      }
    });
  });
};
var offerRemainingArray = (self, remaining) => {
  return callback((resume) => {
    if (self.state._tag !== "Open") {
      return resume(exitSucceed(remaining));
    }
    const entry = {
      _tag: "Array",
      remaining,
      offset: 0,
      resume
    };
    self.state.offers.add(entry);
    return sync(() => {
      if (self.state._tag === "Open") {
        self.state.offers.delete(entry);
      }
    });
  });
};
var releaseCapacity = (self) => {
  if (self.state._tag === "Done") {
    return isDoneCause(self.state.exit.cause);
  } else if (self.state.offers.size === 0) {
    if (self.state._tag === "Closing" && self.messages.length === 0) {
      finalize(self, self.state.exit);
      return isDoneCause(self.state.exit.cause);
    }
    return false;
  }
  let n = self.capacity - self.messages.length;
  for (const entry of self.state.offers) {
    if (n === 0)
      break;
    else if (entry._tag === "Single") {
      append2(self.messages, entry.message);
      n--;
      entry.resume(exitTrue);
      self.state.offers.delete(entry);
    } else {
      for (;entry.offset < entry.remaining.length; entry.offset++) {
        if (n === 0)
          return false;
        append2(self.messages, entry.remaining[entry.offset]);
        n--;
      }
      entry.resume(exitSucceed([]));
      self.state.offers.delete(entry);
    }
  }
  return false;
};
var awaitTake = (self) => callback((resume) => {
  if (self.state._tag === "Done") {
    return resume(self.state.exit);
  }
  self.state.takers.add(resume);
  return sync(() => {
    if (self.state._tag !== "Done") {
      self.state.takers.delete(resume);
    }
  });
});
var finalize = (self, exit3) => {
  if (self.state._tag === "Done") {
    return;
  }
  const openState = self.state;
  self.state = {
    _tag: "Done",
    exit: exit3
  };
  for (const taker of openState.takers) {
    taker(exit3);
  }
  openState.takers.clear();
  for (const awaiter of openState.awaiters) {
    awaiter(exit3);
  }
  openState.awaiters.clear();
};

// node_modules/effect/dist/Semaphore.js
var makeUnsafe6 = (permits) => new SemaphoreImpl(permits);
var waitForPermits = (self, n, effect2) => callback((resume) => {
  if (self.free >= n)
    return resume(effect2);
  const observer = () => {
    if (self.free < n)
      return;
    self.waiters.delete(observer);
    resume(effect2);
  };
  self.waiters.add(observer);
  return sync(() => {
    self.waiters.delete(observer);
  });
});

class SemaphoreImpl {
  waiters = /* @__PURE__ */ new Set;
  taken = 0;
  permits;
  constructor(permits) {
    this.permits = permits;
  }
  get free() {
    return this.permits - this.taken;
  }
  take(n) {
    const take4 = suspend(() => {
      if (this.free < n) {
        return waitForPermits(this, n, take4);
      }
      this.taken += n;
      return succeed3(n);
    });
    return take4;
  }
  takeIfAvailable(n) {
    return suspend(() => {
      if (this.free < n)
        return succeed3(false);
      this.taken += n;
      return succeed3(true);
    });
  }
  releaseUnsafe(fiber3, n) {
    this.taken -= n;
    if (this.waiters.size > 0) {
      fiber3.currentDispatcher.scheduleTask(() => {
        for (const observer of this.waiters) {
          if (this.free <= 0)
            break;
          observer();
        }
      }, 0);
    }
    return this.free;
  }
  resize(permits) {
    return withFiber((fiber3) => {
      this.permits = permits;
      if (this.free < 0)
        return void_;
      this.releaseUnsafe(fiber3, 0);
      return void_;
    });
  }
  release(n) {
    return withFiber((fiber3) => succeed3(this.releaseUnsafe(fiber3, n)));
  }
  get releaseAll() {
    return withFiber((fiber3) => succeed3(this.releaseUnsafe(fiber3, this.taken)));
  }
  withPermits(n) {
    return (self) => uninterruptibleMask((restore) => {
      const acquire = suspend(() => {
        if (this.free < n) {
          const wait = waitForPermits(this, n, void_);
          return flatMap3(restore(wait), () => acquire);
        }
        this.taken += n;
        return onExitPrimitive(restore(self), () => {
          this.releaseUnsafe(getCurrentFiber(), n);
          return;
        }, true);
      });
      return acquire;
    });
  }
  withPermit = /* @__PURE__ */ this.withPermits(1);
  withPermitsIfAvailable(n) {
    return (self) => uninterruptibleMask((restore) => {
      if (this.free < n)
        return succeedNone;
      this.taken += n;
      return onExitPrimitive(restore(asSome(self)), () => {
        this.releaseUnsafe(getCurrentFiber(), n);
        return;
      }, true);
    });
  }
}

// node_modules/effect/dist/Take.js
var toPull = (take4) => isExit2(take4) ? isSuccess4(take4) ? done3(take4.value) : take4 : succeed6(take4);

// node_modules/effect/dist/Channel.js
var TypeId18 = "~effect/Channel";
var isChannel = (u) => hasProperty(u, TypeId18);
var ChannelProto = {
  [TypeId18]: {
    _Env: identity,
    _InErr: identity,
    _InElem: identity,
    _OutErr: identity,
    _OutElem: identity
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var fromTransform = (transform) => {
  const self = Object.create(ChannelProto);
  self.transform = (upstream, scope3) => catchCause3(transform(upstream, scope3), (cause) => succeed6(failCause4(cause)));
  return self;
};
var transformPull = (self, f) => fromTransform((upstream, scope3) => flatMap5(toTransform(self)(upstream, scope3), (pull) => f(pull, scope3)));
var fromPull = (effect2) => fromTransform((_, __) => effect2);
var fromTransformBracket = (f) => fromTransform(fnUntraced2(function* (upstream, scope3) {
  const closableScope = forkUnsafe2(scope3);
  const onCause = (cause) => close(closableScope, doneExitFromCause(cause));
  const pull = yield* onError2(f(upstream, scope3, closableScope), onCause);
  return onError2(pull, onCause);
}));
var toTransform = (channel) => channel.transform;
var DefaultChunkSize = 4096;
var asyncQueue = (scope3, f, options) => make13({
  capacity: options?.bufferSize,
  strategy: options?.strategy
}).pipe(tap3((queue) => addFinalizer2(scope3, shutdown2(queue))), tap3((queue) => forkIn2(provide(f(queue), scope3), scope3)));
var callbackArray = (f, options) => fromTransform((_, scope3) => map7(asyncQueue(scope3, f, options), takeAll3));
var suspend4 = (evaluate2) => fromTransform((upstream, scope3) => suspend3(() => toTransform(evaluate2())(upstream, scope3)));
var acquireUseRelease3 = (acquire, use, release) => fromTransformBracket(fnUntraced2(function* (upstream, scope3, forkedScope) {
  let option3 = none2();
  yield* addFinalizerExit(forkedScope, (exit3) => isSome2(option3) ? release(option3.value, exit3) : void_3);
  const value = yield* uninterruptible2(acquire);
  option3 = some2(value);
  return yield* toTransform(use(value))(upstream, scope3);
}));
var fromArray = (array2) => fromPull(sync3(() => {
  let index = 0;
  return suspend3(() => index >= array2.length ? done3() : succeed6(array2[index++]));
}));
var fromIteratorArray = (iterator, chunkSize = DefaultChunkSize) => fromPull(sync3(() => {
  const iter = iterator();
  let done4 = none2();
  return suspend3(() => {
    if (done4._tag === "Some")
      return done3(done4.value);
    const buffer = [];
    while (buffer.length < chunkSize) {
      const state = iter.next();
      if (state.done) {
        if (buffer.length === 0) {
          return done3(state.value);
        }
        done4 = some2(state.value);
        break;
      }
      buffer.push(state.value);
    }
    return succeed6(buffer);
  });
}));
var fromIterableArray = (iterable, chunkSize = DefaultChunkSize) => fromIteratorArray(() => iterable[Symbol.iterator](), chunkSize);
var succeed7 = (value) => fromEffect(succeed6(value));
var end2 = (value) => fromPull(succeed6(done3(value)));
var sync4 = (evaluate2) => fromEffect(sync3(evaluate2));
var empty6 = /* @__PURE__ */ fromPull(/* @__PURE__ */ succeed6(/* @__PURE__ */ done3()));
var never3 = /* @__PURE__ */ fromPull(/* @__PURE__ */ succeed6(never2));
var fail7 = (error) => fromPull(succeed6(fail6(error)));
var failSync3 = (evaluate2) => fromPull(failSync2(evaluate2));
var failCause6 = (cause) => fromPull(failCause4(cause));
var failCauseSync3 = (evaluate2) => fromPull(failCauseSync2(evaluate2));
var die5 = (defect) => failCause6(die3(defect));
var fromEffect = (effect2) => fromPull(sync3(() => {
  let done4 = false;
  return suspend3(() => {
    if (done4)
      return done3();
    done4 = true;
    return effect2;
  });
}));
var fromEffectDrain = (effect2) => fromPull(flatMap5(effect2, () => done3()));
var fromEffectTake = (effect2) => fromPull(succeed6(flatMap5(effect2, toPull)));
var fromQueueArray = (queue) => fromPull(succeed6(takeAll3(queue)));
var fromSubscriptionArray = (subscription) => fromPull(succeed6(onInterrupt2(takeAll2(subscription), () => done3())));
var fromPubSubArray = (pubsub) => unwrap2(map7(subscribe(pubsub), fromSubscriptionArray));
var fromPubSubTake = (pubsub) => unwrap2(map7(subscribe(pubsub), (sub) => fromEffectTake(take2(sub))));
var fromReadableStream = (options) => fromTransform((_, scope3) => readableStreamToPullUnsafe({
  scope: scope3,
  readable: options.evaluate(),
  onError: options.onError,
  releaseLockOnEnd: options.releaseLockOnEnd
}));
var readableStreamToPullUnsafe = (options) => {
  const reader = options.readable.getReader();
  const exit3 = options.exit ?? make10(undefined);
  const pull = suspend3(() => {
    if (exit3.current)
      return exit3.current;
    return matchCauseEffect2(tryPromise2({
      try: () => reader.read(),
      catch: options.onError
    }), {
      onFailure: (cause) => exit3.current ?? failCause4(cause),
      onSuccess: ({
        done: done4,
        value
      }) => {
        if (exit3.current)
          return exit3.current;
        return done4 ? done3() : succeed6(of(value));
      }
    });
  });
  return as2(addFinalizer2(options.scope, options.releaseLockOnEnd ? sync3(() => reader.releaseLock()) : promise2(() => reader.cancel().catch(constVoid))), pull);
};
var fromAsyncIterable = (iterable, onError3) => fromTransform(fnUntraced2(function* (_, scope3) {
  const iter = iterable[Symbol.asyncIterator]();
  if (iter.return) {
    yield* addFinalizer2(scope3, promise2(() => iter.return()));
  }
  return flatMap5(tryPromise2({
    try: () => iter.next(),
    catch: onError3
  }), (result3) => result3.done ? done3(result3.value) : succeed6(result3.value));
}));
var fromAsyncIterableArray = (iterable, onError3) => map8(fromAsyncIterable(iterable, onError3), of);
var map8 = /* @__PURE__ */ dual(2, (self, f) => transformPull(self, (pull) => sync3(() => {
  let i = 0;
  return map7(pull, (o) => f(o, i++));
})));
var mapDone = /* @__PURE__ */ dual(2, (self, f) => mapDoneEffect(self, (o) => succeed6(f(o))));
var mapDoneEffect = /* @__PURE__ */ dual(2, (self, f) => transformPull(self, (pull) => succeed6(catchDone(pull, (done4) => flatMap5(f(done4), done3)))));
var concurrencyIsSequential = (concurrency) => concurrency === undefined || concurrency !== "unbounded" && concurrency <= 1;
var mapEffect = /* @__PURE__ */ dual((args2) => isChannel(args2[0]), (self, f, options) => concurrencyIsSequential(options?.concurrency) ? mapEffectSequential(self, f) : mapEffectConcurrent(self, f, options));
var mapEffectSequential = (self, f) => fromTransform((upstream, scope3) => {
  let i = 0;
  return map7(toTransform(self)(upstream, scope3), flatMap5((o) => f(o, i++)));
});
var mapEffectConcurrent = (self, f, options) => fromTransformBracket(fnUntraced2(function* (upstream, scope3, forkedScope) {
  let i = 0;
  const pull = yield* toTransform(self)(upstream, scope3);
  const concurrencyN = options.concurrency === "unbounded" ? Number.MAX_SAFE_INTEGER : options.concurrency;
  const queue = yield* bounded2(0);
  yield* addFinalizer2(forkedScope, shutdown2(queue));
  const runFork3 = runForkWith2(yield* context2());
  const trackFiber = runIn(forkedScope);
  if (options.unordered) {
    const semaphore = makeUnsafe6(concurrencyN);
    const release = constant(semaphore.release(1));
    const handle = matchCauseEffect2({
      onFailure: (cause) => flatMap5(failCause5(queue, cause), release),
      onSuccess: (value) => flatMap5(offer(queue, value), release)
    });
    yield* semaphore.take(1).pipe(flatMap5(() => pull), flatMap5((value) => {
      trackFiber(runFork3(handle(f(value, i++))));
      return void_3;
    }), forever4({
      disableYield: true
    }), catchCause3((cause) => semaphore.withPermits(concurrencyN - 1)(failCause5(queue, cause))), forkIn2(forkedScope));
  } else {
    const effects = yield* bounded2(concurrencyN - 2);
    yield* addFinalizer2(forkedScope, shutdown2(effects));
    yield* take3(effects).pipe(flatten5, flatMap5((value) => offer(queue, value)), forever4({
      disableYield: true
    }), catchCause3((cause) => failCause5(queue, cause)), forkIn2(forkedScope));
    let errorCause;
    const onExit3 = (exit3) => {
      if (exit3._tag === "Success")
        return;
      errorCause = exit3.cause;
      failCauseUnsafe(queue, exit3.cause);
    };
    yield* pull.pipe(flatMap5((value) => {
      if (errorCause)
        return failCause4(errorCause);
      const fiber3 = runFork3(f(value, i++));
      trackFiber(fiber3);
      fiber3.addObserver(onExit3);
      return offer(effects, join2(fiber3));
    }), forever4({
      disableYield: true
    }), catchCause3((cause) => offer(effects, failCause2(cause)).pipe(andThen2(failCause5(effects, cause)))), forkIn2(forkedScope));
  }
  return take3(queue);
}));
var flatMap6 = /* @__PURE__ */ dual((args2) => isChannel(args2[0]), (self, f, options) => concurrencyIsSequential(options?.concurrency) ? flatMapSequential(self, f) : flatMapConcurrent(self, f, options));
var flatMapSequential = (self, f) => fromTransform((upstream, scope3) => map7(toTransform(self)(upstream, scope3), (pull) => {
  let childPull;
  let childScope;
  const makePull = flatMap5(pull, (value) => {
    childScope ??= forkUnsafe2(scope3);
    return flatMapEager2(toTransform(f(value))(upstream, childScope), (pull2) => {
      childPull = catchHalt(pull2);
      return childPull;
    });
  });
  const catchHalt = catchDone((_) => {
    childPull = undefined;
    if (childScope.state._tag === "Open" && scopeFinalizerCountUnsafe(childScope) === 1) {
      return makePull;
    }
    const close2 = close(childScope, void_2);
    childScope = undefined;
    return flatMap5(close2, () => makePull);
  });
  return suspend3(() => childPull ?? makePull);
}));
var flatMapConcurrent = (self, f, options) => self.pipe(map8(f), mergeAll3(options));
var concatWith = /* @__PURE__ */ dual(2, (self, f) => fromTransform((upstream, scope3) => sync3(() => {
  let currentPull;
  const forkedScope = forkUnsafe2(scope3);
  const makePull = flatMap5(toTransform(self)(upstream, forkedScope), (pull) => {
    currentPull = catchDone(pull, (leftover) => {
      return close(forkedScope, void_2).pipe(flatMap5(() => toTransform(f(leftover))(upstream, scope3)), flatMap5((pull2) => {
        currentPull = pull2;
        return pull2;
      }));
    });
    return currentPull;
  });
  return suspend3(() => currentPull ?? makePull);
})));
var combine2 = /* @__PURE__ */ dual(4, (self, that, s, f) => fromTransform(fnUntraced2(function* (upstream, scope3) {
  const leftPull = yield* toTransform(self)(upstream, scope3);
  const rightPull = yield* toTransform(that)(upstream, scope3);
  let state = s();
  return suspend3(() => {
    const combinedPull = f(state, leftPull, rightPull);
    return map7(combinedPull, ([a, s1]) => {
      state = s1;
      return a;
    });
  });
})));
var orElseIfEmpty = /* @__PURE__ */ dual(2, (self, f) => fromTransform((upstream, scope3) => sync3(() => {
  let currentPull;
  const forkedScope = forkUnsafe2(scope3);
  const makePull = flatMap5(toTransform(self)(upstream, forkedScope), (pull) => {
    const next = pull.pipe(tap3(() => {
      currentPull = pull;
      return void_3;
    }), catchDone((leftover) => close(forkedScope, succeed4(leftover)).pipe(andThen2(toTransform(f(leftover))(upstream, scope3)), flatMap5((pull2) => {
      currentPull = pull2;
      return pull2;
    }))));
    currentPull = next;
    return next;
  });
  return suspend3(() => currentPull ?? makePull);
})));
var flattenArray = (self) => transformPull(self, (pull) => {
  let array2;
  let index = 0;
  const pump = suspend3(function loop() {
    if (array2 === undefined) {
      return flatMap5(pull, (array_) => {
        switch (array_.length) {
          case 0:
            return loop();
          case 1:
            return succeed6(array_[0]);
          default: {
            array2 = array_;
            return succeed6(array_[index++]);
          }
        }
      });
    }
    const next = array2[index++];
    if (index >= array2.length) {
      array2 = undefined;
      index = 0;
    }
    return succeed6(next);
  });
  return succeed6(pump);
});
var flattenTake = (self) => mapEffectSequential(self, toPull);
var drain = (self) => transformPull(self, (pull) => succeed6(forever4(pull, {
  disableYield: true
})));
var repeat4 = /* @__PURE__ */ dual(2, (self, schedule2) => toStepWithMetadata(typeof schedule2 === "function" ? schedule2(identity) : schedule2).pipe(map7((step) => {
  let meta = CurrentMetadata2.defaultValue();
  const loop = concatWith(provideServiceEffect3(self, CurrentMetadata2, sync3(() => meta)), (done4) => step(done4).pipe(map7((meta_) => {
    meta = meta_;
    return loop;
  }), catchDone(() => succeed6(end2(done4))), unwrap2));
  return loop;
}), unwrap2));
var forever5 = (self) => concatWith(self, () => forever5(self));
var schedule2 = /* @__PURE__ */ dual(2, (self, schedule3) => transformPull(self, (pull, _scope) => map7(toStepWithSleep(schedule3), (step) => {
  const pullWithStep = tap3(pull, step);
  return pullWithStep;
})));
var filter7 = /* @__PURE__ */ dual(2, (self, predicate) => fromTransform((upstream, scope3) => map7(toTransform(self)(upstream, scope3), (pull) => flatMap5(pull, function loop(elem) {
  return predicate(elem) ? succeed6(elem) : flatMap5(pull, loop);
}))));
var filterArray = /* @__PURE__ */ dual(2, (self, predicate) => transformPull(self, (pull) => succeed6(flatMap5(pull, function loop(arr) {
  const passes = [];
  for (let i = 0;i < arr.length; i++) {
    if (predicate(arr[i])) {
      passes.push(arr[i]);
    }
  }
  return isReadonlyArrayNonEmpty(passes) ? succeed6(passes) : flatMap5(pull, loop);
}))));
var filterMapArray = /* @__PURE__ */ dual(2, (self, filter8) => transformPull(self, (pull) => succeed6(flatMap5(pull, function loop(arr) {
  const passes = [];
  for (let i = 0;i < arr.length; i++) {
    const result3 = filter8(arr[i]);
    if (isSuccess2(result3)) {
      passes.push(result3.success);
    }
  }
  return isReadonlyArrayNonEmpty(passes) ? succeed6(passes) : flatMap5(pull, loop);
}))));
var filterArrayEffect = /* @__PURE__ */ dual(2, (self, predicate) => transformPull(self, (pull) => {
  const f = flatMap5(pull, (arr) => filter5(arr, predicate));
  return succeed6(flatMap5(f, function loop(arr) {
    return isReadonlyArrayNonEmpty(arr) ? succeed6(arr) : flatMap5(f, loop);
  }));
}));
var filterMapArrayEffect = /* @__PURE__ */ dual(2, (self, filter8) => transformPull(self, (pull) => succeed6(flatMap5(pull, function loop(arr) {
  return flatMap5(filterMapEffect2(arr, filter8), (passes) => isReadonlyArrayNonEmpty(passes) ? succeed6(passes) : flatMap5(pull, loop));
}))));
var mapAccum2 = /* @__PURE__ */ dual((args2) => isChannel(args2[0]), (self, initial, f, options) => fromTransform((upstream, scope3) => map7(toTransform(self)(upstream, scope3), (pull) => {
  let state = initial();
  let current;
  let index = 0;
  let cause;
  const pullNext = matchCauseEffect2(pull, {
    onFailure(cause_) {
      cause = cause_;
      const b = options?.onHalt && options.onHalt(state);
      return b && b.length > 0 ? succeed6([state, b]) : failCause4(cause_);
    },
    onSuccess(a) {
      const b = f(state, a);
      return isArray(b) ? succeed6(b) : b;
    }
  });
  const pump = suspend3(function loop() {
    if (current === undefined) {
      if (cause)
        return failCause4(cause);
      return flatMap5(pullNext, ([newState, values]) => {
        state = newState;
        if (values.length === 0) {
          return loop();
        } else if (values.length === 1) {
          return succeed6(values[0]);
        }
        current = values;
        return loop();
      });
    }
    const next = current[index++];
    if (index >= current.length) {
      current = undefined;
      index = 0;
    }
    return succeed6(next);
  });
  return pump;
})));
var scanEffect = /* @__PURE__ */ dual(3, (self, initial, f) => fromTransform((upstream, scope3) => map7(toTransform(self)(upstream, scope3), (pull) => {
  let state = initial;
  let isFirst = true;
  return suspend3(() => {
    if (isFirst) {
      isFirst = false;
      return succeed6(state);
    }
    return map7(flatMap5(pull, (a) => f(state, a)), (newState) => {
      state = newState;
      return state;
    });
  });
})));
var catchCause4 = /* @__PURE__ */ dual(2, (self, f) => fromTransform((upstream, scope3) => {
  let forkedScope = forkUnsafe2(scope3);
  return map7(toTransform(self)(upstream, forkedScope), (pull) => {
    let currentPull = pull.pipe(catchCause3((cause) => {
      if (isDoneCause(cause)) {
        return failCause4(cause);
      }
      const toClose = forkedScope;
      forkedScope = forkUnsafe2(scope3);
      return close(toClose, failCause2(cause)).pipe(andThen2(toTransform(f(cause))(upstream, forkedScope)), flatMap5((childPull) => {
        currentPull = childPull;
        return childPull;
      }));
    }));
    return suspend3(() => currentPull);
  });
}));
var tapCause4 = /* @__PURE__ */ dual(2, (self, f) => catchCause4(self, (cause) => fromEffectDrain(flatMap5(f(cause), (_) => failCause4(cause)))));
var catchCauseIf3 = /* @__PURE__ */ dual(3, (self, predicate, f) => catchCause4(self, (cause) => {
  return predicate(cause) ? f(cause) : failCause6(cause);
}));
var catchCauseFilter3 = /* @__PURE__ */ dual(3, (self, filter8, f) => catchCause4(self, (cause) => {
  const result3 = filter8(cause);
  return isFailure2(result3) ? failCause6(result3.failure) : f(result3.success, cause);
}));
var catch_4 = /* @__PURE__ */ dual(2, (self, f) => catchCauseFilter3(self, findError2, (e) => f(e)));
var tapError4 = /* @__PURE__ */ dual(2, (self, f) => transformPull(self, (pull) => succeed6(tapError3(pull, (err) => isDone3(err) ? void_3 : asVoid2(f(err))))));
var catchIf3 = /* @__PURE__ */ dual((args2) => isChannel(args2[0]), (self, predicate, f, orElse) => catch_4(self, (err) => {
  return predicate(err) ? f(err) : orElse ? orElse(err) : fail7(err);
}));
var catchFilter3 = /* @__PURE__ */ dual((args2) => isChannel(args2[0]), (self, filter8, f, orElse) => catch_4(self, (err) => {
  const result3 = filter8(err);
  return isFailure2(result3) ? orElse ? orElse(result3.failure) : fail7(result3.failure) : f(result3.success);
}));
var catchReason3 = /* @__PURE__ */ dual((args2) => isChannel(args2[0]), (self, errorTag, reasonTag, f, orElse) => catch_4(self, (error) => {
  if (isTagged(error, errorTag) && hasProperty(error, "reason")) {
    const reason = error.reason;
    if (isTagged(reason, reasonTag)) {
      return f(reason, error);
    }
    return orElse ? orElse(reason, error) : fail7(error);
  }
  return fail7(error);
}));
var catchReasons3 = /* @__PURE__ */ dual((args2) => isChannel(args2[0]), (self, errorTag, cases, orElse) => {
  let keys2;
  return catch_4(self, (error) => {
    if (isTagged(error, errorTag) && hasProperty(error, "reason") && hasProperty(error.reason, "_tag") && isString2(error.reason._tag)) {
      const reason = error.reason;
      keys2 ??= new Set(Object.keys(cases));
      if (keys2.has(reason._tag)) {
        return cases[reason._tag](reason, error);
      }
      return orElse ? orElse(reason, error) : fail7(error);
    }
    return fail7(error);
  });
});
var mapError4 = /* @__PURE__ */ dual(2, (self, f) => catch_4(self, (err) => fail7(f(err))));
var orDie4 = (self) => catch_4(self, die5);
var ignore3 = /* @__PURE__ */ dual((args2) => isChannel(args2[0]), (self, options) => {
  if (!options?.log) {
    return catch_4(self, () => empty6);
  }
  const logEffect = logWithLevel2(options.log === true ? undefined : options.log);
  return catch_4(tapCause4(self, (cause) => hasFails2(cause) ? logEffect(cause) : void_3), () => empty6);
});
var ignoreCause_ = (self) => catchCause4(self, () => empty6);
var ignoreCause3 = /* @__PURE__ */ dual((args2) => isChannel(args2[0]), (self, options) => {
  if (!options?.log)
    return ignoreCause_(self);
  const logEffect = logWithLevel2(options.log === true ? undefined : options.log);
  return ignoreCause_(tapCause4(self, (cause) => logEffect(cause)));
});
var retry3 = /* @__PURE__ */ dual(2, (self, schedule3) => suspend4(() => {
  let step = undefined;
  let meta = CurrentMetadata2.defaultValue();
  const selfWithMeta = provideServiceEffect3(self, CurrentMetadata2, sync3(() => meta));
  const withReset = onFirst(selfWithMeta, () => {
    step = undefined;
    return void_3;
  });
  const resolvedSchedule = typeof schedule3 === "function" ? schedule3(identity) : schedule3;
  const loop = catch_4(withReset, fnUntraced2(function* (error) {
    if (!step) {
      step = yield* toStepWithMetadata(resolvedSchedule);
    }
    meta = yield* step(error);
    return loop;
  }, (effect2, error) => catchDone(effect2, () => succeed6(fail7(error))), unwrap2));
  return loop;
}));
var switchMap = /* @__PURE__ */ dual((args2) => isChannel(args2[0]), (self, f, options) => self.pipe(map8(f), mergeAll3({
  ...options,
  concurrency: options?.concurrency ?? 1,
  switch: true
})));
var mergeAll3 = /* @__PURE__ */ dual(2, (channels, {
  bufferSize = 16,
  concurrency,
  switch: switch_ = false
}) => fromTransformBracket(fnUntraced2(function* (upstream, scope3, forkedScope) {
  const concurrencyN = concurrency === "unbounded" ? Number.MAX_SAFE_INTEGER : Math.max(1, concurrency);
  const semaphore = switch_ ? undefined : makeUnsafe6(concurrencyN);
  const doneLatch = yield* make9(true);
  const fibers = new Set;
  const queue = yield* bounded2(bufferSize);
  yield* addFinalizer2(forkedScope, shutdown2(queue));
  const pull = yield* toTransform(channels)(upstream, scope3);
  yield* gen2(function* () {
    while (true) {
      let pullFiber;
      if (semaphore) {
        if (fibers.size < concurrencyN) {
          yield* semaphore.take(1);
        } else {
          pullFiber = yield* forkChild2(pull);
          yield* raceFirst2(semaphore.take(1), andThen2(join2(pullFiber), never2));
        }
      }
      const channel = pullFiber === undefined ? yield* pull : yield* join2(pullFiber);
      const childScope = forkUnsafe2(forkedScope);
      const childPull = yield* toTransform(channel)(upstream, childScope);
      while (fibers.size >= concurrencyN) {
        const fiber4 = headUnsafe(fibers);
        fibers.delete(fiber4);
        if (fibers.size === 0)
          yield* doneLatch.open;
        yield* interrupt4(fiber4);
      }
      const fiber3 = yield* childPull.pipe(tap3(() => yieldNow2), flatMap5((value) => offer(queue, value)), forever4({
        disableYield: true
      }), onError2(fnUntraced2(function* (cause) {
        const halt = filterDone(cause);
        yield* exit2(close(childScope, !isFailure2(halt) ? succeed4(halt.success.value) : failCause2(halt.failure)));
        if (!fibers.has(fiber3))
          return;
        fibers.delete(fiber3);
        if (semaphore)
          yield* semaphore.release(1);
        if (fibers.size === 0)
          yield* doneLatch.open;
        if (isSuccess2(halt))
          return;
        return yield* failCause5(queue, cause);
      })), forkChild2);
      doneLatch.closeUnsafe();
      fibers.add(fiber3);
    }
  }).pipe(catchCause3((cause) => {
    const halt = filterDone(cause);
    if (isSuccess2(halt)) {
      return doneLatch.whenOpen(failCause5(queue, cause));
    }
    return failCause5(queue, cause);
  }), forkIn2(forkedScope));
  return take3(queue);
})));
var merge3 = /* @__PURE__ */ dual((args2) => isChannel(args2[0]) && isChannel(args2[1]), (left, right, options) => fromTransformBracket(fnUntraced2(function* (upstream, _scope, forkedScope) {
  const strategy = options?.haltStrategy ?? "both";
  const queue = yield* bounded2(0);
  yield* addFinalizer2(forkedScope, shutdown2(queue));
  let done4 = 0;
  function onExit3(side, cause) {
    done4++;
    if (!isDoneCause(cause)) {
      return failCause5(queue, cause);
    }
    switch (strategy) {
      case "both": {
        return done4 === 2 ? failCause5(queue, cause) : void_3;
      }
      case "left":
      case "right": {
        return side === strategy ? failCause5(queue, cause) : void_3;
      }
      case "either": {
        return failCause5(queue, cause);
      }
    }
  }
  const runSide = (side, channel, scope3) => toTransform(channel)(upstream, scope3).pipe(flatMap5((pull) => pull.pipe(flatMap5((value) => offer(queue, value)), forever4)), onError2((cause) => andThen2(close(scope3, doneExitFromCause(cause)), onExit3(side, cause))), forkIn2(forkedScope));
  yield* runSide("left", left, forkUnsafe2(forkedScope));
  yield* runSide("right", right, forkUnsafe2(forkedScope));
  return take3(queue);
})));
var mergeEffect = /* @__PURE__ */ dual(2, (self, effect2) => merge3(self, fromEffectDrain(effect2), {
  haltStrategy: "left"
}));
var splitLines = () => fromTransform((upstream, _scope) => sync3(() => {
  let stringBuilder = "";
  let midCRLF = false;
  let done4 = none2();
  function splitLinesArray(chunk) {
    const chunkBuilder = [];
    function pushLine(segment) {
      if (stringBuilder.length === 0) {
        chunkBuilder.push(segment);
      } else {
        chunkBuilder.push(stringBuilder + segment);
        stringBuilder = "";
      }
    }
    for (let i = 0;i < chunk.length; i++) {
      const str = chunk[i];
      if (str.length !== 0) {
        let from = 0;
        let indexOfCR = str.indexOf("\r");
        let indexOfLF = str.indexOf(`
`);
        if (midCRLF) {
          if (indexOfLF === 0) {
            pushLine("");
            from = 1;
            indexOfLF = str.indexOf(`
`, from);
          } else {
            pushLine("");
          }
          midCRLF = false;
        }
        while (indexOfCR !== -1 || indexOfLF !== -1) {
          if (indexOfCR === -1 || indexOfLF !== -1 && indexOfLF < indexOfCR) {
            pushLine(str.substring(from, indexOfLF));
            from = indexOfLF + 1;
            indexOfLF = str.indexOf(`
`, from);
          } else {
            if (str.length === indexOfCR + 1) {
              midCRLF = true;
              indexOfCR = -1;
            } else {
              pushLine(str.substring(from, indexOfCR));
              from = indexOfCR + (indexOfLF === indexOfCR + 1 ? 2 : 1);
              indexOfCR = str.indexOf("\r", from);
              indexOfLF = str.indexOf(`
`, from);
            }
          }
        }
        stringBuilder = stringBuilder + str.substring(from, str.length - (midCRLF ? 1 : 0));
      }
    }
    return isReadonlyArrayNonEmpty(chunkBuilder) ? chunkBuilder : null;
  }
  const pullOrFlush = suspend3(() => {
    if (done4._tag === "Some") {
      return done3(done4.value);
    }
    return matchEffect2(upstream, {
      onSuccess: loop,
      onFailure: failCause4,
      onDone: (leftover) => {
        done4 = some2(leftover);
        if (stringBuilder.length > 0 || midCRLF) {
          const last = stringBuilder;
          stringBuilder = "";
          midCRLF = false;
          return succeed6([last]);
        }
        return done3(leftover);
      }
    });
  });
  function loop(chunk) {
    const lines = splitLinesArray(chunk);
    return lines !== null ? succeed6(lines) : pullOrFlush;
  }
  return pullOrFlush;
}));
var pipeTo = /* @__PURE__ */ dual(2, (self, that) => fromTransform((upstream, scope3) => flatMap5(toTransform(self)(upstream, scope3), (upstream2) => toTransform(that)(upstream2, scope3))));
var pipeToOrFail = /* @__PURE__ */ dual(2, (self, that) => fromTransform((upstream, scope3) => flatMap5(toTransform(self)(upstream, scope3), (upstream2) => {
  const upstreamPull = catchCause3(upstream2, (cause) => isDoneCause(cause) ? failCause4(cause) : die4(Done2(cause)));
  return map7(toTransform(that)(upstreamPull, scope3), (pull) => catchDefect2(pull, (defect) => isDone3(defect) ? failCause4(defect.value) : die4(defect)));
})));
var unwrap2 = (channel) => fromTransform((upstream, scope3) => {
  let pull;
  return succeed6(suspend3(() => {
    if (pull)
      return pull;
    return channel.pipe(provide(scope3), flatMap5((channel2) => toTransform(channel2)(upstream, scope3)), flatMap5((pull_) => pull = pull_));
  }));
});
var scoped3 = (self) => fromTransformBracket((upstream, scope3, forkedScope) => map7(provide(toTransform(self)(upstream, scope3), forkedScope), provide(forkedScope)));
var buffer = /* @__PURE__ */ dual(2, (self, options) => fromTransform(fnUntraced2(function* (upstream, scope3) {
  const pull = yield* toTransform(self)(upstream, scope3);
  const queue = yield* make13({
    capacity: options.capacity === "unbounded" ? undefined : options.capacity,
    strategy: options.capacity === "unbounded" ? undefined : options.strategy
  });
  yield* addFinalizer2(scope3, shutdown2(queue));
  yield* pull.pipe(flatMap5((value) => offer(queue, value)), forever4({
    disableYield: true
  }), onError2((cause) => failCause5(queue, cause)), forkIn2(scope3));
  return take3(queue);
})));
var bufferArray = /* @__PURE__ */ dual(2, (self, options) => fromTransform(fnUntraced2(function* (upstream, scope3) {
  const pull = yield* toTransform(self)(upstream, scope3);
  const queue = yield* make13({
    capacity: options.capacity === "unbounded" ? undefined : options.capacity,
    strategy: options.capacity === "unbounded" ? undefined : options.strategy
  });
  yield* addFinalizer2(scope3, shutdown2(queue));
  yield* pull.pipe(flatMap5((value) => offerAll(queue, value)), forever4({
    disableYield: true
  }), onError2((cause) => failCause5(queue, cause)), forkIn2(scope3));
  return takeAll3(queue);
})));
var interruptWhen = /* @__PURE__ */ dual(2, (self, effect2) => merge3(self, fromPull(succeed6(flatMap5(effect2, done3))), {
  haltStrategy: "either"
}));
var haltWhen = /* @__PURE__ */ dual(2, (self, effect2) => fromTransformBracket(fnUntraced2(function* (upstream, scope3, forkedScope) {
  const pull = yield* toTransform(self)(upstream, scope3);
  const fiber3 = yield* forkIn2(effect2, forkedScope, {
    startImmediately: true
  });
  return suspend3(() => {
    const exit3 = fiber3.pollUnsafe();
    return exit3 === undefined ? pull : match5(exit3, {
      onFailure: failCause4,
      onSuccess: done3
    });
  });
})));
var onError3 = /* @__PURE__ */ dual(2, (self, finalizer) => onExit3(self, (exit3) => isFailure4(exit3) ? finalizer(exit3.cause) : void_3));
var onExit3 = /* @__PURE__ */ dual(2, (self, finalizer) => fromTransformBracket((upstream, scope3, forkedScope) => addFinalizerExit(forkedScope, finalizer).pipe(andThen2(toTransform(self)(upstream, scope3)))));
var onStart = /* @__PURE__ */ dual(2, (self, onStart2) => unwrap2(as2(onStart2, self)));
var onFirst = /* @__PURE__ */ dual(2, (self, onFirst2) => transformPull(self, (pull) => sync3(() => {
  let isFirst = true;
  const pullFirst = tap3(pull, (element) => {
    isFirst = false;
    return onFirst2(element);
  });
  return suspend3(() => isFirst ? pullFirst : pull);
})));
var onEnd = /* @__PURE__ */ dual(2, (self, onEnd2) => transformPull(self, (pull) => succeed6(catchDone(pull, (leftover) => flatMap5(onEnd2, () => done3(leftover))))));
var ensuring3 = /* @__PURE__ */ dual(2, (self, finalizer) => onExit3(self, (_) => finalizer));
var runWith = (self, f, onHalt) => suspend3(() => {
  const scope3 = makeUnsafe3();
  const makePull = toTransform(self)(done3(), scope3);
  return catchDone(flatMap5(makePull, f), onHalt ? onHalt : succeed6).pipe(onExit2((exit3) => close(scope3, exit3)));
});
var provideContext3 = /* @__PURE__ */ dual(2, (self, context3) => fromTransform((upstream, scope3) => map7(provideContext2(toTransform(self)(upstream, scope3), context3), provideContext2(context3))));
var provideService3 = /* @__PURE__ */ dual(3, (self, key, service3) => fromTransform((upstream, scope3) => map7(provideService2(toTransform(self)(upstream, scope3), key, service3), provideService2(key, service3))));
var provideServiceEffect3 = /* @__PURE__ */ dual(3, (self, key, service3) => fromTransform((upstream, scope3) => flatMap5(service3, (s) => toTransform(provideService3(self, key, s))(upstream, scope3))));
var provide5 = /* @__PURE__ */ dual((args2) => isChannel(args2[0]), (self, layer, options) => isContext(layer) ? provideContext3(self, layer) : fromTransform((upstream, scope3) => flatMap5(options?.local ? buildWithMemoMap(layer, makeMemoMapUnsafe(), scope3) : buildWithScope(layer, scope3), (context3) => map7(provideContext2(toTransform(self)(upstream, scope3), context3), provideContext2(context3)))));
var updateContext3 = /* @__PURE__ */ dual(2, (self, f) => fromTransform((upstream, scope3) => contextWith2((context3) => {
  const toProvide = f(context3);
  return toTransform(provideContext3(self, toProvide))(upstream, scope3);
})));
var withSpan4 = function() {
  const dataFirst = isChannel(arguments[0]);
  const name = dataFirst ? arguments[1] : arguments[0];
  const options = addSpanStackTrace(dataFirst ? arguments[2] : arguments[1]);
  if (dataFirst) {
    const self = arguments[0];
    return withSpanImpl(self, name, options);
  }
  return (self) => withSpanImpl(self, name, options);
};
var withSpanImpl = (self, name, options) => acquireUseRelease3(makeSpan2(name, options), (span2) => provideService3(self, ParentSpan, span2), (span2, exit3) => withFiber2((fiber3) => {
  const clock = fiber3.getRef(ClockRef);
  const timingEnabled = fiber3.getRef(TracerTimingEnabled2);
  return endSpan(span2, exit3, clock, timingEnabled);
}));
var runDrain = (self) => runWith(self, (pull) => forever4(pull, {
  disableYield: true
}));
var runForEach = /* @__PURE__ */ dual(2, (self, f) => runWith(self, (pull) => forever4(flatMap5(pull, f), {
  disableYield: true
})));
var runForEachWhile = /* @__PURE__ */ dual(2, (self, f) => runWith(self, (pull) => pull.pipe(flatMap5(f), flatMap5((cont) => cont ? void_3 : done3()), forever4({
  disableYield: true
}))));
var mkUint8Array = (self) => map7(runFold(self, () => ({
  bytes: 0,
  arrays: []
}), (acc, chunk) => {
  for (let i = 0;i < chunk.length; i++) {
    acc.bytes += chunk[i].length;
    acc.arrays.push(chunk[i]);
  }
  return acc;
}), ({
  arrays,
  bytes
}) => {
  const result3 = new Uint8Array(bytes);
  let offset = 0;
  for (let i = 0;i < arrays.length; i++) {
    const array2 = arrays[i];
    result3.set(array2, offset);
    offset += array2.length;
  }
  return result3;
});
var runHead = (self) => suspend3(() => {
  let head3 = none2();
  return runWith(self, (pull) => pull.pipe(asSome2, flatMap5((head_) => {
    head3 = head_;
    return done3();
  })), () => succeed6(head3));
});
var runLast = (self) => suspend3(() => {
  const absent = Symbol();
  let last = absent;
  return runWith(self, (pull) => forever4(flatMap5(pull, (item) => {
    last = item;
    return void_3;
  }), {
    disableYield: true
  }), () => last === absent ? succeedNone2 : succeedSome2(last));
});
var runFold = /* @__PURE__ */ dual(3, (self, initial, f) => suspend3(() => {
  let state = initial();
  return runWith(self, (pull) => whileLoop2({
    while: constTrue,
    body: () => pull,
    step: (value) => {
      state = f(state, value);
    }
  }), () => succeed6(state));
}));
var runFoldEffect = /* @__PURE__ */ dual(3, (self, initial, f) => suspend3(() => {
  let state = initial();
  return runWith(self, (pull) => whileLoop2({
    while: constTrue,
    body: constant(pull.pipe(flatMap5((o) => f(state, o)), map7((s) => {
      state = s;
    }))),
    step: constVoid
  }), () => succeed6(state));
}));
var toPull2 = /* @__PURE__ */ fnUntraced2(function* (self) {
  const semaphore = makeUnsafe6(1);
  const context3 = yield* context2();
  const scope3 = get(context3, Scope);
  const pull = yield* toTransform(self)(done3(), scope3);
  return pull.pipe(provideContext2(context3), semaphore.withPermits(1));
}, /* @__PURE__ */ catchCause3((cause) => succeed6(failCause4(cause))));
var toPullScoped = (self, scope3) => toTransform(self)(done3(), scope3);
var runIntoQueueArray = /* @__PURE__ */ dual((args2) => isChannel(args2[0]), (self, queue) => uninterruptibleMask2((restore) => runForEach(self, (value) => offerAll(queue, value)).pipe(restore, exit2, flatMap5((exit3) => {
  if (isSuccess4(exit3)) {
    endUnsafe(queue);
  } else {
    failCauseUnsafe(queue, exit3.cause);
  }
  return void_3;
}))));
var toQueueArray = /* @__PURE__ */ dual((args2) => isChannel(args2[0]), /* @__PURE__ */ fnUntraced2(function* (self, options) {
  const scope3 = yield* scope2;
  const queue = yield* make13({
    capacity: typeof options.capacity === "number" ? options.capacity : undefined,
    strategy: typeof options.capacity === "number" ? options.strategy : undefined
  });
  yield* addFinalizer2(scope3, shutdown2(queue));
  yield* forkIn2(runIntoQueueArray(self, queue), scope3);
  return queue;
}));
var makePubSub = (options) => acquireRelease2(options.capacity === "unbounded" ? unbounded(options) : options.strategy === "dropping" ? dropping(options) : options.strategy === "sliding" ? sliding(options) : bounded(options), shutdown);
var toPubSubArray = /* @__PURE__ */ dual(2, /* @__PURE__ */ fnUntraced2(function* (self, options) {
  const pubsub = yield* makePubSub(options);
  yield* forkScoped2(runIntoPubSubArray(self, pubsub, {
    shutdownOnEnd: options.shutdownOnEnd !== false
  }));
  return pubsub;
}));
var runIntoPubSubArray = /* @__PURE__ */ dual((args2) => isChannel(args2[0]), (self, pubsub, options) => runForEach(self, (value) => publishAll(pubsub, value)).pipe(options?.shutdownOnEnd === true ? ensuring2(shutdown(pubsub)) : identity));
var toPubSubTake = /* @__PURE__ */ dual(2, /* @__PURE__ */ fnUntraced2(function* (self, options) {
  const pubsub = yield* makePubSub(options);
  yield* runForEach(self, (value) => publish(pubsub, value)).pipe(onExit2((exit3) => publish(pubsub, exit3)), forkScoped2);
  return pubsub;
}));

// node_modules/effect/dist/internal/stream.js
var TypeId19 = "~effect/Stream";
var streamVariance = {
  _R: identity,
  _E: identity,
  _A: identity
};
var StreamProto = {
  [TypeId19]: streamVariance,
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var fromChannel = (channel) => {
  const self = Object.create(StreamProto);
  self.channel = channel;
  return self;
};

// node_modules/effect/dist/Sink.js
var TypeId20 = "~effect/Sink";
var endVoid = /* @__PURE__ */ succeed6([undefined]);
var sinkVariance = {
  _A: identity,
  _In: identity,
  _L: identity,
  _E: identity,
  _R: identity
};
var SinkProto = {
  [TypeId20]: sinkVariance,
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var isSink = (u) => hasProperty(u, TypeId20);
var fromChannel2 = (channel) => fromTransform2((upstream, scope3) => toTransform(channel)(upstream, scope3).pipe(flatMap5(forever4({
  disableYield: true
})), catchDone(succeed6)));
var fromTransform2 = (transform) => {
  const self = Object.create(SinkProto);
  self.transform = transform;
  return self;
};
var toChannel = (self) => fromTransform((upstream, scope3) => succeed6(flatMap5(self.transform(upstream, scope3), done3)));
var fromEffectEnd = (effect2) => fromTransform2(() => effect2);
var fail8 = (e) => fromEffectEnd(fail6(e));
var drain2 = /* @__PURE__ */ fromTransform2((upstream) => catchDone(forever4(upstream, {
  disableYield: true
}), () => endVoid));
var take4 = (n) => fromTransform2((upstream) => {
  const taken = [];
  if (n <= 0) {
    return succeed6([taken]);
  }
  let leftover = undefined;
  return upstream.pipe(flatMap5((arr) => {
    if (taken.length + arr.length <= n) {
      taken.push(...arr);
      if (taken.length === n) {
        return done3();
      }
      return void_3;
    }
    for (let i = 0;i < arr.length; i++) {
      taken.push(arr[i]);
      if (taken.length === n) {
        if (i + 1 < arr.length) {
          leftover = arr.slice(i + 1);
        }
        return done3();
      }
    }
    return void_3;
  }), forever4({
    disableYield: true
  }), catchDone(() => succeed6([taken, leftover])));
});
var forEach3 = (f) => forEachArray(forEach2((_) => f(_), {
  discard: true
}));
var forEachArray = (f) => fromTransform2((upstream) => upstream.pipe(flatMap5(f), forever4({
  disableYield: true
}), catchDone(() => endVoid)));
var unwrap3 = (effect2) => fromChannel2(unwrap2(map7(effect2, toChannel)));

// node_modules/effect/dist/Stream.js
var exports_Stream = {};
__export(exports_Stream, {
  DefaultChunkSize: () => DefaultChunkSize2,
  Do: () => Do3,
  TypeId: () => TypeId24,
  accumulate: () => accumulate,
  aggregate: () => aggregate,
  aggregateWithin: () => aggregateWithin,
  bind: () => bind4,
  bindEffect: () => bindEffect,
  bindTo: () => bindTo4,
  broadcast: () => broadcast,
  broadcastN: () => broadcastN,
  buffer: () => buffer2,
  bufferArray: () => bufferArray2,
  callback: () => callback3,
  catch: () => catch_5,
  catchCause: () => catchCause5,
  catchCauseFilter: () => catchCauseFilter4,
  catchCauseIf: () => catchCauseIf4,
  catchFilter: () => catchFilter4,
  catchIf: () => catchIf4,
  catchReason: () => catchReason4,
  catchReasons: () => catchReasons4,
  catchTag: () => catchTag4,
  catchTags: () => catchTags3,
  changes: () => changes,
  changesWith: () => changesWith,
  changesWithEffect: () => changesWithEffect,
  chunks: () => chunks,
  collect: () => collect,
  combine: () => combine3,
  combineArray: () => combineArray,
  concat: () => concat,
  cross: () => cross,
  crossWith: () => crossWith,
  debounce: () => debounce,
  decodeText: () => decodeText,
  die: () => die6,
  drain: () => drain3,
  drainFork: () => drainFork,
  drop: () => drop,
  dropRight: () => dropRight,
  dropUntil: () => dropUntil,
  dropUntilEffect: () => dropUntilEffect,
  dropWhile: () => dropWhile,
  dropWhileEffect: () => dropWhileEffect,
  dropWhileFilter: () => dropWhileFilter,
  empty: () => empty8,
  encodeText: () => encodeText,
  ensuring: () => ensuring4,
  fail: () => fail9,
  failCause: () => failCause7,
  failCauseSync: () => failCauseSync4,
  failSync: () => failSync4,
  filter: () => filter8,
  filterEffect: () => filterEffect,
  filterMap: () => filterMap3,
  filterMapEffect: () => filterMapEffect3,
  flatMap: () => flatMap7,
  flatten: () => flatten6,
  flattenArray: () => flattenArray2,
  flattenEffect: () => flattenEffect,
  flattenIterable: () => flattenIterable,
  flattenTake: () => flattenTake2,
  forever: () => forever6,
  fromArray: () => fromArray2,
  fromArrayEffect: () => fromArrayEffect,
  fromArrays: () => fromArrays,
  fromAsyncIterable: () => fromAsyncIterable2,
  fromChannel: () => fromChannel3,
  fromEffect: () => fromEffect2,
  fromEffectDrain: () => fromEffectDrain2,
  fromEffectRepeat: () => fromEffectRepeat,
  fromEffectSchedule: () => fromEffectSchedule,
  fromEventListener: () => fromEventListener,
  fromIterable: () => fromIterable3,
  fromIterableEffect: () => fromIterableEffect,
  fromIterableEffectRepeat: () => fromIterableEffectRepeat,
  fromIteratorSucceed: () => fromIteratorSucceed,
  fromPubSub: () => fromPubSub,
  fromPubSubTake: () => fromPubSubTake2,
  fromPull: () => fromPull2,
  fromQueue: () => fromQueue,
  fromReadableStream: () => fromReadableStream2,
  fromSchedule: () => fromSchedule,
  fromSubscription: () => fromSubscription,
  groupAdjacentBy: () => groupAdjacentBy,
  groupBy: () => groupBy,
  groupByKey: () => groupByKey,
  grouped: () => grouped,
  groupedWithin: () => groupedWithin,
  haltWhen: () => haltWhen2,
  ignore: () => ignore4,
  ignoreCause: () => ignoreCause4,
  interleave: () => interleave,
  interleaveWith: () => interleaveWith,
  interruptWhen: () => interruptWhen2,
  intersperse: () => intersperse,
  intersperseAffixes: () => intersperseAffixes,
  isStream: () => isStream,
  iterate: () => iterate,
  let: () => let_4,
  limitBytes: () => limitBytes,
  make: () => make17,
  map: () => map9,
  mapAccum: () => mapAccum3,
  mapAccumArray: () => mapAccumArray,
  mapAccumArrayEffect: () => mapAccumArrayEffect,
  mapAccumEffect: () => mapAccumEffect,
  mapArray: () => mapArray,
  mapArrayEffect: () => mapArrayEffect,
  mapBoth: () => mapBoth3,
  mapEffect: () => mapEffect2,
  mapError: () => mapError5,
  merge: () => merge4,
  mergeAll: () => mergeAll4,
  mergeEffect: () => mergeEffect2,
  mergeLeft: () => mergeLeft,
  mergeResult: () => mergeResult,
  mergeRight: () => mergeRight,
  mkArrayBuffer: () => mkArrayBuffer,
  mkString: () => mkString,
  mkUint8Array: () => mkUint8Array2,
  never: () => never4,
  onEnd: () => onEnd2,
  onError: () => onError4,
  onExit: () => onExit4,
  onFirst: () => onFirst2,
  onStart: () => onStart2,
  orDie: () => orDie5,
  orElseIfEmpty: () => orElseIfEmpty2,
  orElseSucceed: () => orElseSucceed3,
  paginate: () => paginate,
  partition: () => partition4,
  partitionEffect: () => partitionEffect,
  partitionQueue: () => partitionQueue,
  peel: () => peel,
  pipeThrough: () => pipeThrough,
  pipeThroughChannel: () => pipeThroughChannel,
  pipeThroughChannelOrFail: () => pipeThroughChannelOrFail,
  prepend: () => prepend2,
  provide: () => provide6,
  provideContext: () => provideContext4,
  provideService: () => provideService4,
  provideServiceEffect: () => provideServiceEffect4,
  race: () => race3,
  raceAll: () => raceAll3,
  range: () => range2,
  rechunk: () => rechunk,
  repeat: () => repeat5,
  repeatElements: () => repeatElements,
  result: () => result3,
  retry: () => retry4,
  run: () => run,
  runCollect: () => runCollect,
  runCount: () => runCount,
  runDrain: () => runDrain2,
  runFold: () => runFold2,
  runFoldEffect: () => runFoldEffect2,
  runForEach: () => runForEach2,
  runForEachArray: () => runForEachArray,
  runForEachWhile: () => runForEachWhile2,
  runHead: () => runHead2,
  runIntoPubSub: () => runIntoPubSub,
  runIntoQueue: () => runIntoQueue,
  runLast: () => runLast2,
  runSum: () => runSum,
  scan: () => scan,
  scanEffect: () => scanEffect2,
  schedule: () => schedule3,
  scoped: () => scoped4,
  service: () => service3,
  serviceOption: () => serviceOption3,
  share: () => share,
  sliding: () => sliding2,
  slidingSize: () => slidingSize,
  split: () => split,
  splitLines: () => splitLines2,
  succeed: () => succeed8,
  suspend: () => suspend5,
  switchMap: () => switchMap2,
  sync: () => sync5,
  take: () => take5,
  takeRight: () => takeRight,
  takeUntil: () => takeUntil,
  takeUntilEffect: () => takeUntilEffect,
  takeWhile: () => takeWhile2,
  takeWhileEffect: () => takeWhileEffect,
  takeWhileFilter: () => takeWhileFilter,
  tap: () => tap4,
  tapBoth: () => tapBoth,
  tapCause: () => tapCause5,
  tapError: () => tapError5,
  tapSink: () => tapSink,
  throttle: () => throttle,
  throttleEffect: () => throttleEffect,
  tick: () => tick,
  timeout: () => timeout3,
  timeoutOrElse: () => timeoutOrElse3,
  toAsyncIterable: () => toAsyncIterable,
  toAsyncIterableEffect: () => toAsyncIterableEffect,
  toAsyncIterableWith: () => toAsyncIterableWith,
  toChannel: () => toChannel2,
  toPubSub: () => toPubSub,
  toPubSubTake: () => toPubSubTake2,
  toPull: () => toPull3,
  toQueue: () => toQueue,
  toReadableStream: () => toReadableStream,
  toReadableStreamEffect: () => toReadableStreamEffect,
  toReadableStreamWith: () => toReadableStreamWith,
  transduce: () => transduce,
  transformPull: () => transformPull2,
  transformPullBracket: () => transformPullBracket,
  unfold: () => unfold,
  unwrap: () => unwrap4,
  updateContext: () => updateContext4,
  updateService: () => updateService4,
  when: () => when3,
  withExecutionPlan: () => withExecutionPlan3,
  withSpan: () => withSpan5,
  zip: () => zip3,
  zipFlatten: () => zipFlatten,
  zipLatest: () => zipLatest,
  zipLatestAll: () => zipLatestAll,
  zipLatestWith: () => zipLatestWith,
  zipLeft: () => zipLeft,
  zipRight: () => zipRight,
  zipWith: () => zipWith4,
  zipWithArray: () => zipWithArray,
  zipWithIndex: () => zipWithIndex,
  zipWithNext: () => zipWithNext,
  zipWithPrevious: () => zipWithPrevious,
  zipWithPreviousAndNext: () => zipWithPreviousAndNext
});

// node_modules/effect/dist/MutableHashMap.js
var TypeId21 = "~effect/collections/MutableHashMap";
var MutableHashMapProto = {
  [TypeId21]: TypeId21,
  [Symbol.iterator]() {
    return this.backing[Symbol.iterator]();
  },
  toString() {
    return `MutableHashMap(${format(Array.from(this))})`;
  },
  toJSON() {
    return {
      _id: "MutableHashMap",
      values: toJson(Array.from(this))
    };
  },
  [NodeInspectSymbol]() {
    return this.toJSON();
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var empty7 = () => {
  const self = Object.create(MutableHashMapProto);
  self.backing = new Map;
  self.buckets = new Map;
  return self;
};
var get3 = /* @__PURE__ */ dual(2, (self, key) => {
  if (self.backing.has(key)) {
    return some2(self.backing.get(key));
  } else if (isSimpleKey(key)) {
    return none2();
  }
  const refKey = referentialKeysCache.get(self);
  if (refKey !== undefined) {
    return self.backing.has(refKey) ? some2(self.backing.get(refKey)) : none2();
  }
  const hash2 = hash(key);
  const bucket = self.buckets.get(hash2);
  if (bucket === undefined) {
    return none2();
  }
  return getFromBucket(self, bucket, key);
});
var referentialKeysCache = /* @__PURE__ */ new WeakMap;
var isSimpleKey = (u) => typeof u !== "object" && typeof u !== "function";
var getFromBucket = (self, bucket, key) => {
  for (let i = 0, len = bucket.length;i < len; i++) {
    if (equals(key, bucket[i])) {
      const refKey = bucket[i];
      referentialKeysCache.set(key, refKey);
      return some2(self.backing.get(refKey));
    }
  }
  return none2();
};
var has = /* @__PURE__ */ dual(2, (self, key) => isSome2(get3(self, key)));
var set2 = /* @__PURE__ */ dual(3, (self, key, value) => {
  if (self.backing.has(key) || isSimpleKey(key)) {
    self.backing.set(key, value);
    return self;
  }
  let refKey = referentialKeysCache.get(self);
  if (refKey !== undefined && self.backing.has(refKey)) {
    self.backing.set(refKey, value);
    return self;
  }
  const hash2 = hash(key);
  const bucket = self.buckets.get(hash2);
  if (bucket === undefined) {
    self.buckets.set(hash2, [key]);
    self.backing.set(key, value);
    return self;
  }
  refKey = getRefKey(bucket, key);
  if (refKey === undefined) {
    bucket.push(key);
    refKey = key;
  }
  self.backing.set(refKey, value);
  return self;
});
var getRefKey = (bucket, key) => {
  for (let i = 0, len = bucket.length;i < len; i++) {
    if (equals(key, bucket[i])) {
      referentialKeysCache.set(key, bucket[i]);
      return bucket[i];
    }
  }
};
var remove3 = /* @__PURE__ */ dual(2, (self, key_) => {
  if (isSimpleKey(key_)) {
    self.backing.delete(key_);
    return self;
  }
  const key = referentialKeysCache.get(self) ?? key_;
  const hash2 = hash(key);
  const bucket = self.buckets.get(hash2);
  if (bucket === undefined) {
    return self;
  }
  for (let i = 0, len = bucket.length;i < len; i++) {
    const bkey = bucket[i];
    if (bkey === key || equals(key, bkey)) {
      self.backing.delete(bkey);
      bucket.splice(i, 1);
      break;
    }
  }
  if (bucket.length === 0) {
    self.buckets.delete(hash2);
  }
  return self;
});
var clear2 = (self) => {
  self.backing.clear();
  self.buckets.clear();
  return self;
};
var size2 = (self) => self.backing.size;

// node_modules/effect/dist/RcMap.js
var TypeId22 = "~effect/RcMap";
var makeUnsafe7 = (options) => ({
  [TypeId22]: TypeId22,
  lookup: options.lookup,
  context: options.context,
  scope: options.scope,
  idleTimeToLive: options.idleTimeToLive,
  capacity: options.capacity,
  state: {
    _tag: "Open",
    map: empty7()
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
});
var make14 = (options) => withFiber2((fiber3) => {
  const context3 = fiber3.context;
  const scope3 = get(context3, Scope);
  const self = makeUnsafe7({
    lookup: options.lookup,
    context: context3,
    scope: scope3,
    idleTimeToLive: typeof options.idleTimeToLive === "function" ? flow(options.idleTimeToLive, fromInputUnsafe) : constant(fromInputUnsafe(options.idleTimeToLive ?? zero)),
    capacity: Math.max(options.capacity ?? Number.POSITIVE_INFINITY, 0)
  });
  return as2(addFinalizerExit(scope3, () => {
    if (self.state._tag === "Closed") {
      return void_3;
    }
    const map9 = self.state.map;
    self.state = {
      _tag: "Closed"
    };
    return forEach2(map9, ([, entry]) => exit2(close(entry.scope, void_2))).pipe(tap3(() => sync3(() => {
      clear2(map9);
    })));
  }), self);
});
var get4 = /* @__PURE__ */ dual(2, (self, key) => uninterruptibleMask2((restore) => {
  if (self.state._tag === "Closed") {
    return interrupt3;
  }
  const state = self.state;
  const parent = getCurrent();
  const o = get3(state.map, key);
  let entry;
  if (o._tag === "Some") {
    entry = o.value;
    entry.refCount++;
  } else if (Number.isFinite(self.capacity) && size2(self.state.map) >= self.capacity) {
    return fail6(new ExceededCapacityError2(`RcMap attempted to exceed capacity of ${self.capacity}`));
  } else {
    entry = {
      deferred: makeUnsafe2(),
      scope: makeUnsafe3(),
      idleTimeToLive: self.idleTimeToLive(key),
      finalizer: undefined,
      fiber: undefined,
      expiresAt: 0,
      refCount: 1
    };
    entry.finalizer = release(self, key, entry);
    set2(state.map, key, entry);
    const context3 = new Map(self.context.mapUnsafe);
    parent.context.mapUnsafe.forEach((value, key2) => {
      context3.set(key2, value);
    });
    context3.set(Scope.key, entry.scope);
    self.lookup(key).pipe(runForkWith2(makeUnsafe(context3)), runIn(entry.scope)).addObserver((exit3) => doneUnsafe(entry.deferred, exit3));
  }
  const scope3 = getUnsafe(parent.context, Scope);
  return addFinalizer2(scope3, entry.finalizer).pipe(andThen2(restore(_await(entry.deferred))));
}));
var release = (self, key, entry) => withFiber2((fiber3) => {
  entry.refCount--;
  if (entry.refCount > 0) {
    return void_3;
  } else if (self.state._tag === "Closed" || !has(self.state.map, key) || isZero(entry.idleTimeToLive)) {
    if (self.state._tag === "Open") {
      remove3(self.state.map, key);
    }
    return close(entry.scope, void_2);
  } else if (!isFinite(entry.idleTimeToLive)) {
    return void_3;
  }
  const clock = fiber3.getRef(Clock);
  entry.expiresAt = clock.currentTimeMillisUnsafe() + toMillis(entry.idleTimeToLive);
  if (entry.fiber)
    return void_3;
  entry.fiber = interruptibleMask2(function loop(restore) {
    const now = clock.currentTimeMillisUnsafe();
    const remaining = entry.expiresAt - now;
    if (remaining <= 0) {
      if (self.state._tag === "Closed" || entry.refCount > 0)
        return void_3;
      remove3(self.state.map, key);
      return restore(close(entry.scope, void_2));
    }
    return flatMap5(clock.sleep(millis(remaining)), () => loop(restore));
  }).pipe(ensuring2(sync3(() => {
    entry.fiber = undefined;
  })), runForkWith2(fiber3.context), runIn(self.scope));
  return void_3;
});
var touch = /* @__PURE__ */ dual(2, (self, key) => clockWith2((clock) => {
  if (self.state._tag === "Closed") {
    return void_3;
  }
  const o = get3(self.state.map, key);
  if (o._tag === "None" || isZero(o.value.idleTimeToLive)) {
    return void_3;
  }
  const entry = o.value;
  entry.expiresAt = clock.currentTimeMillisUnsafe() + toMillis(entry.idleTimeToLive);
  return void_3;
}));

// node_modules/effect/dist/internal/rcRef.js
var TypeId23 = "~effect/RcRef";
var stateEmpty = {
  _tag: "Empty"
};
var stateClosed = {
  _tag: "Closed"
};
var variance2 = {
  _A: identity,
  _E: identity
};

class RcRefImpl {
  [TypeId23] = variance2;
  pipe() {
    return pipeArguments(this, arguments);
  }
  state = stateEmpty;
  semaphore = /* @__PURE__ */ makeUnsafe6(1);
  acquire;
  context;
  scope;
  idleTimeToLive;
  constructor(acquire, context3, scope3, idleTimeToLive) {
    this.acquire = acquire;
    this.context = context3;
    this.scope = scope3;
    this.idleTimeToLive = idleTimeToLive;
  }
}
var make15 = (options) => withFiber2((fiber3) => {
  const context3 = fiber3.context;
  const scope3 = get(context3, Scope);
  const ref = new RcRefImpl(options.acquire, context3, scope3, options.idleTimeToLive ? fromInputUnsafe(options.idleTimeToLive) : undefined);
  return as2(addFinalizerExit(scope3, () => {
    const close2 = ref.state._tag === "Acquired" ? close(ref.state.scope, void_2) : void_3;
    ref.state = stateClosed;
    return close2;
  }), ref);
});
var getState = (self) => uninterruptibleMask2(function loop(restore) {
  switch (self.state._tag) {
    case "Closed": {
      return interrupt3;
    }
    case "Acquired": {
      self.state.refCount++;
      return self.state.fiber ? as2(interrupt4(self.state.fiber), self.state) : succeed6(self.state);
    }
    case "Empty": {
      const scope3 = makeUnsafe3();
      return self.semaphore.withPermit(suspend3(() => {
        if (self.state._tag !== "Empty") {
          return loop(restore);
        }
        return restore(provideContext2(self.acquire, add(self.context, Scope, scope3))).pipe(map7((value) => {
          const state = {
            _tag: "Acquired",
            value,
            scope: scope3,
            fiber: undefined,
            refCount: 1,
            invalidated: false
          };
          self.state = state;
          return state;
        }), onExit2((exit3) => isFailure4(exit3) ? close(scope3, exit3) : void_3));
      }));
    }
  }
});
var get5 = /* @__PURE__ */ fnUntraced2(function* (self_) {
  const self = self_;
  const state = yield* getState(self);
  const scope3 = yield* scope2;
  const isFinite2 = self.idleTimeToLive !== undefined && isFinite(self.idleTimeToLive);
  yield* addFinalizerExit(scope3, () => {
    state.refCount--;
    if (state.refCount > 0) {
      return void_3;
    }
    if (self.idleTimeToLive === undefined) {
      self.state = stateEmpty;
      return close(state.scope, void_2);
    } else if (state.invalidated) {
      return close(state.scope, void_2);
    } else if (!isFinite2) {
      return void_3;
    }
    state.fiber = sleep2(self.idleTimeToLive).pipe(flatMap5(() => {
      if (self.state._tag === "Acquired" && self.state.refCount === 0) {
        self.state = stateEmpty;
        return close(state.scope, void_2);
      }
      return void_3;
    }), ensuring2(sync3(() => {
      state.fiber = undefined;
    })), runForkWith2(self.context), runIn(self.scope));
    return void_3;
  });
  return state.value;
});

// node_modules/effect/dist/RcRef.js
var make16 = make15;
var get6 = get5;

// node_modules/effect/dist/Stream.js
var TypeId24 = "~effect/Stream";
var isStream = (u) => hasProperty(u, TypeId24);
var DefaultChunkSize2 = DefaultChunkSize;
var fromChannel3 = fromChannel;
var fromEffect2 = (effect2) => fromChannel3(fromEffect(map7(effect2, of)));
var service3 = (service4) => fromEffect2(service2(service4));
var serviceOption3 = (service4) => fromEffect2(serviceOption2(service4));
var fromEffectDrain2 = (effect2) => fromPull2(succeed6(flatMap5(effect2, () => done3())));
var fromEffectRepeat = (effect2) => fromPull2(succeed6(map7(effect2, of)));
var fromEffectSchedule = (effect2, schedule3) => fromPull2(gen2(function* () {
  const step = yield* toStepWithMetadata(schedule3);
  let s = yield* provideService2(effect2, CurrentMetadata2, CurrentMetadata2.defaultValue());
  let initial = true;
  const pull = suspend3(() => step(s)).pipe(flatMap5((meta) => provideService2(effect2, CurrentMetadata2, meta)), map7((next) => {
    s = next;
    return of(next);
  }));
  return suspend3(() => {
    if (initial) {
      initial = false;
      return succeed6(of(s));
    }
    return pull;
  });
}));
var tick = (interval) => fromPull2(sync3(() => {
  let first = true;
  const effect2 = succeed6(of(undefined));
  const delayed = delay2(effect2, interval);
  return suspend3(() => {
    if (first) {
      first = false;
      return effect2;
    }
    return delayed;
  });
}));
var fromPull2 = (pull) => fromChannel3(fromPull(pull));
var transformPull2 = (self, f) => fromChannel3(fromTransform((_, scope3) => flatMap5(toPullScoped(self.channel, scope3), (pull) => f(pull, scope3))));
var transformPullBracket = (self, f) => fromChannel3(fromTransformBracket((_, scope3, forkedScope) => flatMap5(toPullScoped(self.channel, scope3), (pull) => f(pull, scope3, forkedScope))));
var toChannel2 = (stream) => stream.channel;
var callback3 = (f, options) => fromChannel3(callbackArray(f, options));
var empty8 = /* @__PURE__ */ fromChannel3(empty6);
var succeed8 = (value) => fromChannel3(succeed7(of(value)));
var make17 = (...values) => fromArray2(values);
var sync5 = (evaluate2) => fromChannel3(sync4(() => of(evaluate2())));
var suspend5 = (stream) => fromChannel3(suspend4(() => stream().channel));
var fail9 = (error) => fromChannel3(fail7(error));
var failSync4 = (evaluate2) => fromChannel3(failSync3(evaluate2));
var failCause7 = (cause) => fromChannel3(failCause6(cause));
var die6 = (defect) => fromChannel3(die5(defect));
var failCauseSync4 = (evaluate2) => fromChannel3(failCauseSync3(evaluate2));
var fromIteratorSucceed = (iterator, maxChunkSize) => fromChannel3(fromIteratorArray(() => iterator, maxChunkSize));
var fromIterable3 = (iterable, options) => Array.isArray(iterable) && options?.chunkSize === undefined ? fromArray2(iterable) : fromChannel3(fromIterableArray(iterable, options?.chunkSize));
var fromIterableEffect = (iterable) => unwrap4(map7(iterable, fromIterable3));
var fromIterableEffectRepeat = (iterable) => flatMap7(fromEffectRepeat(iterable), fromIterable3);
var fromArray2 = (array2) => isReadonlyArrayNonEmpty(array2) ? fromChannel3(succeed7(array2)) : empty8;
var fromArrayEffect = (effect2) => unwrap4(map7(effect2, fromArray2));
var fromArrays = (...arrays) => fromChannel3(fromArray(filter3(arrays, isReadonlyArrayNonEmpty)));
var fromQueue = (queue) => fromChannel3(fromQueueArray(queue));
var fromPubSub = (pubsub) => fromChannel3(fromPubSubArray(pubsub));
var fromPubSubTake2 = (pubsub) => fromChannel3(fromPubSubTake(pubsub));
var fromReadableStream2 = (options) => fromChannel3(fromReadableStream(options));
var fromAsyncIterable2 = (iterable, onError4) => fromChannel3(fromAsyncIterableArray(iterable, onError4));
var fromSchedule = (schedule3) => fromPull2(map7(toStepWithSleep(schedule3), (step) => catchDone(map7(step(undefined), of), () => done3())));
var fromSubscription = (pubsub) => fromChannel3(fromSubscriptionArray(pubsub));
var fromEventListener = (target, type, options) => callback3((queue) => {
  function emit(event) {
    offerUnsafe(queue, event);
  }
  return acquireRelease2(sync3(() => target.addEventListener(type, emit, options)), () => sync3(() => target.removeEventListener(type, emit, options)));
}, {
  bufferSize: typeof options === "object" ? options.bufferSize : undefined
});
var unfold = (s, f) => fromPull2(sync3(() => {
  let state = s;
  return flatMap5(suspend3(() => f(state)), (next) => {
    if (next === undefined)
      return done3();
    state = next[1];
    return succeed6(of(next[0]));
  });
}));
var paginate = (s, f) => fromPull2(sync3(() => {
  let state = s;
  let done4 = false;
  return suspend3(function loop() {
    if (done4)
      return done3();
    return flatMap5(f(state), ([a, s2]) => {
      if (isNone2(s2)) {
        done4 = true;
      } else {
        state = s2.value;
      }
      if (!isReadonlyArrayNonEmpty(a))
        return loop();
      return succeed6(a);
    });
  });
}));
var iterate = (value, next) => unfold(value, (a) => succeed6([a, next(a)]));
var range2 = (min3, max3, chunkSize = DefaultChunkSize) => min3 > max3 ? empty8 : fromPull2(sync3(() => {
  const size3 = Math.max(1, chunkSize);
  let start = min3;
  let done4 = false;
  return suspend3(() => {
    if (done4)
      return done3();
    const remaining = max3 - start + 1;
    if (remaining > size3) {
      const chunk2 = range(start, start + size3 - 1);
      start += size3;
      return succeed6(chunk2);
    }
    const chunk = range(start, start + remaining - 1);
    done4 = true;
    return succeed6(chunk);
  });
}));
var never4 = /* @__PURE__ */ fromChannel3(never3);
var unwrap4 = (effect2) => fromChannel3(unwrap2(map7(effect2, toChannel2)));
var scoped4 = (self) => fromChannel3(scoped3(self.channel));
var map9 = /* @__PURE__ */ dual(2, (self, f) => suspend5(() => {
  let i = 0;
  return fromChannel3(map8(self.channel, map4((o) => f(o, i++))));
}));
var mapBoth3 = /* @__PURE__ */ dual(2, (self, options) => self.pipe(map9(options.onSuccess), mapError5(options.onFailure)));
var mapArray = /* @__PURE__ */ dual(2, (self, f) => fromChannel3(map8(self.channel, f)));
var mapEffect2 = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, f, options) => self.channel.pipe(flattenArray, mapEffect(f, options), map8(of), fromChannel3));
var flattenEffect = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, options) => mapEffect2(self, identity, options));
var mapArrayEffect = /* @__PURE__ */ dual(2, (self, f) => fromChannel3(mapEffect(self.channel, f)));
var result3 = (self) => self.pipe(map9(succeed2), catch_5((e) => succeed8(fail2(e))));
var tap4 = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, f, options) => mapEffect2(self, (a) => as2(f(a), a), options));
var tapBoth = /* @__PURE__ */ dual(2, (self, options) => self.pipe(tapError5(options.onError), tap4(options.onElement, {
  concurrency: options.concurrency
})));
var tapSink = /* @__PURE__ */ dual(2, (self, sink) => transformPullBracket(self, fnUntraced2(function* (pull, _, scope3) {
  const upstreamLatch = makeUnsafe5();
  const sinkLatch = makeUnsafe5();
  let chunk = undefined;
  let causeSink = undefined;
  let sinkDone = false;
  let streamDone = false;
  const sinkUpstream = upstreamLatch.whenOpen(suspend3(() => {
    if (chunk) {
      const arr = chunk;
      chunk = undefined;
      if (!streamDone)
        upstreamLatch.closeUnsafe();
      return as2(sinkLatch.open, arr);
    }
    return done3();
  }));
  yield* suspend3(() => sink.transform(sinkUpstream, scope3)).pipe((eff) => onExitPrimitive2(eff, (exit3) => {
    sinkDone = true;
    if (isFailure4(exit3)) {
      causeSink = exit3.cause;
    }
    return sinkLatch.open;
  }, true), forkIn2(scope3));
  const pullAndOffer = pull.pipe(flatMap5((chunk_) => {
    chunk = chunk_;
    sinkLatch.closeUnsafe();
    upstreamLatch.openUnsafe();
    return as2(sinkLatch.await, chunk_);
  }), catchDone(() => {
    streamDone = true;
    sinkLatch.closeUnsafe();
    upstreamLatch.openUnsafe();
    return flatMap5(sinkLatch.await, () => done3());
  }));
  return suspend3(() => {
    if (causeSink) {
      return failCause4(causeSink);
    } else if (sinkDone) {
      return pull;
    }
    return pullAndOffer;
  });
})));
var flatMap7 = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, f, options) => self.channel.pipe(flattenArray, flatMap6((a) => f(a).channel, options), fromChannel3));
var switchMap2 = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, f, options) => self.channel.pipe(flattenArray, switchMap((a) => f(a).channel, options), fromChannel3));
var flatten6 = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, options) => flatMap7(self, identity, options));
var flattenArray2 = (self) => fromChannel3(flattenArray(self.channel));
var drain3 = (self) => fromChannel3(drain(self.channel));
var drainFork = /* @__PURE__ */ dual(2, (self, that) => mergeEffect2(self, runDrain2(that)));
var repeat5 = /* @__PURE__ */ dual(2, (self, schedule3) => fromChannel3(repeat4(self.channel, schedule3)));
var schedule3 = /* @__PURE__ */ dual(2, (self, schedule4) => self.channel.pipe(flattenArray, schedule2(schedule4), map8(of), fromChannel3));
var timeout3 = /* @__PURE__ */ dual(2, (self, duration) => timeoutOrElse3(self, {
  duration,
  orElse: () => empty8
}));
var timeoutOrElse3 = /* @__PURE__ */ dual(2, (self, options) => {
  const duration = fromInputUnsafe(options.duration);
  if (!isFinite(duration))
    return self;
  if (isZero(duration))
    return suspend5(options.orElse);
  const timeoutSymbol = Symbol();
  return catchCause5(suspend5(() => {
    const parent = getCurrent();
    const clock = parent.getRef(Clock);
    const durationMs = toMillis(duration);
    let deadline = undefined;
    const latch = makeUnsafe5(false);
    return merge4(transformPull2(self, (pull, _scope) => suspend3(() => {
      deadline = clock.currentTimeMillisUnsafe() + durationMs;
      latch.openUnsafe();
      return pull;
    }).pipe(map7((arr) => {
      latch.closeUnsafe();
      deadline = undefined;
      return arr;
    }), succeed6)), fromEffectDrain2(gen2(function* () {
      while (true) {
        yield* latch.await;
        if (deadline === undefined)
          continue;
        yield* sleep2(deadline - clock.currentTimeMillisUnsafe());
        if (deadline === undefined)
          continue;
        const remaining = deadline - clock.currentTimeMillisUnsafe();
        if (remaining > 0)
          continue;
        return yield* die4(timeoutSymbol);
      }
    })), {
      haltStrategy: "left"
    });
  }), (cause) => {
    const isTimeout = cause.reasons.find((r) => r._tag === "Die" && r.defect === timeoutSymbol);
    if (isTimeout)
      return options.orElse();
    return failCause7(cause);
  });
});
var repeatElements = /* @__PURE__ */ dual(2, (self, schedule4) => fromChannel3(fromTransform((upstream, scope3) => map7(toTransform(flattenArray(self.channel))(upstream, scope3), (pullElement) => {
  let pullRepeat = undefined;
  const pull = gen2(function* () {
    const element = yield* pullElement;
    const chunk = of(element);
    const step = yield* toStepWithSleep(schedule4);
    pullRepeat = step(element).pipe(as2(chunk), catchDone((_) => {
      pullRepeat = undefined;
      return pull;
    }));
    return chunk;
  });
  return suspend3(() => pullRepeat ?? pull);
}))));
var forever6 = (self) => fromChannel3(forever5(self.channel));
var flattenIterable = (self) => flatMap7(self, fromIterable3);
var flattenTake2 = (self) => self.channel.pipe(flattenArray, flattenTake, fromChannel3);
var concat = /* @__PURE__ */ dual(2, (self, that) => flatten6(fromArray2([self, that])));
var prepend2 = /* @__PURE__ */ dual(2, (self, values) => concat(fromIterable3(values), self));
var merge4 = /* @__PURE__ */ dual((args2) => isStream(args2[0]) && isStream(args2[1]), (self, that, options) => fromChannel3(merge3(toChannel2(self), toChannel2(that), options)));
var mergeEffect2 = /* @__PURE__ */ dual(2, (self, effect2) => self.channel.pipe(mergeEffect(effect2), fromChannel3));
var mergeResult = /* @__PURE__ */ dual(2, (self, that) => merge4(map9(self, succeed2), map9(that, fail2)));
var mergeLeft = /* @__PURE__ */ dual(2, (left, right) => mergeEffect2(left, runDrain2(right)));
var mergeRight = /* @__PURE__ */ dual(2, (left, right) => mergeEffect2(right, runDrain2(left)));
var mergeAll4 = /* @__PURE__ */ dual(2, (streams, options) => flatten6(fromIterable3(streams), options));
var cross = /* @__PURE__ */ dual(2, (left, right) => crossWith(left, right, (l, r) => [l, r]));
var crossWith = /* @__PURE__ */ dual(3, (left, right, f) => flatMap7(left, (l) => map9(right, (r) => f(l, r))));
var zipWith4 = /* @__PURE__ */ dual(3, (left, right, f) => zipWithArray(left, right, zipArrays(f)));
var zipArrays = (f) => (leftArr, rightArr) => {
  const minLength = Math.min(leftArr.length, rightArr.length);
  const result4 = [];
  for (let i = 0;i < minLength; i++) {
    result4.push(f(leftArr[i], rightArr[i]));
  }
  return [result4, leftArr.slice(minLength), rightArr.slice(minLength)];
};
var zipWithArray = /* @__PURE__ */ dual(3, (left, right, f) => fromChannel3(fromTransformBracket(fnUntraced2(function* (_, scope3) {
  const pullLeft = yield* toPullScoped(left.channel, scope3);
  const pullRight = yield* toPullScoped(right.channel, scope3);
  const pullBoth = gen2(function* () {
    const fiberLeft = yield* forkIn2(pullLeft, scope3);
    const fiberRight = yield* forkIn2(pullRight, scope3);
    return yield* joinAll([fiberLeft, fiberRight]);
  });
  let state = {
    _tag: "PullBoth"
  };
  const pull = gen2(function* () {
    const [left2, right2] = state._tag === "PullBoth" ? yield* pullBoth : state._tag === "PullLeft" ? [yield* pullLeft, state.rightArray] : [state.leftArray, yield* pullRight];
    const result4 = f(left2, right2);
    if (isReadonlyArrayNonEmpty(result4[1])) {
      state = {
        _tag: "PullRight",
        leftArray: result4[1]
      };
    } else if (isReadonlyArrayNonEmpty(result4[2])) {
      state = {
        _tag: "PullLeft",
        rightArray: result4[2]
      };
    } else {
      state = {
        _tag: "PullBoth"
      };
    }
    return result4[0];
  });
  return pull;
}))));
var zip3 = /* @__PURE__ */ dual(2, (self, that) => zipWith4(self, that, (a, a2) => [a, a2]));
var zipLeft = /* @__PURE__ */ dual(2, (left, right) => zipWithArray(left, right, (leftArr, rightArr) => {
  const minLength = Math.min(leftArr.length, rightArr.length);
  const output = leftArr.slice(0, minLength);
  const leftoverLeft = leftArr.slice(minLength);
  const leftoverRight = rightArr.slice(minLength);
  return [output, leftoverLeft, leftoverRight];
}));
var zipRight = /* @__PURE__ */ dual(2, (left, right) => zipWithArray(left, right, (leftArr, rightArr) => {
  const minLength = Math.min(leftArr.length, rightArr.length);
  const output = rightArr.slice(0, minLength);
  const leftoverLeft = leftArr.slice(minLength);
  const leftoverRight = rightArr.slice(minLength);
  return [output, leftoverLeft, leftoverRight];
}));
var zipFlatten = /* @__PURE__ */ dual(2, (self, that) => zipWith4(self, that, (a, a2) => [...a, a2]));
var zipWithIndex = (self) => map9(self, (a, i) => [a, i]);
var zipWithNext = (self) => mapAccumArray(self, none2, (acc, arr) => {
  let i = 0;
  if (acc._tag === "None") {
    i = 1;
    acc = some2(arr[0]);
  }
  const pairs = empty2();
  for (;i < arr.length; i++) {
    const value = acc.value;
    acc = some2(arr[i]);
    pairs.push([value, acc]);
  }
  return [acc, pairs];
}, {
  onHalt(state) {
    return state._tag === "Some" ? [[state.value, none2()]] : [];
  }
});
var zipWithPrevious = (self) => mapAccumArray(self, none2, (acc, arr) => {
  const pairs = empty2();
  for (let i = 0;i < arr.length; i++) {
    const value = arr[i];
    pairs.push([acc, value]);
    acc = some2(arr[i]);
  }
  return [acc, pairs];
});
var zipWithPreviousAndNext = (self) => mapAccumArray(self, () => ({
  prev: none2(),
  current: none2()
}), (acc, arr) => {
  let i = 0;
  let current;
  if (acc.current._tag === "None") {
    i = 1;
    current = arr[0];
    acc.current = some2(current);
  } else {
    current = acc.current.value;
  }
  const pairs = empty2();
  for (;i < arr.length; i++) {
    const element = arr[i];
    acc.current = some2(element);
    pairs.push([acc.prev, current, acc.current]);
    acc.prev = some2(current);
    current = element;
  }
  return [acc, pairs];
}, {
  onHalt(acc) {
    return acc.current._tag === "Some" ? [[acc.prev, acc.current.value, none2()]] : [];
  }
});
var zipLatestAll = (...streams) => fromChannel3(suspend4(() => {
  const latest = [];
  const emitted = new Set;
  const readyLatch = makeUnsafe5();
  return mergeAll3(fromArray(streams.map((s, i) => s.channel.pipe(flattenArray, mapEffect((a) => {
    latest[i] = a;
    if (!emitted.has(i)) {
      emitted.add(i);
      if (emitted.size < streams.length) {
        return readyLatch.await;
      }
      return as2(readyLatch.open, of(latest.slice()));
    }
    return succeed6(of(latest.slice()));
  }), filter7(isNotUndefined)))), {
    concurrency: "unbounded",
    bufferSize: 0
  });
}));
var zipLatest = /* @__PURE__ */ dual(2, (left, right) => zipLatestAll(left, right));
var zipLatestWith = /* @__PURE__ */ dual(3, (left, right, f) => map9(zipLatestAll(left, right), ([a, a2]) => f(a, a2)));
var raceAll3 = (...streams) => fromChannel3(fromTransform((_, scope3) => sync3(() => {
  let winner;
  const race3 = raceAll2(streams.map((stream) => {
    const childScope = forkUnsafe2(scope3);
    return toPullScoped(stream.channel, childScope).pipe(flatMap5((pull) => zip2(succeed6(pull), pull)), onExit2((exit3) => {
      if (exit3._tag === "Success") {
        if (winner) {
          return close(childScope, exit3);
        }
        winner = exit3.value[0];
        return void_3;
      }
      return close(childScope, exit3);
    }), map7(([, chunk]) => chunk));
  }));
  return suspend3(() => winner ?? race3);
})));
var race3 = /* @__PURE__ */ dual(2, (left, right) => raceAll3(left, right));
var filter8 = /* @__PURE__ */ dual(2, (self, predicate) => fromChannel3(filterArray(toChannel2(self), predicate)));
var filterMap3 = /* @__PURE__ */ dual(2, (self, filter9) => fromChannel3(filterMapArray(toChannel2(self), filter9)));
var filterEffect = /* @__PURE__ */ dual(2, (self, predicate) => fromChannel3(filterArrayEffect(toChannel2(self), predicate)));
var filterMapEffect3 = /* @__PURE__ */ dual(2, (self, filter9) => fromChannel3(filterMapArrayEffect(toChannel2(self), filter9)));
var partitionQueue = /* @__PURE__ */ dual((args2) => isStream(args2[0]), /* @__PURE__ */ fnUntraced2(function* (self, filter9, options) {
  const scope3 = yield* scope2;
  const pull = yield* toPullScoped(self.channel, scope3);
  const capacity = options?.capacity === "unbounded" ? undefined : options?.capacity ?? DefaultChunkSize2;
  const passes = yield* make13({
    capacity
  });
  const fails = yield* make13({
    capacity
  });
  yield* gen2(function* () {
    while (true) {
      const chunk = yield* pull;
      const excluded = [];
      const satisfying = [];
      for (let i = 0;i < chunk.length; i++) {
        const result4 = filter9(chunk[i]);
        if (isFailure2(result4)) {
          excluded.push(result4.failure);
        } else {
          satisfying.push(result4.success);
        }
      }
      let passFiber = undefined;
      if (satisfying.length > 0) {
        const leftover = offerAllUnsafe(passes, satisfying);
        if (leftover.length > 0) {
          passFiber = yield* forkChild2(offerAll(passes, leftover));
        }
      }
      if (excluded.length > 0) {
        const leftover = offerAllUnsafe(fails, excluded);
        if (leftover.length > 0) {
          yield* offerAll(fails, leftover);
        }
      }
      if (passFiber)
        yield* join2(passFiber);
    }
  }).pipe(onError2((cause) => {
    failCauseUnsafe(passes, cause);
    failCauseUnsafe(fails, cause);
    return void_3;
  }), forkIn2(scope3));
  return [passes, fails];
}));
var partitionEffect = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, filter9, options) => map7(partitionQueue(mapEffect2(self, (a) => filter9(a), options), (result4) => result4, options), ([passes, fails]) => [fromQueue(passes), fromQueue(fails)]));
var partition4 = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, filter9, options) => map7(partitionQueue(self, filter9, {
  capacity: options?.bufferSize ?? 16
}), ([passes, fails]) => [fromQueue(fails), fromQueue(passes)]));
var when3 = /* @__PURE__ */ dual(2, (self, test) => test.pipe(map7((pass) => pass ? self : empty8), unwrap4));
var peel = /* @__PURE__ */ dual(2, /* @__PURE__ */ fnUntraced2(function* (self, sink) {
  let cause = undefined;
  const originalPull = yield* toPull2(self.channel);
  const pull = catchCause3(originalPull, (cause_) => {
    cause = cause_;
    return failCause4(cause_);
  });
  let stream = fromPull2(succeed6(pull));
  const leftover = yield* run(stream, sink);
  if (cause)
    return [leftover, empty8];
  stream = fromPull2(succeed6(originalPull));
  return [leftover, stream];
}));
var buffer2 = /* @__PURE__ */ dual(2, (self, options) => fromChannel3(bufferArray(self.channel, options)));
var bufferArray2 = /* @__PURE__ */ dual(2, (self, options) => fromChannel3(buffer(self.channel, options)));
var catchCause5 = /* @__PURE__ */ dual(2, (self, f) => self.channel.pipe(catchCause4((cause) => f(cause).channel), fromChannel3));
var tapCause5 = /* @__PURE__ */ dual(2, (self, f) => self.channel.pipe(tapCause4(f), fromChannel3));
var catch_5 = /* @__PURE__ */ dual(2, (self, f) => fromChannel3(catch_4(self.channel, (error) => f(error).channel)));
var tapError5 = /* @__PURE__ */ dual(2, (self, f) => self.channel.pipe(tapError4(f), fromChannel3));
var catchIf4 = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, predicate, f, orElse) => fromChannel3(catchIf3(toChannel2(self), predicate, (e) => f(e).channel, orElse && ((e) => orElse(e).channel))));
var catchFilter4 = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, filter9, f, orElse) => fromChannel3(catchFilter3(toChannel2(self), filter9, (e) => f(e).channel, orElse && ((e) => orElse(e).channel))));
var catchTag4 = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, k, f, orElse) => {
  const pred = Array.isArray(k) ? (e) => hasProperty(e, "_tag") && k.includes(e._tag) : isTagged(k);
  return catchIf4(self, pred, f, orElse);
});
var catchTags3 = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, cases, orElse) => {
  let keys3;
  return catchFilter4(self, (e) => {
    keys3 ??= Object.keys(cases);
    return hasProperty(e, "_tag") && isString2(e["_tag"]) && keys3.includes(e["_tag"]) ? succeed2(e) : fail2(e);
  }, (e) => cases[e["_tag"]](e), orElse);
});
var catchReason4 = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, errorTag, reasonTag, f, orElse) => fromChannel3(catchReason3(toChannel2(self), errorTag, reasonTag, (reason, error) => f(reason, error).channel, orElse && ((reason, error) => orElse(reason, error).channel))));
var catchReasons4 = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, errorTag, cases, orElse) => {
  const handlers = Object.create(null);
  for (const key of Object.keys(cases)) {
    const handler = cases[key];
    handlers[key] = (reason, error) => handler(reason, error).channel;
  }
  const orElseHandler = orElse && ((reason, error) => orElse(reason, error).channel);
  return fromChannel3(catchReasons3(self.channel, errorTag, handlers, orElseHandler));
});
var mapError5 = /* @__PURE__ */ dual(2, (self, f) => fromChannel3(mapError4(self.channel, f)));
var catchCauseIf4 = /* @__PURE__ */ dual(3, (self, predicate, f) => fromChannel3(catchCauseIf3(self.channel, predicate, (cause) => f(cause).channel)));
var catchCauseFilter4 = /* @__PURE__ */ dual(3, (self, filter9, f) => fromChannel3(catchCauseFilter3(self.channel, filter9, (failure, cause) => f(failure, cause).channel)));
var orElseIfEmpty2 = /* @__PURE__ */ dual(2, (self, orElse) => fromChannel3(orElseIfEmpty(self.channel, (_) => toChannel2(orElse()))));
var orElseSucceed3 = /* @__PURE__ */ dual(2, (self, f) => catch_5(self, (e) => succeed8(f(e))));
var orDie5 = (self) => fromChannel3(orDie4(self.channel));
var ignore4 = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, options) => fromChannel3(ignore3(self.channel, options)));
var ignoreCause4 = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, options) => fromChannel3(ignoreCause3(self.channel, options)));
var retry4 = /* @__PURE__ */ dual(2, (self, policy) => fromChannel3(retry3(self.channel, policy)));
var retryWithoutReset = (self, schedule4) => unwrap4(map7(toStepWithMetadata(schedule4), (step) => {
  let meta = CurrentMetadata2.defaultValue();
  const loop = () => catch_5(provideServiceEffect4(self, CurrentMetadata2, sync3(() => meta)), (error) => unwrap4(catchDone(map7(step(error), (meta_) => {
    meta = meta_;
    return unwrap4(as2(yieldNow2, loop()));
  }), () => succeed6(fail9(error)))));
  return loop();
}));
var withExecutionPlan3 = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, policy, options) => suspend5(() => {
  const preventFallbackOnPartialStream = options?.preventFallbackOnPartialStream ?? false;
  let i = 0;
  let meta = {
    attempt: 0,
    stepIndex: 0
  };
  const provideMeta = provideServiceEffect4(CurrentMetadata, sync3(() => {
    meta = {
      attempt: meta.attempt + 1,
      stepIndex: i
    };
    return meta;
  }));
  const emitter = options?.onEvent === undefined ? undefined : makeEventEmitter(options.onEvent, () => meta);
  let attemptState;
  const instrument = emitter === undefined ? identity : (attempt) => onExit4(onStart2(attempt, map7(emitter.begin, (state) => {
    attemptState = state;
  })), (exit3) => suspend3(() => {
    if (attemptState === undefined)
      return void_3;
    const state = attemptState;
    attemptState = undefined;
    return emitter.end(state, exit3);
  }));
  let lastError = none2();
  const loop = suspend5(() => {
    const step = policy.steps[i];
    if (!step) {
      return fail9(getOrThrow(lastError));
    }
    let nextStream = provideMeta(instrument(provide6(self, step.provide)));
    let receivedElements = false;
    if (isSome2(lastError)) {
      const error = lastError.value;
      let attempted = false;
      const wrapped = nextStream;
      nextStream = suspend5(() => {
        if (attempted)
          return wrapped;
        attempted = true;
        return fail9(error);
      });
      nextStream = retryWithoutReset(nextStream, scheduleFromStep(step, false));
    } else {
      const schedule4 = scheduleFromStep(step, true);
      nextStream = schedule4 ? retryWithoutReset(nextStream, schedule4) : nextStream;
    }
    return catch_5(preventFallbackOnPartialStream ? onFirst2(nextStream, (_) => {
      receivedElements = true;
      return void_3;
    }) : nextStream, (error) => {
      i++;
      if (preventFallbackOnPartialStream && receivedElements) {
        return fail9(error);
      }
      lastError = some2(error);
      return loop;
    });
  });
  return loop;
}));
var take5 = /* @__PURE__ */ dual(2, (self, n) => n < 1 ? empty8 : takeUntil(self, (_, i) => i === n - 1));
var limitBytes = /* @__PURE__ */ dual(3, (self, bytes, onLimitReached) => suspend5(() => {
  const limit = BigInt(bytes);
  let size3 = BigInt(0);
  let limitReached = false;
  return concat(takeWhile2(self, (chunk) => {
    const nextSize = size3 + BigInt(chunk.length);
    if (nextSize > limit) {
      limitReached = true;
      return false;
    }
    size3 = nextSize;
    return true;
  }), suspend5(() => limitReached ? onLimitReached() : empty8));
}));
var takeRight = /* @__PURE__ */ dual(2, (self, n) => mapAccumArray(self, make11, (list, arr) => {
  appendAll2(list, arr);
  if (list.length > n) {
    takeNVoid(list, list.length - n);
  }
  return [list, emptyArr];
}, {
  onHalt(list) {
    return takeAll(list);
  }
}));
var takeUntil = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, predicate, options) => transformPull2(self, (pull, _scope) => sync3(() => {
  let i = 0;
  let done4 = false;
  const pump = flatMap5(suspend3(() => done4 ? done3() : pull), (chunk) => {
    const index = chunk.findIndex((a) => predicate(a, i++));
    if (index >= 0) {
      done4 = true;
      const arr = chunk.slice(0, options?.excludeLast ? index : index + 1);
      return isReadonlyArrayNonEmpty(arr) ? succeed6(arr) : done3();
    }
    return succeed6(chunk);
  });
  return pump;
})));
var takeUntilEffect = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, predicate, options) => transformPull2(self, (pull, _scope) => sync3(() => {
  let i = 0;
  let done4 = false;
  return gen2(function* () {
    if (done4)
      return yield* done3();
    const chunk = yield* pull;
    for (let j = 0;j < chunk.length; j++) {
      if (yield* predicate(chunk[j], i++)) {
        done4 = true;
        const arr = chunk.slice(0, options?.excludeLast ? j : j + 1);
        return isReadonlyArrayNonEmpty(arr) ? arr : yield* done3();
      }
    }
    return chunk;
  });
})));
var takeWhile2 = /* @__PURE__ */ dual(2, (self, predicate) => transformPull2(self, (pull, _scope) => sync3(() => {
  let i = 0;
  let done4 = false;
  const pump = flatMap5(suspend3(() => done4 ? done3() : pull), (chunk) => {
    const out = [];
    for (let j = 0;j < chunk.length; j++) {
      if (!predicate(chunk[j], i++)) {
        done4 = true;
        break;
      }
      out.push(chunk[j]);
    }
    return isReadonlyArrayNonEmpty(out) ? succeed6(out) : done4 ? done3() : pump;
  });
  return pump;
})));
var takeWhileFilter = /* @__PURE__ */ dual(2, (self, filter9) => transformPull2(self, (pull, _scope) => sync3(() => {
  let done4 = false;
  const pump = flatMap5(suspend3(() => done4 ? done3() : pull), (chunk) => {
    const out = [];
    for (let j = 0;j < chunk.length; j++) {
      const result4 = filter9(chunk[j]);
      if (isFailure2(result4)) {
        done4 = true;
        break;
      }
      out.push(result4.success);
    }
    return isReadonlyArrayNonEmpty(out) ? succeed6(out) : done4 ? done3() : pump;
  });
  return pump;
})));
var takeWhileEffect = /* @__PURE__ */ dual(2, (self, predicate) => takeUntilEffect(self, (a, n) => map7(predicate(a, n), (b) => !b), {
  excludeLast: true
}));
var drop = /* @__PURE__ */ dual(2, (self, n) => transformPull2(self, (pull, _scope) => sync3(() => {
  let dropped = 0;
  const pump = pull.pipe(flatMap5((chunk) => {
    if (dropped >= n)
      return succeed6(chunk);
    dropped += chunk.length;
    if (dropped <= n)
      return pump;
    return succeed6(chunk.slice(n - dropped));
  }));
  return pump;
})));
var dropUntil = /* @__PURE__ */ dual(2, (self, predicate) => drop(dropWhile(self, (a, i) => !predicate(a, i)), 1));
var dropUntilEffect = /* @__PURE__ */ dual(2, (self, predicate) => drop(dropWhileEffect(self, (a, i) => map7(predicate(a, i), (b) => !b)), 1));
var dropWhile = /* @__PURE__ */ dual(2, (self, predicate) => transformPull2(self, (pull, _scope) => sync3(() => {
  let dropping2 = true;
  let index = 0;
  const filtered = flatMap5(pull, (arr) => {
    const found = arr.findIndex((a) => !predicate(a, index++));
    if (found === -1)
      return filtered;
    dropping2 = false;
    return succeed6(arr.slice(found));
  });
  return suspend3(() => dropping2 ? filtered : pull);
})));
var dropWhileFilter = /* @__PURE__ */ dual(2, (self, filter9) => transformPull2(self, (pull, _scope) => sync3(() => {
  let dropping2 = true;
  const filtered = flatMap5(pull, (arr) => {
    const found = arr.findIndex((a) => isFailure2(filter9(a)));
    if (found === -1)
      return filtered;
    dropping2 = false;
    return succeed6(arr.slice(found));
  });
  return suspend3(() => dropping2 ? filtered : pull);
})));
var dropWhileEffect = /* @__PURE__ */ dual(2, (self, predicate) => transformPull2(self, (pull, _scope) => sync3(() => {
  let dropping2 = true;
  let index = 0;
  const filtered = gen2(function* () {
    while (true) {
      const arr = yield* pull;
      for (let i = 0;i < arr.length; i++) {
        const drop2 = yield* predicate(arr[i], index++);
        if (drop2)
          continue;
        dropping2 = false;
        return arr.slice(i);
      }
    }
  });
  return suspend3(() => dropping2 ? filtered : pull);
})));
var dropRight = /* @__PURE__ */ dual(2, (self, n) => {
  if (n <= 0)
    return self;
  return transformPull2(self, (pull, _scope) => sync3(() => {
    const list = make11();
    const emit = flatMap5(pull, (arr) => {
      appendAllUnsafe(list, arr);
      const toTake = list.length - n;
      const items = takeN(list, toTake);
      return isArrayNonEmpty2(items) ? succeed6(items) : emit;
    });
    return emit;
  }));
});
var chunks = (self) => self.channel.pipe(map8(of), fromChannel3);
var rechunk = /* @__PURE__ */ dual(2, (self, target) => {
  target = Math.max(1, target);
  return transformPull2(self, (pull, _scope) => sync3(() => {
    let chunk = empty2();
    let index = 0;
    let current;
    let done4 = false;
    return suspend3(function loop() {
      if (done4)
        return done3();
      else if (current === undefined) {
        return flatMap5(pull, (arr) => {
          if (chunk.length === 0 && arr.length === target) {
            return succeed6(arr);
          } else if (chunk.length + arr.length < target) {
            chunk.push(...arr);
            return loop();
          }
          current = arr;
          return loop();
        });
      }
      for (;index < current.length; ) {
        chunk.push(current[index++]);
        if (chunk.length === target) {
          const result4 = chunk;
          chunk = [];
          return succeed6(result4);
        }
      }
      index = 0;
      current = undefined;
      return loop();
    }).pipe(catchDone(() => {
      if (chunk.length === 0)
        return done3();
      const result4 = chunk;
      done4 = true;
      chunk = [];
      return succeed6(result4);
    }));
  }));
});
var sliding2 = /* @__PURE__ */ dual(2, (self, chunkSize) => slidingSize(self, chunkSize, 1));
var slidingSize = /* @__PURE__ */ dual(3, (self, chunkSize, stepSize) => transformPull2(self, (upstream, _scope) => sync3(() => {
  let cause = null;
  const list = make11();
  let emitted = false;
  let skip = 0;
  const pull = matchCauseEffect2(upstream, {
    onSuccess(arr) {
      appendAllUnsafe(list, arr);
      if (skip > 0) {
        const length = list.length;
        takeNVoid(list, skip);
        skip = Math.max(0, skip - length);
      }
      if (list.length < chunkSize)
        return pull;
      emitted = true;
      const chunks2 = [];
      while (list.length >= chunkSize) {
        if (chunkSize === stepSize) {
          chunks2.push(takeN(list, chunkSize));
        } else {
          chunks2.push(toArrayN(list, chunkSize));
          if (chunkSize === 1 && stepSize <= 0) {
            take(list);
          } else {
            const length = list.length;
            takeNVoid(list, stepSize);
            skip = Math.max(0, stepSize - length);
          }
        }
      }
      return succeed6(chunks2);
    },
    onFailure(cause_) {
      if (emitted)
        takeNVoid(list, chunkSize - stepSize);
      if (list.length === 0)
        return failCause4(cause_);
      cause = cause_;
      return succeed6(of(takeAll(list)));
    }
  });
  return suspend3(() => cause ? failCause4(cause) : pull);
})));
var split = /* @__PURE__ */ dual(2, (self, predicate) => mapAccumArray(self, empty2, (acc, arr) => {
  const out = empty2();
  for (let i = 0;i < arr.length; i++) {
    if (predicate(arr[i])) {
      if (isArrayNonEmpty2(acc)) {
        out.push(acc);
        acc = [];
      }
    } else {
      acc.push(arr[i]);
    }
  }
  return [acc, out];
}, {
  onHalt(arr) {
    return isArrayNonEmpty2(arr) ? of(arr) : emptyArr;
  }
}));
var combine3 = /* @__PURE__ */ dual(4, (self, that, s, f) => combine2(flattenArray(self.channel), flattenArray(that.channel), s, f).pipe(map8(of), fromChannel3));
var combineArray = /* @__PURE__ */ dual(4, (self, that, s, f) => fromChannel3(combine2(self.channel, that.channel, s, f)));
var mapAccum3 = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, initial, f, options) => fromChannel3(mapAccum2(self.channel, initial, (state, arr) => {
  const acc = empty2();
  for (let index = 0;index < arr.length; index++) {
    const [newState, values] = f(state, arr[index]);
    state = newState;
    acc.push(...values);
  }
  return [state, isArrayNonEmpty2(acc) ? of(acc) : emptyArr];
}, options?.onHalt ? {
  onHalt(state) {
    const arr = options.onHalt(state);
    return isReadonlyArrayNonEmpty(arr) ? of(arr) : emptyArr;
  }
} : undefined)));
var mapAccumArray = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, initial, f, options) => fromChannel3(mapAccum2(self.channel, initial, (state, arr) => {
  const [newState, values] = f(state, arr);
  state = newState;
  return [state, isReadonlyArrayNonEmpty(values) ? of(values) : emptyArr];
}, options?.onHalt ? {
  onHalt(state) {
    const arr = options.onHalt(state);
    return isReadonlyArrayNonEmpty(arr) ? of(arr) : emptyArr;
  }
} : undefined)));
var emptyArr = /* @__PURE__ */ empty2();
var mapAccumEffect = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, initial, f, options) => self.channel.pipe(flattenArray, mapAccum2(initial, (state, a) => map7(f(state, a), ([state2, values]) => [state2, isReadonlyArrayNonEmpty(values) ? of(values) : empty2()]), options?.onHalt ? {
  onHalt(state) {
    const arr = options.onHalt(state);
    return isReadonlyArrayNonEmpty(arr) ? of(arr) : emptyArr;
  }
} : undefined), fromChannel3));
var mapAccumArrayEffect = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, initial, f, options) => self.channel.pipe(mapAccum2(initial, (state, a) => map7(f(state, a), ([state2, values]) => [state2, isReadonlyArrayNonEmpty(values) ? of(values) : emptyArr]), options?.onHalt ? {
  onHalt(state) {
    const arr = options.onHalt(state);
    return isReadonlyArrayNonEmpty(arr) ? of(arr) : emptyArr;
  }
} : undefined), fromChannel3));
var scan = /* @__PURE__ */ dual(3, (self, initial, f) => suspend5(() => {
  let isFirst = true;
  return fromChannel3(mapAccum2(self.channel, constant(initial), (state, arr) => {
    const states = empty2();
    if (isFirst) {
      isFirst = false;
      states.push(state);
    }
    for (let index = 0;index < arr.length; index++) {
      state = f(state, arr[index]);
      states.push(state);
    }
    return [state, of(states)];
  }));
}));
var scanEffect2 = /* @__PURE__ */ dual(3, (self, initial, f) => self.channel.pipe(flattenArray, scanEffect(initial, f), map8(of), fromChannel3));
var debounce = /* @__PURE__ */ dual(2, (self, duration) => transformPull2(self, fnUntraced2(function* (pull, scope3) {
  const clock = yield* Clock;
  const durationMs = toMillis(fromInputUnsafe(duration));
  let lastArr;
  let cause;
  let emitAtMs = Infinity;
  const pullLatch = makeUnsafe5();
  const emitLatch = makeUnsafe5();
  const endLatch = makeUnsafe5();
  yield* pull.pipe(pullLatch.whenOpen, flatMap5((arr) => {
    emitLatch.openUnsafe();
    lastArr = arr;
    emitAtMs = clock.currentTimeMillisUnsafe() + durationMs;
    return void_3;
  }), forever4({
    disableYield: true
  }), onError2((cause_) => {
    cause = cause_;
    emitAtMs = clock.currentTimeMillisUnsafe();
    emitLatch.openUnsafe();
    endLatch.openUnsafe();
    return void_3;
  }), forkIn2(scope3));
  const sleepLoop = suspend3(function loop() {
    const now = clock.currentTimeMillisUnsafe();
    const timeMs = emitAtMs < now ? durationMs : Math.min(durationMs, emitAtMs - now);
    return flatMap5(raceFirst2(sleep2(timeMs), endLatch.await), () => {
      const now2 = clock.currentTimeMillisUnsafe();
      if (now2 < emitAtMs) {
        return loop();
      } else if (lastArr) {
        emitLatch.closeUnsafe();
        pullLatch.closeUnsafe();
        const eff = succeed6(of(lastNonEmpty(lastArr)));
        lastArr = undefined;
        return eff;
      } else if (cause) {
        return failCause4(cause);
      }
      return loop();
    });
  });
  return suspend3(() => {
    if (cause) {
      if (lastArr) {
        const eff = succeed6(of(lastNonEmpty(lastArr)));
        lastArr = undefined;
        return eff;
      }
      return failCause4(cause);
    }
    pullLatch.openUnsafe();
    return emitLatch.whenOpen(sleepLoop);
  });
})));
var throttleEffect = /* @__PURE__ */ dual(2, (self, options) => {
  const burst = options.burst ?? 0;
  if (options.strategy === "enforce") {
    return throttleEnforceEffect(self, options.cost, options.units, options.duration, burst);
  }
  return throttleShapeEffect(self, options.cost, options.units, options.duration, burst);
});
var throttleEnforceEffect = (self, cost, units, duration, burst) => transformPull2(self, (pull) => clockWith2((clock) => {
  const durationMs = toMillis(fromInputUnsafe(duration));
  const max3 = units + burst < 0 ? Number.POSITIVE_INFINITY : units + burst;
  let tokens = units;
  let timestampMs = clock.currentTimeMillisUnsafe();
  return succeed6(flatMap5(pull, function loop(arr) {
    return flatMap5(cost(arr), (weight) => {
      const currentMs = clock.currentTimeMillisUnsafe();
      const elapsed = currentMs - timestampMs;
      const cycles = elapsed / durationMs;
      const sum2 = tokens + cycles * units;
      const available = sum2 < 0 ? max3 : Math.min(sum2, max3);
      if (weight <= available) {
        tokens = available - weight;
        timestampMs = currentMs;
        return succeed6(arr);
      }
      return flatMap5(pull, loop);
    });
  }));
}));
var throttleShapeEffect = (self, cost, units, duration, burst) => transformPull2(self, (pull) => clockWith2((clock) => {
  const durationMs = toMillis(fromInputUnsafe(duration));
  const max3 = units + burst < 0 ? Number.POSITIVE_INFINITY : units + burst;
  let tokens = units;
  let timestampMs = clock.currentTimeMillisUnsafe();
  return succeed6(flatMap5(pull, (arr) => flatMap5(cost(arr), (weight) => {
    const currentMs = clock.currentTimeMillisUnsafe();
    const elapsed = currentMs - timestampMs;
    const cycles = elapsed / durationMs;
    const sum2 = tokens + cycles * units;
    const available = sum2 < 0 ? max3 : Math.min(sum2, max3);
    const remaining = available - weight;
    if (remaining >= 0) {
      tokens = remaining;
      timestampMs = currentMs;
      return succeed6(arr);
    }
    const waitCycles = -remaining / units;
    const delayMs = Math.max(0, waitCycles * durationMs);
    if (delayMs > 0) {
      return flatMap5(sleep2(delayMs), () => {
        tokens = remaining;
        timestampMs = currentMs;
        return succeed6(arr);
      });
    }
    tokens = remaining;
    timestampMs = currentMs;
    return succeed6(arr);
  })));
}));
var throttle = /* @__PURE__ */ dual(2, (self, options) => throttleEffect(self, {
  ...options,
  cost: (arr) => succeed6(options.cost(arr))
}));
var grouped = /* @__PURE__ */ dual(2, (self, n) => chunks(rechunk(self, n)));
var groupedWithin = /* @__PURE__ */ dual(3, (self, chunkSize, duration) => aggregateWithin(self, take4(chunkSize), spaced(duration)));
var groupBy = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, f, options) => groupByImpl(self, fnUntraced2(function* (arr, queues, queueMap) {
  for (let i = 0;i < arr.length; i++) {
    const [key, value] = yield* f(arr[i]);
    const oentry = get3(queueMap, key);
    const queue = isSome2(oentry) ? oentry.value : yield* scoped2(get4(queues, key));
    yield* touch(queues, key);
    yield* offer(queue, value);
  }
}), options));
var groupByKey = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, f, options) => suspend5(() => {
  const batch = empty7();
  return groupByImpl(self, fnUntraced2(function* (arr, queues, queueMap) {
    for (let i = 0;i < arr.length; i++) {
      const key = f(arr[i]);
      const ovalues = get3(batch, key);
      if (isNone2(ovalues)) {
        set2(batch, key, [arr[i]]);
      } else {
        ovalues.value.push(arr[i]);
      }
    }
    for (const [key, values] of batch) {
      const oentry = get3(queueMap, key);
      const queue = isSome2(oentry) ? oentry.value : yield* scoped2(get4(queues, key));
      yield* touch(queues, key);
      yield* offerAll(queue, values);
    }
    clear2(batch);
  }), options);
}));
var groupByImpl = (self, f, options) => transformPullBracket(self, fnUntraced2(function* (pull, scope3, forkedScope) {
  const out = yield* unbounded2();
  yield* addFinalizer2(scope3, shutdown2(out));
  const queueMap = empty7();
  const queues = yield* make14({
    lookup: (key) => acquireRelease2(make13({
      capacity: options?.bufferSize ?? 4096
    }).pipe(tap3((queue) => {
      set2(queueMap, key, queue);
      return offer(out, [key, fromQueue(queue)]);
    })), (queue) => {
      remove3(queueMap, key);
      return end(queue);
    }),
    idleTimeToLive: options?.idleTimeToLive ?? infinity
  }).pipe(provide(forkedScope));
  yield* whileLoop2({
    while: constTrue,
    body: constant(flatMap5(pull, (arr) => f(arr, queues, queueMap))),
    step: constVoid
  }).pipe(catchCause3((cause) => failCause5(out, cause)), forkIn2(scope3));
  return takeAll3(out);
}));
var groupAdjacentBy = /* @__PURE__ */ dual(2, (self, f) => transformPull2(self, (pull, _scope) => sync3(() => {
  let currentKey = undefined;
  let group;
  let toEmit = empty2();
  const loop = pull.pipe(flatMap5((chunk) => {
    for (let i = 0;i < chunk.length; i++) {
      const item = chunk[i];
      const key = f(item);
      if (group === undefined) {
        currentKey = key;
        group = [item];
        continue;
      } else if (equals(key, currentKey)) {
        group.push(item);
        continue;
      }
      toEmit.push([currentKey, group]);
      currentKey = key;
      group = [item];
    }
    if (isArrayNonEmpty2(toEmit)) {
      const out = toEmit;
      toEmit = [];
      return succeed6(out);
    }
    return loop;
  }));
  let done4 = false;
  return catchDone(suspend3(() => done4 ? done3() : loop), () => {
    done4 = true;
    const out = group;
    group = undefined;
    return out && isArrayNonEmpty2(out) ? succeed6(of([currentKey, out])) : done3();
  });
})));
var transduce = /* @__PURE__ */ dual(2, (self, sink) => transformPull2(self, (upstream, scope3) => sync3(() => {
  let done4;
  let leftover;
  const upstreamWithLeftover = suspend3(() => {
    if (leftover !== undefined) {
      const chunk = leftover;
      leftover = undefined;
      return succeed6(chunk);
    }
    return upstream;
  }).pipe(catch_3((error) => {
    done4 = fail4(error);
    return done3();
  }));
  const pull = map7(suspend3(() => sink.transform(upstreamWithLeftover, scope3)), ([value, leftover_]) => {
    leftover = leftover_;
    return of(value);
  });
  return suspend3(() => done4 ? done4 : pull);
})));
var aggregate = /* @__PURE__ */ dual(2, (self, sink) => aggregateWithin(self, sink, forever3));
var aggregateWithin = /* @__PURE__ */ dual(3, (self, sink, schedule4) => fromChannel3(fromTransformBracket(fnUntraced2(function* (_upstream, _, scope3) {
  const pull = yield* toPullScoped(self.channel, _);
  const pullLatch = makeUnsafe5(false);
  const scheduleStep = Symbol();
  const buffer3 = yield* make13({
    capacity: 0
  });
  yield* pull.pipe(pullLatch.whenOpen, flatMap5((arr) => {
    pullLatch.closeUnsafe();
    return offer(buffer3, arr);
  }), forever4, catchCause3((cause) => failCause5(buffer3, cause)), forkIn2(scope3));
  let lastOutput = none2();
  let leftover;
  let sinkHasInput = false;
  const step = yield* toStepWithSleep(schedule4);
  const stepLoop = suspend3(function loop() {
    return flatMap5(step(lastOutput), () => !sinkHasInput ? loop() : offer(buffer3, scheduleStep));
  });
  const stepToBuffer = stepLoop.pipe(flatMap5(() => never2), catchDone(() => done3()));
  const pullFromBuffer = take3(buffer3).pipe(flatMap5((arr) => {
    if (arr === scheduleStep) {
      return done3();
    }
    sinkHasInput = true;
    return succeed6(arr);
  }));
  const sinkUpstream = suspend3(() => {
    if (leftover !== undefined) {
      const chunk = leftover;
      leftover = undefined;
      sinkHasInput = true;
      return succeed6(chunk);
    }
    pullLatch.openUnsafe();
    return pullFromBuffer;
  });
  const catchSinkHalt = flatMap5(([value, leftover_]) => {
    if (!sinkHasInput && buffer3.state._tag === "Done")
      return done3();
    lastOutput = some2(value);
    leftover = leftover_;
    return succeed6(of(value));
  });
  return suspend3(() => {
    if (buffer3.state._tag === "Done" && leftover === undefined) {
      return buffer3.state.exit;
    }
    sinkHasInput = leftover !== undefined;
    return succeed6(suspend3(() => sink.transform(sinkUpstream, scope3)));
  }).pipe(flatMap5((pull2) => raceFirst2(catchSinkHalt(pull2), stepToBuffer)));
}))));
var broadcastN = /* @__PURE__ */ dual(2, /* @__PURE__ */ fnUntraced2(function* (self, options) {
  const pubsub = yield* makePubSub2(options);
  const streams = new Array(options.n);
  const parentScope = yield* Scope;
  for (let i = 0;i < options.n; i++) {
    const scope3 = forkUnsafe2(parentScope);
    const subscription = yield* subscribe(pubsub).pipe(provideService2(Scope, scope3));
    streams[i] = fromEffectTake(take2(subscription)).pipe(onExit3((exit3) => close(scope3, exit3)), fromChannel3);
  }
  yield* runForEach(self.channel, (value) => publish(pubsub, value)).pipe(onExit2((exit3) => publish(pubsub, exit3)), forkScoped2);
  return streams;
}));
var makePubSub2 = (options) => acquireRelease2(options.capacity === "unbounded" ? unbounded(options) : options.strategy === "dropping" ? dropping(options) : options.strategy === "sliding" ? sliding(options) : bounded(options), shutdown);
var broadcast = /* @__PURE__ */ dual(2, (self, options) => map7(toPubSubTake2(self, options), fromPubSubTake2));
var share = /* @__PURE__ */ dual(2, (self, options) => map7(make16({
  acquire: broadcast(self, options),
  idleTimeToLive: options.idleTimeToLive
}), (ref) => unwrap4(get6(ref))));
var pipeThroughChannel = /* @__PURE__ */ dual(2, (self, channel) => fromChannel3(pipeTo(self.channel, channel)));
var pipeThroughChannelOrFail = /* @__PURE__ */ dual(2, (self, channel) => fromChannel3(pipeToOrFail(self.channel, channel)));
var pipeThrough = /* @__PURE__ */ dual(2, (self, sink) => self.channel.pipe(pipeToOrFail(toChannel(sink)), concatWith(([_, leftover]) => leftover ? succeed7(leftover) : empty6), fromChannel3));
var collect = (self) => fromEffect2(runCollect(self));
var accumulate = (self) => mapAccumArray(self, empty2, (acc, as3) => {
  const combined = appendAll(acc, as3);
  return [combined, [combined]];
});
var changes = (self) => changesWith(self, equals);
var changesWith = /* @__PURE__ */ dual(2, (self, f) => transformPull2(self, (pull, _scope) => sync3(() => {
  let first = true;
  let last;
  return flatMap5(pull, function loop(arr) {
    const out = [];
    let i = 0;
    if (first) {
      first = false;
      last = arr[0];
      i = 1;
      out.push(last);
    }
    for (;i < arr.length; i++) {
      const a = arr[i];
      if (f(a, last))
        continue;
      last = a;
      out.push(a);
    }
    return isArrayNonEmpty2(out) ? succeed6(out) : flatMap5(pull, loop);
  });
})));
var changesWithEffect = /* @__PURE__ */ dual(2, (self, f) => transformPull2(self, (pull, _scope) => sync3(() => {
  let first = true;
  let last;
  return flatMap5(pull, fnUntraced2(function* loop(arr) {
    const out = [];
    let i = 0;
    if (first) {
      first = false;
      last = arr[0];
      i = 1;
      out.push(last);
    }
    for (;i < arr.length; i++) {
      const a = arr[i];
      if (yield* f(a, last))
        continue;
      last = a;
      out.push(a);
    }
    return isArrayNonEmpty2(out) ? out : yield* flatMap5(pull, fnUntraced2(loop));
  }));
})));
var decodeText = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, options) => suspend5(() => {
  const decoder2 = new TextDecoder(options?.encoding);
  return map9(self, (chunk) => decoder2.decode(chunk, {
    stream: true
  }));
}));
var encodeText = (self) => suspend5(() => {
  const encoder2 = new TextEncoder;
  return map9(self, (chunk) => encoder2.encode(chunk));
});
var splitLines2 = (self) => self.channel.pipe(pipeTo(splitLines()), fromChannel3);
var intersperse = /* @__PURE__ */ dual(2, (self, element) => mapArray(self, (arr, i) => {
  const out = i === 0 ? [] : [element];
  const lastIndex = arr.length - 1;
  for (let j = 0;j < arr.length; j++) {
    if (j === lastIndex) {
      out.push(arr[j]);
    } else {
      out.push(arr[j], element);
    }
  }
  return out;
}));
var intersperseAffixes = /* @__PURE__ */ dual(2, (self, options) => succeed8(options.start).pipe(concat(intersperse(self, options.middle)), concat(succeed8(options.end))));
var interleave = /* @__PURE__ */ dual(2, (self, that) => interleaveWith(self, that, fromIterable3(forever([true, false]))));
var interleaveWith = /* @__PURE__ */ dual(3, (self, that, decider) => fromChannel3(fromTransform(fnUntraced2(function* (upstream, scope3) {
  const pullDecider = yield* toTransform(flattenArray(decider.channel))(upstream, scope3);
  const retry5 = Symbol();
  let leftDone = false;
  let rightDone = false;
  const pullLeft = (yield* toTransform(flattenArray(self.channel))(upstream, scope3)).pipe(catchDone(() => {
    leftDone = true;
    return succeed6(retry5);
  }));
  const pullRight = (yield* toTransform(flattenArray(that.channel))(upstream, scope3)).pipe(catchDone(() => {
    rightDone = true;
    return succeed6(retry5);
  }));
  return gen2(function* () {
    while (true) {
      if (leftDone && rightDone) {
        return yield* done3();
      }
      const side = yield* pullDecider;
      if (side && leftDone)
        continue;
      if (!side && rightDone)
        continue;
      const elem = yield* side ? pullLeft : pullRight;
      if (elem === retry5)
        continue;
      return of(elem);
    }
  });
}))));
var interruptWhen2 = /* @__PURE__ */ dual(2, (self, effect2) => fromChannel3(interruptWhen(self.channel, effect2)));
var haltWhen2 = /* @__PURE__ */ dual(2, (self, effect2) => fromChannel3(haltWhen(self.channel, effect2)));
var onExit4 = /* @__PURE__ */ dual(2, (self, finalizer) => fromChannel3(onExit3(self.channel, finalizer)));
var onError4 = /* @__PURE__ */ dual(2, (self, cleanup) => fromChannel3(onError3(self.channel, cleanup)));
var onStart2 = /* @__PURE__ */ dual(2, (self, onStart3) => fromChannel3(onStart(self.channel, onStart3)));
var onFirst2 = /* @__PURE__ */ dual(2, (self, onFirst3) => fromChannel3(onFirst(self.channel, (arr) => onFirst3(arr[0]))));
var onEnd2 = /* @__PURE__ */ dual(2, (self, onEnd3) => fromChannel3(onEnd(self.channel, onEnd3)));
var ensuring4 = /* @__PURE__ */ dual(2, (self, finalizer) => fromChannel3(ensuring3(self.channel, finalizer)));
var provide6 = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, layer, options) => fromChannel3(provide5(self.channel, layer, options)));
var provideContext4 = /* @__PURE__ */ dual(2, (self, context3) => fromChannel3(provideContext3(self.channel, context3)));
var provideService4 = /* @__PURE__ */ dual(3, (self, key, service4) => fromChannel3(provideService3(self.channel, key, service4)));
var provideServiceEffect4 = /* @__PURE__ */ dual(3, (self, key, service4) => fromChannel3(provideServiceEffect3(self.channel, key, service4)));
var updateContext4 = /* @__PURE__ */ dual(2, (self, f) => fromChannel3(updateContext3(self.channel, f)));
var updateService4 = /* @__PURE__ */ dual(3, (self, service4, f) => updateContext4(self, (context3) => add(context3, service4, f(get(context3, service4)))));
var withSpan5 = function() {
  const dataFirst = isStream(arguments[0]);
  const name = dataFirst ? arguments[1] : arguments[0];
  const options = addSpanStackTrace(dataFirst ? arguments[2] : arguments[1]);
  if (dataFirst) {
    const self = arguments[0];
    return fromChannel3(withSpan4(self.channel, name, options));
  }
  return (self) => fromChannel3(withSpan4(self.channel, name, options));
};
var Do3 = /* @__PURE__ */ succeed8({});
var let_4 = /* @__PURE__ */ dual(3, (self, name, f) => map9(self, (a) => ({
  ...a,
  [name]: f(a)
})));
var bind4 = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, tag, f, options) => flatMap7(self, (a) => map9(f(a), (b) => ({
  ...a,
  [tag]: b
})), options));
var bindEffect = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, tag, f, options) => mapEffect2(self, (a) => map7(f(a), (b) => ({
  ...a,
  [tag]: b
})), options));
var bindTo4 = /* @__PURE__ */ dual(2, (self, name) => map9(self, (a) => ({
  [name]: a
})));
var run = /* @__PURE__ */ dual(2, (self, sink) => scopedWith2((scope3) => toPullScoped(self.channel, scope3).pipe(flatMap5((upstream) => sink.transform(upstream, scope3)), map7(([a]) => a))));
var runCollect = (self) => runFold(self.channel, () => [], (acc, chunk) => {
  for (let i = 0;i < chunk.length; i++) {
    acc.push(chunk[i]);
  }
  return acc;
});
var runCount = (self) => runFold(self.channel, () => 0, (acc, chunk) => acc + chunk.length);
var runSum = (self) => runFold(self.channel, () => 0, (acc, chunk) => {
  for (let i = 0;i < chunk.length; i++) {
    acc += chunk[i];
  }
  return acc;
});
var runFold2 = /* @__PURE__ */ dual(3, (self, initial, f) => runFold(self.channel, initial, (acc, arr) => {
  for (let i = 0;i < arr.length; i++) {
    acc = f(acc, arr[i]);
  }
  return acc;
}));
var runFoldEffect2 = /* @__PURE__ */ dual(3, (self, initial, f) => runFoldEffect(self.channel, initial, (acc, arr) => {
  let i = 0;
  let s = acc;
  return map7(whileLoop2({
    while: () => i < arr.length,
    body: () => f(s, arr[i]),
    step(z) {
      s = z;
      i++;
    }
  }), () => s);
}));
var runHead2 = (self) => map7(runHead(self.channel), map(getUnsafe2(0)));
var runLast2 = (self) => map7(runLast(self.channel), map(lastNonEmpty));
var runForEach2 = /* @__PURE__ */ dual(2, (self, f) => runForEach(self.channel, (arr) => {
  let i = 0;
  return whileLoop2({
    while: () => i < arr.length,
    body: () => f(arr[i++]),
    step: constVoid
  });
}));
var runForEachWhile2 = /* @__PURE__ */ dual(2, (self, f) => runForEachWhile(self.channel, (arr) => {
  let done4 = false;
  let i = 0;
  return map7(whileLoop2({
    while: () => !done4 && i < arr.length,
    body: () => f(arr[i]),
    step(b) {
      i++;
      if (!b)
        done4 = true;
    }
  }), () => !done4);
}));
var runForEachArray = /* @__PURE__ */ dual(2, (self, f) => runForEach(self.channel, f));
var runDrain2 = (self) => runDrain(self.channel);
var toPull3 = (self) => toPull2(self.channel);
var mkString = (self) => runFold(self.channel, () => "", (acc, chunk) => acc + chunk.join(""));
var mkArrayBuffer = (self) => map7(mkUint8Array(self.channel), (bytes) => bytes.buffer);
var mkUint8Array2 = (self) => mkUint8Array(self.channel);
var toReadableStreamWith = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, context3, options) => {
  let currentResolve = undefined;
  let fiber3 = undefined;
  const latch = makeUnsafe5(false);
  return new ReadableStream({
    start(controller) {
      fiber3 = runFork2(provideContext2(runForEachArray(self, (chunk) => latch.whenOpen(sync3(() => {
        latch.closeUnsafe();
        for (let i = 0;i < chunk.length; i++) {
          controller.enqueue(chunk[i]);
        }
        currentResolve();
        currentResolve = undefined;
      }))), context3));
      fiber3.addObserver((exit3) => {
        if (exit3._tag === "Failure") {
          controller.error(squash(exit3.cause));
        } else {
          controller.close();
        }
      });
    },
    pull() {
      return new Promise((resolve) => {
        currentResolve = resolve;
        latch.openUnsafe();
      });
    },
    cancel() {
      if (!fiber3)
        return;
      return runPromise2(asVoid2(interrupt4(fiber3)));
    }
  }, options?.strategy);
});
var toReadableStream = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, options) => toReadableStreamWith(self, empty(), options));
var toReadableStreamEffect = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, options) => map7(context2(), (context3) => toReadableStreamWith(self, context3, options)));
var toAsyncIterableWith = /* @__PURE__ */ dual(2, (self, context3) => ({
  [Symbol.asyncIterator]() {
    const runPromise3 = runPromiseWith2(context3);
    const runFork3 = runForkWith2(context3);
    const scope3 = makeUnsafe3();
    let pull;
    let currentIter;
    let currentFiber;
    let closePromise;
    const close2 = (exit3) => {
      if (closePromise)
        return closePromise;
      const fiber3 = currentFiber;
      closePromise = runPromise3(as2(andThen2(fiber3 ? interrupt4(fiber3) : void_3, close(scope3, exit3)), {
        done: true,
        value: undefined
      }));
      return closePromise;
    };
    const closeAndReportError = async (exit3) => {
      try {
        await close2(exit3);
      } catch (error) {
        await runPromise3(logError("Suppressed error while closing Stream async iterator", error));
      }
    };
    return {
      async next() {
        if (closePromise)
          return closePromise;
        if (currentIter) {
          const next = currentIter.next();
          if (!next.done)
            return next;
          currentIter = undefined;
        }
        const fiber3 = runFork3(pull ?? flatMap5(toPullScoped(self.channel, scope3), (nextPull) => {
          pull = nextPull;
          return nextPull;
        }));
        currentFiber = fiber3;
        const exit3 = await runPromise3(await_(fiber3));
        if (currentFiber === fiber3) {
          currentFiber = undefined;
        }
        if (isSuccess4(exit3)) {
          currentIter = exit3.value[Symbol.iterator]();
          return currentIter.next();
        } else if (isDoneCause(exit3.cause)) {
          return close2(void_2);
        }
        if (closePromise && hasInterruptsOnly2(exit3.cause)) {
          return closePromise;
        }
        await closeAndReportError(exit3);
        throw squash(exit3.cause);
      },
      return() {
        return close2(void_2);
      },
      async throw(error) {
        await closeAndReportError(die2(error));
        throw error;
      }
    };
  }
}));
var toAsyncIterableEffect = (self) => map7(context2(), (context3) => toAsyncIterableWith(self, context3));
var toAsyncIterable = (self) => toAsyncIterableWith(self, empty());
var runIntoPubSub = /* @__PURE__ */ dual((args2) => isStream(args2[0]), (self, pubsub, options) => runIntoPubSubArray(self.channel, pubsub, options));
var toPubSub = /* @__PURE__ */ dual(2, (self, options) => toPubSubArray(self.channel, options));
var toPubSubTake2 = /* @__PURE__ */ dual(2, (self, options) => toPubSubTake(self.channel, options));
var toQueue = /* @__PURE__ */ dual(2, (self, options) => toQueueArray(self.channel, options));
var runIntoQueue = /* @__PURE__ */ dual(2, (self, queue) => runIntoQueueArray(self.channel, queue));

// node_modules/effect/dist/FileSystem.js
var TypeId25 = "~effect/platform/FileSystem";
var Size = (bytes) => typeof bytes === "bigint" ? bytes : BigInt(bytes);
var KiB = (n) => Size(n * 1024);
var MiB = (n) => Size(n * 1024 * 1024);
var GiB = (n) => Size(n * 1024 * 1024 * 1024);
var TiB = (n) => Size(n * 1024 * 1024 * 1024 * 1024);
var bigint1024 = /* @__PURE__ */ BigInt(1024);
var bigintPiB = bigint1024 * bigint1024 * bigint1024 * bigint1024 * bigint1024;
var PiB = (n) => Size(BigInt(n) * bigintPiB);
var FileSystem = /* @__PURE__ */ Service("effect/platform/FileSystem");
var make18 = (impl) => FileSystem.of({
  ...impl,
  [TypeId25]: TypeId25,
  exists: (path) => pipe(impl.access(path), as2(true), catchTag3("PlatformError", (e) => e.reason._tag === "NotFound" ? succeed6(false) : fail6(e))),
  readFileString: (path, encoding) => flatMap5(impl.readFile(path), (_) => try_3({
    try: () => new TextDecoder(encoding).decode(_),
    catch: (cause) => badArgument({
      module: "FileSystem",
      method: "readFileString",
      description: "invalid encoding",
      cause
    })
  })),
  stream: fnUntraced2(function* (path, options) {
    const file = yield* impl.open(path, {
      flag: "r"
    });
    if (options?.offset) {
      yield* file.seek(options.offset, "start");
    }
    const bytesToRead = options?.bytesToRead !== undefined ? Size(options.bytesToRead) : undefined;
    let totalBytesRead = BigInt(0);
    const chunkSize = Size(options?.chunkSize ?? 64 * 1024);
    const readChunk = file.readAlloc(chunkSize);
    return fromPull2(succeed6(flatMap5(suspend3(() => {
      if (bytesToRead !== undefined && bytesToRead <= totalBytesRead) {
        return done3();
      }
      return bytesToRead !== undefined && bytesToRead - totalBytesRead < chunkSize ? file.readAlloc(bytesToRead - totalBytesRead) : readChunk;
    }), match({
      onNone: () => done3(),
      onSome: (buf) => {
        totalBytesRead += BigInt(buf.length);
        return succeed6(of(buf));
      }
    }))));
  }, unwrap4),
  sink: (path, options) => pipe(impl.open(path, {
    flag: "w",
    ...options
  }), map7((file) => forEach3((_) => file.writeAll(_))), unwrap3),
  writeFileString: (path, data, options) => flatMap5(try_3({
    try: () => new TextEncoder().encode(data),
    catch: (cause) => badArgument({
      module: "FileSystem",
      method: "writeFileString",
      description: "could not encode string",
      cause
    })
  }), (_) => impl.writeFile(path, _, options))
});
var notFound2 = (method, path) => systemError({
  module: "FileSystem",
  method,
  _tag: "NotFound",
  description: "No such file or directory",
  pathOrDescriptor: path
});
var makeNoop = (fileSystem) => FileSystem.of({
  [TypeId25]: TypeId25,
  access(path) {
    return fail6(notFound2("access", path));
  },
  chmod(path) {
    return fail6(notFound2("chmod", path));
  },
  chown(path) {
    return fail6(notFound2("chown", path));
  },
  copy(path) {
    return fail6(notFound2("copy", path));
  },
  copyFile(path) {
    return fail6(notFound2("copyFile", path));
  },
  glob(pattern) {
    return fail6(notFound2("glob", pattern));
  },
  exists() {
    return succeed6(false);
  },
  link(path) {
    return fail6(notFound2("link", path));
  },
  makeDirectory() {
    return die4("not implemented");
  },
  makeTempDirectory() {
    return die4("not implemented");
  },
  makeTempDirectoryScoped() {
    return die4("not implemented");
  },
  makeTempFile() {
    return die4("not implemented");
  },
  makeTempFileScoped() {
    return die4("not implemented");
  },
  open(path) {
    return fail6(notFound2("open", path));
  },
  readDirectory(path) {
    return fail6(notFound2("readDirectory", path));
  },
  readFile(path) {
    return fail6(notFound2("readFile", path));
  },
  readFileString(path) {
    return fail6(notFound2("readFileString", path));
  },
  readLink(path) {
    return fail6(notFound2("readLink", path));
  },
  realPath(path) {
    return fail6(notFound2("realPath", path));
  },
  remove() {
    return void_3;
  },
  rename(oldPath) {
    return fail6(notFound2("rename", oldPath));
  },
  sink(path) {
    return fail8(notFound2("sink", path));
  },
  stat(path) {
    return fail6(notFound2("stat", path));
  },
  stream(path) {
    return fail9(notFound2("stream", path));
  },
  symlink(fromPath) {
    return fail6(notFound2("symlink", fromPath));
  },
  truncate(path) {
    return fail6(notFound2("truncate", path));
  },
  utimes(path) {
    return fail6(notFound2("utimes", path));
  },
  watch(path) {
    return fail9(notFound2("watch", path));
  },
  writeFile(path) {
    return fail6(notFound2("writeFile", path));
  },
  writeFileString(path) {
    return fail6(notFound2("writeFileString", path));
  },
  ...fileSystem
});
var layerNoop = (fileSystem) => succeed5(FileSystem)(makeNoop(fileSystem));
var FileTypeId = "~effect/platform/FileSystem/File";
var isFile = (u) => hasProperty(u, FileTypeId);

class WatchBackend extends (/* @__PURE__ */ Service()("effect/platform/FileSystem/WatchBackend")) {
}
// node_modules/effect/dist/Ref.js
var exports_Ref = {};
__export(exports_Ref, {
  get: () => get7,
  getAndSet: () => getAndSet,
  getAndUpdate: () => getAndUpdate,
  getAndUpdateSome: () => getAndUpdateSome,
  getUnsafe: () => getUnsafe4,
  make: () => make19,
  makeUnsafe: () => makeUnsafe8,
  modify: () => modify2,
  modifySome: () => modifySome,
  set: () => set3,
  setAndGet: () => setAndGet,
  update: () => update2,
  updateAndGet: () => updateAndGet,
  updateSome: () => updateSome,
  updateSomeAndGet: () => updateSomeAndGet
});
var TypeId26 = "~effect/Ref";
var RefProto = {
  [TypeId26]: {
    _A: identity
  },
  ...PipeInspectableProto,
  toJSON() {
    return {
      _id: "Ref",
      ref: this.ref
    };
  }
};
var makeUnsafe8 = (value) => {
  const self = Object.create(RefProto);
  self.ref = make10(value);
  return self;
};
var make19 = (value) => sync3(() => makeUnsafe8(value));
var get7 = (self) => sync3(() => self.ref.current);
var set3 = /* @__PURE__ */ dual(2, (self, value) => sync3(() => set(self.ref, value)));
var getAndSet = /* @__PURE__ */ dual(2, (self, value) => sync3(() => {
  const current = self.ref.current;
  self.ref.current = value;
  return current;
}));
var getAndUpdate = /* @__PURE__ */ dual(2, (self, f) => sync3(() => {
  const current = self.ref.current;
  self.ref.current = f(current);
  return current;
}));
var getAndUpdateSome = /* @__PURE__ */ dual(2, (self, pf) => sync3(() => {
  const current = self.ref.current;
  const option3 = pf(current);
  if (option3._tag === "Some") {
    self.ref.current = option3.value;
  }
  return current;
}));
var setAndGet = /* @__PURE__ */ dual(2, (self, value) => sync3(() => self.ref.current = value));
var modify2 = /* @__PURE__ */ dual(2, (self, f) => sync3(() => {
  const [b, a] = f(self.ref.current);
  self.ref.current = a;
  return b;
}));
var modifySome = /* @__PURE__ */ dual(2, (self, pf) => modify2(self, (value) => {
  const [b, option3] = pf(value);
  return [b, option3._tag === "None" ? value : option3.value];
}));
var update2 = /* @__PURE__ */ dual(2, (self, f) => sync3(() => {
  self.ref.current = f(self.ref.current);
}));
var updateAndGet = /* @__PURE__ */ dual(2, (self, f) => sync3(() => self.ref.current = f(self.ref.current)));
var updateSome = /* @__PURE__ */ dual(2, (self, f) => sync3(() => {
  const option3 = f(self.ref.current);
  if (option3._tag === "Some") {
    self.ref.current = option3.value;
  }
}));
var updateSomeAndGet = /* @__PURE__ */ dual(2, (self, pf) => sync3(() => {
  const option3 = pf(self.ref.current);
  if (option3._tag === "Some") {
    self.ref.current = option3.value;
  }
  return self.ref.current;
}));
var getUnsafe4 = (self) => self.ref.current;
// node_modules/effect/dist/Schema.js
var exports_Schema = {};
__export(exports_Schema, {
  Any: () => Any2,
  Array: () => ArraySchema,
  ArrayEnsure: () => ArrayEnsure,
  BigDecimal: () => BigDecimal,
  BigDecimalFromString: () => BigDecimalFromString,
  BigDecimalReviver: () => BigDecimalReviver,
  BigInt: () => BigInt5,
  BigIntFromString: () => BigIntFromString,
  Boolean: () => Boolean3,
  BooleanFromBit: () => BooleanFromBit,
  Cause: () => Cause,
  CauseReason: () => CauseReason,
  CauseReasonReviver: () => CauseReasonReviver,
  CauseReviver: () => CauseReviver,
  Char: () => Char,
  Chunk: () => Chunk,
  ChunkReviver: () => ChunkReviver,
  Class: () => Class4,
  Date: () => Date4,
  DateFromMillis: () => DateFromMillis,
  DateFromString: () => DateFromString,
  DateReviver: () => DateReviver,
  DateTimeUtc: () => DateTimeUtc,
  DateTimeUtcFromDate: () => DateTimeUtcFromDate,
  DateTimeUtcFromMillis: () => DateTimeUtcFromMillis,
  DateTimeUtcFromString: () => DateTimeUtcFromString,
  DateTimeUtcReviver: () => DateTimeUtcReviver,
  DateTimeZoned: () => DateTimeZoned,
  DateTimeZonedFromString: () => DateTimeZonedFromString,
  DateTimeZonedReviver: () => DateTimeZonedReviver,
  Defect: () => Defect,
  Duration: () => Duration,
  DurationFromMillis: () => DurationFromMillis,
  DurationFromNanos: () => DurationFromNanos,
  DurationFromString: () => DurationFromString,
  DurationReviver: () => DurationReviver,
  Enum: () => Enum2,
  Error: () => Error4,
  ErrorInstance: () => ErrorInstance,
  ErrorInstanceReviver: () => ErrorInstanceReviver,
  Exit: () => Exit,
  ExitReviver: () => ExitReviver,
  File: () => File,
  FileReviver: () => FileReviver,
  Finite: () => Finite,
  FiniteFromString: () => FiniteFromString,
  FormData: () => FormData2,
  FormDataReviver: () => FormDataReviver,
  Graph: () => Graph,
  GraphReviver: () => GraphReviver,
  HashMap: () => HashMap,
  HashMapReviver: () => HashMapReviver,
  HashSet: () => HashSet,
  HashSetReviver: () => HashSetReviver,
  Int: () => Int,
  Json: () => Json2,
  JsonObject: () => JsonObject,
  JsonReviver: () => JsonReviver,
  Literal: () => Literal2,
  Literals: () => Literals,
  MutableJson: () => MutableJson2,
  MutableJsonReviver: () => MutableJsonReviver,
  Natural: () => Natural,
  Never: () => Never2,
  NonEmptyArray: () => NonEmptyArray,
  NonEmptyString: () => NonEmptyString,
  Null: () => Null2,
  NullOr: () => NullOr,
  NullishOr: () => NullishOr,
  Number: () => Number6,
  NumberFromString: () => NumberFromString,
  ObjectKeyword: () => ObjectKeyword2,
  Opaque: () => Opaque,
  Option: () => Option,
  OptionFromNullOr: () => OptionFromNullOr,
  OptionFromNullishOr: () => OptionFromNullishOr,
  OptionFromOptional: () => OptionFromOptional,
  OptionFromOptionalKey: () => OptionFromOptionalKey,
  OptionFromOptionalNullOr: () => OptionFromOptionalNullOr,
  OptionFromUndefinedOr: () => OptionFromUndefinedOr,
  OptionReviver: () => OptionReviver,
  PropertyKey: () => PropertyKey,
  ReadonlyMap: () => ReadonlyMap,
  ReadonlyMapReviver: () => ReadonlyMapReviver,
  ReadonlySet: () => ReadonlySet,
  ReadonlySetReviver: () => ReadonlySetReviver,
  Record: () => Record,
  Redacted: () => Redacted,
  RedactedFromValue: () => RedactedFromValue,
  RedactedReviver: () => RedactedReviver,
  RegExp: () => RegExp3,
  RegExpReviver: () => RegExpReviver,
  Result: () => Result,
  ResultReviver: () => ResultReviver,
  SchemaError: () => SchemaError,
  StandardSchemaV1FailureResult: () => StandardSchemaV1FailureResult,
  String: () => String5,
  StringFromBase64: () => StringFromBase64,
  StringFromBase64Url: () => StringFromBase64Url,
  StringFromHex: () => StringFromHex,
  StringFromUriComponent: () => StringFromUriComponent,
  Struct: () => Struct,
  StructWithRest: () => StructWithRest,
  Symbol: () => Symbol3,
  TaggedClass: () => TaggedClass,
  TaggedError: () => TaggedError3,
  TaggedStruct: () => TaggedStruct,
  TaggedUnion: () => TaggedUnion,
  TemplateLiteral: () => TemplateLiteral2,
  TemplateLiteralParser: () => TemplateLiteralParser,
  TimeZone: () => TimeZone,
  TimeZoneFromString: () => TimeZoneFromString,
  TimeZoneNamed: () => TimeZoneNamed,
  TimeZoneNamedFromString: () => TimeZoneNamedFromString,
  TimeZoneNamedReviver: () => TimeZoneNamedReviver,
  TimeZoneOffset: () => TimeZoneOffset,
  TimeZoneOffsetReviver: () => TimeZoneOffsetReviver,
  TimeZoneReviver: () => TimeZoneReviver,
  Tree: () => Tree,
  Trim: () => Trim,
  Trimmed: () => Trimmed,
  Tuple: () => Tuple,
  TupleWithRest: () => TupleWithRest,
  URL: () => URL2,
  URLFromString: () => URLFromString,
  URLReviver: () => URLReviver,
  URLSearchParams: () => URLSearchParams2,
  URLSearchParamsReviver: () => URLSearchParamsReviver,
  Uint8Array: () => Uint8Array2,
  Uint8ArrayFromBase64: () => Uint8ArrayFromBase64,
  Uint8ArrayFromBase64Url: () => Uint8ArrayFromBase64Url,
  Uint8ArrayFromHex: () => Uint8ArrayFromHex,
  Uint8ArrayReviver: () => Uint8ArrayReviver,
  Undefined: () => Undefined2,
  UndefinedOr: () => UndefinedOr,
  Union: () => Union2,
  UniqueArray: () => UniqueArray,
  UniqueSymbol: () => UniqueSymbol2,
  Unknown: () => Unknown2,
  UnknownFromJsonString: () => UnknownFromJsonString,
  Void: () => Void2,
  annotate: () => annotate2,
  annotateEncoded: () => annotateEncoded,
  annotateKey: () => annotateKey2,
  asserts: () => asserts2,
  brand: () => brand2,
  catchDecoding: () => catchDecoding,
  catchDecodingWithContext: () => catchDecodingWithContext,
  catchEncoding: () => catchEncoding,
  catchEncodingWithContext: () => catchEncodingWithContext,
  check: () => check,
  declare: () => declare,
  declareConstructor: () => declareConstructor,
  decode: () => decode,
  decodeEffect: () => decodeEffect2,
  decodeExit: () => decodeExit,
  decodeOption: () => decodeOption2,
  decodePromise: () => decodePromise,
  decodeResult: () => decodeResult,
  decodeSync: () => decodeSync2,
  decodeTo: () => decodeTo2,
  decodeUnknownEffect: () => decodeUnknownEffect2,
  decodeUnknownExit: () => decodeUnknownExit2,
  decodeUnknownOption: () => decodeUnknownOption2,
  decodeUnknownPromise: () => decodeUnknownPromise,
  decodeUnknownResult: () => decodeUnknownResult2,
  decodeUnknownSync: () => decodeUnknownSync2,
  encode: () => encode,
  encodeEffect: () => encodeEffect,
  encodeExit: () => encodeExit,
  encodeKeys: () => encodeKeys,
  encodeOption: () => encodeOption2,
  encodePromise: () => encodePromise,
  encodeResult: () => encodeResult,
  encodeSync: () => encodeSync2,
  encodeTo: () => encodeTo,
  encodeUnknownEffect: () => encodeUnknownEffect2,
  encodeUnknownExit: () => encodeUnknownExit2,
  encodeUnknownOption: () => encodeUnknownOption2,
  encodeUnknownPromise: () => encodeUnknownPromise,
  encodeUnknownResult: () => encodeUnknownResult2,
  encodeUnknownSync: () => encodeUnknownSync2,
  extendTo: () => extendTo,
  fieldsAssign: () => fieldsAssign,
  flip: () => flip4,
  fromBrand: () => fromBrand,
  fromFormData: () => fromFormData2,
  fromJsonString: () => fromJsonString2,
  fromURLSearchParams: () => fromURLSearchParams2,
  instanceOf: () => instanceOf,
  is: () => is2,
  isBase64: () => isBase64,
  isBase64Reviver: () => isBase64Reviver,
  isBase64Url: () => isBase64Url,
  isBase64UrlReviver: () => isBase64UrlReviver,
  isBetween: () => isBetween2,
  isBetweenBigDecimal: () => isBetweenBigDecimal,
  isBetweenBigInt: () => isBetweenBigInt,
  isBetweenBigIntReviver: () => isBetweenBigIntReviver,
  isBetweenDate: () => isBetweenDate,
  isBetweenDateReviver: () => isBetweenDateReviver,
  isBetweenReviver: () => isBetweenReviver,
  isCapitalized: () => isCapitalized,
  isCapitalizedReviver: () => isCapitalizedReviver,
  isEndsWith: () => isEndsWith,
  isEndsWithReviver: () => isEndsWithReviver,
  isFinite: () => isFinite3,
  isFiniteReviver: () => isFiniteReviver,
  isGUID: () => isGUID,
  isGUIDReviver: () => isGUIDReviver,
  isGreaterThan: () => isGreaterThan4,
  isGreaterThanBigDecimal: () => isGreaterThanBigDecimal,
  isGreaterThanBigInt: () => isGreaterThanBigInt,
  isGreaterThanBigIntReviver: () => isGreaterThanBigIntReviver,
  isGreaterThanDate: () => isGreaterThanDate,
  isGreaterThanDateReviver: () => isGreaterThanDateReviver,
  isGreaterThanOrEqualTo: () => isGreaterThanOrEqualTo3,
  isGreaterThanOrEqualToBigDecimal: () => isGreaterThanOrEqualToBigDecimal,
  isGreaterThanOrEqualToBigInt: () => isGreaterThanOrEqualToBigInt,
  isGreaterThanOrEqualToBigIntReviver: () => isGreaterThanOrEqualToBigIntReviver,
  isGreaterThanOrEqualToDate: () => isGreaterThanOrEqualToDate,
  isGreaterThanOrEqualToDateReviver: () => isGreaterThanOrEqualToDateReviver,
  isGreaterThanOrEqualToReviver: () => isGreaterThanOrEqualToReviver,
  isGreaterThanReviver: () => isGreaterThanReviver,
  isIncludes: () => isIncludes,
  isIncludesReviver: () => isIncludesReviver,
  isInt: () => isInt,
  isInt32: () => isInt32,
  isIntReviver: () => isIntReviver,
  isLengthBetween: () => isLengthBetween,
  isLengthBetweenReviver: () => isLengthBetweenReviver,
  isLessThan: () => isLessThan4,
  isLessThanBigDecimal: () => isLessThanBigDecimal,
  isLessThanBigInt: () => isLessThanBigInt,
  isLessThanBigIntReviver: () => isLessThanBigIntReviver,
  isLessThanDate: () => isLessThanDate,
  isLessThanDateReviver: () => isLessThanDateReviver,
  isLessThanOrEqualTo: () => isLessThanOrEqualTo4,
  isLessThanOrEqualToBigDecimal: () => isLessThanOrEqualToBigDecimal,
  isLessThanOrEqualToBigInt: () => isLessThanOrEqualToBigInt,
  isLessThanOrEqualToBigIntReviver: () => isLessThanOrEqualToBigIntReviver,
  isLessThanOrEqualToDate: () => isLessThanOrEqualToDate,
  isLessThanOrEqualToDateReviver: () => isLessThanOrEqualToDateReviver,
  isLessThanOrEqualToReviver: () => isLessThanOrEqualToReviver,
  isLessThanReviver: () => isLessThanReviver,
  isLowercased: () => isLowercased,
  isLowercasedReviver: () => isLowercasedReviver,
  isMaxLength: () => isMaxLength,
  isMaxLengthReviver: () => isMaxLengthReviver,
  isMaxProperties: () => isMaxProperties,
  isMaxPropertiesReviver: () => isMaxPropertiesReviver,
  isMaxSize: () => isMaxSize,
  isMaxSizeReviver: () => isMaxSizeReviver,
  isMinLength: () => isMinLength,
  isMinLengthReviver: () => isMinLengthReviver,
  isMinProperties: () => isMinProperties,
  isMinPropertiesReviver: () => isMinPropertiesReviver,
  isMinSize: () => isMinSize,
  isMinSizeReviver: () => isMinSizeReviver,
  isMultipleOf: () => isMultipleOf,
  isMultipleOfReviver: () => isMultipleOfReviver,
  isNonEmpty: () => isNonEmpty,
  isPattern: () => isPattern2,
  isPatternReviver: () => isPatternReviver,
  isPropertiesLengthBetween: () => isPropertiesLengthBetween,
  isPropertiesLengthBetweenReviver: () => isPropertiesLengthBetweenReviver,
  isPropertyNames: () => isPropertyNames,
  isPropertyNamesReviver: () => isPropertyNamesReviver,
  isSchema: () => isSchema,
  isSchemaError: () => isSchemaError,
  isSizeBetween: () => isSizeBetween,
  isSizeBetweenReviver: () => isSizeBetweenReviver,
  isStartsWith: () => isStartsWith,
  isStartsWithReviver: () => isStartsWithReviver,
  isStringBigInt: () => isStringBigInt2,
  isStringBigIntReviver: () => isStringBigIntReviver,
  isStringFinite: () => isStringFinite2,
  isStringFiniteReviver: () => isStringFiniteReviver,
  isStringSymbol: () => isStringSymbol2,
  isStringSymbolReviver: () => isStringSymbolReviver,
  isTrimmed: () => isTrimmed,
  isTrimmedReviver: () => isTrimmedReviver,
  isULID: () => isULID,
  isULIDReviver: () => isULIDReviver,
  isUUID: () => isUUID,
  isUUIDReviver: () => isUUIDReviver,
  isUint32: () => isUint32,
  isUncapitalized: () => isUncapitalized,
  isUncapitalizedReviver: () => isUncapitalizedReviver,
  isUnique: () => isUnique,
  isUniqueReviver: () => isUniqueReviver,
  isUppercased: () => isUppercased,
  isUppercasedReviver: () => isUppercasedReviver,
  link: () => link,
  make: () => make30,
  makeFilter: () => makeFilter2,
  makeFilterGroup: () => makeFilterGroup,
  makeIsBetween: () => makeIsBetween,
  makeIsGreaterThan: () => makeIsGreaterThan,
  makeIsGreaterThanOrEqualTo: () => makeIsGreaterThanOrEqualTo,
  makeIsLessThan: () => makeIsLessThan,
  makeIsLessThanOrEqualTo: () => makeIsLessThanOrEqualTo,
  makeIsMultipleOf: () => makeIsMultipleOf,
  middlewareDecoding: () => middlewareDecoding2,
  middlewareEncoding: () => middlewareEncoding2,
  mutable: () => mutable,
  mutableKey: () => mutableKey2,
  optional: () => optional2,
  optionalKey: () => optionalKey2,
  overrideToCodecIso: () => overrideToCodecIso,
  overrideToEquivalence: () => overrideToEquivalence,
  overrideToFormatter: () => overrideToFormatter,
  readonlyKey: () => readonlyKey,
  refine: () => refine,
  required: () => required,
  requiredKey: () => requiredKey,
  resolveAnnotations: () => resolveAnnotations,
  resolveAnnotationsKey: () => resolveAnnotationsKey,
  revealBottom: () => revealBottom,
  revealCodec: () => revealCodec,
  suspend: () => suspend6,
  tag: () => tag,
  tagDefaultOmit: () => tagDefaultOmit,
  toArbitrary: () => toArbitrary,
  toCodecArrayFromSingle: () => toCodecArrayFromSingle,
  toCodecIso: () => toCodecIso,
  toCodecJson: () => toCodecJson,
  toCodecJsonAST: () => toCodecJsonAST,
  toCodecStringTree: () => toCodecStringTree,
  toDifferJsonPatch: () => toDifferJsonPatch,
  toEncoded: () => toEncoded2,
  toEncoderXml: () => toEncoderXml,
  toEquivalence: () => toEquivalence2,
  toFormatter: () => toFormatter,
  toIso: () => toIso,
  toIsoFocus: () => toIsoFocus,
  toIsoSource: () => toIsoSource,
  toJsonSchemaDocument: () => toJsonSchemaDocument2,
  toRepresentation: () => toRepresentation2,
  toStandardJSONSchemaV1: () => toStandardJSONSchemaV1,
  toStandardSchemaV1: () => toStandardSchemaV1,
  toTaggedUnion: () => toTaggedUnion,
  toType: () => toType2,
  withConstructorDefault: () => withConstructorDefault2,
  withDecodingDefault: () => withDecodingDefault,
  withDecodingDefaultKey: () => withDecodingDefaultKey,
  withDecodingDefaultType: () => withDecodingDefaultType,
  withDecodingDefaultTypeKey: () => withDecodingDefaultTypeKey
});

// node_modules/effect/dist/BigDecimal.js
var FINITE_INT_REGEXP = /^[+-]?\d+$/;
var TypeId27 = "~effect/BigDecimal";
var BigDecimalProto = {
  [TypeId27]: TypeId27,
  [symbol]() {
    const normalized = normalize(this);
    return combine(hash(normalized.value), number(normalized.scale));
  },
  [symbol2](that) {
    return isBigDecimal(that) && equals3(this, that);
  },
  toString() {
    return `BigDecimal(${format2(this)})`;
  },
  toJSON() {
    return {
      _id: "BigDecimal",
      value: String(this.value),
      scale: this.scale
    };
  },
  [NodeInspectSymbol]() {
    return this.toJSON();
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var isBigDecimal = (u) => hasProperty(u, TypeId27);
var make20 = (value, scale) => {
  const o = Object.create(BigDecimalProto);
  o.value = value;
  o.scale = scale;
  return o;
};
var makeNormalizedUnsafe = (value, scale) => {
  if (value !== bigint03 && value % bigint102 === bigint03) {
    throw new RangeError("Value must be normalized");
  }
  const o = make20(value, scale);
  o.normalized = o;
  return o;
};
var bigint03 = /* @__PURE__ */ BigInt(0);
var bigint12 = /* @__PURE__ */ BigInt(1);
var bigint_1 = /* @__PURE__ */ BigInt(-1);
var bigint102 = /* @__PURE__ */ BigInt(10);
var zero2 = /* @__PURE__ */ makeNormalizedUnsafe(bigint03, 0);
var normalize = (self) => {
  if (self.normalized === undefined) {
    if (self.value === bigint03) {
      self.normalized = zero2;
    } else {
      const digits = `${self.value}`;
      let trail = 0;
      for (let i = digits.length - 1;i >= 0; i--) {
        if (digits[i] === "0") {
          trail++;
        } else {
          break;
        }
      }
      if (trail === 0) {
        self.normalized = self;
      }
      const value = BigInt(digits.substring(0, digits.length - trail));
      const scale = self.scale - trail;
      self.normalized = makeNormalizedUnsafe(value, scale);
    }
  }
  return self.normalized;
};
var scale = /* @__PURE__ */ dual(2, (self, scale2) => {
  if (scale2 > self.scale) {
    return make20(self.value * bigint102 ** BigInt(scale2 - self.scale), scale2);
  }
  if (scale2 < self.scale) {
    return make20(self.value / bigint102 ** BigInt(self.scale - scale2), scale2);
  }
  return self;
});
var sum2 = /* @__PURE__ */ dual(2, (self, that) => {
  if (that.value === bigint03) {
    return self;
  }
  if (self.value === bigint03) {
    return that;
  }
  if (self.scale > that.scale) {
    return make20(scale(that, self.scale).value + self.value, self.scale);
  }
  if (self.scale < that.scale) {
    return make20(scale(self, that.scale).value + that.value, that.scale);
  }
  return make20(self.value + that.value, self.scale);
});
var Order2 = /* @__PURE__ */ make4((self, that) => {
  const scmp = Number2(sign(self), sign(that));
  if (scmp !== 0) {
    return scmp;
  }
  if (self.scale > that.scale) {
    return BigInt2(self.value, scale(that, self.scale).value);
  }
  if (self.scale < that.scale) {
    return BigInt2(scale(self, that.scale).value, that.value);
  }
  return BigInt2(self.value, that.value);
});
var isLessThan2 = /* @__PURE__ */ isLessThan(Order2);
var isGreaterThan2 = /* @__PURE__ */ isGreaterThan(Order2);
var sign = (n) => n.value === bigint03 ? 0 : n.value < bigint03 ? -1 : 1;
var abs = (n) => n.value < bigint03 ? make20(-n.value, n.scale) : n;
var Equivalence3 = /* @__PURE__ */ make3((self, that) => {
  if (self.scale > that.scale) {
    return scale(that, self.scale).value === self.value;
  }
  if (self.scale < that.scale) {
    return scale(self, that.scale).value === that.value;
  }
  return self.value === that.value;
});
var equals3 = /* @__PURE__ */ dual(2, (self, that) => Equivalence3(self, that));
var fromString = (s) => {
  if (s === "") {
    return some2(zero2);
  }
  let base;
  let exp;
  const seperator = s.search(/[eE]/);
  if (seperator !== -1) {
    const trail = s.slice(seperator + 1);
    base = s.slice(0, seperator);
    exp = Number(trail);
    if (base === "" || !Number.isSafeInteger(exp) || !FINITE_INT_REGEXP.test(trail)) {
      return none2();
    }
  } else {
    base = s;
    exp = 0;
  }
  let digits;
  let offset;
  const dot = base.search(/\./);
  if (dot !== -1) {
    const lead = base.slice(0, dot);
    const trail = base.slice(dot + 1);
    digits = `${lead}${trail}`;
    offset = trail.length;
  } else {
    digits = base;
    offset = 0;
  }
  if (!FINITE_INT_REGEXP.test(digits)) {
    return none2();
  }
  const scale2 = offset - exp;
  if (!Number.isSafeInteger(scale2)) {
    return none2();
  }
  return some2(make20(BigInt(digits), scale2));
};
var format2 = (n) => {
  const normalized = normalize(n);
  if (Math.abs(normalized.scale) >= 16) {
    return toExponential(normalized);
  }
  const negative = normalized.value < bigint03;
  const absolute = negative ? `${normalized.value}`.substring(1) : `${normalized.value}`;
  let before;
  let after;
  if (normalized.scale >= absolute.length) {
    before = "0";
    after = "0".repeat(normalized.scale - absolute.length) + absolute;
  } else {
    const location = absolute.length - normalized.scale;
    if (location > absolute.length) {
      const zeros = location - absolute.length;
      before = `${absolute}${"0".repeat(zeros)}`;
      after = "";
    } else {
      after = absolute.slice(location);
      before = absolute.slice(0, location);
    }
  }
  const complete = after === "" ? before : `${before}.${after}`;
  return negative ? `-${complete}` : complete;
};
var toExponential = (n) => {
  if (isZero2(n)) {
    return "0e+0";
  }
  const normalized = normalize(n);
  const digits = `${abs(normalized).value}`;
  const head3 = digits.slice(0, 1);
  const tail = digits.slice(1);
  let output = `${isNegative(normalized) ? "-" : ""}${head3}`;
  if (tail !== "") {
    output += `.${tail}`;
  }
  const exp = tail.length - normalized.scale;
  return `${output}e${exp >= 0 ? "+" : ""}${exp}`;
};
var isZero2 = (n) => n.value === bigint03;
var isNegative = (n) => n.value < bigint03;
var isPositive = (n) => n.value > bigint03;
var isBigDecimalArgs = (args2) => isBigDecimal(args2[0]);
var truncate = /* @__PURE__ */ dual(isBigDecimalArgs, (self, scale2 = 0) => {
  if (self.scale <= scale2) {
    return self;
  }
  return make20(self.value / bigint102 ** BigInt(self.scale - scale2), scale2);
});
var ceil = /* @__PURE__ */ dual(isBigDecimalArgs, (self, scale2 = 0) => {
  const truncated = truncate(self, scale2);
  if (isPositive(self) && isLessThan2(truncated, self)) {
    return sum2(truncated, make20(bigint12, scale2));
  }
  return truncated;
});
var floor = /* @__PURE__ */ dual(isBigDecimalArgs, (self, scale2 = 0) => {
  const truncated = truncate(self, scale2);
  if (isNegative(self) && isGreaterThan2(truncated, self)) {
    return sum2(truncated, make20(bigint_1, scale2));
  }
  return truncated;
});

// node_modules/effect/dist/DateTime.js
var isDateTime2 = isDateTime;
var isTimeZone2 = isTimeZone;
var isTimeZoneOffset2 = isTimeZoneOffset;
var isTimeZoneNamed2 = isTimeZoneNamed;
var isUtc2 = isUtc;
var isZoned2 = isZoned;
var Equivalence4 = Equivalence2;
var Order3 = Order;
var fromDateUnsafe2 = fromDateUnsafe;
var makeZonedUnsafe2 = makeZonedUnsafe;
var make21 = make8;
var makeZonedFromString2 = makeZonedFromString;
var toUtc2 = toUtc;
var zoneMakeNamedUnsafe2 = zoneMakeNamedUnsafe;
var zoneMakeOffset2 = zoneMakeOffset;
var zoneMakeNamed2 = zoneMakeNamed;
var zoneFromString2 = zoneFromString;
var zoneToString2 = zoneToString;
var toDateUtc2 = toDateUtc;
var toEpochMillis2 = toEpochMillis;
var formatIso2 = formatIso;
var formatIsoZoned2 = formatIsoZoned;

// node_modules/effect/dist/internal/graph.js
var TypeId28 = "~effect/collections/Graph";
var toImpl = (graph) => graph;
var edgeEquals = (type, self, that) => (type === "directed" ? self.source === that.source && self.target === that.target : self.source === that.source && self.target === that.target || self.source === that.target && self.target === that.source) && equals(self.data, that.data);
var edgeHash = (type, edge) => type === "directed" ? hash(edge) : optimize(hash(edge.data) ^ hash(edge.source) + hash(edge.target));
var ProtoGraph = {
  [TypeId28]: {
    _N: (_) => _,
    _E: (_) => _
  },
  [Symbol.iterator]() {
    return this.nodes[Symbol.iterator]();
  },
  [NodeInspectSymbol]() {
    return this.toJSON();
  },
  [symbol2](that) {
    if (hasProperty(that, TypeId28)) {
      const thatImpl = toImpl(that);
      if (this.nodes.size !== thatImpl.nodes.size || this.edges.size !== thatImpl.edges.size || this.type !== thatImpl.type) {
        return false;
      }
      for (const [nodeIndex, nodeData] of this.nodes) {
        if (!thatImpl.nodes.has(nodeIndex) || !equals(nodeData, thatImpl.nodes.get(nodeIndex))) {
          return false;
        }
      }
      for (const [edgeIndex, edgeData] of this.edges) {
        const otherEdge = thatImpl.edges.get(edgeIndex);
        if (otherEdge === undefined || !edgeEquals(this.type, edgeData, otherEdge)) {
          return false;
        }
      }
      return true;
    }
    return false;
  },
  [symbol]() {
    let hash2 = string("Graph");
    hash2 = hash2 ^ string(this.type);
    hash2 = hash2 ^ number(this.nodes.size);
    hash2 = hash2 ^ number(this.edges.size);
    for (const [nodeIndex, nodeData] of this.nodes) {
      hash2 = hash2 ^ hash(nodeIndex) + hash(nodeData);
    }
    for (const [edgeIndex, edgeData] of this.edges) {
      hash2 = hash2 ^ hash(edgeIndex) + edgeHash(this.type, edgeData);
    }
    return hash2;
  },
  toJSON() {
    return {
      _id: "Graph",
      nodeCount: this.nodes.size,
      edgeCount: this.edges.size,
      type: this.type
    };
  },
  toString() {
    return `Graph(${this.type}, ${this.nodes.size}, ${this.edges.size})`;
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var make22 = (type, mutable) => {
  const graph = Object.create(ProtoGraph);
  graph.type = type;
  graph.mutable = mutable;
  graph.transforming = false;
  graph.nodes = new Map;
  graph.edges = new Map;
  graph.adjacency = new Map;
  graph.reverseAdjacency = new Map;
  graph.nextNodeIndex = 0;
  graph.nextEdgeIndex = 0;
  graph.acyclic = some2(true);
  return graph;
};
var snapshot = (graph) => {
  const impl = toImpl(graph);
  return {
    type: graph.type,
    nodes: Array.from(impl.nodes, ([index, data]) => ({
      index,
      data
    })).sort((a, b) => a.index - b.index),
    edges: Array.from(impl.edges, ([index, edge]) => ({
      index,
      source: edge.source,
      target: edge.target,
      data: edge.data
    })).sort((a, b) => a.index - b.index)
  };
};
var hydrate = (snapshot2) => {
  const graph = make22(snapshot2.type, false);
  for (const node of snapshot2.nodes) {
    graph.nodes.set(node.index, node.data);
    graph.adjacency.set(node.index, []);
    graph.reverseAdjacency.set(node.index, []);
  }
  for (const edge of snapshot2.edges) {
    graph.edges.set(edge.index, {
      source: edge.source,
      target: edge.target,
      data: edge.data
    });
    graph.adjacency.get(edge.source).push(edge.index);
    graph.reverseAdjacency.get(edge.target).push(edge.index);
    if (snapshot2.type === "undirected") {
      graph.adjacency.get(edge.target).push(edge.index);
      graph.reverseAdjacency.get(edge.source).push(edge.index);
    }
  }
  graph.nextNodeIndex = snapshot2.nodes.length === 0 ? 0 : snapshot2.nodes[snapshot2.nodes.length - 1].index + 1;
  graph.nextEdgeIndex = snapshot2.edges.length === 0 ? 0 : snapshot2.edges[snapshot2.edges.length - 1].index + 1;
  graph.acyclic = none2();
  return graph;
};

// node_modules/effect/dist/Graph.js
var TypeId29 = TypeId28;
var isGraph = (u) => hasProperty(u, TypeId29);
class EdgeIdentity {
  type;
  source;
  target;
  identity;
  constructor(type, source, target, identity2) {
    this.type = type;
    this.source = source;
    this.target = target;
    this.identity = identity2;
  }
  [symbol2](that) {
    if (!(that instanceof EdgeIdentity) || this.type !== that.type || !equals(this.identity, that.identity)) {
      return false;
    }
    if (this.type === "directed") {
      return equals(this.source, that.source) && equals(this.target, that.target);
    }
    return equals(this.source, that.source) && equals(this.target, that.target) || equals(this.source, that.target) && equals(this.target, that.source);
  }
  [symbol]() {
    const hash2 = hash(this.identity);
    return this.type === "directed" ? combine(hash(this.target))(combine(hash(this.source))(hash2)) : optimize(hash2 ^ hash(this.source) + hash(this.target));
  }
}
class Walker {
  [Symbol.iterator];
  visit;
  constructor(visit) {
    this.visit = visit;
    this[Symbol.iterator] = () => visit((index, data) => [index, data])[Symbol.iterator]();
  }
}

// node_modules/effect/dist/internal/hashMap.js
var HashMapTypeId = "~effect/collections/HashMap";
var SHIFT = 5;
var BUCKET_SIZE = 1 << SHIFT;
var MIN_ARRAY_NODE = BUCKET_SIZE / 4;
var MAX_INDEX_NODE = BUCKET_SIZE / 2;
var BITMAP_INDEX_MASK = BUCKET_SIZE - 1;
var popcount = (n) => {
  n = n - (n >>> 1 & 1431655765);
  n = (n & 858993459) + (n >>> 2 & 858993459);
  return (n + (n >>> 4) & 252645135) * 16843009 >>> 24;
};
var mask = (hash2, shift) => hash2 >>> shift & BITMAP_INDEX_MASK;
var bitpos = (hash2, shift) => 1 << mask(hash2, shift);
var index = (bitmap, bit) => popcount(bitmap & bit - 1);
function mergeLeaves(edit, shift, hash1, node1, hash2, node2) {
  if (shift > 32) {
    throw new Error("HashMap: max depth exceeded");
  }
  const bit1 = bitpos(hash1, shift);
  const bit2 = bitpos(hash2, shift);
  if (bit1 === bit2) {
    const child = mergeLeaves(edit, shift + SHIFT, hash1, node1, hash2, node2);
    return new IndexedNode(edit, bit1, [child]);
  }
  const bitmap = bit1 | bit2;
  const children = bit1 >>> 0 < bit2 >>> 0 ? [node1, node2] : [node2, node1];
  return new IndexedNode(edit, bitmap, children);
}

class Node {
  canEdit(edit) {
    return this.edit === edit;
  }
}

class EmptyNode extends Node {
  _tag = "EmptyNode";
  edit = 0;
  get size() {
    return 0;
  }
  get(_shift, _hash, _key) {
    return none2();
  }
  has(_shift, _hash, _key) {
    return false;
  }
  set(edit, _shift, hash2, key, value, added) {
    added.value = true;
    return new LeafNode(edit, hash2, key, value);
  }
  remove(_edit, _shift, _hash, _key, _removed) {
    return this;
  }
  iterator() {
    return [][Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.iterator();
  }
  canEdit(_edit) {
    return false;
  }
}

class LeafNode extends Node {
  _tag = "LeafNode";
  edit;
  hash;
  key;
  value;
  constructor(edit, hash2, key, value) {
    super();
    this.edit = edit;
    this.hash = hash2;
    this.key = key;
    this.value = value;
  }
  get size() {
    return 1;
  }
  get(_shift, hash2, key) {
    if (this.hash === hash2 && equals(this.key, key)) {
      return some2(this.value);
    }
    return none2();
  }
  has(_shift, hash2, key) {
    return this.hash === hash2 && equals(this.key, key);
  }
  set(edit, shift, hash2, key, value, added) {
    if (this.hash === hash2 && equals(this.key, key)) {
      if (equals(this.value, value)) {
        return this;
      }
      if (this.canEdit(edit)) {
        this.value = value;
        return this;
      }
      return new LeafNode(edit, hash2, key, value);
    }
    added.value = true;
    if (this.hash === hash2) {
      return new CollisionNode(edit, hash2, [[this.key, this.value], [key, value]]);
    }
    const newBit = bitpos(hash2, shift);
    const existingBit = bitpos(this.hash, shift);
    if (newBit === existingBit) {
      return new IndexedNode(edit, newBit, [this.set(edit, shift + SHIFT, hash2, key, value, added)]);
    }
    const bitmap = newBit | existingBit;
    const nodes = newBit >>> 0 < existingBit >>> 0 ? [new LeafNode(edit, hash2, key, value), this] : [this, new LeafNode(edit, hash2, key, value)];
    return new IndexedNode(edit, bitmap, nodes);
  }
  remove(_edit, _shift, hash2, key, removed) {
    if (this.hash === hash2 && equals(this.key, key)) {
      removed.value = true;
      return;
    }
    return this;
  }
  iterator() {
    return [[this.key, this.value]][Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.iterator();
  }
}

class CollisionNode extends Node {
  _tag = "CollisionNode";
  edit;
  hash;
  entries;
  constructor(edit, hash2, entries) {
    super();
    this.edit = edit;
    this.hash = hash2;
    this.entries = entries;
  }
  get size() {
    return this.entries.length;
  }
  get(_shift, hash2, key) {
    if (this.hash !== hash2) {
      return none2();
    }
    for (const [k, v] of this.entries) {
      if (equals(k, key)) {
        return some2(v);
      }
    }
    return none2();
  }
  has(_shift, hash2, key) {
    if (this.hash !== hash2) {
      return false;
    }
    for (const [k] of this.entries) {
      if (equals(k, key)) {
        return true;
      }
    }
    return false;
  }
  set(edit, shift, hash2, key, value, added) {
    if (this.hash !== hash2) {
      added.value = true;
      return mergeLeaves(edit, shift, this.hash, this, hash2, new LeafNode(edit, hash2, key, value));
    }
    for (let i = 0;i < this.entries.length; i++) {
      if (equals(this.entries[i][0], key)) {
        if (equals(this.entries[i][1], value)) {
          return this;
        }
        if (this.canEdit(edit)) {
          this.entries[i] = [key, value];
          return this;
        }
        const newEntries = [...this.entries];
        newEntries[i] = [key, value];
        return new CollisionNode(edit, this.hash, newEntries);
      }
    }
    added.value = true;
    if (this.canEdit(edit)) {
      this.entries.push([key, value]);
      return this;
    }
    return new CollisionNode(edit, this.hash, [...this.entries, [key, value]]);
  }
  remove(edit, _shift, hash2, key, removed) {
    if (this.hash !== hash2) {
      return this;
    }
    const idx = this.entries.findIndex(([k]) => equals(k, key));
    if (idx === -1) {
      return this;
    }
    removed.value = true;
    if (this.entries.length === 1) {
      return;
    }
    if (this.entries.length === 2) {
      const remaining = this.entries[idx === 0 ? 1 : 0];
      return new LeafNode(edit, this.hash, remaining[0], remaining[1]);
    }
    if (this.canEdit(edit)) {
      this.entries.splice(idx, 1);
      return this;
    }
    const newEntries = [...this.entries];
    newEntries.splice(idx, 1);
    return new CollisionNode(edit, this.hash, newEntries);
  }
  iterator() {
    return this.entries[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.iterator();
  }
}

class IndexedNode extends Node {
  _tag = "IndexedNode";
  edit;
  _size;
  bitmap;
  children;
  constructor(edit, bitmap, children) {
    super();
    this.edit = edit;
    this.bitmap = bitmap;
    this.children = children;
  }
  get size() {
    if (this._size === undefined) {
      this._size = this.children.reduce((acc, child) => acc + child.size, 0);
    }
    return this._size;
  }
  get(shift, hash2, key) {
    const bit = bitpos(hash2, shift);
    if ((this.bitmap & bit) === 0) {
      return none2();
    }
    const idx = index(this.bitmap, bit);
    return this.children[idx].get(shift + SHIFT, hash2, key);
  }
  has(shift, hash2, key) {
    const bit = bitpos(hash2, shift);
    if ((this.bitmap & bit) === 0) {
      return false;
    }
    const idx = index(this.bitmap, bit);
    return this.children[idx].has(shift + SHIFT, hash2, key);
  }
  set(edit, shift, hash2, key, value, added) {
    const bit = bitpos(hash2, shift);
    const idx = index(this.bitmap, bit);
    if ((this.bitmap & bit) !== 0) {
      const child = this.children[idx];
      const newChild = child.set(edit, shift + SHIFT, hash2, key, value, added);
      if (child === newChild) {
        return this;
      }
      if (this.canEdit(edit)) {
        this.children[idx] = newChild;
        return this;
      }
      const newChildren = [...this.children];
      newChildren[idx] = newChild;
      return new IndexedNode(edit, this.bitmap, newChildren);
    } else {
      added.value = true;
      const newChild = new LeafNode(edit, hash2, key, value);
      const newBitmap = this.bitmap | bit;
      if (this.canEdit(edit)) {
        this.children.splice(idx, 0, newChild);
        this.bitmap = newBitmap;
        this._size = undefined;
        if (this.children.length > MAX_INDEX_NODE) {
          return this.expand(edit, newBitmap, this.children);
        }
        return this;
      }
      const newChildren = [...this.children];
      newChildren.splice(idx, 0, newChild);
      if (newChildren.length > MAX_INDEX_NODE) {
        return this.expand(edit, newBitmap, newChildren);
      }
      return new IndexedNode(edit, newBitmap, newChildren);
    }
  }
  remove(edit, shift, hash2, key, removed) {
    const bit = bitpos(hash2, shift);
    if ((this.bitmap & bit) === 0) {
      return this;
    }
    const idx = index(this.bitmap, bit);
    const child = this.children[idx];
    const newChild = child.remove(edit, shift + SHIFT, hash2, key, removed);
    if (!removed.value) {
      return this;
    }
    if (newChild === undefined) {
      const newBitmap = this.bitmap ^ bit;
      if (newBitmap === 0) {
        return;
      }
      if (this.children.length === 2) {
        const remaining = this.children[idx === 0 ? 1 : 0];
        if (remaining._tag === "LeafNode") {
          return remaining;
        }
      }
      if (this.canEdit(edit)) {
        this.children.splice(idx, 1);
        this.bitmap = newBitmap;
        this._size = undefined;
        return this;
      }
      const newChildren2 = [...this.children];
      newChildren2.splice(idx, 1);
      return new IndexedNode(edit, newBitmap, newChildren2);
    }
    if (child === newChild) {
      return this;
    }
    if (this.canEdit(edit)) {
      this.children[idx] = newChild;
      return this;
    }
    const newChildren = [...this.children];
    newChildren[idx] = newChild;
    return new IndexedNode(edit, this.bitmap, newChildren);
  }
  expand(edit, bitmap, children) {
    const nodes = new globalThis.Array(BUCKET_SIZE);
    let j = 0;
    for (let i = 0;i < BUCKET_SIZE; i++) {
      if ((bitmap & 1 << i) !== 0) {
        nodes[i] = children[j++];
      }
    }
    return new ArrayNode(edit, children.length, nodes);
  }
  iterator() {
    let childIndex = 0;
    let currentIterator;
    return {
      next: () => {
        while (childIndex < this.children.length) {
          if (!currentIterator) {
            currentIterator = this.children[childIndex].iterator();
          }
          const result4 = currentIterator.next();
          if (!result4.done) {
            return result4;
          }
          currentIterator = undefined;
          childIndex++;
        }
        return {
          done: true,
          value: undefined
        };
      }
    };
  }
  [Symbol.iterator]() {
    return this.iterator();
  }
}

class ArrayNode extends Node {
  _tag = "ArrayNode";
  edit;
  _size;
  count;
  children;
  constructor(edit, count, children) {
    super();
    this.edit = edit;
    this.count = count;
    this.children = children;
  }
  get size() {
    if (this._size === undefined) {
      this._size = this.children.reduce((acc, child) => acc + (child?.size ?? 0), 0);
    }
    return this._size;
  }
  get(shift, hash2, key) {
    const idx = mask(hash2, shift);
    const child = this.children[idx];
    return child ? child.get(shift + SHIFT, hash2, key) : none2();
  }
  has(shift, hash2, key) {
    const idx = mask(hash2, shift);
    const child = this.children[idx];
    return child ? child.has(shift + SHIFT, hash2, key) : false;
  }
  set(edit, shift, hash2, key, value, added) {
    const idx = mask(hash2, shift);
    const child = this.children[idx];
    if (child) {
      const newChild = child.set(edit, shift + SHIFT, hash2, key, value, added);
      if (child === newChild) {
        return this;
      }
      if (this.canEdit(edit)) {
        this.children[idx] = newChild;
        return this;
      }
      const newChildren = [...this.children];
      newChildren[idx] = newChild;
      return new ArrayNode(edit, this.count, newChildren);
    } else {
      added.value = true;
      const newChild = new LeafNode(edit, hash2, key, value);
      if (this.canEdit(edit)) {
        this.children[idx] = newChild;
        this.count++;
        this._size = undefined;
        return this;
      }
      const newChildren = [...this.children];
      newChildren[idx] = newChild;
      return new ArrayNode(edit, this.count + 1, newChildren);
    }
  }
  remove(edit, shift, hash2, key, removed) {
    const idx = mask(hash2, shift);
    const child = this.children[idx];
    if (!child) {
      return this;
    }
    const newChild = child.remove(edit, shift + SHIFT, hash2, key, removed);
    if (!removed.value) {
      return this;
    }
    const newCount = this.count - (newChild ? 0 : 1);
    if (newCount < MIN_ARRAY_NODE) {
      return this.pack(edit, idx, newChild);
    }
    if (child === newChild) {
      return this;
    }
    if (this.canEdit(edit)) {
      this.children[idx] = newChild;
      if (!newChild) {
        this.count = newCount;
      }
      this._size = undefined;
      return this;
    }
    const newChildren = [...this.children];
    newChildren[idx] = newChild;
    return new ArrayNode(edit, newCount, newChildren);
  }
  pack(edit, excludeIdx, newChild) {
    const children = [];
    let bitmap = 0;
    let bit = 1;
    for (let i = 0;i < this.children.length; i++) {
      const child = i === excludeIdx ? newChild : this.children[i];
      if (child) {
        children.push(child);
        bitmap |= bit;
      }
      bit <<= 1;
    }
    return new IndexedNode(edit, bitmap, children);
  }
  iterator() {
    let childIndex = 0;
    let currentIterator;
    return {
      next: () => {
        while (childIndex < this.children.length) {
          const child = this.children[childIndex];
          if (!child) {
            childIndex++;
            continue;
          }
          if (!currentIterator) {
            currentIterator = child.iterator();
          }
          const result4 = currentIterator.next();
          if (!result4.done) {
            return result4;
          }
          currentIterator = undefined;
          childIndex++;
        }
        return {
          done: true,
          value: undefined
        };
      }
    };
  }
  [Symbol.iterator]() {
    return this.iterator();
  }
}

class HashMapImpl {
  [HashMapTypeId] = HashMapTypeId;
  _editable;
  _edit;
  _root;
  _size;
  constructor(editable, edit, root, size3) {
    this._editable = editable;
    this._edit = edit;
    this._root = root;
    this._size = size3;
  }
  get size() {
    return this._size;
  }
  [Symbol.iterator]() {
    return this._root.iterator();
  }
  [symbol2](that) {
    if (isHashMap(that)) {
      const thatImpl = that;
      if (this.size !== thatImpl.size) {
        return false;
      }
      for (const [key, value] of this) {
        const otherValue = pipe(that, get8(key));
        if (isNone2(otherValue) || !equals(value, otherValue.value)) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
  [symbol]() {
    let hash2 = string("HashMap");
    for (const [key, value] of this) {
      hash2 = hash2 ^ hash(key) + hash(value);
    }
    return hash2;
  }
  [NodeInspectSymbol]() {
    return toJson(this);
  }
  toString() {
    return `HashMap(${format(Array.from(this))})`;
  }
  toJSON() {
    return {
      _id: "HashMap",
      values: Array.from(this).map(([k, v]) => [toJson(k), toJson(v)])
    };
  }
  pipe() {
    return pipeArguments(this, arguments);
  }
}
var emptyNode = /* @__PURE__ */ new EmptyNode;
var isHashMap = (u) => hasProperty(u, HashMapTypeId);
var empty9 = () => new HashMapImpl(false, 0, emptyNode, 0);
var fromIterable4 = (entries) => {
  let root = emptyNode;
  let size3 = 0;
  const added = {
    value: false
  };
  for (const [key, value] of entries) {
    const hash2 = hash(key);
    added.value = false;
    root = root.set(NaN, 0, hash2, key, value, added);
    if (added.value) {
      size3++;
    }
  }
  return new HashMapImpl(false, 0, root, size3);
};
var get8 = /* @__PURE__ */ dual(2, (self, key) => {
  const impl = self;
  return impl._root.get(0, hash(key), key);
});
var has2 = /* @__PURE__ */ dual(2, (self, key) => {
  const impl = self;
  return impl._root.has(0, hash(key), key);
});
var setHash = (self, key, hash2, value) => {
  const impl = self;
  const added = {
    value: false
  };
  const edit = impl._editable ? impl._edit : NaN;
  const newRoot = impl._root.set(edit, 0, hash2, key, value, added);
  if (impl._editable) {
    impl._root = newRoot;
    if (added.value) {
      impl._size++;
    }
    return self;
  }
  if (impl._root === newRoot) {
    return self;
  }
  return new HashMapImpl(false, impl._edit, newRoot, impl._size + (added.value ? 1 : 0));
};
var set4 = /* @__PURE__ */ dual(3, (self, key, value) => {
  return setHash(self, key, hash(key), value);
});
var keys3 = (self) => {
  const iterator = self[Symbol.iterator]();
  return {
    [Symbol.iterator]() {
      return this;
    },
    next() {
      const result4 = iterator.next();
      if (result4.done) {
        return {
          done: true,
          value: undefined
        };
      }
      return {
        done: false,
        value: result4.value[0]
      };
    }
  };
};
var entries = (self) => {
  const iterator = self[Symbol.iterator]();
  return {
    [Symbol.iterator]() {
      return this;
    },
    next() {
      return iterator.next();
    }
  };
};
var size3 = (self) => self.size;

// node_modules/effect/dist/HashMap.js
var isHashMap2 = isHashMap;
var fromIterable5 = fromIterable4;
var entries2 = entries;
var toEntries = (self) => Array.from(entries2(self));
var size4 = size3;

// node_modules/effect/dist/internal/hashSet.js
var HashSetTypeId = "~effect/collections/HashSet";
var HashSetProto = {
  [symbol]() {
    return hash(HashSetTypeId);
  },
  [symbol2](that) {
    return isHashSet(that) && size5(this) === size5(that) && every2(this, (value) => has3(that, value));
  },
  [Symbol.iterator]() {
    return keys3(keyMap(this));
  },
  toString() {
    return `HashSet(${format(Array.from(this))})`;
  },
  toJSON() {
    return {
      _id: "HashSet",
      values: toJson(Array.from(this))
    };
  },
  [NodeInspectSymbol]() {
    return this.toJSON();
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var makeImpl2 = (keyMap) => {
  const set5 = Object.create(HashSetProto);
  set5[HashSetTypeId] = HashSetTypeId;
  set5.keyMap = keyMap;
  return set5;
};
var isHashSet = (u) => hasProperty(u, HashSetTypeId);
var keyMap = (self) => self.keyMap;
var fromIterable6 = (values2) => {
  let map11 = empty9();
  for (const value of values2) {
    map11 = set4(map11, value, true);
  }
  return makeImpl2(map11);
};
var has3 = (self, value) => has2(keyMap(self), value);
var size5 = (self) => size3(keyMap(self));
var every2 = (self, predicate) => {
  for (const value of self) {
    if (!predicate(value)) {
      return false;
    }
  }
  return true;
};

// node_modules/effect/dist/HashSet.js
var fromIterable7 = fromIterable6;
var isHashSet2 = isHashSet;
var size6 = size5;

// node_modules/effect/dist/internal/schema/annotations.js
function resolve(ast) {
  return ast.checks ? ast.checks[ast.checks.length - 1].annotations : ast.annotations;
}
function resolveAt(key) {
  return (ast) => resolve(ast)?.[key];
}
var STRUCTURAL_ANNOTATION_KEY = "~structural";
var IDENTIFIER_FALLBACK_KEY = "~identifier";
var SENTINELS_ANNOTATION_KEY = "~sentinels";
var CONSTRUCTOR_ANNOTATION_KEY = "~constructor";
var jsonSchemaAnnotationKeys = ["title", "description", "default", "examples", "readOnly", "writeOnly", "format", "contentEncoding", "contentMediaType", "contentSchema"];
var resolveIdentifier = /* @__PURE__ */ resolveAt("identifier");
var resolveIdentifierFallback = /* @__PURE__ */ resolveAt(IDENTIFIER_FALLBACK_KEY);
var resolveTitle = /* @__PURE__ */ resolveAt("title");
var resolveBrands = /* @__PURE__ */ resolveAt("brands");
var getExpected = /* @__PURE__ */ memoize((ast) => {
  const identifier2 = resolve(ast)?.identifier;
  if (typeof identifier2 === "string")
    return identifier2;
  return ast.getExpected(getExpected);
});
var annotationExcludedKeys = /* @__PURE__ */ new Set([SENTINELS_ANNOTATION_KEY, STRUCTURAL_ANNOTATION_KEY, "representation", "arbitrary", "brands", "toJsonSchema", "toCode", "toArbitrary", "toEquivalence", "toFormatter", "toCodec", "toCodecJson", "toCodecStringTree", "toCodecIso"]);

// node_modules/effect/dist/internal/schema/parser.js
var missing = /* @__PURE__ */ Symbol();
var succeed9 = succeed4;
var missingExit = /* @__PURE__ */ succeed9(missing);
var sameExit = /* @__PURE__ */ succeed9(missing);
var toOption = (value) => value === missing ? none2() : some2(value);
var fromOptionExit = (option3) => option3._tag === "None" ? missingExit : succeed9(option3.value);

// node_modules/effect/dist/SchemaIssue.js
var TypeId30 = "~effect/SchemaIssue/Issue";
function isIssue(u) {
  return hasProperty(u, TypeId30) && u[TypeId30] === TypeId30;
}
function hasInput(issue) {
  return Object.hasOwn(issue, "input");
}

class Base {
  [TypeId30] = TypeId30;
  constructor(input, options) {
    if (options?.reportInput === true && input !== missing) {
      this.input = input;
    }
  }
}

class Filter extends Base {
  _tag = "Filter";
  filter;
  issue;
  constructor(filter11, issue, input, options) {
    super(input, options);
    this.filter = filter11;
    this.issue = issue;
  }
}

class Encoding extends Base {
  _tag = "Encoding";
  ast;
  issue;
  constructor(ast, issue, input, options) {
    super(input, options);
    this.ast = ast;
    this.issue = issue;
  }
}

class Pointer extends Base {
  _tag = "Pointer";
  path;
  issue;
  constructor(path, issue) {
    super();
    this.path = path;
    this.issue = issue;
  }
}

class MissingKey extends Base {
  _tag = "MissingKey";
  annotations;
  constructor(annotations) {
    super();
    this.annotations = annotations;
  }
}

class UnexpectedKey extends Base {
  _tag = "UnexpectedKey";
  ast;
  constructor(ast, input, options) {
    super(input, options);
    this.ast = ast;
  }
}

class Composite extends Base {
  _tag = "Composite";
  ast;
  issues;
  constructor(ast, issues, input, options) {
    super(input, options);
    this.ast = ast;
    this.issues = issues;
  }
}

class InvalidType extends Base {
  _tag = "InvalidType";
  ast;
  constructor(ast, input, options) {
    super(input, options);
    this.ast = ast;
  }
}

class InvalidValue extends Base {
  _tag = "InvalidValue";
  annotations;
  constructor(annotations, input, options) {
    super(input, options);
    this.annotations = annotations;
  }
}
function makeCompositeAtKey(compositeAst, pointerKey, pointerIssue, compositeInput, parseOptions) {
  return new Composite(compositeAst, [new Pointer([pointerKey], pointerIssue)], compositeInput, parseOptions);
}

class Forbidden extends Base {
  _tag = "Forbidden";
  annotations;
  constructor(annotations, input, options) {
    super(input, options);
    this.annotations = annotations;
  }
}

class AnyOf extends Base {
  _tag = "AnyOf";
  ast;
  issues;
  constructor(ast, issues, input, options) {
    super(input, options);
    this.ast = ast;
    this.issues = issues;
  }
}

class OneOf extends Base {
  _tag = "OneOf";
  ast;
  successes;
  constructor(ast, successes, input, options) {
    super(input, options);
    this.ast = ast;
    this.successes = successes;
  }
}
function makeFilterIssue(entry, input, options) {
  if (isIssue(entry)) {
    return entry;
  }
  if (typeof entry === "string") {
    return new InvalidValue({
      message: entry
    }, input, options);
  }
  const inner = typeof entry.issue === "string" ? new InvalidValue({
    message: entry.issue
  }, input, options) : entry.issue;
  return new Pointer(entry.path, inner);
}
function makeSingle(out, input, options) {
  if (out === undefined) {
    return;
  }
  if (typeof out === "boolean") {
    return out ? undefined : new InvalidValue(undefined, input, options);
  }
  return makeFilterIssue(out, input, options);
}
function normalizeFilterOutput(ast, out, input, options) {
  if (Array.isArray(out)) {
    if (!isReadonlyArrayNonEmpty(out)) {
      return;
    }
    return out.length === 1 ? makeFilterIssue(out[0], input, options) : new Composite(ast, map4(out, (entry) => makeFilterIssue(entry, input, options)), input, options);
  }
  return makeSingle(out, input, options);
}
var defaultLeafHook = (issue) => {
  const message = findMessage(issue);
  if (message !== undefined)
    return message;
  switch (issue._tag) {
    case "InvalidType":
      return getExpectedMessage(getExpected(issue.ast), issue);
    case "InvalidValue": {
      const expected = findExpected(issue);
      if (expected !== undefined)
        return getExpectedMessage(expected, issue);
      const input = formatInput(issue);
      return input === undefined ? "Expected a valid value" : `Invalid data ${input}`;
    }
    case "MissingKey":
      return "Missing key";
    case "UnexpectedKey": {
      const input = formatInput(issue);
      return input === undefined ? "Expected no excess property" : `Unexpected key with value ${input}`;
    }
    case "Forbidden":
      return "Forbidden operation";
    case "OneOf": {
      const input = formatInput(issue);
      return input === undefined ? "Expected exactly one member to match" : `Expected exactly one member to match the input ${input}`;
    }
  }
};
var defaultCheckHook = (issue) => findMessage(issue.issue) ?? findMessage(issue);
function makeFormatterStandardSchemaV1(options) {
  return (issue) => ({
    issues: toDefaultIssues(issue, [], options?.leafHook ?? defaultLeafHook, options?.checkHook ?? defaultCheckHook)
  });
}
function formatInput(issue) {
  return hasInput(issue) ? format(issue.input) : undefined;
}
function findExpected(issue) {
  const expected = issue.annotations?.expected;
  return typeof expected === "string" ? expected : undefined;
}
function getExpectedMessage(expected, issue) {
  const input = formatInput(issue);
  return input === undefined ? `Expected ${expected}` : `Expected ${expected}, got ${input}`;
}
function toDefaultIssues(issue, path, leafHook, checkHook) {
  switch (issue._tag) {
    case "Filter": {
      const message = checkHook(issue);
      if (message !== undefined) {
        return [{
          path,
          message
        }];
      }
      if (issue.issue._tag !== "InvalidValue") {
        return toDefaultIssues(issue.issue, path, leafHook, checkHook);
      }
      const expected = findExpected(issue.issue);
      return [{
        path,
        message: expected === undefined ? getExpectedMessage(formatCheck(issue.filter), issue) : getExpectedMessage(expected, issue.issue)
      }];
    }
    case "Encoding":
      return toDefaultIssues(issue.issue, path, leafHook, checkHook);
    case "Pointer":
      return toDefaultIssues(issue.issue, [...path, ...issue.path], leafHook, checkHook);
    case "Composite":
      return issue.issues.flatMap((issue2) => toDefaultIssues(issue2, path, leafHook, checkHook));
    case "AnyOf": {
      if (issue.issues.length === 0) {
        return [{
          path,
          message: findMessage(issue) ?? getExpectedMessage(getExpected(issue.ast), issue)
        }];
      }
      return issue.issues.flatMap((issue2) => toDefaultIssues(issue2, path, leafHook, checkHook));
    }
    default:
      return [{
        path,
        message: leafHook(issue)
      }];
  }
}
function formatCheck(check) {
  const expected = check.annotations?.expected;
  if (typeof expected === "string")
    return expected;
  switch (check._tag) {
    case "Filter":
      return "<filter>";
    case "FilterGroup":
      return check.checks.map((check2) => formatCheck(check2)).join(" & ");
  }
}
function makeFormatterDefault() {
  return (issue) => formatIssue(issue, "");
}
var defaultFormatter = /* @__PURE__ */ makeFormatterDefault();
function formatIssue(issue, path) {
  let message;
  switch (issue._tag) {
    case "Filter": {
      const annotated = defaultCheckHook(issue);
      if (annotated !== undefined) {
        message = annotated;
      } else {
        if (issue.issue._tag !== "InvalidValue") {
          return formatIssue(issue.issue, path);
        }
        const expected = findExpected(issue.issue);
        message = expected === undefined ? getExpectedMessage(formatCheck(issue.filter), issue) : getExpectedMessage(expected, issue.issue);
      }
      break;
    }
    case "Encoding":
      return formatIssue(issue.issue, path);
    case "Pointer":
      return formatIssue(issue.issue, path + formatPath(issue.path));
    case "Composite":
    case "AnyOf": {
      if (issue._tag === "Composite" || issue.issues.length > 0) {
        return issue.issues.map((issue2) => formatIssue(issue2, path)).join(`
`);
      }
      message = findMessage(issue) ?? getExpectedMessage(getExpected(issue.ast), issue);
      break;
    }
    default:
      message = defaultLeafHook(issue);
      break;
  }
  return path ? `${message}
  at ${path}` : message;
}
function findMessage(issue) {
  if (issue._tag === "Pointer")
    return;
  if (issue._tag === "Encoding")
    return findMessage(issue.issue);
  const annotations = issue._tag === "Filter" ? issue.filter.annotations : ("annotations" in issue) ? issue.annotations : issue.ast.annotations;
  const message = annotations?.[issue._tag === "MissingKey" ? "messageMissingKey" : issue._tag === "UnexpectedKey" ? "messageUnexpectedKey" : "message"];
  if (typeof message === "string")
    return message;
}

// node_modules/effect/dist/internal/schema/cause.js
function getSchemaIssue(cause) {
  let issue;
  for (const reason of cause.reasons) {
    if (!isFailReason2(reason) || !isIssue(reason.error)) {
      return;
    }
    issue ??= reason.error;
  }
  return issue;
}
function getSchemaIssueOrThrow(cause, message) {
  const issue = getSchemaIssue(cause);
  if (issue === undefined) {
    throw new Error(message, {
      cause
    });
  }
  return issue;
}

// node_modules/effect/dist/SchemaGetter.js
class Getter extends Class {
  run;
  constructor(run2) {
    super();
    this.run = run2;
  }
  map(f) {
    return new Getter((oe, options) => this.run(oe, options).pipe(mapEager2(map(f))));
  }
  compose(other) {
    if (isPassthrough(this)) {
      return other;
    }
    if (isPassthrough(other)) {
      return this;
    }
    return new Getter((oe, options) => this.run(oe, options).pipe(flatMapEager2((ot) => other.run(ot, options))));
  }
}
function fail10(f) {
  return new Getter((oe, options) => fail6(f(oe, options)));
}
function forbidden(message) {
  return fail10((oe, options) => {
    const annotations = {
      message: message(oe)
    };
    return isSome2(oe) ? new Forbidden(annotations, oe.value, options) : new Forbidden(annotations);
  });
}
var passthrough_ = /* @__PURE__ */ new Getter(succeed6);
function isPassthrough(getter) {
  return getter.run === passthrough_.run;
}
function passthrough2() {
  return passthrough_;
}
function onSome(f) {
  return new Getter((oe, options) => isNone2(oe) ? succeedNone2 : f(oe.value, options));
}
function transform(f) {
  return transformOptional(map(f));
}
function transformOrFail(f) {
  return onSome((e, options) => f(e, options).pipe(mapEager2(some2)));
}
function transformOptional(f) {
  return new Getter((oe) => succeed6(f(oe)));
}
function omit2() {
  return new Getter(() => succeedNone2);
}
function withDefault(defaultValue) {
  return new Getter((o) => {
    const filtered = filter(o, isNotUndefined);
    return isSome2(filtered) ? succeed6(filtered) : mapEager2(defaultValue, some2);
  });
}
function String3() {
  return transform(globalThis.String);
}
function Number4() {
  return transform(globalThis.Number);
}
function BigInt3() {
  return transform(globalThis.BigInt);
}
function Date3() {
  return transform((u) => new globalThis.Date(u));
}
function trim2() {
  return transform(trim);
}
function parseJson(options) {
  return onSome((input, parseOptions) => try_3({
    try: () => some2(JSON.parse(input, options?.reviver)),
    catch: () => new InvalidValue({
      expected: "a valid JSON string"
    }, input, parseOptions)
  }));
}
function stringifyJson(options) {
  return onSome((input, parseOptions) => try_3({
    try: () => {
      const output = JSON.stringify(input, options?.replacer, options?.space);
      if (output === undefined) {
        throw new TypeError("Value cannot be represented as JSON");
      }
      return some2(output);
    },
    catch: () => new InvalidValue({
      expected: "a JSON-serializable value"
    }, input, parseOptions)
  }));
}
function encodeBase642() {
  return transform(encodeBase64);
}
function encodeBase64Url2() {
  return transform(encodeBase64Url);
}
function encodeHex2() {
  return transform(encodeHex);
}
function decodeBase642() {
  return transformOrFail((input, options) => mapErrorEager2(fromResult2(decodeBase64(input)), () => new InvalidValue({
    expected: "a valid Base64 string"
  }, input, options)));
}
function decodeBase64String2() {
  return transformOrFail((input, options) => match3(decodeBase64String(input), {
    onFailure: () => fail6(new InvalidValue({
      expected: "a valid Base64 string"
    }, input, options)),
    onSuccess: succeed6
  }));
}
function decodeBase64Url2() {
  return transformOrFail((input, options) => match3(decodeBase64Url(input), {
    onFailure: () => fail6(new InvalidValue({
      expected: "a valid Base64Url string"
    }, input, options)),
    onSuccess: succeed6
  }));
}
function decodeBase64UrlString2() {
  return transformOrFail((input, options) => match3(decodeBase64UrlString(input), {
    onFailure: () => fail6(new InvalidValue({
      expected: "a valid Base64Url string"
    }, input, options)),
    onSuccess: succeed6
  }));
}
function decodeHex2() {
  return transformOrFail((input, options) => match3(decodeHex(input), {
    onFailure: () => fail6(new InvalidValue({
      expected: "a valid hexadecimal string"
    }, input, options)),
    onSuccess: succeed6
  }));
}
function decodeHexString2() {
  return transformOrFail((input, options) => match3(decodeHexString(input), {
    onFailure: () => fail6(new InvalidValue({
      expected: "a valid hexadecimal string"
    }, input, options)),
    onSuccess: succeed6
  }));
}
function encodeUriComponent() {
  return transform(encodeURIComponent);
}
function decodeUriComponent() {
  return transformOrFail((input, options) => {
    try {
      return succeed6(globalThis.decodeURIComponent(input));
    } catch {
      return fail6(new InvalidValue({
        expected: "a valid URI component"
      }, input, options));
    }
  });
}
function dateTimeUtcFromInput() {
  return transformOrFail((input, options) => {
    return match(make21(input), {
      onNone: () => fail6(new InvalidValue({
        message: "Invalid DateTime input"
      }, input, options)),
      onSome: (dt) => succeed6(toUtc2(dt))
    });
  });
}
function decodeFormData() {
  return transform((input) => makeTreeRecord(Array.from(input.entries())));
}
var collectFormDataEntries = /* @__PURE__ */ collectBracketPathEntries((value) => typeof value === "string" || typeof Blob !== "undefined" && value instanceof Blob);
function encodeFormData() {
  return transform((input) => {
    const out = new FormData;
    if (typeof input === "object" && input !== null) {
      const entries3 = collectFormDataEntries(input);
      entries3.forEach(([key, value]) => {
        out.append(key, value);
      });
    }
    return out;
  });
}
function decodeURLSearchParams() {
  return transform((input) => makeTreeRecord(Array.from(input.entries())));
}
var collectURLSearchParamsEntries = /* @__PURE__ */ collectBracketPathEntries(isString);
function encodeURLSearchParams() {
  return transform((input) => {
    if (typeof input === "object" && input !== null) {
      return new URLSearchParams(collectURLSearchParamsEntries(input));
    }
    return new URLSearchParams;
  });
}
var INDEX_REGEXP = /^\d+$/;
function bracketPathToTokens(bracketPath) {
  if (bracketPath === "") {
    return [""];
  }
  const replaced = bracketPath.replace(/\[(.*?)\]/g, ".$1");
  const parts = replaced.split(".");
  const start = replaced.startsWith(".") ? 1 : 0;
  return parts.slice(start).map((part) => INDEX_REGEXP.test(part) ? globalThis.Number(part) : part);
}
function makeTreeRecord(bracketPathEntries) {
  const out = {};
  const containers = new WeakSet;
  function getOrCreateContainer(self, key, shouldBeArray) {
    const current = Object.hasOwn(self, key) ? self[key] : undefined;
    if (containers.has(current) && Array.isArray(current) === shouldBeArray) {
      return current;
    }
    const container = shouldBeArray ? [] : {};
    containers.add(container);
    assignProperty(self, key, container);
    return container;
  }
  bracketPathEntries.forEach(([key, value]) => {
    const tokens = bracketPathToTokens(key);
    let cur = out;
    tokens.forEach((token, i) => {
      const isLast = i === tokens.length - 1;
      if (Array.isArray(cur) && token === "") {
        if (isLast) {
          cur.push(value);
        } else {
          const next = tokens[i + 1];
          const shouldBeArray = typeof next === "number" || next === "";
          const index2 = cur.length;
          cur = getOrCreateContainer(cur, index2, shouldBeArray);
        }
      } else if (isLast) {
        const hasOwn = Object.hasOwn(cur, token);
        if (hasOwn && Array.isArray(cur[token])) {
          cur[token].push(value);
        } else if (hasOwn) {
          assignProperty(cur, token, [cur[token], value]);
        } else {
          assignProperty(cur, token, value);
        }
      } else {
        const next = tokens[i + 1];
        const shouldBeArray = typeof next === "number" || next === "";
        cur = getOrCreateContainer(cur, token, shouldBeArray);
      }
    });
  });
  return out;
}
function collectBracketPathEntries(isLeaf) {
  return (input) => {
    const bracketPathEntries = [];
    function append3(key, value) {
      if (isLeaf(value)) {
        bracketPathEntries.push([key, value]);
      } else if (Array.isArray(value)) {
        const allLeaves = value.every(isLeaf);
        if (allLeaves) {
          value.forEach((v) => {
            bracketPathEntries.push([key, v]);
          });
        } else {
          value.forEach((v, i) => {
            append3(`${key}[${i}]`, v);
          });
        }
      } else if (typeof value === "object" && value !== null) {
        for (const [k, v] of Object.entries(value)) {
          append3(`${key}[${k}]`, v);
        }
      }
    }
    for (const [key, value] of Object.entries(input)) {
      append3(key, value);
    }
    return bracketPathEntries;
  };
}

// node_modules/effect/dist/SchemaTransformation.js
class Middleware {
  _tag = "Middleware";
  decode;
  encode;
  constructor(decode, encode) {
    this.decode = decode;
    this.encode = encode;
  }
  flip() {
    return new Middleware(this.encode, this.decode);
  }
}
var TypeId31 = "~effect/SchemaTransformation/Transformation";

class Transformation {
  [TypeId31] = TypeId31;
  _tag = "Transformation";
  decode;
  encode;
  constructor(decode, encode) {
    this.decode = decode;
    this.encode = encode;
  }
  flip() {
    return new Transformation(this.encode, this.decode);
  }
  compose(other) {
    return new Transformation(this.decode.compose(other.decode), other.encode.compose(this.encode));
  }
}
function isTransformation(u) {
  return hasProperty(u, TypeId31) && u[TypeId31] === TypeId31;
}
var make25 = (options) => {
  if (isTransformation(options)) {
    return options;
  }
  return new Transformation(options.decode, options.encode);
};
function transformOrFail2(options) {
  return new Transformation(transformOrFail(options.decode), transformOrFail(options.encode));
}
function transform2(options) {
  return new Transformation(transform(options.decode), transform(options.encode));
}
function transformOptional2(options) {
  return new Transformation(transformOptional(options.decode), transformOptional(options.encode));
}
function trim3() {
  return new Transformation(trim2(), passthrough2());
}
var passthrough_2 = /* @__PURE__ */ new Transformation(/* @__PURE__ */ passthrough2(), /* @__PURE__ */ passthrough2());
function passthrough3() {
  return passthrough_2;
}
var numberFromString = /* @__PURE__ */ new Transformation(/* @__PURE__ */ Number4(), /* @__PURE__ */ String3());
var bigintFromString = /* @__PURE__ */ new Transformation(/* @__PURE__ */ BigInt3(), /* @__PURE__ */ String3());
var dateFromString = /* @__PURE__ */ new Transformation(/* @__PURE__ */ Date3(), /* @__PURE__ */ transform(formatDate));
var dateFromMillis = /* @__PURE__ */ new Transformation(/* @__PURE__ */ Date3(), /* @__PURE__ */ transform((date) => date.getTime()));
var durationFromString = /* @__PURE__ */ transformOrFail2({
  decode: (s, options) => match(fromInput(s), {
    onNone: () => fail6(new InvalidValue({
      expected: "a valid Duration string"
    }, s, options)),
    onSome: succeed6
  }),
  encode: (duration) => succeed6(globalThis.String(duration))
});
var durationFromNanos = /* @__PURE__ */ transformOrFail2({
  decode: (i) => succeed6(nanos(i)),
  encode: (a, options) => match(toNanos(a), {
    onNone: () => fail6(new InvalidValue({
      expected: "a Duration representable as a bigint"
    }, a, options)),
    onSome: (nanos2) => succeed6(nanos2)
  })
});
var durationFromMillis = /* @__PURE__ */ transform2({
  decode: (i) => millis(i),
  encode: (a) => toMillis(a)
});
var isJsonError = (input) => isObject(input) && typeof input["message"] === "string";
var decodeJsonError = (input) => {
  const hasCause = Object.hasOwn(input, "cause");
  const err = hasCause ? new Error(input.message, {
    cause: decodeDefect(input.cause)
  }) : new Error(input.message);
  if (typeof input.name === "string" && input.name !== "Error")
    err.name = input.name;
  if (typeof input.stack === "string")
    err.stack = input.stack;
  return err;
};
var encodeUnknownAsJson = (input) => {
  try {
    const json = formatJson(input);
    return json === undefined ? format(input) : JSON.parse(json);
  } catch {
    return format(input);
  }
};
var encodeJsonError = (input, options, encodeDefect) => {
  const encoded = {
    name: input.name,
    message: typeof input.message === "string" ? input.message : ""
  };
  if (options?.includeStack && typeof input.stack === "string") {
    encoded.stack = input.stack;
  }
  if (!options?.excludeCause && input.cause !== undefined) {
    encoded.cause = encodeDefect(input.cause);
  }
  return encoded;
};
var makeEncodeDefect = (options) => {
  const seen = new WeakSet;
  const encode = (input) => {
    if (isError(input)) {
      if (seen.has(input)) {
        return "[Circular]";
      }
      seen.add(input);
      const encoded = encodeJsonError(input, options, encode);
      seen.delete(input);
      return encoded;
    }
    return encodeUnknownAsJson(input);
  };
  return encode;
};
var decodeDefect = (input) => isJsonError(input) ? decodeJsonError(input) : input;
var errorFromJsonError = (options) => transform2({
  decode: decodeJsonError,
  encode: (input) => makeEncodeDefect(options)(input)
});
var defectFromJson = (options) => transform2({
  decode: decodeDefect,
  encode: makeEncodeDefect(options)
});
function optionFromNullOr() {
  return transform2({
    decode: fromNullOr,
    encode: getOrNull
  });
}
function optionFromUndefinedOr() {
  return transform2({
    decode: fromUndefinedOr,
    encode: getOrUndefined
  });
}
function optionFromNullishOr(options) {
  return transform2({
    decode: fromNullishOr,
    encode: options?.onNoneEncoding === null ? getOrNull : getOrUndefined
  });
}
function optionFromOptionalKey() {
  return transformOptional2({
    decode: some2,
    encode: flatten
  });
}
function optionFromOptional() {
  return transformOptional2({
    decode: (ot) => ot.pipe(filter(isNotUndefined), some2),
    encode: flatten
  });
}
var urlFromString = /* @__PURE__ */ transformOrFail2({
  decode: (s, options) => URL.canParse(s) ? succeed6(new URL(s)) : fail6(new InvalidValue({
    expected: "a valid URL string"
  }, s, options)),
  encode: (url) => succeed6(url.href)
});
var bigDecimalFromString = /* @__PURE__ */ transformOrFail2({
  decode: (s, options) => {
    const result4 = fromString(s);
    return isNone2(result4) ? fail6(new InvalidValue({
      expected: "a valid BigDecimal string"
    }, s, options)) : succeed6(result4.value);
  },
  encode: (bd) => succeed6(format2(bd))
});
var uint8ArrayFromBase64String = /* @__PURE__ */ new Transformation(/* @__PURE__ */ decodeBase642(), /* @__PURE__ */ encodeBase642());
var stringFromBase64String = /* @__PURE__ */ new Transformation(/* @__PURE__ */ decodeBase64String2(), /* @__PURE__ */ encodeBase642());
var stringFromBase64UrlString = /* @__PURE__ */ new Transformation(/* @__PURE__ */ decodeBase64UrlString2(), /* @__PURE__ */ encodeBase64Url2());
var stringFromHexString = /* @__PURE__ */ new Transformation(/* @__PURE__ */ decodeHexString2(), /* @__PURE__ */ encodeHex2());
var stringFromUriComponent = /* @__PURE__ */ new Transformation(/* @__PURE__ */ decodeUriComponent(), /* @__PURE__ */ encodeUriComponent());
function fromJsonString(options) {
  return new Transformation(parseJson(options ?? {}), stringifyJson(options));
}
var fromFormData = /* @__PURE__ */ new Transformation(/* @__PURE__ */ decodeFormData(), /* @__PURE__ */ encodeFormData());
var fromURLSearchParams = /* @__PURE__ */ new Transformation(/* @__PURE__ */ decodeURLSearchParams(), /* @__PURE__ */ encodeURLSearchParams());
var timeZoneOffsetFromNumber = /* @__PURE__ */ transform2({
  decode: (n) => zoneMakeOffset2(n),
  encode: (tz) => tz.offset
});
var timeZoneNamedFromString = /* @__PURE__ */ transformOrFail2({
  decode: (s, options) => {
    return match(zoneMakeNamed2(s), {
      onNone: () => fail6(new InvalidValue({
        expected: "a valid IANA time zone"
      }, s, options)),
      onSome: succeed6
    });
  },
  encode: (tz) => succeed6(tz.id)
});
var timeZoneFromString = /* @__PURE__ */ transformOrFail2({
  decode: (s, options) => {
    return match(zoneFromString2(s), {
      onNone: () => fail6(new InvalidValue({
        expected: "a valid time zone"
      }, s, options)),
      onSome: succeed6
    });
  },
  encode: (tz) => succeed6(zoneToString2(tz))
});
var dateTimeUtcFromString = /* @__PURE__ */ transformOrFail2({
  decode: (s, options) => {
    return match(make21(s), {
      onNone: () => fail6(new InvalidValue({
        expected: "a valid UTC DateTime string"
      }, s, options)),
      onSome: (result4) => succeed6(toUtc2(result4))
    });
  },
  encode: (utc) => succeed6(formatIso2(utc))
});
var dateTimeZonedFromString = /* @__PURE__ */ transformOrFail2({
  decode: (s, options) => {
    return match(makeZonedFromString2(s), {
      onNone: () => fail6(new InvalidValue({
        expected: "a valid Zoned DateTime string"
      }, s, options)),
      onSome: succeed6
    });
  },
  encode: (zoned) => succeed6(formatIsoZoned2(zoned))
});

// node_modules/effect/dist/SchemaAST.js
function makeGuard(tag) {
  return (ast) => ast._tag === tag;
}
var isDeclaration = /* @__PURE__ */ makeGuard("Declaration");
var isNever2 = /* @__PURE__ */ makeGuard("Never");
var isLiteral = /* @__PURE__ */ makeGuard("Literal");
var isUniqueSymbol = /* @__PURE__ */ makeGuard("UniqueSymbol");
var isArrays = /* @__PURE__ */ makeGuard("Arrays");
var isObjects = /* @__PURE__ */ makeGuard("Objects");
var isUnion = /* @__PURE__ */ makeGuard("Union");
var isSuspend = /* @__PURE__ */ makeGuard("Suspend");

class Link {
  to;
  transformation;
  constructor(to, transformation) {
    this.to = to;
    this.transformation = transformation;
  }
}
var defaultParseOptions = {};

class Context {
  isOptional;
  isMutable;
  constructorDefault;
  annotations;
  constructor(isOptional, isMutable, constructorDefault = undefined, annotations = undefined) {
    this.isOptional = isOptional;
    this.isMutable = isMutable;
    this.constructorDefault = constructorDefault;
    this.annotations = annotations;
  }
}
var TypeId32 = "~effect/Schema";

class Base2 {
  [TypeId32] = TypeId32;
  annotations;
  checks;
  encoding;
  context;
  constructor(annotations = undefined, checks = undefined, encoding = undefined, context3 = undefined) {
    this.annotations = annotations;
    this.checks = checks;
    this.encoding = encoding;
    this.context = context3;
  }
  toString() {
    return `<${this._tag}>`;
  }
}

class Declaration extends Base2 {
  _tag = "Declaration";
  typeParameters;
  run;
  encodingChecks;
  encodingRun;
  constructor(typeParameters, run2, annotations, checks, encoding, context3, encodingChecks, encodingRun) {
    super(annotations, checks, encoding, context3);
    this.typeParameters = typeParameters;
    this.run = run2;
    this.encodingChecks = encodingChecks;
    this.encodingRun = encodingRun;
  }
  getParser() {
    let run2;
    return (input, options) => {
      if (input === missing)
        return missingExit;
      return (run2 ??= this.run(this.typeParameters))(input, this, options);
    };
  }
  _rebuild(recur, checks, encodingChecks, run2, encodingRun) {
    const tps = mapOrSame(this.typeParameters, recur);
    return tps === this.typeParameters && checks === this.checks && encodingChecks === this.encodingChecks && run2 === this.run && encodingRun === this.encodingRun ? this : new Declaration(tps, run2, this.annotations, checks, undefined, this.context, encodingChecks, encodingRun);
  }
  recur(recur) {
    return this._rebuild(recur, this.checks, this.encodingChecks, this.run, this.encodingRun);
  }
  flip(recur) {
    return this._rebuild(recur, this.encodingChecks, this.checks, this.encodingRun ?? this.run, this.run);
  }
  getExpected() {
    const expected = this.annotations?.expected;
    if (typeof expected === "string")
      return expected;
    return "<Declaration>";
  }
}

class Null extends Base2 {
  _tag = "Null";
  getParser() {
    return fromConst(this, null);
  }
  getExpected() {
    return "null";
  }
}
var null_ = /* @__PURE__ */ new Null;
class Undefined extends Base2 {
  _tag = "Undefined";
  getParser() {
    return fromConst(this, undefined);
  }
  toCodecJson() {
    return replaceEncoding(this, [undefinedToNull]);
  }
  getExpected() {
    return "undefined";
  }
}
var undefinedToNull = /* @__PURE__ */ new Link(null_, /* @__PURE__ */ new Transformation(/* @__PURE__ */ transform(() => {
  return;
}), /* @__PURE__ */ transform(() => null)));
var undefined_3 = /* @__PURE__ */ new Undefined;
class Void extends Base2 {
  _tag = "Void";
  getParser() {
    const succeed10 = succeed9(undefined);
    return (input) => input === missing ? missingExit : succeed10;
  }
  toCodecJson() {
    return replaceEncoding(this, [undefinedToNull]);
  }
  getExpected() {
    return "void";
  }
}
var void_4 = /* @__PURE__ */ new Void;
class Never extends Base2 {
  _tag = "Never";
  getParser() {
    return fromRefinement(this, isNever);
  }
  getExpected() {
    return "never";
  }
}
var never5 = /* @__PURE__ */ new Never;

class Any extends Base2 {
  _tag = "Any";
  getParser() {
    return fromRefinement(this, isUnknown);
  }
  getExpected() {
    return "any";
  }
}
var any = /* @__PURE__ */ new Any;

class Unknown extends Base2 {
  _tag = "Unknown";
  getParser() {
    return fromRefinement(this, isUnknown);
  }
  getExpected() {
    return "unknown";
  }
}
var unknown = /* @__PURE__ */ new Unknown;

class ObjectKeyword extends Base2 {
  _tag = "ObjectKeyword";
  getParser() {
    return fromRefinement(this, isObjectKeyword);
  }
  getExpected() {
    return "object | array | function";
  }
}
var objectKeyword = /* @__PURE__ */ new ObjectKeyword;

class Enum extends Base2 {
  _tag = "Enum";
  enums;
  constructor(enums, annotations, checks, encoding, context3) {
    super(annotations, checks, encoding, context3);
    this.enums = enums;
  }
  getParser() {
    const values2 = new Set(this.enums.map(([, v]) => v));
    return fromRefinement(this, (input) => values2.has(input));
  }
  toCodecStringTree() {
    if (this.enums.some(([_, v]) => typeof v === "number")) {
      const coercions = Object.fromEntries(this.enums.map(([_, v]) => [globalThis.String(v), v]));
      return replaceEncoding(this, [new Link(new Union(Object.keys(coercions).map((k) => new Literal(k)), "anyOf"), new Transformation(transform((s) => coercions[s]), String3()))]);
    }
    return this;
  }
  getExpected() {
    return this.enums.map(([_, value]) => JSON.stringify(value)).join(" | ");
  }
}
function isTemplateLiteralPart(ast) {
  switch (ast._tag) {
    case "String":
    case "Number":
    case "BigInt":
      return true;
    case "Literal":
    case "TemplateLiteral":
      return !ast.checks;
    case "Union":
      return !ast.checks && ast.types.every(isTemplateLiteralPart);
    default:
      return false;
  }
}

class TemplateLiteral extends Base2 {
  _tag = "TemplateLiteral";
  parts;
  encodedParts;
  literals;
  suffixLengths;
  constructor(parts, annotations, checks, encoding, context3) {
    super(annotations, checks, encoding, context3);
    const encodedParts = [];
    const literals = [];
    for (const part of parts) {
      const encoded = toEncoded(part);
      if (isTemplateLiteralPart(encoded)) {
        encodedParts.push(encoded);
        literals.push(encoded._tag === "Literal" ? globalThis.String(encoded.literal) : undefined);
      } else {
        throw new Error(`Invalid TemplateLiteral part ${encoded._tag}`);
      }
    }
    const suffixLengths = new Array(encodedParts.length + 1);
    suffixLengths[encodedParts.length] = 0;
    for (let i = encodedParts.length - 1;i >= 0; i--) {
      suffixLengths[i] = suffixLengths[i + 1] + (literals[i]?.length ?? 0);
    }
    this.parts = parts;
    this.encodedParts = encodedParts;
    this.literals = literals;
    this.suffixLengths = suffixLengths;
  }
  getParser(compile) {
    const parser = compile(this.asTemplateLiteralParser());
    return (input, options) => {
      if (input === missing)
        return missingExit;
      const result4 = parser(input, options);
      if (result4._tag === "Success") {
        return sameExit;
      }
      return mapBothEager2(result4, {
        onSuccess: () => input,
        onFailure: (issue) => new Composite(this, [issue], input, options)
      });
    };
  }
  getExpected() {
    return "string";
  }
  matchPart(s, options) {
    return segmentTemplateLiteralParts(this, s, options) === undefined ? undefined : s;
  }
  asTemplateLiteralParser() {
    const tuple = new Arrays(false, this.parts.map(partFromString), []);
    return decodeTo(string2, tuple, new Transformation(transformOrFail((s, options) => {
      const segments = segmentTemplateLiteralParts(this, s, options);
      if (segments)
        return succeed6(segments);
      return fail6(new InvalidValue({
        expected: "a string matching template literal parts"
      }, s, options));
    }), transform((parts) => parts.join(""))));
  }
}

class UniqueSymbol extends Base2 {
  _tag = "UniqueSymbol";
  symbol;
  constructor(symbol3, annotations, checks, encoding, context3) {
    super(annotations, checks, encoding, context3);
    this.symbol = symbol3;
  }
  getParser() {
    return fromConst(this, this.symbol);
  }
  toCodecStringTree() {
    return replaceEncoding(this, [symbolToString]);
  }
  getExpected() {
    return globalThis.String(this.symbol);
  }
}

class Literal extends Base2 {
  _tag = "Literal";
  literal;
  constructor(literal, annotations, checks, encoding, context3) {
    super(annotations, checks, encoding, context3);
    if (typeof literal === "number" && !globalThis.Number.isFinite(literal)) {
      throw new Error(`A numeric literal must be finite, got ${format(literal)}`);
    }
    this.literal = literal;
  }
  getParser() {
    return fromConst(this, this.literal);
  }
  matchPart(s, _options) {
    return s === globalThis.String(this.literal) ? this.literal : undefined;
  }
  toCodecJson() {
    return typeof this.literal === "bigint" ? literalToString(this) : this;
  }
  toCodecStringTree() {
    return typeof this.literal === "string" ? this : literalToString(this);
  }
  getExpected() {
    return typeof this.literal === "string" ? JSON.stringify(this.literal) : globalThis.String(this.literal);
  }
}
function literalToString(ast) {
  const literalAsString = globalThis.String(ast.literal);
  return replaceEncoding(ast, [new Link(new Literal(literalAsString), new Transformation(transform(() => ast.literal), transform(() => literalAsString)))]);
}

class String4 extends Base2 {
  _tag = "String";
  getParser() {
    return fromRefinement(this, isString);
  }
  matchPart(s, options) {
    const checks = this.checks;
    return checks && !options.disableChecks && collectIssues(checks, s, undefined, this, options) ? undefined : s;
  }
  getExpected() {
    return "string";
  }
}
var string2 = /* @__PURE__ */ new String4;

class Number5 extends Base2 {
  _tag = "Number";
  getParser() {
    return fromRefinement(this, isNumber);
  }
  matchKey(s, options) {
    return this._match(isStringNumberRegExp, s, options);
  }
  matchPart(s, options) {
    return this._match(isStringFiniteRegExp, s, options);
  }
  _match(regexp, s, options) {
    if (!regexp.test(s))
      return;
    const value = globalThis.Number(s);
    if (options.disableChecks || !this.checks)
      return value;
    return collectIssues(this.checks, value, undefined, this, options) ? undefined : value;
  }
  toCodecJson() {
    if (this.checks && (hasCheck(this.checks, "effect/schema/isFinite") || hasCheck(this.checks, "effect/schema/isInt"))) {
      return this;
    }
    return replaceEncoding(this, [numberToJson]);
  }
  toCodecStringTree() {
    if (this.toCodecJson() === this) {
      return replaceEncoding(this, [finiteToString]);
    }
    return replaceEncoding(this, [numberToString]);
  }
  getExpected() {
    return "number";
  }
}
function hasCheck(checks, id) {
  return checks.some((check) => check.annotations?.representation?.id === id || check._tag === "FilterGroup" && hasCheck(check.checks, id));
}
var number2 = /* @__PURE__ */ new Number5;

class Boolean extends Base2 {
  _tag = "Boolean";
  getParser() {
    return fromRefinement(this, isBoolean);
  }
  getExpected() {
    return "boolean";
  }
}
var boolean = /* @__PURE__ */ new Boolean;

class Symbol2 extends Base2 {
  _tag = "Symbol";
  getParser() {
    return fromRefinement(this, isSymbol);
  }
  matchKey(s, options) {
    if (options.disableChecks || !this.checks)
      return s;
    return collectIssues(this.checks, s, undefined, this, options) ? undefined : s;
  }
  toCodecStringTree() {
    return replaceEncoding(this, [symbolToString]);
  }
  getExpected() {
    return "symbol";
  }
}
var symbol3 = /* @__PURE__ */ new Symbol2;

class BigInt4 extends Base2 {
  _tag = "BigInt";
  getParser() {
    return fromRefinement(this, isBigInt);
  }
  matchPart(s, options) {
    if (!isStringBigIntRegExp.test(s))
      return;
    const value = globalThis.BigInt(s);
    if (options.disableChecks || !this.checks)
      return value;
    return collectIssues(this.checks, value, undefined, this, options) ? undefined : value;
  }
  toCodecStringTree() {
    return replaceEncoding(this, [bigIntToString]);
  }
  getExpected() {
    return "bigint";
  }
}
var bigInt = /* @__PURE__ */ new BigInt4;

class Arrays extends Base2 {
  _tag = "Arrays";
  isMutable;
  elements;
  rest;
  encodingChecks;
  constructor(isMutable, elements, rest, annotations, checks, encoding, context3, encodingChecks) {
    super(annotations, checks, encoding, context3);
    this.isMutable = isMutable;
    this.elements = elements;
    this.rest = rest;
    this.encodingChecks = encodingChecks;
    let hasOptional = false;
    for (let i = 0;i < elements.length; i++) {
      if (isOptional(elements[i])) {
        hasOptional = true;
      } else if (hasOptional) {
        throw new Error("A required element cannot follow an optional element. ts(1257)");
      }
    }
    if (hasOptional && rest.length > 1) {
      throw new Error("A required element cannot follow an optional element. ts(1257)");
    }
    for (let i = 1;i < rest.length; i++) {
      if (isOptional(rest[i])) {
        throw new Error("An optional element cannot follow a rest element. ts(1266)");
      }
    }
  }
  getParser(compile, compileConstructorDefault = compile) {
    const ast = this;
    let elements;
    let rest;
    const elementLen = ast.elements.length;
    const tailLen = Math.max(0, ast.rest.length - 1);
    function getParser(tailThreshold, index2) {
      if (index2 < elementLen) {
        return elements[index2];
      } else if (index2 >= tailThreshold) {
        return rest[index2 - tailThreshold + 1];
      }
      return rest[0];
    }
    return fnUntracedEager2(function* (input, options) {
      if (input === missing) {
        return missing;
      }
      if (!Array.isArray(input)) {
        return yield* fail6(new InvalidType(ast, input, options));
      }
      if (!elements) {
        elements = ast.elements.map((ast2) => ({
          ast: ast2,
          parser: compileConstructorDefault(ast2)
        }));
        rest = ast.rest.map((ast2) => ({
          ast: ast2,
          parser: compileConstructorDefault(ast2)
        }));
      }
      const len = input.length;
      const state = {
        ast,
        getParser,
        input,
        len,
        tailThreshold: Math.max(elementLen, len - tailLen),
        output: new globalThis.Array(len),
        issues: undefined,
        options
      };
      const concurrency = resolveConcurrency(options?.concurrency);
      const eff = parseArray(state, input, {
        concurrency: concurrency?.concurrency,
        end: ast.rest.length === 0 ? elementLen : Math.max(len, elementLen + tailLen)
      });
      if (eff)
        yield* eff;
      if (ast.rest.length === 0 && len > elementLen) {
        for (let i = elementLen;i <= len - 1; i++) {
          const unexpected = new UnexpectedKey(ast, input[i], options);
          const issue = new Pointer([i], unexpected);
          if (options.errors === "all") {
            if (state.issues)
              state.issues.push(issue);
            else
              state.issues = [issue];
          } else {
            return yield* fail6(new Composite(ast, [issue], input, options));
          }
        }
      }
      if (state.issues) {
        return yield* fail6(new Composite(ast, state.issues, input, options));
      }
      return state.output;
    });
  }
  _rebuild(recur, checks, encodingChecks) {
    const elements = mapOrSame(this.elements, recur);
    const rest = mapOrSame(this.rest, recur);
    return elements === this.elements && rest === this.rest && checks === this.checks && encodingChecks === this.encodingChecks ? this : new Arrays(this.isMutable, elements, rest, this.annotations, checks, undefined, this.context, encodingChecks);
  }
  recur(recur) {
    return this._rebuild(recur, this.checks, this.encodingChecks);
  }
  flip(recur) {
    return this._rebuild(recur, this.encodingChecks, this.checks);
  }
  getExpected() {
    return "array";
  }
}
var parseArray = /* @__PURE__ */ iterateEager()({
  onItem(s, item, i) {
    const value = i < s.len ? item : missing;
    return s.getParser(s.tailThreshold, i).parser(value, s.options);
  },
  step(s, item, exit3, i) {
    if (exit3._tag === "Failure") {
      return wrapPropertyKeyIssue(s, s.ast, i, exit3);
    }
    const value = exit3 === sameExit ? item : exit3[args];
    if (value !== missing) {
      s.output[i] = value;
    } else {
      const p = s.getParser(s.tailThreshold, i);
      if (isOptional(p.ast))
        return;
      const issue = new Pointer([i], new MissingKey(p.ast.context?.annotations));
      if (s.options.errors === "all") {
        if (s.issues)
          s.issues.push(issue);
        else
          s.issues = [issue];
      } else {
        return fail4(new Composite(s.ast, [issue], s.input, s.options));
      }
    }
  }
});
var resolveConcurrency = (value) => {
  value = value === "unbounded" ? Infinity : value ?? 1;
  return value > 1 ? {
    concurrency: value
  } : undefined;
};
var wrapPropertyKeyIssue = (s, ast, key, exit3) => {
  if (exit3.cause.reasons.length === 0) {
    return exit3;
  }
  const issue = getSchemaIssue(exit3.cause);
  if (issue === undefined) {
    return failCause2(map6(exit3.cause, (issue2) => new Composite(ast, [new Pointer([key], issue2)], s.input, s.options)));
  }
  const pointer = new Pointer([key], issue);
  if (s.options.errors === "all") {
    if (s.issues)
      s.issues.push(pointer);
    else
      s.issues = [pointer];
  } else {
    return fail4(new Composite(ast, [pointer], s.input, s.options));
  }
};
var FINITE_PATTERN = "[+-]?\\d*\\.?\\d+(?:[Ee][+-]?\\d+)?";
function getIndexSignatureKeys(input, parameter, options = defaultParseOptions) {
  let stringKeys;
  let symbolKeys;
  function go(parameter2) {
    switch (parameter2._tag) {
      case "String":
      case "TemplateLiteral":
        return (stringKeys ??= Object.keys(input)).filter((k) => parameter2.matchPart(k, options) !== undefined);
      case "Number":
        return (stringKeys ??= Object.keys(input)).filter((k) => parameter2.matchKey(k, options) !== undefined);
      case "Symbol":
        return (symbolKeys ??= Object.getOwnPropertySymbols(input)).filter((k) => parameter2.matchKey(k, options) !== undefined);
      case "Union":
        return [...new Set(parameter2.types.flatMap(go))];
      default:
        return [];
    }
  }
  return go(parameterFromPropertyKey(toEncoded(parameter)));
}

class PropertySignature {
  name;
  type;
  constructor(name, type) {
    this.name = name;
    this.type = type;
  }
}
function isIndexSignatureParameterSide(ast) {
  switch (ast._tag) {
    case "String":
    case "Number":
    case "Symbol":
    case "TemplateLiteral":
      return true;
    case "Union":
      return ast.types.every(isIndexSignatureParameterSide);
    default:
      return false;
  }
}
function isIndexSignatureParameter(ast) {
  return isIndexSignatureParameterSide(ast) && isIndexSignatureParameterSide(toEncoded(ast));
}

class IndexSignature {
  parameter;
  type;
  constructor(parameter, type) {
    if (!isIndexSignatureParameter(parameter)) {
      throw new Error(`Invalid index signature parameter ${parameter._tag}`);
    }
    this.parameter = parameter;
    this.type = type;
    if (isOptional(type) && !containsUndefined(type)) {
      throw new Error("Cannot use `Schema.optionalKey` with index signatures, use `Schema.optional` instead.");
    }
  }
}

class Objects extends Base2 {
  _tag = "Objects";
  propertySignatures;
  indexSignatures;
  encodingChecks;
  constructor(propertySignatures, indexSignatures, annotations, checks, encoding, context3, encodingChecks) {
    super(annotations, checks, encoding, context3);
    this.propertySignatures = propertySignatures;
    this.indexSignatures = indexSignatures;
    this.encodingChecks = encodingChecks;
    const duplicates = propertySignatures.map((ps) => ps.name).filter((name, i, arr) => arr.indexOf(name) !== i);
    if (duplicates.length > 0) {
      throw new Error(`Duplicate identifiers: ${JSON.stringify(duplicates)}. ts(2300)`);
    }
  }
  getParser(compile, compileConstructorDefault = compile) {
    const ast = this;
    const expectedKeys = [];
    for (const ps of ast.propertySignatures) {
      expectedKeys.push(ps.name);
    }
    const hasProperties = expectedKeys.length;
    const indexCount = ast.indexSignatures.length;
    let expectedKeysSet = hasProperties && indexCount ? new Set(expectedKeys) : undefined;
    if (!hasProperties && !indexCount) {
      return fromRefinement(ast, isNotNullish);
    }
    let properties;
    let indexes;
    const finishIndex = (s, key, k2, inputValue, exitValue) => {
      if (exitValue._tag === "Failure") {
        return wrapPropertyKeyIssue(s, ast, key, exitValue) ?? void_2;
      }
      const value = exitValue === sameExit ? inputValue : exitValue[args];
      if (k2 !== missing && value !== missing) {
        if (hasProperties && (expectedKeysSet.has(key) || expectedKeysSet.has(k2)))
          return void_2;
        assignProperty(s.out, k2, value);
      }
      return void_2;
    };
    const parseIndex = (s, key, index2, exitKey) => {
      if (!exitKey) {
        const eff = index2.parserKey(key, s.options);
        if (!effectIsExit(eff)) {
          return flatMap5(exit2(eff), (exit3) => parseIndex(s, key, index2, exit3));
        }
        exitKey = eff;
      }
      if (exitKey._tag === "Failure") {
        return wrapPropertyKeyIssue(s, ast, key, exitKey) ?? void_2;
      }
      const k2 = exitKey === sameExit ? key : exitKey[args];
      const inputValue = s.input[key];
      const result4 = index2.parserValue(inputValue, s.options);
      return effectIsExit(result4) ? finishIndex(s, key, k2, inputValue, result4) : flatMap5(exit2(result4), (exit3) => finishIndex(s, key, k2, inputValue, exit3));
    };
    const parseStringIndex = (s, key, index2) => {
      const inputValue = s.input[key];
      const result4 = index2.parserValue(inputValue, s.options);
      return effectIsExit(result4) ? finishIndex(s, key, key, inputValue, result4) : flatMap5(exit2(result4), (exit3) => finishIndex(s, key, key, inputValue, exit3));
    };
    const parseIndexes = indexCount ? iterateEager()({
      onItem: (s, [key, index2]) => parseIndex(s, key, index2),
      step: (_s, _, exit3) => exit3._tag === "Failure" ? exit3 : undefined
    }) : undefined;
    const compileMembers = () => {
      if (!properties) {
        properties = ast.propertySignatures.map((ps) => ({
          parser: compileConstructorDefault(ps.type),
          name: ps.name,
          type: ps.type
        }));
        indexes = indexCount ? ast.indexSignatures.map((is) => ({
          is,
          parserKey: compile(parameterFromPropertyKey(is.parameter)),
          parserValue: compileConstructorDefault(is.type)
        })) : undefined;
      }
      return properties;
    };
    const fallback = fnUntracedEager2(function* (input, options) {
      if (input === missing) {
        return missing;
      }
      if (!(typeof input === "object" && input !== null && !Array.isArray(input))) {
        return yield* fail6(new InvalidType(ast, input, options));
      }
      compileMembers();
      const record = input;
      const out = {};
      const state = {
        ast,
        input: record,
        out,
        issues: undefined,
        options
      };
      const errorsAllOption = options.errors === "all";
      const onExcessPropertyError = options.onExcessProperty === "error";
      const onExcessPropertyPreserve = options.onExcessProperty === "preserve";
      let inputKeys;
      if (!indexCount && (onExcessPropertyError || onExcessPropertyPreserve)) {
        expectedKeysSet ??= new Set(expectedKeys);
        inputKeys = Reflect.ownKeys(record);
        for (let i = 0;i < inputKeys.length; i++) {
          const key = inputKeys[i];
          if (!expectedKeysSet.has(key)) {
            if (onExcessPropertyError) {
              const unexpected = new UnexpectedKey(ast, record[key], options);
              const issue = new Pointer([key], unexpected);
              if (errorsAllOption) {
                if (state.issues) {
                  state.issues.push(issue);
                } else {
                  state.issues = [issue];
                }
                continue;
              } else {
                return yield* fail6(new Composite(ast, [issue], input, options));
              }
            } else {
              assignProperty(out, key, record[key]);
            }
          }
        }
      }
      const concurrency = resolveConcurrency(options?.concurrency);
      if (hasProperties) {
        const eff = parseProperties(state, properties, concurrency);
        if (eff)
          yield* eff;
      }
      if (indexCount && !concurrency) {
        for (let i = 0;i < indexCount; i++) {
          const index2 = indexes[i];
          const parse = index2.is.parameter === string2 ? parseStringIndex : parseIndex;
          const keys4 = index2.is.parameter === string2 ? Object.keys(record) : getIndexSignatureKeys(record, index2.is.parameter, options);
          for (let j = 0;j < keys4.length; j++) {
            const eff = parse(state, keys4[j], index2);
            if (!effectIsExit(eff))
              yield* eff;
            else if (eff._tag === "Failure")
              return yield* eff;
          }
        }
      } else if (parseIndexes) {
        const keyPairs = empty2();
        for (let i = 0;i < indexCount; i++) {
          const index2 = indexes[i];
          const keys4 = getIndexSignatureKeys(record, index2.is.parameter, options);
          for (let j = 0;j < keys4.length; j++) {
            keyPairs.push([keys4[j], index2]);
          }
        }
        const eff = parseIndexes(state, keyPairs, concurrency);
        if (eff)
          yield* eff;
      }
      if (state.issues) {
        return yield* fail6(new Composite(ast, state.issues, input, options));
      }
      if (options.propertyOrder === "original") {
        const keys4 = (inputKeys ?? Reflect.ownKeys(record)).concat(expectedKeys);
        const preserved = {};
        for (const key of keys4) {
          if (Object.hasOwn(out, key)) {
            assignProperty(preserved, key, out[key]);
          }
        }
        return preserved;
      }
      return out;
    });
    if (indexCount)
      return fallback;
    const resume = (state, index2, pending) => {
      const property = properties[index2];
      return flatMap5(exit2(pending), (exit3) => {
        const terminal = stepProperty(state, property, exit3);
        if (terminal)
          return terminal;
        const done4 = () => succeed9(state.out);
        const eff = parseProperties(state, properties.slice(index2 + 1));
        return eff ? flatMapEager2(eff, done4) : done4();
      });
    };
    return (input, options) => {
      if (input === missing)
        return missingExit;
      if (options.errors === "all" || options.onExcessProperty !== undefined || options.propertyOrder === "original" || options.concurrency !== undefined) {
        return fallback(input, options);
      }
      if (!(typeof input === "object" && input !== null && !Array.isArray(input))) {
        return fail6(new InvalidType(ast, input, options));
      }
      const props = compileMembers();
      const record = input;
      const out = {};
      const state = {
        ast,
        input: record,
        out,
        issues: undefined,
        options
      };
      try {
        for (let index2 = 0;index2 < props.length; index2++) {
          const property = props[index2];
          const name = property.name;
          const hasKey = Object.hasOwn(record, name);
          const value = hasKey ? record[name] : missing;
          const exit3 = property.parser(value, options);
          if (!effectIsExit(exit3)) {
            return resume(state, index2, exit3);
          }
          if (exit3 === sameExit) {
            if (hasKey)
              assignProperty(out, name, value);
            continue;
          }
          const terminal = stepProperty(state, property, exit3);
          if (terminal)
            return terminal;
        }
      } catch (error) {
        return die4(error);
      }
      return succeed9(out);
    };
  }
  _rebuild(recur, recurParameter, checks, encodingChecks) {
    const props = mapOrSame(this.propertySignatures, (ps) => {
      const t = recur(ps.type);
      return t === ps.type ? ps : new PropertySignature(ps.name, t);
    });
    const indexes = mapOrSame(this.indexSignatures, (is) => {
      const p = recurParameter(is.parameter);
      const t = recur(is.type);
      return p === is.parameter && t === is.type ? is : new IndexSignature(p, t);
    });
    return props === this.propertySignatures && indexes === this.indexSignatures && checks === this.checks && encodingChecks === this.encodingChecks ? this : new Objects(props, indexes, this.annotations, checks, undefined, this.context, encodingChecks);
  }
  flip(recur) {
    return this._rebuild(recur, recur, this.encodingChecks, this.checks);
  }
  recur(recur, recurParameter = recur) {
    return this._rebuild(recur, recurParameter, this.checks, this.encodingChecks);
  }
  getExpected() {
    if (this.propertySignatures.length === 0 && this.indexSignatures.length === 0)
      return "object | array";
    return "object";
  }
}
function stepProperty(s, p, exit3) {
  if (exit3._tag === "Failure") {
    return wrapPropertyKeyIssue(s, s.ast, p.name, exit3);
  }
  if (exit3 === sameExit)
    return;
  const value = exit3[args];
  if (value !== missing) {
    assignProperty(s.out, p.name, value);
    return;
  }
  delete s.out[p.name];
  if (!isOptional(p.type)) {
    const issue = new Pointer([p.name], new MissingKey(p.type.context?.annotations));
    if (s.options.errors === "all") {
      if (s.issues)
        s.issues.push(issue);
      else
        s.issues = [issue];
      return;
    } else {
      return fail4(new Composite(s.ast, [issue], s.input, s.options));
    }
  }
}
var parseProperties = /* @__PURE__ */ iterateEager()({
  onItem(s, p) {
    if (!Object.hasOwn(s.input, p.name)) {
      return p.parser(missing, s.options);
    }
    const value = s.input[p.name];
    assignProperty(s.out, p.name, value);
    return p.parser(value, s.options);
  },
  step: stepProperty
});
function combineChecks(a, b) {
  if (!a)
    return b;
  if (!b)
    return a;
  return [...a, ...b];
}
function struct(fields, checks, annotations) {
  return new Objects(Reflect.ownKeys(fields).map((key) => {
    return new PropertySignature(key, fields[key].ast);
  }), [], annotations, checks);
}
function getAST(self) {
  return self.ast;
}
function tuple(elements, checks = undefined) {
  return new Arrays(false, elements.map((e) => e.ast), [], undefined, checks);
}
function union4(members, mode, checks) {
  return new Union(members.map(getAST), mode, undefined, checks);
}
function structWithRest(ast, records) {
  if (ast.encoding || records.some((r) => r.encoding)) {
    throw new Error("StructWithRest does not support encodings");
  }
  let propertySignatures = ast.propertySignatures;
  let indexSignatures = ast.indexSignatures;
  let checks = ast.checks;
  for (const record of records) {
    propertySignatures = propertySignatures.concat(record.propertySignatures);
    indexSignatures = indexSignatures.concat(record.indexSignatures);
    checks = combineChecks(checks, record.checks);
  }
  return new Objects(propertySignatures, indexSignatures, undefined, checks);
}
function tupleWithRest(ast, rest) {
  if (ast.encoding) {
    throw new Error("TupleWithRest does not support encodings");
  }
  return new Arrays(ast.isMutable, ast.elements, rest, undefined, ast.checks);
}
var toCandidate = /* @__PURE__ */ memoizeIdempotent((ast) => {
  while (true) {
    if (isSuspend(ast))
      return unknown;
    const encoding = ast.encoding;
    if (!encoding) {
      return ast.recur?.(toCandidate, identity) ?? ast;
    }
    if (encoding.some((link) => link.transformation._tag === "Middleware" && link.transformation.decode !== identity))
      return unknown;
    ast = encoding[encoding.length - 1].to;
  }
});
function getCandidateTypes(ast) {
  switch (ast._tag) {
    case "Null":
      return ["null"];
    case "Undefined":
      return ["undefined"];
    case "String":
    case "TemplateLiteral":
      return ["string"];
    case "Number":
      return ["number"];
    case "Boolean":
      return ["boolean"];
    case "Symbol":
    case "UniqueSymbol":
      return ["symbol"];
    case "BigInt":
      return ["bigint"];
    case "Arrays":
      return ["array"];
    case "ObjectKeyword":
      return ["object", "array", "function"];
    case "Objects":
      return ast.propertySignatures.length || ast.indexSignatures.length ? ["object"] : ["string", "number", "boolean", "symbol", "bigint", "object", "array", "function"];
    case "Enum":
      return Array.from(new Set(ast.enums.map(([, v]) => typeof v)));
    case "Literal":
      return [typeof ast.literal];
    case "Union":
      return Array.from(new Set(ast.types.flatMap(getCandidateTypes)));
    default:
      return ["null", "undefined", "string", "number", "boolean", "symbol", "bigint", "object", "array", "function"];
  }
}
function collectSentinels(ast) {
  switch (ast._tag) {
    default:
      return [];
    case "Declaration": {
      const s = ast.annotations?.[SENTINELS_ANNOTATION_KEY];
      return Array.isArray(s) ? s : [];
    }
    case "Objects":
      return ast.propertySignatures.flatMap((ps) => {
        const type = ps.type;
        if (!isOptional(type)) {
          if (isLiteral(type)) {
            return [{
              key: ps.name,
              literal: type.literal
            }];
          }
          if (isUniqueSymbol(type)) {
            return [{
              key: ps.name,
              literal: type.symbol
            }];
          }
        }
        return [];
      });
    case "Arrays":
      return ast.elements.flatMap((e, i) => {
        if (!isOptional(e)) {
          if (isLiteral(e)) {
            return [{
              key: i,
              literal: e.literal
            }];
          }
          if (isUniqueSymbol(e)) {
            return [{
              key: i,
              literal: e.symbol
            }];
          }
        }
        return [];
      });
    case "Union": {
      if (ast.types.length === 0)
        return [];
      const members = ast.types.map((type) => collectSentinels(toCandidate(type)));
      return members[0].filter((s) => members.every((sentinels) => sentinels.some((o) => o.key === s.key && o.literal === s.literal)));
    }
    case "Suspend":
      return collectSentinels(ast.thunk());
  }
}
var candidateIndexCache = /* @__PURE__ */ new WeakMap;
var emptyCandidates = /* @__PURE__ */ Object.freeze([]);
function getIndex(types) {
  let index2 = candidateIndexCache.get(types);
  if (index2)
    return index2;
  let bySentinel;
  let sentinelCandidateCount = 0;
  let otherwise;
  let literalCandidates;
  let onlyLiterals = true;
  for (let i = 0;i < types.length; i++) {
    const a = types[i];
    const encoded = toCandidate(a);
    if (isNever2(encoded))
      continue;
    if (onlyLiterals) {
      if (isLiteral(encoded) || isUniqueSymbol(encoded)) {
        literalCandidates ??= new Map;
        const literal = isLiteral(encoded) ? encoded.literal : encoded.symbol;
        let arr = literalCandidates.get(literal);
        if (!arr)
          literalCandidates.set(literal, arr = []);
        arr.push(a);
      } else {
        onlyLiterals = false;
      }
    }
    const sentinels = collectSentinels(encoded);
    if (sentinels.length) {
      bySentinel ??= new Map;
      sentinelCandidateCount++;
      for (const {
        key,
        literal
      } of sentinels) {
        let entry = bySentinel.get(key);
        if (!entry)
          bySentinel.set(key, entry = [new Map, new Set]);
        entry[1].add(i);
        let indexes = entry[0].get(literal);
        if (!indexes)
          entry[0].set(literal, indexes = new Set);
        indexes.add(i);
      }
    } else {
      otherwise ??= {};
      const candidateTypes = getCandidateTypes(encoded);
      for (const t of candidateTypes)
        (otherwise[t] ??= []).push(i);
    }
  }
  if (onlyLiterals && literalCandidates) {
    literalCandidates.forEach(Object.freeze);
    index2 = (input) => literalCandidates.get(input) ?? emptyCandidates;
  } else if (bySentinel?.size === 1 && !otherwise) {
    const [key, [byValue]] = bySentinel.entries().next().value;
    const candidates = byValue;
    for (const [literal, indexes] of byValue) {
      candidates.set(literal, Object.freeze(Array.from(indexes, (index3) => types[index3])));
    }
    index2 = (input, isConstructor) => {
      if (isObjectKeyword(input)) {
        const value = Object.hasOwn(input, key) ? input[key] : undefined;
        if (value !== undefined)
          return candidates.get(value) ?? emptyCandidates;
        if (isConstructor)
          return types;
      }
      return emptyCandidates;
    };
  } else if (bySentinel) {
    let commonSentinel;
    for (const entry of bySentinel) {
      if ((!commonSentinel || entry[1][0].size > commonSentinel[1][0].size) && entry[1][1].size === sentinelCandidateCount) {
        commonSentinel = entry;
      }
    }
    index2 = (input, isConstructor) => {
      const runtimeType = input === null ? "null" : Array.isArray(input) ? "array" : typeof input;
      const base = otherwise?.[runtimeType] ?? emptyCandidates;
      if (!isObjectKeyword(input))
        return base.map((i) => types[i]);
      const selected = new Set(base);
      let directKey;
      if (commonSentinel) {
        const [key, [byValue]] = commonSentinel;
        const hasKey = Object.hasOwn(input, key);
        const value = hasKey ? input[key] : undefined;
        if (hasKey && (!isConstructor || value !== undefined)) {
          const match8 = byValue.get(value);
          if (!match8)
            return base.map((i) => types[i]);
          for (const i of match8)
            selected.add(i);
          directKey = key;
        }
      }
      if (directKey === undefined) {
        for (const [key, [byValue, all3]] of bySentinel) {
          const hasKey = Object.hasOwn(input, key);
          const value = hasKey ? input[key] : undefined;
          if (hasKey && (!isConstructor || value !== undefined)) {
            const match8 = byValue.get(value);
            if (match8) {
              for (const i of match8)
                selected.add(i);
            }
          } else if (isConstructor) {
            for (const i of all3)
              selected.add(i);
          }
        }
      }
      for (const [key, [byValue, all3]] of bySentinel) {
        if (key === directKey)
          continue;
        const hasKey = Object.hasOwn(input, key);
        const value = hasKey ? input[key] : undefined;
        if (hasKey && (!isConstructor || value !== undefined)) {
          const match8 = byValue.get(value);
          for (const i of selected) {
            if (all3.has(i) && !match8?.has(i))
              selected.delete(i);
          }
        }
      }
      return Array.from(selected).sort((a, b) => a - b).map((i) => types[i]);
    };
  } else {
    index2 = (input) => {
      const runtimeType = input === null ? "null" : Array.isArray(input) ? "array" : typeof input;
      return (otherwise?.[runtimeType] ?? emptyCandidates).map((i) => types[i]).filter(filterLiterals(input));
    };
  }
  candidateIndexCache.set(types, index2);
  return index2;
}
function filterLiterals(input) {
  return (ast) => {
    const encoded = toCandidate(ast);
    return encoded._tag === "Literal" ? encoded.literal === input : encoded._tag === "UniqueSymbol" ? encoded.symbol === input : true;
  };
}
function getCandidates(input, types, isConstructor = false) {
  return getIndex(types)(input, isConstructor);
}

class Union extends Base2 {
  _tag = "Union";
  types;
  mode;
  encodingChecks;
  constructor(types, mode, annotations, checks, encoding, context3, encodingChecks) {
    super(annotations, checks, encoding, context3);
    this.types = types;
    this.mode = mode;
    this.encodingChecks = encodingChecks;
  }
  getParser(compile, compileConstructorDefault) {
    const ast = this;
    return (input, options) => {
      if (input === missing) {
        return missingExit;
      }
      const candidates = getCandidates(input, ast.types, compileConstructorDefault !== undefined);
      if (candidates.length === 1) {
        const result4 = compile(candidates[0])(input, options);
        if (result4._tag === "Success")
          return result4;
        return effectIsExit(result4) ? failSingleUnionCandidate(ast, result4.cause, input, options) : catchCause3(result4, (cause) => failSingleUnionCandidate(ast, cause, input, options));
      }
      const state = {
        ast,
        compile,
        input,
        out: undefined,
        successes: ast.mode === "oneOf" ? [] : undefined,
        issues: undefined,
        options
      };
      const concurrency = resolveConcurrency(options?.concurrency);
      const eff = parseUnion(state, candidates, concurrency ? {
        ...concurrency,
        orderedStep: true
      } : undefined);
      if (!eff) {
        if (state.out)
          return state.out;
        return fail6(new AnyOf(ast, state.issues ?? [], input, options));
      }
      return flatMapEager2(eff, (_) => {
        if (state.out === sameExit)
          return succeed6(input);
        if (state.out)
          return state.out;
        return fail6(new AnyOf(ast, state.issues ?? [], input, options));
      });
    };
  }
  _rebuild(recur, checks, encodingChecks) {
    const types = mapOrSame(this.types, recur);
    return types === this.types && checks === this.checks && encodingChecks === this.encodingChecks ? this : new Union(types, this.mode, this.annotations, checks, undefined, this.context, encodingChecks);
  }
  recur(recur) {
    return this._rebuild(recur, this.checks, this.encodingChecks);
  }
  flip(recur) {
    return this._rebuild(recur, this.encodingChecks, this.checks);
  }
  matchPart(s, options) {
    for (const type of this.types) {
      const out = type.matchPart(s, options);
      if (out !== undefined)
        return out;
    }
    return;
  }
  getExpected(getExpected2) {
    const expected = this.annotations?.expected;
    if (typeof expected === "string")
      return expected;
    if (this.types.length === 0)
      return "never";
    const types = this.types.map((type) => {
      const encoded = toEncoded(type);
      switch (encoded._tag) {
        case "Arrays": {
          const literals = encoded.elements.filter(isLiteral);
          if (literals.length > 0) {
            return `${formatIsMutable(encoded.isMutable)}[ ${literals.map((e) => getExpected2(e) + formatIsOptional(e.context?.isOptional)).join(", ")}, ... ]`;
          }
          break;
        }
        case "Objects": {
          const literals = encoded.propertySignatures.filter((ps) => isLiteral(ps.type));
          if (literals.length > 0) {
            return `{ ${literals.map((ps) => `${formatIsMutable(ps.type.context?.isMutable)}${formatPropertyKey(ps.name)}${formatIsOptional(ps.type.context?.isOptional)}: ${getExpected2(ps.type)}`).join(", ")}, ... }`;
          }
          break;
        }
      }
      return getExpected2(encoded);
    });
    return Array.from(new Set(types)).join(" | ");
  }
}
function failSingleUnionCandidate(ast, cause, input, options) {
  const issue = getSchemaIssue(cause);
  if (!issue)
    return failCause2(cause);
  return fail4(new AnyOf(ast, [issue], input, options));
}
var parseUnion = /* @__PURE__ */ iterateEager()({
  onItem(s, ast) {
    const parser = s.compile(ast);
    return parser(s.input, s.options);
  },
  step(s, candidate, exit3) {
    if (exit3._tag === "Failure") {
      const issue = getSchemaIssue(exit3.cause);
      if (issue === undefined) {
        return exit3;
      }
      if (s.issues)
        s.issues.push(issue);
      else
        s.issues = [issue];
    } else {
      if (s.out && s.successes) {
        s.successes.push(candidate);
        return fail4(new OneOf(s.ast, s.successes, s.input, s.options));
      }
      s.out = exit3;
      if (s.successes) {
        s.successes.push(candidate);
      } else {
        return void_2;
      }
    }
  }
});
var nonFiniteLiterals = /* @__PURE__ */ new Union([/* @__PURE__ */ new Literal("Infinity"), /* @__PURE__ */ new Literal("-Infinity"), /* @__PURE__ */ new Literal("NaN")], "anyOf");
function formatIsMutable(isMutable) {
  return isMutable ? "" : "readonly ";
}
function formatIsOptional(isOptional) {
  return isOptional ? "?" : "";
}
function memoizeThunk(f) {
  let done4 = false;
  let a;
  return () => {
    if (done4) {
      return a;
    }
    a = f();
    done4 = true;
    return a;
  };
}

class Suspend extends Base2 {
  _tag = "Suspend";
  thunk;
  constructor(thunk, annotations, checks, encoding, context3) {
    if (checks) {
      throw new Error("Cannot add checks to Suspend");
    }
    super(annotations, undefined, encoding, context3);
    this.thunk = memoizeThunk(thunk);
  }
  getParser(compile) {
    let parser;
    return (input, options) => (parser ??= compile(this.thunk()))(input, options);
  }
  recur(recur) {
    return new Suspend(() => recur(this.thunk()), this.annotations, undefined, undefined, this.context);
  }
  getExpected(getExpected2) {
    return getExpected2(this.thunk());
  }
}

class Filter2 extends Class {
  _tag = "Filter";
  run;
  annotations;
  aborted;
  constructor(run2, annotations = undefined, aborted = false) {
    super();
    this.run = run2;
    this.annotations = annotations;
    this.aborted = aborted;
  }
  annotate(annotations) {
    return new Filter2(this.run, {
      ...this.annotations,
      ...annotations
    }, this.aborted);
  }
  abort() {
    return new Filter2(this.run, this.annotations, true);
  }
  and(other, annotations) {
    return new FilterGroup([this, other], annotations);
  }
}

class FilterGroup extends Class {
  _tag = "FilterGroup";
  checks;
  annotations;
  constructor(checks, annotations = undefined) {
    super();
    this.checks = checks;
    this.annotations = annotations;
  }
  annotate(annotations) {
    return new FilterGroup(this.checks, {
      ...this.annotations,
      ...annotations
    });
  }
  and(other, annotations) {
    return new FilterGroup([this, other], annotations);
  }
}
function makeFilter(filter11, annotations, aborted = false) {
  return new Filter2((input, ast, options) => normalizeFilterOutput(ast, filter11(input, ast, options), input, options), annotations, aborted);
}
function makeFilterByGuard(is, annotations) {
  return new Filter2((input, _ast, options) => is(input) ? undefined : new InvalidValue(undefined, input, options), annotations, true);
}
function isFinite2(annotations) {
  return makeFilter((n) => globalThis.Number.isFinite(n), {
    expected: "a finite number",
    representation: {
      id: "effect/schema/isFinite",
      payload: null
    },
    toJsonSchema: () => ({
      type: "number"
    }),
    toCode: () => ({
      runtime: "Schema.isFinite()"
    }),
    arbitrary: {
      constraint: {
        noInfinity: true,
        noNaN: true
      }
    },
    ...annotations
  });
}
var finite = /* @__PURE__ */ appendChecks(number2, [/* @__PURE__ */ isFinite2()]);
var numberToJson = /* @__PURE__ */ new Link(/* @__PURE__ */ new Union([finite, nonFiniteLiterals], "anyOf"), /* @__PURE__ */ new Transformation(/* @__PURE__ */ Number4(), /* @__PURE__ */ transform((n) => globalThis.Number.isFinite(n) ? n : globalThis.String(n))));
function isPattern(regExp, annotations) {
  const source = regExp.source;
  const pattern = new globalThis.RegExp(source, regExp.flags);
  return makeFilter((s) => {
    pattern.lastIndex = 0;
    return pattern.test(s);
  }, {
    expected: `a string matching the RegExp ${source}`,
    representation: {
      id: "effect/schema/isPattern",
      payload: {
        source,
        flags: regExp.flags
      }
    },
    toJsonSchema: () => ({
      pattern: source
    }),
    arbitrary: {
      constraint: {
        patterns: [regExp.source]
      }
    },
    ...annotations
  });
}
function modifyOwnPropertyDescriptors(ast, f) {
  const d = Object.getOwnPropertyDescriptors(ast);
  f(d);
  return Object.create(Object.getPrototypeOf(ast), d);
}
var contextOwners = /* @__PURE__ */ new WeakMap;
function getContextOwner(ast) {
  return contextOwners.get(ast) ?? ast;
}
function replaceEncoding(ast, encoding) {
  if (ast.encoding === encoding) {
    return ast;
  }
  return modifyOwnPropertyDescriptors(ast, (d) => {
    d.encoding.value = encoding;
  });
}
function replaceContext(ast, context3) {
  if (ast.context === context3) {
    return ast;
  }
  const owner = getContextOwner(ast);
  if (owner.context === context3) {
    return owner;
  }
  const out = modifyOwnPropertyDescriptors(ast, (d) => {
    d.context.value = context3;
  });
  contextOwners.set(out, owner);
  return out;
}
function getLastEncoding(ast) {
  return ast.encoding ? getLastEncoding(ast.encoding[ast.encoding.length - 1].to) : ast;
}
function annotate(ast, annotations) {
  if (ast.checks) {
    const last = ast.checks[ast.checks.length - 1];
    return replaceChecks(ast, append(ast.checks.slice(0, -1), last.annotate(annotations)));
  }
  return modifyOwnPropertyDescriptors(ast, (d) => {
    d.annotations.value = {
      ...d.annotations.value,
      ...annotations
    };
  });
}
function replaceChecks(ast, checks) {
  if (ast._tag === "Suspend" && checks) {
    throw new Error("Cannot add checks to Suspend");
  }
  if (ast.checks === checks) {
    return ast;
  }
  return modifyOwnPropertyDescriptors(ast, (d) => {
    d.checks.value = checks;
  });
}
function appendChecks(ast, checks) {
  return replaceChecks(ast, combineChecks(ast.checks, checks));
}
function mapLink(link, f) {
  const to = f(link.to);
  return to === link.to ? link : new Link(to, link.transformation);
}
function updateLastLink(encoding, f) {
  const links = encoding;
  const last = links[links.length - 1];
  const out = mapLink(last, f);
  return out === last ? encoding : append(encoding.slice(0, encoding.length - 1), out);
}
function applyToLastLink(f) {
  return (ast) => ast.encoding ? replaceEncoding(ast, updateLastLink(ast.encoding, f)) : ast;
}
function replaceContextLastLink(ast, context3) {
  return applyToLastLink((ast2) => replaceContext(ast2, context3))(ast);
}
function applyToSelfOrLastLinkEncodingIdempotent(f, options) {
  function out(ast) {
    if (ast.encoding) {
      const last = ast.encoding[ast.encoding.length - 1];
      return options?.stopAt?.(last) ? ast : replaceEncoding(ast, updateLastLink(ast.encoding, out));
    }
    return f(ast);
  }
  return memoizeIdempotent(out);
}
function middlewareDecoding(ast, middleware) {
  return appendTransformation(ast, middleware, toType(ast));
}
function middlewareEncoding(ast, middleware) {
  return appendTransformation(toEncoded(ast), middleware, ast);
}
function appendTransformation(from, transformation, to) {
  const link = new Link(from, transformation);
  return replaceEncoding(to, to.encoding ? [...to.encoding, link] : [link]);
}
function brand(ast, brand2) {
  const existing = resolveBrands(ast);
  const brands = existing ? [...existing, brand2] : [brand2];
  return annotate(ast, {
    brands
  });
}
function mapOrSame(as3, f) {
  let changed = false;
  const out = new Array(as3.length);
  for (let i = 0;i < as3.length; i++) {
    const a = as3[i];
    const fa = f(a);
    if (fa !== a) {
      changed = true;
    }
    out[i] = fa;
  }
  return changed ? out : as3;
}
function annotateKey(ast, annotations) {
  const context3 = ast.context ? new Context(ast.context.isOptional, ast.context.isMutable, ast.context.constructorDefault, {
    ...ast.context.annotations,
    ...annotations
  }) : new Context(false, false, undefined, annotations);
  return replaceContext(ast, context3);
}
var optionalKey = /* @__PURE__ */ memoizeIdempotent((ast) => {
  const context3 = ast.context ? ast.context.isOptional === false ? new Context(true, ast.context.isMutable, ast.context.constructorDefault, ast.context.annotations) : ast.context : new Context(true, false);
  return optionalKeyLastLink(replaceContext(ast, context3));
});
var optionalKeyLastLink = /* @__PURE__ */ applyToLastLink(optionalKey);
var optional = /* @__PURE__ */ memoize((ast) => optionalKey(new Union([ast, undefined_3], "anyOf")));
var mutableKey = /* @__PURE__ */ memoizeIdempotent((ast) => {
  const context3 = ast.context ? ast.context.isMutable === false ? new Context(ast.context.isOptional, true, ast.context.constructorDefault, ast.context.annotations) : ast.context : new Context(false, true);
  return mutableKeyLastLink(replaceContext(ast, context3));
});
var mutableKeyLastLink = /* @__PURE__ */ applyToLastLink(mutableKey);
function withConstructorDefault(ast, defaultValue) {
  const transformation = new Transformation(withDefault(defaultValue), passthrough2());
  const constructorDefault = new Link(unknown, transformation);
  const context3 = ast.context ? new Context(ast.context.isOptional, ast.context.isMutable, constructorDefault, ast.context.annotations) : new Context(false, false, constructorDefault);
  return replaceContext(ast, context3);
}
function decodeTo(from, to, transformation) {
  return appendTransformation(from, transformation, to);
}
function parseParameter(ast) {
  const literals = [];
  const parameters = [];
  function go(ast2) {
    switch (ast2._tag) {
      case "Literal":
        if (isPropertyKey(ast2.literal)) {
          literals.push(ast2.literal);
        }
        return;
      case "UniqueSymbol":
        literals.push(ast2.symbol);
        return;
      case "Never":
        return;
      case "Union":
        for (let i = 0;i < ast2.types.length; i++) {
          go(ast2.types[i]);
        }
        return;
      default:
        parameters.push(ast2);
    }
  }
  go(ast);
  return {
    literals,
    parameters
  };
}
function record(key, value) {
  const {
    literals,
    parameters: indexSignatures
  } = parseParameter(key);
  return new Objects(literals.map((literal) => new PropertySignature(literal, value)), indexSignatures.map((parameter) => new IndexSignature(parameter, value)));
}
function isOptional(ast) {
  return ast.context?.isOptional ?? false;
}
function isMutable(ast) {
  return ast.context?.isMutable ?? false;
}
function isStructuralCheck(check) {
  return check.annotations?.[STRUCTURAL_ANNOTATION_KEY] === true || check._tag === "FilterGroup" && check.checks.every(isStructuralCheck);
}
function extractStructuralChecks(checks) {
  function extract(check) {
    if (isStructuralCheck(check))
      return [check];
    return check._tag === "FilterGroup" ? check.checks.flatMap(extract) : [];
  }
  const out = checks.flatMap(extract);
  return isArrayNonEmpty2(out) ? out : undefined;
}
var toType = /* @__PURE__ */ memoizeIdempotent((ast) => {
  if (ast.encoding) {
    return toType(replaceEncoding(ast, undefined));
  }
  const out = ast;
  const type = out.recur?.(toType) ?? out;
  const encodingChecks = type.encodingChecks;
  if (encodingChecks) {
    const checks = type === ast ? encodingChecks : isArrays(type) || isObjects(type) || isDeclaration(type) && type.typeParameters.length > 0 ? extractStructuralChecks(encodingChecks) : undefined;
    return modifyOwnPropertyDescriptors(type, (d) => {
      d.encodingChecks.value = undefined;
      d.checks.value = combineChecks(type.checks, checks);
    });
  }
  return type;
});
var toEncoded = /* @__PURE__ */ memoizeIdempotent((ast) => {
  return toType(flip3(ast));
});
function flipEncoding(ast, encoding) {
  const links = encoding;
  const len = links.length;
  const last = links[len - 1];
  const ls = [new Link(flip3(replaceEncoding(ast, undefined)), links[0].transformation.flip())];
  for (let i = 1;i < len; i++) {
    ls.unshift(new Link(flip3(links[i - 1].to), links[i].transformation.flip()));
  }
  const to = flip3(last.to);
  if (to.encoding) {
    return replaceEncoding(to, [...to.encoding, ...ls]);
  } else {
    return replaceEncoding(to, ls);
  }
}
var flip3 = /* @__PURE__ */ memoize((ast) => {
  if (ast.encoding) {
    return flipEncoding(ast, ast.encoding);
  }
  const out = ast;
  return out.flip?.(flip3) ?? out.recur?.(flip3) ?? out;
});
function containsUndefined(ast) {
  switch (ast._tag) {
    case "Undefined":
      return true;
    case "Union":
      return ast.types.some(containsUndefined);
    default:
      return false;
  }
}
function fromConst(ast, value) {
  const succeed10 = succeed9(value);
  return (input, options) => {
    if (input === missing)
      return missingExit;
    if (input === value)
      return succeed10;
    return fail6(new InvalidType(ast, input, options));
  };
}
function fromRefinement(ast, refinement) {
  return (input, options) => {
    if (input === missing)
      return missingExit;
    if (refinement(input))
      return sameExit;
    return fail6(new InvalidType(ast, input, options));
  };
}
function segmentTemplateLiteralParts(ast, input, options) {
  const parts = ast.encodedParts;
  const literals = ast.literals;
  const inputLength = input.length;
  for (let i = 0;i < literals.length; i++) {
    const literal = literals[i];
    if (literal && !input.includes(literal))
      return;
  }
  if (ast.suffixLengths[0] > inputLength)
    return;
  const out = new Array(parts.length);
  let failures;
  function go(i, pos) {
    if (i === parts.length)
      return pos === inputLength;
    if (failures?.has(i * (inputLength + 1) + pos))
      return false;
    const part = parts[i];
    if (i === parts.length - 1) {
      const s = input.slice(pos);
      if (part.matchPart(s, options) !== undefined) {
        out[i] = s;
        return true;
      }
    } else if (part._tag === "Literal") {
      const s = literals[i];
      if (input.startsWith(s, pos) && go(i + 1, pos + s.length)) {
        out[i] = s;
        return true;
      }
    } else {
      const maximumEnd = inputLength - ast.suffixLengths[i + 1];
      const anchor = literals[i + 1];
      let end3 = anchor === undefined ? maximumEnd : input.lastIndexOf(anchor, maximumEnd);
      while (end3 >= pos) {
        const s = input.slice(pos, end3);
        if (part.matchPart(s, options) !== undefined && go(i + 1, end3)) {
          out[i] = s;
          return true;
        }
        if (end3 === 0)
          break;
        end3 = anchor === undefined ? end3 - 1 : input.lastIndexOf(anchor, end3 - 1);
      }
    }
    failures ??= new Set;
    failures.add(i * (inputLength + 1) + pos);
    return false;
  }
  return go(0, 0) ? out : undefined;
}
var enumsToLiterals = /* @__PURE__ */ memoize((ast) => {
  return new Union(ast.enums.map((e) => new Literal(e[1], {
    title: e[0]
  })), "anyOf");
});
var parameterFromPropertyKey = /* @__PURE__ */ applyToSelfOrLastLinkEncodingIdempotent((ast) => {
  switch (ast._tag) {
    default:
      return ast;
    case "Number":
      return ast.toCodecStringTree();
    case "Union":
      return ast.recur(parameterFromPropertyKey);
  }
});
var parameterFromString = /* @__PURE__ */ applyToSelfOrLastLinkEncodingIdempotent((ast) => {
  switch (ast._tag) {
    default:
      return ast;
    case "Symbol":
    case "UniqueSymbol":
      return ast.toCodecStringTree();
    case "Union":
      return ast.recur(parameterFromString);
  }
});
var partFromString = /* @__PURE__ */ applyToSelfOrLastLinkEncodingIdempotent((ast) => {
  switch (ast._tag) {
    default:
      return ast;
    case "Number":
    case "Literal":
    case "BigInt":
      return ast.toCodecStringTree();
    case "Union":
      return ast.recur(partFromString);
  }
});
var STRING_PATTERN = "[\\s\\S]*?";
var isStringFiniteRegExp = /* @__PURE__ */ new globalThis.RegExp(`^${FINITE_PATTERN}$`);
var isStringNumberRegExp = /* @__PURE__ */ new globalThis.RegExp(`^(?:${FINITE_PATTERN}|Infinity|-Infinity|NaN)$`);
function isStringFinite(annotations) {
  return isPattern(isStringFiniteRegExp, {
    expected: "a string representing a finite number",
    representation: {
      id: "effect/schema/isStringFinite",
      payload: null
    },
    toJsonSchema: () => ({
      pattern: isStringFiniteRegExp.source
    }),
    ...annotations
  });
}
var finiteString = /* @__PURE__ */ appendChecks(string2, [/* @__PURE__ */ isStringFinite()]);
var finiteToString = /* @__PURE__ */ new Link(finiteString, numberFromString);
var numberToString = /* @__PURE__ */ new Link(/* @__PURE__ */ new Union([finiteString, nonFiniteLiterals], "anyOf"), numberFromString);
var BIGINT_PATTERN = "-?\\d+";
var isStringBigIntRegExp = /* @__PURE__ */ new globalThis.RegExp(`^${BIGINT_PATTERN}$`);
function isStringBigInt(annotations) {
  return isPattern(isStringBigIntRegExp, {
    expected: "a string representing a bigint",
    representation: {
      id: "effect/schema/isStringBigInt",
      payload: null
    },
    toJsonSchema: () => ({
      pattern: isStringBigIntRegExp.source
    }),
    ...annotations
  });
}
var bigIntString = /* @__PURE__ */ appendChecks(string2, [/* @__PURE__ */ isStringBigInt({
  expected: "a string representing a bigint"
})]);
var bigIntToString = /* @__PURE__ */ new Link(bigIntString, bigintFromString);
var REGEXP_PATTERN = "Symbol\\((.*)\\)";
var isStringSymbolRegExp = /* @__PURE__ */ new globalThis.RegExp(`^${REGEXP_PATTERN}$`);
var symbolString = /* @__PURE__ */ appendChecks(string2, [/* @__PURE__ */ isStringSymbol()]);
var symbolToString = /* @__PURE__ */ new Link(symbolString, /* @__PURE__ */ new Transformation(/* @__PURE__ */ transform((description) => globalThis.Symbol.for(isStringSymbolRegExp.exec(description)[1])), /* @__PURE__ */ transformOrFail((sym, options) => {
  const key = globalThis.Symbol.keyFor(sym);
  if (key !== undefined) {
    return succeed6(globalThis.String(sym));
  }
  return fail6(new Forbidden({
    message: "cannot serialize to string, Symbol is not registered"
  }, sym, options));
})));
function isStringSymbol(annotations) {
  return isPattern(isStringSymbolRegExp, {
    expected: "a string representing a symbol",
    representation: {
      id: "effect/schema/isStringSymbol",
      payload: null
    },
    toJsonSchema: () => ({
      pattern: isStringSymbolRegExp.source
    }),
    ...annotations
  });
}
function collectIssues(checks, value, issues, ast, options) {
  for (let i = 0;i < checks.length; i++) {
    const check = checks[i];
    if (check._tag === "FilterGroup") {
      issues = collectIssues(check.checks, value, issues, ast, options);
      if (issues && (options.errors !== "all" || issues[issues.length - 1].filter.aborted)) {
        return issues;
      }
    } else {
      const issue = check.run(value, ast, options);
      if (issue) {
        const filter11 = new Filter(check, issue, value, options);
        if (issues)
          issues.push(filter11);
        else
          issues = [filter11];
        if (options.errors !== "all" || check.aborted) {
          return issues;
        }
      }
    }
  }
  return issues;
}
function runChecks(checks, s) {
  const issues = collectIssues(checks, s, undefined, unknown, {
    errors: "all"
  });
  if (issues) {
    const issue = new Composite(unknown, issues);
    return fail2(issue);
  }
  return succeed2(s);
}
function getConstructorDescriptor(ast) {
  if (!isDeclaration(ast))
    return;
  const getDescriptor = ast.annotations?.[CONSTRUCTOR_ANNOTATION_KEY];
  return isFunction(getDescriptor) ? getDescriptor(ast.typeParameters) : undefined;
}
function isJsonLeaf(u) {
  return u === null || typeof u === "string" || typeof u === "boolean" || typeof u === "number" && globalThis.Number.isFinite(u);
}
function isStringTreeLeaf(u) {
  return u === undefined || typeof u === "string";
}
function isTree(u, isLeaf) {
  const cache = new WeakMap;
  const stack = [];
  outer:
    while (true) {
      if (typeof u !== "object" || u === null) {
        if (!isLeaf(u)) {
          return false;
        }
      } else {
        const value = u;
        const cached3 = cache.get(value);
        if (cached3 === false) {
          return false;
        }
        if (cached3 === undefined) {
          const isArray2 = Array.isArray(value);
          if (!isArray2) {
            const prototype = Object.getPrototypeOf(value);
            if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
              return false;
            }
          }
          cache.set(value, false);
          stack.push({
            value,
            keys: isArray2 ? value.length : Object.keys(value),
            index: 0
          });
        }
      }
      while (stack.length > 0) {
        const frame = stack[stack.length - 1];
        const keys4 = frame.keys;
        if (typeof keys4 === "number") {
          if (frame.index < keys4) {
            u = frame.value[frame.index++];
            continue outer;
          }
        } else if (frame.index < keys4.length) {
          u = frame.value[keys4[frame.index++]];
          continue outer;
        }
        cache.set(frame.value, true);
        stack.pop();
      }
      return true;
    }
}
function isJson(u) {
  return isTree(u, isJsonLeaf);
}
var Json = /* @__PURE__ */ new Declaration([], () => (input, ast, options) => isJson(input) ? sameExit : fail6(new InvalidType(ast, input, options)), {
  representation: {
    id: "effect/schema/Json",
    payload: null
  },
  expected: "JSON value",
  toCodecJson: () => {
    return;
  },
  toCodecStringTree: () => unknownToStringTree,
  toArbitrary: () => (fc) => fc.jsonValue()
});
var MutableJson = /* @__PURE__ */ annotate(Json, {
  representation: {
    id: "effect/schema/MutableJson",
    payload: null
  }
});
var unknownToJson = /* @__PURE__ */ new Link(Json, /* @__PURE__ */ passthrough3());
var objectKeywordToJson = /* @__PURE__ */ new Link(/* @__PURE__ */ new Union([/* @__PURE__ */ new Arrays(false, [], [Json]), /* @__PURE__ */ new Objects([], [/* @__PURE__ */ new IndexSignature(string2, Json)])], "anyOf"), /* @__PURE__ */ passthrough3());
function isStringTree(u) {
  return isTree(u, isStringTreeLeaf);
}
var StringTree = /* @__PURE__ */ new Declaration([], () => (input, ast, options) => isStringTree(input) ? sameExit : fail6(new InvalidType(ast, input, options)), {
  expected: "StringTree",
  toCodecStringTree: () => {
    return;
  }
});
var unknownToStringTree = /* @__PURE__ */ new Link(StringTree, /* @__PURE__ */ passthrough3());

// node_modules/effect/dist/SchemaParser.js
function makeEffect(schema) {
  const parser = runWithCompiler(constructorCompiler, toType(schema.ast));
  return (input, options) => {
    return parser(input, options?.disableChecks ? options?.parseOptions ? {
      ...options.parseOptions,
      disableChecks: true
    } : {
      disableChecks: true
    } : options?.parseOptions);
  };
}
function makeOption(schema) {
  const parser = makeEffect(schema);
  return (input, options) => {
    const exit3 = runSyncExit2(parser(input, options));
    if (isSuccess4(exit3)) {
      return some2(exit3.value);
    }
    getSchemaIssueOrThrow(exit3.cause, "Option adapter can only return none for schema issues");
    return none2();
  };
}
function make26(schema) {
  const parser = makeEffect(schema);
  return (input, options) => {
    const exit3 = runSyncExit2(parser(input, options));
    if (isSuccess4(exit3)) {
      return exit3.value;
    }
    const issue = getSchemaIssueOrThrow(exit3.cause, "Constructor adapter can only throw schema issues");
    throw new Error("Schema validation failed", {
      cause: issue
    });
  };
}
function is(schema) {
  return _is(schema.ast);
}
function _is(ast) {
  const parser = asExit(run2(toType(ast)));
  return (input) => {
    const exit3 = parser(input, defaultParseOptions);
    if (isSuccess4(exit3)) {
      return true;
    }
    getSchemaIssueOrThrow(exit3.cause, "Type guard adapter can only return false for schema issues");
    return false;
  };
}
function _issue(ast) {
  const parser = run2(ast);
  return (input, options) => {
    const exit3 = runSyncExit2(parser(input, options));
    if (isSuccess4(exit3)) {
      return;
    }
    return getSchemaIssueOrThrow(exit3.cause, "Issue adapter can only return schema issues");
  };
}
function asserts(schema, input) {
  const parser = asExit(run2(toType(schema.ast)));
  const exit3 = parser(input, defaultParseOptions);
  if (isFailure4(exit3)) {
    const issue = getSchemaIssueOrThrow(exit3.cause, "Assertion adapter can only throw schema issues");
    throw new Error("Schema validation failed", {
      cause: issue
    });
  }
}
function decodeUnknownEffect(schema, options) {
  const parser = run2(schema.ast);
  return options === undefined ? parser : (input, overrideOptions) => parser(input, mergeParseOptions(options, overrideOptions));
}
var decodeEffect = decodeUnknownEffect;
function decodeUnknownExit(schema, options) {
  return asExit(decodeUnknownEffect(schema, options));
}
function decodeUnknownOption(schema, options) {
  return asOption(decodeUnknownEffect(schema, options));
}
var decodeOption = decodeUnknownOption;
function decodeUnknownResult(schema, options) {
  return asResult(decodeUnknownEffect(schema, options));
}
function decodeUnknownSync(schema, options) {
  return asSync(decodeUnknownEffect(schema, options));
}
var decodeSync = decodeUnknownSync;
function encodeUnknownEffect(schema, options) {
  const parser = run2(flip3(schema.ast));
  return options === undefined ? parser : (input, overrideOptions) => parser(input, mergeParseOptions(options, overrideOptions));
}
function encodeUnknownExit(schema, options) {
  return asExit(encodeUnknownEffect(schema, options));
}
function encodeUnknownOption(schema, options) {
  return asOption(encodeUnknownEffect(schema, options));
}
var encodeOption = encodeUnknownOption;
function encodeUnknownResult(schema, options) {
  return asResult(encodeUnknownEffect(schema, options));
}
function encodeUnknownSync(schema, options) {
  return asSync(encodeUnknownEffect(schema, options));
}
var encodeSync = encodeUnknownSync;
var mergeParseOptions = (options, overrideOptions) => overrideOptions ? {
  ...options,
  ...overrideOptions
} : options;
var getValue = (value) => {
  if (value === missing) {
    return fail6(new InvalidValue);
  }
  return succeed6(value);
};
function run2(ast) {
  return runWithCompiler(normalCompiler, ast);
}
function runWithCompiler(compiler, ast) {
  let parser;
  return (input, options) => {
    const result4 = (parser ??= compiler(ast))(input, options ?? defaultParseOptions);
    if (result4 === sameExit) {
      return succeed6(input);
    }
    if (!effectIsExit(result4)) {
      return flatMapEager2(result4, getValue);
    }
    return result4[args] === missing ? getValue(missing) : result4;
  };
}
function asExit(parser) {
  return (input, options) => runSyncExit2(parser(input, options));
}
function asOption(parser) {
  const parserExit = asExit(parser);
  return (input, options) => {
    const exit3 = parserExit(input, options);
    if (isSuccess4(exit3)) {
      return some2(exit3.value);
    }
    getSchemaIssueOrThrow(exit3.cause, "Option adapter can only return none for schema issues");
    return none2();
  };
}
function asResult(parser) {
  const parserExit = asExit(parser);
  return (input, options) => {
    const exit3 = parserExit(input, options);
    if (isSuccess4(exit3)) {
      return succeed2(exit3.value);
    }
    return fail2(getSchemaIssueOrThrow(exit3.cause, "Result adapter can only return schema issues"));
  };
}
function asSync(parser) {
  const parserExit = asExit(parser);
  return (input, options) => {
    const exit3 = parserExit(input, options);
    if (isSuccess4(exit3)) {
      return exit3.value;
    }
    const issue = getSchemaIssueOrThrow(exit3.cause, "Sync adapter can only throw schema issues");
    throw new Error("Schema validation failed", {
      cause: issue
    });
  };
}
var normalCompiler = /* @__PURE__ */ memoize((ast) => makeParser(ast, normalCompiler));
var constructorCompiler = /* @__PURE__ */ memoize((ast) => makeParser(ast, constructorCompiler, compileConstructorDefault));
var compileDefaulted = /* @__PURE__ */ memoize((ast) => makeParser(ast, constructorCompiler, compileConstructorDefault, ast.context?.constructorDefault));
function compileConstructorDefault(ast) {
  return ast.context?.constructorDefault ? compileDefaulted(ast) : constructorCompiler(ast);
}
function applyTransformation(result4, current, transformation, options) {
  let transformed;
  if (effectIsExit(result4) && result4._tag === "Success") {
    const optional2 = toOption(result4 === sameExit ? current : result4[args]);
    transformed = transformation._tag === "Transformation" ? transformation.decode.run(optional2, options) : transformation.decode(succeed9(optional2), options);
  } else if (transformation._tag === "Transformation") {
    transformed = flatMapEager2(result4, (value) => transformation.decode.run(toOption(value), options));
  } else {
    transformed = transformation.decode(mapEager2(result4, toOption), options);
  }
  return effectIsExit(transformed) && transformed._tag === "Success" ? fromOptionExit(transformed[args]) : flatMapEager2(transformed, fromOptionExit);
}
function makeConstructorParser(descriptor, compile) {
  let sourceParser;
  return (input, options) => {
    if (input === missing)
      return missingExit;
    if (descriptor.isConstructed(input))
      return sameExit;
    const result4 = (sourceParser ??= compile(descriptor.link.to))(input, options);
    return applyTransformation(result4, input, descriptor.link.transformation, options);
  };
}
function makeParser(ast, compile, compileConstructorDefault2, constructorDefault) {
  const descriptor = compileConstructorDefault2 ? getConstructorDescriptor(ast) : undefined;
  const parser = descriptor ? makeConstructorParser(descriptor, compile) : ast.getParser(compile, compileConstructorDefault2);
  const checks = ast.checks;
  const links = constructorDefault ? ast.encoding ? [...ast.encoding, constructorDefault] : [constructorDefault] : ast.encoding;
  const encodingChecks = ast.encodingChecks;
  const astOptions = (checks ? checks[checks.length - 1].annotations : ast.annotations)?.["parseOptions"];
  if (!links && !checks && !encodingChecks) {
    if (!astOptions) {
      return parser;
    }
    return (input, options) => parser(input, mergeParseOptions(options, astOptions));
  }
  let encodingParsers;
  const parseLocal = (input, options) => {
    let result4 = parser(input, options);
    if (encodingChecks && !options.disableChecks) {
      if (effectIsExit(result4)) {
        if (result4._tag === "Success") {
          const output = result4 === sameExit ? input : result4[args];
          if (input !== missing && output !== missing) {
            const issues = collectIssues(encodingChecks, input, undefined, ast, options);
            if (issues) {
              result4 = fail6(new Composite(ast, issues, input, options));
            }
          }
        }
      } else {
        result4 = flatMap5(result4, (value) => {
          if (input !== missing && value !== missing) {
            const issues = collectIssues(encodingChecks, input, undefined, ast, options);
            if (issues) {
              return fail6(new Composite(ast, issues, input, options));
            }
          }
          return succeed6(value);
        });
      }
    }
    if (checks && !options.disableChecks) {
      if (effectIsExit(result4)) {
        if (result4._tag === "Success") {
          const value = result4 === sameExit ? input : result4[args];
          if (value === missing)
            return result4;
          const issues = collectIssues(checks, value, undefined, ast, options);
          if (issues) {
            result4 = fail6(new Composite(ast, issues, value, options));
          }
        }
      } else {
        result4 = flatMap5(result4, (value) => {
          if (value !== missing) {
            const issues = collectIssues(checks, value, undefined, ast, options);
            if (issues) {
              return fail6(new Composite(ast, issues, value, options));
            }
          }
          return succeed6(value);
        });
      }
    }
    return result4;
  };
  if (!links) {
    return astOptions ? (input, options) => parseLocal(input, mergeParseOptions(options, astOptions)) : parseLocal;
  }
  return (input, options) => {
    if (astOptions) {
      options = mergeParseOptions(options, astOptions);
    }
    const parsers = encodingParsers ??= links.map((link) => compile(link.to));
    let current = input;
    let result4 = parsers[parsers.length - 1](input, options);
    for (let i = links.length - 1;i >= 0; i--) {
      result4 = applyTransformation(result4, current, links[i].transformation, options);
      if (i !== 0) {
        const next = parsers[i - 1];
        if (result4._tag === "Success") {
          current = result4[args];
          result4 = next(current, options);
        } else {
          result4 = flatMapEager2(result4, (value) => {
            const nextResult = next(value, options);
            return nextResult === sameExit ? succeed9(value) : nextResult;
          });
        }
      }
    }
    if (result4._tag === "Success") {
      const value = result4[args];
      const local = parseLocal(value, options);
      return local === sameExit ? result4 : local;
    }
    result4 = catchCause3(result4, (cause) => failCauseSync2(() => map6(cause, (issue) => new Encoding(ast, issue, input, options))));
    return flatMapEager2(result4, (value) => {
      const local = parseLocal(value, options);
      return local === sameExit ? succeed9(value) : local;
    });
  };
}

// node_modules/effect/dist/internal/schema/schema.js
var TypeId33 = "~effect/Schema/Schema";
function makeDeclarationReviver(id, payloadSchema, revive) {
  return {
    id,
    payloadSchema,
    revive
  };
}
function makeFilterReviver(id, payloadSchema, revive) {
  return {
    id,
    payloadSchema,
    revive
  };
}
var SchemaProto = {
  [TypeId33]: TypeId33,
  pipe() {
    return pipeArguments(this, arguments);
  },
  annotate(annotations) {
    return this.rebuild(annotate(this.ast, annotations));
  },
  annotateKey(annotations) {
    return this.rebuild(annotateKey(this.ast, annotations));
  },
  check(...checks) {
    return this.rebuild(appendChecks(this.ast, checks));
  }
};
function make27(ast, options) {
  function Schema() {}
  const self = Object.defineProperties(Object.setPrototypeOf(Schema, SchemaProto), Object.getOwnPropertyDescriptors({
    ...options
  }));
  self.ast = ast;
  self.rebuild = (ast2) => make27(ast2, options);
  self.makeEffect = makeEffect(self);
  self.make = make26(self);
  self.makeOption = makeOption(self);
  return self;
}

// node_modules/effect/dist/Boolean.js
var Boolean2 = globalThis.Boolean;
var ReducerOr = /* @__PURE__ */ make2((a, b) => a || b, false);

// node_modules/effect/dist/Struct.js
var pick2 = /* @__PURE__ */ dual(2, (self, keys4) => {
  return buildStruct(self, (k, v) => keys4.includes(k) ? [k, v] : undefined);
});
var omit3 = /* @__PURE__ */ dual(2, (self, keys4) => {
  return buildStruct(self, (k, v) => !keys4.includes(k) ? [k, v] : undefined);
});
var assign = /* @__PURE__ */ dual(2, (self, that) => {
  return {
    ...self,
    ...that
  };
});
var renameKeys = /* @__PURE__ */ dual(2, (self, mapping) => {
  return buildStruct(self, (k, v) => [Object.hasOwn(mapping, k) ? mapping[k] : k, v]);
});
var lambda = (f) => f;
function buildStruct(source, f) {
  const out = {};
  for (const k of Reflect.ownKeys(source)) {
    if (!Object.prototype.propertyIsEnumerable.call(source, k))
      continue;
    const res = f(k, source[k]);
    if (res) {
      const [nk, nv] = res;
      assignProperty(out, nk, nv);
    }
  }
  return out;
}
function makeCombiner(combiners, options) {
  const omitKeyWhen = options?.omitKeyWhen ?? (() => false);
  return make((self, that) => {
    const keys4 = Reflect.ownKeys(combiners);
    const out = {};
    for (const key of keys4) {
      const merge5 = combiners[key].combine(self[key], that[key]);
      if (omitKeyWhen(merge5))
        continue;
      assignProperty(out, key, merge5);
    }
    return out;
  });
}

// node_modules/effect/dist/UndefinedOr.js
function makeReducer(combiner) {
  return make2((self, that) => {
    if (self === undefined)
      return that;
    if (that === undefined)
      return self;
    return combiner.combine(self, that);
  }, undefined);
}

// node_modules/effect/dist/internal/errors.js
function errorWithPath(message, path) {
  if (path.length > 0) {
    message += `
  at ${formatPath(path)}`;
  }
  return new Error(message);
}

// node_modules/effect/dist/internal/schema/toArbitrary.js
var arbitraryMemoMap = /* @__PURE__ */ new WeakMap;
var suspendDepthIdentifierMap = /* @__PURE__ */ new WeakMap;
var emptyRecursionStack = [];
function arbitraryError(what) {
  return new Error(`Unable to derive an arbitrary for ${what}`);
}
var entryComparator = ([a], [b]) => equals(a, b);
function applyChecks(ast, filters, arbitrary) {
  return filters.reduce((acc, filter11) => acc.filter((a) => filter11.run(a, ast, defaultParseOptions) === undefined), arbitrary);
}
function validateArrayConstraints(constraint, label) {
  if (constraint?.minLength !== undefined && constraint.maxLength !== undefined && constraint.minLength > constraint.maxLength) {
    throw arbitraryError(`${label} constraints`);
  }
}
function lengthToFastCheckConstraints(constraint) {
  return constraint === undefined || constraint.minLength === undefined && constraint.maxLength === undefined ? undefined : {
    ...constraint.minLength !== undefined ? {
      minLength: constraint.minLength
    } : {},
    ...constraint.maxLength !== undefined ? {
      maxLength: constraint.maxLength
    } : {}
  };
}
function arrayWithConstraints(fc, item, constraint, comparator) {
  return comparator ? fc.uniqueArray(item, {
    ...constraint,
    comparator
  }) : fc.array(item, constraint);
}
function array2(fc, ctx, item, terminal = false) {
  const constraint = ctx.constraint;
  const arrayConstraints = lengthToFastCheckConstraints(constraint);
  validateArrayConstraints(arrayConstraints, "array");
  return arrayWithConstraints(fc, item, terminal ? {
    ...arrayConstraints,
    maxLength: arrayConstraints?.minLength ?? 0
  } : arrayConstraints, constraint?.unique ? equals : undefined);
}
function appendArray(fc, out, len, rest) {
  return out.chain((as3) => as3.length < len ? fc.constant(as3) : rest.map((rest2) => [...as3, ...rest2]));
}
function appendObjectEntries(out, entries3) {
  return out.chain((o) => entries3.map((entries4) => ({
    ...Object.fromEntries(entries4),
    ...o
  })));
}
var max4 = /* @__PURE__ */ makeReducer(ReducerMax);
var min4 = /* @__PURE__ */ makeReducer(ReducerMin);
var or = /* @__PURE__ */ makeReducer(ReducerOr);
var concat2 = /* @__PURE__ */ makeReducer(/* @__PURE__ */ makeReducerConcat());
var combiner = /* @__PURE__ */ makeCombiner({
  integer: or,
  maxLength: min4,
  minLength: max4,
  noInfinity: or,
  noNaN: or,
  patterns: concat2,
  unique: or
}, {
  omitKeyWhen: isUndefined
});
function mergeOrderedBound(order, self, selfExclusive, that, thatExclusive, takeComparison) {
  if (that === undefined || self === undefined) {
    return that === undefined ? [self, selfExclusive] : [that, thatExclusive];
  }
  const comparison = order(self, that);
  return comparison === takeComparison ? [that, thatExclusive] : comparison === 0 ? [self, selfExclusive || thatExclusive] : [self, selfExclusive];
}
function mergeOrderedConstraints(self, that) {
  if (self === undefined) {
    return that;
  }
  if (self.order !== that.order) {
    throw new Error("Cannot merge ordered arbitrary constraints with different Order instances");
  }
  const [minimum, exclusiveMinimum] = mergeOrderedBound(self.order, self.minimum, self.exclusiveMinimum, that.minimum, that.exclusiveMinimum, -1);
  const [maximum, exclusiveMaximum] = mergeOrderedBound(self.order, self.maximum, self.exclusiveMaximum, that.maximum, that.exclusiveMaximum, 1);
  return {
    order: self.order,
    ...minimum !== undefined ? {
      minimum
    } : {},
    ...exclusiveMinimum !== undefined ? {
      exclusiveMinimum
    } : {},
    ...maximum !== undefined ? {
      maximum
    } : {},
    ...exclusiveMaximum !== undefined ? {
      exclusiveMaximum
    } : {}
  };
}
function mergeConstraint(self, that) {
  const {
    ordered: selfOrdered,
    ...selfRest
  } = self ?? {};
  const {
    ordered: thatOrdered,
    ...thatRest
  } = that;
  const ordered = thatOrdered === undefined ? selfOrdered : mergeOrderedConstraints(selfOrdered, thatOrdered);
  const out = combiner.combine(selfRest, thatRest);
  return {
    ...out,
    ...ordered === undefined ? {} : {
      ordered
    }
  };
}
function collectChecks(checks) {
  const filters = [];
  const arbitraries = [];
  function visit(check) {
    if (check.annotations?.arbitrary) {
      arbitraries.push(check.annotations.arbitrary);
    }
    if (check._tag !== "Filter") {
      for (const child of check.checks) {
        visit(child);
      }
    } else {
      filters.push(check);
    }
  }
  checks?.forEach(visit);
  return {
    filters,
    arbitraries
  };
}
function constraintContext(arbitraries) {
  const constraintAnnotations = arbitraries.map(({
    constraint
  }) => constraint).filter(isNotUndefined);
  return (ctx) => {
    const constraint = constraintAnnotations.reduce((acc, c) => mergeConstraint(acc, c), ctx.constraint);
    return {
      ...ctx,
      constraint
    };
  };
}
function resetContext(ctx) {
  return {
    ...ctx,
    constraint: undefined
  };
}
function objectEntriesConstraints(ast, constraint, requiredKeys) {
  if (constraint === undefined || constraint.minLength === undefined && constraint.maxLength === undefined) {
    return;
  }
  if (constraint.minLength !== undefined && ast.indexSignatures.length === 0 && constraint.minLength > ast.propertySignatures.length) {
    throw arbitraryError("object property constraints");
  }
  const out = {};
  if (constraint.minLength !== undefined) {
    out.minLength = Math.max(0, constraint.minLength - requiredKeys);
  }
  if (constraint.maxLength !== undefined) {
    out.maxLength = constraint.maxLength - requiredKeys;
    if (out.maxLength < 0) {
      throw arbitraryError("object property constraints");
    }
  }
  validateArrayConstraints(out, "object property");
  return out;
}
function objectWithOptionalCount(fc, pss, orderedNames, requiredKeys, optionalNames, constraint) {
  const requiredCount = requiredKeys.length;
  if (constraint.maxLength !== undefined && constraint.maxLength < requiredCount) {
    throw arbitraryError("object property constraints");
  }
  const minOptional = constraint.minLength === undefined ? 0 : Math.max(0, constraint.minLength - requiredCount);
  const maxOptional = constraint.maxLength === undefined ? optionalNames.length : Math.min(optionalNames.length, constraint.maxLength - requiredCount);
  if (minOptional > maxOptional) {
    throw arbitraryError("object property constraints");
  }
  const full = fc.record(pss, {
    requiredKeys: [...requiredKeys, ...optionalNames]
  });
  const chosen = fc.shuffledSubarray([...optionalNames], {
    minLength: minOptional,
    maxLength: maxOptional
  });
  return fc.tuple(full, chosen).map(([base, names]) => {
    const keep = new Set([...requiredKeys, ...names]);
    const out = {};
    for (const name of orderedNames) {
      if (keep.has(name)) {
        assignProperty(out, name, base[name]);
      }
    }
    return out;
  });
}
function toRangeConstraints(ordered, min5, max5, error) {
  const out = {};
  if (ordered?.minimum !== undefined) {
    out.min = min5(ordered.minimum, ordered.exclusiveMinimum === true);
  }
  if (ordered?.maximum !== undefined) {
    out.max = max5(ordered.maximum, ordered.exclusiveMaximum === true);
  }
  if (out.min !== undefined && out.max !== undefined && out.min > out.max) {
    throw arbitraryError(error);
  }
  return out;
}
function toIntegerConstraints(ordered) {
  return toRangeConstraints(ordered, (minimum, excluded) => excluded ? Math.floor(minimum) + 1 : Math.ceil(minimum), (maximum, excluded) => excluded ? Math.ceil(maximum) - 1 : Math.floor(maximum), "integer constraints");
}
function toFloatConstraints(constraint, ordered) {
  const out = {
    ...constraint?.noInfinity ? {
      noDefaultInfinity: true
    } : {},
    ...constraint?.noNaN ? {
      noNaN: true
    } : {},
    ...ordered?.minimum !== undefined ? {
      min: ordered.minimum
    } : {},
    ...ordered?.exclusiveMinimum !== undefined ? {
      minExcluded: ordered.exclusiveMinimum
    } : {},
    ...ordered?.maximum !== undefined ? {
      max: ordered.maximum
    } : {},
    ...ordered?.exclusiveMaximum !== undefined ? {
      maxExcluded: ordered.exclusiveMaximum
    } : {}
  };
  if (out.min !== undefined && out.max !== undefined && (out.min > out.max || out.min === out.max && (out.minExcluded || out.maxExcluded))) {
    throw arbitraryError("number constraints");
  }
  return out;
}
function toBigIntConstraints(ordered) {
  return toRangeConstraints(ordered, (minimum, excluded) => excluded ? minimum + BigInt(1) : minimum, (maximum, excluded) => excluded ? maximum - BigInt(1) : maximum, "the ordered bigint constraints");
}
function makeLazy(normal, terminal) {
  const out = (fc, ctx, recursionStack = emptyRecursionStack) => normal(fc, ctx, recursionStack);
  out.terminal = (fc, ctx, recursionStack = emptyRecursionStack) => terminal(fc, ctx, recursionStack);
  return out;
}
function same(f) {
  return makeLazy(f, f);
}
function getSuspendRecursion(fc, ast) {
  const depthIdentifier = suspendDepthIdentifierMap.get(ast) ?? fc.createDepthIdentifier();
  suspendDepthIdentifierMap.set(ast, depthIdentifier);
  return {
    maxDepth: 2,
    depthIdentifier
  };
}
function oneOf(fc, arbitraries) {
  return arbitraries.length === 0 ? undefined : arbitraries.length === 1 ? arbitraries[0] : fc.oneof(...arbitraries);
}
var finiteNumberConstraint = {
  noInfinity: true,
  noNaN: true
};
function finiteNumberContext(ctx) {
  return {
    ...ctx,
    constraint: finiteNumberConstraint
  };
}
function applyCandidates(fc, ctx, arbitraries, base) {
  const weighted = base === undefined ? [] : [{
    arbitrary: base,
    weight: 1
  }];
  for (const {
    candidate
  } of arbitraries) {
    if (!candidate) {
      continue;
    }
    const arbitrary = candidate.make(fc, ctx);
    if (arbitrary === undefined) {
      continue;
    }
    const weight = candidate.weight ?? 1;
    if (!globalThis.Number.isInteger(weight) || weight <= 0) {
      throw arbitraryError("a candidate with an invalid weight");
    }
    weighted.push({
      arbitrary,
      weight
    });
  }
  return weighted.length === 0 ? undefined : weighted.length === 1 ? weighted[0].arbitrary : fc.oneof(...weighted);
}
function applyFilterLayer(ast, checks, fc, ctx, base) {
  const out = applyCandidates(fc, ctx, checks.arbitraries, base);
  return out === undefined ? undefined : applyChecks(ast, checks.filters, out);
}
function normalizeDerivation(output, hasTypeParameters) {
  if (!(typeof output === "object" && output !== null && ("arbitrary" in output))) {
    return {
      arbitrary: output,
      terminal: hasTypeParameters ? undefined : output
    };
  }
  const terminal = "terminal" in output ? output.terminal : hasTypeParameters ? undefined : output.arbitrary;
  return {
    arbitrary: output.arbitrary,
    terminal
  };
}
function makeTypeParameters(typeParameters, fc, ctx, recursionStack, lazyNormal) {
  return typeParameters.map((tp) => ({
    arbitrary: lazyNormal ? fc.constant(null).chain(() => tp(fc, ctx, recursionStack)) : tp(fc, ctx, recursionStack),
    terminal: tp.terminal(fc, ctx, recursionStack)
  }));
}
function filterLayer(ast, checks, normalBase, terminalBase) {
  const f = constraintContext(checks.arbitraries);
  return makeLazy((fc, ctx, recursionStack) => {
    const nextCtx = f(ctx);
    return applyFilterLayer(ast, checks, fc, nextCtx, normalBase(fc, ctx, nextCtx, recursionStack));
  }, (fc, ctx, recursionStack) => {
    const nextCtx = f(ctx);
    return applyFilterLayer(ast, checks, fc, nextCtx, terminalBase(fc, ctx, nextCtx, recursionStack));
  });
}
var memoized = /* @__PURE__ */ memoize((ast) => recur(ast, []));
function recur(ast, path) {
  const annotation = resolve(ast)?.toArbitrary;
  if (annotation) {
    const typeParameters = isDeclaration(ast) ? ast.typeParameters.map((tp) => recur(tp, path)) : [];
    const checks = collectChecks(ast.checks);
    const derive = (lazyNormal) => (fc, ctx, nextCtx, recursionStack) => normalizeDerivation(annotation(makeTypeParameters(typeParameters, fc, resetContext(ctx), recursionStack, lazyNormal))(fc, nextCtx), typeParameters.length > 0)[lazyNormal ? "terminal" : "arbitrary"];
    return filterLayer(ast, checks, derive(false), derive(true));
  }
  if (ast.checks) {
    const checks = collectChecks(ast.checks);
    const lawc = recur(replaceChecks(ast, undefined), path);
    return filterLayer(ast, checks, (fc, _ctx, nextCtx, recursionStack) => lawc(fc, nextCtx, recursionStack), (fc, _ctx, nextCtx, recursionStack) => lawc.terminal(fc, nextCtx, recursionStack));
  }
  return base(ast, path);
}
function base(ast, path) {
  switch (ast._tag) {
    case "Never":
    case "Declaration":
      throw errorWithPath(`Unsupported AST ${ast._tag}`, path);
    case "Null":
      return same((fc) => fc.constant(null));
    case "Void":
    case "Undefined":
      return same((fc) => fc.constant(undefined));
    case "Unknown":
    case "Any":
      return same((fc) => fc.anything());
    case "String":
      return same((fc, ctx) => {
        const constraint = ctx.constraint;
        const patterns = constraint?.patterns;
        return patterns ? fc.oneof(...patterns.map((pattern) => fc.stringMatching(new RegExp(pattern)))) : fc.string(lengthToFastCheckConstraints(constraint));
      });
    case "Number":
      return same((fc, ctx) => {
        const constraint = ctx.constraint;
        const ordered = constraint?.ordered?.order === Number2 ? constraint.ordered : undefined;
        return constraint?.integer ? fc.integer(toIntegerConstraints(ordered)) : fc.float(toFloatConstraints(constraint, ordered));
      });
    case "Boolean":
      return same((fc) => fc.boolean());
    case "BigInt":
      return same((fc, ctx) => {
        const ordered = ctx.constraint?.ordered?.order === BigInt2 ? ctx.constraint.ordered : undefined;
        return fc.bigInt(toBigIntConstraints(ordered));
      });
    case "Symbol":
      return same((fc) => fc.string().map(Symbol.for));
    case "Literal":
      return same((fc) => fc.constant(ast.literal));
    case "UniqueSymbol":
      return same((fc) => fc.constant(ast.symbol));
    case "ObjectKeyword":
      return same((fc) => fc.oneof(fc.object(), fc.array(fc.anything())));
    case "Enum":
      return recur(enumsToLiterals(ast), path);
    case "TemplateLiteral": {
      const parts = ast.parts.map((part, i) => recur(toEncoded(part), [...path, i]));
      return same((fc, ctx, recursionStack) => fc.tuple(...parts.map((part) => part(fc, finiteNumberContext(ctx), recursionStack))).map((segments) => segments.map((segment) => globalThis.String(segment)).join("")));
    }
    case "Arrays": {
      const elements = ast.elements.map((ast2, i) => ({
        ast: ast2,
        arbitrary: recur(ast2, [...path, i])
      }));
      const len = ast.elements.length;
      const rest = ast.rest.map((ast2, i) => ({
        ast: ast2,
        arbitrary: recur(ast2, [...path, len + i])
      }));
      const terminal = (fc, ctx, recursionStack) => {
        const reset = resetContext(ctx);
        const elementArbitraries = [];
        const optionals = [];
        let length = 0;
        for (const element of elements) {
          const out2 = element.arbitrary.terminal(fc, reset, recursionStack);
          if (isOptional(element.ast)) {
            optionals.push(out2);
            continue;
          }
          if (out2 === undefined) {
            return;
          }
          length++;
          elementArbitraries.push(out2.map(some2));
        }
        const minLength = ctx.constraint?.minLength ?? 0;
        const needsRest = isReadonlyArrayNonEmpty(rest) && minLength > length + optionals.length;
        const optionalTarget = needsRest ? optionals.length : Math.max(0, minLength - length);
        let includedOptionals = 0;
        for (const out2 of optionals) {
          if (includedOptionals >= optionalTarget || out2 === undefined) {
            elementArbitraries.push(fc.constant(none2()));
            continue;
          }
          includedOptionals++;
          length++;
          elementArbitraries.push(out2.map(some2));
        }
        if (includedOptionals < optionalTarget) {
          return;
        }
        let out = fc.tuple(...elementArbitraries).map(getSomes);
        if (isReadonlyArrayNonEmpty(rest)) {
          const [head3, ...tail] = rest;
          const restCtx = ast.elements.length === 0 ? ctx : reset;
          const minRestLength = Math.max(0, minLength - length - tail.length);
          const headArbitrary = minRestLength === 0 ? undefined : head3.arbitrary.terminal(fc, reset, recursionStack);
          if (minRestLength > 0 && headArbitrary === undefined) {
            return;
          }
          const restArbitrary = minRestLength === 0 ? fc.constant([]) : array2(fc, {
            ...restCtx,
            constraint: {
              ...restCtx.constraint,
              minLength: minRestLength
            }
          }, headArbitrary, true);
          out = appendArray(fc, out, len, restArbitrary);
          if (tail.length > 0) {
            const tailArbitraries = [];
            for (const element of tail) {
              const out2 = element.arbitrary.terminal(fc, reset, recursionStack);
              if (out2 === undefined) {
                return;
              }
              tailArbitraries.push(out2);
            }
            const t = fc.tuple(...tailArbitraries);
            out = appendArray(fc, out, len, t);
          }
        }
        return out;
      };
      return makeLazy((fc, ctx, recursionStack) => {
        const reset = resetContext(ctx);
        const elementArbitraries = elements.map(({
          ast: ast2,
          arbitrary
        }) => {
          const out2 = arbitrary(fc, reset, recursionStack);
          return isOptional(ast2) ? out2.chain((a) => fc.boolean().map((b) => b ? some2(a) : none2())) : out2.map(some2);
        });
        let out = fc.tuple(...elementArbitraries).map((elements2) => getSomes(takeWhile(elements2, isSome2)));
        if (isReadonlyArrayNonEmpty(rest)) {
          const [head3, ...tail] = rest.map(({
            arbitrary
          }) => arbitrary(fc, reset, recursionStack));
          const restArbitrary = array2(fc, ast.elements.length === 0 ? ctx : reset, head3);
          out = appendArray(fc, out, len, restArbitrary);
          if (tail.length > 0) {
            const t = fc.tuple(...tail);
            out = appendArray(fc, out, len, t);
          }
        }
        if (ctx.recursion) {
          const terminalOut = terminal(fc, ctx, recursionStack);
          if (terminalOut !== undefined) {
            return fc.oneof(ctx.recursion, terminalOut, out);
          }
        }
        return out;
      }, terminal);
    }
    case "Objects": {
      const propertySignatures = ast.propertySignatures.map((ps) => ({
        ps,
        arbitrary: recur(ps.type, [...path, ps.name])
      }));
      const indexSignatures = ast.indexSignatures.map((is2) => ({
        is: is2,
        parameter: recur(is2.parameter, path),
        type: recur(is2.type, path)
      }));
      const terminal = (fc, ctx, recursionStack) => {
        const reset = resetContext(ctx);
        const pss = {};
        const requiredKeys = [];
        const optionals = [];
        for (const {
          ps,
          arbitrary
        } of propertySignatures) {
          const name = ps.name;
          const out2 = arbitrary.terminal(fc, reset, recursionStack);
          if (isOptional(ps.type)) {
            if (out2 !== undefined) {
              optionals.push([name, out2]);
            }
            continue;
          }
          if (out2 === undefined) {
            return;
          }
          requiredKeys.push(name);
          assignProperty(pss, name, out2);
        }
        let optionalCount = Math.max(0, (ctx.constraint?.minLength ?? 0) - requiredKeys.length);
        for (const [name, out2] of optionals) {
          if (optionalCount === 0) {
            break;
          }
          optionalCount--;
          requiredKeys.push(name);
          assignProperty(pss, name, out2);
        }
        if (optionalCount > 0 && ast.indexSignatures.length === 0) {
          return;
        }
        let out = fc.record(pss, {
          requiredKeys
        });
        const entriesConstraints = objectEntriesConstraints(ast, ctx.constraint, requiredKeys.length);
        const minEntries = entriesConstraints?.minLength ?? 0;
        for (const {
          parameter,
          type
        } of indexSignatures) {
          let entries3;
          if (minEntries === 0) {
            entries3 = fc.constant([]);
          } else {
            const key = parameter.terminal(fc, reset, recursionStack);
            const value = type.terminal(fc, reset, recursionStack);
            if (key === undefined || value === undefined) {
              return;
            }
            entries3 = arrayWithConstraints(fc, fc.tuple(key, value), {
              ...entriesConstraints,
              maxLength: minEntries
            }, entryComparator);
          }
          out = appendObjectEntries(out, entries3);
        }
        return out;
      };
      return makeLazy((fc, ctx, recursionStack) => {
        const reset = resetContext(ctx);
        const pss = {};
        const orderedNames = [];
        const requiredKeys = [];
        const optionalNames = [];
        for (const {
          ps,
          arbitrary
        } of propertySignatures) {
          const name = ps.name;
          orderedNames.push(name);
          if (isOptional(ps.type)) {
            optionalNames.push(name);
          } else {
            requiredKeys.push(name);
          }
          assignProperty(pss, name, arbitrary(fc, reset, recursionStack));
        }
        const constraint = ctx.constraint;
        if (optionalNames.length > 0 && indexSignatures.length === 0 && constraint !== undefined && (constraint.minLength !== undefined || constraint.maxLength !== undefined)) {
          return objectWithOptionalCount(fc, pss, orderedNames, requiredKeys, optionalNames, constraint);
        }
        let out = fc.record(pss, {
          requiredKeys
        });
        const entriesConstraints = objectEntriesConstraints(ast, ctx.constraint, requiredKeys.length);
        for (const {
          parameter,
          type
        } of indexSignatures) {
          const entry = fc.tuple(parameter(fc, reset, recursionStack), type(fc, reset, recursionStack));
          const entries3 = arrayWithConstraints(fc, entry, entriesConstraints, entryComparator);
          out = appendObjectEntries(out, entries3);
        }
        return out;
      }, terminal);
    }
    case "Union": {
      const types = ast.types.map((ast2) => recur(ast2, path));
      const terminal = (fc, ctx, recursionStack) => oneOf(fc, types.map((type) => type.terminal(fc, ctx, recursionStack)).filter(isNotUndefined));
      return makeLazy((fc, ctx, recursionStack) => {
        const arbitraries = types.map((type) => type(fc, ctx, recursionStack));
        if (ctx.recursion) {
          const terminalOut = terminal(fc, ctx, recursionStack);
          if (terminalOut !== undefined) {
            return fc.oneof(ctx.recursion, terminalOut, ...arbitraries);
          }
        }
        const out = oneOf(fc, arbitraries);
        if (out === undefined) {
          throw arbitraryError("a union with no members");
        }
        return out;
      }, terminal);
    }
    case "Suspend": {
      const memo = arbitraryMemoMap.get(ast);
      if (memo)
        return memo;
      const get9 = memoizeThunk(() => recur(ast.thunk(), path));
      const out = makeLazy((fc, ctx, recursionStack) => {
        const recursion = getSuspendRecursion(fc, ast);
        const nextCtx = {
          ...ctx,
          recursion
        };
        const nextStack = recursionStack.includes(ast) ? recursionStack : [...recursionStack, ast];
        const terminal = get9().terminal(fc, nextCtx, nextStack);
        if (terminal === undefined) {
          throw errorWithPath("Unable to derive an arbitrary for a recursive schema without a finite generation path", path);
        }
        return fc.oneof(recursion, terminal, fc.constant(null).chain(() => get9()(fc, nextCtx, nextStack)));
      }, (fc, ctx, recursionStack) => {
        if (recursionStack.includes(ast)) {
          return;
        }
        const recursion = getSuspendRecursion(fc, ast);
        return get9().terminal(fc, {
          ...ctx,
          recursion
        }, [...recursionStack, ast]);
      });
      arbitraryMemoMap.set(ast, out);
      return out;
    }
  }
}

// node_modules/effect/dist/internal/schema/toEquivalence.js
var toEquivalence = /* @__PURE__ */ memoize((ast) => {
  return recur2(ast, []);
});
function recur2(ast, path) {
  const annotation = resolve(ast)?.["toEquivalence"];
  if (annotation) {
    return annotation(isDeclaration(ast) ? ast.typeParameters.map((tp) => recur2(tp, path)) : []);
  }
  switch (ast._tag) {
    case "Never":
      return strictEqual();
    case "Declaration":
    case "Null":
    case "Undefined":
    case "Void":
    case "Unknown":
    case "Any":
    case "String":
    case "Number":
    case "Boolean":
    case "BigInt":
    case "Symbol":
    case "Literal":
    case "UniqueSymbol":
    case "ObjectKeyword":
    case "Enum":
    case "TemplateLiteral":
      return equals;
    case "Arrays": {
      const elements = ast.elements.map((e, i) => recur2(e, [...path, i]));
      const len = ast.elements.length;
      const rest = ast.rest.map((r, i) => recur2(r, [...path, len + i]));
      return make3((a, b) => {
        if (!Array.isArray(a) || !Array.isArray(b)) {
          return false;
        }
        const len2 = a.length;
        if (len2 !== b.length) {
          return false;
        }
        let i = 0;
        for (;i < Math.min(len2, ast.elements.length); i++) {
          if (!elements[i](a[i], b[i])) {
            return false;
          }
        }
        if (rest.length > 0) {
          const [head3, ...tail] = rest;
          for (;i < len2 - tail.length; i++) {
            if (!head3(a[i], b[i])) {
              return false;
            }
          }
          for (let j = 0;j < tail.length; j++) {
            if (!tail[j](a[i + j], b[i + j])) {
              return false;
            }
          }
        }
        return true;
      });
    }
    case "Objects": {
      if (ast.propertySignatures.length === 0 && ast.indexSignatures.length === 0) {
        return equals;
      }
      const propertySignatures = ast.propertySignatures.map((ps) => recur2(ps.type, [...path, ps.name]));
      const indexSignatures = ast.indexSignatures.map((is2) => recur2(is2.type, path));
      return make3((a, b) => {
        if (!isObject(a) || !isObject(b)) {
          return false;
        }
        for (let i = 0;i < propertySignatures.length; i++) {
          const ps = ast.propertySignatures[i];
          const name = ps.name;
          const aHas = Object.hasOwn(a, name);
          const bHas = Object.hasOwn(b, name);
          if (isOptional(ps.type)) {
            if (aHas !== bHas) {
              return false;
            }
          }
          if (aHas && bHas && !propertySignatures[i](a[name], b[name])) {
            return false;
          }
        }
        for (let i = 0;i < indexSignatures.length; i++) {
          const is2 = ast.indexSignatures[i];
          const aKeys = getIndexSignatureKeys(a, is2.parameter);
          const bKeys = getIndexSignatureKeys(b, is2.parameter);
          if (aKeys.length !== bKeys.length)
            return false;
          for (let j = 0;j < aKeys.length; j++) {
            const key = aKeys[j];
            if (!Object.hasOwn(b, key) || !indexSignatures[i](a[key], b[key])) {
              return false;
            }
          }
        }
        return true;
      });
    }
    case "Union": {
      const types = toType(ast).types;
      const compiled = new Map(types.map((candidate, i) => [candidate, [_is(candidate), recur2(ast.types[i], path)]]));
      return make3((a, b) => {
        const candidates = getCandidates(a, types);
        for (let i = 0;i < candidates.length; i++) {
          const [is2, equivalence] = compiled.get(candidates[i]);
          if (is2(a) && is2(b)) {
            return equivalence(a, b);
          }
        }
        return false;
      });
    }
    case "Suspend": {
      const get9 = memoizeThunk(() => recur2(ast.thunk(), path));
      return make3((a, b) => get9()(a, b));
    }
  }
}

// node_modules/effect/dist/JsonPointer.js
function escapeToken(token) {
  return token.replace(/~/g, "~0").replace(/\//g, "~1");
}
function unescapeToken(token) {
  return token.replace(/~1/g, "/").replace(/~0/g, "~");
}

// node_modules/effect/dist/JsonSchema.js
var META_SCHEMA_URI_DRAFT_07 = "http://json-schema.org/draft-07/schema#";
var META_SCHEMA_URI_DRAFT_2020_12 = "https://json-schema.org/draft/2020-12/schema";
function isMetaSchemaUri(value, uri) {
  return value === uri || value === (uri.endsWith("#") ? uri.slice(0, -1) : `${uri}#`);
}
function toDocumentDraft07(document) {
  return {
    dialect: "draft-07",
    ...convertDocument(document, draft07Adapter)
  };
}
function transformSchema(node, transform3) {
  return walk(node, false, true);
  function walk(node2, inheritedResource, isRoot = false) {
    if (!isObject(node2))
      return node2;
    const inEmbeddedResource = inheritedResource || !isRoot && createsResource(node2.$id);
    const out = {};
    for (const key of Object.keys(node2)) {
      const value = node2[key];
      let transformed = value;
      switch (key) {
        case "$defs":
        case "properties":
        case "patternProperties":
        case "dependentSchemas":
          transformed = mapObject(value, (value2) => walk(value2, inEmbeddedResource)) ?? value;
          break;
        case "allOf":
        case "anyOf":
        case "oneOf":
        case "prefixItems":
          transformed = Array.isArray(value) ? value.map((value2) => walk(value2, inEmbeddedResource)) : value;
          break;
        case "not":
        case "additionalProperties":
        case "propertyNames":
        case "unevaluatedProperties":
        case "items":
        case "contains":
        case "unevaluatedItems":
        case "if":
        case "then":
        case "else":
        case "contentSchema":
          transformed = walk(value, inEmbeddedResource);
      }
      assignProperty(out, key, transformed);
    }
    transform3(out, inEmbeddedResource);
    return out;
  }
}
function rewriteRefs(schema, rewrite) {
  return transformSchema(schema, (schema2) => {
    rewriteSchemaRef(schema2, rewrite);
  });
}
function rewriteSchemaRef(schema, rewrite) {
  if (typeof schema.$ref === "string") {
    assignProperty(schema, "$ref", rewrite(schema.$ref, "$ref"));
  }
  if (typeof schema.$dynamicRef === "string") {
    assignProperty(schema, "$dynamicRef", rewrite(schema.$dynamicRef, "$dynamicRef"));
  }
}
function mapObject(value, f) {
  if (!isObject(value))
    return;
  const out = {};
  for (const key of Object.keys(value)) {
    assignProperty(out, key, f(value[key], key));
  }
  return out;
}
function runConverter(adapter, options, use) {
  const locations = new Map;
  const references = [];
  let rootUri = ROOT_URI;
  function convert(root, sourcePath = [], targetPath = []) {
    if (sourcePath.length === 0 && options?.trackIds) {
      const id = isObject(root) ? getResourceId(root) : undefined;
      rootUri = resolveResourceUri(id, ROOT_URI) ?? ROOT_URI;
    }
    return loop(root, sourcePath, targetPath, {
      sourceRoot: [],
      targetRoot: [],
      uri: rootUri
    });
  }
  function finish() {
    for (const [out2, value, sourceResource] of references) {
      let reference = value;
      const resolved = resolveUrl(value, sourceResource);
      if (resolved !== undefined) {
        const sourcePointer = parsePointerFragment(resolved.hash);
        resolved.hash = "";
        if (sourcePointer !== undefined) {
          const targetPath = locations.get(locationKey(resolved.href, sourcePointer));
          if (targetPath !== undefined)
            reference = relocateReference(value, targetPath);
        }
      }
      assignProperty(out2, "$ref", reference);
    }
  }
  const out = use(convert);
  finish();
  return out;
  function loop(node, sourcePath, targetPath, resourceScope) {
    if (typeof node === "boolean") {
      recordLocations(sourcePath, targetPath, resourceScope);
      return options?.booleanAdapter?.(node) ?? node;
    }
    if (!isObject(node))
      return node;
    let currentResourceScope = resourceScope;
    const id = getResourceId(node);
    if (sourcePath.length > 0 && options?.trackIds && createsResource(id)) {
      const uri = resolveResourceUri(id, resourceScope.uri);
      if (uri !== undefined) {
        currentResourceScope = {
          parent: resourceScope,
          sourceRoot: sourcePath,
          targetRoot: targetPath,
          uri
        };
      }
    }
    recordLocations(sourcePath, targetPath, currentResourceScope);
    const currentResource = currentResourceScope.uri;
    const context3 = {
      isDocumentRoot: sourcePath.length === 0,
      schema(value, sourceKey, targetKey = sourceKey) {
        return loop(value, [...sourcePath, sourceKey], [...targetPath, targetKey], currentResourceScope);
      },
      schemaAt(value, sourceSuffix, targetSuffix) {
        return loop(value, [...sourcePath, ...sourceSuffix], [...targetPath, ...targetSuffix], currentResourceScope);
      },
      schemaArray(value, sourceKey, targetKey = sourceKey) {
        return Array.isArray(value) ? value.map((item, index2) => loop(item, [...sourcePath, sourceKey, String(index2)], [...targetPath, targetKey, String(index2)], currentResourceScope)) : value;
      },
      schemaMap(value, sourceKey, targetKey = sourceKey) {
        if (!isObject(value))
          return value;
        return mapObject(value, (item, key) => loop(item, [...sourcePath, sourceKey, key], [...targetPath, targetKey, key], currentResourceScope));
      },
      reference(out2, value) {
        if (typeof value === "string") {
          references.push([out2, value, currentResource]);
        } else {
          assignProperty(out2, "$ref", value);
        }
      }
    };
    return adapter(node, context3);
  }
  function getResourceId(schema) {
    return options?.ignoreRefSiblings === true && typeof schema.$ref === "string" ? undefined : schema.$id;
  }
  function recordLocations(sourcePath, targetPath, scope3) {
    if (scope3.parent !== undefined)
      recordLocations(sourcePath, targetPath, scope3.parent);
    locations.set(locationKey(scope3.uri, sourcePath.slice(scope3.sourceRoot.length)), targetPath.slice(scope3.targetRoot.length));
  }
}
var ROOT_URI = "https://effect.invalid/.json-schema/";
function resolveUrl(value, base2) {
  return URL.canParse(value, base2) ? new URL(value, base2) : undefined;
}
function resolveResourceUri(value, base2) {
  if (typeof value !== "string")
    return;
  const url = resolveUrl(value, base2);
  if (url === undefined)
    return;
  url.hash = "";
  return url.href;
}
function parsePointerFragment(hash2) {
  if (hash2.length === 0)
    return [];
  let pointer;
  try {
    pointer = decodeURIComponent(hash2.slice(1));
  } catch {
    return;
  }
  if (!pointer.startsWith("/"))
    return;
  return /~(?:[^01]|$)/.test(pointer) ? undefined : pointer.slice(1).split("/").map(unescapeToken);
}
function relocateReference(reference, targetPath) {
  const index2 = reference.indexOf("#");
  if (index2 === -1 && targetPath.length === 0)
    return reference;
  const uri = index2 === -1 ? reference : reference.slice(0, index2);
  return `${uri}${formatPointerFragment(targetPath)}`;
}
function formatPointerFragment(path) {
  return path.length === 0 ? "#" : `#/${path.map((token) => encodeURI(escapeToken(token)).replace(/#/g, "%23")).join("/")}`;
}
function locationKey(resource, pointer) {
  return `${resource}\x00${JSON.stringify(pointer)}`;
}
function createsResource(id) {
  return typeof id === "string" && id.length > 0 && id[0] !== "#";
}
function convertDocument(document, adapter, options) {
  return runConverter(adapter, {
    ...options,
    trackIds: true
  }, (convert) => ({
    schema: convert(document.schema),
    definitions: mapObject(document.definitions, (definition, key) => convert(definition, ["$defs", key], ["definitions", key]))
  }));
}
var SCHEMA_MAP_KEYWORDS = /* @__PURE__ */ new Set(["properties", "patternProperties"]);
var SCHEMA_ARRAY_KEYWORDS = /* @__PURE__ */ new Set(["allOf", "anyOf", "oneOf"]);
var JSON_SCHEMA_SINGLE_KEYWORDS = /* @__PURE__ */ new Set(["not", "additionalProperties", "propertyNames", "contains", "if", "then", "else", "contentSchema"]);
function convertSubschemaKeyword(out, key, value, context3, singleKeywords, mapKeywords = SCHEMA_MAP_KEYWORDS) {
  let converted;
  if (mapKeywords.has(key))
    converted = context3.schemaMap(value, key);
  else if (SCHEMA_ARRAY_KEYWORDS.has(key))
    converted = context3.schemaArray(value, key);
  else if (singleKeywords.has(key))
    converted = context3.schema(value, key);
  else
    return false;
  assignProperty(out, key, converted);
  return true;
}
var PRE_2020_TO_2020_COLLISIONS = ["$anchor", "$defs", "$dynamicAnchor", "$dynamicRef", "$vocabulary", "contentSchema", "dependentRequired", "dependentSchemas", "maxContains", "minContains", "prefixItems", "unevaluatedItems", "unevaluatedProperties"];
var DRAFT_07_TO_2020_COLLISIONS = [...PRE_2020_TO_2020_COLLISIONS, "deprecated"];
var OPEN_API_30_TO_2020_COLLISIONS = [...PRE_2020_TO_2020_COLLISIONS, "$comment", "$id", "$schema", "const", "contains", "contentEncoding", "contentMediaType", "else", "examples", "if", "patternProperties", "propertyNames", "then"];
var ANCHOR_REGEXP = /^[A-Za-z_][-A-Za-z0-9._]*$/;
var LEGACY_ID_FRAGMENT_REGEXP = /^[A-Za-z][-A-Za-z0-9._:]*$/;
function unsupported(keyword, dialect, details) {
  throw new Error(`Cannot convert JSON Schema keyword "${keyword}" to ${dialect}: ${details}`);
}
function rejectKeywordCollisions(source, keywords, targetDialect, sourceDialect) {
  for (const keyword of keywords) {
    if (Object.hasOwn(source, keyword)) {
      unsupported(keyword, targetDialect, `it is not active in ${sourceDialect} but would become active in the target`);
    }
  }
}
var DRAFT_07_TARGET_COLLISIONS = ["additionalItems", "definitions", "dependencies"];
function convertMetaSchemaKeyword(out, value, context3, targetUri, targetDialect) {
  if (context3.isDocumentRoot) {
    assignProperty(out, "$schema", isMetaSchemaUri(value, META_SCHEMA_URI_DRAFT_2020_12) ? targetUri : value);
  } else if (!isMetaSchemaUri(value, META_SCHEMA_URI_DRAFT_2020_12)) {
    unsupported("$schema", targetDialect, "an embedded resource cannot declare a different dialect");
  }
}
function draft07Adapter(source, context3) {
  rejectKeywordCollisions(source, DRAFT_07_TARGET_COLLISIONS, "Draft-07", "Draft 2020-12");
  const out = {};
  let reference = undefined;
  let prefixItems = undefined;
  let items = undefined;
  for (const key of Object.keys(source)) {
    const value = source[key];
    if (convertSubschemaKeyword(out, key, value, context3, JSON_SCHEMA_SINGLE_KEYWORDS))
      continue;
    switch (key) {
      case "$ref":
        reference = value;
        break;
      case "$schema":
        convertMetaSchemaKeyword(out, value, context3, META_SCHEMA_URI_DRAFT_07, "Draft-07");
        break;
      case "$id":
      case "$anchor":
        break;
      case "$defs":
        assignProperty(out, "definitions", context3.schemaMap(value, key, "definitions"));
        break;
      case "prefixItems":
        prefixItems = value;
        break;
      case "items":
        items = value;
        break;
      case "dependentRequired":
      case "dependentSchemas":
      case "minContains":
      case "maxContains":
        break;
      case "$dynamicRef":
      case "$dynamicAnchor":
      case "$vocabulary":
      case "unevaluatedProperties":
      case "unevaluatedItems":
        unsupported(key, "Draft-07", "the target dialect has no equivalent");
      case "required":
        if (Array.isArray(value) && value.length === 0)
          break;
        assignProperty(out, key, value);
        break;
      default:
        assignProperty(out, key, value);
    }
  }
  convertTuple(out, prefixItems, items, context3);
  if (Object.hasOwn(source, "contains")) {
    const minContains = source.minContains;
    const maxContains = source.maxContains;
    if (minContains !== undefined && minContains !== 1 || maxContains !== undefined) {
      unsupported("minContains/maxContains", "Draft-07", "contains cardinality cannot be represented");
    }
    if (Object.hasOwn(source, "minContains"))
      assignProperty(out, "minContains", minContains);
  } else {
    if (Object.hasOwn(source, "minContains"))
      assignProperty(out, "minContains", source.minContains);
    if (Object.hasOwn(source, "maxContains"))
      assignProperty(out, "maxContains", source.maxContains);
  }
  convertDependencies(source, out, context3, "draft-07");
  convertLegacyId(source, out, "$id", "Draft-07");
  convertReference(out, reference, context3);
  return out;
}
function convertTuple(out, prefixItems, items, context3) {
  if (prefixItems === undefined) {
    if (items !== undefined)
      assignProperty(out, "items", context3.schema(items, "items"));
    return;
  }
  assignProperty(out, "items", context3.schemaArray(prefixItems, "prefixItems", "items"));
  if (items !== undefined) {
    assignProperty(out, "additionalItems", context3.schema(items, "items", "additionalItems"));
  }
}
function convertReference(out, reference, context3) {
  if (reference === undefined)
    return;
  if (typeof reference === "string" && Object.keys(out).length > 0) {
    const referenceSchema = {};
    context3.reference(referenceSchema, reference);
    appendAllOf(out, referenceSchema);
  } else {
    context3.reference(out, reference);
  }
}
function convertDependencies(source, out, context3, targetDialect) {
  const dependentRequired = isObject(source.dependentRequired) ? source.dependentRequired : undefined;
  const dependentSchemas = isObject(source.dependentSchemas) ? source.dependentSchemas : undefined;
  if (dependentRequired === undefined && dependentSchemas === undefined)
    return;
  const dependencies = {};
  const keys4 = new Set([...Object.keys(dependentRequired ?? {}), ...Object.keys(dependentSchemas ?? {})]);
  for (const key of keys4) {
    const required = dependentRequired?.[key];
    const dependency = dependentSchemas?.[key];
    const omitRequired = targetDialect === "draft-04" && Array.isArray(required) && required.length === 0;
    if (dependency === undefined) {
      if (!omitRequired)
        assignProperty(dependencies, key, required);
    } else if (required === undefined || omitRequired) {
      assignProperty(dependencies, key, context3.schemaAt(dependency, ["dependentSchemas", key], ["dependencies", key]));
    } else {
      assignProperty(dependencies, key, {
        allOf: [context3.schemaAt(dependency, ["dependentSchemas", key], ["dependencies", key, "allOf", "0"]), {
          required
        }]
      });
    }
  }
  if (Object.keys(dependencies).length > 0)
    assignProperty(out, "dependencies", dependencies);
}
function appendAllOf(out, schema) {
  if (Array.isArray(out.allOf))
    out.allOf.push(schema);
  else
    assignProperty(out, "allOf", [schema]);
}
function convertLegacyId(source, out, targetKey, dialect) {
  const id = source.$id;
  const anchor = source.$anchor;
  if (anchor === undefined) {
    if (id !== undefined)
      assignProperty(out, targetKey, id);
    return;
  }
  if (typeof anchor !== "string" || !ANCHOR_REGEXP.test(anchor)) {
    unsupported("$anchor", dialect, "the anchor is not valid");
  }
  if (!LEGACY_ID_FRAGMENT_REGEXP.test(anchor)) {
    unsupported("$anchor", dialect, "the anchor cannot be represented as a plain-name fragment identifier");
  }
  if (id === undefined) {
    assignProperty(out, targetKey, `#${anchor}`);
  } else {
    unsupported("$anchor", dialect, "it cannot be combined with the schema $id");
  }
}

// node_modules/effect/dist/RegExp.js
var RegExp2 = globalThis.RegExp;
var escape = (string3) => string3.replace(/[/\\^$*+?.()|[\]{}]/g, "\\$&");

// node_modules/effect/dist/internal/schema/toJsonSchemaDocument.js
var jsonSchemaAnnotationExcludedKeys = /* @__PURE__ */ new Set([...annotationExcludedKeys, IDENTIFIER_FALLBACK_KEY, ...jsonSchemaAnnotationKeys]);
function collectJsonSchemaAnnotations(annotations, options) {
  if (annotations === undefined)
    return;
  const out = {};
  const title = annotations.title;
  if (typeof title === "string")
    out.title = title;
  const description = annotations.description;
  const expected = annotations.expected;
  if (typeof description === "string")
    out.description = description;
  else if (options?.generateDescriptions === true && typeof expected === "string")
    out.description = expected;
  const defaultValue = annotations.default;
  if (isJson(defaultValue))
    out.default = defaultValue;
  const examples = annotations.examples;
  if (Array.isArray(examples) && isJson(examples))
    out.examples = examples;
  const readOnly = annotations.readOnly;
  if (typeof readOnly === "boolean")
    out.readOnly = readOnly;
  const writeOnly = annotations.writeOnly;
  if (typeof writeOnly === "boolean")
    out.writeOnly = writeOnly;
  const format4 = annotations.format;
  if (typeof format4 === "string")
    out.format = format4;
  const contentEncoding = annotations.contentEncoding;
  if (typeof contentEncoding === "string")
    out.contentEncoding = contentEncoding;
  const contentMediaType = annotations.contentMediaType;
  if (typeof contentMediaType === "string")
    out.contentMediaType = contentMediaType;
  const contentSchema = annotations.contentSchema;
  if (isJson(contentSchema))
    out.contentSchema = contentSchema;
  if (options?.includeAnnotationKey !== undefined) {
    for (const [key, value] of Object.entries(annotations)) {
      if (jsonSchemaAnnotationExcludedKeys.has(key) || !options.includeAnnotationKey(key)) {
        continue;
      }
      if (isJson(value))
        assignProperty(out, key, value);
    }
  }
  return Object.keys(out).length === 0 ? undefined : out;
}
function extractJsonSchemaNumberType(schema) {
  let type = schema.type === "number" || schema.type === "integer" ? schema.type : undefined;
  let out = schema;
  if (type !== undefined) {
    out = {
      ...schema
    };
    delete out.type;
  }
  if (Array.isArray(out.allOf)) {
    const members = [];
    let changed = false;
    for (const member of out.allOf) {
      const extracted = extractJsonSchemaNumberType(member);
      if (extracted.type !== undefined) {
        changed = true;
        if (type === undefined || extracted.type === "integer")
          type = extracted.type;
      }
      if (Object.keys(extracted.schema).length > 0)
        members.push(extracted.schema);
    }
    if (changed) {
      const {
        allOf: _,
        ...rest
      } = out;
      out = members.length === 0 ? rest : {
        ...rest,
        allOf: members
      };
    }
  }
  return {
    type,
    schema: out
  };
}
function isJsonSchemaNumberEncoding(schema) {
  return Array.isArray(schema.anyOf) && schema.anyOf.length === 4 && schema.anyOf[0]?.type === "number" && schema.anyOf.slice(1).every((member) => member.type === "string");
}
var inlineableCheckKeywords = "|type|format|pattern|multipleOf|minimum|maximum|exclusiveMinimum|exclusiveMaximum|minLength|maxLength|minItems|maxItems|uniqueItems|minProperties|maxProperties|propertyNames|";
function hasOnlyKeywords(schema, allowed) {
  return Object.keys(schema).every((key) => allowed.includes(`|${key}|`));
}
function hasNoCollisions(left, rightKeys) {
  return typeof left.$ref !== "string" && rightKeys.every((key) => !Object.hasOwn(left, key));
}
var promotableAnnotationKeywords = "|title|description|default|examples|readOnly|writeOnly|";
var inlineableAnnotatedCheckKeywords = inlineableCheckKeywords + promotableAnnotationKeywords;
function appendJsonSchema(left, right, inlineCheck) {
  if (Object.keys(left).length === 0)
    return right;
  const rightKeys = Object.keys(right);
  if (rightKeys.length === 0)
    return left;
  const leftType = left.type === "number" || left.type === "integer" ? left.type : undefined;
  const isNumberEncoding = isJsonSchemaNumberEncoding(left);
  if (leftType !== undefined || isNumberEncoding) {
    const extracted = extractJsonSchemaNumberType(right);
    if (extracted.type !== undefined) {
      const type = leftType === "integer" || extracted.type === "integer" ? "integer" : "number";
      const base2 = {
        ...left,
        type
      };
      if (isNumberEncoding)
        delete base2.anyOf;
      const extractedKeys = Object.keys(extracted.schema);
      if (extractedKeys.length === 0)
        return base2;
      return hasOnlyKeywords(extracted.schema, promotableAnnotationKeywords) && hasNoCollisions(base2, extractedKeys) ? {
        ...base2,
        ...extracted.schema
      } : appendJsonSchema(base2, extracted.schema, inlineCheck);
    }
  }
  if (inlineCheck && hasNoCollisions(left, rightKeys)) {
    return {
      ...left,
      ...right
    };
  }
  const members = Array.isArray(right.allOf) && rightKeys.length === 1 ? right.allOf : [right];
  if (Array.isArray(left.allOf)) {
    return {
      ...left,
      allOf: [...left.allOf, ...members]
    };
  }
  if (typeof left.$ref === "string") {
    return {
      allOf: [left, ...members]
    };
  }
  return {
    ...left,
    allOf: members
  };
}
function compileJsonSchema(representations, rootPaths, references, options) {
  const definitionStates = new Map;
  const compiledRepresentations = new WeakMap;
  const fallbackDefinitions = new Map;
  let hasAliases = false;
  const referenceKeys = Object.keys(references);
  for (const key of referenceKeys) {
    compileDefinition(key, ["references", key]);
  }
  const schemas = map4(representations, (representation, index2) => finalizeJsonSchema(recur3(representation, rootPaths[index2])));
  const definitions = {};
  for (const key of referenceKeys) {
    const compiled = definitionStates.get(key);
    if (typeof compiled !== "string") {
      assignProperty(definitions, key, finalizeJsonSchema(compiled));
    }
  }
  return {
    dialect: "draft-2020-12",
    schemas,
    definitions
  };
  function compileDefinition(key, path) {
    const compiled = definitionStates.get(key);
    if (compiled !== undefined)
      return typeof compiled === "string" ? compiled : key;
    if (!Object.hasOwn(references, key)) {
      throw errorWithPath(`Invalid reference ${key}`, [...path, "$ref"]);
    }
    definitionStates.set(key, null);
    const representation = references[key];
    const schema = recur3(representation, ["references", key]);
    const fallback = getIdentifierFallback(representation);
    if (fallback !== undefined) {
      const candidates = fallbackDefinitions.get(fallback);
      const match8 = candidates?.find((candidate) => equals(definitionStates.get(candidate), schema));
      if (match8 === undefined) {
        if (candidates === undefined)
          fallbackDefinitions.set(fallback, [key]);
        else
          candidates.push(key);
      } else {
        hasAliases = true;
        definitionStates.set(key, match8);
        return match8;
      }
    }
    definitionStates.set(key, schema);
    return key;
  }
  function finalizeJsonSchema(schema) {
    if (!hasAliases)
      return schema;
    return rewriteRefs(schema, ($ref) => $ref.replace(/^#\/\$defs\/([^/]*)/, (match8, token) => {
      const canonical = definitionStates.get(unescapeToken(token));
      return typeof canonical === "string" ? `#/$defs/${escapeToken(canonical)}` : match8;
    }));
  }
  function getIdentifierFallback(representation) {
    if (representation._tag === "Reference")
      return;
    const annotations = representation.checks.length === 0 ? representation.annotations : representation.checks[representation.checks.length - 1].annotations;
    return typeof annotations?.identifier !== "string" && typeof annotations?.[IDENTIFIER_FALLBACK_KEY] === "string" ? annotations[IDENTIFIER_FALLBACK_KEY] : undefined;
  }
  function annotationSchemas(representation, path) {
    return representation?.schemas?.map((schema, index2) => recur3(schema, [...path, "schemas", index2])) ?? [];
  }
  function compileCheck(check, type, path) {
    const annotations = check.annotations;
    const callback4 = annotations?.toJsonSchema;
    if (callback4 !== undefined) {
      const schemas2 = annotationSchemas(check.representation, [...path, "representation"]);
      const fragment = callback4({
        type,
        schemas: schemas2
      });
      const ordinary2 = collectJsonSchemaAnnotations(annotations, options);
      const schema = ordinary2 === undefined ? fragment : {
        ...fragment,
        ...ordinary2
      };
      const allowed = ordinary2 === undefined ? inlineableCheckKeywords : inlineableAnnotatedCheckKeywords;
      return check._tag === "Filter" && hasOnlyKeywords(schema, allowed) && (ordinary2 === undefined || hasOnlyKeywords(ordinary2, promotableAnnotationKeywords)) ? [schema, true] : [schema];
    }
    if (check._tag === "Filter")
      return;
    const children = check.checks.map((child, index2) => compileCheck(child, type, [...path, "checks", index2])).filter((child) => child !== undefined);
    if (children.length === 0)
      return;
    const ordinary = collectJsonSchemaAnnotations(annotations, options);
    const allOf = children.map(([schema]) => schema);
    return [ordinary === undefined ? {
      allOf
    } : {
      allOf,
      ...ordinary
    }];
  }
  function recur3(representation, path) {
    if (representation._tag === "Reference") {
      const canonical = compileDefinition(representation.$ref, path);
      return {
        $ref: `#/$defs/${escapeToken(canonical)}`
      };
    }
    const cached3 = compiledRepresentations.get(representation);
    if (cached3 !== undefined)
      return cached3;
    let output = on(representation, path);
    const ordinary = collectJsonSchemaAnnotations(representation.annotations, options);
    if (ordinary !== undefined) {
      output = {
        ...output,
        ...ordinary
      };
    }
    for (let index2 = 0;index2 < representation.checks.length; index2++) {
      const type = typeof output.type === "string" && isJsonSchemaType(output.type) ? output.type : undefined;
      const check = compileCheck(representation.checks[index2], type, [...path, "checks", index2]);
      if (check !== undefined) {
        output = appendJsonSchema(output, ...check);
      }
    }
    compiledRepresentations.set(representation, output);
    return output;
  }
  function on(representation, path) {
    switch (representation._tag) {
      case "Any":
      case "Unknown":
        return {};
      case "ObjectKeyword":
        return {
          anyOf: [{
            type: "object"
          }, {
            type: "array"
          }]
        };
      case "Void":
      case "Undefined":
      case "Null":
        return {
          type: "null"
        };
      case "BigInt":
        return {
          type: "string",
          allOf: [{
            pattern: "^-?\\d+$"
          }]
        };
      case "Symbol":
      case "UniqueSymbol":
        return {
          type: "string",
          allOf: [{
            pattern: "^Symbol\\((.*)\\)$"
          }]
        };
      case "Declaration": {
        return {};
      }
      case "Suspend":
        return recur3(representation.thunk, [...path, "thunk"]);
      case "Never":
        return {
          not: {}
        };
      case "String":
        return {
          type: "string"
        };
      case "Number":
        return {
          anyOf: [{
            type: "number"
          }, {
            type: "string",
            enum: ["NaN"]
          }, {
            type: "string",
            enum: ["Infinity"]
          }, {
            type: "string",
            enum: ["-Infinity"]
          }]
        };
      case "Boolean":
        return {
          type: "boolean"
        };
      case "Literal": {
        const literal = representation.literal;
        return typeof literal === "bigint" ? {
          type: "string",
          enum: [globalThis.String(literal)]
        } : {
          type: typeof literal,
          enum: [literal]
        };
      }
      case "Enum": {
        const types = representation.enums.map(([title, literal]) => typeof literal === "number" && !globalThis.Number.isFinite(literal) ? {
          type: "string",
          enum: [globalThis.String(literal)],
          title
        } : {
          type: typeof literal,
          enum: [literal],
          title
        });
        return types.length === 0 ? {
          not: {}
        } : {
          anyOf: types
        };
      }
      case "TemplateLiteral":
        return {
          type: "string",
          pattern: `^${representation.parts.map(getPartPattern).join("")}$`
        };
      case "Arrays": {
        if (representation.rest.length > 1) {
          throw errorWithPath("Invalid schema representation document", [...path, "rest"]);
        }
        const out = {
          type: "array"
        };
        let minItems = representation.elements.length;
        const prefixItems = representation.elements.map((element, index2) => {
          if (element.isOptional)
            minItems--;
          const compiled = recur3(element.type, [...path, "elements", index2, "type"]);
          const annotations = collectJsonSchemaAnnotations(element.annotations, options);
          return annotations === undefined ? compiled : appendJsonSchema(compiled, annotations);
        });
        if (prefixItems.length > 0) {
          out.prefixItems = prefixItems;
          out.maxItems = representation.elements.length;
          if (minItems > 0)
            out.minItems = minItems;
        } else {
          out.items = false;
        }
        if (representation.rest.length === 1) {
          delete out.maxItems;
          const rest = recur3(representation.rest[0], [...path, "rest", 0]);
          if (Object.keys(rest).length > 0)
            out.items = rest;
          else
            delete out.items;
        }
        return out;
      }
      case "Objects": {
        if (representation.propertySignatures.length === 0 && representation.indexSignatures.length === 0) {
          return {
            anyOf: [{
              type: "object"
            }, {
              type: "array"
            }]
          };
        }
        const out = {
          type: "object"
        };
        const properties = {};
        const required = [];
        for (let index2 = 0;index2 < representation.propertySignatures.length; index2++) {
          const property = representation.propertySignatures[index2];
          if (typeof property.name !== "string") {
            throw errorWithPath("Invalid schema representation document", [...path, "propertySignatures", index2, "name"]);
          }
          const name = property.name;
          const compiled = recur3(property.type, [...path, "propertySignatures", index2, "type"]);
          const annotations = collectJsonSchemaAnnotations(property.annotations, options);
          assignProperty(properties, name, annotations === undefined ? compiled : appendJsonSchema(compiled, annotations));
          if (!property.isOptional)
            required.push(name);
        }
        if (representation.propertySignatures.length > 0)
          out.properties = properties;
        if (required.length > 0)
          out.required = required;
        const patternProperties = {};
        const additionalProperties = [];
        for (let index2 = 0;index2 < representation.indexSignatures.length; index2++) {
          const signature = representation.indexSignatures[index2];
          let type = recur3(signature.type, [...path, "indexSignatures", index2, "type"]);
          if (Object.keys(type).length === 1 && "not" in type)
            type = false;
          const patterns = getParameterPatterns(signature.parameter, [...path, "indexSignatures", index2, "parameter"], new Set);
          if (patterns.length === 0) {
            additionalProperties.push(type);
          } else {
            for (const pattern of patterns) {
              const previous = patternProperties[pattern];
              assignProperty(patternProperties, pattern, previous === undefined ? type : previous === false || type === false ? false : appendJsonSchema(previous, type));
            }
          }
        }
        const hasPatternProperties = Object.keys(patternProperties).length > 0;
        if (hasPatternProperties) {
          out.patternProperties = patternProperties;
        }
        if (representation.indexSignatures.length === 0) {
          out.additionalProperties = options?.additionalProperties ?? false;
        } else if (additionalProperties.length === 1 && representation.propertySignatures.length === 0 && !hasPatternProperties) {
          out.additionalProperties = additionalProperties[0];
        } else if (additionalProperties.length > 0) {
          out.allOf = additionalProperties.map((type) => ({
            type: "object",
            additionalProperties: type
          }));
        }
        if (typeof out.additionalProperties === "object" && out.additionalProperties !== null && Object.keys(out.additionalProperties).length === 0) {
          delete out.additionalProperties;
        }
        return out;
      }
      case "Union": {
        const types = representation.types.map((type, index2) => recur3(type, [...path, "types", index2]));
        if (types.length === 0)
          return {
            not: {}
          };
        if (representation.mode === "anyOf" && types.length > 1) {
          const compacted = compactEnums(types);
          if (compacted !== undefined)
            return compacted;
        }
        return representation.mode === "anyOf" ? {
          anyOf: types
        } : {
          oneOf: types
        };
      }
    }
  }
  function getParameterPatterns(parameter, path, seenReferences) {
    switch (parameter._tag) {
      case "Reference": {
        if (!Object.hasOwn(references, parameter.$ref)) {
          throw errorWithPath(`Invalid reference ${parameter.$ref}`, [...path, "$ref"]);
        }
        compileDefinition(parameter.$ref, path);
        if (seenReferences.has(parameter.$ref))
          return [];
        const next = new Set(seenReferences).add(parameter.$ref);
        return getParameterPatterns(references[parameter.$ref], ["references", parameter.$ref], next);
      }
      case "String":
        return collectPatterns(recur3(parameter, path));
      case "TemplateLiteral":
        return [`^${parameter.parts.map(getPartPattern).join("")}$`];
      case "Union":
        return parameter.types.flatMap((type, index2) => getParameterPatterns(type, [...path, "types", index2], seenReferences));
      default:
        throw errorWithPath("Invalid schema representation document", path);
    }
  }
}
function isJsonSchemaType(input) {
  return input === "string" || input === "number" || input === "boolean" || input === "array" || input === "object" || input === "null" || input === "integer";
}
function compactEnums(schemas) {
  let sharedType = undefined;
  const values2 = [];
  for (const schema of schemas) {
    const keys4 = Object.keys(schema);
    if (keys4.length !== 2 || schema.type === undefined || !Array.isArray(schema.enum) || schema.enum.length === 0) {
      return;
    }
    if (sharedType === undefined)
      sharedType = schema.type;
    else if (schema.type !== sharedType)
      return;
    values2.push(...schema.enum);
  }
  return {
    type: sharedType,
    enum: values2
  };
}
function collectPatterns(schema) {
  const patterns = [];
  if (typeof schema.pattern === "string")
    patterns.push(schema.pattern);
  for (const key of ["allOf", "anyOf", "oneOf"]) {
    const members = schema[key];
    if (Array.isArray(members)) {
      for (const member of members) {
        if (typeof member === "object" && member !== null && !Array.isArray(member)) {
          patterns.push(...collectPatterns(member));
        }
      }
    }
  }
  return patterns;
}
function getPartPattern(part) {
  switch (part._tag) {
    case "Literal":
      return escape(globalThis.String(part.literal));
    case "String":
      return STRING_PATTERN;
    case "Number":
      return FINITE_PATTERN;
    case "TemplateLiteral":
      return part.parts.map(getPartPattern).join("");
    case "Union":
      return part.types.map(getPartPattern).join("|");
    default:
      throw errorWithPath("Invalid schema representation document", []);
  }
}
function toJsonSchemaDocument(document, options) {
  const output = compileJsonSchema([document.representation], [["representation"]], document.references, options);
  return {
    dialect: output.dialect,
    schema: output.schemas[0],
    definitions: output.definitions
  };
}

// node_modules/effect/dist/internal/schema/toRepresentation.js
var defaultReferencePolicy = ({
  identifier: identifier2
}) => identifier2;
function annotationsField(annotations) {
  return annotations === undefined ? undefined : {
    annotations
  };
}
function toRepresentation(ast, options) {
  const {
    references,
    representations
  } = toRepresentations([ast], options);
  return {
    representation: representations[0],
    references
  };
}
function toRepresentations(asts, options) {
  const references = {};
  const referenceOwners = new Map;
  const buildingReferences = new Set;
  const candidates = new Map;
  const visitingCandidates = new Set;
  for (const ast of asts)
    visit(ast);
  const referencePolicy = options?.referencePolicy ?? defaultReferencePolicy;
  for (const candidatesByIdentifier of candidates.values()) {
    for (const candidate of candidatesByIdentifier.values()) {
      const requestedReference = referencePolicy({
        ast: candidate.ast,
        occurrences: candidate.occurrences,
        identifier: candidate.identifier
      });
      if (requestedReference !== undefined) {
        const separator = requestedReference === candidate.identifier || !requestedReference.endsWith("_") ? "_" : "";
        candidate.reference = getReference(requestedReference, candidate, separator);
      } else if (candidate.isRecursive) {
        candidate.reference = getReference(`${candidate.ast._tag}_`, candidate, "");
      }
    }
  }
  const representations = map4(asts, (ast) => recur3(ast));
  return {
    representations,
    references
  };
  function getReference(prefix, owner, separator = "_") {
    let candidate = prefix;
    let suffix = 0;
    while (referenceOwners.has(candidate)) {
      if (referenceOwners.get(candidate) === owner)
        return candidate;
      candidate = `${prefix}${separator}${++suffix}`;
    }
    referenceOwners.set(candidate, owner);
    return candidate;
  }
  function annotateReference(ast, candidate, reference) {
    const fallback = candidate.fallback;
    if (fallback !== undefined) {
      return resolveIdentifierFallback(ast) === fallback ? ast : annotate(ast, {
        [IDENTIFIER_FALLBACK_KEY]: fallback
      });
    }
    return reference === candidate.identifier ? ast : annotate(ast, {
      identifier: reference
    });
  }
  function makeReference(reference, ast) {
    if (!Object.hasOwn(references, reference) && !buildingReferences.has(reference)) {
      buildingReferences.add(reference);
      const representation = on(ast);
      buildingReferences.delete(reference);
      assignProperty(references, reference, representation);
    }
    return {
      _tag: "Reference",
      $ref: reference
    };
  }
  function getCandidate(input) {
    const ast = getLastEncoding(input);
    const owner = getContextOwner(ast);
    let identifier2 = resolveIdentifier(ast);
    const fallback = identifier2 === undefined ? (ast !== input ? resolveIdentifier(input) : undefined) ?? resolveIdentifierFallback(ast) : undefined;
    if (fallback !== undefined)
      identifier2 = `${fallback}Encoded`;
    let candidatesByIdentifier = candidates.get(owner);
    if (candidatesByIdentifier === undefined) {
      candidatesByIdentifier = new Map;
      candidates.set(owner, candidatesByIdentifier);
    }
    let candidate = candidatesByIdentifier.get(identifier2);
    if (candidate === undefined) {
      candidate = {
        ast: owner,
        identifier: identifier2,
        fallback,
        occurrences: 0,
        isRecursive: false,
        reference: undefined
      };
      candidatesByIdentifier.set(identifier2, candidate);
    }
    return candidate;
  }
  function visit(input) {
    const candidate = getCandidate(input);
    const ast = candidate.ast;
    candidate.occurrences++;
    if (visitingCandidates.has(candidate)) {
      candidate.isRecursive = true;
      return;
    }
    if (candidate.occurrences > 1)
      return;
    visitingCandidates.add(candidate);
    visitChecks(ast.checks);
    switch (ast._tag) {
      case "Declaration":
      case "Arrays":
      case "Objects":
      case "Union":
        ast.recur((child) => {
          visit(child);
          return child;
        });
        break;
      case "TemplateLiteral":
        ast.parts.forEach(visit);
        break;
      case "Suspend":
        visit(ast.thunk());
        break;
    }
    visitingCandidates.delete(candidate);
  }
  function visitChecks(checks) {
    checks?.forEach((check) => {
      check.annotations?.representation?.schemas?.forEach((schema) => visit(toType(schema)));
      if (check._tag === "FilterGroup")
        visitChecks(check.checks);
    });
  }
  function recur3(input) {
    const candidate = getCandidate(input);
    const ast = candidate.ast;
    const reference = candidate.reference;
    if (reference !== undefined) {
      const annotated = candidate.identifier === undefined ? ast : annotateReference(ast, candidate, reference);
      return makeReference(reference, annotated);
    }
    return on(ast);
  }
  function on(ast) {
    const checks = fromChecks(ast.checks);
    switch (ast._tag) {
      case "Declaration":
        return {
          _tag: "Declaration",
          typeParameters: ast.typeParameters.map((ast2) => recur3(ast2)),
          checks,
          ...fromDeclarationAnnotations(ast.annotations)
        };
      case "Null":
      case "Undefined":
      case "Void":
      case "Never":
      case "Unknown":
      case "Any":
      case "String":
      case "Boolean":
      case "Number":
      case "BigInt":
      case "Symbol":
      case "ObjectKeyword":
        return {
          _tag: ast._tag,
          checks,
          ...annotationsField(ast.annotations)
        };
      case "Literal":
        return {
          _tag: "Literal",
          literal: ast.literal,
          checks,
          ...annotationsField(ast.annotations)
        };
      case "UniqueSymbol":
        return {
          _tag: "UniqueSymbol",
          symbol: ast.symbol,
          checks,
          ...annotationsField(ast.annotations)
        };
      case "Enum":
        return {
          _tag: "Enum",
          enums: ast.enums,
          checks,
          ...annotationsField(ast.annotations)
        };
      case "TemplateLiteral":
        return {
          _tag: "TemplateLiteral",
          parts: ast.parts.map((ast2) => recur3(ast2)),
          checks,
          ...annotationsField(ast.annotations)
        };
      case "Arrays":
        return {
          _tag: "Arrays",
          elements: ast.elements.map((element) => {
            const projected = getLastEncoding(element);
            const annotations = projected.context?.annotations;
            return {
              isOptional: isOptional(projected),
              type: recur3(element),
              ...annotationsField(annotations)
            };
          }),
          rest: ast.rest.map((ast2) => recur3(ast2)),
          checks,
          ...annotationsField(ast.annotations)
        };
      case "Objects":
        return {
          _tag: "Objects",
          propertySignatures: ast.propertySignatures.map((property) => {
            const projected = getLastEncoding(property.type);
            const annotations = projected.context?.annotations;
            return {
              name: property.name,
              type: recur3(property.type),
              isOptional: isOptional(projected),
              isMutable: isMutable(projected),
              ...annotationsField(annotations)
            };
          }),
          indexSignatures: ast.indexSignatures.map((index2) => ({
            parameter: recur3(index2.parameter),
            type: recur3(index2.type)
          })),
          checks,
          ...annotationsField(ast.annotations)
        };
      case "Union":
        return {
          _tag: "Union",
          types: ast.types.map((ast2) => recur3(ast2)),
          mode: ast.mode,
          checks,
          ...annotationsField(ast.annotations)
        };
      case "Suspend":
        return {
          _tag: "Suspend",
          checks: [],
          thunk: recur3(ast.thunk()),
          ...annotationsField(ast.annotations)
        };
    }
  }
  function fromChecks(checks) {
    return checks?.map(fromCheck) ?? [];
  }
  function fromCheck(check) {
    switch (check._tag) {
      case "Filter":
        return {
          _tag: "Filter",
          aborted: check.aborted,
          ...fromCheckAnnotations(check.annotations)
        };
      case "FilterGroup":
        return {
          _tag: "FilterGroup",
          checks: map4(check.checks, fromCheck),
          ...fromCheckAnnotations(check.annotations)
        };
    }
  }
  function fromDeclarationAnnotations(annotations) {
    if (annotations === undefined)
      return;
    const {
      representation,
      ...ordinary
    } = annotations;
    return {
      ...representation === undefined ? undefined : {
        representation
      },
      ...Object.keys(ordinary).length === 0 ? undefined : {
        annotations: ordinary
      }
    };
  }
  function fromCheckAnnotations(annotations) {
    if (annotations === undefined)
      return;
    const {
      representation,
      ...ordinary
    } = annotations;
    const projected = representation === undefined ? undefined : representation.schemas === undefined ? representation : {
      ...representation,
      schemas: representation.schemas.map((schema) => recur3(toType(schema)))
    };
    return {
      ...projected === undefined ? undefined : {
        representation: projected
      },
      ...Object.keys(ordinary).length === 0 ? undefined : {
        annotations: ordinary
      }
    };
  }
}

// node_modules/effect/dist/JsonPatch.js
function get9(oldValue, newValue) {
  const patches = [];
  getLoop(oldValue, newValue, "", patches);
  return patches;
}
function getLoop(oldValue, newValue, path, patches) {
  if (Object.is(oldValue, newValue))
    return;
  if (Array.isArray(oldValue) && Array.isArray(newValue)) {
    const len1 = oldValue.length;
    const len2 = newValue.length;
    const shared = Math.min(len1, len2);
    for (let i = 0;i < shared; i++) {
      getLoop(oldValue[i], newValue[i], `${path}/${i}`, patches);
    }
    for (let i = len1 - 1;i >= len2; i--) {
      patches.push({
        op: "remove",
        path: `${path}/${i}`
      });
    }
    for (let i = len1;i < len2; i++) {
      patches.push({
        op: "add",
        path: `${path}/${i}`,
        value: newValue[i]
      });
    }
    return;
  }
  if (isJsonObject(oldValue) && isJsonObject(newValue)) {
    const keys1 = Object.keys(oldValue);
    const keys22 = Object.keys(newValue);
    const allKeys = Array.from(new Set([...keys1, ...keys22])).sort();
    for (const key of allKeys) {
      const keyPath = `${path}/${escapeToken(key)}`;
      const hasKey1 = Object.hasOwn(oldValue, key);
      const hasKey2 = Object.hasOwn(newValue, key);
      if (hasKey1 && hasKey2) {
        getLoop(oldValue[key], newValue[key], keyPath, patches);
      } else if (!hasKey1 && hasKey2) {
        patches.push({
          op: "add",
          path: keyPath,
          value: newValue[key]
        });
      } else {
        patches.push({
          op: "remove",
          path: keyPath
        });
      }
    }
    return;
  }
  patches.push({
    op: "replace",
    path,
    value: newValue
  });
}
function apply(patch, oldValue) {
  let doc = oldValue;
  for (const op of patch) {
    doc = applyOperation(doc, op);
  }
  return doc;
}
function isJsonObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function tokenize(pointer) {
  if (pointer === "")
    return [];
  if (pointer.charCodeAt(0) !== 47) {
    throw new Error(`Invalid JSON Pointer, it must start with "/": ${JSON.stringify(pointer)}`);
  }
  return pointer.split("/").slice(1).map(unescapeToken);
}
function toIndex(token) {
  if (!/^(0|[1-9]\d*)$/.test(token)) {
    throw new Error(`Invalid array index: "${token}"`);
  }
  return Number(token);
}
function applyOperation(doc, op) {
  if (op.path === "") {
    if (op.op === "remove")
      throw new Error("Unsupported operation at the root");
    return op.value;
  }
  const resolved = resolveParent(doc, op.path);
  if (resolved === null) {
    throw new Error(`Cannot ${op.op} at "${op.path}" (parent not found or not a container).`);
  }
  const {
    lastToken,
    parent,
    stack
  } = resolved;
  if (Array.isArray(parent)) {
    if (lastToken === "-" && op.op !== "add") {
      throw new Error(`"-" is not valid for ${op.op} at "${op.path}".`);
    }
    const index2 = lastToken === "-" ? parent.length : toIndex(lastToken);
    const maxIndex = op.op === "add" ? parent.length : parent.length - 1;
    if (index2 > maxIndex)
      throw new Error(`Array index out of bounds at "${op.path}".`);
    const updated = parent.slice();
    if (op.op === "add")
      updated.splice(index2, 0, op.value);
    else if (op.op === "remove")
      updated.splice(index2, 1);
    else
      updated[index2] = op.value;
    return rebuildFromStack(stack, updated);
  }
  if (isJsonObject(parent)) {
    if (op.op !== "add" && !Object.hasOwn(parent, lastToken)) {
      throw new Error(`Property "${lastToken}" does not exist at "${op.path}".`);
    }
    const updated = {
      ...parent
    };
    if (op.op === "remove")
      delete updated[lastToken];
    else
      assignProperty(updated, lastToken, op.value);
    return rebuildFromStack(stack, updated);
  }
  throw new Error(`Cannot ${op.op} at "${op.path}" (parent not found or not a container).`);
}
function resolveParent(doc, pointer) {
  const tokens = tokenize(pointer);
  if (tokens.length === 0)
    return null;
  const lastToken = tokens[tokens.length - 1];
  const stack = [];
  let cur = doc;
  for (let i = 0;i < tokens.length - 1; i++) {
    const token = tokens[i];
    if (Array.isArray(cur)) {
      const idx = toIndex(token);
      if (idx >= cur.length)
        return null;
      stack.push({
        container: cur,
        token: idx
      });
      cur = cur[idx];
      continue;
    }
    if (isJsonObject(cur)) {
      if (!Object.hasOwn(cur, token))
        return null;
      stack.push({
        container: cur,
        token
      });
      cur = cur[token];
      continue;
    }
    return null;
  }
  return {
    stack,
    parent: cur,
    lastToken
  };
}
function rebuildFromStack(stack, newParent) {
  let acc = newParent;
  for (let i = stack.length - 1;i >= 0; i--) {
    const {
      container,
      token
    } = stack[i];
    if (Array.isArray(container)) {
      const copy2 = container.slice();
      copy2[token] = acc;
      acc = copy2;
    } else {
      const copy2 = {
        ...container
      };
      assignProperty(copy2, token, acc);
      acc = copy2;
    }
  }
  return acc;
}

// node_modules/effect/dist/Optic.js
function makeIso(get10, set5) {
  return make28(primitiveNode("Iso", get10, set5));
}
function makeLens(get10, replace) {
  return make28(primitiveNode("Lens", get10, replace));
}
function primitiveNode(kind, get10, set5) {
  return [{
    _tag: "PrimitiveNode",
    kind,
    get: get10,
    set: set5
  }];
}
var identityOperation = {
  kind: "Iso",
  get: identity,
  set: identity
};

class PathNode {
  _tag = "PathNode";
  kind = "Lens";
  path;
  get;
  set;
  constructor(path) {
    this.path = path;
    this.get = (s) => {
      let out = s;
      for (let i = 0;i < path.length; i++) {
        out = out[path[i]];
      }
      return out;
    };
    this.set = (a, s) => {
      const out = cloneShallow(s);
      let current = out;
      let i = 0;
      for (;i < path.length - 1; i++) {
        const key = path[i];
        assignProperty(current, key, cloneShallow(current[key]));
        current = current[key];
      }
      assignProperty(current, path[i], a);
      return out;
    };
  }
}

class CheckNode {
  _tag = "CheckNode";
  kind = "Prism";
  checks;
  get;
  set = identity;
  constructor(checks) {
    this.checks = checks;
    this.get = (s) => runChecks(checks, s);
  }
}
function compose(a, b) {
  if (a.length === 0)
    return b;
  if (b.length === 0)
    return a;
  const nodes = a.slice();
  for (let i = 0;i < b.length; i++) {
    const node = b[i];
    const last = nodes[nodes.length - 1];
    if (last._tag === "PathNode" && node._tag === "PathNode") {
      nodes[nodes.length - 1] = new PathNode([...last.path, ...node.path]);
    } else if (last._tag === "CheckNode" && node._tag === "CheckNode") {
      nodes[nodes.length - 1] = new CheckNode([...last.checks, ...node.checks]);
    } else {
      nodes.push(node);
    }
  }
  return nodes;
}
function makeOptional(getResult, set5) {
  return make28(primitiveNode("Optional", getResult, set5));
}

class OptionalImpl {
  node;
  getResult;
  replaceResult;
  constructor(node, getResult, replaceResult) {
    this.node = node;
    this.getResult = getResult;
    this.replaceResult = replaceResult;
  }
  replace(a, s) {
    return getOrElse3(this.replaceResult(a, s), () => s);
  }
  modify(f) {
    return (s) => getOrElse3(flatMap2(this.getResult(s), (a) => this.replaceResult(f(a), s)), () => s);
  }
  compose(that) {
    return make28(compose(this.node, that.node));
  }
  key(key) {
    return make28(compose(this.node, [new PathNode([key])]));
  }
  optionalKey(key) {
    return make28(compose(this.node, primitiveNode("Lens", (s) => s[key], (a, s) => {
      const copy2 = cloneShallow(s);
      if (a === undefined) {
        if (Array.isArray(copy2) && typeof key === "number") {
          copy2.splice(key, 1);
        } else {
          delete copy2[key];
        }
      } else {
        assignProperty(copy2, key, a);
      }
      return copy2;
    })));
  }
  check(...checks) {
    return make28(compose(this.node, [new CheckNode(checks)]));
  }
  refine(refinement, annotations) {
    return make28(compose(this.node, [new CheckNode([makeFilterByGuard(refinement, annotations)])]));
  }
  tag(tag) {
    const err = fail2(new InvalidValue({
      expected: `${JSON.stringify(tag)} tag`
    }));
    return make28(compose(this.node, primitiveNode("Prism", (s) => s._tag === tag ? succeed2(s) : err, identity)));
  }
  at(key, ..._rest) {
    const err = fail2(new Pointer([key], new MissingKey(undefined)));
    return make28(compose(this.node, primitiveNode("Optional", (s) => Object.hasOwn(s, key) ? succeed2(s[key]) : err, (a, s) => {
      if (Object.hasOwn(s, key)) {
        const copy2 = cloneShallow(s);
        assignProperty(copy2, key, a);
        return succeed2(copy2);
      } else {
        return err;
      }
    })));
  }
  pick(keys4) {
    return this.compose(makeLens(pick2(keys4), (p, a) => ({
      ...a,
      ...p
    })));
  }
  omit(keys4) {
    return this.compose(makeLens(omit3(keys4), (o, a) => ({
      ...a,
      ...o
    })));
  }
  notUndefined() {
    return this.refine(isNotUndefined, {
      expected: "a value other than `undefined`"
    });
  }
  forEach(f) {
    const inner = f(id());
    return makeOptional((s) => map2(this.getResult(s), (as3) => {
      const bs = [];
      for (let i = 0;i < as3.length; i++) {
        const r = inner.getResult(as3[i]);
        if (isSuccess2(r))
          bs.push(r.success);
      }
      return bs;
    }), (bs, s) => flatMap2(this.getResult(s), (as3) => {
      const idxs = [];
      for (let i = 0;i < as3.length; i++) {
        if (isSuccess2(inner.getResult(as3[i])))
          idxs.push(i);
      }
      if (bs.length !== idxs.length) {
        return fail2(new InvalidValue({
          message: `each: replacement length mismatch: ${bs.length} !== ${idxs.length}`
        }));
      }
      const out = as3.slice();
      for (let k = 0;k < idxs.length; k++) {
        const i = idxs[k];
        const r = inner.replaceResult(bs[k], as3[i]);
        if (isFailure2(r)) {
          return fail2(new Pointer([i], r.failure));
        }
        out[i] = r.success;
      }
      return this.replaceResult(out, s);
    }));
  }
  modifyAll(f) {
    return (s) => getOrElse3(flatMap2(this.getResult(s), (as3) => this.replaceResult(as3.map(f), s)), () => s);
  }
}

class IsoImpl extends OptionalImpl {
  get;
  set;
  constructor(node, get10, set5) {
    super(node, (s) => succeed2(get10(s)), (a) => succeed2(set5(a)));
    this.get = get10;
    this.set = set5;
  }
  replace(a, _) {
    return this.set(a);
  }
  modify(f) {
    return (s) => this.set(f(this.get(s)));
  }
}

class LensImpl extends OptionalImpl {
  get;
  constructor(node, get10, replace) {
    super(node, (s) => succeed2(get10(s)), (a, s) => succeed2(replace(a, s)));
    this.get = get10;
    this.replace = replace;
  }
  modify(f) {
    return (s) => this.replace(f(this.get(s)), s);
  }
}

class PrismImpl extends OptionalImpl {
  set;
  constructor(node, getResult, set5) {
    super(node, getResult, (a, _) => succeed2(set5(a)));
    this.set = set5;
  }
  replace(a, _) {
    return this.set(a);
  }
  modify(f) {
    return (s) => getOrElse3(map2(this.getResult(s), (a) => this.set(f(a))), () => s);
  }
}
function make28(node) {
  let op = node[0] ?? identityOperation;
  if (node.length > 1) {
    const kind = node.reduce((kind2, step) => composeKind(kind2, step.kind), "Iso");
    op = {
      kind,
      get: compileGet(node, kind),
      set: compileSet(node, kind)
    };
  }
  switch (op.kind) {
    case "Iso":
      return new IsoImpl(node, op.get, op.set);
    case "Lens":
      return new LensImpl(node, op.get, op.set);
    case "Prism":
      return new PrismImpl(node, op.get, op.set);
    case "Optional":
      return new OptionalImpl(node, op.get, op.set);
  }
}
function cloneShallow(pojo) {
  if (Array.isArray(pojo))
    return pojo.slice();
  if (typeof pojo === "object" && pojo !== null) {
    const proto = Object.getPrototypeOf(pojo);
    if (proto !== Object.prototype && proto !== null) {
      throw new Error("Cannot clone object with non-Object constructor or null prototype");
    }
    return {
      ...pojo
    };
  }
  return pojo;
}
function compileGet(nodes, kind) {
  return (s) => {
    for (let i = 0;i < nodes.length; i++) {
      const op = nodes[i];
      const result4 = op.get(s);
      if (hasFailingGet(op.kind)) {
        if (isFailure2(result4)) {
          return result4;
        }
        s = result4.success;
      } else {
        s = result4;
      }
    }
    return hasFailingGet(kind) ? succeed2(s) : s;
  };
}
function compileSet(nodes, kind) {
  if (hasSourceFreeSet(kind)) {
    return (a) => {
      for (let i = nodes.length - 1;i >= 0; i--) {
        a = nodes[i].set(a);
      }
      return a;
    };
  }
  return (a, s) => {
    const len = nodes.length;
    const sources = new Array(len);
    for (let i = 0;i < len; i++) {
      sources[i] = s;
      const op = nodes[i];
      if (hasFailingGet(op.kind)) {
        const result4 = op.get(s);
        if (isFailure2(result4)) {
          return result4;
        }
        s = result4.success;
      } else {
        s = op.get(s);
      }
    }
    for (let i = len - 1;i >= 0; i--) {
      const op = nodes[i];
      if (hasSourceFreeSet(op.kind)) {
        a = op.set(a);
      } else if (op.kind === "Lens") {
        a = op.set(a, sources[i]);
      } else {
        const result4 = op.set(a, sources[i]);
        if (isFailure2(result4)) {
          return result4;
        }
        a = result4.success;
      }
    }
    return kind === "Optional" ? succeed2(a) : a;
  };
}
function hasFailingGet(kind) {
  return kind === "Prism" || kind === "Optional";
}
function hasSourceFreeSet(kind) {
  return kind === "Iso" || kind === "Prism";
}
function composeKind(a, b) {
  if (a === "Iso")
    return b;
  if (b === "Iso" || a === b)
    return a;
  return "Optional";
}
var identityIso = /* @__PURE__ */ make28([]);
function id() {
  return identityIso;
}

// node_modules/effect/dist/internal/redacted.js
var redactedRegistry = /* @__PURE__ */ new WeakMap;
var value = (self) => {
  if (redactedRegistry.has(self)) {
    return redactedRegistry.get(self);
  } else {
    throw new Error("Unable to get redacted value" + (self.label ? ` with label: "${self.label}"` : ""));
  }
};

// node_modules/effect/dist/Redacted.js
var TypeId34 = "~effect/data/Redacted";
var isRedacted = (u) => hasProperty(u, TypeId34);
var make29 = (value2, options) => {
  const self = Object.create(Proto4);
  if (options?.label) {
    self.label = options.label;
  }
  redactedRegistry.set(self, value2);
  return self;
};
var Proto4 = {
  [TypeId34]: {
    _A: (_) => _
  },
  label: undefined,
  ...PipeInspectableProto,
  toJSON() {
    return this.toString();
  },
  toString() {
    return `<redacted${isString(this.label) ? ":" + this.label : ""}>`;
  },
  [symbol]() {
    return hash(redactedRegistry.get(this));
  },
  [symbol2](that) {
    return isRedacted(that) && equals(redactedRegistry.get(this), redactedRegistry.get(that));
  }
};
var value2 = value;
var makeEquivalence4 = (isEquivalent) => make3((x, y) => isEquivalent(value2(x), value2(y)));

// node_modules/effect/dist/Schema.js
var TypeId35 = TypeId33;
function declareConstructor() {
  return (typeParameters, run3, annotations) => {
    return make30(new Declaration(typeParameters.map(getAST), (typeParameters2) => run3(typeParameters2.map((ast) => make30(ast))), annotations));
  };
}
function declare(is2, annotations) {
  return declareConstructor()([], () => (input, ast, options) => is2(input) ? succeed6(input) : fail6(new InvalidType(ast, input, options)), annotations);
}
function revealBottom(bottom) {
  return bottom;
}
function annotate2(annotations) {
  return (self) => self.annotate(annotations);
}
function annotateEncoded(annotations) {
  return (self) => flip4(flip4(self).annotate(annotations));
}
function annotateKey2(annotations) {
  return (self) => {
    return self.rebuild(annotateKey(self.ast, annotations));
  };
}
function revealCodec(codec) {
  return codec;
}
var SchemaErrorTypeId = "~effect/SchemaError/SchemaError";

class SchemaError extends (/* @__PURE__ */ TaggedError2("SchemaError")) {
  [SchemaErrorTypeId] = SchemaErrorTypeId;
  constructor(issue) {
    const stackTraceLimit = getStackTraceLimit();
    setStackTraceLimit(0);
    try {
      super({
        issue
      });
    } finally {
      setStackTraceLimit(stackTraceLimit);
    }
  }
  get message() {
    return defaultFormatter(this.issue);
  }
  toString() {
    return `SchemaError(${this.message})`;
  }
}
function isSchemaError(u) {
  return hasProperty(u, SchemaErrorTypeId) && u[SchemaErrorTypeId] === SchemaErrorTypeId;
}
function makeStandardResult(exit3) {
  return isSuccess4(exit3) ? exit3.value : {
    issues: [{
      message: pretty(exit3.cause)
    }]
  };
}
function toStandardSchemaV1(self, options) {
  const decodeUnknownEffect2 = decodeUnknownEffect(self);
  const parseOptions = {
    errors: "all",
    ...options?.parseOptions
  };
  const formatter = makeFormatterStandardSchemaV1(options);
  const validate3 = (value3) => {
    const scheduler = new MixedScheduler("sync");
    const fiber3 = runFork2(match6(decodeUnknownEffect2(value3, parseOptions), {
      onFailure: formatter,
      onSuccess: (value4) => ({
        value: value4
      })
    }), {
      scheduler
    });
    fiber3.currentDispatcher?.flush();
    const exit3 = fiber3.pollUnsafe();
    if (exit3) {
      return makeStandardResult(exit3);
    }
    return new Promise((resolve2) => {
      fiber3.addObserver((exit4) => {
        resolve2(makeStandardResult(exit4));
      });
    });
  };
  if ("~standard" in self) {
    const out = self;
    if ("validate" in out["~standard"])
      return out;
    Object.assign(out["~standard"], {
      validate: validate3
    });
    return out;
  } else {
    return Object.assign(self, {
      "~standard": {
        version: 1,
        vendor: "effect",
        validate: validate3
      }
    });
  }
}
function toBaseStandardJSONSchemaV1(self, target) {
  const doc2020_12 = toJsonSchemaDocument2(self);
  if (target === "draft-2020-12") {
    const schema = doc2020_12.schema;
    if (Object.keys(doc2020_12.definitions).length > 0) {
      schema.$defs = doc2020_12.definitions;
    }
    return schema;
  } else if (target === "draft-07") {
    const doc07 = toDocumentDraft07(doc2020_12);
    const schema = doc07.schema;
    if (Object.keys(doc07.definitions).length > 0) {
      schema.definitions = doc07.definitions;
    }
    return schema;
  }
  throw new globalThis.Error(`Unsupported target: ${target}`);
}
function toStandardJSONSchemaV1(self) {
  const jsonSchema = {
    input(options) {
      return toBaseStandardJSONSchemaV1(self, options.target);
    },
    output(options) {
      return toBaseStandardJSONSchemaV1(toType2(self), options.target);
    }
  };
  if ("~standard" in self) {
    const out = self;
    if ("jsonSchema" in out["~standard"])
      return out;
    Object.assign(out["~standard"], {
      jsonSchema
    });
    return out;
  } else {
    return Object.assign(self, {
      "~standard": {
        version: 1,
        vendor: "effect",
        jsonSchema
      }
    });
  }
}
var is2 = is;
var asserts2 = asserts;
function decodeUnknownEffect2(schema, options) {
  const parser = decodeUnknownEffect(schema, options);
  return (input, options2) => {
    return fromIssueEffect(parser(input, options2));
  };
}
function fromIssueEffect(self) {
  if (effectIsExit(self)) {
    return fromIssueExit(self);
  }
  return catchCause3(self, (cause) => failCauseSync2(() => map6(cause, (issue) => new SchemaError(issue))));
}
var decodeEffect2 = decodeUnknownEffect2;
function getSchemaErrorOrThrow(cause, message) {
  let schemaError;
  for (const reason of cause.reasons) {
    if (!isFailReason2(reason) || !isSchemaError(reason.error)) {
      throw new globalThis.Error(message, {
        cause
      });
    }
    schemaError ??= reason.error;
  }
  if (schemaError === undefined) {
    throw new globalThis.Error(message, {
      cause
    });
  }
  return schemaError;
}
function runSchemaErrorPromise(self) {
  return runPromiseExit2(self).then((exit3) => {
    if (isSuccess4(exit3)) {
      return exit3.value;
    }
    throw getSchemaErrorOrThrow(exit3.cause, "Promise adapter can only reject schema errors");
  });
}
function runSchemaErrorSync(self) {
  const exit3 = runSyncExit2(self);
  if (isSuccess4(exit3)) {
    return exit3.value;
  }
  throw getSchemaErrorOrThrow(exit3.cause, "Sync adapter can only throw schema errors");
}
function decodeUnknownExit2(schema, options) {
  const parser = decodeUnknownExit(schema, options);
  return (input, options2) => {
    return fromIssueExit(parser(input, options2));
  };
}
function fromIssueExit(exit3) {
  return isSuccess4(exit3) ? exit3 : failCause2(map6(exit3.cause, (issue) => new SchemaError(issue)));
}
var decodeExit = decodeUnknownExit2;
var decodeUnknownOption2 = decodeUnknownOption;
var decodeOption2 = decodeOption;
function decodeUnknownResult2(schema, options) {
  const parser = decodeUnknownResult(schema, options);
  return (input, options2) => {
    return mapError(parser(input, options2), (issue) => new SchemaError(issue));
  };
}
var decodeResult = decodeUnknownResult2;
function decodeUnknownPromise(schema, options) {
  const parser = decodeUnknownEffect2(schema, options);
  return (input, options2) => {
    return runSchemaErrorPromise(parser(input, options2));
  };
}
var decodePromise = decodeUnknownPromise;
function decodeUnknownSync2(schema, options) {
  const parser = decodeUnknownEffect2(schema, options);
  return (input, options2) => {
    return runSchemaErrorSync(parser(input, options2));
  };
}
var decodeSync2 = decodeUnknownSync2;
function encodeUnknownEffect2(schema, options) {
  const parser = encodeUnknownEffect(schema, options);
  return (input, options2) => {
    return fromIssueEffect(parser(input, options2));
  };
}
var encodeEffect = encodeUnknownEffect2;
function encodeUnknownExit2(schema, options) {
  const parser = encodeUnknownExit(schema, options);
  return (input, options2) => {
    return fromIssueExit(parser(input, options2));
  };
}
var encodeExit = encodeUnknownExit2;
var encodeUnknownOption2 = encodeUnknownOption;
var encodeOption2 = encodeOption;
function encodeUnknownResult2(schema, options) {
  const parser = encodeUnknownResult(schema, options);
  return (input, options2) => {
    return mapError(parser(input, options2), (issue) => new SchemaError(issue));
  };
}
var encodeResult = encodeUnknownResult2;
function encodeUnknownPromise(schema, options) {
  const parser = encodeUnknownEffect2(schema, options);
  return (input, options2) => {
    return runSchemaErrorPromise(parser(input, options2));
  };
}
var encodePromise = encodeUnknownPromise;
function encodeUnknownSync2(schema, options) {
  const parser = encodeUnknownEffect2(schema, options);
  return (input, options2) => {
    return runSchemaErrorSync(parser(input, options2));
  };
}
var encodeSync2 = encodeUnknownSync2;
var make30 = make27;
function isSchema(u) {
  return hasProperty(u, TypeId35) && u[TypeId35] === TypeId35;
}
var optionalKey2 = /* @__PURE__ */ lambda((schema) => make30(optionalKey(schema.ast), {
  schema
}));
var requiredKey = /* @__PURE__ */ lambda((self) => self.schema);
var optional2 = /* @__PURE__ */ lambda((self) => {
  const schema = UndefinedOr(self);
  return make30(optional(self.ast), {
    schema
  });
});
var required = /* @__PURE__ */ lambda((self) => self.schema.members[0]);
var mutableKey2 = /* @__PURE__ */ lambda((schema) => make30(mutableKey(schema.ast), {
  schema
}));
var readonlyKey = /* @__PURE__ */ lambda((self) => self.schema);
var toType2 = /* @__PURE__ */ lambda((schema) => make30(toType(schema.ast), {
  schema
}));
var toEncoded2 = /* @__PURE__ */ lambda((schema) => make30(toEncoded(schema.ast), {
  schema
}));
var FlipTypeId = "~effect/Schema/flip";
function isFlip$(schema) {
  return hasProperty(schema, FlipTypeId) && schema[FlipTypeId] === FlipTypeId;
}
function flip4(schema) {
  if (isFlip$(schema)) {
    return schema.schema.rebuild(flip3(schema.ast));
  }
  return make30(flip3(schema.ast), {
    [FlipTypeId]: FlipTypeId,
    schema
  });
}
function Literal2(literal) {
  const out = make30(new Literal(literal), {
    literal,
    transform(to) {
      return out.pipe(decodeTo2(Literal2(to), {
        decode: transform(() => to),
        encode: transform(() => literal)
      }));
    }
  });
  return out;
}
function templateLiteralFromParts(parts) {
  return new TemplateLiteral(parts.map((part) => isSchema(part) ? part.ast : new Literal(part)));
}
function TemplateLiteral2(parts) {
  return make30(templateLiteralFromParts(parts), {
    parts
  });
}
function TemplateLiteralParser(parts) {
  return make30(templateLiteralFromParts(parts).asTemplateLiteralParser(), {
    parts
  });
}
function Enum2(enums) {
  return make30(new Enum(Object.keys(enums).filter((key) => typeof enums[enums[key]] !== "number").map((key) => [key, enums[key]])), {
    enums
  });
}
var Never2 = /* @__PURE__ */ make30(never5);
var Any2 = /* @__PURE__ */ make30(any);
var Unknown2 = /* @__PURE__ */ make30(unknown);
var Null2 = /* @__PURE__ */ make30(null_);
var Undefined2 = /* @__PURE__ */ make30(undefined_3);
var String5 = /* @__PURE__ */ make30(string2);
var Number6 = /* @__PURE__ */ make30(number2);
var Boolean3 = /* @__PURE__ */ make30(boolean);
var Symbol3 = /* @__PURE__ */ make30(symbol3);
var BigInt5 = /* @__PURE__ */ make30(bigInt);
var Void2 = /* @__PURE__ */ make30(void_4);
var ObjectKeyword2 = /* @__PURE__ */ make30(objectKeyword);
function UniqueSymbol2(symbol4) {
  return make30(new UniqueSymbol(symbol4));
}
function makeStruct(ast, fields) {
  return make30(ast, {
    fields,
    mapFields(f, options) {
      const fields2 = f(this.fields);
      return makeStruct(struct(fields2, options?.unsafePreserveChecks ? this.ast.checks : undefined), fields2);
    }
  });
}
function Struct(fields) {
  return makeStruct(struct(fields, undefined), fields);
}
function fieldsAssign(fields) {
  return lambda((struct2) => struct2.mapFields(assign(fields)));
}
var canonicalPropertyKey = (key) => typeof key === "symbol" ? key : globalThis.String(key);
function encodeKeys(mapping) {
  return function(self) {
    const fields = {};
    const appliedMapping = Object.create(null);
    const reverseMapping = Object.create(null);
    const seenEncodedKeys = new Set;
    for (const k of Reflect.ownKeys(self.fields)) {
      const encoded = toEncoded2(self.fields[k]);
      const hasMapping = Object.hasOwn(mapping, k);
      const encodedKey = hasMapping ? mapping[k] : k;
      const canonical = canonicalPropertyKey(encodedKey);
      if (seenEncodedKeys.has(canonical)) {
        throw new globalThis.Error(`Duplicate encoded keys: ${formatPropertyKey(encodedKey)}`);
      }
      seenEncodedKeys.add(canonical);
      assignProperty(fields, encodedKey, encoded);
      if (hasMapping) {
        appliedMapping[k] = encodedKey;
        reverseMapping[encodedKey] = k;
      }
    }
    return Struct(fields).pipe(decodeTo2(self, transform2({
      decode: renameKeys(reverseMapping),
      encode: renameKeys(appliedMapping)
    })));
  };
}
function extendTo(fields, derive) {
  return (self) => {
    const f = map3(self.fields, toType2);
    const to = Struct({
      ...f,
      ...fields
    });
    return self.pipe(decodeTo2(to, transform2({
      decode: (input) => {
        const out = {
          ...input
        };
        for (const k in fields) {
          const f2 = derive[k];
          const o = f2(input);
          if (isSome2(o)) {
            assignProperty(out, k, o.value);
          }
        }
        return out;
      },
      encode: (input) => {
        const out = {
          ...input
        };
        for (const k in fields) {
          delete out[k];
        }
        return out;
      }
    })));
  };
}
function Record(key, value3) {
  return make30(record(key.ast, value3.ast), {
    key,
    value: value3
  });
}
function StructWithRest(schema, records) {
  return make30(structWithRest(schema.ast, records.map(getAST)), {
    schema,
    records
  });
}
function makeTuple(ast, elements) {
  return make30(ast, {
    elements,
    mapElements(f, options) {
      const elements2 = f(this.elements);
      return makeTuple(tuple(elements2, options?.unsafePreserveChecks ? this.ast.checks : undefined), elements2);
    }
  });
}
function Tuple(elements) {
  return makeTuple(tuple(elements), elements);
}
function TupleWithRest(schema, rest) {
  return make30(tupleWithRest(schema.ast, rest.map(getAST)), {
    schema,
    rest
  });
}
var ArraySchema = /* @__PURE__ */ lambda((schema) => make30(new Arrays(false, [], [schema.ast]), {
  value: schema
}));
var NonEmptyArray = /* @__PURE__ */ lambda((schema) => make30(new Arrays(false, [schema.ast], [schema.ast]), {
  value: schema
}));
function ArrayEnsure(schema) {
  return Union2([schema, ArraySchema(schema)]).pipe(decodeTo2(ArraySchema(toType2(schema)), transform2({
    decode: ensure,
    encode: (array3) => array3.length === 1 ? array3[0] : array3
  })));
}
function UniqueArray(item) {
  return ArraySchema(item).check(isUnique());
}
var mutable = /* @__PURE__ */ lambda((schema) => {
  return make30(new Arrays(true, schema.ast.elements, schema.ast.rest), {
    schema
  });
});
function makeUnion(ast, members) {
  return make30(ast, {
    members,
    mapMembers(f, options) {
      const members2 = f(this.members);
      return makeUnion(union4(members2, this.ast.mode, options?.unsafePreserveChecks ? this.ast.checks : undefined), members2);
    }
  });
}
function Union2(members, options) {
  return makeUnion(union4(members, options?.mode ?? "anyOf", undefined), members);
}
function Literals(literals) {
  const members = literals.map(Literal2);
  return make30(union4(members, "anyOf", undefined), {
    literals,
    members,
    mapMembers(f) {
      return Union2(f(this.members));
    },
    pick(literals2) {
      return Literals(literals2);
    },
    transform(to) {
      return Union2(members.map((member, index2) => member.transform(to[index2])));
    }
  });
}
var NullOr = /* @__PURE__ */ lambda((self) => Union2([self, Null2]));
var UndefinedOr = /* @__PURE__ */ lambda((self) => Union2([self, Undefined2]));
var NullishOr = /* @__PURE__ */ lambda((self) => Union2([self, Null2, Undefined2]));
function suspend6(f) {
  return make30(new Suspend(() => f().ast));
}
function check(...checks) {
  return (self) => self.check(...checks);
}
function refine(refinement, annotations) {
  return (schema) => make30(appendChecks(schema.ast, [makeFilterByGuard(refinement, annotations)]), {
    schema
  });
}
function brand2(identifier2) {
  return (schema) => make30(brand(schema.ast, identifier2), {
    schema,
    identifier: identifier2
  });
}
function fromBrand(identifier2, ctor) {
  return (self) => {
    return (ctor.checks ? self.check(...ctor.checks) : self).pipe(brand2(identifier2));
  };
}
function middlewareDecoding2(decode) {
  return (schema) => make30(middlewareDecoding(schema.ast, new Middleware(decode, identity)), {
    schema
  });
}
function middlewareEncoding2(encode) {
  return (schema) => make30(middlewareEncoding(schema.ast, new Middleware(identity, encode)), {
    schema
  });
}
function catchDecoding(f) {
  return catchDecodingWithContext(f);
}
function catchDecodingWithContext(f) {
  return (self) => middlewareDecoding2(catchEager2(f))(self);
}
function catchEncoding(f) {
  return catchEncodingWithContext(f);
}
function catchEncodingWithContext(f) {
  return (self) => middlewareEncoding2(catchEager2(f))(self);
}
function decodeTo2(to, transformation) {
  return (from) => {
    return make30(decodeTo(from.ast, to.ast, transformation ? make25(transformation) : passthrough3()), {
      from,
      to
    });
  };
}
function decode(transformation) {
  return (self) => {
    return decodeTo2(toType2(self), transformation)(self);
  };
}
function encodeTo(to, transformation) {
  return (from) => {
    return transformation ? decodeTo2(from, transformation)(to) : decodeTo2(from)(to);
  };
}
function encode(transformation) {
  return (self) => {
    return decodeTo2(self, transformation)(toEncoded2(self));
  };
}
function withConstructorDefault2(defaultValue) {
  return (schema) => make30(withConstructorDefault(schema.ast, defaultValue), {
    schema
  });
}
function toIssueEffect(self) {
  return catchCause3(self, (cause) => failCauseSync2(() => map6(cause, (error) => error.issue)));
}
function withDecodingDefaultKey(defaultValue, options) {
  const encode2 = options?.encodingStrategy === "omit" ? omit2() : passthrough2();
  return (self) => {
    return optionalKey2(toEncoded2(self)).pipe(decodeTo2(self, {
      decode: withDefault(toIssueEffect(defaultValue)),
      encode: encode2
    }));
  };
}
function withDecodingDefaultTypeKey(defaultValue, options) {
  return (self) => {
    return toType2(self).pipe(withDecodingDefaultKey(defaultValue, options), encodeTo(optionalKey2(self)));
  };
}
function withDecodingDefault(defaultValue, options) {
  const encode2 = options?.encodingStrategy === "omit" ? omit2() : passthrough2();
  return (self) => {
    return optional2(toEncoded2(self)).pipe(decodeTo2(self, {
      decode: withDefault(toIssueEffect(defaultValue)),
      encode: encode2
    }));
  };
}
function withDecodingDefaultType(defaultValue, options) {
  return (self) => {
    return toType2(self).pipe(withDecodingDefault(defaultValue, options), encodeTo(optional2(self)));
  };
}
function tag(literal) {
  return Literal2(literal).pipe(withConstructorDefault2(succeed6(literal)));
}
function tagDefaultOmit(literal) {
  return tag(literal).pipe(withDecodingDefaultKey(succeed6(literal), {
    encodingStrategy: "omit"
  }));
}
function TaggedStruct(value3, fields) {
  return Struct({
    _tag: tag(value3),
    ...fields
  });
}
function toTaggedUnion(tag2) {
  return (self) => {
    const cases = {};
    const discriminants = [];
    const discriminantKeys = new Set;
    const guards = {};
    const isAnyOf = (keys4) => (value3) => keys4.includes(value3[tag2]);
    walk(self);
    return Object.assign(self, {
      cases,
      discriminants,
      isAnyOf,
      guards,
      match: match8,
      matchOrElse
    });
    function walk(schema) {
      const ast = schema.ast;
      if (isUnion(ast) && "members" in schema && globalThis.Array.isArray(schema.members) && schema.members.every(isSchema)) {
        return schema.members.forEach(walk);
      }
      const sentinels = collectSentinels(ast);
      if (sentinels.length > 0) {
        const literal = sentinels.find((s) => s.key === tag2)?.literal;
        if (isPropertyKey(literal)) {
          const key = typeof literal === "number" ? globalThis.String(literal) : literal;
          if (discriminantKeys.has(key)) {
            throw new globalThis.Error(`Duplicate discriminant: ${globalThis.String(literal)}`);
          }
          discriminantKeys.add(key);
          discriminants.push(literal);
          assignProperty(cases, literal, schema);
          assignProperty(guards, literal, is2(toType2(schema)));
          return;
        }
      }
      throw new globalThis.Error("No literal or unique symbol found");
    }
    function match8() {
      if (arguments.length === 1) {
        const cases3 = arguments[0];
        return function(value4) {
          const key2 = value4[tag2];
          const handler2 = Object.hasOwn(cases3, key2) ? cases3[key2] : undefined;
          return handler2(value4);
        };
      }
      const value3 = arguments[0];
      const cases2 = arguments[1];
      const key = value3[tag2];
      const handler = Object.hasOwn(cases2, key) ? cases2[key] : undefined;
      return handler(value3);
    }
    function matchOrElse() {
      if (arguments.length === 2) {
        const cases3 = arguments[0];
        const orElse2 = arguments[1];
        return function(value4) {
          const key2 = value4[tag2];
          const handler2 = Object.hasOwn(cases3, key2) ? cases3[key2] ?? orElse2 : orElse2;
          return handler2(value4);
        };
      }
      const value3 = arguments[0];
      const cases2 = arguments[1];
      const orElse = arguments[2];
      const key = value3[tag2];
      const handler = Object.hasOwn(cases2, key) ? cases2[key] ?? orElse : orElse;
      return handler(value3);
    }
  };
}
function TaggedUnion(casesByTag) {
  const cases = {};
  const members = [];
  for (const key of Object.keys(casesByTag)) {
    const member = TaggedStruct(key, casesByTag[key]);
    assignProperty(cases, key, member);
    members.push(member);
  }
  const union5 = Union2(members);
  const {
    guards,
    isAnyOf,
    match: match8,
    matchOrElse
  } = toTaggedUnion("_tag")(union5);
  return make30(union5.ast, {
    cases,
    isAnyOf,
    guards,
    match: match8,
    matchOrElse
  });
}
function Opaque() {
  return (schema) => {
    return schema;
  };
}
function instanceOf(constructor, annotations) {
  return declare((u) => u instanceof constructor, annotations);
}
function link() {
  return (encodeTo2, transformation) => {
    return new Link(encodeTo2.ast, make25(transformation));
  };
}
var makeFilter2 = makeFilter;
function makeFilterGroup(checks, annotations = undefined) {
  return new FilterGroup(checks, annotations);
}
function makeFixedDeclarationReviver(id2, schema) {
  return makeDeclarationReviver(id2, Null2, ({
    annotations
  }) => annotations === undefined ? schema : schema.annotate(annotations));
}
var TRIMMED_PATTERN = "^\\S[\\s\\S]*\\S$|^\\S$|^$";
function isTrimmed(annotations) {
  const regExp = new globalThis.RegExp(TRIMMED_PATTERN);
  return makeFilter2((s) => s.trim() === s, {
    expected: "a string with no leading or trailing whitespace",
    representation: {
      id: "effect/schema/isTrimmed",
      payload: null
    },
    toJsonSchema: () => ({
      pattern: regExp.source
    }),
    toCode: () => ({
      runtime: "Schema.isTrimmed()"
    }),
    arbitrary: {
      constraint: {
        patterns: [TRIMMED_PATTERN]
      }
    },
    ...annotations
  });
}
var isTrimmedReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isTrimmed", Null2, ({
  annotations
}) => isTrimmed(annotations));
function isPattern2(regExp, annotations) {
  const source = regExp.source;
  const flags = regExp.flags;
  const runtimeRegExp = flags === "" ? `new RegExp(${format(source)})` : `new RegExp(${format(source)}, ${format(flags)})`;
  return isPattern(regExp, {
    toCode: () => ({
      runtime: `Schema.isPattern(${runtimeRegExp})`
    }),
    ...annotations
  });
}
var IsPatternPayload = /* @__PURE__ */ Struct({
  source: String5,
  flags: String5
}).check(/* @__PURE__ */ makeFilter2((payload) => {
  const result4 = try_(() => new globalThis.RegExp(payload.source, payload.flags));
  return isSuccess2(result4) && result4.success.source === payload.source && result4.success.flags === payload.flags;
}));
var isPatternReviver = {
  id: "effect/schema/isPattern",
  payloadSchema: IsPatternPayload,
  revive: ({
    annotations,
    payload
  }) => isPattern2(new globalThis.RegExp(payload.source, payload.flags), annotations)
};
function isStringFinite2(annotations) {
  return isStringFinite({
    toCode: () => ({
      runtime: "Schema.isStringFinite()"
    }),
    ...annotations
  });
}
var isStringFiniteReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isStringFinite", Null2, ({
  annotations
}) => isStringFinite2(annotations));
function isStringBigInt2(annotations) {
  return isStringBigInt({
    toCode: () => ({
      runtime: "Schema.isStringBigInt()"
    }),
    ...annotations
  });
}
var isStringBigIntReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isStringBigInt", Null2, ({
  annotations
}) => isStringBigInt2(annotations));
function isStringSymbol2(annotations) {
  return isStringSymbol({
    toCode: () => ({
      runtime: "Schema.isStringSymbol()"
    }),
    ...annotations
  });
}
var isStringSymbolReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isStringSymbol", Null2, ({
  annotations
}) => isStringSymbol2(annotations));
var getUUIDRegExp = (version) => {
  if (version) {
    return new globalThis.RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
  }
  return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|[fF]{8}-[fF]{4}-[fF]{4}-[fF]{4}-[fF]{12})$/;
};
function isUUID(version, annotations) {
  const regExp = getUUIDRegExp(version);
  return isPattern2(regExp, {
    expected: version ? `a UUID v${version}` : "a UUID",
    representation: {
      id: "effect/schema/isUUID",
      payload: {
        version: version ?? null
      }
    },
    toJsonSchema: () => ({
      pattern: regExp.source,
      format: "uuid"
    }),
    toCode: () => ({
      runtime: version === undefined ? "Schema.isUUID()" : `Schema.isUUID(${version})`
    }),
    ...annotations
  });
}
var isUUIDReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isUUID", /* @__PURE__ */ Struct({
  version: /* @__PURE__ */ Union2([/* @__PURE__ */ Literals([1, 2, 3, 4, 5, 6, 7, 8]), Null2])
}), ({
  annotations,
  payload
}) => isUUID(payload.version ?? undefined, annotations));
var GUID_REGEXP = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
function isGUID(annotations) {
  return isPattern2(GUID_REGEXP, {
    expected: "a GUID",
    representation: {
      id: "effect/schema/isGUID",
      payload: null
    },
    toJsonSchema: () => ({
      pattern: GUID_REGEXP.source
    }),
    toCode: () => ({
      runtime: "Schema.isGUID()"
    }),
    ...annotations
  });
}
var isGUIDReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isGUID", Null2, ({
  annotations
}) => isGUID(annotations));
function isULID(annotations) {
  const regExp = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
  return isPattern2(regExp, {
    representation: {
      id: "effect/schema/isULID",
      payload: null
    },
    toJsonSchema: () => ({
      pattern: regExp.source
    }),
    toCode: () => ({
      runtime: "Schema.isULID()"
    }),
    ...annotations
  });
}
var isULIDReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isULID", Null2, ({
  annotations
}) => isULID(annotations));
function isBase64(annotations) {
  const regExp = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  return isPattern2(regExp, {
    expected: "a base64 encoded string",
    representation: {
      id: "effect/schema/isBase64",
      payload: null
    },
    toJsonSchema: () => ({
      pattern: regExp.source
    }),
    toCode: () => ({
      runtime: "Schema.isBase64()"
    }),
    ...annotations
  });
}
var isBase64Reviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isBase64", Null2, ({
  annotations
}) => isBase64(annotations));
function isBase64Url(annotations) {
  const regExp = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
  return isPattern2(regExp, {
    expected: "a base64url encoded string",
    representation: {
      id: "effect/schema/isBase64Url",
      payload: null
    },
    toJsonSchema: () => ({
      pattern: regExp.source
    }),
    toCode: () => ({
      runtime: "Schema.isBase64Url()"
    }),
    ...annotations
  });
}
var isBase64UrlReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isBase64Url", Null2, ({
  annotations
}) => isBase64Url(annotations));
function isStartsWith(startsWith, annotations) {
  const formatted = JSON.stringify(startsWith);
  const regExp = new globalThis.RegExp(`^${escape(startsWith)}`);
  return makeFilter2((s) => s.startsWith(startsWith), {
    expected: `a string starting with ${formatted}`,
    representation: {
      id: "effect/schema/isStartsWith",
      payload: {
        startsWith
      }
    },
    toJsonSchema: () => ({
      pattern: regExp.source
    }),
    toCode: () => ({
      runtime: `Schema.isStartsWith(${format(startsWith)})`
    }),
    arbitrary: {
      constraint: {
        patterns: [regExp.source]
      }
    },
    ...annotations
  });
}
var isStartsWithReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isStartsWith", /* @__PURE__ */ Struct({
  startsWith: String5
}), ({
  annotations,
  payload
}) => isStartsWith(payload.startsWith, annotations));
function isEndsWith(endsWith, annotations) {
  const formatted = JSON.stringify(endsWith);
  const regExp = new globalThis.RegExp(`${escape(endsWith)}$`);
  return makeFilter2((s) => s.endsWith(endsWith), {
    expected: `a string ending with ${formatted}`,
    representation: {
      id: "effect/schema/isEndsWith",
      payload: {
        endsWith
      }
    },
    toJsonSchema: () => ({
      pattern: regExp.source
    }),
    toCode: () => ({
      runtime: `Schema.isEndsWith(${format(endsWith)})`
    }),
    arbitrary: {
      constraint: {
        patterns: [regExp.source]
      }
    },
    ...annotations
  });
}
var isEndsWithReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isEndsWith", /* @__PURE__ */ Struct({
  endsWith: String5
}), ({
  annotations,
  payload
}) => isEndsWith(payload.endsWith, annotations));
function isIncludes(includes, annotations) {
  const formatted = JSON.stringify(includes);
  const regExp = new globalThis.RegExp(escape(includes));
  return makeFilter2((s) => s.includes(includes), {
    expected: `a string including ${formatted}`,
    representation: {
      id: "effect/schema/isIncludes",
      payload: {
        includes
      }
    },
    toJsonSchema: () => ({
      pattern: regExp.source
    }),
    toCode: () => ({
      runtime: `Schema.isIncludes(${format(includes)})`
    }),
    arbitrary: {
      constraint: {
        patterns: [regExp.source]
      }
    },
    ...annotations
  });
}
var isIncludesReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isIncludes", /* @__PURE__ */ Struct({
  includes: String5
}), ({
  annotations,
  payload
}) => isIncludes(payload.includes, annotations));
var UPPERCASED_PATTERN = "^[^a-z]*$";
function isUppercased(annotations) {
  const regExp = new globalThis.RegExp(UPPERCASED_PATTERN);
  return makeFilter2((s) => s.toUpperCase() === s, {
    expected: "a string with all characters in uppercase",
    representation: {
      id: "effect/schema/isUppercased",
      payload: null
    },
    toJsonSchema: () => ({
      pattern: regExp.source
    }),
    toCode: () => ({
      runtime: "Schema.isUppercased()"
    }),
    arbitrary: {
      constraint: {
        patterns: [UPPERCASED_PATTERN]
      }
    },
    ...annotations
  });
}
var isUppercasedReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isUppercased", Null2, ({
  annotations
}) => isUppercased(annotations));
var LOWERCASED_PATTERN = "^[^A-Z]*$";
function isLowercased(annotations) {
  const regExp = new globalThis.RegExp(LOWERCASED_PATTERN);
  return makeFilter2((s) => s.toLowerCase() === s, {
    expected: "a string with all characters in lowercase",
    representation: {
      id: "effect/schema/isLowercased",
      payload: null
    },
    toJsonSchema: () => ({
      pattern: regExp.source
    }),
    toCode: () => ({
      runtime: "Schema.isLowercased()"
    }),
    arbitrary: {
      constraint: {
        patterns: [LOWERCASED_PATTERN]
      }
    },
    ...annotations
  });
}
var isLowercasedReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isLowercased", Null2, ({
  annotations
}) => isLowercased(annotations));
var CAPITALIZED_PATTERN = "^[^a-z]?.*$";
function isCapitalized(annotations) {
  const regExp = new globalThis.RegExp(CAPITALIZED_PATTERN);
  return makeFilter2((s) => s.charAt(0).toUpperCase() === s.charAt(0), {
    expected: "a string with the first character in uppercase",
    representation: {
      id: "effect/schema/isCapitalized",
      payload: null
    },
    toJsonSchema: () => ({
      pattern: regExp.source
    }),
    toCode: () => ({
      runtime: "Schema.isCapitalized()"
    }),
    arbitrary: {
      constraint: {
        patterns: [CAPITALIZED_PATTERN]
      }
    },
    ...annotations
  });
}
var isCapitalizedReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isCapitalized", Null2, ({
  annotations
}) => isCapitalized(annotations));
var UNCAPITALIZED_PATTERN = "^[^A-Z]?.*$";
function isUncapitalized(annotations) {
  const regExp = new globalThis.RegExp(UNCAPITALIZED_PATTERN);
  return makeFilter2((s) => s.charAt(0).toLowerCase() === s.charAt(0), {
    expected: "a string with the first character in lowercase",
    representation: {
      id: "effect/schema/isUncapitalized",
      payload: null
    },
    toJsonSchema: () => ({
      pattern: regExp.source
    }),
    toCode: () => ({
      runtime: "Schema.isUncapitalized()"
    }),
    arbitrary: {
      constraint: {
        patterns: [UNCAPITALIZED_PATTERN]
      }
    },
    ...annotations
  });
}
var isUncapitalizedReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isUncapitalized", Null2, ({
  annotations
}) => isUncapitalized(annotations));
var Finite = /* @__PURE__ */ make30(finite);
var isFinite3 = isFinite2;
var isFiniteReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isFinite", Null2, ({
  annotations
}) => isFinite3(annotations));
function makeIsGreaterThan(options) {
  const gt = isGreaterThan(options.order);
  const formatter = options.formatter ?? format;
  return (exclusiveMinimum, annotations) => {
    return makeFilter2((input) => gt(input, exclusiveMinimum), {
      expected: `a value greater than ${formatter(exclusiveMinimum)}`,
      arbitrary: {
        constraint: {
          ordered: {
            order: options.order,
            minimum: exclusiveMinimum,
            exclusiveMinimum: true
          }
        }
      },
      ...options.annotate?.(exclusiveMinimum),
      ...annotations
    });
  };
}
function makeIsGreaterThanOrEqualTo(options) {
  const gte = isGreaterThanOrEqualTo(options.order);
  const formatter = options.formatter ?? format;
  return (minimum, annotations) => {
    return makeFilter2((input) => gte(input, minimum), {
      expected: `a value greater than or equal to ${formatter(minimum)}`,
      arbitrary: {
        constraint: {
          ordered: {
            order: options.order,
            minimum
          }
        }
      },
      ...options.annotate?.(minimum),
      ...annotations
    });
  };
}
function makeIsLessThan(options) {
  const lt = isLessThan(options.order);
  const formatter = options.formatter ?? format;
  return (exclusiveMaximum, annotations) => {
    return makeFilter2((input) => lt(input, exclusiveMaximum), {
      expected: `a value less than ${formatter(exclusiveMaximum)}`,
      arbitrary: {
        constraint: {
          ordered: {
            order: options.order,
            maximum: exclusiveMaximum,
            exclusiveMaximum: true
          }
        }
      },
      ...options.annotate?.(exclusiveMaximum),
      ...annotations
    });
  };
}
function makeIsLessThanOrEqualTo(options) {
  const lte = isLessThanOrEqualTo(options.order);
  const formatter = options.formatter ?? format;
  return (maximum, annotations) => {
    return makeFilter2((input) => lte(input, maximum), {
      expected: `a value less than or equal to ${formatter(maximum)}`,
      arbitrary: {
        constraint: {
          ordered: {
            order: options.order,
            maximum
          }
        }
      },
      ...options.annotate?.(maximum),
      ...annotations
    });
  };
}
function makeIsBetween(deriveOptions) {
  const greaterThanOrEqualTo = isGreaterThanOrEqualTo(deriveOptions.order);
  const greaterThan = isGreaterThan(deriveOptions.order);
  const lessThanOrEqualTo = isLessThanOrEqualTo(deriveOptions.order);
  const lessThan = isLessThan(deriveOptions.order);
  const formatter = deriveOptions.formatter ?? format;
  return (options, annotations) => {
    const gte = options.exclusiveMinimum ? greaterThan : greaterThanOrEqualTo;
    const lte = options.exclusiveMaximum ? lessThan : lessThanOrEqualTo;
    return makeFilter2((input) => gte(input, options.minimum) && lte(input, options.maximum), {
      expected: `a value between ${formatter(options.minimum)}${options.exclusiveMinimum ? " (excluded)" : ""} and ${formatter(options.maximum)}${options.exclusiveMaximum ? " (excluded)" : ""}`,
      arbitrary: {
        constraint: {
          ordered: {
            order: deriveOptions.order,
            minimum: options.minimum,
            maximum: options.maximum,
            ...options.exclusiveMinimum && {
              exclusiveMinimum: true
            },
            ...options.exclusiveMaximum && {
              exclusiveMaximum: true
            }
          }
        }
      },
      ...deriveOptions.annotate?.(options),
      ...annotations
    });
  };
}
function makeIsMultipleOf(options) {
  return (divisor, annotations) => {
    const formatter = options.formatter ?? format;
    return makeFilter2((input) => options.remainder(input, divisor) === options.zero, {
      expected: `a value that is a multiple of ${formatter(divisor)}`,
      ...options.annotate?.(divisor),
      ...annotations
    });
  };
}
function encodeNumberPayload(number3) {
  if (!globalThis.Number.isFinite(number3)) {
    throw new globalThis.RangeError(`Expected a finite number, got ${format(number3)}`);
  }
  return number3;
}
var isGreaterThan4 = /* @__PURE__ */ makeIsGreaterThan({
  order: Number2,
  annotate: (exclusiveMinimum) => ({
    representation: {
      id: "effect/schema/isGreaterThan",
      payload: {
        exclusiveMinimum: encodeNumberPayload(exclusiveMinimum)
      }
    },
    toJsonSchema: () => ({
      exclusiveMinimum
    }),
    toCode: () => ({
      runtime: `Schema.isGreaterThan(${format(exclusiveMinimum)})`
    })
  })
});
var isGreaterThanReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isGreaterThan", /* @__PURE__ */ Struct({
  exclusiveMinimum: Finite
}), ({
  annotations,
  payload
}) => isGreaterThan4(payload.exclusiveMinimum, annotations));
var isGreaterThanOrEqualTo3 = /* @__PURE__ */ makeIsGreaterThanOrEqualTo({
  order: Number2,
  annotate: (minimum) => ({
    representation: {
      id: "effect/schema/isGreaterThanOrEqualTo",
      payload: {
        minimum: encodeNumberPayload(minimum)
      }
    },
    toJsonSchema: () => ({
      minimum
    }),
    toCode: () => ({
      runtime: `Schema.isGreaterThanOrEqualTo(${format(minimum)})`
    })
  })
});
var isGreaterThanOrEqualToReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isGreaterThanOrEqualTo", /* @__PURE__ */ Struct({
  minimum: Finite
}), ({
  annotations,
  payload
}) => isGreaterThanOrEqualTo3(payload.minimum, annotations));
var isLessThan4 = /* @__PURE__ */ makeIsLessThan({
  order: Number2,
  annotate: (exclusiveMaximum) => ({
    representation: {
      id: "effect/schema/isLessThan",
      payload: {
        exclusiveMaximum: encodeNumberPayload(exclusiveMaximum)
      }
    },
    toJsonSchema: () => ({
      exclusiveMaximum
    }),
    toCode: () => ({
      runtime: `Schema.isLessThan(${format(exclusiveMaximum)})`
    })
  })
});
var isLessThanReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isLessThan", /* @__PURE__ */ Struct({
  exclusiveMaximum: Finite
}), ({
  annotations,
  payload
}) => isLessThan4(payload.exclusiveMaximum, annotations));
var isLessThanOrEqualTo4 = /* @__PURE__ */ makeIsLessThanOrEqualTo({
  order: Number2,
  annotate: (maximum) => ({
    representation: {
      id: "effect/schema/isLessThanOrEqualTo",
      payload: {
        maximum: encodeNumberPayload(maximum)
      }
    },
    toJsonSchema: () => ({
      maximum
    }),
    toCode: () => ({
      runtime: `Schema.isLessThanOrEqualTo(${format(maximum)})`
    })
  })
});
var isLessThanOrEqualToReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isLessThanOrEqualTo", /* @__PURE__ */ Struct({
  maximum: Finite
}), ({
  annotations,
  payload
}) => isLessThanOrEqualTo4(payload.maximum, annotations));
var isBetween2 = /* @__PURE__ */ makeIsBetween({
  order: Number2,
  annotate: (options) => {
    const exclusiveMinimum = options.exclusiveMinimum ? true : undefined;
    const exclusiveMaximum = options.exclusiveMaximum ? true : undefined;
    const payload = {
      minimum: encodeNumberPayload(options.minimum),
      maximum: encodeNumberPayload(options.maximum),
      ...exclusiveMinimum && {
        exclusiveMinimum
      },
      ...exclusiveMaximum && {
        exclusiveMaximum
      }
    };
    return {
      representation: {
        id: "effect/schema/isBetween",
        payload
      },
      toJsonSchema: () => ({
        [exclusiveMinimum ? "exclusiveMinimum" : "minimum"]: options.minimum,
        [exclusiveMaximum ? "exclusiveMaximum" : "maximum"]: options.maximum
      }),
      toCode: () => ({
        runtime: `Schema.isBetween({ minimum: ${format(options.minimum)}, maximum: ${format(options.maximum)}, exclusiveMinimum: ${format(exclusiveMinimum)}, exclusiveMaximum: ${format(exclusiveMaximum)} })`
      })
    };
  }
});
var isBetweenReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isBetween", /* @__PURE__ */ Struct({
  minimum: Finite,
  maximum: Finite,
  exclusiveMinimum: /* @__PURE__ */ optional2(/* @__PURE__ */ Literal2(true)),
  exclusiveMaximum: /* @__PURE__ */ optional2(/* @__PURE__ */ Literal2(true))
}), ({
  annotations,
  payload
}) => isBetween2(payload, annotations));
var isMultipleOf = /* @__PURE__ */ makeIsMultipleOf({
  remainder,
  zero: 0,
  annotate: (divisor) => ({
    expected: `a value that is a multiple of ${divisor}`,
    representation: {
      id: "effect/schema/isMultipleOf",
      payload: {
        divisor
      }
    },
    toJsonSchema: () => ({
      multipleOf: divisor
    }),
    toCode: () => ({
      runtime: `Schema.isMultipleOf(${format(divisor)})`
    })
  })
});
var isMultipleOfReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isMultipleOf", /* @__PURE__ */ Struct({
  divisor: Finite
}), ({
  annotations,
  payload
}) => isMultipleOf(payload.divisor, annotations));
function isInt(annotations) {
  return makeFilter2((n) => globalThis.Number.isSafeInteger(n), {
    expected: "an integer",
    representation: {
      id: "effect/schema/isInt",
      payload: null
    },
    toJsonSchema: () => ({
      type: "integer"
    }),
    toCode: () => ({
      runtime: "Schema.isInt()"
    }),
    arbitrary: {
      constraint: {
        integer: true
      }
    },
    ...annotations
  });
}
var isIntReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isInt", Null2, ({
  annotations
}) => isInt(annotations));
var Int = /* @__PURE__ */ Number6.check(/* @__PURE__ */ isInt());
var Natural = /* @__PURE__ */ Int.check(/* @__PURE__ */ isGreaterThanOrEqualTo3(0));
function isInt32(annotations) {
  return new FilterGroup([isInt(), isBetween2({
    minimum: -2147483648,
    maximum: 2147483647
  })], {
    expected: "a 32-bit integer",
    ...annotations
  });
}
function isUint32(annotations) {
  return new FilterGroup([isInt(), isBetween2({
    minimum: 0,
    maximum: 4294967295
  })], {
    expected: "a 32-bit unsigned integer",
    ...annotations
  });
}
function encodeDatePayload(date) {
  if (globalThis.Number.isNaN(date.getTime())) {
    throw new globalThis.RangeError(`Expected a valid Date, got ${format(date)}`);
  }
  return date.toISOString();
}
function formatDateRuntime(date) {
  return `new Date(${format(date.getTime())})`;
}
var isGreaterThanDate = /* @__PURE__ */ makeIsGreaterThan({
  order: Date2,
  annotate: (exclusiveMinimum) => {
    const encoded = encodeDatePayload(exclusiveMinimum);
    return {
      representation: {
        id: "effect/schema/isGreaterThanDate",
        payload: {
          exclusiveMinimum: encoded
        }
      },
      toJsonSchema: () => ({}),
      toCode: () => ({
        runtime: `Schema.isGreaterThanDate(${formatDateRuntime(exclusiveMinimum)})`
      })
    };
  }
});
var isGreaterThanOrEqualToDate = /* @__PURE__ */ makeIsGreaterThanOrEqualTo({
  order: Date2,
  annotate: (minimum) => {
    const encoded = encodeDatePayload(minimum);
    return {
      representation: {
        id: "effect/schema/isGreaterThanOrEqualToDate",
        payload: {
          minimum: encoded
        }
      },
      toJsonSchema: () => ({}),
      toCode: () => ({
        runtime: `Schema.isGreaterThanOrEqualToDate(${formatDateRuntime(minimum)})`
      })
    };
  }
});
var isLessThanDate = /* @__PURE__ */ makeIsLessThan({
  order: Date2,
  annotate: (exclusiveMaximum) => {
    const encoded = encodeDatePayload(exclusiveMaximum);
    return {
      representation: {
        id: "effect/schema/isLessThanDate",
        payload: {
          exclusiveMaximum: encoded
        }
      },
      toJsonSchema: () => ({}),
      toCode: () => ({
        runtime: `Schema.isLessThanDate(${formatDateRuntime(exclusiveMaximum)})`
      })
    };
  }
});
var isLessThanOrEqualToDate = /* @__PURE__ */ makeIsLessThanOrEqualTo({
  order: Date2,
  annotate: (maximum) => {
    const encoded = encodeDatePayload(maximum);
    return {
      representation: {
        id: "effect/schema/isLessThanOrEqualToDate",
        payload: {
          maximum: encoded
        }
      },
      toJsonSchema: () => ({}),
      toCode: () => ({
        runtime: `Schema.isLessThanOrEqualToDate(${formatDateRuntime(maximum)})`
      })
    };
  }
});
var isBetweenDate = /* @__PURE__ */ makeIsBetween({
  order: Date2,
  annotate: (options) => {
    const exclusiveMinimum = options.exclusiveMinimum ? true : undefined;
    const exclusiveMaximum = options.exclusiveMaximum ? true : undefined;
    const payload = {
      minimum: encodeDatePayload(options.minimum),
      maximum: encodeDatePayload(options.maximum),
      ...exclusiveMinimum && {
        exclusiveMinimum
      },
      ...exclusiveMaximum && {
        exclusiveMaximum
      }
    };
    return {
      representation: {
        id: "effect/schema/isBetweenDate",
        payload
      },
      toJsonSchema: () => ({}),
      toCode: () => ({
        runtime: `Schema.isBetweenDate({ minimum: ${formatDateRuntime(options.minimum)}, maximum: ${formatDateRuntime(options.maximum)}, exclusiveMinimum: ${format(exclusiveMinimum)}, exclusiveMaximum: ${format(exclusiveMaximum)} })`
      })
    };
  }
});
var isGreaterThanBigInt = /* @__PURE__ */ makeIsGreaterThan({
  order: BigInt2,
  annotate: (exclusiveMinimum) => {
    const encoded = exclusiveMinimum.toString(10);
    return {
      representation: {
        id: "effect/schema/isGreaterThanBigInt",
        payload: {
          exclusiveMinimum: encoded
        }
      },
      toJsonSchema: () => ({}),
      toCode: () => ({
        runtime: `Schema.isGreaterThanBigInt(${format(exclusiveMinimum)})`
      })
    };
  }
});
var isGreaterThanOrEqualToBigInt = /* @__PURE__ */ makeIsGreaterThanOrEqualTo({
  order: BigInt2,
  annotate: (minimum) => {
    const encoded = minimum.toString(10);
    return {
      representation: {
        id: "effect/schema/isGreaterThanOrEqualToBigInt",
        payload: {
          minimum: encoded
        }
      },
      toJsonSchema: () => ({}),
      toCode: () => ({
        runtime: `Schema.isGreaterThanOrEqualToBigInt(${format(minimum)})`
      })
    };
  }
});
var isLessThanBigInt = /* @__PURE__ */ makeIsLessThan({
  order: BigInt2,
  annotate: (exclusiveMaximum) => {
    const encoded = exclusiveMaximum.toString(10);
    return {
      representation: {
        id: "effect/schema/isLessThanBigInt",
        payload: {
          exclusiveMaximum: encoded
        }
      },
      toJsonSchema: () => ({}),
      toCode: () => ({
        runtime: `Schema.isLessThanBigInt(${format(exclusiveMaximum)})`
      })
    };
  }
});
var isLessThanOrEqualToBigInt = /* @__PURE__ */ makeIsLessThanOrEqualTo({
  order: BigInt2,
  annotate: (maximum) => {
    const encoded = maximum.toString(10);
    return {
      representation: {
        id: "effect/schema/isLessThanOrEqualToBigInt",
        payload: {
          maximum: encoded
        }
      },
      toJsonSchema: () => ({}),
      toCode: () => ({
        runtime: `Schema.isLessThanOrEqualToBigInt(${format(maximum)})`
      })
    };
  }
});
var isBetweenBigInt = /* @__PURE__ */ makeIsBetween({
  order: BigInt2,
  annotate: (options) => {
    const exclusiveMinimum = options.exclusiveMinimum ? true : undefined;
    const exclusiveMaximum = options.exclusiveMaximum ? true : undefined;
    const payload = {
      minimum: options.minimum.toString(10),
      maximum: options.maximum.toString(10),
      ...exclusiveMinimum && {
        exclusiveMinimum
      },
      ...exclusiveMaximum && {
        exclusiveMaximum
      }
    };
    return {
      representation: {
        id: "effect/schema/isBetweenBigInt",
        payload
      },
      toJsonSchema: () => ({}),
      toCode: () => ({
        runtime: `Schema.isBetweenBigInt({ minimum: ${format(options.minimum)}, maximum: ${format(options.maximum)}, exclusiveMinimum: ${format(exclusiveMinimum)}, exclusiveMaximum: ${format(exclusiveMaximum)} })`
      })
    };
  }
});
var isGreaterThanBigDecimal = /* @__PURE__ */ makeIsGreaterThan({
  order: Order2,
  formatter: (bd) => format2(bd)
});
var isGreaterThanOrEqualToBigDecimal = /* @__PURE__ */ makeIsGreaterThanOrEqualTo({
  order: Order2,
  formatter: (bd) => format2(bd)
});
var isLessThanBigDecimal = /* @__PURE__ */ makeIsLessThan({
  order: Order2,
  formatter: (bd) => format2(bd)
});
var isLessThanOrEqualToBigDecimal = /* @__PURE__ */ makeIsLessThanOrEqualTo({
  order: Order2,
  formatter: (bd) => format2(bd)
});
var isBetweenBigDecimal = /* @__PURE__ */ makeIsBetween({
  order: Order2,
  formatter: (bd) => format2(bd)
});
function isMinLength(minLength, annotations) {
  minLength = Math.max(0, Math.floor(minLength));
  return makeFilter2((input) => input.length >= minLength, {
    expected: `a value with a length of at least ${minLength}`,
    representation: {
      id: "effect/schema/isMinLength",
      payload: {
        minLength
      }
    },
    toJsonSchema: ({
      type
    }) => type === "array" ? {
      minItems: minLength
    } : {
      minLength
    },
    toCode: () => ({
      runtime: `Schema.isMinLength(${minLength})`
    }),
    [STRUCTURAL_ANNOTATION_KEY]: true,
    arbitrary: {
      constraint: {
        minLength
      }
    },
    ...annotations
  });
}
var isMinLengthReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isMinLength", /* @__PURE__ */ Struct({
  minLength: Natural
}), ({
  annotations,
  payload
}) => isMinLength(payload.minLength, annotations));
function isNonEmpty(annotations) {
  return isMinLength(1, annotations);
}
function isMaxLength(maxLength, annotations) {
  maxLength = Math.max(0, Math.floor(maxLength));
  return makeFilter2((input) => input.length <= maxLength, {
    expected: `a value with a length of at most ${maxLength}`,
    representation: {
      id: "effect/schema/isMaxLength",
      payload: {
        maxLength
      }
    },
    toJsonSchema: ({
      type
    }) => type === "array" ? {
      maxItems: maxLength
    } : {
      maxLength
    },
    toCode: () => ({
      runtime: `Schema.isMaxLength(${maxLength})`
    }),
    [STRUCTURAL_ANNOTATION_KEY]: true,
    arbitrary: {
      constraint: {
        maxLength
      }
    },
    ...annotations
  });
}
var isMaxLengthReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isMaxLength", /* @__PURE__ */ Struct({
  maxLength: Natural
}), ({
  annotations,
  payload
}) => isMaxLength(payload.maxLength, annotations));
function isLengthBetween(minimum, maximum, annotations) {
  minimum = Math.max(0, Math.floor(minimum));
  maximum = Math.max(0, Math.floor(maximum));
  return makeFilter2((input) => input.length >= minimum && input.length <= maximum, {
    expected: minimum === maximum ? `a value with a length of ${minimum}` : `a value with a length between ${minimum} and ${maximum}`,
    representation: {
      id: "effect/schema/isLengthBetween",
      payload: {
        minimum,
        maximum
      }
    },
    toJsonSchema: ({
      type
    }) => type === "array" ? {
      allOf: [{
        minItems: minimum
      }, {
        maxItems: maximum
      }]
    } : {
      allOf: [{
        minLength: minimum
      }, {
        maxLength: maximum
      }]
    },
    toCode: () => ({
      runtime: `Schema.isLengthBetween(${minimum}, ${maximum})`
    }),
    [STRUCTURAL_ANNOTATION_KEY]: true,
    arbitrary: {
      constraint: {
        minLength: minimum,
        maxLength: maximum
      }
    },
    ...annotations
  });
}
var isLengthBetweenReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isLengthBetween", /* @__PURE__ */ Struct({
  minimum: Natural,
  maximum: Natural
}), ({
  annotations,
  payload
}) => isLengthBetween(payload.minimum, payload.maximum, annotations));
function isMinSize(minSize, annotations) {
  minSize = Math.max(0, Math.floor(minSize));
  return makeFilter2((input) => input.size >= minSize, {
    expected: `a value with a size of at least ${minSize}`,
    representation: {
      id: "effect/schema/isMinSize",
      payload: {
        minSize
      }
    },
    toJsonSchema: () => ({}),
    toCode: () => ({
      runtime: `Schema.isMinSize(${minSize})`
    }),
    [STRUCTURAL_ANNOTATION_KEY]: true,
    arbitrary: {
      constraint: {
        minLength: minSize
      }
    },
    ...annotations
  });
}
var isMinSizeReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isMinSize", /* @__PURE__ */ Struct({
  minSize: Natural
}), ({
  annotations,
  payload
}) => isMinSize(payload.minSize, annotations));
function isMaxSize(maxSize, annotations) {
  maxSize = Math.max(0, Math.floor(maxSize));
  return makeFilter2((input) => input.size <= maxSize, {
    expected: `a value with a size of at most ${maxSize}`,
    representation: {
      id: "effect/schema/isMaxSize",
      payload: {
        maxSize
      }
    },
    toJsonSchema: () => ({}),
    toCode: () => ({
      runtime: `Schema.isMaxSize(${maxSize})`
    }),
    [STRUCTURAL_ANNOTATION_KEY]: true,
    arbitrary: {
      constraint: {
        maxLength: maxSize
      }
    },
    ...annotations
  });
}
var isMaxSizeReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isMaxSize", /* @__PURE__ */ Struct({
  maxSize: Natural
}), ({
  annotations,
  payload
}) => isMaxSize(payload.maxSize, annotations));
function isSizeBetween(minimum, maximum, annotations) {
  minimum = Math.max(0, Math.floor(minimum));
  maximum = Math.max(0, Math.floor(maximum));
  return makeFilter2((input) => input.size >= minimum && input.size <= maximum, {
    expected: minimum === maximum ? `a value with a size of ${minimum}` : `a value with a size between ${minimum} and ${maximum}`,
    representation: {
      id: "effect/schema/isSizeBetween",
      payload: {
        minimum,
        maximum
      }
    },
    toJsonSchema: () => ({}),
    toCode: () => ({
      runtime: `Schema.isSizeBetween(${minimum}, ${maximum})`
    }),
    [STRUCTURAL_ANNOTATION_KEY]: true,
    arbitrary: {
      constraint: {
        minLength: minimum,
        maxLength: maximum
      }
    },
    ...annotations
  });
}
var isSizeBetweenReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isSizeBetween", /* @__PURE__ */ Struct({
  minimum: Natural,
  maximum: Natural
}), ({
  annotations,
  payload
}) => isSizeBetween(payload.minimum, payload.maximum, annotations));
function isMinProperties(minProperties, annotations) {
  minProperties = Math.max(0, Math.floor(minProperties));
  return makeFilter2((input) => Reflect.ownKeys(input).length >= minProperties, {
    expected: `a value with at least ${minProperties === 1 ? "1 entry" : `${minProperties} entries`}`,
    representation: {
      id: "effect/schema/isMinProperties",
      payload: {
        minProperties
      }
    },
    toJsonSchema: () => ({
      minProperties
    }),
    toCode: () => ({
      runtime: `Schema.isMinProperties(${minProperties})`
    }),
    [STRUCTURAL_ANNOTATION_KEY]: true,
    arbitrary: {
      constraint: {
        minLength: minProperties
      }
    },
    ...annotations
  });
}
var isMinPropertiesReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isMinProperties", /* @__PURE__ */ Struct({
  minProperties: Natural
}), ({
  annotations,
  payload
}) => isMinProperties(payload.minProperties, annotations));
function isMaxProperties(maxProperties, annotations) {
  maxProperties = Math.max(0, Math.floor(maxProperties));
  return makeFilter2((input) => Reflect.ownKeys(input).length <= maxProperties, {
    expected: `a value with at most ${maxProperties === 1 ? "1 entry" : `${maxProperties} entries`}`,
    representation: {
      id: "effect/schema/isMaxProperties",
      payload: {
        maxProperties
      }
    },
    toJsonSchema: () => ({
      maxProperties
    }),
    toCode: () => ({
      runtime: `Schema.isMaxProperties(${maxProperties})`
    }),
    [STRUCTURAL_ANNOTATION_KEY]: true,
    arbitrary: {
      constraint: {
        maxLength: maxProperties
      }
    },
    ...annotations
  });
}
var isMaxPropertiesReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isMaxProperties", /* @__PURE__ */ Struct({
  maxProperties: Natural
}), ({
  annotations,
  payload
}) => isMaxProperties(payload.maxProperties, annotations));
function isPropertiesLengthBetween(minimum, maximum, annotations) {
  minimum = Math.max(0, Math.floor(minimum));
  maximum = Math.max(0, Math.floor(maximum));
  return makeFilter2((input) => Reflect.ownKeys(input).length >= minimum && Reflect.ownKeys(input).length <= maximum, {
    expected: minimum === maximum ? `a value with exactly ${minimum === 1 ? "1 entry" : `${minimum} entries`}` : `a value with between ${minimum} and ${maximum} entries`,
    representation: {
      id: "effect/schema/isPropertiesLengthBetween",
      payload: {
        minimum,
        maximum
      }
    },
    toJsonSchema: () => ({
      minProperties: minimum,
      maxProperties: maximum
    }),
    toCode: () => ({
      runtime: `Schema.isPropertiesLengthBetween(${minimum}, ${maximum})`
    }),
    [STRUCTURAL_ANNOTATION_KEY]: true,
    arbitrary: {
      constraint: {
        minLength: minimum,
        maxLength: maximum
      }
    },
    ...annotations
  });
}
var isPropertiesLengthBetweenReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isPropertiesLengthBetween", /* @__PURE__ */ Struct({
  minimum: Natural,
  maximum: Natural
}), ({
  annotations,
  payload
}) => isPropertiesLengthBetween(payload.minimum, payload.maximum, annotations));
function isPropertyNames(keySchema, annotations) {
  const propertyNames = toEncoded2(keySchema);
  const parser = _issue(propertyNames.ast);
  return makeFilter2((input, ast, options) => {
    const keys4 = Reflect.ownKeys(input);
    const issues = [];
    for (const key of keys4) {
      const issue = parser(key, options);
      if (issue !== undefined) {
        issues.push(new Pointer([key], issue));
        if (options.errors === "first")
          break;
      }
    }
    if (isArrayNonEmpty2(issues)) {
      return new Composite(ast, issues, input, options);
    }
    return true;
  }, {
    expected: "an object with property names matching the schema",
    representation: {
      id: "effect/schema/isPropertyNames",
      payload: null,
      schemas: [propertyNames.ast]
    },
    toJsonSchema: ({
      schemas
    }) => ({
      propertyNames: schemas[0]
    }),
    toCode: ({
      schemas
    }) => ({
      runtime: `Schema.isPropertyNames(${schemas[0].runtime})`
    }),
    [STRUCTURAL_ANNOTATION_KEY]: true,
    ...annotations
  });
}
var isPropertyNamesReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isPropertyNames", Null2, ({
  annotations,
  schemas
}) => isPropertyNames(schemas[0], annotations));
function isUnique(annotations) {
  return makeFilter2((input) => dedupe(input).length === input.length, {
    expected: "an array with unique items",
    representation: {
      id: "effect/schema/isUnique",
      payload: null
    },
    toJsonSchema: () => ({
      uniqueItems: true
    }),
    toCode: () => ({
      runtime: "Schema.isUnique()"
    }),
    arbitrary: {
      constraint: {
        unique: true
      }
    },
    ...annotations
  });
}
var isUniqueReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isUnique", Null2, ({
  annotations
}) => isUnique(annotations));
var NonEmptyString = /* @__PURE__ */ String5.check(/* @__PURE__ */ isNonEmpty());
var Char = /* @__PURE__ */ String5.check(/* @__PURE__ */ isLengthBetween(1, 1));
function Option(value3) {
  const schema = declareConstructor()([value3], ([value4]) => (input, ast, options) => {
    if (isOption2(input)) {
      if (isNone2(input)) {
        return succeedNone2;
      }
      return mapBothEager2(decodeUnknownEffect(value4)(input.value, options), {
        onSuccess: some2,
        onFailure: (issue) => makeCompositeAtKey(ast, "value", issue, input, options)
      });
    }
    return fail6(new InvalidType(ast, input, options));
  }, {
    representation: {
      id: "effect/schema/Option",
      payload: null
    },
    toCode: ({
      typeParameters
    }) => ({
      runtime: `Schema.Option(${typeParameters[0].runtime})`,
      Type: `Option.Option<${typeParameters[0].Type}>`,
      importDeclarations: [`import * as Option from "effect/Option"`]
    }),
    expected: "Option",
    toCodec: ([value4]) => link()(Union2([Struct({
      _tag: Literal2("Some"),
      value: value4
    }), Struct({
      _tag: Literal2("None")
    })]), transform2({
      decode: (e) => e._tag === "None" ? none2() : some2(e.value),
      encode: (o) => isSome2(o) ? {
        _tag: "Some",
        value: o.value
      } : {
        _tag: "None"
      }
    })),
    toArbitrary: ([value4]) => (fc, ctx) => {
      const terminal = fc.constant(none2());
      const arbitrary = fc.oneof(terminal, value4.arbitrary.map(some2));
      return withRecursion(fc, ctx, terminal, arbitrary);
    },
    toEquivalence: ([value4]) => makeEquivalence(value4),
    toFormatter: ([value4]) => match({
      onNone: () => "none()",
      onSome: (t) => `some(${value4(t)})`
    })
  });
  return make30(schema.ast, {
    value: value3
  });
}
var OptionReviver = /* @__PURE__ */ makeDeclarationReviver("effect/schema/Option", Null2, ({
  annotations,
  typeParameters
}) => {
  const schema = Option(typeParameters[0]);
  return annotations === undefined ? schema : schema.annotate(annotations);
});
function OptionFromNullOr(schema) {
  return NullOr(schema).pipe(decodeTo2(Option(toType2(schema)), optionFromNullOr()));
}
function OptionFromUndefinedOr(schema) {
  return UndefinedOr(schema).pipe(decodeTo2(Option(toType2(schema)), optionFromUndefinedOr()));
}
function OptionFromNullishOr(schema, options) {
  return NullishOr(schema).pipe(decodeTo2(Option(toType2(schema)), optionFromNullishOr(options)));
}
function OptionFromOptionalKey(schema) {
  return optionalKey2(schema).pipe(decodeTo2(Option(toType2(schema)), optionFromOptionalKey()));
}
function OptionFromOptional(schema) {
  return optional2(schema).pipe(decodeTo2(Option(toType2(schema)), optionFromOptional()));
}
function OptionFromOptionalNullOr(schema, options) {
  const onNoneEncoding = options === undefined ? "omit" : options.onNoneEncoding;
  const noneValue = onNoneEncoding === null ? null : undefined;
  return optional2(NullOr(schema)).pipe(decodeTo2(Option(toType2(schema)), transformOptional2({
    decode: (oe) => oe.pipe(filter(isNotNullish), some2),
    encode: onNoneEncoding === "omit" ? flatten : (ot) => some2(getOrElse(flatten(ot), () => noneValue))
  })));
}
function Result(success, failure) {
  const schema = declareConstructor()([success, failure], ([success2, failure2]) => (input, ast, options) => {
    if (!isResult2(input)) {
      return fail6(new InvalidType(ast, input, options));
    }
    switch (input._tag) {
      case "Success":
        return mapBothEager2(decodeEffect(success2)(input.success, options), {
          onSuccess: succeed2,
          onFailure: (issue) => makeCompositeAtKey(ast, "success", issue, input, options)
        });
      case "Failure":
        return mapBothEager2(decodeEffect(failure2)(input.failure, options), {
          onSuccess: fail2,
          onFailure: (issue) => makeCompositeAtKey(ast, "failure", issue, input, options)
        });
    }
  }, {
    representation: {
      id: "effect/schema/Result",
      payload: null
    },
    toCode: ({
      typeParameters
    }) => ({
      runtime: `Schema.Result(${typeParameters[0].runtime}, ${typeParameters[1].runtime})`,
      Type: `Result.Result<${typeParameters[0].Type}, ${typeParameters[1].Type}>`,
      importDeclarations: [`import * as Result from "effect/Result"`]
    }),
    expected: "Result",
    toCodec: ([success2, failure2]) => link()(Union2([Struct({
      _tag: Literal2("Success"),
      success: success2
    }), Struct({
      _tag: Literal2("Failure"),
      failure: failure2
    })]), transform2({
      decode: (e) => e._tag === "Success" ? succeed2(e.success) : fail2(e.failure),
      encode: (r) => isSuccess2(r) ? {
        _tag: "Success",
        success: r.success
      } : {
        _tag: "Failure",
        failure: r.failure
      }
    })),
    toArbitrary: ([success2, failure2]) => (fc, ctx) => {
      const terminal = oneOfArbitraries(fc, success2.terminal?.map((a) => succeed2(a)), failure2.terminal?.map((e) => fail2(e)));
      const arbitrary = fc.oneof(success2.arbitrary.map((a) => succeed2(a)), failure2.arbitrary.map((e) => fail2(e)));
      return withRecursion(fc, ctx, terminal, arbitrary);
    },
    toEquivalence: ([success2, failure2]) => makeEquivalence2(success2, failure2),
    toFormatter: ([success2, failure2]) => match3({
      onSuccess: (t) => `success(${success2(t)})`,
      onFailure: (t) => `failure(${failure2(t)})`
    })
  });
  return make30(schema.ast, {
    success,
    failure
  });
}
var ResultReviver = /* @__PURE__ */ makeDeclarationReviver("effect/schema/Result", Null2, ({
  annotations,
  typeParameters
}) => {
  const schema = Result(typeParameters[0], typeParameters[1]);
  return annotations === undefined ? schema : schema.annotate(annotations);
});
var RedactedOptionsPayload = /* @__PURE__ */ declare((input) => {
  if (!isObject(input)) {
    return false;
  }
  const keys4 = globalThis.Object.keys(input);
  return keys4.length > 0 && keys4.every((key) => {
    switch (key) {
      case "label":
        return typeof input[key] === "string";
      case "disallowJsonEncode":
        return input[key] === true;
      default:
        return false;
    }
  });
});
var RedactedRepresentationPayload = /* @__PURE__ */ Union2([Null2, RedactedOptionsPayload]);
function Redacted(value3, options) {
  const label = typeof options?.label === "string" ? options.label : undefined;
  const disallowJsonEncode = options?.disallowJsonEncode === true;
  const normalizedOptions = label !== undefined ? disallowJsonEncode ? {
    label,
    disallowJsonEncode: true
  } : {
    label
  } : disallowJsonEncode ? {
    disallowJsonEncode: true
  } : undefined;
  const decodeLabel = label !== undefined ? decodeUnknownEffect(Literal2(label)) : undefined;
  const schema = declareConstructor()([value3], ([value4]) => (input, ast, poptions) => {
    if (isRedacted(input)) {
      const label2 = decodeLabel !== undefined ? mapErrorEager2(decodeLabel(input.label, poptions), (issue) => new Pointer(["label"], issue)) : void_3;
      return flatMapEager2(label2, () => mapBothEager2(decodeUnknownEffect(value4)(value2(input), poptions), {
        onSuccess: () => input,
        onFailure: () => {
          return new Composite(ast, [new Pointer(["value"], new InvalidValue(undefined, input, poptions))], input, poptions);
        }
      }));
    }
    return fail6(new InvalidType(ast, input, poptions));
  }, {
    representation: {
      id: "effect/schema/Redacted",
      payload: normalizedOptions ?? null
    },
    toCode: ({
      typeParameters
    }) => ({
      runtime: normalizedOptions !== undefined ? `Schema.Redacted(${typeParameters[0].runtime}, ${format(normalizedOptions)})` : `Schema.Redacted(${typeParameters[0].runtime})`,
      Type: `Redacted.Redacted<${typeParameters[0].Type}>`,
      importDeclarations: [`import * as Redacted from "effect/Redacted"`]
    }),
    expected: "Redacted",
    toCodecJson: ([value4]) => link()(value4, {
      decode: transform((e) => make29(e, {
        label
      })),
      encode: disallowJsonEncode ? forbidden((oe) => "Cannot serialize Redacted" + (isSome2(oe) && typeof oe.value.label === "string" ? ` with label: "${oe.value.label}"` : "")) : transform(value2)
    }),
    toArbitrary: ([value4]) => () => ({
      arbitrary: value4.arbitrary.map((a) => make29(a, {
        label
      })),
      terminal: value4.terminal?.map((a) => make29(a, {
        label
      }))
    }),
    toFormatter: () => globalThis.String,
    toEquivalence: ([value4]) => makeEquivalence4(value4)
  });
  return make30(schema.ast, {
    value: value3
  });
}
var RedactedReviver = /* @__PURE__ */ makeDeclarationReviver("effect/schema/Redacted", RedactedRepresentationPayload, ({
  annotations,
  payload,
  typeParameters
}) => {
  const schema = Redacted(typeParameters[0], payload ?? undefined);
  return annotations === undefined ? schema : schema.annotate(annotations);
});
function RedactedFromValue(value3, options) {
  return decodeTo2(Redacted(toType2(value3), {
    label: options?.label,
    disallowJsonEncode: options?.disallowEncode
  }), {
    decode: transform((t) => make29(t, {
      label: options?.label
    })),
    encode: options?.disallowEncode ? forbidden((oe) => "Cannot encode Redacted" + (isSome2(oe) && typeof oe.value.label === "string" ? ` with label: "${oe.value.label}"` : "")) : transform(value2)
  })(value3);
}
function CauseReason(error, defect) {
  const schema = declareConstructor()([error, defect], ([error2, defect2]) => (input, ast, options) => {
    if (!isReason(input)) {
      return fail6(new InvalidType(ast, input, options));
    }
    switch (input._tag) {
      case "Fail":
        return mapBothEager2(decodeUnknownEffect(error2)(input.error, options), {
          onSuccess: makeFailReason,
          onFailure: (issue) => makeCompositeAtKey(ast, "error", issue, input, options)
        });
      case "Die":
        return mapBothEager2(decodeUnknownEffect(defect2)(input.defect, options), {
          onSuccess: makeDieReason,
          onFailure: (issue) => makeCompositeAtKey(ast, "defect", issue, input, options)
        });
      case "Interrupt":
        return succeed6(input);
    }
  }, {
    representation: {
      id: "effect/schema/CauseReason",
      payload: null
    },
    toCode: ({
      typeParameters
    }) => ({
      runtime: `Schema.CauseReason(${typeParameters[0].runtime}, ${typeParameters[1].runtime})`,
      Type: `Cause.Failure<${typeParameters[0].Type}, ${typeParameters[1].Type}>`,
      importDeclarations: [`import * as Cause from "effect/Cause"`]
    }),
    expected: "Cause.Failure",
    toCodec: ([error2, defect2]) => link()(Union2([Struct({
      _tag: Literal2("Fail"),
      error: error2
    }), Struct({
      _tag: Literal2("Die"),
      defect: defect2
    }), Struct({
      _tag: Literal2("Interrupt"),
      fiberId: UndefinedOr(Finite)
    })]), transform2({
      decode: (e) => {
        switch (e._tag) {
          case "Fail":
            return makeFailReason(e.error);
          case "Die":
            return makeDieReason(e.defect);
          case "Interrupt":
            return makeInterruptReason2(e.fiberId);
        }
      },
      encode: identity
    })),
    toArbitrary: ([error2, defect2]) => causeReasonToArbitrary(error2, defect2),
    toEquivalence: ([error2, defect2]) => causeReasonToEquivalence(error2, defect2),
    toFormatter: ([error2, defect2]) => causeReasonToFormatter(error2, defect2)
  });
  return make30(schema.ast, {
    error,
    defect
  });
}
var CauseReasonReviver = /* @__PURE__ */ makeDeclarationReviver("effect/schema/CauseReason", Null2, ({
  annotations,
  typeParameters
}) => {
  const schema = CauseReason(typeParameters[0], typeParameters[1]);
  return annotations === undefined ? schema : schema.annotate(annotations);
});
function causeReasonToArbitrary(error, defect) {
  return (fc, ctx) => {
    const terminal = fc.constant(makeInterruptReason2());
    const arbitrary = fc.oneof(terminal, fc.integer({
      min: 1
    }).map(makeInterruptReason2), error.arbitrary.map((e) => makeFailReason(e)), defect.arbitrary.map((d) => makeDieReason(d)));
    return withRecursion(fc, ctx, terminal, arbitrary);
  };
}
function causeReasonToEquivalence(error, defect) {
  return (a, b) => {
    if (a._tag !== b._tag)
      return false;
    switch (a._tag) {
      case "Fail":
        return error(a.error, b.error);
      case "Die":
        return defect(a.defect, b.defect);
      case "Interrupt":
        return a.fiberId === b.fiberId;
    }
  };
}
function causeReasonToFormatter(error, defect) {
  return (t) => {
    switch (t._tag) {
      case "Fail":
        return `Fail(${error(t.error)})`;
      case "Die":
        return `Die(${defect(t.defect)})`;
      case "Interrupt":
        return "Interrupt";
    }
  };
}
function Cause(error, defect) {
  const schema = declareConstructor()([error, defect], ([error2, defect2]) => {
    const failures = ArraySchema(CauseReason(error2, defect2));
    return (input, ast, options) => {
      if (!isCause2(input)) {
        return fail6(new InvalidType(ast, input, options));
      }
      return mapBothEager2(decodeUnknownEffect(failures)(input.reasons, options), {
        onSuccess: fromReasons,
        onFailure: (issue) => makeCompositeAtKey(ast, "failures", issue, input, options)
      });
    };
  }, {
    representation: {
      id: "effect/schema/Cause",
      payload: null
    },
    toCode: ({
      typeParameters
    }) => ({
      runtime: `Schema.Cause(${typeParameters[0].runtime}, ${typeParameters[1].runtime})`,
      Type: `Cause.Cause<${typeParameters[0].Type}, ${typeParameters[1].Type}>`,
      importDeclarations: [`import * as Cause from "effect/Cause"`]
    }),
    expected: "Cause",
    toCodec: ([error2, defect2]) => link()(ArraySchema(CauseReason(error2, defect2)), transform2({
      decode: fromReasons,
      encode: ({
        reasons: failures
      }) => failures
    })),
    toArbitrary: ([error2, defect2]) => causeToArbitrary(error2, defect2),
    toEquivalence: ([error2, defect2]) => causeToEquivalence(error2, defect2),
    toFormatter: ([error2, defect2]) => causeToFormatter(error2, defect2)
  });
  return make30(schema.ast, {
    error,
    defect
  });
}
var CauseReviver = /* @__PURE__ */ makeDeclarationReviver("effect/schema/Cause", Null2, ({
  annotations,
  typeParameters
}) => {
  const schema = Cause(typeParameters[0], typeParameters[1]);
  return annotations === undefined ? schema : schema.annotate(annotations);
});
function causeToArbitrary(error, defect) {
  return (fc, ctx) => {
    const reason = causeReasonToArbitrary(error, defect)(fc, ctx);
    const terminal = fc.constant(empty4);
    const arbitrary = fc.array(reason.arbitrary).map(fromReasons);
    return withRecursion(fc, ctx, terminal, arbitrary);
  };
}
function causeToEquivalence(error, defect) {
  const failures = Array_(causeReasonToEquivalence(error, defect));
  return (a, b) => failures(a.reasons, b.reasons);
}
function causeToFormatter(error, defect) {
  const causeReason = causeReasonToFormatter(error, defect);
  return (t) => `Cause([${t.reasons.map(causeReason).join(", ")}])`;
}
var ErrorOptionsPayload = /* @__PURE__ */ declare((input) => {
  if (!isObject(input)) {
    return false;
  }
  const keys4 = globalThis.Object.keys(input);
  return keys4.length > 0 && keys4.every((key) => (key === "includeStack" || key === "excludeCause") && input[key] === true);
});
var ErrorRepresentationPayload = /* @__PURE__ */ Union2([Null2, ErrorOptionsPayload]);
var getErrorOptionsKey = (options) => (options?.includeStack === true ? 1 : 0) | (options?.excludeCause === true ? 2 : 0);
var getErrorOptions = (key) => {
  switch (key) {
    case 0:
      return;
    case 1:
      return {
        includeStack: true
      };
    case 2:
      return {
        excludeCause: true
      };
    case 3:
      return {
        includeStack: true,
        excludeCause: true
      };
  }
};
var errorSchemaCache = [];
function ErrorInstance(options) {
  const key = getErrorOptionsKey(options);
  const cached3 = errorSchemaCache[key];
  if (cached3 !== undefined) {
    return cached3;
  }
  const normalizedOptions = getErrorOptions(key);
  const schema = instanceOf(globalThis.Error, {
    representation: {
      id: "effect/schema/Error",
      payload: normalizedOptions ?? null
    },
    toCode: () => ({
      runtime: normalizedOptions !== undefined ? `Schema.ErrorInstance(${format(normalizedOptions)})` : `Schema.ErrorInstance()`,
      Type: `globalThis.Error`
    }),
    expected: "Error",
    toCodecJson: () => link()(JsonError, errorFromJsonError(normalizedOptions)),
    toArbitrary: () => (fc) => fc.string().map((message) => new globalThis.Error(message))
  });
  errorSchemaCache[key] = schema;
  return schema;
}
var ErrorInstanceReviver = /* @__PURE__ */ makeDeclarationReviver("effect/schema/Error", ErrorRepresentationPayload, ({
  annotations,
  payload
}) => {
  const schema = ErrorInstance(payload ?? undefined);
  return annotations === undefined ? schema : schema.annotate(annotations);
});
var defectSchemaCache = [];
function Defect(options) {
  const key = getErrorOptionsKey(options);
  const cached3 = defectSchemaCache[key];
  if (cached3 !== undefined) {
    return cached3;
  }
  const schema = Json2.pipe(decodeTo2(Unknown2, defectFromJson(getErrorOptions(key))));
  defectSchemaCache[key] = schema;
  return schema;
}
function Exit(value3, error, defect) {
  const schema = declareConstructor()([value3, error, defect], ([value4, error2, defect2]) => {
    const cause = Cause(error2, defect2);
    return (input, ast, options) => {
      if (!isExit2(input)) {
        return fail6(new InvalidType(ast, input, options));
      }
      switch (input._tag) {
        case "Success":
          return mapBothEager2(decodeUnknownEffect(value4)(input.value, options), {
            onSuccess: succeed4,
            onFailure: (issue) => makeCompositeAtKey(ast, "value", issue, input, options)
          });
        case "Failure":
          return mapBothEager2(decodeUnknownEffect(cause)(input.cause, options), {
            onSuccess: failCause2,
            onFailure: (issue) => makeCompositeAtKey(ast, "cause", issue, input, options)
          });
      }
    };
  }, {
    representation: {
      id: "effect/schema/Exit",
      payload: null
    },
    toCode: ({
      typeParameters
    }) => ({
      runtime: `Schema.Exit(${typeParameters[0].runtime}, ${typeParameters[1].runtime}, ${typeParameters[2].runtime})`,
      Type: `Exit.Exit<${typeParameters[0].Type}, ${typeParameters[1].Type}, ${typeParameters[2].Type}>`,
      importDeclarations: [`import * as Exit from "effect/Exit"`]
    }),
    expected: "Exit",
    toCodec: ([value4, error2, defect2]) => link()(Union2([Struct({
      _tag: Literal2("Success"),
      value: value4
    }), Struct({
      _tag: Literal2("Failure"),
      cause: Cause(error2, defect2)
    })]), transform2({
      decode: (e) => e._tag === "Success" ? succeed4(e.value) : failCause2(e.cause),
      encode: (exit3) => isSuccess4(exit3) ? {
        _tag: "Success",
        value: exit3.value
      } : {
        _tag: "Failure",
        cause: exit3.cause
      }
    })),
    toArbitrary: ([value4, error2, defect2]) => (fc, ctx) => {
      const cause = causeToArbitrary(error2, defect2)(fc, ctx);
      const terminal = oneOfArbitraries(fc, value4.terminal?.map((v) => succeed4(v)), cause.terminal?.map((cause2) => failCause2(cause2)));
      const arbitrary = fc.oneof(value4.arbitrary.map((v) => succeed4(v)), cause.arbitrary.map((cause2) => failCause2(cause2)));
      return withRecursion(fc, ctx, terminal, arbitrary);
    },
    toEquivalence: ([value4, error2, defect2]) => {
      const cause = causeToEquivalence(error2, defect2);
      return (a, b) => {
        if (a._tag !== b._tag)
          return false;
        switch (a._tag) {
          case "Success":
            return value4(a.value, b.value);
          case "Failure":
            return cause(a.cause, b.cause);
        }
      };
    },
    toFormatter: ([value4, error2, defect2]) => {
      const cause = causeToFormatter(error2, defect2);
      return (t) => {
        switch (t._tag) {
          case "Success":
            return `Exit.Success(${value4(t.value)})`;
          case "Failure":
            return `Exit.Failure(${cause(t.cause)})`;
        }
      };
    }
  });
  return make30(schema.ast, {
    value: value3,
    error,
    defect
  });
}
var ExitReviver = /* @__PURE__ */ makeDeclarationReviver("effect/schema/Exit", Null2, ({
  annotations,
  typeParameters
}) => {
  const schema = Exit(typeParameters[0], typeParameters[1], typeParameters[2]);
  return annotations === undefined ? schema : schema.annotate(annotations);
});
function oneOfArbitraries(fc, a, b) {
  return a === undefined ? b : b === undefined ? a : fc.oneof(a, b);
}
function withRecursion(fc, ctx, terminal, arbitrary) {
  return {
    arbitrary: terminal === undefined || ctx.recursion === undefined ? arbitrary : fc.oneof(ctx.recursion, terminal, arbitrary),
    terminal
  };
}
function arrayFromItems(fc, item, constraints, comparator) {
  return comparator === undefined ? fc.array(item, constraints) : fc.uniqueArray(item, {
    ...constraints,
    comparator
  });
}
function collectionArbitrary(fc, ctx, item, terminalItem, fromIterable8, comparator) {
  const constraint = ctx.constraint;
  const constraints = constraint === undefined || constraint.minLength === undefined && constraint.maxLength === undefined ? undefined : {
    ...constraint.minLength !== undefined ? {
      minLength: constraint.minLength
    } : {},
    ...constraint.maxLength !== undefined ? {
      maxLength: constraint.maxLength
    } : {}
  };
  if (constraints?.minLength !== undefined && constraints.maxLength !== undefined && constraints.minLength > constraints.maxLength) {
    throw new globalThis.Error("Unable to derive an arbitrary for size constraints");
  }
  const minLength = constraints?.minLength ?? 0;
  const terminal = minLength === 0 ? fc.constant([]) : terminalItem === undefined ? undefined : arrayFromItems(fc, terminalItem, {
    ...constraints,
    maxLength: minLength
  }, comparator);
  const arrays = withRecursion(fc, ctx, terminal, arrayFromItems(fc, item, constraints, comparator));
  return {
    arbitrary: arrays.arbitrary.map(fromIterable8),
    terminal: arrays.terminal?.map(fromIterable8)
  };
}
function entriesArbitrary(fc, ctx, key, value3, fromIterable8) {
  return collectionArbitrary(fc, ctx, fc.tuple(key.arbitrary, value3.arbitrary), key.terminal === undefined || value3.terminal === undefined ? undefined : fc.tuple(key.terminal, value3.terminal), fromIterable8, ([a], [b]) => equals(a, b));
}
function ReadonlyMap(key, value3) {
  const schema = declareConstructor()([key, value3], ([key2, value4]) => {
    const array3 = ArraySchema(Tuple([key2, value4]));
    return (input, ast, options) => {
      if (input instanceof globalThis.Map) {
        return mapBothEager2(decodeUnknownEffect(array3)([...input], options), {
          onSuccess: (array4) => new globalThis.Map(array4),
          onFailure: (issue) => makeCompositeAtKey(ast, "entries", issue, input, options)
        });
      }
      return fail6(new InvalidType(ast, input, options));
    };
  }, {
    representation: {
      id: "effect/schema/ReadonlyMap",
      payload: null
    },
    toCode: ({
      typeParameters
    }) => ({
      runtime: `Schema.ReadonlyMap(${typeParameters[0].runtime}, ${typeParameters[1].runtime})`,
      Type: `globalThis.ReadonlyMap<${typeParameters[0].Type}, ${typeParameters[1].Type}>`
    }),
    expected: "ReadonlyMap",
    toCodec: ([key2, value4]) => link()(ArraySchema(Tuple([key2, value4])), transform2({
      decode: (e) => new globalThis.Map(e),
      encode: (map12) => [...map12.entries()]
    })),
    toArbitrary: ([key2, value4]) => (fc, ctx) => entriesArbitrary(fc, ctx, key2, value4, (as3) => new globalThis.Map(as3)),
    toEquivalence: ([key2, value4]) => makeCompareMap(key2, value4),
    toFormatter: ([key2, value4]) => (t) => {
      const size7 = t.size;
      if (size7 === 0) {
        return "ReadonlyMap(0) {}";
      }
      const entries3 = globalThis.Array.from(t.entries()).sort().map(([k, v]) => `${key2(k)} => ${value4(v)}`);
      return `ReadonlyMap(${size7}) { ${entries3.join(", ")} }`;
    }
  });
  return make30(schema.ast, {
    key,
    value: value3
  });
}
var ReadonlyMapReviver = /* @__PURE__ */ makeDeclarationReviver("effect/schema/ReadonlyMap", Null2, ({
  annotations,
  typeParameters
}) => {
  const schema = ReadonlyMap(typeParameters[0], typeParameters[1]);
  return annotations === undefined ? schema : schema.annotate(annotations);
});
function graphEncodedSchema(type, node, edge) {
  return Struct({
    type: Literal2(type),
    nodes: ArraySchema(Struct({
      index: Natural,
      data: node
    })),
    edges: ArraySchema(Struct({
      index: Natural,
      source: Natural,
      target: Natural,
      data: edge
    }))
  });
}
function graphDecode(input, options) {
  let previous = -1;
  const indexes = new Set;
  for (let i = 0;i < input.nodes.length; i++) {
    const index2 = input.nodes[i].index;
    if (index2 <= previous) {
      return fail6(new Pointer(["nodes", i, "index"], new InvalidValue({
        expected: "a strictly increasing node index"
      }, index2, options)));
    }
    previous = index2;
    indexes.add(index2);
  }
  previous = -1;
  for (let i = 0;i < input.edges.length; i++) {
    const edge = input.edges[i];
    if (edge.index <= previous) {
      return fail6(new Pointer(["edges", i, "index"], new InvalidValue({
        expected: "a strictly increasing edge index"
      }, edge.index, options)));
    }
    previous = edge.index;
    if (!indexes.has(edge.source)) {
      return fail6(new Pointer(["edges", i, "source"], new InvalidValue({
        expected: "an encoded node index"
      }, edge.source, options)));
    }
    if (!indexes.has(edge.target)) {
      return fail6(new Pointer(["edges", i, "target"], new InvalidValue({
        expected: "an encoded node index"
      }, edge.target, options)));
    }
  }
  return succeed6(hydrate(input));
}
function graphEncode(input, type, options) {
  if (!isGraph(input) || input.mutable || input.type !== type) {
    return fail6(new InvalidValue({
      expected: `an immutable ${type} Graph`
    }, input, options));
  }
  return succeed6(snapshot(input));
}
function graphToEquivalence(node, edge) {
  return (self, that) => {
    const a = snapshot(self);
    const b = snapshot(that);
    if (a.type !== b.type || a.nodes.length !== b.nodes.length || a.edges.length !== b.edges.length)
      return false;
    for (let i = 0;i < a.nodes.length; i++) {
      if (a.nodes[i].index !== b.nodes[i].index || !node(a.nodes[i].data, b.nodes[i].data))
        return false;
    }
    for (let i = 0;i < a.edges.length; i++) {
      const ae = a.edges[i];
      const be = b.edges[i];
      const sameEndpoints = a.type === "directed" ? ae.source === be.source && ae.target === be.target : ae.source === be.source && ae.target === be.target || ae.source === be.target && ae.target === be.source;
      if (ae.index !== be.index || !sameEndpoints || !edge(ae.data, be.data))
        return false;
    }
    return true;
  };
}
function graphToArbitrary(type, node, edge) {
  return (fc, ctx) => {
    const empty11 = hydrate({
      type,
      nodes: [],
      edges: []
    });
    const terminal = fc.constant(empty11);
    const arbitrary = fc.array(node.arbitrary).chain((values2) => {
      const nodes = values2.map((data, index2) => ({
        index: index2,
        data
      }));
      if (nodes.length === 0)
        return terminal;
      const endpoint = fc.integer({
        min: 0,
        max: nodes.length - 1
      });
      return fc.array(fc.tuple(endpoint, endpoint, edge.arbitrary)).map((values3) => hydrate({
        type,
        nodes,
        edges: values3.map(([source, target, data], index2) => ({
          index: index2,
          source,
          target,
          data
        }))
      }));
    });
    return withRecursion(fc, ctx, terminal, arbitrary);
  };
}
function Graph(type, node, edge) {
  const schema = declareConstructor()([node, edge], ([node2, edge2]) => {
    const encoded = graphEncodedSchema(type, node2, edge2);
    return (input, ast, options) => {
      if (!isGraph(input) || input.mutable || input.type !== type) {
        return fail6(new InvalidType(ast, input, options));
      }
      return flatMap5(decodeUnknownEffect(encoded)(snapshot(input), options), (snapshot2) => graphDecode(snapshot2, options));
    };
  }, {
    representation: {
      id: "effect/schema/Graph",
      payload: type
    },
    toCode: ({
      typeParameters
    }) => ({
      runtime: `Schema.Graph(${format(type)}, ${typeParameters[0].runtime}, ${typeParameters[1].runtime})`,
      Type: `Graph.Graph<${typeParameters[0].Type}, ${typeParameters[1].Type}, ${format(type)}>`,
      importDeclarations: [`import * as Graph from "effect/Graph"`]
    }),
    expected: `an immutable ${type} Graph`,
    toCodec: ([node2, edge2]) => link()(graphEncodedSchema(type, node2, edge2), transformOrFail2({
      decode: graphDecode,
      encode: (graph, options) => graphEncode(graph, type, options)
    })),
    toArbitrary: ([node2, edge2]) => graphToArbitrary(type, node2, edge2),
    toEquivalence: ([node2, edge2]) => graphToEquivalence(node2, edge2),
    toFormatter: () => globalThis.String
  });
  return make30(schema.ast, {
    type,
    node,
    edge
  });
}
var GraphReviver = /* @__PURE__ */ makeDeclarationReviver("effect/schema/Graph", /* @__PURE__ */ Literals(["directed", "undirected"]), ({
  annotations,
  payload,
  typeParameters
}) => {
  const schema = Graph(payload, typeParameters[0], typeParameters[1]);
  return annotations === undefined ? schema : schema.annotate(annotations);
});
function HashMap(key, value3) {
  const schema = declareConstructor()([key, value3], ([key2, value4]) => {
    const entries3 = ArraySchema(Tuple([key2, value4]));
    return (input, ast, options) => {
      if (isHashMap2(input)) {
        return mapBothEager2(decodeUnknownEffect(entries3)(toEntries(input), options), {
          onSuccess: fromIterable5,
          onFailure: (issue) => makeCompositeAtKey(ast, "entries", issue, input, options)
        });
      }
      return fail6(new InvalidType(ast, input, options));
    };
  }, {
    representation: {
      id: "effect/schema/HashMap",
      payload: null
    },
    toCode: ({
      typeParameters
    }) => ({
      runtime: `Schema.HashMap(${typeParameters[0].runtime}, ${typeParameters[1].runtime})`,
      Type: `HashMap.HashMap<${typeParameters[0].Type}, ${typeParameters[1].Type}>`,
      importDeclarations: [`import * as HashMap from "effect/HashMap"`]
    }),
    expected: "HashMap",
    toCodec: ([key2, value4]) => link()(ArraySchema(Tuple([key2, value4])), transform2({
      decode: fromIterable5,
      encode: toEntries
    })),
    toArbitrary: ([key2, value4]) => (fc, ctx) => entriesArbitrary(fc, ctx, key2, value4, fromIterable5),
    toEquivalence: ([key2, value4]) => makeCompareMap(key2, value4),
    toFormatter: ([key2, value4]) => (t) => {
      const size7 = size4(t);
      if (size7 === 0) {
        return "HashMap(0) {}";
      }
      const entries3 = toEntries(t).sort().map(([k, v]) => `${key2(k)} => ${value4(v)}`);
      return `HashMap(${size7}) { ${entries3.join(", ")} }`;
    }
  });
  return make30(schema.ast, {
    key,
    value: value3
  });
}
var HashMapReviver = /* @__PURE__ */ makeDeclarationReviver("effect/schema/HashMap", Null2, ({
  annotations,
  typeParameters
}) => {
  const schema = HashMap(typeParameters[0], typeParameters[1]);
  return annotations === undefined ? schema : schema.annotate(annotations);
});
function ReadonlySet(value3) {
  const schema = declareConstructor()([value3], ([value4]) => {
    const array3 = ArraySchema(value4);
    return (input, ast, options) => {
      if (input instanceof globalThis.Set) {
        return mapBothEager2(decodeUnknownEffect(array3)([...input], options), {
          onSuccess: (array4) => new globalThis.Set(array4),
          onFailure: (issue) => makeCompositeAtKey(ast, "values", issue, input, options)
        });
      }
      return fail6(new InvalidType(ast, input, options));
    };
  }, {
    representation: {
      id: "effect/schema/ReadonlySet",
      payload: null
    },
    toCode: ({
      typeParameters
    }) => ({
      runtime: `Schema.ReadonlySet(${typeParameters[0].runtime})`,
      Type: `globalThis.ReadonlySet<${typeParameters[0].Type}>`
    }),
    expected: "ReadonlySet",
    toCodec: ([value4]) => link()(ArraySchema(value4), transform2({
      decode: (e) => new globalThis.Set(e),
      encode: (set5) => [...set5.values()]
    })),
    toArbitrary: ([value4]) => (fc, ctx) => collectionArbitrary(fc, ctx, value4.arbitrary, value4.terminal, (as3) => new globalThis.Set(as3), equals),
    toEquivalence: ([value4]) => makeCompareSet(value4),
    toFormatter: ([value4]) => (t) => {
      const size7 = t.size;
      if (size7 === 0) {
        return "ReadonlySet(0) {}";
      }
      const values2 = globalThis.Array.from(t.values()).sort().map((v) => `${value4(v)}`);
      return `ReadonlySet(${size7}) { ${values2.join(", ")} }`;
    }
  });
  return make30(schema.ast, {
    value: value3
  });
}
var ReadonlySetReviver = /* @__PURE__ */ makeDeclarationReviver("effect/schema/ReadonlySet", Null2, ({
  annotations,
  typeParameters
}) => {
  const schema = ReadonlySet(typeParameters[0]);
  return annotations === undefined ? schema : schema.annotate(annotations);
});
function HashSet(value3) {
  const schema = declareConstructor()([value3], ([value4]) => {
    const values2 = ArraySchema(value4);
    return (input, ast, options) => {
      if (isHashSet2(input)) {
        return mapBothEager2(decodeUnknownEffect(values2)(fromIterable(input), options), {
          onSuccess: fromIterable7,
          onFailure: (issue) => makeCompositeAtKey(ast, "values", issue, input, options)
        });
      }
      return fail6(new InvalidType(ast, input, options));
    };
  }, {
    representation: {
      id: "effect/schema/HashSet",
      payload: null
    },
    toCode: ({
      typeParameters
    }) => ({
      runtime: `Schema.HashSet(${typeParameters[0].runtime})`,
      Type: `HashSet.HashSet<${typeParameters[0].Type}>`
    }),
    expected: "HashSet",
    toCodec: ([value4]) => link()(ArraySchema(value4), transform2({
      decode: fromIterable7,
      encode: fromIterable
    })),
    toArbitrary: ([value4]) => (fc, ctx) => collectionArbitrary(fc, ctx, value4.arbitrary, value4.terminal, fromIterable7, equals),
    toEquivalence: ([value4]) => makeCompareSet(value4),
    toFormatter: ([value4]) => (t) => {
      const size7 = size6(t);
      if (size7 === 0) {
        return "HashSet(0) {}";
      }
      const values2 = globalThis.Array.from(t).sort().map((v) => `${value4(v)}`);
      return `HashSet(${size7}) { ${values2.join(", ")} }`;
    }
  });
  return make30(schema.ast, {
    value: value3
  });
}
var HashSetReviver = /* @__PURE__ */ makeDeclarationReviver("effect/schema/HashSet", Null2, ({
  annotations,
  typeParameters
}) => {
  const schema = HashSet(typeParameters[0]);
  return annotations === undefined ? schema : schema.annotate(annotations);
});
function Chunk(value3) {
  const schema = declareConstructor()([value3], ([value4]) => {
    const values2 = ArraySchema(value4);
    return (input, ast, options) => {
      if (isChunk(input)) {
        return mapBothEager2(decodeUnknownEffect(values2)(fromIterable(input), options), {
          onSuccess: fromIterable2,
          onFailure: (issue) => makeCompositeAtKey(ast, "values", issue, input, options)
        });
      }
      return fail6(new InvalidType(ast, input, options));
    };
  }, {
    representation: {
      id: "effect/schema/Chunk",
      payload: null
    },
    toCode: ({
      typeParameters
    }) => ({
      runtime: `Schema.Chunk(${typeParameters[0].runtime})`,
      Type: `Chunk.Chunk<${typeParameters[0].Type}>`
    }),
    expected: "Chunk",
    toCodec: ([value4]) => link()(ArraySchema(value4), transform2({
      decode: fromIterable2,
      encode: fromIterable
    })),
    toArbitrary: ([value4]) => (fc, ctx) => collectionArbitrary(fc, ctx, value4.arbitrary, value4.terminal, fromIterable2),
    toEquivalence: ([value4]) => makeEquivalence3(value4),
    toFormatter: ([value4]) => (t) => {
      const size7 = size(t);
      if (size7 === 0) {
        return "Chunk(0) {}";
      }
      const values2 = globalThis.Array.from(t).sort().map((v) => `${value4(v)}`);
      return `Chunk(${size7}) { ${values2.join(", ")} }`;
    }
  });
  return make30(schema.ast, {
    value: value3
  });
}
var ChunkReviver = /* @__PURE__ */ makeDeclarationReviver("effect/schema/Chunk", Null2, ({
  annotations,
  typeParameters
}) => {
  const schema = Chunk(typeParameters[0]);
  return annotations === undefined ? schema : schema.annotate(annotations);
});
var RegExp3 = /* @__PURE__ */ instanceOf(globalThis.RegExp, {
  representation: {
    id: "effect/schema/RegExp",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.RegExp`,
    Type: `globalThis.RegExp`
  }),
  expected: "RegExp",
  toCodecJson: () => link()(Struct({
    source: String5,
    flags: String5
  }), transformOrFail2({
    decode: (e, options) => try_3({
      try: () => new globalThis.RegExp(e.source, e.flags),
      catch: () => new InvalidValue({
        expected: "valid RegExp source and flags"
      }, e, options)
    }),
    encode: (regExp) => succeed6({
      source: regExp.source,
      flags: regExp.flags
    })
  })),
  toArbitrary: () => (fc) => fc.tuple(fc.constantFrom(".", ".*", "\\d+", "\\w+", "[a-z]+", "[A-Z]+", "[0-9]+", "^[a-zA-Z0-9]+$", "^\\d{4}-\\d{2}-\\d{2}$"), fc.uniqueArray(fc.constantFrom("g", "i", "m", "s", "u", "y"), {
    minLength: 0,
    maxLength: 6
  }).map((flags) => flags.join(""))).map(([source, flags]) => new globalThis.RegExp(source, flags)),
  toEquivalence: () => (a, b) => a.source === b.source && a.flags === b.flags
});
var RegExpReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/RegExp", RegExp3);
var URLString = /* @__PURE__ */ String5.annotate({
  expected: "a string that will be decoded as a URL"
});
var URL2 = /* @__PURE__ */ instanceOf(globalThis.URL, {
  representation: {
    id: "effect/schema/URL",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.URL`,
    Type: `globalThis.URL`
  }),
  expected: "URL",
  toCodecJson: () => link()(URLString, urlFromString),
  toArbitrary: () => (fc) => fc.webUrl().map((s) => new globalThis.URL(s)),
  toEquivalence: () => (a, b) => a.toString() === b.toString()
});
var URLReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/URL", URL2);
var URLFromString = /* @__PURE__ */ URLString.pipe(/* @__PURE__ */ decodeTo2(URL2, urlFromString));
function dateArbitraryConstraints(ordered, base2, toDate2) {
  const out = {
    ...base2
  };
  if (ordered?.minimum !== undefined) {
    const minimum = toDate2 === undefined ? ordered.minimum : toDate2(ordered.minimum);
    const nextMin = ordered.exclusiveMinimum ? new globalThis.Date(minimum.getTime() + 1) : minimum;
    if (out.min === undefined || nextMin.getTime() > out.min.getTime()) {
      out.min = nextMin;
    }
  }
  if (ordered?.maximum !== undefined) {
    const maximum = toDate2 === undefined ? ordered.maximum : toDate2(ordered.maximum);
    const nextMax = ordered.exclusiveMaximum ? new globalThis.Date(maximum.getTime() - 1) : maximum;
    if (out.max === undefined || nextMax.getTime() < out.max.getTime()) {
      out.max = nextMax;
    }
  }
  return out;
}
var DateString = /* @__PURE__ */ String5.annotate({
  expected: "a string that will be decoded as a Date"
});
var Date4 = /* @__PURE__ */ declare((input) => input instanceof globalThis.Date && !globalThis.Number.isNaN(input.getTime()), {
  representation: {
    id: "effect/schema/Date",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.Date`,
    Type: `globalThis.Date`
  }),
  expected: "a valid Date",
  toCodecJson: () => link()(DateString, dateFromString),
  toArbitrary: () => (fc, ctx) => fc.date(dateArbitraryConstraints(ctx?.constraint?.ordered?.order === Date2 ? ctx.constraint.ordered : undefined, {
    noInvalidDate: true
  }))
});
var DateReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/Date", Date4);
var DateFromString = /* @__PURE__ */ DateString.pipe(/* @__PURE__ */ decodeTo2(Date4, dateFromString));
var DateFromMillis = /* @__PURE__ */ Int.pipe(/* @__PURE__ */ decodeTo2(Date4, dateFromMillis));
var Duration = /* @__PURE__ */ declare(isDuration, {
  representation: {
    id: "effect/schema/Duration",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.Duration`,
    Type: `Duration.Duration`,
    importDeclarations: [`import * as Duration from "effect/Duration"`]
  }),
  expected: "Duration",
  toCodecJson: () => link()(Union2([Struct({
    _tag: Literal2("Infinity")
  }), Struct({
    _tag: Literal2("NegativeInfinity")
  }), Struct({
    _tag: Literal2("Nanos"),
    value: BigInt5
  }), Struct({
    _tag: Literal2("Millis"),
    value: Int
  })]), transform2({
    decode: (e) => {
      switch (e._tag) {
        case "Infinity":
          return infinity;
        case "NegativeInfinity":
          return negativeInfinity;
        case "Nanos":
          return nanos(e.value);
        case "Millis":
          return millis(e.value);
      }
    },
    encode: (duration) => {
      switch (duration.value._tag) {
        case "Infinity":
          return {
            _tag: "Infinity"
          };
        case "NegativeInfinity":
          return {
            _tag: "NegativeInfinity"
          };
        case "Nanos":
          return {
            _tag: "Nanos",
            value: duration.value.nanos
          };
        case "Millis":
          return {
            _tag: "Millis",
            value: duration.value.millis
          };
      }
    }
  })),
  toArbitrary: () => (fc) => fc.oneof(fc.constant(infinity), fc.constant(negativeInfinity), fc.bigInt().map(nanos), fc.maxSafeInteger().map(millis)),
  toFormatter: () => globalThis.String,
  toEquivalence: () => Equivalence
});
var DurationReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/Duration", Duration);
var DurationString = /* @__PURE__ */ String5.annotate({
  expected: "a string that will be decoded as a Duration"
});
var DurationFromString = /* @__PURE__ */ DurationString.pipe(/* @__PURE__ */ decodeTo2(Duration, durationFromString));
var DurationFromNanos = /* @__PURE__ */ BigInt5.pipe(/* @__PURE__ */ decodeTo2(Duration, durationFromNanos));
var DurationFromMillis = /* @__PURE__ */ Number6.pipe(/* @__PURE__ */ decodeTo2(Duration, durationFromMillis));
var BigDecimalString = /* @__PURE__ */ String5.annotate({
  expected: "a string that will be decoded as a BigDecimal"
});
var bigDecimalDefaultMaxScale = 20;
var bigDecimalInvalidOrderedConstraintsError = "Unable to derive an arbitrary for the ordered BigDecimal constraints";
function bigDecimalScaleValueAtScale(bd, scale2) {
  return scale(bd, scale2).value;
}
function bigDecimalMinValueAtScale(minimum, scale2, excluded) {
  return excluded ? bigDecimalScaleValueAtScale(floor(minimum, scale2), scale2) + globalThis.BigInt(1) : bigDecimalScaleValueAtScale(ceil(minimum, scale2), scale2);
}
function bigDecimalMaxValueAtScale(maximum, scale2, excluded) {
  return excluded ? bigDecimalScaleValueAtScale(ceil(maximum, scale2), scale2) - globalThis.BigInt(1) : bigDecimalScaleValueAtScale(floor(maximum, scale2), scale2);
}
function bigDecimalMaxScale(ordered) {
  return Math.max(bigDecimalDefaultMaxScale, ordered.minimum?.scale ?? 0, ordered.maximum?.scale ?? 0, ordered.exclusiveMinimum && ordered.minimum !== undefined ? ordered.minimum.scale + 1 : 0, ordered.exclusiveMaximum && ordered.maximum !== undefined ? ordered.maximum.scale + 1 : 0);
}
function bigDecimalValueConstraintsAtScale(ordered, scale2) {
  const constraints = {};
  if (ordered.minimum !== undefined) {
    constraints.min = bigDecimalMinValueAtScale(ordered.minimum, scale2, ordered.exclusiveMinimum === true);
  }
  if (ordered.maximum !== undefined) {
    constraints.max = bigDecimalMaxValueAtScale(ordered.maximum, scale2, ordered.exclusiveMaximum === true);
  }
  if (constraints.min !== undefined && constraints.max !== undefined && constraints.min > constraints.max) {
    return;
  }
  return constraints;
}
function bigDecimalScaleConstraints(ordered) {
  const max5 = bigDecimalMaxScale(ordered);
  if (bigDecimalValueConstraintsAtScale(ordered, max5) === undefined) {
    throw new globalThis.Error(bigDecimalInvalidOrderedConstraintsError);
  }
  let min5 = 0;
  let high = max5;
  while (min5 < high) {
    const scale2 = min5 + Math.floor((high - min5) / 2);
    if (bigDecimalValueConstraintsAtScale(ordered, scale2) === undefined) {
      min5 = scale2 + 1;
    } else {
      high = scale2;
    }
  }
  return {
    min: min5,
    max: max5
  };
}
var BigDecimal = /* @__PURE__ */ declare(isBigDecimal, {
  representation: {
    id: "effect/schema/BigDecimal",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.BigDecimal`,
    Type: `BigDecimal.BigDecimal`,
    importDeclarations: [`import * as BigDecimal from "effect/BigDecimal"`]
  }),
  expected: "BigDecimal",
  toCodecJson: () => link()(BigDecimalString, bigDecimalFromString),
  toArbitrary: () => (fc, ctx) => {
    const ordered = ctx.constraint?.ordered?.order === Order2 ? ctx.constraint.ordered : undefined;
    if (ordered === undefined) {
      return fc.tuple(fc.bigInt(), fc.integer({
        min: 0,
        max: bigDecimalDefaultMaxScale
      })).map(([value3, scale2]) => make20(value3, scale2));
    }
    return fc.integer(bigDecimalScaleConstraints(ordered)).chain((scale2) => {
      const constraints = bigDecimalValueConstraintsAtScale(ordered, scale2);
      if (constraints === undefined) {
        throw new globalThis.Error(bigDecimalInvalidOrderedConstraintsError);
      }
      return fc.bigInt(constraints).map((value3) => make20(value3, scale2));
    });
  },
  toFormatter: () => (bd) => format2(bd),
  toEquivalence: () => Equivalence3
});
var BigDecimalReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/BigDecimal", BigDecimal);
var BigDecimalFromString = /* @__PURE__ */ BigDecimalString.pipe(/* @__PURE__ */ decodeTo2(BigDecimal, bigDecimalFromString));
var JsonString = /* @__PURE__ */ String5.annotate({
  expected: "a string that will be decoded as JSON",
  contentMediaType: "application/json"
});
function fromJsonString2(schema, options) {
  return JsonString.pipe(decodeTo2(schema, fromJsonString(options)));
}
var UnknownFromJsonString = /* @__PURE__ */ fromJsonString2(Unknown2);
var File = /* @__PURE__ */ instanceOf(globalThis.File, {
  representation: {
    id: "effect/schema/File",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.File`,
    Type: `globalThis.File`
  }),
  expected: "File",
  toCodecJson: () => link()(Struct({
    data: String5.check(isBase64()),
    type: String5,
    name: String5,
    lastModified: Int
  }), transformOrFail2({
    decode: (e, options) => match3(decodeBase64(e.data), {
      onFailure: () => fail6(new InvalidValue({
        expected: "a valid Base64 string"
      }, e.data, options)),
      onSuccess: (bytes) => {
        const buffer3 = new globalThis.Uint8Array(bytes);
        return succeed6(new globalThis.File([buffer3], e.name, {
          type: e.type,
          lastModified: e.lastModified
        }));
      }
    }),
    encode: (file, options) => tryPromise2({
      try: async () => {
        const bytes = new globalThis.Uint8Array(await file.arrayBuffer());
        return {
          data: encodeBase64(bytes),
          type: file.type,
          name: file.name,
          lastModified: file.lastModified
        };
      },
      catch: () => new InvalidValue({
        expected: "a readable File"
      }, file, options)
    })
  }))
});
var FileReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/File", File);
var FormData2 = /* @__PURE__ */ instanceOf(globalThis.FormData, {
  representation: {
    id: "effect/schema/FormData",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.FormData`,
    Type: `globalThis.FormData`
  }),
  expected: "FormData",
  toCodecJson: () => link()(ArraySchema(Tuple([String5, Union2([Struct({
    _tag: tag("String"),
    value: String5
  }), Struct({
    _tag: tag("File"),
    value: File
  })])])), transformOrFail2({
    decode: (e) => {
      const out = new globalThis.FormData;
      for (const [key, entry] of e) {
        out.append(key, entry.value);
      }
      return succeed6(out);
    },
    encode: (formData) => {
      return succeed6(globalThis.Array.from(formData.entries()).map(([key, value3]) => {
        if (typeof value3 === "string") {
          return [key, {
            _tag: "String",
            value: value3
          }];
        } else {
          return [key, {
            _tag: "File",
            value: value3
          }];
        }
      }));
    }
  }))
});
var FormDataReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/FormData", FormData2);
function fromFormData2(schema) {
  return FormData2.pipe(decodeTo2(schema, fromFormData));
}
var URLSearchParams2 = /* @__PURE__ */ instanceOf(globalThis.URLSearchParams, {
  representation: {
    id: "effect/schema/URLSearchParams",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.URLSearchParams`,
    Type: `globalThis.URLSearchParams`
  }),
  expected: "URLSearchParams",
  toCodecJson: () => link()(String5.annotate({
    expected: "a query string that will be decoded as URLSearchParams"
  }), transform2({
    decode: (e) => new globalThis.URLSearchParams(e),
    encode: (params) => params.toString()
  }))
});
var URLSearchParamsReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/URLSearchParams", URLSearchParams2);
function fromURLSearchParams2(schema) {
  return URLSearchParams2.pipe(decodeTo2(schema, fromURLSearchParams));
}
var NumberFromString = /* @__PURE__ */ String5.annotate({
  expected: "a string that will be decoded as a number"
}).pipe(/* @__PURE__ */ decodeTo2(Number6, numberFromString));
var FiniteFromString = /* @__PURE__ */ String5.annotate({
  expected: "a string that will be decoded as a finite number"
}).pipe(/* @__PURE__ */ decodeTo2(Finite, numberFromString));
var BigIntFromString = /* @__PURE__ */ make30(bigIntString).pipe(/* @__PURE__ */ decodeTo2(BigInt5, bigintFromString));
var Trimmed = /* @__PURE__ */ String5.check(/* @__PURE__ */ isTrimmed());
var Trim = /* @__PURE__ */ String5.annotate({
  expected: "a string that will be decoded as a trimmed string"
}).pipe(/* @__PURE__ */ decodeTo2(Trimmed, /* @__PURE__ */ trim3()));
var StringFromBase64 = /* @__PURE__ */ String5.annotate({
  expected: "a base64 encoded string that will be decoded as a UTF-8 string"
}).pipe(/* @__PURE__ */ decodeTo2(String5, stringFromBase64String));
var StringFromBase64Url = /* @__PURE__ */ String5.annotate({
  expected: "a base64 (URL) encoded string that will be decoded as a UTF-8 string"
}).pipe(/* @__PURE__ */ decodeTo2(String5, stringFromBase64UrlString));
var StringFromHex = /* @__PURE__ */ String5.annotate({
  expected: "a hex encoded string that will be decoded as a UTF-8 string"
}).pipe(/* @__PURE__ */ decodeTo2(String5, stringFromHexString));
var StringFromUriComponent = /* @__PURE__ */ String5.annotate({
  expected: "a URI component encoded string that will be decoded as a UTF-8 string"
}).pipe(/* @__PURE__ */ decodeTo2(String5, stringFromUriComponent));
var PropertyKey = /* @__PURE__ */ Union2([Finite, Symbol3, String5]);
var StandardSchemaV1FailureResult = /* @__PURE__ */ Struct({
  issues: /* @__PURE__ */ ArraySchema(/* @__PURE__ */ Struct({
    message: String5,
    path: /* @__PURE__ */ optional2(/* @__PURE__ */ ArraySchema(/* @__PURE__ */ Union2([PropertyKey, /* @__PURE__ */ Struct({
      key: PropertyKey
    })])))
  }))
});
var BooleanFromBit = /* @__PURE__ */ Literals([0, 1]).pipe(/* @__PURE__ */ decodeTo2(Boolean3, /* @__PURE__ */ transform2({
  decode: (bit) => bit === 1,
  encode: (bool) => bool ? 1 : 0
})));
var Base64String = /* @__PURE__ */ String5.annotate({
  expected: "a base64 encoded string that will be decoded as Uint8Array",
  format: "byte",
  contentEncoding: "base64"
});
var Uint8Array2 = /* @__PURE__ */ instanceOf(globalThis.Uint8Array, {
  representation: {
    id: "effect/schema/Uint8Array",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.Uint8Array`,
    Type: `globalThis.Uint8Array`
  }),
  expected: "Uint8Array",
  toCodecJson: () => link()(Base64String, uint8ArrayFromBase64String),
  toArbitrary: () => (fc) => fc.uint8Array()
});
var Uint8ArrayReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/Uint8Array", Uint8Array2);
var Uint8ArrayFromBase64 = /* @__PURE__ */ Base64String.pipe(/* @__PURE__ */ decodeTo2(Uint8Array2, uint8ArrayFromBase64String));
var Uint8ArrayFromBase64Url = /* @__PURE__ */ String5.annotate({
  expected: "a base64 (URL) encoded string that will be decoded as a Uint8Array"
}).pipe(/* @__PURE__ */ decodeTo2(Uint8Array2, {
  decode: /* @__PURE__ */ decodeBase64Url2(),
  encode: /* @__PURE__ */ encodeBase64Url2()
}));
var Uint8ArrayFromHex = /* @__PURE__ */ String5.annotate({
  expected: "a hex encoded string that will be decoded as a Uint8Array"
}).pipe(/* @__PURE__ */ decodeTo2(Uint8Array2, {
  decode: /* @__PURE__ */ decodeHex2(),
  encode: /* @__PURE__ */ encodeHex2()
}));
var DateTimeUtc = /* @__PURE__ */ declare((u) => isDateTime2(u) && isUtc2(u), {
  representation: {
    id: "effect/schema/DateTimeUtc",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.DateTimeUtc`,
    Type: `DateTime.Utc`,
    importDeclarations: [`import * as DateTime from "effect/DateTime"`]
  }),
  expected: "DateTime.Utc",
  toCodecJson: () => link()(String5, dateTimeUtcFromString),
  toArbitrary: () => (fc, ctx) => fc.date(dateArbitraryConstraints(ctx?.constraint?.ordered?.order === Order3 ? ctx.constraint.ordered : undefined, {
    noInvalidDate: true
  }, toDateUtc2)).map((date) => fromDateUnsafe2(date)),
  toFormatter: () => (utc) => utc.toString(),
  toEquivalence: () => Equivalence4
});
var DateTimeUtcReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/DateTimeUtc", DateTimeUtc);
var DateTimeUtcFromDate = /* @__PURE__ */ Date4.pipe(/* @__PURE__ */ decodeTo2(DateTimeUtc, {
  decode: /* @__PURE__ */ dateTimeUtcFromInput(),
  encode: /* @__PURE__ */ transform(toDateUtc2)
}));
var DateTimeUtcFromString = /* @__PURE__ */ String5.annotate({
  expected: "a string that will be decoded as a DateTime.Utc"
}).pipe(/* @__PURE__ */ decodeTo2(DateTimeUtc, dateTimeUtcFromString));
var DateTimeUtcFromMillis = /* @__PURE__ */ Int.pipe(/* @__PURE__ */ decodeTo2(DateTimeUtc, {
  decode: /* @__PURE__ */ dateTimeUtcFromInput(),
  encode: /* @__PURE__ */ transform(toEpochMillis2)
}));
var TimeZoneOffset = /* @__PURE__ */ declare(isTimeZoneOffset2, {
  representation: {
    id: "effect/schema/TimeZoneOffset",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.TimeZoneOffset`,
    Type: `DateTime.TimeZone.Offset`,
    importDeclarations: [`import * as DateTime from "effect/DateTime"`]
  }),
  expected: "DateTime.TimeZone.Offset",
  toCodecJson: () => link()(Int, timeZoneOffsetFromNumber),
  toArbitrary: () => (fc) => fc.integer({
    min: -12 * 60 * 60 * 1000,
    max: 14 * 60 * 60 * 1000
  }).map((n) => zoneMakeOffset2(n)),
  toFormatter: () => (tz) => zoneToString2(tz),
  toEquivalence: () => (a, b) => a.offset === b.offset
});
var TimeZoneOffsetReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/TimeZoneOffset", TimeZoneOffset);
var TimeZoneNamedString = /* @__PURE__ */ String5.annotate({
  expected: "an IANA time zone identifier"
});
var TimeZoneNamed = /* @__PURE__ */ declare(isTimeZoneNamed2, {
  representation: {
    id: "effect/schema/TimeZoneNamed",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.TimeZoneNamed`,
    Type: `DateTime.TimeZone.Named`,
    importDeclarations: [`import * as DateTime from "effect/DateTime"`]
  }),
  expected: "DateTime.TimeZone.Named",
  toCodecJson: () => link()(TimeZoneNamedString, timeZoneNamedFromString),
  toArbitrary: () => (fc) => fc.constantFrom(...["UTC", "Europe/London", "America/New_York", "Asia/Tokyo", "Australia/Sydney"].map(zoneMakeNamedUnsafe2)),
  toFormatter: () => (tz) => zoneToString2(tz),
  toEquivalence: () => (a, b) => a.id === b.id
});
var TimeZoneNamedReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/TimeZoneNamed", TimeZoneNamed);
var TimeZoneNamedFromString = /* @__PURE__ */ TimeZoneNamedString.pipe(/* @__PURE__ */ decodeTo2(TimeZoneNamed, timeZoneNamedFromString));
var TimeZoneString = /* @__PURE__ */ String5.annotate({
  expected: "a time zone string (IANA identifier or offset like +03:00)"
});
var TimeZone = /* @__PURE__ */ declare(isTimeZone2, {
  representation: {
    id: "effect/schema/TimeZone",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.TimeZone`,
    Type: `DateTime.TimeZone`,
    importDeclarations: [`import * as DateTime from "effect/DateTime"`]
  }),
  expected: "DateTime.TimeZone",
  toCodecJson: () => link()(TimeZoneString, timeZoneFromString),
  toArbitrary: () => (fc) => fc.oneof(fc.integer({
    min: -12 * 60 * 60 * 1000,
    max: 14 * 60 * 60 * 1000
  }).map((n) => zoneMakeOffset2(n)), fc.constantFrom(...["UTC", "Europe/London", "America/New_York", "Asia/Tokyo", "Australia/Sydney"].map(zoneMakeNamedUnsafe2))),
  toFormatter: () => (tz) => zoneToString2(tz),
  toEquivalence: () => (a, b) => zoneToString2(a) === zoneToString2(b)
});
var TimeZoneReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/TimeZone", TimeZone);
var TimeZoneFromString = /* @__PURE__ */ TimeZoneString.pipe(/* @__PURE__ */ decodeTo2(TimeZone, timeZoneFromString));
var DateTimeZonedString = /* @__PURE__ */ String5.annotate({
  expected: "a zoned DateTime string (e.g. 2024-01-01T00:00:00.000+00:00[Europe/London])"
});
var DateTimeZoned = /* @__PURE__ */ declare((u) => isDateTime2(u) && isZoned2(u), {
  representation: {
    id: "effect/schema/DateTimeZoned",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.DateTimeZoned`,
    Type: `DateTime.Zoned`,
    importDeclarations: [`import * as DateTime from "effect/DateTime"`]
  }),
  expected: "DateTime.Zoned",
  toCodecJson: () => link()(DateTimeZonedString, dateTimeZonedFromString),
  toArbitrary: () => (fc, ctx) => fc.tuple(fc.date(dateArbitraryConstraints(ctx?.constraint?.ordered?.order === Order3 ? ctx.constraint.ordered : undefined, {
    max: new globalThis.Date(8640000000000000 - 14 * 60 * 60 * 1000),
    min: new globalThis.Date(-8640000000000000 + 14 * 60 * 60 * 1000),
    noInvalidDate: true
  }, toDateUtc2)), fc.constantFrom("UTC", "Europe/London", "America/New_York", "Asia/Tokyo", "Australia/Sydney")).map(([date, zone]) => makeZonedUnsafe2(date, {
    timeZone: zone
  })),
  toFormatter: () => (zoned) => formatIsoZoned2(zoned),
  toEquivalence: () => Equivalence4
});
var DateTimeZonedReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/DateTimeZoned", DateTimeZoned);
var DateTimeZonedFromString = /* @__PURE__ */ DateTimeZonedString.pipe(/* @__PURE__ */ decodeTo2(DateTimeZoned, dateTimeZonedFromString));
var immerable = /* @__PURE__ */ globalThis.Symbol.for("immer-draftable");
var payloadToken = {};
function makeClass(Inherited, identifier2, struct2, annotations, proto) {
  const getClassSchema = getClassSchemaFactory(struct2, identifier2, annotations);
  const ClassTypeId = getClassTypeId(identifier2);
  const out = class extends Inherited {
    constructor(...[input, options]) {
      const internalOptions = options;
      const payload = internalOptions?.["~payload"];
      const value3 = payload?.token === payloadToken ? payload.value : struct2.make(input ?? {}, options);
      super(value3, {
        ...options,
        disableChecks: true,
        "~payload": {
          token: payloadToken,
          value: value3
        }
      });
    }
    static [TypeId35] = TypeId35;
    get [ClassTypeId]() {
      return ClassTypeId;
    }
    static [immerable] = true;
    static identifier = identifier2;
    static fields = struct2.fields;
    static get ast() {
      return getClassSchema(this).ast;
    }
    static pipe() {
      return pipeArguments(this, arguments);
    }
    static rebuild(ast) {
      return getClassSchema(this).rebuild(ast);
    }
    static make(input, options) {
      return new this(input, options);
    }
    static makeOption(input, options) {
      return makeOption(getClassSchema(this))(input ?? {}, options);
    }
    static makeEffect(input, options) {
      return getClassSchema(this).makeEffect(input ?? {}, options);
    }
    static annotate(annotations2) {
      return this.rebuild(annotate(this.ast, annotations2));
    }
    static annotateKey(annotations2) {
      return this.rebuild(annotateKey(this.ast, annotations2));
    }
    static check(...checks) {
      return this.rebuild(appendChecks(this.ast, checks));
    }
    static extend(identifier3) {
      return (schema, annotations2) => {
        const extension = isStruct(schema) ? schema : Struct(schema);
        const fields = {
          ...struct2.fields,
          ...extension.fields
        };
        const ast = struct(fields, struct2.ast.checks, {
          identifier: identifier3
        });
        return makeClass(this, identifier3, makeStruct(appendChecks(ast, extension.ast.checks), fields), annotations2, proto);
      };
    }
    static mapFields(f, options) {
      return struct2.mapFields(f, options);
    }
  };
  if (proto !== undefined) {
    Object.assign(out.prototype, proto(identifier2));
  }
  return out;
}
function getClassTransformation(self) {
  return new Transformation(transform((input) => new self(input, {
    "~payload": {
      token: payloadToken,
      value: input
    }
  })), passthrough2());
}
function getClassTypeId(identifier2) {
  return `~effect/Schema/Class/${identifier2}`;
}
function getClassSchemaFactory(from, identifier2, annotations) {
  let memo;
  return (self) => {
    if (memo !== undefined) {
      return memo;
    }
    const ClassTypeId = getClassTypeId(identifier2);
    const isClassValue = (input) => input instanceof self || hasProperty(input, ClassTypeId);
    const transformation = getClassTransformation(self);
    const to = make30(new Declaration([from.ast], () => (input, ast, options) => {
      return isClassValue(input) ? succeed6(input) : fail6(new InvalidType(ast, input, options));
    }, {
      identifier: identifier2,
      [CONSTRUCTOR_ANNOTATION_KEY]: ([from2]) => ({
        isConstructed: isClassValue,
        link: new Link(from2, transformation)
      }),
      toCodec: ([from2]) => new Link(from2.ast, transformation),
      toArbitrary: ([from2]) => () => ({
        arbitrary: from2.arbitrary.map((args2) => new self(args2)),
        terminal: from2.terminal?.map((args2) => new self(args2))
      }),
      toFormatter: ([from2]) => (t) => `${self.identifier}(${from2(t)})`,
      [SENTINELS_ANNOTATION_KEY]: collectSentinels(from.ast),
      ...annotations
    }));
    return memo = decodeTo2(to, transformation)(from);
  };
}
function isStruct(schema) {
  return isSchema(schema);
}
var Class4 = (identifier2) => (schema, annotations) => {
  const struct2 = isStruct(schema) ? schema : Struct(schema);
  return makeClass(Class3, identifier2, struct2, annotations, (identifier3) => ({
    toString() {
      return `${identifier3}(${format({
        ...this
      })})`;
    }
  }));
};
var TaggedClass = (identifier2) => {
  return (tagValue, schema, annotations) => {
    const struct2 = isStruct(schema) ? schema.mapFields((fields) => ({
      _tag: tag(tagValue),
      ...fields
    }), {
      unsafePreserveChecks: true
    }) : TaggedStruct(tagValue, schema);
    return Class4(identifier2 ?? tagValue)(struct2, annotations);
  };
};
var Error4 = (identifier2) => (schema, annotations) => {
  const struct2 = isStruct(schema) ? schema : Struct(schema);
  const self = makeClass(Error2, identifier2, struct2, annotations, (identifier3) => ({
    name: identifier3
  }));
  return self;
};
var TaggedError3 = (identifier2) => {
  return (tagValue, schema, annotations) => {
    const struct2 = isStruct(schema) ? schema.mapFields((fields) => ({
      _tag: tag(tagValue),
      ...fields
    }), {
      unsafePreserveChecks: true
    }) : TaggedStruct(tagValue, schema);
    return Error4(identifier2 ?? tagValue)(struct2, annotations);
  };
};
function toArbitrary(schema) {
  const lawc = memoized(schema.ast);
  return (fc) => lawc(fc, {});
}
function overrideToFormatter(toFormatter) {
  return (self) => {
    return self.annotate({
      toFormatter
    });
  };
}
function toFormatter(schema, options) {
  return recur3(schema.ast);
  function recur3(ast) {
    const annotation = resolve(ast)?.["toFormatter"];
    if (typeof annotation === "function") {
      return annotation(isDeclaration(ast) ? ast.typeParameters.map(recur3) : []);
    }
    if (options?.onBefore) {
      const onBefore = options.onBefore(ast, recur3);
      if (onBefore !== undefined) {
        return onBefore;
      }
    }
    return on(ast);
  }
  function on(ast) {
    switch (ast._tag) {
      default:
        return format;
      case "Never":
        return () => "never";
      case "Void":
        return () => "void";
      case "Arrays": {
        const elements = ast.elements.map(recur3);
        const rest = ast.rest.map(recur3);
        return (t) => {
          const out = [];
          let i = 0;
          for (;i < elements.length; i++) {
            if (t.length < i + 1) {
              if (isOptional(ast.elements[i])) {
                continue;
              }
            } else {
              out.push(elements[i](t[i]));
            }
          }
          if (rest.length > 0) {
            const [head3, ...tail] = rest;
            for (;i < t.length - tail.length; i++) {
              out.push(head3(t[i]));
            }
            for (let j = 0;j < tail.length; j++) {
              out.push(tail[j](t[i + j]));
            }
          }
          return "[" + out.join(", ") + "]";
        };
      }
      case "Objects": {
        const propertySignatures = ast.propertySignatures.map((ps) => recur3(ps.type));
        const indexSignatures = ast.indexSignatures.map((is3) => recur3(is3.type));
        if (ast.propertySignatures.length === 0 && ast.indexSignatures.length === 0) {
          return format;
        }
        return (t) => {
          const out = [];
          const visited = new Set;
          for (let i = 0;i < propertySignatures.length; i++) {
            const ps = ast.propertySignatures[i];
            const name = ps.name;
            visited.add(name);
            if (isOptional(ps.type) && !Object.hasOwn(t, name)) {
              continue;
            }
            out.push(`${formatPropertyKey(name)}: ${propertySignatures[i](t[name])}`);
          }
          for (let i = 0;i < indexSignatures.length; i++) {
            const keys4 = getIndexSignatureKeys(t, ast.indexSignatures[i].parameter);
            for (const key of keys4) {
              if (visited.has(key)) {
                continue;
              }
              visited.add(key);
              out.push(`${formatPropertyKey(key)}: ${indexSignatures[i](t[key])}`);
            }
          }
          return out.length > 0 ? "{ " + out.join(", ") + " }" : "{}";
        };
      }
      case "Union": {
        const types = toType(ast).types;
        const getCandidates2 = (t) => getCandidates(t, types);
        const compiled = new Map(types.map((candidate, i) => [candidate, [_is(candidate), recur3(ast.types[i])]]));
        return (t) => {
          const candidates = getCandidates2(t);
          for (let i = 0;i < candidates.length; i++) {
            const [is3, formatter] = compiled.get(candidates[i]);
            if (is3(t)) {
              return formatter(t);
            }
          }
          return format(t);
        };
      }
      case "Suspend": {
        const get10 = memoizeThunk(() => recur3(ast.thunk()));
        return (t) => get10()(t);
      }
    }
  }
}
function overrideToEquivalence(toEquivalence2) {
  return (self) => self.annotate({
    toEquivalence: toEquivalence2
  });
}
function toEquivalence2(schema) {
  return toEquivalence(schema.ast);
}
function toRepresentation2(schema, options) {
  return toRepresentation(schema.ast, options);
}
function toJsonSchemaDocument2(schema, options) {
  const document = toRepresentation(toCodecJsonAST(schema.ast), options);
  return toJsonSchemaDocument(document, options);
}
function toCodecJson(schema) {
  return make30(toCodecJsonAST(schema.ast), {
    schema
  });
}
var toCodecJsonAST = /* @__PURE__ */ applyToSelfOrLastLinkEncodingIdempotent((ast) => {
  const out = toCodecJsonASTStep(ast, toCodecJsonAST);
  const context3 = ast.context;
  if (out === ast || context3 === undefined)
    return out;
  return replaceContextLastLink(out, withoutConstructorDefault(context3));
});
function withoutConstructorDefault(context3) {
  return context3.constructorDefault === undefined ? context3 : new Context(context3.isOptional, context3.isMutable, undefined, context3.annotations);
}
function validateCanonicalObjectPropertyNames(ast) {
  if (ast.propertySignatures.some((ps) => typeof ps.name !== "string")) {
    throw new globalThis.Error("Objects property names must be strings", {
      cause: ast
    });
  }
}
function makeReorder(getPriority) {
  return (types) => {
    const indexMap = new Map;
    for (let i = 0;i < types.length; i++) {
      indexMap.set(toEncoded(types[i]), i);
    }
    const sortedTypes = [...types].sort((a, b) => {
      a = toEncoded(a);
      b = toEncoded(b);
      const pa = getPriority(a);
      const pb = getPriority(b);
      if (pa !== pb)
        return pa - pb;
      return indexMap.get(a) - indexMap.get(b);
    });
    const orderChanged = sortedTypes.some((ast, index2) => ast !== types[index2]);
    if (!orderChanged)
      return types;
    return sortedTypes;
  };
}
var toCodecJsonReorder = /* @__PURE__ */ makeReorder((ast) => {
  switch (ast._tag) {
    case "BigInt":
    case "Symbol":
    case "UniqueSymbol":
      return 0;
    default:
      return 1;
  }
});
function toCodecJsonASTStep(ast, recur3) {
  switch (ast._tag) {
    case "Declaration": {
      const getLink = ast.annotations?.toCodecJson ?? ast.annotations?.toCodec;
      if (!isFunction(getLink)) {
        return replaceEncoding(ast, [unknownToJson]);
      }
      const typeParameters = ast.typeParameters.map((tp) => make27(toEncoded(tp)));
      const link2 = getLink(typeParameters);
      return link2 === undefined ? ast : replaceEncoding(ast, [mapLink(link2, recur3)]);
    }
    case "Unknown":
      return replaceEncoding(ast, [unknownToJson]);
    case "ObjectKeyword":
      return replaceEncoding(ast, [objectKeywordToJson]);
    case "Undefined":
    case "Void":
    case "Literal":
    case "Number":
      return ast.toCodecJson();
    case "UniqueSymbol":
    case "Symbol":
    case "BigInt":
      return ast.toCodecStringTree();
    case "Objects": {
      validateCanonicalObjectPropertyNames(ast);
      return ast.recur(recur3, parameterFromString);
    }
    case "Union": {
      const sortedTypes = toCodecJsonReorder(ast.types);
      if (sortedTypes !== ast.types) {
        return new Union(sortedTypes, ast.mode, ast.annotations, ast.checks, ast.encoding, ast.context, ast.encodingChecks).recur(recur3);
      }
      return ast.recur(recur3);
    }
    case "Arrays":
    case "Suspend":
      return ast.recur(recur3);
  }
  return ast;
}
function toCodecIso(schema) {
  return make30(toCodecIsoAST(toType(schema.ast)));
}
var toCodecIsoAST = /* @__PURE__ */ memoize((ast) => {
  const out = toCodecIsoASTStep(ast, toCodecIsoAST);
  return out !== ast && ast.context !== undefined ? replaceContextLastLink(out, withoutConstructorDefault(ast.context)) : out;
});
function toCodecIsoASTStep(ast, recur3) {
  switch (ast._tag) {
    case "Declaration": {
      const getLink = ast.annotations?.toCodecIso ?? ast.annotations?.toCodec;
      if (isFunction(getLink)) {
        const link2 = getLink(ast.typeParameters.map((tp) => make27(tp)));
        return replaceEncoding(ast, [mapLink(link2, recur3)]);
      }
      return ast;
    }
    case "Arrays":
    case "Objects":
    case "Union":
    case "Suspend":
      return ast.recur(recur3);
  }
  return ast;
}
function toCodecStringTree(schema) {
  return make30(toCodecStringTreeAST(schema.ast), {
    schema
  });
}
function toCodecArrayFromSingle(schema) {
  return make30(toCodecArrayFromSingleAST(schema.ast));
}
function toEncoderXml(codec, options) {
  const rootName = resolveIdentifier(codec.ast) ?? resolveTitle(codec.ast);
  const serialize = encodeEffect(toCodecStringTree(codec));
  return (t) => serialize(t).pipe(map7((stringTree) => stringTreeToXml(stringTree, {
    rootName,
    ...options
  })));
}
function stringTreeToXml(value3, options) {
  const rootName = options.rootName ?? "root";
  const arrayItemName = options.arrayItemName ?? "item";
  const pretty2 = options.pretty ?? true;
  const indent = options.indent ?? "  ";
  const sortKeys = options.sortKeys ?? true;
  const seen = new Set;
  const lines = [];
  recur3(rootName, value3, 0);
  return lines.join(pretty2 ? `
` : "");
  function push(depth, text) {
    lines.push(pretty2 ? indent.repeat(depth) + text : text);
  }
  function recur3(tagName, node, depth, originalNameForMeta) {
    const {
      attrs,
      safe
    } = xml.tagInfo(tagName, originalNameForMeta);
    if (node === undefined) {
      push(depth, `<${safe}${attrs}/>`);
    } else if (typeof node === "string") {
      push(depth, `<${safe}${attrs}>${xml.escapeText(node)}</${safe}>`);
    } else if (typeof node !== "object" || node === null) {
      push(depth, `<${safe}${attrs}>${xml.escapeText(format(node))}</${safe}>`);
    } else {
      if (seen.has(node))
        throw new globalThis.Error("Cycle detected while serializing to XML.", {
          cause: node
        });
      seen.add(node);
      try {
        if (globalThis.globalThis.Array.isArray(node)) {
          if (node.length === 0) {
            push(depth, `<${safe}${attrs}/>`);
            return;
          }
          push(depth, `<${safe}${attrs}>`);
          for (const item of node)
            recur3(arrayItemName, item, depth + 1);
          push(depth, `</${safe}>`);
          return;
        }
        const obj = node;
        const keys4 = Object.keys(obj);
        if (sortKeys)
          keys4.sort();
        if (keys4.length === 0) {
          push(depth, `<${safe}${attrs}/>`);
          return;
        }
        push(depth, `<${safe}${attrs}>`);
        for (const k of keys4) {
          recur3(xml.parseTagName(k).safe, obj[k], depth + 1, k);
        }
        push(depth, `</${safe}>`);
      } finally {
        seen.delete(node);
      }
    }
  }
}
var xml = {
  escapeText(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  },
  escapeAttribute(s) {
    return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  },
  parseTagName(name) {
    const original = name;
    let safe = name;
    if (!/^[A-Za-z_]/.test(safe))
      safe = "_" + safe;
    safe = safe.replace(/[^A-Za-z0-9._-]/g, "_");
    if (/^xml/i.test(safe))
      safe = "_" + safe;
    return {
      safe,
      changed: safe !== original
    };
  },
  tagInfo(name, original) {
    const {
      changed,
      safe
    } = xml.parseTagName(name);
    const needsMeta = changed || original && original !== name;
    const attrs = needsMeta ? ` data-name="${xml.escapeAttribute(original ?? name)}"` : "";
    return {
      safe,
      attrs
    };
  }
};
var toStringTreeReorder = /* @__PURE__ */ makeReorder((ast) => {
  switch (ast._tag) {
    case "Null":
    case "Boolean":
    case "Number":
    case "BigInt":
    case "Symbol":
    case "UniqueSymbol":
      return 0;
    default:
      return 1;
  }
});
function toCodecStringTreeASTStep(ast, recur3, onMissingAnnotation) {
  switch (ast._tag) {
    case "Declaration": {
      const typeParameters = ast.typeParameters.map((tp) => make30(recur3(toEncoded(tp))));
      const getStringTreeLink = ast.annotations?.toCodecStringTree;
      if (isFunction(getStringTreeLink)) {
        const link3 = getStringTreeLink(typeParameters);
        if (link3 === undefined)
          return ast;
        return replaceEncoding(ast, [mapLink(link3, recur3)]);
      }
      const getJsonLink = ast.annotations?.toCodecJson;
      const jsonLink = isFunction(getJsonLink) ? getJsonLink(typeParameters) : undefined;
      const getLink = jsonLink === undefined ? ast.annotations?.toCodec : undefined;
      const link2 = jsonLink ?? (isFunction(getLink) ? getLink(typeParameters) : undefined);
      return link2 === undefined ? onMissingAnnotation(ast) : replaceEncoding(ast, [mapLink(link2, recur3)]);
    }
    case "Null":
      return replaceEncoding(ast, [nullToString]);
    case "Boolean":
      return replaceEncoding(ast, [booleanToString]);
    case "Unknown":
    case "ObjectKeyword":
      return replaceEncoding(ast, [unknownToStringTree]);
    case "Enum":
    case "Number":
    case "Literal":
    case "UniqueSymbol":
    case "Symbol":
    case "BigInt":
      return ast.toCodecStringTree();
    case "Objects": {
      validateCanonicalObjectPropertyNames(ast);
      return ast.recur(recur3, parameterFromString);
    }
    case "Union": {
      const sortedTypes = toStringTreeReorder(ast.types);
      if (sortedTypes !== ast.types) {
        return new Union(sortedTypes, ast.mode, ast.annotations, ast.checks, ast.encoding, ast.context, ast.encodingChecks).recur(recur3);
      }
      return ast.recur(recur3);
    }
    case "Arrays":
    case "Suspend":
      return ast.recur(recur3);
  }
  return ast;
}
var nullToString = /* @__PURE__ */ new Link(/* @__PURE__ */ new Literal("null"), /* @__PURE__ */ new Transformation(/* @__PURE__ */ transform(() => null), /* @__PURE__ */ transform(() => "null")));
var booleanToString = /* @__PURE__ */ new Link(/* @__PURE__ */ new Union([/* @__PURE__ */ new Literal("true"), /* @__PURE__ */ new Literal("false")], "anyOf"), /* @__PURE__ */ new Transformation(/* @__PURE__ */ transform((s) => s === "true"), /* @__PURE__ */ String3()));
var arrayFromSingleTransformation = /* @__PURE__ */ new Transformation(/* @__PURE__ */ transform((input) => typeof input === "string" ? [input] : input), /* @__PURE__ */ passthrough2());
var isCodecArrayFromSingleLink = (link2) => link2.transformation === arrayFromSingleTransformation;
var toCodecStringTreeAST = /* @__PURE__ */ applyToSelfOrLastLinkEncodingIdempotent((ast) => {
  const out = toCodecStringTreeASTStep(ast, toCodecStringTreeAST, (ast2) => {
    throw new globalThis.Error("Missing structural codec for StringTree", {
      cause: ast2
    });
  });
  if (out !== ast && ast.context !== undefined) {
    return replaceContextLastLink(out, withoutConstructorDefault(ast.context));
  }
  return out;
}, {
  stopAt: isCodecArrayFromSingleLink
});
var toArrayFromSingleInputElement = (ast) => isOptional(ast) ? optionalKey(unknown) : unknown;
var toCodecArrayFromSingleAST = /* @__PURE__ */ applyToSelfOrLastLinkEncodingIdempotent((ast) => {
  const out = toCodecArrayFromSingleASTStep(ast);
  if (isArrays(out)) {
    const ensure2 = decodeTo(new Union([new Arrays(out.isMutable, out.elements.map(toArrayFromSingleInputElement), out.rest.map(toArrayFromSingleInputElement)), string2], "anyOf"), out, arrayFromSingleTransformation);
    return isOptional(ast) ? optionalKey(ensure2) : ensure2;
  }
  return out;
}, {
  stopAt: isCodecArrayFromSingleLink
});
function toCodecArrayFromSingleASTStep(ast) {
  return ast._tag === "Declaration" || ast._tag === "Arrays" || ast._tag === "Objects" || ast._tag === "Union" || ast._tag === "Suspend" ? ast.recur(toCodecArrayFromSingleAST) : ast;
}
var isGreaterThanDateReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isGreaterThanDate", /* @__PURE__ */ Struct({
  exclusiveMinimum: Date4
}), ({
  annotations,
  payload
}) => isGreaterThanDate(payload.exclusiveMinimum, annotations));
var isGreaterThanOrEqualToDateReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isGreaterThanOrEqualToDate", /* @__PURE__ */ Struct({
  minimum: Date4
}), ({
  annotations,
  payload
}) => isGreaterThanOrEqualToDate(payload.minimum, annotations));
var isLessThanDateReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isLessThanDate", /* @__PURE__ */ Struct({
  exclusiveMaximum: Date4
}), ({
  annotations,
  payload
}) => isLessThanDate(payload.exclusiveMaximum, annotations));
var isLessThanOrEqualToDateReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isLessThanOrEqualToDate", /* @__PURE__ */ Struct({
  maximum: Date4
}), ({
  annotations,
  payload
}) => isLessThanOrEqualToDate(payload.maximum, annotations));
var isBetweenDateReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isBetweenDate", /* @__PURE__ */ Struct({
  minimum: Date4,
  maximum: Date4,
  exclusiveMinimum: /* @__PURE__ */ optional2(/* @__PURE__ */ Literal2(true)),
  exclusiveMaximum: /* @__PURE__ */ optional2(/* @__PURE__ */ Literal2(true))
}), ({
  annotations,
  payload
}) => isBetweenDate(payload, annotations));
var isGreaterThanBigIntReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isGreaterThanBigInt", /* @__PURE__ */ Struct({
  exclusiveMinimum: BigInt5
}), ({
  annotations,
  payload
}) => isGreaterThanBigInt(payload.exclusiveMinimum, annotations));
var isGreaterThanOrEqualToBigIntReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isGreaterThanOrEqualToBigInt", /* @__PURE__ */ Struct({
  minimum: BigInt5
}), ({
  annotations,
  payload
}) => isGreaterThanOrEqualToBigInt(payload.minimum, annotations));
var isLessThanBigIntReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isLessThanBigInt", /* @__PURE__ */ Struct({
  exclusiveMaximum: BigInt5
}), ({
  annotations,
  payload
}) => isLessThanBigInt(payload.exclusiveMaximum, annotations));
var isLessThanOrEqualToBigIntReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isLessThanOrEqualToBigInt", /* @__PURE__ */ Struct({
  maximum: BigInt5
}), ({
  annotations,
  payload
}) => isLessThanOrEqualToBigInt(payload.maximum, annotations));
var isBetweenBigIntReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isBetweenBigInt", /* @__PURE__ */ Struct({
  minimum: BigInt5,
  maximum: BigInt5,
  exclusiveMinimum: /* @__PURE__ */ optional2(/* @__PURE__ */ Literal2(true)),
  exclusiveMaximum: /* @__PURE__ */ optional2(/* @__PURE__ */ Literal2(true))
}), ({
  annotations,
  payload
}) => isBetweenBigInt(payload, annotations));
function toIso(schema) {
  const serializer = toCodecIso(schema);
  return makeIso(encodeSync(serializer), decodeSync(serializer));
}
function toIsoSource(_) {
  return id();
}
function toIsoFocus(_) {
  return id();
}
function overrideToCodecIso(to, transformation) {
  return (schema) => {
    return make30(annotate(schema.ast, {
      toCodecIso: () => new Link(to.ast, make25(transformation))
    }), {
      schema
    });
  };
}
function toDifferJsonPatch(schema) {
  const serializer = toCodecJson(schema);
  const get10 = encodeSync(serializer);
  const set5 = decodeSync(serializer);
  return {
    empty: [],
    diff: (oldValue, newValue) => get9(get10(oldValue), get10(newValue)),
    combine: (first, second) => [...first, ...second],
    patch: (oldValue, patch) => {
      const value3 = get10(oldValue);
      const patched = apply(patch, value3);
      return Object.is(patched, value3) ? oldValue : set5(patched);
    }
  };
}
function Tree(node) {
  const Tree$ref = suspend6(() => Tree2);
  const Tree2 = Union2([node, ArraySchema(Tree$ref), Record(String5, Tree$ref)]);
  return Tree2;
}
var Json2 = /* @__PURE__ */ make30(/* @__PURE__ */ annotate(Json, {
  toCode: () => ({
    runtime: "Schema.Json",
    Type: "Schema.Json"
  })
}));
var JsonObject = /* @__PURE__ */ Record(String5, Json2);
var JsonReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/Json", Json2);
var JsonError = /* @__PURE__ */ Struct({
  message: String5,
  name: /* @__PURE__ */ optionalKey2(String5),
  stack: /* @__PURE__ */ optionalKey2(String5),
  cause: /* @__PURE__ */ optionalKey2(Json2)
});
var MutableJson2 = /* @__PURE__ */ make30(/* @__PURE__ */ annotate(MutableJson, {
  toCode: () => ({
    runtime: "Schema.MutableJson",
    Type: "Schema.MutableJson"
  })
}));
var MutableJsonReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/MutableJson", MutableJson2);
function resolveAnnotations(schema) {
  return resolve(schema.ast);
}
function resolveAnnotationsKey(schema) {
  return schema.ast.context?.annotations;
}
// src/action/ActionInputs.ts
var exports_ActionInputs = {};
__export(exports_ActionInputs, {
  ActionInputs: () => exports_ActionInputs,
  decodeInputs: () => decodeInputs,
  readInputs: () => readInputs,
  readRawInput: () => readRawInput
});
var inputEnvName = (name) => `INPUT_${name.replace(/ /g, "_").toUpperCase()}`;
var readRawInput = (name) => {
  const value3 = process.env[inputEnvName(name)];
  return value3 === undefined || value3 === "" ? undefined : value3;
};
var readInputs = (names) => {
  const inputs = {};
  for (const name of names) {
    inputs[name] = readRawInput(name);
  }
  return inputs;
};
var decodeInputs = (schema, names) => exports_Schema.decodeUnknownEffect(schema)(readInputs(names));

// src/action/ActionRuntime.ts
var exports_ActionRuntime = {};
__export(exports_ActionRuntime, {
  ActionRuntime: () => exports_ActionRuntime,
  platformLayer: () => platformLayer,
  runAction: () => runAction,
  toActionFailure: () => toActionFailure
});
// node_modules/@effect/platform-node/dist/NodeRuntime.js
var exports_NodeRuntime = {};
__export(exports_NodeRuntime, {
  runMain: () => runMain2
});

// node_modules/effect/dist/Runtime.js
var defaultTeardown = (exit3, onExit5) => {
  if (isSuccess4(exit3))
    return onExit5(0);
  if (hasInterruptsOnly2(exit3.cause))
    return onExit5(130);
  return onExit5(getErrorExitCode(squash(exit3.cause)));
};
var makeRunMain = (f) => dual((args2) => isEffect2(args2[0]), (effect2, options) => {
  const fiber3 = options?.disableErrorReporting === true ? runFork2(effect2) : runFork2(tapCause3(effect2, (cause) => {
    if (hasInterruptsOnly2(cause))
      return void_3;
    const isReported = getErrorReported(squash(cause));
    return isReported ? logError(cause) : void_3;
  }));
  try {
    const keepAlive = globalThis.setInterval(constVoid, 2147483647);
    fiber3.addObserver(() => {
      clearInterval(keepAlive);
    });
  } catch {}
  const teardown = options?.teardown ?? defaultTeardown;
  return f({
    fiber: fiber3,
    teardown
  });
});
var errorExitCode = "~effect/Runtime/errorExitCode";
var getErrorExitCode = (u) => {
  if (typeof u === "object" && u !== null && errorExitCode in u) {
    const code = u[errorExitCode];
    if (typeof code === "number") {
      return code;
    }
  }
  return 1;
};
var errorReported = "~effect/Runtime/errorReported";
var getErrorReported = (u) => {
  if (typeof u === "object" && u !== null && errorReported in u) {
    const isReported = u[errorReported];
    if (typeof isReported === "boolean") {
      return isReported;
    }
  }
  return true;
};

// node_modules/@effect/platform-node-shared/dist/NodeRuntime.js
var runMain = /* @__PURE__ */ makeRunMain(({
  fiber: fiber3,
  teardown
}) => {
  let receivedSignal = false;
  fiber3.addObserver((exit3) => {
    process.removeListener("SIGINT", onSigint);
    process.removeListener("SIGTERM", onSigint);
    teardown(exit3, (code) => {
      if (receivedSignal || code !== 0) {
        process.exit(code);
      }
    });
  });
  function onSigint() {
    receivedSignal = true;
    fiber3.interruptUnsafe(fiber3.id);
  }
  process.on("SIGINT", onSigint);
  process.on("SIGTERM", onSigint);
});

// node_modules/@effect/platform-node/dist/NodeRuntime.js
var runMain2 = runMain;
// node_modules/@effect/platform-node/dist/NodeServices.js
var exports_NodeServices = {};
__export(exports_NodeServices, {
  layer: () => layer12
});

// node_modules/effect/dist/Path.js
var TypeId36 = "~effect/platform/Path";
var Path2 = /* @__PURE__ */ Service("effect/Path");
function normalizeStringPosix(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let code;
  for (let i = 0;i <= path.length; ++i) {
    if (i < path.length) {
      code = path.charCodeAt(i);
    } else if (code === 47) {
      break;
    } else {
      code = 47;
    }
    if (code === 47) {
      if (lastSlash === i - 1 || dots === 1) {} else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = "";
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0) {
            res += "/..";
          } else {
            res = "..";
          }
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += "/" + path.slice(lastSlash + 1, i);
        } else {
          res = path.slice(lastSlash + 1, i);
        }
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
function _format(sep, pathObject) {
  const dir = pathObject.dir || pathObject.root;
  const base2 = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
  if (!dir) {
    return base2;
  }
  if (dir === pathObject.root) {
    return dir + base2;
  }
  return dir + sep + base2;
}
function fromFileUrl(url) {
  if (url.protocol !== "file:") {
    return fail6(new BadArgument({
      module: "Path",
      method: "fromFileUrl",
      description: "URL must be of scheme file"
    }));
  } else if (url.hostname !== "") {
    return fail6(new BadArgument({
      module: "Path",
      method: "fromFileUrl",
      description: "Invalid file URL host"
    }));
  }
  const pathname = url.pathname;
  for (let n = 0;n < pathname.length; n++) {
    if (pathname[n] === "%") {
      const third = pathname.codePointAt(n + 2) | 32;
      if (pathname[n + 1] === "2" && third === 102) {
        return fail6(new BadArgument({
          module: "Path",
          method: "fromFileUrl",
          description: "must not include encoded / characters"
        }));
      }
    }
  }
  return succeed6(decodeURIComponent(pathname));
}
var resolve2 = function resolve3() {
  let resolvedPath = "";
  let resolvedAbsolute = false;
  let cwd = undefined;
  for (let i = arguments.length - 1;i >= -1 && !resolvedAbsolute; i--) {
    let path;
    if (i >= 0) {
      path = arguments[i];
    } else {
      const process2 = globalThis.process;
      if (cwd === undefined && "process" in globalThis && typeof process2 === "object" && process2 !== null && typeof process2.cwd === "function") {
        cwd = process2.cwd();
      }
      path = cwd;
    }
    if (path.length === 0) {
      continue;
    }
    resolvedPath = path + "/" + resolvedPath;
    resolvedAbsolute = path.charCodeAt(0) === 47;
  }
  resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute) {
    if (resolvedPath.length > 0) {
      return "/" + resolvedPath;
    } else {
      return "/";
    }
  } else if (resolvedPath.length > 0) {
    return resolvedPath;
  } else {
    return ".";
  }
};
var CHAR_FORWARD_SLASH = 47;
function toFileUrl(filepath) {
  const outURL = new URL("file://");
  let resolved = resolve2(filepath);
  const filePathLast = filepath.charCodeAt(filepath.length - 1);
  if (filePathLast === CHAR_FORWARD_SLASH && resolved[resolved.length - 1] !== "/") {
    resolved += "/";
  }
  outURL.pathname = encodePathChars(resolved);
  return succeed6(outURL);
}
var percentRegExp = /%/g;
var backslashRegExp = /\\/g;
var newlineRegExp = /\n/g;
var carriageReturnRegExp = /\r/g;
var tabRegExp = /\t/g;
function encodePathChars(filepath) {
  if (filepath.includes("%")) {
    filepath = filepath.replace(percentRegExp, "%25");
  }
  if (filepath.includes("\\")) {
    filepath = filepath.replace(backslashRegExp, "%5C");
  }
  if (filepath.includes(`
`)) {
    filepath = filepath.replace(newlineRegExp, "%0A");
  }
  if (filepath.includes("\r")) {
    filepath = filepath.replace(carriageReturnRegExp, "%0D");
  }
  if (filepath.includes("\t")) {
    filepath = filepath.replace(tabRegExp, "%09");
  }
  return filepath;
}
var posixImpl = /* @__PURE__ */ Path2.of({
  [TypeId36]: TypeId36,
  resolve: resolve2,
  normalize(path) {
    if (path.length === 0)
      return ".";
    const isAbsolute = path.charCodeAt(0) === 47;
    const trailingSeparator = path.charCodeAt(path.length - 1) === 47;
    path = normalizeStringPosix(path, !isAbsolute);
    if (path.length === 0 && !isAbsolute)
      path = ".";
    if (path.length > 0 && trailingSeparator)
      path += "/";
    if (isAbsolute)
      return "/" + path;
    return path;
  },
  isAbsolute(path) {
    return path.length > 0 && path.charCodeAt(0) === 47;
  },
  join() {
    if (arguments.length === 0) {
      return ".";
    }
    let joined;
    for (let i = 0;i < arguments.length; ++i) {
      const arg = arguments[i];
      if (arg.length > 0) {
        if (joined === undefined) {
          joined = arg;
        } else {
          joined += "/" + arg;
        }
      }
    }
    if (joined === undefined) {
      return ".";
    }
    return posixImpl.normalize(joined);
  },
  relative(from, to) {
    if (from === to)
      return "";
    from = posixImpl.resolve(from);
    to = posixImpl.resolve(to);
    if (from === to)
      return "";
    let fromStart = 1;
    for (;fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47) {
        break;
      }
    }
    const fromEnd = from.length;
    const fromLen = fromEnd - fromStart;
    let toStart = 1;
    for (;toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47) {
        break;
      }
    }
    const toEnd = to.length;
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i = 0;
    for (;i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47) {
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47) {
            lastCommonSep = i;
          } else if (i === 0) {
            lastCommonSep = 0;
          }
        }
        break;
      }
      const fromCode = from.charCodeAt(fromStart + i);
      const toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode) {
        break;
      } else if (fromCode === 47) {
        lastCommonSep = i;
      }
    }
    let out = "";
    for (i = fromStart + lastCommonSep + 1;i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47) {
        if (out.length === 0) {
          out += "..";
        } else {
          out += "/..";
        }
      }
    }
    if (out.length > 0) {
      return out + to.slice(toStart + lastCommonSep);
    } else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47) {
        ++toStart;
      }
      return to.slice(toStart);
    }
  },
  dirname(path) {
    if (path.length === 0)
      return ".";
    let code = path.charCodeAt(0);
    const hasRoot = code === 47;
    let end3 = -1;
    let matchedSlash = true;
    for (let i = path.length - 1;i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47) {
        if (!matchedSlash) {
          end3 = i;
          break;
        }
      } else {
        matchedSlash = false;
      }
    }
    if (end3 === -1)
      return hasRoot ? "/" : ".";
    if (hasRoot && end3 === 1)
      return "//";
    return path.slice(0, end3);
  },
  basename(path, ext) {
    let start = 0;
    let end3 = -1;
    let matchedSlash = true;
    let i;
    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path)
        return "";
      let extIdx = ext.length - 1;
      let firstNonSlashEnd = -1;
      for (i = path.length - 1;i >= 0; --i) {
        const code = path.charCodeAt(i);
        if (code === 47) {
          if (!matchedSlash) {
            start = i + 1;
            break;
          }
        } else {
          if (firstNonSlashEnd === -1) {
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                end3 = i;
              }
            } else {
              extIdx = -1;
              end3 = firstNonSlashEnd;
            }
          }
        }
      }
      if (start === end3)
        end3 = firstNonSlashEnd;
      else if (end3 === -1)
        end3 = path.length;
      return path.slice(start, end3);
    } else {
      for (i = path.length - 1;i >= 0; --i) {
        if (path.charCodeAt(i) === 47) {
          if (!matchedSlash) {
            start = i + 1;
            break;
          }
        } else if (end3 === -1) {
          matchedSlash = false;
          end3 = i + 1;
        }
      }
      if (end3 === -1)
        return "";
      return path.slice(start, end3);
    }
  },
  extname(path) {
    let startDot = -1;
    let startPart = 0;
    let end3 = -1;
    let matchedSlash = true;
    let preDotState = 0;
    for (let i = path.length - 1;i >= 0; --i) {
      const code = path.charCodeAt(i);
      if (code === 47) {
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
      if (end3 === -1) {
        matchedSlash = false;
        end3 = i + 1;
      }
      if (code === 46) {
        if (startDot === -1) {
          startDot = i;
        } else if (preDotState !== 1) {
          preDotState = 1;
        }
      } else if (startDot !== -1) {
        preDotState = -1;
      }
    }
    if (startDot === -1 || end3 === -1 || preDotState === 0 || preDotState === 1 && startDot === end3 - 1 && startDot === startPart + 1) {
      return "";
    }
    return path.slice(startDot, end3);
  },
  format: function format4(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format("/", pathObject);
  },
  parse(path) {
    const ret = {
      root: "",
      dir: "",
      base: "",
      ext: "",
      name: ""
    };
    if (path.length === 0)
      return ret;
    let code = path.charCodeAt(0);
    const isAbsolute = code === 47;
    let start;
    if (isAbsolute) {
      ret.root = "/";
      start = 1;
    } else {
      start = 0;
    }
    let startDot = -1;
    let startPart = 0;
    let end3 = -1;
    let matchedSlash = true;
    let i = path.length - 1;
    let preDotState = 0;
    for (;i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47) {
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
      if (end3 === -1) {
        matchedSlash = false;
        end3 = i + 1;
      }
      if (code === 46) {
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
      } else if (startDot !== -1) {
        preDotState = -1;
      }
    }
    if (startDot === -1 || end3 === -1 || preDotState === 0 || preDotState === 1 && startDot === end3 - 1 && startDot === startPart + 1) {
      if (end3 !== -1) {
        if (startPart === 0 && isAbsolute)
          ret.base = ret.name = path.slice(1, end3);
        else
          ret.base = ret.name = path.slice(startPart, end3);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end3);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end3);
      }
      ret.ext = path.slice(startDot, end3);
    }
    if (startPart > 0)
      ret.dir = path.slice(0, startPart - 1);
    else if (isAbsolute)
      ret.dir = "/";
    return ret;
  },
  sep: "/",
  fromFileUrl,
  toFileUrl,
  toNamespacedPath: identity
});

// node_modules/effect/dist/unstable/process/ChildProcess.js
var exports_ChildProcess = {};
__export(exports_ChildProcess, {
  fdName: () => fdName,
  isCommand: () => isCommand,
  isPipedCommand: () => isPipedCommand,
  isStandardCommand: () => isStandardCommand,
  make: () => make32,
  parseFdName: () => parseFdName,
  pipeTo: () => pipeTo2,
  prefix: () => prefix,
  setCwd: () => setCwd,
  setEnv: () => setEnv
});

// node_modules/effect/dist/unstable/process/ChildProcessSpawner.js
var exports_ChildProcessSpawner = {};
__export(exports_ChildProcessSpawner, {
  ChildProcessSpawner: () => ChildProcessSpawner,
  ExitCode: () => ExitCode,
  ProcessId: () => ProcessId,
  make: () => make31,
  makeHandle: () => makeHandle
});

// node_modules/effect/dist/Brand.js
function nominal() {
  return Object.assign((input) => input, {
    option: (input) => some2(input),
    result: (input) => succeed2(input),
    is: (_) => true
  });
}

// node_modules/effect/dist/unstable/process/ChildProcessSpawner.js
var ExitCode = /* @__PURE__ */ nominal();
var ProcessId = /* @__PURE__ */ nominal();
var HandleTypeId = "~effect/ChildProcessSpawner/ChildProcessHandle";
var HandleProto = {
  [HandleTypeId]: HandleTypeId,
  ...BaseProto,
  toJSON() {
    return {
      _id: "ChildProcessHandle",
      pid: this.pid
    };
  }
};
var makeHandle = (params) => Object.setPrototypeOf({
  ...params
}, HandleProto);
var make31 = (spawn) => {
  const streamString = (command, options) => spawn(command).pipe(map7((handle) => decodeText(options?.includeStderr === true ? handle.all : handle.stdout)), unwrap4);
  const streamLines = (command, options) => splitLines2(streamString(command, options));
  return ChildProcessSpawner.of({
    spawn,
    exitCode: (command) => scoped2(flatMap5(spawn(command), (handle) => handle.exitCode)),
    streamString,
    streamLines,
    lines: (command, options) => runCollect(streamLines(command, options)),
    string: (command, options) => mkString(streamString(command, options))
  });
};

class ChildProcessSpawner extends (/* @__PURE__ */ Service()("effect/process/ChildProcessSpawner")) {
}

// node_modules/effect/dist/unstable/process/ChildProcess.js
var TypeId37 = "~effect/unstable/process/ChildProcess";
var Proto5 = {
  .../* @__PURE__ */ Prototype2({
    label: "Command",
    evaluate(fiber3) {
      return getUnsafe(fiber3.context, ChildProcessSpawner).spawn(this);
    }
  }),
  [TypeId37]: TypeId37
};
var isCommand = (u) => hasProperty(u, TypeId37);
var isStandardCommand = (command) => command._tag === "StandardCommand";
var isPipedCommand = (command) => command._tag === "PipedCommand";
var makeStandardCommand = (command, args2, options) => Object.assign(Object.create(Proto5), {
  _tag: "StandardCommand",
  command,
  args: args2,
  options
});
var makePipedCommand = (left, right, options = {}) => Object.assign(Object.create(Proto5), {
  _tag: "PipedCommand",
  left,
  right,
  options
});
var make32 = function make33(...args2) {
  if (isTemplateString(args2[0])) {
    const [templates, ...expressions] = args2;
    const tokens = parseTemplates(templates, expressions);
    return makeStandardCommand(tokens[0] ?? "", tokens.slice(1), {});
  }
  if (typeof args2[0] === "object" && !Array.isArray(args2[0]) && !isTemplateString(args2[0])) {
    const options2 = args2[0];
    return function(templates, ...expressions) {
      const tokens = parseTemplates(templates, expressions);
      return makeStandardCommand(tokens[0] ?? "", tokens.slice(1), options2);
    };
  }
  if (typeof args2[0] === "string" && !Array.isArray(args2[1])) {
    const [command2, options2 = {}] = args2;
    return makeStandardCommand(command2, [], options2);
  }
  const [command, cmdArgs = [], options = {}] = args2;
  return makeStandardCommand(command, cmdArgs, options);
};
var pipeTo2 = /* @__PURE__ */ dual((args2) => isCommand(args2[0]) && isCommand(args2[1]), (self, that, options) => makePipedCommand(self, that, options ?? {}));
var prefix = function prefix2(...args2) {
  if (isCommand(args2[0]) && args2.length > 1) {
    const [self, ...rest] = args2;
    const prefixSpec2 = parsePrefixArgs(rest);
    return applyPrefix(self, prefixSpec2);
  }
  const prefixSpec = parsePrefixArgs(args2);
  return (self) => applyPrefix(self, prefixSpec);
};
var parsePrefixArgs = (args2) => {
  if (isTemplateString(args2[0])) {
    const [templates, ...expressions] = args2;
    const tokens = parseTemplates(templates, expressions);
    return {
      command: tokens[0] ?? "",
      args: tokens.slice(1)
    };
  }
  const [command, cmdArgs = []] = args2;
  return {
    command,
    args: cmdArgs
  };
};
var applyPrefix = (self, prefixSpec) => {
  switch (self._tag) {
    case "StandardCommand": {
      return makeStandardCommand(prefixSpec.command, [...prefixSpec.args, self.command, ...self.args], self.options);
    }
    case "PipedCommand": {
      return makePipedCommand(applyPrefix(self.left, prefixSpec), self.right, self.options);
    }
  }
};
var setCwd = /* @__PURE__ */ dual(2, (self, cwd) => {
  switch (self._tag) {
    case "StandardCommand": {
      return makeStandardCommand(self.command, self.args, {
        ...self.options,
        cwd
      });
    }
    case "PipedCommand": {
      return makePipedCommand(setCwd(self.left, cwd), setCwd(self.right, cwd), self.options);
    }
  }
});
var setEnv = /* @__PURE__ */ dual(2, (self, env) => {
  switch (self._tag) {
    case "StandardCommand": {
      const nextEnv = self.options.env === undefined ? env : {
        ...self.options.env,
        ...env
      };
      return makeStandardCommand(self.command, self.args, {
        ...self.options,
        env: nextEnv
      });
    }
    case "PipedCommand": {
      return makePipedCommand(setEnv(self.left, env), setEnv(self.right, env), self.options);
    }
  }
});
var isTemplateString = (u) => Array.isArray(u) && ("raw" in u) && Array.isArray(u.raw);
var parseFdName = (name) => {
  const match8 = /^fd(\d+)$/.exec(name);
  if (match8 === null)
    return;
  const fd = parseInt(match8[1], 10);
  return fd >= 3 ? fd : undefined;
};
var fdName = (fd) => `fd${fd}`;
var parseTemplates = (templates, expressions) => {
  let tokens = [];
  for (const [index2, template] of templates.entries()) {
    tokens = parseTemplate(templates, expressions, tokens, template, index2);
  }
  return tokens;
};
var parseTemplate = (templates, expressions, prevTokens, template, index2) => {
  const rawTemplate = templates.raw[index2];
  if (rawTemplate === undefined) {
    throw new Error(`Invalid backslash sequence: ${templates.raw[index2]}`);
  }
  const {
    hasLeadingWhitespace,
    hasTrailingWhitespace,
    tokens
  } = splitByWhitespaces(template, rawTemplate);
  const nextTokens = concatTokens(prevTokens, tokens, hasLeadingWhitespace);
  if (index2 === expressions.length) {
    return nextTokens;
  }
  const expression = expressions[index2];
  const expressionTokens = Array.isArray(expression) ? expression.map((expression2) => parseExpression(expression2)) : [parseExpression(expression)];
  return concatTokens(nextTokens, expressionTokens, hasTrailingWhitespace);
};
var parseExpression = (expression) => {
  const type = typeof expression;
  if (type === "string") {
    return expression;
  }
  return String(expression);
};
var DELIMITERS = /* @__PURE__ */ new Set([" ", "\t", "\r", `
`]);
var ESCAPE_LENGTH = {
  x: 3,
  u: 5
};
var splitByWhitespaces = (template, rawTemplate) => {
  if (rawTemplate.length === 0) {
    return {
      tokens: [],
      hasLeadingWhitespace: false,
      hasTrailingWhitespace: false
    };
  }
  const hasLeadingWhitespace = DELIMITERS.has(rawTemplate[0]);
  const tokens = [];
  let templateCursor = 0;
  for (let templateIndex = 0, rawIndex = 0;templateIndex < template.length; templateIndex += 1, rawIndex += 1) {
    const rawCharacter = rawTemplate[rawIndex];
    if (DELIMITERS.has(rawCharacter)) {
      if (templateCursor !== templateIndex) {
        tokens.push(template.slice(templateCursor, templateIndex));
      }
      templateCursor = templateIndex + 1;
    } else if (rawCharacter === "\\") {
      const nextRawCharacter = rawTemplate[rawIndex + 1];
      if (nextRawCharacter === `
`) {
        templateIndex -= 1;
        rawIndex += 1;
      } else if (nextRawCharacter === "u" && rawTemplate[rawIndex + 2] === "{") {
        rawIndex = rawTemplate.indexOf("}", rawIndex + 3);
      } else {
        rawIndex += ESCAPE_LENGTH[nextRawCharacter] ?? 1;
      }
    }
  }
  const hasTrailingWhitespace = templateCursor === template.length;
  if (!hasTrailingWhitespace) {
    tokens.push(template.slice(templateCursor));
  }
  return {
    tokens,
    hasLeadingWhitespace,
    hasTrailingWhitespace
  };
};
var concatTokens = (prevTokens, nextTokens, isSeparated) => isSeparated || prevTokens.length === 0 || nextTokens.length === 0 ? [...prevTokens, ...nextTokens] : [...prevTokens.slice(0, -1), `${prevTokens.at(-1)}${nextTokens.at(0)}`, ...nextTokens.slice(1)];

// node_modules/@effect/platform-node-shared/dist/NodeChildProcessSpawner.js
import * as NodeChildProcess from "node:child_process";
import { PassThrough } from "node:stream";

// node_modules/@effect/platform-node-shared/dist/internal/nodeChildProcessSpawner.js
var buildSpawnOptions = (options, base2, platform) => {
  const detached = options.detached ?? platform !== "win32";
  return {
    ...base2,
    detached,
    shell: options.shell,
    windowsHide: options.windowsHide ?? !detached
  };
};

// node_modules/@effect/platform-node-shared/dist/internal/utils.js
var handleErrnoException = (module, method) => (err, [path]) => {
  let reason = "Unknown";
  switch (err.code) {
    case "ENOENT":
      reason = "NotFound";
      break;
    case "EACCES":
      reason = "PermissionDenied";
      break;
    case "EEXIST":
      reason = "AlreadyExists";
      break;
    case "EISDIR":
      reason = "BadResource";
      break;
    case "ENOTDIR":
      reason = "BadResource";
      break;
    case "EBUSY":
      reason = "Busy";
      break;
    case "ELOOP":
      reason = "BadResource";
      break;
  }
  return systemError({
    _tag: reason,
    module,
    method,
    pathOrDescriptor: path,
    syscall: err.syscall,
    cause: err
  });
};

// node_modules/@effect/platform-node-shared/dist/NodeSink.js
var fromWritable = (options) => fromChannel2(mapDone(fromWritableChannel(options), (_) => [_]));
var fromWritableChannel = (options) => fromTransform((pull) => {
  const writable = options.evaluate();
  return succeed6(pullIntoWritable({
    ...options,
    writable,
    pull
  }));
});
var pullIntoWritable = (options) => options.pull.pipe(flatMap5((chunk) => {
  let i = 0;
  return callback2(function loop(resume) {
    for (;i < chunk.length; ) {
      const success = options.writable.write(chunk[i++], options.encoding);
      if (!success) {
        options.writable.once("drain", () => loop(resume));
        return;
      }
    }
    resume(void_3);
  });
}), forever4({
  disableYield: true
}), raceFirst2(callback2((resume) => {
  const onError5 = (error) => resume(fail6(options.onError(error)));
  options.writable.once("error", onError5);
  return sync3(() => {
    options.writable.off("error", onError5);
  });
})), options.endOnDone !== false ? catchDone((_) => {
  if ("closed" in options.writable && options.writable.closed) {
    return done3(_);
  }
  return callback2((resume) => {
    options.writable.once("finish", () => resume(done3(_)));
    options.writable.end();
  });
}) : identity);

// node_modules/@effect/platform-node-shared/dist/NodeStream.js
var fromReadable = (options) => fromChannel3(fromReadableChannel(options));
var fromReadableChannel = (options) => fromTransform((_, scope3) => readableToPullUnsafe({
  scope: scope3,
  readable: options.evaluate(),
  onError: options.onError ?? defaultOnError,
  chunkSize: options.chunkSize,
  closeOnDone: options.closeOnDone
}));
var readableToPullUnsafe = (options) => {
  const readable = options.readable;
  const closeOnDone = options.closeOnDone ?? true;
  const exit3 = options.exit ?? make10(undefined);
  const latch = makeUnsafe5(false);
  function onReadable() {
    latch.openUnsafe();
  }
  function onError5(error) {
    exit3.current = fail4(options.onError(error));
    latch.openUnsafe();
  }
  function onEnd3() {
    exit3.current = fail4(Done2());
    latch.openUnsafe();
  }
  readable.on("readable", onReadable);
  readable.once("error", onError5);
  readable.once("end", onEnd3);
  const pull = suspend3(function loop() {
    let item = options.readable.read(options.chunkSize);
    if (item === null) {
      if (exit3.current) {
        return exit3.current;
      }
      if (readable.readableEnded) {
        return fail6(Done2());
      }
      latch.closeUnsafe();
      return flatMap5(latch.await, loop);
    }
    const chunk = of(item);
    while (true) {
      item = options.readable.read(options.chunkSize);
      if (item === null)
        break;
      chunk.push(item);
    }
    return succeed6(chunk);
  });
  return as2(addFinalizer2(options.scope, sync3(() => {
    readable.off("readable", onReadable);
    readable.off("error", onError5);
    readable.off("end", onEnd3);
    if (closeOnDone && "closed" in options.readable && !options.readable.closed) {
      options.readable.destroy();
    }
  })), pull);
};
var defaultOnError = (error) => new UnknownError2(error);

// node_modules/@effect/platform-node-shared/dist/NodeChildProcessSpawner.js
var toError = (error) => error instanceof globalThis.Error ? error : new globalThis.Error(String(error));
var toPlatformError = (method, error, command) => {
  const {
    commands
  } = flattenCommand(command);
  const commandStr = commands.reduce((acc, curr) => {
    const cmd = `${curr.command} ${curr.args.join(" ")}`;
    return acc.length === 0 ? cmd : `${acc} | ${cmd}`;
  }, "");
  return handleErrnoException("ChildProcess", method)(error, [commandStr]);
};
var taskkill = (childProcess, onExit5 = () => {}) => NodeChildProcess.execFile("taskkill", ["/pid", String(childProcess.pid), "/T", "/F"], {
  windowsHide: true
}, onExit5);
var make34 = /* @__PURE__ */ gen2(function* () {
  const fs = yield* FileSystem;
  const path = yield* Path2;
  const resolveWorkingDirectory = fnUntraced2(function* (options) {
    if (isUndefined(options.cwd))
      return;
    yield* fs.access(options.cwd);
    return path.resolve(options.cwd);
  });
  const resolveEnvironment = (options) => {
    return options.extendEnv ? {
      ...globalThis.process.env,
      ...options.env
    } : options.env;
  };
  const inputToStdioOption = (input) => isStream(input) ? "pipe" : input;
  const outputToStdioOption = (input) => isSink(input) ? "pipe" : input;
  const resolveStdinOption = (options) => {
    const defaultConfig = {
      stream: "pipe",
      encoding: "utf-8",
      endOnDone: true
    };
    if (isUndefined(options.stdin)) {
      return defaultConfig;
    }
    if (typeof options.stdin === "string") {
      return {
        ...defaultConfig,
        stream: options.stdin
      };
    }
    if (isStream(options.stdin)) {
      return {
        ...defaultConfig,
        stream: options.stdin
      };
    }
    return {
      stream: options.stdin.stream,
      encoding: options.stdin.encoding ?? defaultConfig.encoding,
      endOnDone: options.stdin.endOnDone ?? defaultConfig.endOnDone
    };
  };
  const resolveOutputOption = (options, streamName) => {
    const option3 = options[streamName];
    if (isUndefined(option3)) {
      return {
        stream: "pipe"
      };
    }
    if (typeof option3 === "string") {
      return {
        stream: option3
      };
    }
    if (isSink(option3)) {
      return {
        stream: option3
      };
    }
    return {
      stream: option3.stream
    };
  };
  const resolveAdditionalFds = (options) => {
    if (isUndefined(options.additionalFds)) {
      return [];
    }
    const result4 = [];
    for (const [name, config] of Object.entries(options.additionalFds)) {
      const fd = parseFdName(name);
      if (isNotUndefined(fd)) {
        result4.push({
          fd,
          config
        });
      }
    }
    return result4.sort((a, b) => a.fd - b.fd);
  };
  const buildStdioArray = (stdinConfig, stdoutConfig, stderrConfig, additionalFds) => {
    const stdio = [inputToStdioOption(stdinConfig.stream), outputToStdioOption(stdoutConfig.stream), outputToStdioOption(stderrConfig.stream)];
    if (additionalFds.length === 0) {
      return stdio;
    }
    const maxFd = additionalFds.reduce((max5, {
      fd
    }) => Math.max(max5, fd), 2);
    for (let i = 3;i <= maxFd; i++) {
      stdio[i] = "ignore";
    }
    for (const {
      fd
    } of additionalFds) {
      stdio[fd] = "pipe";
    }
    return stdio;
  };
  const setupAdditionalFds = fnUntraced2(function* (command, childProcess, additionalFds) {
    if (additionalFds.length === 0) {
      return {
        getInputFd: () => drain2,
        getOutputFd: () => empty8
      };
    }
    const inputSinks = new Map;
    const outputStreams = new Map;
    for (const {
      config,
      fd
    } of additionalFds) {
      const nodeStream = childProcess.stdio[fd];
      switch (config.type) {
        case "input": {
          let sink = drain2;
          if (nodeStream && "write" in nodeStream) {
            sink = fromWritable({
              evaluate: () => nodeStream,
              onError: (error) => toPlatformError(`fromWritable(fd${fd})`, toError(error), command)
            });
          }
          if (config.stream) {
            yield* forkScoped2(run(config.stream, sink));
          }
          inputSinks.set(fd, sink);
          break;
        }
        case "output": {
          let stream = empty8;
          if (nodeStream && "read" in nodeStream) {
            const passThrough = new PassThrough;
            nodeStream.on("error", (error) => passThrough.destroy(error));
            nodeStream.pipe(passThrough);
            stream = fromReadable({
              evaluate: () => passThrough,
              onError: (error) => toPlatformError(`fromReadable(fd${fd})`, toError(error), command)
            });
          }
          if (config.sink) {
            stream = transduce(stream, config.sink);
          }
          outputStreams.set(fd, stream);
          break;
        }
      }
    }
    return {
      getInputFd: (fd) => inputSinks.get(fd) ?? drain2,
      getOutputFd: (fd) => outputStreams.get(fd) ?? empty8
    };
  });
  const setupChildStdin = (command, childProcess, config) => suspend3(() => {
    let sink = drain2;
    if (isNotNull(childProcess.stdin)) {
      sink = fromWritable({
        evaluate: () => childProcess.stdin,
        onError: (error) => toPlatformError("fromWritable(stdin)", toError(error), command),
        endOnDone: config.endOnDone,
        encoding: config.encoding
      });
    }
    if (isStream(config.stream)) {
      return as2(forkScoped2(run(config.stream, sink)), sink);
    }
    return succeed6(sink);
  });
  const setupChildOutputStreams = (command, childProcess, stdoutConfig, stderrConfig) => {
    let stdout = childProcess.stdout ? (() => {
      const passThrough = new PassThrough;
      childProcess.stdout.on("error", (error) => passThrough.destroy(error));
      childProcess.stdout.pipe(passThrough);
      return fromReadable({
        evaluate: () => passThrough,
        onError: (error) => toPlatformError("fromReadable(stdout)", toError(error), command)
      });
    })() : empty8;
    let stderr = childProcess.stderr ? (() => {
      const passThrough = new PassThrough;
      childProcess.stderr.on("error", (error) => passThrough.destroy(error));
      childProcess.stderr.pipe(passThrough);
      return fromReadable({
        evaluate: () => passThrough,
        onError: (error) => toPlatformError("fromReadable(stderr)", toError(error), command)
      });
    })() : empty8;
    if (isSink(stdoutConfig.stream)) {
      stdout = transduce(stdout, stdoutConfig.stream);
    }
    if (isSink(stderrConfig.stream)) {
      stderr = transduce(stderr, stderrConfig.stream);
    }
    const all3 = merge4(stdout, stderr);
    return {
      stdout,
      stderr,
      all: all3
    };
  };
  const spawn2 = (command, spawnOptions) => callback2((resume) => {
    const deferred = makeUnsafe2();
    const handle = NodeChildProcess.spawn(command.command, command.args, spawnOptions);
    handle.on("error", (error) => {
      resume(fail6(toPlatformError("spawn", error, command)));
    });
    handle.on("exit", (...args2) => {
      doneUnsafe(deferred, succeed4(args2));
    });
    handle.on("spawn", () => {
      resume(succeed6([handle, deferred]));
    });
    return sync3(() => {
      handle.kill("SIGTERM");
    });
  });
  const killProcessGroup = (command, childProcess, signal) => {
    if (globalThis.process.platform === "win32") {
      return callback2((resume) => {
        taskkill(childProcess, (error) => {
          if (error) {
            resume(fail6(toPlatformError("kill", toError(error), command)));
          } else {
            resume(void_3);
          }
        });
      });
    }
    return try_3({
      try: () => {
        globalThis.process.kill(-childProcess.pid, signal);
      },
      catch: (error) => toPlatformError("kill", toError(error), command)
    });
  };
  const killProcessGroupOnExit = (childProcess, signal) => {
    if (globalThis.process.platform === "win32") {
      taskkill(childProcess);
      return;
    }
    try {
      globalThis.process.kill(-childProcess.pid, signal);
    } catch {}
  };
  const killProcess = (command, childProcess, signal) => suspend3(() => {
    const killed = childProcess.kill(signal);
    if (!killed) {
      const error = new globalThis.Error("Failed to kill child process");
      return fail6(toPlatformError("kill", error, command));
    }
    return void_3;
  });
  const withTimeout = (childProcess, command, options) => (kill) => {
    const killSignal = options?.killSignal ?? "SIGTERM";
    return isUndefined(options?.forceKillAfter) ? kill(command, childProcess, killSignal) : timeoutOrElse2(kill(command, childProcess, killSignal), {
      duration: options.forceKillAfter,
      orElse: () => kill(command, childProcess, "SIGKILL")
    });
  };
  const getSourceStream = (handle, from) => {
    const fromOption4 = from ?? "stdout";
    switch (fromOption4) {
      case "stdout":
        return handle.stdout;
      case "stderr":
        return handle.stderr;
      case "all":
        return handle.all;
      default: {
        const fd = parseFdName(fromOption4);
        if (isNotUndefined(fd)) {
          return handle.getOutputFd(fd);
        }
        return handle.stdout;
      }
    }
  };
  const spawnCommand = fnUntraced2(function* (cmd) {
    switch (cmd._tag) {
      case "StandardCommand": {
        const stdinConfig = resolveStdinOption(cmd.options);
        const stdoutConfig = resolveOutputOption(cmd.options, "stdout");
        const stderrConfig = resolveOutputOption(cmd.options, "stderr");
        const resolvedAdditionalFds = resolveAdditionalFds(cmd.options);
        let isReferenced = true;
        const cwd = yield* resolveWorkingDirectory(cmd.options);
        const env = resolveEnvironment(cmd.options);
        const stdio = buildStdioArray(stdinConfig, stdoutConfig, stderrConfig, resolvedAdditionalFds);
        const [childProcess, exitSignal] = yield* acquireRelease2(spawn2(cmd, buildSpawnOptions(cmd.options, {
          cwd,
          env,
          stdio
        }, process.platform)), fnUntraced2(function* ([childProcess2, exitSignal2]) {
          const exited = yield* isDone2(exitSignal2);
          const killWithTimeout = withTimeout(childProcess2, cmd, cmd.options);
          if (exited) {
            const [code] = yield* _await(exitSignal2);
            if (code !== 0 && isNotNull(code)) {
              return yield* ignore2(killWithTimeout(killProcessGroup));
            }
            return yield* void_3;
          }
          if (!isReferenced) {
            return yield* void_3;
          }
          return yield* killWithTimeout((command, childProcess3, signal) => killProcessGroup(command, childProcess3, signal).pipe(catch_3(() => killProcess(command, childProcess3, signal)), andThen2(_await(exitSignal2)))).pipe(ignore2);
        }));
        const pid = ProcessId(childProcess.pid);
        childProcess.on("exit", (code) => {
          if (code !== 0 && isNotNull(code)) {
            killProcessGroupOnExit(childProcess, cmd.options.killSignal ?? "SIGTERM");
          }
        });
        const reref = sync3(() => {
          if (!isReferenced) {
            childProcess.ref();
            isReferenced = true;
          }
        });
        const unref = sync3(() => {
          if (isReferenced) {
            childProcess.unref();
            isReferenced = false;
          }
          return reref;
        });
        const stdin = yield* setupChildStdin(cmd, childProcess, stdinConfig);
        const {
          all: all3,
          stderr,
          stdout
        } = setupChildOutputStreams(cmd, childProcess, stdoutConfig, stderrConfig);
        const {
          getInputFd,
          getOutputFd
        } = yield* setupAdditionalFds(cmd, childProcess, resolvedAdditionalFds);
        const isRunning = map7(isDone2(exitSignal), (done4) => !done4);
        const exitCode = flatMap5(_await(exitSignal), ([code, signal]) => {
          if (isNotNull(code)) {
            return succeed6(ExitCode(code));
          }
          const error = new globalThis.Error(`Process interrupted due to receipt of signal: '${signal}'`);
          return fail6(toPlatformError("exitCode", error, cmd));
        });
        const kill = (options) => {
          const killWithTimeout = withTimeout(childProcess, cmd, options);
          return killWithTimeout((command, childProcess2, signal) => killProcessGroup(command, childProcess2, signal).pipe(catch_3(() => killProcess(command, childProcess2, signal)), andThen2(_await(exitSignal)))).pipe(asVoid2);
        };
        return makeHandle({
          pid,
          exitCode,
          isRunning,
          kill,
          stdin,
          stdout,
          stderr,
          all: all3,
          getInputFd,
          getOutputFd,
          unref
        });
      }
      case "PipedCommand": {
        const {
          commands,
          pipeOptions
        } = flattenCommand(cmd);
        const [root, ...pipeline] = commands;
        const handles = [yield* spawnCommand(root)];
        for (let i = 0;i < pipeline.length; i++) {
          const command = pipeline[i];
          const options = pipeOptions[i] ?? {};
          const stdinConfig = resolveStdinOption(command.options);
          const sourceStream = unwrap4(succeed6(getSourceStream(handles[handles.length - 1], options.from)));
          const toOption2 = options.to ?? "stdin";
          if (toOption2 === "stdin") {
            handles.push(yield* spawnCommand(make32(command.command, command.args, {
              ...command.options,
              stdin: {
                ...stdinConfig,
                stream: sourceStream
              }
            })));
          } else {
            const fd = parseFdName(toOption2);
            if (isNotUndefined(fd)) {
              const fdName2 = fdName(fd);
              const existingFds = command.options.additionalFds ?? {};
              handles.push(yield* spawnCommand(make32(command.command, command.args, {
                ...command.options,
                additionalFds: {
                  ...existingFds,
                  [fdName2]: {
                    type: "input",
                    stream: sourceStream
                  }
                }
              })));
            } else {
              handles.push(yield* spawnCommand(make32(command.command, command.args, {
                ...command.options,
                stdin: {
                  ...stdinConfig,
                  stream: sourceStream
                }
              })));
            }
          }
        }
        const handle = handles[handles.length - 1];
        const kill = (options) => forEach2([...handles].reverse(), (handle2) => ignore2(handle2.kill(options)), {
          discard: true
        });
        const unref = gen2(function* () {
          const rerefs = [];
          for (const handle2 of handles) {
            rerefs.push(yield* handle2.unref);
          }
          return forEach2([...rerefs].reverse(), (reref) => reref, {
            discard: true
          });
        });
        return makeHandle({
          pid: handle.pid,
          exitCode: handle.exitCode,
          isRunning: handle.isRunning,
          kill,
          stdin: handle.stdin,
          stdout: handle.stdout,
          stderr: handle.stderr,
          all: handle.all,
          getInputFd: handle.getInputFd,
          getOutputFd: handle.getOutputFd,
          unref
        });
      }
    }
  });
  return make31(spawnCommand);
});
var layer = /* @__PURE__ */ effect(ChildProcessSpawner, make34);
var flattenCommand = (command) => {
  const commands = [];
  const pipeOptions = [];
  const flatten7 = (cmd) => {
    switch (cmd._tag) {
      case "StandardCommand": {
        commands.push(cmd);
        break;
      }
      case "PipedCommand": {
        flatten7(cmd.left);
        pipeOptions.push(cmd.options);
        flatten7(cmd.right);
        break;
      }
    }
  };
  flatten7(command);
  if (commands.length === 0) {
    throw new Error("flattenCommand produced empty commands array");
  }
  const [first, ...rest] = commands;
  const nonEmptyCommands = [first, ...rest];
  return {
    commands: nonEmptyCommands,
    pipeOptions
  };
};

// node_modules/effect/dist/internal/uuid.js
var hex = (byte) => byte.toString(16).padStart(2, "0");
var stringify = (bytes) => {
  const segments = [bytes.subarray(0, 4), bytes.subarray(4, 6), bytes.subarray(6, 8), bytes.subarray(8, 10), bytes.subarray(10, 16)];
  return segments.map((segment) => Array.from(segment, hex).join("")).join("-");
};
var randomBytes = () => globalThis.crypto.getRandomValues(new Uint8Array(16));
function v4Bytes(bytes = randomBytes()) {
  bytes[6] = bytes[6] & 15 | 64;
  bytes[8] = bytes[8] & 63 | 128;
  return bytes;
}
var v4String = (bytes) => stringify(bytes === undefined ? v4Bytes() : v4Bytes(bytes));
var maxV7Timestamp = 2 ** 48 - 1;
function v7Bytes(timestampMillis, bytes = randomBytes()) {
  const timestamp = Math.min(Math.max(0, Math.trunc(timestampMillis)), maxV7Timestamp);
  bytes[0] = Math.floor(timestamp / 2 ** 40);
  bytes[1] = Math.floor(timestamp / 2 ** 32) & 255;
  bytes[2] = Math.floor(timestamp / 2 ** 24) & 255;
  bytes[3] = Math.floor(timestamp / 2 ** 16) & 255;
  bytes[4] = Math.floor(timestamp / 2 ** 8) & 255;
  bytes[5] = timestamp & 255;
  bytes[6] = bytes[6] & 15 | 112;
  bytes[8] = bytes[8] & 63 | 128;
  return bytes;
}
var v7String = (timestampMillis, bytes) => stringify(bytes === undefined ? v7Bytes(timestampMillis) : v7Bytes(timestampMillis, bytes));

// node_modules/effect/dist/Crypto.js
var TypeId38 = "~effect/platform/Crypto";
var Crypto2 = /* @__PURE__ */ Service("effect/Crypto");
var make35 = (impl) => {
  const randomBytesUnsafe = impl.randomBytes;
  const randomBytes2 = (size7) => map7(validateSize("randomBytes", size7), randomBytesUnsafe);
  const readUint53 = (bytes) => (bytes[0] & 31) * 2 ** 48 + bytes[1] * 2 ** 40 + bytes[2] * 2 ** 32 + bytes[3] * 2 ** 24 + bytes[4] * 2 ** 16 + bytes[5] * 2 ** 8 + bytes[6];
  const nextDoubleUnsafe = () => readUint53(randomBytesUnsafe(7)) / 2 ** 53;
  const nextIntUnsafe = () => {
    while (true) {
      const bytes = randomBytesUnsafe(7);
      const value3 = readUint53(bytes);
      if ((bytes[0] & 32) === 0) {
        return value3 + Number.MIN_SAFE_INTEGER;
      }
      if (value3 < Number.MAX_SAFE_INTEGER) {
        return value3 + 1;
      }
    }
  };
  return Crypto2.of({
    [TypeId38]: TypeId38,
    randomBytes: randomBytes2,
    nextDoubleUnsafe,
    nextIntUnsafe,
    digest: impl.digest,
    random: sync3(() => nextDoubleUnsafe()),
    randomBoolean: sync3(() => nextDoubleUnsafe() > 0.5),
    randomInt: sync3(() => nextIntUnsafe()),
    randomBetween: (min5, max5) => sync3(() => nextDoubleUnsafe() * (max5 - min5) + min5),
    randomIntBetween(min5, max5, options) {
      const extra = options?.halfOpen === true ? 0 : 1;
      return sync3(() => {
        const minInt = Math.ceil(min5);
        const maxInt = Math.floor(max5);
        return Math.floor(nextDoubleUnsafe() * (maxInt - minInt + extra)) + minInt;
      });
    },
    randomShuffle: (elements) => sync3(() => {
      const buffer3 = Array.from(elements);
      for (let i = buffer3.length - 1;i >= 1; i = i - 1) {
        const index2 = Math.min(i, Math.floor(nextDoubleUnsafe() * (i + 1)));
        const value3 = buffer3[i];
        buffer3[i] = buffer3[index2];
        buffer3[index2] = value3;
      }
      return buffer3;
    }),
    randomUUIDv4: sync3(() => v4String(randomBytesUnsafe(16))),
    randomUUIDv7: clockWith2((clock) => succeed6(v7String(clock.currentTimeMillisUnsafe(), randomBytesUnsafe(16))))
  });
};
var validateSize = (method, size7) => Number.isSafeInteger(size7) && size7 >= 0 ? succeed6(size7) : fail6(badArgument({
  module: "Crypto",
  method,
  description: "size must be a non-negative safe integer"
}));

// node_modules/@effect/platform-node-shared/dist/NodeCrypto.js
import * as NodeCrypto from "node:crypto";
var toHashAlgorithm = (algorithm) => {
  switch (algorithm) {
    case "SHA-1":
      return "sha1";
    case "SHA-256":
      return "sha256";
    case "SHA-384":
      return "sha384";
    case "SHA-512":
      return "sha512";
  }
};
var digest = (algorithm, data) => try_3({
  try: () => Uint8Array.from(NodeCrypto.createHash(toHashAlgorithm(algorithm)).update(data).digest()),
  catch: (cause) => systemError({
    module: "Crypto",
    method: "digest",
    _tag: "Unknown",
    description: "Could not compute digest",
    cause
  })
});
var make36 = /* @__PURE__ */ make35({
  randomBytes: NodeCrypto.randomBytes,
  digest
});
var layer2 = /* @__PURE__ */ succeed5(Crypto2, make36);

// node_modules/@effect/platform-node/dist/NodeCrypto.js
var layer3 = layer2;

// node_modules/@effect/platform-node-shared/dist/NodeFileSystem.js
import * as Crypto3 from "node:crypto";
import * as NFS from "node:fs";
import * as OS from "node:os";
import * as Path3 from "node:path";
var handleBadArgument = (method) => (err) => badArgument({
  module: "FileSystem",
  method,
  description: err.message ?? String(err)
});
var access2 = /* @__PURE__ */ (() => {
  const nodeAccess = /* @__PURE__ */ effectify(NFS.access, /* @__PURE__ */ handleErrnoException("FileSystem", "access"), /* @__PURE__ */ handleBadArgument("access"));
  return (path, options) => {
    let mode = NFS.constants.F_OK;
    if (options?.readable) {
      mode |= NFS.constants.R_OK;
    }
    if (options?.writable) {
      mode |= NFS.constants.W_OK;
    }
    return nodeAccess(path, mode);
  };
})();
var copy2 = /* @__PURE__ */ (() => {
  const nodeCp = /* @__PURE__ */ effectify(NFS.cp, /* @__PURE__ */ handleErrnoException("FileSystem", "copy"), /* @__PURE__ */ handleBadArgument("copy"));
  return (fromPath, toPath, options) => nodeCp(fromPath, toPath, {
    force: options?.overwrite ?? false,
    preserveTimestamps: options?.preserveTimestamps ?? false,
    recursive: true
  });
})();
var copyFile2 = /* @__PURE__ */ (() => {
  const nodeCopyFile = /* @__PURE__ */ effectify(NFS.copyFile, /* @__PURE__ */ handleErrnoException("FileSystem", "copyFile"), /* @__PURE__ */ handleBadArgument("copyFile"));
  return (fromPath, toPath) => nodeCopyFile(fromPath, toPath);
})();
var chmod2 = /* @__PURE__ */ (() => {
  const nodeChmod = /* @__PURE__ */ effectify(NFS.chmod, /* @__PURE__ */ handleErrnoException("FileSystem", "chmod"), /* @__PURE__ */ handleBadArgument("chmod"));
  return (path, mode) => nodeChmod(path, mode);
})();
var chown2 = /* @__PURE__ */ (() => {
  const nodeChown = /* @__PURE__ */ effectify(NFS.chown, /* @__PURE__ */ handleErrnoException("FileSystem", "chown"), /* @__PURE__ */ handleBadArgument("chown"));
  return (path, uid, gid) => nodeChown(path, uid, gid);
})();
var glob2 = /* @__PURE__ */ (() => {
  const nodeGlob = /* @__PURE__ */ effectify(NFS.glob, /* @__PURE__ */ handleErrnoException("FileSystem", "glob"), /* @__PURE__ */ handleBadArgument("glob"));
  return (pattern, options) => nodeGlob(pattern, {
    cwd: options?.root,
    exclude: options?.exclude
  });
})();
var link3 = /* @__PURE__ */ (() => {
  const nodeLink = /* @__PURE__ */ effectify(NFS.link, /* @__PURE__ */ handleErrnoException("FileSystem", "link"), /* @__PURE__ */ handleBadArgument("link"));
  return (existingPath, newPath) => nodeLink(existingPath, newPath);
})();
var makeDirectory = /* @__PURE__ */ (() => {
  const nodeMkdir = /* @__PURE__ */ effectify(NFS.mkdir, /* @__PURE__ */ handleErrnoException("FileSystem", "makeDirectory"), /* @__PURE__ */ handleBadArgument("makeDirectory"));
  return (path, options) => nodeMkdir(path, {
    recursive: options?.recursive ?? false,
    mode: options?.mode
  });
})();
var makeTempDirectoryFactory = (method) => {
  const nodeMkdtemp = effectify(NFS.mkdtemp, handleErrnoException("FileSystem", method), handleBadArgument(method));
  return (options) => suspend3(() => {
    const prefix3 = options?.prefix ?? "";
    const directory = typeof options?.directory === "string" ? Path3.join(options.directory, ".") : OS.tmpdir();
    return nodeMkdtemp(prefix3 ? Path3.join(directory, prefix3) : directory + "/");
  });
};
var makeTempDirectory = /* @__PURE__ */ makeTempDirectoryFactory("makeTempDirectory");
var removeFactory = (method) => {
  const nodeRm = effectify(NFS.rm, handleErrnoException("FileSystem", method), handleBadArgument(method));
  return (path, options) => nodeRm(path, {
    recursive: options?.recursive ?? false,
    force: options?.force ?? false
  });
};
var remove6 = /* @__PURE__ */ removeFactory("remove");
var makeTempDirectoryScoped = /* @__PURE__ */ (() => {
  const makeDirectory2 = /* @__PURE__ */ makeTempDirectoryFactory("makeTempDirectoryScoped");
  const removeDirectory = /* @__PURE__ */ removeFactory("makeTempDirectoryScoped");
  return (options) => acquireRelease2(makeDirectory2(options), (directory) => orDie3(removeDirectory(directory, {
    recursive: true
  })));
})();
var openFactory = (method) => {
  const nodeOpen = effectify(NFS.open, handleErrnoException("FileSystem", method), handleBadArgument(method));
  const nodeClose = effectify(NFS.close, handleErrnoException("FileSystem", method), handleBadArgument(method));
  return (path, options) => pipe(acquireRelease2(nodeOpen(path, options?.flag ?? "r", options?.mode), (fd) => orDie3(nodeClose(fd))), map7((fd) => makeFile(fd, options?.flag?.startsWith("a") ?? false)));
};
var open2 = /* @__PURE__ */ openFactory("open");
var makeFile = /* @__PURE__ */ (() => {
  const nodeReadFactory = (method) => effectify(NFS.read, handleErrnoException("FileSystem", method), handleBadArgument(method));
  const nodeRead = /* @__PURE__ */ nodeReadFactory("read");
  const nodeReadAlloc = /* @__PURE__ */ nodeReadFactory("readAlloc");
  const nodeStat = /* @__PURE__ */ effectify(NFS.fstat, /* @__PURE__ */ handleErrnoException("FileSystem", "stat"), /* @__PURE__ */ handleBadArgument("stat"));
  const nodeTruncate = /* @__PURE__ */ effectify(NFS.ftruncate, /* @__PURE__ */ handleErrnoException("FileSystem", "truncate"), /* @__PURE__ */ handleBadArgument("truncate"));
  const nodeSync = /* @__PURE__ */ effectify(NFS.fsync, /* @__PURE__ */ handleErrnoException("FileSystem", "sync"), /* @__PURE__ */ handleBadArgument("sync"));
  const nodeWriteFactory = (method) => effectify(NFS.write, handleErrnoException("FileSystem", method), handleBadArgument(method));
  const nodeWrite = /* @__PURE__ */ nodeWriteFactory("write");
  const nodeWriteAll = /* @__PURE__ */ nodeWriteFactory("writeAll");

  class FileImpl {
    [FileTypeId];
    fd;
    append;
    position = /* @__PURE__ */ BigInt(0);
    constructor(fd, append3) {
      this[FileTypeId] = FileTypeId;
      this.fd = fd;
      this.append = append3;
    }
    get stat() {
      return map7(nodeStat(this.fd), makeFileInfo);
    }
    get sync() {
      return nodeSync(this.fd);
    }
    seek(offset, from) {
      const offsetSize = Size(offset);
      return sync3(() => {
        if (from === "start") {
          this.position = offsetSize;
        } else if (from === "current") {
          this.position = this.position + offsetSize;
        }
        return Size(this.position);
      });
    }
    read(buffer3) {
      return suspend3(() => {
        const position = this.position;
        return map7(nodeRead(this.fd, {
          buffer: buffer3,
          position
        }), (bytesRead) => {
          const sizeRead = Size(bytesRead);
          this.position = position + sizeRead;
          return sizeRead;
        });
      });
    }
    readAlloc(size7) {
      const sizeNumber = Number(size7);
      return suspend3(() => {
        const buffer3 = Buffer.allocUnsafeSlow(sizeNumber);
        const position = this.position;
        return map7(nodeReadAlloc(this.fd, {
          buffer: buffer3,
          position
        }), (bytesRead) => {
          if (bytesRead === 0) {
            return none2();
          }
          this.position = position + BigInt(bytesRead);
          if (bytesRead === sizeNumber) {
            return some2(buffer3);
          }
          const dst = Buffer.allocUnsafeSlow(bytesRead);
          buffer3.copy(dst, 0, 0, bytesRead);
          return some2(dst);
        });
      });
    }
    truncate(length) {
      return map7(nodeTruncate(this.fd, length ? Number(length) : undefined), () => {
        if (!this.append) {
          const len = BigInt(length ?? 0);
          if (this.position > len) {
            this.position = len;
          }
        }
      });
    }
    write(buffer3) {
      return suspend3(() => {
        const position = this.position;
        return map7(nodeWrite(this.fd, buffer3, undefined, undefined, this.append ? undefined : Number(position)), (bytesWritten) => {
          const sizeWritten = Size(bytesWritten);
          if (!this.append) {
            this.position = position + sizeWritten;
          }
          return sizeWritten;
        });
      });
    }
    writeAllChunk(buffer3) {
      return suspend3(() => {
        const position = this.position;
        return flatMap5(nodeWriteAll(this.fd, buffer3, undefined, undefined, this.append ? undefined : Number(position)), (bytesWritten) => {
          if (bytesWritten === 0) {
            return fail6(systemError({
              module: "FileSystem",
              method: "writeAll",
              _tag: "WriteZero",
              pathOrDescriptor: this.fd,
              description: "write returned 0 bytes written"
            }));
          }
          if (!this.append) {
            this.position = position + BigInt(bytesWritten);
          }
          return bytesWritten < buffer3.length ? this.writeAllChunk(buffer3.subarray(bytesWritten)) : void_3;
        });
      });
    }
    writeAll(buffer3) {
      return this.writeAllChunk(buffer3);
    }
  }
  return (fd, append3) => new FileImpl(fd, append3);
})();
var makeTempFileFactory = (method) => {
  const makeDirectory2 = makeTempDirectoryFactory(method);
  return fnUntraced2(function* (options) {
    const directory = yield* makeDirectory2(options);
    const random2 = Crypto3.randomBytes(6).toString("hex");
    const name = Path3.join(directory, options?.suffix ? `${random2}${options.suffix}` : random2);
    yield* writeFile2(name, new Uint8Array(0));
    return name;
  });
};
var makeTempFile = /* @__PURE__ */ makeTempFileFactory("makeTempFile");
var makeTempFileScoped = /* @__PURE__ */ (() => {
  const makeFile2 = /* @__PURE__ */ makeTempFileFactory("makeTempFileScoped");
  const removeDirectory = /* @__PURE__ */ removeFactory("makeTempFileScoped");
  return (options) => acquireRelease2(makeFile2(options), (file) => orDie3(removeDirectory(Path3.dirname(file), {
    recursive: true
  })));
})();
var readDirectory = (path, options) => tryPromise2({
  try: () => NFS.promises.readdir(path, options),
  catch: (err) => handleErrnoException("FileSystem", "readDirectory")(err, [path])
});
var readFile2 = (path) => callback2((resume, signal) => {
  try {
    NFS.readFile(path, {
      signal
    }, (err, data) => {
      if (err) {
        resume(fail6(handleErrnoException("FileSystem", "readFile")(err, [path])));
      } else {
        resume(succeed6(data));
      }
    });
  } catch (err) {
    resume(fail6(handleBadArgument("readFile")(err)));
  }
});
var readLink = /* @__PURE__ */ (() => {
  const nodeReadLink = /* @__PURE__ */ effectify(NFS.readlink, /* @__PURE__ */ handleErrnoException("FileSystem", "readLink"), /* @__PURE__ */ handleBadArgument("readLink"));
  return (path) => nodeReadLink(path);
})();
var realPath = /* @__PURE__ */ (() => {
  const nodeRealPath = /* @__PURE__ */ effectify(NFS.realpath, /* @__PURE__ */ handleErrnoException("FileSystem", "realPath"), /* @__PURE__ */ handleBadArgument("realPath"));
  return (path) => nodeRealPath(path);
})();
var rename2 = /* @__PURE__ */ (() => {
  const nodeRename = /* @__PURE__ */ effectify(NFS.rename, /* @__PURE__ */ handleErrnoException("FileSystem", "rename"), /* @__PURE__ */ handleBadArgument("rename"));
  return (oldPath, newPath) => nodeRename(oldPath, newPath);
})();
var makeFileInfo = (stat2) => ({
  type: stat2.isFile() ? "File" : stat2.isDirectory() ? "Directory" : stat2.isSymbolicLink() ? "SymbolicLink" : stat2.isBlockDevice() ? "BlockDevice" : stat2.isCharacterDevice() ? "CharacterDevice" : stat2.isFIFO() ? "FIFO" : stat2.isSocket() ? "Socket" : "Unknown",
  mtime: fromNullishOr(stat2.mtime),
  atime: fromNullishOr(stat2.atime),
  birthtime: fromNullishOr(stat2.birthtime),
  dev: stat2.dev,
  rdev: fromNullishOr(stat2.rdev),
  ino: fromNullishOr(stat2.ino),
  mode: stat2.mode,
  nlink: fromNullishOr(stat2.nlink),
  uid: fromNullishOr(stat2.uid),
  gid: fromNullishOr(stat2.gid),
  size: Size(stat2.size),
  blksize: stat2.blksize !== undefined ? some2(Size(stat2.blksize)) : none2(),
  blocks: fromNullishOr(stat2.blocks)
});
var stat2 = /* @__PURE__ */ (() => {
  const nodeStat = /* @__PURE__ */ effectify(NFS.stat, /* @__PURE__ */ handleErrnoException("FileSystem", "stat"), /* @__PURE__ */ handleBadArgument("stat"));
  return (path) => map7(nodeStat(path), makeFileInfo);
})();
var symlink2 = /* @__PURE__ */ (() => {
  const nodeSymlink = /* @__PURE__ */ effectify(NFS.symlink, /* @__PURE__ */ handleErrnoException("FileSystem", "symlink"), /* @__PURE__ */ handleBadArgument("symlink"));
  return (target, path) => nodeSymlink(target, path);
})();
var truncate3 = /* @__PURE__ */ (() => {
  const nodeTruncate = /* @__PURE__ */ effectify(NFS.truncate, /* @__PURE__ */ handleErrnoException("FileSystem", "truncate"), /* @__PURE__ */ handleBadArgument("truncate"));
  return (path, length) => nodeTruncate(path, length !== undefined ? Number(length) : undefined);
})();
var utimes2 = /* @__PURE__ */ (() => {
  const nodeUtimes = /* @__PURE__ */ effectify(NFS.utimes, /* @__PURE__ */ handleErrnoException("FileSystem", "utime"), /* @__PURE__ */ handleBadArgument("utime"));
  return (path, atime, mtime) => nodeUtimes(path, atime, mtime);
})();
var watchNode = (path, options) => callback3((queue) => acquireRelease2(sync3(() => {
  const watcher = NFS.watch(path, {
    recursive: options?.recursive ?? false
  }, (event, path2) => {
    if (!path2)
      return;
    switch (event) {
      case "rename": {
        runFork2(matchEffect3(stat2(path2), {
          onSuccess: (_) => offer(queue, {
            _tag: "Create",
            path: path2
          }),
          onFailure: (_) => offer(queue, {
            _tag: "Remove",
            path: path2
          })
        }));
        return;
      }
      case "change": {
        offerUnsafe(queue, {
          _tag: "Update",
          path: path2
        });
        return;
      }
    }
  });
  watcher.on("error", (error) => {
    failCauseUnsafe(queue, fail5(systemError({
      module: "FileSystem",
      _tag: "Unknown",
      method: "watch",
      pathOrDescriptor: path,
      cause: error
    })));
  });
  watcher.on("close", () => {
    endUnsafe(queue);
  });
  return watcher;
}), (watcher) => sync3(() => watcher.close())));
var watch2 = (backend, path, options) => stat2(path).pipe(map7((stat3) => backend.pipe(flatMap((_) => _.register(path, stat3, options)), getOrElse(() => watchNode(path, options)))), unwrap4);
var writeFile2 = (path, data, options) => callback2((resume, signal) => {
  try {
    NFS.writeFile(path, data, {
      signal,
      flag: options?.flag,
      mode: options?.mode
    }, (err) => {
      if (err) {
        resume(fail6(handleErrnoException("FileSystem", "writeFile")(err, [path])));
      } else {
        resume(void_3);
      }
    });
  } catch (err) {
    resume(fail6(handleBadArgument("writeFile")(err)));
  }
});
var makeFileSystem = /* @__PURE__ */ map7(/* @__PURE__ */ serviceOption2(WatchBackend), (backend) => make18({
  access: access2,
  chmod: chmod2,
  chown: chown2,
  copy: copy2,
  copyFile: copyFile2,
  glob: glob2,
  link: link3,
  makeDirectory,
  makeTempDirectory,
  makeTempDirectoryScoped,
  makeTempFile,
  makeTempFileScoped,
  open: open2,
  readDirectory,
  readFile: readFile2,
  readLink,
  realPath,
  remove: remove6,
  rename: rename2,
  stat: stat2,
  symlink: symlink2,
  truncate: truncate3,
  utimes: utimes2,
  watch(path, options) {
    return watch2(backend, path, options);
  },
  writeFile: writeFile2
}));
var layer4 = /* @__PURE__ */ effect(FileSystem)(makeFileSystem);

// node_modules/@effect/platform-node/dist/NodeFileSystem.js
var layer5 = layer4;

// node_modules/@effect/platform-node-shared/dist/NodePath.js
import * as NodePath from "node:path";
import * as NodeUrl from "node:url";
var fileUrlOps = (windows) => ({
  fromFileUrl: (url) => try_3({
    try: () => NodeUrl.fileURLToPath(url, {
      windows
    }),
    catch: (cause) => new BadArgument({
      module: "Path",
      method: "fromFileUrl",
      cause
    })
  }),
  toFileUrl: (path) => try_3({
    try: () => NodeUrl.pathToFileURL(path, {
      windows
    }),
    catch: (cause) => new BadArgument({
      module: "Path",
      method: "toFileUrl",
      cause
    })
  })
});
var layerPosix = /* @__PURE__ */ succeed5(Path2)({
  [TypeId36]: TypeId36,
  ...NodePath.posix,
  .../* @__PURE__ */ fileUrlOps(false)
});
var layerWin32 = /* @__PURE__ */ succeed5(Path2)({
  [TypeId36]: TypeId36,
  ...NodePath.win32,
  .../* @__PURE__ */ fileUrlOps(true)
});
var layer6 = /* @__PURE__ */ succeed5(Path2)({
  [TypeId36]: TypeId36,
  ...NodePath,
  .../* @__PURE__ */ fileUrlOps(undefined)
});

// node_modules/@effect/platform-node/dist/NodePath.js
var layer7 = layer6;

// node_modules/effect/dist/Stdio.js
var TypeId39 = "~effect/Stdio";
var Stdio2 = /* @__PURE__ */ Service(TypeId39);
var make37 = (options) => ({
  [TypeId39]: TypeId39,
  stdinIsTerminal: succeed6(false),
  stdoutIsTerminal: succeed6(false),
  ...options
});

// node_modules/@effect/platform-node-shared/dist/NodeStdio.js
var layer8 = /* @__PURE__ */ succeed5(Stdio2, /* @__PURE__ */ make37({
  args: /* @__PURE__ */ sync3(() => process.argv.slice(2)),
  stdinIsTerminal: /* @__PURE__ */ sync3(() => process.stdin.isTTY === true),
  stdoutIsTerminal: /* @__PURE__ */ sync3(() => process.stdout.isTTY === true),
  stdout: (options) => fromWritable({
    evaluate: () => process.stdout,
    onError: (cause) => systemError({
      module: "Stdio",
      method: "stdout",
      _tag: "Unknown",
      cause
    }),
    endOnDone: options?.endOnDone ?? false
  }),
  stderr: (options) => fromWritable({
    evaluate: () => process.stderr,
    onError: (cause) => systemError({
      module: "Stdio",
      method: "stderr",
      _tag: "Unknown",
      cause
    }),
    endOnDone: options?.endOnDone ?? false
  }),
  stdin: /* @__PURE__ */ fromReadable({
    evaluate: () => process.stdin,
    onError: (cause) => systemError({
      module: "Stdio",
      method: "stdin",
      _tag: "Unknown",
      cause
    }),
    closeOnDone: false
  })
}));

// node_modules/@effect/platform-node/dist/NodeStdio.js
var layer9 = layer8;

// node_modules/effect/dist/Terminal.js
var TypeId40 = "~effect/platform/Terminal";
var QuitErrorTypeId = "effect/platform/Terminal/QuitError";

class QuitError extends (/* @__PURE__ */ Error4("QuitError")({
  _tag: /* @__PURE__ */ tag("QuitError")
})) {
  [QuitErrorTypeId] = QuitErrorTypeId;
}
var Terminal2 = /* @__PURE__ */ Service("effect/platform/Terminal");
var make38 = (impl) => Terminal2.of({
  ...impl,
  [TypeId40]: TypeId40
});

// node_modules/@effect/platform-node-shared/dist/NodeTerminal.js
import * as readline from "node:readline";
var make39 = /* @__PURE__ */ fnUntraced2(function* (shouldQuit = defaultShouldQuit) {
  const stdin = process.stdin;
  const stdout = process.stdout;
  const lines = yield* make13();
  let inputEnded = stdin.readableEnded;
  let readlineActive = false;
  const onStdinEnd = () => {
    inputEnded = true;
    if (!readlineActive) {
      endUnsafe(lines);
    }
  };
  stdin.once("end", onStdinEnd);
  yield* addFinalizer3(() => sync3(() => stdin.off("end", onStdinEnd)));
  const rlRef = yield* make16({
    acquire: acquireRelease2(sync3(() => {
      const rl = readline.createInterface({
        input: stdin,
        escapeCodeTimeout: 50
      });
      const onLine = (line) => offerUnsafe(lines, line);
      const onClose = () => {
        readlineActive = false;
        endUnsafe(lines);
      };
      readlineActive = true;
      readline.emitKeypressEvents(stdin, rl);
      rl.on("line", onLine);
      rl.once("close", onClose);
      if (stdin.isTTY) {
        stdin.setRawMode(true);
      }
      return {
        rl,
        onClose,
        onLine
      };
    }), ({
      rl,
      onClose,
      onLine
    }) => sync3(() => {
      readlineActive = false;
      rl.off("line", onLine);
      rl.off("close", onClose);
      if (stdin.isTTY) {
        stdin.setRawMode(false);
      }
      rl.close();
      if (inputEnded) {
        endUnsafe(lines);
      }
    })),
    idleTimeToLive: "10 millis"
  });
  const columns = sync3(() => stdout.columns ?? 0);
  const rows = sync3(() => stdout.rows ?? 0);
  const readInput = gen2(function* () {
    const queue = yield* make13();
    const handleKeypress = (s, k) => {
      const userInput = {
        input: fromUndefinedOr(s),
        key: {
          name: k.name ?? "",
          ctrl: !!k.ctrl,
          meta: !!k.meta,
          shift: !!k.shift
        }
      };
      offerUnsafe(queue, userInput);
      if (shouldQuit(userInput)) {
        endUnsafe(queue);
      }
    };
    const keepAlive = setInterval(() => {}, 2147483647);
    const handleEnd = () => {
      clearInterval(keepAlive);
      endUnsafe(queue);
    };
    yield* addFinalizer3(() => sync3(() => {
      clearInterval(keepAlive);
      stdin.off("keypress", handleKeypress);
      stdin.off("end", handleEnd);
    }));
    stdin.on("keypress", handleKeypress);
    if (inputEnded) {
      handleEnd();
    } else {
      yield* get6(rlRef);
      stdin.once("end", handleEnd);
    }
    return queue;
  });
  const readLine = suspend3(() => poll(lines).pipe(flatMap5(match({
    onNone: () => scoped2(andThen2(get6(rlRef), take3(lines))),
    onSome: succeed6
  })), mapError3(() => new QuitError({}))));
  const display = (prompt) => uninterruptible2(callback2((resume) => {
    stdout.write(prompt, (err) => isNullish(err) ? resume(void_3) : resume(fail6(badArgument({
      module: "Terminal",
      method: "display",
      description: "Failed to write prompt to stdout",
      cause: err
    }))));
  }));
  return make38({
    columns,
    rows,
    readInput,
    readLine,
    display
  });
});
var layer10 = /* @__PURE__ */ effect(Terminal2, /* @__PURE__ */ make39(defaultShouldQuit));
function defaultShouldQuit(input) {
  return input.key.ctrl && (input.key.name === "c" || input.key.name === "d");
}

// node_modules/@effect/platform-node/dist/NodeTerminal.js
var layer11 = layer10;

// node_modules/@effect/platform-node/dist/NodeServices.js
var layer12 = /* @__PURE__ */ provideMerge(layer, /* @__PURE__ */ mergeAll2(layer5, layer3, layer7, layer9, layer11));
// src/action/Annotations.ts
var exports_Annotations = {};
__export(exports_Annotations, {
  ActionFailure: () => ActionFailure,
  Annotations: () => exports_Annotations,
  Service: () => Service2,
  TestService: () => TestService,
  layer: () => layer13,
  testLayer: () => testLayer
});
class Service2 extends exports_Context.Service()("@timmo001/workflows/Annotations") {
}
var escapeData = (value3) => value3.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
var escapeProperty = (value3) => escapeData(value3).replace(/:/g, "%3A").replace(/,/g, "%2C");
var formatCommand = (command, message, properties) => {
  const parts = [];
  if (properties?.title !== undefined)
    parts.push(`title=${escapeProperty(properties.title)}`);
  if (properties?.file !== undefined)
    parts.push(`file=${escapeProperty(properties.file)}`);
  if (properties?.line !== undefined)
    parts.push(`line=${properties.line}`);
  if (properties?.column !== undefined)
    parts.push(`col=${properties.column}`);
  const suffix = parts.length > 0 ? ` ${parts.join(",")}` : "";
  return `::${command}${suffix}::${escapeData(message)}`;
};
var layer13 = exports_Layer.sync(Service2, () => {
  const write2 = (line) => exports_Effect.sync(() => {
    process.stdout.write(`${line}
`);
  });
  return Service2.of({
    error: exports_Effect.fn("Annotations.error")(function* (message, properties) {
      yield* write2(formatCommand("error", message, properties));
    }),
    warning: exports_Effect.fn("Annotations.warning")(function* (message, properties) {
      yield* write2(formatCommand("warning", message, properties));
    }),
    notice: exports_Effect.fn("Annotations.notice")(function* (message, properties) {
      yield* write2(formatCommand("notice", message, properties));
    }),
    group: exports_Effect.fn("Annotations.group")(function* (title) {
      yield* write2(`::group::${escapeData(title)}`);
    }),
    endGroup: exports_Effect.fn("Annotations.endGroup")(function* () {
      yield* write2("::endgroup::");
    })
  });
});

class TestService extends exports_Context.Service()("@timmo001/workflows/Annotations/Test") {
}
var testLayer = exports_Layer.effectContext(exports_Effect.gen(function* () {
  const recorded = yield* exports_Ref.make([]);
  const write2 = (line) => exports_Ref.update(recorded, (lines) => [...lines, line]);
  const service4 = TestService.of({
    error: exports_Effect.fn("Annotations.Test.error")(function* (message, properties) {
      yield* write2(formatCommand("error", message, properties));
    }),
    warning: exports_Effect.fn("Annotations.Test.warning")(function* (message, properties) {
      yield* write2(formatCommand("warning", message, properties));
    }),
    notice: exports_Effect.fn("Annotations.Test.notice")(function* (message, properties) {
      yield* write2(formatCommand("notice", message, properties));
    }),
    group: exports_Effect.fn("Annotations.Test.group")(function* (title) {
      yield* write2(`::group::${escapeData(title)}`);
    }),
    endGroup: exports_Effect.fn("Annotations.Test.endGroup")(function* () {
      yield* write2("::endgroup::");
    }),
    lines: exports_Effect.fn("Annotations.Test.lines")(function* () {
      return yield* exports_Ref.get(recorded);
    })
  });
  return exports_Context.empty().pipe(exports_Context.add(Service2, service4), exports_Context.add(TestService, service4));
}));

class ActionFailure extends exports_Schema.TaggedError()("ActionFailure", {
  message: exports_Schema.String,
  title: exports_Schema.optionalKey(exports_Schema.String)
}) {
}

// src/services/CommandExecutor.ts
var exports_CommandExecutor = {};
__export(exports_CommandExecutor, {
  CommandError: () => CommandError,
  CommandExecutor: () => exports_CommandExecutor,
  Service: () => Service3,
  layer: () => layer14
});
class CommandError extends exports_Schema.TaggedError()("CommandError", {
  command: exports_Schema.String,
  exitCode: exports_Schema.Int,
  stderr: exports_Schema.String
}) {
}
var error = (command, cause) => new CommandError({ command, exitCode: -1, stderr: String(cause) });
var collectText = (stream) => stream.pipe(exports_Stream.decodeText(), exports_Stream.runFold(() => "", (all3, chunk) => all3 + chunk));
var retainedStderrLength = 16 * 1024;

class Service3 extends exports_Context.Service()("@timmo001/workflows/CommandExecutor") {
}
var layer14 = exports_Layer.effect(Service3, exports_Effect.gen(function* () {
  const spawner = yield* exports_ChildProcessSpawner.ChildProcessSpawner;
  const make40 = (command, args2, options) => exports_ChildProcess.make(command, args2, {
    cwd: options?.cwd,
    env: options?.env,
    extendEnv: true
  });
  const capture = exports_Effect.fn("CommandExecutor.capture")(function* (command, args2, options) {
    const label = `${command} ${args2.join(" ")}`.trim();
    return yield* exports_Effect.scoped(exports_Effect.gen(function* () {
      const handle = yield* spawner.spawn(make40(command, args2, options));
      const [stdout, stderr, exitCode2] = yield* exports_Effect.all([
        collectText(handle.stdout),
        collectText(handle.stderr),
        handle.exitCode
      ], { concurrency: "unbounded" });
      return {
        stdout,
        stderr: stderr.trim(),
        exitCode: Number(exitCode2)
      };
    }).pipe(exports_Effect.mapError((cause) => cause instanceof CommandError ? cause : error(label, cause))));
  });
  const run3 = exports_Effect.fn("CommandExecutor.run")(function* (command, args2, options) {
    const result4 = yield* capture(command, args2, options);
    if (result4.exitCode !== 0) {
      return yield* new CommandError({
        command: `${command} ${args2.join(" ")}`.trim(),
        exitCode: result4.exitCode,
        stderr: result4.stderr
      });
    }
    return result4.stdout;
  });
  const exitCode = exports_Effect.fn("CommandExecutor.exitCode")(function* (command, args2, options) {
    const code = yield* spawner.exitCode(make40(command, args2, options)).pipe(exports_Effect.mapError((cause) => error(`${command} ${args2.join(" ")}`.trim(), cause)));
    return Number(code);
  });
  const stream = exports_Effect.fn("CommandExecutor.stream")(function* (command, args2, options) {
    const label = options?.label ?? `${command} ${args2.join(" ")}`.trim();
    return yield* exports_Effect.scoped(exports_Effect.gen(function* () {
      const handle = yield* spawner.spawn(exports_ChildProcess.make(command, args2, {
        cwd: options?.cwd,
        env: options?.env,
        extendEnv: true,
        stdin: "inherit"
      }));
      let stderrTail = "";
      const stdout = handle.stdout.pipe(exports_Stream.decodeText(), exports_Stream.runForEach((chunk) => exports_Effect.sync(() => process.stdout.write(chunk))));
      const stderr = handle.stderr.pipe(exports_Stream.decodeText(), exports_Stream.runForEach((chunk) => exports_Effect.sync(() => {
        process.stderr.write(chunk);
        stderrTail = `${stderrTail}${chunk}`.slice(-retainedStderrLength);
      })));
      const [, , code] = yield* exports_Effect.all([stdout, stderr, handle.exitCode], { concurrency: "unbounded" });
      if (Number(code) !== 0) {
        return yield* new CommandError({
          command: label,
          exitCode: Number(code),
          stderr: stderrTail.trim()
        });
      }
    }).pipe(exports_Effect.mapError((cause) => cause instanceof CommandError ? cause : error(label, cause))));
  });
  return Service3.of({ capture, run: run3, exitCode, stream });
}));

// src/action/ActionRuntime.ts
var platformLayer = exports_Layer.mergeAll(exports_NodeServices.layer, exports_Annotations.layer, exports_CommandExecutor.layer.pipe(exports_Layer.provide(exports_NodeServices.layer)));
var toActionFailure = (error2) => {
  if (error2 instanceof exports_Annotations.ActionFailure) {
    return error2;
  }
  if (exports_Schema.isSchemaError(error2)) {
    return new exports_Annotations.ActionFailure({
      message: String(error2),
      title: "Invalid action inputs"
    });
  }
  return new exports_Annotations.ActionFailure({
    message: error2.stderr.length > 0 ? error2.stderr : `Command failed with exit code ${error2.exitCode}: ${error2.command}`,
    title: "Command failed"
  });
};
var runAction = (program, layer15) => {
  const completed = exports_Effect.scoped(program).pipe(exports_Effect.provide(layer15), exports_Effect.catch((error2) => exports_Effect.gen(function* () {
    const annotations = yield* exports_Annotations.Service;
    yield* annotations.error(error2.message, error2.title === undefined ? undefined : { title: error2.title });
    return yield* exports_Effect.fail(error2);
  }).pipe(exports_Effect.provide(exports_Annotations.layer))), exports_Effect.catch(() => exports_Effect.sync(() => {
    process.exitCode = 1;
  })));
  exports_NodeRuntime.runMain(completed, { disableErrorReporting: true });
};

// src/action/ActionOutputs.ts
var exports_ActionOutputs = {};
__export(exports_ActionOutputs, {
  ActionOutputs: () => exports_ActionOutputs,
  setOutput: () => setOutput
});
import { randomBytes as randomBytes4 } from "node:crypto";
var githubOutputPath = () => process.env.GITHUB_OUTPUT;
var setOutput = (name, value3) => exports_Effect.gen(function* () {
  const path = githubOutputPath();
  if (path === undefined) {
    yield* exports_Effect.sync(() => {
      process.stdout.write(`::set-output name=${name}::${value3}
`);
    });
    return;
  }
  const fs = yield* exports_FileSystem.FileSystem;
  const delimiter = `ghadelim_${randomBytes4(16).toString("hex")}`;
  yield* fs.writeFileString(path, `${name}<<${delimiter}
${value3}
${delimiter}
`, {
    flag: "a"
  }).pipe(exports_Effect.orDie);
});

// src/actions/release-bun-cli/workflow.ts
var Stage = exports_Schema.Literals([
  "allocate-version",
  "validate-inputs",
  "compile",
  "smoke-test",
  "prepare-package",
  "install-nfpm",
  "build-assets",
  "verify-assets",
  "publish-release"
]);
var Architecture = exports_Schema.Literals(["x86_64", "aarch64"]);
var GitHubBoolean = exports_Schema.Literals(["true", "false"]);
var Inputs = exports_Schema.Struct({
  stage: Stage,
  binaryName: exports_Schema.optionalKey(exports_Schema.String),
  packageName: exports_Schema.optionalKey(exports_Schema.String),
  entrypoint: exports_Schema.optionalKey(exports_Schema.String),
  packageConfig: exports_Schema.optionalKey(exports_Schema.String),
  architecture: exports_Schema.optionalKey(Architecture),
  smokeTestArguments: exports_Schema.optionalKey(exports_Schema.String),
  packagePrepareCommand: exports_Schema.optionalKey(exports_Schema.String),
  archiveExtraPaths: exports_Schema.optionalKey(exports_Schema.String),
  prerelease: exports_Schema.optionalKey(GitHubBoolean),
  releaseVersion: exports_Schema.optionalKey(exports_Schema.String),
  sourceSha: exports_Schema.optionalKey(exports_Schema.String),
  existingRelease: exports_Schema.optionalKey(GitHubBoolean),
  assetRoot: exports_Schema.optionalKey(exports_Schema.String),
  nfpmVersion: exports_Schema.optionalKey(exports_Schema.String)
});
var architectureProfiles = {
  x86_64: {
    bunTarget: "bun-linux-x64-baseline",
    debArchitecture: "amd64",
    nfpmArchitecture: "amd64",
    nfpmDownloadArchitecture: "x86_64",
    rpmArchitecture: "x86_64"
  },
  aarch64: {
    bunTarget: "bun-linux-arm64",
    debArchitecture: "arm64",
    nfpmArchitecture: "arm64",
    nfpmDownloadArchitecture: "arm64",
    rpmArchitecture: "aarch64"
  }
};
var VERSION_PATTERN = /^[0-9]{8}\.[0-9]+$/;
var IDENTITY_PATTERN = /^[a-z0-9][a-z0-9._+-]*$/;
var isSafeRelativePath = (path) => path.length > 0 && !path.startsWith("/") && !/(^|\/)\.\.?(\/|$)/.test(path);
var newlineValues = (value3) => {
  if (value3 === undefined || value3 === "")
    return [];
  return value3.split(`
`).filter((line) => line.length > 0);
};
var archiveMemberPaths = (binaryName, extraPaths) => [binaryName, ...newlineValues(extraPaths)];
var failure = (message, title) => {
  if (title === undefined)
    return new exports_Annotations.ActionFailure({ message });
  return new exports_Annotations.ActionFailure({ message, title });
};
var requireInput = (value3, name) => value3 === undefined ? exports_Effect.fail(failure(`Input is required: ${name}`)) : exports_Effect.succeed(value3);
var mapCommand = exports_Effect.mapError((error2) => failure(error2.stderr.length > 0 ? error2.stderr : `Command failed with exit code ${error2.exitCode}: ${error2.command}`, "Command failed"));
var commandLines = (stdout) => {
  const trimmed = stdout.trim();
  return trimmed === "" ? [] : trimmed.split(`
`);
};
var resolveReleaseVersion = (input) => {
  if (input.requestedVersion !== undefined) {
    if (!VERSION_PATTERN.test(input.requestedVersion)) {
      return failure(`Invalid release version: ${input.requestedVersion}`);
    }
    return input.requestedVersion;
  }
  const existing = input.tagsPointingAtSource.find((tag2) => VERSION_PATTERN.test(tag2));
  if (existing !== undefined)
    return existing;
  const latest = input.tagsForReleaseDate[0];
  if (latest === undefined)
    return `${input.releaseDate}.0`;
  const prefix3 = `${input.releaseDate}.`;
  const sequence = latest.startsWith(prefix3) ? latest.slice(prefix3.length) : "";
  if (!/^[0-9]+$/.test(sequence)) {
    return failure(`Invalid release tag in the ${input.releaseDate} series: ${latest}`);
  }
  return `${input.releaseDate}.${Number.parseInt(sequence, 10) + 1}`;
};
var validateIdentity = (input) => {
  if (!IDENTITY_PATTERN.test(input.binaryName)) {
    return failure(`Invalid binary name: ${input.binaryName}`);
  }
  if (!IDENTITY_PATTERN.test(input.packageName)) {
    return failure(`Invalid package name: ${input.packageName}`);
  }
  for (const path of [input.entrypoint, input.packageConfig]) {
    if (!isSafeRelativePath(path)) {
      return failure(`Paths must be relative and must not contain dot segments: ${path}`);
    }
  }
};
var smokeTestScript = String.raw`set -euo pipefail
while IFS= read -r invocation || [[ -n "$invocation" ]]; do
  [[ -n "$invocation" ]] || continue
  read -r -a arguments <<< "$invocation"
  "dist/release/root/$BINARY_NAME" "\${arguments[@]}"
done <<< "$SMOKE_TEST_ARGUMENTS"`.replaceAll("\\${", "${");
var installNfpmScript = String.raw`set -euo pipefail
archive="nfpm_\${NFPM_VERSION}_Linux_\${NFPM_DOWNLOAD_ARCHITECTURE}.tar.gz"
base_url="https://github.com/goreleaser/nfpm/releases/download/v\${NFPM_VERSION}"
curl --fail --location --silent --show-error --output "$archive" "$base_url/$archive"
curl --fail --location --silent --show-error --output checksums.txt "$base_url/checksums.txt"
grep "  \${archive}$" checksums.txt | sha256sum --check --strict
tar --extract --gzip --file "$archive" nfpm
chmod 0755 nfpm`.replaceAll("\\${", "${");
var writeArchiveScript = String.raw`set -euo pipefail
assets="dist/release/assets"
mkdir -p "$assets"
mapfile -t archive_paths <<< "$ARCHIVE_PATHS"
tar --create --sort=name --mtime='@0' --owner=0 --group=0 --numeric-owner \
  --directory=dist/release/root "\${archive_paths[@]}" \
  | gzip --no-name > "$assets/\${PACKAGE_NAME}-\${VERSION}-linux-\${RELEASE_ARCHITECTURE}.tar.gz"`.replaceAll("\\${", "${");
var packageAssetsScript = String.raw`set -euo pipefail
assets="dist/release/assets"
./nfpm package --config "$PACKAGE_CONFIG" --packager deb \
  --target "$assets/\${PACKAGE_NAME}_\${VERSION}_\${DEB_ARCHITECTURE}.deb"
./nfpm package --config "$PACKAGE_CONFIG" --packager rpm \
  --target "$assets/\${PACKAGE_NAME}-\${VERSION}-1.\${RPM_ARCHITECTURE}.rpm"`.replaceAll("\\${", "${");
var verifyAssetsScript = String.raw`set -euo pipefail
expected_assets=6
actual_assets="$(find "$ASSET_ROOT" -maxdepth 1 -type f | wc -l)"
[[ "$actual_assets" -eq "$expected_assets" ]] || {
  printf 'Expected %s release assets, found %s.\n' "$expected_assets" "$actual_assets" >&2
  exit 1
}
find "$ASSET_ROOT" -maxdepth 1 -type f ! -name SHA256SUMS -printf '%f\n' | sort \
  | while IFS= read -r asset; do
      (cd "$ASSET_ROOT" && sha256sum "$asset")
    done > "$ASSET_ROOT/SHA256SUMS"
(cd "$ASSET_ROOT" && sha256sum --check --strict SHA256SUMS)`;
var publishReleaseScript = String.raw`set -euo pipefail
if [[ "$EXISTING_RELEASE" == "true" ]]; then
  gh release view "$RELEASE_VERSION" >/dev/null
  gh release upload "$RELEASE_VERSION" "$ASSET_ROOT"/* --clobber
  exit 0
fi

release_exists=false
if git rev-parse --verify --quiet "refs/tags/$RELEASE_VERSION" >/dev/null; then
  [[ "$(git rev-list -n 1 "$RELEASE_VERSION")" == "$SOURCE_SHA" ]] || {
    printf 'Release tag %s already points to another commit.\n' "$RELEASE_VERSION" >&2
    exit 1
  }
  gh release view "$RELEASE_VERSION" >/dev/null 2>&1 && release_exists=true
fi

if [[ "$release_exists" == "true" ]]; then
  gh release edit "$RELEASE_VERSION" \
    --target "$SOURCE_SHA" \
    --title "$RELEASE_VERSION" \
    --notes "Rolling release $RELEASE_VERSION from commit $SOURCE_SHA." \
    --prerelease="$PRERELEASE"
  gh release upload "$RELEASE_VERSION" "$ASSET_ROOT"/* --clobber
else
  prerelease_arguments=()
  [[ "$PRERELEASE" == "true" ]] && prerelease_arguments+=(--prerelease)
  gh release create "$RELEASE_VERSION" "$ASSET_ROOT"/* \
    --target "$SOURCE_SHA" \
    --title "$RELEASE_VERSION" \
    --notes "Rolling release $RELEASE_VERSION from commit $SOURCE_SHA." \
    "\${prerelease_arguments[@]}"
fi`.replaceAll("\\${", "${");
var resolvedPackageName = (inputs, binaryName) => inputs.packageName ?? binaryName;
var requireIdentity = (inputs) => exports_Effect.gen(function* () {
  const binaryName = yield* requireInput(inputs.binaryName, "binary-name");
  const entrypoint = yield* requireInput(inputs.entrypoint, "entrypoint");
  const packageConfig = yield* requireInput(inputs.packageConfig, "package-config");
  const packageName = resolvedPackageName(inputs, binaryName);
  const invalid2 = validateIdentity({
    binaryName,
    packageName,
    entrypoint,
    packageConfig
  });
  if (invalid2 !== undefined)
    return yield* invalid2;
  return { binaryName, packageName, entrypoint, packageConfig };
});
var allocateVersion = exports_Effect.fn("ReleaseBunCli.allocateVersion")(function* (inputs) {
  const commands = yield* exports_CommandExecutor.Service;
  const sourceSha = (yield* commands.run("git", ["rev-parse", "HEAD"]).pipe(mapCommand)).trim();
  const releaseDate = (yield* commands.run("date", ["--utc", "+%Y%m%d"]).pipe(mapCommand)).trim();
  const tagsPointingAtSource = commandLines(yield* commands.run("git", [
    "tag",
    "--points-at",
    sourceSha,
    "--list",
    "--sort=-version:refname"
  ]).pipe(mapCommand));
  const tagsForReleaseDate = commandLines(yield* commands.run("git", [
    "tag",
    "--list",
    `${releaseDate}.*`,
    "--sort=-version:refname"
  ]).pipe(mapCommand));
  const version = resolveReleaseVersion({
    requestedVersion: inputs.releaseVersion,
    releaseDate,
    tagsPointingAtSource,
    tagsForReleaseDate
  });
  if (version instanceof exports_Annotations.ActionFailure)
    return yield* version;
  yield* exports_ActionOutputs.setOutput("release-version", version);
  yield* exports_ActionOutputs.setOutput("source-sha", sourceSha);
});
var validateInputs = exports_Effect.fn("ReleaseBunCli.validateInputs")(function* (inputs) {
  yield* requireIdentity(inputs);
});
var compile = exports_Effect.fn("ReleaseBunCli.compile")(function* (inputs) {
  const commands = yield* exports_CommandExecutor.Service;
  const identity3 = yield* requireIdentity(inputs);
  const architecture = yield* requireInput(inputs.architecture, "architecture");
  const bunTarget = architectureProfiles[architecture].bunTarget;
  yield* commands.stream("bash", [
    "-c",
    `set -euo pipefail
mkdir -p dist/release/root
bun build "$ENTRYPOINT" --compile --target="$BUN_TARGET" --outfile "dist/release/root/$BINARY_NAME"`
  ], {
    label: "compile executable",
    env: {
      BINARY_NAME: identity3.binaryName,
      BUN_TARGET: bunTarget,
      ENTRYPOINT: identity3.entrypoint
    }
  }).pipe(mapCommand);
});
var smokeTest = exports_Effect.fn("ReleaseBunCli.smokeTest")(function* (inputs) {
  const commands = yield* exports_CommandExecutor.Service;
  const binaryName = yield* requireInput(inputs.binaryName, "binary-name");
  yield* commands.stream("bash", ["-c", smokeTestScript], {
    label: "smoke-test executable",
    env: {
      BINARY_NAME: binaryName,
      SMOKE_TEST_ARGUMENTS: inputs.smokeTestArguments ?? ""
    }
  }).pipe(mapCommand);
});
var preparePackage = exports_Effect.fn("ReleaseBunCli.preparePackage")(function* (inputs) {
  const commands = yield* exports_CommandExecutor.Service;
  const command = yield* requireInput(inputs.packagePrepareCommand, "package-prepare-command");
  yield* commands.stream("bash", ["-euo", "pipefail", "-c", command], {
    label: "prepare package files"
  }).pipe(mapCommand);
});
var installNfpm = exports_Effect.fn("ReleaseBunCli.installNfpm")(function* (inputs) {
  const commands = yield* exports_CommandExecutor.Service;
  const architecture = yield* requireInput(inputs.architecture, "architecture");
  const nfpmVersion = yield* requireInput(inputs.nfpmVersion, "nfpm-version");
  yield* commands.stream("bash", ["-c", installNfpmScript], {
    label: "install nFPM",
    env: {
      NFPM_VERSION: nfpmVersion,
      NFPM_DOWNLOAD_ARCHITECTURE: architectureProfiles[architecture].nfpmDownloadArchitecture
    }
  }).pipe(mapCommand);
});
var buildAssets = exports_Effect.fn("ReleaseBunCli.buildAssets")(function* (inputs) {
  const commands = yield* exports_CommandExecutor.Service;
  const fs = yield* exports_FileSystem.FileSystem;
  const identity3 = yield* requireIdentity(inputs);
  const architecture = yield* requireInput(inputs.architecture, "architecture");
  const version = yield* requireInput(inputs.releaseVersion, "release-version");
  const extraPaths = newlineValues(inputs.archiveExtraPaths);
  for (const path of extraPaths) {
    if (!isSafeRelativePath(path)) {
      return yield* failure(`Invalid archive path: ${path}`);
    }
    const exists = yield* fs.exists(`dist/release/root/${path}`).pipe(exports_Effect.mapError((error2) => failure(String(error2), "File operation failed")));
    if (!exists)
      return yield* failure(`Archive path not found: ${path}`);
  }
  const profile = architectureProfiles[architecture];
  const archiveEnv = {
    ARCHIVE_PATHS: archiveMemberPaths(identity3.binaryName, inputs.archiveExtraPaths).join(`
`),
    PACKAGE_NAME: identity3.packageName,
    VERSION: version,
    RELEASE_ARCHITECTURE: architecture,
    PACKAGE_CONFIG: identity3.packageConfig,
    DEB_ARCHITECTURE: profile.debArchitecture,
    RPM_ARCHITECTURE: profile.rpmArchitecture,
    ARCH: profile.nfpmArchitecture
  };
  yield* commands.stream("bash", ["-c", writeArchiveScript], {
    label: "create release archive",
    env: archiveEnv
  }).pipe(mapCommand);
  yield* commands.stream("bash", ["-c", packageAssetsScript], {
    label: "build linux packages",
    env: archiveEnv
  }).pipe(mapCommand);
});
var verifyAssets = exports_Effect.fn("ReleaseBunCli.verifyAssets")(function* (inputs) {
  const commands = yield* exports_CommandExecutor.Service;
  const assetRoot = yield* requireInput(inputs.assetRoot, "asset-root");
  yield* commands.stream("bash", ["-c", verifyAssetsScript], {
    label: "verify release assets",
    env: { ASSET_ROOT: assetRoot }
  }).pipe(mapCommand);
});
var publishRelease = exports_Effect.fn("ReleaseBunCli.publishRelease")(function* (inputs) {
  const commands = yield* exports_CommandExecutor.Service;
  const assetRoot = yield* requireInput(inputs.assetRoot, "asset-root");
  const releaseVersion = yield* requireInput(inputs.releaseVersion, "release-version");
  const sourceSha = yield* requireInput(inputs.sourceSha, "source-sha");
  yield* commands.stream("bash", ["-c", publishReleaseScript], {
    label: "publish GitHub release",
    env: {
      ASSET_ROOT: assetRoot,
      EXISTING_RELEASE: inputs.existingRelease ?? "false",
      PRERELEASE: inputs.prerelease ?? "true",
      RELEASE_VERSION: releaseVersion,
      SOURCE_SHA: sourceSha
    }
  }).pipe(mapCommand);
});
var run3 = exports_Effect.fn("ReleaseBunCli.run")(function* (inputs) {
  switch (inputs.stage) {
    case "allocate-version":
      return yield* allocateVersion(inputs);
    case "validate-inputs":
      return yield* validateInputs(inputs);
    case "compile":
      return yield* compile(inputs);
    case "smoke-test":
      return yield* smokeTest(inputs);
    case "prepare-package":
      return yield* preparePackage(inputs);
    case "install-nfpm":
      return yield* installNfpm(inputs);
    case "build-assets":
      return yield* buildAssets(inputs);
    case "verify-assets":
      return yield* verifyAssets(inputs);
    case "publish-release":
      return yield* publishRelease(inputs);
  }
});

// src/actions/release-bun-cli/main.ts
var program = exports_Effect.gen(function* () {
  const inputs = yield* exports_ActionInputs.decodeInputs(Inputs, [
    "stage",
    "binaryName",
    "packageName",
    "entrypoint",
    "packageConfig",
    "architecture",
    "smokeTestArguments",
    "packagePrepareCommand",
    "archiveExtraPaths",
    "prerelease",
    "releaseVersion",
    "sourceSha",
    "existingRelease",
    "assetRoot",
    "nfpmVersion"
  ]).pipe(exports_Effect.mapError(exports_ActionRuntime.toActionFailure));
  yield* run3(inputs);
});
exports_ActionRuntime.runAction(program, exports_ActionRuntime.platformLayer);
