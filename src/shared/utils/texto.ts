/**
 * Reduz um nome à sua forma de comparação: minúsculas, sem acentos e sem
 * espaços nas pontas.
 *
 * Em português o mesmo produto chega de várias formas — "Café", "cafe",
 * "CAFÉ " — e comparar texto cru trataria cada uma como item diferente,
 * enchendo o catálogo de duplicatas. O nome exibido continua sendo o que o
 * usuário digitou; só a comparação usa esta forma.
 */
export function normalizarNome(texto: string): string {
  return texto.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** `true` quando os dois nomes representam o mesmo item, ignorando acento e caixa. */
export function mesmoNome(a: string, b: string): boolean {
  return normalizarNome(a) === normalizarNome(b);
}

/**
 * Procura, no catálogo, o item que o nome vindo de um cupom fiscal
 * representa.
 *
 * O cupom escreve abreviado e em caixa alta — "ARROZ TIPO 1 5KG",
 * "CEBOLA MD PACOTE", "GUAR.ANTARC.PET 2LT ZERO". Sem casar esses nomes com
 * o catálogo, cada compra lida por QR Code cadastraria dezenas de itens
 * novos, e o preço médio por produto nunca acumularia histórico: "Arroz" e
 * "ARROZ TIPO 1 5KG" seriam produtos diferentes.
 *
 * A busca exige **palavra inteira** — sem isso "SALGADINHO" casaria com
 * "Sal" e "PANETONE" com "Pão". Havendo mais de um candidato, vence o nome
 * mais longo, que é o mais específico: "Leite condensado" ganha de "Leite".
 *
 * @returns o nome como está cadastrado no catálogo, ou `null` se não houver
 *          correspondência — nesse caso o nome do cupom é mantido.
 */
export function casarComCatalogo(
  nomeDoCupom: string,
  nomesDoCatalogo: readonly string[]
): string | null {
  const alvo = normalizarNome(nomeDoCupom);
  if (!alvo) return null;

  let melhor: string | null = null;
  let melhorTamanho = 0;

  for (const candidato of nomesDoCatalogo) {
    const normalizado = normalizarNome(candidato);
    if (!normalizado) continue;

    // Nome idêntico encerra a busca: não há correspondência melhor.
    if (normalizado === alvo) return candidato;

    if (!contemPalavras(alvo, normalizado)) continue;
    if (normalizado.length > melhorTamanho) {
      melhor = candidato;
      melhorTamanho = normalizado.length;
    }
  }

  return melhor;
}

/**
 * `true` quando `trecho` aparece em `texto` delimitado por início/fim ou por
 * caractere que não seja letra ou número — o cupom usa ponto e hífen como
 * separador ("LING.PIF-PAF CALABRESA"), então espaço sozinho não basta.
 */
function contemPalavras(texto: string, trecho: string): boolean {
  const posicao = texto.indexOf(trecho);
  if (posicao < 0) return false;

  const antes = texto[posicao - 1];
  const depois = texto[posicao + trecho.length];
  const ehLimite = (c: string | undefined) => c === undefined || !/[a-z0-9]/.test(c);

  return ehLimite(antes) && ehLimite(depois);
}
