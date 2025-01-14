export interface YaakWorkspace {
    id: string;
    name: string;
    description?: string;
}

export interface YaakEnvironment {
    id: string;
    name: string;
    workspaceId: string;
    variables: YaakVariable[];
}

export interface YaakVariable {
    name: string;
    value: string;
    enabled: boolean;
}

export interface YaakFolder {
    id: string;
    name: string;
    workspaceId: string;
    folderId: string | null;
}

export interface YaakRequest {
    id: string;
    name: string;
    workspaceId: string;
    folderId: string | null;
    method: string;
    url: string;
    headers: YaakHeader[];
    urlParameters?: YaakUrlParameter[];
    body?: YaakBody;
    bodyType?: string;
}

export interface YaakHeader {
    name: string;
    value: string;
    enabled: boolean;
}

export interface YaakUrlParameter {
    name: string;
    value: string;
    enabled: boolean;
}

export interface YaakBody {
    text: string;
}

export interface YaakData {
    resources: {
        workspaces: YaakWorkspace[];
        environments: YaakEnvironment[];
        folders: YaakFolder[];
        httpRequests: YaakRequest[];
    };
} 