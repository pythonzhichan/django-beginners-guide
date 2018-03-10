AdvancedConcepts.md

https://simpleisbetterthancomplex.com/series/2017/09/18/a-complete-beginners-guide-to-django-part-3.html

在这个课程，我们将深入两个基本概念: URLs 和 Forms。在这个过程中，我们将学习一些其他的概念，如创建可重用模板和安装第三方库。我们还将编写大量单元测试。
如果你是从这个系列教程的 part 1 跟着这个教程一步步地编写的你的项目，你可能需要在开始之前更新你的 **models.py**:
    
**boards/models.py**
```python
class Topic(models.Model):
    # other fields...
    # Add `auto_now_add=True` to the `last_updated` field
    last_updated = models.DateTimeField(auto_now_add=True)

class Post(models.Model):
    # other fields...
    # Add `null=True` to the `updated_by` field
    updated_by = models.ForeignKey(User, null=True, related_name='+')
```

现在在激活的 virtualenv 环境下运行命令：

> python manage.py makemigrations
python manage.py migrate

如果你程序中的 `update_by` 字段中已经有了 `null=True` 且 `last_updated` 字段中有了 `auto_now_add=True`，你可以放心地忽略以上的说明。

如果你更喜欢使用我的代码作为出发点，你可以在 GitHub 上找到它。

本项目现在的代码，可以在 **v0.2-lw** 标签下找到。下面是链接:

[https://github.com/sibtc/django-beginners-guide/tree/v0.2-lw][1]


我们的开发正式开始。


----------

**URLs**
随着我们项目的开发，我们现在需要有一个属于 **Board** 的展示所有 **topics** 的页面。总结来说，就如你在上个课程所看到的线框图:

![此处输入图片的描述][1]


            图1: **Board** 线框图, 在 **Django board** 中列出所有的 **topics** 列表
            
我们将从编写 **myproject** 文件夹中的 **urls.py** 开始：

**myproject/urls.py**

```python
from django.conf.urls import url
from django.contrib import admin

from boards import views

urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^boards/(?P<pk>\d+)/$', views.board_topics, name='board_topics'),
    url(r'^admin/', admin.site.urls),
]
```

现在让我们分析一下 **urlpatterns** 和 **url**。

**URL dispatcher** 和 **URLconf (URL configuration)** 是Django 应用中的基础部分。在开始的时候，这个看起来让人很困惑；我记得我第一次开始使用 Django 开发的时候也有一段时间学起来很困难。

现在 Django 开发者在致力于简化路由语法。但是现在我们使用的是 1.11 版本的 Django，我们需要使用这些语法，所以让我们尝试着去了解它是怎么工作的。

一个项目可以有很多 **urls.py** 分布在应用中。Django 需要一个 **url.py** 去作为起点。这个特别的 **urls.py** 叫做 **root URLconf**。它被定义在 **settings.py** 中。

**myproject/settings.py**

```python
ROOT_URLCONF = 'myproject.urls'
```

它已经自动配置好了，你不需要去改变它任何东西。

当 Django 接受一个请求(request)， 它就会在项目的 URLconf 中寻找匹配项。他从 **urlpatterns** 变量的第一条开始，然后在每个 **url** 中去测试出请求的 URL。

如果 Django 找到了一个匹配路径，他会把请求(request)发送给 **url** 的第二个参数 **view function**。**urlpatterns**中的顺序很重要，因为Django一旦找到匹配就会停止搜索。如果 Django 在 URLconf 中没有找到匹配项，他会通过 **Page Not Found** 的错误处理代码抛出一个 **404** 异常。

这是 **url** 方法的剖析：
```python
def url(regex, view, kwargs=None, name=None):
    # ...
```

 - **regex**： 匹配 URL patterns 的正则表达式。注意：正则表达式会忽略掉 **GET** 或者 **POST** 的参数。在一个 **http://127.0.0.1:8000/boards/?page=2** 的请求中，只有 **/boards/** 会被处理。
 - **view**： view 的方法被用来处理用户请求所匹配的 URL，它也接受 被用于引用外部的 **urls.py** 文件的 **django.conf.urls.include** 函数的返回。例如你可以使用它来定义一组特定于应用的URLs，使用前缀将其包含在根 URLconf 中。我们会在后面继续探讨这个概念。
 - **kwargs**：传递给目标视图的任意关键字参数，它通常用于在可重用视图上进行一些简单的定制，我们不是经常使用它。
 - **name:**：给定 URL 的唯一标识符。他是一个非常重要的特征。要始终记得为你的 URLs 命名。所以，很重要的一点是：不要在 views(视图) 或者 templates(模板) 中写很复杂的 URLs 代码, 并始终通过它的名字去引用 URLs。


  [1]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/wireframe-topics.png