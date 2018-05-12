Authentication.md

https://simpleisbetterthancomplex.com/series/2017/09/25/a-complete-beginners-guide-to-django-part-4.html

![Part5](https://upload-images.jianshu.io/upload_images/5889935-afe626677808cd1c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> 教程：[原文地址](https://simpleisbetterthancomplex.com/series/2017/09/25/a-complete-beginners-guide-to-django-part-4.html)
	译者：[CasualJi](https://github.com/CasualJi)

### 介绍
这个教程将会谈谈和Django身份验证系统有关的一切。我们将完成一套完整的流程：注册，登录，登出，密码重置，密码修改。

你也将获知关于如何保护一些视图以防不合法的用户以及如何给已登录的提供信息的简介。

在以下部分，你将看到一些将在本教程中实现的和身份验证有关线框图。之后，你将看到一个全新Django App的初始步骤。至今为止我们在开发一个名叫boards的应用。不过所有身份认证相关的内容适用于不同的应用，这样能实现对代码更良好的组织。

![](https://upload-images.jianshu.io/upload_images/5889935-2a607c5434fbe7af.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


### 线框图
我们需要更新这个应用的线框图。首先，我们为头部菜单增加新的选项。如果当前用户没有经过身份认证，我们应该显示两个按钮：“注册”和“登录”。
![Figure 1: Top menu for not authenticated users.](https://upload-images.jianshu.io/upload_images/5889935-022c14f081eecfe1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

如果当前用户已经通过身份认证，我们应该显示他们的名字，沿着他们的名字显示带有“我的账户”，“修改密码”，“登出”这三个选项的下拉框。
![Figure 2: Top menu for authenticated users.](https://upload-images.jianshu.io/upload_images/5889935-f45f7b72481c91a9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

在登陆页面，我们需要张带有“用户名”和“密码”的表单，一个有着主要功能的按钮（登录）和两个可选路径：“注册”和“重置密码”。
![Figure 3: Log in page](https://upload-images.jianshu.io/upload_images/5889935-f293a7236a0b0ac9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

在注册界面，我们应该有一张带有四个字段的表单：“用户名”，“电邮”，“密码”，“确认密码”。用户也应能够跳转到登陆界面。
![Figure 4: Sign up page](https://upload-images.jianshu.io/upload_images/5889935-54c6b7c4fe889dee.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

在密码重置界面，我们只需要带有“电子邮箱”的表单。
![Figure 5: Password reset](https://upload-images.jianshu.io/upload_images/5889935-a59565e14e2f67c1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后，在点击了一个特殊的链接后（注：指的是“send password reset email”这个按钮）用户将会重定向到一个他们可以设置新密码的页面。
![Figure 6: Change password](https://upload-images.jianshu.io/upload_images/5889935-3f7a854a6dc90556.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

***
### 初始化安装
为了去管理所有信息，我们可以将它分解成为一个不同的应用。在项目根目录，也就是`manage.py`脚本所在的界面下，运行以下命令来创建一个新的应用：
```
django-admin startapp accounts
```
这个项目结构应该是这样：
```
myproject/
 |-- myproject/
 |    |-- accounts/     <-- our new django app!
 |    |-- boards/
 |    |-- myproject/
 |    |-- static/
 |    |-- templates/
 |    |-- db.sqlite3
 |    +-- manage.py
 +-- venv/
```
下一步，在**settings.py**中的`INSTALLED_APPS`中包含**accounts**
```
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'widget_tweaks',

    'accounts',
    'boards',
]
```
从现在开始，我们将对 accounts 应用 进行开发。
***
### 注册
![](https://upload-images.jianshu.io/upload_images/5889935-2c2d102f4bf16667.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

让我们从创建一个注册视图着手。首先在**urls.py**中创建一个新的路由。
```
from django.conf.urls import url
from django.contrib import admin

from accounts import views as accounts_views
from boards import views

urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^signup/$', accounts_views.signup, name='signup'),
    url(r'^boards/(?P<pk>\d+)/$', views.board_topics, name='board_topics'),
    url(r'^boards/(?P<pk>\d+)/new/$', views.new_topic, name='new_topic'),
    url(r'^admin/', admin.site.urls),
]
```
注意我们使用另一种方式如何从**accounts**中引入**views**模块
```
from accounts import views as accounts_views
```
我们使用了别名，因为否则的话，他将会与**boards'**的视图产生冲突。我们可以改良**url.py** 的设计。但是现在，让我们关注一下身份验证的特征。

现在编辑在**accounts**应用中的**views.py**文件，并且创建一个新的名为**signup**的视图。

```
from django.shortcuts import render

def signup(request):
    return render(request, 'signup.html')
``` 
创建一个新视图，名为**signup.html**：

**templates/signup.html**
```
{% extends 'base.html' %}

{% block content %}
  <h2>Sign up</h2>
{% endblock %}
```
在浏览器中打开链接：http://127.0.0.1:8000/signup/ ，检查它是否已经生效。

是时候写一些单元测试了：

**accounts/tests.py**
```
from django.core.urlresolvers import reverse
from django.urls import resolve
from django.test import TestCase
from .views import signup

class SignUpTests(TestCase):
    def test_signup_status_code(self):
        url = reverse('signup')
        response = self.client.get(url)
        self.assertEquals(response.status_code, 200)

    def test_signup_url_resolves_signup_view(self):
        view = resolve('/signup/')
        self.assertEquals(view.func, signup)
```
如果这个链接**/signup/** 返回了正确的视图，那么代表状态码200测试成功。

```
python manage.py test
```
```
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
..................
----------------------------------------------------------------------
Ran 18 tests in 0.652s

OK
Destroying test database for alias 'default'...
```

对于身份验证的视图（注册，登录，重置密码，等等）我们不需要使用顶部栏和面包屑。我们可以继续使用**base.html**模板，只是它需要一些调整。

**templates/base.html**
```
{% load static %}<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>{% block title %}Django Boards{% endblock %}</title>
    <link href="https://fonts.googleapis.com/css?family=Peralta" rel="stylesheet">
    <link rel="stylesheet" href="{% static 'css/bootstrap.min.css' %}">
    <link rel="stylesheet" href="{% static 'css/app.css' %}">
    {% block stylesheet %}{% endblock %}  <!-- HERE -->
  </head>
  <body>
    {% block body %}  <!-- HERE -->
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
    {% endblock body %}  <!-- AND HERE -->
  </body>
</html>
{% endraw %}
```

我在**base.html**模板中标记了新的注释。代码块`{% block stylesheet %}{% endblock %}`将被用来引入额外的CSS文件，这对于页面来说，更清晰明确。

代码块`{% block body %}`用来包含整个HTML文件，我们可以用它来使一个空白的文档借用**base.html**的头部。注意一下我们是如何命名代码块尾部`{% endblock body %}`。
像在本案例中这样命名是一种合理命名结束标签的方式，所以这使人们更容易找到代码块到哪结束。

现在，在**signup.html**模板中，我们可以使用`{% block body %}`来代替`{% block content %}`。

**templates/signup.html**
```
{% extends 'base.html' %}

{% block body %}
  <h2>Sign up</h2>
{% endblock %}
```
![](https://upload-images.jianshu.io/upload_images/5889935-a1dda188d970a1b4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/5889935-dbf30eed12c1f866.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

是时候创建注册表单了。Django有一种名为**UserCreationForm**的内置表单。让我们来使用它：

**accounts/views.py**
```
from django.contrib.auth.forms import UserCreationForm
from django.shortcuts import render

def signup(request):
    form = UserCreationForm()
    return render(request, 'signup.html', {'form': form})
```

**templates/signup.html**
```
{% extends 'base.html' %}

{% block body %}
  <div class="container">
    <h2>Sign up</h2>
    <form method="post" novalidate>
      {% csrf_token %}
      {{ form.as_p }}
      <button type="submit" class="btn btn-primary">Create an account</button>
    </form>
  </div>
{% endblock %}
```
![](https://upload-images.jianshu.io/upload_images/5889935-3169923c88d4ccdf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

看上去有点混乱，对吗？我们可以使用我们的**form.html**模板来使他看上去更整洁。

**templates/signup.html**
```
{% extends 'base.html' %}

{% block body %}
  <div class="container">
    <h2>Sign up</h2>
    <form method="post" novalidate>
      {% csrf_token %}
      {% include 'includes/form.html' %}
      <button type="submit" class="btn btn-primary">Create an account</button>
    </form>
  </div>
{% endblock %}
```
![](https://upload-images.jianshu.io/upload_images/5889935-6cea37e832352627.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

啊，差不多了。目前，我们的局部模板**form.html** 显示了一些原生的HTML。这是一种安全的特征。由于默认的Django认为所有的字符串都是不安全的，避免任何可能引起错误的字符。但是在这个案例中，我们可以信任它！

**templates/includes/form.html**
```
% load widget_tweaks %}

{% for field in form %}
  <div class="form-group">
    {{ field.label_tag }}

    <!-- code suppressed for brevity -->

    {% if field.help_text %}
      <small class="form-text text-muted">
        {{ field.help_text|safe }}  <!-- new code here -->
      </small>
    {% endif %}
  </div>
{% endfor %}
```
基本上，我们在之前的模板上的`field.help_text`增加一个选项`safe`:
`{{ field.help_text|safe }}`.

保存**form.html**文件，然后再次检查注册页面：
![](https://upload-images.jianshu.io/upload_images/5889935-43a170ed4ad50340.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

现在，让我们实现注册视图上的业务逻辑：

**accounts/views.py**
```
from django.contrib.auth import login as auth_login
from django.contrib.auth.forms import UserCreationForm
from django.shortcuts import render, redirect

def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            auth_login(request, user)
            return redirect('home')
    else:
        form = UserCreationForm()
    return render(request, 'signup.html', {'form': form})
```
这个基本的表单处理有一个小细节：**login**方法（重命名为**auth_login** 来避免与内置login视图发生冲突）

```
笔记：我重命名这个 login 方法为 auth_login， 但是之后我意识到Django1.11为login 视图提供了一个基于类的视图，LoginView，所以是没有出现命名冲突的风险的。

在更老的版本中，有 auth.login 和 auth.views.login，这会引起一些混乱，因为一个是用户登录的方法，一个是视图。

长话短说：你可以使用 login 作为方法名，这不会引起任何问题。

```
如果这个表单是有效的，将会通过`user=form.save()`来创建一个用户实例。这个被创建的用户然后作为一个参数被传进**auth_login**方法，手动地（？）进行身份验证。之后，视图将会重定向到首页。

让我们试一试。首先，尝试提交一些无效的数据。空表单，未匹配的字段或者已存在用户名：
![](https://upload-images.jianshu.io/upload_images/5889935-049b9cc32f2c809a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

现在，填写表单然后提交，检查用户是否被创建并且重定向到首页：
![](https://upload-images.jianshu.io/upload_images/5889935-e491cd1805e844f2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


#### 在模板中引用被验证的用户
我们怎么知道它已经生效了呢？我们可以编辑**base.html**模板来将用户名添加到顶部栏：

**templates/base.html**
```
{% block body %}
  <nav class="navbar navbar-expand-sm navbar-dark bg-dark">
    <div class="container">
      <a class="navbar-brand" href="{% url 'home' %}">Django Boards</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#mainMenu" aria-controls="mainMenu" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="mainMenu">
        <ul class="navbar-nav ml-auto">
          <li class="nav-item">
            <a class="nav-link" href="#">{{ user.username }}</a>
          </li>
        </ul>
      </div>
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
{% endblock body %}
```
![](https://upload-images.jianshu.io/upload_images/5889935-583e96f734620955.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 测试注册视图
让我们来改善一下单元测试：

**accounts/tests.py**

```
from django.contrib.auth.forms import UserCreationForm
from django.core.urlresolvers import reverse
from django.urls import resolve
from django.test import TestCase
from .views import signup

class SignUpTests(TestCase):
    def setUp(self):
        url = reverse('signup')
        self.response = self.client.get(url)

    def test_signup_status_code(self):
        self.assertEquals(self.response.status_code, 200)

    def test_signup_url_resolves_signup_view(self):
        view = resolve('/signup/')
        self.assertEquals(view.func, signup)

    def test_csrf(self):
        self.assertContains(self.response, 'csrfmiddlewaretoken')

    def test_contains_form(self):
        form = self.response.context.get('form')
        self.assertIsInstance(form, UserCreationForm)
```
我们略微修改了**SignUpTests**这个类。定义了**setUp**这个方法，将response实体移植到这儿。然后，我们也可以测试response中是否含有表单和CSRF token。

现在，我们将测试一个成功的注册。让我们新建一个类来更好地组织代码：

**accounts/test.py**
```
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.core.urlresolvers import reverse
from django.urls import resolve
from django.test import TestCase
from .views import signup

class SignUpTests(TestCase):
    # code suppressed...

class SuccessfulSignUpTests(TestCase):
    def setUp(self):
        url = reverse('signup')
        data = {
            'username': 'john',
            'password1': 'abcdef123456',
            'password2': 'abcdef123456'
        }
        self.response = self.client.post(url, data)
        self.home_url = reverse('home')

    def test_redirection(self):
        '''
        A valid form submission should redirect the user to the home page
        '''
        self.assertRedirects(self.response, self.home_url)

    def test_user_creation(self):
        self.assertTrue(User.objects.exists())

    def test_user_authentication(self):
        '''
        Create a new request to an arbitrary page.
        The resulting response should now have a `user` to its context,
        after a successful sign up.
        '''
        response = self.client.get(self.home_url)
        user = response.context.get('user')
        self.assertTrue(user.is_authenticated)
```
运行这个测试。

使用相似地方法，现在让我们创建一个当注册数据无效时的测试：
```
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.core.urlresolvers import reverse
from django.urls import resolve
from django.test import TestCase
from .views import signup

class SignUpTests(TestCase):
    # code suppressed...

class SuccessfulSignUpTests(TestCase):
    # code suppressed...

class InvalidSignUpTests(TestCase):
    def setUp(self):
        url = reverse('signup')
        self.response = self.client.post(url, {})  # submit an empty dictionary

    def test_signup_status_code(self):
        '''
        An invalid form submission should return to the same page
        '''
        self.assertEquals(self.response.status_code, 200)

    def test_form_errors(self):
        form = self.response.context.get('form')
        self.assertTrue(form.errors)

    def test_dont_create_user(self):
        self.assertFalse(User.objects.exists())
```
#### 在表单中增加邮箱字段

一切都生效了，但是...没有**Email address**字段。呃，**UserCreationForm** 没有提供一个**email** 字段，但是我们可以继承他。

在**accounts**文件夹里创建一个**forms.py**的文件：

**accounts/forms.py**
```
from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class SignUpForm(UserCreationForm):
    email = forms.CharField(max_length=254, required=True, widget=forms.EmailInput())
    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')
```
现在，在**views.py**中，让我们引入一个新的表单，**SignUpForm**，并用它来代替**UserCreationForm**：

**accounts/views.py**
```
from django.contrib.auth import login as auth_login
from django.shortcuts import render, redirect

from .forms import SignUpForm

def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            auth_login(request, user)
            return redirect('home')
    else:
        form = SignUpForm()
    return render(request, 'signup.html', {'form': form})
```
只是做出了一点小小改变，一切都已生效：
![](https://upload-images.jianshu.io/upload_images/5889935-7b36cf496dc27a2b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

别忘了将测试单元中的**UserCreationForm**修改为**SignUpForm**：
```
from .forms import SignUpForm

class SignUpTests(TestCase):
    # ...

    def test_contains_form(self):
        form = self.response.context.get('form')
        self.assertIsInstance(form, SignUpForm)

class SuccessfulSignUpTests(TestCase):
    def setUp(self):
        url = reverse('signup')
        data = {
            'username': 'john',
            'email': 'john@doe.com',
            'password1': 'abcdef123456',
            'password2': 'abcdef123456'
        }
        self.response = self.client.post(url, data)
        self.home_url = reverse('home')

    # ...
```
之前的测试单元依然能够通过，因为**SignUpForm**继承了**UserCreationForm**，这是一个**UserCreationForm**的实例。

现在让我们想一会发生了什么。我们增加一个新的表单域：
```
fields = ('username', 'email', 'password1', 'password2')
```
它将自动反射到HTML模板。这很棒，对吧？是的，很可靠。如果将来一名新的开发者想要复用**SignUpForm**用于其他用途，或者想增加一些额外字段。那么这些新的字段也将会显示在**signup.html**中。这些改变是不容易被察觉的，我们不希望发生意外情况。

让我们新建一个测试，它将验证模板中来自HTML的输入：

***accounts/test.py*
```
class SignUpTests(TestCase):
    # ...

    def test_form_inputs(self):
        '''
        The view must contain five inputs: csrf, username, email,
        password1, password2
        '''
        self.assertContains(self.response, '<input', 5)
        self.assertContains(self.response, 'type="text"', 1)
        self.assertContains(self.response, 'type="email"', 1)
        self.assertContains(self.response, 'type="password"', 2)
```
#### 改善单元测试的布局
好吧，我们正在测试输入，不过我们也必须去测试表单本身。让我们稍稍改善一下项目的设计，不再只将单元测试添加到**accounts/tests.py**。

创建一个带有**accounts**子文件夹的名为**tests**的文件夹。然后，在**test**文件夹中，创建一个名为**__init__.py**的空文件。

现在，移动**tests.py**文件到这个**test**文件夹，然后将他重命名为**test_view_signup.py**。

最终结果如下所示：
```
myproject/
 |-- myproject/
 |    |-- accounts/
 |    |    |-- migrations/
 |    |    |-- tests/
 |    |    |    |-- __init__.py
 |    |    |    +-- test_view_signup.py
 |    |    |-- __init__.py
 |    |    |-- admin.py
 |    |    |-- apps.py
 |    |    |-- models.py
 |    |    +-- views.py
 |    |-- boards/
 |    |-- myproject/
 |    |-- static/
 |    |-- templates/
 |    |-- db.sqlite3
 |    +-- manage.py
 +-- venv/
```
记住，由于我们相对地引入了应用的上下文，我们需要修改引入路径：

**accounts/tests/test_view_signup.py**
```
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.urls import resolve
from django.test import TestCase

from ..views import signup
from ..forms import SignUpForm
```
我们在应用模块中使用相对地引入，所以我们稍后能自由地重命名Django应用，不需要修改所有的绝对引入。

现在让我们创建一个新的测试文件去测试**SignUpForm**。增加一个名为**test_form_signup.py**的测试文件：

**accounts/tests/test_form_signup.py**

```
from django.test import TestCase
from ..forms import SignUpForm

class SignUpFormTest(TestCase):
    def test_form_has_fields(self):
        form = SignUpForm()
        expected = ['username', 'email', 'password1', 'password2',]
        actual = list(form.fields)
        self.assertSequenceEqual(expected, actual)
```
这看上去是非常严谨的，对吗？举个例子，如果在将来我们需要包含用户的姓和用户的名（注：两个字段）不得不修改 **SignUpForm**,我们不再需要修改一些测试单元。

![](https://upload-images.jianshu.io/upload_images/5889935-b2e348feadecd525.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这些提示是很有用的，因为他们给开发者带来意识，尤其是对于首次接触代码的小白。这将有助于他们培养编码的信心。

#### 改善注册模板

让我们一起做起来吧。我们可以使用Bootstrap 4 卡片组件来使页面更美观。

访问[https://www.toptal.com/designers/subtlepatterns/](https://www.toptal.com/designers/subtlepatterns/)
寻找一个美观的背景模型来作为账号页面。下载它，在**static**文件夹中创建名为**img**的文件夹，然后将图片保存在这儿。

之后，新建一个名为**accounts.css**的CSS文件。结果如下：
```
myproject/
 |-- myproject/
 |    |-- accounts/
 |    |-- boards/
 |    |-- myproject/
 |    |-- static/
 |    |    |-- css/
 |    |    |    |-- accounts.css  <-- here
 |    |    |    |-- app.css
 |    |    |    +-- bootstrap.min.css
 |    |    +-- img/
 |    |    |    +-- shattered.png  <-- here (the name may be different, depending on the patter you downloaded)
 |    |-- templates/
 |    |-- db.sqlite3
 |    +-- manage.py
 +-- venv/
```
现在来编辑这个**accounts.css**文件

**static/css/accounts.css**
```
body {
  background-image: url(../img/shattered.png);
}

.logo {
  font-family: 'Peralta', cursive;
}

.logo a {
  color: rgba(0,0,0,.9);
}

.logo a:hover,
.logo a:active {
  text-decoration: none;
}
```
在**signup.html**模板中，我们可以使用新的CSS和Bootstrap 4卡片组件。

**templates/signup.html**
```
{% extends 'base.html' %}

{% load static %}

{% block stylesheet %}
  <link rel="stylesheet" href="{% static 'css/accounts.css' %}">
{% endblock %}

{% block body %}
  <div class="container">
    <h1 class="text-center logo my-4">
      <a href="{% url 'home' %}">Django Boards</a>
    </h1>
    <div class="row justify-content-center">
      <div class="col-lg-8 col-md-10 col-sm-12">
        <div class="card">
          <div class="card-body">
            <h3 class="card-title">Sign up</h3>
            <form method="post" novalidate>
              {% csrf_token %}
              {% include 'includes/form.html' %}
              <button type="submit" class="btn btn-primary btn-block">Create an account</button>
            </form>
          </div>
          <div class="card-footer text-muted text-center">
            Already have an account? <a href="#">Log in</a>
          </div>
        </div>
      </div>
    </div>
  </div>
{% endblock %}
```
有了这些，我们的注册页面现在变成了这样：
![](https://upload-images.jianshu.io/upload_images/5889935-16f31d407799cea3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
****
### 登出
为了形成一个完整的流程，我们加入一个登出的视图。首先，在**urls.py**中加入一个新的路由：
**myproject/urls.py**
```
from django.conf.urls import url
from django.contrib import admin
from django.contrib.auth import views as auth_views

from accounts import views as accounts_views
from boards import views

urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^signup/$', accounts_views.signup, name='signup'),
    url(r'^logout/$', auth_views.LogoutView.as_view(), name='logout'),
    url(r'^boards/(?P<pk>\d+)/$', views.board_topics, name='board_topics'),
    url(r'^boards/(?P<pk>\d+)/new/$', views.new_topic, name='new_topic'),
    url(r'^admin/', admin.site.urls),
]
```
我们从Django的contrib 模块中引入**views**。我们将他重命名为：**auth_views**来避免与**boards.views**发生冲突。注意这个视图会有些许不同：`LogoutView.as_view()`。这是一个Django基类视图，至今我们只把类实现为Python方法。这些基类视图提供了更多的灵活的方式去继承和复用视图。之后关于这点，我们将会讨论更多。

打开**settings.py**，在文件底部添加`LOGOUT_REDIRECT_URL`变量：

**myproject/settings.py**
```
LOGOUT_REDIRECT_URL = 'home'
```
在这里，我们将URL的值设置为想让用户登出后重定向到的页面。

完成这步，一切就绪。访问**127.0.0.1:8000/logout/ **，你将会登出。不过稍等一下，在你登出之前，让我们为登陆用户创建一个下拉菜单。

***
### 为通过身份验证的用户显示菜单

现在，我们需要在**base.html**中做一些调整。我们需要加入一个带有登出链接的下拉菜单。

Bootstrap 4 下拉组件需要JQuery的支持。

首先，访问 [jquery.com/download/](https://jquery.com/download/)压缩的发行版本JQuery3.2.1

![](https://upload-images.jianshu.io/upload_images/5889935-21cf19de29d69270.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
在**static**文件夹中，创建一个**js**文件夹，并将**jquery-3.2.1.min.js**复制粘贴进去。

Bootstrap4 还需要一个叫做**Popper**的库支持。访问 [popper.js.org](https://popper.js.org/)
下载最新版本。

在**popper.js-1.12.5 **文件夹中，去**dist/umd**目录下寻找并且复制**popper.min.js**到**js**文件夹。注意，Bootstrap4只需要和**umd/popper.min.js**配合生效，所以确保你复制了正确的文件。

如果你没有Bootstrap4的完整文件，访问 [getbootstrap.com](http://getbootstrap.com/)
重新下载。

同样的，复制**bootstrap.min.js**文件到**js**文件夹。

最后结果如下：
```
myproject/
 |-- myproject/
 |    |-- accounts/
 |    |-- boards/
 |    |-- myproject/
 |    |-- static/
 |    |    |-- css/
 |    |    +-- js/
 |    |         |-- bootstrap.min.js
 |    |         |-- jquery-3.2.1.min.js
 |    |         +-- popper.min.js
 |    |-- templates/
 |    |-- db.sqlite3
 |    +-- manage.py
 +-- venv/
```
在**base.html**文件底部，在`{% endblock body %}`后加入脚本：

**templates/base.html**
```
{% load static %}<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>{% block title %}Django Boards{% endblock %}</title>
    <link href="https://fonts.googleapis.com/css?family=Peralta" rel="stylesheet">
    <link rel="stylesheet" href="{% static 'css/bootstrap.min.css' %}">
    <link rel="stylesheet" href="{% static 'css/app.css' %}">
    {% block stylesheet %}{% endblock %}
  </head>
  <body>
    {% block body %}
    <!-- code suppressed for brevity -->
    {% endblock body %}
    <script src="{% static 'js/jquery-3.2.1.min.js' %}"></script>
    <script src="{% static 'js/popper.min.js' %}"></script>
    <script src="{% static 'js/bootstrap.min.js' %}"></script>
  </body>
</html>
{% endraw %}
```

如果你觉得说明混乱，只要通过以下链接下载文件：
*   [https://code.jquery.com/jquery-3.2.1.min.js](https://code.jquery.com/jquery-3.2.1.min.js)
*   [https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.11.0/umd/popper.min.js](https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.11.0/umd/popper.min.js)
*   [https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/js/bootstrap.min.js](https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/js/bootstrap.min.js)

右击将链接另存为...

现在，我们能够添加Bootstrap4的下拉菜单：

**templates/base.html**
```
<nav class="navbar navbar-expand-sm navbar-dark bg-dark">
  <div class="container">
    <a class="navbar-brand" href="{% url 'home' %}">Django Boards</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#mainMenu" aria-controls="mainMenu" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="mainMenu">
      <ul class="navbar-nav ml-auto">
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="userMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            {{ user.username }}
          </a>
          <div class="dropdown-menu dropdown-menu-right" aria-labelledby="userMenu">
            <a class="dropdown-item" href="#">My account</a>
            <a class="dropdown-item" href="#">Change password</a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" href="{% url 'logout' %}">Log out</a>
          </div>
        </li>
      </ul>
    </div>
  </div>
</nav>
```
![](https://upload-images.jianshu.io/upload_images/5889935-58f948153559a1db.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

让我们试一试，点击登出：
![](https://upload-images.jianshu.io/upload_images/5889935-a35947684d089945.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

它生效了。但是下拉菜单只是显示缺不管用户是否已经登出，不同的是，现在用户名是空的，我们只能看到一个小箭头。

我们需要稍稍改善一下：
```
<nav class="navbar navbar-expand-sm navbar-dark bg-dark">
  <div class="container">
    <a class="navbar-brand" href="{% url 'home' %}">Django Boards</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#mainMenu" aria-controls="mainMenu" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="mainMenu">
      {% if user.is_authenticated %}
        <ul class="navbar-nav ml-auto">
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="userMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              {{ user.username }}
            </a>
            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="userMenu">
              <a class="dropdown-item" href="#">My account</a>
              <a class="dropdown-item" href="#">Change password</a>
              <div class="dropdown-divider"></div>
              <a class="dropdown-item" href="{% url 'logout' %}">Log out</a>
            </div>
          </li>
        </ul>
      {% else %}
        <form class="form-inline ml-auto">
          <a href="#" class="btn btn-outline-secondary">Log in</a>
          <a href="{% url 'signup' %}" class="btn btn-primary ml-2">Sign up</a>
        </form>
      {% endif %}
    </div>
  </div>
</nav>
```
现在，我们告知Django，当用户已登录时显示下拉菜单，如果未登录，下是登录和注册按钮：
![](https://upload-images.jianshu.io/upload_images/5889935-5df6a3e43e4a2300.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
***
### 登录
首先，增加一个新的URL路由：
**myproject/urls.py**
```
from django.conf.urls import url
from django.contrib import admin
from django.contrib.auth import views as auth_views

from accounts import views as accounts_views
from boards import views

urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^signup/$', accounts_views.signup, name='signup'),
    url(r'^login/$', auth_views.LoginView.as_view(template_name='login.html'), name='login'),
    url(r'^logout/$', auth_views.LogoutView.as_view(), name='logout'),
    url(r'^boards/(?P<pk>\d+)/$', views.board_topics, name='board_topics'),
    url(r'^boards/(?P<pk>\d+)/new/$', views.new_topic, name='new_topic'),
    url(r'^admin/', admin.site.urls),
]
```
在`as_view()`中，我们可以传递一些额外参数，这样可以重写默认方法。在这个案例中，我们将控制**LoginView**在**login.html**中去寻找模板。

编辑**settings.py** 然后添加如下配置：

**myproject/settings.py**
```
LOGIN_REDIRECT_URL = 'home'
```
这个配置告诉Django在用户登陆成功后的重定向位置。

最后，在**base.html**模板中添加登录URL：

**templates/base.html**
```
<a href="{% url 'login' %}" class="btn btn-outline-secondary">Log in</a>
```
我们可以创建一个类似于注册页面的模板。新建一个名为**login.html**的文件：

**templates/login.html**
```
{% extends 'base.html' %}

{% load static %}

{% block stylesheet %}
  <link rel="stylesheet" href="{% static 'css/accounts.css' %}">
{% endblock %}

{% block body %}
  <div class="container">
    <h1 class="text-center logo my-4">
      <a href="{% url 'home' %}">Django Boards</a>
    </h1>
    <div class="row justify-content-center">
      <div class="col-lg-4 col-md-6 col-sm-8">
        <div class="card">
          <div class="card-body">
            <h3 class="card-title">Log in</h3>
            <form method="post" novalidate>
              {% csrf_token %}
              {% include 'includes/form.html' %}
              <button type="submit" class="btn btn-primary btn-block">Log in</button>
            </form>
          </div>
          <div class="card-footer text-muted text-center">
            New to Django Boards? <a href="{% url 'signup' %}">Sign up</a>
          </div>
        </div>
        <div class="text-center py-2">
          <small>
            <a href="#" class="text-muted">Forgot your password?</a>
          </small>
        </div>
      </div>
    </div>
  </div>
{% endblock %}
```
![](https://upload-images.jianshu.io/upload_images/5889935-89248be1d7056cfc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

HTML模板中有写代码重复了，让我们来重构他。

新建一个名为：** base_accounts.html**的模板：
```
{% extends 'base.html' %}

{% load static %}

{% block stylesheet %}
  <link rel="stylesheet" href="{% static 'css/accounts.css' %}">
{% endblock %}

{% block body %}
  <div class="container">
    <h1 class="text-center logo my-4">
      <a href="{% url 'home' %}">Django Boards</a>
    </h1>
    {% block content %}
    {% endblock %}
  </div>
{% endblock %}
```

现在把他添加到**signup.html**和**login.html**

**templates/login.html**
```
{% extends 'base_accounts.html' %}

{% block title %}Log in to Django Boards{% endblock %}

{% block content %}
  <div class="row justify-content-center">
    <div class="col-lg-4 col-md-6 col-sm-8">
      <div class="card">
        <div class="card-body">
          <h3 class="card-title">Log in</h3>
          <form method="post" novalidate>
            {% csrf_token %}
            {% include 'includes/form.html' %}
            <button type="submit" class="btn btn-primary btn-block">Log in</button>
          </form>
        </div>
        <div class="card-footer text-muted text-center">
          New to Django Boards? <a href="{% url 'signup' %}">Sign up</a>
        </div>
      </div>
      <div class="text-center py-2">
        <small>
          <a href="#" class="text-muted">Forgot your password?</a>
        </small>
      </div>
    </div>
  </div>
{% endblock %}
```

我们还没有密码重置URL，所以我们现在先用**#**搁置它。

**templates/signup.html**
```
{% extends 'base_accounts.html' %}

{% block title %}Sign up to Django Boards{% endblock %}

{% block content %}
  <div class="row justify-content-center">
    <div class="col-lg-8 col-md-10 col-sm-12">
      <div class="card">
        <div class="card-body">
          <h3 class="card-title">Sign up</h3>
          <form method="post" novalidate>
            {% csrf_token %}
            {% include 'includes/form.html' %}
            <button type="submit" class="btn btn-primary btn-block">Create an account</button>
          </form>
        </div>
        <div class="card-footer text-muted text-center">
          Already have an account? <a href="{% url 'login' %}">Log in</a>
        </div>
      </div>
    </div>
  </div>
{% endblock %}
```

请注意我们添加了登录URL：`<a href="{% url 'login' %}">Log in</a>`

#### 登录空字段错误

如果我们提交一张空的登录表单，我们会得到一些很优雅的报错信息：
![](https://upload-images.jianshu.io/upload_images/5889935-0af056c4fd234749.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

但如果我们提交一个不存在的用户名或者一个非法密码时，将会发生这种情况：
![](https://upload-images.jianshu.io/upload_images/5889935-d59060d47cc33cd8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这有点误导人。字段域显示绿色，仿佛在提示他们是没有问题的。而且也没有任何其他说明信息。

这是因为表单有一种叫**空字段错误**的特殊错误，它包含了所有和特定字段不相关的错误。让我们来重构**form.html**的局部来显示错误信息：

**templates/includes/form.html**
```
{% load widget_tweaks %}

{% if form.non_field_errors %}
  <div class="alert alert-danger" role="alert">
    {% for error in form.non_field_errors %}
      <p{% if forloop.last %} class="mb-0"{% endif %}>{{ error }}</p>
    {% endfor %}
  </div>
{% endif %}

{% for field in form %}
  <!-- code suppressed -->
{% endfor %}
```
`{% if forloop.last %}`是次要的。`p`标签有`margin-bottom`样式。一张表单可能含有多个**空字段**错误，对于每个错误，我们都要呈现一个带有错误信息的`p`标签。然后我将测试呈现这是否一个持续性的错误。如果是的话，我们引入Bootstrap4的样式类`mb-0`，这个类用于替代`margin bottom = 0`。有了更多的额外空间，这时警告信息看上去没那么奇怪了。还有一个很次要的细节，保持他们的间距一致。

![](https://upload-images.jianshu.io/upload_images/5889935-9dab0a2ca79cf86e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

尽管我们还需要处理密码字段。但事实是，Django永远不会将密码字段返回给用户。所以我们只需忽略`is-valid`和`is-invalid`样式，而不用去做额外的加工了。此时我们表单模板看上去很复杂，我们可以移植一些代码到**template tag**

#### 创建自定义Template Tags（模板标签）
在**boards**应用中，新建一个名为**templatetags**的文件夹。在这个文件夹里，新建名为** __init__.py**和**form_tags.py**的空文件。

目录结构如下所示：
```
myproject/
 |-- myproject/
 |    |-- accounts/
 |    |-- boards/
 |    |    |-- migrations/
 |    |    |-- templatetags/        <-- here
 |    |    |    |-- __init__.py
 |    |    |    +-- form_tags.py
 |    |    |-- __init__.py
 |    |    |-- admin.py
 |    |    |-- apps.py
 |    |    |-- models.py
 |    |    |-- tests.py
 |    |    +-- views.py
 |    |-- myproject/
 |    |-- static/
 |    |-- templates/
 |    |-- db.sqlite3
 |    +-- manage.py
 +-- venv/
```
在**form_tags.py**文件中，让我们新建两个模板标签：

**boards/templatetags/form_tags.py**
```
from django import template

register = template.Library()

@register.filter
def field_type(bound_field):
    return bound_field.field.widget.__class__.__name__

@register.filter
def input_class(bound_field):
    css_class = ''
    if bound_field.form.is_bound:
        if bound_field.errors:
            css_class = 'is-invalid'
        elif field_type(bound_field) != 'PasswordInput':
            css_class = 'is-valid'
    return 'form-control {}'.format(css_class)
```
这些是模板过滤器，工作原理如下：

首先，当我们使用了**widget_tweaks**或**static **模板标签时，他们会在模板中被加载。注意在创建了这些文件后，你需要手动重启服务器，这样Django才能识别到新的模板标签。

```
{% load form_tags %}
```
在这之后，我们可以在模板中使用它们：
```
{{ form.username|field_type }}
```
这将会返回：
```
'TextInput'
```
或者在使用了**input_class**的情况下：
```
{{ form.username|input_class }}

<!-- if the form is not bound, it will simply return: -->
'form-control '

<!-- if the form is bound and valid: -->
'form-control is-valid'

<!-- if the form is bound and invalid: -->
'form-control is-invalid'
```

现在让我们用新的模板标签来更新**form.html**：
**templates/includes/form.html**
```
{% load form_tags widget_tweaks %}

{% if form.non_field_errors %}
  <div class="alert alert-danger" role="alert">
    {% for error in form.non_field_errors %}
      <p{% if forloop.last %} class="mb-0"{% endif %}>{{ error }}</p>
    {% endfor %}
  </div>
{% endif %}

{% for field in form %}
  <div class="form-group">
    {{ field.label_tag }}
    {% render_field field class=field|input_class %}
    {% for error in field.errors %}
      <div class="invalid-feedback">
        {{ error }}
      </div>
    {% endfor %}
    {% if field.help_text %}
      <small class="form-text text-muted">
        {{ field.help_text|safe }}
      </small>
    {% endif %}
  </div>
{% endfor %}
```
好多了不是吗？减小了模板的复杂度，看上去更整洁了。这同时也解决了密码框显示绿色的问题：
![image.png](https://upload-images.jianshu.io/upload_images/5889935-3d0cae1ea8ab37ab.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 测试模板标签
首先，我们来稍稍组织一下**boards'**的单元测试。类似于我们在**accounts**应用中所做的一样，新建名为**tests**的文件夹，然后增加一个** __init__.py**文件，复制**tests.py**并将他重命名为** test_views.py**。

新建一个名为**test_templatetags.py**的空文件：
```
myproject/
 |-- myproject/
 |    |-- accounts/
 |    |-- boards/
 |    |    |-- migrations/
 |    |    |-- templatetags/
 |    |    |-- tests/
 |    |    |    |-- __init__.py
 |    |    |    |-- test_templatetags.py  <-- new file, empty for now
 |    |    |    +-- test_views.py  <-- our old file with all the tests
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
```
修改**test_views.py**的引入路径：

**boards/tests/test_views.py**
```
from ..views import home, board_topics, new_topic
from ..models import Board, Topic, Post
from ..forms import NewTopicForm
```
执行测试文件来确保一切都生效了。

**boards/tests/test_templatetags.py**
```
from django import forms
from django.test import TestCase
from ..templatetags.form_tags import field_type, input_class

class ExampleForm(forms.Form):
    name = forms.CharField()
    password = forms.CharField(widget=forms.PasswordInput())
    class Meta:
        fields = ('name', 'password')

class FieldTypeTests(TestCase):
    def test_field_widget_type(self):
        form = ExampleForm()
        self.assertEquals('TextInput', field_type(form['name']))
        self.assertEquals('PasswordInput', field_type(form['password']))

class InputClassTests(TestCase):
    def test_unbound_field_initial_state(self):
        form = ExampleForm()  # unbound form
        self.assertEquals('form-control ', input_class(form['name']))

    def test_valid_bound_field(self):
        form = ExampleForm({'name': 'john', 'password': '123'})  # bound form (field + data)
        self.assertEquals('form-control is-valid', input_class(form['name']))
        self.assertEquals('form-control ', input_class(form['password']))

    def test_invalid_bound_field(self):
        form = ExampleForm({'name': '', 'password': '123'})  # bound form (field + data)
        self.assertEquals('form-control is-invalid', input_class(form['name']))
```
我们创建了一个表单测试类，并在两个模板标签中添加针对可能出现的错误的测试方法。

```
python manage.py test
```
```
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
................................
----------------------------------------------------------------------
Ran 32 tests in 0.846s

OK
Destroying test database for alias 'default'...
```
***
### 密码重置
