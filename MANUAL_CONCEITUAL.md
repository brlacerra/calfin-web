# Manual Conceitual do Sistema • calFin

Este documento apresenta a fundamentação teórica, as regras de negócio econômico-financeiras e as equações conceituais que regem todos os módulos do sistema **calFin**. 

O foco deste guia é **puramente conceitual**, dispensando sintaxe de linguagens de programação e privilegiando a lógica financeira, a modelagem matemática e as interpretações práticas de mercado.

---

## 1. Fundamentos da Matemática Financeira

### 1.1. O Valor do Dinheiro no Tempo (Time Value of Money - TVM)
O princípio fundamental que orienta todo o sistema é de que **uma unidade monetária disponível hoje vale mais do que a mesma unidade monetária no futuro**. Isso ocorre por três razões econômicas:
1. **Custo de Oportunidade**: O capital disponível no presente pode ser aplicado para render juros.
2. **Inflação**: A perda do poder aquisitivo da moeda ao longo do tempo.
3. **Incerteza / Risco**: A preferência pela liquidez imediata frente ao risco de inadimplência futura.

### 1.2. Convenção do Ano Comercial (Base 360)
Por convenção bancária e financeira internacional, as operações do sistema utilizam o **Ano Comercial**:
- **1 ano** = 360 dias
- **1 mês** = 30 dias

As 8 periodicidades padronizadas no sistema e seus respectivos pesos em dias são:
- **Diário (a.d.)**: 1 dia
- **Semanal (a.sem.)**: 7 dias
- **Mensal (a.m.)**: 30 dias *(unidade base do sistema)*
- **Bimestral (a.b.)**: 60 dias
- **Trimestral (a.t.)**: 90 dias
- **Quadrimestral (a.q.)**: 120 dias
- **Semestral (a.s.)**: 180 dias
- **Anual (a.a.)**: 360 dias

---

## 2. Módulo: Regime de Juros Simples (Capitalização Linear)

### Conceito
No regime de juros simples, a taxa de juros incide **exclusivamente sobre o capital inicial (principal)** ao longo de todo o prazo da operação. Os juros gerados em cada período não são incorporados ao principal para o cálculo dos juros dos períodos seguintes (não há anatocismo ou juros sobre juros).

O crescimento do montante acumulado ao longo do tempo é estritamente **linear**.

### Variáveis Envolvidas
- **$VP$ (Valor Presente / Capital Inicial)**: Quantia monetária aplicada ou emprestada no instante zero.
- **$VF$ (Valor Futuro / Montante)**: Soma do capital inicial com a totalidade dos juros acumulados ao término do período.
- **$J$ (Juros Totais)**: Remuneração total em dinheiro pelo uso do capital.
- **$i$ (Taxa de Juros)**: Percentual de rendimento por unidade de tempo.
- **$n$ (Prazo / Tempo)**: Duração da operação financeira.

### Equações Conceituais
1. **Montante Final**:
   $$VF = VP \cdot (1 + i \cdot n)$$

2. **Juros Totais**:
   $$J = VP \cdot i \cdot n$$

3. **Capital Inicial (Descapitalização Linear)**:
   $$VP = \frac{VF}{1 + i \cdot n}$$

4. **Taxa de Juros Implícita**:
   $$i = \frac{VF - VP}{VP \cdot n} = \frac{J}{VP \cdot n}$$

5. **Prazo da Operação**:
   $$n = \frac{VF - VP}{VP \cdot i} = \frac{J}{VP \cdot i}$$

### Regra de Proporcionalidade Linear
Para períodos em unidades temporais distintas (ex: taxa ao mês e prazo em dias), aplica-se a conversão proporcional direta:
$$i_{\text{ajustada}} = i \cdot \left(\frac{\text{dias do prazo}}{\text{dias da taxa}}\right)$$

---

## 3. Módulo: Regime de Juros Compostos (Capitalização Exponencial)

### Conceito
No regime de juros compostos, os juros produzidos ao fim de cada período de capitalização são **incorporados ao capital principal**, passando também a render juros no período subsequente. Trata-se do fenômeno conhecido popularmente como **"juros sobre juros"**.

O crescimento do montante ao longo do tempo é **exponencial**, refletindo a realidade da quase totalidade dos contratos bancários, títulos públicos e investimentos do mercado financeiro moderno.

### Equações Conceituais
1. **Montante Final**:
   $$VF = VP \cdot (1 + i)^n$$

2. **Capital Inicial (Valor Presente)**:
   $$VP = \frac{VF}{(1 + i)^n} = VF \cdot (1 + i)^{-n}$$

3. **Juros Compostos Totais**:
   $$J = VF - VP = VP \cdot \left[(1 + i)^n - 1\right]$$

4. **Taxa Composta Implícita**:
   $$i = \left(\frac{VF}{VP}\right)^{\frac{1}{n}} - 1$$

5. **Prazo de Acumulação**:
   $$n = \frac{\ln(VF / VP)}{\ln(1 + i)} = \frac{\log_{10}(VF / VP)}{\log_{10}(1 + i)}$$

### Regra de Equivalência Composta de Taxas
Duas taxas compostas são equivalentes quando, aplicadas a um mesmo capital inicial pelo mesmo período total de tempo, geram rigorosamente o mesmo montante final:
$$(1 + i_{\text{destino}}) = (1 + i_{\text{origem}})^{\frac{\text{dias do período de destino}}{\text{dias do período de origem}}}$$

---

## 4. Módulo: Desconto Comercial Composto (DCC - Desconto "Por Fora")

### Conceito
O desconto comercial, também denominado **desconto bancário** ou **desconto por fora**, é a modalidade tradicionalmente adotada por instituições financeiras na antecipação de títulos de crédito, duplicatas e recebíveis.

A regra fundamental do desconto comercial composto é que a taxa de desconto $d$ incide **periodicamente sobre o valor nominal futuro do título ($N$)**, e não sobre o capital líquido liberado ($A$). Em virtude disso, o valor nominal diminui exponencialmente à medida que retrocede no tempo.

### Variáveis
- **$N$ (Valor Nominal)**: Valor de face impresso no título, a ser resgatado na data de vencimento futura.
- **$A$ (Valor Atual / Líquido)**: Quantia monetária efetivamente recebida pelo tomador na data de antecipação.
- **$D_c$ (Desconto Comercial)**: Abatimento monetário retido pela instituição financeira ($D_c = N - A$).
- **$d$ (Taxa de Desconto Comercial)**: Taxa cobrada pelo intermediador.
- **$n$ (Prazo de Antecipação)**: Tempo restante até o vencimento do título.

### Equações Conceituais
1. **Valor Atual Líquido**:
   $$A = N \cdot (1 - d)^n$$

2. **Desconto Comercial Composto**:
   $$D_c = N - A = N \cdot \left[1 - (1 - d)^n\right]$$

3. **Valor Nominal Necessário para Obter $A$**:
   $$N = \frac{A}{(1 - d)^n}$$

4. **Taxa de Desconto Implícita**:
   $$d = 1 - \left(\frac{A}{N}\right)^{\frac{1}{n}}$$

5. **Prazo de Antecipação**:
   $$n = \frac{\ln(A / N)}{\ln(1 - d)}$$

---

## 5. Módulo: Desconto Racional Composto (DRC - Desconto "Por Dentro")

### Conceito
O desconto racional, também denominado **desconto real** ou **desconto por dentro**, fundamenta-se na simetria matemática rigorosa com a capitalização composta. 

Nesta modalidade, a taxa incide **exclusivamente sobre o valor atual ($A$)** (o capital real no presente), de tal forma que o valor nominal ($N$) representa exatamente o montante que $A$ produziria se aplicado à mesma taxa composta durante o prazo restante.

### Comparação Conceitual: Desconto Comercial vs. Racional
Para um mesmo título ($N$), mesmo prazo ($n$) e mesma taxa nominal ($i = d$):
$$D_c > D_r \quad \text{e, consequentemente,} \quad A_{\text{comercial}} < A_{\text{racional}}$$
Portanto, o desconto comercial retém mais dinheiro e é mais oneroso para quem antecipa o título do que o desconto racional.

### Equações Conceituais
1. **Valor Atual Racional**:
   $$A = \frac{N}{(1 + i)^n} = N \cdot (1 + i)^{-n}$$

2. **Desconto Racional Composto**:
   $$D_r = N - A = N \cdot \left[1 - (1 + i)^{-n}\right]$$

3. **Valor Nominal**:
   $$N = A \cdot (1 + i)^n$$

4. **Taxa Racional Implícita**:
   $$i = \left(\frac{N}{A}\right)^{\frac{1}{n}} - 1$$

5. **Prazo de Antecipação**:
   $$n = \frac{\ln(N) - \ln(A)}{\ln(1 + i)}$$

---

## 6. Módulo: Sistema de Amortização Constante (SAC)

### Conceito
O SAC é um dos principais sistemas de financiamento imobiliário e de crédito de longo prazo no Brasil. Sua característica distintiva é a **constância absoluta da parcela de amortização do capital** ao longo de todos os períodos contratuais.

Toda prestação paga pelo mutuário é composta pela soma de duas parcelas:
$$\text{Prestação } (PMT) = \text{Amortização } (A) + \text{Juros } (J)$$

No SAC:
1. A **Amortização ($A$)** é invariável em todas as parcelas: $A = \frac{VP}{n}$.
2. O **Saldo Devedor ($SD$)** decresce em progressão aritmética à razão exata de $A$ a cada período.
3. Como os juros de cada mês incidem sobre o saldo devedor remanescente do mês anterior, os **Juros ($J$) diminuem mês a mês**.
4. Consequentemente, as **Prestações ($PMT$) são decrescentes**, sendo a primeira a mais alta e a última a mais baixa do contrato.

### Equações Conceituais
Para um financiamento de valor $VP$, prazo de $n$ períodos e taxa de juros periódica $i$:

1. **Amortização Periódica Constante**:
   $$A = \frac{VP}{n}$$

2. **Saldo Devedor após o pagamento da prestação $t$ ($t \in [1, n]$)**:
   $$SD_t = VP - A \cdot t = VP \cdot \left(1 - \frac{t}{n}\right)$$

3. **Juros da Prestação de ordem $t$**:
   Os juros decorrem do saldo remanescente do período anterior ($SD_{t-1}$):
   $$J_t = SD_{t-1} \cdot i = \left[VP - A \cdot (t - 1)\right] \cdot i = \frac{VP}{n} \cdot (n - t + 1) \cdot i$$

4. **Valor da Prestação de ordem $t$**:
   $$PMT_t = A + J_t = \frac{VP}{n} \cdot \left[1 + (n - t + 1) \cdot i\right]$$

---

## 7. Módulo: Fator de Valor Presente (FVP / Sistema Francês - Tabela Price)

### Conceito
O Sistema Francês de Amortização (ou **Tabela Price**, quando associado a taxas nominais padronizadas) é o modelo predominante em crédito ao consumidor, financiamento de veículos e empréstimos pessoais.

Ao contrário do SAC, no Sistema Price:
- As **prestações ($PMT$) são rigorosamente iguais e constantes** durante todo o período.
- A composição interna de cada prestação se inverte ao longo do tempo: no início, a maior parte da prestação é juro e a menor é amortização; ao final, a maior parte é amortização e os juros são residuais.

### O Fator de Anuidade / FVP
O **Fator de Valor Presente ($FVP$)** representa a soma descontada a valor presente de uma série uniforme de $n$ pagamentos unitários de R$ 1,00 descontados à taxa $i$:
$$FVP = \sum_{t=1}^n \frac{1}{(1 + i)^t} = \frac{1 - (1 + i)^{-n}}{i}$$

### Equações Conceituais
1. **Prestação Constante ($PMT$)**:
   A prestação é obtida dividindo o valor financiado pelo FVP (ou multiplicando pelo coeficiente de financiamento $1/FVP$):
   $$PMT = \frac{VP}{FVP} = VP \cdot \left[\frac{i}{1 - (1 + i)^{-n}}\right]$$

2. **Valor Presente Financiável para dada Prestação**:
   $$VP = PMT \cdot FVP = PMT \cdot \left[\frac{1 - (1 + i)^{-n}}{i}\right]$$

---

## 8. Módulo: Estrutura de Taxas & Equivalências

### 8.1. Taxa Nominal vs. Taxa Efetiva
- **Taxa Nominal ($i_k$)**: É uma taxa apenas de referência contratual cujo período de declaração não coincide com o período de capitalização (ex: "taxa de 18% ao ano com capitalização mensal").
- **Taxa Efetiva ($i$)**: É a taxa real que incide diretamente sobre o capital no intervalo de tempo de sua capitalização:
  $$i = \frac{i_k}{k}$$
  *(onde $k$ é o número de vezes que a taxa se capitaliza dentro do período de anúncio).*

### 8.2. Conversão Maior para Menor e Menor para Maior (Regime Composto)
- **De menor período para maior período** (ex: mensal para anual):
  $$i_{\text{maior}} = (1 + i_{\text{menor}})^n - 1$$
- **De maior período para menor período** (ex: anual para mensal):
  $$i_{\text{menor}} = (1 + i_{\text{maior}})^{\frac{1}{n}} - 1$$

### 8.3. Distorção: Taxa Comercial vs. Taxa Efetiva Real
Quando uma operação é anunciada como "desconto de 3% ao mês por fora", a taxa de juros real suportada pelo tomador **é sempre maior do que 3%**, porque o tomador recebe menos dinheiro líquido mas paga juros calculados sobre o valor cheio de face.

A conversão conceitual entre taxa de desconto comercial simples ($d$) e taxa efetiva real simples ($i$) é regida por:
$$i_{\text{efetiva}} = \frac{d}{1 - d \cdot n}$$
$$d_{\text{comercial}} = \frac{i}{1 + i \cdot n}$$

---

## 9. Módulo: Valor Presente Líquido (VPL) & Engenharia Econômica

### Conceito
O **Valor Presente Líquido ($VPL$)** é a métrica mais robusta da Engenharia Econômica e Finanças Corporativas para avaliação de projetos de investimento e orçamento de capital.

O método do VPL consiste em:
1. Mapear o investimento inicial no período zero (saída de caixa, $-I_0$).
2. Projetar todas as entradas e saídas líquidas de caixa futuras ($FC_1, FC_2, \dots, FC_n$).
3. Descontar todos os fluxos futuros para o momento presente através da **Taxa Mínima de Atratividade (TMA)** ou Custo de Oportunidade do Capital.
4. Somar eventual **Valor Residual ($VR$)** obtido com a liquidação de ativos no encerramento do projeto.
5. Subtrair o investimento inicial do valor presente somado dos fluxos.

### Equação Conceitual do VPL
$$VPL = -I_0 + \sum_{j=1}^n \frac{FC_j}{(1 + TMA)^j} + \frac{VR}{(1 + TMA)^k}$$

Onde:
- $I_0$: Investimento inicial desembolsado no instante zero.
- $FC_j$: Fluxo de caixa líquido esperado no período $j$.
- $TMA$: Taxa Mínima de Atratividade / Custo Médio Ponderado de Capital (WACC).
- $VR$: Valor residual do ativo ao final do ciclo útil (na data $k$).

### Critério Formal de Decisão de Investimento
| Condição | Significado Econômico | Parecer Executivo |
| :--- | :--- | :--- |
| **$VPL > 0$** | O projeto remunera o capital acima do custo de oportunidade e gera acréscimo de riqueza líquida para a empresa. | **ACEITAR O PROJETO** |
| **$VPL < 0$** | O projeto rende menos do que a taxa mínima aceitável, destruindo valor econômico. | **RECUSAR O PROJETO** |
| **$VPL = 0$** | O retorno é exatamente igual à taxa de atratividade; a decisão financeira é neutra/indiferente. | **INDIFERENTE** |

### Conceitos Correlatos de Engenharia Econômica
- **Payback Simples**: Tempo necessário para recuperar o investimento inicial sem considerar o desconto do dinheiro no tempo (soma nominal direta dos fluxos).
- **Payback Descontado**: Tempo necessário para que a soma acumulada dos fluxos de caixa *descontados à TMA* iguale o capital investido inicialmente. Representa com fidelidade o momento de ponto de equilíbrio (*breakeven financeiro*) do projeto.

---

## 10. Resumo Sinóptico dos Módulos

```
                                SISTEMA calFin
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
    CAPITALIZAÇÃO                  DESCONTO                     FINANCIAMENTO
  • Juros Simples             • Comercial Composto (DCC)       • SAC (Amortização Constante)
    (Linear: VF = VP(1+in))     (Por fora: A = N(1-d)ⁿ)          (A = VP/n ; PMT decrescente)
  • Juros Compostos           • Racional Composto (DRC)        • FVP / Tabela Price
    (Exponencial: VF = VP(1+i)ⁿ)(Por dentro: A = N(1+i)⁻ⁿ)       (PMT = VP/FVP ; PMT constante)
         │                             │                             │
         └─────────────────────────────┼─────────────────────────────┘
                                       │
         ┌─────────────────────────────┴─────────────────────────────┐
         ▼                                                           ▼
     ESTRUTURA DE TAXAS                                    ENGENHARIA ECONÔMICA
  • Taxas Equivalentes (eq_comp)                         • Valor Presente Líquido (VPL)
  • Taxa Nominal vs Efetiva (i = ik/k)                   • Payback Simples e Descontado
  • Distorção Comercial vs Efetiva                       • Critério de Decisão (Aceitar/Recusar)
```

---
*Manual conceitual elaborado para fins acadêmicos e corporativos. Padrão ABNT / BACEN / CVM.*
