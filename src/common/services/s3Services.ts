import { ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AWS_ACCESS_KEY, APPLICATION_NAME, AWS_REGION, AWS_S3_BUCKET_NAME, AWS_SECRET_ACCESS_KEY } from "../../config/config.services.js";
import multerStorageEnum from "../enum/multerStorageType.js";
import fs from 'node:fs'
import { ErrorInteralServerError } from "../utils/globalresponse.js";
import { Upload } from "@aws-sdk/lib-storage";

class s3services {
    private _client ;
    constructor(){
        this._client = new S3Client({
            region : AWS_REGION,
            credentials : {
                accessKeyId: AWS_ACCESS_KEY,
                secretAccessKey : AWS_SECRET_ACCESS_KEY
            }
        })
    }

    async uploadFile ({
        file,
        storageType = multerStorageEnum.memory,
        ACL,
        path
    }:{
        file : Express.Multer.File,
        storageType? :  string ,
        ACL? : ObjectCannedACL,
        path? : string | undefined
        }){
        const command = new PutObjectCommand({
            Bucket : AWS_S3_BUCKET_NAME,
            Key : `${APPLICATION_NAME}/${path}/${Date.now()}/${Math.random()}/${file.originalname}`,
            ACL ,
            Body : (storageType == multerStorageEnum.memory ) ?  file.buffer : fs.createReadStream(file.path),
        })
    
        await this._client.send(command);
        if (!command.input.Key){
            ErrorInteralServerError('failed to upload file')
        }
        return command.input.Key
    }

    async uploadLargeFile ({
        file,
        storageType = multerStorageEnum.memory,
        ACL,
        path,
    }:{
        file : Express.Multer.File,
        storageType? :  string ,
        ACL? : ObjectCannedACL,
        path? : string | undefined,
        }){
    
        const command = new Upload({
            client : this._client,
            params : {
            Bucket : AWS_S3_BUCKET_NAME,
            Key : `${APPLICATION_NAME}/${path}/${Date.now()}/${Math.random()}/${file.originalname}`,
            ACL ,
            Body : (storageType == multerStorageEnum.memory ) ?  file.buffer : fs.createReadStream(file.path),
            ContentType : file.mimetype
        }})
    
        command.on('httpUploadProgress',function(progress){
            console.log('file progress is ',progress)
        })
    
        return command.done
    }

    async uploadFiles({
        files,
        storageType = multerStorageEnum.memory,
        ACL,
        path,
        fileSize = 5*1024*1024
    }:{
        files : Express.Multer.File[],
        storageType? :  string ,
        ACL? : ObjectCannedACL,
        path? : string | undefined,
        fileSize? : number
        }): Promise<string[] | any>{
            if (fileSize < 5*1024*1024){
                const urls =  await Promise.all(
                    files.map((file : Express.Multer.File)=>{this.uploadFile({file,storageType,path})}
                ))
                return urls ;
            }
            else {
                    const urls =  await Promise.all(
                    files.map((file : Express.Multer.File)=>{this.uploadLargeFile({file,storageType,path})}
                ))
                return urls ;
            }
    }
}

export default s3services