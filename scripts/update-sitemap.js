
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Firebase (Copiada de firebaseConfig.ts)
const firebaseConfig = {
  apiKey: "AIzaSyA2OhTjwF_EHcW8TiJsANKb_4V0COifSQw",
  authDomain: "conectaxe-4acc7.firebaseapp.com",
  projectId: "conectaxe-4acc7",
  storageBucket: "conectaxe-4acc7.firebasestorage.app",
  messagingSenderId: "960117201215",
  appId: "1:960117201215:web:ee1804ca7eef44b8015b8a"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const BASE_URL = 'https://www.conectaxe.com.br';

async function generateSitemap() {
  console.log('Iniciando geração do Sitemap...');

  try {
    // 1. Rotas Estáticas
    const staticRoutes = [
      { url: '/', changefreq: 'weekly', priority: 1.0 },
      { url: '/login', changefreq: 'monthly', priority: 0.8 },
      { url: '/register', changefreq: 'monthly', priority: 0.8 },
      { url: '/blog', changefreq: 'daily', priority: 0.9 },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

    // Adiciona rotas estáticas
    const today = new Date().toISOString().split('T')[0];
    
    staticRoutes.forEach(route => {
      xml += `  <url>
    <loc>${BASE_URL}${route.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>
`;
    });

    // 2. Rotas Dinâmicas (Blog)
    console.log('Buscando posts do blog...');
    const postsRef = collection(db, "blog_posts");
    const q = query(postsRef, where("status", "==", "approved"));
    const querySnapshot = await getDocs(q);

    console.log(`Encontrados ${querySnapshot.size} posts aprovados.`);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.slug) {
        const lastMod = data.updatedAt ? new Date(data.updatedAt).toISOString().split('T')[0] : today;
        
        xml += `  <url>
    <loc>${BASE_URL}/blog/${data.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }
    });

    xml += `</urlset>`;

    // 3. Salvar Arquivo
    const outputPath = path.join(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(outputPath, xml);
    
    console.log(`Sitemap gerado com sucesso em: ${outputPath}`);
    process.exit(0);

  } catch (error) {
    console.error('Erro ao gerar sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();
