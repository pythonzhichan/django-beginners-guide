# Django入门指南-第3章：Hello World 

现在来写我们的第一个**视图(view)**。我们将在下一篇教程中详细探讨它。但现在，让我们试试看看如何用Django创建一个新页面。

打开**boards**应用程序中的**views.py**文件，并添加以下代码：

**views.py**

```python
from django.http import HttpResponse

def home(request):
    return HttpResponse('Hello, World!')

```

视图是接收`httprequest`对象并返回一个`httpresponse`对象的Python函数。接收 *request* 作为参数并返回 *response* 作为结果。这个流程你必须记住！

我们在这里定义了一个简单的视图，命名为**home**，它只是简单地返回一个信息，一个字符串**hello，world!**。

现在我们必须告诉Django什么时候会调用这个view。这需要在urls.py文件中完成：

**urls.py**

```python
from django.conf.urls import url
from django.contrib import admin

from boards import views

urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^admin/', admin.site.urls),
]
```

如果你将上面的代码片段与你的**urls.py**文件进行比较，你会注意到我添加了以下新代码：`url（r'^ $'，views.home，name ='home'）`并通过`from boards import views`从我们的应用程序**boards**中导入了**views**模块。

和我之前提到的一样，我们将在稍后详细探讨这些概念。

现在，Django使用**正则表达式**来匹配请求的URL。对于我们的**home**视图，我使用`^$` 正则，它将匹配一个空路径，也就是主页（这个URL：[http://127.0.0.1:8000](http://127.0.0.1:8000) ）。如果我想匹配的URL是 **[http://127.0.0.1:8000/homepage/](http://127.0.0.1:8000/homepage/)** ，那么我的URL正则表达式就会是：`url(r'^homepage/$', views.home, name='home')`。

我们来看看会发生什么：

```bash
python manage.py runserver
```

在一个Web浏览器中，打开 **[http://127.0.0.1:8000](http://127.0.0.1:8000)** 这个链接：

![](./statics/1-14.png)

就是这样！你刚刚成功创建了你的第一个视图。

### 总结

这是本系列教程的第一部分。在本教程中，我们学习了如何安装最新的Python版本以及如何设置开发环境。我们还介绍了虚拟环境，开始了我们的第一个django项目，并已经创建了我们的初始应用程序。

我希望你会喜欢第一部分！第二部分将于2017年9月11日下周发布。它将涉及模型，视图，模板和URLs。我们将一起探索Django所有的基础知识！如果您希望在第二部分发布时收到通知，可以订阅我们的[邮件列表](http://eepurl.com/b0gR51)。

为了让我们能够保持学习过程中页面同步，我在Github上提供了源代码。这个项目的当前状态可以在**release tag v0.1-lw**下找到。下面是直达链接：

[https://github.com/sibtc/django-beginners-guide/tree/v0.1-lw](https://github.com/sibtc/django-beginners-guide/tree/v0.1-lw)