# OnlyOffice Angular 文档查看器

这是一个基于 Angular 12 和 OnlyOffice 技术实现的在线文档查看器项目，参考了 [ranuts/document](https://github.com/ranuts/document) 和 [sweetwisdom/onlyoffice-web-local](https://github.com/sweetwisdom/onlyoffice-web-local) 项目。

## 项目概述

本项目提供了一个在线文档查看器，支持多种文档格式的查看，包括 Word 文档（.doc, .docx）、Excel 表格（.xls, .xlsx）和 PowerPoint 演示文稿（.ppt, .pptx）。该项目使用 OnlyOffice 文档编辑器 API 实现文档渲染，并集成了文档格式转换功能。

## 功能特性

-   支持多种文档格式查看：Word、Excel、PowerPoint
-   支持本地文档上传查看
-   支持新建空白文档
-   集成 OnlyOffice 文档编辑器
-   支持文档格式转换（通过 x2t WASM 模块）

## 技术栈

-   Angular 12
-   OnlyOffice DocumentEditor API
-   TypeScript
-   x2t WASM 模块（用于文档格式转换）

## 项目结构

```
src/
├── app/
│   ├── lib/           # 文档处理库
│   │   ├── empty_bin.ts  # 空白文档模板
│   │   └── x2t.ts        # 文档格式转换模块
│   ├── app.component.html  # 主界面模板
│   ├── app.component.ts    # 主组件逻辑
│   └── app.module.ts       # 应用模块配置
├── assets/
│   ├── sdkjs/              # OnlyOffice SDK
│   ├── wasm/               # x2t WASM 模块
│   └── web-apps/           # OnlyOffice Web 应用
└── ...
```

## 核心组件

### AppComponent

主应用组件，负责文档查看器的初始化、文档加载和用户交互。

主要功能：

-   初始化 OnlyOffice 文档编辑器
-   加载不同类型的文档（Word、Excel、PowerPoint）
-   处理文档上传和转换
-   提供用户界面交互

### 文档处理库

#### empty_bin.ts

包含各种文档格式的空白模板，用于创建新的空文档。

#### x2t.ts

文档格式转换模块，使用 WASM 技术实现文档格式转换功能：

-   支持将各种文档格式转换为 OnlyOffice 可识别的格式
-   集成 x2t 转换引擎
-   提供文档上传转换功能

## 使用方法

### 开发环境运行

```bash
# 安装依赖
npm install

# 启动开发服务器
ng serve

# 在浏览器中访问 http://localhost:4200/
```

### 构建生产版本

```bash
# 构建项目
ng build --prod
```

### 功能操作说明

1. **新建文档**：

    - 点击 "New Word (.docx)" 创建新的 Word 文档
    - 点击 "New Excel (.xlsx)" 创建新的 Excel 表格
    - 点击 "New PowerPoint (.pptx)" 创建新的 PowerPoint 演示文稿

2. **上传文档**：
    - 点击 "Upload Document to view" 按钮
    - 选择本地文档文件（支持 .doc, .docx, .xls, .xlsx, .ppt, .pptx）
    - 系统会自动转换文档格式并加载到查看器中

## OnlyOffice 集成

项目通过以下方式集成 OnlyOffice：

1. 在 [index.html](src/index.html) 中引入 OnlyOffice API：

    ```html
    <script type="text/javascript" src="assets/web-apps/apps/api/documents/api.js"></script>
    ```

2. 在 [AppComponent](src/app/app.component.ts) 中初始化文档编辑器：
    ```typescript
    this.docEditor = new DocsAPI.DocEditor(this.editorPlaceholder.nativeElement.id, config);
    ```

## 文档转换功能

项目使用 x2t WASM 模块实现文档格式转换：

1. 用户上传文档时，系统会调用 [convertDocument](src/app/lib/x2t.ts) 函数
2. 通过 WASM 模块将文档转换为 OnlyOffice 可识别的格式
3. 转换后的文档数据通过 `asc_openDocument` 命令发送给 OnlyOffice 编辑器

## 部署

项目可以部署到任何支持静态文件托管的服务上，如 GitHub Pages、Netlify、Vercel 等。

### GitHub Pages 部署

项目已配置 GitHub Actions 工作流，可自动部署到 GitHub Pages：

1. Fork 本项目
2. 在仓库设置中启用 GitHub Pages
3. 推送代码到 main 分支，GitHub Actions 会自动构建和部署

## 注意事项

1. 项目依赖 OnlyOffice 的静态资源文件，确保 [assets](src/assets/) 目录中的文件完整
2. 文档转换功能需要浏览器支持 WASM
3. 由于使用了 OnlyOffice 的客户端渲染，不依赖后端文档服务

## 自定义配置

### 修改文档编辑器配置

可以在 [AppComponent](src/app/app.component.ts) 中修改文档编辑器的配置：

```typescript
const config = {
    document: {
        fileType: fileExt,
        key: this.generateDocumentKey(fileExt),
        title: `sample.${fileExt}`,
        url: documentUrl,
    },
    documentType: docTypeMapping[fileExt],
    height: '100%',
    width: '100%',
    editorConfig: {
        lang: window.navigator.language,
        customization: {
            // 自定义编辑器界面
        },
    },
    events: {
        // 事件处理
    },
};
```

### 添加新的文档格式支持

1. 在 [x2t.ts](src/app/lib/x2t.ts) 中扩展 `DOCUMENT_TYPE_MAP`
2. 在 [empty_bin.ts](src/app/lib/empty_bin.ts) 中添加对应格式的空白模板
3. 更新 HTML 模板中的文件类型过滤器

## 故障排除

### 文档编辑器加载失败

1. 检查浏览器控制台错误信息
2. 确认 `assets/web-apps/apps/api/documents/api.js` 文件存在
3. 确认网络连接正常，静态资源加载成功

### 文档上传失败

1. 检查文件格式是否支持
2. 查看浏览器控制台是否有转换错误信息
3. 确认浏览器支持 WASM 功能

### 文档显示异常

1. 尝试刷新页面
2. 检查文档是否损坏
3. 确认文档格式是否完全支持

## 许可证

本项目仅供学习和参考使用。
