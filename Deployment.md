# Django入门与实践-第27章：项目部署

### 简介（Introduction）

![7-A-Complete-Beginner's-Guide-to-Django-Part7.jpg](./statics/7-A-Complete-Beginner's-Guide-to-Django-Part7.jpg)

欢迎来到我们教程系列的最后一部分！这篇文章，我们将把Django应用程序部署到生产服务器。我们还将为我们的服务器配置Email服务和HTTPS证书。

首先，我想到了给一个使用虚拟专用服务器（VPS）的例子，它更通用，然后使用一个平台比如 Heroku 服务。但它我写得太详细了，所以本教程我最终偏向关于VPS的内容。

我们的项目已经上线啦！您可以在阅读本文之前点击在线查看，这是我们本文要部署的应用程序：[www.djangoboards.com](https://www.djangoboards.com)。

### 版本控制（Version Control）

版本控制是软件开发中非常重要的话题。特别是在团队开发中同时开发多个功能，并一起维护项目代码时。无论是一个开发人员项目还是多个开发人员项目，每个项目都应该使用版本控制。

版本控制系统有几种选择。也许是因为GitHub的流行，Git 成为版本控制的实际标准。所以如果你不熟悉版本控制，Git是一个很好的入门起点。一般有很多相关的教程，课程和资源，因此遇到问题很容易找到帮助。

GitHub和Code School有一个[关于Git的很棒的互动教程](https://try.github.io/)，这是一个非常好的介绍Git的网站。几年前我就开始从SVN转到Git。

这是一个非常重要的话题，我其实应该从第一个教程开始讲Git。但事实是我希望本教程系列的重点放在Django上。如果Git这东西对您来说都是新的，请不要担心。一步一步入门是很重要的。也许你的第一个项目并不完美。重要的是要坚持学习和慢慢提高你的技能，但要有恒心！

关于Git的一个非常好的事情是它不仅仅是一个版本控制系统。围绕它建立了丰富的工具和服务生态系统。一些很好的例子比如持续集成、部署、代码审查、代码质量和项目管理。

使用Git来支持Django项目的部署过程非常有用。这是从源代码存储库中拉取最新版本或在出现问题时回滚到特定版本的便捷方式。有许多服务使用Git来集成，以便执行自动化测试和部署。

如果您没有在本地计算机上安装Git，请从 [https://git-scm.com/downloads](https://git-scm.com/downloads) 下载和安装。

#### Git 基本配置（Basic Setup）

首先，设置你电脑的Git身份：

```git
    git config --global user.name "Vitor Freitas"
    git config --global user.email vitor@simpleisbetterthancomplex.com
```

译者注：
- git config --global user.name “xxx”: 设置git操作者名称
- git config --global user.email “email” 设置git操作者邮箱
这2个配置的名字和邮箱，会记录在git操作记录中。

在项目根目录（与**manage.py**相同的目录）中，初始化一个git存储库：

```git
git init
```

```
Initialized empty Git repository in /Users/vitorfs/Development/myproject/.git/
```

检查存储库的状态：

```git
git status
```


```git
On branch master

Initial commit

Untracked files:
  (use "git add <file>..." to include in what will be committed)

  accounts/
  boards/
  manage.py
  myproject/
  requirements.txt
  static/
  templates/

nothing added to commit but untracked files present (use "git add" to track)
```

在继续添加源文件之前，请在项目根目录中创建名为**.gitignore**的新文件。这个特殊的文件将帮助我们保持Git仓库的干净，保证缓存文件或日志这样的不必要的文件不会添加到Git仓库中。

您可以从 GitHub 获取 [Python项目的通用.gitignore文件](https://github.com/github/gitignore/blob/master/Python.gitignore)。

确保将它从 **Python.gitignore** 重命名为 **.gitignore**（点很重要！）。

您可以补充 **.gitignore** 文件内容，告诉它(Git)忽略SQLite数据库文件，例如：

**.gitignore**  文件内容：

```git
__pycache__/
*.py[cod]
.env
venv/

SQLite database files
*.sqlite3
```

现在将文件添加到存储库：

```git
git add .
```

请注意上面`add`后面有一个点。上面的命令告诉Git 在当前目录中添加所有未跟踪的文件。（译者注，点表示所有，整句就表示添加所以文件到Git，除了.gitignore文件列出的要忽略。）

现在进行第一次提交：

```git
git commit -m "Initial commit"
```

一定要写一个注释说明这个提交是什么，简要描述你改变了什么。

#### Git 远程仓库（Remote Repository）

现在让我们将 [GitHub](https://github.com/) 设置为远程仓库。首先，在GitHub上创建一个免费帐户，然后在电子邮件中点击GitHub发来的验证链接确认您的电子邮件地址。然后您就能在GitHub上创建公开仓库（译者注：GitHub公开仓库是免费的，私有仓库收费。）。

现在，只需为仓库创建一个名称，不要勾选使用自述文件初始化它（initialize this repository with a README），也不要添加 `Add .gitignore` 或添加 `Add a license` 许可证。确保仓库开始为空：

![7-GitHub-Create-Repository.png](./statics/7-GitHub-Create-Repository.png)

创建仓库后，您应该看到如下内容：

![7-GitHub-Repository.png](./statics/7-GitHub-Repository.png)

现在让我们将其配置为我们的远程仓库：

```git
git remote add origin git@github.com:sibtc/django-boards.git
```

现在将代码推送到远程服务器，即GitHub仓库：

```git
git push origin master

Counting objects: 84, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (81/81), done.
Writing objects: 100% (84/84), 319.70 KiB | 0 bytes/s, done.
Total 84 (delta 10), reused 0 (delta 0)
remote: Resolving deltas: 100% (10/10), done.
To git@github.com:sibtc/django-boards.git
 * [new branch]      master -> master
```

![7-GitHub-Initial-Commit.png](./statics/7-GitHub-Initial-Commit.png)

我创建此仓库只是为了演示使用现有代码库创建远程仓库的过程。该项目的源代码正式托管在此仓库中：[https://github.com/sibtc/django-beginners-guide](https://github.com/sibtc/django-beginners-guide)。


### 项目配置（Project Settings）

无论代码是存储在公共或私有远程仓库中，都不应提交敏感信息并将其推送到远程仓库。这包括密钥，密码，API密钥等。

此时，我们必须在 **settings.py** 模块中处理两种特定类型的配置：

- 密钥和密码等敏感信息;
- 针对特定的环境配置。

密码和密钥可以存储在环境变量中或使用本地文件（未提交到远程仓库）：


```python
# environment variables
import os
SECRET_KEY = os.environ['SECRET_KEY']

# or local files
with open('/etc/secret_key.txt') as f:
    SECRET_KEY = f.read().strip()
```

为此， 我在我开发的每个Django项目中都使用了一个名为 [Python Decouple](https://simpleisbetterthancomplex.com/2015/11/26/package-of-the-week-python-decouple.html) 的优秀实用功能库。它将搜索名为 **.env** 的本地文件以设置这配置变量，并将内容配置到环境变量。它还提供了一个定义默认值的接口，在适当时将数据转换为**int**，**bool**和**list**。

这不是强制性的，但我真的觉得它是一个非常有用的工具。它像Heroku这样的服务一样有魅力。

首先，让我们安装它：


```python
pip install python-decouple
```

**myproject/settings.py**


```python
from decouple import config

SECRET_KEY = config('SECRET_KEY')
```

现在，我们可以将敏感信息放在一个名为**.env**的特殊文件中（注意前面的点），该文件位于**manage.py**文件所在的目录中：


```
myproject/
 |-- myproject/
 |    |-- accounts/
 |    |-- boards/
 |    |-- myproject/
 |    |-- static/
 |    |-- templates/
 |    |-- .env        <-- here!
 |    |-- .gitignore
 |    |-- db.sqlite3
 |    +-- manage.py
 +-- venv/
```
 
**.env** 文件内容：

```python
SECRET_KEY=rqr_cjv4igscyu8&&(0ce(=sy=f2)p=f_wn&@0xsp7m$@!kp=d
```

该**.ENV**文件中忽略的**.gitignore**文件，所以每次我们要部署应用程序或在不同的机器上运行时，我们将创建一个**.ENV**文件，并添加必要的配置。

现在让我们安装另一个库来帮助我们用简单一行代码来编写数据库连接。这样，在不同的环境中编写不同的数据库连接字符串会更容易：

```python
pip install dj-database-url
```

目前，我们需要解耦的全部配置：

**myproject/settings.py**

```python
from decouple import config, Csv
import dj_database_url

SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', cast=Csv())
DATABASES = {
    'default': dj_database_url.config(
        default=config('DATABASE_URL')
    )
}
```

本地计算机的**.env**文件示例：

```python
SECRET_KEY=rqr_cjv4igscyu8&&(0ce(=sy=f2)p=f_wn&@0xsp7m$@!kp=d
DEBUG=True
ALLOWED_HOSTS=.localhost,127.0.0.1
```

请注意，在**DEBUG**配置中我们给了一个默认值(True)，因此在生产环境中我们可以忽略（注释）此配置，因此它将被自动设置为**False**，因为它生产环境应该是False的。

现在**ALLOWED_HOSTS**将被转换成一个列表**['.localhost', '127.0.0.1'. ]**。现在，这是在我们的本地机器上，为了生产，我们将其设置为类似于**['.djangoboards.com', ]**您拥有的任何域名。

这特定配置可确保您的应用程序仅提供给这个域名。


### 记录依赖库版本（Tracking Requirements）

跟踪项目的依赖关系是一个很好的做法，因此另一台机器上更容易安装它(依赖的环境)。

我们可以通过运行下面的命令来检查当前安装的Python依赖库：

```python
pip freeze

dj-database-url==0.4.2
Django==1.11.6
django-widget-tweaks==1.4.1
Markdown==2.6.9
python-decouple==3.1
pytz==2017.2
```
在项目根目录中创建名为**requirements.txt**的文件，并在其中添加依赖项(就是上面 `pip freeze`得到的项目所有的依赖库)：

**requirements.txt**  文件内容：

```python
dj-database-url==0.4.2
Django==1.11.6
django-widget-tweaks==1.4.1
Markdown==2.6.9
python-decouple==3.1
```

我保留了**pytz == 2017.2**，因为它是由Django自动安装的。

您可以更新源代码仓库：

```git
git add .
git commit -m "Add requirements.txt file"
git push origin master
```

### 域名（Domain Name）

如果我们要正确部署Django应用程序，我们将需要一个域名（译者注：如果部署外网，给别人使用需要域名，但如果是内网使用，只有IP地址也可以访问。此处，作者意思要处理上线外网。）。拥有域名来为应用程序提供服务，配置电子邮件服务和配置https证书非常重要。

最近，我一直在使用 [Namecheap](https://namecheap.pxf.io/c/477033/386170/5618) 。您可以以8.88美元/年的价格获得.com域名，或者如果您只是尝试一下，您可以用 0.99美元/年 的价格注册.xyz域名。（译者注：在中国，可以注册阿里云、腾讯云等著名的注册商都有域名卖买，大家可自行搜索官网。）

无论如何，您可以自由使用任何注册商。为了演示部署过程，我注册了 [www.DjangoBoards.com](https://www.djangoboards.com/) 域名。

### 部署策略（Deployment Strategy）

以下是我们将在本教程中使用的部署策略的概述：

![7-Django-Deployment-Strategy.jpg](./statics/7-Django-Deployment-Strategy.jpg)

云服务是使用 [Digital Ocean](https://m.do.co/c/074832454ff1) 提供的虚拟专用服务器。您可以使用我的会员链接注册Digital Ocean以获得 [免费的10美元信用额度](https://m.do.co/c/074832454ff1)（仅适用于新帐户）。（译者注：云服务商在中国可选择阿里云、腾讯云）

首先我们将使用 **[NGINX](https://www.nginx.com/)**（译者注：Nginx是一个异步框架的 Web服务器，通常作为负载均衡器。），其商标是食人魔。NGINX将收到访问者对服务器的所有请求。但如果请求数据，它不会尝试做任何不聪明的事情（译者注：Nginx主要负责处理请求，并分发给文件系统或HTTP服务器等。）。它所要做的就是确定所请求的信息是否是一个可以自行提供的静态资源，或者它是否更复杂。如果是，它会将请求传递给 **[Gunicorn](http://gunicorn.org/)**（译者注：Gunicorn“绿色独角兽”是一个被广泛使用的高性能的Python WSGI UNIX HTTP服务器，移植自Ruby的独角兽（Unicorn ）项目,使用pre-fork worker模式，具有使用非常简单，轻量级的资源消耗，以及高性能等特点。）。

NGINX 还将配置 HTTPS证书。这意味着它只接受通过HTTPS的请求。如果客户端尝试通过HTTP请求，NGINX将首先将用户重定向到HTTPS，然后它才会决定如何处理请求链接。

我们还将安装此 **[certbot](https://certbot.eff.org/)** 以自动续订 **[Let’s Encrypt](https://letsencrypt.org/)** 的证书。（译者注：想了解更多内容，可阅读[HTTPS 简介及使用官方工具 Certbot 配置 Let’s Encrypt SSL 安全证书详细教程 | Linux Story](https://linuxstory.org/deploy-lets-encrypt-ssl-certificate-with-certbot/)。）

Gunicorn是一个应用服务器。根据服务器拥有的CPU处理器数量，它可以通过生成多个同时工作的程序以并行处理多个请求。它管理工作负载并执行Python和Django代码。

Django是一个努力工作的代表。它可以访问数据库（PostgreSQL）或文件系统。但在大多数情况下，工作是在视图内部完成，渲染模板，以及过去几周我们编写过的所有内容。在Django处理请求之后，它会向Gunicorn返回一个响应，他将结果返回给NGINX，最终将响应传递给客户端。

我们还将安装**[PostgreSQL](https://www.postgresql.org/)**，一个优秀的数据库系统。由于Django的ORM系统，很容易切换数据库。（译者注：PostgreSQL被业界誉为“最先进的开源数据库”，面向企业复杂SQL处理的OLTP在线事务处理场景，支持NoSQL数据类型（JSON/XML/hstore）、支持GIS地理信息处理。）

最后一步是安装**[Supervisor](http://supervisord.org/)**。它是一个过程控制系统，它将密切关注Gunicorn和Django，以确保一切顺利进行。如果服务器重新启动，或者Gunicorn崩溃，它将自动重启。（译者注：Supervisor是一个Python开发的client/server系统，可以管理和监控*nix上面的进程的工具。）

### 部署到VPS（Digital Ocean）（Deploying to a VPS (Digital Ocean)）

您可以使用您喜欢的任何其他VPS（虚拟专用服务器）。配置应该非常相似，毕竟我们将使用Ubuntu 16.04 作为我们的服务器。

首先，让我们创建一个新的服务器（在Digital Ocean上，他们称之为“Droplet”）。选择Ubuntu 16.04：

![7-Digital-Ocean-Create-Droplets.png](./statics/7-Digital-Ocean-Create-Droplets.png)

选择尺寸。最小的空间就足够了：
![7-Digital-Ocean-Create-Droplets-Choose-Size.png](./statics/7-Digital-Ocean-Create-Droplets-Choose-Size.png)

然后为您的Droplet选择一个主机名（在我的例子为“django-boards”）：
![7-Digital-Ocean-Create-Droplets-Choose-Hostname.png](./statics/7-Digital-Ocean-Create-Droplets-Choose-Hostname.png)

如果您有SSH密钥，则可以将其添加到您的帐户。然后，您将能够使用它登录服务器。否则，他们会通过电子邮件向您发送root密码。(译者注：SSH密钥可以不用输入密码就链接到服务器，具体可自行搜索了解更多。)

现在选择服务器的IP地址：
![7-Digital-Ocean-Choose-IPaddress.png](./statics/7-Digital-Ocean-Choose-IPaddress.png)

在我们登录服务器之前，让我们将域名指向此IP地址。这将节省一些时间，因为DNS设置通常需要几分钟才能传播。
![7-Digital-Ocean-Add-DNS-Record.png](./statics/7-Digital-Ocean-Add-DNS-Record.png)

所以这里我们添加了两条A记录，一条指向主域名“djangoboards.com”，另一条指向“www.djangoboards.com”。我们将使用NGINX配置规范URL。

现在让我们使用终端登录服务器：

```bash
ssh root@45.55.144.54
root@45.55.144.54's password:
```

然后你应该看到以下消息：


```bash
You are required to change your password immediately (root enforced)
Welcome to Ubuntu 16.04.3 LTS (GNU/Linux 4.4.0-93-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  Get cloud support with Ubuntu Advantage Cloud Guest:
    http://www.ubuntu.com/business/services/cloud

0 packages can be updated.
0 updates are security updates.


Last login: Sun Oct 15 18:39:21 2017 from 82.128.188.51
Changing password for root.
(current) UNIX password:
```

设置新密码，然后开始配置服务器。

```bash
sudo apt-get update
sudo apt-get -y upgrade
```

如果在升级过程中收到任何提示，请选择"keep the local version currently installed"(保持当前安装的本地版本)选项。

**Python 3.6**

```bash
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt-get update
sudo apt-get install python3.6
```

**PostgreSQL**

```bash
sudo apt-get -y install postgresql postgresql-contrib
```

**NGINX**

```bash
sudo apt-get -y install nginx
```

**Supervisor**

```bash
sudo apt-get -y install supervisor

sudo systemctl enable supervisor
sudo systemctl start supervisor
```

**Virtualenv**

```bash
wget https://bootstrap.pypa.io/get-pip.py
sudo python3.6 get-pip.py
sudo pip3.6 install virtualenv
```

#### 应用用户（Application User）

使用以下命令创建新用户：

```bash
adduser boards
```

通常，我只选择应用程序的名称。输入密码，并可选择在提示中添加一些额外信息。

现在将用户添加到sudoers列表：

```bash
gpasswd -a boards sudo
```

#### **PostgreSQL**数据库配置（**PostgreSQL** Database Setup）

首先切换到postgres用户：

```bash
sudo su - postgres
```

创建数据库用户：

```sql
createuser u_boards
```

创建一个新数据库并将用户设置为所有者：


```sql
createdb django_boards --owner u_boards
```

为用户定义一个强密码：

```sql
psql -c "ALTER USER u_boards WITH PASSWORD 'BcAZoYWsJbvE7RMgBPzxOCexPRVAq'"
```

我们现在可以退出postgres用户了：

```bash
exit
```

#### Django项目配置（Django Project Setup）

切换到应用程序用户：

```bash
sudo su - boards
```

开始前，我们先检查终端的位置：

```bash
pwd

/home/boards
```

首先，让我们用我们的代码克隆存储库：

```git
git clone https://github.com/sibtc/django-beginners-guide.git
```

启动虚拟环境(virtualenv)：

```python
virtualenv venv -p python3.6
```

初始化virtualenv：

```python
source venv/bin/activate
```

安装依赖的库（译者注：从文件中读取依赖进行安装。）：

```python
pip install -r django-beginners-guide/requirements.txt
```

我们再添加两个额外的库，Gunicorn和PostgreSQL驱动程序：

```python
pip install gunicorn
pip install psycopg2
```

现在在**/home/boards/django-beginners-guide**文件夹中，让我们创建一个**.env**文件来存储数据库凭据，密钥和其他所有内容：

**/home/boards/django-beginners-guide/.env**


```bash
SECRET_KEY=rqr_cjv4igscyu8&&(0ce(=sy=f2)p=f_wn&@0xsp7m$@!kp=d
ALLOWED_HOSTS=.djangoboards.com
DATABASE_URL=postgres://u_boards:BcAZoYWsJbvE7RMgBPzxOCexPRVAq@localhost:5432/django_boards
```

以下是数据库URL的语法：postgres://`db_user`:`db_password`@`db_host`:`db_port`/`db_name`。

现在让我们迁移数据库，收集静态文件并创建一个超级用户：

```bash
cd django-beginners-guide
```

```python
python manage.py migrate

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
  Applying boards.0002_auto_20170917_1618... OK
  Applying boards.0003_topic_views... OK
  Applying sessions.0001_initial... OK

```

现在静态文件：

```python
python manage.py collectstatic

Copying '/home/boards/django-beginners-guide/static/js/jquery-3.2.1.min.js'
Copying '/home/boards/django-beginners-guide/static/js/popper.min.js'
Copying '/home/boards/django-beginners-guide/static/js/bootstrap.min.js'
Copying '/home/boards/django-beginners-guide/static/js/simplemde.min.js'
Copying '/home/boards/django-beginners-guide/static/css/app.css'
Copying '/home/boards/django-beginners-guide/static/css/bootstrap.min.css'
Copying '/home/boards/django-beginners-guide/static/css/accounts.css'
Copying '/home/boards/django-beginners-guide/static/css/simplemde.min.css'
Copying '/home/boards/django-beginners-guide/static/img/avatar.svg'
Copying '/home/boards/django-beginners-guide/static/img/shattered.png'
...
```

此命令将所有静态资产复制到外部目录，NGINX可以在该目录中为我们提供文件。稍后会详细介绍。

现在为应用程序创建一个超级用户：

```python
python manage.py createsuperuser
```


#### 配置Gunicorn（Configuring Gunicorn）

Gunicorn是负责在代理服务器后面执行Django代码的工具。

在**/home/boards**中创建一个名为**gunicorn_start**的新文件：

```bash
#!/bin/bash

NAME="django_boards"
DIR=/home/boards/django-beginners-guide
USER=boards
GROUP=boards
WORKERS=3
BIND=unix:/home/boards/run/gunicorn.sock
DJANGO_SETTINGS_MODULE=myproject.settings
DJANGO_WSGI_MODULE=myproject.wsgi
LOG_LEVEL=error

cd $DIR
source ../venv/bin/activate

export DJANGO_SETTINGS_MODULE=$DJANGO_SETTINGS_MODULE
export PYTHONPATH=$DIR:$PYTHONPATH

exec ../venv/bin/gunicorn ${DJANGO_WSGI_MODULE}:application \
  --name $NAME \
  --workers $WORKERS \
  --user=$USER \
  --group=$GROUP \
  --bind=$BIND \
  --log-level=$LOG_LEVEL \
  --log-file=-
  
```

此脚本将启动应用程序服务器。我们提供了一些信息，例如Django项目的位置，用于运行服务器的应用程序用户等等。

现在让这个文件可执行：

```bash
chmod u+x gunicorn_start
```

创建两个空文件夹，一个用于套接字文件，另一个用于存储日志：

```bash
mkdir run logs
```

现在**/home/boards**里面的目录结构应该是这样的：

```bash
django-beginners-guide/
gunicorn_start
logs/
run/
staticfiles/
venv/
```

其中**staticfiles**文件夹由创建**collectstatic**命令。

#### 配置Supervisor（Configuring Supervisor）

首先，在 **/home/boards/logs/** 文件夹中创建一个空的日志文件：

```bash
touch logs/gunicorn.log
```

现在创建一个新的supervisor文件：

```bash
sudo vim /etc/supervisor/conf.d/boards.conf
```

```bash
[program:boards]
command=/home/boards/gunicorn_start
user=boards
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/home/boards/logs/gunicorn.log
```

保存文件并运行以下命令：
```
sudo supervisorctl reread
sudo supervisorctl update
```

现在检查状态：

```bash
sudo supervisorctl status boards
```

```bash
boards        RUNNING   pid 308, uptime 0:00:07
```


#### 配置NGINX（Configuring NGINX）

下一步是设置NGINX服务器以提供静态文件并将请求传递给Gunicorn：

在 **/etc/nginx/sites-available/** 中添加一个名为**boards**的新配置文件：


```bash
upstream app_server {
    server unix:/home/boards/run/gunicorn.sock fail_timeout=0;
}

server {
    listen 80;
    server_name www.djangoboards.com;  # here can also be the IP address of the server

    keepalive_timeout 5;
    client_max_body_size 4G;

    access_log /home/boards/logs/nginx-access.log;
    error_log /home/boards/logs/nginx-error.log;

    location /static/ {
        alias /home/boards/staticfiles/;
    }

    # checks for static file, if not found proxy to app
    location / {
        try_files $uri @proxy_to_app;
    }

    location @proxy_to_app {
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $http_host;
      proxy_redirect off;
      proxy_pass http://app_server;
    }
}
```

创建指向已启用站点的文件夹的引用链接：

```bash
sudo ln -s /etc/nginx/sites-available/boards /etc/nginx/sites-enabled/boards
```

删除默认的NGINX网站：

```bash
sudo rm /etc/nginx/sites-enabled/default
```

重启NGINX服务：

```bash
sudo service nginx restart
```

此时，如果DNS已经生效，则可能通过URL www.djangoboards.com 访问该网站。

![7-django-boards.png](./statics/7-django-boards.png)

### 配置电子邮件服务（Configuring an Email Service）

入门使用的最佳选择之一是 [Mailgun](https://www.mailgun.com/)。它提供了一个非常可靠的免费计划，每月包含12,000封电子邮件。

注册一个免费帐户。然后按照步骤操作，这非常简单。您必须与您注册域名的服务一起使用。在我的例子中，它是 [Namecheap](https://namecheap.pxf.io/c/477033/386170/5618)。

点击添加域以向您的帐户添加新域。按照说明操作，确保使用 “mg.” 子域名：
![7-mailgun-add-domain.png](./statics/7-mailgun-add-domain.png)

现在抓取第一组DNS记录，它是两个TXT记录：
![7-mailgun-add-NDS-Records.png](./statics/7-mailgun-add-NDS-Records.png)

使用您的注册商提供的网络界面将其添加到您的域中：
![7-DNS-List-Add-mail-record.png](./statics/7-DNS-List-Add-mail-record.png)

重复上述步骤，对MX记录做同样的事情：
![7-DNS-list-MX-record.png](./statics/7-DNS-list-MX-record.png)

将它们添加到域中：
![7-DNS-list-add-MX-Record.png](./statics/7-DNS-list-add-MX-Record.png)

现在这一步不是强制性的，但由于我们已经在这里，所以也配置一下：
![7-Add-DNS-Records-For-Tracking.png](./statics/7-Add-DNS-Records-For-Tracking.png)

![7-DNS-add-CNAME-Record.png](./statics/7-DNS-add-CNAME-Record.png)

添加所有DNS记录后，单击“立即检查DNS记录”按钮：
![7-Domain-Verfication-Check-DNS-Recodrds.png](./statics/7-Domain-Verfication-Check-DNS-Recodrds.png)

现在我们需要有一些耐心。有时需要一段时间来验证DNS。

同时，我们可以配置应用程序以接收连接参数。

**myproject/settings.py**


```python
EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = config('EMAIL_HOST', default='')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)

DEFAULT_FROM_EMAIL = 'Django Boards <noreply@djangoboards.com>'
EMAIL_SUBJECT_PREFIX = '[Django Boards] '
```


然后，我的本地计算机**.env**文件将如下所示：


```bash
SECRET_KEY=rqr_cjv4igscyu8&&(0ce(=sy=f2)p=f_wn&@0xsp7m$@!kp=d
DEBUG=True
ALLOWED_HOSTS=.localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

我的线上（云服务器）**.env**文件看起来像这样：

```bash
SECRET_KEY=rqr_cjv4igscyu8&&(0ce(=sy=f2)p=f_wn&@0xsp7m$@!kp=d
ALLOWED_HOSTS=.djangoboards.com
DATABASE_URL=postgres://u_boards:BcAZoYWsJbvE7RMgBPzxOCexPRVAq@localhost:5432/django_boards
EMAIL_HOST=smtp.mailgun.org
EMAIL_HOST_USER=postmaster@mg.djangoboards.com
EMAIL_HOST_PASSWORD=ED2vmrnGTM1Rdwlhazyhxxcd0F
```

您可以在Mailgun 的**the Domain Information**（域信息）部分中找到您的凭据。

- EMAIL_HOST: SMTP Hostname（SMTP主机名）
- EMAIL_HOST_USER: Default SMTP Login（默认SMTP登录）
- EMAIL_HOST_PASSWORD: Default Password（默认密码）

我们可以在线上服务器中测试新设置。在本地计算机上的**settings.py**文件中进行更改，将更改提交到远程仓库。然后，在服务器中拉出新代码并重新启动Gunicorn进程：

```git
git pull
```

使用电子邮件凭据编辑**.env**文件。

然后重启Gunicorn进程：

```bash
sudo supervisorctl restart boards
```

现在我们可以尝试测试重置密码的邮件流程：
![7-Email-Please-reset-your-password.png](./statics/7-Email-Please-reset-your-password.png)

在Mailgun仪表板上，您可以获得有关电子邮件传递的一些统计信息：
![7-Email-Mailgun-Message-Delivery.png](./statics/7-Email-Mailgun-Message-Delivery.png)

### 配置HTTPS证书（Configuring HTTPS Certificate）

现在让我们使用 [Let's Encrypt](https://letsencrypt.org/) 提供的一个很好的HTTPS证书来提高我们的应用程序的安全性。

设置HTTPS从未如此简单。更好的是，我们现在可以免费获得它。他们提供了一个名为**certbot**的解决方案 ，负责为我们安装和更新证书。这非常简单：

```bash
sudo apt-get update
sudo apt-get install software-properties-common
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install python-certbot-nginx
```

现在安装证书：

```bash
sudo certbot --nginx
```

只需按照提示操作即可。当被问及：

```bash
Please choose whether or not to redirect HTTP traffic to HTTPS, removing HTTP access.

```

选择`2`将所有HTTP流量重定向到HTTPS。

有了这个，该网站已经通过HTTPS提供服务：

![7-Let's-Encrypt-certbot-Https.png](./statics/7-Let's-Encrypt-certbot-Https.png)

设置证书的自动续订。运行以下命令编辑crontab文件：
```bash
sudo crontab -e
```

将以下行添加到文件末尾：
```bash
0 4 * * * /usr/bin/certbot renew --quiet
```

该命令将每天凌晨4点运行。所有在30天内到期的证书将自动续订。


### 总结（Conclusions）

非常感谢所有关注本系列教程的人，给予评论和反馈！我真的很感激！这是该系列的最后一篇教程。我希望你喜欢它！

尽管这是教程系列的最后一部分，但我还是计划编写一些后续教程来探索其他有趣的主题，例如数据库优化以及在我们目前拥有的内容之上添加更多功能。

顺便说一句，如果您有兴趣为项目做出贡献，很少有人愿意免费提交`pull`请求！该项目的源代码可在GitHub上获得：[https://github.com/sibtc/django-beginners-guide/](https://github.com/sibtc/django-beginners-guide/)

另外，请告诉我您还想看到的其他内容！:-)
