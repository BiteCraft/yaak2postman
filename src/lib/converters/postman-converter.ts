import path from 'node:path';
import { readJsonFile, saveJsonFile } from '../../utils/file.js';
import type {
    YaakData,
    YaakRequest,
    YaakHeader,
    YaakUrlParameter,
    YaakEnvironment,
    YaakWorkspace
} from '../../types/yaak.js';
import type {
    PostmanCollection,
    PostmanFolder,
    PostmanRequest,
    PostmanHeader,
    PostmanUrl,
    PostmanEnvironment,
    PostmanEnvironmentValue
} from '../../types/postman.js';

export class PostmanConverter {
    static ExportType = {
        ENV: 'env',
        COLLECTION: 'collection'
    } as const;

    private yaakData: YaakData | null = null;
    private outputDir: string | null = null;

    constructor(
        private readonly yaakFilePath: string,
        private readonly exportType: 'env' | 'collection' = 'collection'
    ) {}

    initialize(): boolean {
        try {
            const fileContent = readJsonFile<YaakData>(this.yaakFilePath);
            this.yaakData = fileContent;
            this.outputDir = path.dirname(this.yaakFilePath);

            if (!this.yaakData?.resources?.workspaces) {
                throw new Error('Invalid Yaak file: workspaces structure not found');
            }

            return true;
        } catch (error) {
            console.error('Error initializing converter:', error instanceof Error ? error.message : 'Unknown error');
            return false;
        }
    }

    convert(): Array<{ success: boolean; type: string; workspaceName: string; outputPath: string; environmentName?: string }> {
        if (!this.initialize()) {
            throw new Error('Failed to initialize converter');
        }

        if (!this.yaakData) {
            throw new Error('Yaak data not initialized');
        }

        try {
            const results = [];

            for (const workspace of this.yaakData.resources.workspaces) {
                const result = this.processWorkspace(workspace);
                if (Array.isArray(result)) {
                    results.push(...result);
                } else {
                    results.push(result);
                }
            }

            return results;
        } catch (error) {
            throw new Error(`Error during conversion: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private processWorkspace(workspace: YaakWorkspace) {
        if (this.exportType === PostmanConverter.ExportType.COLLECTION) {
            return this.exportWorkspaceCollection(workspace);
        }
        return this.exportWorkspaceEnvironments(workspace);
    }

    private exportWorkspaceCollection(workspace: YaakWorkspace) {
        if (!this.yaakData || !this.outputDir) {
            throw new Error('Yaak data not initialized');
        }

        const folderMap = this.createFolderMapForWorkspace(workspace.id);
        const collection = this.createBaseCollection(workspace);
        const rootFolders = this.organizeFolderHierarchy(folderMap);

        const workspaceRequests = this.yaakData.resources.httpRequests
            .filter(req => req.workspaceId === workspace.id);

        for (const request of workspaceRequests) {
            const postmanRequest = this.convertRequest(request);
            const folder = request.folderId ? folderMap.get(request.folderId) : null;

            if (folder) {
                folder.item.push(postmanRequest);
            } else {
                collection.item.push(postmanRequest);
            }
        }

        collection.item.push(...rootFolders);

        const outputPath = path.join(this.outputDir, `${workspace.name.toLowerCase()}_collection.json`);
        saveJsonFile(outputPath, collection);

        return {
            success: true,
            type: 'collection',
            workspaceName: workspace.name,
            outputPath
        };
    }

    private createFolderMapForWorkspace(workspaceId: string): Map<string, PostmanFolder> {
        if (!this.yaakData) {
            throw new Error('Yaak data not initialized');
        }

        const folderMap = new Map<string, PostmanFolder>();

        const workspaceFolders = this.yaakData.resources.folders
            .filter(folder => folder.workspaceId === workspaceId);

        for (const folder of workspaceFolders) {
            folderMap.set(folder.id, {
                name: folder.name,
                item: [],
                folderId: folder.folderId,
                id: folder.id
            });
        }

        return folderMap;
    }

    private exportWorkspaceEnvironments(workspace: YaakWorkspace) {
        if (!this.yaakData || !this.outputDir) {
            throw new Error('Yaak data not initialized');
        }

        const outputDir = this.outputDir;
        const workspaceEnvironments = this.yaakData.resources.environments
            .filter(env => env.workspaceId === workspace.id);

        return workspaceEnvironments.map(env => {
            const postmanEnv = this.convertEnvironment(env);
            const outputPath = path.join(
                outputDir,
                `${workspace.name.toLowerCase()}_environment_${env.name.toLowerCase()}.json`
            );
            
            saveJsonFile(outputPath, postmanEnv);
            
            return {
                success: true,
                type: 'environment',
                workspaceName: workspace.name,
                environmentName: env.name,
                outputPath
            };
        });
    }

    private createBaseCollection(workspace: YaakWorkspace): PostmanCollection {
        return {
            info: {
                name: workspace.name,
                description: workspace.description || '',
                schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
            },
            item: [],
            variable: []
        };
    }

    private organizeFolderHierarchy(folderMap: Map<string, PostmanFolder>): PostmanFolder[] {
        const rootFolders: PostmanFolder[] = [];
        
        for (const folder of folderMap.values()) {
            if (!folder.folderId) {
                rootFolders.push(folder);
            } else {
                const parentFolder = folderMap.get(folder.folderId);
                if (parentFolder) {
                    parentFolder.item.push(folder);
                }
            }
        }
        
        return rootFolders;
    }

    private convertRequest(request: YaakRequest): PostmanRequest {
        return {
            name: request.name,
            request: {
                method: request.method,
                header: this.convertHeaders(request.headers),
                url: this.convertUrl(request.url, request.urlParameters),
                description: '',
                ...(request.body?.text && { body: this.convertBody(request.body, request.bodyType) })
            },
            response: []
        };
    }

    private convertHeaders(headers: YaakHeader[] = []): PostmanHeader[] {
        return headers.map(h => ({
            key: h.name,
            value: h.value,
            type: "text",
            enabled: h.enabled
        }));
    }

    private convertUrl(url: string, urlParameters?: YaakUrlParameter[]): PostmanUrl {
        const baseUrl = url.replace(/\$\{\[ base_url \]\}/g, '{{base_url}}');
        return {
            raw: baseUrl,
            host: ["{{base_url}}"],
            path: this.convertUrlPath(baseUrl),
            variable: this.convertPathVariables(url, urlParameters),
            query: this.convertQueryParameters(urlParameters)
        };
    }

    private convertUrlPath(url: string): string[] {
        return url
            .replace(/\$\{\[ base_url \]\}/g, '')
            .split('/')
            .filter(Boolean);
    }

    private convertPathVariables(url: string, urlParameters?: YaakUrlParameter[]) {
        const pathParamMatches = url.match(/:[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
        
        return pathParamMatches.map(param => {
            const paramName = param.substring(1);
            const paramValue = urlParameters?.find(p => p.name === paramName)?.value || '';
            
            return {
                id: paramName,
                key: paramName,
                value: paramValue,
                type: "string",
                description: ''
            };
        });
    }

    private convertQueryParameters(urlParameters?: YaakUrlParameter[]) {
        if (!urlParameters) return [];

        return urlParameters
            .filter(p => p.name && !p.name.startsWith(':'))
            .map(p => ({
                key: p.name,
                value: p.value || '',
                disabled: !p.enabled
            }));
    }

    private convertBody(body: { text: string }, bodyType?: string) {
        return {
            mode: "raw",
            raw: body.text,
            options: {
                raw: {
                    language: bodyType === 'application/json' ? 'json' : 'text'
                }
            }
        };
    }

    private convertEnvironment(env: YaakEnvironment): PostmanEnvironment {
        return {
            name: env.name,
            values: env.variables
                .filter(v => v.name && v.value)
                .map(v => ({
                    key: v.name,
                    value: v.value,
                    type: "default",
                    enabled: v.enabled
                })),
            _postman_variable_scope: "environment"
        };
    }
} 