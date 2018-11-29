## 基于Layui 的树形下拉选择框 treeselect
[Layui](https://www.layui.com/)

经典模块化前端框架

## 参数

| 参数           | 类型               | 默认值                 |描述                                                           |
|----------------|--------------------|------------------------|---------------------------------------------------------------|
| elem           | string/object      | -                      | 指向容器选择器，如：elem: '#id'。也可以是DOM对象              |
| data           | object             | null                   | layui tree 静态数据，data、url参数二选一，参考[layui tree 模块说明](https://www.layui.com/doc/modules/tree.html)|
| url            | string             | -                      | Ajax数据请求地址，data、url参数二选一                         |
| method         | string             | GET                    | Ajax请求方式，设置url有效                                     |
| selected       | function           | -                      | 树节点选中回调                                                |
| selectby       | string             | all                    | all：全部可选，fu:可选有子节点的节点，zi：只能选最后一级节点  |
| search         | bool               | false                  | 启用搜索框                                                    |
| done           | function           | -                      | 渲染完成回调                                                  |
| datakey        | string             | -                      | Ajax返回数据集中TreeData的Key                                 |
| valueKey       | string             | id                     | 绑定到原控件的数据Key                                         |
| textKey        | string             | name                   | 绑定到渲染控件的数据Key                                       |

## Demo展示
![Demo](https://github.com/junshaochen/layui.treeselect/blob/master/demo/s.gif)

## 有问题反馈
在使用中有任何问题，欢迎反馈给我，可以用以下联系方式跟我交流

* 邮件(446252517#qq.com, 把#换成@)
