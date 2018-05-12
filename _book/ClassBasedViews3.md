## 添加 Markdown 支持

让我们在文本区域添加 Markdown 支持来改善用户体验。你会看到要实现这个功能非常简单。

首先，我们安装一个名为 **Python-Markdown** 的库：

```bash
pip install markdown
```

我们可以在 **Post** 视图的 model 中添加一个新的方法:

**boards/models.py** [查看完整文件](https://gist.github.com/vitorfs/caa24fcf2b66903617ebbb41337d3d3d#file-models-py-L46)

```python
from django.db import models
from django.utils.html import mark_safe
from markdown import markdown

class Post(models.Model):
    # ...

    def get_message_as_markdown(self):
        return mark_safe(markdown(self.message, safe_mode='escape'))
```

这里我们正在处理用户的输入，所以我们需要小心一点。当使用 Mardown 功能时，我们需要先让它转义一下特殊字符，然后再解析出 Markdown 标签。这样做之后，输出字符串可以安全的在模板中使用。

现在，我们只需要在模板 **topic_posts.html** 和 **reply_topic.html** 中修改一下 form。

```
{{ post.message }}
```

修改为：

```
{{ post.get_message_as_markdown }}
```

从现在起，用户就可以在帖子中使用 Mardown 语法来编辑了。

![](./statics/6-8.png)

![](./statics/6-9.png)

### Markdown 编辑器

我们还可以添加一个名为 **[SimpleMD](****)** 的非常酷的 Markdown 编辑器。

可以下载 JavaScript 库，后者使用他们的CDN：

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.css">
<script src="https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.js"></script>
```

现在来编辑一下 **base.html** ，为这些额外的Javascripts声明一个block (*译者注：方便其他模板继承*):

**templates/base.html** [查看完整文件](https://gist.github.com/vitorfs/5a7ad8e7eae88d64f62fec82d037b168#file-base-html-L57)

```html
<script src="{% static 'js/jquery-3.2.1.min.js' %}"></script>
    <script src="{% static 'js/popper.min.js' %}"></script>
    <script src="{% static 'js/bootstrap.min.js' %}"></script>
    {% block javascript %}{% endblock %}  <!-- Add this empty block here! -->
```

首先来编辑 **reply_topic.html**	 模板：

**templates/reply_topic.html** [查看完整文件](https://gist.github.com/vitorfs/fb63bb7530690d62787c3ed8b7e15241)

```html
{% extends 'base.html' %}

{% load static %}

{% block title %}Post a reply{% endblock %}

{% block stylesheet %}
  <link rel="stylesheet" href="{% static 'css/simplemde.min.css' %}">
{% endblock %}

{% block javascript %}
  <script src="{% static 'js/simplemde.min.js' %}"></script>
  <script>
    var simplemde = new SimpleMDE();
  </script>
{% endblock %}
```

默认情况下，这个插件会将它找到的第一个文本区域转换为 markdown 编辑器。所以这点代码应该就足够了：

![](./statics/6-10.png)

接下来在 **edit_post.html** 模板中做同样的操作：

**templates/edit_post.html** [查看完整文件](https://gist.github.com/vitorfs/ee9d8c91888b0bc60013b8f037bae7bb)

```html
{% extends 'base.html' %}

{% load static %}

{% block title %}Edit post{% endblock %}

{% block stylesheet %}
  <link rel="stylesheet" href="{% static 'css/simplemde.min.css' %}">
{% endblock %}

{% block javascript %}
  <script src="{% static 'js/simplemde.min.js' %}"></script>
  <script>
    var simplemde = new SimpleMDE();
  </script>
{% endblock %}
```

![](./statics/6-11.png)