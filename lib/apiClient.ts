
import { ApiResponse } from '../types';

/**
 * Standardized API Client for simulating backend requests
 * Includes middleware logic for logging, auth simulation, and error handling.
 */
class ApiClient {
  private static instance: ApiClient;
  private latency = 600; // Simulated network delay in ms

  private constructor() {}

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  /**
   * Simulated fetch with "middleware"
   */
  public async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<ApiResponse<T>> {
    console.log(`[API Request] ${method} ${endpoint}`, body || '');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, this.latency));

    // Simulate potential random failures (5% chance)
    if (Math.random() < 0.05) {
      return {
        success: false,
        error: "Internal Server Error (Simulated Failure)",
        timestamp: new Date().toISOString()
      };
    }

    try {
      // Logic for different "endpoints" is handled by the services calling this
      return {
        success: true,
        data: body as T, // Placeholder - services will provide actual data
        timestamp: new Date().toISOString()
      };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : "Unknown error",
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Specific helper for standardized success responses
   */
  public wrapSuccess<T>(data: T): ApiResponse<T> {
    return {
      success: true,
      data,
      timestamp: new Date().toISOString()
    };
  }
}

export const api = ApiClient.getInstance();
