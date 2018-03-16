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
图3.1：*urlpatterns* 中 URLs 的顺序很重要
图3.2：匹配规则宽松的 URL 正则表达式应该总是放在后面
图3.3：所以，记住这几点！要经常测试你的路由。


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