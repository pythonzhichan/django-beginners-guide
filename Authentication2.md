# Django入门与实践-第15章：用户登录

首先，添加一个新的URL路径：

**myproject/urls.py**

```python
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

在`as_view()`中，我们可以传递一些额外的参数，以覆盖默认值。在这种情况下，我们让**LoginView** 使用**login.html**模板。

编辑**settings.py**然后添加

**myproject/settings.py**

```
LOGIN_REDIRECT_URL = 'home'

```

这个配置信息告诉Django在成功登录后将用户重定向到哪里。

最后，将登录URL添加到 **base.html**模板中：

**templates/base.html**

```
<a href="{% url 'login' %}" class="btn btn-outline-secondary">Log in</a>

```

我们可以创建一个类似于注册页面的模板。创建一个名为 **login.html** 的新文件：

**templates/login.html**

```html
{% raw %}
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

![Login](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-4/login.jpg)

我们看到HTML模板中的内容重复了，现在来重构一下它。

创建一个名为**base_accounts.html**的新模板：

**templates/base_accounts.html**

```html
{% raw %}
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

现在在**signup.html**和**login.html**中使用它：

**templates/login.html**

```html
{% raw %}
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

我们有密码重置的功能，因此现在让我们将其暂时保留为`#`。

**templates/signup.html**

```html
{% raw %}
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

请注意，我们添加了登录链接： `<a href="{% url 'login' %}">Log in</a>`.

##### 无登录信息错误

如果我们提交空白的登录信息，我们会得到一些友好的错误提示信息：

![Login](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-4/login-1.jpg)

但是，如果我们提交一个不存在的用户名或一个无效的密码，现在就会发生这种情况：

![Login](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-4/login-2.jpg)

有点误导，这个区域是绿色的，表明它们是良好运行的，此外，没有其他额外的信息。

这是因为表单有一种特殊类型的错误，叫做 **non-field errors**。这是一组与特定字段无关的错误。让我们重构**form.html**部分模板以显示这些错误：

**templates/includes/form.html**

```html
{% raw %}
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

`{% if forloop.last %}`只是一个小事情，因为`p`标签有一个空白的`margin-bottom`.一个表单可能有几个**non-field error**，我们呈现了一个带有错误的`p`标签。然后我要检查它是否是最后一次渲染的错误。如果是这样的，我们就添加一个 Bootstrap 4 CSS类 `mb-0` ，它的作用是代表了“margin bottom = 0”（底部边缘为0）。这样的话警告看起来就不那么奇怪了并且多了一些额外的空间。这只是一个非常小的细节。我这么做的原因只是为了保持间距的一致性。

![Login](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-4/login-3.jpg)

尽管如此，我们仍然需要处理密码字段。问题在于，Django从不将密码字段的数据返回给客户端。因此，在某些情况下，不要试图做一次自作聪明的事情，我们可以直接忽略`is-valid`和`is-invalid` 的CSS类。但是我们的表单模板看起来十分的复杂，我们可以将一些代码移动到模板标记中去。

### 创建自定义模板标签

在**boards**应用中，创建一个名为**templatetags**的新文件夹。然后在该文件夹内创建两个名为 **__init__.py** 和 **form_tags.py**的空文件。

文件结构应该如下：

```shell
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

在 **form_tags.py**文件中，我们创建两个模板标签：

**boards/templatetags/form_tags.py**

```python
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

这些是模板过滤器，他们的工作方式是这样的：

首先，我们将它加载到模板中，就像我们使用 **widget_tweaks** 或**static** 模板标签一样。请注意，在创建这个文件后，你将不得不手动停止开发服务器并重启它，以便Django可以识别新的模板标签。

```
{% load form_tags %}

```

之后，我们就可以在模板中使用它们了。

```
{{ form.username|field_type }}

```

返回：

```
'TextInput'

```

或者在 **input_class**的情况下：

```python
{{ form.username|input_class }}

<!-- if the form is not bound, it will simply return: -->
'form-control '

<!-- if the form is bound and valid: -->
'form-control is-valid'

<!-- if the form is bound and invalid: -->
'form-control is-invalid'

```

现在更新 **form.html**以使用新的模板标签：

**templates/includes/form.html**

```html
{% raw %}
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



这样的话就好多了是吧？这样做降低了模板的复杂性，它现在看起来更加整洁。并且它还解决了密码字段显示绿色边框的问题：

![Login](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-4/login-4.jpg)

### 测试模板标签

首先，让我们稍微组织一下**boards**的测试。就像我们对account app 所做的那样。创建一个新的文件夹名为**tests**，添加一个**init.py**，复制**test.py**并且将其重命名为**test_views.py**。

添加一个名为 **test_templatetags.py**的新空文件。

```shell
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

修复**test_views.py**的导入问题：

**boards/tests/test_views.py**

```python
from ..views import home, board_topics, new_topic
from ..models import Board, Topic, Post
from ..forms import NewTopicForm

```

执行测试来确保一切都正常。

**boards/tests/test_templatetags.py**

```python
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

我们创建了一个用于测试的表单类，然后添加了覆盖两个模板标记中可能出现的场景的测试用例。

```shell
python manage.py test

```

```shell
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
................................
----------------------------------------------------------------------
Ran 32 tests in 0.846s

OK
Destroying test database for alias 'default'...
```

###  密码重置

密码重置过程中涉及一些不友好的 URL 模式。但正如我们在前面的教程中讨论的那样，我们并不需要成为正则表达式专家。我们只需要了解常见问题和它们的解决办法。

在我们开始之前另一件重要的事情是，对于密码重置过程，我们需要发送电子邮件。一开始有点复杂，因为我们需要外部服务。目前，我们不会配置生产环境使用的电子邮件服务。实际上，在开发阶段，我们可以使用Django的调试工具检查电子邮件是否正确发送。

![](./statics/4-31.jpg)

### 控制台收发Email

这个主意来自于项目开发过程中，而不是发送真实的电子邮件，我们只需要记录它们。我们有两种选择：将所有电子邮件写入文本文件或仅将其显示在控制台中。我发现第二个方式更加方便，因为我们已经在使用控制台来运行开发服务器，并且设置更容易一些。

编辑 **settings.py**模块并将`EMAIL_BACKEND`变量添加到文件的末尾。

**myproject/settings.py**

```python
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

```

### 配置路由

密码重置过程需要四个视图：

- 带有表单的页面，用于启动重置过程；
- 一个成功的页面，表示该过程已启动，指示用户检查其邮件文件夹等；
- 检查通过电子邮件发送token的页面
- 一个告诉用户重置是否成功的页面

这些视图是内置的，我们不需要执行任何操作，我们所需要做的就是将路径添加到 **urls.py**并且创建模板。

**myproject/urls.py** [(完整代码)](https://gist.github.com/vitorfs/117e300e00d5685f7186e09260f82736#file-urls-py-L14)

```python
url(r'^reset/$',
    auth_views.PasswordResetView.as_view(
        template_name='password_reset.html',
        email_template_name='password_reset_email.html',
        subject_template_name='password_reset_subject.txt'
    ),
    name='password_reset'),
url(r'^reset/done/$',
    auth_views.PasswordResetDoneView.as_view(template_name='password_reset_done.html'),
    name='password_reset_done'),
url(r'^reset/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',
    auth_views.PasswordResetConfirmView.as_view(template_name='password_reset_confirm.html'),
    name='password_reset_confirm'),
url(r'^reset/complete/$',
    auth_views.PasswordResetCompleteView.as_view(template_name='password_reset_complete.html'),
    name='password_reset_complete'),
]

```

在密码重置视图中，`template_name`参数是可选的。但我认为重新定义它是个好主意，因此视图和模板之间的链接比仅使用默认值更加明显。

在 **templates**文件夹中，新增如下模板文件

- **password_reset.html**
- **password_reset_email.html**:这个模板是发送给用户的电子邮件正文
- **password_reset_subject.txt**:这个模板是电子邮件的主题行，它应该是单行文件
- **password_reset_done.html**
- **password_reset_confirm.html**
- **password_reset_complete.html**

在我们开始实现模板之前，让我们准备一个新的测试文件。

我们可以添加一些基本的测试，因为这些视图和表单已经在Django代码中进行了测试。我们将只测试我们应用程序的细节。

在**accounts/tests** 文件夹中创建一个名为 **test_view_password_reset.py** 的新测试文件。

### 密码重置视图

**templates/password_reset.html**

```html
{% raw %}
{% extends 'base_accounts.html' %}

{% block title %}Reset your password{% endblock %}

{% block content %}
  <div class="row justify-content-center">
    <div class="col-lg-4 col-md-6 col-sm-8">
      <div class="card">
        <div class="card-body">
          <h3 class="card-title">Reset your password</h3>
          <p>Enter your email address and we will send you a link to reset your password.</p>
          <form method="post" novalidate>
            {% csrf_token %}
            {% include 'includes/form.html' %}
            <button type="submit" class="btn btn-primary btn-block">Send password reset email</button>
          </form>
        </div>
      </div>
    </div>
  </div>
{% endblock %}

```

![Password Reset](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-4/password_reset.jpg)

**accounts/tests/test_view_password_reset.py**

```python
from django.contrib.auth import views as auth_views
from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth.models import User
from django.core import mail
from django.core.urlresolvers import reverse
from django.urls import resolve
from django.test import TestCase


class PasswordResetTests(TestCase):
    def setUp(self):
        url = reverse('password_reset')
        self.response = self.client.get(url)

    def test_status_code(self):
        self.assertEquals(self.response.status_code, 200)

    def test_view_function(self):
        view = resolve('/reset/')
        self.assertEquals(view.func.view_class, auth_views.PasswordResetView)

    def test_csrf(self):
        self.assertContains(self.response, 'csrfmiddlewaretoken')

    def test_contains_form(self):
        form = self.response.context.get('form')
        self.assertIsInstance(form, PasswordResetForm)

    def test_form_inputs(self):
        '''
        The view must contain two inputs: csrf and email
        '''
        self.assertContains(self.response, '<input', 2)
        self.assertContains(self.response, 'type="email"', 1)


class SuccessfulPasswordResetTests(TestCase):
    def setUp(self):
        email = 'john@doe.com'
        User.objects.create_user(username='john', email=email, password='123abcdef')
        url = reverse('password_reset')
        self.response = self.client.post(url, {'email': email})

    def test_redirection(self):
        '''
        A valid form submission should redirect the user to `password_reset_done` view
        '''
        url = reverse('password_reset_done')
        self.assertRedirects(self.response, url)

    def test_send_password_reset_email(self):
        self.assertEqual(1, len(mail.outbox))


class InvalidPasswordResetTests(TestCase):
    def setUp(self):
        url = reverse('password_reset')
        self.response = self.client.post(url, {'email': 'donotexist@email.com'})

    def test_redirection(self):
        '''
        Even invalid emails in the database should
        redirect the user to `password_reset_done` view
        '''
        url = reverse('password_reset_done')
        self.assertRedirects(self.response, url)

    def test_no_reset_email_sent(self):
        self.assertEqual(0, len(mail.outbox))

```

**templates/password_reset_subject.txt**

```
[Django Boards] Please reset your password

```

**templates/password_reset_email.html**

```text
Hi there,

Someone asked for a password reset for the email address {{ email }}.
Follow the link below:
{{ protocol }}://{{ domain }}{% url 'password_reset_confirm' uidb64=uid token=token %}

In case you forgot your Django Boards username: {{ user.username }}

If clicking the link above doesn't work, please copy and paste the URL
in a new browser window instead.

If you've received this mail in error, it's likely that another user entered
your email address by mistake while trying to reset a password. If you didn't
initiate the request, you don't need to take any further action and can safely
disregard this email.

Thanks,

The Django Boards Team

```

![Password Reset Email](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-4/password_reset_email.png)

我们可以创建一个特定的文件来测试电子邮件。在**accounts/tests** 文件夹中创建一个名为**test_mail_password_reset.py**的新文件：

**accounts/tests/test_mail_password_reset.py**

```python
from django.core import mail
from django.contrib.auth.models import User
from django.urls import reverse
from django.test import TestCase

class PasswordResetMailTests(TestCase):
    def setUp(self):
        User.objects.create_user(username='john', email='john@doe.com', password='123')
        self.response = self.client.post(reverse('password_reset'), { 'email': 'john@doe.com' })
        self.email = mail.outbox[0]

    def test_email_subject(self):
        self.assertEqual('[Django Boards] Please reset your password', self.email.subject)

    def test_email_body(self):
        context = self.response.context
        token = context.get('token')
        uid = context.get('uid')
        password_reset_token_url = reverse('password_reset_confirm', kwargs={
            'uidb64': uid,
            'token': token
        })
        self.assertIn(password_reset_token_url, self.email.body)
        self.assertIn('john', self.email.body)
        self.assertIn('john@doe.com', self.email.body)

    def test_email_to(self):
        self.assertEqual(['john@doe.com',], self.email.to)

```

此测试用例抓取应用程序发送的电子邮件，并检查主题行，正文内容以及发送给谁。

### 密码重置完成视图

**templates/password_reset_done.html**

```html
{% raw %}
{% extends 'base_accounts.html' %}

{% block title %}Reset your password{% endblock %}

{% block content %}
  <div class="row justify-content-center">
    <div class="col-lg-4 col-md-6 col-sm-8">
      <div class="card">
        <div class="card-body">
          <h3 class="card-title">Reset your password</h3>
          <p>Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.</p>
          <a href="{% url 'login' %}" class="btn btn-secondary btn-block">Return to log in</a>
        </div>
      </div>
    </div>
  </div>
{% endblock %}

```

![Password Reset Done](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-4/password_reset_done.jpg)

**accounts/tests/test_view_password_reset.py**

```python
from django.contrib.auth import views as auth_views
from django.core.urlresolvers import reverse
from django.urls import resolve
from django.test import TestCase

class PasswordResetDoneTests(TestCase):
    def setUp(self):
        url = reverse('password_reset_done')
        self.response = self.client.get(url)

    def test_status_code(self):
        self.assertEquals(self.response.status_code, 200)

    def test_view_function(self):
        view = resolve('/reset/done/')
        self.assertEquals(view.func.view_class, auth_views.PasswordResetDoneView)

```

### 密码重置确认视图

**templates/password_reset_confirm.html**

```html
{% raw %}
{% extends 'base_accounts.html' %}

{% block title %}
  {% if validlink %}
    Change password for {{ form.user.username }}
  {% else %}
    Reset your password
  {% endif %}
{% endblock %}

{% block content %}
  <div class="row justify-content-center">
    <div class="col-lg-6 col-md-8 col-sm-10">
      <div class="card">
        <div class="card-body">
          {% if validlink %}
            <h3 class="card-title">Change password for @{{ form.user.username }}</h3>
            <form method="post" novalidate>
              {% csrf_token %}
              {% include 'includes/form.html' %}
              <button type="submit" class="btn btn-success btn-block">Change password</button>
            </form>
          {% else %}
            <h3 class="card-title">Reset your password</h3>
            <div class="alert alert-danger" role="alert">
              It looks like you clicked on an invalid password reset link. Please try again.
            </div>
            <a href="{% url 'password_reset' %}" class="btn btn-secondary btn-block">Request a new password reset link</a>
          {% endif %}
        </div>
      </div>
    </div>
  </div>
{% endblock %}

```

这个页面只能通过电子邮件访问，它看起来像这样：http://127.0.0.1:8000/reset/Mw/4po-2b5f2d47c19966e294a1/

在开发阶段，从控制台中的电子邮件获取此链接。

如果链接是有效的：

![Password Reset Confirm Valid](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-4/password_reset_confirm_valid.jpg)

倘若链接已经被使用：

![Password Reset Confirm Invalid](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-4/password_reset_confirm_invalid.jpg)

**accounts/tests/test_view_password_reset.py**

```python
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth import views as auth_views
from django.contrib.auth.forms import SetPasswordForm
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.urls import resolve
from django.test import TestCase


class PasswordResetConfirmTests(TestCase):
    def setUp(self):
        user = User.objects.create_user(username='john', email='john@doe.com', password='123abcdef')

        '''
        create a valid password reset token
        based on how django creates the token internally:
        https://github.com/django/django/blob/1.11.5/django/contrib/auth/forms.py#L280
        '''
        self.uid = urlsafe_base64_encode(force_bytes(user.pk)).decode()
        self.token = default_token_generator.make_token(user)

        url = reverse('password_reset_confirm', kwargs={'uidb64': self.uid, 'token': self.token})
        self.response = self.client.get(url, follow=True)

    def test_status_code(self):
        self.assertEquals(self.response.status_code, 200)

    def test_view_function(self):
        view = resolve('/reset/{uidb64}/{token}/'.format(uidb64=self.uid, token=self.token))
        self.assertEquals(view.func.view_class, auth_views.PasswordResetConfirmView)

    def test_csrf(self):
        self.assertContains(self.response, 'csrfmiddlewaretoken')

    def test_contains_form(self):
        form = self.response.context.get('form')
        self.assertIsInstance(form, SetPasswordForm)

    def test_form_inputs(self):
        '''
        The view must contain two inputs: csrf and two password fields
        '''
        self.assertContains(self.response, '<input', 3)
        self.assertContains(self.response, 'type="password"', 2)


class InvalidPasswordResetConfirmTests(TestCase):
    def setUp(self):
        user = User.objects.create_user(username='john', email='john@doe.com', password='123abcdef')
        uid = urlsafe_base64_encode(force_bytes(user.pk)).decode()
        token = default_token_generator.make_token(user)

        '''
        invalidate the token by changing the password
        '''
        user.set_password('abcdef123')
        user.save()

        url = reverse('password_reset_confirm', kwargs={'uidb64': uid, 'token': token})
        self.response = self.client.get(url)

    def test_status_code(self):
        self.assertEquals(self.response.status_code, 200)

    def test_html(self):
        password_reset_url = reverse('password_reset')
        self.assertContains(self.response, 'invalid password reset link')
        self.assertContains(self.response, 'href="{0}"'.format(password_reset_url))

```

### 密码重置完成视图

**templates/password_reset_complete.html**

```html
{% raw %}
{% extends 'base_accounts.html' %}

{% block title %}Password changed!{% endblock %}

{% block content %}
  <div class="row justify-content-center">
    <div class="col-lg-6 col-md-8 col-sm-10">
      <div class="card">
        <div class="card-body">
          <h3 class="card-title">Password changed!</h3>
          <div class="alert alert-success" role="alert">
            You have successfully changed your password! You may now proceed to log in.
          </div>
          <a href="{% url 'login' %}" class="btn btn-secondary btn-block">Return to log in</a>
        </div>
      </div>
    </div>
  </div>
{% endblock %}

```

![Password Reset Complete](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-4/password_reset_complete.jpg)

**accounts/tests/test_view_password_reset.py** [(view complete file contents)](https://gist.github.com/vitorfs/c9657d39d28c2a0cfb0933e715bfc9cf#file-test_view_password_reset-py-L149)

```html
{% raw %}
from django.contrib.auth import views as auth_views
from django.core.urlresolvers import reverse
from django.urls import resolve
from django.test import TestCase

class PasswordResetCompleteTests(TestCase):
    def setUp(self):
        url = reverse('password_reset_complete')
        self.response = self.client.get(url)

    def test_status_code(self):
        self.assertEquals(self.response.status_code, 200)

    def test_view_function(self):
        view = resolve('/reset/complete/')
        self.assertEquals(view.func.view_class, auth_views.PasswordResetCompleteView)

```

------

### 密码更改视图

此视图旨在提供给希望更改其密码的登录用户使用。通常，这些表单由三个字段组成：旧密码、新密码、新密码确认。

**myproject/urls.py** [(view complete file contents)](https://gist.github.com/vitorfs/0927898f37831cad0d6a4ec538b8a002#file-urls-py-L31)

```python
url(r'^settings/password/$', auth_views.PasswordChangeView.as_view(template_name='password_change.html'),
    name='password_change'),
url(r'^settings/password/done/$', auth_views.PasswordChangeDoneView.as_view(template_name='password_change_done.html'),
    name='password_change_done'),

```

这些视图仅适合登录用户，他们使用名为 `@login_required`的装饰器，此装饰器可防止非授权用户访问此页面。如果用户没有登录，Django会将他们重定向到登录页面。

现在我们必须在**settings.py**中定义我们应用程序的登录URL：

**myproject/settings.py** [(view complete file contents)](https://gist.github.com/vitorfs/2d3a2c45df7deb025b8206c5a9b55e12#file-settings-py-L133)

```
LOGIN_URL = 'login'

```

**templates/password_change.html**

```html
{% raw %}
{% extends 'base.html' %}

{% block title %}Change password{% endblock %}

{% block breadcrumb %}
  <li class="breadcrumb-item active">Change password</li>
{% endblock %}

{% block content %}
  <div class="row">
    <div class="col-lg-6 col-md-8 col-sm-10">
      <form method="post" novalidate>
        {% csrf_token %}
        {% include 'includes/form.html' %}
        <button type="submit" class="btn btn-success">Change password</button>
      </form>
    </div>
  </div>
{% endblock %}

```

![Change Password](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-4/password_change.png)

**templates/password_change_done.html**

```html
{% raw %}
{% extends 'base.html' %}

{% block title %}Change password successful{% endblock %}

{% block breadcrumb %}
  <li class="breadcrumb-item"><a href="{% url 'password_change' %}">Change password</a></li>
  <li class="breadcrumb-item active">Success</li>
{% endblock %}

{% block content %}
  <div class="alert alert-success" role="alert">
    <strong>Success!</strong> Your password has been changed!
  </div>
  <a href="{% url 'home' %}" class="btn btn-secondary">Return to home page</a>
{% endblock %}

```

![Change Password Successful](https://simpleisbetterthancomplex.com/media/series/beginners-guide/1.11/part-4/password_change_done.png)

关于密码更改视图，我们可以执行类似的测试用例，就像我们迄今为止所做的那样。创建一个名为**test_view_password_change.py**的新测试文件。

我将在下面列出新的测试类型。你可以检查我为密码更改视图编写的所有测试，然后单击代码段旁边的查看文正文件内容链接。大部分测试与我们迄今为止所做的相似。我转移到一个外部文件以避免太过于复杂。

**accounts/tests/test_view_password_change.py** [(view complete file contents)](https://gist.github.com/vitorfs/03e2f20a4c1e693c9b22b343503fb461#file-test_view_password_change-py-L40)

```python
class LoginRequiredPasswordChangeTests(TestCase):
    def test_redirection(self):
        url = reverse('password_change')
        login_url = reverse('login')
        response = self.client.get(url)
        self.assertRedirects(response, f'{login_url}?next={url}')

```

上面的测试尝试访问**password_change**视图而不登录。预期的行为是将用户重定向到登录页面。

**accounts/tests/test_view_password_change.py** [(view complete file contents)](https://gist.github.com/vitorfs/03e2f20a4c1e693c9b22b343503fb461#file-test_view_password_change-py-L48)

```python
class PasswordChangeTestCase(TestCase):
    def setUp(self, data={}):
        self.user = User.objects.create_user(username='john', email='john@doe.com', password='old_password')
        self.url = reverse('password_change')
        self.client.login(username='john', password='old_password')
        self.response = self.client.post(self.url, data)

```

在这里我们定义了一个名为**PasswordChangeTestCase **的新类。它将进行基本的设置，创建用户并向 **password_change**视图发送一个**POST** 请求。在下一组测试用例中，我们将使用这个类而不是 **TestCase**类来测试成功请求和无效请求：

**accounts/tests/test_view_password_change.py** [(view complete file contents)](https://gist.github.com/vitorfs/03e2f20a4c1e693c9b22b343503fb461#file-test_view_password_change-py-L60)

```python
class SuccessfulPasswordChangeTests(PasswordChangeTestCase):
    def setUp(self):
        super().setUp({
            'old_password': 'old_password',
            'new_password1': 'new_password',
            'new_password2': 'new_password',
        })

    def test_redirection(self):
        '''
        A valid form submission should redirect the user
        '''
        self.assertRedirects(self.response, reverse('password_change_done'))

    def test_password_changed(self):
        '''
        refresh the user instance from database to get the new password
        hash updated by the change password view.
        '''
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('new_password'))

    def test_user_authentication(self):
        '''
        Create a new request to an arbitrary page.
        The resulting response should now have an `user` to its context, after a successful sign up.
        '''
        response = self.client.get(reverse('home'))
        user = response.context.get('user')
        self.assertTrue(user.is_authenticated)


class InvalidPasswordChangeTests(PasswordChangeTestCase):
    def test_status_code(self):
        '''
        An invalid form submission should return to the same page
        '''
        self.assertEquals(self.response.status_code, 200)

    def test_form_errors(self):
        form = self.response.context.get('form')
        self.assertTrue(form.errors)

    def test_didnt_change_password(self):
        '''
        refresh the user instance from the database to make
        sure we have the latest data.
        '''
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('old_password'))

```

`refresh_from_db()`方法确保我们拥有最新的数据状态。它强制Django再次查询数据库以更新数据。考虑到**change_password**视图会更新数据库中的密码，我们必须这样做。为了查看测试密码是否真的改变了，我们必须从数据库中获取最新的数据。

------

###  总结

对于大多数Django应用程序，身份验证是一种非常常见的用例。在本教程中，我们实现了所有重要视图：注册、登录、注销、密码重置和更改密码。现在我们有了一种方法来创建用户并进行身份验证，我们将能够继续开发应用程序和其他视图。

我们仍然需要改进很多关于代码设计的问题：模板文件夹开始变得乱七八糟。 **boards** 应用测试仍然是混乱的。此外，我们必须开始重构新的主题视图，因为现在我们可以检索登录的用户。我们很快就将做到这一点。

我希望你喜欢本教程系列的第四部分！第五部分将于2017年10月2日下周发布，如果您希望在第五部分结束的时候收到通过，请您订阅我们的邮件列表。

该项目的源代码在GitHub上面可用，项目的当前状态在发布标签**v0.4-lw**下可以找到。链接如下：

<https://github.com/sibtc/django-beginners-guide/tree/v0.4-lw>









