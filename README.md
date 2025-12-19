# TestApp — GitOps testas

Node.js (Express) + Kustomize. `Argo CD` automatiškai sinchronizuoja pakeitimus iš Git. Išorinis srautas nukreipiamas per `Cilium Gateway` (HTTPRoute).

## Teksto pakeitimas
- Konfigūracija per `configMapGenerator` (`k8s/kustomization.yaml`)

## Sukūrimas ir įkėlimas į Harbor
```powershell
docker login harbor.apps.kubernetes-okd.digidefence.ktu.edu -u <vartotojas> -p "<slaptažodis>"
$TAG="0.1.0"
$IMAGE="harbor.apps.kubernetes-okd.digidefence.ktu.edu/library/webapp:$TAG"
docker build -t $IMAGE .
docker push $IMAGE
```

## Pradinis paleidimas (Kubernetes + Argo CD)
```powershell
# Sukurti namespace ir registry secret jeigu harbor projektas būtų privatus.
kubectl create namespace webapp
kubectl -n webapp create secret docker-registry harbor-creds --docker-server=https://harbor.apps.kubernetes-okd.digidefence.ktu.edu --docker-username=<vartotojas> --docker-password "<slaptažodis>" --docker-email "admin@example.com"

# Užregistruoti ArgoCD aplikaciją
kubectl apply -f .\argocd\application.yaml

# Patikrinti resursus
kubectl -n webapp get all

# Viska ištrinti
$pf = Join-Path $env:TEMP "finalizer-merge.json"
'{"metadata":{"finalizers":["resources-finalizer.argocd.argoproj.io"]}}' | Set-Content -Path $pf -Encoding ascii
kubectl -n argocd patch application webapp --type=merge --patch-file $pf
kubectl -n argocd delete application webapp
```


## Kaip keisti pranešimą (auto-perdiegimas)

## Kaip atnaujinti pasikeitus image tag

## Autoskaliavimas (nebūtina)
- Repo turi `k8s/hpa.yaml` (HPA). Pagal nutylėjimą jis neįjungtas.
- Įjungti: pridėkite `- hpa.yaml` į `k8s/kustomization.yaml` `resources` sąrašą, tada commit + push.

### Metrics Server
HPA reikalauja resursų metrikų.

### Apkrovos testas ir stebėjimas
```powershell
# Paleisti paprastą apkrovą klasteryje (be Harbor)
# Naudosime viešą busybox vaizdą su /bin/sh + wget begaline kilpa
kubectl -n webapp run load --image=busybox:1.36 --restart=Never -- /bin/sh -c "while true; do wget -q -O- http://webapp:8080/ > /dev/null; done"

# Stebėti HPA ir podų skaičių
kubectl -n webapp get hpa -w
kubectl -n webapp get pods -w

# Sustabdyti apkrovą
kubectl -n webapp delete pod load
```
