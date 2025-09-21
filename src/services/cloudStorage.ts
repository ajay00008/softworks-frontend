// Cloud Storage Service
// Handles secure storage and retrieval of answer sheets and documents

export interface CloudStorageConfig {
  provider: 'AWS_S3' | 'GOOGLE_CLOUD' | 'AZURE_BLOB' | 'LOCAL';
  bucketName: string;
  region: string;
  accessKey?: string;
  secretKey?: string;
  endpoint?: string;
}

export interface UploadOptions {
  folder?: string;
  fileName?: string;
  contentType?: string;
  metadata?: Record<string, string>;
  expiresIn?: number; // days
  isPublic?: boolean;
  compression?: boolean;
  thumbnail?: boolean;
}

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  contentType: string;
  uploadedAt: string;
  expiresAt?: string;
  thumbnailUrl?: string;
}

export interface FileMetadata {
  key: string;
  url: string;
  size: number;
  contentType: string;
  uploadedAt: string;
  expiresAt?: string;
  metadata: Record<string, string>;
  isPublic: boolean;
  thumbnailUrl?: string;
}

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  filesByType: Record<string, number>;
  storageUsed: number;
  storageLimit: number;
  oldestFile: string;
  newestFile: string;
}

class CloudStorageService {
  private config: CloudStorageConfig;
  private apiBaseUrl: string;

  constructor(config: CloudStorageConfig, apiBaseUrl: string = '/api') {
    this.config = config;
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Upload file to cloud storage
   */
  async uploadFile(
    file: File, 
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('config', JSON.stringify(this.config));
      formData.append('options', JSON.stringify(options));

      const response = await fetch(`${this.apiBaseUrl}/storage/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: File[], 
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, options));
    return Promise.all(uploadPromises);
  }

  /**
   * Upload answer sheet with specific metadata
   */
  async uploadAnswerSheet(
    file: File,
    examId: string,
    studentId: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const answerSheetOptions: UploadOptions = {
      ...options,
      folder: `answer-sheets/${examId}`,
      fileName: `${studentId}-${Date.now()}.${file.name.split('.').pop()}`,
      metadata: {
        examId,
        studentId,
        uploadedAt: new Date().toISOString(),
        type: 'answer-sheet',
        ...options.metadata
      },
      expiresIn: 365, // 1 year retention
      compression: true,
      thumbnail: true
    };

    return this.uploadFile(file, answerSheetOptions);
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(key: string): Promise<FileMetadata> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/storage/metadata/${encodeURIComponent(key)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get file metadata');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw error;
    }
  }

  /**
   * Download file
   */
  async downloadFile(key: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/storage/download/${encodeURIComponent(key)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  /**
   * Get file URL (for viewing)
   */
  async getFileUrl(key: string, expiresIn?: number): Promise<string> {
    try {
      const params = new URLSearchParams();
      if (expiresIn) params.append('expiresIn', expiresIn.toString());

      const response = await fetch(`${this.apiBaseUrl}/storage/url/${encodeURIComponent(key)}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get file URL');
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Error getting file URL:', error);
      throw error;
    }
  }

  /**
   * Delete file
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/storage/delete/${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Delete multiple files
   */
  async deleteFiles(keys: string[]): Promise<{ deleted: string[], failed: string[] }> {
    const results = { deleted: [] as string[], failed: [] as string[] };

    for (const key of keys) {
      try {
        await this.deleteFile(key);
        results.deleted.push(key);
      } catch (error) {
        console.error(`Failed to delete file ${key}:`, error);
        results.failed.push(key);
      }
    }

    return results;
  }

  /**
   * List files in folder
   */
  async listFiles(
    folder?: string, 
    prefix?: string, 
    maxResults: number = 100
  ): Promise<FileMetadata[]> {
    try {
      const params = new URLSearchParams();
      if (folder) params.append('folder', folder);
      if (prefix) params.append('prefix', prefix);
      params.append('maxResults', maxResults.toString());

      const response = await fetch(`${this.apiBaseUrl}/storage/list?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to list files');
      }

      return await response.json();
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<StorageStats> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/storage/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get storage stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting storage stats:', error);
      throw error;
    }
  }

  /**
   * Clean up expired files
   */
  async cleanupExpiredFiles(): Promise<{ deleted: number, errors: string[] }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/storage/cleanup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cleanup expired files');
      }

      return await response.json();
    } catch (error) {
      console.error('Error cleaning up expired files:', error);
      throw error;
    }
  }

  /**
   * Generate thumbnail for image
   */
  async generateThumbnail(
    key: string, 
    size: { width: number, height: number } = { width: 200, height: 200 }
  ): Promise<string> {
    try {
      const params = new URLSearchParams({
        width: size.width.toString(),
        height: size.height.toString()
      });

      const response = await fetch(`${this.apiBaseUrl}/storage/thumbnail/${encodeURIComponent(key)}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate thumbnail');
      }

      const result = await response.json();
      return result.thumbnailUrl;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw error;
    }
  }

  /**
   * Compress image
   */
  async compressImage(
    key: string, 
    quality: number = 0.8,
    maxWidth?: number,
    maxHeight?: number
  ): Promise<string> {
    try {
      const params = new URLSearchParams({
        quality: quality.toString()
      });
      if (maxWidth) params.append('maxWidth', maxWidth.toString());
      if (maxHeight) params.append('maxHeight', maxHeight.toString());

      const response = await fetch(`${this.apiBaseUrl}/storage/compress/${encodeURIComponent(key)}?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to compress image');
      }

      const result = await response.json();
      return result.compressedUrl;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw error;
    }
  }

  /**
   * Get file preview URL
   */
  getPreviewUrl(key: string): string {
    return `${this.apiBaseUrl}/storage/preview/${encodeURIComponent(key)}`;
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File, allowedTypes: string[] = [], maxSize: number = 10 * 1024 * 1024): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
    }

    // Check file type
    if (allowedTypes.length > 0) {
      const fileType = file.type;
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const isAllowed = allowedTypes.some(type => 
        fileType.includes(type) || fileExtension === type
      );
      
      if (!isAllowed) {
        errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get file size in human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file type icon
   */
  getFileTypeIcon(contentType: string): string {
    if (contentType.startsWith('image/')) return '🖼️';
    if (contentType.includes('pdf')) return '📄';
    if (contentType.includes('word')) return '📝';
    if (contentType.includes('excel')) return '📊';
    if (contentType.includes('powerpoint')) return '📈';
    if (contentType.includes('text/')) return '📄';
    if (contentType.includes('video/')) return '🎥';
    if (contentType.includes('audio/')) return '🎵';
    return '📁';
  }

  /**
   * Check if file is image
   */
  isImageFile(contentType: string): boolean {
    return contentType.startsWith('image/');
  }

  /**
   * Check if file is PDF
   */
  isPdfFile(contentType: string): boolean {
    return contentType.includes('pdf');
  }

  /**
   * Get authentication token
   */
  private getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<CloudStorageConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): CloudStorageConfig {
    return { ...this.config };
  }
}

// Default configuration
const defaultConfig: CloudStorageConfig = {
  provider: 'AWS_S3',
  bucketName: 'softworks-answer-sheets',
  region: 'us-east-1'
};

// Export singleton instance
export const cloudStorageService = new CloudStorageService(defaultConfig);

// Export types
export type {
  CloudStorageConfig,
  UploadOptions,
  UploadResult,
  FileMetadata,
  StorageStats
};
