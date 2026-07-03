import { User, Facility, Booking, Notification, SlotTime, SportType, BookingStatus, Attendance, WaitlistEntry } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

// Helper for fetch requests
async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const db = {
  // --- USERS ---
  async getUsers(): Promise<User[]> {
    return apiRequest<User[]>('/users');
  },

  async hasAdmin(): Promise<boolean> {
    const res = await apiRequest<{ hasAdmin: boolean }>('/users/has-admin');
    return res.hasAdmin;
  },

  async initializeAdmin(adminData: any): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      // In backend/main.py, we register admin as normal user registration or special init
      // We will route it to register with role admin
      const res = await apiRequest<{ success: boolean; user: User }>('/users/register', {
        method: 'POST',
        body: JSON.stringify({ ...adminData, role: 'admin' }),
      });
      return { success: true, user: res.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async registerUser(userData: any): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const res = await apiRequest<{ success: boolean; user: User }>('/users/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return { success: true, user: res.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async loginUser(employeeId: string, password?: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const res = await apiRequest<{ success: boolean; user: User }>('/users/login', {
        method: 'POST',
        body: JSON.stringify({ employeeId, password }),
      });
      // Store current user in localStorage for synchronous session checks on page load
      localStorage.setItem('playsmart_current_user', JSON.stringify(res.user));
      return { success: true, user: res.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  getCurrentUser(): User | null {
    try {
      const item = localStorage.getItem('playsmart_current_user');
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  logoutUser(): void {
    localStorage.removeItem('playsmart_current_user');
  },

  async changeUserRole(userId: string, role: string): Promise<boolean> {
    try {
      await apiRequest('/users/role', {
        method: 'POST',
        body: JSON.stringify({ userId, role }),
      });
      return true;
    } catch {
      return false;
    }
  },

  // --- FACILITIES ---
  async getFacilities(): Promise<Facility[]> {
    return apiRequest<Facility[]>('/facilities');
  },

  async toggleFacilityMaintenance(facilityId: string): Promise<Facility[]> {
    return apiRequest<Facility[]>(`/facilities/maintenance/${facilityId}`, {
      method: 'POST',
    });
  },

  // --- BOOKINGS ---
  async getBookings(): Promise<Booking[]> {
    return apiRequest<Booking[]>('/bookings');
  },

  async createBooking(bookingData: {
    employeeId: string;
    email?: string;
    facilityId: string;
    slotTime: SlotTime;
    bookingSource: 'online' | 'security';
  }): Promise<{ success: boolean; error?: string; booking?: Booking }> {
    try {
      const res = await apiRequest<{ success: boolean; booking: Booking }>('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });
      return { success: true, booking: res.booking };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async cancelBooking(bookingId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await apiRequest('/bookings/cancel', {
        method: 'POST',
        body: JSON.stringify({ bookingId }),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus, verifiedBy?: string): Promise<{ success: boolean; error?: string }> {
    try {
      await apiRequest('/bookings/status', {
        method: 'POST',
        body: JSON.stringify({ bookingId, status, verifiedBy }),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // --- WAITLIST ---
  async getWaitlist(): Promise<WaitlistEntry[]> {
    return apiRequest<WaitlistEntry[]>('/waitlist');
  },

  async joinWaitlist(employeeId: string, facilityId: string, slotTime: SlotTime): Promise<{ success: boolean; error?: string; entry?: WaitlistEntry }> {
    try {
      const res = await apiRequest<{ success: boolean; entry: WaitlistEntry }>('/waitlist/join', {
        method: 'POST',
        body: JSON.stringify({ employeeId, facilityId, slotTime }),
      });
      return { success: true, entry: res.entry };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async leaveWaitlist(waitlistId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await apiRequest('/waitlist/leave', {
        method: 'POST',
        body: JSON.stringify({ waitlistId }),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // --- NOTIFICATIONS ---
  async getNotifications(employeeId: string): Promise<Notification[]> {
    return apiRequest<Notification[]>(`/notifications/${employeeId}`);
  },

  async markNotificationRead(id: string): Promise<void> {
    await apiRequest('/notifications/read', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  },

  // --- SIMULATED TIME ---
  async getSimulatedTime(): Promise<{ hour: number; minute: number }> {
    return apiRequest<{ hour: number; minute: number }>('/time');
  },

  async setSimulatedTime(time: { hour: number; minute: number }): Promise<void> {
    await apiRequest('/time', {
      method: 'POST',
      body: JSON.stringify(time),
    });
    // Dispatch local event for components on same page to synchronize instantly
    window.dispatchEvent(new Event('simulated_time_change'));
  },

  formatSimulatedTime(time: { hour: number; minute: number }): string {
    const suffix = time.hour >= 12 ? 'PM' : 'AM';
    const displayHour = time.hour % 12 || 12;
    const padMin = String(time.minute).padStart(2, '0');
    return `${displayHour}:${padMin} ${suffix}`;
  },

  // --- SIMULATED EMAILS ---
  async getSimulatedEmails(): Promise<any[]> {
    return apiRequest<any[]>('/emails');
  },

  async clearSimulatedEmails(): Promise<void> {
    await apiRequest('/emails/clear', {
      method: 'POST',
    });
    window.dispatchEvent(new Event('simulated_email_sent'));
  },
};
