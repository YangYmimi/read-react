### 源码阅读 - reselect 实现

> reselect 的比较机制是简单的参数引用比较，如果参数引用发生了变化，则需要重新执行计算；否则走缓存。有两个地方有缓存：依赖的函数计算结果和最终计算结果。reselect 官方推荐的用法是和 react-redux 的 connect 方法配合使用，以便减少在 mapStateToProps 的时候重复计算性能损耗。

两个步骤：

- 根据 `state` 计算结果，将计算结果和前一次的计算结果进行比较（基于 `defaultEqualityCheck` 方法），如果发现两者一样，那么后续计算就不用做了，直接返回之前的结果（基于记忆）

#### APIS

- createSelector

- defaultMemoize

- createSelectorCreator

- createStructuredSelector

- 更高级的用法，允许开发者自定义存储函数和比较器函数，来实现更个性化的需求。
