// Dados dos cursos e temas. Edite as listas abaixo à vontade para
// adicionar, remover ou trocar temas — o site se adapta automaticamente.

const COURSES = {
  cc: {
    name: "Ciência da Computação",
    emoji: "💻",
    color: "#4C6EF5",
    themes: [
      // Algoritmos e Estruturas de Dados
      "Complexidade de algoritmos (notação Big O)",
      "Árvores binárias de busca",
      "Tabelas hash e colisões",
      "Busca em profundidade e em largura em grafos",
      "Algoritmos de ordenação (quicksort, mergesort)",
      "Programação dinâmica",
      "Algoritmos gulosos (greedy)",
      "Filas de prioridade e heaps",
      // Banco de Dados
      "Modelo relacional e normalização",
      "SQL vs NoSQL",
      "Transações e o modelo ACID",
      "Índices em bancos de dados",
      "Bancos de dados distribuídos",
      // Redes de Computadores
      "Modelo OSI vs TCP/IP",
      "Como funciona o protocolo HTTP/HTTPS",
      "DNS e resolução de nomes de domínio",
      "Redes sem fio e Wi-Fi",
      "VPNs e túneis seguros",
      // Sistemas Operacionais
      "Gerenciamento de processos e threads",
      "Memória virtual",
      "Escalonamento de CPU",
      "Sistemas de arquivos",
      "Deadlocks (impasses)",
      // Engenharia de Software
      "Metodologias ágeis (Scrum, Kanban)",
      "Padrões de projeto (Design Patterns)",
      "Testes de software (unitários e de integração)",
      "Clean Code e boas práticas",
      "Arquitetura de microsserviços",
      // Inteligência Artificial e Machine Learning
      "Redes neurais artificiais",
      "Aprendizado supervisionado vs não supervisionado",
      "Processamento de linguagem natural (NLP)",
      "Ética em inteligência artificial",
      "Como funcionam os modelos de linguagem (LLMs)",
      // Segurança da Informação
      "Criptografia simétrica e assimétrica",
      "Engenharia social e phishing",
      "OWASP Top 10 (vulnerabilidades web)",
      "Autenticação e autorização (OAuth, JWT)",
      // Teoria da Computação
      "Máquinas de Turing",
      "Problemas NP-completos",
      "Autômatos finitos",
      // Computação em Nuvem
      "Modelos de serviço (IaaS, PaaS, SaaS)",
      "Containers e Docker",
      "Kubernetes e orquestração de containers",
      "Escalabilidade horizontal vs vertical",
      // Desenvolvimento Web
      "Como o navegador renderiza uma página",
      "APIs REST vs GraphQL",
      "Frontend vs Backend",
    ],
  },
  direito: {
    name: "Direito",
    emoji: "⚖️",
    color: "#D97706",
    themes: [
      // Direito Constitucional
      "Princípios fundamentais da Constituição de 1988",
      "Controle de constitucionalidade",
      "Direitos e garantias fundamentais",
      "Separação dos poderes",
      "Cláusulas pétreas",
      // Direito Civil
      "Personalidade e capacidade civil",
      "Contratos: formação e requisitos",
      "Responsabilidade civil",
      "Direito de família",
      "Direito das sucessões",
      "Posse e propriedade",
      // Direito Penal
      "Teoria do crime",
      "Excludentes de ilicitude",
      "Tipos de pena no Brasil",
      "Princípio da legalidade penal",
      "Crimes contra a pessoa",
      // Direito Processual Civil
      "Fases do processo civil",
      "Recursos no processo civil",
      "Tutela de urgência",
      "Execução de sentença",
      // Direito Processual Penal
      "Inquérito policial",
      "Prisão em flagrante e prisão preventiva",
      "Contraditório e ampla defesa",
      "Júri popular",
      // Direito do Trabalho
      "Contrato de trabalho e vínculo empregatício",
      "Direitos trabalhistas básicos (CLT)",
      "Rescisão contratual",
      "Terceirização",
      // Direito Administrativo
      "Princípios da administração pública",
      "Atos administrativos",
      "Licitações e contratos públicos",
      "Improbidade administrativa",
      // Direito Tributário
      "Espécies de tributos",
      "Princípios tributários (legalidade, anterioridade)",
      "Imunidades e isenções tributárias",
      // Direito Empresarial
      "Tipos societários",
      "Recuperação judicial e falência",
      "Títulos de crédito",
      // Direito Internacional e Direitos Humanos
      "Tratados internacionais e sua hierarquia",
      "Sistema interamericano de direitos humanos",
      "Direito internacional privado",
      // Ética e Filosofia do Direito
      "Positivismo jurídico vs jusnaturalismo",
      "Hermenêutica jurídica",
      "Ética profissional na advocacia (OAB)",
    ],
  },
};

const DEFAULT_PEOPLE = [
  { id: "p1", name: "Douglas", courseId: "cc" },
  { id: "p2", name: "Priscilla", courseId: "direito" },
];
