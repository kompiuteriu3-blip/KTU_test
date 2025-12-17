# TestApp — paprasta GitOps žiniatinklio programa

Minimalus Node.js (Express) + Kustomize. `Argo CD` automatiškai sinchronizuoja pakeitimus iš Git. Išorinis srautas nukreipiamas per `Cilium Gateway` (HTTPRoute).

## Ką daro
- Pagrindinis puslapis (`/`) rodo dideles raides su `MESSAGE` centre.
- Yra `GET /api` (JSON) ir `GET /healthz` (sveikatos patikra).
- Konfigūracija per `configMapGenerator` (`k8s/kustomization.yaml`), raktai: `MESSAGE`, `PORT`.

## Sukūrimas ir įkėlimas į Harbor
```powershell
docker login harbor.apps.kubernetes-okd.digidefence.ktu.edu -u <vartotojas> -p "<slaptažodis>"
$TAG="0.1.3"
$IMAGE="harbor.apps.kubernetes-okd.digidefence.ktu.edu/library/webapp:$TAG"
docker build -t $IMAGE .
docker push $IMAGE
```

## Pradinis paleidimas (Kubernetes + Argo CD)
```powershell
# Sukurti namespace ir registry secret
kubectl create namespace webapp
kubectl -n webapp create secret docker-registry harbor-creds --docker-server=https://harbor.apps.kubernetes-okd.digidefence.ktu.edu --docker-username=<vartotojas> --docker-password "<slaptažodis>" --docker-email "admin@example.com"

# Užregistruoti Argo CD aplikaciją
kubectl apply -f .\argocd\application.yaml

# Patikrinti resursus
kubectl -n webapp get deploy,svc
```


## Kaip keisti pranešimą (auto-perdiegimas)
- Redaguokite `k8s/kustomization.yaml` dalį `configMapGenerator` ir pakeiskite `MESSAGE` reikšmę.
- Commit + push į Git — `Argo CD` aptiks pakeitimą ir automatiškai atnaujins pod.

## Kaip atnaujinti conteineri (tag)
- Pakeiskite `images` → `newTag` `k8s/kustomization.yaml` faile į naują `$TAG`.
- Commit + push — `Argo CD` sinchronizuos naują versiją.
