const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Types (รีใช้จาก database.ts)
export type {
  AccountCode,
  Category,
  Supplier,
  Product,
  Movement,
  BudgetRequest,
  Approval
} from './database';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return null as T;
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Categories
  async getCategories() {
    return this.request('/categories');
  }

  async createCategory(category: { name: string; description: string; is_medicine?: boolean }) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  async updateCategory(id: string, category: Partial<{ name: string; description: string; is_medicine: boolean }>) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Suppliers
  async getSuppliers() {
    return this.request('/suppliers');
  }

  async createSupplier(supplier: { name: string; email: string; phone: string; address: string }) {
    return this.request('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplier),
    });
  }

  async updateSupplier(id: string, supplier: Partial<{ name: string; email: string; phone: string; address: string }>) {
    return this.request(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplier),
    });
  }

  async deleteSupplier(id: string) {
    return this.request(`/suppliers/${id}`, {
      method: 'DELETE',
    });
  }

  // Products
  async getProducts() {
    return this.request('/products');
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  async createProduct(product: {
    name: string;
    sku: string;
    description?: string;
    category_id: string;
    supplier_id: string;
    unit_price: number;
    current_stock: number;
    min_stock: number;
    max_stock?: number;
    unit?: string;
    location?: string;
    barcode?: string;
    expiry_date?: string;
  }) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, product: Partial<{
    name: string;
    sku: string;
    description: string;
    category_id: string;
    supplier_id: string;
    unit_price: number;
    current_stock: number;
    min_stock: number;
    max_stock: number;
    unit: string;
    location: string;
    barcode: string;
    expiry_date: string;
  }>) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Movements
  async getMovements() {
    return this.request('/movements');
  }

  async createMovement(movement: {
    product_id: string;
    type: 'in' | 'out';
    quantity: number;
    reason: string;
    reference?: string;
    notes?: string;
    created_by?: string;
  }) {
    return this.request('/movements', {
      method: 'POST',
      body: JSON.stringify(movement),
    });
  }

  // Account Codes
  async getAccountCodes() {
    return this.request('/account-codes');
  }

  // Budget Requests
  async getBudgetRequests() {
    return this.request('/budget-requests');
  }

  async createBudgetRequest(request: {
    request_no: string;
    requester: string;
    request_date: string;
    account_code: string;
    account_name?: string;
    amount: number;
    note?: string;
    material_list: Array<{ item: string; quantity: string }>;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  }) {
    return this.request('/budget-requests', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateBudgetRequestStatus(id: number, status: string) {
    return this.request(`/budget-requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Approvals
  async getApprovals() {
    return this.request('/approvals');
  }

  async createApproval(approval: {
    request_id: string;
    decision: string;
    remark?: string;
    approver_name: string;
  }) {
    return this.request('/approvals', {
      method: 'POST',
      body: JSON.stringify(approval),
    });
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);
