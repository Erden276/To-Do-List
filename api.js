// ==========================================
// API Service — CRUD Operations ke Supabase
// Ini adalah layer "terdistribusi" karena
// frontend kita berkomunikasi dengan server
// Supabase (backend) melalui REST API
// ==========================================

const API = {
  // ============ GET — Ambil semua todos ============
  async getAllTodos() {
    try {
      const response = await fetch(`${API_BASE}/todos?select=*&order=created_at.desc`, {
        method: 'GET',
        headers: HEADERS
      });
      if (!response.ok) throw new Error(`GET Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('GET /todos gagal:', error);
      throw error;
    }
  },

  // ============ GET by ID — Ambil satu todo ============
  async getTodoById(id) {
    try {
      const response = await fetch(`${API_BASE}/todos?id=eq.${id}&select=*`, {
        method: 'GET',
        headers: HEADERS
      });
      if (!response.ok) throw new Error(`GET by ID Error: ${response.status}`);
      const data = await response.json();
      return data[0] || null;
    } catch (error) {
      console.error(`GET /todos/${id} gagal:`, error);
      throw error;
    }
  },

  // ============ POST — Tambah todo baru ============
  async createTodo(todo) {
    try {
      const response = await fetch(`${API_BASE}/todos`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
          title: todo.title,
          description: todo.description || '',
          priority: todo.priority || 'medium',
          is_completed: false
        })
      });
      if (!response.ok) throw new Error(`POST Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('POST /todos gagal:', error);
      throw error;
    }
  },

  // ============ PUT — Update todo ============
  async updateTodo(id, updates) {
    try {
      const response = await fetch(`${API_BASE}/todos?id=eq.${id}`, {
        method: 'PATCH',
        headers: HEADERS,
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error(`PUT Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`PUT /todos/${id} gagal:`, error);
      throw error;
    }
  },

  // ============ DELETE — Hapus todo ============
  async deleteTodo(id) {
    try {
      const response = await fetch(`${API_BASE}/todos?id=eq.${id}`, {
        method: 'DELETE',
        headers: HEADERS
      });
      if (!response.ok) throw new Error(`DELETE Error: ${response.status}`);
      return true;
    } catch (error) {
      console.error(`DELETE /todos/${id} gagal:`, error);
      throw error;
    }
  },

  // ============ PATCH — Toggle status selesai ============
  async toggleTodo(id, isCompleted) {
    return this.updateTodo(id, { is_completed: !isCompleted });
  }
};
