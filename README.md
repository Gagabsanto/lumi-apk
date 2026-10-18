# Lumi

Organizador de galeria para Android. Lê fotos e vídeos do celular, agrupa por pasta e por nome de arquivo
(prints por aplicativo, conversas, vídeos), mostra tudo num visualizador com deslize e exclui itens com a
confirmação do próprio Android.

- Pacote Android: `com.gagabsanto.lumi` (não muda nunca)
- Fase atual: **1 – núcleo** (sem inteligência artificial; a única coisa que usa internet é a consulta de versão nova, ver 1.12.0)
- Versão deste pacote: **1.13.0** (código 25)
- Compilação: GitHub Actions, workflow único `.github/workflows/lumi-build.yml`

## O que o app faz hoje

- **Barra flutuante de baixo** (como na Galeria): Fotos (tudo por data), Álbuns (por pasta, prints por aplicativo, vídeos), Favoritos, Limpeza (prints, vídeos grandes e fotos duplicadas idênticas) e Ajustes.
- **Ajustes:** fotos por linha (3, 4 ou 5), espaço entre as fotos, a partir de quantos MB um vídeo é "grande", perguntar antes de excluir, atualizar sozinho ao voltar para o app, acesso às fotos, ler a galeria de novo, limpar favoritos e dados da versão. Tudo fica guardado só neste aparelho.
- **Datas como na Galeria:** as fotos são agrupadas e ordenadas pela data em que foram tiradas (e só usam a data em que entraram no celular quando a câmera não registrou a data).
- **Acesso parcial (Android 14):** se você liberou só algumas fotos, o Lumi avisa no topo e leva a liberar tudo.
- **Fotos gigantes** (acima de 30 megapixels): o Android prepara uma versão grande para abrir sem travar.
- **Atualiza sozinho** ao voltar para o app, sem perder a rolagem nem a tela em que você estava.
- **Atualizar:** puxe a tela para baixo (no topo da lista) e solte. O Lumi relê a galeria e avisa quantos itens novos apareceram.
- **Novidades da 1.9.0:**
  - **Backup de favoritos:** em Ajustes > Favoritos, *Exportar* salva um arquivo `Lumi-favoritos-AAAA-MM-DD.json` na pasta Downloads; *Importar* lê esse arquivo de volta (reencontra as fotos pelo endereço ou, se mudou, por nome e tamanho).
  - **Lixeira com Desfazer:** no Android 11+ a exclusão vai para a lixeira do Android e o Lumi mostra um aviso com o botão *Desfazer*. No Android 10 ou anterior a exclusão é definitiva (o aviso de confirmação diz isso).
  - **Barra de rolagem rápida:** arraste a barrinha na lateral direita; aparece o mês e o ano.
  - **Versão nos Ajustes:** em Sobre, mostra a versão e o código instalados.
  - **Desempenho:** leitura da galeria em formato compacto, linhas e células da lista reaproveitadas ao rolar e APK menor (R8). A redução do APK (R8) vem desligada na 1.9.1; para ligar, ponha `minificar=true` em `version.properties`; se a compilação reduzida falhar, o workflow tenta de novo sozinho sem reduzir.
- **Novidades da 1.13.0:**
  - **Editor de fotos:** no visualizador, o botão de lápis abre o editor com *Cortar* (livre, original, 1:1, 4:3, 3:4, 16:9, 9:16), *Girar* (90° e espelhar), *Ajustar* (brilho, contraste, saturação) e *Filtros* (P&B, Vívido, Quente, Frio, Sépia, Fosco). *Salvar cópia* grava um JPEG novo em `Pictures/Lumi` (com a data original da foto); a foto original nunca é alterada. O lado maior da cópia é limitado a 4096 px.
  - **Textos de Ajustes mais claros:** em Sobre agora aparece a quantidade de itens e o tipo de acesso às fotos (o detalhe técnico continua no Diagnóstico); o rodapé e o grupo *Contato* foram reescritos.
- **Novidades da 1.12.1:**
  - **Atualização obrigatória:** se existir uma versão maior no repositório público, o Lumi mostra uma tela cheia *Atualização obrigatória* e não deixa usar o app até instalar. Ela é conferida ao abrir e ao voltar para o app, e lembrada mesmo sem internet. Se não houver internet e nenhuma versão obrigatória tiver sido vista, o app abre normal.
- **Novidades da 1.12.0:**
  - **Aviso de versão nova:** ao abrir o app (no máximo a cada 6 horas) o Lumi consulta a página de versões do repositório público definido em `repoPublico` (`version.properties`). Se houver versão maior, mostra *Nova versão disponível* com o botão **Atualizar**, que abre o download do APK. Em Ajustes > Atualização do Lumi há *Procurar atualização* e a chave para desligar o aviso. Só é enviado o pedido da página pública do GitHub; nada seu.
  - **Como liga:** crie um repositório público só para os APKs, um token com permissão de escrever nele e cadastre o segredo `LUMI_PUBLICO_TOKEN` (passo a passo na conversa). A cada compilação o workflow publica o APK lá também.
- **Novidades da 1.11.1:**
  - **Sem copiar texto:** os textos do app não podem mais ser selecionados nem copiados (só o campo de busca continua normal).
  - **Aviso "Lendo todas as fotos e vídeos…"** agora some sempre ao terminar (antes ficava preso ao usar *Ler a galeria de novo* ou a leitura compacta) e a leitura tem limite de 60 s.
  - **Leitura compacta:** a chave mostra o tempo de cada formato (a tela não muda, só a velocidade) e desliga sozinha, com aviso, se o formato falhar.
- **Novidades da 1.11.0:**
  - **Busca:** a lupa no topo de Fotos, Álbuns e Favoritos procura por nome do arquivo, pasta, mês, ano, data (ex.: `17/10/2026`) e por *vídeos*, *prints* e *favoritos*. Sem acento e sem diferenciar maiúsculas. Dá para selecionar, favoritar e excluir direto nos resultados.
  - **Criador:** em Ajustes > Criador, atalhos para o Instagram e o e-mail (nome, marca, e-mail e Instagram ficam na constante `CRIADOR` no começo de `app/lumi.js`).
  - **Versão sem "código":** o APK agora se chama `Lumi-1.11.0.apk` e o app mostra só "Lumi 1.11.0". O código interno continua subindo sozinho em cada compilação (o Android exige isso para atualizar por cima), só não aparece mais.
- **Novidades da 1.10.0:**
  - **Lixeira:** em Limpeza, a lista do que está na lixeira do Android (11+), agrupada por quando some de vez. Dá para *Restaurar* ou *Excluir de vez* (com confirmação do Android).
  - **Detalhes:** botão (i) no visualizador mostra nome, data, tamanho, dimensões, pasta e caminho.
  - **Diagnóstico:** Ajustes > Avançado. Gera um relatório (versão, permissão, contagens, erros), testa os dois formatos de leitura da galeria e permite copiar ou salvar o relatório em Downloads.
  - **Leitura compacta (teste):** chave em Ajustes > Avançado. Se o formato compacto vier errado, o Lumi volta sozinho ao normal.
  - **Seleção:** o botão agora diz *Todos* / *Nenhum*. Cabeçalho sólido e mais espaço no fim das listas.
- **Visualizador (1.9.3):** a foto ou vídeo vizinho acompanha o dedo ao deslizar (como na Galeria), sem espera; o carregamento do vídeo mostra a miniatura e um indicador mais discreto.
- **Gesto (1.7.2):** deslize o dedo para o lado para passar de uma aba para outra.
- **Otimização (1.7.x):** abertura mais curta, mais miniaturas carregadas ao mesmo tempo, comparação de duplicadas em paralelo, menos memória ao rolar listas longas e cabeçalho sem desfoque (rolagem mais leve).
- **Rápido:** miniaturas leves geradas pelo Android (guardadas no cache do app) e lista que só desenha o que aparece na tela.
- **Seleção rápida:** toque na data para marcar o dia inteiro; segure uma foto e arraste o dedo para marcar várias (a tela rola sozinha perto da borda).
- **Voltar do Android:** o botão e o gesto da borda fecham uma tela por vez (foto, seleção, álbum) e só fecham o app na tela inicial das abas.
- **Visualizador:** zoom com dois dedos, toque duplo, arrastar para baixo para fechar, deslizar para trocar. No topo: ♥ favoritar, compartilhar e excluir.
- **Player de vídeo:** barra de progresso para arrastar (com o tempo em cima do dedo), play/pause, voltar/avançar 10 s, velocidade (1×, 1,5×, 2×, 0,5×), repetir, som ligado/desligado e girar a tela para paisagem. Toque duplo na lateral da tela pula 10 s (toques seguidos somam); toque duplo no meio pausa/continua; um toque mostra ou esconde os controles, que somem sozinhos enquanto o vídeo toca.
- **Favoritos:** o ♥ aparece na miniatura. A lista fica guardada no próprio app; use Exportar/Importar nos Ajustes para não perdê-la se desinstalar. Dá para favoritar vários de uma vez na seleção.
- **Fotos que o WebView não abre** (HEIC, AVIF, imagens enormes): o Android converte numa cópia JPEG guardada no cache do app, só para exibir. A foto original nunca é alterada. Se nem assim abrir, a foto continua na lista com um quadrado de aviso.
- **Compartilhar:** abre a folha de compartilhamento do Android, para um item ou até 100 de uma vez (seleção).
- **Exclusão segura:** seleção múltipla, confirmação do Lumi e depois a confirmação do próprio Android (lixeira no Android 11+, com Desfazer).

## Como subir este pacote no GitHub

As pastas numeradas existem só para organizar o zip. No repositório os caminhos são estes:

| Pasta do zip | Vai para |
|---|---|
| `1-raiz/` | raiz do repositório (`README.md`, `package.json`, `capacitor.config.json`, `version.properties`) |
| `2-app/` | `app/` |
| `3-nativo/` | `nativo/` |
| `4-scripts/` | `scripts/` |
| `5-workflow/lumi-build.yml` | `.github/workflows/lumi-build.yml` |

## Estrutura do repositório

| Caminho | O que é |
|---|---|
| `.github/workflows/lumi-build.yml` | Único workflow. Ações: `compilar` (APK assinado) e `criar-chave` (só na primeira vez). |
| `app/` | Interface (HTML, CSS, JavaScript). Copiada para `www/` na compilação. |
| `nativo/` | Código Java do Android e ícone. Copiado para o projeto Android gerado na compilação. O plugin `LumiGaleriaPlugin` também faz compartilhar e girar a tela. |
| `scripts/` | `verificar.sh` (checagens), `preparar-android.sh` (aplica o código nativo, permissões, versão e assinatura), `conferir-apk.sh` (confere o APK final). |
| `version.properties` | `versionCode` e `versionName`. É o único arquivo que você mexe a cada versão. |
| `package.json`, `capacitor.config.json` | Capacitor 7.4.4 e identidade do app (id e nome). |

A pasta `android/` e o `www/` são **gerados** a cada compilação e não ficam no repositório.

## Como lançar uma atualização

1. Altere os arquivos que quiser (por exemplo, `app/lumi.js`).
2. Edite `version.properties` e ajuste só o `versionName` (por exemplo 1.5.1). O `versionCode` agora sobe
   **sozinho** a cada compilação (100 + número da execução); o valor do arquivo vale apenas como mínimo.
3. Envie as alterações para o GitHub. A compilação roda sozinha (ou rode manualmente em Actions > Lumi - Compilar APK > Run workflow > `compilar`).
4. Baixe o APK na aba **Releases** do repositório (abra a versão mais recente e toque no arquivo `.apk` em Assets), ou em **Artifacts** da execução. Instale por cima da versão anterior.

## Assinatura (leia com atenção)

- A chave de assinatura fica **somente** nos Secrets do repositório: `LUMI_KEYSTORE_B64` e `LUMI_KEYSTORE_PASSWORD`.
  Nunca coloque senha ou chave em arquivos do repositório.
- A chave é criada uma única vez pela ação `criar-chave`, e só funciona em repositório **privado**.
- Guarde uma cópia dos dois valores em um lugar seguro fora do GitHub. Sem a chave não dá para atualizar o Lumi por cima:
  seria preciso desinstalar e perder os dados do app.
- Cada compilação mostra no resumo da execução o SHA-256 da assinatura. Ele deve ser sempre o mesmo.

## Fases planejadas

1. Núcleo (esta versão): fotos e vídeos, visualizador, exclusão, assinatura e atualização por cima.
2. Etiquetas e análise em lote com modelo local.
3. Leitura de texto em imagens.
4. Rostos (exige cuidados de privacidade e verificação de licença do modelo).

Cada fase só entra depois de verificar dependências, licença para uso comercial, tamanho do APK e desempenho.
