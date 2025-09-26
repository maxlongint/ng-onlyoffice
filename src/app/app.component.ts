import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { g_sEmpty_bin } from './lib/empty_bin';
import { c_oAscFileType2, convertBinToDocumentAndDownload, convertDocument } from './lib/x2t';

// 告诉 TypeScript DocsAPI 将会是一个全局变量
declare const DocsAPI: any;

interface SaveEvent {
    data: {
        data: {
            data: any;
            a5b: any | null; // a5b 的值为 null，可以定义为 any 或 null 类型
            index: number;
            count: number;
        };
        option: any;
    };
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit, OnDestroy {
    // 使用 ViewChild 获取模板中的 DOM 元素
    @ViewChild('editorPlaceholder') editorPlaceholder!: ElementRef;
    @ViewChild('inputFile') inputFile!: ElementRef<HTMLInputElement>;

    // 文档编辑器实例
    docEditor: any = null;

    // 当视图初始化完成后调用
    ngAfterViewInit(): void {
        // 默认加载 Word 文档
        // this.loadDocument('xlsx');
    }

    // 组件销毁时调用
    ngOnDestroy(): void {
        if (this.docEditor) {
            this.docEditor.destroyEditor();
            this.docEditor = null;
        }
    }

    uploadDocument(): void {
        this.inputFile.nativeElement.click();
        this.inputFile.nativeElement.value = '';
    }

    uploadChange(event: any): void {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const validExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
        if (validExtensions.includes(fileExt)) {
            convertDocument(file).then(result => {
                this.loadDocument(fileExt, result.bin);
            });
        }
    }

    /**
     * 加载指定类型的文档
     * @param fileExt 文件扩展名 ('docx', 'xlsx', 'pptx')
     * @param file 是否是本地上传的文件
     */
    loadDocument(fileExt: 'docx' | 'xlsx' | 'pptx' | 'doc' | 'xls' | 'ppt', bin?: Uint8Array): void {
        // 如果已经有编辑器实例，先销毁它
        if (this.docEditor) {
            this.docEditor.destroyEditor();
            this.docEditor = null;
        }

        const docTypeMapping = {
            docx: 'word',
            xlsx: 'cell',
            pptx: 'slide',
            doc: 'word',
            xls: 'cell',
            ppt: 'slide',
        };

        const documentUrl = `assets/sample.${fileExt}`;

        // 编辑器配置
        const config = {
            document: {
                fileType: fileExt,
                key: this.generateDocumentKey(fileExt),
                title: `sample.${fileExt}`,
                url: documentUrl,
            },
            documentType: docTypeMapping[fileExt],
            // editorConfig: {
            //     callbackUrl: '',
            // },
            // 根据需要设置高度和宽度
            height: '100%',
            width: '100%',
            editorConfig: {
                lang: window.navigator.language,
                customization: {
                    help: false,
                    about: false,
                    hideRightMenu: true,
                    features: {
                        spellcheck: {
                            change: false,
                        },
                    },
                    anonymous: {
                        request: false,
                        label: 'Guest',
                    },
                },
            },
            events: {
                onAppReady: () => {
                    if (bin) {
                        this.docEditor.sendCommand({
                            command: 'asc_openDocument',
                            data: { buf: bin },
                        });
                        return;
                    }
                    // 加载文档内容
                    this.docEditor.sendCommand({
                        command: 'asc_openDocument',
                        data: { buf: g_sEmpty_bin[fileExt] },

                        // command: 'asc_openDocument',
                        // data: { buf: g_sEmpty_bin[fileExt] },
                    });
                },
                onDocumentReady: () => {
                    console.log('文档加载完成');
                },
                onSave: (event: SaveEvent) => {
                    this.handleSaveDocument(event.data);
                },
                // writeFile
                // todo writeFile 当外部粘贴图片时候处理
                // writeFile: handleWriteFile,
            },
        };

        // 创建新的编辑器实例
        try {
            this.docEditor = new DocsAPI.DocEditor(this.editorPlaceholder.nativeElement.id, config);
        } catch (error) {
            console.error('无法加载文档编辑器:', error);
            this.editorPlaceholder.nativeElement.innerHTML =
                '<p style="text-align:center; padding-top: 50px; color: red;">加载文档编辑器失败，请检查控制台以获取更多信息。</p>';
        }
    }

    /**
     * 为文档生成一个唯一的 key
     * 每次加载新文件或新版本时，key 都应该是唯一的
     * @param fileExt 文件扩展名
     */
    private generateDocumentKey(fileExt: string): string {
        return `key_${fileExt}_${new Date().getTime()}`;
    }

    private async handleSaveDocument(result: SaveEvent['data']): Promise<void> {
        if (result && result.data) {
            const { data, option } = result;
            // 创建下载
            await convertBinToDocumentAndDownload(data.data, '' + +new Date(), c_oAscFileType2[option.outputformat]);
            // const blob = dataURItoBlob(data);
            // saveAs(blob, props.file.fileName);
        }

        // 告知编辑器保存完成
        this.docEditor.sendCommand({
            command: 'asc_onSaveCallback',
            data: { err_code: 0 },
        });
    }
}
