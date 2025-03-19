import AWS from 'aws-sdk';
import {FileWithBuffer} from '../../databases/model/product.model';
import {InternalServerErrorException} from '../exceptions/http.exceptions';

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

export const uploadImageToS3 = async (file: FileWithBuffer): Promise<string> => {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    if (!bucketName) {
        throw new Error('AWS_S3_BUCKET_NAME is not defined');
    }

    const uploadParams = {
        Bucket: bucketName,
        Key: `${process.env.AWS_S3_FOLDER}/${Date.now()}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    try {
        const data = await s3.upload(uploadParams).promise();
        return data.Location; // Get the URL of the uploaded image
    } catch (error) {
        console.log(error);
        throw new InternalServerErrorException('Failed to upload image');
    }
}
