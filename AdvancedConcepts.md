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

## URLs 
随着我们项目的开发，我们现在需要有一个属于 **Board** 的展示所有 **topics** 的页面。总结来说，就如你在上个课程所看到的线框图:

![此处输入图片的描述][2]


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

现在让我们分析一下 `urlpatterns` 和 `url`。

**URL dispatcher** 和 **URLconf (URL configuration)** 是Django 应用中的基础部分。在开始的时候，这个看起来让人很困惑；我记得我第一次开始使用 Django 开发的时候也有一段时间学起来很困难。

现在 Django 开发者在致力于简化路由语法。但是现在我们使用的是 1.11 版本的 Django，我们需要使用这些语法，所以让我们尝试着去了解它是怎么工作的。

一个项目可以有很多 **urls.py** 分布在应用中。Django 需要一个 **url.py** 去作为起点。这个特别的 **urls.py** 叫做 **root URLconf**。它被定义在 **settings.py** 中。

**myproject/settings.py**

```python
ROOT_URLCONF = 'myproject.urls'
```

它已经自动配置好了，你不需要去改变它任何东西。

当 Django 接受一个请求(request)， 它就会在项目的 URLconf 中寻找匹配项。他从 `urlpatterns` 变量的第一条开始，然后在每个 `url` 中去测试出请求的 URL。

如果 Django 找到了一个匹配路径，他会把请求(request)发送给 `url` 的第二个参数 **view function**。`urlpatterns` 中的顺序很重要，因为Django一旦找到匹配就会停止搜索。如果 Django 在 URLconf 中没有找到匹配项，他会通过 **Page Not Found** 的错误处理代码抛出一个 **404** 异常。

这是 `url` 方法的剖析：
```python
def url(regex, view, kwargs=None, name=None):
    # ...
```

 - **regex**： 匹配 URL patterns 的正则表达式。注意：正则表达式会忽略掉 **GET** 或者 **POST** 的参数。在一个 **http://127.0.0.1:8000/boards/?page=2** 的请求中，只有 **/boards/** 会被处理。
 - **view**： view 的方法被用来处理用户请求所匹配的 URL，它也接受 被用于引用外部的 **urls.py** 文件的 **django.conf.urls.include** 函数的返回。例如你可以使用它来定义一组特定于应用的URLs，使用前缀将其包含在根 URLconf 中。我们会在后面继续探讨这个概念。
 - **kwargs**：传递给目标视图的任意关键字参数，它通常用于在可重用视图上进行一些简单的定制，我们不是经常使用它。
 - **name:**：给定 URL 的唯一标识符。他是一个非常重要的特征。要始终记得为你的 URLs 命名。所以，很重要的一点是：不要在 views(视图) 或者 templates(模板) 中写很复杂的 URLs 代码, 并始终通过它的名字去引用 URLs。

![此处输入图片的描述][3]
 图2.1：在练习中你不需要成为正则表达式专家
 图2.2：你只需要学会怎么样去匹配简单的 patterns
 图2.3：我在后面会向你展示实用的 URL patterns
 
----------

## Basic URLs

Basic URLs 创建起来很容易。就只是个匹配字符串的问题。比如说，我们想创建一个 "about" 页面，可以这样定义：
```python
from django.conf.urls import url
from boards import views

urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^about/$', views.about, name='about'),
]
```

我们也可以创建更深层一点的 URL 结构
```python
from django.conf.urls import url
from boards import views

urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^about/$', views.about, name='about'),
    url(r'^about/company/$', views.about_company, name='about_company'),
    url(r'^about/author/$', views.about_author, name='about_author'),
    url(r'^about/author/vitor/$', views.about_vitor, name='about_vitor'),
    url(r'^about/author/erica/$', views.about_erica, name='about_erica'),
    url(r'^privacy/$', views.privacy_policy, name='privacy_policy'),
]
```

这是一些简单的 URL 路由的例子，对于上面所有的例子，view function(视图函数)都遵守下面这个结构：
```python
def about(request):
    # do something...
    return render(request, 'about.html')

def about_company(request):
    # do something else...
    # return some data along with the view...
    return render(request, 'about_company.html', {'company_name': 'Simple Complex'})
```

## Advanced URLs

通过正则表达式来匹配某些类型的数据并创建动态 URL，可以实现更高级的 URL 路由。

例如，要创建一个个人资料的页面，诸如 github.com/vitorfs or twitter.com/vitorfs(vitorfs 是我的用户名) 这样，我们可以像以下几点这样做：

```python
from django.conf.urls import url
from boards import views

urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^(?P<username>[\w.@+-]+)/$', views.user_profile, name='user_profile'),
]
```

它会匹配 Django 用户模型里面所有有效的用户名。

现在我们可以看到上面的例子是一个很宽松的 URL。这意味大量的 URL patterns 都会被它匹配，因为它定义在 URL 的根，而不像 **/profile/<username>/** 这样。在这种情况下，如果我们想定义一个 **/about/** 的URL，我们要把它定义在这个用户名 URL pattern 前面：

```python
from django.conf.urls import url
from boards import views

urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^about/$', views.about, name='about'),
    url(r'^(?P<username>[\w.@+-]+)/$', views.user_profile, name='user_profile'),
]
```

如果这个 "about" 页面定义在用户名 URL pattern 后面，Django 将永远找不到它，因为 "about" 这个单词会被用户名的正则表达式所匹配到，视图函数 `user_profile` 将会被执行而不是执行 `about`。

这有一些副作用。例如，从现在开始，我们要把 "about" 视为禁止使用的用户名，因为如果有用户将 "about" 作为他们的用户名，他们将永远不能看到他们的个人资料页面。

![此处输入图片的描述][4]
图1：*urlpatterns* 中 URLs 的顺序很重要
图2：匹配规则宽松的 URL 正则表达式应该总是放在后面
图3：所以，记住这几点！要经常测试你的路由。


----------

这些 URL 路由的主要思想是当 URL 的一部分被当作某些资源(这些资源用来构成某个页面)的标识的时候就去创建一个动态的页面。比如说，这个标识可以是一个整数的 ID 或者是一个字符串。

原来的时候，我们使用使用 **Board** ID 去创建 **Topics** 的动态页面。让我们再来看一下我在 **URLs** 开头的部分给出的例子：

```python
url(r'^boards/(?P<pk>\d+)/$', views.board_topics, name='board_topics')
```

正则表达式中的 `\d+` 会匹配一个任意大小的整数值。这个整数值用来从数据库中取到 **Board**。现在注意我们这样写这个正则表达式 `(?P<pk>\d+)`，这是告诉 Django 将捕获到的值放入名为 **pk** 的关键字参数中。

这是我们为它写的一个 view function(视图函数)：

```python
def board_topics(request, pk):
    # do something...
```

因为我们使用了 `(?P<pk>\d+)` 正则表达式，在 `board_topics` 中的关键字参数必须命名为 **pk**。

如果我们想使用任意的名字，我们可以这样做：

```python
url(r'^boards/(\d+)/$', views.board_topics, name='board_topics')
```

然后 view function(视图函数) 可以这样定义：

```python
def board_topics(request, board_id):
    # do something...
```

或者这样：

```python
def board_topics(request, id):
    # do something...
```

名字无关紧要，但是使用命名参数是一个很好的做法，因为当我们开始编写需要匹配大量的 ID 和变量的更大规模的 URLs 时，这会更便于我们阅读。

  [1]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/wireframe-topics.png
  [2]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/wireframe-topics.png
  [3]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/Pixton_Comic_URL_Patterns.png
  [4]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/Pixton_Comic_The_Order_Matters.png