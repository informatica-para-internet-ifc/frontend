import { uploadFile } from './client.js'

function uploadImage(file) {
  return uploadFile('/api/media/images/', file)
}

function uploadDocument(file) {
  return uploadFile('/api/media/documents/', file)
}

function uploadVideo(file) {
  return uploadFile('/api/media/videos/', file)
}

export { uploadImage, uploadDocument, uploadVideo }
