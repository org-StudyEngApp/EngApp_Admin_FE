class CloudinaryService {
  constructor() {
    // Thông tin Cloudinary
    this.cloudName = 'dfqfh3hzu';
    this.uploadPreset = 'korastudy_preset';
    this.apiKey = '217639887482219';
  }

  async uploadFile(file, type = 'auto') {
    console.log(`Đang upload file ${type} lên Cloudinary:`, file.name, `(${file.size} bytes)`);
    
    // Kiểm tra định dạng file trước khi upload
    this.validateFile(file, type === 'audio' ? 'audio' : 'image');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('cloud_name', this.cloudName);
    
    try {
      // Đối với audio, cloudinary sử dụng resource_type là video
      const resourceType = type === 'audio' ? 'video' : type;
      const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/upload`;
      console.log('URL upload:', uploadUrl);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Cloudinary error:', errorData);
        throw new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('Upload thành công:', data);
      
      // Trả về các thông tin quan trọng về file đã upload
      return {
        url: data.secure_url,  // URL để lưu vào database
        publicId: data.public_id,  // ID công khai của tài nguyên trên Cloudinary
        format: data.format,
        resourceType: data.resource_type,
        bytes: data.bytes,
        width: data.width,
        height: data.height,
        duration: data.duration  // đối với file audio/video
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }

  async uploadImage(file) {
    console.log('Đang upload ảnh:', file.name);
    return this.uploadFile(file, 'image');
  }

  async uploadAudio(file) {
    console.log('Đang upload audio:', file.name);
    return this.uploadFile(file, 'audio');
  }

  generatePreviewUrl(file) {
    return URL.createObjectURL(file);
  }

  revokePreviewUrl(url) {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

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
}

export default new CloudinaryService();
