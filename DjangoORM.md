# 一个完整的Django入门指南  - 第5部分
> 译者：刘志军
> 原文：https://simpleisbetterthancomplex.com/series/2017/10/02/a-complete-beginners-guide-to-django-part-5.html


## 前言

欢迎来到系列教程的第5部分！在本节中，我们将学习如何防止未经授权的用户访问受保护的视图以及如何在视图和表单中访问经过身份验证的用户。

同时，我们也将实现主题帖子列表视图和回复视图。最后，我们将探索 Django ORM 的一些功能并简要介绍迁移。

### 保护视图
我们必须开始防止非授权用户的观点。到目前为止，我们有以下观点来开始新帖子：

主题视图未登录

在上图中，用户没有登录，即使他们可以看到页面和表单。

Django有一个内置的视图装饰器来避免这个问题：

boards / views.py （查看完整文件内容）

from django.contrib.auth.decorators import login_required

@login_required
def new_topic(request, pk):
    # ...
从现在开始，如果用户没有通过身份验证，他们将被重定向到登录页面：

登录需要重定向

注意查询字符串？next = / boards / 1 / new /。我们可以改进登录模板以利用下一个 变量并改善用户体验。

配置登录下一个重定向
templates / login.html （查看完整文件内容）

<form method="post" novalidate>
  {% csrf_token %}
  <input type="hidden" name="next" value="{{ next }}">
  {% include 'includes/form.html' %}
  <button type="submit" class="btn btn-primary btn-block">Log in</button>
</form>
然后，如果我们现在尝试登录，应用程序会将我们引导回到我们所在的位置。

魔法

所以下一个参数是内置功能的一部分。

需要登录的测试
现在让我们添加一个测试用例来确保此视图受@login_required装饰器保护。但首先，让我们在boards / tests / test_views.py文件中进行一些重构。

我们将test_views.py分成三个文件：

test_view_home.py将包含HomeTests类（查看完整文件内容）
test_view_board_topics.py将包含BoardTopicsTests类（查看完整文件内容）
test_view_new_topic.py将包含NewTopicTests类（查看完整文件内容）
myproject/
 |-- myproject/
 |    |-- accounts/
 |    |-- boards/
 |    |    |-- migrations/
 |    |    |-- templatetags/
 |    |    |-- tests/
 |    |    |    |-- __init__.py
 |    |    |    |-- test_templatetags.py
 |    |    |    |-- test_view_home.py          <-- here
 |    |    |    |-- test_view_board_topics.py  <-- here
 |    |    |    +-- test_view_new_topic.py     <-- and here
 |    |    |-- __init__.py
 |    |    |-- admin.py
 |    |    |-- apps.py
 |    |    |-- models.py
 |    |    +-- views.py
 |    |-- myproject/
 |    |-- static/
 |    |-- templates/
 |    |-- db.sqlite3
 |    +-- manage.py
 +-- venv/
运行测试以确保一切正常。

新增功能让我们在test_view_new_topic.py中添加一个新的测试用例，以检查视图是否装饰有 @login_required：

boards / tests / test_view_new_topic.py （查看完整文件内容）

from django.test import TestCase
from django.urls import reverse
from ..models import Board

class LoginRequiredNewTopicTests(TestCase):
    def setUp(self):
        Board.objects.create(name='Django', description='Django board.')
        self.url = reverse('new_topic', kwargs={'pk': 1})
        self.response = self.client.get(self.url)

    def test_redirection(self):
        login_url = reverse('login')
        self.assertRedirects(self.response, '{login_url}?next={url}'.format(login_url=login_url, url=self.url))
在上面的测试用例中，我们试图在不经过身份验证的情况下对新的主题视图进行请求。预期的结果是将请求重定向到登录视图。

访问经过身份验证的用户
现在我们可以改进new_topic视图，这次设置适当的用户，而不是仅仅查询数据库并选择第一个用户。该代码是暂时的，因为我们无法验证用户身份。但现在我们可以做得更好：

boards / views.py （查看完整文件内容）

from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render

from .forms import NewTopicForm
from .models import Board, Post

@login_required
def new_topic(request, pk):
    board = get_object_or_404(Board, pk=pk)
    if request.method == 'POST':
        form = NewTopicForm(request.POST)
        if form.is_valid():
            topic = form.save(commit=False)
            topic.board = board
            topic.starter = request.user  # <- here
            topic.save()
            Post.objects.create(
                message=form.cleaned_data.get('message'),
                topic=topic,
                created_by=request.user  # <- and here
            )
            return redirect('board_topics', pk=board.pk)  # TODO: redirect to the created topic page
    else:
        form = NewTopicForm()
    return render(request, 'new_topic.html', {'board': board, 'form': form})
我们可以通过添加一个新主题来进行快速测试：

新话题

主题帖子视图
现在让我们花点时间来实现帖子列表页面，相应的线框如下：

线框帖子

首先，我们需要一条路线：

myproject / urls.py （查看完整文件内容）

url(r'^boards/(?P<pk>\d+)/topics/(?P<topic_pk>\d+)/$', views.topic_posts, name='topic_posts'),
请注意，现在我们正在处理两个关键字参数：pk用于标识董事会，现在我们已经用topic_pk它来确定从数据库中检索哪个主题。

匹配视图将如下所示：

boards / views.py （查看完整文件内容）

from django.shortcuts import get_object_or_404, render
from .models import Topic

def topic_posts(request, pk, topic_pk):
    topic = get_object_or_404(Topic, board__pk=pk, pk=topic_pk)
    return render(request, 'topic_posts.html', {'topic': topic})
请注意，我们正在间接检索当前的董事会。请记住，主题模型与主板模型有关，因此我们可以访问当前主板。你会在下一个片段中看到：

templates / topic_posts.html （查看完整文件内容）

{% extends 'base.html' %}

{% block title %}{{ topic.subject }}{% endblock %}

{% block breadcrumb %}
  <li class="breadcrumb-item"><a href="{% url 'home' %}">Boards</a></li>
  <li class="breadcrumb-item"><a href="{% url 'board_topics' topic.board.pk %}">{{ topic.board.name }}</a></li>
  <li class="breadcrumb-item active">{{ topic.subject }}</li>
{% endblock %}

{% block content %}

{% endblock %}
现在观察，而不是board.name在模板中使用，我们正在浏览主题属性，使用 topic.board.name。

帖子

现在让我们为topic_posts视图创建一个新的测试文件：

板/测试/ test_view_topic_posts.py

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import resolve, reverse

from ..models import Board, Post, Topic
from ..views import topic_posts


class TopicPostsTests(TestCase):
    def setUp(self):
        board = Board.objects.create(name='Django', description='Django board.')
        user = User.objects.create_user(username='john', email='john@doe.com', password='123')
        topic = Topic.objects.create(subject='Hello, world', board=board, starter=user)
        Post.objects.create(message='Lorem ipsum dolor sit amet', topic=topic, created_by=user)
        url = reverse('topic_posts', kwargs={'pk': board.pk, 'topic_pk': topic.pk})
        self.response = self.client.get(url)

    def test_status_code(self):
        self.assertEquals(self.response.status_code, 200)

    def test_view_function(self):
        view = resolve('/boards/1/topics/1/')
        self.assertEquals(view.func, topic_posts)
请注意，测试设置开始变得更加复杂。我们可以创建混合类或抽象类来根据需要重用代码。我们还可以使用第三方库来设置一些测试数据，以减少样板代码。

此外，到目前为止，我们已经进行了大量的测试，并且逐渐开始运行得更慢。我们可以指导测试套件来运行来自给定应用程序的测试：

python manage.py test boards
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
.......................
----------------------------------------------------------------------
Ran 23 tests in 1.246s

OK
Destroying test database for alias 'default'...
我们也可以只运行一个特定的测试文件：

python manage.py test boards.tests.test_view_topic_posts
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
..
----------------------------------------------------------------------
Ran 2 tests in 0.129s

OK
Destroying test database for alias 'default'...
或者只是一个特定的测试用例：

python manage.py test boards.tests.test_view_topic_posts.TopicPostsTests.test_status_code
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
.
----------------------------------------------------------------------
Ran 1 test in 0.100s

OK
Destroying test database for alias 'default'...
很酷，对吧？

让我们继续前进。

在topic_posts.html内部，我们可以创建一个迭代主题帖子的for循环：

模板/ topic_posts.html

{% extends 'base.html' %}

{% load static %}

{% block title %}{{ topic.subject }}{% endblock %}

{% block breadcrumb %}
  <li class="breadcrumb-item"><a href="{% url 'home' %}">Boards</a></li>
  <li class="breadcrumb-item"><a href="{% url 'board_topics' topic.board.pk %}">{{ topic.board.name }}</a></li>
  <li class="breadcrumb-item active">{{ topic.subject }}</li>
{% endblock %}

{% block content %}

  <div class="mb-4">
    <a href="#" class="btn btn-primary" role="button">Reply</a>
  </div>

  {% for post in topic.posts.all %}
    <div class="card mb-2">
      <div class="card-body p-3">
        <div class="row">
          <div class="col-2">
            <img src="{% static 'img/avatar.svg' %}" alt="{{ post.created_by.username }}" class="w-100">
            <small>Posts: {{ post.created_by.posts.count }}</small>
          </div>
          <div class="col-10">
            <div class="row mb-3">
              <div class="col-6">
                <strong class="text-muted">{{ post.created_by.username }}</strong>
              </div>
              <div class="col-6 text-right">
                <small class="text-muted">{{ post.created_at }}</small>
              </div>
            </div>
            {{ post.message }}
            {% if post.created_by == user %}
              <div class="mt-3">
                <a href="#" class="btn btn-primary btn-sm" role="button">Edit</a>
              </div>
            {% endif %}
          </div>
        </div>
      </div>
    </div>
  {% endfor %}

{% endblock %}
帖子

由于现在我们没有办法上传用户图片，因此我们只需要有一张空白图片。

我从IconFinder下载了一个免费的图像 并保存在项目的静态/ img文件夹中。

我们还没有真正探索过Django的ORM，但是代码在数据库中 执行了一个。即使结果是正确的，这也是一个不好的方法。现在它在数据库中造成了多次不必要的查询。但是，嘿，现在不用担心。让我们专注于我们如何与应用程序进行交互。稍后，我们将改进此代码，以及如何诊断重度查询。{{ post.created_by.posts.count }}select count

此处另一个有趣的地方是，我们正在测试当前帖子是否属于经过身份验证的用户： 。我们只显示帖子所有者的编辑按钮。{% if post.created_by == user %}

由于我们现在具有指向主题帖子列表的URL路由，请使用链接更新topics.html模板：

templates / topics.html （查看完整文件内容）

{% for topic in board.topics.all %}
  <tr>
    <td><a href="{% url 'topic_posts' board.pk topic.pk %}">{{ topic.subject }}</a></td>
    <td>{{ topic.starter.username }}</td>
    <td>0</td>
    <td>0</td>
    <td>{{ topic.last_updated }}</td>
  </tr>
{% endfor %}
回复帖子查看
让我们现在实现回复帖子视图，以便我们可以添加更多的数据和进度与实施和测试。

回复线框

新的网址路线：

myproject / urls.py （查看完整文件内容）

url(r'^boards/(?P<pk>\d+)/topics/(?P<topic_pk>\d+)/reply/$', views.reply_topic, name='reply_topic'),
为帖子回复创建一个新表单：

boards / forms.py （查看完整文件内容）

from django import forms
from .models import Post

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['message', ]
受到@login_required简单表单处理逻辑保护的新视图：

boards / views.py （查看完整文件内容）

from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render
from .forms import PostForm
from .models import Topic

@login_required
def reply_topic(request, pk, topic_pk):
    topic = get_object_or_404(Topic, board__pk=pk, pk=topic_pk)
    if request.method == 'POST':
        form = PostForm(request.POST)
        if form.is_valid():
            post = form.save(commit=False)
            post.topic = topic
            post.created_by = request.user
            post.save()
            return redirect('topic_posts', pk=pk, topic_pk=topic_pk)
    else:
        form = PostForm()
    return render(request, 'reply_topic.html', {'topic': topic, 'form': form})
还需要时间来更新返回重定向new_topic取景功能（标有注释 ＃TODO）。

@login_required
def new_topic(request, pk):
    board = get_object_or_404(Board, pk=pk)
    if request.method == 'POST':
        form = NewTopicForm(request.POST)
        if form.is_valid():
            topic = form.save(commit=False)
            # code suppressed ...
            return redirect('topic_posts', pk=pk, topic_pk=topic.pk)  # <- here
    # code suppressed ...
非常重要的是：在我们使用的视图reply_topic中，topic_pk因为我们指的是函数的关键字参数，在我们使用的视图new_topic中，topic.pk因为a topic是一个对象（Topic模型实例），.pk我们正在访问pkTopic模型实例的属性。小细节，差别很大。

我们的模板的第一个版本：

模板/ reply_topic.html

{% extends 'base.html' %}

{% load static %}

{% block title %}Post a reply{% endblock %}

{% block breadcrumb %}
  <li class="breadcrumb-item"><a href="{% url 'home' %}">Boards</a></li>
  <li class="breadcrumb-item"><a href="{% url 'board_topics' topic.board.pk %}">{{ topic.board.name }}</a></li>
  <li class="breadcrumb-item"><a href="{% url 'topic_posts' topic.board.pk topic.pk %}">{{ topic.subject }}</a></li>
  <li class="breadcrumb-item active">Post a reply</li>
{% endblock %}

{% block content %}

  <form method="post" class="mb-4">
    {% csrf_token %}
    {% include 'includes/form.html' %}
    <button type="submit" class="btn btn-success">Post a reply</button>
  </form>

  {% for post in topic.posts.all %}
    <div class="card mb-2">
      <div class="card-body p-3">
        <div class="row mb-3">
          <div class="col-6">
            <strong class="text-muted">{{ post.created_by.username }}</strong>
          </div>
          <div class="col-6 text-right">
            <small class="text-muted">{{ post.created_at }}</small>
          </div>
        </div>
        {{ post.message }}
      </div>
    </div>
  {% endfor %}

{% endblock %}
回复表格

然后，在发布回复之后，用户将重定向回主题帖子：

主题帖子

我们现在可以更改首发帖子，以便在页面中更加强调它：

templates / topic_posts.html （查看完整文件内容）

{% for post in topic.posts.all %}
  <div class="card mb-2 {% if forloop.first %}border-dark{% endif %}">
    {% if forloop.first %}
      <div class="card-header text-white bg-dark py-2 px-3">{{ topic.subject }}</div>
    {% endif %}
    <div class="card-body p-3">
      <!-- code suppressed -->
    </div>
  </div>
{% endfor %}
主题帖子

现在进行测试，非常标准，就像我们迄今一直在做的那样。 在boards / tests文件夹中创建一个新文件test_view_reply_topic.py：

boards / tests / test_view_reply_topic.py （查看完整文件内容）

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from ..models import Board, Post, Topic
from ..views import reply_topic

class ReplyTopicTestCase(TestCase):
    '''
    Base test case to be used in all `reply_topic` view tests
    '''
    def setUp(self):
        self.board = Board.objects.create(name='Django', description='Django board.')
        self.username = 'john'
        self.password = '123'
        user = User.objects.create_user(username=self.username, email='john@doe.com', password=self.password)
        self.topic = Topic.objects.create(subject='Hello, world', board=self.board, starter=user)
        Post.objects.create(message='Lorem ipsum dolor sit amet', topic=self.topic, created_by=user)
        self.url = reverse('reply_topic', kwargs={'pk': self.board.pk, 'topic_pk': self.topic.pk})

class LoginRequiredReplyTopicTests(ReplyTopicTestCase):
    # ...

class ReplyTopicTests(ReplyTopicTestCase):
    # ...

class SuccessfulReplyTopicTests(ReplyTopicTestCase):
    # ...

class InvalidReplyTopicTests(ReplyTopicTestCase):
    # ...
这里的本质是自定义测试用例类ReplyTopicTestCase。然后所有四个类将扩展这个测试用例。

首先，我们测试视图是否受@login_required装饰器保护，然后检查HTML输入，状态码。最后，我们测试一个有效和无效的表单提交。

查询集
现在让我们花点时间来探索一些模型的API功能。首先，让我们改进主视图：

主板

我们在这里有三项任务：

显示单板的帖子数;
显示板的主题数量;
显示发布内容的最后一位用户以及日期和时间。
在我们进入实施之前，让我们首先使用Python终端。

既然我们要在Python终端中尝试一下，__str__为我们所有的模型定义一个方法是个好主意。

boards / models.py （查看完整文件内容）

from django.db import models
from django.utils.text import Truncator

class Board(models.Model):
    # ...
    def __str__(self):
        return self.name

class Topic(models.Model):
    # ...
    def __str__(self):
        return self.subject

class Post(models.Model):
    # ...
    def __str__(self):
        truncated_message = Truncator(self.message)
        return truncated_message.chars(30)
在Post模型中，我们使用了截断器实用程序类。这是一种将长字符串截断为任意字符串大小的简便方法（这里我们使用了30）。

现在让我们打开Python shell终端：

python manage.py shell

# First get a board instance from the database
board = Board.objects.get(name='Django')
这三项任务中最容易的是获得当前的主题，因为主题和董事会是直接相关的：

board.topics.all()
<QuerySet [<Topic: Hello everyone!>, <Topic: Test>, <Topic: Testing a new post>, <Topic: Hi>]>

board.topics.count()
4
就是这样。

现在的数量帖子一内板是有点棘手，因为邮政是没有直接关系的局。

from boards.models import Post

Post.objects.all()
<QuerySet [<Post: This is my first topic.. :-)>, <Post: test.>, <Post: Hi everyone!>,
  <Post: New test here!>, <Post: Testing the new reply feature!>, <Post: Lorem ipsum dolor sit amet,...>,
  <Post: hi there>, <Post: test>, <Post: Testing..>, <Post: some reply>, <Post: Random random.>
]>

Post.objects.count()
11
这里我们有11个职位。但并非所有人都属于“Django”董事会。

以下是我们如何过滤它的方法：

from boards.models import Board, Post

board = Board.objects.get(name='Django')

Post.objects.filter(topic__board=board)
<QuerySet [<Post: This is my first topic.. :-)>, <Post: test.>, <Post: hi there>,
  <Post: Hi everyone!>, <Post: Lorem ipsum dolor sit amet,...>, <Post: New test here!>,
  <Post: Testing the new reply feature!>
]>

Post.objects.filter(topic__board=board).count()
7
双下划线topic__board用于浏览模型的关系。在引擎盖下，Django构建了Board - Topic - Post之间的桥梁，并构建了一个SQL查询来检索属于特定电路板的帖子。

现在我们最后的任务是确定最后的职位。

# order by the `created_at` field, getting the most recent first
Post.objects.filter(topic__board=board).order_by('-created_at')
<QuerySet [<Post: testing>, <Post: new post>, <Post: hi there>, <Post: Lorem ipsum dolor sit amet,...>,
  <Post: Testing the new reply feature!>, <Post: New test here!>, <Post: Hi everyone!>,
  <Post: test.>, <Post: This is my first topic.. :-)>
]>

# we can use the `first()` method to just grab the result that interest us
Post.objects.filter(topic__board=board).order_by('-created_at').first()
<Post: testing>
甜。现在我们可以实施它。

boards / models.py （查看完整文件内容）

from django.db import models

class Board(models.Model):
    name = models.CharField(max_length=30, unique=True)
    description = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    def get_posts_count(self):
        return Post.objects.filter(topic__board=self).count()

    def get_last_post(self):
        return Post.objects.filter(topic__board=self).order_by('-created_at').first()
注意我们正在使用self，因为此方法将由董事会实例使用。这意味着我们使用这个实例来过滤QuerySet。

现在我们可以改进家庭HTML模板来显示这个全新的信息：

模板/ home.html做为

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
          <td class="align-middle">
            {{ board.get_posts_count }}
          </td>
          <td class="align-middle">
            {{ board.topics.count }}
          </td>
          <td class="align-middle">
            {% with post=board.get_last_post %}
              <small>
                <a href="{% url 'topic_posts' board.pk post.topic.pk %}">
                  By {{ post.created_by.username }} at {{ post.created_at }}
                </a>
              </small>
            {% endwith %}
          </td>
        </tr>
      {% endfor %}
    </tbody>
  </table>
{% endblock %}
这就是现在的结果：

主板

运行测试：

python manage.py test
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
.......................................................EEE......................
======================================================================
ERROR: test_home_url_resolves_home_view (boards.tests.test_view_home.HomeTests)
----------------------------------------------------------------------
django.urls.exceptions.NoReverseMatch: Reverse for 'topic_posts' with arguments '(1, '')' not found. 1 pattern(s) tried: ['boards/(?P<pk>\\d+)/topics/(?P<topic_pk>\\d+)/$']

======================================================================
ERROR: test_home_view_contains_link_to_topics_page (boards.tests.test_view_home.HomeTests)
----------------------------------------------------------------------
django.urls.exceptions.NoReverseMatch: Reverse for 'topic_posts' with arguments '(1, '')' not found. 1 pattern(s) tried: ['boards/(?P<pk>\\d+)/topics/(?P<topic_pk>\\d+)/$']

======================================================================
ERROR: test_home_view_status_code (boards.tests.test_view_home.HomeTests)
----------------------------------------------------------------------
django.urls.exceptions.NoReverseMatch: Reverse for 'topic_posts' with arguments '(1, '')' not found. 1 pattern(s) tried: ['boards/(?P<pk>\\d+)/topics/(?P<topic_pk>\\d+)/$']

----------------------------------------------------------------------
Ran 80 tests in 5.663s

FAILED (errors=3)
Destroying test database for alias 'default'...
看来我们在这里实施时遇到问题。如果没有帖子，应用程序崩溃。

模板/ home.html做为

{% with post=board.get_last_post %}
  {% if post %}
    <small>
      <a href="{% url 'topic_posts' board.pk post.topic.pk %}">
        By {{ post.created_by.username }} at {{ post.created_at }}
      </a>
    </small>
  {% else %}
    <small class="text-muted">
      <em>No posts yet.</em>
    </small>
  {% endif %}
{% endwith %}
再次运行测试：

python manage.py test
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
................................................................................
----------------------------------------------------------------------
Ran 80 tests in 5.630s

OK
Destroying test database for alias 'default'...
我添加了一个没有消息的新电路板来检查“空信息”：

主板

现在是时候改进主题列表视图。

主题

我将向您展示另一种方法，以更有效的方式将计数包括在内，这次是回复的数量。

像往常一样，我们首先尝试一下Python shell：

python manage.py shell
from django.db.models import Count
from boards.models import Board

board = Board.objects.get(name='Django')

topics = board.topics.order_by('-last_updated').annotate(replies=Count('posts'))

for topic in topics:
    print(topic.replies)

2
4
2
1
这里我们使用annotateQuerySet方法来即时生成一个新的“列”。这个新的专栏，将被翻译成一个属性，可以通过topic.replies包含一个给定主题的帖子数来访问。

我们可以做一个小小的修复，因为回复不应该考虑启动者主题（这也是Post实例）。

下面是我们如何做到这一点：

topics = board.topics.order_by('-last_updated').annotate(replies=Count('posts') - 1)

for topic in topics:
    print(topic.replies)

1
3
1
0
很酷，对吧？

boards / views.py （查看完整文件内容）

from django.db.models import Count
from django.shortcuts import get_object_or_404, render
from .models import Board

def board_topics(request, pk):
    board = get_object_or_404(Board, pk=pk)
    topics = board.topics.order_by('-last_updated').annotate(replies=Count('posts') - 1)
    return render(request, 'topics.html', {'board': board, 'topics': topics})
templates / topics.html （查看完整文件内容）

{% for topic in topics %}
  <tr>
    <td><a href="{% url 'topic_posts' board.pk topic.pk %}">{{ topic.subject }}</a></td>
    <td>{{ topic.starter.username }}</td>
    <td>{{ topic.replies }}</td>
    <td>0</td>
    <td>{{ topic.last_updated }}</td>
  </tr>
{% endfor %}
主题

下一步现在是修复视图计数。但为此，我们需要创建一个新的领域。

迁移
迁移是使用Django进行Web开发的基本组成部分。这就是我们如何演化我们应用程序的模型，使模型的文件与数据库保持同步。

当我们第一次运行python manage.py migrateDjango 命令时，抓取所有迁移文件并生成数据库模式。

当Django应用迁移时，它有一个名为django_migrations的特殊表。在此表中，Django注册了所有应用的迁移。

所以如果我们尝试再次运行该命令：

python manage.py migrate
Operations to perform:
  Apply all migrations: admin, auth, boards, contenttypes, sessions
Running migrations:
  No migrations to apply.
Django会知道没有什么可做的。

让我们通过向Topic模型添加一个新字段来创建迁移：

boards / models.py （查看完整文件内容）

class Topic(models.Model):
    subject = models.CharField(max_length=255)
    last_updated = models.DateTimeField(auto_now_add=True)
    board = models.ForeignKey(Board, related_name='topics')
    starter = models.ForeignKey(User, related_name='topics')
    views = models.PositiveIntegerField(default=0)  # <- here

    def __str__(self):
        return self.subject
这里我们添加了一个PositiveIntegerField。由于此字段将存储页面浏览次数，因此负面页面浏览无效。

在我们可以使用我们的新领域之前，我们必须更新数据库模式。执行makemigrations命令：

python manage.py makemigrations

Migrations for 'boards':
  boards/migrations/0003_topic_views.py
    - Add field views to topic
该makemigrations命令自动生成0003_topic_views.py文件，该文件将用于修改数据库，添加视图字段。

现在通过运行命令来应用迁移migrate：

python manage.py migrate

Operations to perform:
  Apply all migrations: admin, auth, boards, contenttypes, sessions
Running migrations:
  Applying boards.0003_topic_views... OK
现在我们可以使用它来跟踪给定主题正在接收的视图数量：

boards / views.py （查看完整文件内容）

from django.shortcuts import get_object_or_404, render
from .models import Topic

def topic_posts(request, pk, topic_pk):
    topic = get_object_or_404(Topic, board__pk=pk, pk=topic_pk)
    topic.views += 1
    topic.save()
    return render(request, 'topic_posts.html', {'topic': topic})
templates / topics.html （查看完整文件内容）

{% for topic in topics %}
  <tr>
    <td><a href="{% url 'topic_posts' board.pk topic.pk %}">{{ topic.subject }}</a></td>
    <td>{{ topic.starter.username }}</td>
    <td>{{ topic.replies }}</td>
    <td>{{ topic.views }}</td>  <!-- here -->
    <td>{{ topic.last_updated }}</td>
  </tr>
{% endfor %}
现在打开一个主题并刷新页面几次，看看它是否包含页面浏览量：

帖子

结论
在本教程中，我们在开发Web板功能方面取得了一些进展。还有一些东西需要实现：编辑帖子视图，用户更新其名称的“我的帐户”视图等。在这两个视图之后，我们将打开帖子的降级和实现两个主题的分页列表和主题回复列表。

下一篇教程将着重于使用基于类的视图来解决这些问题。之后，我们将学习如何将我们的应用程序部署到Web服务器。

我希望你喜欢本系列教程的第五部分！第六部分将于2017年10月9日下周发布。如果您希望在第五部分结束时收到通知，您可以订阅我们的邮件列表。

该项目的源代码在GitHub上可用。该项目的当前状态可以在发布标签v0.5-lw下找到。下面的链接将带你到正确的地方：

https://github.com/sibtc/django-beginners-guide/tree/v0.5-lw