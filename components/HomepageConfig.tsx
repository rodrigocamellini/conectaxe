import React, { useState, useEffect } from 'react';
import { LandingPageService, LandingPageConfig } from '../services/landingPageService';
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Pencil, 
  Eye, 
  EyeOff, 
  Save, 
  X,
  GripVertical,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
  HelpCircle,
  Image,
  Phone,
  Quote,
  Building,
  Wand2
} from 'lucide-react';

interface SocialConfig {
  facebook: string;
  instagram: string;
  youtube: string;
}

interface ClientLogo {
  id: string;
  name: string;
  location: string;
  logoUrl: string;
  visible: boolean;
}

interface TestimonialItem {
  id: string;
  text: string;
  authorName: string;
  terreiro: string;
  photoUrl: string;
  visible: boolean;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  visible: boolean;
}

interface LandingPageModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  visible: boolean;
}

const INITIAL_SOCIAL: SocialConfig = {
  facebook: '',
  instagram: '',
  youtube: ''
};

const INITIAL_CLIENT_LOGOS: ClientLogo[] = [
  { id: '1', name: 'Ilê Axé Ogum', location: 'Irecê - BA', logoUrl: 'https://ui-avatars.com/api/?name=IA&background=f97316&color=fff&rounded=true&bold=true', visible: true },
  { id: '2', name: 'Aldeia Beira Mar', location: 'São Paulo - SP', logoUrl: 'https://ui-avatars.com/api/?name=AB&background=4f46e5&color=fff&rounded=true&bold=true', visible: true },
  { id: '3', name: 'Terreiro Pena Branca', location: 'Petrolina - PE', logoUrl: 'https://ui-avatars.com/api/?name=TP&background=0ea5e9&color=fff&rounded=true&bold=true', visible: true },
  { id: '4', name: 'Casa Mãe Guacyara', location: 'São Paulo - SP', logoUrl: 'https://ui-avatars.com/api/?name=CM&background=10b981&color=fff&rounded=true&bold=true', visible: true },
  { id: '5', name: 'Ylê Africano', location: 'Porto Alegre - RS', logoUrl: 'https://ui-avatars.com/api/?name=YA&background=8b5cf6&color=fff&rounded=true&bold=true', visible: true },
  { id: '6', name: 'Aldeia Pena Branca', location: 'Monte Santo - MG', logoUrl: 'https://ui-avatars.com/api/?name=AP&background=f43f5e&color=fff&rounded=true&bold=true', visible: true },
  { id: '7', name: 'Roda Itaussu', location: 'São Paulo - SP', logoUrl: 'https://ui-avatars.com/api/?name=RI&background=eab308&color=fff&rounded=true&bold=true', visible: true },
  { id: '8', name: 'Caboclo Akuan', location: 'Campinas - SP', logoUrl: 'https://ui-avatars.com/api/?name=CA&background=ec4899&color=fff&rounded=true&bold=true', visible: true },
];

const INITIAL_TESTIMONIALS: TestimonialItem[] = [
  {
    id: '1',
    text: "Antigamente eu perdia horas com planilhas e cadernetas para saber quem tinha pago a mensalidade. Hoje o ConectAxé faz tudo sozinho. Sobra mais tempo para eu me dedicar ao que realmente importa: a espiritualidade.",
    authorName: "Mãe Luciana de Iansã",
    terreiro: "Templo Luz do Oriente",
    photoUrl: "https://picsum.photos/seed/p1/60/60",
    visible: true
  },
  {
    id: '2',
    text: "A transparência financeira aumentou muito. Os filhos recebem o recibo direto no celular. O sistema é intuitivo e as escalas de giras acabaram com as confusões de datas no grupo de WhatsApp.",
    authorName: "Pai Ricardo de Ogum",
    terreiro: "Centro Cultural Axé Vivo",
    photoUrl: "https://picsum.photos/seed/p2/60/60",
    visible: true
  },
  {
    id: '3',
    text: "A organização dos ebós e das obrigações anuais ficou impecável. O sistema me avisa com antecedência e não deixamos passar nada. É uma bênção.",
    authorName: "Mãe Jandira de Nanã",
    terreiro: "Ilê Axé Nanã Buruquê",
    photoUrl: "https://picsum.photos/seed/p3/60/60",
    visible: true
  },
  {
    id: '4',
    text: "Gerenciar a cantina e a loja do terreiro era uma dor de cabeça. Com o módulo de estoque, sei exatamente o que precisa repor para a próxima gira.",
    authorName: "Pai Carlos de Xangô",
    terreiro: "Tenda Justiça Divina",
    photoUrl: "https://picsum.photos/seed/p4/60/60",
    visible: true
  },
  {
    id: '5',
    text: "O cadastro de consulentes nos ajudou a acolher melhor quem chega. Sabemos quem vem sempre e podemos dar um atendimento mais fraterno e organizado.",
    authorName: "Mãe Solange de Iemanjá",
    terreiro: "Casa das Águas",
    photoUrl: "https://picsum.photos/seed/p5/60/60",
    visible: true
  },
  {
    id: '6',
    text: "A plataforma EAD tem sido fundamental para os estudos dos iniciantes. Eles acessam o material de casa e chegam no terreiro com as dúvidas certas.",
    authorName: "Pai Pedro de Oxóssi",
    terreiro: "Cabana do Caboclo",
    photoUrl: "https://picsum.photos/seed/p6/60/60",
    visible: true
  },
  {
    id: '7',
    text: "Desde que implantamos o sistema, a inadimplência caiu drásticamente. Os lembretes automáticos ajudam muito na gestão financeira da casa.",
    authorName: "Mãe Teresa de Oxum",
    terreiro: "Solar de Mamãe Oxum",
    photoUrl: "https://picsum.photos/seed/p7/60/60",
    visible: true
  },
  {
    id: '8',
    text: "O suporte é incrível e o sistema está sempre evoluindo. Sinto que finalmente temos uma ferramenta feita por quem entende a nossa realidade.",
    authorName: "Pai Jorge de Aruanda",
    terreiro: "Terreiro Vovó Cambinda",
    photoUrl: "https://picsum.photos/seed/p8/60/60",
    visible: true
  }
];

const INITIAL_FAQ: FAQItem[] = [
  { id: '1', question: "O sistema é seguro? Meus dados rituais ficam expostos?", answer: "Absolutamente não. Utilizamos criptografia de nível bancário e seus dados são privados. Apenas administradores autorizados por você têm acesso.", visible: true },
  { id: '2', question: "Preciso instalar algo no meu computador?", answer: "Não. O ConectAxé é 100% na nuvem. Você acessa pelo navegador do celular, tablet ou computador, de onde estiver.", visible: true },
  { id: '3', question: "Como funciona o período de teste?", answer: "Você tem 7 dias para usar todas as funcionalidades sem pagar nada. Se gostar, escolhe um plano e continua. Se não, sua conta é desativada sem custos.", visible: true },
  { id: '4', question: "Vocês dão suporte para configurar o sistema?", answer: "Sim! Temos uma equipe pronta para te ajudar a importar seus dados e treinar sua equipe administrativa.", visible: true }
];

const INITIAL_MODULES: LandingPageModule[] = [
  {
    id: '1',
    title: "Dashboard Principal",
    description: "Visão geral completa com indicadores, estatísticas e atalhos rápidos para a gestão do dia a dia.",
    icon: "📊",
    visible: true
  },
  {
    id: '2',
    title: "Agenda de Eventos",
    description: "Calendário organizado de giras, festas e obrigações, mantendo todos informados sobre as datas importantes.",
    icon: "📅",
    visible: true
  },
  {
    id: '3',
    title: "Gestão de Eventos e Portaria",
    description: "Controle avançado de eventos com lista de convidados, check-in na portaria e venda de ingressos.",
    icon: "🎫",
    visible: true
  },
  {
    id: '4',
    title: "Plataforma EAD",
    description: "Ambiente exclusivo para o aprendizado dos filhos de santo, com acesso a materiais de estudo e doutrina.",
    icon: "🎓",
    visible: true
  },
  {
    id: '5',
    title: "Gestão de Cursos",
    description: "Ferramentas para mentores e pais/mães de santo criarem aulas e acompanharem o desenvolvimento teórico.",
    icon: "📚",
    visible: true
  },
  {
    id: '6',
    title: "Pontos Cantados",
    description: "Acervo digital de áudios e letras dos pontos, organizados por linha e orixá para estudo da curimba.",
    icon: "🥁",
    visible: true
  },
  {
    id: '7',
    title: "Rezas e Orações",
    description: "Biblioteca de preces e fundamentos litúrgicos, preservando a tradição oral da sua casa.",
    icon: "📿",
    visible: true
  },
  {
    id: '8',
    title: "Ervas e Banhos",
    description: "Catálogo de conhecimentos sobre folhas, banhos e defumações, com suas propriedades e usos rituais.",
    icon: "🌿",
    visible: true
  },
  {
    id: '9',
    title: "Cadastro de Membros",
    description: "Banco de dados seguro com informações completas dos filhos da casa, contatos e dados pessoais.",
    icon: "👥",
    visible: true
  },
  {
    id: '10',
    title: "Caminhada Mediúnica",
    description: "Acompanhe a evolução espiritual e desenvolvimento de cada médium.",
    icon: "👣",
    visible: true
  },
  {
    id: '11',
    title: "Obrigações do Médium",
    description: "Histórico completo de rituais, consagrações e obrigações.",
    icon: "✨",
    visible: true
  },
  {
    id: '12',
    title: "Cadastro de Médiuns",
    description: "Fichas espirituais detalhadas com orixás, guias, datas de batismo e histórico de obrigações.",
    icon: "🕊️",
    visible: true
  },
  {
    id: '13',
    title: "Cadastro de Consulentes",
    description: "Registro organizado dos visitantes e consulentes frequentes para melhor acolhimento e acompanhamento.",
    icon: "🙏",
    visible: true
  },
  {
    id: '14',
    title: "Carteirinhas Digitais",
    description: "Geração automática de carteirinhas de identificação para membros e médiuns da casa.",
    icon: "💳",
    visible: true
  },
  {
    id: '15',
    title: "Controle de Presença",
    description: "Sistema prático de chamada para acompanhar a assiduidade dos médiuns nas giras e trabalhos.",
    icon: "✅",
    visible: true
  },
  {
    id: '16',
    title: "Gestão de Cantina",
    description: "Organize o cardápio, controle vendas em tempo real e acompanhe o caixa da cantina do terreiro.",
    icon: "☕",
    visible: true
  },
  {
    id: '17',
    title: "Visualização de Estoque",
    description: "Painel rápido para conferir a disponibilidade de itens, velas, ervas e materiais rituais.",
    icon: "👁️",
    visible: true
  },
  {
    id: '18',
    title: "Catálogo de Estoque",
    description: "Organização completa dos itens do almoxarifado, permitindo uma gestão eficiente dos recursos.",
    icon: "🗃️",
    visible: true
  },
  {
    id: '19',
    title: "Entradas e Saídas",
    description: "Controle rigoroso do fluxo de materiais, registrando o que entra e o que é consumido na casa.",
    icon: "🔄",
    visible: true
  },
  {
    id: '20',
    title: "Gestão de Mensalidades",
    description: "Controle financeiro das mensalidades, facilitando a organização das contribuições dos associados.",
    icon: "💲",
    visible: true
  },
  {
    id: '21',
    title: "Gestão de Doações",
    description: "Registro transparente de todas as doações recebidas, auxiliando na prestação de contas da casa.",
    icon: "🎁",
    visible: true
  },
  {
    id: '22',
    title: "Relatórios Financeiros",
    description: "Demonstrativos claros das receitas e despesas para uma gestão financeira transparente e segura.",
    icon: "📈",
    visible: true
  },
  {
    id: '23',
    title: "Personalização do Sistema",
    description: "Configure a aparência, cores e logo do sistema para refletir a identidade visual do seu terreiro.",
    icon: "🎨",
    visible: true
  },
  {
    id: '24',
    title: "Usuários e Permissões",
    description: "Gerencie quem tem acesso ao sistema e defina permissões específicas para cada função na casa.",
    icon: "🛡️",
    visible: true
  },
  {
    id: '25',
    title: "Backup de Dados",
    description: "Segurança total com backups automáticos e possibilidade de exportação dos seus dados.",
    icon: "💾",
    visible: true
  },
  {
    id: '26',
    title: "Sistema de Afiliados",
    description: "Ganhe comissões indicando o ConectAxé para outros terreiros e ajude a fortalecer nossa comunidade.",
    icon: "🤝",
    visible: true
  }
];

export const HomepageConfig: React.FC = () => {
  const [socialConfig, setSocialConfig] = useState<SocialConfig>(INITIAL_SOCIAL);

  const [faqItems, setFaqItems] = useState<FAQItem[]>(INITIAL_FAQ);

  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(INITIAL_TESTIMONIALS);

  const [clientLogos, setClientLogos] = useState<ClientLogo[]>(INITIAL_CLIENT_LOGOS);

  const [modules, setModules] = useState<LandingPageModule[]>(INITIAL_MODULES);

  const [whatsappMessage, setWhatsappMessage] = useState<string>('Olá, gostaria de fazer um upgrade no meu plano do ConectAxé!');
  const [whatsappMessageTest, setWhatsappMessageTest] = useState<string>('Olá! Gostaria de testar o sistema ConectAxé gratuitamente.');
  const [whatsappMessageIniciante, setWhatsappMessageIniciante] = useState<string>('Olá! Gostaria de contratar o plano Iniciante para meu terreiro.');
  const [whatsappMessageExpandido, setWhatsappMessageExpandido] = useState<string>('Olá! Tenho interesse no plano Expandido.');
  const [whatsappMessagePro, setWhatsappMessagePro] = useState<string>('Olá! Quero saber mais sobre o plano Terreiro Pro.');
  const [whatsappMessageFloating, setWhatsappMessageFloating] = useState<string>('Olá! Gostaria de saber mais sobre o ConectAxé.');

  const [logoUrl, setLogoUrl] = useState<string>('/images/logo_conectaxe.png');
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');

  const [cnpj, setCnpj] = useState<string>('00.000.000/0001-00');
  
  // Hero Config State
  const [heroTitle, setHeroTitle] = useState<string>("Tudo o que seu terreiro precisa em um só lugar");
  const [heroSubtitle, setHeroSubtitle] = useState<string>("Simplifique a administração financeira, o cadastro de filhos de santo e a agenda de giras do seu terreiro com a ConectAxé.");
  const [heroBackground, setHeroBackground] = useState<string>("https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2070");
  const [heroDashboard, setHeroDashboard] = useState<string>("/images/hero-dashboard.png");

  const [showEditor, setShowEditor] = useState(false);
  const [editingModule, setEditingModule] = useState<Partial<LandingPageModule> | null>(null);
  
  const [showFaqEditor, setShowFaqEditor] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Partial<FAQItem> | null>(null);
  
  const [showTestimonialEditor, setShowTestimonialEditor] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<TestimonialItem> | null>(null);

  const [showClientLogoEditor, setShowClientLogoEditor] = useState(false);
  const [editingClientLogo, setEditingClientLogo] = useState<Partial<ClientLogo> | null>(null);

  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [deleteFaqConfirmation, setDeleteFaqConfirmation] = useState<string | null>(null);
  const [deleteTestimonialConfirmation, setDeleteTestimonialConfirmation] = useState<string | null>(null);
  const [deleteClientLogoConfirmation, setDeleteClientLogoConfirmation] = useState<string | null>(null);
  
  // Load Config from Firebase
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await LandingPageService.getConfig();
        if (config.landing_page_social) setSocialConfig(config.landing_page_social);
        
        // Self-Healing for FAQ
        if (config.landing_page_faq && Array.isArray(config.landing_page_faq) && config.landing_page_faq.length > 0) {
          setFaqItems(config.landing_page_faq);
        }

        // Self-Healing for Testimonials
        if (config.landing_page_testimonials && Array.isArray(config.landing_page_testimonials) && config.landing_page_testimonials.length > 0) {
          setTestimonials(config.landing_page_testimonials);
        }
        
        // Self-Healing for Client Logos
        if (config.landing_page_client_logos && Array.isArray(config.landing_page_client_logos) && config.landing_page_client_logos.length > 2) {
          setClientLogos(config.landing_page_client_logos);
        } else {
          // If missing or corrupted (too few), keep default (which is already set in useState)
          console.log("Restoring default Client Logos due to missing/corrupted data");
        }

        // Self-Healing for Modules
        if (config.landing_page_modules && Array.isArray(config.landing_page_modules) && config.landing_page_modules.length > 5) {
          setModules(config.landing_page_modules);
        } else {
          // If missing or corrupted (too few), keep default
          console.log("Restoring default Modules due to missing/corrupted data");
        }

        if (config.landing_page_logo) setLogoUrl(config.landing_page_logo);
        if (config.landing_page_whatsapp) setWhatsappNumber(config.landing_page_whatsapp);
        if (config.landing_page_whatsapp_message) setWhatsappMessage(config.landing_page_whatsapp_message);
        if (config.landing_page_whatsapp_message_test) setWhatsappMessageTest(config.landing_page_whatsapp_message_test);
        if (config.landing_page_whatsapp_message_iniciante) setWhatsappMessageIniciante(config.landing_page_whatsapp_message_iniciante);
        if (config.landing_page_whatsapp_message_expandido) setWhatsappMessageExpandido(config.landing_page_whatsapp_message_expandido);
        if (config.landing_page_whatsapp_message_pro) setWhatsappMessagePro(config.landing_page_whatsapp_message_pro);
        if (config.landing_page_whatsapp_message_floating) setWhatsappMessageFloating(config.landing_page_whatsapp_message_floating);
        if (config.landing_page_cnpj) setCnpj(config.landing_page_cnpj);
        
        if (config.landing_page_hero) {
          if (config.landing_page_hero.title) setHeroTitle(config.landing_page_hero.title);
          if (config.landing_page_hero.subtitle) setHeroSubtitle(config.landing_page_hero.subtitle);
          // Only update background if it's a valid string (not empty) to avoid overwriting default with empty value
          if (config.landing_page_hero.backgroundImage && config.landing_page_hero.backgroundImage.length > 5) {
            setHeroBackground(config.landing_page_hero.backgroundImage);
          }
          if (config.landing_page_hero.dashboardImage) setHeroDashboard(config.landing_page_hero.dashboardImage);
        }
      } catch (error) {
        console.error("Erro ao carregar configurações da Landing Page:", error);
      }
    };
    loadConfig();
  }, []);

  // Save Config to Firebase (Debounced)
  useEffect(() => {
    const saveConfig = async () => {
      try {
        const config: LandingPageConfig = {
          landing_page_social: socialConfig,
          landing_page_faq: faqItems,
          landing_page_testimonials: testimonials,
          landing_page_client_logos: clientLogos,
          landing_page_modules: modules,
          landing_page_logo: logoUrl,
          landing_page_whatsapp: whatsappNumber,
          landing_page_whatsapp_message: whatsappMessage,
          landing_page_whatsapp_message_test: whatsappMessageTest,
          landing_page_whatsapp_message_iniciante: whatsappMessageIniciante,
          landing_page_whatsapp_message_expandido: whatsappMessageExpandido,
          landing_page_whatsapp_message_pro: whatsappMessagePro,
          landing_page_whatsapp_message_floating: whatsappMessageFloating,
          landing_page_cnpj: cnpj,
          landing_page_hero: {
            title: heroTitle,
            subtitle: heroSubtitle,
            backgroundImage: heroBackground,
            dashboardImage: heroDashboard
          }
        };
        await LandingPageService.saveConfig(config);
      } catch (error) {
        console.error("Erro ao salvar configurações da Landing Page:", error);
      }
    };

    const timeoutId = setTimeout(saveConfig, 1000);
    return () => clearTimeout(timeoutId);
  }, [socialConfig, faqItems, testimonials, clientLogos, modules, logoUrl, whatsappNumber, whatsappMessage, whatsappMessageTest, whatsappMessageIniciante, whatsappMessageExpandido, whatsappMessagePro, whatsappMessageFloating, cnpj, heroTitle, heroSubtitle, heroBackground, heroDashboard]);

  const handlePhoneChange = (value: string) => {
    let numeric = value.replace(/\D/g, '');
    
    // Limit to 13 digits (55 + 2 DDD + 9 number)
    if (numeric.length > 13) numeric = numeric.slice(0, 13);

    let formatted = numeric;
    
    if (numeric.length > 0) {
      formatted = '+' + numeric;
      
      if (numeric.length > 2) {
        formatted = `+${numeric.slice(0, 2)} (${numeric.slice(2)}`;
        
        if (numeric.length > 4) {
          formatted = `+${numeric.slice(0, 2)} (${numeric.slice(2, 4)}) ${numeric.slice(4)}`;
          
          if (numeric.length > 9) {
                  formatted = `+${numeric.slice(0, 2)} (${numeric.slice(2, 4)}) ${numeric.slice(4, 9)}-${numeric.slice(9)}`;
                }
              }
            }
          }
          setWhatsappNumber(formatted);
        };

  const handleCnpjChange = (value: string) => {
    let numeric = value.replace(/\D/g, '');
    
    // Limit to 14 digits
    if (numeric.length > 14) numeric = numeric.slice(0, 14);

    let formatted = numeric;
    
    if (numeric.length > 2) {
      formatted = `${numeric.slice(0, 2)}.${numeric.slice(2)}`;
      
      if (numeric.length > 5) {
        formatted = `${numeric.slice(0, 2)}.${numeric.slice(2, 5)}.${numeric.slice(5)}`;
        
        if (numeric.length > 8) {
          formatted = `${numeric.slice(0, 2)}.${numeric.slice(2, 5)}.${numeric.slice(5, 8)}/${numeric.slice(8)}`;
          
          if (numeric.length > 12) {
            formatted = `${numeric.slice(0, 2)}.${numeric.slice(2, 5)}.${numeric.slice(5, 8)}/${numeric.slice(8, 12)}-${numeric.slice(12)}`;
          }
        }
      }
    }
    setCnpj(formatted);
  };

  // Client Logos Handlers
  const handleClientLogoMove = (index: number, direction: 'up' | 'down') => {
    const newItems = [...clientLogos];
    if (direction === 'up' && index > 0) {
      [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
    } else if (direction === 'down' && index < newItems.length - 1) {
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    }
    setClientLogos(newItems);
  };

  const handleClientLogoToggleVisibility = (id: string) => {
    setClientLogos(clientLogos.map(item => 
      item.id === id ? { ...item, visible: !item.visible } : item
    ));
  };

  const handleClientLogoDelete = (id: string) => {
    setDeleteClientLogoConfirmation(id);
  };

  const confirmClientLogoDelete = () => {
    if (deleteClientLogoConfirmation) {
      setClientLogos(clientLogos.filter(item => item.id !== deleteClientLogoConfirmation));
      setDeleteClientLogoConfirmation(null);
    }
  };

  const openClientLogoEditor = (logo?: ClientLogo) => {
    if (logo) {
      setEditingClientLogo(logo);
    } else {
      setEditingClientLogo({ visible: true, id: '', name: '', location: '', logoUrl: '' });
    }
    setShowClientLogoEditor(true);
  };

  const handleSaveClientLogo = () => {
    if (!editingClientLogo?.name || !editingClientLogo.logoUrl) return;

    if (editingClientLogo.id) {
      setClientLogos(clientLogos.map(item => 
        item.id === editingClientLogo.id ? editingClientLogo as ClientLogo : item
      ));
    } else {
      const newItem: ClientLogo = {
        ...editingClientLogo as ClientLogo,
        id: Date.now().toString(),
      };
      setClientLogos([...clientLogos, newItem]);
    }
    setShowClientLogoEditor(false);
    setEditingClientLogo(null);
  };

  // Testimonials Handlers
  const handleTestimonialMove = (index: number, direction: 'up' | 'down') => {
    const newItems = [...testimonials];
    if (direction === 'up' && index > 0) {
      [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
    } else if (direction === 'down' && index < newItems.length - 1) {
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    }
    setTestimonials(newItems);
  };

  const handleTestimonialToggleVisibility = (id: string) => {
    setTestimonials(testimonials.map(item => 
      item.id === id ? { ...item, visible: !item.visible } : item
    ));
  };

  const handleTestimonialDelete = (id: string) => {
    setDeleteTestimonialConfirmation(id);
  };

  const confirmTestimonialDelete = () => {
    if (deleteTestimonialConfirmation) {
      setTestimonials(testimonials.filter(item => item.id !== deleteTestimonialConfirmation));
      setDeleteTestimonialConfirmation(null);
    }
  };

  const openTestimonialEditor = (testimonial?: TestimonialItem) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
    } else {
      setEditingTestimonial({ visible: true, id: '', text: '', authorName: '', terreiro: '', photoUrl: '' });
    }
    setShowTestimonialEditor(true);
  };

  const handleSaveTestimonial = () => {
    if (!editingTestimonial?.text || !editingTestimonial.authorName) return;

    if (editingTestimonial.id) {
      // Edit existing
      setTestimonials(testimonials.map(item => 
        item.id === editingTestimonial.id ? editingTestimonial as TestimonialItem : item
      ));
    } else {
      // Add new
      const newItem: TestimonialItem = {
        ...editingTestimonial as TestimonialItem,
        id: Date.now().toString(),
      };
      setTestimonials([...testimonials, newItem]);
    }
    setShowTestimonialEditor(false);
    setEditingTestimonial(null);
  };

  const handleLogoFile = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setLogoUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === modules.length - 1)
    ) return;

    const newModules = [...modules];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newModules[index], newModules[targetIndex]] = [newModules[targetIndex], newModules[index]];
    setModules(newModules);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmation(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmation) {
      setModules(modules.filter(m => m.id !== deleteConfirmation));
      setDeleteConfirmation(null);
    }
  };

  const handleToggleVisibility = (id: string) => {
    setModules(modules.map(m => 
      m.id === id ? { ...m, visible: !m.visible } : m
    ));
  };

  const handleSave = () => {
    if (!editingModule?.title || !editingModule?.description || !editingModule?.icon) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    if (editingModule.id) {
      // Edit existing
      setModules(modules.map(m => 
        m.id === editingModule.id ? { ...m, ...editingModule } as LandingPageModule : m
      ));
    } else {
      // Add new
      const newModule: LandingPageModule = {
        ...editingModule as LandingPageModule,
        id: Date.now().toString(),
        visible: true
      };
      setModules([...modules, newModule]);
    }
    setShowEditor(false);
    setEditingModule(null);
  };

  const openEditor = (module?: LandingPageModule) => {
    if (module) {
      setEditingModule(module);
    } else {
      setEditingModule({
        title: '',
        description: '',
        icon: '',
        visible: true
      });
    }
    setShowEditor(true);
  };

  // FAQ Handlers
  const handleFaqMove = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === faqItems.length - 1)
    ) return;

    const newItems = [...faqItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setFaqItems(newItems);
  };

  const handleFaqDelete = (id: string) => {
    setDeleteFaqConfirmation(id);
  };

  const confirmFaqDelete = () => {
    if (deleteFaqConfirmation) {
      setFaqItems(faqItems.filter(i => i.id !== deleteFaqConfirmation));
      setDeleteFaqConfirmation(null);
    }
  };

  const handleFaqToggleVisibility = (id: string) => {
    setFaqItems(faqItems.map(i => 
      i.id === id ? { ...i, visible: !i.visible } : i
    ));
  };

  const handleSaveFaq = () => {
    if (!editingFaq?.question || !editingFaq?.answer) {
      alert('Preencha a pergunta e a resposta');
      return;
    }

    if (editingFaq.id) {
      setFaqItems(faqItems.map(i => 
        i.id === editingFaq.id ? { ...i, ...editingFaq } as FAQItem : i
      ));
    } else {
      const newItem: FAQItem = {
        ...editingFaq as FAQItem,
        id: Date.now().toString(),
        visible: true
      };
      setFaqItems([...faqItems, newItem]);
    }
    setShowFaqEditor(false);
    setEditingFaq(null);
  };

  const openFaqEditor = (item?: FAQItem) => {
    if (item) {
      setEditingFaq(item);
    } else {
      setEditingFaq({
        question: '',
        answer: '',
        visible: true
      });
    }
    setShowFaqEditor(true);
  };

  const SUGGESTED_ICONS = ["📊", "📅", "🎫", "🎓", "📚", "🥁", "📿", "🌿", "👥", "👣", "✨", "🕊️", "🙏", "💳", "✅", "☕", "👁️", "🗃️", "🔄", "💲", "🎁", "📈", "🎨", "🛡️", "💾", "🤝", "⭐", "🔥", "💡", "🚀"];

  return (
    <div className="space-y-12 text-white">
      <section className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Image className="text-indigo-400" />
          Logo da Landing Page
        </h2>
        <div className="flex items-center gap-6">
          <div className="h-12 w-auto bg-slate-900 border border-slate-700 rounded-xl p-2 flex items-center justify-center overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo atual" className="h-10 w-auto object-contain" />
            ) : (
              <div className="text-slate-500 text-xs">Sem logo definido</div>
            )}
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
              placeholder="URL do logo"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none mb-3"
            />
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={e => handleLogoFile(e.target.files?.[0] || null)} />
              <span className="text-sm font-semibold">Enviar arquivo</span>
            </label>
          </div>
        </div>
      </section>

      <section className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Wand2 className="text-indigo-400" />
          Configurações da Hero Section
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Título Principal</label>
            <textarea
              value={heroTitle}
              onChange={e => setHeroTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none h-24"
              placeholder="Ex: Gestão com Axé..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Subtítulo</label>
            <textarea
              value={heroSubtitle}
              onChange={e => setHeroSubtitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none h-20"
              placeholder="Ex: Simplifique a administração..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Imagem de Fundo (URL)</label>
            <input
              type="text"
              value={heroBackground}
              onChange={e => setHeroBackground(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="https://..."
            />
            {heroBackground && (
              <div className="mt-2 h-32 w-full rounded-lg overflow-hidden border border-slate-700">
                <img src={heroBackground} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Imagem do Dashboard (URL)</label>
            <input
              type="text"
              value={heroDashboard}
              onChange={e => setHeroDashboard(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="/images/hero-dashboard.png ou URL"
            />
            {heroDashboard && (
              <div className="mt-2 h-32 w-full rounded-lg overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center">
                <img src={heroDashboard} alt="Dashboard Preview" className="h-full w-auto object-contain" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Phone className="text-indigo-400" />
          WhatsApp e CNPJ
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">WhatsApp</label>
            <input
              type="text"
              value={whatsappNumber}
              onChange={e => handlePhoneChange(e.target.value)}
              placeholder="Número (ex: +55 (11) 99999-9999)"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">CNPJ</label>
            <input
              type="text"
              value={cnpj}
              onChange={e => handleCnpjChange(e.target.value)}
              placeholder="00.000.000/0001-00"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
      </section>

      {/* Redes Sociais Section */}
      <section className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <MessageCircle className="text-indigo-400" />
          Redes Sociais (Rodapé)
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
              <Facebook size={16} /> Facebook
            </label>
            <input
              type="text"
              value={socialConfig.facebook}
              onChange={e => setSocialConfig({ ...socialConfig, facebook: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="https://facebook.com/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
              <Instagram size={16} /> Instagram
            </label>
            <input
              type="text"
              value={socialConfig.instagram}
              onChange={e => setSocialConfig({ ...socialConfig, instagram: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="https://instagram.com/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
              <Youtube size={16} /> Youtube
            </label>
            <input
              type="text"
              value={socialConfig.youtube}
              onChange={e => setSocialConfig({ ...socialConfig, youtube: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="https://youtube.com/..."
            />
          </div>
        </div>
      </section>

        {/* Client Logos Section */}
        <section className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Building className="text-indigo-400" />
                Gestão de Parceiros/Terreiros
              </h2>
              <p className="text-slate-400">Gerencie os logos dos terreiros parceiros exibidos no carrossel.</p>
              <div className="mt-4 bg-slate-800/80 border border-indigo-500/30 rounded-lg p-4 text-sm text-slate-300">
                <p className="mb-2 font-semibold text-indigo-400">Não tem o logo? Use um avatar gerado automaticamente!</p>
                <p className="mb-2">Você pode usar o serviço <a href="https://ui-avatars.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">UI Avatars</a> para gerar um logo com as iniciais do terreiro.</p>
                <div className="bg-slate-950 p-3 rounded border border-slate-700 font-mono text-xs text-slate-400 break-all">
                  https://ui-avatars.com/api/?name=<span className="text-orange-400">CA</span>&background=<span className="text-green-400">f97316</span>&color=<span className="text-blue-400">fff</span>&rounded=<span className="text-purple-400">true</span>&bold=<span className="text-yellow-400">true</span>
                </div>
                <ul className="mt-2 list-disc list-inside text-slate-400 space-y-1">
                  <li><span className="text-orange-400">name=CA</span>: Iniciais do terreiro (Ex: CA = ConectAxé)</li>
                  <li><span className="text-green-400">background=f97316</span>: Cor de fundo em Hexadecimal (sem o #)</li>
                  <li><span className="text-blue-400">color=fff</span>: Cor da letra em Hexadecimal</li>
                  <li><span className="text-purple-400">rounded=true</span>: Deixa o avatar redondo</li>
                  <li><span className="text-yellow-400">bold=true</span>: Deixa a fonte mais grossa (negrito)</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => openClientLogoEditor()}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors font-semibold"
            >
              <Plus size={20} />
              Novo Parceiro
            </button>
          </div>

          <div className="grid gap-4">
            {clientLogos.map((item, index) => (
              <div 
                key={item.id}
                className={`flex items-start gap-4 bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl transition-all ${!item.visible ? 'opacity-50' : ''}`}
              >
                <div className="flex flex-col items-center gap-1 text-slate-500 mt-1">
                  <span className="text-xs font-mono text-orange-500 mb-1">#{index + 1}</span>
                  <button 
                    onClick={() => handleClientLogoMove(index, 'up')}
                    disabled={index === 0}
                    className="hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-slate-500"
                  >
                    <ChevronUp size={20} />
                  </button>
                  <button 
                    onClick={() => handleClientLogoMove(index, 'down')}
                    disabled={index === clientLogos.length - 1}
                    className="hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-slate-500"
                  >
                    <ChevronDown size={20} />
                  </button>
                </div>

                <div className="w-16 h-16 flex-shrink-0 bg-white rounded-full p-1 flex items-center justify-center">
                   <img src={item.logoUrl} alt={item.name} className="w-full h-full rounded-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg truncate">{item.name}</h3>
                    {!item.visible && (
                      <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded-full uppercase font-bold">
                        Oculto
                      </span>
                    )}
                  </div>
                  <div className="text-indigo-400 text-sm font-medium">{item.location}</div>
                  <p className="text-slate-500 text-xs mt-1 truncate">{item.logoUrl}</p>
                </div>

                <div className="flex items-center gap-2 border-l border-slate-700/50 pl-4 mt-1">
                  <button
                    onClick={() => handleClientLogoToggleVisibility(item.id)}
                    className={`p-2 rounded-lg transition-colors ${item.visible ? 'text-slate-400 hover:text-indigo-400' : 'text-indigo-400 bg-indigo-400/10'}`}
                    title={item.visible ? "Ocultar" : "Mostrar"}
                  >
                    {item.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  
                  <button
                    onClick={() => openClientLogoEditor(item)}
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                  
                  <button
                    onClick={() => handleClientLogoDelete(item.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
      <section className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Quote className="text-indigo-400" />
              Gestão de Depoimentos
            </h2>
            <p className="text-slate-400">Gerencie os relatos exibidos na seção de depoimentos.</p>
          </div>
          <button
            onClick={() => openTestimonialEditor()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors font-semibold"
          >
            <Plus size={20} />
            Novo Depoimento
          </button>
        </div>

        <div className="grid gap-4">
          {testimonials.map((item, index) => (
            <div 
              key={item.id}
              className={`flex items-start gap-4 bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl transition-all ${!item.visible ? 'opacity-50' : ''}`}
            >
              <div className="flex flex-col items-center gap-1 text-slate-500 mt-1">
                <span className="text-xs font-mono text-orange-500 mb-1">#{index + 1}</span>
                <button 
                  onClick={() => handleTestimonialMove(index, 'up')}
                  disabled={index === 0}
                  className="hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-slate-500"
                >
                  <ChevronUp size={20} />
                </button>
                <button 
                  onClick={() => handleTestimonialMove(index, 'down')}
                  disabled={index === testimonials.length - 1}
                  className="hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-slate-500"
                >
                  <ChevronDown size={20} />
                </button>
              </div>

              <div className="w-12 h-12 flex-shrink-0">
                 <img src={item.photoUrl} alt={item.authorName} className="w-full h-full rounded-full object-cover border border-slate-600" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-lg truncate">{item.authorName}</h3>
                  {!item.visible && (
                    <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded-full uppercase font-bold">
                      Oculto
                    </span>
                  )}
                </div>
                <div className="text-indigo-400 text-xs font-medium uppercase mb-2">{item.terreiro}</div>
                <p className="text-slate-400 text-sm line-clamp-2 italic">"{item.text}"</p>
              </div>

              <div className="flex items-center gap-2 border-l border-slate-700/50 pl-4 mt-1">
                <button
                  onClick={() => handleTestimonialToggleVisibility(item.id)}
                  className={`p-2 rounded-lg transition-colors ${item.visible ? 'text-slate-400 hover:text-indigo-400' : 'text-indigo-400 bg-indigo-400/10'}`}
                  title={item.visible ? "Ocultar" : "Mostrar"}
                >
                  {item.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                
                <button
                  onClick={() => openTestimonialEditor(item)}
                  className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Pencil size={18} />
                </button>
                
                <button
                  onClick={() => handleTestimonialDelete(item.id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <HelpCircle className="text-indigo-400" />
              Perguntas Frequentes
            </h2>
            <p className="text-slate-400">Gerencie as perguntas e respostas exibidas na seção de dúvidas.</p>
          </div>
          <button
            onClick={() => openFaqEditor()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors font-semibold"
          >
            <Plus size={20} />
            Nova Pergunta
          </button>
        </div>

        <div className="grid gap-4">
          {faqItems.map((item, index) => (
            <div 
              key={item.id}
              className={`flex items-start gap-4 bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl transition-all ${!item.visible ? 'opacity-50' : ''}`}
            >
              <div className="flex flex-col items-center gap-1 text-slate-500 mt-1">
                <span className="text-xs font-mono text-orange-500 mb-1">#{index + 1}</span>
                <button 
                  onClick={() => handleFaqMove(index, 'up')}
                  disabled={index === 0}
                  className="hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-slate-500"
                >
                  <ChevronUp size={20} />
                </button>
                <button 
                  onClick={() => handleFaqMove(index, 'down')}
                  disabled={index === faqItems.length - 1}
                  className="hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-slate-500"
                >
                  <ChevronDown size={20} />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-lg truncate">{item.question}</h3>
                  {!item.visible && (
                    <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded-full uppercase font-bold">
                      Oculto
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-sm line-clamp-2">{item.answer}</p>
              </div>

              <div className="flex items-center gap-2 border-l border-slate-700/50 pl-4 mt-1">
                <button
                  onClick={() => handleFaqToggleVisibility(item.id)}
                  className={`p-2 rounded-lg transition-colors ${item.visible ? 'text-slate-400 hover:text-indigo-400' : 'text-indigo-400 bg-indigo-400/10'}`}
                  title={item.visible ? "Ocultar" : "Mostrar"}
                >
                  {item.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                
                <button
                  onClick={() => openFaqEditor(item)}
                  className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Pencil size={18} />
                </button>
                
                <button
                  onClick={() => handleFaqDelete(item.id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modules Section */}
      <section className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <GripVertical className="text-indigo-400" />
              Módulos do Sistema
            </h2>
            <p className="text-slate-400">Gerencie os blocos de funcionalidades exibidos na página inicial.</p>
          </div>
          <button
            onClick={() => openEditor()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors font-semibold"
          >
            <Plus size={20} />
            Novo Módulo
          </button>
        </div>

        <div className="grid gap-4">
          {modules.map((module, index) => (
            <div 
              key={module.id}
              className={`flex items-center gap-4 bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl transition-all ${!module.visible ? 'opacity-50' : ''}`}
            >
              <div className="flex flex-col items-center gap-1 text-slate-500">
                <span className="text-xs font-mono text-orange-500 mb-1">#{index + 1}</span>
                <button 
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  className="hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-slate-500"
                >
                  <ChevronUp size={20} />
                </button>
                <button 
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === modules.length - 1}
                  className="hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-slate-500"
                >
                  <ChevronDown size={20} />
                </button>
              </div>

              <div className="w-12 h-12 flex items-center justify-center bg-slate-700/50 rounded-lg text-2xl">
                {module.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-lg truncate">{module.title}</h3>
                  {!module.visible && (
                    <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded-full uppercase font-bold">
                      Oculto
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-sm truncate">{module.description}</p>
              </div>

              <div className="flex items-center gap-2 border-l border-slate-700/50 pl-4">
                <button
                  onClick={() => handleToggleVisibility(module.id)}
                  className={`p-2 rounded-lg transition-colors ${module.visible ? 'text-slate-400 hover:text-indigo-400' : 'text-indigo-400 bg-indigo-400/10'}`}
                  title={module.visible ? "Ocultar" : "Mostrar"}
                >
                  {module.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                
                <button
                  onClick={() => openEditor(module)}
                  className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Pencil size={18} />
                </button>
                
                <button
                  onClick={() => handleDelete(module.id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="text-green-400" />
            Mensagens Automáticas
          </h2>
          <p className="text-slate-400">Configure as mensagens padrão enviadas via WhatsApp.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 flex items-center justify-center bg-green-500/20 rounded-lg text-green-400">
                <MessageCircle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Solicitação de Upgrade</h3>
                <p className="text-slate-400 text-sm">Mensagem pré-preenchida quando um usuário atinge o limite do plano.</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-400">Mensagem do WhatsApp</label>
              <textarea
                value={whatsappMessage}
                onChange={e => setWhatsappMessage(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none h-24 resize-none"
                placeholder="Ex: Olá, gostaria de fazer um upgrade no meu plano do ConectAxé!"
              />
              <p className="text-xs text-slate-500">
                Esta mensagem aparecerá automaticamente quando o usuário clicar no botão de contato na tela de bloqueio de limite.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 flex items-center justify-center bg-blue-500/20 rounded-lg text-blue-400">
                <MessageCircle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Landing Page - Botões de Ação</h3>
                <p className="text-slate-400 text-sm">Configure as mensagens para os botões da página inicial.</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-400">Botão de Teste Grátis (Hero)</label>
                <textarea
                  value={whatsappMessageTest}
                  onChange={e => setWhatsappMessageTest(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                  placeholder="Ex: Olá! Gostaria de testar o sistema ConectAxé gratuitamente."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-400">Plano Iniciante</label>
                <textarea
                  value={whatsappMessageIniciante}
                  onChange={e => setWhatsappMessageIniciante(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                  placeholder="Ex: Olá! Gostaria de contratar o plano Iniciante para meu terreiro."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-400">Plano Expandido</label>
                <textarea
                  value={whatsappMessageExpandido}
                  onChange={e => setWhatsappMessageExpandido(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                  placeholder="Ex: Olá! Tenho interesse no plano Expandido."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-400">Plano Terreiro Pro</label>
                <textarea
                  value={whatsappMessagePro}
                  onChange={e => setWhatsappMessagePro(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                  placeholder="Ex: Olá! Quero saber mais sobre o plano Terreiro Pro."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-400">Ícone Flutuante (WhatsApp)</label>
                <textarea
                  value={whatsappMessageFloating}
                  onChange={e => setWhatsappMessageFloating(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                  placeholder="Ex: Olá! Gostaria de saber mais sobre o ConectAxé."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingModule?.id ? 'Editar Módulo' : 'Novo Módulo'}</h3>
              <button onClick={() => setShowEditor(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Ícone (Emoji)</label>
                <div className="flex gap-2 mb-2">
                   <input
                    type="text"
                    value={editingModule?.icon || ''}
                    onChange={e => setEditingModule({ ...editingModule, icon: e.target.value })}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-2xl"
                    placeholder="Ex: 📊"
                  />
                </div>
                <div className="text-xs text-slate-500 mb-2">
                  Dica: Pressione <span className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-white">Win + .</span> para abrir o teclado de emojis ou escolha abaixo:
                </div>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-slate-950/50 rounded-lg border border-slate-800">
                  {SUGGESTED_ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setEditingModule({ ...editingModule, icon })}
                      className="text-xl hover:bg-slate-700 p-1 rounded transition-colors w-8 h-8 flex items-center justify-center"
                      title="Clique para selecionar"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Título em Destaque</label>
                <input
                  type="text"
                  value={editingModule?.title || ''}
                  onChange={e => setEditingModule({ ...editingModule, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ex: Dashboard Principal"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Descrição</label>
                <textarea
                  value={editingModule?.description || ''}
                  onChange={e => setEditingModule({ ...editingModule, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                  placeholder="Descrição da funcionalidade..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowEditor(false)}
                className="px-4 py-2 text-slate-400 hover:text-white font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-lg font-bold transition-colors"
              >
                <Save size={18} />
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {showFaqEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingFaq?.id ? 'Editar Pergunta' : 'Nova Pergunta'}</h3>
              <button onClick={() => setShowFaqEditor(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Pergunta</label>
                <input
                  type="text"
                  value={editingFaq?.question || ''}
                  onChange={e => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ex: Como funciona o pagamento?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Resposta</label>
                <textarea
                  value={editingFaq?.answer || ''}
                  onChange={e => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none"
                  placeholder="Explique detalhadamente..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowFaqEditor(false)}
                className="px-4 py-2 text-slate-400 hover:text-white font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveFaq}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-lg font-bold transition-colors"
              >
                <Save size={18} />
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {showTestimonialEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingTestimonial?.id ? 'Editar Depoimento' : 'Novo Depoimento'}</h3>
              <button onClick={() => setShowTestimonialEditor(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Nome do Dirigente</label>
                  <input
                    type="text"
                    value={editingTestimonial?.authorName || ''}
                    onChange={e => setEditingTestimonial({ ...editingTestimonial, authorName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ex: Mãe Maria"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Terreiro/Cargo</label>
                  <input
                    type="text"
                    value={editingTestimonial?.terreiro || ''}
                    onChange={e => setEditingTestimonial({ ...editingTestimonial, terreiro: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ex: Templo de Luz"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">URL da Foto</label>
                <input
                  type="text"
                  value={editingTestimonial?.photoUrl || ''}
                  onChange={e => setEditingTestimonial({ ...editingTestimonial, photoUrl: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="https://..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Depoimento</label>
                <textarea
                  value={editingTestimonial?.text || ''}
                  onChange={e => setEditingTestimonial({ ...editingTestimonial, text: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none"
                  placeholder="Escreva o depoimento..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowTestimonialEditor(false)}
                className="px-4 py-2 text-slate-400 hover:text-white font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveTestimonial}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-lg font-bold transition-colors"
              >
                <Save size={18} />
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {showClientLogoEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingClientLogo?.id ? 'Editar Parceiro' : 'Novo Parceiro'}</h3>
              <button onClick={() => setShowClientLogoEditor(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nome do Terreiro</label>
                <input
                  type="text"
                  value={editingClientLogo?.name || ''}
                  onChange={e => setEditingClientLogo({ ...editingClientLogo, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ex: Ilê Axé Ogum"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Cidade e Estado</label>
                <input
                  type="text"
                  value={editingClientLogo?.location || ''}
                  onChange={e => setEditingClientLogo({ ...editingClientLogo, location: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ex: São Paulo - SP"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">URL do Logo</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingClientLogo?.logoUrl || ''}
                    onChange={e => setEditingClientLogo({ ...editingClientLogo, logoUrl: e.target.value })}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="https://..."
                  />
                  <button
                    onClick={() => setEditingClientLogo({ 
                      ...editingClientLogo, 
                      logoUrl: 'https://ui-avatars.com/api/?name=CA&background=f97316&color=fff&rounded=true&bold=true' 
                    })}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 cursor-pointer transition-colors text-slate-400 hover:text-indigo-400"
                    title="Usar Avatar Padrão"
                    type="button"
                  >
                    <Wand2 size={20} />
                  </button>
                  <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 cursor-pointer transition-colors" title="Enviar arquivo">
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleClientLogoFile(e.target.files?.[0] || null)} />
                    <Image size={20} className="text-indigo-400" />
                  </label>
                </div>
                <div className="mt-3 flex items-center gap-4">
                   <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center p-1 border border-slate-700 overflow-hidden">
                      {editingClientLogo?.logoUrl ? (
                        <img src={editingClientLogo.logoUrl} alt="Preview" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <div className="text-slate-400 text-xs text-center">Preview</div>
                      )}
                   </div>
                   <p className="text-xs text-slate-500 flex-1">
                     O sistema ajustará automaticamente sua imagem para o formato circular.
                     <br/>Recomendamos imagens quadradas com o logo centralizado.
                   </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowClientLogoEditor(false)}
                className="px-4 py-2 text-slate-400 hover:text-white font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveClientLogo}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-lg font-bold transition-colors"
              >
                <Save size={18} />
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteClientLogoConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">Confirmar Exclusão</h3>
              <p className="text-slate-400">
                Tem certeza que deseja excluir este parceiro? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex justify-center gap-3 mt-8">
              <button
                onClick={() => setDeleteClientLogoConfirmation(null)}
                className="px-6 py-2 text-slate-400 hover:text-white font-medium bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmClientLogoDelete}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-bold transition-colors text-white"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">Confirmar Exclusão</h3>
              <p className="text-slate-400">
                Tem certeza que deseja excluir o módulo <span className="text-white font-semibold">"{modules.find(m => m.id === deleteConfirmation)?.title}"</span>? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex justify-center gap-3 mt-8">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-6 py-2 text-slate-400 hover:text-white font-medium bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-bold transition-colors text-white"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTestimonialConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">Confirmar Exclusão</h3>
              <p className="text-slate-400">
                Tem certeza que deseja excluir este depoimento? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex justify-center gap-3 mt-8">
              <button
                onClick={() => setDeleteTestimonialConfirmation(null)}
                className="px-6 py-2 text-slate-400 hover:text-white font-medium bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmTestimonialDelete}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-bold transition-colors text-white"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteFaqConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">Confirmar Exclusão</h3>
              <p className="text-slate-400">
                Tem certeza que deseja excluir esta pergunta? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex justify-center gap-3 mt-8">
              <button
                onClick={() => setDeleteFaqConfirmation(null)}
                className="px-6 py-2 text-slate-400 hover:text-white font-medium bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmFaqDelete}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-bold transition-colors text-white"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
