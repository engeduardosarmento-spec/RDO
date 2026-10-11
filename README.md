# RDO Digital — Diário de Obra DNIT

Aplicativo web completo para elaboração, organização, consulta, cálculo geométrico e exportação de **Registros Diários de Obra (RDO)** utilizados na fiscalização, supervisão e execução de obras rodoviárias, em estrita conformidade com a **Norma DNIT 097/2025 – PRO — Elaboração de Registro de Diário de Obra do DNIT – Procedimento**.

---

## 1. Conformidade com a Norma DNIT 097/2025 – PRO

O sistema contempla integralmente a estrutura técnica e os procedimentos normativos do DNIT:

- **Item 4 — Lançamentos e registros obrigatórios**:
  - Condições climáticas para os períodos da manhã e tarde, com independência estrita entre a condição meteorológica (tempo) e a condição de trabalho (praticável / impraticável);
  - Efetivo ativo de campo discriminado por mão de obra direta e indireta, com apontador e encarregado geral;
  - Relação de equipamentos mobilizados, distinguindo quantidade total de equipamentos e equipamentos efetivamente operacionais;
  - Lançamento dinâmico de serviços com estacas, quilometragem inicial e final, extensão calculada e informada, largura, espessura e cálculo automático de área (m²) e volume geométrico estimado (m³);
  - Eventos com restrições nas 8 categorias oficiais do DNIT, com marcação formal de "R" e registro expresso de ausência de restrições;
  - Comentários e apontamentos independentes por origem (Construtora, Supervisora e Fiscalização do DNIT);
  - Vinculação de Ordens de Serviço pela Fiscalização do DNIT;
  - Considerações formais de cada interveniente;
  - Evidências fotográficas com georreferenciamento (latitude e longitude), data/hora da captura e da execução, serviço e legenda.

- **Item 5 e Item 6 — Fornecimento, manutenção e considerações gerais**.
- **Anexo A — Modelo oficial de Registro de Diário de Obra do DNIT**:
  - Exportação em PDF com paginação "Página X de Y", cabeçalho institucional DNIT, tabelas padronizadas com jsPDF-AutoTable e blocos formais de identificação dos responsáveis.
- **Anexo B — Instruções para preenchimento e agrupamento de serviços**:
  - Implantação;
  - Pavimentação — pista e acostamento;
  - Drenagem e obras de arte;
  - Obras complementares;
  - Outros serviços.

---

## 2. Tecnologias Utilizadas

- **React 19** + **TypeScript**
- **Vite** para empacotamento ultrarrápido
- **Tailwind CSS v4** com design técnico nas cores institucionais do DNIT (azul-marinho, branco e cinzas neutros)
- **Dexie.js (IndexedDB)**: armazenamento estruturado, persistente e local no navegador, permitindo operação 100% offline em campo sem exigir login ou servidores externos
- **jsPDF** & **jspdf-autotable**: geração de PDF técnico conforme o modelo do Anexo A
- **SheetJS (xlsx)**: exportação de pasta de trabalho Excel (.xlsx) estruturada em 5 planilhas com fórmulas
- **date-fns**: tratamento de datas no padrão brasileiro (DD/MM/AAAA) e cálculo de prazos contratuais
- **Lucide React**: iconografia técnica de engenharia

---

## 3. Funcionalidades Principais

1. **Painel Inicial (Dashboard)**:
   - Indicadores reais baseados nos dados armazenados (contratos, total de RDOs, RDOs do mês, em elaboração e finalizados).
   - Tabela de últimos lançamentos e atalhos rápidos.
   - Opção para carregar os dados demonstrativos de referência (LCM Construção / Contrato SR-593/2020 / BR-364/AC de 30/09/2026).

2. **Gestão de Contratos**:
   - Cadastro completo de dados contratuais (Processo SEI, Superintendência Regional, Unidade Local, Construtora, Supervisora, Fiscais, Rodovia, Trecho, Prazos e Extensão).
   - Manutenção de múltiplos contratos ativos e arquivados.

3. **Catálogo de Serviços por Contrato**:
   - Catálogo específico por contrato com parâmetros dimensionais habituais (largura e espessura típicas) e unidades de medição.
   - Botão para importar sugestões da Norma DNIT com 1 clique.

4. **Elaboração e Edição de RDO (Wizard por Etapas)**:
   - **Etapa 1 — Identificação**: numeração sequencial automática e cálculo de prazos decorridos e a vencer.
   - **Etapa 2 — Condições Climáticas**: manhã e tarde independentes.
   - **Etapa 3 — Mão de Obra**: soma automática de direta e indireta, reaproveitamento de equipe do dia anterior.
   - **Etapa 4 — Equipamentos**: quantidade total vs. operacionais.
   - **Etapa 5 — Serviços Executados**: formulários dinâmicos, cálculo automático de extensão `(kmF - kmI) * 1000`, área `m²` e volume `m³`, com detecção de divergência se editado manualmente.
   - **Etapa 6 — Eventos com Restrições**: categorização e marcação "R" ou "Sem restrições".
   - **Etapa 7 — Comentários**: registros por origem e vinculação de Ordens de Serviço.
   - **Etapa 8 — Considerações das Partes**: considerações independentes da Construtora, Supervisora e DNIT.
   - **Etapa 9 — Fotografias**: captura da câmera ou arquivo, compressão automática no navegador para poupar memória, geolocalização por GPS e legendas.
   - **Etapa 10 — Revisão & Encerramento**: verificação de pendências, controle de status interno e exportação.

5. **Resumo para WhatsApp**:
   - Texto formatado no padrão solicitado com botões de "Copiar Texto" e "Compartilhar pelo WhatsApp" (Web Share API para celular).

6. **Exportação em PDF**:
   - Layout fiel ao Anexo A da Norma DNIT 097/2025 – PRO.

7. **Exportação em Excel (.xlsx)**:
   - Planilha 1: RDO (dados gerais e climáticos)
   - Planilha 2: Serviços Executados
   - Planilha 3: Equipe e Equipamentos
   - Planilha 4: Ocorrências e Comentários
   - Planilha 5: Fotografias e Metadados

8. **Backup e Configurações**:
   - Exportação de backup completo em JSON.
   - Restauração de backup com validação estruturada.
   - Limpeza completa do banco local.

---

## 4. Instruções de Instalação e Execução Local

### Pré-requisitos:
- Node.js versão 18 ou superior
- npm versão 9 ou superior

### Passos:
```bash
# 1. Instalar as dependências
npm install

# 2. Iniciar o servidor de desenvolvimento local
npm run dev

# 3. Acesse no navegador:
# http://localhost:3000
```

---

## 5. Compilação e Deploy na Netlify

O projeto já contém o arquivo `netlify.toml` e o arquivo `public/_redirects` configurados para o roteamento do SPA (Single Page Application).

### Comando de Build:
```bash
npm run build
```
Os arquivos estáticos otimizados para produção serão gerados na pasta `dist/`.

### Publicação na Netlify:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18 ou superior

Não são necessárias variáveis de ambiente de banco de dados ou chaves secretas no servidor, pois toda a persistência é gerenciada via IndexedDB no navegador do usuário.
