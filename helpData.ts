
export interface TutorialStep {
  text: string;
  tip?: string;
  mockVisual?: {
    type: 'button' | 'menu' | 'form' | 'card' | 'generic';
    label?: string;
    highlight?: boolean;
    context?: string; // e.g., "Menu Lateral", "Topo da Página"
  };
}

export interface Tutorial {
  id: string;
  title: string;
  category: 'cadastros' | 'estoque' | 'financeiro' | 'sistema' | 'eventos';
  description: string;
  steps: TutorialStep[];
}

export const TUTORIALS: Tutorial[] = [
  {
    id: 'cadastrar-membro',
    title: 'Como cadastrar Novo Membro',
    category: 'cadastros',
    description: 'Passo a passo para registrar um novo filho de santo ou membro na casa.',
    steps: [
      {
        text: 'Acesse o menu lateral e clique em "Cadastros".',
        mockVisual: {
          type: 'menu',
          label: 'Cadastros',
          context: 'Menu Lateral',
          highlight: true
        }
      },
      {
        text: 'No submenu que abrir, selecione "Membros".',
        mockVisual: {
          type: 'menu',
          label: 'Membros',
          context: 'Submenu Cadastros',
          highlight: true
        }
      },
      {
        text: 'Na tela de membros, localize o botão "Novo Membro" no canto superior direito.',
        tip: 'Certifique-se de ter os dados pessoais e data de nascimento em mãos.',
        mockVisual: {
          type: 'button',
          label: 'Novo Membro',
          context: 'Topo da Página (Direita)',
          highlight: true
        }
      },
      {
        text: 'Preencha o formulário com os dados obrigatórios (Nome, Data de Nascimento, Telefone).',
        mockVisual: {
          type: 'form',
          label: 'Dados Pessoais',
          highlight: false
        }
      },
      {
        text: 'Clique em "Salvar" para finalizar o cadastro.',
        mockVisual: {
          type: 'button',
          label: 'Salvar',
          highlight: true
        }
      }
    ]
  },
  {
    id: 'cadastrar-consulente',
    title: 'Como cadastrar Novo Consulente',
    category: 'cadastros',
    description: 'Registre pessoas que frequentam a casa para assistência espiritual.',
    steps: [
      {
        text: 'Acesse o menu lateral e clique em "Cadastros" > "Consulentes".',
        mockVisual: {
          type: 'menu',
          label: 'Consulentes',
          context: 'Menu Lateral > Cadastros',
          highlight: true
        }
      },
      {
        text: 'Clique no botão "Novo Consulente".',
        mockVisual: {
          type: 'button',
          label: 'Novo Consulente',
          context: 'Topo da Página',
          highlight: true
        }
      },
      {
        text: 'Preencha a ficha básica. Para consulentes, o cadastro é mais simples.',
        tip: 'Você pode adicionar observações sobre o motivo da consulta.',
        mockVisual: {
          type: 'form',
          label: 'Ficha de Consulente',
          highlight: false
        }
      }
    ]
  },
  {
    id: 'adicionar-estoque',
    title: 'Como adicionar Item em Estoque',
    category: 'estoque',
    description: 'Gerencie os itens do terreiro (velas, bebidas, ervas, etc).',
    steps: [
      {
        text: 'No menu lateral, vá em "Estoque" > "Gestão de Estoque".',
        mockVisual: {
          type: 'menu',
          label: 'Gestão de Estoque',
          context: 'Menu Lateral',
          highlight: true
        }
      },
      {
        text: 'Clique em "Adicionar Item".',
        mockVisual: {
          type: 'button',
          label: 'Adicionar Item',
          context: 'Topo da Lista',
          highlight: true
        }
      },
      {
        text: 'Defina o nome do item, categoria e quantidade mínima para alerta.',
        mockVisual: {
          type: 'form',
          label: 'Dados do Item',
          highlight: true
        }
      }
    ]
  },
  {
    id: 'visao-geral',
    title: 'Visão Geral do Sistema',
    category: 'sistema',
    description: 'Entenda as principais seções do seu painel de gestão.',
    steps: [
      {
        text: 'O Dashboard é sua tela inicial, mostrando resumos financeiros e aniversariantes.',
        mockVisual: {
          type: 'card',
          label: 'Dashboard',
          context: 'Tela Inicial',
          highlight: true
        }
      },
      {
        text: 'O Menu Lateral dá acesso a todos os módulos contratados no seu plano.',
        mockVisual: {
          type: 'menu',
          label: 'Menu Principal',
          context: 'Lateral Esquerda',
          highlight: true
        }
      },
      {
        text: 'No topo, você encontra seu perfil e botão de sair.',
        mockVisual: {
          type: 'generic',
          label: 'Perfil do Usuário',
          context: 'Barra Superior',
          highlight: true
        }
      }
    ]
  }
];

export const CATEGORIES = [
  { id: 'cadastros', label: 'Cadastros', icon: 'Users' },
  { id: 'estoque', label: 'Estoque', icon: 'Package' },
  { id: 'financeiro', label: 'Financeiro', icon: 'DollarSign' },
  { id: 'eventos', label: 'Eventos', icon: 'Calendar' },
  { id: 'sistema', label: 'Sistema', icon: 'Monitor' }
];
