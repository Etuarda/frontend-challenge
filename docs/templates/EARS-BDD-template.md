<!--
  Template de critérios EARS + cenários BDD.

  EARS (Easy Approach to Requirements Syntax) — Alistair Mavin e equipe, Rolls-Royce,
  publicado em 2009 a partir do trabalho deles com regras de aeronavegabilidade de
  motores a jato. Guia oficial: https://alistairmavin.com/ears/

  BDD (Behavior-Driven Development), formato Given/When/Then — Dan North, "Introducing
  BDD", 2006: https://dannorth.net/blog/introducing-bdd/

  REGRA DA CASA DESTA SEMANA: o agente escreve EARS e BDD bonitos sobre QUALQUER coisa,
  inclusive sobre um problema que não existe. Só você sabe se o critério corresponde à
  dor real que está no RESEARCH.md / Mapa da Dor. Antes de aceitar um critério gerado
  pelo agente, pergunte: "isso aqui resolve a frase que a pessoa que sente a dor diria?"
  Se você não consegue apontar em qual frase do RESEARCH.md este critério se apoia, ele
  não entra.
-->

# Critérios EARS — <nome do artefato/feature>

<!--
  Os 5 padrões da notação. Use o gabarito de frase exatamente — é o que torna o critério
  verificável em vez de vago. Preencha pelo menos 5, misturando padrões (não precisa ser
  1 de cada, mas não force os 5 tipos se sua feature só tem 2 comportamentos reais).
-->

1. **Ubíqua** (sempre verdade, sem gatilho):
   O `<sistema/artefato>` deve `<resposta>`.

2. **Orientada a evento** (reage a algo que acontece):
   Quando `<gatilho>`, o `<sistema/artefato>` deve `<resposta>`.

3. **Orientada a estado** (vale enquanto uma condição se mantém):
   Enquanto `<precondição>`, o `<sistema/artefato>` deve `<resposta>`.

4. **Feature opcional** (só se aquele recurso existir):
   Onde `<feature/variação está presente>`, o `<sistema/artefato>` deve `<resposta>`.

5. **Comportamento indesejado** (o que fazer quando algo dá errado):
   Se `<gatilho de erro/exceção>`, então o `<sistema/artefato>` deve `<resposta>`.

<!-- Escreva os 5 de verdade abaixo, um por linha, na linguagem ubíqua do seu domínio
     (a mesma que a semana 5 construiu — não invente sinônimo novo pro mesmo conceito). -->

- [ ] 1.
- [ ] 2.
- [ ] 3.
- [ ] 4.
- [ ] 5.

---

# Cenários BDD — <nome do artefato/feature>

<!--
  Formato Gherkin (Dado/Quando/Então = Given/When/Then). Escreva em português, mas
  mantenha a estrutura de 3 linhas por cenário — é esse formato que a semana 8
  (Verificadores) vai rodar literalmente com um runner de BDD (ex.: cucumber-js ou
  jest-cucumber), sem reescrever. Não escreva prosa disfarçada de Gherkin.
-->

### Cenário 1: <nome curto>

```gherkin
Dado <contexto/estado inicial>
Quando <ação ou evento>
Então <resultado esperado, verificável>
```

### Cenário 2: <nome curto>

```gherkin
Dado <contexto/estado inicial>
Quando <ação ou evento>
Então <resultado esperado, verificável>
```

### Cenário 3: <nome curto — cubra um caso de erro/limite, não só o caminho feliz>

```gherkin
Dado <contexto/estado inicial>
Quando <ação ou evento>
Então <resultado esperado, verificável>
```

---

## Exemplo preenchido (domínio 4 do catálogo — Avaliação automatizada de projetos por IA)

**Dor real (do RESEARCH.md):** "A facilitadora corrige 75 entregas por semana à mão e
não tem como saber se o aluno rodou os testes antes de entregar."

**EARS:**

1. Ubíqua: O verificador de entrega deve registrar se `npm test` passou antes da submissão.
2. Orientada a evento: Quando o aluno submete o link do repositório, o verificador deve
   rodar a suíte de testes do projeto e salvar o resultado.
3. Orientada a estado: Enquanto a suíte de testes não roda (erro de ambiente, faltou
   dependência), o verificador deve marcar a entrega como "não verificável" em vez de
   "reprovada".
4. Feature opcional: Onde o repositório tiver um `REVIEW.md`, o verificador deve incluir
   um resumo dele no relatório pra facilitadora.
5. Comportamento indesejado: Se os testes não rodarem em 2 minutos, então o verificador
   deve interromper e marcar como "timeout", não travar a fila de correção.

**BDD:**

```gherkin
Cenário: entrega com testes passando
Dado um repositório com "npm test" configurado e todos os testes verdes
Quando o aluno submete o link do repositório
Então o verificador registra "testes: passou" no relatório da facilitadora
```

```gherkin
Cenário: entrega sem comando de teste configurado
Dado um repositório sem script "test" no package.json
Quando o aluno submete o link do repositório
Então o verificador marca a entrega como "não verificável" e não conta como reprovação
```

```gherkin
Cenário: suíte de testes trava
Dado um repositório cuja suíte de testes não termina em 2 minutos
Quando o verificador tenta rodar "npm test"
Então o verificador interrompe a execução e marca a entrega como "timeout"
```
