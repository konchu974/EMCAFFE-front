// lib/api/productService.ts

import type {
  Product,
  ProductWithVariants,
  ProductVariant,
  CreateProductDto,
  UpdateProductDto,
  UpdateStockDto,
  CreateProductVariantDto,
  UpdateProductVariantDto,
  ProductFilters,
  ProductQueryParams,
  ProductListResponse,
  LowStockProduct,
  CoffeeType,
  RoastLevel,
  ProductResponse,
  ProductDetailResponse,
} from './types/product.types';

const API_URL = import.meta.env.PUBLIC_API_URL || 'https://api-emcafe-3.onrender.com/api';

class ProductService {
  private getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' 
  ? localStorage.getItem('token') 
  : null;

    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  // ==================== PUBLIC ROUTES ====================

  /**
   * GET /products - Récupérer tous les produits
   * @param params - Paramètres de requête (pagination, filtres, tri)
   */
async getAllProducts(params?: ProductQueryParams): Promise<ProductListResponse> {
  const queryString = params ? this.buildQueryString(params) : '';
  
  const response = await fetch(`${API_URL}/products${queryString}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des produits');
  }

  const result = await response.json();

  // Normalisation de la réponse
  if (Array.isArray(result)) {
    return {
      data: result,
      products: result,
      page: 1,
      limit: result.length,
      totalPages: 1,
      total: result.length
    };
  }

  return result; // déjà un ProductListResponse
}


  /**
   * GET /products/full - Récupérer tous les produits avec leurs variantes
   */
  async getAllProductsWithVariants(): Promise<ProductWithVariants[]> {
    const response = await fetch(`${API_URL}/products/full`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des produits avec variantes');
    }

    return response.json();
  }

  /**
   * GET /products/:id - Récupérer un produit par son ID
   */
async getProductById(id: string): Promise<ProductDetailResponse> {
  const response = await fetch(`${API_URL}/products/${id}`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) throw new Error('Produit non trouvé');

  return response.json(); // TypeScript comprend que c'est ProductResponse
}

  /**
   * GET /products/:id/full - Récupérer un produit avec ses variantes
   */
 async getProductWithVariants(id: string): Promise<ProductResponse> {
  const response = await fetch(`${API_URL}/products/${id}/full`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Produit non trouvé');
  }

  return response.json(); // Retourne { success: true, data: ProductWithVariants }
}


  /**
   * GET /products/featured - Récupérer les produits en vedette
   */
  async getFeaturedProducts(): Promise<Product[]> {
    const response = await fetch(`${API_URL}/products/featured`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des produits en vedette');
    }

    return response.json();
  }

  /**
   * GET /size/:size - Récupérer les produits par taille/format
   */
  async getProductsBySize(size: string): Promise<Product[]> {
    const response = await fetch(`${API_URL}/size/${size}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des produits par taille');
    }

    return response.json();
  }

  /**
   * GET /products/by-intensity - Récupérer les produits par intensité
   */
  async getProductsByIntensity(intensity?: number): Promise<Product[]> {
    const url = intensity 
      ? `${API_URL}/products/by-intensity?intensity=${intensity}`
      : `${API_URL}/products/by-intensity`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des produits par intensité');
    }

    return response.json();
  }

  /**
   * Recherche de produits avec filtres avancés
   * @param filters - Filtres (type de café, torréfaction, intensité, prix, etc.)
   */
  async searchProducts(filters: ProductFilters): Promise<Product[]> {
    const queryString = this.buildQueryString(filters);
    
    const response = await fetch(`${API_URL}/products${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la recherche de produits');
    }

    return response.json();
  }

  /**
   * Récupérer les produits par type de café (Arabica, Robusta, etc.)
   */
  async getProductsByCoffeeType(coffeeType: CoffeeType): Promise<Product[]> {
    return this.searchProducts({ coffee_type: coffeeType });
  }

  /**
   * Récupérer les produits par niveau de torréfaction
   */
  async getProductsByRoastLevel(roastLevel: RoastLevel): Promise<Product[]> {
    return this.searchProducts({ roast_level: roastLevel });
  }

  /**
   * Récupérer les produits par origine
   */
  async getProductsByOrigin(origin: string): Promise<Product[]> {
    return this.searchProducts({ origin });
  }

  /**
   * Récupérer les produits par catégorie
   */
  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.searchProducts({ category });
  }

  /**
   * Récupérer les produits dans une plage d'intensité
   */
  async getProductsByIntensityRange(minIntensity: number, maxIntensity: number): Promise<Product[]> {
    return this.searchProducts({ minIntensity, maxIntensity });
  }

  /**
   * Récupérer les produits dans une plage de prix
   */
  async getProductsByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    return this.searchProducts({ minPrice, maxPrice });
  }

  // ==================== ADMIN ROUTES ====================

  /**
   * GET /products/low-stock - Récupérer les produits en rupture de stock (admin)
   */
  async getLowStockProducts(): Promise<LowStockProduct[]> {
    const response = await fetch(`${API_URL}/products/low-stock`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des produits en rupture de stock');
    }

    return response.json();
  }

  /**
   * POST /products - Créer un nouveau produit (admin)
   */
  async createProduct(data: CreateProductDto): Promise<Product> {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la création du produit');
    }

    return response.json();
  }

  /**
   * PUT /products/:id - Mettre à jour un produit (admin)
   */
  async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la mise à jour du produit');
    }

    return response.json();
  }

  /**
   * DELETE /products/:id - Supprimer un produit (admin)
   */
  async deleteProduct(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la suppression du produit');
    }
  }

  /**
   * PATCH /products/:id/stock - Mettre à jour le stock d'un produit (admin)
   */
  async updateStock(id: string, data: UpdateStockDto): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${id}/stock`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la mise à jour du stock');
    }

    return response.json();
  }

  /**
   * Activer/Désactiver un produit (admin)
   */
  async toggleProductStatus(id: string, isActive: boolean): Promise<Product> {
    return this.updateProduct(id, { is_active: isActive ? 1 : 0 });
  }

  // ==================== VARIANT MANAGEMENT ====================

  /**
   * Créer une variante de produit (admin)
   */
  async createVariant(data: CreateProductVariantDto): Promise<ProductVariant> {
    const response = await fetch(`${API_URL}/products/${data.productId}/variants`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la création de la variante');
    }

    return response.json();
  }

  /**
   * Mettre à jour une variante (admin)
   */
  async updateVariant(variantId: string, data: UpdateProductVariantDto): Promise<ProductVariant> {
    const response = await fetch(`${API_URL}/variants/${variantId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la mise à jour de la variante');
    }

    return response.json();
  }

  /**
   * Supprimer une variante (admin)
   */
  async deleteVariant(variantId: string): Promise<void> {
    const response = await fetch(`${API_URL}/variants/${variantId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la suppression de la variante');
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Vérifier la disponibilité d'un produit
   */
  async checkProductAvailability(id: string, quantity: number = 1): Promise<boolean> {
    try {
      const product = await this.getProductById(id);
      return product.product.stock >= quantity;
    } catch {
      return false;
    }
  }

  /**
   * Vérifier la disponibilité d'une variante
   */
 async checkVariantAvailability(productId: string, variantId: string, quantity: number = 1): Promise<boolean> {
  try {
    const result = await this.getProductWithVariants(productId);
    const product = result.data; 
    const variant = product.variants.find(v => v.idVariant === variantId);
    return variant ? variant.stock >= quantity : false;
  } catch {
    return false;
  }
}


  /**
   * Récupérer le prix d'un produit (avec gestion des variantes)
   */
  async getProductPrice(id: string, variantId?: string): Promise<number> {
    if (variantId) {
      const result = await this.getProductWithVariants(variantId);
        const product = result.data; 
      const variant = product.variants.find(v => v.idVariant === variantId);
      return variant?.price ?? product.price;
    }
    
    const product = await this.getProductById(id);
    return product.product.price;
  }

  /**
   * Récupérer les variantes actives d'un produit
   */
  async getActiveVariants(productId: string): Promise<ProductVariant[]> {
    const result = await this.getProductWithVariants(productId);
    const product = result.data; 
    return product.variants.filter(v => v.isActive);
  }

  /**
   * Calculer le stock total d'un produit (produit + variantes)
   */
  async getTotalStock(productId: string): Promise<number> {
    const result = await this.getProductWithVariants(productId);
    const product = result.data; 
    const variantsStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
    return product.stock + variantsStock;
  }
}

// Export singleton instance
export const productService = new ProductService();

// Export class for testing or custom instances
export default ProductService;