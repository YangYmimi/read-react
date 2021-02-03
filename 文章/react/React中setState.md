### React 中 setState

`setState(updater[, callback])`

看下官方给的[文档说明](https://reactjs.org/docs/react-component.html#setstate)：

`setState()` enqueues changes to the component `state` and tells React that this component and its children need to be re-rendered with the updated state. This is the primary method you use to update the user interface in response to event handlers and server responses.

（`setState()` 确保改变组件的 `state`，并且告诉 `React` 需要去重新渲染组件和子组件。`primary method` 意味着，官方建议我们优先选择这个方法去修改 `state`）

Think of `setState()` as a request rather than an immediate command to update the component. For better perceived performance, React may delay it, and then update several components in a single pass. React does not guarantee that the state changes are applied immediately.

（这边说明了 `setState()` 方法只是一个修改请求，为了更好的性能（每次改变 `state` 都会导致组件重现渲染），`React` 会延迟修改 `state`，类似 Vue 里面的 `nextTick` 方式。所以当我们用 `setState()` 修改之后立即去拿某个 `state` 的值，有可能拿不到。注意：这边说的是有可能，因为有些更新是立即执行的，不是异步的。）

`setState()` does not always immediately update the component. It may batch or defer the update until later. This makes reading this.state right after calling `setState()` a potential pitfall. Instead, use componentDidUpdate or a setState callback (setState(updater, callback)), either of which are guaranteed to fire after the update has been applied. If you need to set the state based on the previous state, read about the updater argument below.

（这边就明确说了：`setState()` 不**总是**立即更新组件，它可能批量或者延迟更新，所以在 `setState()` 之后立即读取 `this.state` 有可能会有一个潜在的问题。那么官方建议的方式是：使用 `componentDidUpdate` 或者 `setState(updater, callback)`，在 `callback` 中获取改动之后的 `state`，如果当你需要改变一个 `state` 的时候用到前一个 `state` 的状态，就需要用到上述的方法）

`setState()` will always lead to a re-render unless shouldComponentUpdate() returns false. If mutable objects are being used and conditional rendering logic cannot be implemented in shouldComponentUpdate(), calling `setState()` only when the new state differs from the previous state will avoid unnecessary re-renders.

（`setState()` 永远会触发一个重现渲染，除非在生命周期函数 `shouldComponentUpdate()` 中 `return false`。所以当新的 `state` 不同于老的 `state` 的时候再去使用 `setState()` 可以避免不必要的重新渲染）

The first argument is an updater function with the signature:

```javascript
(state, props) => stateChange
```

（这边是说，`updater` 函数的签名，支持当前 `state` 和 组件的 `props）`

`state` is a reference to the component state at the time the change is being applied. It should not be directly mutated. Instead, changes should be represented by building a new object based on the input from state and props. For instance, suppose we wanted to increment a value in state by props.step:

```javascript
this.setState((state, props) => {
  return {counter: state.counter + props.step};
});
```

（这边告诉我们，在修改 `state` 的时候，不要直接去修改，也不应该直接修改，应该返回一个新的修改之后的对象，比如例子中利用当前 `state` 和 `props` 去生成一个新的 state`）

Both state and props received by the updater function are guaranteed to be up-to-date. The output of the updater is shallowly merged with state.

The second parameter to setState() is an optional callback function that will be executed once setState is completed and the component is re-rendered. Generally we recommend using `componentDidUpdate()` for such logic instead.

You may optionally pass an object as the first argument to setState() instead of a function:

```javascript
setState(stateChange[, callback])
```

（`updater` 函数中定义的 `state` 和 `props` 是保证最新的，也就是说我们每次去执行的时候都可以放心使用。`setState()` 函数的第二个参数是一个回调函数，该回调会在组件重新渲染之后被执行，不过官方建议我们用 `componentDidUpdate` 去代替回调中的逻辑）

This performs a shallow merge of stateChange into the new state, e.g., to adjust a shopping cart item quantity:

```javascript
this.setState({ quantity: 2 })
```

（`setState()` 支持传入一个对象，这个对象会和之前的 `state` 进行**浅合并**）

This form of `setState()` is also asynchronous, and multiple calls during the same cycle may be batched together. For example, if you attempt to increment an item quantity more than once in the same cycle, that will result in the equivalent of:

```javascript
Object.assign(
  previousState,
  {quantity: state.quantity + 1},
  {quantity: state.quantity + 1},
  ...
)
```

（`setState()` 部分情况下异步执行的。当多次调用修改的时候，会合并修改，`Object.assign()` 是浅合并操作）

Subsequent calls will override values from previous calls in the same cycle, so the quantity will only be incremented once. If the next state depends on the current state, we recommend using the updater function form, instead:

```javascript
this.setState((state) => {
  return {quantity: state.quantity + 1};
});
```

（多次调用 `setState()` 相当于链式调用，后一个 `state` 会依据前一个 `state` 被修改）

```javascript
// 如果期望链式调用，下面就可以实现
changeValue = v => {
  this.setState(state => ({ counter: state.counter + v }));
};

setCounter = () => {
  this.changeValue(1);
  this.changeValue(2);
};
```

### 其他

* [In depth: When and why are setState() calls batched?](https://stackoverflow.com/a/48610973/458193)

* [In depth: Why isn’t this.state updated immediately?](https://github.com/facebook/react/issues/11527#issuecomment-360199710)