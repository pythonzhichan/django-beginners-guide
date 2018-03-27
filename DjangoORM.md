# 一个完整的Django入门指南 - 第5部分

> 译者：刘志军  
> 原文：https://simpleisbetterthancomplex.com/series/2017/10/02/a-complete-beginners-guide-to-django-part-5.html

![5-1.jpg](./statics/5-1.jpg)


## 前言

欢迎来到系列教程的第5部分，在这节课，我们将学习关于保护视图防止未认证的用户访问，以及在视图和表单中范文授权的用户。我们还将实现主题列表视图和回复视图，最后，我们探索Django ORM的一些特性和数据迁移的一个简单介绍。


## 保护视图

我们必须开始保护视图防止那些为认证（登录）的用户可以访问，下面是用于发起一个新的话题的视图

![5-2.png](./statics/5-2.png)

在上图中，用户是还没有登录的，即使他们可以看到页面和表单。

Django 有一个内置的*视图装饰器*来避免这个问题：

**boards/views.py**（[完整代码](https://gist.github.com/vitorfs/4d3334a0daa9e7a872653a22ff39320a#file-models-py-L19)）

```python
from django.contrib.auth.decorators import login_required

@login_required
def new_topic(request, pk):
    # ...
```

现在，如果用户没有登录，将被重定向到登录页面：

![5-3.png](./statics/5-3.png)

注意查询字符串**?next=/boards/1/new/**，我们可以改进登录模板以便利用**next**变量来改进我们的用户体验

### 配置登录Next重定向

**templates/login.html** ([查看完整内容](https://gist.github.com/vitorfs/1ab597fe18e2dc56028f7aa8c3b588b3#file-login-html-L13))

```python
<form method="post" novalidate>
  {% csrf_token %}
  <input type="hidden" name="next" value="{{ next }}">
  {% include 'includes/form.html' %}
  <button type="submit" class="btn btn-primary btn-block">Log in</button>
</form>
```

然后，如果我们现在尝试登录，那么应用程序将指引我们回到我们所在的位置。

![5-4.png](./statics/5-4.png)

所以，**next**参数是内置功能的一部分





































