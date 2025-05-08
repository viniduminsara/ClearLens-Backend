import {PutObjectCommand, S3Client} from '@aws-sdk/client-s3';
import {FileWithBuffer} from '../../databases/model/product.model';
import {InternalServerErrorException} from '../exceptions/http.exceptions';

// Initialize S3 client with environment credentials
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    },
});

export const uploadImageToS3 = async (file: FileWithBuffer): Promise<string> => {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const folder = process.env.AWS_S3_FOLDER;

    if (!bucketName || !folder) {
        throw new Error('AWS_S3_BUCKET_NAME or AWS_S3_FOLDER is not defined');
    }

    const key = `${folder}/${Date.now()}_${file.originalname}`;

    const uploadParams = {
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    try {
        await s3Client.send(new PutObjectCommand(uploadParams));

        return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
        throw new InternalServerErrorException('Failed to upload image');
    }
};
