# Git 入门 · 避坑 · 速查完全指南

> 参考资料：
>
> - [Pro Git 第二版（中文）· 起步 — 安装 Git](https://git-scm.com/book/zh/v2/%E8%B5%B7%E6%AD%A5-%E5%AE%89%E8%A3%85-Git)
> - [Pro Git 第二版（中文）· 全书](https://git-scm.com/book/zh/v2)
> - [Git 官方 · GUI Clients（图形界面客户端）](https://git-scm.com/tools/guis)
>
> 面向角色：**刚接触 Git 的新手**、**会基本操作但经常「把仓库搞坏」的开发者**，以及**需要一份命令速查表的熟练用户**。
> 本文是三合一文档：① 从安装到推送远程的**入门路径**；② 覆盖 `commit` / `push` 撤销、分支、冲突、换行符的**避坑与注意事项**；③ 可直接检索复制的**快速查询清单**。
> 命令以 Git 2.23+ 为准（`git switch` / `git restore`），同时给出旧版等价写法；示例中的 `<...>` 为需要替换的占位内容。

---

## 目录

- [一、Git 核心模型与提交链路](#一、git-核心模型与提交链路)
- [二、安装 Git 与首次配置](#二、安装-git-与首次配置)
- [三、从初始化到推送远程仓库的完整流程](#三、从初始化到推送远程仓库的完整流程)
- [四、提交代码的各种情况](#四、提交代码的各种情况)
- [五、新建分支并推送到远程](#五、新建分支并推送到远程)
- [六、撤销 commit 提交](#六、撤销-commit-提交)
- [七、撤销已 push 的提交](#七、撤销已-push-的提交)
- [八、避坑与注意事项](#八、避坑与注意事项)
- [九、免费图形界面客户端](#九、免费图形界面客户端)
- [十、快速查询清单](#十、快速查询清单)
- [十一、常见场景速查](#十一、常见场景速查)
- [十二、常见误区与 FAQ](#十二、常见误区与-faq)
- [附录：名词与状态对照表](#附录-名词与状态对照表)

---

## 一、Git 核心模型与提交链路

### 1.1 三个区域

Git 的所有操作，本质上都是「在三个区域之间搬数据」：

| 区域                           | 说明                                     | 对应物理位置      |
| ------------------------------ | ---------------------------------------- | ----------------- |
| 工作区（Working Tree）         | 你正在编辑的文件，就是磁盘上看到的内容   | 项目目录          |
| 暂存区（Staging Area / Index） | 下一次提交**打算包含**的改动清单         | `.git/index`      |
| 版本库（Repository / `.git`）  | 已提交的历史快照，按 commit 串成一条链表 | `.git/objects` 等 |

数据在三个区域之间搬动，只有下面两条主链路，其余操作都是它们的组合：

**正向 · 把改动往上送**

工作区 → `git add <file>` → 暂存区 → `git commit -m "…"` → 本地版本库 → `git push origin <分支>` → 远程仓库

**反向 · 把改动收回来或丢掉**

- 暂存区 → `git restore --staged <file>` → 工作区：取消暂存，改动仍然保留；
- 本地版本库 → `git restore --source=HEAD~2 -- <file>` → 工作区：用历史版本覆盖工作区文件；若写成 `git restore <file>`，则由最近一次提交覆盖，工作区改动即丢失；
- 远程仓库 → `git fetch` → 本地版本库：只更新本地记录的远程位置（`origin/xxx`），不动工作区；`git pull` 相当于 `fetch` 之后再 `merge`（或 `rebase`）一次；
- 本地版本库内部：`git reset --soft` / `--mixed` / `--hard HEAD~1` 把分支指针往回挪一位，三种力度对应「改动留在暂存区 / 回到工作区 / 直接丢掉」（见第六章）。

把这两条链路拆成一次一次的操作，就是下面这张表：

| 操作               | 数据流向                       | 命令                                     | 结果                                    |
| ------------------ | ------------------------------ | ---------------------------------------- | --------------------------------------- |
| 暂存               | 工作区 → 暂存区                | `git add <file>`                         | 文件当前内容进入下一次提交              |
| 取消暂存           | 暂存区 → 工作区                | `git restore --staged <file>`            | 改动保留，只是不再等待提交              |
| 丢弃工作区改动     | 工作区被最近一次提交覆盖       | `git restore <file>`                     | 改动立即丢失，不可恢复（见 4.3）        |
| 提交               | 暂存区 → 本地版本库            | `git commit -m "…"`                      | 生成一次提交，分支指针前移              |
| 推送               | 本地版本库 → 远程仓库          | `git push`                               | 远程收到本地已有的提交                  |
| 拉取（只更新引用） | 远程仓库 → 本地版本库          | `git fetch`                              | 只更新 `origin/xxx`，工作区不动         |
| 拉取并合并         | 远程仓库 → 本地版本库 + 工作区 | `git pull`                               | 相当于 `fetch` + `merge`（或 `rebase`） |
| 撤销提交           | 本地版本库内部指针回退         | `git reset --soft/--mixed/--hard HEAD~1` | 三种力度，见第六章                      |
| 反悔已推送的提交   | 版本库新增一条反向提交         | `git revert <sha>`                       | 不改写历史，见第七章                    |

> 提示：本节不采用 `text` 字符画来画流程图——中文、制表符与英文在编辑器、浏览器以及不同等宽字体下的宽度比例并不一致，源码与页面很容易错位；改用「链路描述 + 操作表」后，任何环境下显示都一致，命令也更好复制。

**关键认知**：`commit` 只提交**暂存区里的东西**，没 `add` 过的改动不会进提交；`push` 只推送**本地已有的 commit**，没提交的改动不会上远程。绝大多数「我以为提交了」的翻车，都源于这一条没分清。

### 1.2 文件的四种状态

| 状态                     | 含义                           | `git status` 里的表现                   |
| ------------------------ | ------------------------------ | --------------------------------------- |
| 未跟踪（Untracked）      | 新文件，Git 还没管过它         | `Untracked files`                       |
| 已修改未暂存（Modified） | 已跟踪文件被改了，还没 `add`   | `Changes not staged for commit`         |
| 已暂存（Staged）         | 改动已进暂存区，等待 `commit`  | `Changes to be committed`               |
| 已提交（Committed）      | 已进版本库，工作区与版本库一致 | `nothing to commit, working tree clean` |

### 1.3 HEAD 与提交的相对引用

| 写法          | 含义                                              |
| ------------- | ------------------------------------------------- |
| `HEAD`        | 当前所在的提交（通常是当前分支的最新提交）        |
| `HEAD~1`      | 上一个提交（往回数 1 个，`HEAD~3` 即往回数 3 个） |
| `HEAD^`       | 父提交；合并提交用 `HEAD^1`（第一父）、`HEAD^2`   |
| `<sha>`       | 某个提交的完整或前 7 位哈希                       |
| `origin/main` | 远程 `origin` 上 `main` 分支在本地记录的最后位置  |

> 几乎所有「撤销」操作，都是「把分支指针（或文件）重新指向某个提交」，历史本身不会立刻消失——这正是第六章能救回代码的原因。

---

## 二、安装 Git 与首次配置

### 2.1 Windows

三种方式任选其一：

| 方式         | 做法                                                                                                                                                            | 适用                    |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| 官方安装包   | [git-scm.com/download/win](https://git-scm.com/download/win) 下载后一路下一步                                                                                   | 新手首选，自带 Git Bash |
| 包管理器     | `winget install --id Git.Git -e --source winget`，或 `choco install git`                                                                                        | 习惯命令行的用户        |
| 国内镜像加速 | [registry.npmmirror.com/binary.html?path=git-for-windows/](https://registry.npmmirror.com/binary.html?path=git-for-windows/) 选版本下的 `Git-<版本>-64-bit.exe` | 官网下载慢时            |

安装向导里几个**值得留意**的选项：

| 选项                             | 建议                                                                        |
| -------------------------------- | --------------------------------------------------------------------------- |
| 默认编辑器                       | 选熟悉的（VS Code / Vim / Nano），不确定就保持 Vim 也行                     |
| 调整 PATH（PATH environment）    | 选 **Git from the command line and also from 3rd-party software**           |
| 换行符转换（line ending）        | 选 **Checkout Windows-style, commit Unix-style**（即 `core.autocrlf=true`） |
| 终端模拟器                       | 选 **Use MinTTY**（Git Bash 体验更好）                                      |
| 默认分支名（new default branch） | 选 **Override…main**（与 GitHub / GitLab 默认一致）                         |

> 官方说明：Windows 上的安装包来自独立项目 **Git for Windows**；装 GitHub Desktop 也会一并带上命令行版 Git、凭证缓存与合理的换行设置。

### 2.2 macOS

```bash
# 方式一：最简单 —— 首次运行 git 会提示安装 Xcode Command Line Tools
git --version

# 方式二：Homebrew（推荐，便于升级）
brew install git

# 方式三：官方安装包
# https://git-scm.com/download/mac
```

### 2.3 Linux

```bash
# Debian / Ubuntu
sudo apt update && sudo apt install git-all

# Fedora / RHEL / CentOS（RHEL 系需先启用 EPEL）
sudo dnf install git-all

# Arch / Manjaro
sudo pacman -S git
```

发行版源的 Git 版本往往偏旧，需要最新版可从源码编译（依赖 `autotools`、`curl`、`zlib`、`openssl`、`expat`、`libiconv`）：

```bash
tar -zxf git-<版本>.tar.gz
cd git-<版本>
make configure
./configure --prefix=/usr
make all doc info
sudo make install install-doc install-html install-info
```

### 2.4 验证安装与升级

```bash
git --version          # 查看版本
git --version          # 输出形如 git version 2.48.1
git help <命令>        # 例：git help reset（本地文档）
git <命令> -h          # 快速参数一览

# Windows（Git for Windows）自带升级命令
git update-git-for-windows
```

### 2.5 首次必做配置（一次性）

装完**立刻**做，否则第一次提交会报身份未知或使用默认的 `master` 分支：

```bash
# 身份（会写进每一次提交，必须与代码托管平台账号对应）
git config --global user.name "你的名字"
git config --global user.email "you@example.com"

# 新仓库默认分支名（Git 2.28+）
git config --global init.defaultBranch main

# 默认编辑器（以 VS Code 为例，--wait 表示等窗口关闭再返回）
git config --global core.editor "code --wait"

# 换行符：Windows 设 true，macOS / Linux 设 input
git config --global core.autocrlf true

# 明确 pull 的行为：false=merge（默认），true=rebase，only=仅允许快进
git config --global pull.rebase false

# 首次 push 自动建立上游分支（Git 2.37+，省掉每次写 -u）
git config --global push.autoSetupRemote true

# 让 git status 正常显示中文路径，而不是 \344\275\240 这类转义
git config --global core.quotepath false
```

常用别名（可选，能省很多打字）：

```bash
git config --global alias.st "status -sb"
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.lg "log --oneline --graph --decorate --all"
git config --global alias.last "log -1 --stat"
```

### 2.6 配置层级与查看方式

| 层级   | 参数       | 文件位置                                                | 作用范围         |
| ------ | ---------- | ------------------------------------------------------- | ---------------- |
| system | `--system` | `/etc/gitconfig`（Windows 为 Git 安装目录下）           | 本机所有用户     |
| global | `--global` | `~/.gitconfig`（Windows 为 `C:\Users\<你>\.gitconfig`） | 当前用户所有仓库 |
| local  | `--local`  | `<仓库>/.git/config`                                    | 仅当前仓库       |

优先级：**local > global > system**（就近覆盖）。

```bash
git config --list --show-origin   # 列出全部配置并标明来源文件（排错神器）
git config user.email             # 查看某一项实际生效值
git config --global --unset <key> # 删除某项配置
```

---

## 三、从初始化到推送远程仓库的完整流程

### 3.1 场景 A：本地已有项目 → 推到新远程仓库

```bash
cd <项目目录>

# 1. 初始化仓库（-b 指定初始分支名；旧版也可 git init 后 git branch -M main）
git init -b main

# 2. 先写好忽略规则，避免把 node_modules / .env 提交进去（见 4.7）
#    .gitignore 内容示例见下方

# 3. 查看状态：确认哪些文件会被纳入
git status

# 4. 加入暂存区
git add .

# 5. 提交到本地版本库
git commit -m "feat: 初始化项目"

# 6. 关联远程仓库（先在 GitHub / GitLab / Gitee 上创建空仓库，不要勾选初始化 README）
git remote add origin git@github.com:<用户名>/<仓库名>.git

# 7. 确认远程地址
git remote -v

# 8. 首次推送并建立上游跟踪关系
git push -u origin main

# 之后再次推送，只需：
git push
```

`.gitignore` 起步示例（Node.js / 前端项目）：

```text
node_modules/
dist/
build/
.env
.env.local
*.log
.DS_Store
.idea/
.vscode/*
!.vscode/extensions.json
```

### 3.2 场景 B：远程已有仓库 → 克隆到本地再提交

```bash
# 1. 克隆（默认只拉 main，并把远程命名为 origin）
git clone git@github.com:<用户名>/<仓库名>.git
cd <仓库名>

# 2. 建分支再改代码，永远不要直接提交到 main（见第五章）
git switch -c feature/user-login

# 3. 改代码 → 检查 → 提交
git status
git diff                  # 看工作区改动
git add <文件>            # 或 git add .
git commit -m "feat(login): 新增用户登录表单"

# 4. 推送分支
git push -u origin feature/user-login

# 5. 在平台上发起 Pull Request / Merge Request 合并回 main
```

### 3.3 每一步在做什么

| 步骤     | 命令                   | 发生了什么                                            |
| -------- | ---------------------- | ----------------------------------------------------- |
| 初始化   | `git init`             | 生成 `.git` 目录，当前目录变成仓库                    |
| 克隆     | `git clone <url>`      | 下载整个历史 + 自动添加 `origin` + 检出默认分支       |
| 查看状态 | `git status`           | 只读操作，列出未跟踪 / 未暂存 / 已暂存的文件          |
| 暂存     | `git add <path>`       | 把文件的当前内容写进暂存区                            |
| 提交     | `git commit -m "..."`  | 用暂存区内容生成一个 commit 对象，分支指针前移        |
| 关联远程 | `git remote add`       | 只是在 `.git/config` 里记一条地址映射，不产生网络请求 |
| 推送     | `git push -u origin x` | 上传本地 commit，并把本地分支与远程分支绑定（`-u`）   |

### 3.4 认证方式：HTTPS 与 SSH

| 方式  | 远程地址形式                           | 凭证                            | 备注                                          |
| ----- | -------------------------------------- | ------------------------------- | --------------------------------------------- |
| HTTPS | `https://github.com/<用户>/<仓库>.git` | 个人访问令牌（PAT）+ 凭证管理器 | 防火墙友好；GitHub 自 2021 起不再接受账号密码 |
| SSH   | `git@github.com:<用户>/<仓库>.git`     | 本地私钥 + 平台登记的公钥       | 配一次长期免密；公司网络限端口时需走 443      |

生成并登记 SSH 密钥：

```bash
# 1. 生成（ed25519 优先；老系统用 ssh-keygen -t rsa -b 4096 -C "..."）
ssh-keygen -t ed25519 -C "you@example.com"

# 2. 复制公钥内容，粘贴到平台的 SSH Keys 设置页
cat ~/.ssh/id_ed25519.pub

# 3. 验证连通性
ssh -T git@github.com
```

Windows 上让 ssh-agent 记住私钥（PowerShell，管理员）：

```powershell
Get-Service ssh-agent | Set-Service -StartupType Automatic
Start-Service ssh-agent
ssh-add $env:USERPROFILE\.ssh\id_ed25519
```

HTTPS 凭证交给凭证管理器，避免每次输入令牌：

```bash
# Windows：Git for Windows 自带 Git Credential Manager
git config --global credential.helper manager

# macOS：交给系统钥匙串
git config --global credential.helper osxkeychain

# Linux：临时缓存 1 小时（也可用 libsecret）
git config --global credential.helper "cache --timeout=3600"
```

### 3.5 首次推送常见报错与处理

| 报错                                              | 原因                                 | 处理                                                  |
| ------------------------------------------------- | ------------------------------------ | ----------------------------------------------------- |
| `fatal: remote origin already exists`             | 已关联过远程                         | `git remote set-url origin <新地址>`                  |
| `error: src refspec main does not match any`      | 本地无 commit，或本地分支不叫 `main` | 先 `git commit`；或 `git branch -M main` 改名后再推送 |
| `! [rejected] ... non-fast-forward`               | 远程有你本地没有的提交               | 先 `git pull --rebase origin main`，再 `git push`     |
| `Permission denied (publickey)`                   | SSH 公钥未登记或私钥未加载           | 检查 `ssh -T` 与 `ssh-add -l`                         |
| `Support for password authentication was removed` | 仍用账号密码走 HTTPS                 | 改用 PAT 或 SSH                                       |
| `fatal: unable to access ... Failed to connect`   | 网络 / 代理 / 端口被拦               | 检查代理配置（见 8.12）；SSH 可改走 443 端口          |

---

## 四、提交代码的各种情况

「提交代码」不是只有 `git add . && git commit -m`，先看清自己处于哪种情况：

| 你的情况                                 | 该用的命令                                        | 结果                                         |
| ---------------------------------------- | ------------------------------------------------- | -------------------------------------------- |
| 新增 + 修改 + 删除，全部要提交           | `git add -A`                                      | 工作区所有变化进暂存区（含删除）             |
| 只提交当前目录及子目录的变化             | `git add .`                                       | 不含上层目录；**不**含被 `.gitignore` 的文件 |
| 只提交已跟踪文件的修改与删除             | `git add -u`                                      | 不添加新文件                                 |
| 只提交某几个文件                         | `git add src/a.ts src/b.ts`                       | 精确控制                                     |
| 一个文件里只想提交部分改动               | `git add -p <file>`                               | 逐块（hunk）选择，`y/n/s/e` 交互             |
| 改完了发现漏了一个文件，想并入上一次提交 | `git add <file>` + `git commit --amend --no-edit` | 上一次提交被替换（未 push 时安全）           |
| 上一次提交信息写错了                     | `git commit --amend -m "新信息"`                  | 仅改信息（未 push 时安全）                   |
| 上一次提交要彻底重做（含删掉某文件）     | `git reset --soft HEAD~1` → 改 → 重新 `commit`    | 改动保留在暂存区                             |
| 改到一半必须切分支                       | `git stash push -m "wip"`                         | 工作区变干净，之后 `git stash pop` 取回      |
| 想跳过 lint / 钩子强推提交               | `git commit --no-verify -m "..."`                 | **不推荐**，等于绕过质量门禁                 |
| 需要一条空提交触发 CI                    | `git commit --allow-empty -m "ci: trigger"`       | 无内容改动                                   |

### 4.1 `git add .` 与 `git add -A` 的区别

- Git 2.x 中，在**仓库根目录**执行两者效果一致；
- 在**子目录**执行时，`.` 只作用于当前目录及其子目录，`-A` 作用于整个工作区；
- 两者都不会添加被 `.gitignore` 忽略的文件（除非用 `git add -f`）。

### 4.2 部分提交（最实用但最少人用）

```bash
git add -p src/app.ts
# y 暂存该块   n 跳过     s 拆分成更小的块
# e 手动编辑   q 退出     a 暂存该文件剩余全部
git diff --cached     # 提交前确认暂存区内容
git commit -m "fix(app): 修正登录态判断"
```

### 4.3 撤销「暂存」与撤销「工作区改动」

```bash
# 把文件从暂存区撤回到工作区（改动还在）
git restore --staged <file>        # Git 2.23+
git reset HEAD <file>              # 旧版等价写法

# 丢弃工作区里未暂存的改动（不可恢复，慎用）
git restore <file>                 # Git 2.23+
git checkout -- <file>             # 旧版等价写法

# 删除未跟踪的文件与目录（先预演再执行）
git clean -n -d                    # 只打印将要删除的内容
git clean -f -d                    # 真删，-fd 不可恢复
```

### 4.4 提交信息规范（Conventional Commits）

推荐格式：`<类型>(<可选作用域>): <简短描述>`

| 类型       | 含义                       | 例子                                   |
| ---------- | -------------------------- | -------------------------------------- |
| `feat`     | 新功能                     | `feat(login): 新增短信验证码登录`      |
| `fix`      | 修复缺陷                   | `fix(cart): 修复数量为 0 时的总价错误` |
| `docs`     | 仅文档改动                 | `docs(readme): 补充安装步骤`           |
| `style`    | 格式调整，不影响逻辑       | `style: 统一分号风格`                  |
| `refactor` | 重构，既不加功能也不修 bug | `refactor(user): 抽出权限判断工具函数` |
| `perf`     | 性能优化                   | `perf(list): 虚拟滚动减少渲染节点`     |
| `test`     | 测试相关                   | `test(order): 补充下单流程用例`        |
| `build`    | 构建 / 依赖                | `build: 升级 vite 到 5.4`              |
| `ci`       | 流水线配置                 | `ci: 增加 node 20 构建任务`            |
| `chore`    | 杂项                       | `chore: 更新 .gitignore`               |
| `revert`   | 回滚某次提交               | `revert: 回滚 feat(login): ...`        |

原则：**一次提交只做一件事**。混在一起的改动会让 `revert`、`cherry-pick`、`bisect` 全部失效。

### 4.5 提交前自检三步

```bash
git status            # 有没有多余文件（.env、日志、dist）
git diff --cached     # 暂存区里到底有什么（提交前最后一眼）
git diff              # 还有哪些改动没暂存
```

### 4.6 提交后才发现写错了：分清「已 push」与「未 push」

| 是否已 push | 可用手段                                 | 说明                               |
| ----------- | ---------------------------------------- | ---------------------------------- |
| 未 push     | `--amend`、`reset --soft/--mixed/--hard` | 只动本地历史，安全                 |
| 已 push     | `revert`（推荐）或 `reset` + 强推        | 动到公共历史，见第七章，必须先沟通 |

### 4.7 `.gitignore` 的正确用法

`.gitignore` 是一份**按行书写的忽略规则清单**，用来告诉 Git「哪些未跟踪文件不该进版本库」。它必须**跟仓库一起提交**（否则对同事无效），可以放在仓库根目录，也可以放在任意子目录里（只对那个目录及其子目录生效）。

#### 4.7.1 三种忽略文件，别混用

| 文件                        | 位置                         | 作用范围         | 是否随仓库分发    |
| --------------------------- | ---------------------------- | ---------------- | ----------------- |
| `.gitignore`                | 仓库根目录 / 任意子目录      | 该目录及其子目录 | ✅ 提交，团队共享 |
| `.git/info/exclude`         | 项目内，但 `.git` 不会被提交 | 仅本仓库         | ❌ 私有，只对自己 |
| `core.excludesFile`（全局） | `~/.gitignore_global` 之类   | 本机**所有**仓库 | ❌ 私有，只对自己 |

判断口径：

- 规则**整个团队都该遵守**（`node_modules/`、`dist/`、`.env`）→ 写进项目 `.gitignore`；
- 只是**你自己的编辑器/系统癖好**（`.idea/`、`.vscode/`、`Thumbs.db`）→ 写进 `.git/info/exclude` 或全局文件，别污染别人的仓库；
- 全局忽略的配置方式与查看方式见本文 4.7.7。

```bash
# 全局忽略（一次配置，本机所有仓库生效）
git config --global core.excludesfile ~/.gitignore_global

# 仅本仓库、不进版本库的忽略
echo ".local-notes/" >> .git/info/exclude
```

#### 4.7.2 语法速查

| 写法             | 含义                                                                    |
| ---------------- | ----------------------------------------------------------------------- |
| `# 注释`         | 以 `#` 开头即注释；要忽略「真的以 `#` 开头」的文件，写成 `\#file`       |
| `空行`           | 只是分隔符，无实际作用                                                  |
| `*.log`          | 忽略所有层级下的 `.log` 文件（`*` **不跨越** `/`）                      |
| `!important.log` | 取反：把此前被忽略的文件重新纳入跟踪                                    |
| `dir/`           | 末尾斜杠 = **只匹配目录**，不匹配同名普通文件                           |
| `/config.json`   | 前导斜杠 = **只匹配 `.gitignore` 所在目录**下的 `config.json`（根目录） |
| `config.json`    | 不带斜杠 = 匹配**任意层级**下的同名文件或目录                           |
| `config/*.json`  | 路径中间出现斜杠 = 相对 `.gitignore` 所在目录的路径，`*` 仍不跨 `/`     |
| `**/build/`      | `**` 匹配**任意多级**目录 → 忽略任意位置的 `build` 目录                 |
| `logs/**`        | `logs` 目录下的**一切**（含任意深度）                                   |
| `doc/**/*.pdf`   | `doc` 的任意深度子目录里的 `.pdf`（也包含 `doc` 直接子级）              |
| `?.log`          | `?` 匹配**单个**字符：`a.log` 命中，`ab.log` 不命中                     |
| `[0-9].log`      | 字符范围：`1.log` 命中                                                  |
| `[!0-9].log`     | 字符范围取反：`a.log` 命中（方括号内 `!` 表示「非」）                   |
| 行尾空格         | 默认被忽略；真要匹配「名字以空格结尾」的文件，需在空格前加 `\` 转义     |

#### 4.7.3 一个能直接用的完整示例

```text
# ===== 依赖与构建产物 =====
node_modules/
dist/                # 不带前导斜杠：任意层级的同名目录都会命中
build/
*.tsbuildinfo

# ===== 环境变量与密钥（永远不要提交）=====
.env
.env.local
.env.*.local
*.pem
*.key

# ===== 日志与临时文件 =====
*.log
npm-debug.log*
logs/
*.tmp

# ===== 编辑器 / IDE =====
.vscode/*
!.vscode/extensions.json    # 只保留推荐扩展清单，便于团队统一
!.vscode/settings.json      # 需要共享的工作区设置
.idea/
*.suo
*.swp

# ===== 操作系统 =====
.DS_Store
Thumbs.db
Desktop.ini

# ===== 只忽略根目录下的本地配置 =====
/config.local.json
```

#### 4.7.4 两条最容易踩的规则

**① 顺序敏感：后写的规则覆盖先写的。** Git 自上而下逐行匹配，**最后一条命中的规则说了算**：

```text
*.log          # 先忽略所有日志
!keep.log      # 再单独把 keep.log 找回来（必须写在下面才生效）
```

**② 父目录被排除后，子文件的 `!` 取反无效。** Git 出于性能不会进入被排除的目录，因此「先 `*` 全忽略、再 `!` 找回某个深层文件」这种写法**不会**如你所愿。正确姿势是**逐级把父目录也找回来**：

```text
# ❌ 失效：dist 整个目录已被排除，Git 不会进去找 dist/keep.js
dist/
!dist/keep.js

# ✅ 正确：先排除目录内容、再放开目录本身，然后单独保留文件
dist/*
!dist/keep.js

# ✅ 常见变体：「只保留几个文件，其余全忽略」
/*
!/.gitignore
!/package.json
!/src/
```

#### 4.7.5 已跟踪的文件不会被 `.gitignore` 影响

`.gitignore` **只对未跟踪文件生效**。一个文件如果已经被 `commit` 过，往里加规则不会让它消失，必须先**取消跟踪**（保留磁盘文件）：

```bash
git rm --cached <file>            # 保留磁盘文件，只从版本库移除
git rm -r --cached <目录>         # 目录要加 -r，注意：会移除整个目录下的所有文件
# 然后把规则写进 .gitignore，再提交
git commit -m "chore: 停止跟踪 .env.local"
```

> 想「一次把某类文件全部停止跟踪」：`git rm -r --cached .` 清空暂存区索引，再 `git add .` 重新按新规则加入——改动前先 `git status` 确认影响面。
> `.gitignore` 不生效的其他原因（BOM、换行符、全局忽略命中）见 8.5。

#### 4.7.6 别从零手写：直接用官方模板

[github/gitignore](https://github.com/github/gitignore) 是 GitHub 官方维护的模板库，按语言 / 框架 / 编辑器 / 系统分文件；[gitignore.io](https://www.toptal.com/developers/gitignore) 则支持「勾选多个模板合成一份」。

```bash
# 取官方 Node 模板作为起点
curl -o .gitignore https://raw.githubusercontent.com/github/gitignore/main/Node.gitignore

# 常见组合：语言模板 + 系统 + 编辑器（直接追加，别覆盖）
cat Node.gitignore macOS.gitignore Windows.gitignore JetBrains.gitignore Global/Vim.gitignore >> .gitignore
```

| 常用模板                                             | 覆盖内容                                  |
| ---------------------------------------------------- | ----------------------------------------- |
| `Node.gitignore`                                     | `node_modules/`、npm/yarn/pnpm 日志与缓存 |
| `Python.gitignore`                                   | `__pycache__/`、`*.py[cod]`、虚拟环境目录 |
| `Java.gitignore` / `Maven.gitignore`                 | `target/`、`.class`、IDE 生成物           |
| `macOS.gitignore`                                    | `.DS_Store`、`.AppleDouble`               |
| `Windows.gitignore`                                  | `Thumbs.db`、`Desktop.ini`                |
| `JetBrains.gitignore` / `VisualStudioCode.gitignore` | `.idea/`、`.vscode/` 等                   |

> 模板只是**起点**：应用脚手架生成的 `dist/`、私有配置目录、本地数据库文件，仍需自己补进项目 `.gitignore`。

#### 4.7.7 其他要点与排查

- 全局忽略（不写进项目）：`git config --global core.excludesfile ~/.gitignore_global`；用 `git config --global core.excludesfile` 可查看当前生效路径；
- 查看某文件**为什么**被忽略（会打印命中的规则文件与行号，排查利器）：`git check-ignore -v <path>`；
- 想列出所有被忽略的文件：`git status --ignored`；
- 确实要提交被忽略的文件：`git add -f <file>`；
- `.gitignore` 自身也要提交（`git add .gitignore`），否则规则只在你自己机器上生效；文件请用 **UTF-8 无 BOM + LF 换行** 保存；
- 规则里的路径**永远用 `/`**，Windows 上也不要写 `\`。

---

## 五、新建分支并推送到远程

### 5.1 完整命令（最常用路径）

```bash
# 1. 先切到基准分支并更新到最新（避免从旧代码拉分支）
git switch main
git pull --rebase origin main

# 2. 新建并切换到分支
git switch -c feature/order-list      # Git 2.23+ 推荐
# 旧版等价：git checkout -b feature/order-list

# 3. 确认自己在哪
git status            # 输出 On branch feature/order-list
git branch -vv        # 查看分支与上游的跟踪关系

# 4. 改代码并提交
git add -A
git commit -m "feat(order): 新增订单列表页"

# 5. 首次推送并建立上游（-u = --set-upstream）
git push -u origin feature/order-list

# 6. 之后直接
git push
```

> 若已配置 `push.autoSetupRemote true`，第 5 步的 `-u` 可以省略，直接 `git push`。

### 5.2 分支相关的常用变体

```bash
git branch <name>                        # 只创建，不切换
git switch <name>                        # 只切换（已存在分支）
git switch -c <name> <起点>              # 从指定提交/分支创建，如 git switch -c hotfix/x origin/main
git switch -c <name> <远程分支>          # 拉取远程分支到本地并建立跟踪
git switch -                             # 回到上一个分支（相当于 cd -）

git branch -m <新名>                     # 重命名当前分支
git branch -m <旧名> <新名>              # 重命名其他分支

git branch -d <name>                     # 删除已合并的本地分支
git branch -D <name>                     # 强制删除未合并分支
git push origin -d <远程分支名>          # 删除远程分支（也可用 --delete）
git push origin :<远程分支名>            # 旧式写法，效果同上

git branch --set-upstream-to=origin/main # 给当前分支手动补上上游
git fetch --prune                        # 清理本地缓存的、远程已删除的分支记录
```

### 5.3 分支命名约定

| 前缀       | 用途             | 示例                     |
| ---------- | ---------------- | ------------------------ |
| `feature/` | 新功能           | `feature/user-login`     |
| `fix/`     | 缺陷修复         | `fix/order-total`        |
| `hotfix/`  | 线上紧急修复     | `hotfix/payment-timeout` |
| `release/` | 发布分支         | `release/v1.4.0`         |
| `docs/`    | 文档             | `docs/deploy-guide`      |
| `chore/`   | 依赖、配置等杂项 | `chore/bump-node-20`     |

### 5.4 常见坑

| 坑                             | 后果                                    | 正确做法                                                        |
| ------------------------------ | --------------------------------------- | --------------------------------------------------------------- |
| 忘了切分支，改动落在 `main` 上 | 污染主分支                              | 未提交：`git stash` → 切分支 → `git stash pop`；已提交：见 11.2 |
| 从旧代码拉分支                 | 合并时一堆冲突                          | 先 `git pull` 基准分支再建分支                                  |
| 首次推送忘了 `-u`              | 每次都要写全 `git push origin <branch>` | 补 `git push -u origin <branch>`，或配置 `push.autoSetupRemote` |
| 分支名本地与远程不一致         | 推送到了意料之外的分支                  | `git branch -vv` 确认跟踪关系                                   |
| 直接 `git push` 到共享分支     | 可能覆盖同事代码                        | 走 PR / MR，共享分支开保护                                      |

---

## 六、撤销 commit 提交

> 本章只讨论**还没 push**（或只在你自己本地）的提交。已 push 的请直接看第七章。

### 6.1 决策表：先选对命令

| 目标                                         | 命令                               | 改动去哪了                        | 危险度        |
| -------------------------------------------- | ---------------------------------- | --------------------------------- | ------------- |
| 撤销提交，**改动保留在暂存区**（可重新提交） | `git reset --soft HEAD~1`          | 暂存区（Changes to be committed） | 低            |
| 撤销提交，**改动回到工作区**（需重新 `add`） | `git reset --mixed HEAD~1`（默认） | 工作区（未暂存）                  | 低            |
| 撤销提交，**改动彻底丢弃**                   | `git reset --hard HEAD~1`          | 丢弃（仍可用 reflog 找回）        | **高**        |
| 只改最近一次提交的内容或信息                 | `git commit --amend`               | 合并进上一次提交                  | 低（未 push） |
| 再往前、且要保留后续提交                     | `git revert <sha>`                 | 生成一条反向提交                  | 低            |

三者的区别一句话：`--soft` 动指针不动文件；`--mixed` 动指针 + 清空暂存区；`--hard` 动指针 + 清空暂存区 + 覆盖工作区。

### 6.2 保留改动：撤销提交但代码还在

```bash
# 场景：刚提交完，发现提交信息写错 / 漏了文件 / 提交粒度不对

# 方案一：改动留在暂存区，重新提交
git reset --soft HEAD~1
git status            # 改动处于 Changes to be committed
git commit -m "fix(user): 正确的提交信息"

# 方案二：改动回到工作区，可以重新挑文件再提交
git reset --mixed HEAD~1     # --mixed 是默认参数，写 git reset HEAD~1 也一样
git status                   # 改动处于 Changes not staged for commit
git add -p
git commit -m "feat(user): 拆分提交"

# 方案三：只是漏了个文件，直接并入上一次提交（最省事）
git add <漏掉的文件>
git commit --amend --no-edit        # --no-edit 表示不改提交信息

# 方案四：只是提交信息写错
git commit --amend -m "feat(user): 正确的信息"
```

### 6.3 不保留改动：彻底丢弃

```bash
# 撤销最近一次提交，且工作区/暂存区的相关改动一并丢弃
git reset --hard HEAD~1

# 连续撤销 3 次提交
git reset --hard HEAD~3

# 把工作区彻底恢复到最近一次提交的状态（不移动分支指针，只清改动）
git reset --hard HEAD
```

> ⚠️ `--hard` 是新手最容易丢代码的命令。执行前务必满足其一：改动已 `commit`（可 reflog 找回）、已 `stash`、或确认真的不要了。
> 想先留个退路，就先建备份分支：`git branch backup/$(date +%s)`，再 `--hard`。

### 6.4 误操作后的救命稻草：reflog

`reflog` 记录了本地 HEAD 与分支指针的每一次移动，默认保留 90 天（未被 gc 前）：

```bash
git reflog                       # 看到形如 a1b2c3d HEAD@{2}: commit: xxx
git reset --hard <目标 sha>      # 回到那次提交（连改动一起恢复）
# 或只把那次提交的内容拿回来
git cherry-pick <目标 sha>

# 极端情况（reflog 也过期）：从悬空对象里找
git fsck --lost-found
```

### 6.5 只把某个文件回退到历史版本

```bash
# 把单个文件恢复到上一个提交的样子（会覆盖工作区，慎用）
git restore --source=HEAD~1 -- <file>
# 旧版：git checkout HEAD~1 -- <file>

# 只想看历史内容，先不写入工作区
git show HEAD~1:<file> > /tmp/old.txt
```

### 6.6 再往前：撤销中间某次提交但保留后面的

```bash
git revert <sha>                # 生成一条「反向提交」，历史不被改写
git revert --no-commit <sha>    # 只改工作区，自己决定何时提交（适合一次撤销多条）
```

---

## 七、撤销已 push 的提交

核心原则：**已经推送到公共分支的历史，不要改写**。因为同事的本地仓库已经基于它继续开发，改写历史会让所有人陷入冲突。

### 7.1 首选方案：`revert` 生成反向提交（安全，推荐）

```bash
# 1. 找到要撤销的提交
git log --oneline -10

# 2. 生成一条反向提交（历史向前走，不抹掉任何东西）
git revert <sha>

# 3. 解决冲突（如有）后提交并推送
git push
```

| 变体                            | 用途                                       |
| ------------------------------- | ------------------------------------------ |
| `git revert --no-commit <sha>`  | 改完不自动提交，方便一次撤销多条后合并提交 |
| `git revert <旧sha>..<新sha>`   | 撤销一段连续提交（左开右闭，不含旧 sha）   |
| `git revert -m 1 <合并提交sha>` | 撤销一次 merge，`-m 1` 指定保留第一父分支  |
| `git revert HEAD`               | 撤销最近一次提交                           |

### 7.2 次选方案：本地回退 + 强制推送（仅限私人分支）

```bash
# 0. 先留退路（强烈建议）
git branch backup/my-branch

# 1. 本地回退（保留改动用 --soft，丢弃用 --hard）
git reset --hard <目标sha>

# 2. 强制推送，但带上「租约」校验：若远端已有别人新推的提交，推送会失败
git push --force-with-lease origin <分支>
```

| 命令                          | 风险                                               |
| ----------------------------- | -------------------------------------------------- |
| `git push --force` / `-f`     | 无条件覆盖远程，可能直接抹掉别人的提交             |
| `git push --force-with-lease` | 仅在「远程与本地记录一致」时覆盖，**永远优先用它** |

### 7.3 强制推送的红线

1. `main` / `develop` / `release/*` 等共享分支：**禁止** force push，平台侧开启分支保护；
2. 确需强推时先在群里通知，要求所有人暂停推送，推完让大家重新 `git fetch` 并对齐；
3. 自己的 `feature/*` 分支强推前，确认没有别人在这个分支上协作；
4. 推完立刻检查 `git log --oneline --graph` 与 CI 状态。

### 7.4 误推了敏感信息（密钥、密码、证书）

1. **第一步永远是轮换**：去平台作废并重新生成密钥 / 修改密码 —— 改历史不能让已泄露的凭证失效；
2. 再考虑清理历史：`git filter-repo` 或 BFG Repo-Cleaner，然后全体协作者重新克隆；
3. 同步把该文件加进 `.gitignore`，并加上 pre-commit 扫描（如 `gitleaks`）。

---

## 八、避坑与注意事项

### 8.1 高危命令清单

| 命令                               | 后果                               | 更安全的替代                             |
| ---------------------------------- | ---------------------------------- | ---------------------------------------- |
| `git push -f`                      | 覆盖远程历史，抹掉他人提交         | `git push --force-with-lease`            |
| `git reset --hard`                 | 工作区与暂存区改动全丢             | 先 `git stash` 或建备份分支；或 `--soft` |
| `git clean -fd`                    | 删除所有未跟踪文件（含新写的代码） | 先 `git clean -nd` 预演                  |
| `git checkout .` / `git restore .` | 丢弃全部工作区改动                 | 明确指定文件；或先 `git stash`           |
| `git rebase` 已 push 的分支        | 改写公共历史                       | 只对本地未推送提交 rebase                |
| `git branch -D`                    | 强删未合并分支，提交可能丢失       | 先用 `-d`；误删后用 `reflog` 找回        |
| `rm -rf .git`                      | 整个仓库历史消失                   | 想「去掉 Git 管理」就先备份 `.git` 目录  |
| `git commit --no-verify`           | 绕过 lint / 测试钩子               | 修掉问题再提交                           |

### 8.2 换行符（CRLF / LF）混乱

| 系统          | 推荐配置                | 说明                   |
| ------------- | ----------------------- | ---------------------- |
| Windows       | `core.autocrlf = true`  | 检出转 CRLF，提交转 LF |
| macOS / Linux | `core.autocrlf = input` | 提交时转 LF，检出不改  |

更稳的做法是在仓库里放 `.gitattributes`，让所有人一致：

```text
* text=auto eol=lf
*.png binary
*.jpg binary
*.ico binary
```

> 若整个仓库因换行符被「全量改动」占满 `git status`：先统一 `.gitattributes`，再执行 `git add --renormalize .` 一次性归一化。

### 8.3 中文显示与编码

```bash
git config --global core.quotepath false      # status/log 正常显示中文路径
git config --global i18n.commitEncoding utf-8 # 提交信息编码
git config --global i18n.logOutputEncoding utf-8
```

Windows 终端（PowerShell / cmd）还需确认代码页为 `65001`（`chcp 65001`），否则 `git log` 中文可能乱码。

### 8.4 大文件与 Git LFS

- GitHub 单文件硬限制 100MB，超过 50MB 会警告；仓库总体建议控制在 1GB 以内；
- 二进制大资源（视频、设计稿、模型）用 **Git LFS**：`git lfs install` → `git lfs track "*.psd"` → 提交生成的 `.gitattributes`；
- 已经把大文件提交进历史：`git filter-repo --strip-blobs-bigger-than 10M`（全员重新克隆）。

### 8.5 `.gitignore` 不生效的五种原因

1. **文件已被跟踪**：`.gitignore` 只对未跟踪文件生效，需 `git rm --cached <file>`；
2. **规则写法错误**：目录要写 `dir/`，只忽略根目录要写 `/file`，取反用 `!`；路径一律用 `/`；
3. **取反规则不生效**：父目录被整体排除后，Git 不会进入该目录，其下子文件的 `!` 无效（见 4.7.4），要改成「先排除内容、再放开目录」；
4. **被全局忽略文件命中**：`git config --global core.excludesfile` 检查；
5. **换行符或 BOM**：用 LF 换行、UTF-8 无 BOM 保存。
   排查利器：`git check-ignore -v <path>`（会打印命中的规则文件与行号）。

### 8.6 文件名大小写

macOS / Windows 文件系统默认大小写不敏感，只改大小写 Git 可能「看不见」：

```bash
git mv OldFile.tsx newFile.tsx     # 用 git mv 改名，Git 才会记录
# 或临时关闭忽略大小写
git config core.ignorecase false
```

### 8.7 `merge` 与 `rebase` 怎么选

| 维度         | `merge`            | `rebase`                 |
| ------------ | ------------------ | ------------------------ |
| 历史         | 保留分叉与合并节点 | 变成一条直线             |
| 是否改写历史 | 否                 | 是                       |
| 适合场景     | 公共分支合并       | 整理自己的本地未推送提交 |

```bash
git config --global pull.rebase false   # 默认 pull = fetch + merge（最不容易出错）
git pull --rebase origin main           # 想要线性历史时用
git rebase --abort                      # rebase 搞砸了，一键回退到开始之前
```

### 8.8 冲突处理标准流程

```bash
git pull                  # 或 git rebase，出现冲突
git status                # 看 both modified / both added 的文件
# 编辑冲突文件，处理 <<<<<<< ======= >>>>>>> 三段
git add <冲突文件>        # 标记已解决
git merge --continue      # 或 git rebase --continue
# 想放弃这次合并/rebase
git merge --abort         # 或 git rebase --abort
```

可视化工具能省一半时间：`git config --global merge.tool vscode` + `git mergetool`。

### 8.9 分支与提交纪律

- 不在 `main` 上直接开发，一切走分支 + PR；
- 提交前 `git status` / `git diff --cached` 必看；
- 一次提交一件事，信息用 Conventional Commits（见 4.4）；
- 推送前先 `git pull --rebase`，减少无意义的 merge 节点；
- 定期 `git fetch --prune`，清理已删除的远程分支缓存。

### 8.10 分离头指针（detached HEAD）

执行 `git checkout <sha>` 或 `git checkout <tag>` 后进入该状态，此时提交不属于任何分支，切走就丢：

```bash
git switch -c <新分支名>    # 立刻把当前提交固化成一条分支
```

### 8.11 不该进版本库的东西

`node_modules/`、构建产物（`dist/`、`build/`）、`.env*` 与密钥、日志、编辑器个性化配置、系统文件（`.DS_Store`、`Thumbs.db`）、本地数据库文件。
注意：`pnpm-lock.yaml` / `package-lock.json` / `yarn.lock` **必须提交**。

### 8.12 网络、代理与超时

```bash
# 设置 / 取消 HTTP(S) 代理
git config --global http.proxy http://127.0.0.1:7890
git config --global --unset http.proxy

# SSH 被封 22 端口时，改走 443（GitHub）
# ~/.ssh/config
# Host github.com
#   Hostname ssh.github.com
#   Port 443

# 大仓库 / 慢网络
git clone --depth 1 <url>                       # 浅克隆，只要最新提交
git config --global http.postBuffer 524288000   # 提高推送缓冲
git config --global http.lowSpeedLimit 0        # 关闭低速中断
```

### 8.13 仓库维护

```bash
git gc --prune=now      # 清理无用对象、压缩历史（大仓库提速）
git fsck                # 检查对象完整性
git count-objects -vH   # 查看仓库体积构成
```

---

## 九、免费图形界面客户端

> 本节依据 [Git 官方 GUI Clients 列表](https://git-scm.com/tools/guis) 整理，**只收免费可用**的客户端；Tower、Fork、Sublime Merge、Gitfox 等付费/试用型不在本文范围内。

### 9.1 优先推荐的 6 款（完全免费）

| 客户端                                                                         | 平台           | 许可         | 特点                                                                                        | 适合谁                    |
| ------------------------------------------------------------------------------ | -------------- | ------------ | ------------------------------------------------------------------------------------------- | ------------------------- |
| [GitHub Desktop](https://desktop.github.com/)                                  | Windows、macOS | MIT          | 官方出品，可视化暂存/提交/分支/PR 全流程，与 GitHub 深度集成，安装即带命令行 Git 与凭证管理 | 新手第一选择、GitHub 用户 |
| [SourceTree](https://www.sourcetreeapp.com/)                                   | Windows、macOS | 免费（专有） | 分支树可视化极清晰，支持交互式 rebase、stash、子模块，功能最全之一                          | 想少敲命令、又要完整能力  |
| [TortoiseGit](https://tortoisegit.org/)                                        | Windows        | GNU GPL      | 集成到资源管理器右键菜单，图标叠加显示文件状态                                              | Windows 桌面党            |
| [Git Extensions](https://gitextensions.github.io/)                             | Windows        | GNU GPL      | Windows 上功能最全的开源客户端，含 Visual Studio 插件                                       | Windows 深度用户          |
| [LazyGit](https://github.com/jesseduffield/lazygit)                            | 跨平台（终端） | MIT          | 终端 TUI，一个快捷键查看/暂存/提交/rebase，键盘流效率极高                                   | 已经习惯终端的开发者      |
| [Gitnuro](https://gitnuro.com/) / [SourceGit](https://sourcegit-scm.github.io) | 跨平台         | GPL / MIT    | 现代跨平台客户端，界面清爽、启动快，不绑定某家平台                                          | 想要跨平台一致体验        |

### 9.2 Git 自带与轻量工具

| 客户端                                               | 平台             | 许可        | 说明                                              |
| ---------------------------------------------------- | ---------------- | ----------- | ------------------------------------------------- |
| `git-gui` / `gitk`                                   | 跨平台           | GNU GPL     | **安装 Git 就自带**，零配置，够做基本提交与看历史 |
| [ungit](https://github.com/FredrikNoren/ungit)       | 跨平台（浏览器） | MIT         | `npm i -g ungit` 后在浏览器里操作，最易上手       |
| [git-cola](https://git-cola.github.io/)              | 跨平台           | GNU GPL     | 轻量、可定制，偏「暂存区编辑器」                  |
| [GitUI](https://github.com/extrawurst/gitui)         | 跨平台（终端）   | MIT         | Rust 写的 TUI，速度快、内存占用低                 |
| [tig](https://github.com/jonas/tig)                  | 跨平台（终端）   | GPL-2.0     | 终端里浏览历史、diff、状态                        |
| [gitg](https://wiki.gnome.org/Apps/Gitg/)            | Linux、Windows   | GNU GPL     | GNOME 桌面风格                                    |
| [Meld](https://meldmerge.org)                        | Linux、Windows   | GPLv2+      | 差异对比与三方合并工具，常作为 mergetool          |
| [Gittyup](https://murmele.github.io/Gittyup/)        | 跨平台           | MIT         | GitAhead 的精神续作                               |
| [MeGit](https://github.com/eclipsesource/megit)      | 跨平台           | EPL-2.0     | 基于 EGit 的 Eclipse 发行版                       |
| [Magit](https://magit.vc)                            | 跨平台           | GNU GPL     | Emacs 里的 Git，键盘操作天花板（Emacs 用户）      |
| [Fugitive](https://github.com/tpope/vim-fugitive)    | 跨平台           | Vim 插件    | Vim 里的 Git 集成                                 |
| [GitUp](http://gitup.co/)                            | macOS            | GNU GPL     | macOS 轻量客户端，「快照式」撤销很方便            |
| [GitButler](https://gitbutler.com)                   | 跨平台           | FSL-1.1-MIT | 新的分支/虚拟分支管理方式                         |
| [Puppy Git](https://github.com/catpuppyapp/PuppyGit) | Android          | GPLv3       | 手机上管理仓库                                    |

### 9.3 编辑器 / IDE 内置（同样是免费的图形界面）

| 环境                                     | 说明                                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------------------- |
| **Visual Studio Code**                   | 自带源代码管理面板：暂存、部分暂存（按行）、提交、分支、冲突三方合并，配 GitLens 更强 |
| **JetBrains 系列**（WebStorm / IDEA 等） | 内置 Git 工具窗口 + 可视化冲突解决 + 交互式 rebase                                    |
| **Visual Studio**                        | 团队资源管理器内置 Git                                                                |
| **Eclipse**（EGit / MeGit）              | Java 生态常用                                                                         |

### 9.4 免费但有条件（按需取用，注意限制）

| 客户端                                                    | 免费范围                            |
| --------------------------------------------------------- | ----------------------------------- |
| [GitKraken Desktop](https://www.gitkraken.com/git-client) | 提供免费档，私有仓库/高级功能需订阅 |
| [SmartGit](https://www.syntevo.com/smartgit/)             | **非商业用途免费**，商业使用需付费  |
| [Glint](https://glint.info)                               | 免费档 + 付费专业版                 |
| [Anchorpoint](https://anchorpoint.app)                    | 免费档 + 付费团队版                 |
| [NitroGit](http://nitrogit.net)                           | 非商业用途免费                      |
| [Vershd](https://vershd.io)                               | 非商业用途免费                      |
| [SnailGit](https://langui.net/snailgit/)（macOS）         | 功能受限的免费版                    |
| [Working Copy](https://workingcopyapp.com/)（iOS）        | 免费版 + 内购解锁                   |

### 9.5 怎么选

| 你的情况                 | 建议                                    |
| ------------------------ | --------------------------------------- |
| 完全零基础，想先跑通流程 | GitHub Desktop（或 VS Code 内置面板）   |
| Windows，想要右键菜单    | TortoiseGit                             |
| 想看清分支树、少敲命令   | SourceTree                              |
| 已习惯终端，想更快       | LazyGit / GitUI / tig                   |
| 跨平台、不想装大软件     | Gitnuro / SourceGit / ungit             |
| 团队统一环境             | 编辑器内置（VS Code / JetBrains）最省事 |

> 无论用哪个 GUI，**背后的概念（三区、HEAD、分支指针）完全一致**；遇到 GUI 报错，切回命令行看 `git status`，往往一眼就能定位。

---

## 十、快速查询清单

### 10.1 仓库与配置

```bash
git init -b main              # 初始化仓库（指定默认分支）
git clone <url> [目录名]      # 克隆仓库
git config --list --show-origin  # 查看全部配置及来源
git config --global user.name "<名>"
git config --global user.email "<邮箱>"
git config --global --edit    # 直接编辑全局配置
git help <命令>               # 查看帮助
```

### 10.2 日常提交

```bash
git status [-s]               # 查看状态（-s 精简）
git add <path>                # 暂存
git add -A                    # 暂存所有变化（含删除）
git add -u                    # 暂存已跟踪文件的修改与删除
git add -p <file>             # 分块暂存
git commit -m "<信息>"
git commit --amend --no-edit  # 并入上一次提交
git restore --staged <file>   # 取消暂存
git restore <file>            # 丢弃工作区改动
git clean -nd                 # 预演删除未跟踪文件
git rm <file>                 # 删除文件并记录（等价 rm + add）
git mv <old> <new>            # 重命名并记录
```

### 10.3 分支

```bash
git branch                    # 列出本地分支
git branch -a                 # 含远程分支
git branch -vv                # 含跟踪关系
git switch <分支>             # 切换分支
git switch -c <分支>          # 新建并切换
git switch -c <分支> <起点>   # 从指定点创建
git branch -m <新名>          # 重命名
git branch -d <分支>          # 删除已合并分支
git branch -D <分支>          # 强制删除
git merge <分支>              # 合并到当前分支
git merge --abort             # 放弃合并
git rebase <分支>             # 变基到目标分支
git rebase --continue|--abort
git cherry-pick <sha>         # 把某次提交拿过来
```

### 10.4 远程

```bash
git remote -v                 # 查看远程
git remote add origin <url>
git remote set-url origin <url>
git remote remove origin
git fetch [远程名]            # 只下载不合并
git fetch --prune             # 清理已删除的远程分支
git pull                      # fetch + merge
git pull --rebase             # fetch + rebase
git push                      # 推送当前分支（已建上游）
git push -u origin <分支>     # 首次推送并建立上游
git push --force-with-lease   # 安全的强制推送
git push origin -d <分支>     # 删除远程分支
```

### 10.5 撤销与回退

```bash
git reset --soft HEAD~1       # 撤销提交，改动留在暂存区
git reset --mixed HEAD~1      # 撤销提交，改动回到工作区
git reset --hard HEAD~1       # 撤销提交并丢弃改动（高危）
git revert <sha>              # 生成反向提交（已 push 首选）
git revert --no-commit <sha>
git reflog                    # 查看指针移动记录（救命）
git reset --hard <sha>        # 回到指定提交
git branch <新分支> <sha>     # 从历史提交重建分支
git fsck --lost-found         # 找悬空对象
```

### 10.6 查看与比较

```bash
git log --oneline --graph --decorate --all
git log -p -3                 # 最近 3 条带 diff
git log --stat                # 带改动统计
git log -- <path>             # 某文件的历史
git show <sha>                # 看某次提交
git diff                      # 工作区 vs 暂存区
git diff --cached             # 暂存区 vs 最近提交
git diff <分支1>..<分支2>     # 两个分支比较
git diff --stat               # 只看改动清单
git blame -L 10,20 <file>     # 某几行是谁改的
git bisect start|bad|good|reset  # 二分定位问题提交
```

### 10.7 储藏与清理

```bash
git stash push -m "说明"      # 储藏（含未跟踪加 -u）
git stash list
git stash pop                 # 恢复并删除
git stash apply stash@{1}     # 恢复但不删除
git stash drop stash@{0}
git stash clear               # 清空（谨慎）
```

### 10.8 标签与子模块

```bash
git tag                       # 列出标签
git tag -a v1.0.0 -m "发布 1.0.0"
git push origin v1.0.0        # 推送单个标签
git push origin --tags        # 推送全部标签
git tag -d v1.0.0             # 删除本地标签

git submodule add <url> <路径>
git submodule update --init --recursive
```

---

## 十一、常见场景速查

### 11.1 改到一半，必须切到别的分支

```bash
git stash push -u -m "订单页改到一半"
git switch <目标分支>
# ... 处理完 ...
git switch -
git stash pop
```

### 11.2 提交到了错误的分支

```bash
# 未 push：把提交搬过去
git reset --soft HEAD~1            # 改动回到暂存区
git stash push -m "搬移"
git switch <正确分支>
git stash pop
git commit -m "..."

# 已 push 到错误分支：用 cherry-pick 搬运
git switch <正确分支>
git cherry-pick <sha>
# 再回到错误分支做 revert
git switch <错误分支>
git revert <sha>
```

### 11.3 把多次提交合并成一次（squash）

```bash
# 方式一：软重置后重新提交（最简单）
git reset --soft <基准sha>
git commit -m "feat(x): 合并后的提交"

# 方式二：交互式变基（可挑挑拣拣）
git rebase -i HEAD~3      # 把后两条改成 squash / fixup
```

### 11.4 想要同步上游仓库（fork 场景）

```bash
git remote add upstream <上游url>
git fetch upstream
git switch main
git merge upstream/main      # 或 git rebase upstream/main
git push
```

### 11.5 找回被删除的分支或提交

```bash
git reflog                        # 找到那次提交的 sha
git branch <分支名> <sha>         # 用 sha 重建分支
# 或
git cherry-pick <sha>
```

### 11.6 只撤销某个文件的改动

```bash
git restore <file>                       # 丢弃工作区改动
git restore --source=HEAD~2 -- <file>    # 回到两个提交前的版本
git checkout <sha> -- <file>             # 旧版写法
```

### 11.7 修改远程地址 / 换协议

```bash
git remote set-url origin git@github.com:<用户>/<仓库>.git   # HTTPS → SSH
git remote set-url origin https://github.com/<用户>/<仓库>.git
```

### 11.8 撤销一次 merge

```bash
git revert -m 1 <合并提交的sha>     # -m 1 表示保留主线（第一父）
```

### 11.9 临时看某个历史版本（不改动当前分支）

```bash
git switch --detach <sha>       # 进入分离头指针查看
git switch -                    # 回到原分支
```

---

## 十二、常见误区与 FAQ

| 问题 / 误解                              | 正确认识                                                               |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| Git 就是 GitHub                          | Git 是版本控制系统（本地工具），GitHub / GitLab / Gitee 是代码托管平台 |
| `git pull` 只是「下载」                  | `pull = fetch + merge`（或 rebase），会改动你的工作区与分支指针        |
| `git fetch` 会改我的代码                 | 不会，它只更新本地的远程跟踪引用（`origin/main`），工作区不动          |
| 删掉文件后历史里就没有了                 | 历史仍保留完整内容，仓库体积不会变小，需 `filter-repo` / LFS 处理      |
| `git reset --hard` 之后代码一定没了      | 未 gc 前可用 `git reflog` 找回（默认 90 天）                           |
| `--amend` 可以随便改任何提交             | 它只能改最近一次提交，且已 push 后改它需要强推                         |
| `.gitignore` 写了就一定生效              | 只对未跟踪文件生效，已跟踪的要先 `git rm --cached`                     |
| 空目录会被 Git 记录                      | 不会，需要占位文件（如 `.gitkeep`）                                    |
| `git status` 里中文路径显示成 `\344\275` | 设 `core.quotepath false`                                              |
| 提示 `LF will be replaced by CRLF`       | 换行符自动转换的正常提示，统一 `.gitattributes` 即可                   |
| `non-fast-forward` 推不上去              | 远程有新提交，先 `git pull --rebase` 再推，别直接强推                  |
| 提交后想改提交信息，已经 push 了         | 用 `git revert`（保留历史）或强推（仅限私有分支），优先前者            |
| rebase 一定能得到更干净的历史            | 只对未推送提交成立；对公共分支 rebase 是在改写别人的历史               |
| 冲突是因为 Git 坏了                      | 冲突是同一处被两方改动，人工判断后 `git add` 标记解决即可              |

---

## 附录：名词与状态对照表

| 名词                             | 含义                                                   |
| -------------------------------- | ------------------------------------------------------ |
| HEAD                             | 当前检出的提交；通常指向当前分支的最新提交             |
| 索引（Index）/ 暂存区（Staging） | 下一次提交的内容清单                                   |
| origin                           | 默认的远程仓库别名（`.git/config` 里可改）             |
| upstream（上游分支）             | 本地分支跟踪的远程分支，配置后可省略 `git push` 的参数 |
| fast-forward（快进）             | 目标分支没有新提交时，直接把指针前移、无需合并节点     |
| detached HEAD（分离头指针）      | HEAD 直接指向某个提交而非分支，此状态下的提交容易丢失  |
| working tree（工作区）           | 磁盘上的项目文件                                       |
| untracked / tracked              | 未被 Git 记录 / 已被记录的文件                         |
| PR / MR                          | Pull Request / Merge Request，代码合并评审流程         |
| LFS                              | Large File Storage，用指针替代大文件本体，避免仓库膨胀 |
| reflog                           | HEAD 与分支指针的移动日志，误操作恢复的主要依据        |
| stash                            | 临时存放未提交改动的栈                                 |
