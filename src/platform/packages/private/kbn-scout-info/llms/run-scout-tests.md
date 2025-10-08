# Run Scout tests

This article explains how to run Scout tests locally and on Elastic Cloud. For additional guidance, refer to the public-facing `@kbn/scout` [README](https://github.com/elastic/kibana/blob/main/src/platform/packages/shared/kbn-scout/README.md#how-to-use).

> **The same commands for UI and API testing**: The commands below work the same way for both **UI** and **API** tests. To run API tests, simply point the command to the Playwright configuration file that contains your API tests.

---

## Run Scout tests against a local deployment

Scout requires both Kibana and Elasticsearch to be running before executing tests against a local deployment.

To **start the servers**, use the Scout CLI command:

```bash
node scripts/scout.js start-server [--stateful|--serverless=[es|oblt|security]]
```

Then, in a separate terminal, **run the tests** with:

```bash
npx playwright test --config <plugin-path>/test/scout/ui/playwright.config.ts \
  --project local \
  --grep [@ess|@svlSearch|@svlSecurity|@svlOblt|@svlChat]
```

> ⚠️ **Important:** We use `--project local` to run tests against a local Elasticsearch and Kibana deployment. This requires no additional configuration on your part other than running the servers. We'll explore other `--project` options in the next section.

> The `--grep` option can be used to filter tests by tag, such as `@ess`, `@svlSearch`, `@svlSecurity`, `@svlOblt`, or `@svlChat`. If you don't use `--grep`, all tests will be run, including those that may be incompatible with the distro you're targeting (e.g., stateful or serverless).

Alternatively, you can **start the servers and run the tests** with a single command:

```bash
node scripts/scout.js run-tests [--stateful|--serverless=[es|oblt|security]] \
  --config <plugin-path>/test/scout/ui/playwright.config.ts
```

When Scout starts Kibana and Elasticsearch locally, it saves the server configuration at `.scout/servers/local.json` and reads it when running the tests.

You can also pass a **folder** containing tests to the `run-tests` command with the `--testFiles` flag:

```bash
node scripts/scout.js run-tests [--stateful|--serverless=[es|oblt|security]] \
  --testFiles <plugin-path>/test/scout/ui/tests/test_sub_directory
```

The `--testFiles` flag also accepts a **comma-separated list of test files**:

```bash
node scripts/scout.js run-tests [--stateful|--serverless=[es|oblt|security]] \
  --testFiles <plugin-path>/test/scout/ui/tests/your_test_spec.ts,\
  <plugin-path>/test/scout/ui/tests/another_test_spec.ts
```

> ⚠️ **Important:** All the paths specified in the `--testFiles` flag must fall under the same Scout root directory (`scout/ui/tests`, `scout/ui/parallel_tests`, or `scout/api/tests`), and must belong to the **same Playwright config** file, which the Scout CLI command will automatically discover.

> **Running UI tests? Try out the headed or UI mode**: You can append `--headed` to your `npx playwright test` command to see the tests running in the browser. We also **highly** encourage you to check out Playwright's UI mode.

---

## Run Scout tests on Elastic Cloud

Scout also allows you to run tests on Elastic Cloud, but you must **manually** provide the server configuration to Scout.

### ECH (Stateful)

First, create or open `<KIBANA_ROOT>/.scout/servers/cloud_ech.json` and populate it with your deployment details. The `cloudUsersFilePath` key should point to a file defining the credentials for your Elastic Cloud users.

```json
{
  "serverless": false,
  "isCloud": true,
  "cloudHostName": "<elastic_cloud_hostname>",
  "cloudUsersFilePath": ".ftr/role_users.json",
  "hosts": {
    "kibana": "<kibana_deployment_url>",
    "elasticsearch": "<elasticsearch_deployment_url>"
  },
  "auth": {
    "username": "<deployment_username>",
    "password": "<deployment_password>"
  }
}
```

Then, run tests with `--project ech`:

```bash
npx playwright test --config <plugin-path>/test/scout/ui/playwright.config.ts \
  --project ech \
  --grep @ess
```

### MKI (Serverless)

First, create or open `<KIBANA_ROOT>/.scout/servers/cloud_mki.json` and populate it with your project details. The `cloudUsersFilePath` key should point to a file defining the credentials for your Elastic Cloud users.

```json
{
  "serverless": true,
  "projectType": "es",
  "isCloud": true,
  "cloudHostName": "<elastic_cloud_hostname>",
  "cloudUsersFilePath": ".ftr/role_users.json",
  "hosts": {
    "kibana": "<kibana_project_url>",
    "elasticsearch": "<elasticsearch_project_url>"
  },
  "auth": {
    "username": "<operator_username>",
    "password": "<operator_password>"
  }
}
```

_Note: Supported `projectType` values are `es` (Elasticsearch), `security` (Security), and `oblt` (Observability)._

Then, run tests with `--project mki`:

```bash
npx playwright test --config <plugin-path>/test/scout/ui/playwright.config.ts \
  --project mki \
  --grep [@svlSearch|@svlSecurity|@svlOblt|@svlChat]
```

> ⚠️ **Important:** We use `--project ech` to run tests on ECH and `--project mki` to run tests on MKI.

### Using the Scout CLI on Elastic Cloud

Alternatively, you can run tests on Elastic Cloud using the Scout CLI.

**For ECH (Stateful):**

```bash
node scripts/scout.js run-tests \
  --stateful \
  --testTarget=cloud \
  --config <plugin-path>/test/scout/ui/playwright.config.ts
```

**For MKI (Serverless):**

```bash
node scripts/scout.js run-tests \
  --serverless=[es|oblt|security] \
  --testTarget=cloud \
  --config <plugin-path>/test/scout/ui/playwright.config.ts
```
