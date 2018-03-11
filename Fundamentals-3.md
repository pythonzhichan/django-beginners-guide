# 一个完整的 Django 入门指南 - 第2部分

>译者：liuzhijun  
>原文：
https://simpleisbetterthancomplex.com/series/2017/09/11/a-complete-beginners-guide-to-django-part-2.html

![featured](./statics/2-1.jpg)

### 视图、模板、静态文件

目前我们已经有一个视图函数叫`home`,这个视图在我们的应用程序主页上显示为“Hello，World！” 

**myproject/urls.py**

```python
from django.contrib import admin
from django.urls import path

from boards import views

urlpatterns = [
    path(r'', views.home, name='home'),
    path('admin/', admin.site.urls),
]
```

**boards/views.py**

```python
from django.http import HttpResponse

def home(request):
    return HttpResponse('Hello, World!')
```

我们可以从这里开始写。如果你回想起我们的原型图，图5显示了主页应该是什么样子。我们想要做的是在表格中列出一些版块的名单以及它们的描述信息。

![board](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/wireframe-boards.png)

首先要做的是导入Board模型并列出所有的版块

**boards/views.py**

```python
from django.http import HttpResponse
from .models import Board

def home(request):
    boards = Board.objects.all()
    boards_names = list()

    for board in boards:
        boards_names.append(board.name)

    response_html = '<br>'.join(boards_names)

    return HttpResponse(response_html)
 ```

 结果就是这个简单的HTML页面：

![boards](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/boards-homepage-httpresponse.png)

等等，我们在这里先停一下。真正的项目里面我们不会这样去渲染HTML。对于这个简单视图函数，我们做的就是列出所有版块，然后渲染部分是Django模板引擎的职责。


### Django 模板引擎设置

在manage.py所在的目录创建一个名为 **templates**的新文件夹：

```sh
myproject/
 |-- myproject/
 |    |-- boards/
 |    |-- myproject/
 |    |-- templates/   <-- 这里
 |    +-- manage.py
 +-- venv/
```
在templates文件夹中，创建一个名为home.html的HTML文件：


**templates/home.html**

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Boards</title>
  </head>
  <body>
    <h1>Boards</h1>

    {% for board in boards %}
      {{ board.name }} <br>
    {% endfor %}

  </body>
</html>
```

在上面的例子中，我们混入了原始HTML和一些特殊标签 `{% for ... in ... %}` 和 `{{ variable }}` 。它们是Django模板语言的一部分。上面的例子展示了如何使用 `for`遍历列表对象。`{{ board.name }}`会在 HTML 模板中会被渲染成版块的名称，最后生成动态HTML文档。

在我们可以使用这个HTML页面之前，我们必须告诉Django在哪里可以找到我们应用程序的模板。

打开**myproject**目录下面的**settings.py**文件，搜索`TEMPLATES`变量，并设置`DIRS` 的值为 `os.path.join(BASE_DIR, 'templates')`：


```python
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, 'templates')
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
```

本质上，刚添加的这一行所做的事情就是找到项目的完整路径并在后面附加“/templates”

我们可以使用Python shell进行调试：

```sh
python manage.py shell

```

```python
from django.conf import settings

settings.BASE_DIR
'/Users/vitorfs/Development/myproject'

import os

os.path.join(settings.BASE_DIR, 'templates')
'/Users/vitorfs/Development/myproject/templates'
```
看到了吗？它只是指向我们在前面步骤中创建的**templates**文件夹。

现在我们可以更新**home**视图：

**boards/views.py**

```python
from django.shortcuts import render
from .models import Board

def home(request):
    boards = Board.objects.all()
    return render(request, 'home.html', {'boards': boards})
```

生成的HTML：

![html](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/boards-homepage-render.png)

我们可以用一个更漂亮的表格来替换，改进HTML模板：

**templates/home.html**

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Boards</title>
  </head>
  <body>
    <h1>Boards</h1>

    <table border="1">
      <thead>
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
              {{ board.name }}<br>
              <small style="color: #888">{{ board.description }}</small>
            </td>
            <td>0</td>
            <td>0</td>
            <td></td>
          </tr>
        {% endfor %}
      </tbody>
    </table>
  </body>
</html>

```

![table](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/boards-homepage-render-2.png)



### 测试主页

![2-5](./statics/2-5.jpg)

测试将是一个反复出现的主题，我们将在整个教程系列中一起探讨不同的概念和策略。

我们来开始写第一个测试。现在，我们将在**boards**应用程序内的**tests.py**文件中操作

**boards/tests.py**

```ptyhon
from django.urls import reverse
from django.test import TestCase

class HomeTests(TestCase):
    def test_home_view_status_code(self):
        url = reverse('home')
        response = self.client.get(url)
        self.assertEquals(response.status_code, 200)
```

这是一个非常简单但非常有用的测试用例，我们测试的是请求该URL后返回的响应状态码。状态码200意味着成功。

请求一下主页后，我们可以在控制台中看到响应的状态代码：

![code](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/test-homepage-view-status-code-200.png)

如果出现未捕获的异常，语法错误或其他任何情况，Django会返回状态代码500，这意味着是**内部服务器错误**。现在，想象我们的应用程序有100个视图函数。如果我们为所有视图编写这个简单的测试，只需一个命令，我们就能够测试所有视图是否返回成功代码，因此用户在任何地方都看不到任何错误消息。如果没有自动化测试，我们需要逐一检查每个页面是否有错误。

执行Django的测试套件：

```sh
python manage.py test
```

```sh
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
.
----------------------------------------------------------------------
Ran 1 test in 0.041s

OK
Destroying test database for alias 'default'...
```

现在我们可以测试Django是否在请求的URL的时候返回了正确的视图函数。这也是一个有用的测试，因为随着开发的进展，您会发现urls.py模块可能变得非常庞大而复杂，Django可能返回错误的视图函数。

我们可以这样做：

**boards/tests.py**

```python
from django.urls import reverse
from django.urls import resolve
from django.test import TestCase
from .views import home

class HomeTests(TestCase):
    def test_home_view_status_code(self):
        url = reverse('home')
        response = self.client.get(url)
        self.assertEquals(response.status_code, 200)

    def test_home_url_resolves_home_view(self):
        view = resolve('/')
        self.assertEquals(view.func, home)
```

在第二个测试中，我们使用了`resolve`函数。Django使用它来将浏览器发起请求的URL与urls.py模块中列出的URL进行匹配。该测试用于确定URL `/` 返回 home 视图。

再次测试：

```sh
python manage.py test
```

```sh
```sh
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
..
----------------------------------------------------------------------
Ran 2 tests in 0.027s

OK
Destroying test database for alias 'default'...
```

要查看有关测试执行时更详细的信息，可将**verbosity**的级别设置得更高一点：


```sh
python manage.py test --verbosity=2
```

```sh
Creating test database for alias 'default' ('file:memorydb_default?mode=memory&cache=shared')...
Operations to perform:
  Synchronize unmigrated apps: messages, staticfiles
  Apply all migrations: admin, auth, boards, contenttypes, sessions
Synchronizing apps without migrations:
  Creating tables...
    Running deferred SQL...
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying admin.0001_initial... OK
  Applying admin.0002_logentry_remove_auto_add... OK
  Applying contenttypes.0002_remove_content_type_name... OK
  Applying auth.0002_alter_permission_name_max_length... OK
  Applying auth.0003_alter_user_email_max_length... OK
  Applying auth.0004_alter_user_username_opts... OK
  Applying auth.0005_alter_user_last_login_null... OK
  Applying auth.0006_require_contenttypes_0002... OK
  Applying auth.0007_alter_validators_add_error_messages... OK
  Applying auth.0008_alter_user_username_max_length... OK
  Applying boards.0001_initial... OK
  Applying sessions.0001_initial... OK
System check identified no issues (0 silenced).
test_home_url_resolves_home_view (boards.tests.HomeTests) ... ok
test_home_view_status_code (boards.tests.HomeTests) ... ok

----------------------------------------------------------------------
Ran 2 tests in 0.017s

OK
Destroying test database for alias 'default' ('file:memorydb_default?mode=memory&cache=shared')...
```
Verbosity决定了将要打印到控制台的通知和调试信息量; 0是无输出，1是正常输出，2是详细输出。


### 静态文件设置

静态文件是指 CSS，JavaScript，字体，图片或者是用来组成用户界面的任何其他资源。

实际上，Django 本身是不负责处理这些文件的，为了让我们的开发过程更轻松，Django 提供了一些功能来帮助我们管理静态文件。这些功能可在 `INSTALLED_APPS` 的 **django.contrib.staticfiles** 应用程序中找到（译者：Django为了使得开发方便，也负责处理静态文件，而在生产环境下，静态文件直接由Nginx等反向代理服务器处理，而应用工服务器专心负责处理它擅长的业务逻辑）。

市面上这么多的前端组件库，我们没有理由继续渲染基本的HTML文档。我们可以轻松地将Bootstrap 4添加到我们的项目中。Bootstrap是一个用HTML，CSS和JavaScript开发的开源工具包。

在项目根目录中，除了 boards, templates 和myproject文件夹外，再创建一个名为static的新文件夹，并在static文件夹内创建另一个名为css的文件夹：

```sh
myproject/
 |-- myproject/
 |    |-- boards/
 |    |-- myproject/
 |    |-- templates/
 |    |-- static/       <-- here
 |    |    +-- css/     <-- and here
 |    +-- manage.py
 +-- venv/
 ```

 转到[getbootstrap.com](https://getbootstrap.com/docs/4.0/getting-started/download/#compiled-css-and-js)并下载最新版本：


![bootstrap](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/bootstrap-download.png)


下载编译版本的CSS和JS

在你的计算机中，解压 bootstrap-4.0.0-beta-dist.zip 文件，将文件 css/bootstrap.min.css 复制到我们项目的css文件夹中：

```python
myproject/
 |-- myproject/
 |    |-- boards/
 |    |-- myproject/
 |    |-- templates/
 |    |-- static/
 |    |    +-- css/
 |    |         +-- bootstrap.min.css    <-- here
 |    +-- manage.py
 +-- venv/
 ```

 下一步是告诉Django在哪里可以找到静态文件。打开settings.py，拉到文件的底部，在**STATIC_URL**后面添加以下内容：

 ```python
 STATIC_URL = '/static/'

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]
```

还记得 **TEMPLATES**目录吗，和这个配置是一样的

现在我们必须在模板中加载静态文件（Bootstrap CSS文件）：


**templates/home.html**

```html
{% load static %}<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Boards</title>
    <link rel="stylesheet" href="{% static 'css/bootstrap.min.css' %}">
  </head>
  <body>
    <!-- body suppressed for brevity ... -->
  </body>
</html>
```

首先，我们在模板的开头使用了 Static Files App 模板标签 `{% load static %}`。


模板标签`{% static %}`用于组成资源所在的URL。在这种情况下，`{% static 'css/bootstrap.min.css' %}`将返回 **/static/css/bootstrap.min.css**，它相当于 **http://127.0.0.1:8000/static/css/bootstrap.min.css**。

`{% static %}`模板标签使用 settings.py文件中的 `STATIC_URL` 配置来组成最终的URL，例如，如果您将静态文件托管在像 https://static.example.com/这样的子域中 ，那么我们将设置 `STATIC_URL=https://static.example.com/` ，然后 `{% static 'css/bootstrap.min.css' %}`返回的是 **https://static.example.com/css/bootstrap.min.css**

如果目前这些对你来说搞不懂也不要担心。只要记得但凡是需要引用CSS，JavaScript或图片文件的地方就使用`{% static %}`。稍后，当我们开始部署项目到正式环境时，我们将讨论更多。现在，我们都设置好了。

刷新页面 127.0.0.1:8000 ，我们可以看到它可以正常运行：

![b](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/boards-homepage-bootstrap.png)

现在我们可以编辑模板，以利用Bootstrap CSS：

```html
{% load static %}<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Boards</title>
    <link rel="stylesheet" href="{% static 'css/bootstrap.min.css' %}">
  </head>
  <body>
    <div class="container">
      <ol class="breadcrumb my-4">
        <li class="breadcrumb-item active">Boards</li>
      </ol>
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
                {{ board.name }}
                <small class="text-muted d-block">{{ board.description }}</small>
              </td>
              <td class="align-middle">0</td>
              <td class="align-middle">0</td>
              <td></td>
            </tr>
          {% endfor %}
        </tbody>
      </table>
    </div>
  </body>
</html>
```

显示效果：

![](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/boards-homepage-bootstrap-2.png)


到目前为止，我们使用交互式控制台（python manage.py shell）添加新的版块。但我们需要一个更好的方式来实现。在下一节中，我们将为网站管理员实现一个管理界面来管理这些数据。
