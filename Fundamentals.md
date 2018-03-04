# 一个完整的Django入门指南 - 第2部分

>译者：liuzhijun  
>原文：
https://simpleisbetterthancomplex.com/series/2017/09/11/a-complete-beginners-guide-to-django-part-2.html



![featured](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/featured.jpg)


### 前言

欢迎来到 Django 教程的第二节，在第一节中，我们安装了项目所需要的一切，希望你安装的是 Python3.6，并且在虚拟环境中运行 Django1.11，这节课我们继续在这个项目上编写代码。

我们先讨论一点关于项目的背景知识，然后再学习 Django 的基础知识，包括：模型（models），管理后台（admin），视图（views），模板（templates），和路由（URLs）

动手吧！

### 论坛项目

我不知道你是怎样的，个人认为，通过看实际例子和代码片段可以学到东西，但就我个人而言，当你在例子中读到诸如 `clalss A` 和 `class B` 这样的代码，或者看到诸如 `foo(bar)` 这样的例子时，是很难解释清楚这些概念的，所以，我不想和你这样做。（作者要表达的意思是光写些demo例子意义并不大，而是要做些实际的项目才有帮助）


所以，在进入有趣部分，如模型，视图等其他一切之前，让我们先花点时间，简要地讨论我们将要开发的这个项目。


如果您已经有了Web开发的经验并且觉得它太详细了，那么您可以浏览一下图片以了解我们将要构建的内容，然后跳转到本教程的模型部分。

但是如果你对Web开发不熟悉，我强烈建议你继续阅读下去。它将为您提供关于Web应用程序建模和设计的一些很好的见解。一般来说，Web开发和软件开发不仅仅是编码。	

![pic2-1](./statics/2-1.jpg)		



### 用例图

我们的项目是一个论坛系统，整个项目的构思是维护几个论坛版块（boards），每个版块像一个分类一样。在指定的版块里面，用户可以通过创建新话题（Topic）开始讨论，其他用户可以参与讨论回复。

我们需要找到一种方法来区分普通用户和管理员用户，因为只有管理员可以创建版块。下图概述了主要的用例和每种类型用户的角色：

![usercase](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/use-case-diagram.png)

图1：Web Board提供的核心功能用例图


### 类图

从用例图中，我们可以开始思考项目所需的实体类有哪些。这些实体就是我们要创建的模型，它与我们的Django应用程序处理的数据非常密切。

为了能够实现上面描述的用例，我们需要至少实现下面几个模型：Board，Topic，Post和User。

![class](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/basic-class-diagram.png)

图2：Web Board类图

* Board：版块
* Topic：话题
* Post：帖子（就是主题的回复或评论）

花点时间考虑模型之间如何相互关联也很重要。类与类之间的实线告诉我们，在一个话题（Topic）中，我们需要有一个字段（译注：其实就是通过外键来关联）来确定它属于哪个版块（Board）。同样，帖子（Post）也需要一个字段来表示它属于哪个主题，这样我们就可以列出在特定话题内创建的帖子。最后，我们需要一个字段来标志话题是谁发起的，帖子是谁发的。


用户和版块之间也有联系，谁创建的版块。但是这些信息与应用程序无关。还有其他方法可以跟踪这些信息，稍后您会看到。

现在我们有基本的类图表现形式，我们还要考虑这些模型将承载哪些信息。这种事情很容易变得复杂，所以试着先把重要的内容列出来，这些内容是我们启动项目需要的信息。稍后，我们可以使用 Django 的迁移（Migrations）功能来改进模型，您将在下一节中详细了解这些内容。

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


好了，现在已经够UML了！为了绘制本节介绍的图表，我使用了 StarUML 工具。


### 线框图（原型图）

花了一些时间来设计应用程序的模型后，我喜欢创建一些线框来定义需要完成的工作，并且清楚地了解我们将要做什么。

![2-3.jpg](./statics/2-3.jpg)

基于线框，我们可以更深入地了解应用程序中涉及的实体。

首先，我们需要在主页上显示所有的版块：

![boards](./statics/https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/wireframe-boards.png)

图5：论坛项目线框主页列出所有可用的版块。

如果用户点击一个链接，比如说在Django版块上，它应该列出所有话题：

![topics](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/wireframe-topics.png)

图6：论坛项目线框列出了Django版块中的所有话题。

这里我们有两条路径：用户点击“新话题”按钮创建新主题，或者用户点击主题以查看或参与讨论。

“topic”页面：

![topic](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/wireframe-new-topic.png)


现在，主题页面显示了帖子和讨论：

![](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/wireframe-posts.png)

如果用户点击回复按钮，将看到下面这个页面，并以相反的顺序（最新的在第一个）对帖子进行总结：

![](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-2/wireframe-reply.png)

要绘制这些线框，你可以使用draw.io服务，它是免费的。



### 模型


这些模型基本上代表了应用程序的数据库布局。我们在本节中要做的是创建 Django 所表示的类，这些类就是在上一节中建模的类：Board，Topic和Post。User 模型被命名为内置应用叫 **auth*，它以命名空间 django.contrib.auth 的形式列在 `INSTALLED_APPS` 配置中。

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

### 迁移模型

### 模型API操作

### 模型总结

### 视图、模板、静态文件


### Django 模板引擎设置


### 首页测试


### 静态文件测试

### Django Admin 介绍

### 总结