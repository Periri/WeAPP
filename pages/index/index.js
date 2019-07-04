import { ListModel } from '../../model/list.js';

//获取应用实例
var temp;
var mHidden;
const app = getApp();
Page({
  data: {
    todo: '',
    todos: [],
    filterTodos: [],
    filter: 'all',
    userInfo: {},
    activeCount: 0,
    inputExtra: '',
    mHidden:true,
  },
  
  changeModel(e){
    console.log("确定");
   
    temp.extra=this.data.inputExtra;
    console.log(temp);
    console.log(this.data.todos);
    for(var i=0;i<this.data.todos.length;i++)
    {
      if(temp.id==this.data.todos[i].id){
          
          this.data.todos[i].extra = temp.extra;
        
      }
      
    }
    wx.request({

      url: 'http://localhost:8080/todos/update',
      method: 'POST',
      data: {
        id:temp.id,
        completed:temp.completed,
        extra: temp.extra
        },
      header: {
        "Content-Type": "application/json" //POST方式是这个
      },
      success: function (res) {
        console.log("res");
        console.log(res);
        var result = res.data;
        var toastText = "更新成功!";
        if (result != true) {
          toastText = "更新失败！";
        } else {
          
        }
        wx.showToast({
          title: toastText,
          icon: '',
          duration: 2000
        })
      }
    });
    
    this.setData({
      
        mHidden:true
    });
    
    console.log("inputExtra");
    console.log(this.data.inputExtra);
  },
  
  modelCancel:function(){
    console.log("关闭");
    this.setData({
        mHidden: true
        
    });
    
  },
  bindTodoInput(e) {
    this.setData({
      todo: e.detail.value
    });
  },
  bindTodoInputExtra(e) {
    this.setData({
     inputExtra: e.detail.value
    });
  },
 
  saveTodo(e) {
    console.log("savetodo");
    
    const { todo, todos, filterTodos, filter, activeCount ,userInfo,inputExtra} = this.data;

    if (todo.trim().length === 0) return;
   
    const newTodo = {
      id: new Date().getTime(),
      todo: this.data.todo,
      completed: false,
      username:this.data.userInfo.nickName,
      extra : this.data.inputExtra,
      update_time: new Date(),
      create_time: new Date(),
      use:1
    };
    
       
    for (var i = 0; i < todos.length;i++){
        if (todo == todos[i].todo){
          console.log(i);
         var toastText = "该待办已存在";
          wx.showToast({
            title: toastText,
            icon: '',
            duration: 2000
          })
         return;
         }
    }
   
    app.writeHistory(newTodo, 'create', +new Date());
    
    console.log("newtodos");
    console.log(newTodo);
    todos.push(newTodo);
     wx.setStorageSync("todos", todos);
    if (filter !== 'completed') {
      filterTodos.push(newTodo);
    }
    this.setData({
      todo: '',
      inputExtra:'',
      todos,
      filterTodos,
      activeCount: activeCount + 1,
    });
    wx.request({
      url: 'http://localhost:8080/todos/add',
      method: 'POST',
      data: newTodo,
      header: {
        "Content-Type": "application/x-www-form-urlencoded" //POST方式是这个
      },

      success: function (res) {//idea controller里的return
        console.log(res);
        var result = res.data;
        var toastText = "保存成功!";
        if (result != true) {
          toastText = "保存失败！";
        } 
        
        wx.showToast({
          title: toastText,
          icon: '',
          duration: 2000
        })
      }
    });
  },
  
  onChangeShowState(e) {

    console.log("change");
    console.log("changetemp");
    console.log(temp);
    const { todoId } = e.currentTarget.dataset;
    let { todos } = this.data;
    todos = todos.map(todo => {
      if (Number(todoId) === todo.id) {
        temp=todo;
      }

      return todo;
    });
    console.log("temp");
    console.log(temp);
    this.setData({
      todos,
      mHidden: false,
      extra : this.data.inputExtra,
    });
  },
  
  todoFilter(filter, todos) {
    return filter === 'all' ? todos
      : todos.filter(x => x.completed === (filter !== 'active'));
  },
  toggleTodo(e) {
    const { todoId } = e.currentTarget.dataset;//获取todo id
    const { filter, activeCount } = this.data;
    let { todos } = this.data;
    let completed = false;
    
    todos = todos.map(todo => {
      if (Number(todoId) === todo.id) {
        todo.completed = !todo.completed;
        completed = todo.completed;
      }
      return todo;
    });
    const todo = todos.find(x => Number(todoId) === x.id);
    wx.setStorageSync("todos", todos);
    wx.request({
      
      url: 'http://localhost:8080/todos/update',
      method: 'POST',
      data: {
        id:todo.id,
        completed:todo.completed,
        extra:todo.extra
      },
      header: {
        "Content-Type": "application/json;charset=UTF-8" //POST方式是这个
      },
      success: function (res) {
        console.log("res");
        console.log(res);
        var result = res.data;
        var toastText = "更新成功!";
        if (result != true) {
          toastText = "更新失败！";
        } else {
         
        }
        wx.showToast({
          title: toastText,
          icon: '',
          duration: 2000
        })
      }
    });
    const filterTodos = this.todoFilter(filter, todos);
    this.setData({//刷新页面
      todos,
      filterTodos,
      activeCount: completed ? activeCount - 1 : activeCount + 1,
    });
    app.writeHistory(todo, todo.completed ? 'finish' : 'restart', +new Date());
  },
  //备注
  inputExtra(e) {
    const { todoId } = e.currentTarget.dataset;
    let { todos } = this.data;
    todos = todos.map(todo => {
      if (Number(todoId) === todo.id) {
        todo.extra = e.detail.value;
      }
      return todo;
    });
    this.setData({
      todos
    });
  },
  useFilter(e) {
    const { filter } = e.currentTarget.dataset;
    const { todos } = this.data;
    const filterTodos = this.todoFilter(filter, todos);
    this.setData({
      filter,
      filterTodos,
    });
  },
  clearCompleted() {
    const { filter } = this.data;
    let { todos } = this.data;
    todos = todos.filter(x => !x.completed);
    this.setData({
      todos,
      filterTodos: this.todoFilter(filter, todos),
    });
    app.writeHistory(null, 'clear', +new Date());
  },
  todoDel(e) {
    const { todoId } = e.currentTarget.dataset;
    const { filter, activeCount } = this.data;
    let { todos } = this.data;
    const todo = todos.find(x => Number(todoId) === x.id);
    
    todos = todos.filter(x => Number(todoId) !== x.id);
    this.setData({
      todos,
      filterTodos: this.todoFilter(filter, todos),
      activeCount: todo.completed ? activeCount : activeCount - 1,
    });
    console.log("todoDel ");
    console.log(todo);
    wx.setStorageSync("todos", todos);
    wx.request({
      url: 'http://localhost:8080/todos/del',
      method: 'POST',
      data: {
        id: todo.id

      },
      header: {
        "Content-Type": "application/json" //POST方式是这个
      },

      success: function (res) {
        console.log(res);
        var result = res.data;
        var toastText = "删除成功!";
        if (result != true) {
          toastText = "删除失败！";
        } else {}
        wx.showToast({
          title: toastText,
          icon: '',
          duration: 2000
        })
      }
    });
   
  },
  onLoad() {
    console.log('onLoad');
    
    const that = this;
    var user;
  	//调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      console.log(userInfo.nickName);

      const username = userInfo.nickName;
      that.setData({
        userInfo: userInfo
      });
      wx.request({
        url: 'http://localhost:8080/todos/'+username,
        method: 'GET',

        success: function (res) {

          
          const todos = res.data;

          console.log(todos);
          wx.setStorageSync('todos', todos);

          const activeCount = todos
            .map(x => x.completed ? 0 : 1)
            .reduce((a, b) => a + b, 0);
          that.setData({
            //更新微信端页面数据that.setData（），刷新页面todos
            todos,
            filterTodos: todos,
            activeCount,
          });
        }
        
      });
      
    });
    console.log(user);
    
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '愿望单',
     
      path: '/page/index?id=头号粉丝小王'
    }
  }
});


