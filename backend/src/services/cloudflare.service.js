import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";

const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUD_STORAGE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.CLOUD_STORAGE_ACCESS_KEY,
        secretAccessKey: process.env.CLOUD_STORAGE_SECRET_KEY,
    }
});

export const uploadOnCloudflare = async (localFilePath, originalName) => {
    try {
        if (!localFilePath) return null;
        
        const fileContent = fs.readFileSync(localFilePath);
        const fileName = `${Date.now()}_${originalName.replace(/\s+/g, '_')}`;
        
        const command = new PutObjectCommand({
            Bucket: process.env.CLOUD_STORAGE_BUCKET,
            Key: fileName,
            Body: fileContent,
            // You can use a mime-type lookup here, omitting for simplicity
        });
        
        await s3Client.send(command);
        
        // Return the public URL
        const publicUrl = `${process.env.CLOUD_STORAGE_PUBLIC_URL}/${fileName}`;
        return { url: publicUrl, public_id: fileName };
    } catch (error) {
        console.error("Error uploading to Cloudflare R2:", error);
        return null;
    } finally {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
    }
};
