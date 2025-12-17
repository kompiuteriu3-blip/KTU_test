# TestApp Web — Minimal GitOps with Argo CD + Cilium

Minimal Express app + single Kustomize folder so changes are easy and Argo CD can auto-pick updates.

## App
- Endpoint `/` returns JSON with message + timestamp
- Config via env vars: `MESSAGE`, `PORT` (default 8080)

## Build and Push (Harbor)
Use `harbor.apps.kubernetes-okd.digidefence.ktu.edu` and set `<password>`.

```powershell
docker login harbor.apps.kubernetes-okd.digidefence.ktu.edu -u admin -p "<password>"
$IMAGE="harbor.apps.kubernetes-okd.digidefence.ktu.edu/library/webapp:0.1.0"
docker build -t $IMAGE .
docker push $IMAGE
```

## Kubernetes (once)
Create namespace and registry secret, then apply Kustomize.

```powershell
kubectl create namespace webapp
kubectl create secret docker-registry harbor-creds -n webapp --docker-server=https://harbor.apps.kubernetes-okd.digidefence.ktu.edu --docker-username=admin --docker-password="<password>" --docker-email="admin@example.com"
kubectl apply -k .\k8s
kubectl -n webapp get deploy,svc,httproute
```

HTTPRoute (`k8s/httproute.yaml`) references Cilium Gateway `apps-gw` in namespace `apps-gateway` and exposes hostname `webapp.apps.kubernetes-okd.digidefence.ktu.edu`.

## Argo CD (GitOps)
Point `argocd/application.yaml` to your Git repo (`repoURL`) and path `k8s`. It includes annotations for Argo CD Image Updater to auto-bump image tags when new versions appear in Harbor.

```powershell
kubectl apply -f .\argocd\application.yaml
kubectl -n argocd get applications webapp
```

### Auto-update flow
1. You change code and push a new image to Harbor (e.g., `0.1.1`).
2. Argo CD Image Updater detects the new tag and writes it back to `k8s/kustomization.yaml`.
3. Argo CD sees the manifest change and syncs the deployment.

> Note: Ensure Argo CD Image Updater is installed in your cluster and configured to access Harbor.

## Local Dev
```powershell
npm install
$env:MESSAGE = "Hello local!"; $env:PORT = "8080"; npm start
# Visit http://localhost:8080
```

## Where to edit
- App: `src/server.js` (business logic)
- Config: `k8s/configmap.yaml` (`MESSAGE`, `PORT`)
- Image tag (managed by Image Updater): `k8s/kustomization.yaml`
