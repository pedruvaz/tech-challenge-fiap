# metrics-server — requisito do HPA.
#
# O `k8s/50-hpa.yaml` escala por CPU, e sem a API `metrics.k8s.io` o HPA fica
# com target `<unknown>` e nunca escala. Escalabilidade automática é item
# avaliado, então isso não pode ficar como passo manual esquecido.
#
# Ainda não está confirmado se o EKS Auto Mode já entrega o metrics-server.
# Depois do primeiro apply:
#
#     kubectl top nodes
#
# Se responder, o Auto Mode já cobre e dá para setar
# `install_metrics_server = false`. Se der erro de API não encontrada, este
# recurso resolve.
#
# Escape hatch, caso o provider helm dê trabalho:
#
#     kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
resource "helm_release" "metrics_server" {
  count = var.install_metrics_server ? 1 : 0

  name       = "metrics-server"
  repository = "https://kubernetes-sigs.github.io/metrics-server/"
  chart      = "metrics-server"
  # Versão exata: o provider helm 3.x rejeita constraints (~>) neste campo
  version    = "3.12.2"
  namespace  = "kube-system"

  depends_on = [module.eks]
}
