type ALM =
  | // br
  'azure'
  | 'bitbucket'
  | 'bitbucketcloud'
  | 'github'
  | 'gitlab';

/** see https://next.sonarqube.com/sonarqube/web_api */
export interface SonarQubeWebApi {
  /**
   * Manage DevOps Platform Settings.
   * @see https://next.sonarqube.com/sonarqube/web_api/api/alm_settings
   */
  readonly alm_settings: {
    /**
     * Bind a GitHub instance to a project.
     *
     * If the project was already bound to a previous GitHub instance, the binding will be updated to the new one.
     *
     * Requires the 'Administer' permission on the project.
     * @since 8.1
     * @see https://next.sonarqube.com/sonarqube/web_api/api/alm_settings?query=set_github_binding
     */
    set_github_binding(params: {
      /** GitHub setting key. */
      readonly almSetting: string;

      /**
       * Is this project part of a monorepo.
       * @since 8.7
       */
      readonly monorepo: boolean;

      /** Project key. */
      readonly project: string;

      /** GitHub Repository. Maximum length is 256 characters. */
      readonly repository: string;

      /**
       * Enable/disable summary in PR discussion tab.
       * @default true
       */
      readonly summaryCommentEnabled?: boolean;
    }): Promise<void>;

    /**
     * Get DevOps Platform binding of a given project.
     *
     * Requires the 'Browse' permission on the project.
     * @since 8.1
     * @see https://next.sonarqube.com/sonarqube/web_api/api/alm_settings?query=get_binding
     * @param {string} project - The key of the project to fetch the binding for.
     * @example
     * // Example response:
     * {
     *   "key": "gh1",
     *   "alm": "github",
     *   "repository": "repo1",
     *   "url": "https://api.github.com",
     *   "summaryCommentEnabled": true,
     *   "monorepo": false
     * }
     */
    get_binding({ project }: { /** Project key. */ readonly project: string }): Promise<{
      readonly key: string;
      readonly alm: ALM;
      readonly repository: string;
      readonly url: string;
      readonly summaryCommentEnabled: boolean;
      readonly monorepo: boolean;
    }>;

    /**
     * List DevOps Platform setting available for a given project, sorted by DevOps Platform key.
     *
     * Requires the 'Administer project' permission if the 'project' parameter is provided, requires the 'Create Projects' permission otherwise.
     * @since 8.1
     * @see https://next.sonarqube.com/sonarqube/web_api/api/alm_settings?query=list
     * @example
     * {
     *   "almSettings": [
     *     {
     *       "key": "gh1",
     *       "alm": "github",
     *       "url": "https://api.github.com"
     *     }
     *   ]
     * }
     */
    list(params: {
      /** Project key. */
      readonly project: string;
    }): Promise<{ readonly almSettings: { readonly key: string; readonly alm: ALM; readonly url: string }[] }>;
  };

  /**
   * Generate badges based on quality gates or measures.
   * @see https://next.sonarqube.com/sonarqube/web_api/api/project_badges
   */
  readonly project_badges: {
    /**
     * Generate badge for project's measure as an SVG.
     *
     * Requires 'Browse' permission on the specified project.
     * @since 7.1
     * @see https://next.sonarqube.com/sonarqube/web_api/api/project_badges?query=measure
     */
    measure(params: {
      /**
       * Branch key.
       * @example 'feature/my_branch'
       */
      readonly branch?: string;

      /**
       * Metric key.
       */
      readonly metric:
        | 'coverage'
        | 'duplicated_lines_density'
        | 'ncloc'
        | 'alert_status'
        | 'security_hotspots'
        | 'bugs'
        | 'code_smells'
        | 'vulnerabilities'
        | 'sqale_rating'
        | 'reliability_rating'
        | 'security_rating'
        | 'sqale_index'
        | 'software_quality_reliability_issues'
        | 'software_quality_maintainability_issues'
        | 'software_quality_security_issues'
        | 'software_quality_maintainability_rating'
        | 'software_quality_reliability_rating'
        | 'software_quality_security_rating'
        | 'software_quality_maintainability_remediation_effort';

      /**
       * Project or application key.
       * @example 'my_project'
       */
      readonly project: string;

      /**
       * Project badge token.
       * @example '8bb493196edb5896ccb64582499895f187a2ae8f'
       */
      readonly token?: string;
    }): Promise<string>;

    /**
     * Generate badge for project's quality gate as an SVG.
     *
     * Requires 'Browse' permission on the specified project.
     * @since 7.1
     * @see https://next.sonarqube.com/sonarqube/web_api/api/project_badges?query=quality_gate
     */
    quality_gate(params: {
      /**
       * Branch key.
       * @example 'feature/my_branch'
       */
      readonly branch?: string;

      /**
       * Project or application key.
       * @example 'my_project'
       */
      readonly project: string;

      /**
       * Project badge token.
       * @example '8bb493196edb5896ccb64582499895f187a2ae8f'
       */
      readonly token?: string;
    }): Promise<string>;

    /**
     * Creates new token replacing any existing token for project or application badge access for private projects and applications.
     *
     * This token can be used to authenticate with `api/project_badges/quality_gate` and `api/project_badges/measure` endpoints.
     *
     * Requires 'Administer' permission on the specified project or application.
     * @since 9.2
     * @see https://next.sonarqube.com/sonarqube/web_api/api/project_badges?query=renew_token
     */
    renew_token(params: {
      /**
       * Project or application key.
       * @example 'my_project'
       */
      readonly project: string;
    }): Promise<void>;

    /**
     * Retrieve a token to use for project or application badge access for private projects or applications.
     *
     * This token can be used to authenticate with `api/project_badges/quality_gate` and `api/project_badges/measure` endpoints.
     *
     * Requires 'Browse' permission on the specified project or application.
     * @since 9.2
     * @see https://next.sonarqube.com/sonarqube/web_api/api/project_badges?query=token
     * @example
     * // Example response:
     * {"token": "xxx"}
     */
    token(params: {
      /**
       * Project or application key.
       * @example 'my_project'
       */
      readonly project: string;
    }): Promise<{ readonly token: string }>;
  };

  /**
   * Manage branch.
   * @see https://next.sonarqube.com/sonarqube/web_api/api/project_branches
   */
  readonly project_branches: {
    /**
     * Delete a non-main branch of a project or application.
     *
     * Requires 'Administer' rights on the specified project or application.
     * @since 6.6
     * @see https://next.sonarqube.com/sonarqube/web_api/api/project_branches?query=delete
     */
    delete(params: {
      /**
       * Branch key.
       * @example 'feature/my_branch'
       */
      readonly branch: string;

      /**
       * Project key.
       * @example 'my_project'
       */
      readonly project: string;
    }): Promise<void>;

    /**
     * List the branches of a project or application.
     *
     * Requires 'Browse' or 'Execute analysis' rights on the specified project or application.
     * @since 6.6
     * @see https://next.sonarqube.com/sonarqube/web_api/api/project_branches?query=list
     * @example
     * // Example response:
     * {
     *   "branches": [
     *     {
     *       "name": "feature/foo",
     *       "isMain": false,
     *       "type": "BRANCH",
     *       "status": { "qualityGateStatus": "OK" },
     *       "analysisDate": "2017-04-03T13:37:00+0100",
     *       "excludedFromPurge": false,
     *       "branchId": "ac312cc6-26a2-4e2c-9eff-1072358f2017"
     *     },
     *     {
     *       "name": "main",
     *       "isMain": true,
     *       "type": "BRANCH",
     *       "status": { "qualityGateStatus": "ERROR" },
     *       "analysisDate": "2017-04-01T01:15:42+0100",
     *       "excludedFromPurge": true,
     *       "branchId": "57f02458-65db-4e7f-a144-20122af12a4c"
     *     }
     *   ]
     * }
     */
    list(params: {
      /**
       * Project key.
       * @example 'my_project'
       */
      readonly project: string;
    }): Promise<{
      branches: {
        readonly name: string;
        readonly isMain: boolean;
        readonly type: 'BRANCH';
        readonly status: { readonly qualityGateStatus: 'OK' | 'ERROR' };
        readonly analysisDate: string;
        readonly excludedFromPurge: boolean;
        readonly branchId: string;
      }[];
    }>;

    /**
     * Rename the main branch of a project or application.
     *
     * Requires 'Administer' permission on the specified project or application.
     * @since 6.6
     * @see https://next.sonarqube.com/sonarqube/web_api/api/project_branches?query=rename
     */
    rename(params: {
      /**
       * New name of the main branch. Maximum length is 255 characters.
       * @example 'branch1'
       */
      readonly name: string;

      /**
       * Project key.
       * @example 'my_project'
       */
      readonly project: string;
    }): Promise<void>;

    /**
     * Protect a specific branch from automatic deletion. Protection can't be disabled for the main branch.
     *
     * Requires 'Administer' permission on the specified project or application.
     * @since 8.1
     * @see https://next.sonarqube.com/sonarqube/web_api/api/project_branches?query=set_automatic_deletion_protection
     */
    set_automatic_deletion_protection(params: {
      /**
       * Branch key.
       * @example 'feature/my_branch'
       */
      readonly branch: string;

      /**
       * Project key.
       * @example 'my_project'
       */
      readonly project: string;

      /**
       * Sets whether the branch should be protected from automatic deletion when it hasn't been analyzed for a set period of time.
       * @example true
       */
      readonly value: boolean | 'yes' | 'no';
    }): Promise<void>;

    /**
     * Allow to set a new main branch.
     *
     * Caution, only applicable on projects.
     *
     * Requires 'Administer' rights on the specified project or application.
     * @since 10.2
     * @see https://next.sonarqube.com/sonarqube/web_api/api/project_branches?query=set_main
     */
    set_main(params: {
      /**
       * Branch key.
       * @example 'new_master'
       */
      readonly branch: string;

      /**
       * Project key.
       * @example 'my_project'
       */
      readonly project: string;
    }): Promise<void>;
  };

  /**
   * Manage project existence.
   * @see https://next.sonarqube.com/sonarqube/web_api/api/projects
   */
  readonly projects: {
    /**
     * Search for projects or views to administrate them.
     * - The response field 'lastAnalysisDate' takes into account the analysis of all branches and pull requests, not only the main branch.
     * - The response field 'revision' takes into account the analysis of the main branch only.
     *
     * Requires 'Administer System' permission.
     * @since 6.3
     * @see https://next.sonarqube.com/sonarqube/web_api/api/projects?query=search
     * @example
     * // Example response:
     * {
     *   "paging": {
     *     "pageIndex": 1,
     *     "pageSize": 100,
     *     "total": 2
     *   },
     *   "components": [
     *     {
     *       "key": "project-key-1",
     *       "name": "Project Name 1",
     *       "qualifier": "TRK",
     *       "visibility": "public",
     *       "lastAnalysisDate": "2017-03-01T11:39:03+0300",
     *       "revision": "cfb82f55c6ef32e61828c4cb3db2da12795fd767",
     *       "managed": false
     *     },
     *     {
     *       "key": "project-key-2",
     *       "name": "Project Name 2",
     *       "qualifier": "TRK",
     *       "visibility": "private",
     *       "lastAnalysisDate": "2017-03-02T15:21:47+0300",
     *       "revision": "7be96a94ac0c95a61ee6ee0ef9c6f808d386a355",
     *       "managed": false
     *     }
     *   ]
     * }
     */
    search(params: {
      /**
       * Filter the projects for which the last analysis of all branches are older than the given date (exclusive).
       *
       * Either a date (server timezone) or datetime can be provided.
       * @since 6.6
       * @example '2017-10-19'
       * @example '2017-10-19T13:00:00+0200'
       */
      readonly analyzedBefore?: string;

      /**
       * Filter the projects that are provisioned.
       * @since 6.6
       * @default false
       */
      readonly onProvisionedOnly?: boolean | 'yes' | 'no';

      /**
       * 1-based page number.
       * @default 1
       * @example 42
       */
      readonly p?: boolean | 'yes' | 'no';

      /**
       * Comma-separated list of project keys. Maximum allowed values are 1000.
       * @since 6.6
       * @example 'my_project,another_project'
       */
      readonly projects?: string;

      /**
       * Page size. Must be greater than 0 and less or equal than 500.
       * @default 100
       * @example 20
       */
      readonly ps?: number;

      /**
       * Limit search to:
       * - component names that contain the supplied string
       * - component keys that contain the supplied string
       * @example 'sonar'
       */
      readonly q?: string;

      /**
       * Comma-separated list of component qualifiers. Filter the results with the specified qualifiers.
       * @default 'TRK'
       */
      readonly qualifiers?: 'TRK' | 'VW' | 'APP';
    }): Promise<{
      readonly paging: { readonly pageIndex: number; readonly pageSize: number; readonly total: number };
      readonly components: { readonly key: string }[];
    }>;

    /**
     * Update a project all its sub-components keys.
     *
     * Requires 'Administer' permission on the project.
     * @since 6.1
     * @see https://next.sonarqube.com/sonarqube/web_api/api/projects?query=update_key
     */
    update_key(params: {
      /**
       * Project key.
       * @example 'my_old_project'
       */
      readonly from: string;

      /**
       * New project key.
       * @example 'my_new_project'
       */
      readonly to: string;
    }): Promise<void>;

    /**
     * Updates visibility of a project, application or a portfolio.
     *
     * Requires 'Project administer' permission on the specified entity
     * @since 6.4
     * @see https://next.sonarqube.com/sonarqube/web_api/api/projects?query=update_visibility
     */
    update_visibility(params: {
      /**
       * Project, application or portfolio key.
       * @example 'my_project'
       */
      readonly project: string;

      /** New visibility. */
      readonly visibility: 'private' | 'public';
    }): Promise<void>;
  };

  /**
   * Manage quality gates, including conditions and project association.
   * @see https://next.sonarqube.com/sonarqube/web_api/api/qualitygates
   */
  readonly qualitygates: {
    /**
     * Associate a project to a quality gate.
     *
     * Requires one of the following permissions:
     * - 'Administer Quality Gates'
     * - 'Administer' right on the specified project
     * @since 4.3
     * @see https://next.sonarqube.com/sonarqube/web_api/api/qualitygates?query=select
     */
    select(params: {
      /**
       * Name of the quality gate. Maximum length is 100 characters.
       * @since 8.4
       * @example 'SonarSource way'
       */
      readonly gateName: string;

      /**
       * Project key.
       * @since 6.1
       * @example 'my_project'
       */
      readonly projectKey: string;
    }): Promise<void>;
  };

  /**
   * Manage quality profiles.
   * @see https://next.sonarqube.com/sonarqube/web_api/api/qualityprofiles
   */
  readonly qualityprofiles: {
    /**
     * Associate a project with a quality profile.
     *
     * Requires one of the following permissions:
     * - 'Administer Quality Profiles'
     * - Administer right on the specified project
     * @since 5.2
     * @see https://next.sonarqube.com/sonarqube/web_api/api/qualityprofiles?query=add_project
     */
    add_project(params: {
      /** Quality profile language. */
      readonly language:
        | 'abap'
        | 'ansible'
        | 'apex'
        | 'azureresourcemanager'
        | 'c'
        | 'cloudformation'
        | 'cobol'
        | 'cpp'
        | 'cs'
        | 'css'
        | 'dart'
        | 'docker'
        | 'flex'
        | 'go'
        | 'ipynb'
        | 'java'
        | 'jcl'
        | 'js'
        | 'json'
        | 'jsp'
        | 'kotlin'
        | 'kubernetes'
        | 'objc'
        | 'php'
        | 'pli'
        | 'plsql'
        | 'py'
        | 'rpg'
        | 'ruby'
        | 'scala'
        | 'secrets'
        | 'swift'
        | 'terraform'
        | 'text'
        | 'ts'
        | 'tsql'
        | 'vb'
        | 'vbnet'
        | 'web'
        | 'xml'
        | 'yaml';

      /**
       * Project key.
       * @example 'my_project'
       */
      readonly project: string;

      /**
       * Quality profile name.
       * @example 'Sonar way'
       */
      readonly qualityProfile: string;
    }): Promise<void>;
  };

  /** @see https://next.sonarqube.com/sonarqube/web_api/api/server */
  readonly server: {
    /**
     * Version of SonarQube in plain text
     * @since 2.10
     * @see https://next.sonarqube.com/sonarqube/web_api/api/server?query=version
     * @example '6.3.0.1234'
     */
    version(): Promise<string>;
  };
}

export type WrapRequestFunction = <ReturnType>(func: () => PromiseLike<ReturnType> | ReturnType) => PromiseLike<ReturnType>;

export type PathToObject<T extends string, Obj = SonarQubeWebApi> = T extends `${infer Head}/${infer Tail}`
  ? Head extends keyof Obj
    ? PathToObject<Tail, Obj[Head]>
    : never
  : T extends keyof Obj
    ? Obj[T] extends (...args: unknown[]) => unknown
      ? Obj[T]
      : never
    : never;

/** Represents a Web API client interacting with SonarQube instances. */
export interface SonarClient {
  /** Web API methods for SonarQube. */
  readonly api: SonarQubeWebApi;

  /**
   * Request a POST Web API request to a SonarQube server.
   * @param method HTTP method as `'POST'`
   * @param apiPath API path, e.g. `'projects/search'`
   * @param queryParams URL Query parameters
   */
  request(method: 'POST', apiPath: string, queryParams: object): Promise<void>;

  /**
   * Request a GET Web API request to a SonarQube server.
   * @param method HTTP method as `'GET'`
   * @param apiPath API path, e.g. `'projects/search'`
   * @param queryParams URL Query parameters
   * @param type Force the response to be a `string`
   */
  request(method: 'GET', apiPath: string, queryParams: object, type: 'text'): Promise<string>;

  /**
   * Request a GET Web API request to a SonarQube server.
   * @param method HTTP method as `'GET'`
   * @param apiPath API path, e.g. `'projects/search'`
   * @param queryParams URL Query parameters
   * @param type Force the response to be an object
   */
  request<T extends string>(method: 'GET', apiPath: T, queryParams: object, type: 'json'): Promise<Awaited<ReturnType<PathToObject<T>>>>;
}

/** Represents a SonarQube Web API response error. */
export type SonarError = Error & {
  /** The error message. */
  readonly message: string;
  /** The HTTP status code. */
  readonly status: number;
  /** The error message. */
  readonly error: string;
  /** Error messages from SonarQube. */
  readonly errors: { readonly msg: string }[];
};

/** Create a new SonarQube client instance. */
export interface CreateClientOptions {
  /**
   * The base URL for the SonarQube instance.
   * This should be the root URL without any trailing slashes.
   * @example 'https://sonarqube.example.com'
   */
  readonly baseURL: string;

  /** The authentication token for your SonarQube instance. */
  readonly token?: string;

  /**
   * A function that wraps around the API requests.
   * Can be used to limit the API requests or add custom logic around it.
   * If not provided, the default behavior is simply to invoke the API request.
   */
  readonly wrap?: WrapRequestFunction;
}
