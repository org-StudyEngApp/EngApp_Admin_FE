import { BlobServiceClient } from '@azure/storage-blob';

class AzureStorageService {
  constructor() {
    // Lấy thông tin Azure Storage từ biến môi trường
    this.connectionString = import.meta.env.VITE_AZURE_STORAGE_CONNECTION_STRING;
    this.containerName = import.meta.env.VITE_AZURE_STORAGE_CONTAINER_NAME || 'uploads';
    
    if (!this.connectionString) {
      console.error('Azure Storage connection string chưa được cấu hình!');
    }
  }

  /**
   * Lấy BlobServiceClient từ connection string
   */
  getBlobServiceClient() {
    if (!this.connectionString) {
      throw new Error('Azure Storage connection string chưa được cấu hình!');
    }
    return BlobServiceClient.fromConnectionString(this.connectionString);
  }

  /**
   * Tạo tên file unique để tránh trùng lặp
   */
  generateUniqueBlobName(file, type) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    return `${type}/${timestamp}-${randomString}.${extension}`;
  }

  /**
   * Upload file lên Azure Blob Storage
   * @param {File} file - File cần upload
   * @param {string} type - Loại file ('image' hoặc 'audio')
   * @returns {Object} - Thông tin file đã upload
   */
  async uploadFile(file, type = 'auto') {
    console.log(`Đang upload file ${type} lên Azure Storage:`, file.name, `(${file.size} bytes)`);
    
    // Kiểm tra định dạng file trước khi upload
    this.validateFile(file, type === 'audio' ? 'audio' : 'image');
    
    try {
      // Lấy blob service client
      const blobServiceClient = this.getBlobServiceClient();
      
      // Lấy container client
      const containerClient = blobServiceClient.getContainerClient(this.containerName);
      
      // Tạo container nếu chưa tồn tại (chỉ trong development)
      try {
        await containerClient.createIfNotExists({
          access: 'blob' // Public access cho blobs
        });
      } catch {
        console.log('Container đã tồn tại hoặc không có quyền tạo container');
      }
      
      // Tạo tên blob unique
      const blobName = this.generateUniqueBlobName(file, type);
      
      // Lấy block blob client
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      // Xác định content type
      const contentType = file.type;
      
      // Upload file
      console.log('Đang upload file:', blobName);
      await blockBlobClient.uploadData(file, {
        blobHTTPHeaders: {
          blobContentType: contentType
        }
      });
      
      // Lấy URL của blob
      const url = blockBlobClient.url;
      
      console.log('Upload thành công:', url);
      
      // Trả về các thông tin quan trọng về file đã upload
      return {
        url: url, // URL để lưu vào database
        blobName: blobName, // Tên blob trong Azure Storage
        contentType: contentType,
        size: file.size,
        containerName: this.containerName
      };
    } catch (error) {
      console.error('Azure Storage upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Upload ảnh
   */
  async uploadImage(file) {
    console.log('Đang upload ảnh:', file.name);
    return this.uploadFile(file, 'image');
  }

  /**
   * Upload audio
   */
  async uploadAudio(file) {
    console.log('Đang upload audio:', file.name);
    return this.uploadFile(file, 'audio');
  }

  /**
   * Tạo preview URL cho file (blob URL local)
   */
  generatePreviewUrl(file) {
    return URL.createObjectURL(file);
  }

  /**
   * Thu hồi preview URL
   */
  revokePreviewUrl(url) {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Validate file trước khi upload
   */
  validateFile(file, type) {
    const maxSizes = {
      image: 5 * 1024 * 1024, // 5MB
      audio: 20 * 1024 * 1024, // 20MB
    };

    const allowedTypes = {
      image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/mp4'],
    };

    if (!file) {
      throw new Error('Không có file được chọn');
    }

    if (!allowedTypes[type].includes(file.type)) {
      throw new Error(`Định dạng file ${type} không được hỗ trợ. Định dạng hiện tại: ${file.type}`);
    }

    if (file.size > maxSizes[type]) {
      const maxSizeMB = maxSizes[type] / (1024 * 1024);
      throw new Error(`Kích thước file ${type} không được vượt quá ${maxSizeMB}MB`);
    }

    return true;
  }

  /**
   * Xóa blob từ Azure Storage (optional - nếu cần)
   */
  async deleteBlob(blobName) {
    try {
      const blobServiceClient = this.getBlobServiceClient();
      const containerClient = blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      await blockBlobClient.deleteIfExists();
      console.log('Đã xóa blob:', blobName);
      return true;
    } catch (error) {
      console.error('Error deleting blob:', error);
      throw error;
    }
  }
}

export default new AzureStorageService();
