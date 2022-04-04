import http from './http';
import ImgToBase64 from 'react-native-image-base64';

export default class ImageServices {
  static async uploadImage(fileData) {
    if (!fileData) {
      return null;
    }

    try {
      const base64String = await ImgToBase64.getBase64String(fileData.uri);
      if (!fileData.fileName) {
        let randomStr = Math.random().toString(36).substring(5) + '.jpg';
        fileData.fileName = randomStr;
      }
      const res = await http.post('/common/upload_image', {
        title: {rendered: fileData.fileName},
        media_attachment: base64String,
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }
}
