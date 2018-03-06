# 一个完整的 Django 入门指南 - 第2部分

>译者：liuzhijun  
>原文：
https://simpleisbetterthancomplex.com/series/2017/09/11/a-complete-beginners-guide-to-django-part-2.html



![featured](./statics/2-1.jpg)


### 前言

欢迎来到 Django 教程的第二节，在第一节中，我们安装了项目所需要的一切，希望你安装的是 Python3.6，并且在虚拟环境中运行 Django1.11，这节课我们继续在这个项目上编写代码。

咱们先讨论一些项目的背景知识，然后再学习 Django 的基础，包括：模型（models），管理后台（admin），视图（views），模板（templates），和路由（URLs）

动手吧！

### 论坛项目

我不知道你是怎样认为的，个人觉得，通过看实际例子和代码片段可以学到东西，但就我个人而言，当你在例子中读到诸如 `class A` 和 `class B` 这样的代码，或者看到诸如 `foo(bar)` 这样的例子时，是很难解释清楚这些概念的，所以，我不想让你这样做。（译注：作者要表达的意思是光写些demo例子意义并不大，而是要做些实际的项目才有帮助）


所以，在进入有趣部分，如模型，视图等其他内容之前，让我们先花点时间，简要地讨论我们将要开发的这个项目。


如果您已经有了Web开发的经验并且觉得它太详细了，那么您可以浏览一下图片以了解我们将要构建的内容，然后跳转到本教程的模型部分。

但是如果你对Web开发不熟悉，我强烈建议你继续阅读下去。它将为您提供关于Web应用程序建模和设计的一些很好的见解。一般来说，Web开发和软件开发不仅仅是编码。	

![pic2-1](./statics/2-2.jpg)		



### 用例图

我们的项目是一个论坛系统，整个项目的构思是维护几个论坛版块（boards），每个版块像一个分类一样。在指定的版块里面，用户可以通过创建新主题（Topic）开始讨论，其他用户可以参与讨论回复。

我们需要找到一种方法来区分普通用户和管理员用户，因为只有管理员可以创建版块。下图概述了主要的用例和每种类型用户的角色：

![usercase](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/use-case-diagram.png)

图1：Web Board提供的核心功能用例图


### 类图

从用例图中，我们可以开始思考项目所需的实体类有哪些。这些实体就是我们要创建的模型，它与我们的Django应用程序处理的数据非常密切。

为了能够实现上面描述的用例，我们需要至少实现下面几个模型：Board，Topic，Post和User。

![class](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/basic-class-diagram.png)

图2：Web Board类图

* Board：版块
* Topic：主题
* Post：帖子（译注：其实就是主题的回复或评论）

花点时间考虑模型之间如何相互关联也很重要。类与类之间的实线告诉我们，在一个主题（Topic）中，我们需要有一个字段（译注：其实就是通过外键来关联）来确定它属于哪个版块（Board）。同样，帖子（Post）也需要一个字段来表示它属于哪个主题，这样我们就可以列出在特定主题内创建的帖子。最后，我们需要一个字段来表示主题是谁发起的，帖子是谁发的。


用户和版块之间也有联系，谁创建的版块。但是这些信息与应用程序无关。还有其他方法可以跟踪这些信息，稍后您会看到。

现在我们的类图有基本的表现形式，我们还要考虑这些模型将承载哪些信息。这很容易让事情变得复杂，所以试着先把重要的内容列出来，这些内容是我们启动项目需要的信息。后面我们再使用 Django 的迁移（Migrations）功能来改进模型，您将在下一节中详细了解这些内容。

但就目前而言，这是模型最基本的内容：

![models](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/class-diagram.png)

图3：强调类（模型）之间关系的类图


这个类图强调的是模型之间的关系，这些线条和箭头最终会在稍后转换为字段。

对于 **Board** 模型，我们将从两个字段开始：name 和 description。 name字段必须是唯一的，为了避免有重复的名称。description 用于说明这个版块是做什么用的。

**Topic** 模型包括四个字段：subject 表示主题内容，last_update 用来定义话题的排序，starter 用来识别谁发起的话题，board 用于指定它属于哪个版块。

**Post** 模型有一个 message 字段，用于存储回复的内容，created_at 在排序时候用（最先发表的帖子排最前面），updated_at 告诉用户是否更新了内容，同时，还需要有对应的 User 模型的引用，Post 由谁创建的和谁更新的。

最后是 User 模型。在类图中，我只提到了字段 username，password，email， is_superuser 标志，因为这几乎是我们现在要使用的所有东西。

需要注意的是，我们不需要创建 User 模型，因为Django已经在contrib包中内置了User模型，我们将使用它。


关于类图之间的对应关系（数字 1，0..* 等等），这里教你如何阅读：

一个topic 必须与一个（1）Board（这意味着它不能为空）相关联，但是 Board 下面可能与许多个或者0个 topic 关联 (0..*)。这意味着 Board 下面可能没有主题。（译注：一对多关系）

![board](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/class-diagram-board-topic.png)

一个 Topic 至少有一个 Post（发起话题时，同时会发布一个帖子），并且它也可能有许多 Post（1..*）。一个Post 必须与一个并且只有一个Topic（1）相关联。

![post](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/class-diagram-topic-post.png)

一个 Topic 必须有一个且只有一个 User 相关联，topic 的发起者是（1）。而一个用户可能有很多或者没有 topic（0..*）。

![topic](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/class-diagram-topic-user.png)


Post 必须有一个并且只有一个与之关联的用户，用户可以有许多或没有 Post（0..*）。Post 和 User之间的第二个关联是直接关联（参见该行最后的箭头），就是 Post 可以被用户修改（updated_by），updated_by 有可能是空（Post 没有被修改）


画这个类图的另一种方法是强调字段而不是模型之间的关系：

![class](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/class-diagram-attributes.png)

图4：强调类（模型）与属性（字段）的类图

上面的表示方式与前面的表示方式是对等的，不过这种方式更接近我们将要使用 Django Models API 设计的内容。在这种表示方式中，我们可以更清楚地看到，在 Post 模型中，关联了 Topic，created_by（创建者）和 updated_by（更新者）字段。另一个值得注意的事情是，在 Topic 模型中，有一个名为 `posts（）`的操作（一个类方法）。我们将通过反向关系来实现这一目标，Django 将自动在数据库中执行查询以返回特定主题的所有帖子列表。


好了，现在已经够UML了！为了绘制本节介绍的图表，我使用了 [StarUML](http://staruml.io/) 工具。


### 线框图（原型图）

花了一些时间来设计应用程序的模型后，我喜欢创建一些线框来定义需要完成的工作，并且清楚地了解我们将要做什么。

![2-3.jpg](./statics/2-3.jpg)

基于线框图，我们可以更深入地了解应用程序中涉及的实体。

首先，我们需要在主页上显示所有版块：

![boards](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/wireframe-boards.png)

图5：论坛项目线框主页列出所有可用的版块。

如果用户点击一个链接，比如点击Django版块，它应该列出所有Django相关的主题：

![topics](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/wireframe-topics.png)

图6：论坛项目线框图列出了Django版块中的所有主题

这里有两个入口：用户点击“new topic“ 按钮创建新主题，或者点击主题链接查看或参与讨论。

“new topic” 页面：

![topic](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/wireframe-new-topic.png)


现在，主题页面显示了帖子和讨论：

![](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/wireframe-posts.png)

如果用户点击回复按钮，将看到下面这个页面，并以倒序的方式（最新的在第一个）显示帖子列表：

![](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/wireframe-reply.png)

绘制这些线框，你可以使用[draw.io](https://draw.io/)服务，它是免费的。



### 模型


这些模型基本上代表了应用程序的数据库设计。我们在本节中要做的是创建 Django 所表示的类，这些类就是在上一节中建模的类：Board，Topic和Post。User 模型被命名为内置应用叫 **auth*，它以命名空间 django.contrib.auth 的形式出现在 `INSTALLED_APPS` 配置中。

我们要做的工作都在 boards/models.py 文件中。以下是我们在Django应用程序中如何表示类图的代码：


```python
from django.db import models
from django.contrib.auth.models import User


class Board(models.Model):
    name = models.CharField(max_length=30, unique=True)
    description = models.CharField(max_length=100)


class Topic(models.Model):
    subject = models.CharField(max_length=255)
    last_updated = models.DateTimeField(auto_now_add=True)
    board = models.ForeignKey(Board, related_name='topics')
    starter = models.ForeignKey(User, related_name='topics')


class Post(models.Model):
    message = models.TextField(max_length=4000)
    topic = models.ForeignKey(Topic, related_name='posts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True)
    created_by = models.ForeignKey(User, related_name='posts')
    updated_by = models.ForeignKey(User, null=True, related_name='+')
```

所有模型都是**django.db.models.Model**类的子类。每个类将被转换为数据库表。每个字段由 **django.db.models.Field**子类（内置在Django core）的实例表示，它们并将被转换为数据库的列。

字段 CharField，DateTimeField等等，都是 **django.db.models.Field** 的子类，包含在Django的核心里面-随时可以使用。

在这里，我们仅使用 CharField，TextField，DateTimeField，和ForeignKey 字段来定义我们的模型。不过在Django提供了更广泛的选择来代表不同类型的数据，例如 IntegerField，BooleanField， DecimalField和其它一些字段。我们会在需要的时候提及它们。

有些字段需要参数，例如CharField。我们应该始终设定一个 `max_length`。这些信息将用于创建数据库列。Django需要知道数据库列需要多大。该 `max_length`参数也将被Django Forms API用来验证用户输入。

在`Board`模型定义中，更具体地说，在`name`字段中，我们设置了参数 `unique=True`，顾名思义，它将强制数据库级别字段的唯一性。

在`Post`模型中，`created_at`字段有一个可选参数，`auto_now_add`设置为`True`。这将告诉Django创建`Post`对象时为当前日期和时间。

模型之间的关系使用`ForeignKey`字段。它将在模型之间创建一个连接，并在数据库级别创建适当的关系（译注：外键关联）。该`ForeignKey`字段需要一个位置参数`related_name`，用于引用它关联的模型。（译注：例如 created_by 是外键字段，关联的User模型，表明这个帖子是谁创建的，related_name=posts 表示在 User 那边可以使用 user.posts 来查看这个用户创建了哪些帖子）

例如，在`Topic`模型中，`board`字段是`Board`模型的`ForeignKey`。它告诉Django，一个`Topic`实例只涉及一个Board实例。`related_name`参数将用于创建反向关系，`Board`实例通过属性`topics`访问属于这个版块下的`Topic`列表。

Django自动创建这种反向关系，`related_name`是可选项。但是，如果我们不为它设置一个名称，Django会自动生成它：`(class_name)_set`。例如，在`Board`模型中，所有`Topic`列表将用`topic_set`属性表示。而这里我们将其重新命名为了`topics`，以使其感觉更自然。

在`Post`模型中，该`updated_by`字段设置`related_name='+'`。这指示Django我们不需要这种反向关系，所以它会被忽略（译注：也就是说我们不需要关系用户修改过哪些帖子）。

下面您可以看到类图和Django模型的源代码之间的比较，绿线表示我们如何处理反向关系。

![relate](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/class-diagram-django-models.png)

这时，你可能会问自己：“主键/ ID呢？”？如果我们没有为模型指定主键，Django会自动为我们生成它。所以现在一切正常。在下一节中，您将看到它是如何工作的。
### 迁移模型

下一步是告诉Django创建数据库，以便我们可以开始使用它。

打开终端 ，激活虚拟环境，转到 manage.py文件所在的文件夹，然后运行以下命令：

```python
python manage.py makemigrations
```
你会看到输出的内容是：

```
Migrations for 'boards':
  boards/migrations/0001_initial.py
    - Create model Board
    - Create model Post
    - Create model Topic
    - Add field topic to post
    - Add field updated_by to post

```

此时，Django 在 boards/migrations 目录创建了一个名为 `0001_initial.py`的文件。它代表了应用程序模型的当前状态。在下一步，Django将使用该文件创建表和列。


迁移文件将被翻译成SQL语句。如果您熟悉SQL，则可以运行以下命令来检验将是要被数据库执行的SQL指令

```python
python manage.py sqlmigrate boards 0001

```

如果你不熟悉SQL，也不要担心。在本系列教程中，我们不会直接使用SQL。所有的工作都将使用Django ORM来完成，它是一个与数据库进行通信的抽象层。

下一步是将我们生成的迁移文件应用到数据库：

```python
python manage.py migrate

```

输出内容应该是这样的：

```python
Operations to perform:
  Apply all migrations: admin, auth, boards, contenttypes, sessions
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
```

因为这是我们第一次迁移数据库，所以`migrate`命令把Django contrib app 中现有的迁移文件也执行了，这些内置app列在了`INSTALLED_APPS`。这是预料之中的。

`Applying boards.0001_initial... OK`是我们在上一步中生成的迁移脚本。

好了！我们的数据库已经可以使用了。

![featured](./statics/2-3.jpg)

>需要注意的是SQLite是一个产品级数据库。SQLite被许多公司用于成千上万的产品，如所有Android和iOS设备，主流的Web浏览器，Windows 10，MacOS等。

>但这不适合所有情况。SQLite不能与MySQL，PostgreSQL或Oracle等数据库进行比较。大容量的网站，密集型写入的应用程序，大的数据集，高并发性的应用使用SQLite最终都会导致问题。

>我们将在开发项目期间使用SQLite，因为它很方便，不需要安装其他任何东西。当我们将项目部署到生产环境时，再将切换到PostgreSQL（译注：后续，我们后面可能使用MySQL）。对于简单的网站这种做法没什么问题。但对于复杂的网站，建议在开发和生产中使用相同的数据库。


### 试验 Models API

使用Python进行开发的一个重要优点是交互式shell。我一直在使用它。这是一种快速尝试和试验API的方法。

您可以使用manage.py 工具加载我们的项目来启动 Python shell ：

```python
python manage.py shell

```

```python
Python 3.6.2 (default, Jul 17 2017, 16:44:45)
[GCC 4.2.1 Compatible Apple LLVM 8.1.0 (clang-802.0.42)] on darwin
Type "help", "copyright", "credits" or "license" for more information.
(InteractiveConsole)
>>>
```

这与直接输入`python`指令来调用交互式控制台是非常相似的，除此之外，项目将被添加到`sys.path`并加载Django。这意味着我们可以在项目中导入我们的模型和其他资源并使用它。

让我们从导入Board类开始：

```python
from boards.models import Board

```

要创建新的 boarrd 对象，我们可以执行以下操作：

```python
board = Board(name='Django', description='This is a board about Django.')

```

为了将这个对象保存在数据库中，我们必须调用save方法：


```python
board.save()

```

`save`方法用于创建和更新对象。这里Django创建了一个新对象，因为这时Board 实例没有id。第一次保存后，Django会自动设置ID：

```python
board.id
1
```

您可以将其余的字段当做Python属性访问：

```python
board.name
'Django'
```

```python
board.description
'This is a board about Django.'
```

要更新一个值，我们可以这样做：

```python
board.description = 'Django discussion board.'
board.save()
```

每个Django模型都带有一个特殊的属性; 我们称之为**模型管理器(Model Manager)**。n你可以访问它的objects属性。它主要用于数据库操作。例如，我们可以使用它来直接创建一个新的Board对象：


```python
board = Board.objects.create(name='Python', description='General discussion about Python.')

```

```python
board.id
2
```

```python
board.name
'Python'
```

所以，现在我们有两个版块了。我们可以使用`objects`列出数据库中所有现有的版块：

```python
Board.objects.all()
<QuerySet [<Board: Board object>, <Board: Board object>]>
```

结果是一个QuerySet。稍后我们会进一步了解。基本上，它是从数据库中查询的对象列表。我们看到有两个对象，但显示的名称是 Board object。这是因为我们尚未实现 Board 的`__str__` 方法。


`__str__`方法是对象的字符串表示形式。我们可以使用版块的名称来表示它。

首先，退出交互式控制台：

```python
exit()

```

现在编辑boards app 中的 models.py 文件：

```python
class Board(models.Model):
    name = models.CharField(max_length=30, unique=True)
    description = models.CharField(max_length=100)

    def __str__(self):
        return self.name
 ```

 让我们重新查询，再次打开交互式控制台：

```python
 python manage.py shell
```

```python
from boards.models import Board

Board.objects.all()
<QuerySet [<Board: Django>, <Board: Python>]>
```

好多了，对吧？

我们可以将这个QuerySet看作一个列表。假设我们想遍历它并打印每个版块的描述：

```python
boards_list = Board.objects.all()
for board in boards_list:
    print(board.description)
```
结果是：
```python
Django discussion board.
General discussion about Python.
```
同样，我们可以使用模型的 **Manager** 来查询数据库并返回单个对象。为此，我们要使用 `get` 方法：
```python
django_board = Board.objects.get(id=1)

django_board.name
'Django'
```

但我们必须小心这种操作。如果我们试图查找一个不存在的对象，例如，查找id=3的版块，它会引发一个异常：

```python
board = Board.objects.get(id=3)

boards.models.DoesNotExist: Board matching query does not exist.
```

我们可以在`get`上使用模型的任何字段，但最好使用可唯一标识对象的字段来查询。否则，查询可能会返回多个对象，这也会导致异常。
```python
Board.objects.get(name='Django')
<Board: Django>
```
请注意，查询区分大小写，小写“django”不匹配：

```python
Board.objects.get(name='django')
boards.models.DoesNotExist: Board matching query does not exist.
```
### 模型操作总结
下面是我们在本节中关于模型学到的方法和操作总结，并使用Board模型作为参考。大写的 **Board`指类，小写的**board**指**Board**的一个实例（或对象）

|操作|代码示例|
|:----|:-----|
|创建一个对象而不保存|	board = Board()|
|保存一个对象（创建或更新）|	board.save()|
|数据库中创建并保存一个对象|	Board.objects.create(name='...', description='...')|
|列出所有对象|	Board.objects.all()|
|通过字段标识获取单个对象|Board.objects.get(id=1)|

在下一小节中，我们将开始编写视图并在HTML页面中显示我们的版块。


### 视图、模板、静态文件

目前我们已经有一个视图函数叫`home`,这个视图在我们的应用程序主页上显示为“Hello，World！” 

**myproject/urls.py**

```python
from django.conf.urls import url
from django.contrib import admin

from boards import views

urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^admin/', admin.site.urls),
]
```

**boards/views.py**

```python
from django.http import HttpResponse

def home(request):
    return HttpResponse('Hello, World!')
```

我们可以从这里开始写。如果你回想起我们的原型图，图5显示了主页应该是什么样子。我们想要做的是在表格中列出一些版块的名单以及其他一些描述信息。

![board](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/wireframe-boards.png)

首先要做的是导入Board模型并列出所有现有的boards

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

```python
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

```python
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

```python
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

我们可以table表示替换，改进HTML模板：

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
from django.core.urlresolvers import reverse
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

如果出现未捕获的异常，语法错误或其他任何情况，Django会返回状态代码500，这意味着**内部服务器错误**。现在，想象我们的应用程序有100个视图。如果我们为所有视图编写这个简单的测试，只需一个命令，我们就能够测试所有视图是否返回成功代码，因此用户在任何地方都看不到任何错误消息。如果没有自动化测试，我们需要逐一检查每个页面。

执行Django的测试套件：

```python
python manage.py test
```

```python
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
.
----------------------------------------------------------------------
Ran 1 test in 0.041s

OK
Destroying test database for alias 'default'...
```

现在我们可以测试Django是否在请求的URL的时候返回了正确的视图函数。这也是一个有用的测试，因为随着开发的进展，您会发现urls.py模块可能变得非常庞大而复杂。URL conf 全部是关于解析正则表达式的。有些情况下有一个非常宽容的URL（译注：本来不应该匹配的，却因为正则表达式写的过于宽泛而错误的匹配了），所以Django最终可能返回错误的视图函数。

我们可以这样做：

**boards/tests.py**

```python
from django.core.urlresolvers import reverse
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

```python
python manage.py test
```

```python
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
..
----------------------------------------------------------------------
Ran 2 tests in 0.027s

OK
Destroying test database for alias 'default'...
```



### 静态文件测试

### Django Admin 介绍

### 总结