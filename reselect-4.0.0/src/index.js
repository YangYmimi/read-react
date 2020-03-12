// 全等转换
function defaultEqualityCheck(a, b) {
  return a === b;
}

// 比较参数是否相同
function areArgumentsShallowlyEqual(equalityCheck, prev, next) {
  // 参数为 null
  // 参数长度不等
  if (prev === null || next === null || prev.length !== next.length) {
    return false;
  }

  // Do this in a for loop (and not a `forEach` or an `every`) so we can determine equality as fast as possible.
  // 使用 for 循环方便退出循环
  const length = prev.length;
  for (let i = 0; i < length; i++) {
    // 参数顺序也要相等
    if (!equalityCheck(prev[i], next[i])) {
      return false;
    }
  }

  return true;
}

// 将函数 func 包装成一个 记忆函数
// 相等判断利用 "绝对等于" 判断
export function defaultMemoize(func, equalityCheck = defaultEqualityCheck) {
  let lastArgs = null;
  let lastResult = null;
  // we reference arguments instead of spreading them for performance reasons
  return function() {
    // 通过调用参数进行比较
    // 如果两次调用参数不等（顺序不等，值不等），那么即返回新的调用结果
    if (!areArgumentsShallowlyEqual(equalityCheck, lastArgs, arguments)) {
      // apply arguments instead of spreading for performance.
      lastResult = func.apply(null, arguments);
    }

    // 重新赋值调用参数
    lastArgs = arguments;
    // 返回调用结果，利用闭包存储了调用结果
    return lastResult;
  };
}

function getDependencies(funcs) {
  // 看上去 funcs 参数支持两种方式
  // 一个是：[[func1, func2, func3]]
  // 一个是：[func1, func2, func3]
  const dependencies = Array.isArray(funcs[0]) ? funcs[0] : funcs;

  // 校验依赖函数，确保每个依赖都是一个 function
  if (!dependencies.every(dep => typeof dep === "function")) {
    const dependencyTypes = dependencies.map(dep => typeof dep).join(", ");
    throw new Error(
      "Selector creators expect all input-selectors to be functions, " +
        `instead received the following types: [${dependencyTypes}]`
    );
  }

  return dependencies;
}

export function createSelectorCreator(memoize, ...memoizeOptions) {
  return (...funcs) => {
    // 计算次数
    let recomputations = 0;
    // funcs 本身是个数组，pop() 获取 最后一个
    const resultFunc = funcs.pop();
    // 获取剩余其他依赖
    const dependencies = getDependencies(funcs);

    // 利用默认的 memoize 方法进行封装
    // 这边的 func 就是我们实际去拿来计算数据的方法，也是 createSelector 方法最后一个参数
    const memoizedResultFunc = memoize(function() {
      recomputations++;
      // apply arguments instead of spreading for performance.
      return resultFunc.apply(null, arguments);
    }, ...memoizeOptions);

    // If a selector is called with the exact same arguments we don't need to traverse our dependencies again.
    const selector = memoize(function() {
      const params = [];
      const length = dependencies.length;

      for (let i = 0; i < length; i++) {
        // apply arguments instead of spreading and mutate a local list of params for performance.
        params.push(dependencies[i].apply(null, arguments));
      }

      // apply arguments instead of spreading for performance.
      return memoizedResultFunc.apply(null, params);
    });

    selector.resultFunc = resultFunc;
    selector.dependencies = dependencies;
    selector.recomputations = () => recomputations;
    selector.resetRecomputations = () => (recomputations = 0);
    return selector;
  };
}

export const createSelector = createSelectorCreator(defaultMemoize);

export function createStructuredSelector(
  selectors,
  selectorCreator = createSelector
) {
  if (typeof selectors !== "object") {
    throw new Error(
      "createStructuredSelector expects first argument to be an object " +
        `where each property is a selector, instead received a ${typeof selectors}`
    );
  }
  const objectKeys = Object.keys(selectors);
  return selectorCreator(
    objectKeys.map(key => selectors[key]),
    (...values) => {
      return values.reduce((composition, value, index) => {
        composition[objectKeys[index]] = value;
        return composition;
      }, {});
    }
  );
}
