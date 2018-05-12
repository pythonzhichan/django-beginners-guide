# Django入门与实践-第17章：访问已登录用户


现在我么可以改进 **new_topic** 视图，将发布主题的用户设置当前登录的用户，取代之前直接从数据库查询出来的第一个用户，之前这份代码是临时的，因为那时候还没有方法去获取登录用户，但是现在可以了：

**boards/views.py** ([完整代码](https://gist.github.com/vitorfs/483936caca4618dc275545ad2dfbef24#file-views-py-L19))

```python
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
```

我们可以添加一个新的主题快速验证一下：

![5-5.png](./statics/5-5.png)


###  主题回复列表

现在我们花点时间来实现主题的回复列表页面，先来看一下下面的线框图：

![5-6.png](./statics/5-6.png)

首先我们需要写URL路由：

**myproject/urls.py**([完成代码](https://gist.github.com/vitorfs/aede6d3b7dc3494cf0df48f796075403#file-urls-py-L38))

```python
url(r'^boards/(?P<pk>\d+)/topics/(?P<topic_pk>\d+)/$', views.topic_posts, name='topic_posts'),
```

有两个关键字参数，`pk`用于唯一标识版块（Board），`topic_pk`用于唯一标识该回复来自哪个主题。

**boards/views.py**（[完整代码](https://gist.github.com/vitorfs/3d73ef25a01eceea07ef3ad8538437cf#file-views-py-L39))

```python
from django.shortcuts import get_object_or_404, render
from .models import Topic

def topic_posts(request, pk, topic_pk):
    topic = get_object_or_404(Topic, board__pk=pk, pk=topic_pk)
    return render(request, 'topic_posts.html', {'topic': topic})
```


注意我们正在间接地获取当前的版块，记住，主题（topic）模型是关联版块（Board）模型的，所以我们可以访问当前的版块，你将在下一个代码段中看到：

**templates/topic_posts.html**([完整代码](https://gist.github.com/vitorfs/17e583f4f0068850c5929bd307dd436a))

```html

{% extends 'base.html' %}

{% block title %}{{ topic.subject }}{% endblock %}

{% block breadcrumb %}
  <li class="breadcrumb-item"><a href="{% url 'home' %}">Boards</a></li>
  <li class="breadcrumb-item"><a href="{% url 'board_topics' topic.board.pk %}">{{ topic.board.name }}</a></li>
  <li class="breadcrumb-item active">{{ topic.subject }}</li>
{% endblock %}

{% block content %}

{% endblock %}
```

现在你会看到我们在模板中 `board.name`被替换掉了，在导航条，是使用的topic的属性：`topic.board.name`。

![5-7.png](./statics/5-7.png)

现在我们给**topic_posts**添加一个新的测试文件：

**boards/tests/test_view_topic_posts.py**

```python
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
```

注意到，setup函数变得越来越复杂，我们可以创建一个 minxin 或者抽象类来重用这些代码，我们也可以使用第三方库来初始化设置一些测试数据，来减少这些样板代码。

同时，我们已经有了大量的测试用例，运行速度开始逐渐变得慢起来，我们可以通过用测试套件的方式测试指定的app。

```shell
python manage.py test boards

```

```shell
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
.......................
----------------------------------------------------------------------
Ran 23 tests in 1.246s

OK
Destroying test database for alias 'default'...
```

我们还可以只运行指定的测试文件

```shell
python manage.py test boards.tests.test_view_topic_posts
```

```shell
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
..
----------------------------------------------------------------------
Ran 2 tests in 0.129s

OK
Destroying test database for alias 'default'...

```

抑或是指定单个测试用例

```shell
python manage.py test boards.tests.test_view_topic_posts.TopicPostsTests.test_status_code

```

```shell
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
.
----------------------------------------------------------------------
Ran 1 test in 0.100s

OK
Destroying test database for alias 'default'...

```
很酷，是不是？

继续前行！

在 topic_posts.html 页面中，我们可以创建一个for循环迭代主题下的回复

**templates/topic_posts.html**

```html

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
```

因为我们现在还没有任何方法去上传用户图片，所以先放一张空的图片，我从[ IconFinder](https://www.iconfinder.com/search/?q=user&license=2&price=free)下载了一张免费图片，然后保存在项目的 static/img 目录。


我们还没有真正探索过Django的ORM，但代码`{{ post.created_by.posts.count }}` 在数据库中会执行一个`select count`查询。尽管结果是正确的，但不是一个好方法。因为它在数据库中造成了多次不必要的查询。不过现在不用担心，先专注于如何与应用程序进行交互。稍后，我们将改进此代码，以及如何改进那些复杂笨重的查询。（译注：过早优化是万恶之源）


另一个有意思的地方是我们正在测试当前帖子是否属于当前登录用户：`{% if post.created_by == user %}`，我们只给帖子的拥有者显示编辑按钮。

因为我们现在要在主题页面添加一个URL路由到主题的帖子列表，更新 topic.html 模版，加上一个链接：

**templates/topics.html** ([完整代码](https://gist.github.com/vitorfs/cb4b7c9ff382ddeafb4114d0c84b3869))

```python
{% for topic in board.topics.all %}
  <tr>
    <td><a href="{% url 'topic_posts' board.pk topic.pk %}">{{ topic.subject }}</a></td>
    <td>{{ topic.starter.username }}</td>
    <td>0</td>
    <td>0</td>
    <td>{{ topic.last_updated }}</td>
  </tr>
{% endfor %}
```