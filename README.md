# backstage-claim-registry-plugin

> [!IMPORTANT]
> **Dieses Repository ist archiviert. Der gepflegte Code liegt im Monorepo.**
>
> | | |
> |---|---|
> | Aktueller Code | [`stuttgart-things/sthings-backstage`](https://github.com/stuttgart-things/sthings-backstage) → `packages/backend/src/plugins/scaffolder-claim-registry` (Frontend: `packages/app/src/scaffolder/RegistryClaimPickerExtension.tsx`) |
> | Warum | Dieses Repo war eine Kopie zum Verteilen und ist seit **März 2026** unberührt, während das Plugin im Monorepo weitergepflegt wurde (dort zuletzt mit dem Backstage-Upgrade 1.47.0 → 1.49.3). Wer hier installiert, bekommt einen halbjahresalten Stand. |
> | Künftige Verteilung | Als npm-Package nach GHCR unter `@stuttgart-things/*`, statt Dateien zu kopieren. Siehe [sthings-backstage#120](https://github.com/stuttgart-things/sthings-backstage/issues/120). |
>
> Issues und PRs bitte im Monorepo. Der Inhalt unten bleibt als historischer Stand stehen.


Backstage plugin for deleting claims via GitHub Pull Requests using the [Machinery Registry API](https://github.com/stuttgart-things/machinery-registry-api).

## Components

### Frontend: `RegistryClaimPicker`

Custom scaffolder field extension (`ui:field: RegistryClaimPicker`) that:

- Fetches claims from the Machinery Registry API via Backstage proxy
- Renders a Material-UI Select dropdown with claim names and metadata
- Supports optional query param filters via `ui:options` (status, category, template)
- Shows claim details panel (template, namespace, created date, source) below the dropdown

### Backend: `claim-registry:delete`

Custom scaffolder action that creates a GitHub PR to delete a claim:

- Removes the claim directory (e.g., `claims/{category}/{claimName}/`)
- Updates the parent `kustomization.yaml` to remove the resource entry
- Creates a PR branch and opens a pull request

**Inputs**: `claimName`, `claimPath`, `claimCategory`, `repository`, `targetBranch`
**Outputs**: `pullRequestUrl`, `pullRequestNumber`

## Installation

### 1. Copy plugin files to your Backstage instance

```bash
# Backend module
cp -r backend/scaffolder-claim-registry/ <backstage>/packages/backend/src/plugins/scaffolder-claim-registry/

# Frontend field extension
cp -r frontend/RegistryClaimPicker/ <backstage>/packages/app/src/scaffolder/RegistryClaimPicker/
```

### 2. Register the backend module

In `packages/backend/src/index.ts`:

```typescript
backend.add(import('./plugins/scaffolder-claim-registry'));
```

### 3. Register the frontend field extension

In `packages/app/src/App.tsx`:

```typescript
import { RegistryClaimPickerFieldExtension } from './scaffolder/RegistryClaimPicker';

// Inside <ScaffolderPage> route:
<ScaffolderFieldExtensions>
  <RegistryClaimPickerFieldExtension />
</ScaffolderFieldExtensions>
```

### 4. Configure the proxy

Add to `app-config.yaml`:

```yaml
proxy:
  endpoints:
    '/machinery-registry':
      target: 'http://<machinery-registry-api-url>:8080'
      changeOrigin: true
      pathRewrite:
        '^/api/proxy/machinery-registry': ''
      allowedHeaders: ['*']
      credentials: 'dangerously-allow-unauthenticated'
```

### 5. Ensure GitHub integration

```yaml
integrations:
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}
```

## Usage in Templates

```yaml
parameters:
  - title: Select Claim
    properties:
      claimToDelete:
        title: Claim to Delete
        type: string
        ui:field: RegistryClaimPicker
        ui:options:
          status: active

steps:
  - id: delete-claim
    name: Delete Claim via PR
    action: claim-registry:delete
    input:
      claimName: ${{ parameters.claimToDelete }}
      claimPath: # resolved from picker
      claimCategory: # resolved from picker
      repository: stuttgart-things/harvester
      targetBranch: main
```

See [`docs/app-config.example.yaml`](docs/app-config.example.yaml) for a complete configuration example.
