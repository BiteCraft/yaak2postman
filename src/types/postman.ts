export interface PostmanCollection {
    info: {
        name: string;
        description: string;
        schema: string;
    };
    item: (PostmanFolder | PostmanRequest)[];
    variable: PostmanVariable[];
}

export interface PostmanFolder {
    name: string;
    item: (PostmanFolder | PostmanRequest)[];
    folderId?: string | null;
    id?: string;
}

export interface PostmanRequest {
    name: string;
    request: {
        method: string;
        header: PostmanHeader[];
        url: PostmanUrl;
        description: string;
        body?: PostmanBody;
    };
    response: PostmanResponse[];
}

export interface PostmanResponse {
    name?: string;
    status?: string;
    code?: number;
    header?: PostmanHeader[];
    body?: string;
}

export interface PostmanHeader {
    key: string;
    value: string;
    type: string;
    enabled: boolean;
}

export interface PostmanUrl {
    raw: string;
    host: string[];
    path: string[];
    variable: PostmanVariable[];
    query: PostmanQueryParam[];
}

export interface PostmanVariable {
    id: string;
    key: string;
    value: string;
    type: string;
    description: string;
}

export interface PostmanQueryParam {
    key: string;
    value: string;
    disabled: boolean;
}

export interface PostmanBody {
    mode: string;
    raw: string;
    options: {
        raw: {
            language: string;
        };
    };
}

export interface PostmanEnvironment {
    name: string;
    values: PostmanEnvironmentValue[];
    _postman_variable_scope: string;
}

export interface PostmanEnvironmentValue {
    key: string;
    value: string;
    type: string;
    enabled: boolean;
} 