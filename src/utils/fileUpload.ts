// File upload utility with S3 support and local fallback
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export interface UploadResult {
  success: boolean;
  url: string;
  fileName: string;
  fileSize: number;
  error?: string;
}

export interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
}

// Check if S3 credentials are available
export const isS3Configured = (): boolean => {
  return !!(
    process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID &&
    process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY &&
    process.env.NEXT_PUBLIC_AWS_REGION &&
    process.env.NEXT_PUBLIC_AWS_S3_BUCKET
  );
};

// Get S3 configuration from environment variables
export const getS3Config = (): S3Config | null => {
  if (!isS3Configured()) return null;
  
  return {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
    region: process.env.NEXT_PUBLIC_AWS_REGION!,
    bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET!
  };
};

// Upload file to S3
export const uploadToS3 = async (
  file: File, 
  folder: string = 'uploads',
  config: S3Config
): Promise<UploadResult> => {
  try {
    const s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    const fileName = `${Date.now()}-${file.name}`;
    const key = `${folder}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: file,
      ContentType: file.type,
      ACL: 'public-read',
    });

    await s3Client.send(command);

    const url = `https://${config.bucket}.s3.${config.region}.amazonaws.com/${key}`;

    return {
      success: true,
      url,
      fileName,
      fileSize: file.size,
    };
  } catch (error) {
    return {
      success: false,
      url: '',
      fileName: '',
      fileSize: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Upload file to local server (fallback)
export const uploadToLocal = async (
  file: File,
  folder: string = 'uploads'
): Promise<UploadResult> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();

    return {
      success: true,
      url: result.url,
      fileName: result.fileName,
      fileSize: file.size,
    };
  } catch (error) {
    return {
      success: false,
      url: '',
      fileName: '',
      fileSize: 0,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

// Main upload function with S3/local fallback
export const uploadFile = async (
  file: File,
  folder: string = 'uploads'
): Promise<UploadResult> => {
  // Try S3 first if configured
  if (isS3Configured()) {
    const config = getS3Config();
    if (config) {
      const result = await uploadToS3(file, folder, config);
      if (result.success) {
        return result;
      }
      // If S3 fails, fall back to local
    }
  }

  // Fallback to local upload
  return await uploadToLocal(file, folder);
};

// Upload multiple files
export const uploadFiles = async (
  files: File[],
  folder: string = 'uploads'
): Promise<UploadResult[]> => {
  const uploadPromises = files.map(file => uploadFile(file, folder));
  return await Promise.all(uploadPromises);
};

// Get file URL (for display)
export const getFileUrl = (url: string): string => {
  // If it's already a full URL (S3), return as is
  if (url.startsWith('http')) {
    return url;
  }
  
  // If it's a local path, prepend the base URL
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${url}`;
};
