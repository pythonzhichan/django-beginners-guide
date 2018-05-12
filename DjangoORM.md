# Django入门与实践-第20章：迁移

迁移（Migration）是Django做Web开发的基本组成部分，它使得我们在演进应用的models时，它能使得models文件与数据库保持同步

当我们第一次运行命令 `python manage.py migrate`的时候，Django 会抓取所有迁移文件然后生成数据库 schema。

当Django应用了迁移之后，有一个特殊的表叫做**django_migrations**，在这个表中，Django注册了所有已经的迁移记录。

所以，如果我们重新运行命令：

```shell
python manage.py migrate
```

```shell
Operations to perform:
  Apply all migrations: admin, auth, boards, contenttypes, sessions
Running migrations:
  No migrations to apply.
```

Django 知道没什么事可做了。

现在我们添加在 Topic 模型中添加一个新的字段：

**boards/models.py**([完整代码](https://gist.github.com/vitorfs/816f47aa4df8e7b157df75e0ff209aac#file-models-py-L25))

```python
class Topic(models.Model):
    subject = models.CharField(max_length=255)
    last_updated = models.DateTimeField(auto_now_add=True)
    board = models.ForeignKey(Board, related_name='topics')
    starter = models.ForeignKey(User, related_name='topics')
    views = models.PositiveIntegerField(default=0)  # <- here

    def __str__(self):
        return self.subject
```

我们添加了一个`PositiveIntegerField`，因为这个字段将要存储的是页面的浏览量，不可能是一个负数


在我们可以使用这个新字段前，我们必须更新数据库schema，执行命令 `makemigrations`

```shell
python manage.py makemigrations

Migrations for 'boards':
  boards/migrations/0003_topic_views.py
    - Add field views to topic
```

`makemigrations`会自动生成**0003_topic_views.py**文件，将用于修改数据库（添加一个views字段）

现在运行命令 `migrate`来应用迁移

```shell
python manage.py migrate

Operations to perform:
  Apply all migrations: admin, auth, boards, contenttypes, sessions
Running migrations:
  Applying boards.0003_topic_views... OK
```

现在我们可以用它来追踪指定主题被阅读了多少次

**boards/views.py** ([完整代码](https://gist.github.com/vitorfs/c0c97c1e050204d9152c59b4da2f9305#file-views-py-L41))

```python
from django.shortcuts import get_object_or_404, render
from .models import Topic

def topic_posts(request, pk, topic_pk):
    topic = get_object_or_404(Topic, board__pk=pk, pk=topic_pk)
    topic.views += 1
    topic.save()
    return render(request, 'topic_posts.html', {'topic': topic})
```

**templates/topics.html**([完整代码](https://gist.github.com/vitorfs/70ebb1a06e1044387943ee83bafcd526))

```html

{% for topic in topics %}
  <tr>
    <td><a href="{% url 'topic_posts' board.pk topic.pk %}">{{ topic.subject }}</a></td>
    <td>{{ topic.starter.username }}</td>
    <td>{{ topic.replies }}</td>
    <td>{{ topic.views }}</td>  <!-- here -->
    <td>{{ topic.last_updated }}</td>
  </tr>
{% endfor %}

```

现在打开一个主题，刷新页面几次，然后你会看到有页面阅读次数统计了。

![5-17.png](./statics/5-17.png)


###  总结

在这节课中，我们在留言板的基础功能上取得了一些进步，还剩下一些东西等待去实现，比如：编辑帖子、我的账户（更改个人信息）等等。之后我们将提供markdown语法和列表的分页功能。

下一节主要使用基于类的视图来解决这些问题，在之后，我们将学习到如何部署应用程序到Web服务器中去。

这部分的完整代码可以访问：[https://github.com/sibtc/django-beginners-guide/tree/v0.5-lw](https://github.com/sibtc/django-beginners-guide/tree/v0.5-lw)









































