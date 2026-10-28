/** True only for temporary GitHub/network conditions, never invalid paths/SHAs. */
export function isRetryableGitHubError(cause: unknown): boolean {
  if (!(cause instanceof Error)) return false;
  return /Limite de acesso do GitHub|GitHub indisponível|Sem conexão com o GitHub|Tempo de resposta do GitHub excedido|Erro ao consultar o GitHub/i
    .test(cause.message);
}
