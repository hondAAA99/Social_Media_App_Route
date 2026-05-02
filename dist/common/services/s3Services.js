import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AWS_ACCESS_KEY, APPLICATION_NAME, AWS_REGION, AWS_S3_BUCKET_NAME, AWS_SECRET_ACCESS_KEY } from "../../config/config.services.js";
import multerStorageEnum from "../enum/multerStorageType.js";
import fs from 'node:fs';
import { ErrorInteralServerError } from "../utils/globalresponse.js";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
class s3services {
    _client;
    constructor() {
        this._client = new S3Client({
            region: AWS_REGION,
            credentials: {
                accessKeyId: AWS_ACCESS_KEY,
                secretAccessKey: AWS_SECRET_ACCESS_KEY
            }
        });
    }
    async uploadFile({ file, storageType = multerStorageEnum.memory, ACL, path }) {
        const command = new PutObjectCommand({
            Bucket: AWS_S3_BUCKET_NAME,
            Key: `${APPLICATION_NAME}/${path}/${Date.now()}/${Math.random()}/${file.originalname}`,
            ACL,
            Body: (storageType == multerStorageEnum.memory) ? file.buffer : fs.createReadStream(file.path),
        });
        await this._client.send(command);
        if (!command.input.Key) {
            ErrorInteralServerError('failed to upload file');
        }
        return command.input.Key;
    }
    async uploadLargeFile({ file, storageType = multerStorageEnum.memory, ACL, path, }) {
        const command = new Upload({
            client: this._client,
            params: {
                Bucket: AWS_S3_BUCKET_NAME,
                Key: `${APPLICATION_NAME}/${path}/${Date.now()}/${Math.random()}/${file.originalname}`,
                ACL,
                Body: (storageType == multerStorageEnum.memory) ? file.buffer : fs.createReadStream(file.path),
                ContentType: file.mimetype
            }
        });
        command.on('httpUploadProgress', function (progress) {
            console.log('file progress is ', progress);
        });
        return command.done;
    }
    async uploadFiles({ files, storageType = multerStorageEnum.memory, ACL, path, fileSize = 5 * 1024 * 1024 }) {
        if (fileSize < 5 * 1024 * 1024) {
            const urls = await Promise.all(files.map((file) => { this.uploadFile({ file, storageType, path }); }));
            return urls;
        }
        else {
            const urls = await Promise.all(files.map((file) => { this.uploadLargeFile({ file, storageType, path }); }));
            return urls;
        }
    }
    async createSignedUrl({ fileName, path, ContentType, expiresIn = 3 * 60 }) {
        const Key = `social_media_app/${path}/${Math.random() * 10000}/${fileName}`;
        const command = new PutObjectCommand({
            Bucket: AWS_S3_BUCKET_NAME,
            ContentType,
            Key
        });
        const url = await getSignedUrl(this._client, command, { expiresIn });
        return { Key, url };
    }
    async getFiles(folderName) {
        const command = new ListObjectsV2Command({ Bucket: AWS_S3_BUCKET_NAME, Prefix: `social_media_app/${folderName}` });
        return await this._client.send(command);
    }
    async getFile(Key) {
        const command = new GetObjectCommand({ Bucket: AWS_S3_BUCKET_NAME, Key });
        return await this._client.send(command);
    }
    async getSignedUrl({ Key, expiresIn = 3 * 60, download }) {
        const command = new PutObjectCommand({
            Bucket: AWS_S3_BUCKET_NAME,
            Key,
            ContentDisposition: (download) ? `attachment ; filename-="${Key.split('/').pop()}"` : undefined
        });
        return await getSignedUrl(this._client, command, { expiresIn });
    }
    async deleteFile({ Key }) {
        const command = new DeleteObjectCommand({
            Bucket: AWS_S3_BUCKET_NAME,
            Key
        });
        return await this._client.send(command);
    }
    async deleteFiles({ Keys }) {
        const keyMapped = Keys.map((k) => {
            return { Key: k };
        });
        const command = new DeleteObjectsCommand({
            Bucket: AWS_S3_BUCKET_NAME,
            Delete: {
                Objects: keyMapped,
                Quiet: false
            }
        });
        return await this._client.send(command);
    }
    async deleteFolder({ folderKey }) {
        const files = await this.getFiles(folderKey);
        const folder = files.Contents?.map((file) => {
            return file.Key;
        });
        this.deleteFiles({ Keys: folder });
    }
}
export default new s3services();
