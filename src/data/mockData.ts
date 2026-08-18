export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  priceRange: string;
  address: string;
  phone: string;
  image: string;
  description: string;
  openHours: string;
  menu: MenuItem[];
  location: {
    lat: number;
    lng: number;
  };
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
}

export interface Reservation {
  id: string;
  restaurantId: string;
  date: string;
  time: string;
  guests: number;
  name: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

export const mockRestaurants: Restaurant[] = [
  {
    id: "1",
    name: "La Trattoria Italiana",
    cuisine: "Italiana",
    rating: 4.5,
    priceRange: "$$$",
    address: "Carrera 13 #85-24, Zona Rosa, Bogotá",
    phone: "+57 1 555 1234",
    image: "https://images.unsplash.com/photo-1657593088889-5105c637f2a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwaW50ZXJpb3IlMjBkaW5pbmd8ZW58MXx8fHwxNzcxMjgyODUzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Auténtica cocina italiana con ingredientes frescos importados directamente de Italia.",
    openHours: "13:00 - 16:00, 20:00 - 23:30",
    location: { lat: 4.6764, lng: -74.0478 },
    menu: [
      {
        id: "1",
        name: "Pasta Carbonara",
        description: "Pasta fresca con panceta, huevo y queso pecorino",
        price: 42000,
        category: "Pasta",
        image: "https://images.unsplash.com/photo-1662197480393-2a82030b7b83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwcGFzdGElMjBmb29kfGVufDF8fHx8MTc3MTMwMjM0MHww&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: "2",
        name: "Risotto ai Funghi",
        description: "Risotto cremoso con setas porcini",
        price: 48000,
        category: "Risotto"
      },
      {
        id: "3",
        name: "Pizza Margherita",
        description: "Pizza clásica con tomate, mozzarella y albahaca",
        price: 35000,
        category: "Pizza"
      },
      {
        id: "4",
        name: "Tiramisú",
        description: "Postre tradicional italiano con café y mascarpone",
        price: 18000,
        category: "Postres"
      }
    ]
  },
  {
    id: "2",
    name: "El Rincón Mexicano",
    cuisine: "Mexicana",
    rating: 4.3,
    priceRange: "$$",
    address: "Calle 82 #12-15, Chapinero, Bogotá",
    phone: "+57 1 555 2345",
    image: "https://images.unsplash.com/photo-1688845465690-e5ea24774fd5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXhpY2FuJTIwdGFjb3MlMjBmb29kfGVufDF8fHx8MTc3MTMxODgwMnww&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Cocina mexicana auténtica con recetas tradicionales y sabores picantes.",
    openHours: "12:00 - 00:00",
    location: { lat: 4.6533, lng: -74.0603 },
    menu: [
      {
        id: "1",
        name: "Tacos al Pastor",
        description: "Tres tacos con carne marinada, piña y cilantro",
        price: 32000,
        category: "Tacos"
      },
      {
        id: "2",
        name: "Quesadillas de Pollo",
        description: "Tortilla con pollo, queso y verduras",
        price: 28000,
        category: "Quesadillas"
      },
      {
        id: "3",
        name: "Guacamole con Nachos",
        description: "Guacamole fresco con chips de maíz",
        price: 20000,
        category: "Entrantes"
      },
      {
        id: "4",
        name: "Churros con Chocolate",
        description: "Churros crujientes con chocolate caliente",
        price: 16000,
        category: "Postres"
      }
    ]
  },
  {
    id: "3",
    name: "Sushi Tokyo",
    cuisine: "Japonesa",
    rating: 4.7,
    priceRange: "$$$$",
    address: "Carrera 11 #93-45, Usaquén, Bogotá",
    phone: "+57 1 555 3456",
    image: "https://images.unsplash.com/photo-1621871908119-295c8ce5cee4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHN1c2hpJTIwZm9vZHxlbnwxfHx8fDE3NzEzNDM1MjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Sushi de alta calidad preparado por chefs japoneses con pescado fresco.",
    openHours: "13:00 - 16:00, 19:30 - 23:00",
    location: { lat: 4.6782, lng: -74.0322 },
    menu: [
      {
        id: "1",
        name: "Sushi Variado (12 piezas)",
        description: "Selección del chef de nigiri y maki",
        price: 70000,
        category: "Sushi"
      },
      {
        id: "2",
        name: "Sashimi de Salmón",
        description: "8 láminas de salmón fresco",
        price: 52000,
        category: "Sashimi"
      },
      {
        id: "3",
        name: "Ramen Tonkotsu",
        description: "Fideos en caldo de cerdo con chashu y huevo",
        price: 44000,
        category: "Ramen"
      },
      {
        id: "4",
        name: "Mochi de Té Verde",
        description: "Pastelitos de arroz rellenos de helado",
        price: 18000,
        category: "Postres"
      }
    ]
  },
  {
    id: "4",
    name: "Burger House",
    cuisine: "Americana",
    rating: 4.2,
    priceRange: "$$",
    address: "Calle 116 #19-35, Santa Bárbara, Bogotá",
    phone: "+57 1 555 4567",
    image: "https://images.unsplash.com/photo-1699874371811-5484a9970441?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBhbWVyaWNhbiUyMGZvb2R8ZW58MXx8fHwxNzcxMzYzOTU1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Las mejores hamburguesas gourmet con carne 100% angus.",
    openHours: "12:00 - 01:00",
    location: { lat: 4.7110, lng: -74.0361 },
    menu: [
      {
        id: "1",
        name: "Classic Burger",
        description: "Hamburguesa con queso cheddar, lechuga y tomate",
        price: 35000,
        category: "Hamburguesas"
      },
      {
        id: "2",
        name: "BBQ Bacon Burger",
        description: "Con bacon, cebolla caramelizada y salsa BBQ",
        price: 42000,
        category: "Hamburguesas"
      },
      {
        id: "3",
        name: "Patatas Fritas",
        description: "Patatas crujientes con sal marina",
        price: 13000,
        category: "Acompañamientos"
      },
      {
        id: "4",
        name: "Brownie con Helado",
        description: "Brownie de chocolate con helado de vainilla",
        price: 18000,
        category: "Postres"
      }
    ]
  }
];