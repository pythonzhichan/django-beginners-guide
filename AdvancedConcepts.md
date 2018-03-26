-AdvancedConcepts.md
-
-https://simpleisbetterthancomplex.com/series/2017/09/18/a-complete-beginners-guide-to-django-part-3.html
-

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
 图1：在练习中你不需要成为正则表达式专家
 图2：你只需要学会怎么样去匹配简单的 patterns
 图3：我在后面会向你展示实用的 URL patterns
 
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

**Using the URLs API**

现在到了写代码的时候了。让我们来实现我在 **URL** 部分开头提到的 topic 列表页面（参见[Figure 1][5]）

首先，编辑 **urls.py**， 添加我们新的 URL 路由

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

现在，让我们来创建 view function(视图函数) `board_topics`：

**boards/views.py**
```python
from django.shortcuts import render
from .models import Board

def home(request):
    # code suppressed for brevity

def board_topics(request, pk):
    board = Board.objects.get(pk=pk)
    return render(request, 'topics.html', {'board': board})
```

在 **templates** 文件夹里面，创建一个新的名为 **topics.html** 的模板：

**templates/topics.html**
```html
{% load static %}<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>{{ board.name }}</title>
    <link rel="stylesheet" href="{% static 'css/bootstrap.min.css' %}">
  </head>
  <body>
    <div class="container">
      <ol class="breadcrumb my-4">
        <li class="breadcrumb-item">Boards</li>
        <li class="breadcrumb-item active">{{ board.name }}</li>
      </ol>
    </div>
  </body>
</html>
```
`注意：我们现在只是创建新的 HTML 模板。不用担心，在下一节中我会向你展示如何创建可重用模板。`

现在在浏览器中打开 URL **http://127.0.0.1:8000/boards/1/**，结果应该是下面这个页面：

![此处输入图片的描述][6]

现在到了写一些测试的时候了！编辑 **test.py**，在文件底部添加下面的测试：

**boards/tests.py**
```python 
from django.core.urlresolvers import reverse
from django.urls import resolve
from django.test import TestCase
from .views import home, board_topics
from .models import Board

class HomeTests(TestCase):
    # ...

class BoardTopicsTests(TestCase):
    def setUp(self):
        Board.objects.create(name='Django', description='Django board.')

    def test_board_topics_view_success_status_code(self):
        url = reverse('board_topics', kwargs={'pk': 1})
        response = self.client.get(url)
        self.assertEquals(response.status_code, 200)

    def test_board_topics_view_not_found_status_code(self):
        url = reverse('board_topics', kwargs={'pk': 99})
        response = self.client.get(url)
        self.assertEquals(response.status_code, 404)

    def test_board_topics_url_resolves_board_topics_view(self):
        view = resolve('/boards/1/')
        self.assertEquals(view.func, board_topics)
```

这里需要注意几件事情。这次我们使用了 `setUp` 方法。在这个方法中，我们创建了一个 **Board** 实例来用于测试。我们必须这样做，因为 Django 的测试机制不会针对当前数据库跑你的测试。运行 Django 测试时会即时创建一个新的数据库，使用所有的迁移 model(模型)，运行测试，完成后销毁这个用于测试的数据库。

因此在 `setUp` 方法中，我们准备了运行测试的环境，用来模拟场景。

 - `test_board_topics_view_success_status_code` 方法：测试 Django 是否对于现有的 **Board** 返回 status code(状态码) 200(成功)。
 - `test_board_topics_view_not_found_status_code` 方法：测试 Django 是否对于不存在与数据库的 **Board** 返回 status code 404(页面未找到)。
 - `test_board_topics_url_resolves_board_topics_view ` 方法：测试 Django 是否使用正确的视图函数去渲染 topics。

现在来运行一下测试：

```python
python manage.py test
```

输出如下：
```python
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
.E...
======================================================================
ERROR: test_board_topics_view_not_found_status_code (boards.tests.BoardTopicsTests)
----------------------------------------------------------------------
Traceback (most recent call last):
# ...
boards.models.DoesNotExist: Board matching query does not exist.

----------------------------------------------------------------------
Ran 5 tests in 0.093s

FAILED (errors=1)
Destroying test database for alias 'default'...
```

测试 **test_board_topics_view_not_found_status_code** 失败。我们可以在 Traceback 中看到他返回了一个 exception(异常) “boards.models.DoesNotExist: Board matching query does not exist.”

![此处输入图片的描述][7]

在 `DEBUG=False` 的生产环境中，访问者会看到一个 **500 Internal Server Error** 的页面。但是这不是我们希望得到的。

我们想要一个 **404 Page Not Found** 的页面。让我们来重写我们的 view。

**boards/views.py**

```python
from django.shortcuts import render
from django.http import Http404
from .models import Board

def home(request):
    # code suppressed for brevity

def board_topics(request, pk):
    try:
        board = Board.objects.get(pk=pk)
    except Board.DoesNotExist:
        raise Http404
    return render(request, 'topics.html', {'board': board})
```

重新测试一下：

```python
python manage.py test
```

```python
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
.....
----------------------------------------------------------------------
Ran 5 tests in 0.042s

OK
Destroying test database for alias 'default'...
```

好极了！现在它按照预期工作。

![此处输入图片的描述][8]

这是 Django 在 `DEBUG=False` 的情况下显示的默认页面。稍后，我们可以自定义 404 页面去显示一些其他的东西。

这是一个常见的用法。事实上， Django 有一个快捷方式去得到一个对象，或者返回一个不存在的对象 404。

因此让我们再来重写一下 **board_topics**：

```python
from django.shortcuts import render, get_object_or_404
from .models import Board

def home(request):
    # code suppressed for brevity

def board_topics(request, pk):
    board = get_object_or_404(Board, pk=pk)
    return render(request, 'topics.html', {'board': board})
```

修改了代码？测试一下。
```python
python manage.py test
```

```python
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
.....
----------------------------------------------------------------------
Ran 5 tests in 0.052s

OK
Destroying test database for alias 'default'...
```

没有破坏任何东西。我们可以继续我们的开发。

下一步是在屏幕上创建一个导航链接。主页应该有一个链接指引访问者去访问给出的 **Board** 的 topics 页面。同样的，topics 页面也应当有一个返回主页的链接。

![此处输入图片的描述][9]

我们可以先为 `HomeTests` 类编写一些测试：

**boards/test.py**

```python
class HomeTests(TestCase):
    def setUp(self):
        self.board = Board.objects.create(name='Django', description='Django board.')
        url = reverse('home')
        self.response = self.client.get(url)

    def test_home_view_status_code(self):
        self.assertEquals(self.response.status_code, 200)

    def test_home_url_resolves_home_view(self):
        view = resolve('/')
        self.assertEquals(view.func, home)

    def test_home_view_contains_link_to_topics_page(self):
        board_topics_url = reverse('board_topics', kwargs={'pk': self.board.pk})
        self.assertContains(self.response, 'href="{0}"'.format(board_topics_url))
```

注意到现在我们同样在 **HomeTests** 中添加了 **setUp** 方法。这是因为我们现在需要一个 **Board** 实例，并且我们将 **url** 和 **response** 移到了 **setUp**，所以我们能在新测试中重用相同的 response。

这里的新测试是 **test_home_view_contains_link_to_topics_page**。这里我们使用 **assertContains** 方法来测试 response 主体部分是否包含给定的文本。我们在测试中使用的文本是 `a` 标签的 `href` 部分。所以基本上我们是在测试 response 主体是否包含文本 `href="/boards/1/"`。

让我们运行这个测试：

```python
python manage.py test
```

```python
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
....F.
======================================================================
FAIL: test_home_view_contains_link_to_topics_page (boards.tests.HomeTests)
----------------------------------------------------------------------
# ...

AssertionError: False is not true : Couldn't find 'href="/boards/1/"' in response

----------------------------------------------------------------------
Ran 6 tests in 0.034s

FAILED (failures=1)
Destroying test database for alias 'default'...
```

现在我们可以编写能通过这个测试的代码。

编写 **home.html** 模板：

**templates/home.html**

```html
<!-- code suppressed for brevity -->
<tbody>
  {% for board in boards %}
    <tr>
      <td>
        <a href="{% url 'board_topics' board.pk %}">{{ board.name }}</a>
        <small class="text-muted d-block">{{ board.description }}</small>
      </td>
      <td class="align-middle">0</td>
      <td class="align-middle">0</td>
      <td></td>
    </tr>
  {% endfor %}
</tbody>
<!-- code suppressed for brevity -->
```

基本上我们是改动了这一行：

```python
{{ board.name }}
```

变为：

```html
<a href="{% url 'board_topics' board.pk %}">{{ board.name }}</a>
```

始终使用 `{% url %}` 模板标签去写应用的 URL。第一个参数是 URL 的名字(定义在 URLconf， 即 **urls.py**)，然后你可以根据需求传递任意数量的参数。

如果是一个像主页这种简单的 URL, 那就是 `{% url 'home' %}`。
保存文件然后再运行一下测试：

```python
python manage.py test
```

```python
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
......
----------------------------------------------------------------------
Ran 6 tests in 0.037s

OK
Destroying test database for alias 'default'...
```

很棒！现在我们可以看到它在浏览器是什么样子。

![此处输入图片的描述][10]

现在轮到返回的链接了，我们可以先写测试：

**boards/tests.py**

```python
class BoardTopicsTests(TestCase):
    # code suppressed for brevity...

    def test_board_topics_view_contains_link_back_to_homepage(self):
        board_topics_url = reverse('board_topics', kwargs={'pk': 1})
        response = self.client.get(board_topics_url)
        homepage_url = reverse('home')
        self.assertContains(response, 'href="{0}"'.format(homepage_url))
```

运行测试：

```python
python manage.py test
```

```python
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
.F.....
======================================================================
FAIL: test_board_topics_view_contains_link_back_to_homepage (boards.tests.BoardTopicsTests)
----------------------------------------------------------------------
Traceback (most recent call last):
# ...

AssertionError: False is not true : Couldn't find 'href="/"' in response

----------------------------------------------------------------------
Ran 7 tests in 0.054s

FAILED (failures=1)
Destroying test database for alias 'default'...
```

更新 board topics template：

**templates/topics.html**

```python
{% load static %}<!DOCTYPE html>
<html>
  <head><!-- code suppressed for brevity --></head>
  <body>
    <div class="container">
      <ol class="breadcrumb my-4">
        <li class="breadcrumb-item"><a href="{% url 'home' %}">Boards</a></li>
        <li class="breadcrumb-item active">{{ board.name }}</li>
      </ol>
    </div>
  </body>
</html>
```

运行测试：

```python
python manage.py test
```

```python
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
.......
----------------------------------------------------------------------
Ran 7 tests in 0.061s

OK
Destroying test database for alias 'default'...
```

![此处输入图片的描述][11]

就如我之前所说的， URL 路由是一个 web 应用程序的基本组成部分。有了这些知识，我们才能继续开发。下一步是完成 URL 的部分，你会看到一些总结的有用的 URL patterns。


**List of Useful URL Patterns**

技巧部分是正则表达式。我准备了一个最常用的 URL patterns 的列表。当你需要一个特定的 URL 时你可以参考这个列表。

**Primary Key AutoField**


----------

**Regex(正则表达式)**     `(?P<pk>\d+)`


----------

**Example(举例)**    `url(r'^questions/(?P<pk>\d+)/$', views.question, name='question')`


----------

**Valid URL(有效的 URL)**    `	/questions/934/`


----------

**Captures(捕获数据)**    `	{'pk': '934'}`

----------


**Slug Field**

----------

**Regex(正则表达式)**     `(?P<slug>[-\w]+)`


----------

**Example(举例)**    `url(r'^posts/(?P<slug>[-\w]+)/$', views.post, name='post')`


----------

**Valid URL(有效的 URL)**    `	/posts/hello-world/`


----------

**Captures(捕获数据)**    `{'slug': 'hello-world'}`


----------

**Slug Field with Primary Key**

----------

**Regex(正则表达式)**     `(?P<slug>[-\w]+)-(?P<pk>\d+)`


----------

**Example(举例)**    `url(r'^blog/(?P<slug>[-\w]+)-(?P<pk>\d+)/$', views.blog_post, name='blog_post')`


----------

**Valid URL(有效的 URL)**    `/blog/hello-world-159/`


----------

**Captures(捕获数据)**    `{'slug': 'hello-world', 'pk': '159'}`


----------

**Django User Username**

----------

**Regex(正则表达式)**     `(?P<username>[\w.@+-]+)`


----------

**Example(举例)**    `url(r'^profile/(?P<username>[\w.@+-]+)/$', views.user_profile, name='user_profile')`


----------

**Valid URL(有效的 URL)**    `/profile/vitorfs/`


----------

**Captures(捕获数据)**    `	{'username': 'vitorfs'}`


----------

**Year**

----------

**Regex(正则表达式)**     `(?P<year>[0-9]{4})`


----------

**Example(举例)**    `url(r'^articles/(?P<year>[0-9]{4})/$', views.year_archive, name='year')`


----------

**Valid URL(有效的 URL)**    `/articles/2016/`


----------

**Captures(捕获数据)**    `{'year': '2016'}`


----------

**Year / Month**

----------

**Regex(正则表达式)**     `(?P<year>[0-9]{4})/(?P<month>[0-9]{2})`


----------

**Example(举例)**    `url(r'^articles/(?P<year>[0-9]{4})/(?P<month>[0-9]{2})/$', views.month_archive, name='month')`


----------

**Valid URL(有效的 URL)**    `/articles/2016/01/`


----------

**Captures(捕获数据)**    `{'year': '2016', 'month': '01'}`


----------

你可以在这篇文章中看到更多关于这些 patterns 的细节：[List of Useful URL Patterns][12]。


----------

**Reusable Templates**

到目前为止，我们一直在复制和粘贴 HTML 文档的多个部分。从长远来看是不可行的。这也是一个坏的做法。

在这一节我们将重写我们的 HTML 模板，创建一个 **master page(母版页)**，只为每个模板添加它所独特的部分。

在 **templates** 文件夹中创建一个名为 **base.html** 的文件：

**templates/base.html**

```html
{% load static %}<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>{% block title %}Django Boards{% endblock %}</title>
    <link rel="stylesheet" href="{% static 'css/bootstrap.min.css' %}">
  </head>
  <body>
    <div class="container">
      <ol class="breadcrumb my-4">
        {% block breadcrumb %}
        {% endblock %}
      </ol>
      {% block content %}
      {% endblock %}
    </div>
  </body>
</html>
```

这是我们的母版页。每个我们创建的模板都 **extend(继承)** 这个特殊的模板。现在看到我们的 `{% block %}` 标签。它用于在模板中保留一个空间，一个"子"模板(继承这个母版页的模板)可以在这个空间中插入代码和 HTML。

在 `{% block title %}` 中我们还设置了一个默认值 "Django Boards."。如果我们在子模板中未设置 `{% block title %}` 的值它就会被使用。

现在让我们重写我们的两个模板： **home.html** 和 **topics.html**。

**templates/home.html**

```html
{% extends 'base.html' %}

{% block breadcrumb %}
  <li class="breadcrumb-item active">Boards</li>
{% endblock %}

{% block content %}
  <table class="table">
    <thead class="thead-inverse">
      <tr>
        <th>Board</th>
        <th>Posts</th>
        <th>Topics</th>
        <th>Last Post</th>
      </tr>
    </thead>
    <tbody>
      {% for board in boards %}
        <tr>
          <td>
            <a href="{% url 'board_topics' board.pk %}">{{ board.name }}</a>
            <small class="text-muted d-block">{{ board.description }}</small>
          </td>
          <td class="align-middle">0</td>
          <td class="align-middle">0</td>
          <td></td>
        </tr>
      {% endfor %}
    </tbody>
  </table>
{% endblock %}
```

**home.html** 的第一行是 `{% extends 'base.html' %}`。这个标签用来告诉 Django 使用 **base.html** 作为母版页。之后，我们使用 *blocks* 来放置这个页面独有的部分。

**templates/topics.html**

```html
{% extends 'base.html' %}

{% block title %}
  {{ board.name }} - {{ block.super }}
{% endblock %}

{% block breadcrumb %}
  <li class="breadcrumb-item"><a href="{% url 'home' %}">Boards</a></li>
  <li class="breadcrumb-item active">{{ board.name }}</li>
{% endblock %}

{% block content %}
    <!-- just leaving it empty for now. we will add core here soon. -->
{% endblock %}
```

在 **topics.html** 中，我们改变了 `{% block title %}` 的默认值。注意我们可以通过调用 `{{ block.super }}` 来重用 block 的默认值。这里我们使用的网页标题是 **base.html** 中定义的 "Django Boards"。所以对于 "Python" 的 board 页面，这个标题是 "Python - Django Boards",对于 "Random" board 标题会是 "Random - Django Boards"。

现在我们运行测试然后会看到我们没有破坏任何东西：

```python
python manage.py test
```

```python
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
.......
----------------------------------------------------------------------
Ran 7 tests in 0.067s

OK
Destroying test database for alias 'default'...
```

棒极了！一切看起来都很成功。

现在我们有了 **bast.html** 模板，我们可以很轻松地在顶部添加一个菜单块：

**templates/base.html**

```html
{% load static %}<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>{% block title %}Django Boards{% endblock %}</title>
    <link rel="stylesheet" href="{% static 'css/bootstrap.min.css' %}">
  </head>
  <body>

    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a class="navbar-brand" href="{% url 'home' %}">Django Boards</a>
      </div>
    </nav>

    <div class="container">
      <ol class="breadcrumb my-4">
        {% block breadcrumb %}
        {% endblock %}
      </ol>
      {% block content %}
      {% endblock %}
    </div>
  </body>
</html>
```

![此处输入图片的描述][13]
  
![此处输入图片的描述][14]

我使用的 HTML 是 [Bootstrap 4 Navbar 组件][15] 的一部分。

我喜欢的一个比较好的改动是改变页面的 "logo"(`.navbar-brand`)。

前往 [fonts.google.com][16]，输入 "Django Boards" 或者任何你项目给定的名字然后点击 **apply to all fonts(应用于所有字体)**。浏览一下，找到一个你喜欢的字体。

![此处输入图片的描述][17]

在 **bast.html** 模板中添加这个字体：

```python
{% load static %}<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>{% block title %}Django Boards{% endblock %}</title>
    <link href="https://fonts.googleapis.com/css?family=Peralta" rel="stylesheet">
    <link rel="stylesheet" href="{% static 'css/bootstrap.min.css' %}">
    <link rel="stylesheet" href="{% static 'css/app.css' %}">
  </head>
  <body>
    <!-- code suppressed for brevity -->
  </body>
</html>
```

现在在 **static/css** 文件夹中创建一个新的 CSS 文件命名为 **app.css**：

**static/css/app.css**

```css
.navbar-brand {
  font-family: 'Peralta', cursive;
}
```

![此处输入图片的描述][18]


**Forms**

Forms(表单) 用来处理我们的输入。这在任何 web 应用或者网站中都是很常见的任务。标准的做法是通过 HTML 表单实现，用户输入一些数据，将其提交给服务器，然后服务器处理它。

![此处输入图片的描述][19]
图1：你会在这个 *Django Boards* 应用中取什么用户名？
图2：我想会是 **Ball');DROP TABLE auth_user;--**。 哈哈哈！
图3：**所有的输入都是恶意非法的！**我们不能相信用户的输入。

表单处理是一项非常复杂的任务，因为它涉及到与应用多个层面的交互。有很多需要关心的问题。例如，提交给服务器的所有数据都是字符串的形式，所以在我们使用它之前需要将其转换为需要的数据类型(整形，浮点型，日期等)。我们必须验证有关应用程序业务逻辑的数据。我们还需要妥善地清理和审查数据，以避免一些诸如 SQL 注入和 XSS 攻击等安全问题。

好消息是，Django Forms API 使整个过程变的更加简单，从而实现了大量工作的自动化。而且，最终的结果比大多数程序员自己去实现的代码更加安全。所以，不管 HTML 的表单多么简单，总是使用表单 API。


**How Not Implement a Form**

起初，我想直接跳到表单 API。但是我觉得花点时间去了解一下表单处理的基本细节是一个不错的主意。否则，这玩意儿将会看起来像魔术一样，这是一件坏事，因为当出现错误时，你将不知道怎么去找到问题所在。

随着对一些编程概念的深入理解，我们可以感觉到自己能更好地掌控一些情况。掌控是很重要的，因为它让我们写代码的时候更有信心。一旦我们能确切地知道发生了什么，实现可预见行为的代码就容易多了。调试和查找错误也变得很容易，因为你知道在哪里去查找。

无论如何，让我们开始实现下面的表单：

![此处输入图片的描述][20]

这是我们在前一个教程绘制的一个线框图。我现在意识到这个可能是一个不好的例子，因为这个特殊的表单涉及到处理两个不同 model 的数据：**Topic**(subject) 和 **Post**(message)。

还有一点很重要的我们到现在为止还没讨论过，就是用户认证。我们应该只为认证过的用户去显示这个页面。通过这种方式，我们能知道是创建了 **Topic** 或者 **Post**。

现在让我们抽象一些细节，重点了解一下怎么在数据库中保存用户的输入。

首先，先创建一个新的 URL 路由，命名为 **new_topic**：

**myproject/urls.py**

```python
from django.conf.urls import url
from django.contrib import admin

from boards import views

urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^boards/(?P<pk>\d+)/$', views.board_topics, name='board_topics'),
    url(r'^boards/(?P<pk>\d+)/new/$', views.new_topic, name='new_topic'),
    url(r'^admin/', admin.site.urls),
]
```

我们创建的这个 URL 能帮我们确定正确的 **Board**

现在来创建 **new_topic** 的 view function(视图函数)：

**boards/views.py**

```python
from django.shortcuts import render, get_object_or_404
from .models import Board

def new_topic(request, pk):
    board = get_object_or_404(Board, pk=pk)
    return render(request, 'new_topic.html', {'board': board})
```

目前为止， **new_topic** 的视图函数看起来和 **board_topics** 恰好相同。这是故意的，让我们一步步地来。

现在我们需要一个名为 **new_topic.html** 的模板：

**templates/new_topic.html**

```html
{% extends 'base.html' %}

{% block title %}Start a New Topic{% endblock %}

{% block breadcrumb %}
  <li class="breadcrumb-item"><a href="{% url 'home' %}">Boards</a></li>
  <li class="breadcrumb-item"><a href="{% url 'board_topics' board.pk %}">{{ board.name }}</a></li>
  <li class="breadcrumb-item active">New topic</li>
{% endblock %}

{% block content %}

{% endblock %}
```

现在我们只有 breadcrumb 保证了导航。注意我们在 URL 中包含了 **board_topics** 视图的返回。

打开 URL **http://127.0.0.1:8000/boards/1/new/**。显示结果是下面这个页面：

![此处输入图片的描述][21]

我们依然还没有实现到达这个新页面的方法，但是如果我们将 URL 改为 **http://127.0.0.1:8000/boards/2/new/**，它会把我们带到 **Python Board** 的页面：

![此处输入图片的描述][22]

`注意：
如果你没有跟着上一节课程一步步地做，你的结果和我的可能有些不一样。在我这个例子中，我的数据库有 3 个 **Board** 实例，分别是 Django = 1, Python = 2, 和 Random = 3。这些数字是数据库中的 ID，用来找到正确的资源。
`

我们可以增加一些测试了：

**boards/tests.py**

```python
from django.core.urlresolvers import reverse
from django.urls import resolve
from django.test import TestCase
from .views import home, board_topics, new_topic
from .models import Board

class HomeTests(TestCase):
    # ...

class BoardTopicsTests(TestCase):
    # ...

class NewTopicTests(TestCase):
    def setUp(self):
        Board.objects.create(name='Django', description='Django board.')

    def test_new_topic_view_success_status_code(self):
        url = reverse('new_topic', kwargs={'pk': 1})
        response = self.client.get(url)
        self.assertEquals(response.status_code, 200)

    def test_new_topic_view_not_found_status_code(self):
        url = reverse('new_topic', kwargs={'pk': 99})
        response = self.client.get(url)
        self.assertEquals(response.status_code, 404)

    def test_new_topic_url_resolves_new_topic_view(self):
        view = resolve('/boards/1/new/')
        self.assertEquals(view.func, new_topic)

    def test_new_topic_view_contains_link_back_to_board_topics_view(self):
        new_topic_url = reverse('new_topic', kwargs={'pk': 1})
        board_topics_url = reverse('board_topics', kwargs={'pk': 1})
        response = self.client.get(new_topic_url)
        self.assertContains(response, 'href="{0}"'.format(board_topics_url))
```

关于我们的测试中新的 NewTopicTests 类的快速总结：

 - **setUp**：创建一个测试中使用的 **Board** 实例
 - **test_new_topic_view_success_status_cod**：检查发给 view 的请求是否成功
 - **test_new_topic_view_not_found_status_code**：检查当 **Board** 不存在时 view 是否会抛出一个 404 的错误
 - **test_new_topic_url_resolves_new_topic_view**：检查是否正在使用正确的 view
 - **test_new_topic_view_contains_link_back_to_board_topics_view**：确保导航能回到 topics 的列表

运行测试：

```python
python manage.py test
```

```python
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
...........
----------------------------------------------------------------------
Ran 11 tests in 0.076s

OK
Destroying test database for alias 'default'...
```

成功，现在我们可以去开始创建表单了。

**templates/new_topic.html**

```html
{% extends 'base.html' %}

{% block title %}Start a New Topic{% endblock %}

{% block breadcrumb %}
  <li class="breadcrumb-item"><a href="{% url 'home' %}">Boards</a></li>
  <li class="breadcrumb-item"><a href="{% url 'board_topics' board.pk %}">{{ board.name }}</a></li>
  <li class="breadcrumb-item active">New topic</li>
{% endblock %}

{% block content %}
  <form method="post">
    {% csrf_token %}
    <div class="form-group">
      <label for="id_subject">Subject</label>
      <input type="text" class="form-control" id="id_subject" name="subject">
    </div>
    <div class="form-group">
      <label for="id_message">Message</label>
      <textarea class="form-control" id="id_message" name="message" rows="5"></textarea>
    </div>
    <button type="submit" class="btn btn-success">Post</button>
  </form>
{% endblock %}
```

这是一个使用 Bootstrap 4 提供的 CSS 类手动创建的 HTML 表单。它看起来是这个样子：

![此处输入图片的描述][23]

在 `<form>` 标签中，我们定义了 `method` 属性。它会告诉浏览器我们想如何与服务器通信。HTTP 规范定义了几种 request methods(请求方法)。但是在大部分情况下，我们只需要使用 **GET** 和 **POST** 两种 request(请求)类型。

**GET** 可能是最常见的请求类型了。它用于从服务器请求数据。每当你点击了一个连接或者直接在浏览器中输入了一个网址时，你就创建一个一个 **GET** 请求。

**POST** 用于当我们想更改服务器上的数据的时候。一般来说，每次我们发送数据给服务器都会导致资源状态的变化，我们应该使用 **POST** 请求发送数据。

Django 使用 **CSRF Token**(Cross-Site Request Forgery Token) 保护所有的 **POST** 请求。这是一个避免外部站点或者应用程序向我们的应用程序提交数据的安全措施。应用程序每次接收一个 **POST** 时，都会先检查 **CSRF Token**。如果这个 request 没有 token，或者这个 token() 是无效的，它就会抛弃提交的数据。

**csrf_token** 的模板标签：

```html
{% csrf_token %}
```

它是与其他表单数据一起提交的隐藏字段：

```html
<input type="hidden" name="csrfmiddlewaretoken" value="jG2o6aWj65YGaqzCpl0TYTg5jn6SctjzRZ9KmluifVx0IVaxlwh97YarZKs54Y32">
```

另外一件事是，我们需要设置 HTML 输入的 **name**，**name** 将被用来在服务器检索数据。

```html
<input type="text" class="form-control" id="id_subject" name="subject">
<textarea class="form-control" id="id_message" name="message" rows="5"></textarea>
```

下面是示范我们如何检索数据：

```python
subject = request.POST['subject']
message = request.POST['message']
```

所以，从 HTML 获取数据并且开始一个新的 topic 视图的简单实现可以这样写：

```python
from django.contrib.auth.models import User
from django.shortcuts import render, redirect, get_object_or_404
from .models import Board, Topic, Post

def new_topic(request, pk):
    board = get_object_or_404(Board, pk=pk)

    if request.method == 'POST':
        subject = request.POST['subject']
        message = request.POST['message']

        user = User.objects.first()  # TODO: get the currently logged in user

        topic = Topic.objects.create(
            subject=subject,
            board=board,
            starter=user
        )

        post = Post.objects.create(
            message=message,
            topic=topic,
            created_by=user
        )

        return redirect('board_topics', pk=board.pk)  # TODO: redirect to the created topic page

    return render(request, 'new_topic.html', {'board': board})
```

这个视图函数只考虑能接收数据并且保存进数据库的乐观合法的 path，但是还缺少一些部分。我们没有验证数据。用户可以提交空表单或者提交一个大于 255 个字符的 **subject**。

到目前为止我们都在对 **User** 字段进行硬编码，因为我们还没有实现身份验证。有一个简单的方法来识别登录的用户。我们会在下一个课程将这一块。此外，我们还没有实现列出 topic 的所有 posts 的视图，实现了它，我们就可以将用户重定向到列出所有 board topics 的页面。

![此处输入图片的描述][24]

点击 **Post** 按钮提交表单：

![此处输入图片的描述][25]

看起来成功了。但是我们还没有实现 topic 的列表页面，所以没有东西可以看。让我们来编辑 **templates/topics.html** 来实现一个合适的列表：

**templates/topics.html**

```html
{% extends 'base.html' %}

{% block title %}
  {{ board.name }} - {{ block.super }}
{% endblock %}

{% block breadcrumb %}
  <li class="breadcrumb-item"><a href="{% url 'home' %}">Boards</a></li>
  <li class="breadcrumb-item active">{{ board.name }}</li>
{% endblock %}

{% block content %}
  <table class="table">
    <thead class="thead-inverse">
      <tr>
        <th>Topic</th>
        <th>Starter</th>
        <th>Replies</th>
        <th>Views</th>
        <th>Last Update</th>
      </tr>
    </thead>
    <tbody>
      {% for topic in board.topics.all %}
        <tr>
          <td>{{ topic.subject }}</td>
          <td>{{ topic.starter.username }}</td>
          <td>0</td>
          <td>0</td>
          <td>{{ topic.last_updated }}</td>
        </tr>
      {% endfor %}
    </tbody>
  </table>
{% endblock %}
```

![此处输入图片的描述][26]

我们创建的 **Topic** 显示在这上面了。

这里有两个新概念。

我们首次使用 **Board** model 中的 **topics** 属性。**topics** 属性由 Django 使用反向关系自动创建。在之前的步骤中，我们创建了一个 **Topic** 实例：

```python
def new_topic(request, pk):
    board = get_object_or_404(Board, pk=pk)

    # ...

    topic = Topic.objects.create(
        subject=subject,
        board=board,
        starter=user
    )
```

在 `board=board` 这行，我们设置了 **Topic** model 中的 board 字段，它是 `ForeignKey(Board)`。因此，我们的 **Board** 实例就知道了与它关联的 **Topic** 实例。

之所以我们使用 `board.topics.all` 而不是 `board.topics`，是因为 `board.topics` 是一个 **Related Manager**,它与 **Model Manager** 很相似，通常在 `board.objects` 可得到。所以，要返回给定 board 的所有 topic 我们必须使用 `board.topics.all()`，要过滤一些数据，我们可以这样用 `board.topics.filter(subject__contains='Hello')`。

另一个需要注意的是，在 Python 代码中，我们必须使用括号：`board.topics.all()`，因为 `all()` 是一个方法。在使用 Django 模板语言写代码的时候，在一个 HTML 模板文件里面，我们不使用括号，就只是 `board.topics.all`。

第二件事是我们在使用 `ForeignKey`：

```html
{{ topic.starter.username }}
```

使用一个点加上属性这种写法，我们几乎可以访问 **User** model 的所有属性。如果我们想得到用户的 email，我们可以使用 `topic.starter.email`。

我们已经修改了 **topics.html** 模板，让我们创建一个能让我们转到 **new topic** 页面的按钮：

**templates/topics.html**

```html
{% block content %}
  <div class="mb-4">
    <a href="{% url 'new_topic' board.pk %}" class="btn btn-primary">New topic</a>
  </div>

  <table class="table">
    <!-- code suppressed for brevity -->
  </table>
{% endblock %}
```

![此处输入图片的描述][27]

我们可以写一个测试以确保用户可以通过此页面访问到 **New Topic** 页面：

**boards/tests.py**

```python
class BoardTopicsTests(TestCase):
    # ...

    def test_board_topics_view_contains_navigation_links(self):
        board_topics_url = reverse('board_topics', kwargs={'pk': 1})
        homepage_url = reverse('home')
        new_topic_url = reverse('new_topic', kwargs={'pk': 1})

        response = self.client.get(board_topics_url)

        self.assertContains(response, 'href="{0}"'.format(homepage_url))
        self.assertContains(response, 'href="{0}"'.format(new_topic_url))
```

我在这里基本上重命名了 **test_board_topics_view_contains_link_back_to_homepage** 方法并添加了一个额外的 `assertContains`。这个测试现在负责确保我们的 view 包含所需的导航链接。


**Testing The Form View**

在我们使用 Django 的方式编写之前的表单示例之前, 让我们先为表单处理写一些测试：

**boards/tests.py**

```python
''' new imports below '''
from django.contrib.auth.models import User
from .views import new_topic
from .models import Board, Topic, Post

class NewTopicTests(TestCase):
    def setUp(self):
        Board.objects.create(name='Django', description='Django board.')
        User.objects.create_user(username='john', email='john@doe.com', password='123')  # <- included this line here

    # ...

    def test_csrf(self):
        url = reverse('new_topic', kwargs={'pk': 1})
        response = self.client.get(url)
        self.assertContains(response, 'csrfmiddlewaretoken')

    def test_new_topic_valid_post_data(self):
        url = reverse('new_topic', kwargs={'pk': 1})
        data = {
            'subject': 'Test title',
            'message': 'Lorem ipsum dolor sit amet'
        }
        response = self.client.post(url, data)
        self.assertTrue(Topic.objects.exists())
        self.assertTrue(Post.objects.exists())

    def test_new_topic_invalid_post_data(self):
        '''
        Invalid post data should not redirect
        The expected behavior is to show the form again with validation errors
        '''
        url = reverse('new_topic', kwargs={'pk': 1})
        response = self.client.post(url, {})
        self.assertEquals(response.status_code, 200)

    def test_new_topic_invalid_post_data_empty_fields(self):
        '''
        Invalid post data should not redirect
        The expected behavior is to show the form again with validation errors
        '''
        url = reverse('new_topic', kwargs={'pk': 1})
        data = {
            'subject': '',
            'message': ''
        }
        response = self.client.post(url, data)
        self.assertEquals(response.status_code, 200)
        self.assertFalse(Topic.objects.exists())
        self.assertFalse(Post.objects.exists())
```

首先， **test.py** 文件变的越来越大。我们会尽快改进它，将测试分为几个文件。但现在，让我们先保持这个状态。

 - **setUp**：包含 `User.objects.create_user` 以创建用于测试的 **User** 实例。
 - 
 - **test_csrf**：由于 **CSRF Token** 是处理 **Post** 请求的基本部分，我们需要保证我们的 HTML 包含 token。
 - 
 - **test_new_topic_valid_post_data**：发送有效的数据并检查视图函数是否创建了 **Topic** 和 **Post** 实例。
 - 
 - **test_new_topic_invalid_post_data**：发送一个空字典来检查应用的行为。
 - 
 - **test_new_topic_invalid_post_data_empty_fields**：类似于上一个测试，但是这次我们发送一些数据。预期应用程序会验证并且拒绝空的 subject 和 message。

运行这些测试：

```python
python manage.py test
```

```python
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
........EF.....
======================================================================
ERROR: test_new_topic_invalid_post_data (boards.tests.NewTopicTests)
----------------------------------------------------------------------
Traceback (most recent call last):
...
django.utils.datastructures.MultiValueDictKeyError: "'subject'"

======================================================================
FAIL: test_new_topic_invalid_post_data_empty_fields (boards.tests.NewTopicTests)
----------------------------------------------------------------------
Traceback (most recent call last):
  File "/Users/vitorfs/Development/myproject/django-beginners-guide/boards/tests.py", line 115, in test_new_topic_invalid_post_data_empty_fields
    self.assertEquals(response.status_code, 200)
AssertionError: 302 != 200

----------------------------------------------------------------------
Ran 15 tests in 0.512s

FAILED (failures=1, errors=1)
Destroying test database for alias 'default'...
```

有一个失败的测试和一个错误。两个都与验证用户的输入有关。不要试图用当前的实现来修复它，让我们通过使用 Django Forms API 来通过这些测试


**Creating Forms The Right Way**

自从我们开始使用 Forms，我们已经走了很长一段路。终于，是时候使用 Forms API 了。

Forms API 可在模块 `django.forms` 中得到。Django 使用两种类型的 form：`forms.Form` 和 `forms.ModelForm`。`Form` 类是通用的表单实现。我们可以使用它来处理与应用程序 model 没有直接关联的数据。`ModelForm` 是 `Form` 的子类，它与 model 类相关联。
 
在 **boards** 文件夹下创建一个新的文件 `forms.py`：

**boards/forms.py**

```python
from django import forms
from .models import Topic

class NewTopicForm(forms.ModelForm):
    message = forms.CharField(widget=forms.Textarea(), max_length=4000)

    class Meta:
        model = Topic
        fields = ['subject', 'message']
```

这是我们的第一个 form。它是一个与 **Topic** model 相关联的 `ModelForm `。**Meta** 类里面 `fields` 列表中的 `subject` 引用 **Topic** 类中的 **subject** field(字段)。现在注意到我们定义了一个叫做 `message` 的额外字段。它用来引用 **Post** 中我们想要保存的 message。

现在我们需要重写我们的 **views.py**：

**boards/views.py**

```python
from django.contrib.auth.models import User
from django.shortcuts import render, redirect, get_object_or_404
from .forms import NewTopicForm
from .models import Board, Topic, Post

def new_topic(request, pk):
    board = get_object_or_404(Board, pk=pk)
    user = User.objects.first()  # TODO: get the currently logged in user
    if request.method == 'POST':
        form = NewTopicForm(request.POST)
        if form.is_valid():
            topic = form.save(commit=False)
            topic.board = board
            topic.starter = user
            topic.save()
            post = Post.objects.create(
                message=form.cleaned_data.get('message'),
                topic=topic,
                created_by=user
            )
            return redirect('board_topics', pk=board.pk)  # TODO: redirect to the created topic page
    else:
        form = NewTopicForm()
    return render(request, 'new_topic.html', {'board': board, 'form': form})
```

这是我们在 view(视图) 中处理 form(表单) 的方式。让我们去掉一些多余的部分，只看表单处理的核心部分：

```python
if request.method == 'POST':
    form = NewTopicForm(request.POST)
    if form.is_valid():
        topic = form.save()
        return redirect('board_topics', pk=board.pk)
else:
    form = NewTopicForm()
return render(request, 'new_topic.html', {'form': form})
```

首先我们判断请求是 **POST** 还是 **GET**。如果请求是 **POST**，这意味着用户向服务器提交了一些数据。所以我们实例化一个将 **POST** 数据传递给 form 的 form 实例：`form = NewTopicForm(request.POST)`。

然后，我们让 Django 验证数据，检查 form 是否有效，我们能否将其存入数据库：`if form.is_valid():`。如果表单有效，我们使用 `form.save()` 将数据存入数据库。`save()` 方法返回一个存入数据库的 Model 实例。
所以，因为这是一个 **Topic** form, 所以它会返回 `topic = form.save()` 创建的 **Topic**。然后，通用的路径是把用户重定向到其他地方，以避免用户通过按 F5 重新提交表单，并且保证应用程序的流程走向。

现在，如果数据是无效的，Django 会给 form 添加错误列表。然后，视图函数不会做任何处理并且返回最后一句：
`return render(request, 'new_topic.html', {'form': form})`。这意味着我们需要更新 **new_topic.html** 以显示错误。

如果请求是 **GET**，我们只需要使用 `form = NewTopicForm()` 初始化一个新的空表单。

让我们运行测试并观察情况：

```python
python manage.py test
```

```python
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
...............
----------------------------------------------------------------------
Ran 15 tests in 0.522s

OK
Destroying test database for alias 'default'...
```

我们甚至修复了最后两个测试。

Django Forms API 不仅仅是处理和验证数据。它还为我们生成 HTML。

**templates/new_topic.html**

```html
{% extends 'base.html' %}

{% block title %}Start a New Topic{% endblock %}

{% block breadcrumb %}
  <li class="breadcrumb-item"><a href="{% url 'home' %}">Boards</a></li>
  <li class="breadcrumb-item"><a href="{% url 'board_topics' board.pk %}">{{ board.name }}</a></li>
  <li class="breadcrumb-item active">New topic</li>
{% endblock %}

{% block content %}
  <form method="post">
    {% csrf_token %}
    {{ form.as_p }}
    <button type="submit" class="btn btn-success">Post</button>
  </form>
{% endblock %}
```

这个 `form` 有三个渲染选项：`form.as_table`，`form.as_ul` 和 `form.as_p`。这是一个快速的渲染表单所有字段的方法。顾名思义，`as_table` 使用 table 标签来格式化输入，`as_ul` 创建一个输入的 HTML 列表等等。

看看效果：

![此处输入图片的描述][28]

我们以前的 form 看起来更好，是吧？我们将立即修复它。

它看起来很破，但是相信我；它背后有很多东西。它非常强大。比如，如果我们的表单有 50 个字段，我们可以通过键入 `{{ form.as_p }}` 来显示所有字段。

此外，使用 Forms API，Django 会验证数据并且向每个字段添加错误消息。让我们尝试提交一个空的表单：

![此处输入图片的描述][29]

`注意：
如果你提交表单时看到类似这样的东西：![此处输入图片的描述][30]，这不是 Django 做的。这是你的浏览器进行预验证。要禁用它可以在你的表单标签中添加 **novalidate** 属性：**<form method="post" novalidate>**

你可以不修改它，不会有问题。这只是因为我们的表单现在非常简单，而且我们没有太多的数据验证可以看到。

另外一件需要注意的事情是：没有 “客户端验证” 这样的事情。JavaScript 验证或者浏览器验证仅用于可用性目的。同时也减少了对服务器的请求数量。数据验证应该始终在服务器端完成，这样我们可以完全掌控数据。
`

它还可以处理在 **Form** 类或者 **Model** 类中定义的 help texts(帮助文本)。

**boards/forms.py**

```python
from django import forms
from .models import Topic

class NewTopicForm(forms.ModelForm):
    message = forms.CharField(
        widget=forms.Textarea(),
        max_length=4000,
        help_text='The max length of the text is 4000.'
    )

    class Meta:
        model = Topic
        fields = ['subject', 'message']
```

![此处输入图片的描述][31]
  
我们也可以为表单字段设置额外的属性：

**boards/forms.py**

```python
from django import forms
from .models import Topic

class NewTopicForm(forms.ModelForm):
    message = forms.CharField(
        widget=forms.Textarea(
            attrs={'rows': 5, 'placeholder': 'What is on your mind?'}
        ),
        max_length=4000,
        help_text='The max length of the text is 4000.'
    )

    class Meta:
        model = Topic
        fields = ['subject', 'message']
```

![此处输入图片的描述][32]


**Renderint Bootstrap Forms**

让我们把事情做得更完善。

当使用 Bootstrap 或者其他的前端库时，我比较喜欢使用一个叫做 **django-widget-tweaks** 的 Django 包。它可以让我们更好地控制渲染的处理，保证默认值，只需在上面添加额外的自定义设置。

让我们开始安装它：

```python
pip install django-widget-tweaks
```

添加到 `INSTALLED_APPS`：

**myproject/settings.py**

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'widget_tweaks',

    'boards',
]
```

现在可以使用它了：

**templates/new_topic.html**

```python
{% extends 'base.html' %}

{% load widget_tweaks %}

{% block title %}Start a New Topic{% endblock %}

{% block breadcrumb %}
  <li class="breadcrumb-item"><a href="{% url 'home' %}">Boards</a></li>
  <li class="breadcrumb-item"><a href="{% url 'board_topics' board.pk %}">{{ board.name }}</a></li>
  <li class="breadcrumb-item active">New topic</li>
{% endblock %}

{% block content %}
  <form method="post" novalidate>
    {% csrf_token %}

    {% for field in form %}
      <div class="form-group">
        {{ field.label_tag }}

        {% render_field field class="form-control" %}

        {% if field.help_text %}
          <small class="form-text text-muted">
            {{ field.help_text }}
          </small>
        {% endif %}
      </div>
    {% endfor %}

    <button type="submit" class="btn btn-success">Post</button>
  </form>
{% endblock %}
```

![此处输入图片的描述][33]

这就是我们使用的 **django-widget-tweaks** 的效果。首先，我们使用 **{% load widget_tweaks %}** 模板标签将其加载到模板。然后这样使用它：

```html
{% render_field field class="form-control" %}
```

`render_field` 不属于 Django；它存在于我们安装的包里面。要使用它，我们需要传递一个表单域实例作为第一个参数，然后我们可以添加任意的 HTML 属性去补充它。这很有用因为我们可以根据特定的条件指定类。

一些 `render_field` 模板标签的例子：

```html
{% render_field form.subject class="form-control" %}
{% render_field form.message class="form-control" placeholder=form.message.label %}
{% render_field field class="form-control" placeholder="Write a message!" %}
{% render_field field style="font-size: 20px" %}
```

现在要实现 Bootstrap 4 验证标签，我们可以修改 **new_topic.html** 模板。

**templates/new_topic.html**

```html
<form method="post" novalidate>
  {% csrf_token %}

  {% for field in form %}
    <div class="form-group">
      {{ field.label_tag }}

      {% if form.is_bound %}
        {% if field.errors %}

          {% render_field field class="form-control is-invalid" %}
          {% for error in field.errors %}
            <div class="invalid-feedback">
              {{ error }}
            </div>
          {% endfor %}

        {% else %}
          {% render_field field class="form-control is-valid" %}
        {% endif %}
      {% else %}
        {% render_field field class="form-control" %}
      {% endif %}

      {% if field.help_text %}
        <small class="form-text text-muted">
          {{ field.help_text }}
        </small>
      {% endif %}
    </div>
  {% endfor %}

  <button type="submit" class="btn btn-success">Post</button>
</form>
```

效果是：

![此处输入图片的描述][34]

![此处输入图片的描述][35]

所以，我们有三种不同的渲染状态：

 - **Initial state**：表单没有数据(不受约束)
 - **Invalid**：我们添加了 `.is-invalid` 这个 CSS class 并将错误消息添加到具有 `.invalid-feedback` class 的元素中
 - **Valid**：我们添加了 `.is-valid` 的 CSS class，以绿色绘制表单域，并向用户反馈它是否可行。

**Reusable Forms Templates**

模板看起来有点复杂，是吧？有个好消息是我们可以在项目中重复使用它。

在 **templates** 文件夹中，创建一个新的文件夹命名为 **includes**：

```
myproject/
 |-- myproject/
 |    |-- boards/
 |    |-- myproject/
 |    |-- templates/
 |    |    |-- includes/    <-- here!
 |    |    |-- base.html
 |    |    |-- home.html
 |    |    |-- new_topic.html
 |    |    +-- topics.html
 |    +-- manage.py
 +-- venv/
```
 
在 **includes** 文件夹中，创建一个 **form.html**：

**templates/includes/form.html**

```html
{% load widget_tweaks %}

{% for field in form %}
  <div class="form-group">
    {{ field.label_tag }}

    {% if form.is_bound %}
      {% if field.errors %}
        {% render_field field class="form-control is-invalid" %}
        {% for error in field.errors %}
          <div class="invalid-feedback">
            {{ error }}
          </div>
        {% endfor %}
      {% else %}
        {% render_field field class="form-control is-valid" %}
      {% endif %}
    {% else %}
      {% render_field field class="form-control" %}
    {% endif %}

    {% if field.help_text %}
      <small class="form-text text-muted">
        {{ field.help_text }}
      </small>
    {% endif %}
  </div>
{% endfor %}
```

现在来修改我们的 **new_topic.html** 模板：

**templates/new_topic.html**

```html
{% extends 'base.html' %}

{% block title %}Start a New Topic{% endblock %}

{% block breadcrumb %}
  <li class="breadcrumb-item"><a href="{% url 'home' %}">Boards</a></li>
  <li class="breadcrumb-item"><a href="{% url 'board_topics' board.pk %}">{{ board.name }}</a></li>
  <li class="breadcrumb-item active">New topic</li>
{% endblock %}

{% block content %}
  <form method="post" novalidate>
    {% csrf_token %}
    {% include 'includes/form.html' %}
    <button type="submit" class="btn btn-success">Post</button>
  </form>
{% endblock %}
```

顾名思义，`{% include %}` 用来在其他的模板中包含 HTML 模板。这是在项目中重用 HTML 组件的常用方法。

在下一个我们实现的表单，我们可以简单地使用 `{% include 'includes/form.html' %}` 去渲染它。

**Adding More Tests**

现在我们在使用 **Django 表单**；我们可以添加更多的测试以确保它能运行顺利

**boards/tests.py**

```python
# ... other imports
from .forms import NewTopicForm

class NewTopicTests(TestCase):
    # ... other tests

    def test_contains_form(self):  # <- new test
        url = reverse('new_topic', kwargs={'pk': 1})
        response = self.client.get(url)
        form = response.context.get('form')
        self.assertIsInstance(form, NewTopicForm)

    def test_new_topic_invalid_post_data(self):  # <- updated this one
        '''
        Invalid post data should not redirect
        The expected behavior is to show the form again with validation errors
        '''
        url = reverse('new_topic', kwargs={'pk': 1})
        response = self.client.post(url, {})
        form = response.context.get('form')
        self.assertEquals(response.status_code, 200)
        self.assertTrue(form.errors)
```

这是我们第一次使用 `assertIsInstance` 方法。基本上我们的处理是抓取上下文的表单实例，检查它是否是一个 `NewTopicForm`。在最后的测试中，我添加了 `self.assertTrue(form.errors)` 以确保数据无效的时候表单会显示错误。

**Conclusions**

在这个课程，我们学习了 URLs, 可重用模板和表单。像往常一样，我们也实现了几个测试用例。这能使我们开发中更自信。

我们的测试文件变的越来越大，所以在下一节中，我们重构了它以提高它的可维护性，从而维持我们代码的增加。

我们也达到了我们需要与登录的用户进行交互的目的。在下一节，我们学习了关于认证的一切知识和怎么去保护我们的视图和资源。

该项目的源代码在 GitHub 可用。项目的当前状态可以在发布标签 **v0.3-lw** 下找到。下面是链接：

[https://github.com/sibtc/django-beginners-guide/tree/v0.3-lw][36]

 


  [1]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/wireframe-topics.png
  [2]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/wireframe-topics.png
  [3]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/Pixton_Comic_URL_Patterns.png
  [4]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/Pixton_Comic_The_Order_Matters.png
  [5]: https://simpleisbetterthancomplex.com/series/2017/09/18/a-complete-beginners-guide-to-django-part-3.html#figure-1
  [6]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/topics-1.png
  [7]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/topics-error-500.png
  [8]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/topics-error-404.png
  [9]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/wireframe-links.png
  [10]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/boards.png
  [11]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/board_topics.png
  [12]: https://simpleisbetterthancomplex.com/references/2016/10/10/url-patterns.html
  [13]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/django-boards-header-1.png
  [14]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/django-boards-header-2.png
  [15]: https://getbootstrap.com/docs/4.0/components/navbar/
  [16]: https://fonts.google.com/
  [17]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/google-fonts.png
  [18]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/boards-logo.png
  [19]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/Pixton_Comic_All_Input.png
  [20]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/wireframe-new-topic.png
  [21]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/start-a-new-topic.png
  [22]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/start-a-new-topic-python.png
  [23]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/start-a-new-topic-form.png
  [24]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/start-a-new-topic-form-submit.png
  [25]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/topics-2.png
  [26]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/topics-3.png
  [27]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/topics-4.png
  [28]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/start-a-new-topic-form-django.png
  [29]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/form-validation.png
  [30]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/novalidate.png
  [31]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/help-text.png
  [32]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/form-placeholder.png
  [33]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/bootstrap-form.png
  [34]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/bootstrap-invalid-1.png
  [35]: https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-3/bootstrap-invalid-2.png
  [36]: https://github.com/sibtc/django-beginners-guide/tree/v0.3-lw