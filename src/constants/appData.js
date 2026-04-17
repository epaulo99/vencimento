export const BARS = ['Bar Principal', 'Bar Piscina', 'Bar Praia'];

export const STORAGE_KEYS = {
  users: 'users',
  pendingUsers: 'pendingUsers',
  rejectedUsers: 'rejectedUsers',
  theme: 'theme',
  bebidas: 'bebidas',
  lotes: 'lotes',
  currentUser: 'currentUser'
};

export const DEFAULT_USERS = [
  { id: 'u-admin', username: 'EliabeP', email: 'admin@validade.local', password: '154578', role: 'admin' },
  { id: 'u-barman', username: 'barman', email: 'barman@validade.local', password: 'bar123', role: 'barman' }
];

export const DEFAULT_BEBIDAS = [
  {
    id: 'b-gin',
    nome: 'Gin London Dry',
    categoria: 'Destilado',
    imagem: 'https://images.unsplash.com/photo-1617098474202-0d0d7f60a5ab?auto=format&fit=crop&w=640&q=80'
  },
  {
    id: 'b-vodka',
    nome: 'Vodka Premium',
    categoria: 'Destilado',
    imagem: 'https://images.unsplash.com/photo-1596392301391-8f58c48df3f0?auto=format&fit=crop&w=640&q=80'
  },
  {
    id: 'b-campari',
    nome: 'Campari',
    categoria: 'Aperitivo',
    imagem: 'https://images.unsplash.com/photo-1514361892635-eae31ecb4dc4?auto=format&fit=crop&w=640&q=80'
  }
];

export const ALERT_LIMITS = {
  warning: 30,
  critical: 7
};
